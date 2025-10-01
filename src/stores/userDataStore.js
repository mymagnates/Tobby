import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
import { db } from '../boot/firebase'
import {
  normalizePropertyId,
  comparePropertyIds,
  extractPropertyId,
  debugPropertyIdComparison,
} from '../utils/propertyIdUtils'

export const useUserDataStore = defineStore('userData', () => {
  // State
  const user = ref(null)
  const userProfile = ref(null)
  const userRoles = ref([])
  const properties = ref([])
  const mxRecords = ref([])
  const transactions = ref([])
  const transactionsLoading = ref(false)
  const leases = ref([])
  const leasesLoading = ref(false)

  // Loading states
  const loading = ref(false)
  const profileLoading = ref(false)
  const userRolesLoading = ref(false)
  const propertiesLoading = ref(false)
  const mxRecordsLoading = ref(false)

  // Unsubscribe functions
  const unsubscribeUserProfile = ref(null)
  const unsubscribeUserRoles = ref(null)
  const unsubscribeProperties = ref(null)
  const unsubscribeMxRecords = ref(null)
  const unsubscribeTransactions = ref(null)
  const unsubscribeLeases = ref(null)

  // Computed properties
  const userId = computed(() => user.value?.uid)
  const isAuthenticated = computed(() => !!user.value)

  const userAccessibleProperties = computed(() => {
    console.log('=== userDataStore - Computing userAccessibleProperties ===')
    console.log('user.value:', user.value)
    console.log('userRoles.value:', userRoles.value)
    console.log('properties.value:', properties.value)

    if (!user.value || userRoles.value.length === 0) {
      console.log('userDataStore - No user or no roles, returning empty array')
      return []
    }

    const accessiblePropertyIds = userRoles.value.map((role) => role.property_id)
    console.log('userDataStore - Accessible property IDs from roles:', accessiblePropertyIds)
    console.log(
      'userDataStore - All properties:',
      properties.value.map((p) => ({ id: p.id, nickname: p.nickname, address: p.address })),
    )

    const filteredProperties = properties.value.filter((property) => {
      const hasAccess = accessiblePropertyIds.includes(property.id)
      console.log(
        `Property ${property.id} (${property.nickname || property.address}) - Has Access: ${hasAccess}`,
      )
      return hasAccess
    })

    console.log('userDataStore - Final filtered properties:', filteredProperties)
    console.log('userDataStore - Total accessible properties:', filteredProperties.length)
    return filteredProperties
  })

  const userAccessibleMxRecords = computed(() => {
    console.log('userDataStore - Computing userAccessibleMxRecords')
    console.log('userDataStore - mxRecords.value:', mxRecords.value)
    console.log('userDataStore - userAccessibleProperties.value:', userAccessibleProperties.value)

    if (!mxRecords.value || mxRecords.value.length === 0) {
      console.log('userDataStore - No MX records available')
      return []
    }

    if (!userAccessibleProperties.value || userAccessibleProperties.value.length === 0) {
      console.log('userDataStore - No accessible properties for MX records')
      return []
    }

    // Filter MX records to only include those from properties the user has access to
    const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
    const filteredMxRecords = mxRecords.value.filter((mxRecord) =>
      accessiblePropertyIds.includes(mxRecord.property_id),
    )

    console.log('userDataStore - Filtered MX records:', filteredMxRecords)
    return filteredMxRecords
  })

  const userAccessibleTransactions = computed(() => {
    return transactions.value
  })

  const userAccessibleLeases = computed(() => {
    console.log('=== userDataStore - Computing userAccessibleLeases ===')
    console.log('userDataStore - leases.value:', leases.value)
    console.log('userDataStore - userAccessibleProperties.value:', userAccessibleProperties.value)
    console.log('userDataStore - userRoles.value:', userRoles.value)

    if (!leases.value || leases.value.length === 0) {
      console.log('userDataStore - No leases available')
      return []
    }

    if (!userAccessibleProperties.value || userAccessibleProperties.value.length === 0) {
      console.log('userDataStore - No accessible properties for leases')
      console.log('userDataStore - userRoles.length:', userRoles.value.length)
      console.log('userDataStore - properties.length:', properties.value.length)
      return []
    }

    // Filter leases to only include those from properties the user has access to
    const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
    console.log('userDataStore - Accessible property IDs:', accessiblePropertyIds)
    console.log(
      'userDataStore - User roles property IDs:',
      userRoles.value.map((role) => role.property_id),
    )
    console.log(
      'userDataStore - Properties IDs:',
      properties.value.map((p) => p.id),
    )

    // Log each lease and its property_id for debugging
    console.log('userDataStore - All leases with property_ids:')
    leases.value.forEach((lease, index) => {
      // Handle new lease structure: lease.property.id or fallback to old structure
      const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
      console.log(`Lease ${index}:`, {
        id: lease.id,
        property: lease.property,
        property_id: lease.property_id, // Keep for backward compatibility
        property_id_extracted: leasePropertyId,
        property_id_type: typeof leasePropertyId,
        status: lease.status,
        rate_amount: lease.rate_amount,
        created_datetime: lease.created_datetime,
      })
    })

    const filteredLeases = leases.value.filter((lease) => {
      // Extract property ID from new structure: lease.property.id or fallback to old structure
      const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
      const hasAccess = accessiblePropertyIds.includes(leasePropertyId)
      console.log(
        `Lease ${lease.id} (${lease.status}) - Property ID: ${leasePropertyId} (type: ${typeof leasePropertyId}) (from ${JSON.stringify(lease.property || lease.property_id)}), Accessible IDs: [${accessiblePropertyIds.join(', ')}], Has Access: ${hasAccess}`,
      )
      return hasAccess
    })

    console.log('userDataStore - Final filtered leases:', filteredLeases)
    console.log('userDataStore - Total accessible leases:', filteredLeases.length)
    return filteredLeases
  })

  // Universal property options for dropdowns across all pages
  const universalPropertyOptions = computed(() => {
    console.log('=== userDataStore - Computing universalPropertyOptions ===')
    const options = userAccessibleProperties.value.map((property) => ({
      label: property.nickname || property.address || 'Unnamed Property',
      value: property.id,
      property: property, // Include full property object for reference
    }))
    console.log('userDataStore - Universal property options:', options)
    return options
  })

  // Universal property lookup by ID
  const getPropertyById = (propertyId) => {
    const normalizedSearchId = normalizePropertyId(propertyId)
    if (!normalizedSearchId) return null

    console.log('=== getPropertyById DEBUG ===')
    console.log('Looking for propertyId:', propertyId, 'Type:', typeof propertyId)
    console.log('Normalized search ID:', normalizedSearchId)
    console.log(
      'Available properties:',
      userAccessibleProperties.value.map((p) => ({
        id: p.id,
        type: typeof p.id,
        normalized: normalizePropertyId(p.id),
        nickname: p.nickname,
      })),
    )

    const property = userAccessibleProperties.value.find((prop) =>
      comparePropertyIds(prop.id, normalizedSearchId),
    )

    console.log('Found property:', property)
    console.log('=== END getPropertyById DEBUG ===')
    return property
  }

  // Universal property name lookup
  const getPropertyName = (propertyId) => {
    if (!propertyId) return 'Unknown Property'
    const property = getPropertyById(propertyId)
    return property
      ? property.nickname || property.address || 'Unknown Property'
      : 'Unknown Property'
  }

  // Check if user has access to a specific property
  const hasPropertyAccess = (propertyId) => {
    const normalizedSearchId = normalizePropertyId(propertyId)
    if (!normalizedSearchId) return false
    return userAccessibleProperties.value.some((prop) =>
      comparePropertyIds(prop.id, normalizedSearchId),
    )
  }

  // Methods
  const setUser = (newUser) => {
    console.log(
      'UserDataStore - setUser called with:',
      newUser ? `User: ${newUser.email}` : 'No user',
    )
    const previousUser = user.value
    user.value = newUser

    if (newUser && !previousUser) {
      // User logged in
      console.log('UserDataStore - User logged in, loading all data...')
      loadAllUserData().catch((error) => {
        console.error('UserDataStore - Error loading user data after login:', error)
      })
    } else if (!newUser && previousUser) {
      // User logged out
      console.log('UserDataStore - User logged out, clearing all data...')
      clearAllData()
    } else if (newUser && previousUser && newUser.uid !== previousUser.uid) {
      // User changed
      console.log('UserDataStore - User changed, clearing old data and loading new data...')
      clearAllData()
      setTimeout(() => {
        loadAllUserData().catch((error) => {
          console.error('UserDataStore - Error loading user data after user change:', error)
        })
      }, 100) // Small delay to ensure cleanup is complete
    }
    // If same user, do nothing
  }

  const clearAllData = () => {
    console.log('UserDataStore - Clearing all data...')

    // Unsubscribe from all listeners
    if (unsubscribeUserProfile.value) {
      unsubscribeUserProfile.value()
      unsubscribeUserProfile.value = null
    }
    if (unsubscribeUserRoles.value) {
      unsubscribeUserRoles.value()
      unsubscribeUserRoles.value = null
    }
    if (unsubscribeProperties.value) {
      unsubscribeProperties.value()
      unsubscribeProperties.value = null
    }
    if (unsubscribeMxRecords.value) {
      unsubscribeMxRecords.value()
      unsubscribeMxRecords.value = null
    }
    if (unsubscribeTransactions.value) {
      unsubscribeTransactions.value()
      unsubscribeTransactions.value = null
    }
    if (unsubscribeLeases.value) {
      unsubscribeLeases.value()
      unsubscribeLeases.value = null
    }

    // Clear all data
    user.value = null
    userProfile.value = null
    userRoles.value = []
    properties.value = []
    mxRecords.value = []
    transactions.value = []
    leases.value = []

    // Reset loading states
    profileLoading.value = false
    userRolesLoading.value = false
    propertiesLoading.value = false
    mxRecordsLoading.value = false
    transactionsLoading.value = false
    leasesLoading.value = false
    loading.value = false
  }

  // Alias for clearAllData for better API consistency
  const clearUserData = clearAllData

  const loadAllUserData = async () => {
    if (!user.value) {
      console.log('UserDataStore - No user, skipping data load')
      return
    }

    console.log('=== UserDataStore - Starting to load all user data ===')
    loading.value = true

    try {
      // Load data sequentially to ensure dependencies are met
      console.log('UserDataStore - Step 1: Loading user profile...')
      await loadUserProfile()
      console.log('UserDataStore - Step 1 complete: User profile loaded')

      console.log('UserDataStore - Step 2: Loading user roles...')
      await loadUserRoles() // Load user roles first
      console.log(
        'UserDataStore - Step 2 complete: User roles loaded. Count:',
        userRoles.value.length,
      )

      console.log('UserDataStore - Step 3: Loading properties...')
      await loadProperties() // Then load properties that depend on roles
      console.log(
        'UserDataStore - Step 3 complete: Properties loaded. Count:',
        properties.value.length,
      )

      console.log('UserDataStore - Step 4: Loading MX records...')
      await loadMxRecords() // Load MX records after properties
      console.log(
        'UserDataStore - Step 4 complete: MX records loaded. Count:',
        mxRecords.value.length,
      )

      console.log('UserDataStore - Step 5: Loading transactions...')
      await loadTransactions() // Load transactions after properties
      console.log(
        'UserDataStore - Step 5 complete: Transactions loaded. Count:',
        transactions.value.length,
      )

      console.log('UserDataStore - Step 6: Loading leases...')
      await loadLeases() // Load leases after properties
      console.log('UserDataStore - Step 6 complete: Leases loaded. Count:', leases.value.length)

      console.log('UserDataStore - All user data loaded successfully')
      console.log('UserDataStore - Final state:', {
        userRoles: userRoles.value.length,
        properties: properties.value.length,
        leases: leases.value.length,
        userAccessibleProperties: userAccessibleProperties.value.length,
        userAccessibleLeases: userAccessibleLeases.value.length,
      })
    } catch (error) {
      console.error('UserDataStore - Error loading all user data:', error)
      throw error // Re-throw error so calling components can handle it
    } finally {
      loading.value = false
    }
  }

  const loadUserProfile = async () => {
    if (!user.value) return

    try {
      profileLoading.value = true
      console.log('UserDataStore - Loading user profile...')

      const userProfileDoc = await getDoc(doc(db, 'users', user.value.uid))

      if (userProfileDoc.exists()) {
        userProfile.value = {
          id: userProfileDoc.id,
          ...userProfileDoc.data(),
        }
        console.log('UserDataStore - User profile loaded:', userProfile.value)
      } else {
        console.log('UserDataStore - No user profile found, will create one')
        userProfile.value = null
      }
    } catch (error) {
      console.error('UserDataStore - Error loading user profile:', error)
    } finally {
      profileLoading.value = false
    }
  }

  const loadUserRoles = async () => {
    if (!user.value) return

    try {
      userRolesLoading.value = true
      console.log('UserDataStore - Loading user roles...')
      console.log('UserDataStore - User UID:', user.value.uid)

      const userRolesQuery = query(
        collection(db, 'users', user.value.uid, 'roles'),
        orderBy('role_date', 'desc'),
      )

      unsubscribeUserRoles.value = onSnapshot(
        userRolesQuery,
        (snapshot) => {
          console.log(
            'UserDataStore - User roles snapshot received with',
            snapshot.docs.length,
            'roles',
          )

          userRoles.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          console.log('UserDataStore - User roles loaded:', userRoles.value)
          userRolesLoading.value = false
        },
        (error) => {
          console.error('UserDataStore - Error loading user roles:', error)
          // If there's an error, try to set empty array to prevent blocking
          userRoles.value = []
          userRolesLoading.value = false
        },
      )
    } catch (error) {
      console.error('UserDataStore - Error setting up user roles listener:', error)
      // If there's an error, try to set empty array to prevent blocking
      userRoles.value = []
      userRolesLoading.value = false
    }
  }

  const loadProperties = async () => {
    if (!user.value || userRoles.value.length === 0) return

    try {
      propertiesLoading.value = true
      console.log('UserDataStore - Loading properties...')

      const accessiblePropertyIds = userRoles.value.map((role) => role.property_id)
      console.log('UserDataStore - Accessible property IDs:', accessiblePropertyIds)

      if (accessiblePropertyIds.length === 0) {
        console.log('UserDataStore - No accessible properties')
        properties.value = []
        propertiesLoading.value = false
        return
      }

      // Set up individual property listeners
      const unsubscribes = accessiblePropertyIds.map((propertyId) => {
        console.log(`UserDataStore - Setting up listener for property ${propertyId}`)

        return onSnapshot(
          doc(db, 'properties', propertyId),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const propertyData = {
                id: docSnapshot.id,
                ...docSnapshot.data(),
              }
              console.log('UserDataStore - Property loaded:', propertyData)

              // Update properties array
              const existingIndex = properties.value.findIndex((p) => p.id === propertyId)
              if (existingIndex >= 0) {
                properties.value[existingIndex] = propertyData
              } else {
                properties.value.push(propertyData)
              }

              // Sort by nickname
              properties.value.sort((a, b) => {
                const nicknameA = (a.nickname || '').toLowerCase()
                const nicknameB = (b.nickname || '').toLowerCase()
                return nicknameA.localeCompare(nicknameB)
              })
            } else {
              console.log(`UserDataStore - Property ${propertyId} no longer exists`)
              // Remove from properties array
              properties.value = properties.value.filter((p) => p.id !== propertyId)
            }

            propertiesLoading.value = false
          },
          (error) => {
            console.error(`UserDataStore - Error loading property ${propertyId}:`, error)
          },
        )
      })

      unsubscribeProperties.value = () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe())
      }
    } catch (error) {
      console.error('UserDataStore - Error setting up properties listener:', error)
      propertiesLoading.value = false
    }
  }

  const loadMxRecords = async () => {
    try {
      mxRecordsLoading.value = true
      console.log('UserDataStore - Starting to load MX records from property subcollections...')
      console.log('UserDataStore - Current userRoles:', userRoles.value)
      console.log('UserDataStore - Current properties:', properties.value)

      if (userRoles.value.length === 0 || properties.value.length === 0) {
        console.log('UserDataStore - Waiting for user roles and properties to load first...')
        mxRecordsLoading.value = false
        return
      }

      const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
      console.log('UserDataStore - Accessible property IDs for MX records:', accessiblePropertyIds)

      if (accessiblePropertyIds.length === 0) {
        console.log('UserDataStore - No accessible properties, setting empty MX records')
        mxRecords.value = []
        mxRecordsLoading.value = false
        return
      }

      mxRecords.value = [] // Clear existing MX records
      console.log(
        'UserDataStore - Cleared existing MX records, setting up listeners for properties:',
        accessiblePropertyIds,
      )

      const unsubscribes = accessiblePropertyIds.map((propertyId) => {
        console.log(
          `UserDataStore - Setting up listener for property ${propertyId} mxrecords subcollection`,
        )
        console.log(`UserDataStore - Full collection path: properties/${propertyId}/mxrecords`)

        // Start with a simple query without orderBy to avoid potential issues
        const mxRecordsQuery = collection(db, 'properties', propertyId, 'mxrecords')

        return onSnapshot(
          mxRecordsQuery,
          (snapshot) => {
            console.log(
              `UserDataStore - Property ${propertyId} mxrecords snapshot received with`,
              snapshot.docs.length,
              'MX records',
            )

            const newMxRecords = snapshot.docs.map((doc) => {
              const data = {
                id: doc.id,
                ...doc.data(),
              }
              console.log('UserDataStore - MX record loaded for property', propertyId, ':', data)
              return data
            })

            // Update the main mxRecords array by combining all property results
            // Remove old records for this property and add new ones
            mxRecords.value = mxRecords.value.filter((record) => record.property_id !== propertyId)
            mxRecords.value.push(...newMxRecords)

            // Sort by creation date (newest first) after loading
            mxRecords.value.sort((a, b) => {
              const dateA = a.createAt?.toDate?.() || new Date(a.createAt)
              const dateB = b.createAt?.toDate?.() || new Date(b.createAt)
              return dateB - dateA
            })

            console.log(
              'UserDataStore - Total MX records after property',
              propertyId,
              ':',
              mxRecords.value.length,
            )
            mxRecordsLoading.value = false
          },
          (error) => {
            console.error(
              `UserDataStore - Error loading MX records for property ${propertyId}:`,
              error,
            )
            mxRecordsLoading.value = false
          },
        )
      })

      unsubscribeMxRecords.value = () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe())
      }
    } catch (error) {
      console.error('UserDataStore - Error setting up MX records listener:', error)
      mxRecordsLoading.value = false
    }
  }

  const loadTransactions = async () => {
    try {
      transactionsLoading.value = true
      console.log('UserDataStore - Starting to load transactions from property subcollections...')

      if (userRoles.value.length === 0 || properties.value.length === 0) {
        console.log('UserDataStore - Waiting for user roles and properties to load first...')
        transactionsLoading.value = false
        return
      }

      const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
      console.log(
        'UserDataStore - Accessible property IDs for transactions:',
        accessiblePropertyIds,
      )

      if (accessiblePropertyIds.length === 0) {
        console.log('UserDataStore - No accessible properties, setting empty transactions')
        transactions.value = []
        transactionsLoading.value = false
        return
      }

      transactions.value = [] // Clear existing transactions

      const unsubscribes = accessiblePropertyIds.map((propertyId) => {
        console.log(
          `UserDataStore - Setting up listener for property ${propertyId} transactions subcollection`,
        )

        const transactionsQuery = query(
          collection(db, 'properties', propertyId, 'transactions'),
          orderBy('created_datetime', 'desc'),
        )

        return onSnapshot(
          transactionsQuery,
          (snapshot) => {
            console.log(
              `UserDataStore - Property ${propertyId} transactions snapshot received with`,
              snapshot.docs.length,
              'transactions',
            )

            const newTransactions = snapshot.docs.map((doc) => {
              const data = {
                id: doc.id,
                ...doc.data(),
              }
              console.log('UserDataStore - Transaction loaded for property', propertyId, ':', data)
              return data
            })

            // Update the main transactions array by combining all property results
            // Remove old transactions for this property and add new ones
            transactions.value = transactions.value.filter(
              (transaction) => transaction.property_id !== propertyId,
            )
            transactions.value.push(...newTransactions)

            // Sort by creation date (newest first)
            transactions.value.sort((a, b) => {
              const dateA = a.created_datetime?.toDate?.() || new Date(a.created_datetime)
              const dateB = b.created_datetime?.toDate?.() || new Date(b.created_datetime)
              return dateB - dateA
            })

            console.log(
              'UserDataStore - Total transactions after property',
              propertyId,
              ':',
              transactions.value.length,
            )
            transactionsLoading.value = false
          },
          (error) => {
            console.error(
              `UserDataStore - Error loading transactions for property ${propertyId}:`,
              error,
            )
          },
        )
      })

      unsubscribeTransactions.value = () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe())
      }
    } catch (error) {
      console.error('UserDataStore - Error setting up transactions listener:', error)
      transactionsLoading.value = false
    }
  }

  const loadLeases = async () => {
    try {
      leasesLoading.value = true
      console.log('=== UserDataStore - Starting to load leases ===')
      console.log('UserDataStore - userRoles.length:', userRoles.value.length)
      console.log('UserDataStore - properties.length:', properties.value.length)

      if (userRoles.value.length === 0 || properties.value.length === 0) {
        console.log('UserDataStore - Waiting for user roles and properties to load first...')
        leasesLoading.value = false
        return
      }

      // Clear existing leases
      leases.value = []

      // Set up listener for main leases collection
      const leasesQuery = query(collection(db, 'leases'), orderBy('created_datetime', 'desc'))
      console.log('UserDataStore - Setting up leases listener for collection: leases')

      unsubscribeLeases.value = onSnapshot(
        leasesQuery,
        (snapshot) => {
          console.log('=== UserDataStore - Leases snapshot received ===')
          console.log('UserDataStore - Total leases in snapshot:', snapshot.docs.length)

          // Log each lease document for debugging
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data()
            // Handle new property structure: data.property.id or fallback to old structure
            const leasePropertyId = data.property?.id || data.property_id?.id || data.property_id
            console.log(`Lease ${index}:`, {
              id: doc.id,
              property: data.property,
              property_id: data.property_id, // Keep for backward compatibility
              property_id_extracted: leasePropertyId,
              status: data.status,
              rate_amount: data.rate_amount,
              created_datetime: data.created_datetime,
            })
          })

          // Load all leases without filtering - computed property will handle filtering
          const allLeases = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          console.log('UserDataStore - All leases loaded:', allLeases.length)
          console.log('UserDataStore - Sample lease data:', allLeases[0] || 'No leases')

          // Update the leases array
          leases.value = allLeases

          // Sort by creation date (newest first)
          leases.value.sort((a, b) => {
            const dateA = a.created_datetime?.toDate?.() || new Date(a.created_datetime)
            const dateB = b.created_datetime?.toDate?.() || new Date(b.created_datetime)
            return dateB - dateA
          })

          console.log('UserDataStore - Total leases loaded and sorted:', leases.value.length)
          console.log(
            'UserDataStore - Current accessible properties count:',
            userAccessibleProperties.value.length,
          )
          leasesLoading.value = false
        },
        (error) => {
          console.error('UserDataStore - Error loading leases:', error)
          leasesLoading.value = false
        },
      )
    } catch (error) {
      console.error('UserDataStore - Error setting up leases listener:', error)
      leasesLoading.value = false
    }
  }

  const refreshLeases = async () => {
    console.log('UserDataStore - Manually refreshing leases...')
    try {
      await loadLeases()
      console.log('UserDataStore - Leases refreshed successfully')
    } catch (error) {
      console.error('UserDataStore - Error refreshing leases:', error)
    }
  }

  const createUserProfile = async (profileData) => {
    if (!user.value) throw new Error('No user authenticated')

    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...profileData,
        user_id: user.value.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('UserDataStore - User profile created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('UserDataStore - Error creating user profile:', error)
      throw error
    }
  }

  const createUserRole = async (roleData) => {
    if (!user.value) throw new Error('No user authenticated')

    try {
      const docRef = await addDoc(collection(db, 'users', user.value.uid, 'roles'), {
        ...roleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('UserDataStore - User role created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('UserDataStore - Error creating user role:', error)
      throw error
    }
  }

  const updateProperty = async (propertyId, updateData) => {
    try {
      const propertyRef = doc(db, 'properties', propertyId)
      await updateDoc(propertyRef, {
        ...updateData,
        updatedAt: new Date(),
      })

      console.log('UserDataStore - Property updated:', propertyId)
    } catch (error) {
      console.error('UserDataStore - Error updating property:', error)
      throw error
    }
  }

  // Note: Property ID utilities are now imported from ../utils/propertyIdUtils.js

  const getUserRoleForProperty = (propertyId) => {
    console.log('=== getUserRoleForProperty - Universal Strategy ===')
    console.log('Step 1: Retrieving all roles of current user')
    console.log('All user roles:', userRoles.value)
    console.log('Total roles count:', userRoles.value.length)

    const normalizedSearchId = normalizePropertyId(propertyId)
    if (!normalizedSearchId) {
      console.log('No valid property ID provided:', propertyId)
      return null
    }

    console.log('Step 2: Searching for property ID in accessible roles')
    console.log('Looking for property ID:', propertyId, 'Type:', typeof propertyId)
    console.log('Normalized search ID:', normalizedSearchId)

    // Search through all user roles to find matching property_id
    const matchingRole = userRoles.value.find((role) => {
      const rolePropertyId = extractPropertyId(role.property_id)
      const isMatch = comparePropertyIds(rolePropertyId, propertyId) // Use original propertyId, not normalized

      console.log('Checking role:', {
        id: role.id,
        original_property_id: role.property_id,
        extracted_property_id: rolePropertyId,
        property_id_type: typeof role.property_id,
        role: role.role,
        is_match: isMatch,
      })

      return isMatch
    })

    console.log('Step 3: Return matching role')
    if (matchingRole) {
      console.log('✅ Found matching role:', matchingRole.role)
      return matchingRole
    } else {
      console.log('❌ No matching role found for property ID:', propertyId)
      console.log(
        'Available property IDs in roles:',
        userRoles.value.map((r) => ({
          original: r.property_id,
          extracted: extractPropertyId(r.property_id),
          normalized: normalizePropertyId(extractPropertyId(r.property_id)),
        })),
      )

      // Enhanced debugging
      debugPropertyIdComparison(propertyId, 'Available roles', 'getUserRoleForProperty')
      return null
    }
  }

  const addMxRecord = (mxRecordData) => {
    // Add MX record to the local array for testing purposes
    const newMxRecord = {
      id: `test_${Date.now()}`,
      ...mxRecordData,
      createAt: new Date(),
      updatedAt: new Date(),
    }

    mxRecords.value.push(newMxRecord)

    // Sort by creation date (newest first)
    mxRecords.value.sort((a, b) => {
      const dateA = a.createAt?.toDate?.() || new Date(a.createAt)
      const dateB = b.createAt?.toDate?.() || new Date(b.createAt)
      return dateB - dateA
    })

    console.log('UserDataStore - Test MX record added:', newMxRecord)
    console.log(
      'UserDataStore - Total MX records after adding test record:',
      mxRecords.value.length,
    )
  }

  const checkLeasesCollection = async () => {
    try {
      console.log('=== UserDataStore - Checking leases collection manually ===')

      // Get a snapshot of the leases collection
      const leasesSnapshot = await getDocs(collection(db, 'leases'))
      console.log('UserDataStore - Manual leases snapshot count:', leasesSnapshot.docs.length)

      // Log each lease document
      leasesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        // Handle nested property_id.id structure from Firebase
        const leasePropertyId = data.property_id?.id || data.property_id
        console.log(`Manual Lease ${index}:`, {
          id: doc.id,
          property_id: data.property_id,
          property_id_extracted: leasePropertyId,
          lease_id: data.lease_id,
          status: data.status,
          created_datetime: data.created_datetime,
          fullData: data,
        })
      })

      return leasesSnapshot.docs.length
    } catch (error) {
      console.error('UserDataStore - Error checking leases collection:', error)
      return 0
    }
  }

  return {
    // State
    user,
    userProfile,
    userRoles,
    properties,
    mxRecords,
    transactions,
    leases,
    loading,
    profileLoading,
    userRolesLoading,
    propertiesLoading,
    mxRecordsLoading,
    transactionsLoading,
    leasesLoading,

    // Computed
    userId,
    isAuthenticated,
    userAccessibleProperties,
    userAccessibleMxRecords,
    userAccessibleTransactions,
    userAccessibleLeases,
    universalPropertyOptions,

    // Methods
    setUser,
    clearAllData,
    clearUserData,
    loadAllUserData,
    loadUserProfile,
    loadUserRoles,
    loadProperties,
    loadMxRecords,
    loadTransactions,
    loadLeases,
    refreshLeases,
    createUserProfile,
    createUserRole,
    updateProperty,
    getPropertyById,
    getPropertyName,
    hasPropertyAccess,
    getUserRoleForProperty,
    addMxRecord,
    checkLeasesCollection,
  }
})
