<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Leases</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="primary"
          label="Refresh"
          @click="refreshData"
          :loading="userDataStore.leasesLoading"
        />
        <q-btn @click="openCreateLeaseDialog" color="primary" icon="add" label="Create New Lease" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === null }"
        clickable
        @click="toggleStatusFilter(null)"
      >
        <q-card-section class="text-center">
          <div class="text-h4 text-primary">{{ userAccessibleLeases.length }}</div>
          <div class="text-subtitle2">All Leases</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Available' }"
        clickable
        @click="toggleStatusFilter('Available')"
      >
        <q-card-section class="text-center">
          <div class="text-h4 text-green">{{ availableCount }}</div>
          <div class="text-subtitle2">Available</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Rented' }"
        clickable
        @click="toggleStatusFilter('Rented')"
      >
        <q-card-section class="text-center">
          <div class="text-h4 text-blue">{{ rentedCount }}</div>
          <div class="text-subtitle2">Rented</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Pending' }"
        clickable
        @click="toggleStatusFilter('Pending')"
      >
        <q-card-section class="text-center">
          <div class="text-h4 text-orange">{{ pendingCount }}</div>
          <div class="text-subtitle2">Pending</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Expired' }"
        clickable
        @click="toggleStatusFilter('Expired')"
      >
        <q-card-section class="text-center">
          <div class="text-h4 text-red">{{ expiredCount }}</div>
          <div class="text-subtitle2">Expired</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Search and Filters -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <div class="col-12 col-md-6">
        <q-input v-model="searchQuery" placeholder="Search leases..." outlined dense clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div v-if="statusFilter" class="col-auto">
        <q-chip
          removable
          @remove="statusFilter = null"
          :color="getLeaseStatusColor(statusFilter)"
          text-color="white"
          icon="filter_list"
        >
          Filtering: {{ statusFilter }}
        </q-chip>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userDataStore.leasesLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 q-mt-md">Loading leases...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLeases.length === 0" class="text-center q-pa-lg">
      <q-icon name="description" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{
          searchQuery
            ? 'No leases found matching your search'
            : statusFilter
              ? `No ${statusFilter.toLowerCase()} leases found`
              : 'No leases found'
        }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          searchQuery || statusFilter
            ? 'Try adjusting your filters or search terms'
            : 'Create your first lease to get started'
        }}
      </div>
      <q-btn
        v-if="searchQuery || statusFilter"
        flat
        color="primary"
        label="Clear Filters"
        icon="clear"
        class="q-mt-md"
        @click="clearFilters"
      />
    </div>

    <!-- Leases Grid -->
    <div v-else class="row">
      <div
        v-for="lease in filteredLeases"
        :key="lease.id"
        class="col-12 col-md-6 q-gutter-md"
        style="margin-right: 5px"
      >
        <q-card class="lease-card" clickable @click="viewLease(lease)">
          <!-- Header Section -->
          <q-card-section class="bg-primary text-white compact-header">
            <div class="row items-center justify-between no-wrap">
              <div class="text-body2 text-weight-bold ellipsis">
                {{ lease.property_id?.nickname || lease.property_id?.displayName || 'N/A' }}
              </div>
              <q-chip
                :color="getLeaseStatusColor(lease.status)"
                text-color="white"
                size="sm"
                class="q-ml-xs"
                style="margin: 0"
              >
                {{ lease.status }}
              </q-chip>
            </div>
          </q-card-section>

          <!-- Content Section -->
          <q-card-section class="compact-content">
            <!-- Rate Information -->
            <div class="text-center" style="padding: 8px 0">
              <div class="text-h6 text-primary text-weight-bold" style="line-height: 1.2">
                {{ lease.property_id?.address || 'N/A' }}

                <div class="text-caption text-grey-6"></div>
              </div>
            </div>

            <!-- Condensed Details Grid -->
            <div class="condensed-grid">
              <div class="detail-mini">
                <q-icon name="home" size="14px" color="grey-6" />
                <span>{{ lease.property_id?.spec?.type || 'N/A' }}</span>
              </div>
              <div class="detail-mini">
                <q-icon name="bed" size="14px" color="grey-6" />
                <span
                  >{{ lease.property_id?.spec?.bedroom || 0 }} bed /
                  {{ lease.property_id?.spec?.full_bathroom || 0 }} bath</span
                >
              </div>
              <div class="detail-mini">
                <q-icon name="attach_money" size="14px" color="grey-6" />
                <span>${{ formatAmount(lease.rate_amount) }}/{{ getRateType(lease) }}</span>
              </div>
              <div class="detail-mini">
                <q-icon name="calendar_today" size="14px" color="grey-6" />
                <span>Start {{ formatDate(lease.start_date) }}</span>
              </div>
            </div>

            <!-- Tenant Info (for Rented leases) - Condensed -->
            <div
              v-if="lease.status === 'Rented' && leaseTenantsMap[lease.id]"
              class="tenant-compact"
            >
              <div class="tenant-compact-header">
                <q-icon name="person" size="14px" />
                <span
                  >{{ leaseTenantsMap[lease.id].applicant?.first_name }}
                  {{ leaseTenantsMap[lease.id].applicant?.last_name }}</span
                >
              </div>
              <div class="tenant-compact-contact">
                <div class="ellipsis">
                  <q-icon name="email" size="12px" />
                  {{ leaseTenantsMap[lease.id].applicant?.email }}
                </div>
                <div class="ellipsis">
                  <q-icon name="phone" size="12px" />
                  {{ leaseTenantsMap[lease.id].applicant?.phone }}
                </div>
              </div>
            </div>

            <!-- Shareable Link Button (only for non-rented leases) -->
            <div v-else-if="lease.status !== 'Rented'" style="margin-top: 8px">
              <q-btn
                flat
                dense
                color="primary"
                icon="share"
                label="Shareable Link"
                size="sm"
                @click.stop="copyShareableLink(lease.id)"
                class="shareable-link-btn full-width"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lease Details Dialog -->
    <q-dialog v-model="showLeaseDialog" maximized class="lease-dialog">
      <q-card class="full-height">
        <!-- Dialog Header -->
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5 text-weight-bold">
              {{
                selectedLease
                  ? selectedLease.property_id?.nickname ||
                    selectedLease.property_id?.displayName ||
                    'Lease Details'
                  : 'Lease Details'
              }}
            </div>
          </div>

          <div class="row items-center justify-between">
            <!-- Status Buttons -->
            <div v-if="selectedLease && !isEditMode" class="row q-gutter-sm">
              <div class="text-subtitle2 text-white q-mr-xs" style="line-height: 32px">Status:</div>
              <q-btn
                unelevated
                :color="selectedLease.status === 'Available' ? 'green' : 'green-3'"
                text-color="white"
                label="Available"
                size="sm"
                @click="quickChangeStatus('Available')"
                class="status-btn"
              />
              <q-btn
                unelevated
                :color="selectedLease.status === 'Rented' ? 'blue' : 'blue-3'"
                text-color="white"
                label="Rented"
                size="sm"
                @click="quickChangeStatus('Rented')"
                class="status-btn"
              />
              <q-btn
                unelevated
                :color="selectedLease.status === 'Pending' ? 'orange' : 'orange-3'"
                text-color="white"
                label="Pending"
                size="sm"
                @click="quickChangeStatus('Pending')"
                class="status-btn"
              />
              <q-btn
                unelevated
                :color="selectedLease.status === 'Expired' ? 'red' : 'red-3'"
                text-color="white"
                label="Expired"
                size="sm"
                @click="quickChangeStatus('Expired')"
                class="status-btn"
              />
              <q-btn
                unelevated
                :color="selectedLease.status === 'Terminated' ? 'purple' : 'purple-3'"
                text-color="white"
                label="Terminated"
                size="sm"
                @click="quickChangeStatus('Terminated')"
                class="status-btn"
              />
            </div>
            <div v-else></div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!isEditMode && leaseTenants.length === 0"
                color="secondary"
                icon="share"
                label="Shareable Link"
                @click="copyShareableLink(selectedLease.id)"
                class="shareable-link-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="primary"
                icon="inventory"
                label="Inventory"
                @click="openInventoryDialog"
                class="inventory-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="primary"
                icon="folder"
                label="Documents"
                @click="openDocumentsDialog"
                class="documents-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="primary"
                label="Edit"
                @click="toggleEditMode"
                class="edit-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="negative"
                label="Delete"
                @click="confirmDeleteLease"
                class="delete-btn"
              />
              <q-btn
                v-if="isEditMode"
                color="green"
                label="Save"
                @click="saveLeaseChanges"
                :loading="editLoading"
                class="save-btn"
              />
              <q-btn
                v-if="isEditMode"
                color="grey"
                label="Cancel"
                @click="cancelEdit"
                class="cancel-btn"
              />
              <q-btn flat round icon="close" @click="closeLeaseDialog" class="close-btn" />
            </div>
          </div>
        </q-card-section>

        <!-- Dialog Content -->
        <q-card-section class="dialog-content">
          <div v-if="selectedLease" class="details-container">
            <!-- Basic Information -->
            <div class="details-section">
              <div class="section-title">Basic Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Lease ID</div>
                  <div class="detail-value">
                    {{ selectedLease.id || 'N/A' }}
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Property</div>
                  <div class="detail-value">
                    <div class="text-weight-bold">
                      {{
                        selectedLease.property_id?.nickname ||
                        selectedLease.property_id?.displayName ||
                        'N/A'
                      }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ selectedLease.property_id?.address || 'N/A' }}
                    </div>
                    <div v-if="selectedLease.property_id?.spec" class="property-details-mini">
                      <div class="text-caption text-grey-5">
                        {{ selectedLease.property_id.spec.type || 'N/A' }} •
                        {{ selectedLease.property_id.spec.bedroom || 'N/A' }} bed •
                        {{ selectedLease.property_id.spec.full_bathroom || 'N/A' }} bath
                      </div>
                    </div>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Status</div>
                  <div v-if="!isEditMode" class="detail-value">
                    <q-chip
                      :color="getLeaseStatusColor(selectedLease.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ selectedLease.status || 'Unknown' }}
                    </q-chip>
                  </div>
                  <q-select
                    v-else
                    v-model="selectedLease.status"
                    :options="['Available', 'Rented', 'Pending', 'Expired', 'Terminated']"
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Available Date</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ formatDate(selectedLease.lease_create_date) }}
                  </div>
                  <q-input
                    v-else
                    v-model="selectedLease.lease_create_date"
                    type="date"
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>
              </div>
            </div>

            <!-- Financial Information -->
            <div class="details-section">
              <div class="section-title">Financial Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Rate Type</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.rate_type || 'N/A' }}
                  </div>
                  <q-select
                    v-else
                    v-model="selectedLease.rate_type"
                    :options="['month', 'day', 'year']"
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Rate Amount</div>
                  <div v-if="!isEditMode" class="detail-value">
                    ${{ formatAmount(selectedLease.rate_amount) }}
                  </div>
                  <q-input
                    v-else
                    v-model.number="selectedLease.rate_amount"
                    type="number"
                    outlined
                    dense
                    prefix="$"
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Deposit</div>
                  <div v-if="!isEditMode" class="detail-value">
                    ${{ formatAmount(selectedLease.deposit) }}
                  </div>
                  <q-input
                    v-else
                    v-model.number="selectedLease.deposit"
                    type="number"
                    outlined
                    dense
                    prefix="$"
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Pet Fee</div>
                  <div v-if="!isEditMode" class="detail-value">
                    ${{ formatAmount(selectedLease.pet_fee) }}
                  </div>
                  <q-input
                    v-else
                    v-model.number="selectedLease.pet_fee"
                    type="number"
                    outlined
                    dense
                    prefix="$"
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Application Fee per Person</div>
                  <div v-if="!isEditMode" class="detail-value">
                    ${{ formatAmount(selectedLease.application_fee_per_person) }}
                  </div>
                  <q-input
                    v-else
                    v-model.number="selectedLease.application_fee_per_person"
                    type="number"
                    outlined
                    dense
                    prefix="$"
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Lease Term (months)</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.lease_term || 'N/A' }}
                  </div>
                  <q-input
                    v-else
                    v-model.number="selectedLease.lease_term"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Utilities Included</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.utilities_included?.join(', ') || 'None' }}
                  </div>
                  <q-select
                    v-else
                    v-model="selectedLease.utilities_included"
                    :options="[
                      'Electricity',
                      'Water',
                      'Gas',
                      'Internet',
                      'Cable TV',
                      'Trash',
                      'Sewer',
                    ]"
                    multiple
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Furnished</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.furnished || 'N/A' }}
                  </div>
                  <q-select
                    v-else
                    v-model="selectedLease.furnished"
                    :options="['Yes', 'No', 'Partially']"
                    outlined
                    dense
                    class="detail-input"
                  />
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="details-section">
              <div class="section-title">Additional Information</div>
              <div class="details-grid">
                <div class="detail-item full-width">
                  <div class="detail-label">Special Terms</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.special_terms || 'None' }}
                  </div>
                  <q-input
                    v-else
                    v-model="selectedLease.special_terms"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                    class="detail-input"
                  />
                </div>

                <div class="detail-item full-width">
                  <div class="detail-label">Additional Notes</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ selectedLease.additional_notes || 'None' }}
                  </div>
                  <q-input
                    v-else
                    v-model="selectedLease.additional_notes"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                    class="detail-input"
                  />
                </div>
              </div>
            </div>

            <!-- Current Tenants Section -->
            <div class="details-section" v-if="!isEditMode && leaseTenants.length > 0">
              <div class="section-title" style="color: #21ba45">
                <q-icon name="people" size="sm" class="q-mr-xs" />
                Current Tenants
                <q-badge color="positive" :label="leaseTenants.length" class="q-ml-sm" />
              </div>

              <!-- Loading State -->
              <div v-if="tenantsLoading" class="text-center q-pa-md">
                <q-spinner-dots size="40px" color="positive" />
                <div class="text-body2 text-grey-6 q-mt-sm">Loading tenant information...</div>
              </div>

              <!-- Error State -->
              <div v-else-if="tenantsError" class="text-center q-pa-md">
                <q-icon name="error_outline" size="48px" color="negative" />
                <div class="text-body2 text-negative q-mt-sm">{{ tenantsError }}</div>
              </div>

              <!-- Tenants List -->
              <div v-else class="tenants-list">
                <div v-for="tenant in leaseTenants" :key="tenant.id" class="tenant-card q-mb-md">
                  <!-- Tenant Header -->
                  <div class="tenant-header">
                    <q-avatar color="positive" text-color="white" size="48px">
                      <q-icon name="person" size="32px" />
                    </q-avatar>
                    <div class="tenant-name-section">
                      <div class="tenant-name">
                        {{ tenant.applicant?.first_name }} {{ tenant.applicant?.last_name }}
                      </div>
                      <div class="tenant-label">Main Applicant</div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="tenant-section">
                    <div class="tenant-section-title">Contact Information</div>
                    <div class="tenant-info-grid">
                      <div class="tenant-info-item">
                        <q-icon name="email" size="xs" color="primary" class="q-mr-xs" />
                        <a :href="`mailto:${tenant.applicant?.email}`" class="tenant-link">
                          {{ tenant.applicant?.email }}
                        </a>
                      </div>
                      <div class="tenant-info-item">
                        <q-icon name="phone" size="xs" color="primary" class="q-mr-xs" />
                        <a :href="`tel:${tenant.applicant?.phone}`" class="tenant-link">
                          {{ tenant.applicant?.phone }}
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Lease Details -->
                  <div class="tenant-section">
                    <div class="tenant-section-title">Lease Details</div>
                    <div class="tenant-info-grid">
                      <div class="tenant-info-item">
                        <span class="info-label">Move-in Date:</span>
                        <span class="info-value">{{ formatDate(tenant.move_in_date) }}</span>
                      </div>
                      <div class="tenant-info-item">
                        <span class="info-label">Occupants:</span>
                        <span class="info-value">{{ tenant.number_of_occupants }}</span>
                      </div>
                      <div class="tenant-info-item">
                        <span class="info-label">Lease Term:</span>
                        <span class="info-value">
                          {{ tenant.lease_term_months || 'N/A' }} months
                        </span>
                      </div>
                      <div class="tenant-info-item">
                        <span class="info-label">Approved:</span>
                        <span class="info-value">{{ formatDate(tenant.approved_at) }}</span>
                      </div>
                      <div class="tenant-info-item">
                        <span class="info-label">Status:</span>
                        <q-chip
                          :color="tenant.tenant_status === 'active' ? 'positive' : 'grey'"
                          text-color="white"
                          size="sm"
                        >
                          {{ tenant.tenant_status || 'active' }}
                        </q-chip>
                      </div>
                    </div>
                  </div>

                  <!-- Applicant Details -->
                  <div v-if="tenant.applicant" class="tenant-section">
                    <div class="tenant-section-title">Applicant Information</div>
                    <div class="tenant-info-grid">
                      <div v-if="tenant.applicant.date_of_birth" class="tenant-info-item">
                        <span class="info-label">Date of Birth:</span>
                        <span class="info-value">{{
                          formatDate(tenant.applicant.date_of_birth)
                        }}</span>
                      </div>
                      <div v-if="tenant.applicant.ssn" class="tenant-info-item">
                        <span class="info-label">SSN:</span>
                        <span class="info-value"
                          >***-**-{{ tenant.applicant.ssn?.slice(-4) || 'N/A' }}</span
                        >
                      </div>
                      <div v-if="tenant.applicant.drivers_license" class="tenant-info-item">
                        <span class="info-label">Driver's License:</span>
                        <span class="info-value">{{ tenant.applicant.drivers_license }}</span>
                      </div>
                      <div v-if="tenant.applicant.employment_status" class="tenant-info-item">
                        <span class="info-label">Employment:</span>
                        <span class="info-value">{{ tenant.applicant.employment_status }}</span>
                      </div>
                      <div v-if="tenant.applicant.employer" class="tenant-info-item">
                        <span class="info-label">Employer:</span>
                        <span class="info-value">{{ tenant.applicant.employer }}</span>
                      </div>
                      <div v-if="tenant.applicant.monthly_income" class="tenant-info-item">
                        <span class="info-label">Monthly Income:</span>
                        <span class="info-value"
                          >${{ formatAmount(tenant.applicant.monthly_income) }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Co-applicants / Other Tenants -->
                  <div
                    v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                    class="tenant-section"
                  >
                    <div class="tenant-section-title">
                      Co-applicants / Other Tenants
                      <q-badge color="blue" :label="tenant.co_applicants.length" class="q-ml-sm" />
                    </div>
                    <div class="co-applicants-details">
                      <div
                        v-for="(coApplicant, index) in tenant.co_applicants"
                        :key="index"
                        class="co-applicant-card"
                      >
                        <div class="co-applicant-header">
                          <q-avatar color="blue-3" text-color="blue-9" size="32px">
                            <q-icon name="person" />
                          </q-avatar>
                          <div class="co-applicant-name">
                            <div class="text-weight-medium">
                              {{ coApplicant.first_name }} {{ coApplicant.last_name }}
                            </div>
                            <div class="text-caption text-grey-6">Co-applicant</div>
                          </div>
                        </div>
                        <div class="co-applicant-info">
                          <div v-if="coApplicant.email" class="info-row">
                            <q-icon name="email" size="14px" color="grey-6" />
                            <span>{{ coApplicant.email }}</span>
                          </div>
                          <div v-if="coApplicant.phone" class="info-row">
                            <q-icon name="phone" size="14px" color="grey-6" />
                            <span>{{ coApplicant.phone }}</span>
                          </div>
                          <div v-if="coApplicant.date_of_birth" class="info-row">
                            <q-icon name="cake" size="14px" color="grey-6" />
                            <span>DOB: {{ formatDate(coApplicant.date_of_birth) }}</span>
                          </div>
                          <div v-if="coApplicant.relationship" class="info-row">
                            <q-icon name="family_restroom" size="14px" color="grey-6" />
                            <span>{{ coApplicant.relationship }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Vehicles -->
                  <div v-if="tenant.vehicles && tenant.vehicles.length > 0" class="tenant-section">
                    <div class="tenant-section-title">
                      <q-icon name="directions_car" size="sm" class="q-mr-xs" />
                      Vehicles
                      <q-badge color="grey-7" :label="tenant.vehicles.length" class="q-ml-sm" />
                    </div>
                    <div class="vehicles-grid">
                      <div
                        v-for="(vehicle, index) in tenant.vehicles"
                        :key="index"
                        class="vehicle-card"
                      >
                        <div class="vehicle-header">
                          <q-icon name="directions_car" size="24px" color="grey-6" />
                          <div class="vehicle-name">
                            {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                          </div>
                        </div>
                        <div class="vehicle-details">
                          <div v-if="vehicle.license_plate" class="detail-row">
                            <span class="detail-label">License:</span>
                            <q-chip size="sm" color="grey-3" text-color="grey-9">
                              {{ vehicle.license_plate }}
                            </q-chip>
                          </div>
                          <div v-if="vehicle.color" class="detail-row">
                            <span class="detail-label">Color:</span>
                            <span>{{ vehicle.color }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pets -->
                  <div v-if="tenant.pets && tenant.pets.length > 0" class="tenant-section">
                    <div class="tenant-section-title">
                      <q-icon name="pets" size="sm" class="q-mr-xs" />
                      Pets
                      <q-badge color="grey-7" :label="tenant.pets.length" class="q-ml-sm" />
                    </div>
                    <div class="pets-grid">
                      <div v-for="(pet, index) in tenant.pets" :key="index" class="pet-card">
                        <div class="pet-header">
                          <q-icon name="pets" size="24px" color="grey-6" />
                          <div class="pet-name">{{ pet.name }}</div>
                        </div>
                        <div class="pet-details">
                          <div v-if="pet.type" class="detail-row">
                            <span class="detail-label">Type:</span>
                            <span>{{ pet.type }}</span>
                          </div>
                          <div v-if="pet.breed" class="detail-row">
                            <span class="detail-label">Breed:</span>
                            <span>{{ pet.breed }}</span>
                          </div>
                          <div v-if="pet.weight" class="detail-row">
                            <span class="detail-label">Weight:</span>
                            <span>{{ pet.weight }} lbs</span>
                          </div>
                          <div v-if="pet.age" class="detail-row">
                            <span class="detail-label">Age:</span>
                            <span>{{ pet.age }} years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Notes -->
                  <div v-if="tenant.additional_notes" class="tenant-section">
                    <div class="tenant-section-title">Additional Notes</div>
                    <div class="tenant-notes">
                      {{ tenant.additional_notes }}
                    </div>
                  </div>

                  <!-- Tenant Documents -->
                  <div
                    v-if="
                      tenant.application_id && getTenantDocuments(tenant.application_id).length > 0
                    "
                    class="tenant-section"
                  >
                    <div class="tenant-section-title">
                      <q-icon name="folder" size="sm" class="q-mr-xs" />
                      Documents
                      <q-badge
                        color="grey-7"
                        :label="getTenantDocuments(tenant.application_id).length"
                        class="q-ml-sm"
                      />
                    </div>
                    <div class="tenant-documents-grid">
                      <div
                        v-for="(doc, index) in getTenantDocuments(tenant.application_id)"
                        :key="`doc-${tenant.application_id}-${index}`"
                        class="tenant-document-card"
                      >
                        <div class="doc-icon-section">
                          <q-icon
                            :name="getDocumentIcon(doc.file_type)"
                            size="32px"
                            :color="getDocumentIconColor(doc.file_type)"
                          />
                        </div>
                        <div class="doc-info-section">
                          <div class="doc-name">{{ doc.name }}</div>
                          <div class="doc-description">
                            {{ doc.description || 'No description' }}
                          </div>
                          <div class="doc-meta">
                            <span class="doc-meta-item">
                              <q-icon name="event" size="12px" />
                              {{ formatDate(doc.upload_date) }}
                            </span>
                            <span class="doc-meta-item">
                              <q-icon name="folder" size="12px" />
                              {{ doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE' }}
                            </span>
                          </div>
                        </div>
                        <div class="doc-actions-section">
                          <q-btn
                            flat
                            round
                            dense
                            icon="download"
                            size="sm"
                            color="primary"
                            @click="downloadDocument(doc)"
                          >
                            <q-tooltip>Download</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Applications Section -->
            <div class="details-section" v-if="!isEditMode && leaseTenants.length === 0">
              <div class="section-title">
                Applications
                <q-badge color="primary" :label="leaseApplications.length" class="q-ml-sm" />
              </div>

              <!-- Loading State -->
              <div v-if="applicationsLoading" class="text-center q-pa-md">
                <q-spinner-dots size="40px" color="primary" />
                <div class="text-body2 text-grey-6 q-mt-sm">Loading applications...</div>
              </div>

              <!-- Error State -->
              <div v-else-if="applicationsError" class="text-center q-pa-md">
                <q-icon name="error_outline" size="48px" color="negative" />
                <div class="text-body2 text-negative q-mt-sm">{{ applicationsError }}</div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="leaseApplications.length === 0"
                class="text-center q-pa-lg bg-grey-1"
                style="border-radius: 8px"
              >
                <q-icon name="description" size="64px" color="grey-4" />
                <div class="text-body1 text-grey-6 q-mt-sm">No applications yet</div>
                <div class="text-caption text-grey-5">
                  Applications for this lease will appear here
                </div>
              </div>

              <!-- Applications List -->
              <div v-else class="applications-list">
                <q-list separator bordered>
                  <q-item
                    v-for="application in leaseApplications"
                    :key="application.id"
                    clickable
                    v-ripple
                    @click="viewApplicationDetail(application.id)"
                    class="application-item"
                  >
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white">
                        <q-icon name="person" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{
                          application.applicant
                            ? `${application.applicant.first_name} ${application.applicant.last_name}`
                            : 'Unknown Applicant'
                        }}
                      </q-item-label>
                      <q-item-label caption>
                        <div class="row q-gutter-sm items-center">
                          <span>
                            <q-icon name="email" size="xs" />
                            {{ application.applicant?.email || 'N/A' }}
                          </span>
                          <span>
                            <q-icon name="phone" size="xs" />
                            {{ application.applicant?.phone || 'N/A' }}
                          </span>
                        </div>
                      </q-item-label>
                      <q-item-label caption class="q-mt-xs">
                        Submitted: {{ formatDate(application.submitted_at) }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="column items-end q-gutter-xs">
                        <q-chip
                          :color="getApplicationStatusColor(application.status)"
                          text-color="white"
                          size="sm"
                        >
                          {{ application.status || 'Pending' }}
                        </q-chip>
                        <q-btn
                          flat
                          dense
                          round
                          color="primary"
                          icon="arrow_forward"
                          size="sm"
                          @click.stop="viewApplicationDetail(application.id)"
                        >
                          <q-tooltip>View Details</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Inventory Dialog -->
    <q-dialog v-model="showInventoryDialog" maximized>
      <InventoryList
        v-if="selectedLease"
        :lease-id="selectedLease.id"
        :property-id="selectedLease.property_id"
        :lease-data="selectedLease"
        :initial-data="currentInventoryData"
        @saved="onInventorySaved"
        @cancel="closeInventoryDialog"
      />
    </q-dialog>

    <!-- Documents Dialog -->
    <q-dialog v-model="showDocumentsDialog" maximized>
      <LeaseDocuments
        v-if="selectedLease"
        :lease-id="selectedLease.id"
        :property-id="selectedLease.property_id"
        @close="closeDocumentsDialog"
      />
    </q-dialog>

    <!-- Create Lease Dialog -->
    <q-dialog v-model="showCreateLeaseDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Lease</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateLeaseDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateLease @lease-created="onLeaseCreated" @cancel="closeCreateLeaseDialog" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import CreateLease from '../components/CreateLease.vue'
import InventoryList from '../components/InventoryList.vue'
import LeaseDocuments from '../components/LeaseDocuments.vue'
import { Notify } from 'quasar'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'

// Router
const router = useRouter()

// Store
const userDataStore = useUserDataStore()
const { updateDocument, deleteDocument } = useFirebase()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref(null) // null means show all
const showLeaseDialog = ref(false)
const selectedLease = ref(null)
const isEditMode = ref(false)
const editLoading = ref(false)
const showCreateLeaseDialog = ref(false)

// Inventory dialog states
const showInventoryDialog = ref(false)
const currentInventoryData = ref(null)

// Documents dialog states
const showDocumentsDialog = ref(false)

// Applications states
const leaseApplications = ref([])
const applicationsLoading = ref(false)
const applicationsError = ref(null)

// Tenants states
const leaseTenants = ref([])
const tenantsLoading = ref(false)
const tenantsError = ref(null)

// Tenants map for lease cards (leaseId -> tenant info)
const leaseTenantsMap = ref({})

// Get leases the user has access to
const userAccessibleLeases = computed(() => userDataStore.userAccessibleLeases)

// Filter leases based on search query and status filter
const filteredLeases = computed(() => {
  let leases = userAccessibleLeases.value

  // Apply status filter
  if (statusFilter.value) {
    leases = leases.filter((lease) => lease.status === statusFilter.value)
  }

  // Apply search filter
  if (!searchQuery.value.trim()) {
    return leases
  }

  const query = searchQuery.value.toLowerCase().trim()
  return leases.filter((lease) => {
    const propertyName = (
      lease.property_id?.nickname ||
      lease.property_id?.displayName ||
      lease.property_id?.address ||
      'Unknown Property'
    ).toLowerCase()
    const leaseId = (lease.id || '').toLowerCase()
    const specialTerms = (lease.special_terms || '').toLowerCase()
    const notes = (lease.additional_notes || '').toLowerCase()

    return (
      propertyName.includes(query) ||
      leaseId.includes(query) ||
      specialTerms.includes(query) ||
      notes.includes(query)
    )
  })
})

// Toggle status filter
const toggleStatusFilter = (status) => {
  // If status is null (Total Leases clicked), always show all
  if (status === null) {
    statusFilter.value = null
    return
  }

  // If clicking the same status, clear the filter (show all)
  if (statusFilter.value === status) {
    statusFilter.value = null
  } else {
    statusFilter.value = status
  }
}

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = null
}

// Get count of leases for a specific status
const getStatusCount = (status) => {
  return userAccessibleLeases.value.filter((lease) => lease.status === status).length
}

// Computed properties for status counts to ensure reactivity
const availableCount = computed(() => getStatusCount('Available'))
const rentedCount = computed(() => getStatusCount('Rented'))
const pendingCount = computed(() => getStatusCount('Pending'))
const expiredCount = computed(() => getStatusCount('Expired'))

// Get rate type for display
const getRateType = (lease) => {
  return lease.rate_type || 'month'
}

// Format amount
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return parseFloat(amount).toFixed(2)
}

// Get color for lease status
const getLeaseStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Rented: 'blue',
    Pending: 'orange',
    Expired: 'red',
    Terminated: 'purple',
  }
  return colors[status] || 'blue'
}

// Fetch tenants for a lease
const fetchLeaseTenants = async (leaseId) => {
  if (!leaseId) return

  tenantsLoading.value = true
  tenantsError.value = null
  leaseTenants.value = []

  try {
    console.log('Fetching tenants for lease:', leaseId)

    // Query tenants subcollection
    const tenantsRef = collection(db, 'leases', leaseId, 'tenants')
    const querySnapshot = await getDocs(tenantsRef)

    const tenants = []
    querySnapshot.forEach((doc) => {
      tenants.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    leaseTenants.value = tenants
    console.log(`Found ${tenants.length} tenants for lease ${leaseId}`)
  } catch (error) {
    console.error('Error fetching lease tenants:', error)
    tenantsError.value = 'Failed to load tenants'
  } finally {
    tenantsLoading.value = false
  }
}

// Fetch tenants for all rented leases (for lease cards)
const fetchAllLeaseTenants = async () => {
  const rentedLeases = filteredLeases.value.filter((lease) => lease.status === 'Rented')

  for (const lease of rentedLeases) {
    try {
      const tenantsRef = collection(db, 'leases', lease.id, 'tenants')
      const querySnapshot = await getDocs(tenantsRef)

      const tenants = []
      querySnapshot.forEach((doc) => {
        tenants.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      if (tenants.length > 0) {
        leaseTenantsMap.value[lease.id] = tenants[0] // Store first tenant for display
      }
    } catch (error) {
      console.error(`Error fetching tenants for lease ${lease.id}:`, error)
    }
  }
}

// Fetch applications for a lease
const fetchLeaseApplications = async (leaseId) => {
  if (!leaseId) return

  applicationsLoading.value = true
  applicationsError.value = null
  leaseApplications.value = []

  try {
    console.log('Fetching applications for lease:', leaseId)

    // Query applications with matching lease_id
    const applicationsRef = collection(db, 'lease_applications')
    const q = query(applicationsRef, where('lease_id', '==', leaseId))
    const querySnapshot = await getDocs(q)

    const applications = []
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    leaseApplications.value = applications
    console.log(`Found ${applications.length} applications for lease ${leaseId}`)
  } catch (error) {
    console.error('Error fetching lease applications:', error)
    applicationsError.value = 'Failed to load applications'
  } finally {
    applicationsLoading.value = false
  }
}

// Format date helper
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

// Get tenant documents from lease documents
const getTenantDocuments = (applicationId) => {
  if (!selectedLease.value || !applicationId) return []
  const leaseDocuments = selectedLease.value.documents || []
  return leaseDocuments.filter(
    (doc) => doc.application_id === applicationId && doc.source === 'application',
  )
}

// Get document icon based on file type
const getDocumentIcon = (fileType) => {
  if (!fileType || typeof fileType !== 'string') return 'description'

  const lowerType = fileType.toLowerCase()
  if (lowerType.includes('image')) return 'image'
  if (lowerType.includes('pdf')) return 'picture_as_pdf'
  if (lowerType.includes('word') || lowerType.includes('document')) return 'article'
  if (lowerType.includes('excel') || lowerType.includes('spreadsheet')) return 'table_chart'
  if (lowerType.includes('video')) return 'videocam'

  return 'description'
}

// Get document icon color based on file type
const getDocumentIconColor = (fileType) => {
  if (!fileType || typeof fileType !== 'string') return 'grey-7'

  const lowerType = fileType.toLowerCase()
  if (lowerType.includes('image')) return 'blue-6'
  if (lowerType.includes('pdf')) return 'red-6'
  if (lowerType.includes('word') || lowerType.includes('document')) return 'blue-7'
  if (lowerType.includes('excel') || lowerType.includes('spreadsheet')) return 'green-6'
  if (lowerType.includes('video')) return 'purple-6'

  return 'grey-7'
}

// Download document
const downloadDocument = (doc) => {
  if (!doc || !doc.file_url) {
    Notify.create({
      type: 'warning',
      message: 'Document URL not available',
      position: 'top',
    })
    return
  }

  try {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = doc.file_url
    link.target = '_blank'
    link.download = doc.name || 'document'
    document.body.appendChild(link)
    link.click()

    // Use setTimeout to ensure click event is processed before removing
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link)
      }
    }, 100)

    Notify.create({
      type: 'positive',
      message: 'Document download started',
      position: 'top',
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to download document',
      position: 'top',
    })
  }
}

// Get status color for applications
const getApplicationStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    'under review': 'blue',
  }
  return colors[status?.toLowerCase()] || 'grey'
}

