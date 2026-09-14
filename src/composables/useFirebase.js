import { ref, computed, readonly } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { app, auth, authStateReady, db, storage, sessionManager } from '../boot/firebase'
import { useUserDataStore } from '../stores/userDataStore'
import { mobileApiBase } from '../services/mobileApi'
import { isNativeMobileRuntime } from '../utils/mobileRuntime'

const FIREBASE_DEBUG_LOGS_ENABLED = false
const debugLog = (...args) => {
  if (FIREBASE_DEBUG_LOGS_ENABLED) {
    console.debug(...args)
  }
}

export function useFirebase() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const userDataStore = useUserDataStore()

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const createDownloadToken = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const waitForAuthenticatedUser = async () => {
    await authStateReady

    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true)
      return auth.currentUser
    }

    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady()
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
        return auth.currentUser
      }
    }

    let currentUser = await new Promise((resolve) => {
      let unsubscribe = null
      const timeout = setTimeout(() => {
        if (unsubscribe) unsubscribe()
        resolve(null)
      }, 3000)
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        if (!nextUser) return
        clearTimeout(timeout)
        if (unsubscribe) unsubscribe()
        resolve(nextUser)
      })
    })

    const startedAt = Date.now()
    while (!currentUser && Date.now() - startedAt < 5000) {
      await wait(250)
      currentUser = auth.currentUser
    }

    if (!currentUser) {
      const authError = new Error(
        'User is not authenticated. Please sign in again before uploading.',
      )
      authError.code = 'storage/unauthenticated'
      throw authError
    }

    await currentUser.getIdToken(true)
    return currentUser
  }

  const uploadFileWithRestFallback = async (path, file) => {
    const currentUser = await waitForAuthenticatedUser()
    const normalizedPath = String(path || '').replace(/^\/+/, '')
    const quotaProtectedPath = /^(?:images\/[^/]+\/[^/]+\/|properties\/[^/]+\/)/.test(
      normalizedPath,
    )

    if (quotaProtectedPath) {
      const token = await currentUser.getIdToken(true)
      const uploadApiBase = isNativeMobileRuntime() ? mobileApiBase() : '/api'
      const reserveResponse = await fetch(`${uploadApiBase}/storage/upload-reservations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_path: normalizedPath,
          size_bytes: Number(file?.size || 0),
          content_type: file?.type || 'application/octet-stream',
        }),
      })
      const reservation = await reserveResponse.json().catch(() => ({}))
      if (!reserveResponse.ok) {
        const reservationError = new Error(
          reservation?.message || 'Unable to reserve storage upload',
        )
        reservationError.code = reservation?.error_code || 'storage/quota-exceeded'
        throw reservationError
      }
      const uploadResponse = await fetch(reservation.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file?.type || 'application/octet-stream',
          'x-goog-meta-firebaseStorageDownloadTokens': reservation.download_token || '',
        },
        body: file,
      })
      if (!uploadResponse.ok) throw new Error('Storage upload failed')
      const commitResponse = await fetch(
        `${uploadApiBase}/storage/upload-reservations/${encodeURIComponent(reservation.reservation_id)}/commit`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const committed = await commitResponse.json().catch(() => ({}))
      if (!commitResponse.ok)
        throw new Error(committed?.message || 'Unable to commit storage upload')
      return committed.url
    }
    const fileRef = storageRef(storage, path)

    try {
      const snapshot = await uploadBytes(fileRef, file)
      return getDownloadURL(snapshot.ref)
    } catch (uploadError) {
      if (uploadError?.code !== 'storage/unauthenticated') {
        throw uploadError
      }

      const bucket = app?.options?.storageBucket
      if (!bucket) throw uploadError

      const token = await currentUser.getIdToken(true)
      const downloadToken = createDownloadToken()
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(path)}`
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file?.type || 'application/octet-stream',
          'x-goog-meta-firebaseStorageDownloadTokens': downloadToken,
        },
        body: file,
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const errorMessage =
          payload?.error?.message || uploadError.message || 'Storage upload failed'
        const restError = new Error(errorMessage)
        restError.code =
          response.status === 401 ? 'storage/unauthenticated' : 'storage/unauthorized'
        restError.payload = payload
        throw restError
      }

      return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}?alt=media&token=${encodeURIComponent(downloadToken)}`
    }
  }

  // Register only after persisted Auth state has settled. This avoids treating
  // the startup null state as a real logout in components mounted during refresh.
  void authStateReady.finally(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser
      // Use the new initialize method which handles both new logins and page refreshes.
      await userDataStore.setUser(currentUser)
    })
  })

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Persist session with LOCAL auth persistence
      sessionManager.setLoginTime()
      debugLog('User signed in successfully; session persistence is always-on')

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password, displayName = '') => {
    try {
      loading.value = true
      error.value = null
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(result.user, { displayName })
      }

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      debugLog('useFirebase - Starting logout process...')

      // Clear store data before signing out to prevent race conditions
      debugLog('useFirebase - Clearing user data...')
      userDataStore.clearAllData()

      // Clear session login time
      sessionManager.clearLoginTime()

      // Sign out from Firebase
      debugLog('useFirebase - Signing out from Firebase...')
      await signOut(auth)

      debugLog('useFirebase - Logout completed successfully')
    } catch (err) {
      console.error('useFirebase - Logout error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Firestore methods
  const createDocument = async (collectionName, data, id = null) => {
    try {
      debugLog('=== createDocument called ===')
      debugLog('Collection name:', collectionName)
      debugLog('Data:', data)
      debugLog('ID:', id)

      loading.value = true
      error.value = null

      // Handle subcollection paths (e.g., "users/userId/roles")
      if (collectionName.includes('/')) {
        debugLog('Handling subcollection path')
        const pathParts = collectionName.split('/')
        debugLog('Path parts:', pathParts)
        const collectionRef = collection(db, ...pathParts)
        debugLog('Collection reference created:', collectionRef)

        if (id) {
          debugLog('Using setDoc with provided ID')
          await setDoc(doc(collectionRef, id), data)
          debugLog('Document set successfully with ID:', id)
          return id
        } else {
          debugLog('Using addDoc to generate ID')
          const docRef = await addDoc(collectionRef, data)
          debugLog('Document added successfully with ID:', docRef.id)
          return docRef.id
        }
      } else {
        debugLog('Handling top-level collection')
        // Handle top-level collections
        if (id) {
          debugLog('Using setDoc with provided ID for top-level')
          await setDoc(doc(db, collectionName, id), data)
          debugLog('Top-level document set successfully with ID:', id)
          return id
        } else {
          debugLog('Using addDoc to generate ID for top-level')
          const docRef = await addDoc(collection(db, collectionName), data)
          debugLog('Top-level document added successfully with ID:', docRef.id)
          return docRef.id
        }
      }
    } catch (err) {
      console.error('=== createDocument failed ===')
      console.error('Error in createDocument:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      })
      error.value = err.message
      throw err
    } finally {
      loading.value = false
      debugLog('=== createDocument completed ===')
    }
  }

  const getDocument = async (docPath) => {
    try {
      loading.value = true
      error.value = null

      // Handle both collection/id format and full path format
      let docRef
      if (docPath.includes('/')) {
        // Full path format (e.g., "properties/propertyId/reminders/reminderId")
        const pathParts = docPath.split('/')
        docRef = doc(db, ...pathParts)
      } else {
        throw new Error(
          'getDocument requires a full document path (e.g., "collection/docId" or "collection/docId/subcollection/subDocId")',
        )
      }

      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDocument = async (collectionName, id, data) => {
    try {
      loading.value = true
      error.value = null

      // Handle subcollection paths (e.g., "properties/propertyId/reminders")
      let docRef
      if (collectionName.includes('/')) {
        const pathParts = collectionName.split('/')
        docRef = doc(db, ...pathParts, id)
      } else {
        docRef = doc(db, collectionName, id)
      }

      await updateDoc(docRef, data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDocument = async (collectionName, id) => {
    try {
      loading.value = true
      error.value = null

      // Handle subcollection paths (e.g., "properties/propertyId/reminders")
      let docRef
      if (collectionName.includes('/')) {
        const pathParts = collectionName.split('/')
        docRef = doc(db, ...pathParts, id)
      } else {
        docRef = doc(db, collectionName, id)
      }

      await deleteDoc(docRef)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCollectionData = async (collectionName) => {
    try {
      loading.value = true
      error.value = null

      // Handle subcollection paths (e.g., "properties/propertyId/reminders")
      if (collectionName.includes('/')) {
        const pathParts = collectionName.split('/')
        const collectionRef = collection(db, ...pathParts)
        const querySnapshot = await getDocs(collectionRef)
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } else {
        // Handle top-level collections
        const collectionRef = collection(db, collectionName)
        const querySnapshot = await getDocs(collectionRef)
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Storage methods
  const uploadFile = async (path, file) => {
    try {
      loading.value = true
      error.value = null
      return await uploadFileWithRestFallback(path, file)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFile = async (path) => {
    try {
      loading.value = true
      error.value = null
      const fileRef = storageRef(storage, path)
      await deleteObject(fileRef)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload multiple images with property name + datetime + random naming
  const uploadImages = async (files, propertyId, context = 'mxrecord') => {
    const normalizedFiles = Array.isArray(files)
      ? files.filter(Boolean)
      : typeof File !== 'undefined' && files instanceof File
        ? [files]
        : files && typeof files.length === 'number'
          ? Array.from(files).filter(Boolean)
          : []

    if (normalizedFiles.length === 0) return []

    try {
      loading.value = true
      error.value = null

      // Get property name for file naming
      const propertyName = userDataStore.getPropertyName(propertyId) || 'unknown-property'
      const sanitizedPropertyName = propertyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

      // Create timestamp for file naming
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]

      debugLog(
        `Uploading ${normalizedFiles.length} images for property: ${propertyName} (${propertyId})`,
      )
      await waitForAuthenticatedUser()

      const uploadPromises = normalizedFiles.map(async (file, index) => {
        // Generate random number for uniqueness
        const randomNum = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')

        // Get file extension
        const fileExtension = file.name.split('.').pop() || 'jpg'

        // Create unique filename: propertyname_datetime_random_index.extension
        const fileName = `${sanitizedPropertyName}_${timestamp}_${randomNum}_${index + 1}.${fileExtension}`

        // Create storage path: images/context/propertyId/filename
        const storagePath = `images/${context}/${propertyId}/${fileName}`

        debugLog(`Uploading image ${index + 1}/${files.length}:`, {
          originalName: file.name,
          newFileName: fileName,
          storagePath: storagePath,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })

        // Upload file and get download URL
        const downloadURL = await uploadFileWithRestFallback(storagePath, file)

        debugLog(`Image uploaded successfully: ${fileName}`)

        return {
          url: downloadURL,
          fileName: fileName,
          originalName: file.name,
          storagePath: storagePath,
          size: file.size,
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      debugLog(`All ${normalizedFiles.length} images uploaded successfully`)

      return uploadResults.map((result) => result.url) // Return just the URLs for backward compatibility
    } catch (err) {
      console.error('Error uploading images:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload multiple images with detailed results (including storage paths)
  const uploadImagesWithDetails = async (files, propertyId, context = 'mxrecord') => {
    const normalizedFiles = Array.isArray(files)
      ? files.filter(Boolean)
      : typeof File !== 'undefined' && files instanceof File
        ? [files]
        : files && typeof files.length === 'number'
          ? Array.from(files).filter(Boolean)
          : []

    if (normalizedFiles.length === 0) return []

    try {
      loading.value = true
      error.value = null

      // Get property name for file naming
      const propertyName = userDataStore.getPropertyName(propertyId) || 'unknown-property'
      const sanitizedPropertyName = propertyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

      // Create timestamp for file naming
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]

      debugLog(
        `Uploading ${normalizedFiles.length} files with details for property: ${propertyName} (${propertyId})`,
      )
      await waitForAuthenticatedUser()

      const uploadPromises = normalizedFiles.map(async (file, index) => {
        // Generate random number for uniqueness
        const randomNum = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')

        // Get file extension
        const fileExtension = file.name.split('.').pop() || 'jpg'

        // Create unique filename: propertyname_datetime_random_index.extension
        const fileName = `${sanitizedPropertyName}_${timestamp}_${randomNum}_${index + 1}.${fileExtension}`

        // Create storage path: images/context/propertyId/filename
        const storagePath = `images/${context}/${propertyId}/${fileName}`

        debugLog(`Uploading file ${index + 1}/${files.length}:`, {
          originalName: file.name,
          newFileName: fileName,
          storagePath: storagePath,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })

        // Upload file and get download URL
        const downloadURL = await uploadFileWithRestFallback(storagePath, file)

        debugLog(`File uploaded successfully: ${fileName}`)

        return {
          url: downloadURL,
          fileName: fileName,
          originalName: file.name,
          storagePath: storagePath,
          size: file.size,
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      debugLog(`All ${normalizedFiles.length} files uploaded successfully with details`)

      return uploadResults // Return full details including storage paths
    } catch (err) {
      console.error('Error uploading files with details:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all documents from a collection (alias for getCollectionData for clarity)
  const getAllDocuments = async (collectionName) => {
    return await getCollectionData(collectionName)
  }

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.uid)
  const userEmail = computed(() => user.value?.email)
  const userDisplayName = computed(() => user.value?.displayName)

  return {
    // State
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    userId,
    userEmail,
    userDisplayName,

    // Auth methods
    signIn,
    signUp,
    resetPassword,
    logout,

    // Firestore methods
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    getCollectionData,
    getAllDocuments,

    // Storage methods
    uploadFile,
    deleteFile,
    uploadImages,
    uploadImagesWithDetails,

    // Store integration
    userDataStore,
  }
}
