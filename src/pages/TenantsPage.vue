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
          clickable
          tabindex="0"
          @click="viewTenantDetails(tenant)"
          @keyup.enter="viewTenantDetails(tenant)"
        >
          <!-- Compact Card Content -->
          <q-card-section class="tenant-card-content">
            <!-- Header Row -->
            <div class="tenant-card-header-compact">
              <div class="tenant-main-info">
                <q-avatar size="48px" class="tenant-avatar-compact">
                  <div class="avatar-initials-compact">
                    {{ (tenant.personal_info?.first_name?.[0] || '') + (tenant.personal_info?.last_name?.[0] || '') }}
                  </div>
                </q-avatar>
                <div class="tenant-info-compact">
                  <div class="tenant-name-compact">
                    {{ tenant.personal_info?.first_name }} {{ tenant.personal_info?.last_name }}
                  </div>
                  <div class="tenant-meta-compact">
                    <q-chip
                      :color="tenant.status === 'active' ? 'positive' : 'grey'"
                      text-color="white"
                      size="sm"
                      dense
                      class="status-chip-compact"
                    >
                      {{ tenant.status || 'Active' }}
                    </q-chip>
                    <span class="tenant-property-compact">
                      <q-icon name="home" size="12px" class="q-mr-xs" />
                      {{ getPropertyName(tenant.property_id) }}
                    </span>
                  </div>
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="grey-7"
                size="sm"
                class="action-menu-btn-compact"
                @click.stop
              >
                <q-menu>
                  <q-list style="min-width: 180px">
                    <q-item clickable v-close-popup @click.stop="viewTenantDetails(tenant)">
                      <q-item-section avatar>
                        <q-icon name="visibility" color="primary" />
                      </q-item-section>
                      <q-item-section>View Details</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click.stop="editTenant(tenant)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="secondary" />
                      </q-item-section>
                      <q-item-section>Edit Tenant</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click.stop="confirmDeleteTenant(tenant)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- Contact & Rent Row -->
            <div class="tenant-details-row">
              <div class="contact-info-compact">
                <div class="contact-item-compact">
                  <q-icon name="email" size="14px" color="grey-6" class="q-mr-xs" />
                  <span class="contact-text">{{ tenant.personal_info?.email || 'N/A' }}</span>
                </div>
                <div class="contact-item-compact">
                  <q-icon name="phone" size="14px" color="grey-6" class="q-mr-xs" />
                  <span class="contact-text">{{ tenant.personal_info?.phone || 'N/A' }}</span>
                </div>
              </div>
              <div class="rent-info-compact" v-if="tenant.lease_info">
                <div class="rent-amount-compact">${{ tenant.lease_info?.monthly_rent || 'N/A' }}</div>
                <div class="rent-label-compact">/mo</div>
              </div>
            </div>

            <!-- Tags & Footer Row -->
            <div class="tenant-footer-row">
              <div class="tags-compact" v-if="tenant.vehicles?.length || tenant.pets?.length || tenant.co_applicants?.length || tenant.employment">
                <q-chip
                  v-if="tenant.vehicles && tenant.vehicles.length > 0"
                  size="sm"
                  dense
                  class="info-chip-compact"
                >
                  <q-icon name="directions_car" size="12px" class="q-mr-xs" />
                  {{ tenant.vehicles.length }}
                </q-chip>
                <q-chip
                  v-if="tenant.pets && tenant.pets.length > 0"
                  size="sm"
                  dense
                  class="info-chip-compact"
                >
                  <q-icon name="pets" size="12px" class="q-mr-xs" />
                  {{ tenant.pets.length }}
                </q-chip>
                <q-chip
                  v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                  size="sm"
                  dense
                  class="info-chip-compact"
                >
                  <q-icon name="group" size="12px" class="q-mr-xs" />
                  +{{ tenant.co_applicants.length }}
                </q-chip>
                <q-chip
                  v-if="tenant.employment"
                  size="sm"
                  dense
                  class="info-chip-compact"
                >
                  <q-icon name="work" size="12px" class="q-mr-xs" />
                  Work
                </q-chip>
              </div>
              <div class="footer-compact">
                <q-icon name="schedule" size="12px" color="grey-5" class="q-mr-xs" />
                <span class="footer-text-compact">{{ formatDate(tenant.created_at) }}</span>
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  label="View"
                  class="view-btn-compact"
                  @click.stop="viewTenantDetails(tenant)"
                />
              </div>
            </div>
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
      <q-card class="tenant-detail-dialog" style="width: 100%; height: 100%;">
        <template v-if="selectedTenant">
        <!-- Dialog Header -->
        <q-toolbar class="bg-primary text-white">
          <q-avatar size="48px">
            <q-icon name="person" size="32px" />
          </q-avatar>
          <q-toolbar-title class="q-ml-md">
            <div class="text-h6">
              {{ selectedTenant.personal_info?.first_name }} {{ selectedTenant.personal_info?.last_name }}
            </div>
            <div class="text-caption">{{ getPropertyName(selectedTenant.property_id) }}</div>
          </q-toolbar-title>
          <q-btn 
            v-if="!isEditMode"
            flat 
            round 
            icon="edit" 
            @click="enterEditMode" 
            class="edit-dialog-btn close-dialog-btn"
            size="md"
          >
            <q-tooltip>Edit Tenant</q-tooltip>
          </q-btn>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="closeDetailDialog" 
            class="close-dialog-btn q-ml-xs"
            size="md"
          />
        </q-toolbar>

        <!-- Dialog Content -->
        <q-card-section class="q-pa-lg scroll">
          <q-form v-if="isEditMode" @submit.prevent="saveTenant" class="tenant-detail-content">
            <!-- Personal Information -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="tenant-section-header">
                <div class="text-h6">
                  <q-icon name="person" class="q-mr-sm" />
                  Personal Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.first_name"
                      label="First Name *"
                      outlined
                      dense
                      :rules="[(val) => !!val || 'First name is required']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.middle_name"
                      label="Middle Name"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.last_name"
                      label="Last Name *"
                      outlined
                      dense
                      :rules="[(val) => !!val || 'Last name is required']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.email"
                      type="email"
                      label="Email *"
                      outlined
                      dense
                      :rules="[
                        (val) => !!val || 'Email is required',
                        (val) => /.+@.+\..+/.test(val) || 'Email must be valid',
                      ]"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.phone"
                      label="Phone *"
                      outlined
                      dense
                      mask="(###) ###-####"
                      :rules="[(val) => !!val || 'Phone is required']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.date_of_birth"
                      label="Date of Birth"
                      outlined
                      dense
                      mask="YYYY-MM-DD"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="editFormData.personal_info.date_of_birth" mask="YYYY-MM-DD">
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="editFormData.personal_info.gender"
                      :options="['Male', 'Female', 'Other', 'Prefer not to say']"
                      label="Gender"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="editFormData.personal_info.ssn"
                      label="SSN"
                      outlined
                      dense
                      mask="###-##-####"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="editFormData.personal_info.marital_status"
                      :options="['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Domestic Partnership']"
                      label="Marital Status"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
            
            <!-- Save/Cancel Buttons -->
            <div class="row justify-end q-mt-lg q-gutter-md">
              <q-btn
                flat
                label="Cancel"
                color="grey"
                @click="cancelEdit"
              />
              <q-btn
                unelevated
                label="Save Changes"
                color="primary"
                type="submit"
                :loading="saving"
              />
            </div>
          </q-form>
          
          <div v-else class="tenant-detail-content">
            <!-- Property & Lease Information -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="tenant-section-header">
                <div class="text-h6">
                  <q-icon name="home" class="q-mr-sm" />
                  Property & Lease Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Property</div>
                    <div class="text-body1 text-weight-medium">{{ getPropertyName(selectedTenant.property_id) }}</div>
                  </div>
                  <div class="col-12 col-md-3" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Monthly Rent</div>
                    <div class="text-body1 text-weight-bold text-positive">
                      ${{ selectedTenant.lease_info?.monthly_rent || 'N/A' }}/mo
                    </div>
                  </div>
                  <div class="col-12 col-md-3" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Lease Start Date</div>
                    <div class="text-body1">{{ formatDate(selectedTenant.lease_info?.start_date) || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Lease End Date</div>
                    <div class="text-body1">{{ formatDate(selectedTenant.lease_info?.end_date) || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3" v-if="selectedTenant.lease_info">
                    <div class="text-caption text-grey-7">Security Deposit</div>
                    <div class="text-body1">${{ selectedTenant.lease_info?.security_deposit || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Created At</div>
                    <div class="text-body1">{{ formatDateTime(selectedTenant.created_at) }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Status</div>
                    <div class="text-body1 text-capitalize">{{ selectedTenant.status || 'active' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Personal Information -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="tenant-section-header">
                <div class="text-h6">
                  <q-icon name="person" class="q-mr-sm" />
                  Personal Information
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Full Name</div>
                    <div class="text-body1 text-weight-medium">
                      {{ selectedTenant.personal_info?.first_name }} 
                      {{ selectedTenant.personal_info?.middle_name }}
                      {{ selectedTenant.personal_info?.last_name }}
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Email</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.email || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Phone</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.phone || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Marital Status</div>
                    <div class="text-body1">{{ selectedTenant.personal_info?.marital_status || 'N/A' }}</div>
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
                    <div class="text-caption text-grey-6">Protected</div>
                    <div class="text-body1">{{ maskSensitiveSsn(selectedTenant.personal_info?.ssn) }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">Street Address</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.street || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">City</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.city || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">State</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.state || 'N/A' }}</div>
                  </div>
                  <div class="col-12 col-md-3">
                    <div class="text-caption text-grey-7">ZIP Code</div>
                    <div class="text-body1">{{ selectedTenant.current_address?.zipCode || 'N/A' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Employment Information -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.employment">
              <q-card-section class="tenant-section-header">
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

            <!-- Emergency Contact -->
            <q-card flat bordered class="q-mb-md" v-if="selectedTenant.emergency_contact">
              <q-card-section class="tenant-section-header">
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
              <q-card-section class="tenant-section-header">
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
              <q-card-section class="tenant-section-header">
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
              <q-card-section class="tenant-section-header">
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
              <q-card-section class="tenant-section-header">
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
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="tenant-section-header">
                <div class="text-h6">
                  <q-icon name="notes" class="q-mr-sm" />
                  Additional Notes
                </div>
              </q-card-section>
              <q-card-section>
                <div class="text-body1">{{ selectedTenant.notes || 'N/A' }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'
import { useFirebase } from '../composables/useFirebase'

const router = useRouter()
const $q = useQuasar()
const userDataStore = useUserDataStore()
const { updateDocument } = useFirebase()

// Data
const tenants = ref([])
const loading = ref(true)
const error = ref(null)

// Dialog
const showDetailDialog = ref(false)
const selectedTenant = ref(null)
const isEditMode = ref(false)
const editFormData = ref(null)
const saving = ref(false)

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

const maskSensitiveSsn = (ssn) => {
  if (!ssn) return 'N/A'
  const digits = String(ssn).replace(/\D/g, '')
  if (digits.length < 4) return '***-**-****'
  return `***-**-${digits.slice(-4)}`
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
  isEditMode.value = false
  showDetailDialog.value = true
}

const enterEditMode = () => {
  if (!selectedTenant.value) return
  
  // Deep clone tenant data for editing
  editFormData.value = {
    personal_info: {
      first_name: selectedTenant.value.personal_info?.first_name || '',
      middle_name: selectedTenant.value.personal_info?.middle_name || '',
      last_name: selectedTenant.value.personal_info?.last_name || '',
      email: selectedTenant.value.personal_info?.email || '',
      phone: selectedTenant.value.personal_info?.phone || '',
      date_of_birth: selectedTenant.value.personal_info?.date_of_birth || '',
      gender: selectedTenant.value.personal_info?.gender || '',
      ssn: selectedTenant.value.personal_info?.ssn || '',
      marital_status: selectedTenant.value.personal_info?.marital_status || '',
    },
    current_address: {
      street: selectedTenant.value.current_address?.street || '',
      city: selectedTenant.value.current_address?.city || '',
      state: selectedTenant.value.current_address?.state || '',
      zipCode: selectedTenant.value.current_address?.zipCode || '',
    },
    employment: selectedTenant.value.employment ? {
      employer_name: selectedTenant.value.employment.employer_name || '',
      position: selectedTenant.value.employment.position || '',
      monthly_income: selectedTenant.value.employment.monthly_income || '',
      years_employed: selectedTenant.value.employment.years_employed || '',
      employer_phone: selectedTenant.value.employment.employer_phone || '',
    } : null,
    emergency_contact: selectedTenant.value.emergency_contact ? {
      name: selectedTenant.value.emergency_contact.name || '',
      relationship: selectedTenant.value.emergency_contact.relationship || '',
      phone: selectedTenant.value.emergency_contact.phone || '',
    } : null,
    notes: selectedTenant.value.notes || '',
    status: selectedTenant.value.status || 'active',
  }
  
  isEditMode.value = true
}

const cancelEdit = () => {
  isEditMode.value = false
  editFormData.value = null
}

const saveTenant = async () => {
  if (!selectedTenant.value || !editFormData.value) return
  
  try {
    saving.value = true
    
    // Prepare update data
    const updateData = {
      personal_info: editFormData.value.personal_info,
      current_address: editFormData.value.current_address,
      employment: editFormData.value.employment,
      emergency_contact: editFormData.value.emergency_contact,
      notes: editFormData.value.notes,
      status: editFormData.value.status,
      updated_at: new Date().toISOString(),
    }
    
    // Update tenant in Firestore
    await updateDocument('tenants', selectedTenant.value.id, updateData)
    
    // Update local state
    Object.assign(selectedTenant.value, updateData)
    
    // Refresh tenants list
    await fetchTenants()
    
    $q.notify({
      type: 'positive',
      message: 'Tenant updated successfully',
      position: 'top',
      icon: 'check_circle',
    })
    
    // Exit edit mode
    isEditMode.value = false
    editFormData.value = null
  } catch (error) {
    console.error('Error updating tenant:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update tenant',
      position: 'top',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const closeDetailDialog = () => {
  showDetailDialog.value = false
  isEditMode.value = false
  editFormData.value = null
}

const onDialogHide = () => {
  // Keep selectedTenant stable to avoid transition/unmount race conditions.
  isEditMode.value = false
  editFormData.value = null
}

const editTenant = async (tenant) => {
  viewTenantDetails(tenant)
  await nextTick()
  enterEditMode()
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.tenant-card {
  transition: all 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--neutral-200);
  background: white;
}

.tenant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

/* Compact Card Content */
.tenant-card-content {
  padding: 16px;
}

/* Compact Header */
.tenant-card-header-compact {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tenant-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.tenant-avatar-compact {
  background: var(--primary-color);
  flex-shrink: 0;
}

.avatar-initials-compact {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.tenant-info-compact {
  flex: 1;
  min-width: 0;
}

.tenant-name-compact {
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-meta-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-chip-compact {
  font-size: 10px;
  height: 20px;
  padding: 0 6px;
}

.tenant-property-compact {
  font-size: 12px;
  color: var(--neutral-600);
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-menu-btn-compact {
  flex-shrink: 0;
}

/* Contact & Rent Row */
.tenant-details-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.contact-info-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.contact-item-compact {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--neutral-700);
}

.contact-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rent-info-compact {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  padding-left: 12px;
  border-left: 1px solid var(--neutral-200);
}

.rent-amount-compact {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.rent-label-compact {
  font-size: 11px;
  color: var(--neutral-600);
  font-weight: 500;
}

/* Tags & Footer Row */
.tenant-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tags-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.info-chip-compact {
  background: var(--tag-blue-bg);
  color: var(--tag-blue-text);
  border: none;
  font-size: 10px;
  height: 22px;
  padding: 0 6px;
}

.info-chip-compact:hover {
  background: var(--primary-color);
  color: white;
}

.footer-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.footer-text-compact {
  font-size: 11px;
  color: var(--neutral-500);
  white-space: nowrap;
}

.view-btn-compact {
  font-size: 12px;
  padding: 4px 10px;
  min-height: 24px;
}

@media (max-width: 768px) {
  .tenants-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tenant-card-content {
    padding: 12px;
  }

  .tenant-details-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rent-info-compact {
    border-left: none;
    border-top: 1px solid var(--neutral-200);
    padding-left: 0;
    padding-top: 8px;
    width: 100%;
  }

  .tenant-footer-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .footer-compact {
    width: 100%;
    justify-content: space-between;
  }
}

/* Tenant Detail Dialog Close Button */
.close-dialog-btn {
  background: white !important;
  color: var(--primary-color) !important;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  transition: all 0.2s ease;
}

.close-dialog-btn:hover,
.edit-dialog-btn:hover {
  background: rgba(255, 255, 255, 0.95) !important;
  transform: scale(1.1);
}

.close-dialog-btn .q-icon {
  font-size: 24px;
}

.edit-dialog-btn .q-icon {
  font-size: 24px;
}

/* Tenant detail section headers - unified system style */
.tenant-section-header {
  background: var(--neutral-100);
  color: var(--neutral-800);
  border-bottom: 1px solid var(--neutral-200);
}

/* Tenant detail readability: enforce consistent left alignment */
.tenant-detail-content,
.tenant-detail-content .row,
.tenant-detail-content .text-caption,
.tenant-detail-content .text-body1,
.tenant-detail-content .q-item__label,
.tenant-detail-content .q-item__label--caption,
.tenant-detail-content .q-card-section {
  text-align: left;
}

.tenant-detail-content .q-item__section--side {
  align-items: flex-start;
}

.tenant-detail-content .text-caption {
  display: block;
  min-height: 18px;
  margin-bottom: 2px;
}

.tenant-detail-content .text-body1 {
  display: block;
  min-height: 22px;
}
</style>
