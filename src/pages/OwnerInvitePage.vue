<template>
  <div class="owner-invite-page">
    <div class="owner-invite-card workspace-form">
      <div class="text-h5 text-weight-bold workspace-form-heading">Owner Invitation</div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Accept owner or co-owner access for this property and open Handout.
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
            <div class="text-subtitle1 text-weight-medium">{{ propertySummary.nickname || 'Property' }}</div>
            <div class="text-body2 text-grey-8 q-mt-xs">{{ propertySummary.address || 'Address unavailable' }}</div>
            <div class="text-caption text-grey-7 q-mt-sm">
              Ownership mode: {{ propertySummary.ownership_mode || 'managed_for_owner' }}
            </div>
            <div v-if="invite.owner_email" class="text-caption text-grey-7">
              Invite email: {{ invite.owner_email }}
            </div>
          </q-card-section>
        </q-card>

        <q-banner v-if="authenticatedUser" rounded class="bg-blue-1 text-blue-10 q-mt-md">
          Signed in as {{ authenticatedUser.email || authenticatedUser.displayName || authenticatedUser.uid }}
        </q-banner>

        <div v-if="!authenticatedUser" class="q-mt-lg">
          <q-tabs v-model="authMode" dense align="justify" active-color="primary" indicator-color="primary">
            <q-tab name="signup" label="Create Account" />
            <q-tab name="login" label="Sign In" />
          </q-tabs>

          <q-form @submit="handleSubmit" class="q-gutter-md q-mt-md">
            <q-input
              v-model="form.fullName"
              outlined
              label="Full Name"
              :disable="authMode === 'login'"
            />
            <q-input
              v-model="form.email"
              outlined
              type="email"
              label="Email"
              disable
              readonly
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-input
              v-model="form.password"
              outlined
              type="password"
              label="Password"
              :rules="[(val) => !!val || 'Password is required']"
            />
            <q-input
              v-if="authMode === 'signup'"
              v-model="form.confirmPassword"
              outlined
              type="password"
              label="Confirm Password"
              :rules="[
                (val) => !!val || 'Please confirm your password',
                (val) => val === form.password || 'Passwords do not match',
              ]"
            />
            <q-btn
              type="submit"
              color="primary"
              unelevated
              :loading="submitting"
              :label="authMode === 'signup' ? 'Create Account and Accept Invite' : 'Sign In and Accept Invite'"
              class="full-width"
            />
          </q-form>
        </div>

        <div v-else class="q-mt-lg workspace-form-actions">
          <q-btn
            color="primary"
            unelevated
            :loading="submitting"
            label="Accept Invite"
            class="full-width"
            @click="acceptInviteForUser(authenticatedUser)"
          />
        </div>

        <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-10 q-mt-md">
          {{ errorMessage }}
        </q-banner>
      </template>
    </div>
  </div>
</template>

<script setup>
import '../css/workspace-forms.scss'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useWebFormTheme } from '../composables/useWebFormTheme'
import { useUserDataStore } from '../stores/userDataStore'
import { OWNER_WORKSPACE_PATH } from '../utils/ownerInviteUtils'
import { normalizeAccountType } from '../utils/roleUtils'
import { acceptOwnerInviteRequest, getOwnerInviteByToken } from '../services/ownerInviteApi'

useWebFormTheme()

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const {
  user,
  signIn,
  signUp,
  createDocument,
  getDocument,
} = useFirebase()

const authMode = ref('signup')
const loadingInvite = ref(true)
const submitting = ref(false)
const invite = ref(null)
const propertySummary = ref({})
const inviteError = ref('')
const errorMessage = ref('')
const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const authenticatedUser = computed(() => user.value)

const syncProfileForOwnerWorkspace = async (authUser) => {
  const existingProfile = await getDocument(`users/${authUser.uid}`)
  const hasExistingProfile = Boolean(existingProfile)
  const now = new Date()
  const baseProfile = existingProfile || {}
  const existingAccountType = normalizeAccountType(baseProfile.account_type || baseProfile.user_category)
  const shouldStayManagerCapable =
    hasExistingProfile &&
    existingAccountType === 'pm' &&
    Boolean(baseProfile.owner_workspace_only) === false
  const payload = {
    ...baseProfile,
    user_id: authUser.uid,
    email: baseProfile.email || authUser.email || form.value.email,
    user_name: baseProfile.user_name || authUser.displayName || form.value.fullName || '',
    full_name: baseProfile.full_name || authUser.displayName || form.value.fullName || '',
    account_type: baseProfile.account_type || 'pm',
    user_category: baseProfile.user_category || 'pm',
    account_type_locked: true,
    owner_workspace_only: !shouldStayManagerCapable,
    manage_scope: Array.isArray(baseProfile.manage_scope) && baseProfile.manage_scope.length
      ? baseProfile.manage_scope
      : [],
    updated_at: now,
    updatedAt: now,
    created_at: baseProfile.created_at || now,
    createdAt: baseProfile.createdAt || now,
  }
  await createDocument('users', payload, authUser.uid)
  return payload
}

const acceptInviteForUser = async (authUser) => {
  if (!invite.value || !propertySummary.value?.id) return

  const invitedEmail = String(invite.value.owner_email || '').trim().toLowerCase()
  const currentEmail = String(authUser.email || form.value.email || '').trim().toLowerCase()
  if (invitedEmail && currentEmail && invitedEmail !== currentEmail) {
    errorMessage.value = 'This invite was issued for a different email address.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    // The server validates the token and email, then atomically grants membership and audits acceptance.
    await acceptOwnerInviteRequest(String(route.params.token || '').trim())
    await syncProfileForOwnerWorkspace(authUser)

    await userDataStore.initialize(authUser, { forceFresh: true })

    Notify.create({
      type: 'positive',
      message: 'Handout access granted.',
      position: 'top',
    })
    router.replace({
      path: '/loading',
      query: { redirect: OWNER_WORKSPACE_PATH },
    })
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to accept owner invite.'
  } finally {
    submitting.value = false
  }
}

const handleSubmit = async () => {
  if (invite.value?.owner_email) {
    form.value.email = String(invite.value.owner_email).trim().toLowerCase()
  }
  if (authMode.value === 'signup' && form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    let authResult
    if (authMode.value === 'signup') {
      authResult = await signUp(form.value.email, form.value.password, form.value.fullName)
    } else {
      authResult = await signIn(form.value.email, form.value.password)
    }
    await acceptInviteForUser(authResult.user)
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
    if (!token) {
      inviteError.value = 'Invite token is missing.'
      return
    }

    const result = await getOwnerInviteByToken(token)
    const match = result?.invite
    if (!match?.id && !match?.invite_id) {
      inviteError.value = 'This owner invite was not found.'
      return
    }

    invite.value = match
    propertySummary.value = result?.property || {}
    form.value.email = match.owner_email || form.value.email
  } catch (error) {
    inviteError.value = error?.message || 'Failed to load invite.'
  } finally {
    loadingInvite.value = false
  }
}

onMounted(() => {
  loadInvite()
})
</script>


<style scoped>
.owner-invite-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%);
}

.owner-invite-card {
  width: 100%;
  max-width: 560px;
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}
</style>
