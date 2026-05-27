<template>
  <div class="public-auth-page">
    <div class="public-auth-frame">
      <section class="public-auth-story">
        <div class="public-auth-eyebrow">Tenant workspace</div>
        <h2>Stay connected to your <em>home.</em></h2>
        <p class="public-auth-story-copy">
          Access lease details, submit requests, and follow updates from the same trusted workspace.
        </p>
        <div class="public-auth-benefits">
          <div class="public-auth-benefit">
            <q-icon name="description" size="19px" /> Lease details in one place
          </div>
          <div class="public-auth-benefit">
            <q-icon name="construction" size="19px" /> Submit and track maintenance
          </div>
          <div class="public-auth-benefit">
            <q-icon name="notifications_none" size="19px" /> Receive timely updates
          </div>
        </div>
      </section>

      <section class="public-auth-card public-auth-card--form tenant-auth-card">
        <q-btn
          v-if="isSelfRegister"
          flat
          dense
          no-caps
          icon="arrow_back"
          label="Choose another workspace"
          class="public-auth-back"
          @click="router.push('/public/register')"
        />
        <p class="public-auth-card-label">Create account</p>
        <h1>Tenant access</h1>
        <p class="public-auth-card-intro">
          {{
            isSelfRegister
              ? 'Create your tenant account to get started.'
              : 'Accept your invitation and access your lease workspace.'
          }}
        </p>

        <div class="header-section">
          <div v-if="property" class="property-info">
            <q-icon name="home" size="24px" color="primary" />
            <div class="property-details">
              <p class="property-name">{{ property.nickname || property.address }}</p>
              <p class="property-subtitle">
                {{ invitedLease ? `Lease Invite: ${invitedLease.id}` : 'Tenant Registration' }}
              </p>
            </div>
          </div>
          <div v-else-if="isSelfRegister" class="property-info self-register-info">
            <q-icon name="person_add" size="24px" color="primary" />
            <div class="property-details">
              <p class="property-name">Tenant Registration</p>
              <p class="property-subtitle">
                Your property manager can link you to a property later
              </p>
            </div>
          </div>
          <div v-else-if="!propertyLoading" class="property-error">
            <q-icon name="error" color="negative" size="32px" />
            <p>Property not found</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="propertyLoading || isCreatingProfile" class="loading-section">
          <q-spinner-dots size="60px" color="primary" />
          <p class="loading-text">
            {{
              isCreatingProfile
                ? 'Setting up your tenant profile...'
                : 'Loading property details...'
            }}
          </p>
        </div>

        <!-- Auth Forms (show when property loaded OR self-register) -->
        <div v-else-if="!isAuthenticated && (property || isSelfRegister)" class="auth-section">
          <!-- Toggle between sign up and sign in -->
          <q-tabs
            v-model="activeTab"
            class="auth-tabs"
            align="justify"
            narrow-indicator
            active-color="primary"
          >
            <q-tab name="signup" label="Sign Up" />
            <q-tab name="login" label="Sign In" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="signup">
              <q-form @submit="handleSignUp" class="auth-form">
                <q-input
                  v-model="signupForm.email"
                  type="email"
                  label="Email *"
                  outlined
                  :rules="[(val) => !!val || 'Email is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  v-model="signupForm.password"
                  type="password"
                  label="Password *"
                  outlined
                  :rules="[
                    (val) => !!val || 'Password is required',
                    (val) => val.length >= 6 || 'Password must be at least 6 characters',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  v-model="signupForm.confirmPassword"
                  type="password"
                  label="Confirm Password *"
                  outlined
                  :rules="[
                    (val) => !!val || 'Please confirm your password',
                    (val) => val === signupForm.password || 'Passwords do not match',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  v-model="signupForm.fullName"
                  label="Full Name *"
                  outlined
                  :rules="[(val) => !!val || 'Full name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input v-model="signupForm.phone" label="Phone Number" outlined type="tel">
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>

                <div class="form-actions">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Create Tenant Account"
                    size="lg"
                    unelevated
                    :loading="loading"
                    no-caps
                    class="public-auth-button full-width"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <q-tab-panel name="login">
              <q-form @submit="handleLogin" class="auth-form">
                <q-input
                  v-model="loginForm.email"
                  type="email"
                  label="Email *"
                  outlined
                  :rules="[(val) => !!val || 'Email is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  v-model="loginForm.password"
                  type="password"
                  label="Password *"
                  outlined
                  :rules="[(val) => !!val || 'Password is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <div class="form-actions">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Sign In"
                    size="lg"
                    unelevated
                    :loading="loading"
                    no-caps
                    class="public-auth-button full-width"
                  />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <!-- Already authenticated message -->
        <div
          v-else-if="isAuthenticated && (property || isSelfRegister)"
          class="already-authenticated"
        >
          <q-icon name="check_circle" color="positive" size="64px" />
          <p class="success-message">You are already logged in!</p>
          <p class="success-detail">Redirecting to your tenant dashboard...</p>
        </div>

        <!-- Error Display -->
        <div v-if="errorMessage" class="error-section">
          <q-banner class="bg-negative text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { signUp, signIn, createDocument, updateDocument } = useFirebase()
