<template>
  <div class="create-service">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div class="col">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">
              <q-icon name="handyman" class="q-mr-sm" />
              Create New Service
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Track service providers, contracts, and renewal details in one step.
            </div>
            <div v-if="resolvedPropertyName" class="text-caption text-grey-7">
              Property: {{ resolvedPropertyName || 'Selected Property' }}
            </div>
            <div v-else class="section-label q-mb-xs">Property Context</div>
          </div>
          <div class="col-auto row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn"
              @click="emit('cancel')"
            />
            <q-btn
              type="submit"
              form="create-service-form"
              color="primary"
              text-color="white"
              unelevated
              :loading="saving"
              :disable="serviceDisabled"
              label="Save"
              class="top-action-btn"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form id="create-service-form" @submit="onSubmit" class="q-gutter-md">
          <section class="service-create-panel">
            <div class="service-create-panel__header">
              <div class="section-label">Property Context</div>
              <div class="text-caption text-grey-6">Choose the main property and where this service applies.</div>
            </div>

            <q-select
              v-if="showPropertySelect"
              v-model="selectedPropertyId"
              :options="propertyOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Select Property"
              outlined
              dense
              :disable="serviceDisabled"
              :rules="[(val) => !!val || 'Property selection is required']"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="home" color="primary" />
              </template>
            </q-select>

            <q-select
              v-model="selectedServicePropertyIds"
              :options="propertyOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              multiple
              use-chips
              label="Properties Using This Service"
              outlined
              dense
              :disable="serviceDisabled"
              :rules="[(val) => Array.isArray(val) && val.length > 0 || 'Select at least one property']"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="apartment" color="primary" />
              </template>
            </q-select>
          </section>

          <section class="service-create-panel">
            <div class="service-create-panel__header">
              <div class="section-label">Service Details</div>
              <div class="text-caption text-grey-6">Core service terms and provider information.</div>
            </div>

            <div class="service-create-form-grid">
              <q-select
                v-model="serviceForm.service_type"
                :options="serviceTypeOptions"
                dense
                outlined
                label="Service Type"
                emit-value
                map-options
                :disable="serviceDisabled"
                :rules="[(val) => !!val || 'Service type is required']"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.company_name"
                dense
                outlined
                label="Company Name"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.term"
                dense
                outlined
                label="Term"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.service_start_date"
                dense
                outlined
                type="date"
                label="Service Start Date"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.company_website"
                dense
                outlined
                label="Company Website"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
            </div>
          </section>

          <section class="service-create-panel">
            <div class="service-create-panel__header">
              <div class="section-label">Agent Contact</div>
              <div class="text-caption text-grey-6">Primary service contact details.</div>
            </div>

            <div class="service-create-form-grid">
              <q-input
                v-model="serviceForm.agent_company"
                dense
                outlined
                label="Agent Company"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.agent_name"
                dense
                outlined
                label="Agent Contact"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.agent_phone"
                dense
                outlined
                label="Agent Phone"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
              <q-input
                v-model="serviceForm.agent_email"
                dense
                outlined
                label="Agent Email"
                :disable="serviceDisabled"
                bg-color="grey-1"
              />
            </div>
          </section>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
  propertyName: {
    type: String,
    default: '',
  },
  allowPropertyEdit: {
    type: Boolean,
    default: true,
  },
  prefill: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['service-created', 'cancel'])

const userDataStore = useUserDataStore()
const { createDocument } = useFirebase()

const saving = ref(false)
const selectedPropertyId = ref('')
const selectedServicePropertyIds = ref([])
const serviceForm = ref({
  service_type: 'loan',
  company_name: '',
  company_website: '',
  agent_company: '',
  agent_name: '',
  agent_phone: '',
  agent_email: '',
  service_start_date: '',
  term: '',
})

