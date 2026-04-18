import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'
import { createInMemoryStore } from '../../../backend/store.js'

let server
let baseUrl

const pm = { 'X-User-Id': 'u-pm-1', 'Content-Type': 'application/json' }
const sp1 = { 'X-User-Id': 'u-sp-1', 'Content-Type': 'application/json' }
const sp2 = { 'X-User-Id': 'u-sp-2', 'Content-Type': 'application/json' }
const sp3 = { 'X-User-Id': 'u-sp-3', 'Content-Type': 'application/json' }
const tenant = { 'X-User-Id': 'u-tt-1', 'Content-Type': 'application/json' }

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const payload = await response.json()
  return { status: response.status, payload }
}

describe('Marketplace: full PM/PO <-> SP lifecycle', () => {
  let store
  let taskId
  let taskIdWithComments
  let leadId
  let leadWithCommentsId
  let bidId1
  let bidId2
  let convId
  let assignmentId

  beforeAll(async () => {
    store = createInMemoryStore()
    const runtime = createApiServer({ store })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  // ------------------------------------------------------------------
  // 1. Task creation & lead publishing
  // ------------------------------------------------------------------

  it('PM/PO creates a task', async () => {
    const { status, payload } = await call('/tasks', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({
        title: 'Emergency plumbing leak',
        description: 'Water leak under kitchen sink, pipe burst',
        property_id: 'prop-1',
      }),
    })
    expect(status).toBe(200)
    expect(payload.id).toBeTruthy()
    taskId = payload.id
  })

  it('PM/PO publishes task as a lead', async () => {
    const { status, payload } = await call('/leads', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({
        task_id: taskId,
        scope: 'Fix burst pipe, test water flow',
        location: 'San Jose, CA',
        service_area: 'San Jose, CA',
        budget_range: '$250–$600',
        urgency: 'urgent',
        due_date: '2026-03-01',
        visibility_mode: 'public',
      }),
    })
    expect(status).toBe(200)
    expect(payload.lead.id).toBeTruthy()
    expect(payload.lead.status).toBe('open')
    expect(payload.lead.semantic_tags).toContain('plumbing')
    expect(payload.matched_sp_count).toBeGreaterThan(0)
    leadId = payload.lead.id
  })

  it('PM/PO publishes a task lead with comments included', async () => {
    const taskRes = await call('/tasks', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({
        title: 'Broken disposal',
        description: 'Disposal hums and does not spin',
        property_id: 'prop-1',
      }),
    })
    expect(taskRes.status).toBe(200)
    taskIdWithComments = taskRes.payload.id

    const { status, payload } = await call('/leads/from-task', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({
        mx_id: taskIdWithComments,
        task_id: taskIdWithComments,
        task_doc_id: taskIdWithComments,
        title: 'Broken disposal',
        description: 'Disposal hums and does not spin',
        scope: 'Inspect motor and replace if needed',
        comments: [
          {
            comment: 'Please prioritize this task.',
            action_type: 'comment',
            created_at: '2026-03-30T10:00:00.000Z',
            user_name: 'Property Manager',
          },
        ],
      }),
    })
    expect(status).toBe(200)
    expect(payload.lead.comments).toHaveLength(1)
    expect(payload.lead.comment_count).toBe(1)
    leadWithCommentsId = payload.lead.id
  })

  it('rejects duplicate lead for same task', async () => {
    const { status, payload } = await call('/leads', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ task_id: taskId }),
    })
    expect(status).toBe(409)
    expect(payload.error_code).toBe('LEAD_ALREADY_EXISTS')
  })

  it('tenant cannot create a lead', async () => {
    const { status } = await call('/leads', {
      method: 'POST',
      headers: tenant,
      body: JSON.stringify({ task_id: taskId }),
    })
    expect(status).toBe(403)
  })

  // ------------------------------------------------------------------
  // 2. SP views leads (matching & visibility)
  // ------------------------------------------------------------------

  it('SP-1 (plumber) can see the plumbing lead', async () => {
    const { status, payload } = await call('/leads', { headers: sp1 })
    expect(status).toBe(200)
    const found = payload.items.find((l) => l.id === leadId)
    expect(found).toBeTruthy()
    expect(found.status).toBe('open')
  })

  it('SP can view lead comments on task-synced lead detail', async () => {
    const { status, payload } = await call(`/leads/${leadWithCommentsId}`, { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.lead.comments).toHaveLength(1)
    expect(payload.lead.comment_count).toBe(1)
  })

  it('SP can view lead detail', async () => {
    const { status, payload } = await call(`/leads/${leadId}`, { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.lead.id).toBe(leadId)
  })

  it('PM/PO can view matched SPs for a lead', async () => {
    const { status, payload } = await call(`/leads/${leadId}/matched-sps`, { headers: pm })
    expect(status).toBe(200)
    expect(payload.items.length).toBeGreaterThan(0)
    expect(payload.items[0]).toHaveProperty('sp_id')
    expect(payload.items[0]).toHaveProperty('score')
  })

  // ------------------------------------------------------------------
  // 3. SP bidding
  // ------------------------------------------------------------------

  it('SP-1 submits a bid', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp1,
      body: JSON.stringify({
        amount: 450,
        note: 'Can start tomorrow. Includes parts.',
        estimated_duration: '2 hours',
      }),
    })
    expect(status).toBe(200)
    expect(payload.bid.id).toBeTruthy()
    expect(payload.bid.status).toBe('submitted')
    expect(payload.bid.amount).toBe(450)
    bidId1 = payload.bid.id
  })

  it('SP-1 cannot submit a duplicate bid', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp1,
      body: JSON.stringify({ amount: 500, note: 'Revised' }),
    })
    expect(status).toBe(409)
    expect(payload.error_code).toBe('DUPLICATE_BID')
  })

  it('SP-3 submits a bid', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp3,
      body: JSON.stringify({ amount: 380, note: 'Available immediately' }),
    })
    expect(status).toBe(200)
    bidId2 = payload.bid.id
  })

  it('rejects bid with invalid amount', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp2,
      body: JSON.stringify({ amount: 0 }),
    })
    expect(status).toBe(400)
    expect(payload.error_code).toBe('INVALID_AMOUNT')
  })

  it('SP can view own bids', async () => {
    const { status, payload } = await call('/bids', { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.items.length).toBe(1)
    expect(payload.items[0].id).toBe(bidId1)
  })

  it('PM/PO can view all bids for a lead (with SP enrichment)', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, { headers: pm })
    expect(status).toBe(200)
    expect(payload.items.length).toBe(2)
    expect(payload.items[0]).toHaveProperty('sp_business_name')
  })

  it('SP cannot view other SPs bids (no cross-SP bid list)', async () => {
    const { status } = await call(`/leads/${leadId}/bids`, { headers: sp1 })
    expect(status).toBe(403)
  })

  // ------------------------------------------------------------------
  // 4. PM/PO shortlists and communicates
  // ------------------------------------------------------------------

  it('PM/PO shortlists a bid', async () => {
    const { status, payload } = await call(`/bids/${bidId1}/shortlist`, {
      method: 'PATCH',
      headers: pm,
    })
    expect(status).toBe(200)
    expect(payload.bid.status).toBe('shortlisted')
  })

  it('PM/PO starts a conversation with SP-1', async () => {
    const { status, payload } = await call('/conversations', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ lead_id: leadId, sp_id: 'u-sp-1' }),
    })
    expect(status).toBe(200)
    expect(payload.created).toBe(true)
    expect(payload.conversation.participants).toContain('u-pm-1')
    expect(payload.conversation.participants).toContain('u-sp-1')
    convId = payload.conversation.id
  })

  it('re-creating same conversation returns existing', async () => {
    const { status, payload } = await call('/conversations', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ lead_id: leadId, sp_id: 'u-sp-1' }),
    })
    expect(status).toBe(200)
    expect(payload.created).toBe(false)
    expect(payload.conversation.id).toBe(convId)
  })

  it('PM/PO sends a text message', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ body: 'Hi, can you start tomorrow?', message_type: 'text' }),
    })
    expect(status).toBe(200)
    expect(payload.message.sender_role).toBe('pm_po')
    expect(payload.message.visibility).toBe('all')
  })

  it('SP-1 replies in conversation', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, {
      method: 'POST',
      headers: sp1,
      body: JSON.stringify({ body: 'Yes, 9am works for me', message_type: 'text' }),
    })
    expect(status).toBe(200)
    expect(payload.message.sender_role).toBe('sp')
  })

  it('SP-1 sends a quote (auto pm_only visibility)', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, {
      method: 'POST',
      headers: sp1,
      body: JSON.stringify({
        body: 'Here is my formal quote',
        message_type: 'quote',
        quote_data: { amount: 450, note: 'Parts included', valid_until: '2026-03-15' },
      }),
    })
    expect(status).toBe(200)
    expect(payload.message.message_type).toBe('quote')
    expect(payload.message.visibility).toBe('pm_only')
    expect(payload.message.quote_data.amount).toBe(450)
  })

  it('PM/PO sees all messages including quotes', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, { headers: pm })
    expect(status).toBe(200)
    expect(payload.items.length).toBe(3)
    const quoteMsg = payload.items.find((m) => m.message_type === 'quote')
    expect(quoteMsg).toBeTruthy()
    expect(quoteMsg.quote_data.amount).toBe(450)
  })

  it('SP-1 sees only "all" visibility messages (quotes hidden)', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.items.length).toBe(2)
    const quoteMsg = payload.items.find((m) => m.message_type === 'quote')
    expect(quoteMsg).toBeUndefined()
  })

  it('SP-3 cannot read SP-1 conversation', async () => {
    const { status, payload } = await call(`/conversations/${convId}/messages`, { headers: sp3 })
    expect(status).toBe(403)
    expect(payload.error_code).toBe('PERMISSION_DENIED')
  })

  it('PM/PO lists conversations for a lead', async () => {
    const { status, payload } = await call(`/conversations?lead_id=${leadId}`, { headers: pm })
    expect(status).toBe(200)
    expect(payload.items.length).toBeGreaterThanOrEqual(1)
    expect(payload.items[0]).toHaveProperty('sp_business_name')
  })

  // ------------------------------------------------------------------
  // 5. SP selection & assignment
  // ------------------------------------------------------------------

  it('PM/PO selects winning bid -> lead assigned, other bids rejected', async () => {
    const { status, payload } = await call(`/bids/${bidId1}/select`, {
      method: 'POST',
      headers: pm,
    })
    expect(status).toBe(200)
    expect(payload.bid.status).toBe('selected')
    expect(payload.lead.status).toBe('assigned')
    expect(payload.lead.assigned_sp_id).toBe('u-sp-1')
    expect(payload.assignment).toBeTruthy()
    expect(payload.assignment.status).toBe('pending_acceptance')
    assignmentId = payload.assignment.id
  })

  it('other bid is now rejected', async () => {
    const bid2 = store.bids.get(bidId2)
    expect(bid2.status).toBe('rejected')
  })

  it('lead is no longer visible to SPs (not open)', async () => {
    const { payload } = await call('/leads', { headers: sp1 })
    const found = payload.items.find((l) => l.id === leadId)
    expect(found).toBeUndefined()
  })

  it('task has assigned_sp_id set', async () => {
    const { status, payload } = await call(`/tasks/${taskId}`, { headers: pm })
    expect(status).toBe(200)
    expect(payload.assigned_sp_id).toBe('u-sp-1')
  })

  // ------------------------------------------------------------------
  // 6. Assignment acceptance
  // ------------------------------------------------------------------

  it('SP lists own assignments', async () => {
    const { status, payload } = await call('/assignments', { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.items.length).toBe(1)
    expect(payload.items[0].id).toBe(assignmentId)
  })

  it('SP accepts assignment', async () => {
    const { status, payload } = await call(`/assignments/${assignmentId}/accept`, {
      method: 'POST',
      headers: sp1,
    })
    expect(status).toBe(200)
    expect(payload.assignment.status).toBe('active')
  })

  it('PM/PO completes assignment -> lead closed', async () => {
    const { status, payload } = await call(`/assignments/${assignmentId}/complete`, {
      method: 'POST',
      headers: pm,
    })
    expect(status).toBe(200)
    expect(payload.assignment.status).toBe('completed')
    const lead = store.leads.get(leadId)
    expect(lead.status).toBe('closed')
  })
})

