import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createInMemoryStore } from './store.js'
import {
  transitionLead,
  transitionBid,
  transitionAssignment,
  extractSemanticTags,
  matchLeadToSps,
  isSpEligibleForLead,
  selectBidAndAssign,
} from './marketplace.js'

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Role, Idempotency-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
  })
  res.end(JSON.stringify(payload))
}

const readBody = async (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      const raw = Buffer.concat(chunks).toString('utf-8')
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })

const pathMatch = (pathname, pattern) => {
  const source = pathname.split('/').filter(Boolean)
  const target = pattern.split('/').filter(Boolean)
  if (source.length !== target.length) return null
  const params = {}
  for (let i = 0; i < target.length; i += 1) {
    const token = target[i]
    if (token.startsWith(':')) {
      params[token.slice(1)] = decodeURIComponent(source[i])
      continue
    }
    if (source[i] !== token) return null
  }
  return params
}

const withRequestId = (req) => req.headers['x-request-id'] || randomUUID()

const sendError = (res, requestId, statusCode, code, message, retryable = false, gate = null) =>
  json(res, statusCode, {
    request_id: requestId,
    error_code: code,
    message,
    retryable,
    ...(gate || {}),
  })

const ok = (res, requestId, payload) => json(res, 200, { request_id: requestId, ...payload })

const getPermissions = (role) => {
  switch (role) {
    case 'pm_po':
      return [
        'task:create',
        'task:status:update',
        'inventory:create',
        'sp:assign',
        'sp:card:write',
        'invoice:review',
        'reports:all',
        'lead:create',
        'lead:manage',
        'bid:review',
        'bid:select',
        'conversation:create',
        'conversation:read',
        'message:send',
      ]
    case 'tt':
      return ['task:create', 'task:comment', 'inventory:draft:update', 'inventory:submit']
    case 'sp':
      return [
        'task:comment',
        'invoice:create',
        'invoice:submit',
        'lead:view',
        'bid:create',
        'bid:withdraw',
        'conversation:read',
        'message:send',
        'assignment:respond',
      ]
    case 'admin':
      return ['reports:all', 'billing:read']
    default:
      return []
  }
}

const assertRole = ({ actor, allowed, res, requestId }) => {
  if (allowed.includes(actor.role)) return true
  sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Role is not allowed for this action')
  return false
}

const checkPlanGate = ({ actor, action }) => {
  if (action === 'advanced_reports' && actor.billing.plan_name !== 'pro') {
    return {
      blocked: true,
      response: {
        gate_status: 'blocked',
        plan_required: 'pro',
        upgrade_hint: 'Upgrade to Pro to access advanced reports.',
      },
    }
  }
  return { blocked: false, response: { gate_status: 'ok' } }
}

const findFirst = (collection, predicate) => {
  for (const row of collection.values()) {
    if (predicate(row)) return row
  }
  return null
}

const LEADS_COLLECTION = 'marketplace_leads'
const LEAD_BIDS_SUBCOLLECTION = 'bids'
let firestoreDb = null

const getDb = () => {
  if (firestoreDb) return firestoreDb
  if (!getApps().length) initializeApp()
  firestoreDb = getFirestore()
  return firestoreDb
}

const normalizeRole = (role) => {
  const next = String(role || '').trim().toLowerCase()
  if (next === 'pm' || next === 'po' || next === 'pm_po') return 'pm_po'
  if (next === 'sp') return 'sp'
  if (next === 'tt') return 'tt'
  if (next === 'admin') return 'admin'
  return null
}

const normalizeLead = (lead) => {
  if (!lead) return null
  const id = lead.id || lead.lead_id
  return { ...lead, id, lead_id: lead.lead_id || id }
}

const normalizeBid = (bid) => {
  if (!bid) return null
  const id = bid.id || bid.bid_id
  return { ...bid, id, bid_id: bid.bid_id || id }
}

const normalizeTaskStatus = (status) => String(status || '').trim().toLowerCase()

const mapTaskStatusToLeadStatus = (taskStatus, currentLeadStatus = 'open') => {
  const normalized = normalizeTaskStatus(taskStatus)
  if (!normalized) return null

  if (['closed', 'complete', 'completed', 'resolved'].includes(normalized)) return 'closed'
  if (['cancel', 'cancelled', 'canceled'].includes(normalized)) return 'cancelled'
  if (['open', 'new', 'pending', 'in_progress', 'reopened'].includes(normalized)) {
    return currentLeadStatus === 'assigned' ? 'assigned' : 'open'
  }
  return null
}

const withIdempotency = ({ store, key, resolver }) => {
  if (!key) return resolver()
  if (store.idempotency.has(key)) return store.idempotency.get(key)
  const next = resolver()
  store.idempotency.set(key, next)
  return next
}

