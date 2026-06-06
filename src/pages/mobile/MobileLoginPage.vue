<template>
  <main class="mobile-login-page">
    <section class="mobile-login-shell">
      <div class="mobile-login-brand">
        <div class="mobile-login-mark">H</div>
        <div>
          <div class="mobile-login-eyebrow">Handout Mobile</div>
          <h1>Sign in</h1>
        </div>
      </div>

      <q-form class="mobile-login-form" @submit.prevent="submit">
        <q-input
          v-model.trim="email"
          label="Email"
          type="email"
          autocomplete="email"
          inputmode="email"
          :disable="loading"
          outlined
          dense
        />
        <q-input
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          :disable="loading"
          outlined
          dense
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              :icon="showPassword ? 'visibility_off' : 'visibility'"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="mobile-login-error">
          {{ errorMessage }}
        </div>
        <div v-else-if="statusMessage" class="mobile-login-status">
          {{ statusMessage }}
        </div>

        <q-btn
          class="mobile-login-submit"
          type="submit"
          label="Continue"
          unelevated
          no-caps
          :loading="loading"
          :disable="!canSubmit"
        />

        <div class="mobile-login-register">
          <span>New to Tobby?</span>
          <button type="button" class="mobile-login-register__link" @click="openRegisterPage">
            Create account on web
          </button>
        </div>
      </q-form>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from 'boot/firebase'
import { useUserDataStore } from 'stores/userDataStore'
import { getMobileHomePathForStore } from 'src/utils/mobileRuntime'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')

const canSubmit = computed(() => {
  return email.value.includes('@') && password.value.length >= 6 && !loading.value
})

const webOrigin = computed(() => {
  if (typeof window === 'undefined') return 'https://tobbythebutler.com'
  const origin = String(window.location.origin || '').replace(/\/$/, '')
  if (/^https?:\/\//i.test(origin)) return origin
  return String(import.meta.env.VITE_PUBLIC_WEB_ORIGIN || 'https://tobbythebutler.com').replace(/\/$/, '')
})

const registerUrl = computed(() => new URL('/public/register', webOrigin.value).toString())

const wait = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms)
})

const withTimeout = (promise, ms, message) => {
  return Promise.race([
    promise,
    wait(ms).then(() => {
      throw new Error(message)
    }),
  ])
}

const openRegisterPage = () => {
  window.open(registerUrl.value, '_blank', 'noopener,noreferrer')
}

const submit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  errorMessage.value = ''
  statusMessage.value = 'Signing in...'

  try {
    const credential = await withTimeout(
      signInWithEmailAndPassword(auth, email.value, password.value),
      45000,
      'Sign-in timed out. Check the network and try again.',
    )
    statusMessage.value = 'Loading account...'
    const initializePromise = userDataStore.initialize(credential.user, true).catch((error) => {
      console.error('Mobile login data initialization failed:', error)
    })
    await Promise.race([initializePromise, wait(3500)])
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const target = redirect.startsWith('/mobile') ? redirect : getMobileHomePathForStore(userDataStore)
    statusMessage.value = 'Opening mobile app...'
    await withTimeout(router.replace(target), 5000, 'Mobile route did not open. Please try again.')
  } catch (error) {
    console.error('Mobile login failed:', error)
    errorMessage.value = error?.message || 'Email or password is incorrect.'
  } finally {
    loading.value = false
    statusMessage.value = ''
  }
}
</script>

<style scoped>
.mobile-login-page {
  min-height: 100vh;
  background: var(--mobile-bg, var(--bg-primary, #f7f9fc));
  color: var(--neutral-900, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 22px;
}

.mobile-login-shell {
  width: min(100%, 390px);
}

.mobile-login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.mobile-login-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--mobile-primary, var(--primary-color, #334155));
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.mobile-login-eyebrow {
  font-size: 12px;
  line-height: 1.2;
  color: var(--mobile-muted, var(--neutral-600, #475569));
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.mobile-login-brand h1 {
  margin: 4px 0 0;
  font-size: 24px;
  line-height: 1.18;
  font-weight: 700;
}

.mobile-login-form {
  display: grid;
  gap: 14px;
}

.mobile-login-form :deep(.q-field) {
  color: var(--mobile-text, var(--neutral-900, #0f172a));
  font-size: 13px;
}

.mobile-login-form :deep(.q-field--outlined .q-field__control) {
  min-height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.64);
}

.mobile-login-form :deep(.q-field--outlined .q-field__control::before) {
  border-color: var(--mobile-border, var(--neutral-200, #d6dee8));
}

.mobile-login-form :deep(.q-field--outlined .q-field__control::after) {
  border-width: 1px;
  border-color: var(--mobile-primary, var(--primary-color, #334155));
}

.mobile-login-form :deep(.q-field__native),
.mobile-login-form :deep(.q-field__input) {
  color: var(--mobile-text, var(--neutral-900, #0f172a));
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
}

.mobile-login-form :deep(.q-field__label) {
  color: var(--mobile-muted, var(--neutral-600, #475569));
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
}

.mobile-login-form :deep(.q-field--float .q-field__label) {
  font-size: 11px;
  font-weight: 500;
}

.mobile-login-error {
  border: 1px solid var(--status-danger-border, #fca5a5);
  border-radius: 12px;
  background: var(--status-danger-bg, #fff0f1);
  color: var(--status-danger-text, #991b1b);
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.35;
}

.mobile-login-status {
  color: var(--mobile-muted, var(--neutral-600, #475569));
  font-size: 13px;
  line-height: 1.35;
}

.mobile-login-submit {
  height: 48px;
  border-radius: 12px;
  background: var(--mobile-primary, var(--primary-color, #334155));
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
}

.mobile-login-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--mobile-muted, var(--neutral-600, #475569));
  font-size: 12px;
  line-height: 1.3;
}

.mobile-login-register__link {
  padding: 0;
  border: 0;
  color: var(--mobile-primary, var(--primary-color, #334155));
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  letter-spacing: 0;
}
</style>
