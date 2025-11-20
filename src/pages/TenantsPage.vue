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

    <!-- Tenant Detail Dialog -->
    <q-dialog v-model="showDetailDialog" maximized>
      <q-card v-if="selectedTenant" class="tenant-detail-dialog">
        <!-- Dialog Header -->
        <q-toolbar class="bg-primary text-white">
          <q-avatar size="48px">
            <q-icon name="person" size="32px" />
          </q-avatar>
          <q-toolbar-title class="q-ml-md">
            <div class="text-h6">
              {{ selectedTenant.personal_info?.first_name }} {{ selectedTenant.personal_info?.last_name }}
            </div>
            <div class="text-caption">Tenant Details</div>
          </q-toolbar-title>
          <q-chip
            :color="selectedTenant.status === 'active' ? 'positive' : 'grey'"
            text-color="white"
          >
            {{ selectedTenant.status || 'Active' }}
          </q-chip>
          <q-btn flat round dense icon="close" @click="showDetailDialog = false" />
        </q-toolbar>

        <!-- Dialog Content -->
        <q-card-section class="q-pa-lg scroll">
          <div class="tenant-detail-content">
            <!-- Personal Information -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="bg-secondary text-white">
                <div class="text-h6">
                  <q-icon name="person" class="q-mr-sm" />
                  Personal Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Full Name</div>
                    <div class="text-body1 text-weight-medium">
                      {{ selectedTenant.personal_info?.first_name }} 
                      {{ selectedTenant.personal_info?.middle_name }}
                      {{ selectedTenant.personal_info?.last_name }}
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Email</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.email || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Phone</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.phone || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Date of Birth</div>
                    <div class="text-body1">{{ formatDate(selectedTenant.personal_info?.date_of_birth) || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Gender</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.gender || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">SSN</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.ssn || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Marital Status</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.marital_status || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Current Address -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="bg-info text-white">
                <div class="text-h6">
                  <q-icon name="location_on" class="q-mr-sm" />
                  Current Address
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="text-caption text-grey-7">Street Address</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.street || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-2">
                    <div class="text-caption text-grey-7">City</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.city || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-2">
                    <div class="text-caption text-grey-7">State</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.state || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-2">
                    <div class="text-caption text-grey-7">ZIP Code</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.zipCode || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Employment Information -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.employment">
              <q-card-section class="bg-accent text-white">
                <div class="text-h6">
                  <q-icon name="work" class="q-mr-sm" />
                  Employment Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Employer</div>
                    <div class="text-body1">{{ selectedTenant.employment.employer_name || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Position</div>
                    <div class="text-body1">{{ selectedTenant.employment.position || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Monthly Income</div>
                    <div class="text-body1 text-weight-bold text-positive">
                      ${{ selectedTenant.employment.monthly_income || 'N/A' }}
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Years Employed</div>
                    <div class="text-body1">{{ selectedTenant.employment.years_employed || 'N/A' }} years</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Employer Phone</div>
                    <div class="text-body1">{{ selectedTenant.employment.employer_phone || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Property & Lease Information -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="bg-positive text-white">
                <div class="text-h6">
                  <q-icon name="home" class="q-mr-sm" />
                  Property & Lease Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="text-caption text-grey-7">Property</div>
                    <div class="text-body1 text-weight-medium">{{ getPropertyName(selectedTenant.property_id) }}</div>
                  </div>
                  <div class="col-12 col-md-6" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Monthly Rent</div>
                    <div class="text-body1 text-weight-bold text-positive">
                      ${{ selectedTenant.lease_info?.monthly_rent || 'N/A' }}/mo
                    </div>
                  </div>
                  <div class="col-12 col-md-4" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Lease Start Date</div>
                    <div class="text-body1">{{ formatDate(selectedTenant.lease_info?.start_date) || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Lease End Date</div>
                    <div class="text-body1">{{ formatDate(selectedTenant.lease_info?.end_date) || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Security Deposit</div>
                    <div class="text-body1">${{ selectedTenant.lease_info?.security_deposit || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Emergency Contact -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.emergency_contact">
              <q-card-section class="bg-warning text-white">
                <div class="text-h6">
                  <q-icon name="emergency" class="q-mr-sm" />
                  Emergency Contact
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Contact Name</div>
                    <div class="text-body1">{{ selectedTenant.emergency_contact.name || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Relationship</div>
                    <div class="text-body1">{{ selectedTenant.emergency_contact.relationship || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">Phone Number</div>
                    <div class="text-body1">{{ selectedTenant.emergency_contact.phone || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Vehicles -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.vehicles && selectedTenant.vehicles.length > 0">
              <q-card-section class="bg-indigo text-white">
                <div class="text-h6">
                  <q-icon name="directions_car" class="q-mr-sm" />
                  Vehicles ({{ selectedTenant.vehicles.length }})
                </div>
              </q-card-section>
              <q-card-section>
                <q-list bordered separator>
                  <q-item v-for="(vehicle, index) in selectedTenant.vehicles" :key="index">
                    <q-item-section avatar>
                      <q-avatar color="indigo-2" text-color="indigo-9">
                        <q-icon name="directions_car" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                      </q-item-label>
                      <q-item-label caption>
                        <span v-if="vehicle.color">Color: {{ vehicle.color }}</span>
                        <span v-if="vehicle.license_plate" class="q-ml-md">License: {{ vehicle.license_plate }}</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Pets -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.pets && selectedTenant.pets.length > 0">
              <q-card-section class="bg-orange text-white">
                <div class="text-h6">
                  <q-icon name="pets" class="q-mr-sm" />
                  Pets ({{ selectedTenant.pets.length }})
                </div>
              </q-card-section>
              <q-card-section>
                <q-list bordered separator>
                  <q-item v-for="(pet, index) in selectedTenant.pets" :key="index">
                    <q-item-section avatar>
                      <q-avatar color="orange-2" text-color="orange-9">
                        <q-icon name="pets" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ pet.name }} ({{ pet.type }})
                      </q-item-label>
                      <q-item-label caption>
                        <span v-if="pet.breed">Breed: {{ pet.breed }}</span>
                        <span v-if="pet.weight" class="q-ml-md">Weight: {{ pet.weight }} lbs</span>
                        <span v-if="pet.age" class="q-ml-md">Age: {{ pet.age }} years</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Additional Occupants -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.co_applicants && selectedTenant.co_applicants.length > 0">
              <q-card-section class="bg-deep-purple text-white">
                <div class="text-h6">
                  <q-icon name="group" class="q-mr-sm" />
                  Additional Occupants ({{ selectedTenant.co_applicants.length }})
                </div>
              </q-card-section>
              <q-card-section>
                <q-list bordered separator>
                  <q-item v-for="(occupant, index) in selectedTenant.co_applicants" :key="index">
                    <q-item-section avatar>
                      <q-avatar color="deep-purple-2" text-color="deep-purple-9">
                        <q-icon name="person" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ occupant.first_name }} {{ occupant.last_name }}
                      </q-item-label>
                      <q-item-label caption>
                        <span v-if="occupant.email">{{ occupant.email }}</span>
                        <span v-if="occupant.phone" class="q-ml-md">{{ occupant.phone }}</span>
                        <span v-if="occupant.relationship" class="q-ml-md">{{ occupant.relationship }}</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Documents -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.documents && selectedTenant.documents.length > 0">
              <q-card-section class="bg-deep-purple text-white">
                <div class="text-h6">
                  <q-icon name="upload_file" class="q-mr-sm" />
                  Documents ({{ selectedTenant.documents.length }})
                </div>
              </q-card-section>
              <q-card-section>
                <q-list bordered separator>
                  <q-item
                    v-for="(doc, index) in selectedTenant.documents"
                    :key="index"
                    clickable
                    @click="window.open(doc.url, '_blank')"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="primary" size="md" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ doc.fileName || doc.originalName }}</q-item-label>
                      <q-item-label caption>{{ doc.documentType || 'Document' }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense round icon="download" color="primary">
                        <q-tooltip>Download</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Notes -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.notes">
              <q-card-section class="bg-grey-3 text-grey-9">
                <div class="text-h6">
                  <q-icon name="notes" class="q-mr-sm" />
                  Additional Notes
                </div>
              </q-card-section>
              <q-card-section>
                <div class="text-body1">{{ selectedTenant.notes }}</div>
              </q-card-section>
            </q-card>

            <!-- Timestamps -->
            <q-card flat bordered>
              <q-card-section class="bg-grey-2 text-grey-8">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="text-caption text-grey-7">Created At</div>
                    <div class="text-body1">{{ formatDateTime(selectedTenant.created_at) }}</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="text-caption text-grey-7">Status</div>
                    <q-chip :color="selectedTenant.status === 'active' ? 'positive' : 'grey'" text-color="white">
                      {{ selectedTenant.status || 'Active' }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
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

// Dialog
const showDetailDialog = ref(false)
const selectedTenant = ref(null)

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

const viewTenantDetails = (tenant) => {
  selectedTenant.value = tenant
  showDetailDialog.value = true
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
