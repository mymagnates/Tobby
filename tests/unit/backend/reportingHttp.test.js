// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'

let runtime
beforeEach(() => {
  const collection = () => ({
    where: () => collection(),
    limit: () => collection(),
    get: async () => ({ docs: [] }),
    doc: () => ({ get: async () => ({ exists: true, data: () => ({ account_type: 'pm' }) }), collection }),
  })
  runtime = createApiServer({
    config: {
      firestoreDb: {
        collection,
        collectionGroup: collection,
        runTransaction: async (fn) => fn({ get: (ref) => ref.get() }),
      },
      firebaseAuth: {
        verifyIdToken: async (token) => {
          if (token !== 'valid-report-token') throw new Error('invalid token')
          return { uid: 'verified-pm', role: 'pm' }
        },
      },
    },
  })
})
afterEach(() => runtime.dispose())
const request = async (url, { token = '', method = 'GET', body = {} } = {}) => {
  let status, payload
  await runtime.handler(
    {
      url,
      method,
      body,
      headers: {
        'x-user-id': 'forged-user',
        'x-user-role': 'admin',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    },
    {
      writeHead: (value) => {
        status = value
      },
      end: (value) => {
        payload = JSON.parse(value)
      },
    },
  )
  return { status, payload }
}
describe('Reporting HTTP boundary', () => {
  it.each([
    ['GET', '/leases/l1/inventory-workflow'],
    ['GET', '/leases/l1/inventory-workflow/history'],
    ['POST', '/leases/l1/inventory-workflow/commands'],
  ])('protects inventory %s %s', async (method, path) => {
    expect((await request(path, { method })).status).toBe(401)
  })
  it.each(['GET', 'POST'])('protects the canonical task comments %s route', async (method) => {
    expect((await request('/properties/p1/mxrecords/t1/comments', { method })).status).toBe(401)
    if (method === 'GET') expect((await request('/properties/p1/mxrecords/t1/comments', { method, token: 'valid-report-token' })).status).toBe(403)
  })
  it.each(['/properties/p1/deposits', '/properties/p1/leases/l1/deposit'])(
    'protects the deposit read route %s',
    async (path) => {
      expect((await request(path)).status).toBe(401)
      expect((await request(path, { token: 'valid-report-token' })).status).toBe(403)
    },
  )
  it('requires verified identity for deposit writes', async () => {
    expect(
      (await request('/properties/p1/leases/l1/deposit/entries', { method: 'POST' })).status,
    ).toBe(401)
  })
  it.each([
    '/reports/options',
    '/reports/workspace',
    '/reports/participants?property_id=p1',
    '/reports/task-status',
    '/reports/income-expense',
  ])('rejects forged header identity at %s', async (path) => {
    expect((await request(path)).status).toBe(401)
    expect((await request(path, { token: 'invalid' })).status).toBe(401)
  })
  it('rejects an unauthenticated transaction write', async () => {
    expect((await request('/properties/p1/report-transactions', { method: 'POST' })).status).toBe(
      401,
    )
  })
  it('uses the verified account identity rather than user headers', async () => {
    const { status, payload } = await request('/reports/options', { token: 'valid-report-token' })
    expect(status).toBe(200)
    expect(payload.account.id).toBe('verified-pm')
    expect(payload.properties).toEqual([])
    expect(payload.request_id).toEqual(expect.any(String))
  })
  it('rejects an unknown report type with structured 400 error', async () => {
    const result = await request('/reports/workspace?type=unknown', { token: 'valid-report-token' })
    expect(result.status).toBe(400)
    expect(result.payload.error_code).toBe('INVALID_REPORT_TYPE')
  })
  it.each(['from=2026-02-30', 'from=2026-09-10&to=2026-09-09'])(
    'rejects invalid periods with a client error: %s',
    async (period) => {
      const result = await request(`/reports/workspace?type=pm_statement&${period}`, {
        token: 'valid-report-token',
      })
      expect(result.status).toBe(400)
      expect(result.payload.error_code).toBe('INVALID_REPORT_PERIOD')
    },
  )
  it.each(['/reports/annual-tax-finance', '/reports/occupancy-lease'])(
    'does not serve sample financial/occupancy data at %s',
    async (path) => {
      const result = await request(path)
      expect(result.status).toBe(410)
      expect(result.payload).not.toHaveProperty('rows')
    },
  )
})
