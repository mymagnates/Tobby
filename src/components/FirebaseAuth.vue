<template>
  <div class="firebase-auth q-pa-md">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ isAuthenticated ? 'Welcome!' : 'Sign In' }}
        </div>

        <!-- Sign In Form -->
        <div v-if="!isAuthenticated">
          <q-form @submit="handleSignIn" class="q-gutter-md">
            <q-input
              v-model="email"
              type="email"
              label="Email"
              required
              outlined
              :rules="[(val) => !!val || 'Email is required']"
            />

            <q-input
              v-model="password"
              type="password"
              label="Password"
              required
              outlined
              :rules="[(val) => !!val || 'Password is required']"
            />

            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" :loading="loading" label="Sign In" class="col" />
              <q-btn @click="showSignUp = true" color="secondary" label="Sign Up" class="col" />
            </div>
          </q-form>
        </div>

        <!-- User Info -->
        <div v-else class="user-info">
          <p><strong>Email:</strong> {{ userEmail }}</p>
          <p v-if="userDisplayName"><strong>Name:</strong> {{ userDisplayName }}</p>

          <div class="q-gutter-sm q-mt-md">
            <q-btn
              color="primary"
              label="Continue to Home"
              icon="home"
              @click="goToIndex"
              class="full-width"
            />
            <q-btn
              @click="handleLogout"
              color="negative"
              :loading="loading"
              label="Sign Out"
              class="full-width"
            />
          </div>
        </div>

        <!-- Sign Up Form -->
        <q-dialog v-model="showSignUp">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Sign Up</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit="handleSignUp" class="q-gutter-md">
                <q-input v-model="signUpEmail" type="email" label="Email" required outlined />

                <q-input
                  v-model="signUpPassword"
                  type="password"
                  label="Password"
                  required
                  outlined
                />

                <q-input v-model="displayName" label="Display Name" outlined />

                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    :loading="loading"
                    label="Create Account"
                    class="col"
                  />
                  <q-btn @click="showSignUp = false" color="secondary" label="Cancel" class="col" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-card-section>

      <!-- Error Display -->
      <q-card-section v-if="error">
        <q-banner rounded class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ formatErrorMessage(error) }}
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'

const route = useRoute()
const router = useRouter()
const { loading, error, isAuthenticated, userEmail, userDisplayName, signIn, signUp, logout } =
  useFirebase()

// Form data
const email = ref('')
const password = ref('')
const signUpEmail = ref('')
const signUpPassword = ref('')
const displayName = ref('')
const showSignUp = ref(false)

// When already authenticated (e.g. page refresh with existing session), auto-redirect to loading
// so data loads and user is sent to index without clicking "Continue to Home"
watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) return
    if (route.path !== '/public/login') return
    const redirectUrl = route.query.redirect
    if (redirectUrl) {
      router.push({ path: '/loading', query: { redirect: redirectUrl } })
    } else {
      router.push('/loading')
    }
  },
  { immediate: true },
)

// Methods
const handleSignIn = async () => {
  try {
    await signIn(email.value, password.value)
    email.value = ''
    password.value = ''

    // Check if there's a redirect URL in query params
    const redirectUrl = route.query.redirect

    // Redirect to loading page after successful login (data will load there)
    // Pass redirect URL to loading page if it exists
    if (redirectUrl) {
      router.push({ path: '/loading', query: { redirect: redirectUrl } })
    } else {
      router.push('/loading')
    }
  } catch (err) {
    console.error('Sign in error:', err)
    // Error is already handled by useFirebase composable and displayed via error ref
  }
}

const handleSignUp = async () => {
  try {
    await signUp(signUpEmail.value, signUpPassword.value, displayName.value)
    signUpEmail.value = ''
    signUpPassword.value = ''
    displayName.value = ''
    showSignUp.value = false

    // Redirect to loading page after successful registration (data will load there)
    router.push('/loading')
  } catch (err) {
    console.error('Sign up error:', err)
    // Error is already handled by useFirebase composable and displayed via error ref
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Navigate to index/home page
const goToIndex = () => {
  router.push('/')
}

// Format error messages to be more user-friendly
const formatErrorMessage = (errorMsg) => {
  if (!errorMsg) return 'An error occurred'
  
  // Map Firebase error codes to user-friendly messages
  const errorMap = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  }
  
  // Check if error message contains a known error code
  for (const [code, message] of Object.entries(errorMap)) {
    if (errorMsg.includes(code)) {
      return message
    }
  }
  
  // Return original error message if no mapping found
  return errorMsg
}
</script>

<style scoped>
.firebase-auth {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px;
}

.auth-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
}

.user-info {
  text-align: center;
  padding: 8px 0;
}

.user-info p {
  margin: 12px 0;
  color: var(--neutral-700);
  font-size: 0.95rem;
  line-height: 1.6;
}

.user-info strong {
  color: var(--neutral-900);
  font-weight: 600;
}
</style>
