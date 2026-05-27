<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-story">
        <div class="public-auth-eyebrow">Property Manager workspace</div>
        <h2>Operate every property with <em>one clear record.</em></h2>
        <p class="public-auth-story-copy">
          Set up your management workspace for leases, tasks, transactions, service partners, and
          owner communication.
        </p>
        <div class="public-auth-benefits">
          <div class="public-auth-benefit">
            <q-icon name="apartment" size="19px" /> Centralized property operations
          </div>
          <div class="public-auth-benefit">
            <q-icon name="description" size="19px" /> Leases and documents together
          </div>
          <div class="public-auth-benefit">
            <q-icon name="handyman" size="19px" /> Track maintenance from request to close
          </div>
        </div>
      </section>

      <section class="public-auth-card public-auth-card--form">
        <q-btn
          flat
          dense
          no-caps
          icon="arrow_back"
          label="Choose another workspace"
          class="public-auth-back"
          @click="router.push('/public/register')"
        />
        <p class="public-auth-card-label">Create account</p>
        <h1>Create Your Property Manager Workspace</h1>
        <p class="public-auth-card-intro">
          Organize operations and invite owners to view relevant property records.
        </p>

        <div v-if="isCreatingProfile" class="public-auth-loading">
          <q-spinner-dots size="60px" color="primary" />
          <p class="loading-text">Setting up your account...</p>
        </div>

        <q-form v-else @submit="handleSignUp" class="signup-form">
          <div class="form-section-title">Account</div>
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
            unelevated
            no-caps
            :loading="loading"
            class="public-auth-button full-width q-mt-md"
          />
        </q-form>

        <div class="public-auth-switch">
          <span>Already have an account?</span>
          <q-btn
            flat
            dense
            no-caps
            class="public-auth-text-link"
            label="Sign In"
            @click="router.push('/public/login')"
          />
        </div>
      </section>
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
    await createDocument(
      'users',
      {
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
      },
      userId,
    )

    await userDataStore.loadUserProfile()

    Notify.create({
      type: 'positive',
      message: 'Manager account created successfully.',
      position: 'top',
    })
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
  color: var(--auth-ink-soft);
}

.loading-text {
  margin-top: 16px;
  color: var(--auth-ink-soft);
}

@media (max-width: 600px) {
  .public-auth-card {
    padding: 28px 20px;
  }
}
</style>