const userDataStore = useUserDataStore()

// State
const activeTab = ref('signup')
const property = ref(null)
const invitedLease = ref(null)
const propertyLoading = ref(false)
const loading = ref(false)
const isCreatingProfile = ref(false)
const errorMessage = ref('')

// Form data
const signupForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
})

const loginForm = ref({
  email: '',
  password: '',
})

// Computed
const isAuthenticated = computed(() => userDataStore.isAuthenticated)
const leaseIdFromInvite = computed(() =>
  String(route.params.leaseId || route.query.lease_id || '').trim(),
)
const isSelfRegister = computed(() => !leaseIdFromInvite.value)

const toLeaseSnapshot = (leaseRecord) => {
  if (!leaseRecord) return null
  return {
    lease_id: leaseRecord.id || null,
    status: leaseRecord.status || null,
    rate_amount: leaseRecord.rate_amount || null,
    rate_type: leaseRecord.rate_type || null,
    lease_term: leaseRecord.lease_term || null,
    lease_start_date: leaseRecord.lease_start_date || null,
    lease_end_date: leaseRecord.lease_end_date || null,
    property_id: leaseRecord.property_id?.id || leaseRecord.property_id || null,
  }
}

const resolvePropertyId = () =>
  property.value?.id ||
  invitedLease.value?.property_id?.id ||
  invitedLease.value?.property_id ||
  null

// Methods
const loadProperty = async () => {
  if (!leaseIdFromInvite.value) return

  try {
    propertyLoading.value = true
    errorMessage.value = ''

    // Invite link is lease-first: /public/tenant-signup/{lease_id}
    const leaseDoc = await getDoc(doc(db, 'leases', leaseIdFromInvite.value))
    if (leaseDoc.exists()) {
      invitedLease.value = {
        id: leaseDoc.id,
        ...leaseDoc.data(),
      }
      const propertyIdFromLease =
        invitedLease.value.property_id?.id || invitedLease.value.property_id
      if (propertyIdFromLease) {
        const propertyDoc = await getDoc(doc(db, 'properties', propertyIdFromLease))
        if (propertyDoc.exists()) {
          property.value = {
            id: propertyDoc.id,
            ...propertyDoc.data(),
          }
          return
        }
      }
    }
    errorMessage.value = 'Invite link is invalid or expired.'
  } catch (error) {
    console.error('Error loading property:', error)
    errorMessage.value = 'Error loading invitation details'
  } finally {
    propertyLoading.value = false
  }
}

const createTenantProfile = async (userId, userData) => {
  try {
    const resolvedPropertyId = resolvePropertyId()
    const leaseSnapshot = toLeaseSnapshot(invitedLease.value)
    const userProfileData = {
      user_id: userId,
      email: userData.email,
      full_name: userData.fullName,
      phone: userData.phone || '',
      user_type: 'tenant',
      user_category: 'tt',
      account_type: 'tt',
      account_type_locked: true,
      account_type_selected_at: new Date(),
      lease_id: invitedLease.value?.id || null,
      property_id: resolvedPropertyId,
      lease_snapshot: leaseSnapshot,
      created_at: new Date(),
      updated_at: new Date(),
    }

    await createDocument('users', userProfileData, userId)

    if (resolvedPropertyId) {
      const roleData = {
        property_id: resolvedPropertyId,
        role: 'tt',
        role_date: new Date(),
        status: 'active',
        created_at: new Date(),
      }
      await createDocument(`users/${userId}/roles`, roleData)
    }

    await linkTenantToInvitedLease(userId, {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    })

    return true
  } catch (error) {
    console.error('Error creating tenant profile:', error)
    throw error
  }
}

