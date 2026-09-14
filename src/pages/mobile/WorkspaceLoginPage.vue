<template>
  <q-page class="ios-login">
    <h1>Handout</h1>
    <q-form class="ios-form" @submit="login">
      <q-input
        v-model="email"
        outlined
        label="Email"
        type="email"
        autocomplete="username"
        :rules="[(v) => !!v || 'Enter your email']"
      />
      <q-input
        v-model="password"
        outlined
        label="Password"
        type="password"
        autocomplete="current-password"
        :rules="[(v) => !!v || 'Enter your password']"
      />
      <p v-if="error" class="ios-error" role="alert">{{ error }}</p>
      <q-btn class="ios-primary" unelevated no-caps label="Sign in" type="submit" :loading="busy" />
      <q-btn flat no-caps label="Forgot password?" :disable="busy" @click="reset" />
      <q-btn
        flat
        no-caps
        label="Create an account"
        href="https://tobbythebutler.web.app/public/register"
        target="_blank"
        rel="noopener noreferrer"
      />
    </q-form>
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