// Navigate to application detail
const viewApplicationDetail = async (applicationId) => {
  // Close dialog before navigation to prevent DOM errors
  closeLeaseDialog()

  // Use nextTick to ensure dialog is closed before navigation
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 50))

  router.push(`/application-detail/${applicationId}`)
}

// Dialog functions
const viewLease = async (lease) => {
  selectedLease.value = { ...lease }
  isEditMode.value = false
  showLeaseDialog.value = true

  // Fetch tenants and applications for this lease
  await fetchLeaseTenants(lease.id)
  await fetchLeaseApplications(lease.id)
}

const closeLeaseDialog = async () => {
  showLeaseDialog.value = false

  // Wait for dialog close animation to complete before cleanup
  await nextTick()

  selectedLease.value = null
  isEditMode.value = false
  leaseApplications.value = []
  applicationsError.value = null
  leaseTenants.value = []
  tenantsError.value = null
}

const toggleEditMode = () => {
  isEditMode.value = true
}

const cancelEdit = () => {
  // Reset to original data
  const originalLease = userAccessibleLeases.value.find((l) => l.id === selectedLease.value?.id)
  if (originalLease) {
    selectedLease.value = { ...originalLease }
  }
  isEditMode.value = false
}

const saveLeaseChanges = async () => {
  if (!selectedLease.value) return

  editLoading.value = true
  try {
    // Update the lease in Firebase
    await updateDocument('leases', selectedLease.value.id, selectedLease.value)

    // Refresh the leases data
    await userDataStore.refreshLeases()

    Notify.create({
      type: 'positive',
      message: 'Lease updated successfully',
    })

    isEditMode.value = false
  } catch (error) {
    console.error('Error updating lease:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update lease',
    })
  } finally {
    editLoading.value = false
  }
}

