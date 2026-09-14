import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { transactionReportRevision } from '../../../src/services/reportingChanges'
const { user, auth } = vi.hoisted(() => {
  const user = { uid: 'pm1', getIdToken: vi.fn() }
  return { user, auth: { currentUser: user } }
})
vi.mock('src/boot/firebase', () => ({ auth, authStateReady: Promise.resolve() }))
import {
  getReportingOptions,
  getWorkspaceReport,
  reportToCsv,
  groupPnlRows,
} from '../../../src/services/reportingApi'
import {
  getReportParticipants,
  createReportTransaction,
} from '../../../src/services/reportTransactionApi'

const summary = {
  income: 0,
  expenses: 0,
  net: 0,
  inflow: 0,
  outflow: 0,
  managementFees: 0,
  taskCount: 0,
  openTasks: 0,
  completedTasks: 0,
}
const result = (type = 'pnl') => ({
  type,
  currency: 'USD',
  basis: 'Recorded basis',
  rows: [],
  summary: { ...summary },
  property_totals: [],
  warnings: [],
  excluded_count: 0,
})
const query = { type: 'pnl', property_ids: ['p1'], from: '2026-09-01', to: '2026-09-30' }
const respond = (payload, status = 200) =>
  fetch.mockResolvedValue({ ok: status < 400, status, json: async () => payload })

describe('authenticated reporting services', () => {
  it('explains a missing deployment without exposing the raw API route error', async () => {
    respond({ error_code: 'NOT_FOUND', message: 'API route not found' }, 404)
    await expect(getReportingOptions()).rejects.toMatchObject({
      status: 404,
      code: 'REPORT_API_NOT_DEPLOYED',
      message: expect.stringContaining('service has been updated'),
    })
  })
  beforeEach(() => {
    auth.currentUser = user
    user.getIdToken.mockReset().mockResolvedValue('test-token')
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
  it('sends bearer identity and the exact selected scope', async () => {
    respond(result())
    await getWorkspaceReport(query)
    const [url, options] = fetch.mock.calls[0]
    expect(new URL(url, 'http://test').searchParams.get('property_ids')).toBe('p1')
    expect(options.headers.Authorization).toBe('Bearer test-token')
    expect(options.cache).toBe('no-store')
  })
  it('includes optional PM scope but omits it for all historic account properties', async () => {
    respond(result('pm_statement'))
    await getWorkspaceReport({ ...query, type: 'pm_statement', property_ids: ['p2'] })
    expect(fetch.mock.calls[0][0]).toContain('property_ids=p2')
    await getWorkspaceReport({ ...query, type: 'pm_statement', property_ids: [] })
    expect(fetch.mock.calls[1][0]).not.toContain('property_ids')
  })
  it.each([
    { type: 'other' },
    { from: '2026-02-30' },
    { from: '2026-10-01' },
    { property_ids: [] },
    { property_ids: ['p1/p2'] },
    { property_ids: ['p1,p2'] },
  ])('rejects malformed scope before fetch: %j', async (override) => {
    await expect(getWorkspaceReport({ ...query, ...override })).rejects.toThrow()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('does not replace a server permission error with empty data', async () => {
    respond({ message: 'Access revoked', error_code: 'REPORT_ACCESS_DENIED' }, 403)
    await expect(getWorkspaceReport(query)).rejects.toMatchObject({
      status: 403,
      message: 'Access revoked',
    })
  })
  it.each([
    null,
    {},
    { ...result(), summary: {} },
    { ...result(), type: 'tasks' },
    { ...result(), rows: [{}] },
  ])('fails closed for malformed success data', async (payload) => {
    respond(payload)
    await expect(getWorkspaceReport(query)).rejects.toThrow()
  })
  it('requires authentication', async () => {
    auth.currentUser = null
    await expect(getReportingOptions()).rejects.toMatchObject({ status: 401 })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('ignores a response after account switching', async () => {
    fetch.mockImplementation(async () => {
      auth.currentUser = { uid: 'other' }
      return { ok: true, json: async () => result() }
    })
    await expect(getWorkspaceReport(query)).rejects.toMatchObject({ status: 401 })
  })
  it('cancels a pending token wait', async () => {
    user.getIdToken.mockReturnValue(new Promise(() => {}))
    const controller = new AbortController()
    const assertion = expect(
      getWorkspaceReport(query, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
    expect(fetch).not.toHaveBeenCalled()
  })
  it('times out instead of spinning forever on authentication', async () => {
    vi.useFakeTimers()
    user.getIdToken.mockReturnValue(new Promise(() => {}))
    const assertion = expect(getWorkspaceReport(query)).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(30001)
    await assertion
  })
  it('uses the authenticated write endpoint with explicit account IDs', async () => {
    respond({ id: 't1' })
    const revision = transactionReportRevision.value
    await createReportTransaction('p1', { amount: 50, to_account_id: 'pm1' })
    expect(transactionReportRevision.value).toBe(revision + 1)
    expect(fetch.mock.calls[0][0]).toBe('/api/properties/p1/report-transactions')
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { Authorization: 'Bearer test-token' },
    })
  })
  it('does not write under a session changed during token acquisition', async () => {
    user.getIdToken.mockImplementation(async () => {
      auth.currentUser = null
      return 'old-token'
    })
    await expect(createReportTransaction('p1', {})).rejects.toThrow('session changed')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('does not accept a missing participant response or unconfirmed write', async () => {
    respond({})
    const revision = transactionReportRevision.value
    await expect(getReportParticipants('p1')).rejects.toThrow('manager accounts')
    await expect(createReportTransaction('p1', {})).rejects.toThrow('Check transactions')
    expect(transactionReportRevision.value).toBe(revision)
  })
})

describe('report export', () => {
  it('matches displayed P&L grouping and carries scope, totals and data notes', () => {
    const report = {
      ...result(),
      rows: [
        { category: 'rental_income', income: 0.1, expense: 0 },
        { category: 'rental_income', income: 0.2, expense: 0 },
      ],
      summary: { ...summary, income: 0.3, net: 0.3 },
      warnings: ['Legacy fee needs review'],
    }
    expect(groupPnlRows(report.rows)).toEqual([
      { id: 'rental_income', category: 'rental_income', income: 0.3, expense: 0, net: 0.3 },
    ])
    const csv = reportToCsv(report, { from: query.from, to: query.to, scope: 'Garden House' })
    expect(csv).toContain('"rental_income","0.3","0","0.3"')
    expect(csv).toContain('"Period","2026-09-01","2026-09-30"')
    expect(csv).toContain('"Scope","Garden House"')
    expect(csv).toContain('Legacy fee needs review')
  })
  it.each(['=SUM(A1)', ' +SUM(A1)', '@SUM(A1)', '\t=SUM(A1)', '\u0000=SUM(A1)', '-SUM(A1)'])(
    'neutralizes spreadsheet formulas: %s',
    (note) => {
      const csv = reportToCsv({ ...result('ledger'), rows: [{ note, income: -5 }] })
      expect(csv).toContain(`"'${note}"`)
      expect(csv).toContain('"-5"')
    },
  )
  it('quotes embedded commas, newlines and quotes', () => {
    const csv = reportToCsv({ ...result('tasks'), rows: [{ title: 'Fix, "sink"\nnow' }] })
    expect(csv).toContain('"Fix, ""sink""\nnow"')
  })
})
