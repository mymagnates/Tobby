const API_BASE_URL = ((import.meta?.env?.VITE_API_BASE_URL || '') + '').replace(/\/$/, '')

const STORAGE_KEYS = {
  SP_CARDS: 'web_sp_cards_snapshot_v1',
  SP_LEADS: 'web_sp_leads_v1',
  SP_BIDS: 'web_sp_bids_v1',
  SP_PROJECTS: 'web_sp_projects_v1',
  SP_INVOICES: 'web_sp_invoices_v1',
  SP_DOCUMENTS: 'web_sp_documents_v1',
}

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

const request = async (path, { method = 'GET', body } = {}) => {
  if (!API_BASE_URL) {
    throw normalizeApiError({ error_code: 'API_BASE_URL_MISSING', message: 'API base URL missing' })
  }

  const response = await fetch(toUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
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

const seedSpLeads = (spId) => [
  {
    lead_id: `lead-${spId}-1`,
    task_id: 'task-1001',
    title: 'Emergency plumbing leak',
    location: 'San Jose, CA',
    budget_range: '$250-$600',
    due_date: '2026-02-20',
    status: 'open',
    created_at: '2026-02-16T09:00:00.000Z',
  },
  {
    lead_id: `lead-${spId}-2`,
    task_id: 'task-1002',
    title: 'HVAC seasonal maintenance',
    location: 'Sunnyvale, CA',
    budget_range: '$180-$350',
    due_date: '2026-02-22',
    status: 'open',
    created_at: '2026-02-16T11:30:00.000Z',
  },
]

const seedSpBids = (spId) => [
  {
    bid_id: `bid-${spId}-1`,
    sp_id: spId,
    lead_id: `lead-${spId}-0`,
    task_id: 'task-0891',
    title: 'Water heater replacement',
    amount: 780,
    status: 'selected',
    created_at: '2025-11-18T10:00:00.000Z',
  },
  {
    bid_id: `bid-${spId}-2`,
    sp_id: spId,
    lead_id: `lead-${spId}-1`,
    task_id: 'task-0954',
    title: 'Drain cleaning',
    amount: 210,
    status: 'rejected',
    created_at: '2025-12-09T12:30:00.000Z',
  },
  {
    bid_id: `bid-${spId}-3`,
    sp_id: spId,
    lead_id: `lead-${spId}-2`,
    task_id: 'task-1002',
    title: 'HVAC seasonal maintenance',
    amount: 300,
    status: 'submitted',
    created_at: '2026-02-16T12:00:00.000Z',
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
  async getRecommendedSps(taskId) {
    try {
      const res = await request(`/tasks/${taskId}/recommended-sps`)
      return res.items || []
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
      const res = await request('/sp/leads')
      return res.items || []
    } catch {
      return ensureSeeded(STORAGE_KEYS.SP_LEADS, seedSpLeads(spId)).filter((row) => row.status === 'open')
    }
  },

  async listBids(spId) {
    try {
      const res = await request('/sp/bids')
      return res.items || []
    } catch {
      return ensureSeeded(STORAGE_KEYS.SP_BIDS, seedSpBids(spId)).filter((row) => row.sp_id === spId)
    }
  },

  async createBid(payload) {
    try {
      return await request('/sp/bids', { method: 'POST', body: payload })
    } catch {
      const rows = loadJsonArray(STORAGE_KEYS.SP_BIDS)
      const next = {
        bid_id: `bid-${Date.now()}`,
        status: 'submitted',
        created_at: nowIso(),
        ...payload,
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
      const seeded = ensureSeeded(STORAGE_KEYS.SP_PROJECTS, [
        {
          project_id: `project-${spId}-1`,
          task_id: 'task-0901',
          title: 'Roof repair - Building B',
          location: 'Palo Alto, CA',
          status: 'active',
          accepted_at: '2026-02-14T10:00:00.000Z',
          sp_id: spId,
        },
        {
          project_id: `project-${spId}-2`,
          task_id: 'task-0750',
          title: 'Electrical panel inspection',
          location: 'Mountain View, CA',
          status: 'completed',
          accepted_at: '2025-12-21T10:00:00.000Z',
          sp_id: spId,
        },
        {
          project_id: `project-${spId}-3`,
          task_id: 'task-0631',
          title: 'Garage door sensor replacement',
          location: 'Santa Clara, CA',
          status: 'completed',
          accepted_at: '2025-10-12T09:00:00.000Z',
          sp_id: spId,
        },
      ])
      return seeded.filter((row) => row.sp_id === spId)
    }
  },

  async listInvoices(spId) {
    try {
      const res = await request('/sp/invoices')
      return res.items || []
    } catch {
      return loadJsonArray(STORAGE_KEYS.SP_INVOICES).filter((row) => row.sp_id === spId)
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
