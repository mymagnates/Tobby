<template>
  <div class="loading-page">
    <div class="loading-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <img src="/logo.svg" alt="Property Manager Logo" class="loading-logo" />
        <h1 class="app-title">Property Manager</h1>
        <p class="app-subtitle">Loading your data...</p>
      </div>

      <!-- Loading Animation -->
      <div class="loading-animation">
        <q-spinner-dots size="60px" color="primary" class="main-spinner" />
        <div class="loading-steps">
          <div
            class="loading-step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <q-icon name="person" size="20px" />
            <span>Loading Profile</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <q-icon name="security" size="20px" />
            <span>Loading Permissions</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
          >
            <q-icon name="home" size="20px" />
            <span>Loading Properties</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: currentStep >= 4, completed: currentStep > 4 }"
          >
            <q-icon name="dns" size="20px" />
            <span>Loading Records</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: currentStep >= 5, completed: currentStep > 5 }"
          >
            <q-icon name="check_circle" size="20px" />
            <span>Complete</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <q-linear-progress :value="progress" size="4px" color="primary" class="loading-progress" />
        <p class="progress-text">{{ Math.round(progress * 100) }}% Complete</p>
      </div>

      <!-- Status Messages -->
      <div class="status-section">
        <p class="status-message">{{ statusMessage }}</p>
        <p class="status-detail">{{ statusDetail }}</p>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="error-section">
        <q-icon name="error" color="negative" size="32px" />
        <p class="error-message">Something went wrong while loading your data</p>
        <q-btn color="primary" label="Retry" @click="retryLoading" class="retry-btn" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'

const router = useRouter()
const userDataStore = useUserDataStore()

// Loading state
const currentStep = ref(0)
const hasError = ref(false)
const startTime = ref(Date.now())

// Computed properties
const progress = computed(() => {
  if (hasError.value) return 0
  return Math.min(currentStep.value / 5, 1)
})

const statusMessage = computed(() => {
  switch (currentStep.value) {
    case 0:
      return 'Initializing...'
    case 1:
      return 'Loading your profile...'
    case 2:
      return 'Checking permissions...'
    case 3:
      return 'Loading properties...'
    case 4:
      return 'Loading additional data...'
    case 5:
      return 'Finalizing...'
    default:
      return 'Getting ready...'
  }
})

const statusDetail = computed(() => {
  switch (currentStep.value) {
    case 1:
      return 'Retrieving your account information'
    case 2:
      return 'Determining your access level'
    case 3:
      return `Found ${userDataStore.userAccessibleProperties.length} accessible properties`
    case 4:
      return 'Loading transactions, leases, and records'
    case 5:
      return 'Almost ready!'
    default:
      return 'Please wait while we prepare your dashboard'
  }
})

// Methods
const updateLoadingStep = () => {
  const loadingStates = {
    profile: userDataStore.profileLoading,
    roles: userDataStore.userRolesLoading,
    properties: userDataStore.propertiesLoading,
    mxRecords: userDataStore.mxRecordsLoading,
    transactions: userDataStore.transactionsLoading,
    leases: userDataStore.leasesLoading,
  }

  // Update step based on what's currently loading
  if (loadingStates.profile) {
    currentStep.value = 1
  } else if (loadingStates.roles) {
    currentStep.value = 2
  } else if (loadingStates.properties) {
    currentStep.value = 3
  } else if (loadingStates.mxRecords || loadingStates.transactions || loadingStates.leases) {
    currentStep.value = 4
  } else if (
    userDataStore.isAuthenticated &&
    userDataStore.userAccessibleProperties.length > 0 &&
    !userDataStore.profileLoading &&
    !userDataStore.propertiesLoading &&
    !userDataStore.userRolesLoading
  ) {
    currentStep.value = 5
    // Auto-redirect after a brief delay
    setTimeout(() => {
      console.log('LoadingPage - Data loaded, redirecting to home')
      router.push('/')
    }, 1000)
  }
}

