// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDepositService,
  applyDepositEntry,
  depositSummary,
} from '../../../backend/deposits.js'
import { buildPropertyReport } from '../../../backend/reporting.js'

function database() {
  const records = new Map()
  const snap = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    data: () => structuredClone(records.get(path)),
  })
  const doc = (path) => ({
    path,
    get: async () => snap(path),
    collection: (child) => query(`${path}/${child}`),
  })
  const query = (path, filter = [], limit = Infinity) => ({
    doc: (id) => doc(`${path}/${id}`),
    where: (key, op, value) => query(path, [...filter, [key, value]], limit),
    limit: (size) => query(path, filter, size),
    get: async () => ({
      docs: [...records.keys()]
        .filter(
          (k) =>
            k.split('/').slice(0, -1).join('/') === path &&
            filter.every(([key, value]) => records.get(k)[key] === value),
        )
        .slice(0, limit)
        .map(snap),
    }),
  })
  let queue = Promise.resolve()
  return {
    records,
    collection: query,
    runTransaction: (fn) => {
      const run = queue.then(async () => {
        const pending = []
        const result = await fn({
          get: (ref) => ref.get(),
          set: (ref, data) => pending.push([ref.path, structuredClone(data)]),
        })
        pending.forEach(([path, value]) => records.set(path, value))
        return result
      })
      queue = run.catch(() => {})
      return run
    },
  }
}
let db, service, n
const ctx = (body = {}, leaseId = 'l1', uid = 'pm') => ({
  verified: true,
  actor: { id: uid },
  params: { propertyId: 'p1', leaseId },
  body,
})
const post = (action, amount, version, more = {}, leaseId = 'l1') =>
  service.postEntry(
    ctx(
      {
        action,
        amount,
        expected_version: version,
        operation_id: `op-${++n}`,
        date: '2026-09-09',
        note: 'Receipt or payment reference',
        ...more,
      },
      leaseId,
    ),
  )
