<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="submit">
      <h2 style="margin-top: 0">Admin Console Login</h2>
      <p style="color: var(--muted)">Use Firebase email/password account with admin claim.</p>
      <div style="display: grid; gap: 10px">
        <input v-model="form.email" type="email" placeholder="Admin Email" required />
        <input v-model="form.password" type="password" placeholder="Password" required />
        <button class="primary" type="submit">Enter</button>
      </div>
      <p v-if="error" style="color: #b91c1c">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithFirebase } from '../services/adminApi'

const router = useRouter()
const error = ref('')
const form = reactive({
  email: '',
  password: '',
})

const submit = async () => {
  error.value = ''
  try {
    const ok = await loginWithFirebase(form.email, form.password)
    if (!ok) {
      error.value = 'Login succeeded, but this account is not admin (missing admin claim).'
      return
    }
    router.push('/overview')
  } catch (err) {
    error.value = err?.message || 'Firebase login failed.'
  }
}
</script>
