<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="sp-bid-dialog-card">
      <q-card-section class="sp-bid-dialog-head">
        <div class="row items-start justify-between q-col-gutter-md">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">Submit Bid</div>
            <div class="text-caption text-grey-7">
              This bid is an estimate, not a signed contract.
            </div>
            <div v-if="lead" class="q-mt-sm text-body2">
              <div class="text-weight-medium">{{ lead.title || 'Untitled Lead' }}</div>
              <div class="text-grey-7">{{ leadLocationLabel }}</div>
            </div>
          </div>
          <div class="col-auto">
            <q-btn flat round dense icon="close" @click="closeDialog" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="sp-bid-dialog-body">
        <div class="sp-bid-form-grid">
          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Pricing</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.pricing_type"
                  :options="pricingTypeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Pricing Type *"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  outlined
                  dense
                  label="Bid Amount *"
                  prefix="$"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.valid_until"
                  type="date"
                  outlined
                  dense
                  label="Valid Until *"
                  bg-color="grey-1"
                />
              </div>
            </div>
          </section>

          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Scope</div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="form.included_scope"
                  type="textarea"
                  autogrow
                  outlined
                  dense
                  label="What's Included *"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.exclusions"
                  type="textarea"
                  autogrow
                  outlined
                  dense
                  label="Exclusions"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.materials_included"
                  :options="materialsIncludedOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Materials Included *"
                  bg-color="grey-1"
                />
              </div>
              <div v-if="form.materials_included === 'partial'" class="col-12 col-md-8">
                <q-input
                  v-model="form.materials_note"
                  outlined
                  dense
                  label="Materials Note"
                  bg-color="grey-1"
                />
              </div>
            </div>
          </section>

          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Schedule</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.estimated_start_date"
                  type="date"
                  outlined
                  dense
                  label="Estimated Start Date *"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.estimated_duration"
                  outlined
                  dense
                  label="Estimated Duration *"
                  hint="Example: 2 days, 1 week, 3 visits"
                  bg-color="grey-1"
                />
              </div>
            </div>
          </section>

          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Payment Expectations</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              This section is for planning only. Final payment terms should be confirmed separately.
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.upfront_payment_expected"
                  :options="yesNoOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Is any upfront payment expected?"
                  bg-color="grey-1"
                />
              </div>
              <div v-if="form.upfront_payment_expected === 'yes'" class="col-12 col-md-4">
                <q-input
                  v-model.number="form.upfront_payment_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  outlined
                  dense
                  prefix="$"
                  label="Upfront Payment Amount"
                  bg-color="grey-1"
                />
              </div>
              <div v-if="form.upfront_payment_expected === 'yes'" class="col-12 col-md-4">
                <q-select
                  v-model="form.upfront_payment_timing"
                  :options="upfrontTimingOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="When would this upfront payment be needed?"
                  bg-color="grey-1"
                />
              </div>
              <div v-if="form.upfront_payment_expected === 'yes' && form.upfront_payment_timing === 'other'" class="col-12">
                <q-input
                  v-model="form.upfront_payment_timing_note"
                  outlined
                  dense
                  label="Upfront Payment Timing Note"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-8">
                <q-select
                  v-model="form.remaining_payment_expectation"
                  :options="remainingPaymentOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="When would the remaining payment usually be expected?"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.payment_note"
                  type="textarea"
                  autogrow
                  outlined
                  dense
                  label="Additional Payment Note"
                  bg-color="grey-1"
                />
              </div>
            </div>
          </section>

          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Support Details</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.warranty"
                  outlined
                  dense
                  label="Warranty"
                  hint="Example: 30-day labor warranty"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.message_to_pm"
                  type="textarea"
                  autogrow
                  outlined
                  dense
                  label="Message to PM"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12">
                <q-file
                  v-model="attachmentFiles"
                  multiple
                  clearable
                  use-chips
                  outlined
                  dense
                  :max-files="5"
                  accept="image/*,application/pdf"
                  label="Attachment (quote PDF or photos)"
                  bg-color="grey-1"
                />
              </div>
            </div>
          </section>

          <section class="sp-bid-section">
            <div class="sp-bid-section-label">Confirmation</div>
            <q-checkbox
              v-model="form.disclaimer_acknowledged"
              label="This bid is an estimate only and is not a signed contract. Final scope, pricing, timeline, and payment terms may change and should be confirmed separately before work begins."
            />
          </section>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="q-px-lg q-py-md">
        <q-btn flat no-caps label="Cancel" @click="closeDialog" />
        <q-btn color="primary" no-caps label="Submit Bid" :loading="submitting" @click="submitBid" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from 'src/composables/useFirebase'
