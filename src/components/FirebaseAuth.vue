<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-story">
        <div class="public-auth-eyebrow">Property operations platform</div>
        <h2>Welcome back to work with <em>clarity.</em></h2>
        <p class="public-auth-story-copy">
          Keep properties, service work, documents, and transactions connected in one operational
          workspace.
        </p>
        <div class="public-auth-benefits">
          <div class="public-auth-benefit">
            <q-icon name="check_circle" size="19px" /> Tasks and leases stay in sync
          </div>
          <div class="public-auth-benefit">
            <q-icon name="check_circle" size="19px" /> Service partners work from one record
          </div>
          <div class="public-auth-benefit">
            <q-icon name="check_circle" size="19px" /> Every update remains visible
          </div>
        </div>
      </section>

      <section class="public-auth-card auth-login-card">
        <div v-if="!isAuthenticated">
          <p class="public-auth-card-label">Welcome back</p>
          <h1>Sign In to Handout</h1>
          <p class="public-auth-card-intro">
            Enter your account details to continue to your workspace.
          </p>

          <q-form @submit="handleSignIn" class="auth-form">
            <q-input
              v-model="email"
              type="email"
              label="Email address"
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

            <div class="forgot-password-row">
              <q-btn
                flat
                dense
                no-caps
                class="public-auth-text-link"
                label="Forgot password"
                @click="openForgotPasswordDialog"
              />
            </div>

            <q-btn
              color="primary"
              text-color="white"
              unelevated
              no-caps
              :loading="loading"
              label="Sign In"
              type="submit"
              class="public-auth-button full-width"
            />

            <q-btn
              outline
              color="grey-7"
              icon="public"
              label="Sign In with Google"
              :loading="socialLoading === 'google'"
              @click="handleGoogleSignIn"
              class="full-width q-mt-md"
              v-if="enableGoogleSignIn"
            />

            <div class="public-auth-switch">
              <span>Don't have an account?</span>
              <q-btn
                flat
                dense
                no-caps
                class="public-auth-text-link"
                label="Get Started"
                @click="router.push('/public/register')"
              />
            </div>
          </q-form>
        </div>

        <div v-else class="user-info">
          <p class="public-auth-card-label">Signed in</p>
          <h1>Continue to Handout</h1>
          <p><strong>Email:</strong> {{ userEmail }}</p>
          <p v-if="userDisplayName"><strong>Name:</strong> {{ userDisplayName }}</p>

          <div class="q-gutter-sm q-mt-md">
            <q-btn
              color="primary"
              label="Continue to Home"
              icon="home"
              @click="goToIndex"
              class="public-auth-button full-width"
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

        <q-banner v-if="error" rounded class="bg-negative text-white q-mt-md">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ formatErrorMessage(error) }}
        </q-banner>
      </section>
    </div>

    <q-dialog v-model="showSignUp">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Sign Up</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSignUp" class="q-gutter-md">
            <q-input v-model="signUpEmail" type="email" label="Email" required outlined />

            <q-input v-model="signUpPassword" type="password" label="Password" required outlined />

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

    <q-dialog v-model="showForgotPassword">
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">Reset Password</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="resetEmail"
            type="email"
            label="Email"
            outlined
            :rules="[(val) => !!val || 'Email is required']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            color="primary"
            text-color="white"
            label="Send Reset Link"
            :loading="loading"
            @click="handleForgotPassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'

const route = useRoute()
const router = useRouter()
const {
  loading,
  error,
  isAuthenticated,
  userEmail,
  userDisplayName,
  signIn,
  signUp,
  resetPassword,
  signInWithGoogle,
  logout,
} = useFirebase()

const email = ref('')
const password = ref('')
const signUpEmail = ref('')
const signUpPassword = ref('')
const displayName = ref('')
const showSignUp = ref(false)
const showForgotPassword = ref(false)
const resetEmail = ref('')
const socialLoading = ref('')
const redirectingAfterAuth = ref(false)
const enableGoogleSignIn = ref(false)

const goToLoadingOnce = () => {
  if (redirectingAfterAuth.value) return
  if (route.path !== '/public/login') return
  redirectingAfterAuth.value = true
  const redirectUrl = route.query.redirect
  if (redirectUrl) {
    router.replace({ path: '/loading', query: { redirect: redirectUrl } })
  } else {
    router.replace('/loading')
  }
}

watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) return
    goToLoadingOnce()
  },
  { immediate: true },
)

const handleSignIn = async () => {
  try {
    await signIn(email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (err) {
    console.error('Sign in error:', err)
  }
}

const handleSignUp = async () => {
  try {
    await signUp(signUpEmail.value, signUpPassword.value, displayName.value)
    signUpEmail.value = ''
    signUpPassword.value = ''
    displayName.value = ''
    showSignUp.value = false
    goToLoadingOnce()
  } catch (err) {
    console.error('Sign up error:', err)
  }
}

const openForgotPasswordDialog = () => {
  resetEmail.value = email.value || ''
  showForgotPassword.value = true
}

const handleForgotPassword = async () => {
  if (!resetEmail.value) {
    Notify.create({
      type: 'warning',
      message: 'Please enter your email address.',
      position: 'top',
    })
    return
  }

  try {
    await resetPassword(resetEmail.value)
    showForgotPassword.value = false
    Notify.create({
      type: 'positive',
      message: 'Password reset link sent. Please check your email.',
      position: 'top',
    })
  } catch (err) {
    console.error('Password reset error:', err)
  }
}

const handleGoogleSignIn = async () => {
  if (!enableGoogleSignIn.value) return
  try {
    socialLoading.value = 'google'
    await signInWithGoogle()
  } catch (err) {
    console.error('Google sign-in error:', err)
  } finally {
    socialLoading.value = ''
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

const goToIndex = () => {
  router.push('/')
}

const formatErrorMessage = (errorMsg) => {
  if (!errorMsg) return 'An error occurred'

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

  for (const [code, message] of Object.entries(errorMap)) {
    if (errorMsg.includes(code)) {
      return message
    }
  }

  return errorMsg
}
</script>

<style scoped>
.auth-login-card {
  align-self: center;
  max-width: 520px;
  width: 100%;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.forgot-password-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: -8px;
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
