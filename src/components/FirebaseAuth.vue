<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-card auth-login-card">
        <template v-if="!isAuthenticated && showForgotPassword">
          <p class="public-auth-card-label">ACCOUNT RECOVERY</p>
          <h1>Reset your password</h1>
          <p class="public-auth-card-intro">We'll email you a link to choose a new password.</p>
          <q-form
            class="auth-form"
            data-testid="reset-password-form"
            @submit="handleForgotPassword"
          >
            <q-input
              v-model="resetEmail"
              type="email"
              name="email"
              autocomplete="email"
              inputmode="email"
              autocapitalize="none"
              spellcheck="false"
              label="Email address"
              outlined
              required
              hide-bottom-space
              lazy-rules
              :disable="loading"
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-banner v-if="resetError" class="auth-error" role="alert">{{ resetError }}</q-banner>
            <q-btn
              type="submit"
              label="Send reset link"
              no-caps
              unelevated
              :loading="loading"
              class="public-auth-button full-width"
            />
            <q-btn
              flat
              no-caps
              label="Back to sign in"
              icon="arrow_back"
              class="public-auth-text-link"
              :disable="loading"
              @click="showForgotPassword = false"
            />
          </q-form>
        </template>
        <template v-else-if="!isAuthenticated">
          <p class="public-auth-card-label">WELCOME BACK</p>
          <h1>Sign in</h1>
          <p class="public-auth-card-intro">Your properties, right where you left them.</p>
          <q-form data-testid="pm-login-form" @submit="handleSignIn" class="auth-form">
            <q-input
              v-model="email"
              data-testid="pm-login-email"
              type="email"
              name="email"
              autocomplete="username"
              inputmode="email"
              autocapitalize="none"
              spellcheck="false"
              label="Email address"
              required
              outlined
              hide-bottom-space
              lazy-rules
              :disable="loading"
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-input
              v-model="password"
              data-testid="pm-login-password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              label="Password"
              required
              outlined
              hide-bottom-space
              lazy-rules
              :disable="loading"
              :rules="[(val) => !!val || 'Password is required']"
            >
              <template #append>
                <q-btn
                  type="button"
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  :aria-pressed="showPassword"
                  class="auth-password-toggle"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
            <div class="forgot-password-row">
              <q-btn
                flat
                dense
                no-caps
                class="public-auth-text-link"
                label="Forgot password?"
                :disable="loading"
                @click="openForgotPasswordDialog"
              />
            </div>
            <q-banner v-if="error" class="auth-error" role="alert">{{
              formatErrorMessage(error)
            }}</q-banner>
            <q-btn
              data-testid="pm-login-submit"
              unelevated
              no-caps
              :loading="loading"
              label="Sign in"
              type="submit"
              class="public-auth-button full-width"
            />
          </q-form>
          <div class="public-auth-switch">
            <span>New to Handout?</span>
            <q-btn
              flat
              dense
              no-caps
              class="public-auth-text-link"
              label="Create account"
              :to="{
                path: '/public/register',
                query: route.query.redirect ? { redirect: route.query.redirect } : {},
              }"
            />
          </div>
        </template>
        <div v-else class="user-info">
          <p class="public-auth-card-label">SIGNED IN</p>
          <h1>Welcome back</h1>
          <p>{{ userEmail }}</p>
          <div class="auth-form">
            <q-btn
              label="Open workspace"
              no-caps
              @click="goToIndex"
              class="public-auth-button full-width"
            />
            <q-btn
              flat
              no-caps
              @click="handleLogout"
              :loading="loading"
              label="Sign out"
              class="public-auth-text-link"
            />
          </div>
        </div>
      </section>
      <AuthWorkspaceStory />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { auth, authStateReady } from '../boot/firebase'
import AuthWorkspaceStory from './AuthWorkspaceStory.vue'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { loading, error, isAuthenticated, userEmail, signIn, resetPassword, logout } = useFirebase()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const resetError = ref('')
const showForgotPassword = ref(false)
const resetEmail = ref('')
const redirectingAfterAuth = ref(false)

const getSafeRedirect = () => {
  const target = String(route.query.redirect || '').trim()
  return target.startsWith('/') && !target.startsWith('//') ? target : ''
}

const goToLoadingOnce = async () => {
  if (redirectingAfterAuth.value) return
  if (route.path !== '/public/login') return
  redirectingAfterAuth.value = true

  try {
    await authStateReady
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
      redirectingAfterAuth.value = false
      return
    }

    // `useFirebase()` receives auth state before the router guard necessarily
    // sees the Pinia user. Start store hydration before crossing into a private route.
    await userDataStore.setUser(firebaseUser)
    await nextTick()

    const redirectUrl = getSafeRedirect()
    await router.replace(
      redirectUrl ? { path: '/loading', query: { redirect: redirectUrl } } : '/loading',
    )
  } catch (error) {
    redirectingAfterAuth.value = false
    Notify.create({
      type: 'negative',
      message:
        'Your account was verified, but the workspace could not be opened. Please try again.',
      position: 'top',
    })
    console.error('Failed to open authenticated workspace:', error)
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
    await goToLoadingOnce()
  } catch (err) {
    console.error('Sign in error:', err)
  }
}

const openForgotPasswordDialog = () => {
  resetEmail.value = email.value || ''
  resetError.value = ''
  showForgotPassword.value = true
}

const handleForgotPassword = async () => {
  resetError.value = ''
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
    resetError.value = formatErrorMessage(
      err.message || 'Unable to send a reset link. Please try again.',
    )
    console.error('Password reset error:', err)
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
