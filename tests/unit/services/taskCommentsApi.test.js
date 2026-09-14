import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { user, auth } = vi.hoisted(() => {
  const user = { uid: 'member-1', getIdToken: vi.fn() }
  return { user, auth: { currentUser: user } }
})
vi.mock('src/boot/firebase', () => ({ auth, authStateReady: Promise.resolve() }))
vi.mock('src/services/mobileApi', () => ({ mobileApiBase: () => 'https://mobile.example/api' }))
import {
  appendTaskComment,
  getTaskComments,
  postTaskComment,
  safeTaskAttachmentUrl,
  taskCommentsPath,
} from '../../../src/services/taskCommentsApi'

const task = { id: 't1', status: 'open', logs: [{ comment: 'Legacy', user_name: 'Ada' }] }
const result = { task, can_comment: true, comment: { id: 'server-comment' } }
const response = (payload = result, status = 200, type = 'application/json') => ({
  ok: status >= 200 && status < 300, status,
  headers: { get: () => type }, json: async () => payload,
})
const draft = { comment: '  Inspection scheduled  ', action_type: 'update', image_urls: [] }
describe('canonical task comments API', () => {
  beforeEach(() => {
    auth.currentUser = user
    user.getIdToken.mockResolvedValue('test-token')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()))
  })
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

  it('exports the exact shared Web append signature', () => {
    expect(appendTaskComment).toBe(postTaskComment)
  })
  it('reads only the canonical property-scoped logs and server permission', async () => {
    const readonly = { task, can_comment: false }
    fetch.mockResolvedValue(response(readonly))
    expect(await getTaskComments('p1', 't1')).toEqual(readonly)
    expect(fetch.mock.calls[0][0]).toBe('https://mobile.example/api/properties/p1/mxrecords/t1/comments')
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'GET', cache: 'no-store', headers: { Authorization: 'Bearer test-token' } })
  })
  it('encodes IDs and refuses missing scope', () => {
    expect(taskCommentsPath('p/a', 't b')).toBe('/properties/p%2Fa/mxrecords/t%20b/comments')
    expect(() => taskCommentsPath('', 't1')).toThrow('property and task')
  })
  it('sends only allowed payload fields with the caller-owned idempotency key', async () => {
    const value = await appendTaskComment('p1', 't1', { ...draft, user_name: 'Fake', logs: [], status: 'closed' }, { idempotencyKey: 'retry-key' })
    expect(value).toEqual(result)
    const options = fetch.mock.calls[0][1]
    expect(options.headers['Idempotency-Key']).toBe('retry-key')
    expect(JSON.parse(options.body)).toEqual({ ...draft, comment: draft.comment.trim() })
    expect(draft.comment).toBe('  Inspection scheduled  ')
  })
  it.each(['update', 'comment', 'cancel', 'resolution'])('accepts verified existing action %s', async (action_type) => {
    await appendTaskComment('p1', 't1', { ...draft, action_type }, { idempotencyKey: 'retry-key' })
    expect(JSON.parse(fetch.mock.calls[0][1].body).action_type).toBe(action_type)
  })
  it.each([
    [{ ...draft, comment: ' ' }, 'Write an update'],
    [{ ...draft, action_type: 'repair' }, 'supported action'],
    [{ ...draft, image_urls: ['javascript:alert(1)'] }, 'unsafe'],
    [{ ...draft, image_urls: Array(6).fill('https://example.com/image.png') }, 'unsafe'],
  ])('rejects invalid drafts without a request', async (body, message) => {
    await expect(appendTaskComment('p1', 't1', body, { idempotencyKey: 'retry-key' })).rejects.toThrow(message)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('never invents an idempotency key or anonymous actor', async () => {
    await expect(appendTaskComment('p1', 't1', draft)).rejects.toThrow('submission key')
    auth.currentUser = null
    await expect(getTaskComments('p1', 't1')).rejects.toMatchObject({ status: 401 })
    expect(fetch).not.toHaveBeenCalled()
  })
  it.each([401, 403, 409, 500])('propagates HTTP %s without local task changes', async (status) => {
    const before = structuredClone(task)
    fetch.mockResolvedValue(response({ message: 'Rejected', error_code: 'TASK_ACCESS_DENIED' }, status))
    await expect(appendTaskComment('p1', 't1', draft, { idempotencyKey: 'retry-key' })).rejects.toMatchObject({ status, code: 'TASK_ACCESS_DENIED' })
    expect(task).toEqual(before)
  })
  it.each([
    [{ task, can_comment: 'true' }, 'application/json'],
    [{ task: { comments: [] }, can_comment: true }, 'application/json'],
    [result, 'text/html'],
  ])('fails closed for unconfirmed responses', async (payload, type) => {
    fetch.mockResolvedValue(response(payload, 200, type))
    await expect(getTaskComments('p1', 't1')).rejects.toThrow('could not be confirmed')
  })
  it('requires a confirmed comment in the POST response', async () => {
    fetch.mockResolvedValue(response({ task, can_comment: true }))
    await expect(appendTaskComment('p1', 't1', draft, { idempotencyKey: 'retry-key' })).rejects.toThrow('could not be confirmed')
  })
  it('does not send after a pre-aborted request or an auth switch', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(getTaskComments('p1', 't1', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    user.getIdToken.mockImplementation(async () => { auth.currentUser = null; return 'old-token' })
    await expect(getTaskComments('p1', 't1')).rejects.toMatchObject({ status: 401 })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('bounds token acquisition and preserves a retryable failure', async () => {
    vi.useFakeTimers()
    user.getIdToken.mockReturnValue(new Promise(() => {}))
    const promise = expect(getTaskComments('p1', 't1')).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(20001)
    await promise
  })
  it.each(['javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'http://example.com/a', '//example.com/a', 'https://user:pass@example.com/a', null])('does not render unsafe attachment %s', (url) => {
    expect(safeTaskAttachmentUrl(url)).toBeNull()
  })
  it('keeps valid HTTPS attachment URLs and query tokens intact', () => {
    expect(safeTaskAttachmentUrl('https://example.com/photo?token=abc')).toBe('https://example.com/photo?token=abc')
  })
})
