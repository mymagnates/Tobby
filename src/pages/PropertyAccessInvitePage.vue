<template>
  <div class="property-access-invite-page">
    <div class="property-access-invite-card">
      <div class="text-h5 text-weight-bold">Property access invitation</div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Review the access level before joining this Property Account.
      </div>

      <div v-if="loadingInvite" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="56px" />
        <div class="q-mt-md">Loading invitation...</div>
      </div>
      <q-banner v-else-if="inviteError" rounded class="bg-red-1 text-red-10 q-mt-md">
        {{ inviteError }}
      </q-banner>

      <template v-else-if="invite">
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">
              {{ propertySummary.nickname || 'Property' }}
            </div>
            <div class="text-body2 text-grey-8 q-mt-xs">
              {{ propertySummary.address || 'Address unavailable' }}
            </div>
            <q-badge
              class="q-mt-md"
              color="primary"
              :label="invite.access_label || 'Property access'"
            />
            <div class="text-caption text-grey-7 q-mt-sm">{{ accessDescription }}</div>
          </q-card-section>
        </q-card>

        <q-banner v-if="authenticatedUser" rounded class="bg-blue-1 text-blue-10 q-mt-md">
          Signed in as
          {{ authenticatedUser.email || authenticatedUser.displayName || authenticatedUser.uid }}
        </q-banner>

        <div v-if="!authenticatedUser" class="q-mt-lg">
          <q-tabs
            v-model="authMode"
            dense
            align="justify"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="signup" label="Create Account" />
            <q-tab name="login" label="Sign In" />
          </q-tabs>
          <q-form class="q-gutter-md q-mt-md" @submit="handleSubmit">
            <q-input
              v-model="form.fullName"
              outlined
              label="Full Name"
              :disable="authMode === 'login'"
            />
            <q-input
              v-model.trim="form.email"
              outlined
              type="email"
              label="Email"
              :rules="[(value) => !!value || 'Email is required']"
            />
            <q-input
              v-model="form.password"
              outlined
              type="password"
              label="Password"
              :rules="[(value) => !!value || 'Password is required']"
            />
            <q-input
              v-if="authMode === 'signup'"
              v-model="form.confirmPassword"
              outlined
              type="password"
              label="Confirm Password"
              :rules="[
                (value) => !!value || 'Please confirm your password',
                (value) => value === form.password || 'Passwords do not match',
              ]"
            />
            <q-btn
              type="submit"
              color="primary"
              unelevated
              class="full-width"
              :loading="submitting"
              :label="
                authMode === 'signup'
                  ? 'Create Account and Accept Invite'
                  : 'Sign In and Accept Invite'
              "
            />
          </q-form>
        </div>
        <div v-else class="q-mt-lg">
          <q-btn
            color="primary"
            unelevated
            class="full-width"
            :loading="submitting"
            label="Accept Invite"
            @click="acceptInviteForUser(authenticatedUser)"
          />
        </div>
        <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-10 q-mt-md">{{
          errorMessage
        }}</q-banner>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { normalizeAccountType } from '../utils/roleUtils'
import {
  acceptPropertyAccessInviteRequest,
  getPropertyAccessInviteByToken,
} from '../services/propertyAccessApi'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { user, signIn, signUp, createDocument, getDocument } = useFirebase()
const authMode = ref('signup')
const loadingInvite = ref(true)
const submitting = ref(false)
const invite = ref(null)
const propertySummary = ref({})
const inviteError = ref('')
const errorMessage = ref('')
const form = ref({ fullName: '', email: '', password: '', confirmPassword: '' })
const authenticatedUser = computed(() => user.value)
const accessDescription = computed(
  () =>
    ({
      owner: 'Owner access links you to this property and its owner workspace.',
      manager: 'Property manager access allows operational work, records, and task management.',
      viewer: 'View only access lets you inspect shared property records without changing them.',
    })[invite.value?.access_role] || 'You have been invited to access this property.',
)

