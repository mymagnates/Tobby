const RAW_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').trim()
const isUnsafeLocalApiBase =
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(RAW_API_BASE_URL) &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
const API_BASE_URL = (isUnsafeLocalApiBase ? '/api' : RAW_API_BASE_URL).replace(/\/$/, '')

const STORAGE_KEYS = {
  SP_CARDS: 'web_sp_cards_snapshot_v1',
  SP_LEADS: 'web_sp_leads_v1',
  SP_BIDS: 'web_sp_bids_v1',
  SP_PROJECTS: 'web_sp_projects_v1',
  SP_INVOICES: 'web_sp_invoices_v1',
  SP_DOCUMENTS: 'web_sp_documents_v1',
}

const toUrl = (path) => `${API_BASE_URL}${path}`

const normalizeApiRole = (role) => {
  const next = `${role || ''}`.trim().toLowerCase()
  if (next === 'pm' || next === 'po' || next === 'pm_po') return 'pm_po'
  if (next === 'sp') return 'sp'
  if (next === 'tt') return 'tt'
  if (next === 'admin') return 'admin'
  return null
}

const normalizeLeadRow = (row) => {
  const id = row?.id || row?.lead_id
  const leadId = row?.lead_id || id
  return { ...row, id, lead_id: leadId, lead_doc_id: id }
}

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const normalizeApiError = (payload, fallbackMessage) => {
  const error = new Error(payload?.message || fallbackMessage || 'Request failed')
  error.error_code = payload?.error_code || 'UNKNOWN_ERROR'
  error.retryable = Boolean(payload?.retryable)
  error.request_id = payload?.request_id || null
  error.gate_status = payload?.gate_status || null
  error.plan_required = payload?.plan_required || null
  error.upgrade_hint = payload?.upgrade_hint || null
  return error
}

const request = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const response = await fetch(toUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    throw normalizeApiError(payload, `Request failed: ${response.status}`)
  }
  return payload
}

const loadJsonArray = (key) => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const saveJsonArray = (key, rows) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(rows))
}

const seedSpBids = (spId) => [
  {
    bid_id: `bid-${spId}-1`,
    sp_id: spId,
    lead_id: `lead-${spId}-0`,
    lead_title: 'Water heater replacement',
    task_id: 'task-0891',
    title: 'Water heater replacement',
    amount: 780,
    note: 'Includes 50-gal tank, installation, and old unit disposal. 1-year labor warranty.',
    status: 'selected',
    created_at: '2025-11-18T10:00:00.000Z',
  },
  {
    bid_id: `bid-${spId}-2`,
    sp_id: spId,
    lead_id: `lead-${spId}-1`,
    lead_title: 'Drain cleaning',
    task_id: 'task-0954',
    title: 'Drain cleaning',
    amount: 210,
    note: 'Snake and hydro-jet main kitchen line. Includes camera inspection.',
    status: 'rejected',
    created_at: '2025-12-09T12:30:00.000Z',
  },
  {
    bid_id: `bid-${spId}-3`,
    sp_id: spId,
    lead_id: `lead-${spId}-2`,
    lead_title: 'HVAC seasonal maintenance',
    task_id: 'task-1002',
    title: 'HVAC seasonal maintenance',
    amount: 300,
    note: 'Full tune-up for both units. Filter + coil cleaning included.',
    status: 'submitted',
    created_at: '2026-02-16T12:00:00.000Z',
  },
  {
    bid_id: `bid-${spId}-4`,
    sp_id: spId,
    lead_id: `lead-${spId}-4`,
    lead_title: 'Broken garage door spring',
    task_id: 'task-1004',
    title: 'Garage door spring repair',
    amount: 195,
    note: 'Replace both torsion springs for balanced operation. Same-day service.',
    status: 'submitted',
    created_at: '2026-02-17T16:00:00.000Z',
  },
]

