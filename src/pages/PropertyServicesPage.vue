<template>
  <q-page class="q-pa-md property-services-page">
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 text-right">
          <q-btn
            color="primary"
            unelevated
            label="New Service"
            :disable="serviceDisabled"
            @click="openCreateService"
          />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="servicesLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="40px" color="primary" />
      <div class="text-body2 text-grey-6 q-mt-sm">Loading services...</div>
    </div>

    <div v-else-if="services.length === 0" class="text-center q-pa-xl">
      <q-icon name="handyman" size="64px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">No services yet</div>
      <div class="text-body2 text-grey-5 q-mt-sm">Create a service to get started.</div>
      <q-btn
        class="q-mt-md"
        color="primary"
        unelevated
        label="Create Service"
        :disable="serviceDisabled"
        @click="openCreateService"
      />
    </div>

    <div v-else class="services-grid">
        <q-card
          v-for="service in services"
        :key="service.id"
        flat
        bordered
        class="service-card"
        clickable
        @click="openServiceDetails(service)"
      >
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon name="handyman" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-medium">{{ formatServiceType(service.service_type) }}</div>
          </div>
          <div class="text-body2 text-grey-7">{{ service.company_name || 'Unknown Company' }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ service.agent?.name || 'No agent' }}
            <span v-if="service.service_start_date"> • {{ formatDate(service.service_start_date) }}</span>
          </div>
          <div v-if="getServicePropertySummary(service)" class="text-caption text-grey-6 q-mt-xs">
            {{ getServicePropertySummary(service) }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showServiceDialog">
      <q-card style="min-width: 420px; max-width: 720px; width: 100%">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-medium">
            {{ activeServiceId ? 'Service Details' : 'Create Service' }}
          </div>
          <div class="row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn"
              v-close-popup
            />
            <q-btn
              color="primary"
              text-color="white"
              unelevated
              label="Save"
              class="top-action-btn"
              :loading="savingServiceInfo"
              :disable="serviceDisabled"
              @click="saveServiceInfo"
            />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <q-select
            v-model="serviceForm.service_type"
            :options="serviceTypeOptions"
            dense
            outlined
            label="Service Type"
            emit-value
            map-options
            :disable="serviceDisabled"
          />
          <q-select
            v-model="serviceForm.property_ids"
            :options="propertySelectOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            multiple
            use-chips
            dense
            outlined
            label="Properties Using This Service"
            :disable="serviceDisabled"
          />
          <q-input v-model="serviceForm.company_name" dense outlined label="Company Name" :disable="serviceDisabled" />
          <q-input v-model="serviceForm.company_website" dense outlined label="Company Website" :disable="serviceDisabled" />
          <q-input v-model="serviceForm.agent_company" dense outlined label="Agent Company" :disable="serviceDisabled" />
          <q-input v-model="serviceForm.agent_name" dense outlined label="Agent Contact" :disable="serviceDisabled" />
          <q-input v-model="serviceForm.agent_phone" dense outlined label="Agent Phone" :disable="serviceDisabled" />
          <q-input v-model="serviceForm.agent_email" dense outlined label="Agent Email" :disable="serviceDisabled" />
          <q-input
            v-model="serviceForm.service_start_date"
            dense
            outlined
            type="date"
            label="Service Start Date"
            :disable="serviceDisabled"
          />
          <q-input v-model="serviceForm.term" dense outlined label="Term" :disable="serviceDisabled" />
          <div v-if="!canManageRecords" class="text-caption text-grey-6">
            Service info is read-only for your account.
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, updateDocument, getAllDocuments } = useFirebase()

const canManageRecords = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  return ['pm', 'admin'].includes(accountType)
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

const serviceForm = ref({
  service_type: 'loan',
  property_ids: [],
  company_name: '',
  company_website: '',
  agent_company: '',
  agent_name: '',
  agent_phone: '',
  agent_email: '',
  service_start_date: '',
  term: '',
})

