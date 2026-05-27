<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-story">
        <div class="public-auth-eyebrow">Service Provider workspace</div>
        <h2>Turn requests into <em>active projects.</em></h2>
        <p class="public-auth-story-copy">
          Present your services, receive opportunities, submit bids, and invoice within one
          workflow.
        </p>
        <div class="public-auth-benefits">
          <div class="public-auth-benefit">
            <q-icon name="campaign" size="19px" /> Find qualified service leads
          </div>
          <div class="public-auth-benefit">
            <q-icon name="request_quote" size="19px" /> Submit bids and invoices
          </div>
          <div class="public-auth-benefit">
            <q-icon name="verified" size="19px" /> Build a consistent service profile
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
        <h1>Service Provider</h1>
        <p class="public-auth-card-intro">Create a provider profile to receive and manage work.</p>

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
          <div class="form-section-title">Business Info</div>

          <q-input
            v-model="form.businessName"
            label="Business / Trade Name *"
            outlined
            :rules="[(val) => !!val || 'Business name is required']"
          >
            <template v-slot:prepend><q-icon name="storefront" /></template>
          </q-input>

          <q-select
            v-model="form.serviceCategories"
            :options="serviceCategoryOptions"
            label="Service Categories *"
            outlined
            multiple
            use-chips
            :rules="[(val) => (val && val.length > 0) || 'Select at least one category']"
          >
            <template v-slot:prepend><q-icon name="build" /></template>
          </q-select>
          <div class="text-caption text-grey-7 q-mt-xs">
            Service area is configured after signup in `Services` using the map.
          </div>

          <q-input
            v-model="form.registeredBusinessAddress"
            label="Registered Business Address *"
            outlined
            :rules="[
              (val) => !!String(val || '').trim() || 'Registered business address is required',
            ]"
          >
            <template v-slot:prepend><q-icon name="business" /></template>
          </q-input>

          <q-input v-model="form.licenseNumber" label="License Number (optional)" outlined>
            <template v-slot:prepend><q-icon name="badge" /></template>
          </q-input>

          <q-input
            v-model="form.phone"
            label="Phone Number *"
            outlined
            type="tel"
            :rules="[(val) => !!val || 'Phone is required']"
          >
            <template v-slot:prepend><q-icon name="phone" /></template>
          </q-input>

          <q-banner v-if="errorMessage" class="bg-negative text-white q-mt-sm" rounded>
            <template v-slot:avatar><q-icon name="error" /></template>
            {{ errorMessage }}
          </q-banner>

          <q-btn
            type="submit"
            color="primary"
            label="Create Service Provider Account"
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

const serviceCategoryOptions = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Roofing',
  'General Maintenance',
  'Landscaping',
  'Pest Control',
  'Appliance Repair',
  'Carpentry',
  'Flooring',
  'Locksmith',
  'Cleaning',
  'Other',
]

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  businessName: '',
  serviceCategories: [],
  registeredBusinessAddress: '',
  licenseNumber: '',
  phone: '',
})

const handleSignUp = async () => {
  const registeredAddress = String(form.value.registeredBusinessAddress || '').trim()
  if (!registeredAddress) {
    errorMessage.value = 'Registered business address is required.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const result = await signUp(form.value.email, form.value.password, form.value.fullName)
    const userId = result.user.uid
    const now = new Date()
    const seededDescriptions = (
      Array.isArray(form.value.serviceCategories) ? form.value.serviceCategories : []
    )
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0)

    isCreatingProfile.value = true
    await createDocument(
      'users',
      {
        user_id: userId,
        email: form.value.email,
        user_name: form.value.fullName,
        full_name: form.value.fullName,
        phone: form.value.phone,
        business_name: form.value.businessName,
        service_categories: form.value.serviceCategories,
        sp_service_profile: {
          sp_id: userId,
          service_descriptions: seededDescriptions,
          service_zip_codes: [],
          service_area_shape: null,
          service_map_view: null,
          created_at: now,
          updated_at: now,
        },
        registered_business_address: registeredAddress,
        license_number: form.value.licenseNumber || '',
        account_type: 'sp',
        account_type_locked: true,
        account_type_selected_at: now,
        user_category: 'sp',
        manage_scope: ['NA'],
        created_at: now,
        updated_at: now,
      },
      userId,
    )

    await userDataStore.loadUserProfile()

    Notify.create({ type: 'positive', message: 'Service provider account created!', position: 'top' })
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