const serviceTypeOptions = [
  { label: 'Loan', value: 'loan' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Pest Control', value: 'pest_control' },
  { label: 'Lawn', value: 'lawn' },
  { label: 'Pool', value: 'pool' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'HVAC', value: 'hvac' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Electrical', value: 'electrical' },
  { label: 'Security / Alarm', value: 'security' },
  { label: 'Trash / Waste', value: 'trash' },
  { label: 'Snow Removal', value: 'snow_removal' },
]

const propertyOptions = computed(() =>
  (userDataStore.userAccessibleProperties || []).map((property) => ({
    label: property.nickname || property.address || property.id,
    value: property.id,
  })),
)

const fixedPropertyId = computed(() => String(props.propertyId || '').trim())
const hasMatchedFixedProperty = computed(() =>
  propertyOptions.value.some((option) => String(option.value || '').trim() === fixedPropertyId.value),
)
const showPropertySelect = computed(() => props.allowPropertyEdit || !hasMatchedFixedProperty.value)
const resolvedPropertyId = computed(() => {
  if (!showPropertySelect.value && fixedPropertyId.value) return fixedPropertyId.value
  return String(selectedPropertyId.value || '').trim()
})
const resolvedPropertyName = computed(() => {
  const selectedId = resolvedPropertyId.value
  if (!selectedId) return props.propertyName || ''
  const match = propertyOptions.value.find((option) => String(option.value) === String(selectedId))
  return match?.label || props.propertyName || ''
})
const serviceDisabled = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  return !['pm', 'admin'].includes(accountType)
})

const applyPrefill = (value) => {
  if (!value) return
  const propertyId = String(value.property_id || value.propertyId || '').trim()
  if (propertyId) {
    selectedPropertyId.value = propertyId
    selectedServicePropertyIds.value = Array.from(
      new Set([
        propertyId,
        ...(Array.isArray(value.selectedServicePropertyIds) ? value.selectedServicePropertyIds : []),
        ...(Array.isArray(value.property_ids) ? value.property_ids : []),
      ].map((id) => String(id || '').trim()).filter(Boolean)),
    )
  }
  serviceForm.value = {
    service_type: value.service_type || serviceForm.value.service_type || 'loan',
    company_name: value.company_name || '',
    company_website: value.company_website || '',
    agent_company: value.agent_company || value.agent?.company || '',
    agent_name: value.agent_name || value.agent?.name || '',
    agent_phone: value.agent_phone || value.agent?.phone || '',
    agent_email: value.agent_email || value.agent?.email || '',
    service_start_date: value.service_start_date || '',
    term: value.term || '',
  }
}

const onSubmit = async () => {
  if (serviceDisabled.value) return
  const propertyId = resolvedPropertyId.value
  if (!propertyId) {
    Notify.create({ type: 'warning', message: 'Please select property.', position: 'top' })
    return
  }
  const normalizedPropertyIds = Array.from(
    new Set(
      [propertyId, ...selectedServicePropertyIds.value]
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  )
  if (normalizedPropertyIds.length === 0) {
    Notify.create({ type: 'warning', message: 'Please select at least one property for this service.', position: 'top' })
    return
  }
  try {
    saving.value = true
    const now = new Date().toISOString()
    const propertyLabels = normalizedPropertyIds.map((id) => {
      const match = propertyOptions.value.find((option) => String(option.value || '').trim() === id)
      return {
        id,
        label: match?.label || userDataStore.getPropertyName(id) || id,
      }
    })
    const payload = {
      service_type: serviceForm.value.service_type || 'loan',
      property_ids: normalizedPropertyIds,
      properties: propertyLabels,
      company_name: serviceForm.value.company_name || '',
      company_website: serviceForm.value.company_website || '',
      agent: {
        company: serviceForm.value.agent_company || '',
        name: serviceForm.value.agent_name || '',
        phone: serviceForm.value.agent_phone || '',
        email: serviceForm.value.agent_email || '',
      },
      service_start_date: serviceForm.value.service_start_date || '',
      term: serviceForm.value.term || '',
      created_at: now,
      updated_at: now,
    }
    const id = await createDocument(`properties/${propertyId}/services`, payload)
    emit('service-created', { id, property_id: propertyId, ...payload })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to save service.',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

watch(
  () => resolvedPropertyId.value,
  (value) => {
    const normalized = String(value || '').trim()
    if (!normalized) return
    if (!selectedServicePropertyIds.value.includes(normalized)) {
      selectedServicePropertyIds.value = [...selectedServicePropertyIds.value, normalized]
    }
  },
  { immediate: true },
)

watch(
  () => props.prefill,
  (value) => {
    applyPrefill(value)
  },
  { immediate: true },
)
</script>

<style scoped>
.create-service {
  max-width: 1200px;
  margin: 0 auto;
}

.elevated {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.service-create-panel {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(244, 250, 247, 0.88), rgba(255, 255, 255, 0.98));
  padding: 16px;
}

.service-create-panel__header {
  margin-bottom: 12px;
}

.service-create-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-service .elevated,
:global(body.body--dark) .create-service .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-service .bg-grey-1,
:global(body.body--dark) .create-service .q-field__control {
  background: #223041 !important;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--neutral-600);
}

@media (max-width: 768px) {
  .service-create-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
