<template>
  <div class="create-transaction workspace-form animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div class="col">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">
              <q-icon name="receipt_long" class="q-mr-sm" />
              Create New Transaction Record
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Record a payment or cost with participants, amount, date, and optional proof.
            </div>
          </div>
          <div class="col-auto row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn workspace-form-cancel"
              :disable="loading || pickerBusy"
              @click="handleCancel"
            />
            <q-btn
              type="submit"
              form="create-transaction-form"
              class="top-action-btn"
              color="primary"
              text-color="white"
              :loading="loading"
              :disable="pickerBusy || completed"
              :label="submitError ? 'Retry save' : 'Save'"
              unelevated
            />
          </div>
        </div>
      </q-card-section>

      <div v-if="saveStage" role="status" aria-live="polite" class="q-px-md q-pb-sm">
        {{ saveStage }}
      </div>

      <q-card-section class="q-pt-none">
        <q-form
          id="create-transaction-form"
          @submit="onSubmit"
          class="q-gutter-sm"
          :inert="loading || completed"
        >
          <div v-if="submitError" role="alert" class="text-negative">{{ submitError }}</div>
          <div v-if="uploadFailed" class="q-mb-md">
            <p>
              Your draft and photo are still here. Retry save, or explicitly continue without the
              photo.
            </p>
            <q-btn outline no-caps label="Save without photo" @click="saveWithoutPhoto" />
          </div>
          <div class="section-label q-mb-xs">Transaction Context</div>
          <div class="row q-gutter-sm">
            <div v-if="propertyId && !showPropertySelect" class="col-12 col-md-6">
              <q-input
                :model-value="propertyName"
                label="Property"
                outlined
                dense
                readonly
                bg-color="grey-1"
              />
            </div>
            <q-select
              v-else
              v-model="selectedPropertyId"
              :options="propertyOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Select Property"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Property selection is required']"
              class="col-12 col-md-6"
              :loading="propertiesLoading"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="home" color="primary" />
              </template>
            </q-select>

            <q-select
              v-model="transactionData.transac_type"
              :options="transactionTypeOptions"
              label="Transaction Type"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Transaction type is required']"
              bg-color="grey-1"
              class="col-12 col-md-6"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>

          <q-select
            v-model="transactionData.financial_category"
            :options="financialCategoryOptions"
            emit-value
            map-options
            label="Financial Category"
            outlined
            dense
            bg-color="grey-1"
            :rules="[(val) => isFinancialCategory(val) || 'Please choose a financial category']"
            hint="Used to categorize this transaction in financial reports."
          />
          <div
            v-if="transactionData.financial_category === 'security_deposit'"
            role="status"
            class="text-caption q-mb-sm"
          >
            For lease balances and refunds, use Lease Deposit tracking. A deposit entered here must
            be linked to a lease from Property &gt; Deposits before it appears in that lease's
            balance.
          </div>
          <div
            v-if="transactionData.financial_category === 'unclassified'"
            role="status"
            class="text-warning q-mb-sm"
          >
            Choose a financial category for accurate reporting. You may save as Unclassified, but
            this transaction will need review before it can be categorized in reports.
          </div>

          <div
            v-if="showPropertySelect && !propertiesLoading && availableProperties.length === 0"
            class="text-caption text-primary q-mb-sm"
          >
            No properties found. Check console for details.
          </div>
          <div class="row q-gutter-sm">
            <q-input
              v-model="transactionData.role"
              label="User Role"
              outlined
              dense
              readonly
              class="col-12"
              bg-color="grey-1"
              style="display: none"
            />
          </div>

          <div class="section-label q-mb-xs q-mt-sm">Transaction Details</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="transactionData.transac_from"
              :options="fromRoleOptions"
              label="Transaction From *"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Please select who the transaction is from']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="north_east" color="primary" />
              </template>
            </q-select>

            <q-select
              v-model="transactionData.transac_to"
              :options="toRoleOptions"
              label="Transaction To *"
              outlined
              dense
              required
              :rules="[
                (val) => !!val || 'Please select who the transaction is to',
                (val) => val !== transactionData.transac_from || 'From and To cannot be the same',
              ]"
              :disable="!transactionData.transac_from"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="south_west" color="primary" />
              </template>
            </q-select>
          </div>

          <div v-if="hasPmParty" class="row q-gutter-sm">
            <q-select
              v-for="side in pmSides"
              :key="side"
              v-model="transactionData[`${side}_account_id`]"
              :options="managerOptions"
              emit-value
              map-options
              :label="
                side === 'from'
                  ? 'From: Property Manager Account *'
                  : 'To: Property Manager Account *'
              "
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-6"
              :loading="participantsLoading"
              :disable="!validPropertyId || participantsLoading || !!participantsError"
              :rules="[
                (val) => isManagerAccount(val) || 'Select the actual property manager account',
              ]"
              hint="Choose the manager involved, not necessarily the person recording this transaction."
            />
            <div v-if="participantsError" role="alert" class="col-12 text-negative">
              {{ participantsError }}
              <q-btn flat dense label="Retry loading managers" @click="loadParticipants" />
            </div>
            <div
              v-else-if="!participantsLoading && !managerOptions.length"
              role="status"
              class="col-12 text-negative"
            >
              No property manager accounts are available. Select a valid property with an assigned
              manager.
            </div>
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model.number="transactionData.amount"
              label="Amount"
              outlined
              dense
              required
              type="number"
              step="0.01"
              :rules="[
                (val) => !!val || 'Amount is required',
                (val) =>
                  (Number.isFinite(Number(val)) && Number(val) > 0) ||
                  'Amount must be a finite number greater than zero',
                (val) =>
                  hasValidCents(val) ||
                  'Use at most two decimal places within the supported amount range',
              ]"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="payments" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="transactionData.transac_date"
              label="Transaction Date"
              outlined
              dense
              required
              type="date"
              :rules="[(val) => isValidDate(val) || 'Enter a valid date in YYYY-MM-DD format']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <q-input
            v-model="transactionData.note"
            label="Note"
            outlined
            dense
            type="textarea"
            rows="3"
            bg-color="grey-1"
          />

          <RecordPhotoPicker
            v-model="selectedFile"
            :disabled="loading || completed"
            @busy="pickerBusy = $event"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { comparePropertyIds, extractPropertyId } from '../utils/propertyIdUtils'