const seedSpProjects = (spId) => [
  {
    project_id: `project-${spId}-1`,
    task_id: 'task-0901',
    task_title: 'Roof repair — Building B',
    title: 'Roof repair — Building B',
    address: '460 Oak Grove Ave, Building B',
    location: 'Palo Alto, CA',
    status: 'in_progress',
    accepted_at: '2026-02-14T10:00:00.000Z',
    sp_id: spId,
    phases: {
      plan: { done: true, completed_at: '2026-02-14T14:00:00.000Z' },
      execution: { done: false, completed_at: null },
      payment: { done: false, completed_at: null },
      close: { done: false, completed_at: null },
    },
    comments: [
      { text: 'Materials ordered — shingles and underlayment arriving Feb 16.', created_at: '2026-02-14T15:30:00.000Z', author: spId },
      { text: 'Weather delay — rain expected Wed/Thu. Rescheduling to Friday.', created_at: '2026-02-17T09:00:00.000Z', author: spId },
    ],
  },
  {
    project_id: `project-${spId}-2`,
    task_id: 'task-0750',
    task_title: 'Electrical panel upgrade',
    title: 'Electrical panel upgrade',
    address: '1521 Shoreline Blvd, Unit 4',
    location: 'Mountain View, CA',
    status: 'completed',
    accepted_at: '2025-12-21T10:00:00.000Z',
    sp_id: spId,
    phases: {
      plan: { done: true, completed_at: '2025-12-21T12:00:00.000Z' },
      execution: { done: true, completed_at: '2025-12-28T17:00:00.000Z' },
      payment: { done: true, completed_at: '2026-01-05T10:00:00.000Z' },
      close: { done: true, completed_at: '2026-01-06T09:00:00.000Z' },
    },
    comments: [
      { text: 'Panel upgraded from 100A to 200A. All circuits re-labeled.', created_at: '2025-12-28T17:30:00.000Z', author: spId },
      { text: 'Inspection passed. Final invoice sent to PM.', created_at: '2026-01-06T09:00:00.000Z', author: spId },
    ],
  },
  {
    project_id: `project-${spId}-3`,
    task_id: 'task-0631',
    task_title: 'Garage door sensor replacement',
    title: 'Garage door sensor replacement',
    address: '320 El Camino Real, Garage #7',
    location: 'Santa Clara, CA',
    status: 'completed',
    accepted_at: '2025-10-12T09:00:00.000Z',
    sp_id: spId,
    phases: {
      plan: { done: true, completed_at: '2025-10-12T10:00:00.000Z' },
      execution: { done: true, completed_at: '2025-10-13T14:00:00.000Z' },
      payment: { done: true, completed_at: '2025-10-20T11:00:00.000Z' },
      close: { done: true, completed_at: '2025-10-20T11:30:00.000Z' },
    },
    comments: [
      { text: 'Both sensors replaced and aligned. Door tested 10+ cycles.', created_at: '2025-10-13T14:30:00.000Z', author: spId },
    ],
  },
  {
    project_id: `project-${spId}-4`,
    task_id: 'task-0891',
    task_title: 'Water heater replacement',
    title: 'Water heater replacement',
    address: '742 Evergreen Terrace, Unit 1A',
    location: 'San Jose, CA',
    status: 'active',
    accepted_at: '2026-02-10T08:00:00.000Z',
    sp_id: spId,
    phases: {
      plan: { done: true, completed_at: '2026-02-10T10:00:00.000Z' },
      execution: { done: true, completed_at: '2026-02-12T16:00:00.000Z' },
      payment: { done: false, completed_at: null },
      close: { done: false, completed_at: null },
    },
    comments: [
      { text: 'Old 40-gal tank removed. New 50-gal Rheem installed and tested.', created_at: '2026-02-12T16:30:00.000Z', author: spId },
      { text: 'Awaiting payment confirmation from property manager.', created_at: '2026-02-15T09:00:00.000Z', author: spId },
    ],
  },
]