// Quick status change function
const quickChangeStatus = async (newStatus) => {
  if (!selectedLease.value || selectedLease.value.status === newStatus) return

  try {
    // Update status locally first for immediate feedback
    selectedLease.value.status = newStatus

    // Update in Firebase
    await updateDocument('leases', selectedLease.value.id, { status: newStatus })

    // Refresh the leases data
    await userDataStore.refreshLeases()

    Notify.create({
      type: 'positive',
      message: `Status changed to ${newStatus}`,
      timeout: 1500,
    })
  } catch (error) {
    console.error('Error changing status:', error)
    // Revert on error
    const originalLease = userAccessibleLeases.value.find((l) => l.id === selectedLease.value?.id)
    if (originalLease) {
      selectedLease.value.status = originalLease.status
    }
    Notify.create({
      type: 'negative',
      message: 'Failed to change status',
    })
  }
}

// Delete lease functions
const confirmDeleteLease = () => {
  if (!selectedLease.value) return

  Notify.create({
    type: 'warning',
    message: `Are you sure you want to delete this lease?`,
    actions: [
      {
        label: 'Cancel',
        color: 'white',
        handler: () => {
          // Do nothing
        },
      },
      {
        label: 'Delete',
        color: 'negative',
        handler: () => {
          deleteLease()
        },
      },
    ],
    timeout: 0,
    position: 'center',
  })
}

