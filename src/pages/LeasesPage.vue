<template>
  <q-page class="q-pa-md">
    <div class="page-toolbar page-toolbar--filters">
      <q-input
        v-model="searchQuery"
        placeholder="Search leases"
        borderless
        dense
        clearable
        class="page-tool-field"
      >
        <template v-slot:prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
      <q-select
        v-model="statusFilter"
        :options="leaseStatusFilterOptions"
        borderless
        dense
        clearable
        emit-value
        map-options
        :display-value="leaseStatusFilterLabel"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="tune" size="18px" />
        </template>
      </q-select>
      <q-btn
        v-if="searchQuery || statusFilter"
        flat
        dense
        round
        icon="clear"
        color="grey-7"
        class="page-tool-icon-action"
        @click="clearFilters"
      >
        <q-tooltip>Clear filters</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canManageRecords"
        @click="openCreateLeaseDialog"
        color="primary"
        text-color="white"
        unelevated
        no-caps
        dense
        icon="add"
        label="Add"
        class="page-tool-action"
      />
    </div>

    <!-- Quick Stats -->
    <div class="lease-summary-strip q-mb-md">
      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === null }"
        clickable
        @click="toggleStatusFilter(null)"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ userAccessibleLeases.length }}</div>
          <div class="text-caption">All Leases</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Draft' }"
        clickable
        @click="toggleStatusFilter('Draft')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-green">{{ availableCount }}</div>
          <div class="text-caption">Draft</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Active' }"
        clickable
        @click="toggleStatusFilter('Active')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-blue">{{ rentedCount }}</div>
          <div class="text-caption">Active</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Scheduled' }"
        clickable
        @click="toggleStatusFilter('Scheduled')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ pendingCount }}</div>
          <div class="text-caption">Scheduled</div>
        </q-card-section>
      </q-card>

      <q-card
        class="summary-card clickable-card"
        :class="{ 'active-filter': statusFilter === 'Expired' }"
        clickable
        @click="toggleStatusFilter('Expired')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-red">{{ expiredCount }}</div>
          <div class="text-caption">Expired</div>
        </q-card-section>
      </q-card>
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
    <div v-else class="leases-grid entity-tiles">
      <q-card
        v-for="lease in filteredLeases"
        :key="lease.id"
        class="lease-card entity-tile"
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
                <span
                  >{{ lease.property_id?.spec?.bedroom || 0 }} bed /
                  {{ lease.property_id?.spec?.full_bathroom || 0 }} bath</span
                >
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
            <div class="lease-footer-context">
              <div v-if="leaseTenantsMap[lease.id]" class="lease-tenant-compact">
                <q-icon name="person" size="12px" color="grey-6" class="q-mr-xs" />
                <span class="tenant-name-text">
                  {{ tenantCardContact(leaseTenantsMap[lease.id]).name }}
                </span>
                <span
                  v-if="tenantCardContact(leaseTenantsMap[lease.id]).email"
                  class="tenant-contact-text"
                >
                  {{ tenantCardContact(leaseTenantsMap[lease.id]).email }}
                </span>
              </div>
              <div v-else-if="isLeaseAvailable(lease)" class="lease-share-compact">
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
            </div>
            <div class="lease-card-actions">
              <q-btn
                flat
                dense
                size="sm"
                color="primary"
                label="View"
                class="lease-view-btn"
                no-caps
                :ripple="false"
                @click.stop="viewLease(lease)"
              />
              <q-btn
                flat
                no-caps
                icon="inventory_2"
                label="Inventory List"
                class="lease-inventory-entry"
                :ripple="false"
                @click.stop="openInventoryDialog(lease)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Lease Details Panel -->
    <DetailShell
      v-model="showLeaseDialog"
      class="lease-detail-shell"
      :title="`${selectedLease?.property_id?.nickname || selectedLease?.property_id?.displayName || 'Property'} Lease`"
      :subtitle="selectedLease?.property_id?.address || ''"
      @close="closeLeaseDialog"
    >
      <template #actions>
        <div v-if="selectedLease" class="lease-shell-actions">
          <q-btn
            v-if="!isEditMode"
            outline
            color="primary"
            size="sm"
            icon="inventory"
            label="Inventory"
            @click="openInventoryDialog(selectedLease)"
            class="lease-action-btn"
          />
          <q-btn
            v-if="!isEditMode"
            outline
            color="primary"
            size="sm"
            icon="folder"
            label="Documents"
            @click="openDocumentsDialog"
            class="lease-action-btn"
          />
          <q-btn
            v-if="canManageRecords && selectedLease && !isEditMode && isLeaseRented(selectedLease)"
            outline
            color="primary"
            size="sm"
            icon="person_add"
            label="Invite Tenant"
            @click="inviteTenantAccount(selectedLease)"
            class="lease-action-btn"
          />
          <q-btn
            v-if="canManageRecords && !isEditMode"
            outline
            color="primary"
            size="sm"
            label="Edit"
            @click="toggleEditMode"
            class="lease-action-btn"
          />
          <q-btn
            v-if="canManageRecords && selectedLease && !isEditMode"
            outline
            color="primary"
            size="sm"
            icon="person_add"
            label="Create Tenant"
            @click="navigateToCreateTenant(selectedLease)"
            class="lease-action-btn"
          />
          <q-btn
            v-if="canManageRecords && selectedLease && !isEditMode"
            outline
            color="negative"
            size="sm"
            icon="archive"
            label="Archive"
            @click="confirmArchiveLease"
            class="lease-action-btn"
          />

          <q-btn
            v-if="isEditMode"
            unelevated
            color="primary"
            label="Save"
            @click="saveLeaseChanges"
            :loading="editLoading"
            class="save-btn"
          />
          <q-btn
            v-if="isEditMode"
            outline
            color="primary"
            label="Cancel"
            @click="cancelEdit"
            class="cancel-btn"
          />
          <q-btn
            v-if="selectedLease && !isEditMode && isLeaseAvailable(selectedLease)"
            outline
            color="primary"
            size="sm"
            icon="share"
            label="Shareable Link"
            @click="copyShareableLink(selectedLease.id)"
            class="lease-action-btn"
          />
        </div>
      </template>
      <div class="lease-detail-card">
        <div v-if="selectedLease" class="header-meta-row">
          <div class="header-meta-item">
            <span class="header-meta-label">Available Date</span>
            <span class="header-meta-value">{{ formatDate(selectedLease.lease_create_date) }}</span>
          </div>
        </div>
        <!-- Dialog Content -->
        <q-card-section class="dialog-content">
          <div v-if="selectedLease" class="details-container">
            <LeaseLifecyclePanel
              :lease="selectedLease"
              :can-manage="canManageRecords"
              @updated="onLifecycleUpdated"
              @renewed="onLifecycleRenewed"
            />
            <DepositWorkspace
              v-if="!isEditMode && canViewDeposit"
              :property-id="getLeasePropertyId(selectedLease)"
              :lease-id="selectedLease.deposit_source_lease_id || getLeaseDocId(selectedLease)"
              :lease-status="selectedLease.status || ''"
              class="q-mb-md"
            />
            <!-- Financial Information -->
            <div class="details-section">
              <div class="section-title">Financial Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Rate Type</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{
                      selectedLease.rate_type
                        ? selectedLease.rate_type.charAt(0).toUpperCase() +
                          selectedLease.rate_type.slice(1)
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
                  <div class="detail-label">Required Deposit</div>
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
                  <div class="detail-label">Lease Start Date</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ formatDate(selectedLease.start_date || selectedLease.lease_start_date) }}
                  </div>
                  <q-input
                    v-else
                    :model-value="getSelectedLeaseMoveInDateInput()"
                    type="date"
                    outlined
                    dense
                    class="detail-input"
                    @update:model-value="setSelectedLeaseMoveInDate"
                  />
                </div>

                <div class="detail-item">
                  <div class="detail-label">Lease End Date</div>
                  <div v-if="!isEditMode" class="detail-value">
                    {{ formatDate(selectedLease.lease_end_date) }}
                  </div>
                  <q-input
                    v-else
                    v-model="selectedLease.lease_end_date"
                    type="date"
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
                <q-badge
                  color="secondary"
                  :label="leaseTenants.length + leaseApplications.length"
                  class="q-ml-sm"
                />
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                All tenants and applicants associated with this lease. Click on any entry to expand
                and view full details including application information.
              </div>

              <!-- Loading State -->
              <div v-if="tenantsLoading || applicationsLoading" class="text-center q-pa-md">
                <q-spinner-dots size="40px" color="secondary" />
                <div class="text-body2 text-grey-6 q-mt-sm">
                  Loading tenants and applications...
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="tenantsError || applicationsError" class="text-center q-pa-md">
                <q-icon name="error_outline" size="48px" color="negative" />
                <div class="text-body2 text-negative q-mt-sm">
                  {{ tenantsError || applicationsError }}
                </div>
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
                  Click "Create Tenant" button above or share the lease application link to get
                  started
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
                          <span class="text-grey-7">Application submitted:</span>
                          {{ formatDate(application.submitted_at) }}
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
                    <q-card flat bordered class="tenant-details-card tenant-detail-surface q-ma-md">
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
                            <div class="text-body2">
                              {{ formatDate(application.submitted_at) || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Desired Move-in</div>
                            <div class="text-body2">
                              {{ formatDate(application.desired_move_in_date) || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Lease Term</div>
                            <div class="text-body2">
                              {{ application.lease_term_months || 'N/A' }} months
                            </div>
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
                            <div class="text-body2">
                              {{ application.applicant?.email || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Phone</div>
                            <div class="text-body2">
                              {{ application.applicant?.phone || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Date of Birth</div>
                            <div class="text-body2">
                              {{ formatDate(application.applicant?.date_of_birth) || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Gender</div>
                            <div class="text-body2">
                              {{ application.applicant?.gender || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">SSN</div>
                            <div class="text-body2">{{ application.applicant?.ssn || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-6">
                            <div class="text-caption text-grey-7">Marital Status</div>
                            <div class="text-body2">
                              {{ application.applicant?.marital_status || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{ application.applicant.employment.employer_name || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Position</div>
                            <div class="text-body2">
                              {{ application.applicant.employment.position || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Income</div>
                            <div class="text-body2 text-weight-bold text-positive">
                              ${{ application.applicant.employment.monthly_income || 'N/A' }}/mo
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employment Length</div>
                            <div class="text-body2">
                              {{ application.applicant.employment.years_employed || 'N/A' }} years
                            </div>
                          </div>
                        </div>
                      </q-card-section>

                      <!-- Vehicles -->
                      <q-separator v-if="application.vehicles && application.vehicles.length > 0" />
                      <q-card-section
                        v-if="application.vehicles && application.vehicles.length > 0"
                      >
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
                              <q-item-label
                                >{{ vehicle.make }} {{ vehicle.model }} ({{
                                  vehicle.year
                                }})</q-item-label
                              >
                              <q-item-label caption
                                >{{ vehicle.color }} • License:
                                {{ vehicle.license_plate }}</q-item-label
                              >
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
                              <q-item-label caption
                                >{{ pet.breed }} • {{ pet.weight }} lbs • {{ pet.age }} years
                                old</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Co-Applicants -->
                      <q-separator
                        v-if="application.co_applicants && application.co_applicants.length > 0"
                      />
                      <q-card-section
                        v-if="application.co_applicants && application.co_applicants.length > 0"
                      >
                        <div class="text-subtitle1 text-weight-bold text-purple q-mb-md">
                          <q-icon name="group" class="q-mr-sm" />
                          Co-Applicants ({{ application.co_applicants.length }})
                        </div>
                        <q-list bordered separator>
                          <q-item
                            v-for="(coApplicant, index) in application.co_applicants"
                            :key="index"
                          >
                            <q-item-section avatar>
                              <q-avatar color="purple" text-color="white">
                                <q-icon name="person" />
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label
                                >{{ coApplicant.first_name }}
                                {{ coApplicant.last_name }}</q-item-label
                              >
                              <q-item-label caption>
                                <div class="row q-gutter-sm">
                                  <span
                                    ><q-icon name="email" size="xs" /> {{ coApplicant.email }}</span
                                  >
                                  <span
                                    ><q-icon name="phone" size="xs" /> {{ coApplicant.phone }}</span
                                  >
                                </div>
                              </q-item-label>
                              <q-item-label caption
                                >Relationship: {{ coApplicant.relationship || 'N/A' }}</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Documents -->
                      <q-separator
                        v-if="application.documents && application.documents.length > 0"
                      />
                      <q-card-section
                        v-if="application.documents && application.documents.length > 0"
                      >
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
                              <q-icon
                                :name="getDocumentIcon(doc.name || doc.fileName)"
                                color="primary"
                                size="md"
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{
                                doc.name || doc.fileName || 'Document'
                              }}</q-item-label>
                              <q-item-label caption>{{
                                doc.description || 'Application Document'
                              }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn
                                flat
                                dense
                                round
                                icon="download"
                                color="primary"
                                @click.stop="window.open(doc.url, '_blank')"
                              >
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
                            Status:
                            <q-chip
                              :color="getApplicationStatusColor(application.status)"
                              text-color="white"
                              size="xs"
                              >{{ application.status || 'Pending' }}</q-chip
                            >
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
                    <q-card flat bordered class="tenant-details-card tenant-detail-surface q-ma-md">
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
                            <div class="text-body2">
                              {{ formatDate(tenant.personal_info?.date_of_birth) || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Gender</div>
                            <div class="text-body2">
                              {{ tenant.personal_info?.gender || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">SSN</div>
                            <div class="text-body2">{{ tenant.personal_info?.ssn || 'N/A' }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Marital Status</div>
                            <div class="text-body2">
                              {{ tenant.personal_info?.marital_status || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{ tenant.current_address?.street || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">City</div>
                            <div class="text-body2">
                              {{ tenant.current_address?.city || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">State</div>
                            <div class="text-body2">
                              {{ tenant.current_address?.state || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <div class="text-caption text-grey-7">ZIP Code</div>
                            <div class="text-body2">
                              {{ tenant.current_address?.zipCode || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{ tenant.employment.employer_name || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{ tenant.employment.years_employed || 'N/A' }} years
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Employer Phone</div>
                            <div class="text-body2">
                              {{ tenant.employment.employer_phone || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{
                                formatDate(
                                  selectedLease.lease_start_date || selectedLease.start_date,
                                )
                              }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">End Date</div>
                            <div class="text-body2">
                              {{ formatDate(selectedLease.lease_end_date) }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">
                              Lease Rent ({{ selectedLease.rate_type || 'Monthly' }})
                            </div>
                            <div class="text-body2 text-weight-bold text-positive">
                              ${{ formatAmount(selectedLease.rate_amount) }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Security Deposit</div>
                            <div class="text-body2">${{ formatAmount(selectedLease.deposit) }}</div>
                          </div>
                          <div class="col-12 col-md-3">
                            <div class="text-caption text-grey-7">Payment Method</div>
                            <div class="text-body2">
                              {{ tenant.lease_info?.payment_method || 'N/A' }}
                            </div>
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
                            <div class="text-body2">
                              {{ tenant.emergency_contact?.name || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="text-caption text-grey-7">Relationship</div>
                            <div class="text-body2">
                              {{ tenant.emergency_contact?.relationship || 'N/A' }}
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="text-caption text-grey-7">Phone Number</div>
                            <div class="text-body2">
                              {{ tenant.emergency_contact?.phone || 'N/A' }}
                            </div>
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
                              <q-item-label
                                >{{ vehicle.make }} {{ vehicle.model }} ({{
                                  vehicle.year
                                }})</q-item-label
                              >
                              <q-item-label caption
                                >{{ vehicle.color }} • License:
                                {{ vehicle.license_plate }}</q-item-label
                              >
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
                              <q-item-label caption
                                >{{ pet.breed }} • {{ pet.weight }} lbs • {{ pet.age }} years
                                old</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>

                      <!-- Co-Applicants / Additional Occupants -->
                      <q-separator v-if="tenant.co_applicants && tenant.co_applicants.length > 0" />
                      <q-card-section
                        v-if="tenant.co_applicants && tenant.co_applicants.length > 0"
                      >
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
                              <q-item-label
                                >{{ occupant.first_name }} {{ occupant.last_name }}</q-item-label
                              >
                              <q-item-label caption>
                                <div class="row q-gutter-sm">
                                  <span
                                    ><q-icon name="email" size="xs" />
                                    {{ occupant.email || 'N/A' }}</span
                                  >
                                  <span
                                    ><q-icon name="phone" size="xs" />
                                    {{ occupant.phone || 'N/A' }}</span
                                  >
                                </div>
                              </q-item-label>
                              <q-item-label caption
                                >Relationship: {{ occupant.relationship || 'N/A' }}</q-item-label
                              >
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
                              <q-icon
                                :name="getDocumentIcon(doc.fileName)"
                                color="primary"
                                size="md"
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ doc.fileName || doc.originalName }}</q-item-label>
                              <q-item-label caption>{{
                                doc.documentType || 'Document'
                              }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn
                                flat
                                dense
                                round
                                icon="download"
                                color="primary"
                                @click.stop="window.open(doc.url, '_blank')"
                              >
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
                            Status:
                            <span
                              :class="tenant.status === 'active' ? 'text-positive' : 'text-grey'"
                              >{{ tenant.status || 'Active' }}</span
                            >
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
      </div>
    </DetailShell>

    <!-- Documents Dialog -->
    <q-dialog v-model="showDocumentsDialog" maximized>
      <LeaseDocuments
        v-if="selectedLease"
        :lease-id="getLeaseDocId(selectedLease)"
        :property-id="getLeasePropertyId(selectedLease)"
        :read-only="!canManageRecords"
        @close="closeDocumentsDialog"
      />
    </q-dialog>

    <!-- Create Lease Dialog -->
    <q-dialog
      v-model="showCreateLeaseDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <div class="create-lease-dialog-scroll">
          <CreateLease @lease-created="onLeaseCreated" @cancel="closeCreateLeaseDialog" />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from 'src/stores/userDataStore'
import CreateLease from '../components/CreateLease.vue'
import LeaseLifecyclePanel from '../components/LeaseLifecyclePanel.vue'
import DetailShell from '../components/details/DetailShell.vue'
import LeaseDocuments from '../components/LeaseDocuments.vue'
import DepositWorkspace from '../components/deposits/DepositWorkspace.vue'
import { canAccessDeposit } from '../utils/depositAccess'
import { Notify } from 'quasar'
import { listLeaseApplicationsForLeaseRequest } from '../services/leaseApplicationApi'
import { listPropertyTenantsRequest } from '../services/tenantApi'
import { updateLeaseRequest, updateLeaseStatusRequest } from '../services/leaseApi'

// Router
const router = useRouter()
const route = useRoute()

// Store
const userDataStore = useUserDataStore()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref(null) // null means show all
const selectedPropertyId = ref(null)
const showLeaseDialog = ref(false)
const selectedLease = ref(null)
const canViewDeposit = computed(() =>
  canAccessDeposit(
    (userDataStore.userAccessibleProperties || []).find(
      (p) => p.id === getLeasePropertyId(selectedLease.value),
    ),
    userDataStore.userId,
  ),
)
const isEditMode = ref(false)
const editLoading = ref(false)
const showCreateLeaseDialog = ref(false)
const leaseStatusOptions = ['Draft', 'Scheduled', 'Active', 'Expired', 'Terminated']
const leaseStatusFilterOptions = leaseStatusOptions.map((status) => ({
  label: status,
  value: status,
}))
const deepLinkHandled = ref(false)
const canManageRecords = computed(() => {
  const accountType = String(
    userDataStore.accountType || userDataStore.userCategory || '',
  ).toLowerCase()
  return ['pm', 'admin'].includes(accountType)
})

// Inventory dialog states

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
function tenantCardContact(tenant) {
  const field = (key) =>
    String(tenant?.personal_info?.[key] || '').trim() ||
    String(tenant?.applicant?.[key] || '').trim()
  return {
    name:
      [field('first_name'), field('last_name')].filter(Boolean).join(' ') ||
      'Tenant name not provided',
    email: field('email'),
  }
}

// Get leases the user has access to
const userAccessibleLeases = computed(() => userDataStore.userAccessibleLeases)

const leaseStatusFilterLabel = computed(() => statusFilter.value || 'All statuses')

const normalizePropertyId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value.id || value.property_id || '').trim()
  }
  return String(value).trim()
}

// Filter leases based on search query and status filter
const filteredLeases = computed(() => {
  let leases = userAccessibleLeases.value

  // Apply global property rail filter
  if (selectedPropertyId.value) {
    leases = leases.filter(
      (lease) => normalizePropertyId(lease.property_id) === selectedPropertyId.value,
    )
  }

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
const availableCount = computed(() => getStatusCount('Draft'))
const rentedCount = computed(() => getStatusCount('Active'))
const pendingCount = computed(() => getStatusCount('Scheduled'))
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
    Draft: 'grey',
    Active: 'positive',
    Scheduled: 'info',
    Expired: 'red',
    Terminated: 'purple',
  }
  return colors[status] || 'blue'
}

const normalizeLeaseStatus = (lease) =>
  String(lease?.status || '')
    .trim()
    .toLowerCase()
const isLeaseAvailable = (lease) => normalizeLeaseStatus(lease) === 'draft'
const isLeaseRented = (lease) => normalizeLeaseStatus(lease) === 'active'
async function onLifecycleUpdated(lease) {
  selectedLease.value = lease
  await userDataStore.loadLeases()
}
async function onLifecycleRenewed(lease) {
  selectedLease.value = lease
  await userDataStore.loadLeases()
}

// Fetch tenants for a lease
const fetchLeaseTenants = async (leaseId) => {
  if (!leaseId) return

  tenantsLoading.value = true
  tenantsError.value = null
  leaseTenants.value = []

  try {
    console.log('Fetching tenants for lease:', leaseId)

    const propertyId = getLeasePropertyId(selectedLease.value)
    if (!propertyId) throw new Error('The lease is not linked to a property.')
    const response = await listPropertyTenantsRequest({ propertyId })
    const tenants = (Array.isArray(response?.rows) ? response.rows : []).filter(
      (tenant) => String(tenant?.lease_id || '') === String(leaseId),
    )

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
  const rentedLeases = filteredLeases.value.filter((lease) => !lease.archived)

  for (const lease of rentedLeases) {
    try {
      const propertyId = getLeasePropertyId(lease)
      if (!propertyId) continue
      const response = await listPropertyTenantsRequest({ propertyId })
      const tenants = (Array.isArray(response?.rows) ? response.rows : []).filter(
        (tenant) => String(tenant?.lease_id || '') === String(lease.id),
      )

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

    const response = await listLeaseApplicationsForLeaseRequest({ leaseId })
    const applications = Array.isArray(response?.rows) ? response.rows : []
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
    const dateObj = date.toDate
      ? date.toDate()
      : new Date(
          typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00` : date,
        )
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

const toDateInputValue = (date) => {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getSelectedLeaseMoveInDateInput = () => {
  if (!selectedLease.value) return ''
  return toDateInputValue(
    selectedLease.value.start_date ||
      selectedLease.value.lease_start_date ||
      selectedLease.value.move_in_date,
  )
}

const setSelectedLeaseMoveInDate = (value) => {
  if (!selectedLease.value) return
  selectedLease.value.start_date = value || null
  selectedLease.value.lease_start_date = value || null
  selectedLease.value.move_in_date = value || null
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

  router.push(`application-detail/${applicationId}`) // Navigate to layout version (no leading slash)
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

const inviteTenantAccount = (lease) => {
  if (!lease?.id) {
    Notify.create({
      type: 'warning',
      message: 'Unable to generate invite link',
      position: 'top',
    })
    return
  }

  const inviteLink = `${window.location.origin}/public/tenant-signup/${lease.id}`
  navigator.clipboard
    .writeText(inviteLink)
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'Invite link copied to clipboard',
        caption: inviteLink,
        timeout: 3500,
        position: 'top',
      })
    })
    .catch((error) => {
      console.error('Failed to copy invite link:', error)
      Notify.create({
        type: 'info',
        message: 'Invite link generated',
        caption: inviteLink,
        timeout: 5000,
        position: 'top',
      })
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

const tryOpenDeepLinkedLease = async () => {
  if (deepLinkHandled.value) return
  const openType = String(route.query.openType || '').toLowerCase()
  const openId = String(route.query.openId || '')
  if (!openId || openType !== 'lease') return
  if (!userAccessibleLeases.value.length) return

  const normalizedOpenId = openId.toLowerCase()
  const targetLease = userAccessibleLeases.value.find((lease) => {
    const idCandidates = [lease.id, lease.lease_id, lease.LSID]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
    return idCandidates.includes(normalizedOpenId)
  })
  if (!targetLease) return

  deepLinkHandled.value = true
  await viewLease(targetLease)
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
    if (
      selectedLease.value.lease_end_date &&
      getSelectedLeaseMoveInDateInput() &&
      selectedLease.value.lease_end_date < getSelectedLeaseMoveInDateInput()
    ) {
      throw new Error('Lease end date cannot be before the start date.')
    }
    const canonicalStartDate =
      selectedLease.value.start_date ||
      selectedLease.value.lease_start_date ||
      selectedLease.value.move_in_date ||
      null
    if (canonicalStartDate) {
      selectedLease.value.start_date = canonicalStartDate
      selectedLease.value.lease_start_date = canonicalStartDate
      selectedLease.value.move_in_date = canonicalStartDate
    }

    await updateLeaseRequest({
      leaseId: selectedLease.value.id,
      changes: selectedLease.value,
    })

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

// Archive lease functions
const confirmArchiveLease = () => {
  if (!selectedLease.value) return

  Notify.create({
    type: 'warning',
    message: `Archive this lease? History is preserved. Archiving does not refund or settle the deposit; review its balance separately.`,
    actions: [
      {
        label: 'Cancel',
        color: 'white',
        handler: () => {
          // Do nothing
        },
      },
      {
        label: 'Archive',
        color: 'negative',
        handler: () => {
          archiveLease()
        },
      },
    ],
    timeout: 0,
    position: 'center',
  })
}

const archiveLease = async () => {
  if (!selectedLease.value) return

  try {
    // The API preserves the record and applies the archive timestamp atomically.
    await updateLeaseStatusRequest({
      leaseId: selectedLease.value.id,
      status: 'Archived',
      archived: true,
    })

    // Refresh the leases data
    await userDataStore.refreshLeases()

    Notify.create({
      type: 'positive',
      message: 'Lease archived successfully',
    })

    // Close the dialog
    await closeLeaseDialog()
  } catch (error) {
    console.error('Error archiving lease:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to archive lease',
    })
  }
}

// Inventory dialog functions
const openInventoryDialog = async (lease = selectedLease.value) => {
  const looksLikeDomEvent =
    lease &&
    typeof lease === 'object' &&
    ('target' in lease || 'currentTarget' in lease || 'preventDefault' in lease)
  const targetLease = looksLikeDomEvent ? selectedLease.value : lease || selectedLease.value
  if (targetLease) {
    const normalizedLeaseDocId = targetLease.inventory_source_lease_id || getLeaseDocId(targetLease)
    if (!normalizedLeaseDocId) {
      Notify.create({
        type: 'negative',
        message: 'Lease reference is missing for this inventory.',
        position: 'top',
      })
      return
    }

    try {
      await router.push(`/inventory/${encodeURIComponent(normalizedLeaseDocId)}`)
    } catch (error) {
      console.error('Error loading inventory:', error)
      Notify.create({
        type: 'negative',
        message: 'Failed to load inventory.',
        position: 'top',
      })
    }
  }
}

// Documents dialog functions
const openDocumentsDialog = (lease = selectedLease.value) => {
  const looksLikeDomEvent =
    lease &&
    typeof lease === 'object' &&
    ('target' in lease || 'currentTarget' in lease || 'preventDefault' in lease)
  const targetLease = looksLikeDomEvent ? selectedLease.value : lease || selectedLease.value
  if (!targetLease) return

  const normalizedLeaseDocId = getLeaseDocId(targetLease)
  if (!normalizedLeaseDocId) {
    Notify.create({
      type: 'warning',
      message: 'Lease reference is missing for documents.',
      position: 'top',
    })
    return
  }

  const normalizedLeaseLsid = normalizeLeaseRefId(
    targetLease.LSID ||
      targetLease.lease_lsid ||
      targetLease.lease_id ||
      targetLease.lsid ||
      normalizedLeaseDocId,
  )
  selectedLease.value = {
    ...(selectedLease.value || {}),
    ...targetLease,
    id: targetLease.id || normalizedLeaseDocId,
    lease_doc_id: targetLease.lease_doc_id || normalizedLeaseDocId,
    lease_id: targetLease.lease_id || normalizedLeaseLsid,
    lease_lsid: normalizedLeaseLsid,
    LSID: targetLease.LSID || normalizedLeaseLsid,
  }
  showDocumentsDialog.value = true
}

const closeDocumentsDialog = () => {
  showDocumentsDialog.value = false
}

// Create lease dialog functions
const openCreateLeaseDialog = () => {
  if (!canManageRecords.value) return
  showCreateLeaseDialog.value = true
}

const closeCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = false
}

const normalizeLeaseRefId = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') {
    const next = String(value).trim()
    if (!next || next.toLowerCase() === 'null' || next.toLowerCase() === 'undefined') return ''
    return next
  }
  if (typeof value === 'object') {
    return (
      normalizeLeaseRefId(value.id) ||
      normalizeLeaseRefId(value.property_id) ||
      normalizeLeaseRefId(value.property_string_id) ||
      normalizeLeaseRefId(value._id) ||
      ''
    )
  }
  return ''
}

const getLeasePropertyId = (lease) => {
  if (!lease || typeof lease !== 'object') return ''
  return normalizeLeaseRefId(
    lease.property_string_id ||
      lease.property_id?.id ||
      lease.property_id?.property_id ||
      lease.property_id ||
      lease.property?.id ||
      '',
  )
}

const getLeaseDocId = (lease) => {
  if (!lease || typeof lease !== 'object') return ''
  return normalizeLeaseRefId(
    lease.id ||
      lease.lease_doc_id ||
      lease.leaseId ||
      lease.lease_id ||
      lease.lease_lsid ||
      lease.lsid ||
      lease.LSID ||
      '',
  )
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
  await tryOpenDeepLinkedLease()
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
      await tryOpenDeepLinkedLease()
    }
  },
  { deep: true },
)

watch(
  () => [route.query.openType, route.query.openId],
  async () => {
    deepLinkHandled.value = false
    await tryOpenDeepLinkedLease()
  },
)

watch(
  () => route.query.propertyId,
  (propertyId) => {
    const value = String(propertyId || '').trim()
    selectedPropertyId.value = value || null
  },
  { immediate: true },
)
</script>

<style src="../css/tenant-details.scss" lang="scss"></style>
<style scoped>
.lease-footer-row {
  flex-wrap: wrap;
  gap: 8px;
}
.lease-inventory-entry {
  min-height: 44px;
  flex-shrink: 0;
  text-transform: none;
}
.summary-card {
  min-width: 0;
  transition: all 0.2s ease-in-out;
  border: 1px solid rgba(20, 28, 45, 0.08);
}

.lease-summary-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 6px;
}

.lease-summary-strip .summary-card {
  width: 100%;
}

.lease-summary-strip .summary-card :deep(.q-card__section) {
  padding: 8px 6px;
}

.lease-summary-strip .text-h6 {
  font-size: 1rem;
  line-height: 1.12;
}

.lease-summary-strip .text-caption {
  display: block;
  font-size: 0.66rem;
  line-height: 1.12;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clickable-card {
  cursor: pointer;
  border: 1px solid rgba(20, 28, 45, 0.08);
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.active-filter {
  border: 2px solid var(--q-primary) !important;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(36, 87, 115, 0.05) 0%, rgba(36, 87, 115, 0.1) 100%);
}

.active-filter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(36, 87, 115, 0.3);
}

.leases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.lease-card {
  min-height: 190px;
  transition: border-color 0.2s ease;
  border-radius: var(--border-radius-card);
  overflow: hidden;
  border: 1px solid rgba(20, 28, 45, 0.08) !important;
  background: #fff;
  box-shadow: none;
  cursor: pointer;
  width: 100%;
}

.lease-card:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--q-primary);
}

/* Compact Card Content */
.lease-card-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  height: 100%;
  padding: 0;
  position: relative;
}

/* Compact Header */
.lease-card-header-compact {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.lease-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.lease-avatar-compact {
  width: 38px;
  height: 38px;
  background: #f1f5f9;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.lease-avatar-compact :deep(.q-icon) {
  color: var(--primary-color) !important;
}

.lease-info-compact {
  flex: 1;
  min-width: 0;
}

.lease-name-compact {
  min-height: 40px;
  font-size: 15px;
  font-weight: 650;
  color: #0f172a;
  line-height: 1.32;
  margin-bottom: 4px;
  word-break: break-word;
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
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  min-width: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

/* Details Row */
.lease-details-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(20, 28, 45, 0.06);
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  text-align: left;
}

.lease-amount-compact {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1976d2;
  line-height: 1.15;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  white-space: nowrap;
}

.lease-label-compact {
  font-size: 11px;
  color: var(--neutral-600);
  font-weight: 500;
}

/* Footer Row */
.lease-footer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}
.lease-footer-context {
  min-width: 0;
  height: 44px;
}
.lease-card-actions {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  align-items: stretch;
  gap: 8px;
  width: 100%;
}
.lease-card-actions :deep(.q-btn) {
  min-height: 44px;
  margin: 0;
  transform: none !important;
}
.lease-card-actions :deep(.q-btn__content) {
  white-space: normal;
  text-align: center;
}

.lease-tenant-compact {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  align-content: center;
  height: 44px;
  gap: 2px 4px;
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
  grid-column: 2;
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
  min-height: 44px;
}

.lease-view-btn {
  font-size: 12px;
  padding: 4px 10px;
  min-height: 44px;
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
  background: var(--brand-surface, #fff);
  color: var(--brand-ink, #243830);
  border-bottom: 1px solid var(--brand-border, #e0e6df);
  padding: 16px 24px;
  position: relative;
}

.create-fullscreen-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  position: relative;
}

.create-fullscreen-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.create-lease-dialog-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0;
  padding-bottom: calc(72px + constant(safe-area-inset-bottom));
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  scroll-padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.dialog-header-layout {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.header-identity {
  min-width: 0;
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
  overflow-wrap: anywhere;
  font-family: 'Avenir Next', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.title-address {
  overflow-wrap: anywhere;
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

.lease-detail-shell :deep(.detail-shell-header) {
  flex-wrap: nowrap;
  align-items: center;
}

.lease-detail-shell :deep(.detail-shell-title-wrap) {
  flex: 0 1 220px;
  min-width: 80px;
  max-width: 30%;
  overflow-wrap: anywhere;
}

.lease-detail-shell :deep(.detail-shell-actions) {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  flex-wrap: nowrap;
}

.lease-detail-shell :deep(.detail-shell-actions > .q-btn) {
  flex: 0 0 44px;
}

.lease-shell-actions {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px;
  overscroll-behavior-x: contain;
}

.lease-shell-actions :deep(.q-btn) {
  flex: 0 0 auto;
  width: auto !important;
  height: auto !important;
  min-height: 44px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: none;
  box-shadow: none;
}

.lease-shell-actions :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
  gap: 6px;
}

.lease-shell-actions :deep(.q-btn__content .block) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.lease-shell-actions .save-btn {
  background: var(--brand-primary, #254b39) !important;
  color: #fff !important;
}

.lease-shell-actions .cancel-btn {
  background: var(--brand-surface, #fff) !important;
  color: var(--brand-primary, #254b39) !important;
}

.header-action-btn {
  border-radius: var(--border-radius-btn);
  border: 1px solid rgba(36, 87, 115, 0.22);
  font-weight: 600;
  min-height: 44px;
  max-width: 100%;
  text-transform: none;
  color: var(--brand-primary, #254b39) !important;
  box-shadow: none;
  opacity: 1 !important;
  filter: none !important;
}

.header-action-btn:hover {
  transform: none;
  box-shadow: none;
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
  position: static;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.header-share-fixed {
  min-height: 44px;
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
  opacity: 0;
}

.lease-detail-card {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: var(--brand-ink, #243830);
  background: transparent;
  overflow: visible;
}

.lease-detail-card .dialog-content {
  padding: 20px 0 0;
  flex: none;
  overflow: visible;
}

.lease-detail-card .details-section {
  padding: 24px;
  border-radius: 12px;
}

.lease-detail-card :deep(.q-btn) {
  min-height: 44px;
  font-size: 14px;
  line-height: 1.4;
  text-transform: none;
}

.lease-detail-card :deep(.q-btn__content) {
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: center;
}

.lease-detail-card .dialog-header {
  flex-shrink: 0;
  background: var(--brand-surface, #fff) !important;
  color: var(--brand-ink, #243830) !important;
  border-bottom: 1px solid var(--brand-border, #e0e6df) !important;
}
.lease-detail-card .dialog-header :deep(.header-action-btn.q-btn) {
  width: auto !important;
  height: auto !important;
  padding: 8px 12px;
  border: 1px solid var(--brand-border, #e0e6df) !important;
  background: var(--brand-surface, #fff) !important;
  color: var(--brand-primary, #254b39) !important;
}
.lease-detail-card .dialog-header :deep(.status-chip-dropdown.q-btn),
.lease-detail-card .dialog-header :deep(.save-btn.q-btn) {
  background: var(--brand-primary, #254b39) !important;
  color: #fff !important;
  border: 1px solid var(--brand-primary, #254b39) !important;
}
.lease-detail-card .dialog-header :deep(.cancel-btn.q-btn) {
  background: var(--brand-surface, #fff) !important;
  color: var(--brand-primary, #254b39) !important;
  border: 1px solid var(--brand-border, #e0e6df) !important;
}
.lease-detail-card .dialog-header :deep(.header-action-btn .q-icon) {
  color: inherit !important;
}
.lease-detail-card .dialog-header :deep(.header-action-btn.text-negative) {
  color: var(--q-negative) !important;
}
.lease-detail-card .dialog-header :deep(.q-btn:focus-visible) {
  outline: 2px solid var(--brand-primary, #254b39);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .lease-detail-card .dialog-header,
  .lease-detail-card .dialog-content {
    padding: 16px 0;
  }
  .lease-detail-card .details-section {
    padding: 20px 16px;
  }
  .lease-detail-card .dialog-content {
    flex: none;
    overflow: visible;
  }
}

.dialog-content {
  padding: 24px;
  flex: 1;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
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
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 16px;
}

.detail-item {
  min-width: 0;
  overflow-wrap: anywhere;
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
  transform: none;
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
  border-radius: var(--border-radius-sm);
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