const seedSpInvoices = (spId) => [
  {
    invoice_id: `inv-${spId}-1`,
    sp_id: spId,
    project_id: `project-${spId}-2`,
    title: 'Electrical panel upgrade — final',
    amount: 2450,
    status: 'paid',
    issued_date: '2026-01-06T09:00:00.000Z',
    due_date: '2026-01-20T00:00:00.000Z',
    paid_date: '2026-01-18T14:00:00.000Z',
    notes: 'Panel upgrade 100A→200A, labor + materials. Permit fee included.',
    created_at: '2026-01-06T09:00:00.000Z',
  },
  {
    invoice_id: `inv-${spId}-2`,
    sp_id: spId,
    project_id: `project-${spId}-3`,
    title: 'Garage door sensor replacement',
    amount: 185,
    status: 'paid',
    issued_date: '2025-10-20T11:00:00.000Z',
    due_date: '2025-11-03T00:00:00.000Z',
    paid_date: '2025-10-28T10:00:00.000Z',
    notes: 'Two photo-eye sensors replaced. Parts + 1 hr labor.',
    created_at: '2025-10-20T11:00:00.000Z',
  },
  {
    invoice_id: `inv-${spId}-3`,
    sp_id: spId,
    project_id: `project-${spId}-4`,
    title: 'Water heater replacement — pending',
    amount: 780,
    status: 'submitted',
    issued_date: '2026-02-15T09:00:00.000Z',
    due_date: '2026-03-01T00:00:00.000Z',
    notes: '50-gal Rheem tank, installation, haul-away of old unit. 1-yr warranty.',
    created_at: '2026-02-15T09:00:00.000Z',
  },
  {
    invoice_id: `inv-${spId}-4`,
    sp_id: spId,
    project_id: `project-${spId}-1`,
    title: 'Roof repair — Building B (deposit)',
    amount: 1200,
    status: 'draft',
    issued_date: null,
    due_date: null,
    notes: '50% deposit for materials. Remainder due on completion.',
    created_at: '2026-02-17T11:00:00.000Z',
  },
]

const ensureSeeded = (key, seedRows) => {
  const rows = loadJsonArray(key)
  if (rows.length) return rows
  saveJsonArray(key, seedRows)
  return seedRows
}

const nowIso = () => new Date().toISOString()

export const billingApi = {
  async getProfileSummary() {
    try {
      return await request('/billing/profile-summary')
    } catch {
      return {
        request_id: 'mock-billing-profile-summary',
        plan_name: 'Free',
        subscription_status: 'active',
        next_renewal_date: null,
        gate_status: 'ok',
      }
    }
  },

  async getUsage() {
    try {
      return await request('/billing/usage')
    } catch {
      return {
        request_id: 'mock-billing-usage',
        properties_used: 0,
        properties_limit: 3,
        voice_used: 0,
        voice_limit: 0,
        storage_used_mb: 0,
        storage_limit_mb: 512,
      }
    }
  },

  async getCredits() {
    try {
      return await request('/billing/credits')
    } catch {
      return {
        request_id: 'mock-billing-credits',
        balance: 0,
      }
    }
  },

  async getHistory() {
    try {
      return await request('/billing/history')
    } catch {
      return {
        request_id: 'mock-billing-history',
        items: [],
      }
    }
  },

  async upgrade(payload) {
    return request('/billing/upgrade', { method: 'POST', body: payload })
  },

  async purchaseAddon(payload) {
    return request('/billing/addon/purchase', { method: 'POST', body: payload })
  },
}

export const reportApi = {
  async getAnnualTaxFinance(params) {
    const search = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).length) search.set(k, String(v))
    })
    return request(`/reports/annual-tax-finance?${search.toString()}`)
  },
}