const deleteLease = async () => {
  if (!selectedLease.value) return

  try {
    // Delete the lease from Firebase
    await deleteDocument('leases', selectedLease.value.id)

    // Refresh the leases data
    await userDataStore.refreshLeases()

    Notify.create({
      type: 'positive',
      message: 'Lease deleted successfully',
    })

    // Close the dialog
    await closeLeaseDialog()
  } catch (error) {
    console.error('Error deleting lease:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to delete lease',
    })
  }
}

// Inventory dialog functions
const openInventoryDialog = (lease) => {
  if (lease) {
    selectedLease.value = lease
    currentInventoryData.value = null // Could load existing inventory data here
    showInventoryDialog.value = true
  }
}

const closeInventoryDialog = () => {
  showInventoryDialog.value = false
  currentInventoryData.value = null
}

const onInventorySaved = (inventoryData) => {
  console.log('Inventory saved:', inventoryData)
  closeInventoryDialog()
  Notify.create({
    type: 'positive',
    message: 'Inventory saved successfully!',
    position: 'top',
  })
}

// Documents dialog functions
const openDocumentsDialog = (lease) => {
  if (lease) {
    selectedLease.value = lease
    showDocumentsDialog.value = true
  }
}

const closeDocumentsDialog = () => {
  showDocumentsDialog.value = false
}

