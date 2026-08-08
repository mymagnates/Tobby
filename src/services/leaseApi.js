import { auth } from 'src/boot/firebase'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const getAuthHeaders = async () => {
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  if (!token) throw new Error('Please sign in again before changing a lease.')
  return { Authorization: `Bearer ${token}`, 'X-User-Id': currentUser?.uid || '' }
}

const requestLeaseApi = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload?.message || 'Lease request failed.')
    error.code = payload?.error_code || 'LEASE_REQUEST_FAILED'
    error.status = response.status
    throw error
  }
  return payload
}

export const listPropertyLeasesRequest = async ({ propertyId }) => {
  const payload = await requestLeaseApi(`/properties/${encodeURIComponent(propertyId)}/leases`)
  return Array.isArray(payload?.leases) ? payload.leases : []
}

export const createPropertyLeaseRequest = async ({ propertyId, lease }) => {
  const payload = await requestLeaseApi(`/properties/${encodeURIComponent(propertyId)}/leases`, {
    method: 'POST',
    body: { lease },
  })
  return payload.lease
}

export const updateLeaseRequest = async ({ leaseId, changes }) => {
  const payload = await requestLeaseApi(`/leases/${encodeURIComponent(leaseId)}`, {
    method: 'PATCH',
    body: { changes },
  })
  return payload.lease
}

export const updateLeaseStatusRequest = async ({ leaseId, status, archived = false }) => {
  const payload = await requestLeaseApi(`/leases/${encodeURIComponent(leaseId)}/status`, {
    method: 'PATCH',
    body: { status, archived },
  })
  return payload.lease
}

export const getLeaseInventoryRequest = async ({ leaseId }) => {
  const payload = await requestLeaseApi(`/leases/${encodeURIComponent(leaseId)}/inventories/primary`)
  return payload.inventory || null
}

export const saveLeaseInventoryRequest = async ({ leaseId, inventory }) => {
  const payload = await requestLeaseApi(`/leases/${encodeURIComponent(leaseId)}/inventories/primary`, {
    method: 'PUT',
    body: { inventory },
  })
  return payload.inventory
}