export const marketplaceApi = {
  async publishLeadFromTask(payload) {
    const role = normalizeApiRole(payload?.actor_role)
    const actorId = payload?.actor_id ? String(payload.actor_id) : null

    try {
      const res = await request('/leads/from-task', {
        method: 'POST',
        headers: {
          ...(actorId ? { 'X-User-Id': actorId } : {}),
          ...(role ? { 'X-User-Role': role } : {}),
        },
        body: payload,
      })
      return normalizeLeadRow(res?.lead || {})
    } catch {
      // Fallback for local dev when backend is unavailable.
    }

    const rows = loadJsonArray(STORAGE_KEYS.SP_LEADS)
    const mxId = payload?.mx_id || payload?.task_id || `mx-${Date.now()}`
    const taskDocId = payload?.task_doc_id || payload?.system_task_id || null
    const next = normalizeLeadRow({
      lead_id: payload?.lead_id || `lead-${Date.now()}`,
      mx_id: mxId,
      task_id: mxId,
      task_doc_id: taskDocId,
      title: payload?.title || 'New Task Lead',
      description: payload?.description || '',
      scope: payload?.scope || payload?.description || '',
      location: payload?.location || '',
      address: payload?.address || '',
      budget_range: payload?.budget_range || '',
      due_date: payload?.due_date || null,
      status: 'open',
      created_at: payload?.created_at || nowIso(),
      source: 'task-bridge',
      property_id: payload?.property_id || null,
    })
    const exists = rows.some(
      (row) =>
        String(row.mx_id || '') === String(next.mx_id || '') ||
        String(row.task_id || '') === String(next.task_id || '') ||
        (next.task_doc_id && String(row.task_doc_id || '') === String(next.task_doc_id))
    )
    if (!exists) {
      rows.unshift(next)
      saveJsonArray(STORAGE_KEYS.SP_LEADS, rows)
    }
    return next
  },

  async syncLeadWithTaskStatus(payload) {
    const role = normalizeApiRole(payload?.actor_role)
    const actorId = payload?.actor_id ? String(payload.actor_id) : null
    const body = {
      mx_id: payload?.mx_id || payload?.task_id,
      task_doc_id: payload?.task_doc_id || payload?.system_task_id || null,
      task_status: payload?.task_status,
      task_updated_at: payload?.task_updated_at || nowIso(),
    }
    return request('/leads/sync-task-status', {
      method: 'POST',
      headers: {
        ...(actorId ? { 'X-User-Id': actorId } : {}),
        ...(role ? { 'X-User-Role': role } : {}),
      },
      body,
    })
  },

  async getRecommendedSps(taskId) {
    try {
      const res = await request(`/tasks/${taskId}/recommended-sps`)
      return res.items || []
    } catch {
      return []
    }
  },

  async getTaskBids(taskRef, actor = {}) {
    const actorId = actor?.actor_id ? String(actor.actor_id) : null
    const role = normalizeApiRole(actor?.actor_role)
    const headers = {
      ...(actorId ? { 'X-User-Id': actorId } : {}),
      ...(role ? { 'X-User-Role': role } : {}),
    }

    try {
      const leadsRes = await request('/leads', { headers })
      const leads = (leadsRes.items || []).map((row) => normalizeLeadRow(row))
      const ref = String(taskRef || '')
      const matchedLead = leads.find((row) => {
        const candidates = [row.mx_id, row.task_id, row.task_doc_id]
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value))
        return candidates.includes(ref)
      })
      const leadDocId = matchedLead?.id || matchedLead?.lead_id
      if (!leadDocId) return []

      const bidsRes = await request(`/leads/${encodeURIComponent(leadDocId)}/bids`, {
        headers,
      })
      return bidsRes.items || []
    } catch {
      return []
    }
  },

  contactSp(taskId, payload) {
    return request(`/tasks/${taskId}/sp-actions/contact`, { method: 'POST', body: payload })
  },

  requestQuote(taskId, payload) {
    return request(`/tasks/${taskId}/sp-actions/quote`, { method: 'POST', body: payload })
  },

  assignSp(taskId, payload) {
    return request(`/tasks/${taskId}/assign-sp`, { method: 'POST', body: payload })
  },
}

export const spCardsApi = {
  async list(ownerId) {
    try {
      const res = await request('/sp-cards')
      return res.items || []
    } catch {
      return loadJsonArray(STORAGE_KEYS.SP_CARDS).filter((row) => row.owner_id === ownerId)
    }
  },

  async saveCard(payload) {
    try {
      return await request('/sp-cards', { method: 'POST', body: payload })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_CARDS)
      const now = new Date().toISOString()
      const existingIndex = rows.findIndex(
        (row) => row.owner_id === payload.owner_id && row.sp_id === payload.sp_id
      )
      const next = {
        id: existingIndex >= 0 ? rows[existingIndex].id : `${payload.owner_id}-${payload.sp_id}`,
        ...payload,
        updated_at: now,
        created_at: existingIndex >= 0 ? rows[existingIndex].created_at : now,
      }
      if (existingIndex >= 0) rows[existingIndex] = next
      else rows.push(next)
      saveJsonArray(STORAGE_KEYS.SP_CARDS, rows)
      return next
    }
  },

  async updateNote(cardId, note) {
    try {
      return await request(`/sp-cards/${cardId}/note`, { method: 'PATCH', body: { note } })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_CARDS)
      const index = rows.findIndex((row) => row.id === cardId)
      if (index >= 0) {
        rows[index].owner_note = note
        rows[index].updated_at = new Date().toISOString()
        saveJsonArray(STORAGE_KEYS.SP_CARDS, rows)
        return rows[index]
      }
      throw new Error('SP card not found')
    }
  },
}