// Create lease dialog functions
const openCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = true
}

const closeCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = false
}

const onLeaseCreated = () => {
  closeCreateLeaseDialog()
  refreshData()
}

// Shareable link function
const copyShareableLink = (leaseId) => {
  if (!leaseId) {
    Notify.create({
      type: 'warning',
      message: 'Unable to generate shareable link',
    })
    return
  }

  // Generate the shareable link
  const baseUrl = window.location.origin
  const shareableLink = `${baseUrl}/lease-application/${leaseId}`

  // Copy to clipboard
  navigator.clipboard
    .writeText(shareableLink)
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'Shareable link copied to clipboard!',
        caption: shareableLink,
        timeout: 3000,
        position: 'top',
        actions: [
          {
            label: 'Open',
            color: 'white',
            handler: () => {
              window.open(shareableLink, '_blank')
            },
          },
        ],
      })
    })
    .catch((error) => {
      console.error('Failed to copy link:', error)
      // Fallback: Show the link in a dialog
      Notify.create({
        type: 'info',
        message: 'Link generated',
        caption: shareableLink,
        timeout: 5000,
        position: 'top',
      })
    })
}

// Refresh data
const refreshData = async () => {
  try {
    await userDataStore.refreshLeases()
    console.log('Leases refreshed successfully')
  } catch (error) {
    console.error('Error refreshing leases:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('LeasesPage mounted')
  console.log('Current state:', {
    leasesLoading: userDataStore.leasesLoading,
    userAccessibleProperties: userDataStore.userAccessibleProperties.length,
    userAccessibleLeases: userAccessibleLeases.value.length,
  })

  // Wait a bit for the store to initialize
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log('After wait state:', {
    leasesLoading: userDataStore.leasesLoading,
    userAccessibleProperties: userDataStore.userAccessibleProperties.length,
    userAccessibleLeases: userAccessibleLeases.value.length,
  })

  // Ensure data is loaded if not already
  if (userDataStore.isAuthenticated && userDataStore.leases.length === 0) {
    console.log('No leases found, attempting to load data...')
    try {
      await userDataStore.loadLeases()
      console.log('After loading state:', {
        leases: userDataStore.leases.length,
        userAccessibleLeases: userAccessibleLeases.value.length,
      })
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Fetch tenants for all rented leases
  if (userAccessibleLeases.value.length > 0) {
    await fetchAllLeaseTenants()
  }
})

// Watch for changes in accessible leases
watch(
  () => userAccessibleLeases.value,
  async (newLeases) => {
    console.log('=== User accessible leases changed ===')
    console.log('New accessible leases count:', newLeases.length)
    console.log('New accessible leases:', newLeases)

    // Fetch tenants for all rented leases
    if (newLeases.length > 0) {
      await fetchAllLeaseTenants()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.summary-card {
  min-width: 120px;
  flex: 1;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.active-filter {
  border: 2px solid var(--q-primary) !important;
  box-shadow: 0 4px 12px rgba(36, 87, 115, 0.3);
  background: linear-gradient(135deg, rgba(36, 87, 115, 0.05) 0%, rgba(36, 87, 115, 0.1) 100%);
}

.active-filter:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(36, 87, 115, 0.4);
}

.lease-card {
  height: 320px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.lease-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(36, 87, 115, 0.02) 0%, rgba(36, 87, 115, 0.05) 100%);
}

.compact-header {
  padding: 10px 12px;
  min-height: 60px;
}

.compact-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Condensed Details Grid */
.condensed-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
}

.detail-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #666;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.detail-mini span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tenant Compact Styling */
.tenant-compact {
  margin-top: 8px;
  padding: 8px;
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.08), rgba(33, 186, 69, 0.03));
  border-left: 3px solid #21ba45;
  border-radius: 4px;
}

.tenant-compact-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #21ba45;
  margin-bottom: 6px;
}

.tenant-compact-header span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tenant-compact-contact {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tenant-compact-contact > div {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #666;
}

.tenant-compact-contact .q-icon {
  flex-shrink: 0;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lease-dialog {
  background: white;
}

.dialog-header {
  background: var(--q-secondary);
  color: white;
  padding: 16px 24px;
}

.status-btn {
  font-weight: 600;
  min-width: 90px;
  transition: all 0.2s ease;
}

.status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dialog-content {
  padding: 24px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.details-container {
  max-width: 1200px;
  margin: 0 auto;
}

.details-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--q-primary);
  border-bottom: 2px solid var(--q-primary);
  padding-bottom: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-weight: 600;
  margin-bottom: 4px;
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  font-size: 1rem;
  color: #333;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.detail-input {
  width: 100%;
}

.edit-btn,
.save-btn,
.cancel-btn,
.close-btn {
  min-width: 80px;
}

.inventory-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.inventory-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.documents-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white !important;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(240, 147, 251, 0.3);
}

.documents-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

/* Property Details Styling */
.property-details-mini {
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(36, 87, 115, 0.05);
  border-radius: 4px;
  border-left: 2px solid var(--primary-color);
}

/* Dialog Close Button Styling */
.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}