// ------------------------------------------------------------------
// State machine edge cases
// ------------------------------------------------------------------

describe('Marketplace: state machine guards', () => {
  let store, taskId, leadId, bidId

  beforeAll(async () => {
    store = createInMemoryStore()
    const runtime = createApiServer({ store })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`

    // Setup: create task -> lead -> bid
    let res = await call('/tasks', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ title: 'Garage door fix', description: 'Torsion spring broken' }),
    })
    taskId = res.payload.id

    res = await call('/leads', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({
        task_id: taskId,
        budget_range: '$150-$300',
        location: 'Santa Clara, CA',
        urgency: 'normal',
      }),
    })
    leadId = res.payload.lead.id

    res = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp1,
      body: JSON.stringify({ amount: 200, note: 'Same day' }),
    })
    bidId = res.payload.bid.id
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('PM/PO can pause a lead', async () => {
    const { status, payload } = await call(`/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: pm,
      body: JSON.stringify({ status: 'paused' }),
    })
    expect(status).toBe(200)
    expect(payload.lead.status).toBe('paused')
  })

  it('cannot bid on paused lead', async () => {
    const { status, payload } = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp3,
      body: JSON.stringify({ amount: 180 }),
    })
    expect(status).toBe(400)
    expect(payload.error_code).toBe('LEAD_NOT_OPEN')
  })

  it('PM/PO can re-open paused lead', async () => {
    const { status, payload } = await call(`/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: pm,
      body: JSON.stringify({ status: 'open' }),
    })
    expect(status).toBe(200)
    expect(payload.lead.status).toBe('open')
  })

  it('SP can withdraw own bid', async () => {
    const { status, payload } = await call(`/bids/${bidId}/withdraw`, {
      method: 'PATCH',
      headers: sp1,
    })
    expect(status).toBe(200)
    expect(payload.bid.status).toBe('withdrawn')
  })

  it('cannot withdraw an already withdrawn bid', async () => {
    const { status, payload } = await call(`/bids/${bidId}/withdraw`, {
      method: 'PATCH',
      headers: sp1,
    })
    expect(status).toBe(400)
    expect(payload.error_code).toBe('INVALID_BID_TRANSITION')
  })

  it('cannot select a withdrawn bid', async () => {
    const { status, payload } = await call(`/bids/${bidId}/select`, {
      method: 'POST',
      headers: pm,
    })
    expect(status).toBe(400)
    expect(payload.error_code).toBe('BID_NOT_SELECTABLE')
  })
})

// ------------------------------------------------------------------
// Assignment decline & revoke flows
// ------------------------------------------------------------------

describe('Marketplace: assignment decline and revoke', () => {
  let store, leadId, bidId, assignmentId

  beforeAll(async () => {
    store = createInMemoryStore()
    const runtime = createApiServer({ store })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`

    let res = await call('/tasks', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ title: 'Paint exterior', description: 'Full repaint needed' }),
    })
    const taskId = res.payload.id

    res = await call('/leads', {
      method: 'POST',
      headers: pm,
      body: JSON.stringify({ task_id: taskId, budget_range: '$2000-$4000', urgency: 'normal' }),
    })
    leadId = res.payload.lead.id

    res = await call(`/leads/${leadId}/bids`, {
      method: 'POST',
      headers: sp3,
      body: JSON.stringify({ amount: 3200, note: 'Full crew' }),
    })
    bidId = res.payload.bid.id

    res = await call(`/bids/${bidId}/select`, { method: 'POST', headers: pm })
    assignmentId = res.payload.assignment.id
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('SP declines assignment -> lead re-opens', async () => {
    const { status, payload } = await call(`/assignments/${assignmentId}/decline`, {
      method: 'POST',
      headers: sp3,
    })
    expect(status).toBe(200)
    expect(payload.assignment.status).toBe('declined')

    const lead = store.leads.get(leadId)
    expect(lead.status).toBe('open')
    expect(lead.assigned_sp_id).toBeNull()
  })
})

// ------------------------------------------------------------------
// SP profile management
// ------------------------------------------------------------------

describe('Marketplace: SP profile', () => {
  beforeAll(async () => {
    const runtime = createApiServer({ store: createInMemoryStore() })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('SP reads own profile', async () => {
    const { status, payload } = await call('/sp/profile', { headers: sp1 })
    expect(status).toBe(200)
    expect(payload.profile.business_name).toBe('FixFast Plumbing')
    expect(payload.profile.match_preferences).toBeTruthy()
  })

  it('SP updates match preferences', async () => {
    const { status, payload } = await call('/sp/profile', {
      method: 'PATCH',
      headers: sp1,
      body: JSON.stringify({
        match_preferences: { min_budget: 100, availability: 'available' },
      }),
    })
    expect(status).toBe(200)
    expect(payload.profile.match_preferences.min_budget).toBe(100)
  })

  it('PM/PO cannot access SP profile endpoint', async () => {
    const { status } = await call('/sp/profile', { headers: pm })
    expect(status).toBe(403)
  })
})
