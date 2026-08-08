import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

const API_BASE = String(import.meta.env.VITE_ADMIN_API_BASE_URL || '/api').replace(/\/$/, '')

const qs = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return
    search.set(k, String(v))
  })
  const value = search.toString()
  return value ? `?${value}` : ''
}

const getAccessToken = async () => {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  return user.getIdToken(true)
}

const request = async (path, options = {}) => {
  const token = options.token || (await getAccessToken())
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`)
  }
  return payload
}

export const loginWithFirebase = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return validateAdminSession(credential.user)
}

export const logoutFirebase = async () => {
  await signOut(auth)
}

export const validateAdminSession = async (candidateUser = null) => {
  const user = candidateUser || auth.currentUser
  if (!user) return false
  const token = await user.getIdToken(true)
  const me = await request('/auth/me', { token })
  return String(me?.user?.role || '').toLowerCase() === 'admin'
}

export const adminApi = {
  getOverview: (params) => request(`/admin/overview${qs(params)}`),
  getAdSlotStats: (params) => request(`/admin/ad-slot/stats${qs(params)}`),
  listUsers: (params) => request(`/admin/users${qs(params)}`),
  getUser: (id) => request(`/admin/users/${encodeURIComponent(String(id))}`),
  freezeUser: (id, body) => request(`/admin/users/${encodeURIComponent(String(id))}/freeze`, { method: 'POST', body }),
  unfreezeUser: (id, body) => request(`/admin/users/${encodeURIComponent(String(id))}/unfreeze`, { method: 'POST', body }),
  getBillingSummary: (params) => request(`/admin/billing/summary${qs(params)}`),
  listCreditAccounts: (params) => request(`/admin/credits/accounts${qs(params)}`),
  listCreditOrders: (params) => request(`/admin/credits/orders${qs(params)}`),
  listCreditLedger: (params) => request(`/admin/credits/ledger${qs(params)}`),
  adjustCredits: (body) => request('/admin/credits/adjust', { method: 'POST', body }),
  listEvents: (params) => request(`/admin/logs/events${qs(params)}`),
  listErrors: (params) => request(`/admin/logs/errors${qs(params)}`),
  listSupportTickets: (params) => request(`/admin/support/tickets${qs(params)}`),
  getSupportTicket: (id) => request(`/admin/support/tickets/${encodeURIComponent(String(id))}`),
  updateSupportTicket: (id, body) =>
    request(`/admin/support/tickets/${encodeURIComponent(String(id))}/update`, { method: 'POST', body }),
  addSupportComment: (id, body) =>
    request(`/admin/support/tickets/${encodeURIComponent(String(id))}/comment`, { method: 'POST', body }),
  listDataCollections: () => request('/admin/data/collections'),
  listDataRecords: (params) => request(`/admin/data/records${qs(params)}`),
  listDataChanges: (params) => request(`/admin/data/changes${qs(params)}`),
  updateDataRecord: (body) => request('/admin/data/update', { method: 'POST', body }),
  deleteDataRecord: (body) => request('/admin/data/delete', { method: 'POST', body }),
  rollbackDataChange: (body) => request('/admin/data/rollback', { method: 'POST', body }),
}