import { spPortalApi } from 'src/services/webApiClient'
import { useUserDataStore } from 'src/stores/userDataStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  lead: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const { uploadFile } = useFirebase()
const userStore = useUserDataStore()

const pricingTypeOptions = [
  { label: 'One-time', value: 'one_time' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Per visit', value: 'per_visit' },
  { label: 'Per phase', value: 'per_phase' },
]

const materialsIncludedOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Partially', value: 'partial' },
]

const yesNoOptions = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
]

const upfrontTimingOptions = [
  { label: 'When the bid is accepted', value: 'when_bid_is_accepted' },
  { label: 'Before materials are purchased', value: 'before_materials_are_purchased' },
  { label: 'Before work starts', value: 'before_work_starts' },
  { label: 'At the beginning of the first work stage', value: 'at_first_stage_start' },
  { label: 'Other', value: 'other' },
]

const remainingPaymentOptions = [
  { label: 'After the work is completed', value: 'after_completion' },
  { label: 'At the end of each work stage', value: 'end_of_each_stage' },
  { label: 'Monthly while work is ongoing', value: 'monthly_while_ongoing' },
  { label: 'Other', value: 'other' },
]

const defaultValidUntil = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

const createInitialForm = () => ({
  pricing_type: 'one_time',
  amount: null,
  included_scope: '',
  exclusions: '',
  estimated_start_date: '',
  estimated_duration: '',
  materials_included: 'yes',
  materials_note: '',
  valid_until: defaultValidUntil(),
  warranty: '',
  message_to_pm: '',
  upfront_payment_expected: 'no',
  upfront_payment_amount: null,
  upfront_payment_timing: '',
  upfront_payment_timing_note: '',
  remaining_payment_expectation: 'after_completion',
  payment_note: '',
  disclaimer_acknowledged: false,
})

const form = ref(createInitialForm())
const attachmentFiles = ref([])
const submitting = ref(false)

const leadLocationLabel = computed(() => {
  const lead = props.lead || {}
  const parts = [
    lead.property_city || lead.city || '',
    lead.property_state || lead.state || '',
  ].filter(Boolean)
  const head = parts.join(', ')
  const zip = String(lead.property_zip || lead.zip || lead.zip_code || lead.postal_code || '').trim()
  return [head, zip].filter(Boolean).join(' ').trim() || 'Property details not available'
})

const closeDialog = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  form.value = createInitialForm()
  attachmentFiles.value = []
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

const getSpBidCore = () => {
  const profile = userStore.userProfile || {}
  const spName =
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    userStore.user?.displayName ||
    userStore.user?.email ||
    'Service Provider'

  return {
    sp_id: String(userStore.userId || ''),
    sp_name: spName,
    sp_contact: {
      email: profile.email || userStore.user?.email || '',
      phone: profile.phone || profile.contact_phone || '',
      contact_name: profile.contact_name || profile.full_name || userStore.user?.displayName || spName,
    },
  }
}

const normalizeUploadFile = (entry) => entry?.__file || entry?.file || entry

const uploadAttachments = async (leadDocId, spId) => {
  const files = Array.isArray(attachmentFiles.value) ? attachmentFiles.value : attachmentFiles.value ? [attachmentFiles.value] : []
  const uploaded = []
  for (const rawEntry of files) {
    const file = normalizeUploadFile(rawEntry)
    if (!(file instanceof File)) continue
    const safeName = String(file.name || 'attachment').replace(/[^a-zA-Z0-9_.-]/g, '-')
    const storagePath = `images/bids/${leadDocId}/${spId}/${Date.now()}-${safeName}`
    const url = await uploadFile(storagePath, file)
    uploaded.push({
      name: file.name || safeName,
      url,
      mime_type: file.type || '',
      storage_path: storagePath,
      uploaded_at: new Date().toISOString(),
    })
  }
  return uploaded
}