const retryLoading = async () => {
  console.log('LoadingPage - Retry loading requested')
  hasError.value = false
  currentStep.value = 0
  startTime.value = Date.now()

  if (!userDataStore.isAuthenticated) {
    console.log('LoadingPage - User not authenticated during retry, redirecting to login')
    router.push('/login')
    return
  }

  try {
    console.log('LoadingPage - Retrying data loading...')
    await userDataStore.loadAllUserData()
    console.log('LoadingPage - Retry successful')
  } catch (error) {
    console.error('LoadingPage - Retry failed:', error)
    hasError.value = true
  }
}

// Watchers
watch(
  () => [
    userDataStore.profileLoading,
    userDataStore.userRolesLoading,
    userDataStore.propertiesLoading,
    userDataStore.mxRecordsLoading,
    userDataStore.transactionsLoading,
    userDataStore.leasesLoading,
    userDataStore.userAccessibleProperties.length,
  ],
  () => {
    updateLoadingStep()
  },
  { deep: true },
)

// Check for authentication changes
watch(
  () => userDataStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) {
      // User is not authenticated, redirect to login
      router.push('/login')
    }
  },
)

// Timeout handling
onMounted(async () => {
  console.log('LoadingPage - Mounted')

  // Check if user is authenticated
  if (!userDataStore.isAuthenticated) {
    console.log('LoadingPage - User not authenticated, redirecting to login')
    router.push('/login')
    return
  }

  // Check if data is already loaded
  if (
    userDataStore.userAccessibleProperties.length > 0 &&
    !userDataStore.profileLoading &&
    !userDataStore.propertiesLoading &&
    !userDataStore.userRolesLoading
  ) {
    console.log('LoadingPage - Data already loaded, redirecting to home')
    router.push('/')
    return
  }

  // Ensure data loading is triggered
  console.log('LoadingPage - Starting data loading process')
  try {
    await userDataStore.loadAllUserData()
  } catch (error) {
    console.error('LoadingPage - Error loading data:', error)
    hasError.value = true
    return
  }

  // Set up a timeout to prevent infinite loading
  setTimeout(() => {
    if (currentStep.value < 5) {
      console.warn('LoadingPage - Timeout reached, checking state')
      if (userDataStore.userAccessibleProperties.length > 0) {
        // We have data, proceed to home
        console.log('LoadingPage - Timeout but data available, redirecting to home')
        router.push('/')
      } else {
        // Something went wrong
        console.error('LoadingPage - Timeout and no data available')
        hasError.value = true
      }
    }
  }, 30000) // 30 second timeout

  // Initial step update
  updateLoadingStep()
})
</script>

<style scoped>
.loading-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  min-height: 100vh;
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
  position: relative;
  overflow: hidden;
}

.loading-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.logo-section {
  margin-bottom: 40px;
}

.loading-logo {
  height: 64px;
  width: auto;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.app-subtitle {
  font-size: 1.125rem;
  color: var(--neutral-600);
  margin: 0;
  font-weight: 500;
}

.loading-animation {
  margin-bottom: 40px;
}

.main-spinner {
  margin-bottom: 32px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.4;
  font-size: 0.875rem;
  font-weight: 500;
}

.loading-step.active {
  opacity: 1;
  background: var(--primary-glow);
  color: var(--primary-color);
  transform: scale(1.05);
}

.loading-step.completed {
  opacity: 0.7;
  color: var(--success-color);
}

.loading-step.completed .q-icon {
  color: var(--success-color);
}

.progress-section {
  margin-bottom: 32px;
}

.loading-progress {
  margin-bottom: 8px;
  border-radius: 2px;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin: 0;
  font-weight: 500;
}

.status-section {
  margin-bottom: 24px;
}

.status-message {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--neutral-800);
  margin: 0 0 4px 0;
}

.status-detail {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin: 0;
}

.error-section {
  padding: 24px;
  background: var(--error-glow);
  border-radius: 12px;
  border: 1px solid var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-weight: 500;
  margin: 16px 0;
}

.retry-btn {
  margin-top: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .loading-container {
    padding: 32px 24px;
    margin: 16px;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .loading-logo {
    height: 48px;
  }

  .loading-steps {
    gap: 8px;
  }

  .loading-step {
    padding: 6px 12px;
    font-size: 0.8125rem;
  }
}

/* Animation for step transitions */
.loading-step {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 0.4;
    transform: translateY(0);
  }
}

/* Pulse animation for active step */
.loading-step.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1.05);
  }
}
</style>
