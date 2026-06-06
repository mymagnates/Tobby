import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
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
import { normalizeAccountType, normalizeRoleValue } from '../utils/roleUtils'

// LocalStorage keys for data persistence
const STORAGE_KEYS = {
  USER_PROFILE: 'userData_profile',
  USER_ROLES: 'userData_roles',
  PROPERTIES: 'userData_properties',
  DATA_TIMESTAMP: 'userData_timestamp',
  USER_ID: 'userData_userId',
}

// Data expiration time: 5 minutes (data will be refreshed if older)
const DATA_CACHE_DURATION = 5 * 60 * 1000

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
  const isInitialized = ref(false) // Track if store has been initialized

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
  const userCategory = computed(() =>
    normalizeAccountType(
      userProfile.value?.user_category || userProfile.value?.account_type || null,
    ),
  )
  const accountType = computed(() => normalizeAccountType(userProfile.value?.account_type || null))
  const ownerWorkspaceOnlyFlag = computed(() => Boolean(userProfile.value?.owner_workspace_only))
  // Migration-only compatibility for legacy PO accounts created before PO moved to
  // property-level membership. New owner access should come from active PO roles.
  const hasLegacyPoAccount = computed(() => {
    const normalizedCategory = normalizeAccountType(
      userProfile.value?.user_category || userProfile.value?.account_type || null,
    )
    return normalizedCategory === 'po'
  })
  const hasPoMembership = computed(() =>
    userRoles.value.some(
      (role) => normalizeRoleValue(role?.role) === 'po' && (role?.status || 'active') === 'active',
    ),
  )
  const hasPmMembership = computed(() =>
    userRoles.value.some(
      (role) => normalizeRoleValue(role?.role) === 'pm' && (role?.status || 'active') === 'active',
    ),
  )
  // Owner workspace access should be driven by PO membership; the legacy PO
  // account fallback stays only to preserve pre-restructure users during migration.
  const hasOwnerWorkspaceAccess = computed(() => hasPoMembership.value || hasLegacyPoAccount.value)
  const isOwnerOnlyUser = computed(() => {
    const normalizedAccountType = accountType.value || userCategory.value
    return (
      hasOwnerWorkspaceAccess.value &&
      (ownerWorkspaceOnlyFlag.value ||
        hasLegacyPoAccount.value ||
        !hasPmMembership.value ||
        normalizedAccountType === 'po')
    )
  })
  const isManagerCapableUser = computed(() => {
    const normalizedAccountType = accountType.value || userCategory.value
    if (normalizedAccountType === 'admin') return true
    if (normalizedAccountType !== 'pm') return false
    return !ownerWorkspaceOnlyFlag.value || hasPmMembership.value
  })

  const userAccessibleProperties = computed(() => {
    console.log('=== userDataStore - Computing userAccessibleProperties ===')
    console.log('user.value:', user.value)
    console.log('userRoles.value:', userRoles.value)
    console.log('properties.value:', properties.value)

    if (!user.value || userRoles.value.length === 0) {
      console.log('userDataStore - No user or no roles, returning empty array')
      return []
    }

    const accessiblePropertyIds = userRoles.value.map((role) =>
      normalizePropertyId(role.property_id),
    )
    console.log(
      'userDataStore - Accessible property IDs from roles (normalized):',
      accessiblePropertyIds,
    )
    console.log(
      'userDataStore - All properties:',
      properties.value.map((p) => ({ id: p.id, nickname: p.nickname, address: p.address })),
    )

    const filteredProperties = properties.value.filter((property) => {
      const normalizedPropertyId = normalizePropertyId(property.id)
      const hasAccess = accessiblePropertyIds.includes(normalizedPropertyId)
      console.log(
        `Property ${property.id} (${property.nickname || property.address}) - Normalized: ${normalizedPropertyId} - Has Access: ${hasAccess}`,
      )

      // Enhanced debugging for property ID matching
      if (!hasAccess) {
        console.log('Property ID matching details:')
        console.log('  Property ID:', property.id, 'Type:', typeof property.id)
        console.log('  Normalized Property ID:', normalizedPropertyId)
        console.log('  Accessible IDs:', accessiblePropertyIds)
        console.log(
          '  Role property_ids:',
          userRoles.value.map((r) => ({
            original: r.property_id,
            normalized: normalizePropertyId(r.property_id),
          })),
        )
      }

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
      console.log('userDataStore - No tasks available')
      return []
    }

    if (!userAccessibleProperties.value || userAccessibleProperties.value.length === 0) {
      console.log('userDataStore - No accessible properties for tasks')
      return []
    }

    // Filter tasks to only include those from properties the user has access to
    const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
    const filteredMxRecords = mxRecords.value.filter((mxRecord) =>
      accessiblePropertyIds.includes(mxRecord.property_id),
    )

    console.log('userDataStore - Filtered tasks:', filteredMxRecords)
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

  const canShareProperty = (propertyId) => {
    const normalizedSearchId = normalizePropertyId(propertyId)
    if (!normalizedSearchId) return false
    return userRoles.value.some((role) => {
      const active =
        String(role?.status || 'active')
          .trim()
          .toLowerCase() === 'active'
      const sameProperty = comparePropertyIds(role?.property_id, normalizedSearchId)
      const normalizedRole = normalizeRoleValue(role?.role)
      return active && sameProperty && ['pm', 'po'].includes(normalizedRole)
    })
  }

  /**
   * Save data to localStorage for persistence
   */
  const saveToStorage = () => {
    if (typeof window === 'undefined') return

    try {
      if (user.value?.uid) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, user.value.uid)
      }
      if (userProfile.value) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile.value))
      }
      if (userRoles.value.length > 0) {
        localStorage.setItem(STORAGE_KEYS.USER_ROLES, JSON.stringify(userRoles.value))
      }
      if (properties.value.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties.value))
      }
      localStorage.setItem(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString())
    } catch (error) {
      console.error('UserDataStore - Error saving to storage:', error)
    }
  }

  /**
   * Load data from localStorage
   */
  const loadFromStorage = (userId) => {
    if (typeof window === 'undefined') return false

    try {
      const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
      if (storedUserId !== userId) {
        // Different user, clear storage
        clearStorage()
        return false
      }

      const timestamp = localStorage.getItem(STORAGE_KEYS.DATA_TIMESTAMP)
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp, 10)
        if (age > DATA_CACHE_DURATION) {
          // Data is stale, don't use it
          return false
        }
      }

      const profileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
      if (profileData) {
        userProfile.value = JSON.parse(profileData)
      }

      const rolesData = localStorage.getItem(STORAGE_KEYS.USER_ROLES)
      if (rolesData) {
        userRoles.value = JSON.parse(rolesData)
      }

      const propertiesData = localStorage.getItem(STORAGE_KEYS.PROPERTIES)
      if (propertiesData) {
        properties.value = JSON.parse(propertiesData)
      }

      return true
    } catch (error) {
      console.error('UserDataStore - Error loading from storage:', error)
      clearStorage()
      return false
    }
  }

  /**
   * Clear localStorage
   */
  const clearStorage = () => {
    if (typeof window === 'undefined') return
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('UserDataStore - Error clearing storage:', error)
    }
  }

  /**
   * Initialize store with user - this is the main entry point
   * Handles both new logins and page refreshes
   * Prevents duplicate initialization for the same user
   */
  const initialize = async (newUser, options = {}) => {
    if (!newUser) {
      // No user, clear everything
      clearAllData()
      return
    }
    const { forceFresh = false } = options

    const previousUser = user.value

    // If already initialized with the same user, skip unless a forced refresh was requested.
    if (!forceFresh && isInitialized.value && previousUser && previousUser.uid === newUser.uid) {
      return
    }

    // If user changed, clear old data
    if (previousUser && previousUser.uid !== newUser.uid) {
      clearAllData()
    }

    user.value = newUser

    // Try to load from cache first
    const cacheLoaded = !forceFresh && loadFromStorage(newUser.uid)

    if (cacheLoaded && userRoles.value.length > 0 && properties.value.length > 0) {
      // Cache is valid, but refresh dependent data sequentially so new roles/properties
      // added in another flow (for example, accepting another property invite) are not missed.
      isInitialized.value = true
      await loadUserProfile()
      await loadUserRoles()
      await loadProperties()
      await loadMxRecords()
      await loadTransactions()
      await loadLeases()
      saveToStorage()
    } else {
      // No cache or cache invalid, load fresh data
      isInitialized.value = false
      await loadAllUserData()
      isInitialized.value = true
    }
  }

  // Methods
  const setUser = (newUser) => {
    // Use the new initialize method
    initialize(newUser).catch((error) => {
      console.error('UserDataStore - Error initializing:', error)
    })
  }

  const clearAllData = () => {
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
    isInitialized.value = false

    // Clear storage
    clearStorage()
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

      console.log('UserDataStore - Step 4: Loading tasks...')
      await loadMxRecords() // Load tasks after properties
      console.log('UserDataStore - Step 4 complete: tasks loaded. Count:', mxRecords.value.length)

      console.log('UserDataStore - Step 5: Loading transactions...')
      await loadTransactions() // Load transactions after properties
      console.log(
        'UserDataStore - Step 5 complete: Transactions loaded. Count:',
        transactions.value.length,
      )

      console.log('UserDataStore - Step 6: Loading leases...')
      await loadLeases() // Load leases after properties
      console.log('UserDataStore - Step 6 complete: Leases loaded. Count:', leases.value.length)

      // Save to storage after successful load
      saveToStorage()
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
      const snapshot = await getDocs(userRolesQuery)
      console.log(
        'UserDataStore - User roles snapshot received with',
        snapshot.docs.length,
        'roles',
      )
      userRoles.value = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          role: normalizeRoleValue(data?.role) || data?.role || null,
        }
      })
      console.log('UserDataStore - User roles loaded:', userRoles.value)
      unsubscribeUserRoles.value = null
      userRolesLoading.value = false
    } catch (error) {
      console.error('UserDataStore - Error setting up user roles listener:', error)
      // If there's an error, try to set empty array to prevent blocking
      userRoles.value = []
      userRolesLoading.value = false
    }
  }

  const loadProperties = async () => {
    if (!user.value) return
    if (userRoles.value.length === 0) {
      properties.value = []
      propertiesLoading.value = false
      return
    }

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

      const propertyDocs = await Promise.all(
        accessiblePropertyIds.map(async (propertyId) => {
          console.log(`UserDataStore - Loading property ${propertyId}`)
          try {
            const snap = await getDoc(doc(db, 'properties', propertyId))
            if (!snap.exists()) return null
            return {
              id: snap.id,
              ...snap.data(),
            }
          } catch (error) {
            console.error(`UserDataStore - Error loading property ${propertyId}:`, error)
            return null
          }
        }),
      )

      properties.value = propertyDocs.filter(Boolean)
      properties.value.sort((a, b) => {
        const nicknameA = (a.nickname || '').toLowerCase()
        const nicknameB = (b.nickname || '').toLowerCase()
        return nicknameA.localeCompare(nicknameB)
      })
      unsubscribeProperties.value = null
      propertiesLoading.value = false
    } catch (error) {
      console.error('UserDataStore - Error setting up properties listener:', error)
      propertiesLoading.value = false
    }
  }

  const loadMxRecords = async () => {
    try {
      mxRecordsLoading.value = true
      console.log('UserDataStore - Starting to load tasks from property subcollections...')
      console.log('UserDataStore - Current userRoles:', userRoles.value)
      console.log('UserDataStore - Current properties:', properties.value)

      if (userRoles.value.length === 0 || properties.value.length === 0) {
        console.log('UserDataStore - Waiting for user roles and properties to load first...')
        mxRecords.value = []
        mxRecordsLoading.value = false
        return
      }

      const accessiblePropertyIds = userAccessibleProperties.value.map((property) => property.id)
      console.log('UserDataStore - Accessible property IDs for tasks:', accessiblePropertyIds)

      if (accessiblePropertyIds.length === 0) {
        console.log('UserDataStore - No accessible properties, setting empty tasks')
        mxRecords.value = []
        mxRecordsLoading.value = false
        return
      }

      mxRecords.value = [] // Clear existing tasks
      console.log(
        'UserDataStore - Cleared existing tasks, setting up listeners for properties:',
        accessiblePropertyIds,
      )

      const mxGroups = await Promise.all(
        accessiblePropertyIds.map(async (propertyId) => {
          console.log(`UserDataStore - Loading property ${propertyId} mxrecords subcollection`)
          console.log(`UserDataStore - Full collection path: properties/${propertyId}/mxrecords`)
          try {
            const mxRecordsQuery = collection(db, 'properties', propertyId, 'mxrecords')
            const snapshot = await getDocs(mxRecordsQuery)
            console.log(
              `UserDataStore - Property ${propertyId} mxrecords snapshot received with`,
              snapshot.docs.length,
              'tasks',
            )
            return snapshot.docs.map((doc) => {
              const data = {
                id: doc.id,
                ...doc.data(),
              }
              console.log('UserDataStore - Task loaded for property', propertyId, ':', data)
              return data
            })
          } catch (error) {
            console.error(`UserDataStore - Error loading tasks for property ${propertyId}:`, error)
            return []
          }
        }),
      )

      mxRecords.value = mxGroups.flat()
      mxRecords.value.sort((a, b) => {
        const dateA = a.createAt?.toDate?.() || new Date(a.createAt)
        const dateB = b.createAt?.toDate?.() || new Date(b.createAt)
        return dateB - dateA
      })
      console.log('UserDataStore - Total tasks loaded:', mxRecords.value.length)
      unsubscribeMxRecords.value = null
      mxRecordsLoading.value = false
    } catch (error) {
      console.error('UserDataStore - Error setting up tasks listener:', error)
      mxRecordsLoading.value = false
    }
  }

  const loadTransactions = async () => {
    try {
      transactionsLoading.value = true
      console.log('UserDataStore - Starting to load transactions from property subcollections...')

      if (userRoles.value.length === 0 || properties.value.length === 0) {
        console.log('UserDataStore - Waiting for user roles and properties to load first...')
        transactions.value = []
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

      const transactionGroups = await Promise.all(
        accessiblePropertyIds.map(async (propertyId) => {
          console.log(`UserDataStore - Loading property ${propertyId} transactions subcollection`)
          try {
            const transactionsQuery = query(
              collection(db, 'properties', propertyId, 'transactions'),
              orderBy('created_datetime', 'desc'),
            )
            const snapshot = await getDocs(transactionsQuery)
            console.log(
              `UserDataStore - Property ${propertyId} transactions snapshot received with`,
              snapshot.docs.length,
              'transactions',
            )
            return snapshot.docs.map((doc) => {
              const data = {
                id: doc.id,
                ...doc.data(),
              }
              console.log('UserDataStore - Transaction loaded for property', propertyId, ':', data)
              return data
            })
          } catch (error) {
            console.error(
              `UserDataStore - Error loading transactions for property ${propertyId}:`,
              error,
            )
            return []
          }
        }),
      )

      transactions.value = transactionGroups.flat()
      transactions.value.sort((a, b) => {
        const dateA = a.created_datetime?.toDate?.() || new Date(a.created_datetime)
        const dateB = b.created_datetime?.toDate?.() || new Date(b.created_datetime)
        return dateB - dateA
      })
      console.log('UserDataStore - Total transactions loaded:', transactions.value.length)
      unsubscribeTransactions.value = null
      transactionsLoading.value = false
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
        leases.value = []
        leasesLoading.value = false
        return
      }

      // Clear existing leases
      leases.value = []

      // Load main leases collection
      const leasesQuery = query(collection(db, 'leases'), orderBy('created_datetime', 'desc'))
      console.log('UserDataStore - Loading leases collection: leases')
      const snapshot = await getDocs(leasesQuery)
      console.log('=== UserDataStore - Leases snapshot received ===')
      console.log('UserDataStore - Total leases in snapshot:', snapshot.docs.length)

      snapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        const leasePropertyId = data.property?.id || data.property_id?.id || data.property_id
        console.log(`Lease ${index}:`, {
          id: doc.id,
          property: data.property,
          property_id: data.property_id,
          property_id_extracted: leasePropertyId,
          status: data.status,
          rate_amount: data.rate_amount,
          created_datetime: data.created_datetime,
        })
      })

      const allLeases = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log('UserDataStore - All leases loaded:', allLeases.length)
      console.log('UserDataStore - Sample lease data:', allLeases[0] || 'No leases')

      leases.value = allLeases
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
      unsubscribeLeases.value = null
      leasesLoading.value = false
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

  const updateUserProfile = async (updateData) => {
    if (!user.value) throw new Error('No user authenticated')

    try {
      const userRef = doc(db, 'users', user.value.uid)
      const payload = {
        ...updateData,
        updatedAt: new Date(),
      }
      await setDoc(userRef, payload, { merge: true })

      userProfile.value = {
        ...(userProfile.value || {}),
        id: user.value.uid,
        ...updateData,
      }
      saveToStorage()
      return true
    } catch (error) {
      console.error('UserDataStore - Error updating user profile:', error)
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

  const getUserRolesForProperty = (propertyId) => {
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
    const matchingRoles = userRoles.value.filter((role) => {
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

    console.log('Step 3: Return matching roles')
    if (matchingRoles.length) {
      console.log(
        '✅ Found matching roles:',
        matchingRoles.map((role) => role.role),
      )
      return matchingRoles
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

  const getUserRoleForProperty = (propertyId) => {
    const rolesForProperty = getUserRolesForProperty(propertyId) || []
    if (!rolesForProperty.length) return null
    const prioritizedRoles = [...rolesForProperty].sort((left, right) => {
      const leftRole = normalizeRoleValue(left?.role)
      const rightRole = normalizeRoleValue(right?.role)
      if (leftRole === rightRole) return 0
      if (leftRole === 'pm') return -1
      if (rightRole === 'pm') return 1
      return 0
    })
    return prioritizedRoles[0]
  }

  const activePropertyRole = computed(() => {
    const activeId = userProfile.value?.active_property_id
    if (activeId) {
      return getUserRoleForProperty(activeId)
    }
    return userRoles.value[0] || null
  })

  const activePropertyRoleName = computed(
    () => normalizeRoleValue(activePropertyRole.value?.role) || null,
  )
  const isActiveRolePo = computed(() => activePropertyRoleName.value === 'po')
  const isActiveRolePm = computed(() => activePropertyRoleName.value === 'pm')

  const canManageProperty = (propertyId) =>
    (getUserRolesForProperty(propertyId) || []).some(
      (role) => normalizeRoleValue(role?.role) === 'pm',
    )

  const canCreateTransactionsForProperty = (propertyId) => {
    const role = normalizeRoleValue(getUserRoleForProperty(propertyId)?.role)
    return role === 'pm' || role === 'po'
  }

  const addMxRecord = (mxRecordData) => {
    // Add task to the local array for testing purposes
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

    console.log('UserDataStore - Test task added:', newMxRecord)
    console.log('UserDataStore - Total tasks after adding test record:', mxRecords.value.length)
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
    isInitialized,

    // Computed
    userId,
    isAuthenticated,
    userCategory,
    accountType,
    userAccessibleProperties,
    userAccessibleMxRecords,
    userAccessibleTransactions,
    userAccessibleLeases,
    universalPropertyOptions,

    // Methods
    initialize,
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
    updateUserProfile,
    createUserRole,
    updateProperty,
    getPropertyById,
    getPropertyName,
    hasPropertyAccess,
    canShareProperty,
    getUserRoleForProperty,
    getUserRolesForProperty,
    activePropertyRole,
    activePropertyRoleName,
    isActiveRolePo,
    isActiveRolePm,
    ownerWorkspaceOnlyFlag,
    hasLegacyPoAccount,
    hasPoMembership,
    hasPmMembership,
    hasOwnerWorkspaceAccess,
    isOwnerOnlyUser,
    isManagerCapableUser,
    canManageProperty,
    canCreateTransactionsForProperty,
    addMxRecord,
    checkLeasesCollection,
  }
})