const submitBid = async () => {
  const leadDocId = props.lead?.id || props.lead?.lead_doc_id || props.lead?.lead_id
  const leadPublicId = props.lead?.lead_id || leadDocId
  const amount = Number(form.value.amount)

  if (!leadDocId) {
    Notify.create({ type: 'negative', message: 'Lead reference is missing.', position: 'top' })
    return
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    Notify.create({ type: 'warning', message: 'Bid amount is required.', position: 'top' })
    return
  }
  if (!form.value.included_scope.trim()) {
    Notify.create({ type: 'warning', message: 'What’s included is required.', position: 'top' })
    return
  }
  if (!form.value.estimated_start_date) {
    Notify.create({ type: 'warning', message: 'Estimated start date is required.', position: 'top' })
    return
  }
  if (!form.value.estimated_duration.trim()) {
    Notify.create({ type: 'warning', message: 'Estimated duration is required.', position: 'top' })
    return
  }
  if (!form.value.valid_until) {
    Notify.create({ type: 'warning', message: 'Valid until is required.', position: 'top' })
    return
  }
  if (!form.value.disclaimer_acknowledged) {
    Notify.create({ type: 'warning', message: 'Please confirm the bid disclaimer before submitting.', position: 'top' })
    return
  }

  submitting.value = true
  try {
    const spId = String(userStore.userId || '')
    const attachments = await uploadAttachments(String(leadDocId), spId)
    const payload = {
      ...getSpBidCore(),
      lead_id: leadPublicId,
      lead_doc_id: leadDocId,
      mx_id: props.lead?.mx_id || props.lead?.task_id || null,
      task_id: props.lead?.task_id || props.lead?.mx_id || null,
      task_doc_id: props.lead?.task_doc_id || null,
      title: props.lead?.title || '',
      amount,
      pricing_type: form.value.pricing_type,
      included_scope: form.value.included_scope.trim(),
      exclusions: form.value.exclusions.trim(),
      estimated_start_date: form.value.estimated_start_date || null,
      estimated_duration: form.value.estimated_duration.trim(),
      materials_included: form.value.materials_included,
      materials_note: form.value.materials_note.trim(),
      valid_until: form.value.valid_until || null,
      warranty: form.value.warranty.trim(),
      message_to_pm: form.value.message_to_pm.trim(),
      note: form.value.message_to_pm.trim(),
      upfront_payment_expected: form.value.upfront_payment_expected,
      upfront_payment_amount:
        form.value.upfront_payment_expected === 'yes' && Number.isFinite(Number(form.value.upfront_payment_amount))
          ? Number(form.value.upfront_payment_amount)
          : null,
      upfront_payment_timing: form.value.upfront_payment_expected === 'yes' ? form.value.upfront_payment_timing || '' : '',
      upfront_payment_timing_note: form.value.upfront_payment_timing_note.trim(),
      remaining_payment_expectation: form.value.remaining_payment_expectation || '',
      payment_note: form.value.payment_note.trim(),
      attachments,
      disclaimer_acknowledged: true,
      disclaimer_text:
        'This bid is an estimate only and is not a signed contract. Final scope, pricing, timeline, and payment terms may change and should be confirmed separately before work begins.',
    }

    const res = await spPortalApi.createBid(payload)
    emit('submitted', res)
    closeDialog()
  } catch (error) {
    const message =
      error?.error_code === 'INSUFFICIENT_CREDITS'
        ? 'Insufficient credits. Your free credit will refresh next week.'
        : error.message || 'Failed to submit bid.'
    Notify.create({ type: 'negative', message, position: 'top' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sp-bid-dialog-card {
  width: min(1080px, 96vw);
  max-width: 96vw;
  border-radius: 16px;
}

.sp-bid-dialog-head {
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(244, 247, 251, 0.98));
}

.sp-bid-dialog-body {
  max-height: 72vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.sp-bid-form-grid {
  display: grid;
  gap: 18px;
}

.sp-bid-section {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.7);
}

.sp-bid-section-label {
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #60758a;
}

body.body--dark .sp-bid-dialog-head {
  background: linear-gradient(135deg, rgba(29, 43, 60, 0.98), rgba(18, 28, 40, 0.98)) !important;
}

body.body--dark .sp-bid-section {
  background: rgba(18, 28, 40, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
}
</style>
