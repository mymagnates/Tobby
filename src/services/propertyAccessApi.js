import { auth } from '../boot/firebase'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const parseJsonSafely = async (response) => {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

const getAuthHeaders = async () => {
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  return {
    'X-User-Id': currentUser?.uid || '',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const requestPropertyAccessApi = async (
  path,
  { method = 'GET', body, authenticated = true } = {},
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? await getAuthHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    const error = new Error(payload?.message || 'Property access request failed.')
    error.payload = payload
    error.status = response.status
    throw error
  }
  return payload
}

export const PROPERTY_ACCESS_ROLES = Object.freeze([
  {
    value: 'owner',
    label: 'Owner',
    description: 'Owner-facing property access and ownership relationship.',
  },
  {
    value: 'manager',
    label: 'Property manager',
    description: 'Full operational access for maintenance, tasks, and records.',
  },
  {
    value: 'viewer',
    label: 'View only',
    description: 'Read property records without edit, invite, or delete access.',
  },
])

export const sendPropertyAccessInviteRequest = ({
  propertyId,
  invitedEmail,
  accessRole,
  inviterName = '',
}) =>
  requestPropertyAccessApi('/property-access-invites/email', {
    method: 'POST',
    body: {
      property_id: propertyId,
      invited_email: invitedEmail,
      access_role: accessRole,
      inviter_name: inviterName,
    },
  })

export const getPropertyAccessInviteByToken = (token) =>
  requestPropertyAccessApi(`/property-access-invites/${encodeURIComponent(token)}`, {
    authenticated: false,
  })

export const acceptPropertyAccessInviteRequest = (token) =>
  requestPropertyAccessApi(`/property-access-invites/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
  })

export const getPropertyAccessRequest = (propertyId) =>
  requestPropertyAccessApi(`/properties/${encodeURIComponent(propertyId)}/access`)

export const revokePropertyAccessInviteRequest = ({ propertyId, inviteId }) =>
  requestPropertyAccessApi(
    `/properties/${encodeURIComponent(propertyId)}/property-access-invites/${encodeURIComponent(inviteId)}/revoke`,
    { method: 'POST' },
  )

export const removePropertyAccessRequest = ({
  propertyId,
  userId,
  accessRole,
  nextPrimaryOwnerUserId = null,
}) =>
  requestPropertyAccessApi(
    `/properties/${encodeURIComponent(propertyId)}/access/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      body: {
        access_role: accessRole,
        ...(nextPrimaryOwnerUserId ? { next_primary_owner_user_id: nextPrimaryOwnerUserId } : {}),
      },
    },
  )
