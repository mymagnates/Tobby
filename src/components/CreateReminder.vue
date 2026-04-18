<template>
  <div class="create-reminder animate-fade-in">
    <div class="create-reminder-buffer create-reminder-buffer--top"></div>
    <q-card class="elevated">
      <q-btn
        flat
        round
        dense
        icon="close"
        color="primary"
        class="create-reminder-close"
        @click="emit('cancel')"
      />
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div class="col">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">
              <q-icon name="notifications_active" class="q-mr-sm" />
              {{ isEditing ? 'Edit Reminder' : 'Create New Reminder' }}
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Capture reminder details and schedule in one step.
            </div>
            <div v-if="hasMatchedFixedProperty && !showPropertySelect" class="text-caption text-grey-6 q-mb-xs">
              Property: {{ resolvedFixedPropertyName }}
            </div>
            <div v-else class="section-label q-mb-xs">Property Context</div>
          </div>
          <div class="col-auto row items-center q-gutter-sm">
            <q-btn unelevated color="primary" text-color="white" label="Cancel" class="top-action-btn" @click="emit('cancel')" />
            <q-btn type="submit" form="create-reminder-form" class="top-action-btn" color="primary" text-color="white" :loading="saving" label="Save" unelevated />
          </div>
        </div>
        <q-select
          v-if="showPropertySelect"
          v-model="form.property_id"
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
          class="q-mb-xs"
          :loading="propertiesLoading"
          bg-color="grey-1"
        >
          <template #prepend>
            <q-icon name="home" color="primary" />
          </template>
        </q-select>
        <div v-if="showPropertySelect" class="text-caption text-grey-6 q-mb-xs">
          <div v-if="fixedPropertyId && !hasMatchedFixedProperty" class="text-warning q-mb-xs">
            Fixed property context is invalid, please choose from your accessible properties.
          </div>
          <div v-if="propertiesLoading" class="text-primary">Loading properties...</div>
          <div v-if="!propertiesLoading && propertyOptions.length === 0" class="text-primary">
            No properties found. Check console for details.
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form id="create-reminder-form" @submit="onSubmit" class="q-gutter-sm">
          <div class="section-label q-mb-xs">Reminder Details</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="form.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              label="Category *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Category is required']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="sell" color="primary" />
              </template>
            </q-select>
            <q-select
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              label="Reminder Status"
              outlined
              dense
              emit-value
              map-options
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="flag" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model="form.note"
              label="Reminder Note"
              outlined
              autogrow
              type="textarea"
              :input-style="{ minHeight: '110px' }"
              class="col-12"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="note_alt" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model="form.start_date"
              label="Start Date *"
              type="date"
              outlined
              dense
              :rules="[(val) => !!val || 'Start date is required']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model="form.due_date"
              label="Due Date"
              type="date"
              outlined
              dense
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="event_available" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="row q-gutter-sm">
            <q-select
              v-model="form.repeat_by"
              :options="repeatOptions"
              option-label="label"
              option-value="value"
              label="Repeat By"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="repeat" color="primary" />
              </template>
            </q-select>
            <q-input
              v-model.number="form.amount"
              label="Amount"
              type="number"
              step="0.01"
              outlined
              dense
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="attach_money" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="create-reminder-buffer create-reminder-buffer--bottom"></div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'

const props = defineProps({
  propertyId: { type: String, default: '' },
  propertyName: { type: String, default: '' },
  allowPropertyEdit: { type: Boolean, default: true },
  prefill: { type: Object, default: null },
})

const emit = defineEmits(['reminder-saved', 'cancel'])

const userDataStore = useUserDataStore()
const { createDocument, updateDocument } = useFirebase()

const saving = ref(false)
const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label: property.nickname || property.displayName || property.address || property.id,
    value: property.id || property.property_id,
  })),
)
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const fixedPropertyId = computed(() => String(props.propertyId || '').trim())
const matchedFixedProperty = computed(() =>
  availableProperties.value.find(
    (property) => String(property.id || property.property_id || '').trim() === fixedPropertyId.value,
  ) || null,
)
const hasMatchedFixedProperty = computed(() => Boolean(matchedFixedProperty.value))
const showPropertySelect = computed(() => props.allowPropertyEdit || !hasMatchedFixedProperty.value)
const resolvedFixedPropertyName = computed(() =>
  matchedFixedProperty.value
    ? matchedFixedProperty.value.nickname ||
      matchedFixedProperty.value.displayName ||
      matchedFixedProperty.value.address ||
      props.propertyName ||
      'Unknown Property'
    : props.propertyName,
)

