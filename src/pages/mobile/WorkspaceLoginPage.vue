<template>
  <q-page class="ios-login">
    <div class="ios-login-brand"><span class="ios-brand-mark" aria-hidden="true">h</span><strong>Handout</strong></div>
    <header class="ios-login-heading"><h1>Welcome back</h1><p>Sign in to manage your properties.</p></header>
    <q-form class="ios-form ios-login-card" @submit="login">
      <q-input
        v-model="email"
        outlined
        label="Email"
        type="email"
        autocomplete="username"
        autocapitalize="none"
        :spellcheck="false"
        :rules="[(v) => !!v || 'Enter your email']"
      />
      <q-input
        v-model="password"
        outlined
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        :rules="[(v) => !!v || 'Enter your password']"
      >
        <template #append><q-btn flat round dense :icon="showPassword ? 'visibility_off' : 'visibility'" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword" /></template>
      </q-input>
      <p v-if="error" class="ios-error" role="alert">{{ error }}</p>
      <q-btn flat no-caps label="Forgot password?" :disable="busy" @click="reset" />
      <q-btn class="ios-primary" unelevated no-caps label="Sign in" type="submit" :loading="busy" />
    </q-form>
    <div class="ios-login-register"><span>New to Handout?</span>
      <q-btn
        flat
        no-caps
        label="Create an account"
        href="https://tobbythebutler.web.app/public/register"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from 'src/boot/firebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { Notify } from 'quasar'
const store = useUserDataStore(),
  router = useRouter(),
  route = useRoute()
const email = ref(''),
  showPassword = ref(false),
  password = ref(''),
  busy = ref(false),
  error = ref('')
async function login() {
  busy.value = true
  error.value = ''
  let timer
  try {
    const result = await Promise.race([
      signInWithEmailAndPassword(auth, email.value.trim(), password.value),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Sign-in timed out. Please try again.')), 20000)
      }),
    ])
    await store.setUser(result.user)
    const target = String(route.query.redirect || '')
    await router.replace(target.startsWith('/inventory-review/') ? target : '/mobile/pm/home')
  } catch (err) {
    error.value = err.message || 'Unable to sign in.'
  } finally {
    clearTimeout(timer)
    busy.value = false
  }
}
async function reset() {
  if (!email.value.trim()) {
    error.value = 'Enter your email first.'
    return
  }
  busy.value = true
  try {
    await sendPasswordResetEmail(auth, email.value.trim())
    Notify.create({ message: 'Password reset email requested.' })
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
</script>