const syncProfileForAccess = async (authUser) => {
  const existingProfile = await getDocument(`users/${authUser.uid}`)
  const baseProfile = existingProfile || {}
  const accessRole = String(invite.value?.access_role || '')
    .trim()
    .toLowerCase()
  const existingAccountType = normalizeAccountType(
    baseProfile.account_type || baseProfile.user_category,
  )
  const existingPmAccess =
    existingAccountType === 'pm' && Boolean(baseProfile.owner_workspace_only) === false
  const ownerWorkspaceOnly = accessRole === 'owner' && !existingPmAccess
  const payload = {
    ...baseProfile,
    user_id: authUser.uid,
    email: baseProfile.email || authUser.email || form.value.email,
    user_name: baseProfile.user_name || authUser.displayName || form.value.fullName || '',
    full_name: baseProfile.full_name || authUser.displayName || form.value.fullName || '',
    account_type: baseProfile.account_type || 'pm',
    user_category: baseProfile.user_category || 'pm',
    account_type_locked: true,
    owner_workspace_only: ownerWorkspaceOnly,
    shared_access_only: accessRole === 'viewer' && !existingPmAccess,
    manage_scope: Array.isArray(baseProfile.manage_scope) ? baseProfile.manage_scope : [],
    updated_at: new Date(),
    updatedAt: new Date(),
    created_at: baseProfile.created_at || new Date(),
    createdAt: baseProfile.createdAt || new Date(),
  }
  await createDocument('users', payload, authUser.uid)
}

const acceptInviteForUser = async (authUser) => {
  const invitedEmail = String(invite.value?.invited_email || form.value.email || '')
    .trim()
    .toLowerCase()
  const currentEmail = String(authUser?.email || form.value.email || '')
    .trim()
    .toLowerCase()
  if (invitedEmail && currentEmail && invitedEmail !== currentEmail) {
    errorMessage.value = 'This invite was issued for a different email address.'
    return
  }
  submitting.value = true
  errorMessage.value = ''
  try {
    const result = await acceptPropertyAccessInviteRequest(String(route.params.token || '').trim())
    await syncProfileForAccess(authUser)
    await userDataStore.initialize(authUser, { forceFresh: true })
    Notify.create({ type: 'positive', message: 'Property access granted.', position: 'top' })
    router.replace({
      path: '/loading',
      query: { redirect: result?.access_role === 'owner' ? '/po-dashboard' : '/my-properties' },
    })
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to accept property access invite.'
  } finally {
    submitting.value = false
  }
}

const handleSubmit = async () => {
  if (authMode.value === 'signup' && form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  submitting.value = true
  errorMessage.value = ''
  try {
    const result =
      authMode.value === 'signup'
        ? await signUp(form.value.email, form.value.password, form.value.fullName)
        : await signIn(form.value.email, form.value.password)
    await acceptInviteForUser(result.user)
  } catch (error) {
    errorMessage.value = error?.message || 'Unable to complete invite acceptance.'
    submitting.value = false
  }
}

const loadInvite = async () => {
  loadingInvite.value = true
  inviteError.value = ''
  try {
    const token = String(route.params.token || '').trim()
    if (!token) throw new Error('Invite token is missing.')
    const result = await getPropertyAccessInviteByToken(token)
    if (!result?.invite?.invite_id) throw new Error('This invitation was not found.')
    invite.value = result.invite
    propertySummary.value = result.property || {}
  } catch (error) {
    inviteError.value = error?.message || 'This invitation is no longer available.'
  } finally {
    loadingInvite.value = false
  }
}

onMounted(loadInvite)
</script>

<style scoped>
.property-access-invite-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: radial-gradient(circle at top left, #e6f0ff, #f8fafc 45%, #eaf5f2);
}

.property-access-invite-card {
  width: min(520px, 100%);
  padding: 30px;
  border: 1px solid #dbe4ee;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 70px rgba(30, 64, 95, 0.14);
}
</style>
