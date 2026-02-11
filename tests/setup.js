import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('../../src/boot/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(null)
      return vi.fn()
    }),
    signOut: vi.fn(),
  },
  db: {},
  storage: {},
  sessionManager: {
    setLoginTime: vi.fn(),
    getLoginTime: vi.fn(() => Date.now()),
    isSessionExpired: vi.fn(() => false),
    clearLoginTime: vi.fn(),
    getRemainingTime: vi.fn(() => 24 * 60 * 60 * 1000),
    getRemainingTimeFormatted: vi.fn(() => '24h 0m'),
  },
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000,
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
  }),
  useRoute: () => ({
    path: '/',
    query: {},
    params: {},
  }),
}))

// Configure Vue Test Utils to use Quasar
config.global.plugins = [Quasar]

// Stub Quasar components to avoid rendering issues in tests
config.global.stubs = {
  'q-card': true,
  'q-card-section': true,
  'q-input': true,
  'q-btn': true,
  'q-form': true,
  'q-dialog': true,
  'q-banner': true,
  'q-icon': true,
  'q-select': true,
  'q-checkbox': true,
  'q-radio': true,
  'q-toggle': true,
  'q-slider': true,
  'q-range': true,
  'q-time': true,
  'q-date': true,
  'q-editor': true,
  'q-uploader': true,
  'q-table': true,
  'q-list': true,
  'q-item': true,
  'q-item-section': true,
  'q-item-label': true,
  'q-separator': true,
  'q-toolbar': true,
  'q-toolbar-title': true,
  'q-space': true,
  'q-drawer': true,
  'q-page-container': true,
  'q-page': true,
  'q-layout': true,
  'q-header': true,
  'q-footer': true,
}

// Global test utilities - keep console for debugging but allow override
// Don't suppress console completely as it's useful for debugging
