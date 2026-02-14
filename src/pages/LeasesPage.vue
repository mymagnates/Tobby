<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Leases</div>
      <div class="row q-gutter-sm">
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
    <div v-else class="leases-grid">
      <q-card
        v-for="lease in filteredLeases"
        :key="lease.id"
        class="lease-card"
        flat
        clickable
        @click="viewLease(lease)"
      >
        <q-card-section class="lease-card-content">
          <!-- Header Row -->
          <div class="lease-card-header-compact">
            <div class="lease-main-info">
              <q-avatar size="48px" class="lease-avatar-compact">
                <q-icon name="home" size="24px" color="white" />
              </q-avatar>
              <div class="lease-info-compact">
                <div class="lease-name-compact">
                  {{ lease.property_id?.nickname || lease.property_id?.displayName || 'N/A' }}
                </div>
                <div class="lease-meta-compact">
                  <q-chip
                    :color="getLeaseStatusColor(lease.status)"
                    text-color="white"
                    size="sm"
                    dense
                    class="status-chip-compact"
                  >
                    {{ lease.status }}
                  </q-chip>
                  <span class="lease-address-compact">
                    <q-icon name="place" size="12px" class="q-mr-xs" />
                    {{ lease.property_id?.address || 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Details Row -->
          <div class="lease-details-row">
            <div class="lease-specs-compact">
              <div class="lease-spec-item">
                <q-icon name="home" size="14px" color="grey-6" class="q-mr-xs" />
                <span>{{ lease.property_id?.spec?.type || 'N/A' }}</span>
              </div>
              <div class="lease-spec-item">
                <q-icon name="bed" size="14px" color="grey-6" class="q-mr-xs" />
                <span>{{ lease.property_id?.spec?.bedroom || 0 }} bed / {{ lease.property_id?.spec?.full_bathroom || 0 }} bath</span>
              </div>
              <div class="lease-spec-item">
                <q-icon name="calendar_today" size="14px" color="grey-6" class="q-mr-xs" />
                <span>{{ formatDate(lease.start_date) }}</span>
              </div>
            </div>
            <div class="lease-rent-compact">
              <div class="lease-amount-compact">${{ formatAmount(lease.rate_amount) }}</div>
              <div class="lease-label-compact">/{{ getRateType(lease) }}</div>
            </div>
          </div>

          <!-- Tenant / Footer Row -->
          <div class="lease-footer-row">
            <div
              v-if="lease.status === 'Rented' && leaseTenantsMap[lease.id]"
              class="lease-tenant-compact"
            >
              <q-icon name="person" size="12px" color="grey-6" class="q-mr-xs" />
              <span class="tenant-name-text">
                {{ leaseTenantsMap[lease.id].applicant?.first_name }}
                {{ leaseTenantsMap[lease.id].applicant?.last_name }}
              </span>
              <span class="tenant-contact-text">
                {{ leaseTenantsMap[lease.id].applicant?.email }}
              </span>
            </div>
            <div v-else-if="lease.status !== 'Rented'" class="lease-share-compact">
              <q-btn
                flat
                dense
                size="sm"
                color="primary"
                icon="share"
                label="Share Link"
                class="lease-share-btn"
                @click.stop="copyShareableLink(lease.id)"
              />
            </div>
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              label="View"
              class="lease-view-btn"
              @click.stop="viewLease(lease)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Lease Details Dialog -->
    <q-dialog v-model="showLeaseDialog" maximized class="lease-dialog">
      <q-card class="full-height">
        <!-- Dialog Header -->
        <q-card-section class="dialog-header">
          <div class="dialog-header-layout">
            <div class="header-identity">
              <div class="title-row">
                <div class="dialog-title ellipsis">
                  {{
                    selectedLease
                      ? selectedLease.property_id?.nickname ||
                        selectedLease.property_id?.displayName ||
                        'Lease Details'
                      : 'Lease Details'
                  }}
                </div>
                <div v-if="selectedLease?.property_id?.address" class="title-address ellipsis">
                  {{ selectedLease.property_id.address }}
                </div>
              </div>
              <div class="header-meta-row">

                <div v-if="selectedLease" class="header-meta-item">
                  <span class="header-meta-label">Available Date</span>
                  <span class="header-meta-value">{{ formatDate(selectedLease.lease_create_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="header-actions">
              <q-btn
                v-if="!isEditMode"
                color="white"
                text-color="secondary"
                icon="inventory"
                label="Inventory"
                @click="openInventoryDialog"
                class="header-action-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="white"
                text-color="secondary"
                icon="folder"
                label="Documents"
                @click="openDocumentsDialog"
                class="header-action-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="white"
                text-color="secondary"
                label="Edit"
                @click="toggleEditMode"
                class="header-action-btn"
              />
              <div v-if="selectedLease && !isEditMode" class="header-status-control">
                  
                  <q-btn-dropdown
                    :label="selectedLease.status || 'Unknown'"
                    no-caps
                    unelevated
                    text-color="white"
                    class="status-chip-dropdown"
                    :style="{ backgroundColor: getHeaderStatusBg(selectedLease.status) }"
                  >
                    <q-list dense style="min-width: 180px">
                      <q-item
                        v-for="status in leaseStatusOptions"
                        :key="status"
                        clickable
                        v-close-popup
                        @click="quickChangeStatus(status)"
                      >
                        <q-item-section>{{ status }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              <q-btn-dropdown
                v-if="!isEditMode"
                color="white"
                text-color="secondary"
                label="More"
                no-caps
                unelevated
                class="header-action-btn"
              >
                <q-list dense style="min-width: 190px">
                  <q-item clickable v-close-popup @click="navigateToCreateTenant(selectedLease)">
                    <q-item-section avatar>
                      <q-icon name="person_add" />
                    </q-item-section>
                    <q-item-section>Create Tenant</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="confirmDeleteLease">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section class="text-negative">Delete Lease</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
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
                color="primary"
                label="Cancel"
                @click="cancelEdit"
                class="cancel-btn"
              />
          </div>
          <div class="header-corner-controls">
            <q-btn
              v-if="!isEditMode && leaseTenants.length === 0"
              color="white"
              text-color="secondary"
              icon="share"
              label="Shareable Link"
              @click="copyShareableLink(selectedLease.id)"
              class="header-action-btn header-share-fixed"
            />
            <q-btn
              round
              dense
              unelevated
              icon="close"
              @click="closeLeaseDialog"
              class="close-btn header-close-fixed"
            />
          </div>
        </q-card-section>

        <!-- Dialog Content -->
        <q-card-section class="dialog-content">
          <div v-if="selectedLease" class="details-container">
            <!-- Financial Information -->
            <div class="details-section">
              <div class="section-title">Financial Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Rate Type</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{
                      selectedLease.rate_type
                        ? selectedLease.rate_type.charAt(0).toUpperCase() + selectedLease.rate_type.slice(1)
                        : 'N/A'
                    }}
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

            <!-- Tenants Section (Combined Applications and Current Tenants) -->
            <div class="details-section" v-if="!isEditMode">
              <div class="section-title">
                <q-icon name="people" class="q-mr-sm" />
                Tenants
                <q-badge color="secondary" :label="leaseTenants.length + leaseApplications.length" class="q-ml-sm" />
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                All tenants and applicants associated with this lease. Click on any entry to expand and view full details including application information.
              </div>

              <!-- Loading State -->
              <div v-if="tenantsLoading || applicationsLoading" class="text-center q-pa-md">
                <q-spinner-dots size="40px" color="secondary" />
                <div class="text-body2 text-grey-6 q-mt-sm">Loading tenants and applications...</div>
              </div>

              <!-- Error State -->
              <div v-else-if="tenantsError || applicationsError" class="text-center q-pa-md">
                <q-icon name="error_outline" size="48px" color="negative" />
                <div class="text-body2 text-negative q-mt-sm">{{ tenantsError || applicationsError }}</div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="leaseTenants.length === 0 && leaseApplications.length === 0"
                class="text-center q-pa-lg bg-grey-1"
                style="border-radius: 8px"
              >
                <q-icon name="people_outline" size="64px" color="grey-4" />
                <div class="text-body1 text-grey-6 q-mt-sm">No tenants or applications yet</div>
                <div class="text-caption text-grey-5">
                  Click "Create Tenant" button above or share the lease application link to get started
                    </div>
                  </div>

              <!-- Combined Tenants and Applications List -->
              <div v-else class="tenants-applications-list">
                <q-list separator bordered>
                  <!-- Applications from Lease Applications -->
                  <q-expansion-item
                    v-for="application in leaseApplications"
                    :key="'app-' + application.id"
                    expand-separator
                    class="tenant-expansion-item"
                  >
                    <!-- Collapsed Header -->
                    <template v-slot:header>
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white">
                          <q-icon name="description" />
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
                          <span class="text-grey-7">Application submitted:</span> {{ formatDate(application.submitted_at) }}
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
                            size="xs"
                          color="primary"
                            label="View Full App"
                          @click.stop="viewApplicationDetail(application.id)"
                          />
                      </div>
                      </q-item-section>
                    </template>

                    <!-- Expanded Application Details -->
                    <q-card flat bordered class="tenant-details-card q-ma-md">
                      <!-- Application Info -->
                      <q-card-section class="bg-primary text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="description" class="q-mr-sm" />
                          Application Information
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Application Status</div>
                            <div class="text-body2 text-weight-medium">
                        <q-chip
                                :color="getApplicationStatusColor(application.status)"
                          text-color="white"
                          size="sm"
                        >
                                {{ application.status || 'Pending' }}
                        </q-chip>
                      </div>
                    </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Submitted Date</div>
                            <div class="text-body2">{{ formatDate(application.submitted_at) || 'N/A' }}</div>
                  </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Desired Move-in</div>
                            <div class="text-body2">{{ formatDate(application.desired_move_in_date) || 'N/A' }}</div>
                      </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Lease Term</div>
                            <div class="text-body2">{{ application.lease_term_months || 'N/A' }} months</div>
                      </div>
                      </div>
                      </q-card-section>

                      <!-- Personal Information from Application -->
                      <q-separator />
                      <q-card-section class="bg-secondary text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="person" class="q-mr-sm" />
                          Applicant Personal Information
                      </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Full Name</div>
                            <div class="text-body2 text-weight-medium">
                              {{ application.applicant?.first_name }}
                              {{ application.applicant?.middle_name }}
                              {{ application.applicant?.last_name }}
                      </div>
                      </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Email</div>
                            <div class="text-body2">{{ application.applicant?.email || 'N/A' }}</div>
                    </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Phone</div>
                            <div class="text-body2">{{ application.applicant?.phone || 'N/A' }}</div>
                  </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Date of Birth</div>
                            <div class="text-body2">{{ formatDate(application.applicant?.date_of_birth) || 'N/A' }}</div>
                    </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Gender</div>
                            <div class="text-body2">{{ application.applicant?.gender || 'N/A' }}</div>
                            </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">SSN</div>
                            <div class="text-body2">{{ application.applicant?.ssn || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-6">
                            <div class="text-caption text-grey-7">Marital Status</div>
                            <div class="text-body2">{{ application.applicant?.marital_status || 'N/A' }}</div>
                        </div>
                          </div>
                      </q-card-section>

                      <!-- Employment from Application -->
                      <q-separator />
                      <q-card-section v-if="application.applicant?.employment">
                        <div class="text-subtitle1 text-weight-bold text-positive q-mb-md">
                          <q-icon name="work" class="q-mr-sm" />
                          Employment Information
                          </div>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employer</div>
                            <div class="text-body2">{{ application.applicant.employment.employer_name || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Position</div>
                            <div class="text-body2">{{ application.applicant.employment.position || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Income</div>
                            <div class="text-body2 text-weight-bold text-positive">
                              ${{ application.applicant.employment.monthly_income || 'N/A' }}/mo
                        </div>
                      </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employment Length</div>
                            <div class="text-body2">{{ application.applicant.employment.years_employed || 'N/A' }} years</div>
                    </div>
                  </div>
                      </q-card-section>

                  <!-- Vehicles -->
                      <q-separator v-if="application.vehicles && application.vehicles.length > 0" />
                      <q-card-section v-if="application.vehicles && application.vehicles.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-indigo q-mb-md">
                          <q-icon name="directions_car" class="q-mr-sm" />
                          Vehicles ({{ application.vehicles.length }})
                    </div>
                        <q-list bordered separator>
                          <q-item v-for="(vehicle, index) in application.vehicles" :key="index">
                            <q-item-section avatar>
                              <q-icon name="directions_car" color="indigo" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</q-item-label>
                              <q-item-label caption>{{ vehicle.color }} • License: {{ vehicle.license_plate }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Pets -->
                      <q-separator v-if="application.pets && application.pets.length > 0" />
                      <q-card-section v-if="application.pets && application.pets.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-orange q-mb-md">
                          <q-icon name="pets" class="q-mr-sm" />
                          Pets ({{ application.pets.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item v-for="(pet, index) in application.pets" :key="index">
                            <q-item-section avatar>
                              <q-icon name="pets" color="orange" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ pet.name }} ({{ pet.type }})</q-item-label>
                              <q-item-label caption>{{ pet.breed }} • {{ pet.weight }} lbs • {{ pet.age }} years old</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Co-Applicants -->
                      <q-separator v-if="application.co_applicants && application.co_applicants.length > 0" />
                      <q-card-section v-if="application.co_applicants && application.co_applicants.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-purple q-mb-md">
                          <q-icon name="group" class="q-mr-sm" />
                          Co-Applicants ({{ application.co_applicants.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item v-for="(coApplicant, index) in application.co_applicants" :key="index">
                            <q-item-section avatar>
                              <q-avatar color="purple" text-color="white">
                                <q-icon name="person" />
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ coApplicant.first_name }} {{ coApplicant.last_name }}</q-item-label>
                              <q-item-label caption>
                                <div class="row q-gutter-sm">
                                  <span><q-icon name="email" size="xs" /> {{ coApplicant.email }}</span>
                                  <span><q-icon name="phone" size="xs" /> {{ coApplicant.phone }}</span>
                                </div>
                              </q-item-label>
                              <q-item-label caption>Relationship: {{ coApplicant.relationship || 'N/A' }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Documents -->
                      <q-separator v-if="application.documents && application.documents.length > 0" />
                      <q-card-section v-if="application.documents && application.documents.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-deep-purple q-mb-md">
                          <q-icon name="upload_file" class="q-mr-sm" />
                          Documents ({{ application.documents.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item
                            v-for="(doc, index) in application.documents"
                        :key="index"
                            clickable
                            @click="window.open(doc.url, '_blank')"
                          >
                            <q-item-section avatar>
                              <q-icon :name="getDocumentIcon(doc.name || doc.fileName)" color="primary" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ doc.name || doc.fileName || 'Document' }}</q-item-label>
                              <q-item-label caption>{{ doc.description || 'Application Document' }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn flat dense round icon="download" color="primary" @click.stop="window.open(doc.url, '_blank')">
                                <q-tooltip>Download</q-tooltip>
                        </q-btn>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Timestamps -->
                      <q-separator />
                      <q-card-section class="bg-grey-2">
                        <div class="row q-col-gutter-md text-caption text-grey-7">
                          <div class="col-6">
                            <q-icon name="event" size="xs" class="q-mr-xs" />
                            Submitted: {{ formatDate(application.submitted_at) || 'N/A' }}
                          </div>
                          <div class="col-6">
                            <q-icon name="badge" size="xs" class="q-mr-xs" />
                            Status: <q-chip :color="getApplicationStatusColor(application.status)" text-color="white" size="xs">{{ application.status || 'Pending' }}</q-chip>
                        </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>

                  <!-- Manually Created Tenants -->
                  <q-expansion-item
                    v-for="tenant in leaseTenants"
                    :key="tenant.id"
                    expand-separator
                    class="tenant-expansion-item"
                  >
                    <!-- Collapsed Header -->
                    <template v-slot:header>
                      <q-item-section avatar>
                        <q-avatar color="secondary" text-color="white">
                          <q-icon name="person" />
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{
                            tenant.personal_info
                              ? `${tenant.personal_info.first_name} ${tenant.personal_info.last_name}`
                              : 'Unknown Tenant'
                          }}
                        </q-item-label>
                        <q-item-label caption>
                          <div class="row q-gutter-sm items-center">
                            <span>
                              <q-icon name="email" size="xs" />
                              {{ tenant.personal_info?.email || 'N/A' }}
                            </span>
                            <span>
                              <q-icon name="phone" size="xs" />
                              {{ tenant.personal_info?.phone || 'N/A' }}
                            </span>
                          </div>
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <div class="column items-end q-gutter-xs">
                          <q-chip
                            :color="tenant.status === 'active' ? 'positive' : 'grey'"
                            text-color="white"
                            size="sm"
                          >
                            {{ tenant.status || 'Active' }}
                            </q-chip>
                          <div class="text-caption text-grey-7">
                            ${{ tenant.lease_info?.monthly_rent || 'N/A' }}/mo
                          </div>
                          </div>
                      </q-item-section>
                    </template>

                    <!-- Expanded Details -->
                    <q-card flat bordered class="tenant-details-card q-ma-md">
                      <!-- Personal Information -->
                      <q-card-section class="bg-secondary text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="person" class="q-mr-sm" />
                          Personal Information
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Full Name</div>
                            <div class="text-body2 text-weight-medium">
                              {{ tenant.personal_info?.first_name }}
                              {{ tenant.personal_info?.middle_name }}
                              {{ tenant.personal_info?.last_name }}
                      </div>
                    </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Email</div>
                            <div class="text-body2">{{ tenant.personal_info?.email || 'N/A' }}</div>
                  </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Phone</div>
                            <div class="text-body2">{{ tenant.personal_info?.phone || 'N/A' }}</div>
                    </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Date of Birth</div>
                            <div class="text-body2">{{ formatDate(tenant.personal_info?.date_of_birth) || 'N/A' }}</div>
                        </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Gender</div>
                            <div class="text-body2">{{ tenant.personal_info?.gender || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">SSN</div>
                            <div class="text-body2">{{ tenant.personal_info?.ssn || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Marital Status</div>
                            <div class="text-body2">{{ tenant.personal_info?.marital_status || 'N/A' }}</div>
                          </div>
                          </div>
                      </q-card-section>

                      <!-- Current Address -->
                      <q-separator />
                      <q-card-section class="bg-info text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="location_on" class="q-mr-sm" />
                          Current Address
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-6">
                            <div class="text-caption text-grey-7">Street Address</div>
                            <div class="text-body2">{{ tenant.current_address?.street || 'N/A' }}</div>
                      </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">City</div>
                            <div class="text-body2">{{ tenant.current_address?.city || 'N/A' }}</div>
                    </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">State</div>
                            <div class="text-body2">{{ tenant.current_address?.state || 'N/A' }}</div>
                  </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">ZIP Code</div>
                            <div class="text-body2">{{ tenant.current_address?.zipCode || 'N/A' }}</div>
                    </div>
                  </div>
                      </q-card-section>

                      <!-- Employment Information -->
                      <q-separator v-if="tenant.employment" />
                      <q-card-section v-if="tenant.employment" class="bg-accent text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="work" class="q-mr-sm" />
                          Employment Information
                    </div>
                      </q-card-section>
                      <q-card-section v-if="tenant.employment">
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employer</div>
                            <div class="text-body2">{{ tenant.employment.employer_name || 'N/A' }}</div>
                        </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Position</div>
                            <div class="text-body2">{{ tenant.employment.position || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Monthly Income</div>
                            <div class="text-body2 text-weight-bold text-positive">
                              ${{ tenant.employment.monthly_income || 'N/A' }}
                          </div>
                        </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Years Employed</div>
                            <div class="text-body2">{{ tenant.employment.years_employed || 'N/A' }} years</div>
                        </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employer Phone</div>
                            <div class="text-body2">{{ tenant.employment.employer_phone || 'N/A' }}</div>
                      </div>
                    </div>
                      </q-card-section>

                      <!-- Lease Information -->
                      <q-separator />
                      <q-card-section class="bg-positive text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="description" class="q-mr-sm" />
                          Lease Information
                  </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Start Date</div>
                            <div class="text-body2">{{ formatDate(tenant.lease_info?.start_date) || 'N/A' }}</div>
                </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">End Date</div>
                            <div class="text-body2">{{ formatDate(tenant.lease_info?.end_date) || 'N/A' }}</div>
              </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Monthly Rent</div>
                            <div class="text-body2 text-weight-bold text-positive">
                              ${{ tenant.lease_info?.monthly_rent || 'N/A' }}
            </div>
              </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Security Deposit</div>
                            <div class="text-body2">${{ tenant.lease_info?.security_deposit || 'N/A' }}</div>
            </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Payment Method</div>
                            <div class="text-body2">{{ tenant.lease_info?.payment_method || 'N/A' }}</div>
              </div>
                        </div>
                      </q-card-section>

                      <!-- Emergency Contact -->
                      <q-separator />
                      <q-card-section class="bg-warning text-white">
                        <div class="text-subtitle1 text-weight-bold">
                          <q-icon name="emergency" class="q-mr-sm" />
                          Emergency Contact
              </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-4">
                            <div class="text-caption text-grey-7">Contact Name</div>
                            <div class="text-body2">{{ tenant.emergency_contact?.name || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="text-caption text-grey-7">Relationship</div>
                            <div class="text-body2">{{ tenant.emergency_contact?.relationship || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="text-caption text-grey-7">Phone Number</div>
                            <div class="text-body2">{{ tenant.emergency_contact?.phone || 'N/A' }}</div>
                          </div>
                        </div>
                      </q-card-section>

                      <!-- Vehicles -->
                      <q-separator v-if="tenant.vehicles && tenant.vehicles.length > 0" />
                      <q-card-section v-if="tenant.vehicles && tenant.vehicles.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-indigo q-mb-md">
                          <q-icon name="directions_car" class="q-mr-sm" />
                          Vehicles ({{ tenant.vehicles.length }})
              </div>
                        <q-list bordered separator>
                          <q-item v-for="(vehicle, index) in tenant.vehicles" :key="index">
                            <q-item-section avatar>
                              <q-icon name="directions_car" color="indigo" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})</q-item-label>
                              <q-item-label caption>{{ vehicle.color }} • License: {{ vehicle.license_plate }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Pets -->
                      <q-separator v-if="tenant.pets && tenant.pets.length > 0" />
                      <q-card-section v-if="tenant.pets && tenant.pets.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-orange q-mb-md">
                          <q-icon name="pets" class="q-mr-sm" />
                          Pets ({{ tenant.pets.length }})
                </div>
                        <q-list bordered separator>
                          <q-item v-for="(pet, index) in tenant.pets" :key="index">
                            <q-item-section avatar>
                              <q-icon name="pets" color="orange" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ pet.name }} ({{ pet.type }})</q-item-label>
                              <q-item-label caption>{{ pet.breed }} • {{ pet.weight }} lbs • {{ pet.age }} years old</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Co-Applicants / Additional Occupants -->
                      <q-separator v-if="tenant.co_applicants && tenant.co_applicants.length > 0" />
                      <q-card-section v-if="tenant.co_applicants && tenant.co_applicants.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-purple q-mb-md">
                          <q-icon name="group" class="q-mr-sm" />
                          Additional Occupants ({{ tenant.co_applicants.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item v-for="(occupant, index) in tenant.co_applicants" :key="index">
                    <q-item-section avatar>
                              <q-avatar color="purple" text-color="white">
                        <q-icon name="person" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                              <q-item-label>{{ occupant.first_name }} {{ occupant.last_name }}</q-item-label>
                      <q-item-label caption>
                                <div class="row q-gutter-sm">
                                  <span><q-icon name="email" size="xs" /> {{ occupant.email || 'N/A' }}</span>
                                  <span><q-icon name="phone" size="xs" /> {{ occupant.phone || 'N/A' }}</span>
                        </div>
                      </q-item-label>
                              <q-item-label caption>Relationship: {{ occupant.relationship || 'N/A' }}</q-item-label>
                    </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Documents -->
                      <q-separator v-if="tenant.documents && tenant.documents.length > 0" />
                      <q-card-section v-if="tenant.documents && tenant.documents.length > 0">
                        <div class="text-subtitle1 text-weight-bold text-deep-purple q-mb-md">
                          <q-icon name="upload_file" class="q-mr-sm" />
                          Documents ({{ tenant.documents.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item
                            v-for="(doc, index) in tenant.documents"
                            :key="index"
                            clickable
                            @click="window.open(doc.url, '_blank')"
                          >
                            <q-item-section avatar>
                              <q-icon :name="getDocumentIcon(doc.fileName)" color="primary" size="md" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ doc.fileName || doc.originalName }}</q-item-label>
                              <q-item-label caption>{{ doc.documentType || 'Document' }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn flat dense round icon="download" color="primary" @click.stop="window.open(doc.url, '_blank')">
                                <q-tooltip>Download</q-tooltip>
                        </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
                      </q-card-section>

                      <!-- Notes -->
                      <q-separator v-if="tenant.notes" />
                      <q-card-section v-if="tenant.notes">
                        <div class="text-subtitle1 text-weight-bold q-mb-md">
                          <q-icon name="notes" class="q-mr-sm" />
                          Additional Notes
              </div>
                        <div class="text-body2 bg-grey-1 q-pa-md" style="border-radius: 8px">
                          {{ tenant.notes }}
                        </div>
                      </q-card-section>

                      <!-- Timestamps -->
                      <q-separator />
                      <q-card-section class="bg-grey-2">
                        <div class="row q-col-gutter-md text-caption text-grey-7">
                          <div class="col-6">
                            <q-icon name="event" size="xs" class="q-mr-xs" />
                            Created: {{ formatDate(tenant.created_at) || 'N/A' }}
                          </div>
                          <div class="col-6">
                            <q-icon name="badge" size="xs" class="q-mr-xs" />
                            Status: <span :class="tenant.status === 'active' ? 'text-positive' : 'text-grey'">{{ tenant.status || 'Active' }}</span>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
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
const leaseStatusOptions = ['Available', 'Rented', 'Pending', 'Expired', 'Terminated']

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

const getHeaderStatusBg = (status) => {
  const colors = {
    Available: '#2e7d32',
    Rented: '#1565c0',
    Pending: '#ef6c00',
    Expired: '#c62828',
    Terminated: '#6a1b9a',
  }
  return colors[status] || '#245773'
}

// Fetch tenants for a lease
const fetchLeaseTenants = async (leaseId) => {
  if (!leaseId) return

  tenantsLoading.value = true
  tenantsError.value = null
  leaseTenants.value = []

  try {
    console.log('Fetching tenants for lease:', leaseId)

    // Query tenants collection with matching lease_id
    const tenantsRef = collection(db, 'tenants')
    const q = query(tenantsRef, where('lease_id', '==', leaseId))
    const querySnapshot = await getDocs(q)

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

  router.push(`application-detail/${applicationId}`)  // Navigate to layout version (no leading slash)
}

// Navigate to Create Tenant page with lease context
const navigateToCreateTenant = (lease) => {
  // Navigate to create tenant page with property and lease IDs
  const query = {
    propertyId: lease.property_id?.id || lease.property_id,
    leaseId: lease.id,
  }

  router.push({
    path: '/create-tenant',
    query: query,
  })
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

/* Leases Grid - matches tenant card layout */
.leases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.lease-card {
  transition: all 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--neutral-200);
  background: white;
  cursor: pointer;
}

.lease-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

/* Compact Card Content */
.lease-card-content {
  padding: 16px;
}

/* Compact Header */
.lease-card-header-compact {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.lease-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.lease-avatar-compact {
  background: var(--primary-color);
  flex-shrink: 0;
}

.lease-info-compact {
  flex: 1;
  min-width: 0;
}

.lease-name-compact {
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lease-meta-compact {
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

.lease-address-compact {
  font-size: 12px;
  color: var(--neutral-600);
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Details Row */
.lease-details-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.lease-specs-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.lease-spec-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--neutral-700);
}

.lease-spec-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lease-rent-compact {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  padding-left: 12px;
  border-left: 1px solid var(--neutral-200);
}

.lease-amount-compact {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.lease-label-compact {
  font-size: 11px;
  color: var(--neutral-600);
  font-weight: 500;
}

/* Footer Row */
.lease-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lease-tenant-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--neutral-700);
}

.tenant-name-text {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-contact-text {
  font-size: 11px;
  color: var(--neutral-600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lease-share-compact {
  flex: 1;
}

.lease-share-btn {
  font-size: 12px;
  min-height: 28px;
}

.lease-view-btn {
  font-size: 12px;
  padding: 4px 10px;
  min-height: 24px;
  flex-shrink: 0;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding-right: 260px;
  position: relative;
}

.dialog-header-layout {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.header-identity {
  min-width: 260px;
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.dialog-title {
  font-family: 'Avenir Next', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.title-address {
  font-size: 0.86rem;
  font-weight: 500;
  opacity: 0.9;
  max-width: 420px;
}

.header-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-status-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-chip-dropdown {
  border-radius: 999px;
  min-height: 32px;
}

.status-chip-dropdown :deep(.q-btn__content) {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.status-chip-dropdown :deep(.q-btn-dropdown__arrow) {
  color: #ffffff;
}

.header-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.16);
  padding: 6px 10px;
  border-radius: 999px;
}

.header-meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.85;
}

.header-meta-value {
  font-size: 0.82rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 12px;
}

.header-action-btn {
  border-radius: 8px;
  border: 1px solid rgba(36, 87, 115, 0.22);
  font-weight: 600;
  min-height: 36px;
  opacity: 1 !important;
  filter: none !important;
}

.header-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(12, 24, 36, 0.12);
}

.header-close-fixed {
  background: #ffffff;
  color: var(--q-secondary);
}

.header-close-fixed:hover {
  background: #f3f6f8;
}

.header-close-fixed.q-btn--round {
  width: 34px;
  min-width: 34px;
  height: 34px;
}

.header-corner-controls {
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.header-share-fixed {
  height: 34px;
  min-height: 34px;
  padding: 0 12px;
}

.header-share-fixed :deep(.q-btn__content) {
  min-height: 34px;
  align-items: center;
}

.header-action-btn :deep(.q-btn__content) {
  gap: 6px;
}

.header-action-btn :deep(.q-btn-dropdown__arrow) {
  margin-left: 2px;
}

.header-action-btn :deep(.q-icon) {
  font-size: 1rem;
}

.header-action-btn :deep(.q-focus-helper) {
  opacity: 1 !important;
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
    padding-right: 160px;
  }

  .dialog-content {
    padding: 16px;
  }

  .dialog-header-layout {
    align-items: flex-start;
  }

  .header-meta-row {
    align-items: flex-start;
    gap: 8px;
  }

  .header-status-control {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .header-corner-controls {
    top: 10px;
    right: 10px;
  }

  .application-item .q-item__label caption {
    font-size: 0.7rem;
  }

  .leases-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .lease-card-content {
    padding: 12px;
  }

  .lease-details-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .lease-rent-compact {
    border-left: none;
    border-top: 1px solid var(--neutral-200);
    padding-left: 0;
    padding-top: 8px;
    width: 100%;
  }

  .lease-footer-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

/* Tenant Expansion Item Styles */
.tenant-expansion-item {
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.tenant-expansion-item:hover {
  background-color: rgba(0, 150, 136, 0.05);
}

.tenant-details-card {
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tenant-details-card .q-card__section {
  padding: 16px;
}

.tenant-details-card .text-caption {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.tenant-details-card .text-body2 {
  font-size: 0.95rem;
  line-height: 1.5;
}

.tenants-list {
  margin-top: 16px;
}
</style>