/* Shareable Link Button Styling */
.shareable-link-btn {
  border: 1px solid currentColor;
  transition: all 0.2s ease;
}

.shareable-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Applications Section Styling */
.applications-list {
  margin-top: 16px;
}

.application-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.application-item:hover {
  background: rgba(25, 118, 210, 0.05);
  transform: translateX(4px);
}

.application-item .q-item__section--avatar {
  min-width: 56px;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .dialog-header {
    padding: 12px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .application-item .q-item__label caption {
    font-size: 0.7rem;
  }

  .lease-card {
    height: auto;
    min-height: 280px;
  }

  .condensed-grid {
    gap: 6px;
  }

  .detail-mini {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}

/* Tenants Section Styling */
.tenants-list {
  margin-top: 16px;
}

.tenant-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #21ba45;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.tenant-card:hover {
  box-shadow: 0 4px 12px rgba(33, 186, 69, 0.15);
  transform: translateY(-2px);
}

.tenant-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(to right, rgba(33, 186, 69, 0.05), transparent);
  padding: 12px;
  border-radius: 8px;
  margin: -8px -8px 20px -8px;
}

.tenant-name-section {
  flex: 1;
}

.tenant-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #21ba45;
  margin-bottom: 4px;
}

.tenant-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.tenant-section {
  margin-bottom: 20px;
}

