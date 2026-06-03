<template>
  <q-page class="q-pa-md property-services-page">
    <div class="page-toolbar page-toolbar--filters">
      <q-input
        v-model="serviceSearch"
        borderless
        dense
        clearable
        placeholder="Search services"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
      <q-select
        v-model="serviceTypeFilter"
        :options="serviceTypeOptions"
        borderless
        dense
        clearable
        emit-value
        map-options
        :display-value="serviceTypeFilterLabel"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="tune" size="18px" />
        </template>
      </q-select>
      <q-btn
        v-if="serviceSearch || serviceTypeFilter"
        flat
        dense
        round
        icon="clear"
        color="grey-7"
        class="page-tool-icon-action"
        @click="serviceSearch = ''; serviceTypeFilter = null"
      >
        <q-tooltip>Clear filters</q-tooltip>
      </q-btn>
      <q-btn
        color="primary"
        unelevated
        no-caps
        dense
        icon="add"
        label="Add"
        class="page-tool-action"
        :disable="serviceDisabled"
        @click="openCreateService"
      />
    </div>

    <div v-if="servicesLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="40px" color="primary" />
      <div class="text-body2 text-grey-6 q-mt-sm">Loading services...</div>
    </div>

    <div v-else-if="filteredServices.length === 0" class="text-center q-pa-xl">
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

    <div v-else class="services-grid entity-tiles">
      <q-card
        v-for="service in filteredServices"
        :key="service.id"
        flat
        bordered
        class="service-card entity-tile"
        clickable
        @click="openServiceDetails(service)"
      >
        <q-card-section>
          <div class="entity-tile-head">
            <div class="entity-file-mark entity-file-mark--green">
              <q-icon name="handyman" size="22px" />
            </div>
            <span class="entity-chip entity-chip--green">{{ formatServiceType(service.service_type) }}</span>
          </div>
          <div class="entity-tile-title text-clamp-2">{{ service.company_name || 'Unknown Company' }}</div>
          <div class="entity-tile-desc text-clamp-2">
            {{ service.agent?.name || 'No agent' }}
            <span v-if="service.service_start_date"> • {{ formatDate(service.service_start_date) }}</span>
          </div>
          <div class="entity-tile-foot">
            <span>{{ service.term || 'No term' }}</span>
            <span>{{ getServicePropertySummary(service) || 'No property summary' }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showServiceDialog" persistent maximized>
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateService
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname || selectedProperty?.address || ''"
            :allow-property-edit="true"
            @service-created="onServiceCreated"
            @cancel="showServiceDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <DetailShell
      v-model="showServiceDetail"
      title="Service Details"
      :subtitle="selectedService ? `${selectedService.company_name || 'Service'} • ${formatServiceType(selectedService.service_type)}` : ''"
    >
      <template #actions>
        <q-btn
          v-if="selectedService && canManageRecords && !isEditingServiceDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="edit"
          label="Edit"
          @click="startServiceDetailEdit"
        />
        <q-btn
          v-if="selectedService && canManageRecords && isEditingServiceDetail"
          flat
          dense
          no-caps
          color="grey-7"
          icon="close"
          label="Cancel"
          @click="cancelServiceDetailEdit"
        />
        <q-btn
          v-if="selectedService && canManageRecords && isEditingServiceDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="save"
          label="Save"
          :loading="savingServiceInfo"
          @click="saveServiceInfo"
        />
      </template>

      <div v-if="selectedService" class="service-detail-body">
        <div class="service-detail-hero">
          <div class="service-detail-hero__identity">
            <div class="service-detail-badge">
              {{ (selectedService.company_name || formatServiceType(selectedService.service_type) || 'S').slice(0, 1).toUpperCase() }}
            </div>
            <div class="service-detail-hero__copy">
              <div class="service-detail-eyebrow">Service Snapshot</div>
              <div class="service-detail-title">{{ selectedService.company_name || 'Unnamed Service' }}</div>
              <div class="service-detail-subtitle">{{ formatServiceType(selectedService.service_type) }}</div>
            </div>
          </div>
          <div class="service-detail-hero__meta">
            <q-chip color="primary" text-color="white" class="service-detail-status">
              {{ getServicePropertySummary(selectedService) || 'No property linked' }}
            </q-chip>
            <q-btn
              v-if="selectedService.company_website && !isEditingServiceDetail"
              color="primary"
              outline
              no-caps
              icon="open_in_new"
              label="Open Website"
              :href="normalizeExternalUrl(selectedService.company_website)"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </div>

        <div v-if="!isEditingServiceDetail" class="service-detail-sections">
          <section class="service-detail-section service-detail-section--primary">
            <div class="service-detail-section__header">
              <div>
                <div class="service-detail-section__eyebrow">Overview</div>
                <h3>Service Terms</h3>
              </div>
            </div>
            <div class="service-detail-grid">
              <div class="detail-block">
                <div class="detail-label">Service Type</div>
                <div class="detail-value">{{ formatServiceType(selectedService.service_type) }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Company</div>
                <div class="detail-value">{{ selectedService.company_name || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Start Date</div>
                <div class="detail-value">{{ formatDate(selectedService.service_start_date) }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Term</div>
                <div class="detail-value">{{ selectedService.term || 'N/A' }}</div>
              </div>
            </div>
          </section>

          <section class="service-detail-section">
            <div class="service-detail-section__header">
              <div>
                <div class="service-detail-section__eyebrow">Coverage</div>
                <h3>Property Usage</h3>
              </div>
            </div>
            <div class="service-detail-note-card">
              {{ getServicePropertySummary(selectedService) || 'No linked properties yet.' }}
            </div>
          </section>

          <section class="service-detail-section">
            <div class="service-detail-section__header">
              <div>
                <div class="service-detail-section__eyebrow">Agent Contact</div>
                <h3>Primary Contact</h3>
              </div>
            </div>
            <div class="service-detail-grid">
              <div class="detail-block">
                <div class="detail-label">Agent Company</div>
                <div class="detail-value">{{ selectedService.agent?.company || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Agent Contact</div>
                <div class="detail-value">{{ selectedService.agent?.name || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Agent Phone</div>
                <div class="detail-value">{{ selectedService.agent?.phone || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Agent Email</div>
                <div class="detail-value">{{ selectedService.agent?.email || 'N/A' }}</div>
              </div>
            </div>
          </section>

          <aside class="service-detail-sidecard">
            <div class="service-detail-section__eyebrow">Reference</div>
            <h3>Quick Facts</h3>
            <div class="service-detail-sidecard__row">
              <span>Website</span>
              <strong>{{ selectedService.company_website || 'N/A' }}</strong>
            </div>
            <div class="service-detail-sidecard__row">
              <span>Start Date</span>
              <strong>{{ formatDate(selectedService.service_start_date) }}</strong>
            </div>
            <div class="service-detail-sidecard__row">
              <span>Term</span>
              <strong>{{ selectedService.term || 'N/A' }}</strong>
            </div>
          </aside>
        </div>

        <div v-else class="service-detail-editor">
          <section class="service-detail-section service-detail-section--primary">
            <div class="service-detail-section__header">
              <div>
                <div class="service-detail-section__eyebrow">Edit Service</div>
                <h3>Update Service Details</h3>
              </div>
            </div>
            <div class="service-detail-form-grid">
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
              <q-input
                v-model="serviceForm.company_name"
                dense
                outlined
                label="Company Name"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.company_website"
                dense
                outlined
                label="Company Website"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.term"
                dense
                outlined
                label="Term"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.service_start_date"
                dense
                outlined
                type="date"
                label="Service Start Date"
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
            </div>
          </section>

          <section class="service-detail-section">
            <div class="service-detail-section__header">
              <div>
                <div class="service-detail-section__eyebrow">Agent Contact</div>
                <h3>Primary Contact</h3>
              </div>
            </div>
            <div class="service-detail-form-grid">
              <q-input
                v-model="serviceForm.agent_company"
                dense
                outlined
                label="Agent Company"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.agent_name"
                dense
                outlined
                label="Agent Contact"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.agent_phone"
                dense
                outlined
                label="Agent Phone"
                :disable="serviceDisabled"
              />
              <q-input
                v-model="serviceForm.agent_email"
                dense
                outlined
                label="Agent Email"
                :disable="serviceDisabled"
              />
            </div>
          </section>
        </div>
      </div>
    </DetailShell>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import DetailShell from '../components/details/DetailShell.vue'
import CreateService from '../components/CreateService.vue'

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
const serviceSearch = ref('')
const serviceTypeFilter = ref(null)
const servicesLoading = ref(false)
const savingServiceInfo = ref(false)
const showServiceDialog = ref(false)
const activeServiceId = ref(null)
const selectedService = ref(null)
const showServiceDetail = ref(false)
const isEditingServiceDetail = ref(false)

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

const serviceTypeFilterLabel = computed(() => {
  return serviceTypeOptions.find((option) => option.value === serviceTypeFilter.value)?.label || 'All services'
})

const filteredServices = computed(() => {
  let list = services.value

  if (serviceTypeFilter.value) {
    list = list.filter((service) => service.service_type === serviceTypeFilter.value)
  }

  const search = serviceSearch.value.trim().toLowerCase()
  if (search) {
    list = list.filter((service) =>
      [
        formatServiceType(service.service_type),
        service.company_name,
        service.company_website,
        service.agent?.company,
        service.agent?.name,
        service.agent?.phone,
        service.agent?.email,
        service.term,
        getServicePropertySummary(service),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
  }

  return list
})

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

const normalizeExternalUrl = (value) => {
  const input = String(value || '').trim()
  if (!input) return ''
  return /^https?:\/\//i.test(input) ? input : `https://${input}`
}

const openCreateService = () => {
  if (!selectedProperty.value) return
  isEditingServiceDetail.value = false
  showServiceDialog.value = true
}

const onServiceCreated = async () => {
  showServiceDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Service created.',
    position: 'top',
  })
  if (selectedProperty.value?.id) {
    await loadServices(selectedProperty.value.id)
  }
}

const openServiceDetails = (service) => {
  selectedService.value = service
  isEditingServiceDetail.value = false
  showServiceDetail.value = true
}

const startServiceDetailEdit = () => {
  if (!selectedService.value) return
  activeServiceId.value = selectedService.value.id || null
  hydrateServiceInfoFromData(selectedService.value)
  isEditingServiceDetail.value = true
}

const cancelServiceDetailEdit = () => {
  isEditingServiceDetail.value = false
  if (selectedService.value) {
    hydrateServiceInfoFromData(selectedService.value)
  }
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
    if (selectedService.value && activeServiceId.value === selectedService.value.id) {
      selectedService.value = {
        ...selectedService.value,
        ...payload,
      }
    }
    if (isEditingServiceDetail.value) {
      isEditingServiceDetail.value = false
    } else {
      showServiceDialog.value = false
    }
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
  border-radius: var(--border-radius-card);
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

.service-detail-body {
  padding: 18px;
}

.service-detail-hero {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(232, 245, 240, 0.95), rgba(247, 252, 249, 0.94));
  border: 1px solid rgba(22, 163, 74, 0.12);
  box-shadow: 0 18px 44px rgba(22, 163, 74, 0.08);
}

.service-detail-hero__identity {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.service-detail-badge {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: #15803d;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(22, 163, 74, 0.12);
  flex-shrink: 0;
}

.service-detail-hero__copy {
  min-width: 0;
}

.service-detail-eyebrow,
.service-detail-section__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #15803d;
}

.service-detail-title {
  margin-top: 4px;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--neutral-900);
}

.service-detail-subtitle {
  margin-top: 6px;
  color: var(--neutral-600);
  line-height: 1.45;
}

.service-detail-hero__meta {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.service-detail-status {
  font-weight: 700;
}

.service-detail-sections {
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) minmax(0, 1.16fr) minmax(240px, 0.72fr);
  gap: 16px;
  margin-top: 18px;
  align-items: start;
}

.service-detail-section,
.service-detail-sidecard {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.service-detail-section {
  padding: 18px;
}

.service-detail-section--primary {
  grid-column: span 2;
}

.service-detail-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.service-detail-section__header h3,
.service-detail-sidecard h3 {
  margin: 4px 0 0;
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--neutral-900);
}

.service-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.service-detail-editor {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
  gap: 16px;
  margin-top: 18px;
  align-items: start;
}

.service-detail-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-block {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 14px;
  padding: 13px 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.98));
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-500);
}

.detail-value {
  margin-top: 7px;
  color: var(--neutral-900);
  line-height: 1.55;
}

.service-detail-note-card {
  border-radius: 16px;
  padding: 16px 18px;
  background: linear-gradient(180deg, rgba(244, 250, 247, 0.9), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(20, 28, 45, 0.08);
  line-height: 1.65;
  color: var(--neutral-800);
  min-height: 116px;
}

.service-detail-sidecard {
  padding: 18px;
}

.service-detail-sidecard__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid rgba(20, 28, 45, 0.08);
}

.service-detail-sidecard__row:first-of-type {
  margin-top: 8px;
}

.service-detail-sidecard__row span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-500);
}

.service-detail-sidecard__row strong {
  color: var(--neutral-900);
  line-height: 1.45;
}

@media (max-width: 768px) {
  .service-detail-hero,
  .service-detail-hero__identity {
    flex-direction: column;
    align-items: flex-start;
  }

  .service-detail-hero__meta {
    min-width: 0;
    width: 100%;
    align-items: flex-start;
  }

  .service-detail-sections {
    grid-template-columns: 1fr;
  }

  .service-detail-section--primary {
    grid-column: auto;
  }

  .service-detail-editor,
  .service-detail-form-grid {
    grid-template-columns: 1fr;
  }

  .service-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
