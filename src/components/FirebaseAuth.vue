<template>
  <div class="auth-shell">
    <div class="auth-layout">
      <section class="auth-form-panel">
        <div class="auth-form-wrap">
          <div v-if="!isAuthenticated">
            <q-form @submit="handleSignIn" class="q-gutter-md">
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

              <div class="auth-inline-row">
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  label="Forgot password"
                  @click="openForgotPasswordDialog"
                />
              </div>

              <q-btn
                color="primary"
                text-color="white"
                :loading="loading"
                label="Sign in"
                type="submit"
                class="full-width auth-submit-btn"
              />

              <q-btn
                outline
                color="grey-7"
                icon="public"
                label="Sign in with Google"
                :loading="socialLoading === 'google'"
                @click="handleGoogleSignIn"
                class="full-width q-mt-md"
              />

              <div class="auth-signup-row">
                <span>Don't have an account?</span>
                <q-btn flat dense no-caps color="primary" label="Sign up" @click="showSignUp = true" />
              </div>
            </q-form>
          </div>

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

          <q-banner v-if="error" rounded class="bg-negative text-white q-mt-md">
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ formatErrorMessage(error) }}
          </q-banner>
        </div>
      </section>

      <section class="auth-visual-panel">
        <div class="visual-grid"></div>
        <div class="visual-content">
          <div class="visual-wordmark">Handout</div>
          <div class="visual-title">Manage Properties With Clarity</div>
          <div class="visual-subtitle">Ease, Clarity, Intelligence, Connection, Action</div>
          <div class="visual-dots">
            <span></span>
            <span class="active"></span>
            <span></span>
          </div>
        </div>
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

const handleSignIn = async () => {
  try {
    await signIn(email.value, password.value)
    email.value = ''
    password.value = ''

    const redirectUrl = route.query.redirect
    if (redirectUrl) {
      router.push({ path: '/loading', query: { redirect: redirectUrl } })
    } else {
      router.push('/loading')
    }
  } catch (err) {
    console.error('Sign in error:', err)
  }
}

const redirectAfterLogin = () => {
  const redirectUrl = route.query.redirect
  if (redirectUrl) {
    router.push({ path: '/loading', query: { redirect: redirectUrl } })
  } else {
    router.push('/loading')
  }
}

const handleSignUp = async () => {
  try {
    await signUp(signUpEmail.value, signUpPassword.value, displayName.value)
    signUpEmail.value = ''
    signUpPassword.value = ''
    displayName.value = ''
    showSignUp.value = false
    router.push('/loading')
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
  try {
    socialLoading.value = 'google'
    await signInWithGoogle()
    redirectAfterLogin()
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
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

.auth-shell {
  min-height: calc(100vh - 130px);
}

.auth-layout {
  min-height: calc(100vh - 130px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-surface);
}

.auth-form-panel {
  padding: 32px 56px 40px;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
}

.auth-form-wrap {
  width: min(100%, 460px);
  margin: auto;
}

.auth-inline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.auth-submit-btn {
  border-radius: 8px;
  min-height: 44px;
}

.auth-signup-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  color: var(--neutral-600);
}

.auth-visual-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.visual-grid {
  position: absolute;
  inset: 0;
  opacity: 0.24;
  background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.35) 1px, transparent 0);
  background-size: 26px 26px;
}

.visual-content {
  position: relative;
  z-index: 1;
  width: min(100%, 540px);
  text-align: center;
  color: white;
}

.visual-wordmark {
  font-family: 'Pacifico', cursive;
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
}

.visual-title {
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.visual-subtitle {
  margin-top: 8px;
  font-size: 1rem;
  opacity: 0.92;
}

.visual-dots {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.visual-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.visual-dots .active {
  background: rgba(255, 255, 255, 0.9);
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

@media (max-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-visual-panel {
    display: none;
  }

  .auth-form-panel {
    padding: 20px 18px 32px;
  }

}
</style>