.tenant-section:last-child {
  margin-bottom: 0;
}

.tenant-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tenant-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tenant-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 6px;
}

.tenant-info-item.full-width {
  grid-column: 1 / -1;
}

.tenant-link {
  color: #1976d2;
  text-decoration: none;
}

.tenant-link:hover {
  text-decoration: underline;
}

.info-label {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.info-value {
  color: #333;
}

.co-applicants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.co-applicants-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.co-applicant-card {
  background: white;
  border: 1px solid #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.co-applicant-card:hover {
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  transform: translateY(-2px);
}

.co-applicant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e3f2fd;
}

.co-applicant-name {
  flex: 1;
}

.co-applicant-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
}

.info-row span {
  flex: 1;
}

.vehicles-list,
.pets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vehicle-item,
.pet-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 6px;
}

/* Enhanced Vehicles Grid */
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.vehicle-card {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.vehicle-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #9e9e9e;
}

.vehicle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.vehicle-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Enhanced Pets Grid */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.pet-card {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.pet-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #9e9e9e;
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.pet-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.pet-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.tenant-notes {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 6px;
  color: #555;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Tenant Documents Section */
.tenant-documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.tenant-document-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tenant-document-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #bdbdbd;
}

.doc-icon-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 8px;
}

.doc-info-section {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-description {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.doc-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #999;
}

.doc-actions-section {
  flex-shrink: 0;
}
</style>
