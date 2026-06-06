const API_ORIGIN = 'https://tobbythebutler.web.app'
const CONTENT_REPORTS_ENDPOINT = `${API_ORIGIN}/api/content-reports`
const BLOCKED_USERS_ENDPOINT = `${API_ORIGIN}/api/blocked-users`
export const contactSupportUrl = `${API_ORIGIN}/contact-support`

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const getAuthHeaders = async (user) => {
  if (!user?.uid) throw new Error('No authenticated user.')
  if (typeof user.getIdToken !== 'function') throw new Error('Firebase ID token is not available.')

  const token = await user.getIdToken()
  if (!token) throw new Error('Firebase ID token is not available.')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-User-Id': user.uid,
  }
}

const request = async (url, { user, method = 'GET', body } = {}) => {
  const response = await fetch(url, {
    method,
    headers: await getAuthHeaders(user),
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Request failed: ${response.status}`)
  }
  return payload
}

export const contentModerationApi = {
  reportContent(user, payload = {}) {
    return request(CONTENT_REPORTS_ENDPOINT, {
      user,
      method: 'POST',
      body: {
        content_type: payload.content_type || 'other',
        content_id: String(payload.content_id || '').trim(),
        content_path: String(payload.content_path || '').trim(),
        reported_user_id: String(payload.reported_user_id || '').trim(),
        reason: payload.reason || 'other',
        note: String(payload.note || '').trim(),
        source: 'capacitor',
      },
    })
  },

  blockUser(user, payload = {}) {
    return request(BLOCKED_USERS_ENDPOINT, {
      user,
      method: 'POST',
      body: {
        blocked_user_id: String(payload.blocked_user_id || '').trim(),
        blocked_user_display_name: String(payload.blocked_user_display_name || '').trim(),
        reason: String(payload.reason || '').trim(),
        source: 'capacitor',
      },
    })
  },

  async listBlockedUsers(user) {
    const payload = await request(BLOCKED_USERS_ENDPOINT, { user })
    return Array.isArray(payload?.items) ? payload.items : []
  },
}