const linkTenantToInvitedLease = async (userId, userData = {}) => {
  if (!invitedLease.value?.id || !userId) return

  const resolvedPropertyId = resolvePropertyId()
  const leaseSnapshot = toLeaseSnapshot(invitedLease.value)
  const fullName = String(userData.fullName || '').trim()
  const email = String(userData.email || '').trim()
  const phone = String(userData.phone || '').trim()

  const [firstName, ...lastNameParts] = fullName.split(' ').filter(Boolean)
  const tenantDocData = {
    property_id: resolvedPropertyId,
    lease_id: invitedLease.value.id,
    personal_info: {
      first_name: firstName || '',
      middle_name: '',
      last_name: lastNameParts.join(' '),
      email,
      phone,
    },
    status: 'active',
    lease_snapshot: leaseSnapshot,
    updated_at: new Date().toISOString(),
    created_by: userId,
  }

  const tenantDoc = await getDoc(doc(db, 'tenants', userId))
  if (tenantDoc.exists()) {
    await updateDocument('tenants', userId, tenantDocData)
  } else {
    await createDocument(
      'tenants',
      {
        ...tenantDocData,
        created_at: new Date().toISOString(),
      },
      userId,
    )
  }

  await updateDocument('users', userId, {
    lease_id: invitedLease.value.id,
    property_id: resolvedPropertyId,
    lease_snapshot: leaseSnapshot,
    updated_at: new Date(),
  })

  await updateDocument('leases', invitedLease.value.id, {
    tenant_id: userId,
    tenant_email: email || null,
    updated_at: new Date(),
  })
}

const handleSignUp = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    console.log('Starting tenant sign up process...')

    // Create Firebase auth account
    const result = await signUp(
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.fullName,
    )

    console.log('Firebase auth account created:', result.user.uid)

    // Create tenant profile
    isCreatingProfile.value = true
    await createTenantProfile(result.user.uid, signupForm.value)

    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Tenant account created successfully!',
      caption: 'Redirecting to your dashboard...',
    })

    // Wait for user data to load, then redirect
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  } catch (error) {
    console.error('Sign up error:', error)
    errorMessage.value = error.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
    isCreatingProfile.value = false
  }
}

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    console.log('Logging in user...')

    const result = await signIn(loginForm.value.email, loginForm.value.password)
    const userId = result?.user?.uid
    if (userId && invitedLease.value?.id) {
      await linkTenantToInvitedLease(userId, {
        fullName: result?.user?.displayName || '',
        email: loginForm.value.email,
        phone: '',
      })
    }

    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Signed in successfully!',
      caption: 'Redirecting...',
    })

    // Redirect to loading page to load user data
    setTimeout(() => {
      router.push('/loading')
    }, 1000)
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Failed to login. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

// Watch for authentication state changes
watch(isAuthenticated, (newValue) => {
  if (newValue && !isCreatingProfile.value) {
    // User is already authenticated, redirect to tenant home
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  }
})

// Mount
onMounted(async () => {
  console.log('TenantSignUpPage mounted with lease invite id:', leaseIdFromInvite.value)

  // Load property details
  await loadProperty()

  // If user is already authenticated, redirect to tenant home
  if (isAuthenticated.value) {
    setTimeout(() => {
      router.push('/tenant-home')
    }, 2000)
  }
})
</script>

<style scoped>
.header-section {
  margin-bottom: 26px;
}

.property-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--auth-brand-pale);
  border: 1px solid var(--auth-border);
  border-radius: 12px;
}

.property-details {
  text-align: left;
  flex: 1;
}

.property-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--auth-ink);
  margin: 0 0 4px 0;
}

.property-subtitle {
  font-size: 0.875rem;
  color: var(--neutral-600, #666);
  margin: 0;
}

.property-error {
  padding: 24px;
  text-align: center;
  color: var(--negative-color, #c10015);
}

.property-error p {
  margin: 8px 0 0 0;
  font-weight: 500;
}

.loading-section {
  text-align: center;
  padding: 48px 24px;
}

.loading-text {
  margin-top: 16px;
  color: var(--auth-ink-soft);
  font-size: 1rem;
}

.auth-section {
  margin-top: 8px;
}

.auth-tabs {
  margin-bottom: 16px;
  border-bottom: 1px solid var(--auth-border);
}

.auth-section :deep(.q-tab-panel) {
  padding: 18px 0 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  margin-top: 8px;
}

.already-authenticated {
  text-align: center;
  padding: 48px 24px;
}

.success-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--positive-color, #21ba45);
  margin: 16px 0 8px 0;
}

.success-detail {
  color: var(--neutral-600, #666);
  margin: 0;
}

.self-register-info {
  background: color-mix(in srgb, var(--accent-color) 10%, white);
}

.error-section {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .tenant-auth-card {
    padding: 28px 20px;
  }

  .property-name {
    font-size: 1rem;
  }
}
</style>
