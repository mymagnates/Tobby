<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="header-section">
        <h1 class="app-title">Handout</h1>

      </div>

      <div v-if="isCreatingProfile" class="loading-section">
        <q-spinner-dots size="60px" color="primary" />
        <p class="loading-text">Setting up your account...</p>
      </div>

      <q-form v-else @submit="handleSignUp" class="signup-form">
        <div class="form-section-title"></div>
        <q-input
          v-model="form.email"
          type="email"
          label="Email *"
          outlined
          :rules="[(val) => !!val || 'Email is required']"
        >
          <template v-slot:prepend><q-icon name="email" /></template>
        </q-input>

        <q-input
          v-model="form.password"
          type="password"
          label="Password *"
          outlined
          :rules="[
            (val) => !!val || 'Password is required',
            (val) => val.length >= 6 || 'At least 6 characters',
          ]"
        >
          <template v-slot:prepend><q-icon name="lock" /></template>
        </q-input>

        <q-input
          v-model="form.confirmPassword"
          type="password"
          label="Confirm Password *"
          outlined
          :rules="[
            (val) => !!val || 'Please confirm your password',
            (val) => val === form.password || 'Passwords do not match',
          ]"
        >
          <template v-slot:prepend><q-icon name="lock" /></template>
        </q-input>

        <q-input
          v-model="form.fullName"
          label="Full Name *"
          outlined
          :rules="[(val) => !!val || 'Full name is required']"
        >
          <template v-slot:prepend><q-icon name="person" /></template>
        </q-input>

        <q-separator class="q-my-sm" />
        <div class="form-section-title">Profile</div>

        <q-input v-model="form.companyName" label="Company / Business Name" outlined>
          <template v-slot:prepend><q-icon name="business" /></template>
        </q-input>

        <q-input v-model="form.phone" label="Phone Number" outlined type="tel">
          <template v-slot:prepend><q-icon name="phone" /></template>
        </q-input>

        <q-banner v-if="errorMessage" class="bg-negative text-white q-mt-sm" rounded>
          <template v-slot:avatar><q-icon name="error" /></template>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Create Account"
          size="lg"
          unelevated
          :loading="loading"
          class="full-width q-mt-md"
        />
      </q-form>

      <div class="signup-footer">
        <span>Already have an account?</span>
        <q-btn flat dense no-caps color="primary" label="Sign in" @click="router.push('/public/login')" />
      </div>
      <div class="signup-back">
        <q-btn flat dense no-caps color="grey-7" icon="arrow_back" label="Back to role selection" @click="router.push('/public/register')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'

const router = useRouter()
const { signUp, createDocument } = useFirebase()
const userDataStore = useUserDataStore()

const loading = ref(false)
const isCreatingProfile = ref(false)
const errorMessage = ref('')

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  companyName: '',
  phone: '',
})

const handleSignUp = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await signUp(form.value.email, form.value.password, form.value.fullName)
    const userId = result.user.uid

    isCreatingProfile.value = true
    await createDocument('users', {
      user_id: userId,
      email: form.value.email,
      user_name: form.value.fullName,
      full_name: form.value.fullName,
      phone: form.value.phone || '',
      company_name: form.value.companyName || '',
      account_type: 'pm',
      account_type_locked: true,
      account_type_selected_at: new Date(),
      user_category: 'pm',
      owner_workspace_only: false,
      created_at: new Date(),
      updated_at: new Date(),
    }, userId)

    await userDataStore.loadUserProfile()

    Notify.create({ type: 'positive', message: 'Manager account created successfully.', position: 'top' })
    router.push('/loading')
  } catch (err) {
    errorMessage.value = err.message || 'Failed to create account.'
  } finally {
    loading.value = false
    isCreatingProfile.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

.signup-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color, #5c6bc0) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.signup-container {
  background: white;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  max-width: 500px;
  width: 100%;
}

.header-section {
  text-align: center;
  margin-bottom: 24px;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--primary-color);
  margin: 0 0 6px 0;
}

.signup-role-tag {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1565c0;
  background: #e3f2fd;
  padding: 4px 14px;
  border-radius: 20px;
  margin: 0;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #757575;
}

.form-field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 4px;
}

.loading-section {
  text-align: center;
  padding: 48px 24px;
}
.loading-text {
  margin-top: 16px;
  color: #666;
}

.signup-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  color: #757575;
  font-size: 0.88rem;
}

.signup-back {
  text-align: center;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .signup-container { padding: 28px 20px; }
}
</style>
