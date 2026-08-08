<template>
  <div class="loading-page">
    <div class="loading-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <h1 class="app-title"><span class="loading-brand-mark">H</span> Handout</h1>
        <p class="app-subtitle">{{ hasError ? 'Unable to load data' : loadingMessage }}</p>
        <p v-if="hasError && errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>

      <!-- Loading Animation or Error Icon -->
      <div class="loading-animation">
        <q-icon v-if="hasError" name="error" color="negative" size="80px" />
        <q-spinner-dots v-else size="80px" color="primary" class="main-spinner" />
      </div>

      <!-- Manual Load Button -->
      <div class="button-section">
        <q-btn
          color="primary"
          :label="hasError ? 'Retry Loading' : 'Load Data Manually'"
          @click="retryLoading"
          size="lg"
          unelevated
          :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { normalizeAccountType } from '../utils/roleUtils'
import { auth, authStateReady } from '../boot/firebase'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()

// Loading state
const hasError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)
const hasRedirected = ref(false) // Prevent multiple redirects
let unauthRedirectTimer = null

// Only retain in-app paths. This preserves the original destination without
// allowing an arbitrary external target into the post-login redirect flow.
const redirectUrl = computed(() => {
  const target = String(route.query.redirect || '').trim()
  return target.startsWith('/') && !target.startsWith('//') ? target : ''
})

const goToLogin = () => {
  const query = redirectUrl.value ? { redirect: redirectUrl.value } : undefined
  router.replace({ path: '/public/login', query })
}

/**
 * Computed loading message based on current state
 */
const loadingMessage = computed(() => {
  if (userDataStore.profileLoading) return 'Loading profile...'
  if (userDataStore.userRolesLoading) return 'Loading roles...'
  if (userDataStore.propertiesLoading) return 'Loading properties...'
  if (userDataStore.loading) return 'Loading data...'
  return 'Loading your data...'
})

/**
 * Check if data is ready (user authenticated and has accessible properties)
 */
const isDataReady = computed(() => {
  return (
    userDataStore.isAuthenticated &&
    userDataStore.isInitialized &&
    !userDataStore.loading &&
    !userDataStore.profileLoading &&
    !userDataStore.propertiesLoading &&
    !userDataStore.userRolesLoading
  )
})

const needsAccountTypeSelection = computed(() => {
  const profile = userDataStore.userProfile || {}
  if (!userDataStore.isAuthenticated) return false
  return !profile.account_type && !profile.user_category
})

const isSpAccount = computed(() => {
  const profile = userDataStore.userProfile || {}
  return normalizeAccountType(profile.account_type || profile.user_category) === 'sp'
})

const spHasServiceArea = computed(() => {
  const profile = userDataStore.userProfile || {}
  const spProfile = profile.sp_service_profile || {}
  const zipCodes = Array.isArray(spProfile.service_zip_codes) ? spProfile.service_zip_codes : []
  return zipCodes.length > 0 || Boolean(spProfile.service_area_shape)
})

const isTenantAccount = computed(() => {
  const profile = userDataStore.userProfile || {}
  return normalizeAccountType(profile.account_type || profile.user_category) === 'tt'
})
const isOwnerWorkspaceOnly = computed(() => {
  return userDataStore.isOwnerOnlyUser
})

/**
 * Perform redirect to destination
 */
const performRedirect = () => {
  if (hasRedirected.value) return

  hasRedirected.value = true

  try {
    if (needsAccountTypeSelection.value) {
      router.replace('/account-type-setup')
      return
    }
    if (isSpAccount.value && !redirectUrl.value) {
      if (!spHasServiceArea.value) {
        router.replace('/sp-services')
        return
      }
      router.replace('/sp-dashboard')
      return
    }
    if (isTenantAccount.value && !redirectUrl.value) {
      router.replace('/tenant-home')
      return
    }
    if (isOwnerWorkspaceOnly.value && !redirectUrl.value) {
      router.replace('/po-dashboard')
      return
    }
    if (redirectUrl.value) {
      router.replace(redirectUrl.value)
    } else {
      router.replace('/')
    }
  } catch (error) {
    console.error('LoadingPage - Error during redirect:', error)
    hasRedirected.value = false
    hasError.value = true
    errorMessage.value = 'Failed to redirect. Please try again.'
  }
}

