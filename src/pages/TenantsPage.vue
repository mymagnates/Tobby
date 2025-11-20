<template>
  <q-page padding>
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Tenants</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">Manage all your tenants</p>
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

      <!-- Filters and Search -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                placeholder="Search tenants..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="statusFilter"
                :options="['All', 'Active', 'Inactive']"
                outlined
                dense
                label="Status"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="propertyFilter"
                :options="propertyFilterOptions"
                outlined
                dense
                label="Property"
                option-label="label"
                option-value="value"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-2">
              <div class="text-subtitle2 text-grey-7">
                Total: {{ filteredTenants.length }} tenant(s)
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="60px" color="primary" />
        <div class="text-h6 text-grey-6 q-mt-md">Loading tenants...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error_outline" size="80px" color="negative" />
        <div class="text-h6 text-negative q-mt-md">{{ error }}</div>
        <q-btn
          color="primary"
          label="Retry"
          @click="loadTenants"
          class="q-mt-md"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTenants.length === 0" class="text-center q-pa-xl">
        <q-icon name="people_outline" size="80px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">
          {{ searchQuery ? 'No tenants found' : 'No tenants yet' }}
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          {{ searchQuery ? 'Try adjusting your search filters' : 'Click "Create Tenant" to add your first tenant' }}
        </div>
        <q-btn
          v-if="!searchQuery"
          color="primary"
          label="Create Tenant"
          icon="person_add"
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
          <q-card-section class="tenant-header bg-primary text-white">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-avatar size="56px" color="white" text-color="primary">
                  <q-icon name="person" size="32px" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-h6 q-mb-xs">
                    {{ tenant.personal_info?.first_name }} {{ tenant.personal_info?.last_name }}
                  </div>
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
              <div>
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  text-color="white"
                >
                  <q-menu>
                    <q-list style="min-width: 150px">
                      <q-item clickable v-close-popup @click="viewTenant(tenant)">
                        <q-item-section avatar>
                          <q-icon name="visibility" color="primary" />
                        </q-item-section>
                        <q-item-section>View Details</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="editTenant(tenant)">
                        <q-item-section avatar>
                          <q-icon name="edit" color="blue" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable v-close-popup @click="confirmDelete(tenant)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!-- Card Body -->
          <q-card-section>
            <!-- Contact Information -->
            <div class="info-section q-mb-md">
              <div class="info-label">Contact</div>
              <div class="info-item">
                <q-icon name="email" size="xs" color="primary" class="q-mr-xs" />
                <a :href="`mailto:${tenant.personal_info?.email}`" class="info-link">
                  {{ tenant.personal_info?.email || 'N/A' }}
                </a>
              </div>
              <div class="info-item">
                <q-icon name="phone" size="xs" color="primary" class="q-mr-xs" />
                <a :href="`tel:${tenant.personal_info?.phone}`" class="info-link">
                  {{ tenant.personal_info?.phone || 'N/A' }}
                </a>
              </div>
            </div>

            <!-- Property Information -->
            <div class="info-section q-mb-md">
              <div class="info-label">Property</div>
              <div class="info-item">
                <q-icon name="home" size="xs" color="secondary" class="q-mr-xs" />
                <span class="text-weight-medium">
                  {{ getPropertyName(tenant.property_id) }}
                </span>
              </div>
            </div>

            <!-- Lease Information -->
            <div v-if="tenant.lease_info" class="info-section q-mb-md">
              <div class="info-label">Lease Info</div>
              <div class="row q-gutter-md">
                <div>
                  <div class="text-caption text-grey-7">Monthly Rent</div>
                  <div class="text-h6 text-positive">${{ tenant.lease_info.monthly_rent || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-caption text-grey-7">Lease Term</div>
                  <div class="text-body2">
                    {{ formatDate(tenant.lease_info.start_date) }} - {{ formatDate(tenant.lease_info.end_date) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="info-section">
              <div class="row q-gutter-sm">
                <q-chip
                  v-if="tenant.vehicles && tenant.vehicles.length > 0"
                  size="sm"
                  color="indigo"
                  text-color="white"
                  icon="directions_car"
                >
                  {{ tenant.vehicles.length }} Vehicle(s)
                </q-chip>
                <q-chip
                  v-if="tenant.pets && tenant.pets.length > 0"
                  size="sm"
                  color="orange"
                  text-color="white"
                  icon="pets"
                >
                  {{ tenant.pets.length }} Pet(s)
                </q-chip>
                <q-chip
                  v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                  size="sm"
                  color="deep-purple"
                  text-color="white"
                  icon="group"
                >
                  {{ tenant.co_applicants.length }} Occupant(s)
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <!-- Card Footer -->
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="View Details"
              @click="viewTenant(tenant)"
            />
          </q-card-actions>
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

// State
const tenants = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('All')
const propertyFilter = ref('All')

// Computed
const propertyFilterOptions = computed(() => {
  const options = [{ label: 'All Properties', value: 'All' }]
  userDataStore.userAccessibleProperties.forEach(property => {
    options.push({
      label: property.address || property.name || 'Unnamed Property',
      value: property.id
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
      const fullName = `${tenant.personal_info?.first_name} ${tenant.personal_info?.last_name}`.toLowerCase()
      const email = tenant.personal_info?.email?.toLowerCase() || ''
      const phone = tenant.personal_info?.phone?.toLowerCase() || ''
      return fullName.includes(query) || email.includes(query) || phone.includes(query)
    })
  }

  // Filter by status
  if (statusFilter.value !== 'All') {
    filtered = filtered.filter(tenant => {
      const status = tenant.status || 'active'
      return status.toLowerCase() === statusFilter.value.toLowerCase()
    })
  }

  // Filter by property
  if (propertyFilter.value !== 'All') {
    filtered = filtered.filter(tenant => tenant.property_id === propertyFilter.value)
  }

  return filtered
})

// Methods
const loadTenants = async () => {
  loading.value = true
  error.value = null

  try {
    const tenantsArray = []
    
    // Get all properties the user has access to
    const propertyIds = userDataStore.userAccessibleProperties.map(p => p.id)

    if (propertyIds.length === 0) {
      tenants.value = []
      loading.value = false
      return
    }

    // Fetch tenants for each property
    for (const propertyId of propertyIds) {
      const tenantsQuery = query(
        collection(db, 'tenants'),
        where('property_id', '==', propertyId)
      )
      
      const querySnapshot = await getDocs(tenantsQuery)
      querySnapshot.forEach(doc => {
        tenantsArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
    }

    tenants.value = tenantsArray
  } catch (err) {
    console.error('Error loading tenants:', err)
    error.value = 'Failed to load tenants. Please try again.'
  } finally {
    loading.value = false
  }
}

const getPropertyName = (propertyId) => {
  const property = userDataStore.userAccessibleProperties.find(p => p.id === propertyId)
  return property?.address || property?.name || 'Unknown Property'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const navigateToCreateTenant = () => {
  router.push('/create-tenant')
}

const viewTenant = (tenant) => {
  // TODO: Navigate to tenant detail page or open dialog
  $q.notify({
    type: 'info',
    message: `View details for ${tenant.personal_info?.first_name} ${tenant.personal_info?.last_name}`,
    position: 'top'
  })
}

const editTenant = (tenant) => {
  // TODO: Navigate to edit tenant page or open dialog
  $q.notify({
    type: 'info',
    message: `Edit ${tenant.personal_info?.first_name} ${tenant.personal_info?.last_name}`,
    position: 'top'
  })
}

const confirmDelete = (tenant) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete tenant ${tenant.personal_info?.first_name} ${tenant.personal_info?.last_name}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteTenant(tenant)
  })
}

const deleteTenant = async (tenant) => {
  // TODO: Implement delete functionality
  $q.notify({
    type: 'warning',
    message: 'Delete functionality coming soon',
    position: 'top'
  })
}

// Lifecycle
onMounted(() => {
  loadTenants()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.tenant-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.tenant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.tenant-header {
  padding: 20px;
}

.info-section {
  margin-bottom: 16px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
  color: #424242;
}

.info-link {
  color: #1976d2;
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tenants-grid {
    grid-template-columns: 1fr;
  }
}
</style>

