// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'

let runtime, records, metadataReads
const request = async (path, token = 'pm1') => {
  let status, body
  await runtime.handler({ url: path, method: 'POST', body: {}, headers: { authorization: `Bearer ${token}` } }, {
    writeHead: (value) => { status = value }, end: (value) => { body = JSON.parse(value) },
  })
  return { status, body }
}
beforeEach(() => {
  records = new Map([
    ['users/pm1', { account_type: 'pm' }],
    ['users/pm1/roles/pm_p1', { role: 'pm', property_id: 'p1', status: 'active' }],
    ['storage_upload_reservations/upload1', {
      user_id: 'pm1', property_id: 'p1', storage_path: 'properties/p1/transaction/photo',
      status: 'reserved', size_bytes: 1024, content_type: 'image/jpeg', download_token: 'token',
      expires_at: new Date(Date.now() + 600000).toISOString(),
    }],
  ])
  const snapshot = (path) => ({ id: path.split('/').at(-1), exists: records.has(path), data: () => records.get(path) })
  const collection = (path, filters = []) => ({
    doc: (id) => ({
      path: `${path}/${id}`, get: async () => snapshot(`${path}/${id}`),
      collection: (child) => collection(`${path}/${id}/${child}`),
      set: async (data, options) => records.set(`${path}/${id}`, options?.merge ? { ...records.get(`${path}/${id}`), ...data } : data),
    }),
    where: (key, op, value) => collection(path, [...filters, [key, value]]),
    limit() { return this },
    get: async () => ({ docs: [...records.keys()].filter((key) => key.split('/').slice(0, -1).join('/') === path && filters.every(([field, value]) => records.get(key)[field] === value)).map(snapshot) }),
  })
  let pending = Promise.resolve()
  const db = {
    collection,
    runTransaction(fn) {
      const result = pending.then(async () => {
        const writes = []
        const output = await fn({ get: (ref) => ref.get(), set: (ref, data, options) => writes.push(() => ref.set(data, options)) })
        for (const write of writes) await write()
        return output
      })
      pending = result.catch(() => {})
      return result
    },
  }
  metadataReads = 0
  runtime = createApiServer({ config: {
    firestoreDb: db,
    firebaseAuth: { verifyIdToken: async (token) => ({ uid: token, role: 'pm' }) },
    storageBucket: { name: 'test-bucket', file: () => ({ getMetadata: async () => { metadataReads++; return [{ size: '1024' }] } }) },
  } })
})
afterEach(() => runtime.dispose())

describe('Upload commit replay', () => {
  it('returns the same committed URL without reading storage again or charging twice', async () => {
    const first = await request('/storage/upload-reservations/upload1/commit')
    expect(first.status).toBe(200)
    records.get('storage_upload_reservations/upload1').expires_at = '2000-01-01T00:00:00Z'
    const retry = await request('/storage/upload-reservations/upload1/commit')
    expect(retry.status).toBe(200)
    expect(retry.body.url).toBe(first.body.url)
    expect(metadataReads).toBe(1)
    const actor = runtime.store.users.get('pm1')
    expect(actor.billing.history.filter((row) => row.type === 'storage_usage')).toHaveLength(1)
  })
  it('deduplicates concurrent commit attempts', async () => {
    const result = await Promise.all([request('/storage/upload-reservations/upload1/commit'), request('/storage/upload-reservations/upload1/commit')])
    expect(result.map((row) => row.status)).toEqual([200, 200])
    expect(runtime.store.users.get('pm1').billing.history.filter((row) => row.type === 'storage_usage')).toHaveLength(1)
  })
  it('denies another user and revoked property access, including replay', async () => {
    expect((await request('/storage/upload-reservations/upload1/commit', 'outsider')).status).toBe(403)
    expect((await request('/storage/upload-reservations/upload1/commit')).status).toBe(200)
    records.delete('users/pm1/roles/pm_p1')
    expect((await request('/storage/upload-reservations/upload1/commit')).status).toBe(403)
  })
  it('rejects expired uncommitted reservations', async () => {
    records.get('storage_upload_reservations/upload1').expires_at = '2000-01-01T00:00:00Z'
    expect((await request('/storage/upload-reservations/upload1/commit')).status).toBe(403)
  })
})
