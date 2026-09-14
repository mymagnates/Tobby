<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-card public-auth-card--form">
        <p class="public-auth-card-label">GET STARTED</p>
        <h1>Create your account</h1>
        <p class="public-auth-card-intro">A simpler workspace for your properties.</p>
        <div v-if="isCreatingProfile" class="public-auth-loading" role="status" aria-live="polite">
          <q-spinner-dots size="40px" color="primary" />
          <p class="loading-text">Setting up your account...</p>
        </div>
        <q-form v-else data-testid="pm-signup-form" @submit="handleSignUp" class="signup-form">
          <q-input
            v-model="form.fullName"
            name="name"
            autocomplete="name"
            label="Full name"
            outlined
            required
            hide-bottom-space
            lazy-rules
            :disable="loading"
            :rules="[(val) => !!val?.trim() || 'Full name is required']"
          />
          <q-input
            v-model="form.email"
            type="email"
            name="email"
            autocomplete="username"
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
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="new-password"
            label="Password"
            outlined
            required
            hide-bottom-space
            lazy-rules
            :disable="loading"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 6 || 'Use at least 6 characters',
            ]"
          >
            <template #append>
              <q-btn
                type="button"
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
                :aria-pressed="showPassword"
                class="auth-password-toggle"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            name="confirm-password"
            autocomplete="new-password"
            label="Confirm password"
            outlined
            required
            hide-bottom-space
            lazy-rules
            :disable="loading"
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === form.password || 'Passwords do not match',
            ]"
          />
          <details class="auth-optional-details">
            <summary>Additional details <span>Optional</span></summary>
            <div class="auth-optional-fields">
              <p>You can add these now or complete your profile later.</p>
              <q-input
                v-model="form.companyName"
                name="organization"
                autocomplete="organization"
                label="Company name"
                outlined
                hide-bottom-space
                :disable="loading"
              />
              <q-input
                v-model="form.phone"
                name="tel"
                autocomplete="tel"
                label="Phone number"
                outlined
                type="tel"
                hide-bottom-space
                :disable="loading"
              />
              <fieldset class="auth-scope-fieldset" :disabled="loading">
                <legend>I manage</legend>
                <q-option-group
                  v-model="form.manageScope"
                  :options="manageScopeOptions"
                  type="checkbox"
                  color="primary"
                  class="manage-scope-options"
                  :disable="loading"
                />
              </fieldset>
            </div>
          </details>
          <q-banner v-if="errorMessage" class="auth-error" role="alert">{{
            errorMessage
          }}</q-banner>
          <q-btn
            data-testid="pm-signup-submit"
            type="submit"
            label="Create account"
            unelevated
            no-caps
            :loading="loading"
            class="public-auth-button full-width"
          />
        </q-form>
        <div class="public-auth-switch">
          <span>Already have an account?</span>
          <q-btn
            flat
            dense
            no-caps
            class="public-auth-text-link"
            label="Sign in"
            :to="{
              path: '/public/login',
              query: route.query.redirect ? { redirect: route.query.redirect } : {},
            }"
          />
        </div>
      </section>
      <AuthWorkspaceStory />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'
import AuthWorkspaceStory from '../components/AuthWorkspaceStory.vue'

const router = useRouter()
const route = useRoute()
const showPassword = ref(false)
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
  manageScope: ['Own'],
})

const manageScopeOptions = [
  { label: 'My own properties', value: 'Own' },
  { label: 'Properties for others', value: 'Others' },
]

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
        manage_scope: Array.isArray(form.value.manageScope) ? form.value.manageScope : [],
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
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.push(
      target.startsWith('/') && !target.startsWith('//')
        ? { path: '/loading', query: { redirect: target } }
        : '/loading',
    )
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

.loading-text {
  margin-top: 16px;
  color: var(--auth-ink-soft);
}

.manage-scope-options {
  padding: 4px 0 2px;
}
</style>
