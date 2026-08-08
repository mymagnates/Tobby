import { auth } from '../boot/firebase'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

/**
 * @typedef {Object} OwnerInvite
 * @property {string} id
 * @property {string} property_id
 * @property {string} owner_email
 * @property {'pending'|'accepted'|'revoked'|'expired'} status
 * @property {string=} accepted_by_user_id
 */

/**
 * @typedef {Object} OwnerInviteLookup
 * @property {OwnerInvite} invite
 * @property {{ id: string, nickname?: string, address?: string, ownership_mode?: string }} property
 */

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

const requestOwnerInviteApi = async (path, { method = 'GET', body, authenticated = true } = {}) => {
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
    const error = new Error(payload?.message || 'Owner invite request failed.')
    error.payload = payload
    error.status = response.status
    throw error
  }
  return payload
}

export const sendOwnerInviteEmailRequest = async ({
  propertyId,
  ownerEmail,
  propertyName = '',
  propertyAddress = '',
  inviterName = '',
}) =>
  requestOwnerInviteApi('/owner-invites/email', {
    method: 'POST',
    body: {
      property_id: propertyId,
      owner_email: ownerEmail,
      property_name: propertyName,
      property_address: propertyAddress,
      inviter_name: inviterName,
    },
  })

/** @returns {Promise<OwnerInviteLookup>} */
export const getOwnerInviteByToken = async (token) => {
  const payload = await requestOwnerInviteApi(`/owner-invites/${encodeURIComponent(token)}`, {
    authenticated: false,
  })
  return {
    invite: payload?.invite || payload,
    property: payload?.property || payload?.property_summary || {},
  }
}

export const acceptOwnerInviteRequest = async (token) =>
  requestOwnerInviteApi(`/owner-invites/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
  })

/** @returns {Promise<OwnerInvite[]>} */
export const listPropertyOwnerInvitesRequest = async (propertyId) => {
  const payload = await requestOwnerInviteApi(
    `/properties/${encodeURIComponent(propertyId)}/owner-invites`,
  )
  return Array.isArray(payload?.invites) ? payload.invites : Array.isArray(payload?.items) ? payload.items : []
}

export const revokeOwnerInviteRequest = async ({ propertyId, inviteId }) =>
  requestOwnerInviteApi(
    `/properties/${encodeURIComponent(propertyId)}/owner-invites/${encodeURIComponent(inviteId)}/revoke`,
    { method: 'POST' },
  )

export const removePropertyOwnerRequest = async ({
  propertyId,
  ownerUserId,
  nextPrimaryOwnerUserId = null,
}) =>
  requestOwnerInviteApi(
    `/properties/${encodeURIComponent(propertyId)}/owners/${encodeURIComponent(ownerUserId)}`,
    {
      method: 'DELETE',
      body: nextPrimaryOwnerUserId
        ? { next_primary_owner_user_id: nextPrimaryOwnerUserId }
        : undefined,
    },
  )