import RecordPhotoPicker from './RecordPhotoPicker.vue'
import { createRecordPhotoUpload } from '../services/recordPhotoUpload'
import {
  createReportTransaction,
  getReportParticipants,
  financialCategoryOptions,
  defaultFinancialCategory,
  isFinancialCategory,
} from '../services/reportTransactionApi'
import { Notify } from 'quasar'
import { localCalendarDate } from '../utils/reportingDates'

const props = defineProps({
  propertyId: { type: String, required: false },
  propertyName: { type: String, default: '' },
  allowPropertyEdit: { type: Boolean, default: true },
  prefill: { type: Object, default: null },
})

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['transaction-created', 'cancel', 'busy-change', 'draft-change'])
const userDataStore = useUserDataStore()
const loading = ref(false)
const pickerBusy = ref(false)
const completed = ref(false)
const saveStage = ref('')
const uploadFailed = ref(false)
const submitError = ref('')
const propertyId = computed(() => props.propertyId || route.params.propertyId)
const propertyName = computed(
  () => props.propertyName || route.query.propertyName || 'Unknown Property',
)
const showPropertySelect = computed(() => props.allowPropertyEdit || !propertyId.value)
const selectedPropertyId = ref(
  extractPropertyId(props.prefill?.property_id || propertyId.value) || '',
)
const effectivePropertyId = computed(() =>
  extractPropertyId(showPropertySelect.value ? selectedPropertyId.value : propertyId.value),
)
const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label:
      property.nickname ||
      property.displayName ||
      property.address ||
      property.full_address ||
      property.name ||
      property.id ||
      property.property_id,
    value: extractPropertyId(property),
  })),
)
const validPropertyId = computed(() => {
  const id = effectivePropertyId.value
  return id && !id.includes('/') && propertyOptions.value.some((option) => option.value === id)
    ? id
    : ''
})
const getUserRoleForProperty = (id) =>
  (userDataStore.userRoles || []).find((role) =>
    comparePropertyIds(extractPropertyId(role.property_id), id),
  )

