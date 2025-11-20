<template>
  <q-page padding>
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Tenants</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">Manage all current tenants across your properties</p>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="person_add"
              label="Create Tenant"
              @click="navigateToCreateTenant"
            />
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                placeholder="Search tenants by name, email, or phone..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filterProperty"
                :options="propertyFilterOptions"
                outlined
                dense
                label="Filter by Property"
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filterStatus"
                :options="statusOptions"
                outlined
                dense
                label="Filter by Status"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-body1 text-grey-6 q-mt-md">Loading tenants...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error_outline" size="64px" color="negative" />
        <div class="text-h6 text-negative q-mt-md">{{ error }}</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTenants.length === 0" class="text-center q-pa-xl">
        <q-icon name="people_outline" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">
          {{ searchQuery || filterProperty || filterStatus ? 'No tenants match your filters' : 'No tenants yet' }}
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          {{ searchQuery || filterProperty || filterStatus ? 'Try adjusting your search or filters' : 'Create your first tenant to get started' }}
        </div>
        <q-btn
          v-if="!searchQuery && !filterProperty && !filterStatus"
          color="primary"
          icon="person_add"
          label="Create Tenant"
          @click="navigateToCreateTenant"
          class="q-mt-lg"
        />
      </div>

      <!-- Tenants Grid -->
      <div v-else class="tenants-grid">
        <q-card
          v-for="tenant in filteredTenants"
          :key="tenant.id"
          class="tenant-card"
          bordered
          flat
        >
          <!-- Card Header -->
          <q-card-section class="tenant-card-header">
            <div class="row items-center">
              <q-avatar size="64px" color="primary" text-color="white">
                <q-icon name="person" size="36px" />
              </q-avatar>
              <div class="q-ml-md flex-1">
                <div class="tenant-name">
                  {{ tenant.personal_info?.first_name }} {{ tenant.personal_info?.last_name }}
                </div>
                <div class="tenant-subtitle">
                  <q-chip
                    :color="tenant.status === 'active' ? 'positive' : 'grey'"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ tenant.status || 'Active' }}
                  </q-chip>
                </div>
              </div>
              <q-btn
                flat
                round
                icon="more_vert"
                color="grey-7"
              >
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="viewTenantDetails(tenant)">
                      <q-item-section avatar>
                        <q-icon name="visibility" color="primary" />
                      </q-item-section>
                      <q-item-section>View Details</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="editTenant(tenant)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="secondary" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="confirmDeleteTenant(tenant)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Card Body -->
          <q-card-section>
            <!-- Contact Information -->
            <div class="info-section">
              <div class="info-row">
                <q-icon name="email" size="18px" color="primary" class="q-mr-sm" />
                <span class="info-label">Email:</span>
                <span class="info-value">{{ tenant.personal_info?.email || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="phone" size="18px" color="primary" class="q-mr-sm" />
                <span class="info-label">Phone:</span>
                <span class="info-value">{{ tenant.personal_info?.phone || 'N/A' }}</span>
              </div>
            </div>

            <!-- Property Information -->
            <div class="info-section q-mt-md">
              <div class="info-row">
                <q-icon name="home" size="18px" color="secondary" class="q-mr-sm" />
                <span class="info-label">Property:</span>
                <span class="info-value">{{ getPropertyName(tenant.property_id) }}</span>
              </div>
              <div class="info-row" v-if="tenant.lease_info">
                <q-icon name="attach_money" size="18px" color="positive" class="q-mr-sm" />
                <span class="info-label">Rent:</span>
                <span class="info-value text-weight-bold text-positive">
                  ${{ tenant.lease_info?.monthly_rent || 'N/A' }}/mo
                </span>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="info-section q-mt-md">
              <div class="info-chips">
                <q-chip
                  v-if="tenant.vehicles && tenant.vehicles.length > 0"
                  size="sm"
                  icon="directions_car"
                  color="indigo-1"
                  text-color="indigo-9"
                >
                  {{ tenant.vehicles.length }} Vehicle{{ tenant.vehicles.length > 1 ? 's' : '' }}
                </q-chip>
                <q-chip
                  v-if="tenant.pets && tenant.pets.length > 0"
                  size="sm"
                  icon="pets"
                  color="orange-1"
                  text-color="orange-9"
                >
                  {{ tenant.pets.length }} Pet{{ tenant.pets.length > 1 ? 's' : '' }}
                </q-chip>
                <q-chip
                  v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                  size="sm"
                  icon="group"
                  color="purple-1"
                  text-color="purple-9"
                >
                  +{{ tenant.co_applicants.length }} Occupant{{ tenant.co_applicants.length > 1 ? 's' : '' }}
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Card Footer -->
          <q-card-section class="tenant-card-footer">
            <div class="text-caption text-grey-6">
              <q-icon name="event" size="xs" class="q-mr-xs" />
              Created {{ formatDate(tenant.created_at) }}
            </div>
            <q-btn
              flat
              dense
              color="primary"
              label="View Details"
              icon-right="arrow_forward"
              @click="viewTenantDetails(tenant)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'

const router = useRouter()
const $q = useQuasar()
const userDataStore = useUserDataStore()

// Data
const tenants = ref([])
const loading = ref(true)
const error = ref(null)

// Filters
const searchQuery = ref('')
const filterProperty = ref(null)
const filterStatus = ref(null)

const statusOptions = ['Active', 'Inactive', 'Past']

// Computed
const propertyFilterOptions = computed(() => {
  const options = [{ label: 'All Properties', value: null }]
  userDataStore.userAccessibleProperties.forEach(prop => {
    options.push({
      label: prop.name || prop.address || 'Unnamed Property',
      value: prop.id
    })
  })
  return options
})

const filteredTenants = computed(() => {
  let filtered = tenants.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tenant => {
      const firstName = tenant.personal_info?.first_name?.toLowerCase() || ''
      const lastName = tenant.personal_info?.last_name?.toLowerCase() || ''
      const email = tenant.personal_info?.email?.toLowerCase() || ''
      const phone = tenant.personal_info?.phone?.toLowerCase() || ''
      return firstName.includes(query) || 
             lastName.includes(query) || 
             email.includes(query) || 
             phone.includes(query)
    })
  }

  // Filter by property
  if (filterProperty.value) {
    filtered = filtered.filter(tenant => tenant.property_id === filterProperty.value)
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(tenant => 
      (tenant.status || 'Active').toLowerCase() === filterStatus.value.toLowerCase()
    )
  }

  return filtered
})

