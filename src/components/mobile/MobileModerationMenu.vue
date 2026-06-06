<template>
  <div class="mobile-moderation" @click.stop>
    <q-btn
      round
      flat
      dense
      icon="more_horiz"
      class="mobile-moderation__trigger"
      aria-label="Content actions"
      @click.stop
    >
      <q-menu anchor="bottom right" self="top right">
        <q-list dense class="mobile-moderation__menu">
          <q-item clickable v-close-popup @click="openReportDialog">
            <q-item-section avatar>
              <q-icon name="flag" color="negative" />
            </q-item-section>
            <q-item-section>Report</q-item-section>
          </q-item>
          <q-item
            v-if="canBlock"
            clickable
            v-close-popup
            @click="openBlockDialog"
          >
            <q-item-section avatar>
              <q-icon name="block" color="negative" />
            </q-item-section>
            <q-item-section>Block User</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-dialog v-model="reportOpen">
      <q-card class="mobile-moderation-dialog">
        <q-card-section>
          <div class="mobile-moderation-dialog__title">Report content</div>
          <div class="mobile-moderation-dialog__body">
            Tell us why this content should be reviewed.
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-option-group
            v-model="reportReason"
            :options="reasonOptions"
            type="radio"
            dense
            class="mobile-moderation-dialog__reasons"
          />
          <q-input
            v-model="reportNote"
            label="Optional note"
            type="textarea"
            autogrow
            outlined
            dense
            maxlength="500"
            class="q-mt-sm"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" :disable="submitting" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="negative"
            label="Submit"
            :loading="submitting"
            @click="submitReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="blockOpen">
      <q-card class="mobile-moderation-dialog">
        <q-card-section>
          <div class="mobile-moderation-dialog__title">Block user?</div>
          <div class="mobile-moderation-dialog__body">
            You will stop seeing content from this user where possible.
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="blockReason"
            label="Optional reason"
            type="textarea"
            autogrow
            outlined
            dense
            maxlength="500"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" :disable="submitting" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="negative"
            label="Block User"
            :loading="submitting"
            @click="submitBlock"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Notify } from 'quasar'
import { useMobileModeration } from 'src/pages/mobile/useMobileModeration'
import { useUserDataStore } from 'src/stores/userDataStore'

const props = defineProps({
  contentType: {
    type: String,
    default: 'other',
  },
  contentId: {
    type: String,
    default: '',
  },
  contentPath: {
    type: String,
    default: '',
  },
  reportedUserId: {
    type: String,
    default: '',
  },
  reportedUserDisplayName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['reported', 'blocked'])
const userDataStore = useUserDataStore()
const { reportContent, blockUser } = useMobileModeration()

const reportOpen = ref(false)
const blockOpen = ref(false)
const submitting = ref(false)
const reportReason = ref('inappropriate')
const reportNote = ref('')
const blockReason = ref('')

const reasonOptions = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Offensive', value: 'offensive' },
  { label: 'Inappropriate', value: 'inappropriate' },
  { label: 'Scam', value: 'scam' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Other', value: 'other' },
]

const currentUid = computed(() => String(userDataStore.userId || userDataStore.user?.uid || ''))
const canBlock = computed(() => {
  const target = String(props.reportedUserId || '').trim()
  return Boolean(target && target !== currentUid.value)
})

const moderationPayload = computed(() => ({
  content_type: props.contentType || 'other',
  content_id: props.contentId || '',
  content_path: props.contentPath || '',
  reported_user_id: props.reportedUserId || '',
}))

const openReportDialog = () => {
  reportReason.value = 'inappropriate'
  reportNote.value = ''
  reportOpen.value = true
}

const openBlockDialog = () => {
  blockReason.value = ''
  blockOpen.value = true
}

const submitReport = async () => {
  submitting.value = true
  try {
    await reportContent(moderationPayload.value, {
      reason: reportReason.value,
      note: reportNote.value,
    })
    reportOpen.value = false
    emit('reported', moderationPayload.value)
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to submit report.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

const submitBlock = async () => {
  submitting.value = true
  try {
    await blockUser(
      {
        blocked_user_id: props.reportedUserId,
        blocked_user_display_name: props.reportedUserDisplayName,
      },
      { reason: blockReason.value },
    )
    blockOpen.value = false
    emit('blocked', props.reportedUserId)
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to block user.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
</script>