const roleOptions = [
  'Property Owner',
  'Property Manager',
  'Tenant',
  'Service Provider',
  'Government',
  'HOA',
]
const roleLabels = {
  po: 'Property Owner',
  pm: 'Property Manager',
  tt: 'Tenant',
  sp: 'Service Provider',
  government: 'Government',
  hoa: 'HOA',
}
const partyLabel = (role) => roleLabels[String(role || '').toLowerCase()] || role
const isPm = (role) => partyLabel(role) === 'Property Manager'
const reportParty = (role) =>
  ['Government', 'HOA'].includes(partyLabel(role)) ? 'other' : partyLabel(role)
const transactionTypeOptions = [
  'Rent',
  'Deposit',
  'Tax',
  'Insurance',
  'Utility',
  'Maintenance',
  'Labor',
  'HOA',
  'Management Fee',
  'Fee',
  'Refund',
  'Other',
]
const emptyTransaction = () => ({
  role: '',
  transac_from: '',
  transac_to: '',
  from_account_id: '',
  to_account_id: '',
  financial_category: 'unclassified',
  amount: null,
  transac_date: localCalendarDate(),
  transac_type: '',
  note: '',
  picture_url: '',
})
const transactionData = reactive(emptyTransaction())
const fromRoleOptions = computed(() => roleOptions)
const toRoleOptions = computed(() =>
  transactionData.transac_from
    ? roleOptions.filter((option) => option !== partyLabel(transactionData.transac_from))
    : [],
)
const pmSides = computed(() =>
  ['from', 'to'].filter((side) => isPm(transactionData['transac_' + side])),
)
const hasPmParty = computed(() => pmSides.value.length > 0)
const participants = ref([])
const participantsLoading = ref(false)
const participantsError = ref('')
const managerOptions = computed(() =>
  participants.value.map((participant) => ({
    label: (participant.label || 'Property Manager') + ' (' + participant.id + ')',
    value: participant.id,
  })),
)
const isManagerAccount = (id) =>
  !!validPropertyId.value &&
  !participantsLoading.value &&
  !participantsError.value &&
  managerOptions.value.some((option) => option.value === id)

// An obsolete property request must never repopulate another property's account choices.
let participantsRequest = 0
const loadParticipants = async () => {
  const request = ++participantsRequest
  const id = validPropertyId.value
  participants.value = []
  participantsError.value = ''
  participantsLoading.value = !!id
  if (!id) return
  try {
    const result = await getReportParticipants(id)
    if (request !== participantsRequest) return
    participants.value = result
    for (const side of ['from', 'to']) {
      const key = side + '_account_id'
      if (!result.some((participant) => participant.id === transactionData[key]))
        transactionData[key] = ''
    }
  } catch (error) {
    if (request !== participantsRequest) return
    participantsError.value = error.message || 'Unable to load property manager accounts.'
  } finally {
    if (request === participantsRequest) participantsLoading.value = false
  }
}
onBeforeUnmount(() => {
  participantsRequest += 1
})

