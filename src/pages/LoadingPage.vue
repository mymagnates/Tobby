<template>
  <div class="loading-page">
    <div class="loading-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <img src="/logo.svg" alt="Property Manager Logo" class="loading-logo" />
        <h1 class="app-title">Handout - Property Manager</h1>
        <p class="app-subtitle">{{ hasError ? 'Unable to load data' : 'Loading your data...' }}</p>
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
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'

const router = useRouter()
const userDataStore = useUserDataStore()

// Loading state
const hasError = ref(false)

// Methods
const retryLoading = async () => {
  hasError.value = false

  if (!userDataStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await userDataStore.loadAllUserData()
  } catch (error) {
    console.error('LoadingPage - Error loading data:', error)
    hasError.value = true
  }
}

// Watch for successful data load
watch(
  () => [
    userDataStore.isAuthenticated,
    userDataStore.userAccessibleProperties.length,
    userDataStore.profileLoading,
    userDataStore.propertiesLoading,
    userDataStore.userRolesLoading,
  ],
  () => {
    if (!userDataStore.isAuthenticated) {
      router.push('/login')
      return
    }

    // Auto-redirect when data is loaded
    if (
      userDataStore.isAuthenticated &&
      userDataStore.userAccessibleProperties.length > 0 &&
      !userDataStore.profileLoading &&
      !userDataStore.propertiesLoading &&
      !userDataStore.userRolesLoading
    ) {
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  },
  { deep: true },
)

// Mount handling
onMounted(async () => {
  // Check authentication
  if (!userDataStore.isAuthenticated) {
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
    router.push('/')
    return
  }

  // Load data
  try {
    await userDataStore.loadAllUserData()
  } catch (error) {
    console.error('LoadingPage - Error loading data:', error)
    hasError.value = true
  }

  // Timeout handling
  setTimeout(() => {
    if (userDataStore.userAccessibleProperties.length > 0) {
      router.push('/')
    } else {
      hasError.value = true
    }
  }, 30000)
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
