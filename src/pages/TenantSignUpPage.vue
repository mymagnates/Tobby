<template>
  <div class="tenant-signup-page">
    <div class="signup-container">
      <!-- Logo and Property Info Section -->
      <div class="header-section">
        <h1 class="app-title">Handout</h1>
        <div v-if="property" class="property-info">
          <q-icon name="home" size="24px" color="primary" />
          <div class="property-details">
            <p class="property-name">{{ property.nickname || property.address }}</p>
            <p class="property-subtitle">Tenant Registration</p>
          </div>
        </div>
        <div v-else-if="!propertyLoading" class="property-error">
          <q-icon name="error" color="negative" size="32px" />
          <p>Property not found</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="propertyLoading || isCreatingProfile" class="loading-section">
        <q-spinner-dots size="60px" color="primary" />
        <p class="loading-text">
          {{
            isCreatingProfile ? 'Setting up your tenant profile...' : 'Loading property details...'
          }}
        </p>
      </div>

      <!-- Auth Forms -->
      <div v-else-if="!isAuthenticated && property" class="auth-section">
        <!-- Toggle between Sign Up and Login -->
        <q-tabs
          v-model="activeTab"
          class="auth-tabs"
          align="justify"
          narrow-indicator
          active-color="primary"
        >
          <q-tab name="signup" label="Sign Up" />
          <q-tab name="login" label="Login" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated>
          <!-- Sign Up Panel -->
          <q-tab-panel name="signup">
            <q-form @submit="handleSignUp" class="auth-form">
              <q-input
                v-model="signupForm.email"
                type="email"
                label="Email *"
                outlined
                :rules="[(val) => !!val || 'Email is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.password"
                type="password"
                label="Password *"
                outlined
                :rules="[
                  (val) => !!val || 'Password is required',
                  (val) => val.length >= 6 || 'Password must be at least 6 characters',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.confirmPassword"
                type="password"
                label="Confirm Password *"
                outlined
                :rules="[
                  (val) => !!val || 'Please confirm your password',
                  (val) => val === signupForm.password || 'Passwords do not match',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.fullName"
                label="Full Name *"
                outlined
                :rules="[(val) => !!val || 'Full name is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input v-model="signupForm.phone" label="Phone Number" outlined type="tel">
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>

              <div class="form-actions">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Create Tenant Account"
                  size="lg"
                  unelevated
                  :loading="loading"
                  class="full-width"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- Login Panel -->
          <q-tab-panel name="login">
            <q-form @submit="handleLogin" class="auth-form">
              <q-input
                v-model="loginForm.email"
                type="email"
                label="Email *"
                outlined
                :rules="[(val) => !!val || 'Email is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="loginForm.password"
                type="password"
                label="Password *"
                outlined
                :rules="[(val) => !!val || 'Password is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <div class="form-actions">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Login"
                  size="lg"
                  unelevated
                  :loading="loading"
                  class="full-width"
                />
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Already authenticated message -->
      <div v-else-if="isAuthenticated && property" class="already-authenticated">
        <q-icon name="check_circle" color="positive" size="64px" />
        <p class="success-message">You are already logged in!</p>
        <p class="success-detail">Redirecting to your tenant dashboard...</p>
      </div>

      <!-- Error Display -->
      <div v-if="errorMessage" class="error-section">
        <q-banner class="bg-negative text-white" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { signUp, signIn, createDocument } = useFirebase()
const userDataStore = useUserDataStore()

// State
const activeTab = ref('signup')
const property = ref(null)
const propertyLoading = ref(false)
const loading = ref(false)
const isCreatingProfile = ref(false)
const errorMessage = ref('')

// Form data
const signupForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
})

const loginForm = ref({
  email: '',
  password: '',
})

// Computed
const isAuthenticated = computed(() => userDataStore.isAuthenticated)
const propertyId = computed(() => route.params.propertyId)

