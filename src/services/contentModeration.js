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

const buildHeaders = async ({ requireAuth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null

  if (requireAuth && !token) {
    throw new Error('Please sign in before using this action.')
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
    headers['X-User-Id'] = currentUser.uid
  }

  return headers
}

const request = async (path, { method = 'GET', body, requireAuth = false } = {}) => {
  const response = await fetch(toUrl(path), {
    method,
    headers: await buildHeaders({ requireAuth }),
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) throw normalizeError(payload, `Request failed: ${response.status}`)
  return payload
}

export const submitContentReport = (payload) =>
  request('/content-reports', {
    method: 'POST',
    body: {
      content_type: payload?.content_type || 'other',
      content_id: payload?.content_id || '',
      content_path: payload?.content_path || '',
      reported_user_id: payload?.reported_user_id || '',
      reported_user_display_name: payload?.reported_user_display_name || '',
      reason: payload?.reason || 'other',
      note: payload?.note || '',
      source: payload?.source || 'web',
    },
  })

export const blockUser = (payload) =>
  request('/blocked-users', {
    method: 'POST',
    requireAuth: true,
    body: {
      blocked_user_id: payload?.blocked_user_id || '',
      blocked_user_display_name: payload?.blocked_user_display_name || '',
      reason: payload?.reason || '',
      source: payload?.source || 'web',
    },
  })

export const listBlockedUsers = () => request('/blocked-users', { requireAuth: true })
