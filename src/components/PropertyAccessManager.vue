<template>
  <q-dialog v-model="visible">
    <q-card class="property-access-manager workspace-form">
      <q-card-section class="row items-start justify-between q-pb-sm workspace-form-heading">
        <div>
          <div class="text-h6">Manage property access</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Invite owners, managers, or read-only collaborators for
            {{ propertyLabel }}.
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Close access manager"
          @click="visible = false"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form class="row q-col-gutter-md items-start" @submit.prevent="sendInvite">
          <div class="col-12 col-md-5">
            <q-input
              v-model.trim="inviteForm.email"
              outlined
              type="email"
              label="Email address"
              :rules="[(value) => !!value || 'Email is required']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="inviteForm.accessRole"
              outlined
              emit-value
              map-options
              :options="accessRoles"
              option-label="label"
              option-value="value"
              label="Access type"
            />
          </div>
          <div class="col-12 col-md-3 workspace-form-inline-actions">
            <q-btn
              type="submit"
              color="primary"
              unelevated
              no-caps
              icon="person_add"
              label="Send invite"
              class="full-width q-py-sm"
              :loading="sending"
            />
          </div>
          <div class="col-12 text-caption text-grey-7">
            {{ selectedRole?.description }}
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll property-access-manager__content">
        <div v-if="loading" class="row justify-center q-pa-xl">
          <q-spinner-dots color="primary" size="42px" />
        </div>

        <template v-else>
          <div class="text-overline text-grey-7">People with access</div>
          <q-list bordered separator class="rounded-borders q-mt-xs">
            <q-item v-for="member in members" :key="`${member.user_id}:${member.access_role}`">
              <q-item-section avatar>
                <q-avatar color="blue-grey-1" text-color="primary" icon="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ member.name || member.email || 'Handout user' }}</q-item-label>
                <q-item-label caption>{{ member.email || member.user_id }}</q-item-label>
              </q-item-section>
              <q-item-section side top class="items-end q-gutter-xs">
                <q-badge outline color="primary" :label="member.access_label" />
                <q-badge v-if="member.is_primary_owner" color="blue-grey-8" label="Primary owner" />
                <q-btn
                  v-if="canManage"
                  flat
                  dense
                  no-caps
                  color="negative"
                  label="Remove"
                  :loading="actionKey === memberKey(member)"
                  @click="startRemoveMember(member)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="!members.length">
              <q-item-section class="text-grey-7"
                >No one has been granted access yet.</q-item-section
              >
            </q-item>
          </q-list>

          <div class="text-overline text-grey-7 q-mt-lg">Pending invitations</div>
          <q-list bordered separator class="rounded-borders q-mt-xs">
            <q-item v-for="invite in pendingInvites" :key="invite.invite_id">
              <q-item-section avatar>
                <q-avatar color="amber-1" text-color="amber-10" icon="mail_outline" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ invite.invited_email }}</q-item-label>
                <q-item-label caption
                  >{{ invite.access_label }} · Sent
                  {{ formatDate(invite.created_at) }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="canManage"
                  flat
                  dense
                  no-caps
                  color="negative"
                  label="Cancel"
                  :loading="actionKey === `invite:${invite.invite_id}`"
                  @click="cancelInvite(invite)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="!pendingInvites.length">
              <q-item-section class="text-grey-7">No pending invitations.</q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showPrimaryOwnerDialog">
    <q-card style="width: min(460px, calc(100vw - 32px))">
      <q-card-section>
        <div class="text-h6">Choose the next primary owner</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          Removing the current primary owner requires assigning another existing owner.
        </div>
        <q-select
          v-model="nextPrimaryOwnerId"
          class="q-mt-md"
          outlined
          emit-value
          map-options
          :options="primaryOwnerOptions"
          label="New primary owner"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" v-close-popup />
        <q-btn
          color="negative"
          unelevated
          no-caps
          label="Remove access"
          :disable="!nextPrimaryOwnerId"
          @click="confirmPrimaryOwnerRemoval"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { formatOwnerInviteFallbackReason } from '../utils/ownerInviteEmailFeedback'
import {
  PROPERTY_ACCESS_ROLES,
  getPropertyAccessRequest,
  removePropertyAccessRequest,
  revokePropertyAccessInviteRequest,
  sendPropertyAccessInviteRequest,
} from '../services/propertyAccessApi'
import { useUserDataStore } from '../stores/userDataStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  property: { type: Object, default: null },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'access-updated'])
const userDataStore = useUserDataStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const propertyLabel = computed(
  () => props.property?.nickname || props.property?.address || 'this property',
)
const accessRoles = PROPERTY_ACCESS_ROLES
const inviteForm = ref({ email: '', accessRole: 'owner' })
const members = ref([])
const invites = ref([])
const loading = ref(false)
const sending = ref(false)
const actionKey = ref('')
const removalCandidate = ref(null)
const showPrimaryOwnerDialog = ref(false)
const nextPrimaryOwnerId = ref(null)

const selectedRole = computed(
  () => accessRoles.find((role) => role.value === inviteForm.value.accessRole) || accessRoles[0],
)
const pendingInvites = computed(() =>
  invites.value.filter((invite) => String(invite.status || '').toLowerCase() === 'pending'),
)
const primaryOwnerOptions = computed(() =>
  members.value
    .filter(
      (member) =>
        member.access_role === 'owner' && member.user_id !== removalCandidate.value?.user_id,
    )
    .map((member) => ({
      label: member.name || member.email || member.user_id,
      value: member.user_id,
    })),
)
const memberKey = (member) => `member:${member.user_id}:${member.access_role}`
const formatDate = (value) => {
  if (!value) return 'recently'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? 'recently' : date.toLocaleDateString()
}

const loadAccess = async () => {
  if (!props.property?.id || !props.canManage) return
  loading.value = true
  try {
    const payload = await getPropertyAccessRequest(props.property.id)
    members.value = Array.isArray(payload?.members) ? payload.members : []
    invites.value = Array.isArray(payload?.invites) ? payload.invites : []
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to load property access.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const sendInvite = async () => {
  const email = String(inviteForm.value.email || '')
    .trim()
    .toLowerCase()
  if (!/.+@.+\..+/.test(email) || !props.property?.id) {
    Notify.create({ type: 'warning', message: 'Enter a valid email address.', position: 'top' })
    return
  }
  sending.value = true
  try {
    const response = await sendPropertyAccessInviteRequest({
      propertyId: props.property.id,
      invitedEmail: email,
      accessRole: inviteForm.value.accessRole,
      inviterName:
        userDataStore.userProfile?.full_name ||
        userDataStore.userProfile?.user_name ||
        userDataStore.user?.displayName ||
        userDataStore.user?.email ||
        'A property member',
    })
    inviteForm.value.email = ''
    await loadAccess()
    emit('access-updated')
    if (response?.email_sent) {
      Notify.create({ type: 'positive', message: 'Access invitation sent.', position: 'top' })
    } else {
      const link = String(response?.invite_url || '').trim()
      if (link && navigator?.clipboard?.writeText) await navigator.clipboard.writeText(link)
      Notify.create({
        type: 'warning',
        message: link ? 'Email was not sent. The invite link was copied.' : 'Email was not sent.',
        caption: formatOwnerInviteFallbackReason(response?.fallback_reason),
        position: 'top',
        timeout: 6000,
      })
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to send access invite.',
      position: 'top',
    })
  } finally {
    sending.value = false
  }
}

const cancelInvite = async (invite) => {
  if (!props.property?.id || !invite?.invite_id) return
  if (!window.confirm(`Cancel the invitation for ${invite.invited_email || 'this email'}?`)) return
  actionKey.value = `invite:${invite.invite_id}`
  try {
    await revokePropertyAccessInviteRequest({
      propertyId: props.property.id,
      inviteId: invite.invite_id,
    })
    await loadAccess()
    emit('access-updated')
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to cancel invite.',
      position: 'top',
    })
  } finally {
    actionKey.value = ''
  }
}

