import { randomUUID } from 'node:crypto'

const nowIso = () => new Date().toISOString()

const createUser = (id, role, plan = 'free') => ({
  id,
  role,
  billing: {
    plan_name: plan,
    subscription_status: 'active',
    next_renewal_date: null,
    properties_used: 0,
    properties_limit: plan === 'pro' ? 50 : 3,
    voice_used: 0,
    voice_limit: plan === 'pro' ? 500 : 0,
    storage_used_mb: 0,
    storage_limit_mb: plan === 'pro' ? 5120 : 512,
    credits: plan === 'pro' ? 20 : 0,
    history: [],
  },
})

export const createInMemoryStore = () => {
  const users = new Map([
    ['u-tt-1', createUser('u-tt-1', 'tt', 'free')],
    ['u-pm-1', createUser('u-pm-1', 'pm_po', 'pro')],
    ['u-sp-1', createUser('u-sp-1', 'sp', 'free')],
    ['u-admin-1', createUser('u-admin-1', 'admin', 'pro')],
  ])

  const tasks = new Map()
  const inventories = new Map()
  const spCards = new Map()
  const invoices = new Map()
  const idempotency = new Map()

  const ensureUser = (id = 'u-tt-1') => users.get(id) || users.get('u-tt-1')

  const createTask = ({ actor, body }) => {
    const id = `task-${randomUUID()}`
    const record = {
      id,
      title: body?.title || 'Untitled task',
      description: body?.description || '',
      status: body?.status || 'open',
      creator_user_id: actor.id,
      lease_id: body?.lease_id || null,
      comments: [],
      assigned_sp_id: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    tasks.set(id, record)
    return record
  }

  const createInventory = ({ actor, leaseId, body }) => {
    const id = `inv-${randomUUID()}`
    const record = {
      id,
      lease_id: leaseId,
      created_by: actor.id,
      assigned_tt_id: body?.assigned_tt_id || null,
      status: 'draft',
      draft: body?.draft || {},
      submitted_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    inventories.set(id, record)
    return record
  }

  const createSpCard = ({ actor, body }) => {
    const id = `spc-${randomUUID()}`
    const record = {
      id,
      owner_id: body?.owner_id || actor.id,
      sp_id: body?.sp_id || null,
      sp_name_snapshot: body?.sp_name_snapshot || '',
      owner_note: body?.owner_note || '',
      tags: Array.isArray(body?.tags) ? body.tags : [],
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    spCards.set(id, record)
    return record
  }

  const createInvoice = ({ actor, body }) => {
    const id = `invoc-${randomUUID()}`
    const subtotal = Number(body?.subtotal || 0)
    const tax = Number(body?.tax || 0)
    const discount = Number(body?.discount || 0)
    const total = subtotal + tax - discount
    const record = {
      id,
      task_id: body?.task_id || null,
      created_by: actor.id,
      line_items: Array.isArray(body?.line_items) ? body.line_items : [],
      subtotal,
      tax,
      discount,
      total,
      currency: body?.currency || 'USD',
      status: 'draft',
      review_note: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    invoices.set(id, record)
    return record
  }

  return {
    users,
    tasks,
    inventories,
    spCards,
    invoices,
    idempotency,
    ensureUser,
    createTask,
    createInventory,
    createSpCard,
    createInvoice,
  }
}
