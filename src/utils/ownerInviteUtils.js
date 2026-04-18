export const OWNER_INVITE_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
})

export const OWNER_WORKSPACE_PATH = '/po-dashboard'

const randomChunk = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

export const generateOwnerInviteToken = () => `${randomChunk()}${randomChunk()}`

export const createOwnerInviteExpiry = (days = 7) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}

export const buildOwnerInviteUrl = (token) => {
  if (typeof window === 'undefined') return `/public/owner-invite/${token}`
  return `${window.location.origin}/public/owner-invite/${token}`
}