const scheduleUnauthRedirect = () => {
  if (unauthRedirectTimer) clearTimeout(unauthRedirectTimer)
  unauthRedirectTimer = setTimeout(async () => {
    await authStateReady
    const firebaseUser = auth.currentUser
    if (firebaseUser && !userDataStore.isAuthenticated) {
      await userDataStore.setUser(firebaseUser)
      return
    }
    if (
      !firebaseUser &&
      !userDataStore.isAuthenticated &&
      !userDataStore.loading &&
      !userDataStore.profileLoading &&
      !hasRedirected.value
    ) {
      goToLogin()
    }
  }, 0)
}

/**
 * Retry loading data manually
 */
const retryLoading = async () => {
  hasError.value = false
  errorMessage.value = ''
  hasRedirected.value = false
  isLoading.value = true

  if (!userDataStore.isAuthenticated) {
    goToLogin()
    return
  }

  try {
    // Re-initialize the store
    await userDataStore.initialize(userDataStore.user)

    // Wait a bit for data to load
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Do not block on property count; route-level pages handle empty-state.
    performRedirect()
  } catch (error) {
    console.error('LoadingPage - Error loading data:', error)
    hasError.value = true
    errorMessage.value = error.message || 'Failed to load data. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Watch for data readiness and auto-redirect
 */
watch(
  isDataReady,
  (ready) => {
    if (ready && !hasRedirected.value) {
      performRedirect()
    }
  },
  { immediate: true },
)

watch(
  () => [userDataStore.isAuthenticated, userDataStore.profileLoading, userDataStore.userProfile],
  ([isAuth, profileLoading]) => {
    if (!isAuth || profileLoading || hasRedirected.value) return
    if (needsAccountTypeSelection.value) {
      performRedirect()
    }
  },
)

/**
 * Watch for authentication state changes
 */
watch(
  () => userDataStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      if (unauthRedirectTimer) {
        clearTimeout(unauthRedirectTimer)
        unauthRedirectTimer = null
      }
      return
    }
    if (!hasRedirected.value) {
      scheduleUnauthRedirect()
    }
  },
)

/**
 * Component mount handling
 */
onMounted(async () => {
  await authStateReady
  if (!userDataStore.isAuthenticated && auth.currentUser) {
    await userDataStore.setUser(auth.currentUser)
  }

  // Check authentication first
  if (!userDataStore.isAuthenticated) {
    scheduleUnauthRedirect()
    return
  }

  // If data is already ready, redirect immediately
  if (isDataReady.value) {
    performRedirect()
    return
  }

  // If store is not initialized, initialize it
  if (!userDataStore.isInitialized && userDataStore.user) {
    try {
      isLoading.value = true
      await userDataStore.initialize(userDataStore.user)

      // Wait a moment for computed properties to update
      await new Promise((resolve) => setTimeout(resolve, 300))

      performRedirect()
    } catch (error) {
      console.error('LoadingPage - Error initializing:', error)
      hasError.value = true
      errorMessage.value = error.message || 'Failed to initialize. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
})

onBeforeUnmount(() => {
  if (unauthRedirectTimer) {
    clearTimeout(unauthRedirectTimer)
    unauthRedirectTimer = null
  }
})
</script>

<style scoped>
.loading-page {
  background:
    radial-gradient(circle at top left, rgba(39, 194, 164, 0.12), transparent 26%),
    linear-gradient(180deg, #eef3f5 0%, #e6edf1 100%);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.loading-container {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(36, 59, 83, 0.12);
  border-radius: 18px;
  padding: 48px 32px;
  box-shadow: 0 24px 56px rgba(21, 54, 74, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logo-section {
  margin-bottom: 48px;
}

.app-title {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 750;
  color: #243b53;
  margin: 0 0 12px 0;
  letter-spacing: -0.045em;
}

.loading-brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #15364a;
  background: #27c2a4;
  font-size: 0.95rem;
  font-weight: 800;
}

.app-subtitle {
  font-size: 1.125rem;
  color: var(--neutral-600);
  margin: 0;
  font-weight: 500;
}

.error-message {
  font-size: 0.95rem;
  color: var(--negative);
  margin: 12px 0 0 0;
  font-weight: 400;
}

.loading-animation {
  margin-bottom: 48px;
}

.button-section {
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .loading-container {
    padding: 32px 24px;
  }

  .app-title {
    font-size: 2rem;
  }
}
</style>
