<template>
  <div class="create-lease animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div class="col">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">
              <q-icon name="home_work" class="q-mr-sm" />
              Create New Lease
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Capture lease terms, pricing, and notes in one step.
            </div>
          </div>
          <div class="col-auto row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn"
              @click="handleCancel"
            />
            <q-btn
              type="submit"
              form="create-lease-form"
              class="top-action-btn"
              color="primary"
              text-color="white"
              :loading="submitting"
              :disable="!isFormValid"
              label="Save"
              unelevated
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none create-lease-body">
        <q-form id="create-lease-form" @submit="onSubmit" class="create-lease-form q-gutter-sm">
          <div v-if="hasMatchedFixedProperty && !showPropertySelect" class="text-caption text-grey-6 q-mb-xs">
            Property: {{ resolvedFixedPropertyName }}
          </div>
          <div v-else class="section-label q-mb-xs">Property Context</div>
          <q-select
            v-if="showPropertySelect"
            v-model="selectedPropertyId"
            :options="propertyOptions"
            option-value="id"
            option-label="displayName"
            emit-value
            map-options
            label="Select Property"
            outlined
            dense
            bg-color="grey-1"
            clearable
            :loading="propertiesLoading"
            :disable="propertiesLoading"
          >
            <template v-slot:prepend>
              <q-icon name="home" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No properties available</q-item-section>
              </q-item>
            </template>
          </q-select>

          <div v-if="selectedPropertyInfo" class="property-summary">
            <div class="property-summary-item">
              <div class="property-summary-label">Type</div>
              <div class="property-summary-value">{{ selectedPropertyInfo.property_type || 'N/A' }}</div>
            </div>
            <div class="property-summary-item">
              <div class="property-summary-label">Beds</div>
              <div class="property-summary-value">{{ selectedPropertyInfo.bedrooms || 'N/A' }}</div>
            </div>
            <div class="property-summary-item">
              <div class="property-summary-label">Baths</div>
              <div class="property-summary-value">{{ selectedPropertyInfo.bathrooms || 'N/A' }}</div>
            </div>
            <div class="property-summary-item">
              <div class="property-summary-label">Size</div>
              <div class="property-summary-value">{{ selectedPropertyInfo.size || 'N/A' }}</div>
            </div>
          </div>

          <div class="section-label q-mb-xs">Lease Basics</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="leaseData.status"
              :options="leaseStatusOptions"
              label="Lease Status"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
              :rules="[(val) => !!val || 'Status is required']"
            >
              <template v-slot:prepend>
                <q-icon name="flag" color="primary" />
              </template>
            </q-select>
            <q-input
              v-model.number="leaseData.lease_term"
              label="Lease Term (months)"
              type="number"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
              :rules="[(val) => !!val || 'Lease term is required']"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model="leaseData.lease_create_date"
              label="Lease Create Date"
              type="date"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
              :rules="[(val) => !!val || 'Create date is required']"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="section-label q-mb-xs">Pricing and Fees</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="leaseData.rate_type"
              :options="rateTypeOptions"
              label="Rate Type"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
              :rules="[(val) => !!val || 'Rate type is required']"
            >
              <template v-slot:prepend>
                <q-icon name="payments" color="primary" />
              </template>
            </q-select>
            <q-input
              v-model.number="leaseData.rate_amount"
              label="Rate Amount"
              type="number"
              step="0.01"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
              :rules="[(val) => !!val || 'Rate amount is required']"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model.number="leaseData.deposit"
              label="Deposit Amount"
              type="number"
              step="0.01"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
            >
              <template v-slot:prepend>
                <q-icon name="savings" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model.number="leaseData.pet_fee"
              label="Pet Fee"
              type="number"
              step="0.01"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-6"
            >
              <template v-slot:prepend>
                <q-icon name="pets" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model.number="leaseData.application_fee_per_person"
              label="Application Fee per Person"
              type="number"
              step="0.01"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-6"
            >
              <template v-slot:prepend>
                <q-icon name="request_quote" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="section-label q-mb-xs">Property Features</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="leaseData.utilities_included"
              :options="utilitiesOptions"
              label="Utilities Included"
              multiple
              use-chips
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-8"
            />
            <q-select
              v-model="leaseData.furnished"
              :options="furnishedOptions"
              label="Furnished Status"
              outlined
              dense
              bg-color="grey-1"
              class="col-12 col-md-4"
            />
          </div>

          <div class="section-label q-mb-xs">Notes</div>
          <div class="row q-gutter-sm">
            <q-input
              v-model="leaseData.special_terms"
              label="Special Terms"
              type="textarea"
              autogrow
              outlined
              bg-color="grey-1"
              class="col-12 col-md-6"
              :input-style="{ minHeight: '100px' }"
            >
              <template v-slot:prepend>
                <q-icon name="article" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model="leaseData.additional_notes"
              label="Additional Notes"
              type="textarea"
              autogrow
              outlined
              bg-color="grey-1"
              class="col-12 col-md-6"
              :input-style="{ minHeight: '100px' }"
            >
              <template v-slot:prepend>
                <q-icon name="note_alt" color="primary" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'

