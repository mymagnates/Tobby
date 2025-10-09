import { ref, computed, readonly } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
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
import { auth, db, storage } from '../boot/firebase'
import { useUserDataStore } from '../stores/userDataStore'

export function useFirebase() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const userDataStore = useUserDataStore()

  // Auth state observer
  onAuthStateChanged(auth, (currentUser) => {
    console.log('Auth state changed:', currentUser ? `User: ${currentUser.email}` : 'No user')
    user.value = currentUser
    // Update the store with user data
    userDataStore.setUser(currentUser)
  })

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const result = await signInWithEmailAndPassword(auth, email, password)
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

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('useFirebase - Starting logout process...')

      // Clear store data before signing out to prevent race conditions
      console.log('useFirebase - Clearing user data...')
      userDataStore.clearAllData()

      // Sign out from Firebase
      console.log('useFirebase - Signing out from Firebase...')
      await signOut(auth)

      console.log('useFirebase - Logout completed successfully')
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
      console.log('=== createDocument called ===')
      console.log('Collection name:', collectionName)
      console.log('Data:', data)
      console.log('ID:', id)

      loading.value = true
      error.value = null

      // Handle subcollection paths (e.g., "users/userId/roles")
      if (collectionName.includes('/')) {
        console.log('Handling subcollection path')
        const pathParts = collectionName.split('/')
        console.log('Path parts:', pathParts)
        const collectionRef = collection(db, ...pathParts)
        console.log('Collection reference created:', collectionRef)

        if (id) {
          console.log('Using setDoc with provided ID')
          await setDoc(doc(collectionRef, id), data)
          console.log('Document set successfully with ID:', id)
          return id
        } else {
          console.log('Using addDoc to generate ID')
          const docRef = await addDoc(collectionRef, data)
          console.log('Document added successfully with ID:', docRef.id)
          return docRef.id
        }
      } else {
        console.log('Handling top-level collection')
        // Handle top-level collections
        if (id) {
          console.log('Using setDoc with provided ID for top-level')
          await setDoc(doc(db, collectionName, id), data)
          console.log('Top-level document set successfully with ID:', id)
          return id
        } else {
          console.log('Using addDoc to generate ID for top-level')
          const docRef = await addDoc(collection(db, collectionName), data)
          console.log('Top-level document added successfully with ID:', docRef.id)
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
      console.log('=== createDocument completed ===')
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
      const fileRef = storageRef(storage, path)
      const snapshot = await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
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
    if (!files || files.length === 0) return []

    try {
      loading.value = true
      error.value = null

      // Get property name for file naming
      const propertyName = userDataStore.getPropertyName(propertyId) || 'unknown-property'
      const sanitizedPropertyName = propertyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

      // Create timestamp for file naming
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]

      console.log(`Uploading ${files.length} images for property: ${propertyName} (${propertyId})`)

      const uploadPromises = files.map(async (file, index) => {
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

        console.log(`Uploading image ${index + 1}/${files.length}:`, {
          originalName: file.name,
          newFileName: fileName,
          storagePath: storagePath,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })

        // Upload file and get download URL
        const fileRef = storageRef(storage, storagePath)
        const snapshot = await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)

        console.log(`Image uploaded successfully: ${fileName}`)

        return {
          url: downloadURL,
          fileName: fileName,
          originalName: file.name,
          storagePath: storagePath,
          size: file.size,
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      console.log(`All ${files.length} images uploaded successfully`)

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
    if (!files || files.length === 0) return []

    try {
      loading.value = true
      error.value = null

      // Get property name for file naming
      const propertyName = userDataStore.getPropertyName(propertyId) || 'unknown-property'
      const sanitizedPropertyName = propertyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

      // Create timestamp for file naming
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]

      console.log(
        `Uploading ${files.length} files with details for property: ${propertyName} (${propertyId})`,
      )

      const uploadPromises = files.map(async (file, index) => {
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

        console.log(`Uploading file ${index + 1}/${files.length}:`, {
          originalName: file.name,
          newFileName: fileName,
          storagePath: storagePath,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })

        // Upload file and get download URL
        const fileRef = storageRef(storage, storagePath)
        const snapshot = await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)

        console.log(`File uploaded successfully: ${fileName}`)

        return {
          url: downloadURL,
          fileName: fileName,
          originalName: file.name,
          storagePath: storagePath,
          size: file.size,
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      console.log(`All ${files.length} files uploaded successfully with details`)

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
