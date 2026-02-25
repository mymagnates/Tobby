import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { createInMemoryStore } from './store.js'

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Role, Idempotency-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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
      ]
    case 'tt':
      return ['task:create', 'task:comment', 'inventory:draft:update', 'inventory:submit']
    case 'sp':
      return ['task:comment', 'invoice:create', 'invoice:submit']
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
      const url = new URL(req.url || '/', 'http://localhost')
      const actorId = String(req.headers['x-user-id'] || 'u-tt-1')
      const actor = store.ensureUser(actorId)
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
  return { server, store }
}
