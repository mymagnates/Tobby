const ACCOUNT_DELETION_ENDPOINT =
  'https://tobbythebutler.web.app/api/account-deletion-requests'

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export const requestAccountDeletion = async ({
  user,
  email,
  accountType,
  source = 'capacitor_profile',
  reason = '',
} = {}) => {
  if (!user?.uid) throw new Error('No authenticated user.')
  if (typeof user.getIdToken !== 'function') throw new Error('Firebase ID token is not available.')

  const token = await user.getIdToken()
  if (!token) throw new Error('Firebase ID token is not available.')

  const response = await fetch(ACCOUNT_DELETION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-User-Id': user.uid,
    },
    body: JSON.stringify({
      email: email || user.email || '',
      account_type: accountType,
      source,
      reason: String(reason || '').trim(),
    }),
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Request failed: ${response.status}`)
  }

  return payload
}

export const privacyPolicyUrl = 'https://tobbythebutler.web.app/privacy'