const selectedPropertyId = ref('')
const services = ref([])
const servicesLoading = ref(false)
const savingServiceInfo = ref(false)
const showServiceDialog = ref(false)
const activeServiceId = ref(null)

const selectedProperty = computed(() =>
  userDataStore.getPropertyById(selectedPropertyId.value),
)

const propertySelectOptions = computed(() =>
  (userDataStore.userAccessibleProperties || []).map((property) => ({
    label: property.nickname || property.address || property.id,
    value: property.id,
  })),
)

const serviceDisabled = computed(() => !canManageRecords.value || !selectedProperty.value)

const hydrateServiceInfoFromData = (service) => {
  if (!service) {
    serviceForm.value = {
      service_type: 'loan',
      property_ids: [],
      company_name: '',
      company_website: '',
      agent_company: '',
      agent_name: '',
      agent_phone: '',
      agent_email: '',
      service_start_date: '',
      term: '',
    }
    return
  }
  serviceForm.value = {
    service_type: service.service_type || 'loan',
    property_ids: Array.isArray(service.property_ids)
      ? service.property_ids.map((id) => String(id || '').trim()).filter(Boolean)
      : service.property_id
        ? [String(service.property_id).trim()]
        : selectedProperty.value?.id
          ? [String(selectedProperty.value.id).trim()]
          : [],
    company_name: service.company_name || '',
    company_website: service.company_website || '',
    agent_company: service.agent?.company || '',
    agent_name: service.agent?.name || '',
    agent_phone: service.agent?.phone || '',
    agent_email: service.agent?.email || '',
    service_start_date: service.service_start_date || '',
    term: service.term || '',
  }
}

const getLegacyService = (property) => {
  const legacyService = property?.service_info || null
  if (legacyService && Object.values(legacyService).some(Boolean)) return legacyService
  const legacyLoan = property?.loan_insurance?.loan || null
  if (legacyLoan && Object.values(legacyLoan).some(Boolean)) {
    return {
      service_type: 'loan',
      company_name: legacyLoan.company_name || '',
      company_website: legacyLoan.website || '',
      agent: {
        company: legacyLoan.agent?.company || '',
        name: legacyLoan.agent?.name || '',
        phone: legacyLoan.agent?.phone || '',
        email: legacyLoan.agent?.email || '',
      },
      service_start_date: '',
      term: '',
    }
  }
  const legacyInsurance = property?.loan_insurance?.insurance || null
  if (legacyInsurance && Object.values(legacyInsurance).some(Boolean)) {
    return {
      service_type: 'insurance',
      company_name: legacyInsurance.company_name || '',
      company_website: legacyInsurance.website || '',
      agent: {
        company: legacyInsurance.agent?.company || '',
        name: legacyInsurance.agent?.name || '',
        phone: legacyInsurance.agent?.phone || '',
        email: legacyInsurance.agent?.email || '',
      },
      service_start_date: '',
      term: '',
    }
  }
  return null
}

const loadServices = async (propertyId) => {
  if (!propertyId) return
  try {
    servicesLoading.value = true
    const list = await getAllDocuments(`properties/${propertyId}/services`)
    if (list && list.length > 0) {
      services.value = list.sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at || 0).getTime()
        const bDate = new Date(b.updated_at || b.created_at || 0).getTime()
        return bDate - aDate
      })
    } else {
      const legacy = getLegacyService(selectedProperty.value)
      services.value = legacy ? [{ id: 'legacy', ...legacy, legacy: true }] : []
    }
  } catch (error) {
    console.error('Failed to load service info:', error)
    const legacy = getLegacyService(selectedProperty.value)
    services.value = legacy ? [{ id: 'legacy', ...legacy, legacy: true }] : []
  } finally {
    servicesLoading.value = false
  }
}