const props = defineProps({
  propertyId: {
    type: String,
    default: '',
  },
  propertyName: {
    type: String,
    default: '',
  },
  allowPropertyEdit: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['lease-created', 'cancel'])
const PRIMARY_INVENTORY_DOC_ID = 'primary'
const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument } = useFirebase()

const selectedPropertyId = ref('')
const submitting = ref(false)

const leaseData = ref({
  property_id: '',
  property: null,
  status: '',
  lease_term: null,
  lease_create_date: new Date().toISOString().split('T')[0],
  rate_type: '',
  rate_amount: null,
  deposit: null,
  pet_fee: null,
  application_fee_per_person: null,
  utilities_included: [],
  furnished: '',
  special_terms: '',
  additional_notes: '',
})

const leaseStatusOptions = ['Available', 'Rented', 'Pending', 'Expired', 'Terminated']
const rateTypeOptions = ['month', 'day', 'year']
const utilitiesOptions = ['Electricity', 'Water', 'Gas', 'Internet', 'Cable TV', 'Trash', 'Sewer']
const furnishedOptions = ['Yes', 'No', 'Partially']

const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const propertiesLoading = computed(() => Boolean(userDataStore.propertiesLoading))

const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    id: String(property.id || property.property_id || ''),
    displayName: `${property.nickname || property.name || 'Unnamed'} - ${property.address || 'No Address'}`,
    ...property,
  })),
)

const fixedPropertyId = computed(() =>
  String(
    props.propertyId ||
      route.params.propertyId ||
      route.query.property ||
      route.query.propertyId ||
      '',
  ).trim(),
)

const matchedFixedProperty = computed(
  () =>
    availableProperties.value.find(
      (property) => String(property.id || property.property_id || '').trim() === fixedPropertyId.value,
    ) || null,
)

const hasMatchedFixedProperty = computed(() => Boolean(matchedFixedProperty.value))
const showPropertySelect = computed(() => props.allowPropertyEdit || !hasMatchedFixedProperty.value)
const resolvedFixedPropertyName = computed(() =>
  matchedFixedProperty.value?.nickname ||
  matchedFixedProperty.value?.name ||
  matchedFixedProperty.value?.address ||
  props.propertyName ||
  'Unknown Property',
)

const selectedProperty = computed(() => {
  const targetId = String(selectedPropertyId.value || '').trim()
  if (!targetId) return null
  return (
    availableProperties.value.find(
      (property) => String(property.id || property.property_id || '').trim() === targetId,
    ) || null
  )
})

const selectedPropertyInfo = computed(() => {
  const property = selectedProperty.value
  if (!property) return null
  const sizeValue = property.spec?.size || property.spec?.square_feet || property.size || 0
  return {
    property_type: property.spec?.type || property.type || property.property_type || '',
    bedrooms: property.spec?.bedroom || property.spec?.bedrooms || '',
    bathrooms: property.spec?.full_bathroom || property.spec?.bathrooms || '',
    size: sizeValue ? `${Number(sizeValue).toLocaleString()} sq ft` : '',
  }
})

const isFormValid = computed(
  () =>
    Boolean(
      selectedPropertyId.value &&
        leaseData.value.status &&
        leaseData.value.lease_term &&
        leaseData.value.lease_create_date &&
        leaseData.value.rate_type &&
        leaseData.value.rate_amount,
    ),
)

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeDocId = (value) => {
  if (!value) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
  if (typeof value === 'object') return String(value.id || value.docId || '').trim()
  return ''
}

const onPropertySelected = (propertyId) => {
  const normalizedId = String(propertyId || '').trim()
  const property =
    availableProperties.value.find(
      (row) => String(row.id || row.property_id || '').trim() === normalizedId,
    ) || null
  selectedPropertyId.value = normalizedId
  leaseData.value.property_id = normalizedId
  leaseData.value.property = property ? { ...property } : null
}