const categoryOptions = [
  { label: 'Fee', value: 'fee' },
  { label: 'HOA', value: 'hoa' },
  { label: 'Rent', value: 'rent' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Labor', value: 'labor' },
  { label: 'Tax', value: 'tax' },
  { label: 'Other', value: 'other' },
]

const repeatOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'One-time', value: 'one-time' },
]

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]

const createEmptyForm = () => ({
  property_id: fixedPropertyId.value || null,
  category: '',
  start_date: new Date().toISOString().split('T')[0],
  due_date: new Date().toISOString().split('T')[0],
  repeat_by: '',
  amount: null,
  note: '',
  status: true,
})

const form = ref(createEmptyForm())
const isEditing = computed(() => Boolean(props.prefill?.id))

watch(
  () => props.prefill,
  (value) => {
    if (!value) {
      form.value = createEmptyForm()
      return
    }
    form.value = {
      property_id: value.property_id || fixedPropertyId.value || null,
      category: value.category || '',
      start_date: value.start_date || new Date().toISOString().split('T')[0],
      due_date: value.due_date || value.start_date || new Date().toISOString().split('T')[0],
      repeat_by: value.repeat_by || '',
      amount: value.amount ?? null,
      note: value.note || '',
      status: value.status !== false,
    }
  },
  { immediate: true },
)

watch(
  [propertyOptions, fixedPropertyId],
  ([options, fixedId]) => {
    if (isEditing.value) return
    if (!form.value.property_id && fixedId) {
      const matchedOption = options.find(
        (option) => String(option.value || '').trim() === String(fixedId).trim(),
      )
      if (matchedOption) {
        form.value.property_id = matchedOption.value
        return
      }
    }
    if (!form.value.property_id && options.length > 0) {
      form.value.property_id = options[0].value
    }
  },
  { immediate: true },
)

const onSubmit = async () => {
  if (!userDataStore.isAuthenticated) {
    Notify.create({ type: 'negative', message: 'Please sign in to create reminders', position: 'top' })
    return
  }
  if (!userDataStore.userId) {
    Notify.create({ type: 'negative', message: 'User ID not available. Please sign in again.', position: 'top' })
    return
  }

  saving.value = true
  try {
    const propertyId = form.value.property_id?.value || form.value.property_id?.id || form.value.property_id
    if (!propertyId) {
      Notify.create({ type: 'negative', message: 'Please select a property', position: 'top' })
      return
    }

    const selectedProperty = userDataStore.getPropertyById(propertyId)
    if (!selectedProperty) {
      Notify.create({ type: 'negative', message: 'Selected property not found. Please refresh and try again.', position: 'top' })
      return
    }

    const normalizedCategory = String(form.value.category?.value || form.value.category || '').trim().toLowerCase()
    if (!normalizedCategory) {
      Notify.create({ type: 'negative', message: 'Please select a category', position: 'top' })
      return
    }
    if (!form.value.start_date) {
      Notify.create({ type: 'negative', message: 'Please select a start date', position: 'top' })
      return
    }

    const normalizedRepeat = String(form.value.repeat_by?.value || form.value.repeat_by || '').trim().toLowerCase()
    const amountValue = form.value.amount
    const normalizedAmount = amountValue === null || amountValue === '' || Number.isNaN(Number(amountValue))
      ? null
      : Number(amountValue)

    const reminderData = {
      category: normalizedCategory,
      start_date: form.value.start_date,
      due_date: form.value.due_date || form.value.start_date,
      repeat_by: normalizedRepeat || 'one-time',
      amount: normalizedAmount,
      note: String(form.value.note || '').trim(),
      status: !!form.value.status,
      created_date: new Date().toISOString(),
      created_by: userDataStore.userId,
    }

    let reminderId = props.prefill?.id || ''
    if (isEditing.value) {
      await updateDocument(`properties/${propertyId}/reminders`, reminderId, reminderData)
      Notify.create({ type: 'positive', message: 'Reminder updated successfully', position: 'top' })
    } else {
      reminderId = await createDocument(`properties/${propertyId}/reminders`, reminderData)
      Notify.create({ type: 'positive', message: 'Reminder created successfully', position: 'top' })
    }

    emit('reminder-saved', { id: reminderId, property_id: propertyId, ...reminderData })
  } catch (error) {
    console.error('Failed to save reminder:', error)
    Notify.create({ type: 'negative', message: error?.message || 'Failed to save reminder', position: 'top' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.create-reminder {
  max-width: 1200px;
  margin: 0 auto;
}

.create-reminder-buffer--top {
  height: 12px;
}

.create-reminder-buffer--bottom {
  height: 48px;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.elevated {
  position: relative;
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-reminder .elevated,
:global(body.body--dark) .create-reminder .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-reminder .bg-grey-1,
:global(body.body--dark) .create-reminder .q-field__control {
  background: #223041 !important;
}

.create-reminder-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

</style>