// Methods
const loadProperty = async () => {
  if (!propertyId.value) {
    errorMessage.value = 'No property specified'
    return
  }

  try {
    propertyLoading.value = true
    errorMessage.value = ''

    const propertyDoc = await getDoc(doc(db, 'properties', propertyId.value))

    if (propertyDoc.exists()) {
      property.value = {
        id: propertyDoc.id,
        ...propertyDoc.data(),
      }
      console.log('Property loaded:', property.value)
    } else {
      errorMessage.value = 'Property not found'
    }
  } catch (error) {
    console.error('Error loading property:', error)
    errorMessage.value = 'Error loading property details'
  } finally {
    propertyLoading.value = false
  }
}

const createTenantProfile = async (userId, userData) => {
  try {
    console.log('Creating tenant profile for user:', userId)

    // Create user profile in users collection
    const userProfileData = {
      user_id: userId,
      email: userData.email,
      full_name: userData.fullName,
      phone: userData.phone || '',
      user_type: 'tenant',
      user_category: 'tenant', // Important: Used for role-based access control
      created_at: new Date(),
      updated_at: new Date(),
    }

    await createDocument('users', userProfileData, userId)
    console.log('User profile created successfully')

    // Create tenant role in users/{userId}/roles subcollection
    const roleData = {
      property_id: propertyId.value,
      role: 'tenant',
      role_date: new Date(),
      status: 'active',
      created_at: new Date(),
    }

    await createDocument(`users/${userId}/roles`, roleData)
    console.log('Tenant role created successfully')

    return true
  } catch (error) {
    console.error('Error creating tenant profile:', error)
    throw error
  }
}

const handleSignUp = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    console.log('Starting tenant sign up process...')

    // Create Firebase auth account
    const result = await signUp(
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.fullName,
    )

    console.log('Firebase auth account created:', result.user.uid)

    // Create tenant profile
    isCreatingProfile.value = true
    await createTenantProfile(result.user.uid, signupForm.value)

    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Tenant account created successfully!',
      caption: 'Redirecting to your dashboard...',
    })

    // Wait for user data to load, then redirect
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  } catch (error) {
    console.error('Sign up error:', error)
    errorMessage.value = error.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
    isCreatingProfile.value = false
  }
}

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    console.log('Logging in user...')

    await signIn(loginForm.value.email, loginForm.value.password)

    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      caption: 'Redirecting...',
    })

    // Redirect to loading page to load user data
    setTimeout(() => {
      router.push('/loading')
    }, 1000)
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Failed to login. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

// Watch for authentication state changes
watch(isAuthenticated, (newValue) => {
  if (newValue && !isCreatingProfile.value) {
    // User is already authenticated, redirect to tenant home
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  }
})

// Mount
onMounted(async () => {
  console.log('TenantSignUpPage mounted with propertyId:', propertyId.value)

  // Load property details
  await loadProperty()

  // If user is already authenticated, redirect to tenant home
  if (isAuthenticated.value) {
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

.tenant-signup-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.signup-container {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  font-weight: 400;
  color: var(--primary-color);
  margin: 0 0 24px 0;
  letter-spacing: 0.02em;
}

.property-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--primary-glow, #f0f4ff);
  border-radius: 12px;
  margin-top: 16px;
}

.property-details {
  text-align: left;
  flex: 1;
}

.property-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 4px 0;
}

.property-subtitle {
  font-size: 0.875rem;
  color: var(--neutral-600, #666);
  margin: 0;
}

.property-error {
  padding: 24px;
  text-align: center;
  color: var(--negative-color, #c10015);
}

.property-error p {
  margin: 8px 0 0 0;
  font-weight: 500;
}

.loading-section {
  text-align: center;
  padding: 48px 24px;
}

.loading-text {
  margin-top: 16px;
  color: var(--neutral-600, #666);
  font-size: 1rem;
}

.auth-section {
  margin-top: 24px;
}

.auth-tabs {
  margin-bottom: 24px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  margin-top: 8px;
}

.already-authenticated {
  text-align: center;
  padding: 48px 24px;
}

.success-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--positive-color, #21ba45);
  margin: 16px 0 8px 0;
}

.success-detail {
  color: var(--neutral-600, #666);
  margin: 0;
}

.error-section {
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .signup-container {
    padding: 32px 24px;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .property-name {
    font-size: 1rem;
  }
}
</style>
