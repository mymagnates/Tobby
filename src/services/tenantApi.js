import { auth } from '../boot/firebase'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api')
  .trim()
  .replace(/\/$/, '')

const request = async (path, { method = 'GET', body } = {}) => {
  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(currentUser?.uid ? { 'X-User-Id': currentUser.uid } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed: ${response.status}`)
    error.error_code = payload?.error_code || 'UNKNOWN_ERROR'
    throw error
  }
  return payload
}

const propertyPath = (propertyId) => `/properties/${encodeURIComponent(propertyId)}/tenants`

export const listPropertyTenantsRequest = ({ propertyId }) => request(propertyPath(propertyId))

export const createPropertyTenantRequest = ({ propertyId, leaseId = null, tenant }) =>
  request(propertyPath(propertyId), {
    method: 'POST',
    body: { lease_id: leaseId, tenant },
  })

export const updatePropertyTenantRequest = ({ propertyId, tenantId, tenant }) =>
  request(`${propertyPath(propertyId)}/${encodeURIComponent(tenantId)}`, {
    method: 'PATCH',
    body: { tenant },
  })

export const deletePropertyTenantRequest = ({ propertyId, tenantId }) =>
  request(`${propertyPath(propertyId)}/${encodeURIComponent(tenantId)}`, { method: 'DELETE' })
