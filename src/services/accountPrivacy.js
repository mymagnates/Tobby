import { auth } from 'src/boot/firebase'

const RAW_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').trim()
const isUnsafeLocalApiBase =
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(RAW_API_BASE_URL) &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
const API_BASE_URL = (isUnsafeLocalApiBase ? '/api' : RAW_API_BASE_URL).replace(/\/$/, '')

const toUrl = (path) => `${API_BASE_URL}${path}`

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const normalizeError = (payload, fallbackMessage) => {
  const error = new Error(payload?.message || fallbackMessage || 'Request failed')
  error.error_code = payload?.error_code || 'UNKNOWN_ERROR'
  error.request_id = payload?.request_id || null
  error.payload = payload || {}
  return error
}

const buildAuthHeaders = async () => {
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  if (!token) {
    throw new Error('Please sign in again before submitting this request.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-User-Id': currentUser.uid,
  }
}

const request = async (path, { method = 'POST', body } = {}) => {
  const response = await fetch(toUrl(path), {
    method,
    headers: await buildAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) throw normalizeError(payload, `Request failed: ${response.status}`)
  return payload
}

export async function requestAccountDeletion({
  email = '',
  accountType = '',
  source = 'web',
  reason = '',
} = {}) {
  return request('/account-deletion-requests', {
    method: 'POST',
    body: {
      email: String(email || '').trim(),
      account_type: String(accountType || '').trim().toLowerCase(),
      source,
      reason: String(reason || '').trim(),
    },
  })
}
