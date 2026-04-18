import { collection, collectionGroup, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const RAW_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/api').trim()
const isUnsafeLocalApiBase =
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(RAW_API_BASE_URL) &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
const API_BASE_URL = (isUnsafeLocalApiBase ? '/api' : RAW_API_BASE_URL).replace(/\/$/, '')
const RECOMMENDED_SPS_API_ENABLED =
  String(import.meta.env.VITE_ENABLE_RECOMMENDED_SPS_API || 'false').trim().toLowerCase() ===
  'true'

const STORAGE_KEYS = {
  SP_CARDS: 'web_sp_cards_snapshot_v1',
  SP_LEADS: 'web_sp_leads_v1',
  SP_BIDS: 'web_sp_bids_v1',
  SP_PROJECTS: 'web_sp_projects_v1',
  SP_INVOICES: 'web_sp_invoices_v1',
  SP_DOCUMENTS: 'web_sp_documents_v1',
  SP_CREDIT_ACCOUNT: 'web_sp_credit_account_v1',
  SP_CREDIT_LEDGER: 'web_sp_credit_ledger_v1',
  SP_CREDIT_ORDERS: 'web_sp_credit_orders_v1',
}

const SP_INITIAL_FREE_CREDITS = 3
const SP_WEEKLY_FREE_CREDITS = 1
const SP_FREE_CREDIT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000

const toUrl = (path) => `${API_BASE_URL}${path}`

const normalizeApiRole = (role) => {
  const next = `${role || ''}`.trim().toLowerCase()
  if (next === 'pm' || next === 'po') return next
  if (next === 'pm_po' || next === 'pm/po' || next === 'manager' || next === 'property manager')
    return 'pm'
  if (next === 'sp') return 'sp'
  if (next === 'tt' || next === 'tenant') return 'tt'
  if (next === 'admin') return 'admin'
  return null
}

const normalizeLeadRow = (row) => {
  const id = row?.id || row?.lead_id
  const leadId = row?.lead_id || id
  return {
    ...row,
    id,
    lead_id: leadId,
    lead_doc_id: id,
    comments: Array.isArray(row?.comments) ? row.comments : [],
    comment_count: Number(row?.comment_count ?? row?.comments?.length ?? 0),
  }
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

const nowIso = () => new Date().toISOString()
const adSlotEtagCache = new Map()
const adSlotPayloadCache = new Map()

const toIsoDateString = (value, fallback = '') => {
  if (!value) return fallback
  if (typeof value?.toDate === 'function') {
    const date = value.toDate()
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value.toISOString()
  }
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  const raw = String(value || '').trim()
  return raw || fallback
}

const toBidTimestamp = (value) => {
  if (!value) return 0
  if (typeof value?.toDate === 'function') {
    const date = value.toDate()
    return Number.isNaN(date.getTime()) ? 0 : date.getTime()
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 0 : value.getTime()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

const normalizeBidRow = (row = {}, defaults = {}) => {
  const fallbackLeadDocId = String(defaults?.lead_doc_id || defaults?.lead_id || '').trim()
  const bidId = String(row?.bid_id || row?.id || defaults?.bid_id || `bid-${Date.now()}`)
  const leadDocId = String(row?.lead_doc_id || row?.lead_id || fallbackLeadDocId || '').trim()
  const leadId = String(row?.lead_id || leadDocId || '').trim()
  const createdAt = toIsoDateString(row?.created_at, toIsoDateString(defaults?.created_at, nowIso()))
  const updatedAt = toIsoDateString(row?.updated_at, createdAt)
  const amountRaw = Number(row?.amount ?? defaults?.amount)

  return {
    ...defaults,
    ...row,
    id: String(row?.id || defaults?.id || bidId),
    bid_id: bidId,
    lead_doc_id: leadDocId || leadId,
    lead_id: leadId || leadDocId,
    sp_id: String(row?.sp_id ?? defaults?.sp_id ?? ''),
    amount: Number.isFinite(amountRaw) ? amountRaw : 0,
    note: row?.note ?? row?.notes ?? defaults?.note ?? defaults?.notes ?? '',
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

const mergeBidRows = (...groups) => {
  const seen = new Set()
  return groups
    .flat()
    .filter((row) => row && typeof row === 'object')
    .map((row) => normalizeBidRow(row))
    .filter((row) => {
      const key = String(row?.id || row?.bid_id || '').trim()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => toBidTimestamp(b?.created_at) - toBidTimestamp(a?.created_at))
}

const mirrorBidToLeadSubcollection = async (row = {}) => {
  const bid = normalizeBidRow(row)
  const leadDocId = String(bid?.lead_doc_id || bid?.lead_id || '').trim()
  const bidId = String(bid?.bid_id || bid?.id || '').trim()
  if (!leadDocId || !bidId) return null

  try {
    const now = nowIso()
    const next = {
      ...bid,
      id: bidId,
      bid_id: bidId,
      lead_doc_id: leadDocId,
      lead_id: String(bid?.lead_id || leadDocId),
      created_at: bid?.created_at || now,
      updated_at: now,
    }
    await setDoc(doc(db, 'marketplace_leads', leadDocId, 'bids', bidId), next, { merge: true })
    return next
  } catch (error) {
    console.warn('Failed to mirror bid into marketplace_leads/{leadId}/bids:', error)
    return null
  }
}

const listSpBidsFromLeadSubcollections = async (spId) => {
  const normalizedSpId = String(spId || '').trim()
  if (!normalizedSpId) return []

  try {
    const bidsQuery = query(collectionGroup(db, 'bids'), where('sp_id', '==', normalizedSpId))
    const bidSnapshot = await getDocs(bidsQuery)
    const rows = bidSnapshot.docs
      .map((docSnap) => {
        const parentCollectionId = String(docSnap.ref?.parent?.parent?.parent?.id || '').trim()
        if (parentCollectionId !== 'marketplace_leads') return null
        const data = docSnap.data() || {}
        const leadDocId =
          String(docSnap.ref?.parent?.parent?.id || data?.lead_doc_id || data?.lead_id || '').trim()
        return normalizeBidRow(
          { ...data, id: docSnap.id, bid_id: data?.bid_id || docSnap.id },
          {
            lead_doc_id: leadDocId,
            lead_id: data?.lead_id || leadDocId,
            sp_id: normalizedSpId,
          }
        )
      })
      .filter((row) => row && (row?.lead_doc_id || row?.lead_id))

    if (rows.length) return mergeBidRows(rows)
  } catch (error) {
    console.warn('Failed reading bids via Firestore collectionGroup:', error)
  }

  try {
    const leadSnapshot = await getDocs(collection(db, 'marketplace_leads'))
    const bidGroups = await Promise.all(
      leadSnapshot.docs.map(async (leadDoc) => {
        const bidSnapshot = await getDocs(collection(db, 'marketplace_leads', leadDoc.id, 'bids'))
        return bidSnapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {}
          return normalizeBidRow(
            { ...data, id: docSnap.id, bid_id: data?.bid_id || docSnap.id },
            {
              lead_doc_id: leadDoc.id,
              lead_id: data?.lead_id || leadDoc.id,
              sp_id: normalizedSpId,
            }
          )
        })
      })
    )

    return mergeBidRows(
      bidGroups.flat().filter((row) => String(row?.sp_id || '') === normalizedSpId)
    )
  } catch (error) {
    console.warn('Failed reading bids from marketplace lead subcollections:', error)
    return []
  }
}

export const billingApi = {
  async getProfileSummary() {
    try {
      return await request('/billing/profile-summary')
    } catch {
      return {
        plan_name: 'Free',
        subscription_status: 'inactive',
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
        properties_used: 0,
        properties_limit: 0,
        ai_tokens_used: 0,
        ai_tokens_limit: 0,
        voice_used: 0,
        voice_limit: 0,
        storage_used_mb: 0,
        storage_limit_mb: 0,
      }
    }
  },

  async getCredits() {
    try {
      return await request('/billing/credits')
    } catch {
      return {
        balance: 0,
      }
    }
  },

  async getHistory() {
    try {
      return await request('/billing/history')
    } catch {
      return {
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

export const agentApi = {
  intake: (payload) => request('/agent/intake', { method: 'POST', body: payload }),
  submit: (payload) => request('/agent/submit', { method: 'POST', body: payload }),
}

const loadJsonObject = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

const saveJsonObject = (key, value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value || {}))
}

const getSpCreditAccountFallback = (spId) => {
  const all = loadJsonObject(STORAGE_KEYS.SP_CREDIT_ACCOUNT, {})
  const current = all?.[spId] || {}
  return {
    sp_id: spId,
    balance: Number(current.balance || 0),
    lifetime_purchased: Number(current.lifetime_purchased || 0),
    lifetime_used: Number(current.lifetime_used || 0),
    lifetime_granted: Number(current.lifetime_granted || 0),
    last_free_credit_at: current.last_free_credit_at || null,
  }
}

const setSpCreditAccountFallback = (spId, patch = {}) => {
  const all = loadJsonObject(STORAGE_KEYS.SP_CREDIT_ACCOUNT, {})
  const current = getSpCreditAccountFallback(spId)
  const next = {
    ...current,
    ...patch,
    balance: Number((patch.balance ?? current.balance) || 0),
    lifetime_purchased: Number((patch.lifetime_purchased ?? current.lifetime_purchased) || 0),
    lifetime_used: Number((patch.lifetime_used ?? current.lifetime_used) || 0),
    lifetime_granted: Number((patch.lifetime_granted ?? current.lifetime_granted) || 0),
    last_free_credit_at: patch.last_free_credit_at ?? current.last_free_credit_at ?? null,
  }
  all[spId] = next
  saveJsonObject(STORAGE_KEYS.SP_CREDIT_ACCOUNT, all)
  return next
}

const appendSpCreditLedgerFallback = (entry) => {
  const ledger = loadJsonArray(STORAGE_KEYS.SP_CREDIT_LEDGER)
  ledger.unshift(entry)
  saveJsonArray(STORAGE_KEYS.SP_CREDIT_LEDGER, ledger)
  return entry
}

const applySpFreeCreditPolicyFallback = (spId) => {
  const account = getSpCreditAccountFallback(spId)
  const now = nowIso()
  const next = {
    ...account,
    last_free_credit_at: account.last_free_credit_at || null,
  }

  let granted = 0
  let grantType = null

  if (!next.last_free_credit_at) {
    granted = SP_INITIAL_FREE_CREDITS
    grantType = 'starter'
    next.last_free_credit_at = now
  } else {
    const lastMs = Date.parse(next.last_free_credit_at)
    const nowMs = Date.parse(now)
    if (Number.isFinite(lastMs) && Number.isFinite(nowMs)) {
      const elapsedWeeks = Math.floor((nowMs - lastMs) / SP_FREE_CREDIT_INTERVAL_MS)
      if (elapsedWeeks > 0) {
        granted = elapsedWeeks * SP_WEEKLY_FREE_CREDITS
        grantType = 'weekly'
        next.last_free_credit_at = now
      }
    }
  }

  if (granted > 0) {
    const updated = setSpCreditAccountFallback(spId, {
      balance: Number(next.balance || 0) + granted,
      lifetime_granted: Number(next.lifetime_granted || 0) + granted,
      last_free_credit_at: next.last_free_credit_at,
    })
    appendSpCreditLedgerFallback({
      id: `credit-ledger-${Date.now()}`,
      sp_id: spId,
      entry_type: 'grant',
      delta: granted,
      balance_after: updated.balance,
      source_type: 'free_credit',
      source_id: grantType || 'starter',
      created_at: now,
      meta: {
        grant_type: grantType || 'starter',
      },
    })
    return { account: updated, granted, grantType }
  }

  const updated = setSpCreditAccountFallback(spId, {
    last_free_credit_at: next.last_free_credit_at,
  })
  return { account: updated, granted: 0, grantType: null }
}

export const spCreditApi = {
  async getSummary(spId) {
    try {
      return await request('/sp/credits/summary', {
        headers: {
          ...(spId ? { 'X-User-Id': String(spId) } : {}),
          'X-User-Role': 'sp',
        },
      })
    } catch {
      const { account } = applySpFreeCreditPolicyFallback(String(spId || 'unknown'))
      return { ...account, storage: 'local' }
    }
  },

  async getHistory(spId, limit = 100) {
    try {
      return await request(`/sp/credits/history?limit=${encodeURIComponent(String(limit))}`, {
        headers: {
          ...(spId ? { 'X-User-Id': String(spId) } : {}),
          'X-User-Role': 'sp',
        },
      })
    } catch {
      applySpFreeCreditPolicyFallback(String(spId || 'unknown'))
      const ledgerRows = loadJsonArray(STORAGE_KEYS.SP_CREDIT_LEDGER)
        .filter((row) => row.sp_id === spId)
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      const orderRows = loadJsonArray(STORAGE_KEYS.SP_CREDIT_ORDERS)
        .filter((row) => row.sp_id === spId)
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      return { items: ledgerRows.slice(0, limit), orders: orderRows.slice(0, limit), storage: 'local' }
    }
  },

  async createOrder(spId, payload) {
    const body = {
      credits: Number(payload?.credits || 1),
      amount: Number(payload?.amount || 0),
      currency: payload?.currency || 'USD',
      package_id: payload?.package_id || null,
      provider: payload?.provider || 'manual_placeholder',
    }
    try {
      return await request('/sp/credits/orders', {
        method: 'POST',
        headers: {
          ...(spId ? { 'X-User-Id': String(spId) } : {}),
          'X-User-Role': 'sp',
        },
        body,
      })
    } catch {
      const order = {
        id: `credit-order-${Date.now()}`,
        sp_id: spId,
        ...body,
        status: 'pending',
        created_at: nowIso(),
        updated_at: nowIso(),
        paid_at: null,
      }
      const rows = loadJsonArray(STORAGE_KEYS.SP_CREDIT_ORDERS)
      rows.unshift(order)
      saveJsonArray(STORAGE_KEYS.SP_CREDIT_ORDERS, rows)
      return { order, checkout_hint: 'local-fallback' }
    }
  },

  async simulatePaidCallback(orderId, payload = {}) {
    const body = {
      order_id: orderId,
      status: payload?.status || 'paid',
      provider_txn_id: payload?.provider_txn_id || `sim-${Date.now()}`,
      paid_at: payload?.paid_at || nowIso(),
    }
    try {
      return await request('/sp/credits/payments/callback', { method: 'POST', body })
    } catch {
      const orders = loadJsonArray(STORAGE_KEYS.SP_CREDIT_ORDERS)
      const index = orders.findIndex((row) => row.id === orderId)
      if (index < 0) throw new Error('Order not found')
      const order = { ...orders[index], ...body, status: body.status, updated_at: nowIso() }
      orders[index] = order
      saveJsonArray(STORAGE_KEYS.SP_CREDIT_ORDERS, orders)
      if (body.status === 'paid') {
        const { account } = applySpFreeCreditPolicyFallback(order.sp_id)
        const credits = Number(order.credits || 1)
        const nextBalance = Number(account.balance || 0) + credits
        setSpCreditAccountFallback(order.sp_id, {
          balance: nextBalance,
          lifetime_purchased: Number(account.lifetime_purchased || 0) + credits,
        })
        appendSpCreditLedgerFallback({
          id: `credit-ledger-${Date.now()}`,
          sp_id: order.sp_id,
          entry_type: 'purchase',
          delta: credits,
          balance_after: nextBalance,
          source_type: 'credit_order',
          source_id: order.id,
          created_at: nowIso(),
          meta: {
            amount: Number(order.amount || 0),
            currency: order.currency || 'USD',
            provider: order.provider || 'manual_placeholder',
          },
        })
      }
      return { order_id: order.id, sp_id: order.sp_id, status: order.status, storage: 'local' }
    }
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

const buildSearch = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    if (typeof value === 'string' && !value.trim()) return
    search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

const adminHeaders = {
  'X-User-Role': 'admin',
}

export const adminApi = {
  async getOverview(params = {}) {
    return request(`/admin/overview${buildSearch(params)}`, { headers: adminHeaders })
  },

  async getAdSlotStats(params = {}) {
    return request(`/admin/ad-slot/stats${buildSearch(params)}`, { headers: adminHeaders })
  },

  async listUsers(params = {}) {
    return request(`/admin/users${buildSearch(params)}`, { headers: adminHeaders })
  },

  async getUser(userId) {
    return request(`/admin/users/${encodeURIComponent(String(userId))}`, { headers: adminHeaders })
  },

  async freezeUser(userId, payload = {}) {
    return request(`/admin/users/${encodeURIComponent(String(userId))}/freeze`, {
      method: 'POST',
      headers: adminHeaders,
      body: payload,
    })
  },

  async unfreezeUser(userId, payload = {}) {
    return request(`/admin/users/${encodeURIComponent(String(userId))}/unfreeze`, {
      method: 'POST',
      headers: adminHeaders,
      body: payload,
    })
  },

  async getBillingSummary(params = {}) {
    return request(`/admin/billing/summary${buildSearch(params)}`, { headers: adminHeaders })
  },

  async listCreditAccounts(params = {}) {
    return request(`/admin/credits/accounts${buildSearch(params)}`, { headers: adminHeaders })
  },

  async listCreditOrders(params = {}) {
    return request(`/admin/credits/orders${buildSearch(params)}`, { headers: adminHeaders })
  },

  async listCreditLedger(params = {}) {
    return request(`/admin/credits/ledger${buildSearch(params)}`, { headers: adminHeaders })
  },

  async adjustCredits(payload = {}) {
    return request('/admin/credits/adjust', {
      method: 'POST',
      headers: adminHeaders,
      body: payload,
    })
  },

  async listEvents(params = {}) {
    return request(`/admin/logs/events${buildSearch(params)}`, { headers: adminHeaders })
  },

  async listErrors(params = {}) {
    return request(`/admin/logs/errors${buildSearch(params)}`, { headers: adminHeaders })
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
    if (!RECOMMENDED_SPS_API_ENABLED) return []
    if (!taskId) return []
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

export const adSlotApi = {
  async getFeed({
    userId,
    slotId = 'pm_feed_top',
    limit = 1,
    role = 'pm_po',
    region = {},
  } = {}) {
    const key = `${String(userId || '')}|${String(slotId)}|${String(limit)}`
    const knownEtag = adSlotEtagCache.get(key) || null
    const response = await fetch(
      toUrl(`/ad-slots/${encodeURIComponent(String(slotId))}/feed?limit=${encodeURIComponent(String(limit))}`),
      {
        method: 'GET',
        headers: {
          ...(userId ? { 'X-User-Id': String(userId) } : {}),
          'X-User-Role': normalizeApiRole(role) || 'pm_po',
          ...(region?.country ? { 'X-User-Country': String(region.country) } : {}),
          ...(region?.state ? { 'X-User-State': String(region.state) } : {}),
          ...(region?.city ? { 'X-User-City': String(region.city) } : {}),
          ...(knownEtag ? { 'If-None-Match': knownEtag } : {}),
        },
      }
    )

    if (response.status === 304) {
      const cachedPayload = adSlotPayloadCache.get(key) || { slot_id: slotId, items: [] }
      return {
        ...cachedPayload,
        etag: knownEtag,
        not_modified: true,
        cache_status: response.headers.get('x-feed-cache') || 'NOT_MODIFIED',
      }
    }

    const payload = await parseJsonSafely(response)
    if (!response.ok) throw normalizeApiError(payload, `Request failed: ${response.status}`)

    const etag = response.headers.get('etag') || null
    if (etag) adSlotEtagCache.set(key, etag)
    adSlotPayloadCache.set(key, payload)
    return {
      ...payload,
      etag,
      not_modified: false,
      cache_status: response.headers.get('x-feed-cache') || 'MISS',
    }
  },

  async reportImpression({
    userId,
    role = 'pm_po',
    impressionToken,
    viewportRatio = null,
    dwellMs = null,
  }) {
    return request('/ad-events/impression', {
      method: 'POST',
      headers: {
        ...(userId ? { 'X-User-Id': String(userId) } : {}),
        'X-User-Role': normalizeApiRole(role) || 'pm_po',
      },
      body: {
        impression_token: impressionToken,
        viewport_ratio: viewportRatio,
        dwell_ms: dwellMs,
      },
    })
  },

  resolveClickUrl(clickPath) {
    const path = String(clickPath || '').trim()
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    if (path.startsWith('/')) return path
    return `${API_BASE_URL}/${path}`
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
    const normalizedSpId = String(spId || '').trim()
    let apiRows = []
    try {
      const res = await request('/sp/bids', {
        headers: {
          ...(normalizedSpId ? { 'X-User-Id': normalizedSpId } : {}),
          'X-User-Role': 'sp',
        },
      })
      apiRows = res.items || []
    } catch {
      apiRows = []
    }

    const firestoreRows = await listSpBidsFromLeadSubcollections(normalizedSpId)
    if (apiRows.length) {
      return mergeBidRows(apiRows, firestoreRows)
    }

    const localRows = loadJsonArray(STORAGE_KEYS.SP_BIDS).filter(
      (row) => !normalizedSpId || String(row?.sp_id || '') === normalizedSpId
    )
    return mergeBidRows(firestoreRows, localRows)
  },

  async createBid(payload) {
    const normalizedAmount = Number(payload?.amount)
    const normalizedPayload = {
      ...payload,
      sp_id: payload?.sp_id ? String(payload.sp_id) : '',
      lead_id: payload?.lead_id || payload?.id || '',
      lead_doc_id: payload?.lead_doc_id || payload?.lead_id || payload?.id || '',
      amount: Number.isFinite(normalizedAmount) ? normalizedAmount : 0,
      note: payload?.note ?? payload?.notes ?? '',
    }
    if (!normalizedPayload.lead_doc_id) {
      normalizedPayload.lead_doc_id = normalizedPayload.lead_id
    }
    if (!normalizedPayload.lead_id) {
      throw new Error('Lead ID is required to submit bid.')
    }

    try {
      const spId = normalizedPayload.sp_id
      const response = await request('/sp/bids', {
        method: 'POST',
        headers: {
          ...(spId ? { 'X-User-Id': spId } : {}),
          'X-User-Role': 'sp',
        },
        body: normalizedPayload,
      })
      const apiBid = normalizeBidRow(response?.bid || response || {}, normalizedPayload)
      const mirroredBid = await mirrorBidToLeadSubcollection(apiBid)
      const finalBid = mirroredBid || apiBid

      const isEnvelope =
        response &&
        typeof response === 'object' &&
        !Array.isArray(response) &&
        (Object.prototype.hasOwnProperty.call(response, 'bid') ||
          Object.prototype.hasOwnProperty.call(response, 'credits_balance') ||
          Object.prototype.hasOwnProperty.call(response, 'credit_cost') ||
          Object.prototype.hasOwnProperty.call(response, 'storage'))
      if (isEnvelope) {
        return { ...response, bid: finalBid }
      }
      return finalBid
    } catch {
      const spId = String(normalizedPayload.sp_id || '')
      const { account } = applySpFreeCreditPolicyFallback(spId)
      if (Number(account.balance || 0) < 1) {
        const error = new Error('Insufficient credits. Your free credit will refresh next week.')
        error.error_code = 'INSUFFICIENT_CREDITS'
        throw error
      }
      const rows = loadJsonArray(STORAGE_KEYS.SP_BIDS)
      const next = normalizeBidRow({
        bid_id: `bid-${Date.now()}`,
        status: 'submitted',
        created_at: nowIso(),
        ...normalizedPayload,
      })
      rows.unshift(next)
      saveJsonArray(STORAGE_KEYS.SP_BIDS, rows)
      await mirrorBidToLeadSubcollection(next)
      const nextBalance = Number(account.balance || 0) - 1
      setSpCreditAccountFallback(spId, {
        balance: nextBalance,
        lifetime_used: Number(account.lifetime_used || 0) + 1,
      })
      appendSpCreditLedgerFallback({
        id: `credit-ledger-${Date.now()}`,
        sp_id: spId,
        entry_type: 'bid_use',
        delta: -1,
        balance_after: nextBalance,
        source_type: 'bid',
        source_id: next.bid_id,
        lead_id: normalizedPayload.lead_id,
        created_at: nowIso(),
      })
      return { bid: next, credits_balance: nextBalance, credit_cost: 1, storage: 'local' }
    }
  },

  async listProjects() {
    try {
      const res = await request('/sp/projects')
      return res.items || []
    } catch {
      return []
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

  async listInvoices() {
    try {
      const res = await request('/sp/invoices')
      return res.items || []
    } catch {
      return []
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
