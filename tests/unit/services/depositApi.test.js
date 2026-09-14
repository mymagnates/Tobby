import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
const { user, auth } = vi.hoisted(() => {
  const user = { uid: 'pm', getIdToken: vi.fn() }
  return { user, auth: { currentUser: user } }
})
vi.mock('src/boot/firebase', () => ({ auth, authStateReady: Promise.resolve() }))
import {
  getLeaseDeposit,
  getPropertyDeposits,
  recordDepositEntry,
  depositCsv,
} from '../../../src/services/depositApi'
import { transactionReportRevision } from '../../../src/services/reportingChanges'

const result = { currency: 'USD', summary: { balance: 100 }, entries: [] }
const respond = (data, status = 200) =>
  fetch.mockResolvedValue({ ok: status < 400, status, json: async () => data })
beforeEach(() => {
  auth.currentUser = user
  user.getIdToken.mockReset().mockResolvedValue('test-token')
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe('deposit API transport', () => {
  it('uses authenticated requests without browser caching', async () => {
    respond(result)
    await getLeaseDeposit('p1', 'l1')
    expect(fetch).toHaveBeenCalledWith(
      '/api/properties/p1/leases/l1/deposit',
      expect.objectContaining({
        cache: 'no-store',
        credentials: 'omit',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })
  it('refreshes reports only after a confirmed write and preserves the operation ID', async () => {
    respond(result)
    const version = transactionReportRevision.value
    await recordDepositEntry('p1', 'l1', { operation_id: 'op-1', amount: 100 })
    expect(JSON.parse(fetch.mock.calls[0][1].body).operation_id).toBe('op-1')
    expect(transactionReportRevision.value).toBe(version + 1)
    respond({})
    await expect(recordDepositEntry('p1', 'l1', {})).rejects.toThrow('not confirmed')
    expect(transactionReportRevision.value).toBe(version + 1)
  })
  it('does not present failure as a zero balance', async () => {
    respond({ message: 'Access revoked' }, 403)
    await expect(getLeaseDeposit('p1', 'l1')).rejects.toThrow('Access revoked')
    respond({ message: 'API route not found' }, 404)
    await expect(getPropertyDeposits('p1')).rejects.toThrow('backend update')
    respond({})
    await expect(getPropertyDeposits('p1')).rejects.toThrow('Invalid deposit summary')
  })
  it('rejects changed sessions before writing', async () => {
    user.getIdToken.mockImplementation(async () => {
      auth.currentUser = null
      return 'old'
    })
    await expect(recordDepositEntry('p1', 'l1', {})).rejects.toThrow('session changed')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('times out while waiting for authentication and never sends a late write', async () => {
    vi.useFakeTimers()
    let resolveToken
    user.getIdToken.mockReturnValue(
      new Promise((resolve) => {
        resolveToken = resolve
      }),
    )
    const assertion = expect(recordDepositEntry('p1', 'l1', {})).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(30001)
    await assertion
    resolveToken('late-token')
    await Promise.resolve()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('cancels reads during token acquisition', async () => {
    user.getIdToken.mockReturnValue(new Promise(() => {}))
    const controller = new AbortController()
    const assertion = expect(
      getLeaseDeposit('p1', 'l1', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
    expect(fetch).not.toHaveBeenCalled()
  })
  it.each(['=SUM(A1)', ' +SUM(A1)', '\t@SUM(A1)', ' \u0000=SUM(A1)'])(
    'neutralizes CSV formula text %s',
    (value) => {
      expect(depositCsv([{ label: value, balance: -5 }])).toContain(`"'${value}"`)
      expect(depositCsv([{ label: value, balance: -5 }])).toContain('"-5"')
    },
  )
})
