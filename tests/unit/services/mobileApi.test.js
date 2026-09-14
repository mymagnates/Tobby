import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
const { user, native } = vi.hoisted(() => ({
  user: { uid: 'pm1', getIdToken: vi.fn() },
  native: vi.fn(),
}))
vi.mock('src/boot/firebase', () => ({
  auth: { currentUser: user },
  authStateReady: Promise.resolve(),
}))
vi.mock('src/utils/mobileRuntime', () => ({ isNativeMobileRuntime: native }))
import { mobileRequest, mobileApiBase, uploadInventoryPhoto } from '../../../src/services/mobileApi'
describe('mobile API transport', () => {
  beforeEach(() => {
    user.getIdToken.mockResolvedValue('test-token')
    native.mockReturnValue(true)
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
  it('uses an HTTPS origin on Capacitor', () => {
    expect(mobileApiBase()).toMatch(/^https:\/\//)
  })
  it('sends Firebase token and uid and never suppresses a server error', async () => {
    fetch.mockResolvedValue({
      headers: { get: () => 'application/json' },
      ok: false,
      status: 409,
      json: async () => ({ message: 'Version changed', error_code: 'INVENTORY_CONFLICT' }),
    })
    await expect(mobileRequest('/test', { method: 'POST', body: { x: 1 } })).rejects.toMatchObject({
      message: 'Version changed',
      status: 409,
    })
    expect(fetch.mock.calls[0][1].headers).toMatchObject({
      Authorization: 'Bearer test-token',
      'X-User-Id': 'pm1',
    })
  })
  it('does not report success when a feature endpoint is missing', async () => {
    fetch.mockResolvedValue({
      headers: { get: () => 'application/json' },
      ok: false,
      status: 404,
      json: async () => ({}),
    })
    await expect(mobileRequest('/test')).rejects.toThrow('not available on the server')
  })
  it('rejects a hosting fallback HTML page even with HTTP 200', async () => {
    fetch.mockResolvedValue({
      headers: { get: () => 'text/html' },
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('not JSON')
      },
    })
    await expect(mobileRequest('/test')).rejects.toThrow('may not be deployed')
  })
  it('rejects non-photo uploads before any request', async () => {
    await expect(
      uploadInventoryPhoto({
        propertyId: 'p1',
        leaseId: 'l1',
        itemId: 'i1',
        file: { type: 'text/html', size: 10 },
      }),
    ).rejects.toThrow('Choose a photo')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('limits token acquisition time', async () => {
    vi.useFakeTimers()
    user.getIdToken.mockReturnValue(new Promise(() => {}))
    const result = mobileRequest('/test')
    const assertion = expect(result).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(20001)
    await assertion
  })
})
