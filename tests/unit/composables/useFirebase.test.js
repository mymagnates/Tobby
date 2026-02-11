import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFirebase } from '../../../src/composables/useFirebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate auth state change
    callback(null)
    return vi.fn() // Return unsubscribe function
  }),
  updateProfile: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}))

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))

vi.mock('../../../src/boot/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null)
      return vi.fn()
    }),
  },
  db: {},
  storage: {},
  sessionManager: {
    setLoginTime: vi.fn(),
    getLoginTime: vi.fn(() => Date.now()),
    isSessionExpired: vi.fn(() => false),
    clearLoginTime: vi.fn(),
  },
}))

vi.mock('../../../src/stores/userDataStore', () => ({
  useUserDataStore: vi.fn(() => ({
    setUser: vi.fn(),
    clearAllData: vi.fn(),
    getPropertyName: vi.fn(() => 'Test Property'),
  })),
}))

describe('useFirebase', () => {
  let firebase

  beforeEach(() => {
    vi.clearAllMocks()
    firebase = useFirebase()
  })

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' }
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await firebase.signIn('test@example.com', 'password123')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123',
      )
    })

    it('should handle sign in errors', async () => {
      const error = new Error('Invalid credentials')
      signInWithEmailAndPassword.mockRejectedValue(error)

      await expect(firebase.signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' }
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await firebase.signUp('test@example.com', 'password123', 'Test User')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123',
      )
    })

    it('should handle sign up errors', async () => {
      const error = new Error('Email already in use')
      createUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(firebase.signUp('test@example.com', 'password123')).rejects.toThrow(
        'Email already in use',
      )
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      signOut.mockResolvedValue()

      await firebase.logout()

      expect(signOut).toHaveBeenCalled()
    })

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed')
      signOut.mockRejectedValue(error)

      await expect(firebase.logout()).rejects.toThrow('Logout failed')
    })
  })

  describe('createDocument', () => {
    it('should create document in top-level collection', async () => {
      const mockDocRef = { id: 'doc123' }
      addDoc.mockResolvedValue(mockDocRef)

      const result = await firebase.createDocument('properties', { name: 'Test Property' })

      expect(addDoc).toHaveBeenCalled()
      expect(result).toBe('doc123')
    })

    it('should create document with provided ID', async () => {
      const mockDoc = vi.fn()
      doc.mockReturnValue(mockDoc)
      setDoc.mockResolvedValue()

      const result = await firebase.createDocument('properties', { name: 'Test Property' }, 'doc123')

      expect(setDoc).toHaveBeenCalled()
      expect(result).toBe('doc123')
    })

    it('should create document in subcollection', async () => {
      const mockDocRef = { id: 'role123' }
      addDoc.mockResolvedValue(mockDocRef)

      const result = await firebase.createDocument('users/user123/roles', { role: 'admin' })

      expect(addDoc).toHaveBeenCalled()
      expect(result).toBe('role123')
    })
  })

  describe('getDocument', () => {
    it('should get document successfully', async () => {
      const mockDoc = {
        exists: () => true,
        id: 'doc123',
        data: () => ({ name: 'Test Property' }),
      }
      getDoc.mockResolvedValue(mockDoc)

      const result = await firebase.getDocument('properties/doc123')

      expect(getDoc).toHaveBeenCalled()
      expect(result).toEqual({ id: 'doc123', name: 'Test Property' })
    })

    it('should return null for non-existent document', async () => {
      const mockDoc = {
        exists: () => false,
      }
      getDoc.mockResolvedValue(mockDoc)

      const result = await firebase.getDocument('properties/doc123')

      expect(result).toBeNull()
    })

    it('should throw error for invalid path', async () => {
      await expect(firebase.getDocument('invalid')).rejects.toThrow()
    })
  })

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const mockDoc = vi.fn()
      doc.mockReturnValue(mockDoc)
      updateDoc.mockResolvedValue()

      await firebase.updateDocument('properties', 'doc123', { name: 'Updated Property' })

      expect(updateDoc).toHaveBeenCalled()
    })
  })

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const mockDoc = vi.fn()
      doc.mockReturnValue(mockDoc)
      deleteDoc.mockResolvedValue()

      await firebase.deleteDocument('properties', 'doc123')

      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('getCollectionData', () => {
    it('should get collection data successfully', async () => {
      const mockDocs = [
        { id: 'doc1', data: () => ({ name: 'Property 1' }) },
        { id: 'doc2', data: () => ({ name: 'Property 2' }) },
      ]
      const mockSnapshot = { docs: mockDocs }
      getDocs.mockResolvedValue(mockSnapshot)

      const result = await firebase.getCollectionData('properties')

      expect(getDocs).toHaveBeenCalled()
      expect(result).toEqual([
        { id: 'doc1', name: 'Property 1' },
        { id: 'doc2', name: 'Property 2' },
      ])
    })
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const mockRef = {}
      const mockSnapshot = { ref: {} }
      storageRef.mockReturnValue(mockRef)
      uploadBytes.mockResolvedValue(mockSnapshot)
      getDownloadURL.mockResolvedValue('https://example.com/file.jpg')

      const result = await firebase.uploadFile('images/test.jpg', mockFile)

      expect(uploadBytes).toHaveBeenCalled()
      expect(result).toBe('https://example.com/file.jpg')
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockRef = {}
      storageRef.mockReturnValue(mockRef)
      deleteObject.mockResolvedValue()

      await firebase.deleteFile('images/test.jpg')

      expect(deleteObject).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('should have isAuthenticated computed', () => {
      expect(firebase.isAuthenticated).toBeDefined()
    })

    it('should have userId computed', () => {
      expect(firebase.userId).toBeDefined()
    })

    it('should have userEmail computed', () => {
      expect(firebase.userEmail).toBeDefined()
    })

    it('should have userDisplayName computed', () => {
      expect(firebase.userDisplayName).toBeDefined()
    })
  })
})
