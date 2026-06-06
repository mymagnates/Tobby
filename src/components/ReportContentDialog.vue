<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="moderation-dialog">
      <q-card-section class="row items-start justify-between q-pb-sm">
        <div>
          <div class="text-h6">{{ mode === 'block' ? 'Block User' : 'Report Content' }}</div>
          <div class="text-caption text-grey-7">
            {{
              mode === 'block'
                ? 'You will stop seeing content from this user where possible.'
                : 'Reports are reviewed by Handout support.'
            }}
          </div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-banner v-if="mode === 'report'" rounded class="bg-blue-1 text-primary">
          Report only sends the content reference and your selected reason. It does not copy the
          full message body into the report.
        </q-banner>

        <q-select
          v-model="reason"
          :options="reasonOptions"
          emit-value
          map-options
          outlined
          dense
          label="Reason"
        />

        <q-input
          v-model="note"
          outlined
          dense
          autogrow
          maxlength="1000"
          label="Optional note"
          placeholder="Add context for the review team"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat color="grey-7" label="Cancel" :disable="submitting" v-close-popup />
        <q-btn
          :color="mode === 'block' ? 'negative' : 'primary'"
          :label="mode === 'block' ? 'Block User' : 'Submit Report'"
          :loading="submitting"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Notify } from 'quasar'
import { blockUser, submitContentReport } from 'src/services/contentModeration'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'report',
    validator: (value) => ['report', 'block'].includes(value),
  },
  content: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'reported', 'blocked'])

const reason = ref('inappropriate')
const note = ref('')
const submitting = ref(false)

const reasonOptions = [
  { label: 'Inappropriate content', value: 'inappropriate' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Offensive content', value: 'offensive' },
  { label: 'Spam', value: 'spam' },
  { label: 'Scam or fraud', value: 'scam' },
  { label: 'Privacy concern', value: 'privacy' },
  { label: 'Other', value: 'other' },
]

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    reason.value = props.mode === 'block' ? 'other' : 'inappropriate'
    note.value = ''
  },
)

const submit = async () => {
  try {
    submitting.value = true
    if (props.mode === 'block') {
      const block = await blockUser({
        blocked_user_id: props.content.reported_user_id || props.content.blocked_user_id,
        blocked_user_display_name:
          props.content.reported_user_display_name || props.content.blocked_user_display_name,
        reason: note.value || reason.value,
        source: props.content.source || 'web',
      })
      emit('blocked', block)
      Notify.create({ type: 'positive', message: 'User blocked.', position: 'top' })
    } else {
      const report = await submitContentReport({
        ...props.content,
        reason: reason.value,
        note: note.value,
      })
      emit('reported', report)
      Notify.create({ type: 'positive', message: 'Report submitted. We will review it.', position: 'top' })
    }
    emit('update:modelValue', false)
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to complete this action.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.moderation-dialog {
  width: min(560px, 92vw);
  border-radius: var(--border-radius-card);
}
</style>
