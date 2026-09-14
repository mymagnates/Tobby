import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  native: false,
  app: {},
  auth: { currentUser: null, authStateReady: vi.fn() },
  getAuth: vi.fn(),
  initializeAuth: vi.fn(),
  setPersistence: vi.fn(),
}))

vi.unmock('../../../src/boot/firebase')
vi.mock('firebase/app', () => ({ initializeApp: () => mocks.app }))
vi.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
  initializeAuth: mocks.initializeAuth,
  setPersistence: mocks.setPersistence,
  browserLocalPersistence: 'LOCAL',
}))
vi.mock('firebase/firestore', () => ({ initializeFirestore: () => ({}) }))
vi.mock('firebase/storage', () => ({ getStorage: () => ({}) }))
vi.mock('firebase/analytics', () => ({ getAnalytics: () => ({}) }))
vi.mock('../../../src/utils/mobileRuntime', () => ({
  isNativeMobileRuntime: () => mocks.native,
}))

describe('Firebase native startup', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.auth.currentUser = null
    mocks.auth.authStateReady.mockResolvedValue(undefined)
    mocks.getAuth.mockReturnValue(mocks.auth)
    mocks.initializeAuth.mockReturnValue(mocks.auth)
    mocks.setPersistence.mockResolvedValue(undefined)
  })

  afterEach(() => vi.restoreAllMocks())

  it('starts native auth without the browser popup/redirect resolver', async () => {
    mocks.native = true
    // The browser default is deliberately unusable in this native regression.
    mocks.getAuth.mockImplementation(() => { throw new Error('Browser iframe stalled') })
    const firebase = await import('../../../src/boot/firebase')

    expect(await firebase.authStateReady).toBeNull()
    expect(mocks.initializeAuth).toHaveBeenCalledWith(mocks.app, { persistence: 'LOCAL' })
    expect(mocks.getAuth).not.toHaveBeenCalled()
    expect(mocks.setPersistence).toHaveBeenCalledWith(mocks.auth, 'LOCAL')
  })

  it('waits for the persisted user rather than treating startup as signed out', async () => {
    mocks.native = true
    let restore
    mocks.auth.authStateReady.mockImplementation(() => new Promise((resolve) => { restore = resolve }))
    const firebase = await import('../../../src/boot/firebase')
    let settled = false
    void firebase.authStateReady.then(() => { settled = true })
    await vi.waitFor(() => expect(restore).toBeTypeOf('function'))
    expect(settled).toBe(false)

    mocks.auth.currentUser = { uid: 'persisted-user' }
    restore()
    expect(await firebase.authStateReady).toBe(mocks.auth.currentUser)
  })

  it('keeps the default browser auth configuration on web', async () => {
    mocks.native = false
    const firebase = await import('../../../src/boot/firebase')

    await firebase.authStateReady
    expect(mocks.getAuth).toHaveBeenCalledWith(mocks.app)
    expect(mocks.initializeAuth).not.toHaveBeenCalled()
  })
})
