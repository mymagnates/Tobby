import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserDataStore } from '../../../src/stores/userDataStore'
import {
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Simulate snapshot callback
    callback({
      docs: [],
    })
    return vi.fn() // Return unsubscribe function
  }),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('../../../src/boot/firebase', () => ({
  db: {},
}))

vi.mock('../../../src/utils/propertyIdUtils', () => ({
  normalizePropertyId: (id) => (id ? String(id).trim() : null),
  comparePropertyIds: (id1, id2) => {
    const norm1 = id1 ? String(id1).trim() : null
    const norm2 = id2 ? String(id2).trim() : null
    if (!norm1 && !norm2) return true
    if (!norm1 || !norm2) return false
    return norm1 === norm2
  },
  extractPropertyId: (obj) => {
    if (!obj) return null
    if (typeof obj === 'string' || typeof obj === 'number') return String(obj).trim()
    if (obj.id) return String(obj.id).trim()
    if (obj.property_id) return String(obj.property_id).trim()
    if (obj.property && obj.property.id) return String(obj.property.id).trim()
    return null
  },
  debugPropertyIdComparison: vi.fn(() => true),
}))

describe('userDataStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUserDataStore()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.user).toBeNull()
      expect(store.userProfile).toBeNull()
      expect(store.userRoles).toEqual([])
      expect(store.properties).toEqual([])
      expect(store.mxRecords).toEqual([])
      expect(store.transactions).toEqual([])
      expect(store.leases).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.isInitialized).toBe(false)
    })

    it('should have computed properties', () => {
      expect(store.userId).toBeUndefined()
      expect(store.isAuthenticated).toBe(false)
      expect(store.userCategory).toBeNull()
      expect(store.userAccessibleProperties).toEqual([])
      expect(store.userAccessibleMxRecords).toEqual([])
      expect(store.userAccessibleTransactions).toEqual([])
      expect(store.userAccessibleLeases).toEqual([])
      expect(store.universalPropertyOptions).toEqual([])
    })
  })

  describe('setUser', () => {
    it('should set user and initialize', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' }
      getDoc.mockResolvedValue({
        exists: () => false,
      })

      store.setUser(mockUser)

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(store.user).toEqual(mockUser)
    })

    it('should clear data when user is null', () => {
      store.setUser(null)
      expect(store.user).toBeNull()
      expect(store.userProfile).toBeNull()
      expect(store.userRoles).toEqual([])
    })
  })

  describe('clearAllData', () => {
    it('should clear all data', () => {
      store.user = { uid: 'user123' }
      store.userProfile = { name: 'Test' }
      store.userRoles = [{ id: 'role1' }]
      store.properties = [{ id: 'prop1' }]

      store.clearAllData()

      expect(store.user).toBeNull()
      expect(store.userProfile).toBeNull()
      expect(store.userRoles).toEqual([])
      expect(store.properties).toEqual([])
      expect(store.isInitialized).toBe(false)
    })
  })

  describe('getPropertyById', () => {
    it('should return property by ID', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [
        { property_id: 'prop1', role: 'admin' },
        { property_id: 'prop2', role: 'viewer' },
      ]
      store.properties = [
        { id: 'prop1', nickname: 'Property 1' },
        { id: 'prop2', nickname: 'Property 2' },
      ]

      const property = store.getPropertyById('prop1')

      expect(property).toEqual({ id: 'prop1', nickname: 'Property 1' })
    })

    it('should return null for non-existent property', () => {
      store.user = { uid: 'user123' }
      store.properties = [{ id: 'prop1' }]
      store.userRoles = [{ property_id: 'prop1' }]

      const property = store.getPropertyById('prop999')

      expect(property).toBeUndefined() // getPropertyById returns undefined when not found, not null
    })
  })

  describe('getPropertyName', () => {
    it('should return property nickname', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [{ property_id: 'prop1' }]
      store.properties = [{ id: 'prop1', nickname: 'My Property', address: '123 Main St' }]

      const name = store.getPropertyName('prop1')

      expect(name).toBe('My Property')
    })

    it('should return address if no nickname', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [{ property_id: 'prop1' }]
      store.properties = [{ id: 'prop1', address: '123 Main St' }]

      const name = store.getPropertyName('prop1')

      expect(name).toBe('123 Main St')
    })

    it('should return "Unknown Property" for invalid ID', () => {
      const name = store.getPropertyName('invalid')
      expect(name).toBe('Unknown Property')
    })
  })

  describe('hasPropertyAccess', () => {
    it('should return true for accessible property', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [{ property_id: 'prop1', role: 'admin' }]
      store.properties = [{ id: 'prop1' }]

      const hasAccess = store.hasPropertyAccess('prop1')

      expect(hasAccess).toBe(true)
    })

    it('should return false for inaccessible property', () => {
      store.user = { uid: 'user123' }
      store.properties = [{ id: 'prop1' }]
      store.userRoles = [{ property_id: 'prop1' }]

      const hasAccess = store.hasPropertyAccess('prop999')

      expect(hasAccess).toBe(false)
    })
  })

  describe('getUserRoleForProperty', () => {
    it('should return role for property', () => {
      store.userRoles = [
        { id: 'role1', property_id: 'prop1', role: 'admin' },
        { id: 'role2', property_id: 'prop2', role: 'viewer' },
      ]

      const role = store.getUserRoleForProperty('prop1')

      expect(role).toEqual({ id: 'role1', property_id: 'prop1', role: 'admin' })
    })

    it('should return null for property without role', () => {
      store.userRoles = [{ id: 'role1', property_id: 'prop1', role: 'admin' }]

      const role = store.getUserRoleForProperty('prop999')

      expect(role).toBeNull()
    })
  })

  describe('userAccessibleProperties', () => {
    it('should filter properties based on user roles', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [
        { property_id: 'prop1', role: 'admin' },
        { property_id: 'prop2', role: 'viewer' },
      ]
      store.properties = [
        { id: 'prop1', nickname: 'Property 1' },
        { id: 'prop2', nickname: 'Property 2' },
        { id: 'prop3', nickname: 'Property 3' },
      ]

      const accessible = store.userAccessibleProperties

      expect(accessible).toHaveLength(2)
      expect(accessible.map((p) => p.id)).toEqual(['prop1', 'prop2'])
    })

    it('should return empty array when no user', () => {
      store.user = null
      store.userRoles = []
      store.properties = [{ id: 'prop1' }]

      const accessible = store.userAccessibleProperties

      expect(accessible).toEqual([])
    })
  })

  describe('universalPropertyOptions', () => {
    it('should generate options from accessible properties', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [{ property_id: 'prop1' }]
      store.properties = [
        { id: 'prop1', nickname: 'Property 1', address: '123 Main St' },
      ]

      const options = store.universalPropertyOptions

      expect(options).toEqual([
        {
          label: 'Property 1',
          value: 'prop1',
          property: { id: 'prop1', nickname: 'Property 1', address: '123 Main St' },
        },
      ])
    })

    it('should use address when nickname is missing', () => {
      store.user = { uid: 'user123' }
      store.userRoles = [{ property_id: 'prop1' }]
      store.properties = [{ id: 'prop1', address: '123 Main St' }]

      const options = store.universalPropertyOptions

      expect(options[0].label).toBe('123 Main St')
    })
  })

  describe('addMxRecord', () => {
    it('should add mx record to local array', () => {
      const mxRecordData = {
        property_id: 'prop1',
        description: 'Test task',
      }

      store.addMxRecord(mxRecordData)

      expect(store.mxRecords).toHaveLength(1)
      expect(store.mxRecords[0]).toMatchObject({
        property_id: 'prop1',
        description: 'Test task',
      })
    })
  })
})