watch(propertyId, (id) => {
  selectedPropertyId.value = extractPropertyId(id) || ''
})
watch(
  effectivePropertyId,
  () => {
    transactionData.from_account_id = ''
    transactionData.to_account_id = ''
    submitError.value = ''
  },
  { flush: 'sync' },
)
watch(validPropertyId, loadParticipants, { immediate: true, flush: 'sync' })
watch(
  () => getUserRoleForProperty(effectivePropertyId.value)?.role || '',
  (role) => {
    transactionData.role = role
  },
  { immediate: true },
)
watch(
  () => transactionData.transac_from,
  () => {
    transactionData.from_account_id = ''
    transactionData.transac_to = ''
    transactionData.to_account_id = ''
  },
  { flush: 'sync' },
)
watch(
  () => transactionData.transac_to,
  () => {
    transactionData.to_account_id = ''
  },
  { flush: 'sync' },
)
watch(
  () => transactionData.transac_type,
  (type) => {
    transactionData.financial_category = defaultFinancialCategory(type)
  },
  { flush: 'sync' },
)
watch(
  () => props.prefill,
  (value) => {
    if (!value) return
    if (value.property_id && showPropertySelect.value)
      selectedPropertyId.value = extractPropertyId(value.property_id) || ''
    if (typeof value.transac_type === 'string') transactionData.transac_type = value.transac_type
    if (typeof value.transac_from === 'string')
      transactionData.transac_from = partyLabel(value.transac_from)
    if (typeof value.transac_to === 'string')
      transactionData.transac_to = partyLabel(value.transac_to)
    if (value.amount !== undefined && value.amount !== null) transactionData.amount = value.amount
    if (typeof value.transac_date === 'string') transactionData.transac_date = value.transac_date
    if (typeof value.note === 'string') transactionData.note = value.note
    if (isFinancialCategory(value.financial_category))
      transactionData.financial_category = value.financial_category
    // PM identity is deliberately not inferred from the creator or prefilled role.
  },
  { immediate: true },
)

const selectedFile = ref(null)
let photoUpload = null
let saveAttempt = null
watch(
  [effectivePropertyId, selectedFile],
  () => {
    // Keep the local photo/draft, but never reuse an upload across properties or replacements.
    photoUpload = null
    uploadFailed.value = false
  },
  { flush: 'sync' },
)
watch(
  () => loading.value || pickerBusy.value,
  (busy) => emit('busy-change', busy),
  { flush: 'sync' },
)
watch(
  [transactionData, selectedFile],
  () => {
    emit(
      'draft-change',
      !completed.value &&
        Boolean(
          selectedFile.value ||
            transactionData.amount !== null ||
            transactionData.note ||
            transactionData.transac_type ||
            transactionData.transac_from ||
            transactionData.transac_to,
        ),
    )
  },
  { deep: true, flush: 'sync' },
)
async function saveWithoutPhoto() {
  if (loading.value || pickerBusy.value || !uploadFailed.value) return
  selectedFile.value = null
  await onSubmit()
}

