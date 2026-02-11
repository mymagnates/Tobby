import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sessionManager, SESSION_TIMEOUT_MS } from '../../../src/boot/firebase'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('sessionManager', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('setLoginTime', () => {
    it('should set login time in localStorage', () => {
      sessionManager.setLoginTime()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should store current timestamp', () => {
      const beforeTime = Date.now()
      sessionManager.setLoginTime()
      const afterTime = Date.now()

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const storedTime = parseInt(callArgs[1], 10)

      expect(storedTime).toBeGreaterThanOrEqual(beforeTime)
      expect(storedTime).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('getLoginTime', () => {
    it('should return login time from localStorage', () => {
      const testTime = Date.now()
      localStorageMock.setItem('firebase_session_login_time', testTime.toString())

      const loginTime = sessionManager.getLoginTime()

      expect(loginTime).toBe(testTime)
    })

    it('should return null if no login time stored', () => {
      const loginTime = sessionManager.getLoginTime()
      expect(loginTime).toBeNull()
    })
  })

  describe('isSessionExpired', () => {
    it('should return false for fresh session', () => {
      const recentTime = Date.now() - 1000 // 1 second ago
      localStorageMock.setItem('firebase_session_login_time', recentTime.toString())

      const expired = sessionManager.isSessionExpired()

      expect(expired).toBe(false)
    })

    it('should return true for expired session', () => {
      const expiredTime = Date.now() - SESSION_TIMEOUT_MS - 1000 // Expired by 1 second
      localStorageMock.setItem('firebase_session_login_time', expiredTime.toString())

      const expired = sessionManager.isSessionExpired()

      expect(expired).toBe(true)
    })

    it('should return false if no login time', () => {
      const expired = sessionManager.isSessionExpired()
      expect(expired).toBe(false)
    })
  })

  describe('clearLoginTime', () => {
    it('should remove login time from localStorage', () => {
      localStorageMock.setItem('firebase_session_login_time', Date.now().toString())
      sessionManager.clearLoginTime()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('firebase_session_login_time')
    })
  })

  describe('getRemainingTime', () => {
    it('should return remaining time for active session', () => {
      const recentTime = Date.now() - 1000 // 1 second ago
      localStorageMock.setItem('firebase_session_login_time', recentTime.toString())

      const remaining = sessionManager.getRemainingTime()

      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThan(SESSION_TIMEOUT_MS)
    })

    it('should return 0 for expired session', () => {
      const expiredTime = Date.now() - SESSION_TIMEOUT_MS - 1000
      localStorageMock.setItem('firebase_session_login_time', expiredTime.toString())

      const remaining = sessionManager.getRemainingTime()

      expect(remaining).toBe(0)
    })

    it('should return 0 if no login time', () => {
      const remaining = sessionManager.getRemainingTime()
      expect(remaining).toBe(0)
    })
  })

  describe('getRemainingTimeFormatted', () => {
    it('should return formatted time string', () => {
      const recentTime = Date.now() - 1000
      localStorageMock.setItem('firebase_session_login_time', recentTime.toString())

      const formatted = sessionManager.getRemainingTimeFormatted()

      expect(formatted).toMatch(/\d+h \d+m/)
    })
  })
})