const handleCancel = () => {
  emit('cancel')
  if (String(route.path || '').startsWith('/create-lease')) {
    router.back()
  }
}

const onSubmit = async () => {
  if (!isFormValid.value) {
    Notify.create({
      type: 'negative',
      message: 'Please fill in all required fields.',
      position: 'top',
    })
    return
  }

  submitting.value = true
  try {
    const property = selectedProperty.value
    const propertyId = String(selectedPropertyId.value || '').trim()
    if (!propertyId || !property) {
      throw new Error('Please select a valid property.')
    }

    const now = new Date()
    const propertyNickname = property.nickname || property.name || 'Property'
    const LSID = `${propertyNickname}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`

    const leaseDataToSave = {
      property_id: { ...property },
      property_string_id: propertyId,
      LSID,
      status: leaseData.value.status,
      lease_term: toNumber(leaseData.value.lease_term, 0),
      lease_create_date: leaseData.value.lease_create_date,
      rate_type: leaseData.value.rate_type,
      rate_amount: toNumber(leaseData.value.rate_amount, 0),
      deposit: toNumber(leaseData.value.deposit, 0),
      pet_fee: toNumber(leaseData.value.pet_fee, 0),
      application_fee_per_person: toNumber(leaseData.value.application_fee_per_person, 0),
      utilities_included: Array.isArray(leaseData.value.utilities_included)
        ? leaseData.value.utilities_included
        : [],
      furnished: leaseData.value.furnished || '',
      special_terms: String(leaseData.value.special_terms || ''),
      additional_notes: String(leaseData.value.additional_notes || ''),
      created_at: now.toISOString(),
      created_datetime: now,
      created_by: userDataStore.userId,
      updated_at: now.toISOString(),
    }

    const leaseCreateResult = await createDocument('leases', leaseDataToSave)
    const leaseDocId = normalizeDocId(leaseCreateResult)
    if (!leaseDocId) {
      throw new Error('Lease created but lease document ID is missing.')
    }

    const inventorySeedData = {
      property_id: propertyId,
      property_address: property.address || '',
      lease_doc_id: leaseDocId,
      lease_lsid: LSID,
      created_datetime: now.toISOString(),
      updated_datetime: now.toISOString(),
    }
    await createDocument(`leases/${leaseDocId}/inventories`, inventorySeedData, PRIMARY_INVENTORY_DOC_ID)

    if (typeof userDataStore.refreshLeases === 'function') {
      await userDataStore.refreshLeases()
    }

    Notify.create({
      type: 'positive',
      message: 'Lease created successfully.',
      position: 'top',
    })

    emit('lease-created', { id: leaseDocId, ...leaseDataToSave })

    if (String(route.path || '').startsWith('/create-lease')) {
      router.push('/leases')
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to create lease. Please try again.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

watch(
  [propertyOptions, fixedPropertyId],
  ([options, fixedId]) => {
    if (!selectedPropertyId.value && fixedId) {
      const matchedOption = options.find((option) => String(option.id) === String(fixedId))
      if (matchedOption) {
        onPropertySelected(matchedOption.id)
        return
      }
    }
    if (!selectedPropertyId.value && options.length > 0) {
      onPropertySelected(options[0].id)
    }
  },
  { immediate: true },
)

watch(
  () => selectedPropertyId.value,
  (next) => {
    if (!next) {
      leaseData.value.property_id = ''
      leaseData.value.property = null
      return
    }
    const current = String(leaseData.value.property_id || '')
    if (current !== String(next)) {
      onPropertySelected(next)
    }
  },
)
</script>

<style scoped>
.create-lease {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.create-lease-form {
  width: 100%;
  min-height: 0;
}

.elevated {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-lease .elevated,
:global(body.body--dark) .create-lease .q-card__section:not(.composer-head),
:global(body.body--dark) .create-lease .create-lease-body {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-lease .bg-grey-1,
:global(body.body--dark) .create-lease .q-field__control,
:global(body.body--dark) .create-lease .lease-notes-card {
  background: #223041 !important;
  border-color: #35506a;
}

.create-lease-body {
  background: #fff;
  padding-bottom: 28px;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.property-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 6px;
  padding: 10px;
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-card);
  background: #fafcff;
}

.property-summary-item {
  padding: 8px;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--primary-color);
  background: rgba(36, 87, 115, 0.04);
}

.property-summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.property-summary-value {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--neutral-800);
  margin-top: 2px;
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .property-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .create-lease {
    padding: 0;
  }

  .property-summary {
    grid-template-columns: 1fr;
  }
}
</style>