export const createApiServer = ({ store = createInMemoryStore() } = {}) => {
  const routes = []
  const route = (method, pattern, handler) => routes.push({ method, pattern, handler })
  const listFirestoreLeads = async ({ actor }) => {
    try {
      const db = getDb()
      let query = db.collection(LEADS_COLLECTION)
      if (actor.role === 'sp') query = query.where('status', '==', 'open')
      if (actor.role === 'pm_po') query = query.where('creator_id', '==', actor.id)
      const snap = await query.get()
      return snap.docs
        .map((doc) => normalizeLead({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    } catch {
      return []
    }
  }

  const getFirestoreLeadById = async (id) => {
    try {
      const db = getDb()
      const doc = await db.collection(LEADS_COLLECTION).doc(id).get()
      if (!doc.exists) return null
      return normalizeLead({ id: doc.id, ...(doc.data() || {}) })
    } catch {
      return null
    }
  }

  const getFirestoreLeadByTaskRef = async (taskRef) => {
    const ref = String(taskRef || '').trim()
    if (!ref) return null
    try {
      const db = getDb()
      const fields = ['mx_id', 'task_id', 'task_doc_id']
      for (const field of fields) {
        const snap = await db.collection(LEADS_COLLECTION).where(field, '==', ref).limit(1).get()
        const doc = snap.docs[0]
        if (doc) return normalizeLead({ id: doc.id, ...(doc.data() || {}) })
      }
      return null
    } catch {
      return null
    }
  }

  const saveFirestoreLead = async (lead) => {
    const db = getDb()
    const normalized = normalizeLead(lead)
    await db.collection(LEADS_COLLECTION).doc(normalized.id).set(normalized, { merge: true })
    return normalized
  }

  const getLeadFromAnyStore = async (leadId) => {
    const firestoreLead = await getFirestoreLeadById(leadId)
    if (firestoreLead) return { lead: firestoreLead, source: 'firestore' }
    const memoryLead = store.leads.get(leadId)
    if (memoryLead) return { lead: normalizeLead(memoryLead), source: 'memory' }
    return { lead: null, source: null }
  }

  const listFirestoreLeadBids = async (leadId) => {
    try {
      const db = getDb()
      const snap = await db
        .collection(LEADS_COLLECTION)
        .doc(leadId)
        .collection(LEAD_BIDS_SUBCOLLECTION)
        .get()
      return snap.docs
        .map((doc) => normalizeBid({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    } catch {
      return []
    }
  }

  const listFirestoreSpBids = async (spId) => {
    try {
      const db = getDb()
      const snap = await db
        .collectionGroup(LEAD_BIDS_SUBCOLLECTION)
        .where('sp_id', '==', spId)
        .get()
      return snap.docs
        .map((doc) => normalizeBid({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    } catch {
      return []
    }
  }

  const createBidForLead = async ({ actor, leadId, body }) => {
    const found = await getLeadFromAnyStore(leadId)
    const lead = found.lead
    if (!lead) return { ok: false, status: 404, code: 'LEAD_NOT_FOUND', message: 'Lead not found' }
    if (lead.status !== 'open') {
      return { ok: false, status: 400, code: 'LEAD_NOT_OPEN', message: 'Lead is not accepting bids' }
    }

    const spProfile = store.spProfiles.get(actor.id)
    if (!spProfile) {
      return { ok: false, status: 404, code: 'SP_PROFILE_NOT_FOUND', message: 'SP profile not found' }
    }
    if (!isSpEligibleForLead(lead, spProfile)) {
      return { ok: false, status: 403, code: 'NOT_ELIGIBLE', message: 'You are not eligible to bid on this lead' }
    }
    if (!body?.amount || Number(body.amount) <= 0) {
      return { ok: false, status: 400, code: 'INVALID_AMOUNT', message: 'Bid amount must be a positive number' }
    }

    if (found.source === 'firestore') {
      const db = getDb()
      const bidsRef = db.collection(LEADS_COLLECTION).doc(leadId).collection(LEAD_BIDS_SUBCOLLECTION)
      const existingSnap = await bidsRef.where('sp_id', '==', actor.id).get()
      const hasActive = existingSnap.docs.some((doc) => {
        const row = doc.data() || {}
        return row.status !== 'withdrawn'
      })
      if (hasActive) {
        return {
          ok: false,
          status: 409,
          code: 'DUPLICATE_BID',
          message: 'You already have an active bid on this lead',
        }
      }

      const id = `bid-${randomUUID()}`
      const now = new Date().toISOString()
      const bid = normalizeBid({
        id,
        lead_id: leadId,
        mx_id: lead.mx_id || body?.mx_id || lead.task_id || body?.task_id || null,
        task_id: lead.task_id || body?.task_id || null,
        task_doc_id: lead.task_doc_id || body?.task_doc_id || null,
        sp_id: actor.id,
        amount: Number(body.amount),
        currency: body?.currency || 'USD',
        note: body?.note || '',
        estimated_duration: body?.estimated_duration || '',
        availability_date: body?.availability_date || null,
        status: 'submitted',
        status_changed_by: null,
        created_at: now,
        updated_at: now,
      })

      await bidsRef.doc(id).set(bid, { merge: true })
      store.bids.set(bid.id, bid)
      return { ok: true, bid }
    }

    const existingBid = findFirst(
      store.bids,
      (b) => b.lead_id === lead.id && b.sp_id === actor.id && b.status !== 'withdrawn'
    )
    if (existingBid) {
      return {
        ok: false,
        status: 409,
        code: 'DUPLICATE_BID',
        message: 'You already have an active bid on this lead',
      }
    }

    const bid = store.createBid({ actor, lead, body })
    return { ok: true, bid: normalizeBid(bid) }
  }

  route('GET', '/auth/me', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      user: { id: actor.id, role: actor.role },
    })
  })

  route('GET', '/auth/permissions', async ({ actor, res, requestId }) => {
    ok(res, requestId, { role: actor.role, permissions: getPermissions(actor.role) })
  })

  route('POST', '/tasks', async ({ actor, body, req, res, requestId }) => {
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const task = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createTask({ actor, body }),
    })
    ok(res, requestId, task)
  })

  route('GET', '/tasks/:id', async ({ params, res, requestId }) => {
    const task = store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    ok(res, requestId, task)
  })

  route('PATCH', '/tasks/:id/status', async ({ actor, params, body, res, requestId }) => {
    const task = store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    if (task.creator_user_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'TASK_STATUS_LOCKED',
        'Only task creator can update status.',
        false,
        { gate_status: 'blocked', plan_required: null, upgrade_hint: null }
      )
    }
    task.status = String(body?.status || task.status)
    task.updated_at = new Date().toISOString()

    // Task lifecycle drives lead lifecycle when a linked lead exists.
    const mappedLeadStatus = mapTaskStatusToLeadStatus(task.status)
    const linkedLead = task.lead_id ? store.leads.get(task.lead_id) : null
    if (linkedLead) {
      linkedLead.task_status = task.status
      linkedLead.task_updated_at = task.updated_at
      if (mappedLeadStatus) linkedLead.status = mappedLeadStatus
      linkedLead.updated_at = task.updated_at
      try {
        await saveFirestoreLead(normalizeLead(linkedLead))
      } catch {
        // Keep in-memory lead updated even if Firestore write fails.
      }
    }

    return ok(res, requestId, { gate_status: 'ok', task })
  })

  route('POST', '/tasks/:id/comments', async ({ actor, params, body, req, res, requestId }) => {
    const task = store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const comment = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => ({
        id: `cmt-${randomUUID()}`,
        task_id: params.id,
        author_id: actor.id,
        body: body?.body || '',
        created_at: new Date().toISOString(),
      }),
    })
    if (!task.comments.some((row) => row.id === comment.id)) {
      task.comments.push(comment)
    }
    task.updated_at = new Date().toISOString()
    ok(res, requestId, comment)
  })

  route('POST', '/leases/:lease_id/inventories', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const record = store.createInventory({ actor, leaseId: params.lease_id, body })
    ok(res, requestId, record)
  })

  route('GET', '/inventories/:id', async ({ params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    ok(res, requestId, inventory)
  })

  route('PATCH', '/inventories/:id/draft', async ({ actor, params, body, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned TT can update draft.')
    }
    inventory.draft = { ...(inventory.draft || {}), ...(body?.draft || {}) }
    inventory.updated_at = new Date().toISOString()
    ok(res, requestId, inventory)
  })

  route('POST', '/inventories/:id/submit', async ({ actor, params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned TT can submit draft.')
    }
    inventory.status = 'submitted'
    inventory.submitted_at = new Date().toISOString()
    inventory.updated_at = new Date().toISOString()
    ok(res, requestId, inventory)
  })

  route('GET', '/tasks/:id/recommended-sps', async ({ params, res, requestId }) => {
    if (!store.tasks.has(params.id)) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    ok(res, requestId, {
      items: [
        { sp_id: 'sp-101', sp_name: 'FixFast Plumbing', score: 0.93 },
        { sp_id: 'sp-102', sp_name: 'Prime Electric', score: 0.88 },
      ],
    })
  })

  route('POST', '/tasks/:id/sp-actions/contact', async ({ actor, params, body, res, requestId }) => {
    if (!store.tasks.has(params.id)) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    ok(res, requestId, {
      task_id: params.id,
      action: 'contact',
      by: actor.id,
      sp_id: body?.sp_id || null,
      result: 'queued',
    })
  })

  route('POST', '/tasks/:id/sp-actions/quote', async ({ actor, params, body, res, requestId }) => {
    if (!store.tasks.has(params.id)) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    ok(res, requestId, {
      task_id: params.id,
      action: 'quote',
      by: actor.id,
      sp_id: body?.sp_id || null,
      result: 'queued',
    })
  })

  route('POST', '/tasks/:id/assign-sp', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const task = store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    task.assigned_sp_id = body?.sp_id || null
    task.updated_at = new Date().toISOString()
    ok(res, requestId, { task_id: task.id, assigned_sp_id: task.assigned_sp_id })
  })

  route('POST', '/sp-cards', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const record = store.createSpCard({ actor, body })
    ok(res, requestId, record)
  })

  route('PATCH', '/sp-cards/:id/note', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const card = store.spCards.get(params.id)
    if (!card) return sendError(res, requestId, 404, 'SP_CARD_NOT_FOUND', 'SP card not found')
    card.owner_note = String(body?.note || '')
    card.updated_at = new Date().toISOString()
    ok(res, requestId, card)
  })

  route('GET', '/sp-cards', async ({ actor, query, res, requestId }) => {
    const ownerId = query.get('owner_id') || actor.id
    const items = [...store.spCards.values()].filter((row) => row.owner_id === ownerId)
    ok(res, requestId, { items })
  })

  // -----------------------------------------------------------------------
  // Lead endpoints
  // -----------------------------------------------------------------------

  route('POST', '/leads/from-task', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po', 'tt'], res, requestId })) return

    const mxId = String(body?.mx_id || body?.task_id || '').trim()
    const taskDocId = String(body?.task_doc_id || body?.system_task_id || '').trim()
    if (!mxId) return sendError(res, requestId, 400, 'MISSING_MX_ID', 'mx_id is required')

    const existing = (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
    if (existing) return ok(res, requestId, { lead: existing, created: false, storage: 'firestore' })

    const now = new Date().toISOString()
    const lead = normalizeLead({
      id: `lead-${randomUUID()}`,
      mx_id: mxId,
      task_id: mxId,
      task_doc_id: taskDocId || null,
      property_id: body?.property_id || null,
      lease_id: body?.lease_id || null,
      creator_id: actor.id,
      creator_role: actor.role,
      title: String(body?.title || 'New Task Lead'),
      description: String(body?.description || ''),
      scope: String(body?.scope || body?.description || ''),
      location: String(body?.location || ''),
      address: String(body?.address || ''),
      budget_range: String(body?.budget_range || ''),
      urgency: String(body?.urgency || 'normal'),
      due_date: body?.due_date || null,
      semantic_tags: extractSemanticTags(
        `${body?.title || ''} ${body?.description || ''} ${body?.scope || ''}`
      ),
      status: 'open',
      visibility_mode: 'public',
      bid_deadline: body?.bid_deadline || null,
      bid_count: 0,
      assigned_sp_id: null,
      assigned_bid_id: null,
      source: 'task-bridge',
      created_at: body?.created_at || now,
      updated_at: now,
    })

    try {
      const saved = await saveFirestoreLead(lead)
      store.leads.set(saved.id, saved)
      return ok(res, requestId, { lead: saved, created: true, storage: 'firestore' })
    } catch {
      store.leads.set(lead.id, lead)
      return ok(res, requestId, { lead, created: true, storage: 'memory' })
    }
  })

  route('POST', '/leads/sync-task-status', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po', 'tt'], res, requestId })) return

    const mxId = String(body?.mx_id || body?.task_id || '').trim()
    const taskDocId = String(body?.task_doc_id || body?.system_task_id || '').trim()
    const taskStatus = String(body?.task_status || '').trim()
    if (!mxId || !taskStatus) {
      return sendError(res, requestId, 400, 'MISSING_FIELDS', 'mx_id and task_status are required')
    }

    const now = new Date().toISOString()
    const taskUpdatedAt = body?.task_updated_at || now
    const directLeadStatus = mapTaskStatusToLeadStatus(taskStatus)

    const firestoreLead = (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
    if (firestoreLead) {
      const nextStatus = directLeadStatus || firestoreLead.status || 'open'
      const updated = normalizeLead({
        ...firestoreLead,
        task_status: taskStatus,
        task_updated_at: taskUpdatedAt,
        status: nextStatus,
        updated_at: now,
      })
      try {
        await saveFirestoreLead(updated)
      } catch {
        // Keep returning in-memory updated record if Firestore write fails.
      }
      store.leads.set(updated.id, updated)
      return ok(res, requestId, { lead: updated, updated: true, storage: 'firestore' })
    }

    const memoryLead = findFirst(
      store.leads,
      (lead) =>
        String(lead.mx_id || '') === mxId ||
        String(lead.task_id || '') === mxId ||
        (taskDocId && String(lead.task_doc_id || '') === taskDocId)
    )
    if (!memoryLead) {
      return ok(res, requestId, { updated: false, reason: 'LEAD_NOT_FOUND', mx_id: mxId })
    }

    const nextStatus = directLeadStatus || memoryLead.status || 'open'
    memoryLead.task_status = taskStatus
    memoryLead.task_updated_at = taskUpdatedAt
    memoryLead.status = nextStatus
    memoryLead.updated_at = now
    return ok(res, requestId, { lead: normalizeLead(memoryLead), updated: true, storage: 'memory' })
  })

  route('POST', '/leads', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const taskId = body?.task_id
    if (!taskId) return sendError(res, requestId, 400, 'MISSING_TASK_ID', 'task_id is required')
    const task = store.tasks.get(taskId)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    if (task.creator_user_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only task creator can publish a lead')
    }
    if (task.lead_id) {
      return sendError(res, requestId, 409, 'LEAD_ALREADY_EXISTS', 'Task already has a lead published')
    }

    const semanticTags = extractSemanticTags(`${task.title} ${task.description} ${body?.scope || ''}`)
    const leadBody = { ...body, semantic_tags: semanticTags }

    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const lead = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createLead({ actor, task, body: leadBody }),
    })

    try {
      await saveFirestoreLead(normalizeLead(lead))
    } catch {
      // Keep marketplace operational with in-memory fallback.
    }

    const matchedSps = matchLeadToSps(lead, store.spProfiles)
    ok(res, requestId, { lead, matched_sp_count: matchedSps.length })
  })

  route('GET', '/leads', async ({ actor, query, res, requestId }) => {
    const firestoreItems = await listFirestoreLeads({ actor })
    if (firestoreItems.length) {
      return ok(res, requestId, { items: firestoreItems })
    }

    const items = []

    if (actor.role === 'sp') {
      const spProfile = store.spProfiles.get(actor.id)
      if (!spProfile) return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
      for (const lead of store.leads.values()) {
        if (isSpEligibleForLead(lead, spProfile)) {
          items.push(lead)
        }
      }
    } else if (actor.role === 'pm_po') {
      const creatorFilter = query.get('creator_id') || actor.id
      for (const lead of store.leads.values()) {
        if (lead.creator_id === creatorFilter) items.push(lead)
      }
    } else {
      for (const lead of store.leads.values()) items.push(lead)
    }

    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((lead) => normalizeLead(lead)) })
  })

  route('GET', '/leads/:id', async ({ actor, params, res, requestId }) => {
    let lead = await getFirestoreLeadById(params.id)
    if (!lead) lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')

    if (actor.role === 'sp') {
      const spProfile = store.spProfiles.get(actor.id)
      if (!spProfile || !isSpEligibleForLead(lead, spProfile)) {
        return sendError(res, requestId, 403, 'LEAD_NOT_VISIBLE', 'This lead is not available to you')
      }
    }

    ok(res, requestId, { lead: normalizeLead(lead) })
  })

  route('PATCH', '/leads/:id/status', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can change status')
    }
    const nextStatus = String(body?.status || '')
    const result = transitionLead(lead, nextStatus, actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { lead: result.lead })
  })

  route('GET', '/leads/:id/matched-sps', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    const matched = matchLeadToSps(lead, store.spProfiles)
    ok(res, requestId, { items: matched })
  })

  // -----------------------------------------------------------------------
  // Bid endpoints
  // -----------------------------------------------------------------------

  route('POST', '/leads/:id/bids', async ({ actor, params, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const result = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => createBidForLead({ actor, leadId: params.id, body }),
    })
    const resolved = await Promise.resolve(result)
    if (!resolved.ok) {
      return sendError(res, requestId, resolved.status || 400, resolved.code, resolved.message)
    }
    ok(res, requestId, { bid: normalizeBid(resolved.bid) })
  })

  route('GET', '/leads/:id/bids', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const found = await getLeadFromAnyStore(params.id)
    const lead = found.lead
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can view all bids')
    }

    let items = []
    if (found.source === 'firestore') {
      items = await listFirestoreLeadBids(params.id)
    } else {
      items = [...store.bids.values()]
        .filter((b) => b.lead_id === params.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    const enriched = items.map((bid) => {
      const sp = store.spProfiles.get(bid.sp_id)
      return {
        ...bid,
        sp_business_name: sp?.business_name || null,
        sp_rating_avg: sp?.rating_avg || null,
        sp_total_jobs: sp?.total_jobs_completed || 0,
      }
    })

    ok(res, requestId, { items: enriched })
  })

  route('GET', '/bids', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own bids')
    }
    const firestoreItems = await listFirestoreSpBids(spId)
    if (firestoreItems.length) return ok(res, requestId, { items: firestoreItems })
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((row) => normalizeBid(row)) })
  })

  // Alias for frontend compatibility: SP bid list
  route('GET', '/sp/bids', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own bids')
    }
    const firestoreItems = await listFirestoreSpBids(spId)
    if (firestoreItems.length) return ok(res, requestId, { items: firestoreItems })
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((row) => normalizeBid(row)) })
  })

  // Alias for frontend compatibility: SP create bid from lead_id in body
  route('POST', '/sp/bids', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const leadId = String(body?.lead_id || '').trim()
    if (!leadId) return sendError(res, requestId, 400, 'MISSING_LEAD_ID', 'lead_id is required')
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const result = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => createBidForLead({ actor, leadId, body }),
    })
    const resolved = await Promise.resolve(result)
    if (!resolved.ok) {
      return sendError(res, requestId, resolved.status || 400, resolved.code, resolved.message)
    }
    ok(res, requestId, { bid: normalizeBid(resolved.bid) })
  })

  route('PATCH', '/bids/:id/withdraw', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    if (bid.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only bid owner can withdraw')
    }
    const result = transitionBid(bid, 'withdrawn', actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(bid.lead_id)
    if (lead) {
      lead.bid_count = Math.max(0, (lead.bid_count || 1) - 1)
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { bid: result.bid })
  })

  route('PATCH', '/bids/:id/shortlist', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    const lead = store.leads.get(bid.lead_id)
    if (!lead || lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can shortlist bids')
    }
    const result = transitionBid(bid, 'shortlisted', actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { bid: result.bid })
  })

  route('POST', '/bids/:id/select', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    const lead = store.leads.get(bid.lead_id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can select a bid')
    }

    const result = selectBidAndAssign({ store, lead, winningBid: bid, actorId: actor.id })
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    ok(res, requestId, {
      bid: result.bid,
      lead: result.lead,
      assignment: result.assignment,
    })
  })

  // -----------------------------------------------------------------------
  // Conversation & messaging endpoints
  // -----------------------------------------------------------------------

  route('POST', '/conversations', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const leadId = body?.lead_id
    const spId = body?.sp_id
    if (!leadId || !spId) {
      return sendError(res, requestId, 400, 'MISSING_FIELDS', 'lead_id and sp_id are required')
    }
    const lead = store.leads.get(leadId)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can start conversations')
    }

    const existing = findFirst(
      store.conversations,
      (c) => c.lead_id === leadId && c.pm_id === actor.id && c.sp_id === spId
    )
    if (existing) {
      return ok(res, requestId, { conversation: existing, created: false })
    }

    const conversation = store.createConversation({ actor, lead, spId })
    ok(res, requestId, { conversation, created: true })
  })

  route('GET', '/conversations', async ({ actor, query, res, requestId }) => {
    const leadId = query.get('lead_id')
    const items = [...store.conversations.values()].filter((c) => {
      if (!c.participants.includes(actor.id)) return false
      if (leadId && c.lead_id !== leadId) return false
      return true
    })
    items.sort((a, b) => (b.last_message_at || b.created_at).localeCompare(a.last_message_at || a.created_at))

    const enriched = items.map((conv) => {
      const sp = store.spProfiles.get(conv.sp_id)
      const pmUser = store.users.get(conv.pm_id)
      return {
        ...conv,
        sp_business_name: sp?.business_name || null,
        pm_display: pmUser?.id || null,
      }
    })

    ok(res, requestId, { items: enriched })
  })

  route('POST', '/conversations/:id/messages', async ({ actor, params, body, res, requestId }) => {
    const conversation = store.conversations.get(params.id)
    if (!conversation) return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Not a participant in this conversation')
    }
    if (conversation.status !== 'active') {
      return sendError(res, requestId, 400, 'CONVERSATION_ARCHIVED', 'Conversation is archived')
    }
    if (!body?.body && body?.message_type !== 'system') {
      return sendError(res, requestId, 400, 'EMPTY_MESSAGE', 'Message body is required')
    }

    const message = store.createMessage({ actor, conversation, body })
    ok(res, requestId, { message })
  })

  route('GET', '/conversations/:id/messages', async ({ actor, params, res, requestId }) => {
    const conversation = store.conversations.get(params.id)
    if (!conversation) return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Not a participant in this conversation')
    }

    const allMessages = store.messages.get(conversation.id) || []
    const isPm = actor.id === conversation.pm_id

    const visible = allMessages.filter((msg) => {
      if (msg.visibility === 'all') return true
      if (msg.visibility === 'pm_only' && isPm) return true
      return false
    })

    ok(res, requestId, { items: visible })
  })

  // -----------------------------------------------------------------------
  // Assignment endpoints
  // -----------------------------------------------------------------------

  route('GET', '/assignments', async ({ actor, query, res, requestId }) => {
    const items = [...store.assignments.values()].filter((a) => {
      if (actor.role === 'sp') return a.sp_id === actor.id
      if (actor.role === 'pm_po') return a.pm_id === actor.id
      return false
    })
    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items })
  })

  route('POST', '/assignments/:id/accept', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned SP can accept')
    }
    const result = transitionAssignment(assignment, 'active')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/decline', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned SP can decline')
    }
    const result = transitionAssignment(assignment, 'declined')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    // Re-open the lead so PM/PO can select another SP
    const lead = store.leads.get(assignment.lead_id)
    if (lead && lead.status === 'assigned') {
      lead.status = 'open'
      lead.assigned_sp_id = null
      lead.assigned_bid_id = null
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/revoke', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only the PM/PO who created this lead can revoke')
    }
    const result = transitionAssignment(assignment, 'revoked')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(assignment.lead_id)
    if (lead && lead.status === 'assigned') {
      lead.status = 'open'
      lead.assigned_sp_id = null
      lead.assigned_bid_id = null
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/complete', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only the lead PM/PO can mark complete')
    }
    const result = transitionAssignment(assignment, 'completed')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(assignment.lead_id)
    if (lead) transitionLead(lead, 'closed', actor.id)

    ok(res, requestId, { assignment: result.assignment })
  })

  // -----------------------------------------------------------------------
  // SP profile endpoints
  // -----------------------------------------------------------------------

  route('GET', '/sp/services/profile', async ({ actor, query, res, requestId }) => {
    const requestedSpId = String(query.get('sp_id') || actor.id || '').trim()
    if (!requestedSpId) {
      return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    }
    if (actor.role === 'sp' && actor.id !== requestedSpId) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only read your own service profile')
    }

    try {
      const db = getDb()
      const doc = await db.collection('users').doc(requestedSpId).get()
      const userData = doc.exists ? (doc.data() || {}) : {}
      const nested = userData?.sp_service_profile || null
      if (!nested) {
        return ok(res, requestId, {
          item: {
            sp_id: requestedSpId,
            service_descriptions: [],
            service_zip_codes: [],
            service_area_shape: null,
            service_map_view: null,
          },
        })
      }
      return ok(res, requestId, { item: { sp_id: requestedSpId, ...nested } })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SP_SERVICE_PROFILE_READ_FAILED',
        'Failed to read service profile from Firestore.',
        true
      )
    }
  })

  route('PUT', '/sp/services/profile', async ({ actor, body, res, requestId }) => {
    const requestedSpId = String(body?.sp_id || actor.id || '').trim()
    if (!requestedSpId) {
      return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    }
    if (actor.role === 'sp' && actor.id !== requestedSpId) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only update your own service profile')
    }

    const descriptions = Array.isArray(body?.service_descriptions)
      ? body.service_descriptions
          .map((item) => String(item || '').trim().replace(/\s+/g, ' '))
          .filter((item) => item.length > 0)
      : []

    const zipCodes = Array.isArray(body?.service_zip_codes)
      ? [...new Set(body.service_zip_codes.map((zip) => String(zip || '').trim()))].filter((zip) =>
          /^\d{5}$/.test(zip)
        )
      : []

    const payload = {
      sp_id: requestedSpId,
      service_descriptions: descriptions,
      service_zip_codes: zipCodes,
      service_area_shape: body?.service_area_shape || null,
      service_map_view: body?.service_map_view || null,
      updated_at: new Date().toISOString(),
    }

    try {
      const db = getDb()
      const ref = db.collection('users').doc(requestedSpId)
      const existing = await ref.get()
      const existingProfile = existing.exists ? existing.data()?.sp_service_profile : null
      payload.created_at = existingProfile?.created_at || new Date().toISOString()
      await ref.set({ sp_service_profile: payload }, { merge: true })
      return ok(res, requestId, payload)
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SP_SERVICE_PROFILE_WRITE_FAILED',
        'Failed to write service profile to Firestore.',
        true
      )
    }
  })

  route('GET', '/sp/profile', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const profile = store.spProfiles.get(actor.id)
    if (!profile) return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
    ok(res, requestId, { profile })
  })

  route('PATCH', '/sp/profile', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    let profile = store.spProfiles.get(actor.id)
    if (!profile) {
      return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found. Complete signup first.')
    }

    const updatableFields = [
      'business_name', 'service_categories', 'service_area',
      'service_area_radius_km', 'license_number', 'budget_band',
      'urgency_capability',
    ]
    for (const field of updatableFields) {
      if (body?.[field] !== undefined) profile[field] = body[field]
    }
    if (body?.match_preferences) {
      profile.match_preferences = { ...profile.match_preferences, ...body.match_preferences }
    }

    // Re-extract semantic tags when description-relevant fields change
    const descText = `${profile.business_name} ${(profile.service_categories || []).join(' ')}`
    profile.semantic_tags = extractSemanticTags(descText)
    profile.updated_at = new Date().toISOString()

    ok(res, requestId, { profile })
  })

  // -----------------------------------------------------------------------
  // Existing invoice endpoints (unchanged)
  // -----------------------------------------------------------------------

  route('POST', '/invoices', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const invoice = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createInvoice({ actor, body }),
    })
    ok(res, requestId, invoice)
  })

  route('POST', '/invoices/:id/submit', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const invoice = store.invoices.get(params.id)
    if (!invoice) return sendError(res, requestId, 404, 'INVOICE_NOT_FOUND', 'Invoice not found')
    if (invoice.created_by !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only owner SP can submit invoice.')
    }
    invoice.status = 'submitted'
    invoice.updated_at = new Date().toISOString()
    ok(res, requestId, invoice)
  })

  route('POST', '/invoices/:id/review', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const invoice = store.invoices.get(params.id)
    if (!invoice) return sendError(res, requestId, 404, 'INVOICE_NOT_FOUND', 'Invoice not found')
    const nextStatus = String(body?.status || '')
    if (!['changes_requested', 'approved', 'rejected'].includes(nextStatus)) {
      return sendError(res, requestId, 400, 'INVALID_REVIEW_STATUS', 'Invalid invoice review status.')
    }
    invoice.status = nextStatus
    invoice.review_note = body?.note || null
    invoice.updated_at = new Date().toISOString()
    ok(res, requestId, invoice)
  })

  route('GET', '/tasks/:id/invoices', async ({ params, res, requestId }) => {
    if (!store.tasks.has(params.id)) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    const items = [...store.invoices.values()].filter((invoice) => invoice.task_id === params.id)
    ok(res, requestId, { items })
  })

  route('GET', '/billing/profile-summary', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      plan_name: actor.billing.plan_name,
      subscription_status: actor.billing.subscription_status,
      next_renewal_date: actor.billing.next_renewal_date,
      gate_status: 'ok',
    })
  })

  route('GET', '/billing/usage', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      properties_used: actor.billing.properties_used,
      properties_limit: actor.billing.properties_limit,
      voice_used: actor.billing.voice_used,
      voice_limit: actor.billing.voice_limit,
      storage_used_mb: actor.billing.storage_used_mb,
      storage_limit_mb: actor.billing.storage_limit_mb,
    })
  })

  route('GET', '/billing/credits', async ({ actor, res, requestId }) => {
    ok(res, requestId, { balance: actor.billing.credits })
  })

  route('POST', '/billing/upgrade', async ({ actor, body, res, requestId }) => {
    actor.billing.plan_name = body?.plan_name || 'pro'
    actor.billing.properties_limit = actor.billing.plan_name === 'pro' ? 50 : 3
    actor.billing.voice_limit = actor.billing.plan_name === 'pro' ? 500 : 0
    actor.billing.storage_limit_mb = actor.billing.plan_name === 'pro' ? 5120 : 512
    actor.billing.history.push({
      id: `hist-${randomUUID()}`,
      type: 'upgrade',
      amount: Number(body?.amount || 0),
      created_at: new Date().toISOString(),
    })
    ok(res, requestId, { gate_status: 'ok', plan_name: actor.billing.plan_name })
  })

  route('POST', '/billing/addon/purchase', async ({ actor, body, res, requestId }) => {
    const credits = Number(body?.credits || 0)
    actor.billing.credits += credits
    actor.billing.history.push({
      id: `hist-${randomUUID()}`,
      type: 'addon_purchase',
      credits,
      amount: Number(body?.amount || 0),
      created_at: new Date().toISOString(),
    })
    ok(res, requestId, { gate_status: 'ok', credits_balance: actor.billing.credits })
  })

  route('GET', '/billing/history', async ({ actor, res, requestId }) => {
    ok(res, requestId, { items: actor.billing.history })
  })

  route('GET', '/reports/task-status', async ({ res, requestId }) => {
    const rows = [...store.tasks.values()].map((task) => ({
      task_id: task.id,
      status: task.status,
      updated_at: task.updated_at,
    }))
    ok(res, requestId, { rows })
  })

  route('GET', '/reports/occupancy-lease', async ({ res, requestId }) => {
    ok(res, requestId, {
      rows: [
        { property_id: 'prop-1', occupied_units: 9, total_units: 10 },
        { property_id: 'prop-2', occupied_units: 14, total_units: 20 },
      ],
    })
  })

  route('GET', '/reports/income-expense', async ({ actor, res, requestId }) => {
    const gate = checkPlanGate({ actor, action: 'advanced_reports' })
    if (gate.blocked) {
      return sendError(
        res,
        requestId,
        403,
        'PLAN_NOT_ELIGIBLE',
        'Current plan cannot access this report.',
        false,
        gate.response
      )
    }
    ok(res, requestId, {
      gate_status: gate.response.gate_status,
      rows: [{ period: '2026-01', income: 12000, expense: 4600 }],
    })
  })

  route('GET', '/reports/annual-tax-finance', async ({ actor, query, res, requestId }) => {
    const gate = checkPlanGate({ actor, action: 'advanced_reports' })
    if (gate.blocked) {
      return sendError(
        res,
        requestId,
        403,
        'PLAN_NOT_ELIGIBLE',
        'Current plan cannot access annual tax finance report.',
        false,
        gate.response
      )
    }
    const year = Number(query.get('year') || new Date().getFullYear())
    ok(res, requestId, {
      gate_status: gate.response.gate_status,
      year,
      revenue_total: 146000,
      expense_total: 61200,
      net_total: 84800,
    })
  })

  const handler = async (req, res) => {
    const requestId = withRequestId(req)
    if (req.method === 'OPTIONS') return json(res, 204, { request_id: requestId })
    try {
      const rawUrl = (req.url || '/').replace(/^\/api/, '') || '/'
      const url = new URL(rawUrl, 'http://localhost')
      const actorId = String(req.headers['x-user-id'] || 'u-tt-1')
      const actorRole = normalizeRole(req.headers['x-user-role'])
      const actor = store.ensureUser(actorId, actorRole)
      const body = ['POST', 'PATCH'].includes(req.method || '') ? await readBody(req) : {}
      for (const row of routes) {
        if (row.method !== req.method) continue
        const params = pathMatch(url.pathname, row.pattern)
        if (!params) continue
        return row.handler({ req, res, requestId, actor, params, body, query: url.searchParams })
      }
      return sendError(res, requestId, 404, 'NOT_FOUND', 'API route not found')
    } catch (error) {
      if (error.message === 'invalid_json') {
        return sendError(res, requestId, 400, 'INVALID_JSON', 'Request body is not valid JSON.')
      }
      return sendError(res, requestId, 500, 'INTERNAL_ERROR', 'Unexpected server error.', true)
    }
  }

  const server = http.createServer(handler)
  return { server, handler, store }
}