const hasValidCents = (value) => {
  const amount = Number(value)
  return (
    Number.isFinite(amount) &&
    Number.isSafeInteger(Math.round(amount * 100)) &&
    Number(amount.toFixed(2)) === amount
  )
}
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(value + 'T00:00:00Z')
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}
const validateTransaction = () => {
  if (!validPropertyId.value) return 'Please select a valid, accessible property.'
  if (!transactionTypeOptions.includes(transactionData.transac_type))
    return 'Please select a transaction type.'
  if (!isFinancialCategory(transactionData.financial_category))
    return 'Please choose a financial category.'
  if (
    !roleOptions.includes(partyLabel(transactionData.transac_from)) ||
    !roleOptions.includes(partyLabel(transactionData.transac_to))
  )
    return 'Please select both transaction parties.'
  if (partyLabel(transactionData.transac_from) === partyLabel(transactionData.transac_to))
    return 'From and To cannot be the same.'
  for (const side of pmSides.value) {
    if (!isManagerAccount(transactionData[side + '_account_id'])) {
      return 'Select the actual property manager account for the ' + side + ' party.'
    }
  }
  if (!Number.isFinite(Number(transactionData.amount)) || Number(transactionData.amount) <= 0) {
    return 'Amount must be a finite number greater than zero.'
  }
  if (!hasValidCents(transactionData.amount))
    return 'Use at most two decimal places within the supported amount range.'
  if (!isValidDate(transactionData.transac_date)) return 'Enter a valid date in YYYY-MM-DD format.'
  return ''
}
const onSubmit = async () => {
  if (loading.value || pickerBusy.value || completed.value) return
  submitError.value = validateTransaction()
  if (submitError.value) {
    Notify.create({ type: 'negative', message: submitError.value, position: 'top' })
    return
  }
  loading.value = true
  uploadFailed.value = false
  try {
    const id = validPropertyId.value
    const file = selectedFile.value
    const payload = {
      ...transactionData,
      property_id: id,
      role: getUserRoleForProperty(id)?.role || '',
      created_by_role: getUserRoleForProperty(id)?.role || '',
      transac_from: reportParty(transactionData.transac_from),
      transac_to: reportParty(transactionData.transac_to),
      from_account_id: isPm(transactionData.transac_from) ? transactionData.from_account_id : '',
      to_account_id: isPm(transactionData.transac_to) ? transactionData.to_account_id : '',
      amount: Number(transactionData.amount),
      created_by: userDataStore.userId,
      created_by_user_id: userDataStore.userId,
      picture_url: '',
    }
    const fingerprint = JSON.stringify(payload)
    if (!saveAttempt || saveAttempt.fingerprint !== fingerprint || saveAttempt.file !== file) {
      const key = crypto.randomUUID()
      saveAttempt = {
        key,
        fingerprint,
        file,
        payload: {
          ...payload,
          transac_id: 'txn_' + key,
          created_datetime: new Date().toISOString(),
        },
      }
    }
    const transactionDataToSave = saveAttempt.payload
    if (file) {
      try {
        photoUpload ||= createRecordPhotoUpload({ propertyId: id, file })
        transactionDataToSave.picture_url = await photoUpload.upload((stage) => {
          saveStage.value = stage
        })
      } catch (error) {
        uploadFailed.value = true
        throw new Error(`Photo was not saved. ${error.message || 'Please retry.'}`)
      }
    }
    if (validPropertyId.value !== id || selectedFile.value !== file)
      throw new Error('The property or photo changed. Review your draft and save again.')
    saveStage.value = 'Saving transaction...'
    const result = await createReportTransaction(id, transactionDataToSave, {
      idempotencyKey: saveAttempt.key,
    })
    completed.value = true
    saveAttempt = null
    Object.assign(transactionData, emptyTransaction(), {
      role: getUserRoleForProperty(effectivePropertyId.value)?.role || '',
    })
    selectedFile.value = null
    photoUpload = null
    emit('draft-change', false)
    emit('transaction-created', { ...transactionDataToSave, ...result.transaction, id: result.id })
    Notify.create({
      type: 'positive',
      message: 'Transaction created successfully!',
      position: 'top',
    })
    if (String(route.path || '').startsWith('/create-transaction')) router.push('/transactions')
  } catch (error) {
    submitError.value = error.message || 'Failed to create transaction. Please try again.'
    Notify.create({ type: 'negative', message: submitError.value, position: 'top' })
  } finally {
    loading.value = false
    saveStage.value = ''
  }
}
const handleCancel = () => {
  if (loading.value || pickerBusy.value) return
  emit('cancel')
  if (String(route.path || '').startsWith('/create-transaction')) router.back()
}
</script>

<style scoped>
.create-transaction {
  max-width: 1200px;
  margin: 0 auto;
}

.top-action-btn {
  min-width: 112px;
  min-height: 48px;
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-transaction .elevated,
:global(body.body--dark) .create-transaction .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-transaction .bg-grey-1,
:global(body.body--dark) .create-transaction .q-field__control,
:global(body.body--dark) .create-transaction .picture-upload-section,
:global(body.body--dark) .create-transaction .image-preview {
  background: #223041 !important;
  border-color: #35506a;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.q-input {
  transition: var(--transition);
}

.q-input:hover {
  transform: translateY(-1px);
}

.q-select {
  transition: var(--transition);
}

.q-select:hover {
  transform: translateY(-1px);
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

.picture-upload-section {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius-sm);
  background-color: #fafafa;
}

.image-preview {
  position: relative;
  display: inline-block;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background-color: white;
}

.image-preview .q-img {
  display: block;
}
</style>
