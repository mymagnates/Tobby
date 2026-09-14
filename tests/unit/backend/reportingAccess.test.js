// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { createReportingAccess } from '../../../backend/reportingAccess.js'

function database() {
  const records = new Map()
  const snap = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    ref: { path },
    data: () => records.get(path),
  })
  const query = (path, filters = [], limit = Infinity, group = false) => ({
    doc: (key) => ({
      path: `${path}/${key}`,
      get: async () => snap(`${path}/${key}`),
      set: async (data) => records.set(`${path}/${key}`, data),
      collection: (child) => query(`${path}/${key}/${child}`),
    }),
    where: (field, operator, value) =>
      query(path, [...filters, [field, operator, value]], limit, group),
    limit: (count) => query(path, filters, count, group),
    get: async () => ({
      docs: [...records.keys()]
        .filter((key) => {
          const parts = key.split('/')
          if (group ? parts.at(-2) !== path : parts.slice(0, -1).join('/') !== path) return false
          return filters.every(([field, op, value]) =>
            op === 'array-contains'
              ? records.get(key)[field]?.includes(value)
              : records.get(key)[field] === value,
          )
        })
        .slice(0, limit)
        .map(snap),
    }),
  })
  return {
    records,
    collection: (path) => query(path),
    collectionGroup: (name) => query(name, [], Infinity, true),
    runTransaction: async (fn) => {
      const writes = []
      const result = await fn({
        get: async (ref) => snap(ref.path),
        set: (ref, data) => writes.push(() => records.set(ref.path, data)),
      })
      writes.forEach((write) => write())
      return result
    },
  }
}

let db, reports
const context = (user = 'pm1', params = {}) => ({
  actor: { id: user },
  verified: true,
  query: new URLSearchParams(params),
})
const property = (owners = ['owner1'], managers = ['pm1'], viewers = ['viewer']) => ({
  nickname: 'Garden House',
  owner_user_ids: owners,
  manager_user_ids: managers,
  viewer_user_ids: viewers,
})
const transaction = (overrides = {}) => ({
  amount: 100,
  financial_category: 'management_fee',
  transac_type: 'Management Fee',
  transac_date: '2026-09-01',
  transac_from: 'po',
  transac_to: 'pm',
  to_account_id: 'pm1',
  ...overrides,
})
beforeEach(() => {
  db = database()
  reports = createReportingAccess({ getDb: () => db })
  db.records.set('properties/p1', property())
  db.records.set('properties/p2', {
    ...property(['owner2'], ['pm2'], []),
    nickname: 'Private property',
  })
  db.records.set('users/pm1', { account_type: 'pm', company_name: 'Example Management' })
  db.records.set('users/pm2', { account_type: 'pm', company_name: 'Example Management' })
  db.records.set('properties/p1/transactions/fee', transaction())
  db.records.set('properties/p2/transactions/fee', transaction({ to_account_id: 'pm2' }))
  db.records.set('properties/p1/mxrecords/task1', {
    description: 'Repair tap',
    status: 'open',
    report_date: '2026-09-01',
  })
})

