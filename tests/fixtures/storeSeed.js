/**
 * Pre-seeded store data for backend API contract tests.
 * Use with createApiServer({ store: createSeededStore() }) for richer scenarios.
 */
import { createInMemoryStore } from '../../backend/store.js'

const nowIso = () => new Date().toISOString()

export const createSeededStore = () => {
  const store = createInMemoryStore()

  // Seed tasks
  const task1 = {
    id: 'task-1',
    title: 'Fix leaking faucet in Unit 3',
    description: 'Kitchen faucet drips constantly',
    status: 'open',
    creator_user_id: 'u-tt-1',
    lease_id: 'lease-1',
    comments: [],
    assigned_sp_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  const task2 = {
    id: 'task-2',
    title: 'HVAC maintenance',
    description: 'Annual AC service',
    status: 'in_progress',
    creator_user_id: 'u-pm-1',
    lease_id: 'lease-1',
    comments: [{ id: 'cmt-1', task_id: 'task-2', author_id: 'u-sp-1', body: 'Parts ordered', created_at: nowIso() }],
    assigned_sp_id: 'sp-101',
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  store.tasks.set('task-1', task1)
  store.tasks.set('task-2', task2)

  // Seed inventories
  const inv1 = {
    id: 'inv-1',
    lease_id: 'lease-1',
    created_by: 'u-pm-1',
    assigned_tt_id: 'u-tt-1',
    status: 'draft',
    draft: { condition_notes: 'Minor wear on carpet' },
    submitted_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  const inv2 = {
    id: 'inv-2',
    lease_id: 'lease-1',
    created_by: 'u-pm-1',
    assigned_tt_id: 'u-tt-1',
    status: 'submitted',
    draft: {},
    submitted_at: nowIso(),
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  store.inventories.set('inv-1', inv1)
  store.inventories.set('inv-2', inv2)

  // Seed SP cards
  const spCard1 = {
    id: 'spc-1',
    owner_id: 'u-pm-1',
    sp_id: 'sp-101',
    sp_name_snapshot: 'FixFast Plumbing',
    owner_note: 'Used for last 3 jobs',
    tags: ['plumbing', 'reliable'],
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  store.spCards.set('spc-1', spCard1)

  // Seed invoices
  const invoc1 = {
    id: 'invoc-1',
    task_id: 'task-2',
    created_by: 'u-sp-1',
    line_items: [{ description: 'AC tune-up', quantity: 1, unit_price: 150, amount: 150 }],
    subtotal: 150,
    tax: 12,
    discount: 0,
    total: 162,
    currency: 'USD',
    status: 'draft',
    review_note: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  const invoc2 = {
    id: 'invoc-2',
    task_id: 'task-2',
    created_by: 'u-sp-1',
    line_items: [{ description: 'Filter replacement', quantity: 1, unit_price: 45, amount: 45 }],
    subtotal: 45,
    tax: 0,
    discount: 0,
    total: 45,
    currency: 'USD',
    status: 'submitted',
    review_note: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  store.invoices.set('invoc-1', invoc1)
  store.invoices.set('invoc-2', invoc2)

  return store
}
