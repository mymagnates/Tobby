import { auth, authStateReady } from 'src/boot/firebase'
import { mobileApiBase } from './mobileApi'

export const TASK_COMMENT_ACTIONS = ['update', 'comment', 'cancel', 'resolution']

export function safeTaskAttachmentUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export function taskCommentsPath(propertyId, taskId) {
  if (![propertyId, taskId].every((id) => typeof id === 'string' && id.trim()))
    throw new Error('A property and task are required.')
  return `/properties/${encodeURIComponent(propertyId)}/mxrecords/${encodeURIComponent(taskId)}/comments`
}

export function createTaskCommentKey() {
  return crypto.randomUUID()
}

async function request(path, { method = 'GET', body, idempotencyKey, signal } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, 20000)
  let rejectOnAbort
  const cancelled = new Promise((_, reject) => {
    rejectOnAbort = () =>
      reject(
        signal?.aborted
          ? new DOMException('Request cancelled.', 'AbortError')
          : new Error(
              'Request timed out. Retry to check the same submission without duplicating it.',
            ),
      )
    controller.signal.addEventListener('abort', rejectOnAbort, { once: true })
  })
  if (signal?.aborted) abort()
  const run = async () => {
    await authStateReady
    controller.signal.throwIfAborted()
    const user = auth.currentUser
    if (!user) throw Object.assign(new Error('Please sign in again.'), { status: 401 })
    const token = await user.getIdToken()
    controller.signal.throwIfAborted()
    if (!token || auth.currentUser !== user)
      throw Object.assign(new Error('Your session changed. Please reload.'), { status: 401 })
    const response = await fetch(`${mobileApiBase()}${path}`, {
      method,
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-User-Id': user.uid,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok)
      throw Object.assign(new Error(payload?.message || 'Unable to load or update this task.'), {
        status: response.status,
        code: payload?.error_code,
      })
    if (
      !response.headers.get('content-type')?.includes('application/json') ||
      !payload?.task ||
      typeof payload.task !== 'object' ||
      Array.isArray(payload.task) ||
      !Array.isArray(payload.task.logs) ||
      typeof payload.can_comment !== 'boolean' ||
      (method === 'POST' &&
        (!payload.comment || typeof payload.comment !== 'object' || Array.isArray(payload.comment)))
    )
      throw new Error('The server response could not be confirmed. Please retry.')
    controller.signal.throwIfAborted()
    if (auth.currentUser !== user)
      throw Object.assign(new Error('Your session changed. Please reload.'), { status: 401 })
    return payload
  }
  try {
    return await Promise.race([run(), cancelled])
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
    controller.signal.removeEventListener('abort', rejectOnAbort)
  }
}

export function getTaskComments(propertyId, taskId, options = {}) {
  return request(taskCommentsPath(propertyId, taskId), { signal: options.signal })
}

export async function postTaskComment(propertyId, taskId, draft, { idempotencyKey, signal } = {}) {
  const comment = typeof draft?.comment === 'string' ? draft.comment.trim() : ''
  const action = draft?.action_type || 'update'
  const images = draft?.image_urls ?? []
  if (!comment) throw new Error('Write an update before sending.')
  if (!TASK_COMMENT_ACTIONS.includes(action)) throw new Error('Choose a supported action.')
  if (
    !Array.isArray(images) ||
    images.length > 5 ||
    images.some((url) => !safeTaskAttachmentUrl(url))
  )
    throw new Error('One or more photo links are unsafe. Remove them before sending.')
  if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim())
    throw new Error('A submission key is required. Please try again.')
  return request(taskCommentsPath(propertyId, taskId), {
    method: 'POST',
    signal,
    idempotencyKey,
    body: { comment, action_type: action, image_urls: [...images] },
  })
}

export const appendTaskComment = postTaskComment
