<template>
  <div class="loading-page">
    <div class="loading-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <img src="/logo.svg" alt="Property Manager Logo" class="loading-logo" />
        <h1 class="app-title">Handout - Property Manager</h1>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()

// Loading state
const hasError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)
const hasRedirected = ref(false) // Prevent multiple redirects

// Get redirect URL from query params
const redirectUrl = route.query.redirect

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

/**
 * Perform redirect to destination
 */
const performRedirect = () => {
  if (hasRedirected.value) return
  
  hasRedirected.value = true
  
  try {
    if (redirectUrl) {
      router.push(redirectUrl)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('LoadingPage - Error during redirect:', error)
    hasRedirected.value = false
    hasError.value = true
    errorMessage.value = 'Failed to redirect. Please try again.'
  }
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
    router.push('/public/login')
    return
  }

  try {
    // Re-initialize the store
    await userDataStore.initialize(userDataStore.user)
    
    // Wait a bit for data to load
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    if (isDataReady.value) {
      performRedirect()
    } else {
      hasError.value = true
      errorMessage.value = 'No properties found. Please contact your administrator.'
    }
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

/**
 * Watch for authentication state changes
 */
watch(
  () => userDataStore.isAuthenticated,
  (authenticated) => {
    if (!authenticated && !hasRedirected.value) {
      router.push('/public/login')
    }
  },
)

/**
 * Component mount handling
 */
onMounted(async () => {
  // Check authentication first
  if (!userDataStore.isAuthenticated) {
    router.push('/public/login')
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
      
      if (isDataReady.value) {
        performRedirect()
      } else {
        // No properties found - might be normal for new users
        hasError.value = true
        errorMessage.value = 'No properties found. Please contact your administrator to get access.'
      }
    } catch (error) {
      console.error('LoadingPage - Error initializing:', error)
      hasError.value = true
      errorMessage.value = error.message || 'Failed to initialize. Please try again.'
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<style scoped>
.loading-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.loading-container {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logo-section {
  margin-bottom: 48px;
}

.loading-logo {
  height: 80px;
  width: auto;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 12px 0;
  letter-spacing: -0.025em;
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
    font-size: 1.75rem;
  }

  .loading-logo {
    height: 64px;
  }
}
</style>