describe('Server-authorized reporting', () => {
  it('durably deduplicates transaction retries and rejects changed payload', async () => {
    const input = {
      ...context(), params: { propertyId: 'p1' }, body: transaction(),
      req: { headers: { 'idempotency-key': 'transaction-retry-1' } },
    }
    const first = await reports.createTransaction(input)
    const retry = await createReportingAccess({ getDb: () => db }).createTransaction(input)
    expect(retry).toEqual(first)
    expect([...db.records.keys()].filter((key) => key.startsWith('properties/p1/transactions/'))).toHaveLength(2)
    await expect(reports.createTransaction({ ...input, body: transaction({ amount: 200 }) })).rejects.toMatchObject({ status: 409 })
    db.records.set('properties/p1', property([], [], []))
    await expect(reports.createTransaction(input)).rejects.toMatchObject({ status: 403 })
  })
  it('requires verified identity on every new reporting operation', async () => {
    for (const key of ['options', 'workspace', 'participants', 'createTransaction']) {
      await expect(reports[key]({ ...context(), verified: false })).rejects.toMatchObject({
        status: 401,
      })
    }
  })
  it('returns only membership properties and uses company name only as account label', async () => {
    const result = await reports.options(context())
    expect(result.properties.map((row) => row.id)).toEqual(['p1'])
    expect(result.account).toMatchObject({
      id: 'pm1',
      label: 'Example Management',
      can_pm_statement: true,
    })
    const statement = await reports.workspace(context('pm1', { type: 'pm_statement' }))
    expect(statement.rows).toHaveLength(1)
    expect(statement.summary.managementFees).toBe(100)
  })
  it('gives owner and PM identical property figures', async () => {
    const pm = await reports.workspace(context('pm1', { type: 'pnl', property_ids: 'p1' }))
    const owner = await reports.workspace(context('owner1', { type: 'pnl', property_ids: 'p1' }))
    expect(pm).toEqual(owner)
    expect(pm.summary.expenses).toBe(100)
  })
  it('allows viewer task history but denies financial reports, participant lists and writes', async () => {
    expect((await reports.options(context('viewer'))).properties[0].can_finance).toBe(false)
    expect(
      (await reports.workspace(context('viewer', { type: 'tasks', property_ids: 'p1' }))).rows,
    ).toHaveLength(1)
    for (const type of ['pnl', 'ledger', 'pm_statement']) {
      await expect(
        reports.workspace(context('viewer', { type, property_ids: 'p1' })),
      ).rejects.toMatchObject({ status: 403 })
    }
    await expect(
      reports.participants(context('viewer', { property_id: 'p1' })),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      reports.createTransaction({
        ...context('viewer'),
        params: { propertyId: 'p1' },
        body: transaction(),
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
  it('rejects inaccessible, mixed and empty explicit scope instead of falling back to all', async () => {
    for (const ids of ['p2', 'p1,p2', 'missing', '']) {
      await expect(
        reports.workspace(context('pm1', { type: 'ledger', property_ids: ids })),
      ).rejects.toHaveProperty('status', ids ? 403 : 400)
    }
  })
  it('uses authoritative membership arrays, not legacy role mirrors', async () => {
    db.records.set('users/outsider/roles/old', { property_id: 'p1', role: 'pm', status: 'active' })
    expect((await reports.options(context('outsider'))).properties).toEqual([])
    await expect(
      reports.workspace(context('outsider', { property_ids: 'p1' })),
    ).rejects.toMatchObject({ status: 403 })
  })
  it('overrides spoofed row property ids and excludes other account and un-attributed PM flows', async () => {
    db.records.set(
      'properties/p1/transactions/fee',
      transaction({ property_id: 'p2', id: 'spoofed' }),
    )
    db.records.set(
      'properties/p1/transactions/legacy',
      transaction({ to_account_id: null, created_by: 'pm1' }),
    )
    const ledger = await reports.workspace(context('pm1', { type: 'ledger' }))
    expect(ledger.rows.every((row) => row.property_id === 'p1')).toBe(true)
    const statement = await reports.workspace(context('pm1', { type: 'pm_statement' }))
    expect(statement.rows).toHaveLength(1)
    expect(statement.warnings.join(' ')).toContain('role-only')
  })
  it('preserves own historical statement rows without reopening the property', async () => {
    db.records.set('properties/p1', property(['owner1'], ['pm2'], []))
    expect((await reports.options(context())).properties).toEqual([])
    expect((await reports.workspace(context('pm1', { type: 'pm_statement' }))).rows).toHaveLength(1)
    await expect(
      reports.workspace(context('pm1', { type: 'ledger', property_ids: 'p1' })),
    ).rejects.toMatchObject({ status: 403 })
  })
  it('never exposes profiles outside the selected property manager list', async () => {
    expect(await reports.participants(context('owner1', { property_id: 'p1' }))).toEqual({
      participants: [{ id: 'pm1', role: 'pm', label: 'Example Management' }],
    })
    await expect(reports.participants(context('pm1', { property_id: 'p2' }))).rejects.toMatchObject(
      { status: 403 },
    )
  })
  it('persists validated account attribution with server-owned audit fields', async () => {
    const result = await reports.createTransaction({
      ...context(),
      params: { propertyId: 'p1' },
      body: transaction({ property_id: 'p2', created_by: 'outsider', role: 'admin' }),
    })
    expect(db.records.get(`properties/p1/transactions/${result.id}`)).toMatchObject({
      property_id: 'p1',
      created_by: 'pm1',
      role: 'pm',
      to_account_id: 'pm1',
      attribution_version: 1,
    })
  })
  it.each([
    { amount: -1 },
    { amount: 'abc' },
    { amount: 1.234 },
    { amount: 1.000000001 },
    { amount: true },
    { amount: [100] },
    { amount: '90071992547409.91' },
    { transac_date: '2026-02-30' },
    { transac_date: '2026-13-01' },
    { currency: 'EUR' },
    { financial_category: 'made_up' },
    { to_account_id: 'pm2' },
    { to_account_id: null },
    { transac_to: 'admin' },
  ])('rejects invalid or foreign transaction values %j', async (patch) => {
    await expect(
      reports.createTransaction({
        ...context(),
        params: { propertyId: 'p1' },
        body: transaction(patch),
      }),
    ).rejects.toMatchObject({ status: 400 })
    expect(
      [...db.records.keys()].filter((key) => key.startsWith('properties/p1/transactions/')),
    ).toHaveLength(1)
  })
  it('fails closed when storage is unavailable; never returns sample report data', async () => {
    reports = createReportingAccess({
      getDb: () => {
        throw new Error('storage offline')
      },
    })
    await expect(reports.workspace(context())).rejects.toThrow('storage offline')
  })
})
