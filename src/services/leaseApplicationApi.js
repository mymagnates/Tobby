import { auth } from '../boot/firebase'

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

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const marker = 'base64,'
      const index = result.indexOf(marker)
      resolve(index >= 0 ? result.slice(index + marker.length) : result)
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

const serializeDocumentFile = async (file) => ({
  original_filename: file?.name || 'document',
  content_type: file?.type || 'application/octet-stream',
  size: Number(file?.size || 0),
  data_base64: await fileToBase64(file),
})

const buildHeaders = async ({ includeAuth = true, extraHeaders = {} } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  if (!includeAuth) return headers

  const currentUser = auth.currentUser
  const token = currentUser?.getIdToken ? await currentUser.getIdToken() : null
  if (token) headers.Authorization = `Bearer ${token}`
  if (currentUser?.uid) headers['X-User-Id'] = currentUser.uid
  return headers
}

const request = async (path, { method = 'GET', body, includeAuth = true, extraHeaders = {} } = {}) => {
  const response = await fetch(toUrl(path), {
    method,
    headers: await buildHeaders({ includeAuth, extraHeaders }),
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) throw normalizeError(payload, `Request failed: ${response.status}`)
  return payload
}

export const submitLeaseApplicationRequest = async ({ application, documents = [] }) => {
  const serializedDocuments = []
  for (const doc of documents) {
    if (!doc?.file) continue
    serializedDocuments.push({
      name: String(doc.name || '').trim(),
      description: String(doc.description || '').trim(),
      file: await serializeDocumentFile(doc.file),
    })
  }

  return request('/lease-applications', {
    method: 'POST',
    includeAuth: false,
    body: {
      application,
      documents: serializedDocuments,
    },
  })
}

export const fetchLeaseApplicationRequest = async ({ applicationId, accessToken = '', includeAuth = true } = {}) =>
  request(`/lease-applications/${encodeURIComponent(applicationId)}${accessToken ? `?access=${encodeURIComponent(accessToken)}` : ''}`, {
    method: 'GET',
    includeAuth,
  })

export const uploadLeaseApplicationDocumentRequest = async ({
  applicationId,
  accessToken = '',
  name,
  description = '',
  file,
}) =>
  request(`/lease-applications/${encodeURIComponent(applicationId)}/documents`, {
    method: 'POST',
    includeAuth: !accessToken,
    body: {
      access_token: accessToken || undefined,
      name: String(name || '').trim(),
      description: String(description || '').trim(),
      file: await serializeDocumentFile(file),
    },
  })

export const getLeaseApplicationDocumentAccessRequest = async ({
  applicationId,
  documentId,
  accessToken = '',
}) =>
  request(`/lease-applications/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(documentId)}/access`, {
    method: 'POST',
    includeAuth: !accessToken,
    body: {
      access_token: accessToken || undefined,
    },
  })

export const listLeaseApplicationsForLeaseRequest = async ({ leaseId }) =>
  request(`/leases/${encodeURIComponent(leaseId)}/applications`, {
    method: 'GET',
    includeAuth: true,
  })
