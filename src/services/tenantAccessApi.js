import { auth } from '../boot/firebase'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/$/, '')

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result || '')
      const marker = 'base64,'
      const index = value.indexOf(marker)
      resolve(index >= 0 ? value.slice(index + marker.length) : value)
    }
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'))
    reader.readAsDataURL(file)
  })

const request = async (path, { method = 'GET', body, authenticated = true } = {}) => {
  const currentUser = auth.currentUser
  const token = authenticated && currentUser?.getIdToken ? await currentUser.getIdToken() : null
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
    const error = new Error(payload?.message || 'Tenant access request failed.')
    error.code = payload?.error_code || 'TENANT_ACCESS_REQUEST_FAILED'
    throw error
  }
  return payload
}

export const getTenantInviteRequest = ({ leaseId }) =>
  request(`/tenant-invites/${encodeURIComponent(leaseId)}`, { authenticated: false })

export const linkTenantToLeaseRequest = ({ leaseId, fullName = '', phone = '' }) =>
  request('/tenant/lease-link', { method: 'POST', body: { lease_id: leaseId, full_name: fullName, phone } })

export const getTenantDashboardRequest = () => request('/tenant/dashboard')

export const getTenantDocumentAccessRequest = ({ documentId }) =>
  request(`/tenant/documents/${encodeURIComponent(documentId)}/access`)

export const updateTenantContactRequest = ({ email, phone }) =>
  request('/tenant/contact', { method: 'PATCH', body: { email, phone } })

export const createTenantTaskRequest = ({ title, description = '', category = 'Maintenance', priority = 'medium', dueDate = '' }) =>
  request('/tenant/tasks', {
    method: 'POST',
    body: { title, description, category, priority, due_date: dueDate },
  })

export const uploadTenantDocumentsRequest = async ({ files, category = 'General', note = '' }) =>
  request('/tenant/documents', {
    method: 'POST',
    body: {
      category,
      note,
      files: await Promise.all(
        Array.from(files || []).map(async (file) => ({
          original_filename: file.name,
          content_type: file.type || 'application/octet-stream',
          size: Number(file.size || 0),
          data_base64: await fileToBase64(file),
        })),
      ),
    },
  })