const startRemoveMember = (member) => {
  if (!member || !props.property?.id) return
  removalCandidate.value = member
  if (member.access_role === 'owner' && member.is_primary_owner) {
    if (!primaryOwnerOptions.value.length) {
      Notify.create({
        type: 'warning',
        message: 'Add another owner before removing the primary owner.',
        position: 'top',
      })
      return
    }
    nextPrimaryOwnerId.value = primaryOwnerOptions.value[0].value
    showPrimaryOwnerDialog.value = true
    return
  }
  removeMember(member)
}

const confirmPrimaryOwnerRemoval = () => {
  showPrimaryOwnerDialog.value = false
  removeMember(removalCandidate.value, nextPrimaryOwnerId.value)
}

const removeMember = async (member, nextPrimaryOwnerUserId = null) => {
  if (!member || !props.property?.id) return
  if (!window.confirm(`Remove ${member.name || member.email || 'this person'} from this property?`))
    return
  actionKey.value = memberKey(member)
  try {
    await removePropertyAccessRequest({
      propertyId: props.property.id,
      userId: member.user_id,
      accessRole: member.access_role,
      nextPrimaryOwnerUserId,
    })
    await loadAccess()
    emit('access-updated')
    Notify.create({ type: 'positive', message: 'Property access removed.', position: 'top' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to remove access.',
      position: 'top',
    })
  } finally {
    actionKey.value = ''
    removalCandidate.value = null
    nextPrimaryOwnerId.value = null
  }
}

watch(
  () => [visible.value, props.property?.id, props.canManage],
  ([isVisible]) => {
    if (isVisible) loadAccess()
  },
  { immediate: true },
)
</script>

<style scoped>
.property-access-manager {
  width: min(760px, 100vw);
  max-width: 760px;
  min-height: 540px;
}

.property-access-manager__content {
  max-height: calc(100vh - 260px);
}
</style>
