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
          flat
        >
          <!-- Card Header with Gradient -->
          <div class="tenant-card-header">
            <div class="header-content">
              <div class="tenant-avatar-section">
                <q-avatar size="72px" class="tenant-avatar">
                  <div class="avatar-initials">
                    {{ (tenant.personal_info?.first_name?.[0] || '') + (tenant.personal_info?.last_name?.[0] || '') }}
                  </div>
                </q-avatar>
                <q-badge
                  :color="tenant.status === 'active' ? 'positive' : 'grey'"
                  floating
                  class="status-badge"
                >
                  <q-icon name="check_circle" size="12px" />
                </q-badge>
              </div>
              <div class="tenant-info-section">
                <div class="tenant-name">
                  {{ tenant.personal_info?.first_name }} {{ tenant.personal_info?.last_name }}
                </div>
                <div class="tenant-property">
                  <q-icon name="home" size="14px" class="q-mr-xs" />
                  {{ getPropertyName(tenant.property_id) }}
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="white"
                class="action-menu-btn"
              >
                <q-menu>
                  <q-list style="min-width: 180px">
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
                      <q-item-section>Edit Tenant</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="confirmDeleteTenant(tenant)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <!-- Card Body -->
          <q-card-section class="tenant-card-body">
            <!-- Contact Information Grid -->
            <div class="contact-grid">
              <div class="contact-item">
                <div class="contact-icon-wrapper">
                  <q-icon name="email" size="20px" color="primary" />
                </div>
                <div class="contact-details">
                  <div class="contact-label">Email</div>
                  <div class="contact-value">{{ tenant.personal_info?.email || 'N/A' }}</div>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon-wrapper">
                  <q-icon name="phone" size="20px" color="primary" />
                </div>
                <div class="contact-details">
                  <div class="contact-label">Phone</div>
                  <div class="contact-value">{{ tenant.personal_info?.phone || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Rent Information -->
            <div class="rent-info" v-if="tenant.lease_info">
              <div class="rent-amount">
                ${{ tenant.lease_info?.monthly_rent || 'N/A' }}
                <span class="rent-period">/month</span>
              </div>
              <div class="rent-label">Monthly Rent</div>
            </div>

            <!-- Quick Info Tags -->
            <div class="quick-info-tags" v-if="tenant.vehicles?.length || tenant.pets?.length || tenant.co_applicants?.length">
              <q-chip
                v-if="tenant.vehicles && tenant.vehicles.length > 0"
                size="sm"
                dense
                class="info-chip"
              >
                <q-icon name="directions_car" size="14px" class="q-mr-xs" />
                {{ tenant.vehicles.length }}
              </q-chip>
              <q-chip
                v-if="tenant.pets && tenant.pets.length > 0"
                size="sm"
                dense
                class="info-chip"
              >
                <q-icon name="pets" size="14px" class="q-mr-xs" />
                {{ tenant.pets.length }}
              </q-chip>
              <q-chip
                v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                size="sm"
                dense
                class="info-chip"
              >
                <q-icon name="group" size="14px" class="q-mr-xs" />
                +{{ tenant.co_applicants.length }}
              </q-chip>
              <q-chip
                v-if="tenant.employment"
                size="sm"
                dense
                class="info-chip"
              >
                <q-icon name="work" size="14px" class="q-mr-xs" />
                Employed
              </q-chip>
            </div>
          </q-card-section>

          <!-- Card Footer -->
          <q-card-section class="tenant-card-footer">
            <div class="footer-left">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span class="footer-text">{{ formatDate(tenant.created_at) }}</span>
            </div>
            <q-btn
              unelevated
              color="primary"
              label="View Details"
              size="sm"
              class="view-details-btn"
              @click="viewTenantDetails(tenant)"
            >
              <q-icon name="arrow_forward" size="16px" class="q-ml-xs" />
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tenant Detail Dialog -->
    <q-dialog 
      v-model="showDetailDialog" 
      maximized 
      transition-show="slide-up" 
      transition-hide="slide-down"
      @hide="onDialogHide"
    >
      <q-card v-if="selectedTenant" class="tenant-detail-dialog" style="width: 100%; height: 100%;">
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
          <q-btn flat round dense icon="close" @click="closeDetailDialog" />
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
                    @click="openDocument(doc.url)"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="primary" size="md" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ doc.fileName || doc.originalName }}</q-item-label>
                      <q-item-label caption>{{ doc.documentType || 'Document' }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense round icon="download" color="primary" @click.stop="openDocument(doc.url)">
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

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

const navigateToCreateTenant = () => {
  router.push('/create-tenant')
}

const openDocument = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

const viewTenantDetails = (tenant) => {
  if (!tenant) return
  selectedTenant.value = { ...tenant }
  // Use nextTick to ensure DOM is ready
  setTimeout(() => {
    showDetailDialog.value = true
  }, 0)
}

const closeDetailDialog = () => {
  showDetailDialog.value = false
}

const onDialogHide = () => {
  // Clean up when dialog is hidden (by any means)
  setTimeout(() => {
    selectedTenant.value = null
  }, 100)
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: white;
}

.tenant-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: #1976d2;
}

/* Card Header with Gradient */
.tenant-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tenant-avatar-section {
  position: relative;
}

.tenant-avatar {
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-initials {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
}

.status-badge {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tenant-info-section {
  flex: 1;
}

.tenant-name {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
}

.tenant-property {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  font-weight: 500;
}

.action-menu-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.action-menu-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Card Body */
.tenant-card-body {
  padding: 20px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}

.contact-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.contact-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.contact-details {
  flex: 1;
  min-width: 0;
}

.contact-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Rent Information */
.rent-info {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.rent-amount {
  font-size: 28px;
  font-weight: 700;
  color: #2e7d32;
  line-height: 1;
  margin-bottom: 4px;
}

.rent-period {
  font-size: 14px;
  font-weight: 500;
  color: #4caf50;
}

.rent-label {
  font-size: 12px;
  font-weight: 600;
  color: #558b2f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Quick Info Tags */
.quick-info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.info-chip {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #666;
  font-weight: 600;
  transition: all 0.2s;
}

.info-chip:hover {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
  transform: scale(1.05);
}

/* Card Footer */
.tenant-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #e0e0e0;
}

.footer-left {
  display: flex;
  align-items: center;
  color: #666;
}

.footer-text {
  font-size: 12px;
  font-weight: 500;
}

.view-details-btn {
  border-radius: 20px;
  font-weight: 600;
  padding: 6px 16px;
  transition: all 0.3s;
}

.view-details-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

@media (max-width: 768px) {
  .tenants-grid {
    grid-template-columns: 1fr;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .tenant-card-header {
    padding: 16px;
  }

  .tenant-avatar {
    size: 60px;
  }

  .tenant-name {
    font-size: 18px;
  }

  .rent-amount {
    font-size: 24px;
  }
}
</style>