// Methods
const fetchTenants = async () => {
  try {
    loading.value = true
    error.value = null

    // Get all accessible property IDs
    const propertyIds = userDataStore.userAccessibleProperties.map(p => p.id)

    if (propertyIds.length === 0) {
      tenants.value = []
      loading.value = false
      return
    }

    // Fetch tenants for all accessible properties
    const tenantsRef = collection(db, 'tenants')
    const q = query(tenantsRef, where('property_id', 'in', propertyIds))
    const querySnapshot = await getDocs(q)

    tenants.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    loading.value = false
  } catch (err) {
    console.error('Error fetching tenants:', err)
    error.value = 'Failed to load tenants'
    loading.value = false
  }
}

const getPropertyName = (propertyId) => {
  const property = userDataStore.userAccessibleProperties.find(p => p.id === propertyId)
  return property?.name || property?.address || 'Unknown Property'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return 'N/A'
  }
}

const navigateToCreateTenant = () => {
  router.push('/create-tenant')
}

// eslint-disable-next-line no-unused-vars
const viewTenantDetails = (tenant) => {
  // TODO: Implement tenant detail view
  $q.notify({
    type: 'info',
    message: 'Tenant detail view coming soon',
    position: 'top'
  })
}

// eslint-disable-next-line no-unused-vars
const editTenant = (tenant) => {
  // TODO: Implement tenant edit
  $q.notify({
    type: 'info',
    message: 'Tenant edit coming soon',
    position: 'top'
  })
}

const confirmDeleteTenant = (tenant) => {
  $q.dialog({
    title: 'Delete Tenant',
    message: `Are you sure you want to delete ${tenant.personal_info?.first_name} ${tenant.personal_info?.last_name}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteTenant(tenant)
  })
}

// eslint-disable-next-line no-unused-vars
const deleteTenant = async (tenant) => {
  // TODO: Implement tenant deletion
  $q.notify({
    type: 'info',
    message: 'Tenant deletion coming soon',
    position: 'top'
  })
}

// Lifecycle
onMounted(() => {
  fetchTenants()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  padding: 16px 0;
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.tenant-card {
  transition: all 0.3s ease;
  height: fit-content;
}

.tenant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tenant-card-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.tenant-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.tenant-subtitle {
  margin-top: 4px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 13px;
  min-width: 60px;
}

.info-value {
  color: #333;
  font-size: 14px;
}

.info-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tenant-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
}

@media (max-width: 768px) {
  .tenants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
