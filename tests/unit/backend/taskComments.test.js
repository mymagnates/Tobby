// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { createTaskCommentsService } from '../../../backend/taskComments.js'

function database() {
  const rows = new Map()
  const snap = (path) => ({ exists: rows.has(path), id: path.split('/').at(-1), data: () => structuredClone(rows.get(path)) })
  const collection = (path, filters = []) => ({
    doc: (id) => ({ path: `${path}/${id}`, collection: (name) => collection(`${path}/${id}/${name}`) }),
    where: (field, op, value) => collection(path, [...filters, [field, value]]),
    limit() { return this },
    get: () => ({ docs: [...rows.keys()].filter((key) => key.split('/').slice(0, -1).join('/') === path && filters.every(([field, value]) => rows.get(key)[field] === value)).map(snap) }),
  })
  let queue = Promise.resolve()
  return {
    rows, collection,
    runTransaction(fn) {
      const run = queue.then(async () => {
        const writes = []
        const result = await fn({
          get: async (ref) => ref.get ? ref.get() : snap(ref.path),
          set: (ref, value) => writes.push(() => rows.set(ref.path, structuredClone(value))),
          update: (ref, value) => writes.push(() => rows.set(ref.path, { ...rows.get(ref.path), ...structuredClone(value) })),
        })
        writes.forEach((write) => write())
        return result
      })
      queue = run.catch(() => {})
      return run
    },
  }
}
let db, service
const context = (changes = {}) => ({
  actor: { id: 'pm1', name: 'Untrusted client name' }, verified: true,
  params: { propertyId: 'p1', taskId: 't1' },
  req: { headers: { 'idempotency-key': 'submission-123' } },
  body: { comment: 'Tap repaired', action_type: 'update' }, ...changes,
})
beforeEach(() => {
  db = database()
  db.rows.set('properties/p1', { manager_user_ids: ['pm1'], owner_user_ids: ['owner'], viewer_user_ids: ['viewer'] })
  db.rows.set('properties/p1/mxrecords/t1', { task_title: 'Leak', status: 'open', logs: [{ comment: 'Legacy note', log_timestamp: '2026-09-01' }], internal_cost: 400 })
  db.rows.set('users/pm1', { display_name: 'Verified profile' })
  service = createTaskCommentsService({ getDb: () => db })
})
describe('Canonical property task comments', () => {
  it('reads legacy history without leaking unrelated task fields', async () => {
    const result = await service.get(context())
    expect(result.can_comment).toBe(true)
    expect(result.task.logs).toHaveLength(1)
    expect(result.task.internal_cost).toBeUndefined()
    expect(result.task.property_id).toBe('p1')
  })
  it.each(['get', 'append'])('rejects forged or cross-property identity for %s', async (method) => {
    await expect(service[method](context({ verified: false }))).rejects.toMatchObject({ status: 401 })
    await expect(service[method](context({ actor: { id: 'outsider', role: 'pm' } }))).rejects.toMatchObject({ status: 403 })
  })
  it('allows viewers to read but never comment', async () => {
    expect((await service.get(context({ actor: { id: 'viewer' } }))).can_comment).toBe(false)
    await expect(service.append(context({ actor: { id: 'viewer' } }))).rejects.toMatchObject({ status: 403 })
  })
  it('allows a property owner to append', async () => {
    expect((await service.append(context({ actor: { id: 'owner' } }))).comment.user_role).toBe('po')
  })
  it('sets server author/time, preserving old records and never publishing', async () => {
    const result = await service.append(context())
    expect(result.comment).toMatchObject({ user_id: 'pm1', user_name: 'Verified profile', user_role: 'pm', action_type: 'update' })
    expect(Number.isFinite(Date.parse(result.comment.log_timestamp))).toBe(true)
    expect(result.task.logs).toHaveLength(2)
    expect([...db.rows.keys()].some((key) => /marketplace|leads/.test(key))).toBe(false)
  })
  it('replays a durable submission without duplicating it across service instances', async () => {
    const first = await service.append(context())
    const other = createTaskCommentsService({ getDb: () => db })
    const retry = await other.append(context())
    expect(retry.comment).toEqual(first.comment)
    expect(retry.task.logs).toHaveLength(2)
  })
  it('rejects same-key changed payload and revoked membership before replay', async () => {
    await service.append(context())
    await expect(service.append(context({ body: { comment: 'Changed text' } }))).rejects.toMatchObject({ status: 409 })
    db.rows.set('properties/p1', { manager_user_ids: [] })
    await expect(service.append(context())).rejects.toMatchObject({ status: 403 })
  })
  it('preserves concurrent distinct appends', async () => {
    await Promise.all(['submission-111', 'submission-222'].map((key) => service.append(context({ req: { headers: { 'idempotency-key': key } } }))))
    expect(db.rows.get('properties/p1/mxrecords/t1').logs).toHaveLength(3)
  })
  it('resolution closes task; ordinary update and cancel preserve status', async () => {
    expect((await service.append(context({ body: { comment: 'Cancelled visit', action_type: 'cancel' } }))).task.status).toBe('open')
    expect((await service.append(context({ body: { comment: 'Fixed', action_type: 'resolution' }, req: { headers: { 'idempotency-key': 'resolution-222' } } }))).task.status).toBe('closed')
  })
  it.each([{ comment: '' }, { comment: 'x'.repeat(10001) }, { comment: 'Hi', action_type: 'unknown' }, { comment: 'Hi', image_urls: 'bad' }])('validates input %s', async (body) => {
    await expect(service.append(context({ body }))).rejects.toMatchObject({ status: 400 })
  })
  it('requires valid scope and idempotency key', async () => {
    await expect(service.append(context({ params: { propertyId: '../p1', taskId: 't1' } }))).rejects.toMatchObject({ status: 400 })
    await expect(service.append(context({ req: { headers: {} } }))).rejects.toMatchObject({ status: 400 })
  })
  it('fails when record is deleted without recreating it', async () => {
    db.rows.delete('properties/p1/mxrecords/t1')
    await expect(service.append(context())).rejects.toMatchObject({ status: 404 })
  })
  it('allows only committed image reservations belonging to this actor/property', async () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/test/o/images%2Fcomment%2Fp1%2Fa.jpg?alt=media&token=token1'
    const c = context({ body: { comment: 'Photo', image_urls: [url] } })
    await expect(service.append(c)).rejects.toMatchObject({ status: 403 })
    db.rows.set('storage_upload_reservations/r1', { storage_path: 'images/comment/p1/a.jpg', status: 'committed', user_id: 'pm1', property_id: 'p1', content_type: 'image/jpeg', download_token: 'token1' })
    expect((await service.append(c)).comment.image_urls).toEqual([url])
  })
  it('rejects arbitrary image URLs and history overflow', async () => {
    await expect(service.append(context({ body: { comment: 'Photo', image_urls: ['javascript:alert(1)'] } }))).rejects.toMatchObject({ status: 400 })
    db.rows.get('properties/p1/mxrecords/t1').logs = Array.from({ length: 500 }, () => ({ comment: 'x' }))
    await expect(service.append(context())).rejects.toMatchObject({ status: 422 })
  })
})