const formatServiceType = (value) => {
  const text = String(value || '').trim()
  if (!text) return 'Service'
  return text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const resetServiceForm = () => {
  serviceForm.value = {
    service_type: 'loan',
    property_ids: selectedProperty.value?.id ? [String(selectedProperty.value.id)] : [],
    company_name: '',
    company_website: '',
    agent_company: '',
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    service_start_date: '',
    term: '',
  }
}

const openCreateService = () => {
  if (!selectedProperty.value) return
  activeServiceId.value = null
  resetServiceForm()
  showServiceDialog.value = true
}

const openServiceDetails = (service) => {
  activeServiceId.value = service.id || null
  hydrateServiceInfoFromData(service)
  showServiceDialog.value = true
}

const buildServicePayload = () => ({
  service_type: serviceForm.value.service_type || 'loan',
  property_ids: Array.from(
    new Set(
      (Array.isArray(serviceForm.value.property_ids) ? serviceForm.value.property_ids : [])
        .concat(selectedProperty.value?.id ? [selectedProperty.value.id] : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean),
    ),
  ),
  properties: Array.from(
    new Set(
      (Array.isArray(serviceForm.value.property_ids) ? serviceForm.value.property_ids : [])
        .concat(selectedProperty.value?.id ? [selectedProperty.value.id] : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean),
    ),
  ).map((id) => ({
    id,
    label:
      propertySelectOptions.value.find((option) => String(option.value || '').trim() === id)?.label ||
      userDataStore.getPropertyName(id) ||
      id,
  })),
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
})

const saveServiceInfo = async () => {
  if (!selectedProperty.value) return
  if (!canManageRecords.value) return
  try {
    savingServiceInfo.value = true
    const payload = buildServicePayload()
    const now = new Date().toISOString()
    if (activeServiceId.value && activeServiceId.value !== 'legacy') {
      await updateDocument(`properties/${selectedProperty.value.id}/services`, activeServiceId.value, {
        ...payload,
        updated_at: now,
      })
    } else {
      await createDocument(`properties/${selectedProperty.value.id}/services`, {
        ...payload,
        created_at: now,
        updated_at: now,
      })
    }
    Notify.create({
      type: 'positive',
      message: 'Service saved.',
      position: 'top',
    })
    showServiceDialog.value = false
    await loadServices(selectedProperty.value.id)
  } catch (error) {
    console.error('Failed to save service:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save service.',
      position: 'top',
    })
  } finally {
    savingServiceInfo.value = false
  }
}

const getServicePropertySummary = (service) => {
  const labels = Array.isArray(service?.properties)
    ? service.properties.map((entry) => entry?.label).filter(Boolean)
    : Array.isArray(service?.property_ids)
      ? service.property_ids
        .map((id) => userDataStore.getPropertyName(id))
        .filter(Boolean)
      : []
  if (!labels.length) return ''
  if (labels.length === 1) return `Used by ${labels[0]}`
  return `Used by ${labels[0]} + ${labels.length - 1} more`
}

watch(selectedProperty, (property) => {
  if (property) loadServices(property.id)
})

watch(selectedPropertyId, (nextId) => {
  if (nextId) loadServices(nextId)
})

watch(
  () => route.query.propertyId,
  (propertyId) => {
    const value = String(propertyId || '').trim()
    if (value) {
      selectedPropertyId.value = value
      return
    }
    if (!selectedPropertyId.value && userDataStore.userAccessibleProperties.length > 0) {
      selectedPropertyId.value = userDataStore.userAccessibleProperties[0].id
    }
  },
  { immediate: true },
)

onMounted(() => {
  const queryId = String(route.query.propertyId || '').trim()
  if (queryId) {
    selectedPropertyId.value = queryId
  } else if (userDataStore.userAccessibleProperties.length > 0) {
    selectedPropertyId.value = userDataStore.userAccessibleProperties[0].id
  }

  if (!userDataStore.isAuthenticated) {
    router.push('/')
    return
  }

  if (selectedPropertyId.value) {
    loadServices(selectedPropertyId.value)
  }
})
</script>

<style scoped>
.property-services-page {
  max-width: 960px;
  margin: 0 auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.service-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}
</style>