beforeEach(() => {
  db = database()
  service = createDepositService({ getDb: () => db })
  n = 0
  db.records.set('properties/p1', {
    owner_user_ids: ['owner'],
    manager_user_ids: ['pm'],
    viewer_user_ids: ['viewer'],
  })
  db.records.set('leases/l1', {
    property_string_id: 'p1',
    LSID: 'Lease One',
    deposit: 1000,
    status: 'Rented',
  })
  db.records.set('leases/l2', { property_string_id: 'p1', deposit: 500, status: 'Rented' })
  db.records.set('leases/foreign', { property_string_id: 'p2', deposit: 1000 })
})
describe('deposit balances', () => {
  it('treats the agreed lease deposit as required, not already collected', async () => {
    expect((await service.getLease(ctx())).summary).toMatchObject({
      expected: 1000,
      received: 0,
      balance: 0,
      status: 'not_received',
    })
  })
  it('records receipt, deduction, refund and explicit settlement without P&L duplication', async () => {
    expect((await post('receipt', 1000, 0)).summary.balance).toBe(1000)
    expect(
      (await post('deduction', 200, 1, { reason: 'repair', accounting_confirmed: true })).summary
        .balance,
    ).toBe(800)
    const refunded = await post('refund', 800, 2)
    expect(refunded.summary).toMatchObject({
      received: 1000,
      refunded: 800,
      deducted: 200,
      balance: 0,
      status: 'pending_settlement',
    })
    expect((await post('settle', null, 3, { reconciliation_confirmed: true })).summary.status).toBe(
      'settled',
    )
    const transactions = [...db.records.entries()]
      .filter(([path]) => path.startsWith('properties/p1/transactions/'))
      .map(([path, row]) => ({ ...row, id: path }))
    expect(
      buildPropertyReport({ type: 'pnl', properties: [{ id: 'p1' }], transactions }).summary.net,
    ).toBe(0)
    expect(
      buildPropertyReport({ type: 'ledger', properties: [{ id: 'p1' }], transactions }).rows,
    ).toHaveLength(3)
  })
  it('rejects over-refunds and preserves all balances on failure', async () => {
    await post('receipt', 100, 0)
    await expect(post('refund', 101, 1)).rejects.toMatchObject({ code: 'INSUFFICIENT_DEPOSIT' })
    expect((await service.getLease(ctx())).summary.balance).toBe(100)
    expect((await service.getLease(ctx())).entries).toHaveLength(1)
  })
  it('never clears the balance when a lease ends', async () => {
    await post('receipt', 100, 0)
    db.records.get('leases/l1').status = 'Archived'
    expect((await service.getLease(ctx())).summary).toMatchObject({
      balance: 100,
      status: 'pending_settlement',
    })
  })
  it('keeps correction history and prevents double reversal or reversing spent receipts', async () => {
    const receipt = await post('receipt', 100, 0)
    const refund = await post('refund', 80, 1)
    await expect(
      post('reversal', null, 2, { reverses_id: receipt.entries[0].id }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_DEPOSIT' })
    const corrected = await post('reversal', null, 2, { reverses_id: refund.entries[1].id })
    expect(corrected.summary).toMatchObject({ balance: 100, refunded: 0 })
    expect(corrected.entries[1].reversed).toBe(true)
    await expect(
      post('reversal', null, 3, { reverses_id: refund.entries[1].id }),
    ).rejects.toMatchObject({ code: 'INVALID_REVERSAL' })
  })
  it('requires zero balance and reconciliation before settlement, then locks until reopened', async () => {
    await expect(post('settle', null, 0)).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' })
    await post('receipt', 100, 0)
    await expect(post('settle', null, 1, { reconciliation_confirmed: true })).rejects.toMatchObject(
      { code: 'DEPOSIT_HAS_BALANCE' },
    )
    await post('refund', 100, 1)
    await post('settle', null, 2, { reconciliation_confirmed: true })
    await expect(post('receipt', 10, 3)).rejects.toMatchObject({ code: 'DEPOSIT_SETTLED' })
    await post('reopen', null, 3)
    expect((await post('receipt', 10, 4)).summary.balance).toBe(10)
  })
  it('deduplicates retries and rejects operation-ID reuse with different content', async () => {
    const body = {
      action: 'receipt',
      amount: 100,
      expected_version: 0,
      operation_id: 'retry-id',
      date: '2026-09-09',
      note: 'Bank transfer',
    }
    await service.postEntry(ctx(body))
    await service.postEntry(ctx(body))
    expect((await service.getLease(ctx())).summary.received).toBe(100)
    await expect(service.postEntry(ctx({ ...body, amount: 200 }))).rejects.toMatchObject({
      code: 'OPERATION_CONFLICT',
    })
  })
  it('allows only one competing refund from the same version', async () => {
    await post('receipt', 100, 0)
    const results = await Promise.allSettled([post('refund', 80, 1), post('refund', 80, 1)])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect((await service.getLease(ctx())).summary.balance).toBe(20)
  })
  it.each([0, -1, 0.001, true, 'abc', Infinity])(
    'rejects invalid monetary value %s',
    async (amount) => {
      await expect(post('receipt', amount, 0)).rejects.toMatchObject({ status: 400 })
      expect((await service.getLease(ctx())).summary.version).toBe(0)
    },
  )
  it('requires a purpose and explicit separate-accounting confirmation for deductions', async () => {
    await post('receipt', 100, 0)
    await expect(post('deduction', 10, 1, { reason: 'rent' })).rejects.toMatchObject({
      code: 'DEDUCTION_REVIEW_REQUIRED',
    })
  })
  it('handles decimal cents without drift', () => {
    let state = applyDepositEntry({}, { action: 'receipt', amount_cents: 10 })
    state = applyDepositEntry(state, { action: 'receipt', amount_cents: 20 })
    expect(depositSummary({ id: 'l1', deposit: 1 }, state).balance).toBe(0.3)
  })
})
describe('deposit permissions and legacy association', () => {
  it.each(['viewer', 'stranger'])('denies both read and write to %s', async (uid) => {
    await expect(service.getProperty(ctx({}, 'l1', uid))).rejects.toMatchObject({ status: 403 })
    await expect(service.getLease(ctx({}, 'l1', uid))).rejects.toMatchObject({ status: 403 })
    await expect(
      service.postEntry(
        ctx(
          {
            action: 'receipt',
            amount: 10,
            date: '2026-09-09',
            operation_id: 'x',
            expected_version: 0,
            note: 'Bank',
          },
          'l1',
          uid,
        ),
      ),
    ).rejects.toMatchObject({ status: 403 })
  })
  it('allows owners, rejects forged identities and foreign leases', async () => {
    expect((await service.getLease(ctx({}, 'l1', 'owner'))).summary.lease_id).toBe('l1')
    await expect(service.getLease({ ...ctx(), verified: false })).rejects.toMatchObject({
      status: 401,
    })
    await expect(service.getLease(ctx({}, 'foreign'))).rejects.toMatchObject({ status: 403 })
  })
  it('imports a legacy receipt once without creating another transaction', async () => {
    db.records.set('properties/p1/transactions/legacy', {
      amount: 1000,
      transac_type: 'Deposit',
      transac_date: '2026-09-01',
    })
    expect((await service.getProperty(ctx())).unlinked).toHaveLength(1)
    await post('import', null, 0, { source_transaction_id: 'legacy' })
    expect((await service.getLease(ctx())).summary.balance).toBe(1000)
    expect((await service.getProperty(ctx())).unlinked).toHaveLength(0)
    expect(
      [...db.records.keys()].filter((k) => k.startsWith('properties/p1/transactions/')),
    ).toHaveLength(1)
    await expect(
      post('import', null, 0, { source_transaction_id: 'legacy' }, 'l2'),
    ).rejects.toMatchObject({ code: 'INVALID_SOURCE' })
  })
  it('imports an explicit deposit refund only against sufficient held funds without duplicating it', async () => {
    db.records.set('properties/p1/transactions/refund', {
      amount: 100,
      transac_type: 'Refund',
      financial_category: 'security_deposit',
      transac_date: '2026-09-01',
    })
    expect((await service.getProperty(ctx())).unlinked[0].importable).toBe(true)
    await expect(
      post('import', null, 0, { source_transaction_id: 'refund' }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_DEPOSIT' })
    await post('receipt', 100, 0)
    await post('import', null, 1, { source_transaction_id: 'refund' })
    expect((await service.getLease(ctx())).summary).toMatchObject({ balance: 0, refunded: 100 })
    expect(
      [...db.records.keys()].filter((k) => k.startsWith('properties/p1/transactions/')),
    ).toHaveLength(2)
  })
  it('corrects a mistaken legacy association and relinks it without changing cash transactions', async () => {
    db.records.set('properties/p1/transactions/legacy', {
      amount: 1000,
      transac_type: 'Deposit',
      transac_date: '2026-09-01',
    })
    const linked = await post('import', null, 0, { source_transaction_id: 'legacy' })
    await post('reversal', null, 1, { reverses_id: linked.entries[0].id })
    expect((await service.getProperty(ctx())).unlinked).toHaveLength(1)
    await post('import', null, 0, { source_transaction_id: 'legacy' }, 'l2')
    expect((await service.getLease(ctx())).summary.balance).toBe(0)
    expect((await service.getLease(ctx({}, 'l2'))).summary.balance).toBe(1000)
    expect((await service.getProperty(ctx())).unlinked).toHaveLength(0)
    expect(
      [...db.records.keys()].filter((k) => k.startsWith('properties/p1/transactions/')),
    ).toHaveLength(1)
    await expect(
      post('reversal', null, 2, { reverses_id: linked.entries[0].id }),
    ).rejects.toMatchObject({ code: 'INVALID_REVERSAL' })
  })
  it('leaves ambiguous deposit categories for review instead of guessing cash direction', async () => {
    db.records.set('properties/p1/transactions/ambiguous', {
      amount: 100,
      transac_type: 'Other',
      financial_category: 'security_deposit',
      transac_date: '2026-09-01',
    })
    expect((await service.getProperty(ctx())).unlinked[0].importable).toBe(false)
    await expect(
      post('import', null, 0, { source_transaction_id: 'ambiguous' }),
    ).rejects.toMatchObject({ code: 'INVALID_SOURCE' })
  })
})
