import { auth } from '../boot/firebase'

const parseJsonSafely = async (response) => {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export const sendOwnerInviteEmailRequest = async ({
  propertyId,
  ownerEmail,
  propertyName = '',
  propertyAddress = '',
  inviterName = '',
  inviterRole = 'pm',
}) => {
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': currentUser?.uid || '',
    'X-User-Role': inviterRole,
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch('/api/owner-invites/email', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      property_id: propertyId,
      owner_email: ownerEmail,
      property_name: propertyName,
      property_address: propertyAddress,
      inviter_name: inviterName,
    }),
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    const error = new Error(payload?.message || 'Failed to send owner invite email.')
    error.payload = payload
    throw error
  }
  return payload
}
