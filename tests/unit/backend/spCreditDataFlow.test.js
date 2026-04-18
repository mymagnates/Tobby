import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'
import { createInMemoryStore } from '../../../backend/store.js'

let server
let baseUrl

const pm = {
  'Content-Type': 'application/json',
  'X-User-Id': 'u-pm-flow-1',
  'X-User-Role': 'pm_po',
}

const sp = {
  'Content-Type': 'application/json',
  'X-User-Id': 'u-sp-1',
  'X-User-Role': 'sp',
}

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const payload = await response.json()
  return { status: response.status, payload }
}

describe('PO/PM input -> SP credit production and consumption data flow', () => {
  let store
  let taskId
  let leadId
  let orderId

  beforeAll(async () => {
    const runtime = createApiServer({ store: createInMemoryStore() })
    store = runtime.store
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it(
    'creates task and lead from PM/PO input',
    async () => {
      const taskRes = await call('/tasks', {
        method: 'POST',
        headers: pm,
        body: JSON.stringify({
          title: 'Water heater inspection',
          description: 'Need inspection and potential valve replacement.',
          property_id: 'prop-flow-1',
        }),
      })
      expect(taskRes.status).toBe(200)
      taskId = taskRes.payload.id
      expect(taskId).toBeTruthy()

      const leadRes = await call('/leads', {
        method: 'POST',
        headers: pm,
        body: JSON.stringify({
          task_id: taskId,
          scope: 'Inspect and provide repair estimate.',
          location: 'San Jose, CA',
          service_area: 'San Jose, CA',
          budget_range: '$150-$450',
          urgency: 'normal',
          visibility_mode: 'public',
        }),
      })
      expect(leadRes.status).toBe(200)
      leadId = leadRes.payload.lead.id
      expect(leadRes.payload.lead.status).toBe('open')
    },
    30000
  )

  it('grants starter credits on first summary', async () => {
    const summaryRes = await call('/sp/credits/summary', {
      headers: sp,
    })
    expect(summaryRes.status).toBe(200)
    expect(summaryRes.payload.sp_id).toBe('u-sp-1')
    expect(summaryRes.payload.balance).toBe(3)
    expect(summaryRes.payload.lifetime_granted).toBe(3)
    expect(summaryRes.payload.lifetime_purchased).toBe(0)
  })

  it('produces SP credit data via order + paid callback', async () => {
    const orderRes = await call('/sp/credits/orders', {
      method: 'POST',
      headers: {
        ...sp,
        'Idempotency-Key': 'order-flow-1',
      },
      body: JSON.stringify({
        package_id: 'pkg-5',
        credits: 5,
        amount: 19.99,
        currency: 'USD',
        provider: 'manual_placeholder',
      }),
    })
    expect(orderRes.status).toBe(200)
    expect(orderRes.payload.order.status).toBe('pending')
    orderId = orderRes.payload.order.id

    const paidRes = await call('/sp/credits/payments/callback', {
      method: 'POST',
      headers: sp,
      body: JSON.stringify({
        order_id: orderId,
        status: 'paid',
        provider_txn_id: 'txn-flow-1',
      }),
    })
    expect(paidRes.status).toBe(200)
    expect(paidRes.payload.order_id).toBe(orderId)
    expect(paidRes.payload.credited).toBe(5)
    expect(paidRes.payload.balance_after).toBe(8)
  })

  it('shows produced credit data in SP summary', async () => {
    const summaryRes = await call('/sp/credits/summary', {
      headers: sp,
    })
    expect(summaryRes.status).toBe(200)
    expect(summaryRes.payload.sp_id).toBe('u-sp-1')
    expect(summaryRes.payload.balance).toBe(8)
    expect(summaryRes.payload.lifetime_purchased).toBe(5)
    expect(summaryRes.payload.lifetime_used).toBe(0)
    expect(summaryRes.payload.lifetime_granted).toBe(3)
  })

  it('consumes credits when SP submits a bid', async () => {
    const bidRes = await call('/sp/bids', {
      method: 'POST',
      headers: {
        ...sp,
        'Idempotency-Key': 'bid-flow-1',
      },
      body: JSON.stringify({
        lead_id: leadId,
        amount: 320,
        note: 'Can complete in one visit.',
      }),
    })
    expect(bidRes.status).toBe(200)
    expect(bidRes.payload.bid.status).toBe('submitted')
    expect(bidRes.payload.credit_cost).toBe(1)
    expect(bidRes.payload.credits_balance).toBe(7)
  })

  it('reflects consumption in summary/history', async () => {
    const summaryRes = await call('/sp/credits/summary', {
      headers: sp,
    })
    expect(summaryRes.status).toBe(200)
    expect(summaryRes.payload.balance).toBe(7)
    expect(summaryRes.payload.lifetime_purchased).toBe(5)
    expect(summaryRes.payload.lifetime_used).toBe(1)
    expect(summaryRes.payload.lifetime_granted).toBe(3)

    const historyRes = await call('/sp/credits/history?limit=20', {
      headers: sp,
    })
    expect(historyRes.status).toBe(200)

    const grantEntry = historyRes.payload.items.find(
      (row) => row.entry_type === 'grant' && row.delta === 3
    )
    expect(grantEntry).toBeTruthy()

    const purchaseEntry = historyRes.payload.items.find(
      (row) => row.source_id === orderId && row.entry_type === 'purchase'
    )
    expect(purchaseEntry).toBeTruthy()
    expect(purchaseEntry.delta).toBe(5)

    const consumeEntry = historyRes.payload.items.find(
      (row) => row.entry_type === 'bid_use' && row.source_type === 'bid'
    )
    expect(consumeEntry).toBeTruthy()
    expect(consumeEntry.delta).toBe(-1)

    const paidOrder = historyRes.payload.orders.find((row) => row.id === orderId)
    expect(paidOrder).toBeTruthy()
    expect(paidOrder.status).toBe('paid')
  })

  it('awards one free credit after a week elapses', async () => {
    const account = store.spCreditAccounts.get('u-sp-1')
    expect(account).toBeTruthy()
    account.last_free_credit_at = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()

    const summaryRes = await call('/sp/credits/summary', {
      headers: sp,
    })
    expect(summaryRes.status).toBe(200)
    expect(summaryRes.payload.balance).toBe(8)
    expect(summaryRes.payload.lifetime_granted).toBe(4)

    const historyRes = await call('/sp/credits/history?limit=20', {
      headers: sp,
    })
    expect(historyRes.status).toBe(200)
    const weeklyGrant = historyRes.payload.items.find(
      (row) => row.entry_type === 'grant' && row.delta === 1 && row.source_id === 'weekly'
    )
    expect(weeklyGrant).toBeTruthy()
  })
})