export const spPortalApi = {
  async listLeads(spId) {
    try {
      const res = await request('/leads', {
        headers: {
          ...(spId ? { 'X-User-Id': String(spId) } : {}),
          'X-User-Role': 'sp',
        },
      })
      return (res.items || []).map((row) => normalizeLeadRow(row))
    } catch {
      // No dummy seed fallback: only return locally stored leads (e.g., task bridge records)
      return loadJsonArray(STORAGE_KEYS.SP_LEADS)
        .filter((row) => row.status === 'open')
        .map((row) => normalizeLeadRow(row))
    }
  },

  async listBids(spId) {
    try {
      const res = await request('/sp/bids', {
        headers: {
          ...(spId ? { 'X-User-Id': String(spId) } : {}),
          'X-User-Role': 'sp',
        },
      })
      return res.items || []
    } catch {
      return ensureSeeded(STORAGE_KEYS.SP_BIDS, seedSpBids(spId)).filter((row) => row.sp_id === spId)
    }
  },

  async createBid(payload) {
    const normalizedAmount = Number(payload?.amount)
    const normalizedPayload = {
      ...payload,
      sp_id: payload?.sp_id ? String(payload.sp_id) : '',
      lead_id: payload?.lead_id || payload?.id || '',
      amount: Number.isFinite(normalizedAmount) ? normalizedAmount : 0,
      note: payload?.note ?? payload?.notes ?? '',
    }
    if (!normalizedPayload.lead_id) {
      throw new Error('Lead ID is required to submit bid.')
    }

    try {
      const spId = normalizedPayload.sp_id
      return await request('/sp/bids', {
        method: 'POST',
        headers: {
          ...(spId ? { 'X-User-Id': spId } : {}),
          'X-User-Role': 'sp',
        },
        body: normalizedPayload,
      })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_BIDS)
      const next = {
        bid_id: `bid-${Date.now()}`,
        status: 'submitted',
        created_at: nowIso(),
        ...normalizedPayload,
      }
      rows.unshift(next)
      saveJsonArray(STORAGE_KEYS.SP_BIDS, rows)
      return next
    }
  },

  async listProjects(spId) {
    try {
      const res = await request('/sp/projects')
      return res.items || []
    } catch {
      return ensureSeeded(STORAGE_KEYS.SP_PROJECTS, seedSpProjects(spId)).filter((row) => row.sp_id === spId)
    }
  },

  async updateProject(projectId, updates) {
    try {
      return await request(`/sp/projects/${projectId}`, { method: 'PATCH', body: updates })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_PROJECTS)
      const index = rows.findIndex((row) => row.project_id === projectId)
      if (index < 0) throw new Error('Project not found')
      rows[index] = { ...rows[index], ...updates, updated_at: nowIso() }
      saveJsonArray(STORAGE_KEYS.SP_PROJECTS, rows)
      return rows[index]
    }
  },

  async listInvoices(spId) {
    try {
      const res = await request('/sp/invoices')
      return res.items || []
    } catch {
      return ensureSeeded(STORAGE_KEYS.SP_INVOICES, seedSpInvoices(spId)).filter((row) => row.sp_id === spId)
    }
  },

  async createInvoice(payload) {
    try {
      return await request('/invoices', { method: 'POST', body: payload })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_INVOICES)
      const next = {
        invoice_id: `invoice-${Date.now()}`,
        status: 'draft',
        created_at: nowIso(),
        updated_at: nowIso(),
        ...payload,
      }
      rows.unshift(next)
      saveJsonArray(STORAGE_KEYS.SP_INVOICES, rows)
      return next
    }
  },

  async submitInvoice(invoiceId) {
    try {
      return await request(`/invoices/${invoiceId}/submit`, { method: 'POST' })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_INVOICES)
      const index = rows.findIndex((row) => row.invoice_id === invoiceId)
      if (index < 0) throw new Error('Invoice not found')
      rows[index] = {
        ...rows[index],
        status: 'submitted',
        updated_at: nowIso(),
      }
      saveJsonArray(STORAGE_KEYS.SP_INVOICES, rows)
      return rows[index]
    }
  },

  async listDocuments(spId) {
    try {
      const res = await request('/sp/documents')
      return res.items || []
    } catch {
      return loadJsonArray(STORAGE_KEYS.SP_DOCUMENTS)
        .filter((row) => row.sp_id === spId)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }
  },

  async createDocument(payload) {
    try {
      return await request('/sp/documents', { method: 'POST', body: payload })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_DOCUMENTS)
      const next = {
        document_id: `spdoc-${Date.now()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
        ...payload,
      }
      rows.unshift(next)
      saveJsonArray(STORAGE_KEYS.SP_DOCUMENTS, rows)
      return next
    }
  },

}
