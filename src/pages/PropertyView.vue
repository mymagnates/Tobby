<template>
  <q-page class="q-pa-md" style="padding-right: 5px">
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Loading your properties...</div>
    </div>

    <div v-else-if="userProperties.length === 0" class="text-center q-pa-lg">
      <q-icon name="home" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">No properties found</div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          userDataStore.userRoles.length === 0
            ? "You don't have any roles assigned to properties yet."
            : "You don't have access to any properties yet."
        }}
      </div>
      <div class="q-mt-md">
        <q-btn
          v-if="canManageRecords"
          color="primary"
          text-color="white"
          unelevated
          label="Create Your First Property"
          class="q-mr-sm"
          @click="openCreatePropertyDialog"
        />
        <q-btn to="/user-profile" color="secondary" label="Assign Roles to Properties" flat />
      </div>
    </div>

    <div v-else>
      <div class="row justify-end q-mb-md">
        <q-btn
          v-if="canManageRecords"
          color="primary"
          text-color="white"
          unelevated
          icon="add"
          label="Create Property"
          @click="openCreatePropertyDialog"
        />
      </div>

      <div class="property-view-container">
        <!-- Left Sidebar - Property Selection -->
        <div class="property-sidebar">


        <PropertySidebarPicker
          class="property-list-card"
          :model-value="selectedPropertyId"
          :properties="userProperties"
          :include-all="false"
          @update:model-value="handleSidebarPropertySelect"
        />

        <q-card v-if="getCurrentLease()" class="lease-status-card q-mt-sm">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">
              <q-icon name="home_work" class="q-mr-sm" />
              Current Lease Status
            </div>

            <div class="lease-info">
              <div class="lease-item">
                <div class="lease-label">Tenant</div>
                <div class="lease-value">{{ getLeaseDisplayTenantName(getCurrentLease()) }}</div>
              </div>
              <div class="lease-item">
                <div class="lease-label">Rent Amount</div>
                <div class="lease-value">
                  ${{ getCurrentLease().rate_amount || 'N/A' }}/{{
                    getCurrentLease().rate_type || 'month'
                  }}
                </div>
              </div>
              <div class="lease-item">
                <div class="lease-label">Lease Start</div>
                <div class="lease-value">
                  {{ formatDate(getCurrentLease().lease_start_date || getCurrentLease().start_date || getCurrentLease().move_in_date) }}
                </div>
              </div>
              <div class="lease-item">
                <div class="lease-label">Lease End</div>
                <div class="lease-value">{{ formatDate(getCurrentLease().lease_end_date || getCurrentLease().end_date) }}</div>
              </div>
              <div class="lease-item">
                <div class="lease-label">Status</div>
                <div class="lease-value">
                  <q-chip
                    :color="getLeaseStatusColor(getCurrentLease().status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getCurrentLease().status }}
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

      </div>

      <!-- Right Content - Property Details -->
      <div class="property-content" style="padding-right: 5px">
        <div v-if="!selectedProperty" class="text-center q-pa-lg">
          <q-icon name="home" size="100px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">Select a Property</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Choose a property from the list to view detailed information
          </div>
        </div>

        <div v-else class="property-details-grid">
          <!-- Property Image Card -->
          <q-card class="property-image-card" clickable @click="viewProperty(selectedProperty.id)">
            <q-img
              :src="getPropertyPreviewImageUrl(selectedProperty)"
              :alt="selectedProperty.nickname"
              class="property-main-image"
              fit="contain"
            >
            </q-img>
          </q-card>

          <!-- Current Lease (moved to left sidebar) -->



          <!-- Basic Information Card -->
          <q-card class="property-info-card" clickable @click="viewProperty(selectedProperty.id)">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" />
                Basic Information
              </div>
              <div class="row justify-end q-mb-md">
                <q-btn
                  v-if="canInviteOwner(selectedProperty)"
                  color="primary"
                  text-color="white"
                  unelevated
                  label="Invite Owner / Co-Owner To This Property"
                  @click.stop="promptOwnerInvite(selectedProperty)"
                />
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Property Name</div>
                  <div class="info-value">{{ selectedProperty.nickname || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Address</div>
                  <div class="info-value">{{ selectedProperty.address || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Type</div>
                  <div class="info-value">{{ selectedProperty.type || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">
                    <q-chip
                      :color="getStatusColor(selectedProperty.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ selectedProperty.status }}
                    </q-chip>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Bedrooms</div>
                  <div class="info-value">{{ selectedProperty.spec?.bedroom || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Bathrooms</div>
                  <div class="info-value">{{ selectedProperty.spec?.full_bathroom || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Size</div>
                  <div class="info-value">
                    {{
                      selectedProperty.spec?.size ? `${selectedProperty.spec?.size} sq ft` : 'N/A'
                    }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Your Role</div>
                  <div class="info-value">
                    <q-chip
                      :color="getRoleColor(selectedProperty.userRole)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getRoleLabel(selectedProperty.userRole) }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

        <q-card class="property-services-card">
          <q-expansion-item
            icon="handyman"
            label="Services"
            :caption="`${displayedPropertyServices.length} services`"
            default-opened
            header-class="text-subtitle1"
            expand-separator
          >
            <q-card-section>
                <div class="row items-center justify-end q-mb-sm">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    icon="open_in_new"
                    @click="router.push({ path: '/property-services', query: { propertyId: selectedProperty?.id } })"
                  >
                    <q-tooltip>Manage services</q-tooltip>
                  </q-btn>
                </div>
                <div v-if="displayedPropertyServices.length > 0" class="services-list">
                  <q-list separator dense>
                    <q-item
                      v-for="service in displayedPropertyServices"
                      :key="service.id || `${service.service_type}-${service.company_name}`"
                      clickable
                      class="service-list-item"
                      @click="router.push({ path: '/property-services', query: { propertyId: selectedProperty?.id } })"
                    >
                      <q-item-section avatar>
                        <q-icon name="handyman" color="primary" size="18px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ formatServiceType(service.service_type) }}</q-item-label>
                        <q-item-label caption>
                          {{ service.company_name || 'Unknown Company' }}
                          <span v-if="service.agent?.name"> · {{ service.agent.name }}</span>
                          <span v-if="service.service_start_date"> · {{ formatDate(service.service_start_date) }}</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div v-else class="no-services">
                  <q-icon name="handyman" size="32px" color="grey-4" />
                  <div class="text-grey-6 q-mt-sm">No services linked to this property</div>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-card>

          <q-card class="property-documents-card">
            <q-expansion-item
              icon="folder"
              label="Property Documents"
              :caption="`${syncedPropertyDocuments.length} files`"
              default-opened
              header-class="text-subtitle1"
              expand-separator
            >
              <q-card-section>
                <div class="row items-center justify-end q-mb-sm">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    icon="open_in_new"
                    @click="router.push('/documents')"
                  >
                    <q-tooltip>View all documents</q-tooltip>
                  </q-btn>
                </div>

                <div v-if="loadingPhotos || loadingDocuments" class="documents-loading">
                  <q-spinner-dots size="24px" color="primary" />
                  <div class="text-caption text-grey-6 q-mt-sm">Loading documents...</div>
                </div>

                <div v-else-if="syncedPropertyDocuments.length > 0" class="documents-list">
                  <q-list separator dense>
                    <q-item
                      v-for="doc in syncedPropertyDocuments"
                      :key="doc.id"
                      clickable
                      class="document-list-item"
                      @click="viewDocument(doc)"
                    >
                      <q-item-section avatar>
                        <q-icon :name="getFileIcon(doc)" :color="getFileIconColor(doc)" size="18px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ getDocumentDisplayName(doc) }}</q-item-label>
                        <q-item-label caption>
                          {{ getFileExtension(doc) }} · {{ formatDate(getDocumentDate(doc)) }}
                          <span v-if="doc.uploaded_by_role">
                            · {{ getRoleLabel(doc.uploaded_by_role) }}
                          </span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div v-else class="no-documents">
                  <q-icon name="folder_open" size="32px" color="grey-4" />
                  <div class="text-grey-6 q-mt-sm">No documents uploaded</div>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-card>

          <q-card class="property-assets-card">
            <q-expansion-item
              icon="inventory_2"
              label="Asset List"
              :caption="`${propertyAssets.length} items`"
              default-opened
              header-class="text-subtitle1"
              expand-separator
            >
              <q-card-section>
                <div class="row items-center justify-end q-mb-sm">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    icon="open_in_new"
                    @click="router.push('/assets')"
                  >
                    <q-tooltip>View all assets</q-tooltip>
                  </q-btn>
                </div>

                <div v-if="loadingAssets" class="assets-loading">
                  <q-spinner-dots size="24px" color="primary" />
                  <div class="text-caption text-grey-6 q-mt-sm">Loading assets...</div>
                </div>

                <div v-else-if="propertyAssets.length === 0" class="no-assets">
                  <q-icon name="inventory_2" size="28px" color="grey-4" />
                  <div class="text-grey-6 q-mt-sm">No assets for this property</div>
                </div>

                <q-list v-else dense separator class="asset-list">
                  <q-item
                    v-for="asset in displayedPropertyAssets"
                    :key="asset.id"
                    clickable
                    @click="router.push('/assets')"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ getAssetDisplayName(asset) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ getAssetSubtitle(asset) }} · Updated {{ formatDate(asset.updated_at) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip
                        size="sm"
                        :color="String(asset.status || '').toLowerCase() === 'archived' ? 'grey-6' : 'positive'"
                        text-color="white"
                      >
                        {{
                          String(asset.status || '').toLowerCase() === 'archived'
                            ? 'Archived'
                            : 'Active'
                        }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-expansion-item>
          </q-card>

          <!-- Tasks Summary Card -->
          <q-card v-if="false" class="tasks-summary-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="task_alt" class="q-mr-sm" />
                Tasks Summary
              </div>

              <div class="tasks-grid">
                <div class="task-item">
                  <div class="task-count">{{ getOpenMxRecordsCount() }}</div>
                  <div class="task-label">Open Tasks</div>
                </div>
                <div class="task-item">
                  <div class="task-count">{{ getPendingTransactionsCount() }}</div>
                  <div class="task-label">Pending Transactions</div>
                </div>
                <div class="task-item">
                  <div class="task-count">{{ getActiveLeasesCount() }}</div>
                  <div class="task-label">Active Leases</div>
                </div>
                <div class="task-item">
                  <div class="task-count">{{ getUpcomingRenewalsCount() }}</div>
                  <div class="task-label">Upcoming Renewals</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Transaction Summary Card -->
          <q-card v-if="false" class="transaction-summary-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="account_balance" class="q-mr-sm" />
                Financial Summary
              </div>

              <div class="financial-grid">
                <div class="financial-item income">
                  <div class="financial-label">Total Income</div>
                  <div class="financial-value">${{ getTotalIncome() }}</div>
                </div>
                <div class="financial-item expense">
                  <div class="financial-label">Total Expenses</div>
                  <div class="financial-value">${{ getTotalExpenses() }}</div>
                </div>
                <div class="financial-item monthly-income">
                  <div class="financial-label">Monthly Income</div>
                  <div class="financial-value">${{ getMonthlyIncome() }}</div>
                </div>
                <div class="financial-item monthly-expense">
                  <div class="financial-label">Monthly Expense</div>
                  <div class="financial-value">${{ getMonthlyExpense() }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Rent Tracking Card -->
          <q-card v-if="false" class="rent-tracking-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="payments" class="q-mr-sm" />
                Rent Tracking
                <span class="text-caption text-grey-6 q-ml-sm">{{ getCurrentMonthYear() }}</span>
              </div>

              <!-- Rent Summary -->
              <div class="rent-summary q-mb-md">
                <div class="rent-summary-item">
                  <div class="rent-summary-label">Expected</div>
                  <div class="rent-summary-value">${{ getExpectedRent() }}</div>
                </div>
                <div class="rent-summary-item collected">
                  <div class="rent-summary-label">Collected</div>
                  <div class="rent-summary-value">${{ getCollectedRent() }}</div>
                </div>
                <div class="rent-summary-item" :class="getRentBalanceClass()">
                  <div class="rent-summary-label">Balance</div>
                  <div class="rent-summary-value">${{ getRentBalance() }}</div>
                </div>
              </div>

              <!-- Rent Status by Lease -->
              <div v-if="getPropertyLeases().length > 0" class="rent-status-list">
                <div class="text-subtitle2 text-grey-7 q-mb-sm">Payment Status by Tenant</div>
                <div
                  v-for="lease in getPropertyLeases()"
                  :key="lease.id"
                  class="rent-status-item"
                >
                  <div class="rent-tenant-info">
                    <q-avatar size="32px" color="primary" text-color="white">
                      {{ getTenantInitials(lease.tenant_name) }}
                    </q-avatar>
                    <div class="rent-tenant-details">
                      <div class="rent-tenant-name">{{ lease.tenant_name || 'Unknown Tenant' }}</div>
                      <div class="rent-tenant-amount">${{ lease.rate_amount || 0 }}/month</div>
                    </div>
                  </div>
                  <div class="rent-payment-status">
                    <q-chip
                      :color="getRentStatusColor(getLeaseRentStatus(lease))"
                      text-color="white"
                      size="sm"
                      :icon="getRentStatusIcon(getLeaseRentStatus(lease))"
                    >
                      {{ getLeaseRentStatus(lease).label }}
                    </q-chip>
                    <div class="rent-paid-amount" v-if="getLeaseRentStatus(lease).paid > 0">
                      ${{ getLeaseRentStatus(lease).paid }} paid
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Leases State -->
              <div v-else class="no-rent-data">
                <q-icon name="payments" size="40px" color="grey-4" />
                <div class="text-grey-6 q-mt-sm">No active leases</div>
                <div class="text-caption text-grey-5">Add a lease to track rent payments</div>
              </div>

              <!-- Recent Rent Payments -->
              <div v-if="getRecentRentPayments().length > 0" class="recent-rent-payments q-mt-md">
                <div class="text-subtitle2 text-grey-7 q-mb-sm">Recent Rent Payments</div>
                <q-list dense class="rent-payments-list">
                  <q-item
                    v-for="payment in getRecentRentPayments()"
                    :key="payment.id"
                    class="rent-payment-item"
                  >
                    <q-item-section avatar>
                      <q-icon name="check_circle" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ payment.description || 'Rent Payment' }}</q-item-label>
                      <q-item-label caption>{{ formatDate(payment.transaction_date) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-positive text-weight-bold">
                        +${{ payment.amount }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card-section>
          </q-card>

        </div>
        </div>
      </div>
    </div>

    <!-- Property Detail Dialog (kept from original) -->
    <q-dialog v-model="showPropertySelectorDialog">
      <q-card class="property-selector-dialog">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Select Property</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="property-selector-grid">
            <q-btn
              v-for="property in userProperties"
              :key="property.id"
              outline
              no-caps
              class="property-selector-btn"
              :class="{ 'property-selector-btn--active': selectedProperty?.id === property.id }"
              :color="selectedProperty?.id === property.id ? 'primary' : 'grey-8'"
              @click="selectPropertyFromDialog(property)"
            >
              <div class="property-selector-btn__title">
                {{ property.nickname || 'Unnamed Property' }}
              </div>
              <div class="property-selector-btn__sub">{{ property.address || property.id }}</div>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showPropertyDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card property-detail-dialog-card">
        <div v-if="selectedProperty" class="property-detail-frame">
          <q-card-section class="q-pa-md composer-head property-detail-header">
            <q-btn
              flat
              round
              dense
              icon="close"
              class="property-detail-close"
              @click="closePropertyDialog"
            />
            <div class="row items-start justify-between q-col-gutter-sm">
              <div class="col">
                <div class="text-h6 text-weight-bold text-primary q-mb-sm">
                  <q-icon name="home" class="q-mr-sm" />
                  {{ isEditMode ? 'Edit Property' : 'Property Details' }}
                </div>
                <div class="text-caption text-grey-7 q-mb-sm">
                  Review or update the core property profile without losing the current property context.
                </div>
                <div class="text-caption text-grey-6">
                  {{ selectedProperty.nickname || 'Unnamed Property' }} ·
                  {{ selectedProperty.address || 'No address on file' }}
                </div>
              </div>
              <div class="col-auto row items-center q-gutter-sm property-detail-actions">
                <q-btn
                  v-if="isEditMode"
                  unelevated
                  color="primary"
                  text-color="white"
                  label="Cancel"
                  class="top-action-btn"
                  @click="cancelEdit"
                />
                <q-btn
                  v-if="isEditMode"
                  unelevated
                  color="primary"
                  text-color="white"
                  label="Save"
                  class="top-action-btn"
                  :loading="editLoading"
                  @click="saveProperty"
                />
                <q-btn
                  v-else-if="canManageRecords"
                  unelevated
                  color="primary"
                  text-color="white"
                  label="Edit"
                  class="top-action-btn"
                  @click="toggleEditMode"
                />
                <q-btn
                  v-else
                  unelevated
                  color="primary"
                  text-color="white"
                  label="Close"
                  class="top-action-btn"
                  @click="closePropertyDialog"
                />
              </div>
            </div>
          </q-card-section>

          <div class="property-detail-content-scroll">
            <div class="property-detail-shell">
              <div class="property-detail-body">
                <div class="section-label q-mb-xs">Property Snapshot</div>
                <div class="property-detail-image-panel q-mb-md">
                  <q-img
                    :src="selectedProperty.image_url || '/placeholder-property.jpg'"
                    :alt="selectedProperty.nickname"
                    class="property-detail-img"
                    fit="contain"
                  />
                  <div class="row items-center justify-between q-gutter-sm q-mt-sm">
                    <div class="text-caption text-grey-6">
                      Snapshot is the primary property image shown across the app.
                    </div>
                    <div v-if="canManageRecords && isEditMode" class="row items-center q-gutter-sm">
                      <q-file
                        v-model="snapshotUploadFile"
                        accept="image/*"
                        outlined
                        dense
                        label="Replace Snapshot"
                        bg-color="grey-1"
                        style="min-width: 220px"
                        :disable="snapshotUploading"
                        :loading="snapshotUploading"
                        @update:model-value="onSnapshotSelected"
                      >
                        <template v-slot:prepend>
                          <q-icon name="photo_camera" color="primary" />
                        </template>
                      </q-file>
                      <q-btn
                        flat
                        color="primary"
                        icon="folder_open"
                        label="Manage All"
                        :disable="snapshotUploading"
                        @click="openPhotoManagementDialog"
                      />
                    </div>
                  </div>
                </div>

                <div class="section-label q-mb-xs">Basic Information</div>
                <div class="row q-col-gutter-sm q-row-gutter-sm q-mb-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-if="isEditMode"
                      v-model="selectedProperty.nickname"
                      label="Property Name"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Property Name</div>
                      <div class="detail-display-value">{{ selectedProperty.nickname || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-if="isEditMode"
                      v-model="selectedProperty.status"
                      :options="propertyStatusOptions"
                      label="Status"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Status</div>
                      <div class="detail-display-value">
                        <q-chip
                          :color="getStatusColor(selectedProperty.status)"
                          text-color="white"
                          size="sm"
                        >
                          {{ selectedProperty.status || 'N/A' }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <q-input
                      v-if="isEditMode"
                      v-model="selectedProperty.address"
                      label="Address"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Address</div>
                      <div class="detail-display-value">{{ selectedProperty.address || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model="selectedProperty.city"
                      label="City"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">City</div>
                      <div class="detail-display-value">{{ selectedProperty.city || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model="selectedProperty.state"
                      label="State"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">State</div>
                      <div class="detail-display-value">{{ selectedProperty.state || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model="selectedProperty.zip"
                      label="ZIP"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">ZIP</div>
                      <div class="detail-display-value">
                        {{ selectedProperty.zip || selectedProperty.zip_code || 'N/A' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-if="isEditMode"
                      v-model="selectedProperty.type"
                      :options="propertyTypeOptions"
                      label="Property Type"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Property Type</div>
                      <div class="detail-display-value">{{ selectedProperty.type || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="detail-display-card">
                      <div class="detail-display-label">Your Role</div>
                      <div class="detail-display-value">
                        <q-chip
                          :color="getRoleColor(selectedProperty.userRole)"
                          text-color="white"
                          size="sm"
                        >
                          {{ getRoleLabel(selectedProperty.userRole) }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section-label q-mb-xs">Property Specifications</div>
                <div class="row q-col-gutter-sm q-row-gutter-sm property-detail-bottom-space">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model.number="selectedProperty.spec.bedroom"
                      type="number"
                      label="Bedrooms"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Bedrooms</div>
                      <div class="detail-display-value">{{ selectedProperty.spec?.bedroom || 'N/A' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model.number="selectedProperty.spec.full_bathroom"
                      type="number"
                      label="Bathrooms"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Bathrooms</div>
                      <div class="detail-display-value">
                        {{ selectedProperty.spec?.full_bathroom || 'N/A' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-if="isEditMode"
                      v-model.number="selectedProperty.spec.size"
                      type="number"
                      label="Size"
                      suffix="sq ft"
                      outlined
                      dense
                      bg-color="grey-1"
                    />
                    <div v-else class="detail-display-card">
                      <div class="detail-display-label">Size</div>
                      <div class="detail-display-value">
                        {{
                          selectedProperty.spec?.size
                            ? `${selectedProperty.spec?.size} sq ft`
                            : 'N/A'
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Create Task Dialog -->
    <q-dialog v-model="showCreateMxRecordDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Task</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateMxRecordDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateMxRecord
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname"
            @mxrecord-created="onMxRecordCreated"
            @cancel="closeCreateMxRecordDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Transaction Dialog -->
    <q-dialog v-model="showCreateTransactionDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Transaction</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateTransactionDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateTransaction
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname"
            @transaction-created="onTransactionCreated"
            @cancel="closeCreateTransactionDialog"
          />
        </q-card-section>
      </q-card>
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
        <q-btn
          flat
          round
          dense
          icon="close"
          class="create-fullscreen-close"
          @click="closeCreateLeaseDialog"
        />
        <div class="create-lease-dialog-scroll">
          <CreateLease
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname"
            @lease-created="onLeaseCreated"
            @cancel="closeCreateLeaseDialog"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Create Asset Dialog -->
    <q-dialog v-model="showCreateAssetDialog" persistent>
      <q-card style="min-width: 700px; max-width: 980px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Add Asset</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateAssetDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateAsset
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname || selectedProperty?.address"
            @asset-created="onAssetCreated"
            @cancel="closeCreateAssetDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Document Management Dialog -->
    <q-dialog v-model="showPhotoManagementDialog" maximized>
      <q-card class="photo-management-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">
              <q-icon name="folder" class="q-mr-sm" />
              Manage Property Documents
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closePhotoManagementDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>

        <q-card-section class="photo-management-content">
          <div v-if="selectedProperty" class="photo-management-container">
            <!-- Upload Section -->
            <div v-if="canManageRecords" class="upload-section q-mb-lg">
              <div class="section-header">
                <div class="text-h6 text-weight-medium">Upload New Documents</div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Upload documents for {{ selectedProperty.nickname || selectedProperty.address }}
                  <br />
                  <span class="text-primary">Supported: Images, PDFs, Documents, Spreadsheets, and more</span>
                </div>
              </div>

              <q-form @submit="uploadPhotos" class="upload-form">
                <div class="upload-fields">
                  <!-- File Upload -->
                  <div class="upload-field">
                    <q-file
                      v-model="uploadFiles"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.mp4,.mov,.mp3,.ppt,.pptx"
                      outlined
                      dense
                      label="Choose files *"
                      multiple
                      bg-color="grey-1"
                      :rules="[(val) => !!val || 'At least one file is required']"
                      @update:model-value="onPhotosSelected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>
                  </div>
                </div>

                <!-- Upload Button -->
                <div class="upload-actions">
                  <q-btn
                    type="submit"
                    color="primary"
                    icon="cloud_upload"
                    label="Upload Documents"
                    :loading="uploading"
                    :disable="!uploadFiles || uploadFiles.length === 0"
                  />
                </div>
              </q-form>
            </div>

            <!-- Current Documents Section -->
            <div class="photos-section">
              <div class="section-header">
                <div class="row items-center justify-between">
                  <div class="text-h6 text-weight-medium">
                    Current Documents ({{ propertyPhotos.length }})
                  </div>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loadingPhotos" class="loading-photos q-mt-md">
                <div class="text-center q-pa-md">
                  <q-spinner-dots size="40px" color="primary" />
                  <div class="text-body2 text-grey-6 q-mt-sm">Loading photos...</div>
                </div>
              </div>

              <!-- Documents Grid -->
              <div v-else-if="propertyPhotos.length > 0" class="photos-grid q-mt-md">
                <div v-for="doc in propertyPhotos" :key="doc.id" class="photo-card">
                  <!-- Document Preview -->
                  <div class="photo-container">
                    <!-- Image preview for image files -->
                    <q-img
                      v-if="isImageFile(doc)"
                      :src="doc.image_url"
                      :alt="doc.description || 'Property document'"
                      class="photo-image"
                      fit="cover"
                      @click="viewDocument(doc)"
                    >
                      <template v-slot:loading>
                        <q-spinner-gears color="primary" />
                      </template>
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-negative text-white">
                          <q-icon name="broken_image" size="24px" />
                        </div>
                      </template>
                    </q-img>
                    <!-- File icon for non-image files -->
                    <div v-else class="file-preview" @click="viewDocument(doc)">
                      <q-icon :name="getFileIcon(doc)" :color="getFileIconColor(doc)" size="64px" />
                      <div class="file-type-badge">{{ getFileExtension(doc) }}</div>
                    </div>

                    <!-- Document Overlay -->
                    <div class="photo-overlay">
                      <div class="photo-actions">
                        <q-btn
                          flat
                          round
                          :icon="isImageFile(doc) ? 'zoom_in' : 'open_in_new'"
                          color="white"
                          size="sm"
                          @click.stop="viewDocument(doc)"
                        >
                          <q-tooltip>{{ isImageFile(doc) ? 'View fullscreen' : 'Open file' }}</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          icon="download"
                          color="white"
                          size="sm"
                          @click.stop="downloadDocument(doc)"
                        >
                          <q-tooltip>Download</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="canManageRecords"
                          flat
                          round
                          icon="delete"
                          color="negative"
                          size="sm"
                          @click.stop="confirmDeletePhoto(doc)"
                        >
                          <q-tooltip>Delete</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <!-- Set as Main Photo Button (only for images) -->
                    <div v-if="isImageFile(doc)" class="photo-main-action">
                      <q-btn
                        v-if="canManageRecords && selectedProperty.image_url !== doc.image_url"
                        flat
                        dense
                        color="primary"
                        size="sm"
                        icon="star_border"
                        label="Set as Main"
                        @click="setAsMainPhoto(doc)"
                      />
                      <q-chip
                        v-else-if="selectedProperty.image_url === doc.image_url"
                        color="primary"
                        text-color="white"
                        size="sm"
                        icon="star"
                        label="Main Photo"
                      />
                    </div>
                  </div>

                  <!-- Document Info -->
                  <div class="photo-info">
                    <div class="photo-description">
                      {{ doc.description || doc.original_filename || 'No description' }}
                    </div>
                    <div class="photo-meta">
                      <div class="meta-item">
                        <q-chip size="xs" :color="getFileIconColor(doc)" text-color="white" dense>
                          {{ getFileExtension(doc) }}
                        </q-chip>
                      </div>
                      <div class="meta-item">
                        <q-icon name="event" size="14px" class="q-mr-xs" />
                        {{ formatDate(doc.upload_date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-photos">
                <q-icon name="photo_library" size="48px" color="grey-4" />
                <div class="text-body2 text-grey-6 q-mt-sm">No photos uploaded yet</div>
                <div class="text-caption text-grey-5">Upload photos to showcase this property</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Photo Fullscreen Dialog -->
    <q-dialog v-model="showPhotoFullscreenDialog" maximized>
      <q-card class="photo-fullscreen-dialog">
        <q-card-section class="photo-fullscreen-content">
          <q-img
            :src="currentPhotoUrl"
            :alt="currentPhotoTitle"
            class="fullscreen-photo"
            fit="contain"
            @click="closePhotoFullscreen"
          >
            <template v-slot:loading>
              <q-spinner-gears color="primary" size="50px" />
            </template>
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                <q-icon name="broken_image" size="48px" />
              </div>
            </template>
          </q-img>
        </q-card-section>
        <q-card-actions class="absolute-top-right">
          <q-btn flat round dense icon="close" color="white" @click="closePhotoFullscreen" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Photo Confirmation Dialog -->
    <q-dialog v-model="showDeletePhotoDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Delete Photo</span>
        </q-card-section>

        <q-card-section>
          Are you sure you want to delete this photo? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeletePhotoDialog = false" />
          <q-btn color="negative" label="Delete" :loading="deletingPhoto" @click="deletePhoto" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showInviteLinkDialog">
      <q-card style="width: 100%; max-width: 720px">
        <q-card-section class="row items-center">
          <div class="text-h6">Invite Link</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2 text-grey-7 q-mb-sm">
            Email was not sent. Share this link manually.
          </div>
          <div v-if="inviteLinkReason" class="text-caption text-warning q-mb-sm">
            {{ inviteLinkReason }}
          </div>
          <q-input
            :model-value="inviteLinkValue"
            outlined
            readonly
            autogrow
            type="textarea"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn color="primary" unelevated label="Copy Link" @click="copyInviteLink" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, computed, watch, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import { normalizeRoleValue, roleLabel } from '../utils/roleUtils'
import { formatOwnerInviteFallbackReason } from '../utils/ownerInviteEmailFeedback'
import { generateOwnerInviteToken, createOwnerInviteExpiry, buildOwnerInviteUrl } from '../utils/ownerInviteUtils'
import { sendOwnerInviteEmailRequest } from '../services/ownerInviteApi'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'
import CreateAsset from '../components/CreateAsset.vue'
import PropertySidebarPicker from '../components/PropertySidebarPicker.vue'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()
const {
  createDocument,
  updateDocument,
  deleteDocument,
  uploadImagesWithDetails,
  deleteFile,
  getAllDocuments,
  getDocument,
} = useFirebase()
const canManageRecords = computed(() => userDataStore.isManagerCapableUser)
const canInviteOwner = (property) => {
  if (!property?.id) return false
  return userDataStore.canShareProperty(property.id)
}

const createOwnerInvite = async (property, ownerEmail) => {
  const normalizedOwnerEmail = String(ownerEmail || '').trim().toLowerCase()
  const existingInvites = await getAllDocuments('owner_invites')
  const existingPendingInvite = existingInvites.find((entry) => {
    const sameProperty = String(entry?.property_id || '') === String(property.id || '')
    const sameOwnerEmail = String(entry?.owner_email || '').trim().toLowerCase() === normalizedOwnerEmail
    const isPending = String(entry?.status || '').toLowerCase() === 'pending'
    return sameProperty && sameOwnerEmail && isPending
  })

  const token = generateOwnerInviteToken()
  const now = new Date()
  const expiresAt = createOwnerInviteExpiry()

  if (existingPendingInvite?.id) {
    await updateDocument('owner_invites', existingPendingInvite.id, {
      invite_id: existingPendingInvite.invite_id || existingPendingInvite.id,
      property_id: property.id,
      pm_user_id: userDataStore.userId,
      owner_email: normalizedOwnerEmail,
      status: 'pending',
      token,
      expires_at: expiresAt,
      accepted_at: null,
      accepted_by_user_id: null,
      updated_at: now,
    })

    return buildOwnerInviteUrl(token)
  }

  const inviteId = token.slice(0, 20)

  await createDocument('owner_invites', {
    invite_id: inviteId,
    property_id: property.id,
    pm_user_id: userDataStore.userId,
    owner_email: normalizedOwnerEmail,
    status: 'pending',
    token,
    expires_at: expiresAt,
    accepted_at: null,
    accepted_by_user_id: null,
    created_at: now,
    updated_at: now,
  }, inviteId)

  return buildOwnerInviteUrl(token)
}

const promptOwnerInvite = (property) => {
  const input = window.prompt(
    'Enter the email of the owner, spouse, or co-owner you want to share this property with.',
    '',
  )
  const email = String(input || '').trim().toLowerCase()
  if (!email) return
  if (!/.+@.+\..+/.test(email)) {
    Notify.create({
      type: 'negative',
      message: 'Please enter a valid email address.',
      position: 'top',
    })
    return
  }

  ;(async () => {
    try {
      const response = await sendOwnerInviteEmailRequest({
        propertyId: property.id,
        ownerEmail: email,
        propertyName: property.nickname || property.address || 'Property',
        propertyAddress: property.address || '',
        inviterName:
          userDataStore.userProfile?.full_name ||
          userDataStore.userProfile?.user_name ||
          userDataStore.user?.displayName ||
          userDataStore.user?.email ||
          'A property manager',
      })

      if (response?.email_sent) {
        Notify.create({
          type: 'positive',
          message: 'Owner invitation email sent successfully.',
          position: 'top',
          timeout: 4000,
        })
        return
      }

      const inviteLink = String(response?.invite_url || '').trim()
      const reasonMessage = formatOwnerInviteFallbackReason(response?.fallback_reason)
      openInviteLinkDialog(inviteLink, reasonMessage)
      Notify.create({
        type: 'warning',
        message: 'Email was not sent. Invite link is shown for manual copy.',
        caption: reasonMessage,
        position: 'top',
        timeout: 6000,
      })
    } catch (error) {
      try {
        const inviteLink = await createOwnerInvite(property, email)
        const reasonMessage = formatOwnerInviteFallbackReason(
          error?.payload?.message || error?.message || 'resend_request_failed',
        )
        openInviteLinkDialog(inviteLink, reasonMessage)
        Notify.create({
          type: 'warning',
          message: 'Email service unavailable. Invite link is shown for manual copy.',
          caption: reasonMessage,
          position: 'top',
          timeout: 6000,
        })
      } catch (fallbackError) {
        Notify.create({
          type: 'negative',
          message: fallbackError?.message || error?.message || 'Failed to create owner access link.',
          position: 'top',
        })
      }
    }
  })()
}
const propertyTypeOptions = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use']
const propertyStatusOptions = [
  'Available',
  'Active',
  'Occupied',
  'Maintenance',
  'Inactive',
  'Sold',
  'Under Contract',
  'Off Market',
  'Pending',
]

const parseLegacyAddressParts = (rawAddress) => {
  const text = String(rawAddress || '').trim()
  if (!text) return { city: '', state: '', zip: '' }
  const parts = text.split(',').map((item) => item.trim()).filter(Boolean)
  if (parts.length < 2) return { city: '', state: '', zip: '' }
  const city = parts[parts.length - 2] || ''
  const stateZip = parts[parts.length - 1] || ''
  const stateZipMatch = stateZip.match(/^([A-Za-z]{2,})\s+(\S+)$/)
  if (stateZipMatch) {
    return {
      city,
      state: stateZipMatch[1],
      zip: stateZipMatch[2],
    }
  }
  return {
    city,
    state: stateZip,
    zip: '',
  }
}

const normalizePropertyAddressFields = (property) => {
  if (!property || typeof property !== 'object') return property
  const fallback = parseLegacyAddressParts(property.address)
  return {
    ...property,
    city: String(property.city || fallback.city || '').trim(),
    state: String(property.state || fallback.state || '').trim(),
    zip: String(property.zip || property.zip_code || property.zipCode || property.postal_code || fallback.zip || '').trim(),
  }
}

const cloneProperty = (property) => {
  if (!property || typeof property !== 'object') return null
  const cloned = JSON.parse(JSON.stringify(normalizePropertyAddressFields(property)))
  if (!cloned.spec || typeof cloned.spec !== 'object') {
    cloned.spec = {}
  }
  return cloned
}

// Dialog state
const showPropertyDialog = ref(false)
const showPropertySelectorDialog = ref(false)
const selectedProperty = ref(null)
const isEditMode = ref(false)
const editLoading = ref(false)
const showInviteLinkDialog = ref(false)
const inviteLinkValue = ref('')
const inviteLinkReason = ref('')

// Create form dialogs
const showCreateMxRecordDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)
const showCreateAssetDialog = ref(false)

// Photo management dialogs
const showPhotoManagementDialog = ref(false)
const showPhotoFullscreenDialog = ref(false)
const showDeletePhotoDialog = ref(false)

// Photo management data
const propertyPhotos = ref([])
const propertyDocuments = ref([])
const propertyAssets = ref([])
const propertyServices = ref([])
const uploadFiles = ref(null)
const snapshotUploadFile = ref(null)
const snapshotUploading = ref(false)
const uploading = ref(false)
const loadingPhotos = ref(false)
const loadingDocuments = ref(false)
const loadingAssets = ref(false)
const deletingPhoto = ref(false)
const photoToDelete = ref(null)
const currentPhotoUrl = ref('')
const currentPhotoTitle = ref('')

const openInviteLinkDialog = (link, reason = '') => {
  inviteLinkValue.value = String(link || '').trim()
  inviteLinkReason.value = String(reason || '').trim()
  showInviteLinkDialog.value = true
}

const copyInviteLink = async () => {
  const link = String(inviteLinkValue.value || '').trim()
  if (!link) return
  try {
    await navigator.clipboard.writeText(link)
    Notify.create({
      type: 'positive',
      message: 'Invite link copied.',
      position: 'top',
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Unable to copy link automatically.',
      caption: 'Please copy it manually from the text box.',
      position: 'top',
    })
  }
}

const loading = computed(() => userDataStore.loading)
const selectedPropertyId = computed(() => selectedProperty.value?.id || null)

const toDateObject = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getDocumentDate = (doc) =>
  doc?.upload_date || doc?.created_at || doc?.created_datetime || doc?.updated_at || null

const syncedPropertyDocuments = computed(() => {
  const photos = (propertyPhotos.value || []).map((doc) => ({
    ...doc,
    source_collection: 'property_photos',
  }))
  const docs = (propertyDocuments.value || []).map((doc) => ({
    ...doc,
    source_collection: 'documents',
  }))

  return [...docs, ...photos].sort(
    (a, b) =>
      (toDateObject(getDocumentDate(b))?.getTime() || 0) -
      (toDateObject(getDocumentDate(a))?.getTime() || 0),
  )
})

const getLegacyServiceInfo = (property) => {
  const legacyService = property?.service_info || null
  if (legacyService && Object.values(legacyService).some(Boolean)) return legacyService
  const legacyLoan = property?.loan_insurance?.loan || null
  if (legacyLoan && Object.values(legacyLoan).some(Boolean)) {
    return { service_type: 'loan', ...legacyLoan }
  }
  const legacyInsurance = property?.loan_insurance?.insurance || null
  if (legacyInsurance && Object.values(legacyInsurance).some(Boolean)) {
    return { service_type: 'insurance', ...legacyInsurance }
  }
  return null
}

const displayedPropertyServices = computed(() =>
  (propertyServices.value || [])
    .slice()
    .sort(
      (a, b) =>
        (toDateObject(b?.updated_at || b?.created_at || b?.created_datetime)?.getTime() || 0) -
        (toDateObject(a?.updated_at || a?.created_at || a?.created_datetime)?.getTime() || 0),
    )
    .slice(0, 6),
)

const formatServiceType = (value) => {
  const text = String(value || '').trim()
  if (!text) return 'Service'
  return text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const displayedPropertyAssets = computed(() =>
  (propertyAssets.value || [])
    .slice()
    .sort(
      (a, b) =>
        (toDateObject(b?.updated_at || b?.created_at || b?.created_datetime)?.getTime() || 0) -
        (toDateObject(a?.updated_at || a?.created_at || a?.created_datetime)?.getTime() || 0),
    )
    .slice(0, 6),
)

const userProperties = computed(() => {
  console.log('PropertyView - Computing userProperties')
  console.log('userDataStore.userAccessibleProperties:', userDataStore.userAccessibleProperties)
  console.log('userDataStore.userRoles:', userDataStore.userRoles)
  console.log('userDataStore.properties:', userDataStore.properties)

  // If we don't have user roles yet, return empty array
  if (!userDataStore.userRoles || userDataStore.userRoles.length === 0) {
    console.log('PropertyView - No user roles yet, returning empty array')
    return []
  }

  // If we don't have properties yet, return empty array
  if (!userDataStore.properties || userDataStore.properties.length === 0) {
    console.log('PropertyView - No properties yet, returning empty array')
    return []
  }

  const result = userDataStore.userAccessibleProperties
    .map((property) => {
      const userRole = userDataStore.getUserRoleForProperty(property.id)
      console.log(`PropertyView - Property ${property.id} has role:`, userRole)
      if (userRole) {
        return {
          ...property,
          userRole: userRole.role,
          role_date: userRole.role_date,
        }
      }
      return null
    })
    .filter(Boolean)

  console.log('PropertyView - Final userProperties result:', result)
  return result
})

// Photo management functions
const openPhotoManagementDialog = () => {
  showPhotoManagementDialog.value = true
}

const closePhotoManagementDialog = () => {
  showPhotoManagementDialog.value = false
  propertyPhotos.value = []
  uploadFiles.value = null
}

const loadPropertyPhotos = async () => {
  if (!selectedProperty.value) return

  try {
    loadingPhotos.value = true
    console.log('Loading photos for property:', selectedProperty.value.id)

    const collectionPath = `properties/${selectedProperty.value.id}/property_photos`
    const photos = await getAllDocuments(collectionPath)

    propertyPhotos.value = photos || []
    console.log('Loaded photos:', propertyPhotos.value.length)
  } catch (error) {
    console.error('Error loading property photos:', error)
    propertyPhotos.value = []
  } finally {
    loadingPhotos.value = false
  }
}

const loadPropertyDocuments = async () => {
  if (!selectedProperty.value) return

  try {
    loadingDocuments.value = true
    const collectionPath = `properties/${selectedProperty.value.id}/documents`
    const docs = await getAllDocuments(collectionPath)
    propertyDocuments.value = docs || []
  } catch (error) {
    console.error('Error loading property documents:', error)
    propertyDocuments.value = []
  } finally {
    loadingDocuments.value = false
  }
}

const loadPropertyAssets = async () => {
  if (!selectedProperty.value) return

  try {
    loadingAssets.value = true
    const collectionPath = `properties/${selectedProperty.value.id}/assets`
    const assets = await getAllDocuments(collectionPath)
    propertyAssets.value = assets || []
  } catch (error) {
    console.error('Error loading property assets:', error)
    propertyAssets.value = []
  } finally {
    loadingAssets.value = false
  }
}

const loadPropertyServices = async () => {
  if (!selectedProperty.value) return
  try {
    const primary = await getDocument(`properties/${selectedProperty.value.id}/services/primary`)
    if (primary) {
      propertyServices.value = [{ id: primary.id || 'primary', ...primary }]
      return
    }
    const list = await getAllDocuments(`properties/${selectedProperty.value.id}/services`)
    if (list && list.length > 0) {
      propertyServices.value = list
      return
    }
    const legacy = getLegacyServiceInfo(selectedProperty.value)
    propertyServices.value = legacy ? [{ id: 'legacy', ...legacy }] : []
  } catch (error) {
    console.error('Error loading property services:', error)
    const legacy = getLegacyServiceInfo(selectedProperty.value)
    propertyServices.value = legacy ? [{ id: 'legacy', ...legacy }] : []
  }
}

const onPhotosSelected = (files) => {
  console.log('Photos selected:', files?.length || 0)
}

const onSnapshotSelected = async (file) => {
  if (!file) return
  if (!canManageRecords.value) {
    snapshotUploadFile.value = null
    Notify.create({
      type: 'warning',
      message: 'This action is not available for PO accounts.',
      position: 'top',
    })
    return
  }
  if (!selectedProperty.value?.id) {
    snapshotUploadFile.value = null
    return
  }

  try {
    snapshotUploading.value = true
    const normalizedFile = Array.isArray(file) ? file[0] : file
    const uploadResults = await uploadImagesWithDetails(
      [normalizedFile],
      selectedProperty.value.id,
      'property_photos',
    )

    const uploadResult = uploadResults?.[0]
    if (!uploadResult?.url) {
      throw new Error('Snapshot upload failed')
    }

    const photoData = {
      property_id: selectedProperty.value.id,
      image_url: uploadResult.url,
      storage_path: uploadResult.storagePath,
      description: 'Property snapshot',
      upload_date: new Date().toISOString(),
      created_datetime: new Date().toISOString(),
      original_filename: uploadResult.originalName,
    }

    const result = await createDocument(
      `properties/${selectedProperty.value.id}/property_photos`,
      photoData,
    )

    const newPhoto = { id: result.id, ...photoData }
    propertyPhotos.value.unshift(newPhoto)
    await setAsMainPhoto(newPhoto)
  } catch (error) {
    console.error('Error replacing snapshot:', error)
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to replace snapshot.',
      position: 'top',
    })
  } finally {
    snapshotUploadFile.value = null
    snapshotUploading.value = false
  }
}

const uploadPhotos = async () => {
  if (!canManageRecords.value) {
    Notify.create({
      type: 'warning',
      message: 'This action is not available for PO accounts.',
      position: 'top',
    })
    return
  }
  if (!uploadFiles.value || uploadFiles.value.length === 0) return

  try {
    uploading.value = true
    console.log('Uploading photos:', uploadFiles.value.length)

    // Upload files to Firebase Storage
    const uploadResults = await uploadImagesWithDetails(
      uploadFiles.value,
      selectedProperty.value.id,
      'property_photos',
    )

    if (!uploadResults || uploadResults.length === 0) {
      throw new Error('Failed to upload photos')
    }

    // Create photo records in Firestore
    const photoPromises = uploadResults.map(async (uploadResult) => {
      const photoData = {
        property_id: selectedProperty.value.id,
        image_url: uploadResult.url,
        storage_path: uploadResult.storagePath,
        description: '',
        upload_date: new Date().toISOString(),
        created_datetime: new Date().toISOString(),
        original_filename: uploadResult.originalName,
      }

      // Save to Firestore subcollection
      const result = await createDocument(
        `properties/${selectedProperty.value.id}/property_photos`,
        photoData,
      )

      return { id: result.id, ...photoData }
    })

    const newPhotos = await Promise.all(photoPromises)

    // Add to local array
    propertyPhotos.value.push(...newPhotos)

    // Reset form
    uploadFiles.value = null

    Notify.create({
      type: 'positive',
      message: `${newPhotos.length} photo(s) uploaded successfully!`,
      position: 'top',
    })

    console.log('Photos uploaded successfully:', newPhotos.length)
  } catch (error) {
    console.error('Error uploading photos:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to upload photos. Please try again.',
      position: 'top',
    })
  } finally {
    uploading.value = false
  }
}

const showPhotoFullscreen = (photoUrl, photoTitle) => {
  currentPhotoUrl.value = photoUrl
  currentPhotoTitle.value = photoTitle || 'Property Photo'
  showPhotoFullscreenDialog.value = true
}

const closePhotoFullscreen = () => {
  showPhotoFullscreenDialog.value = false
  currentPhotoUrl.value = ''
  currentPhotoTitle.value = ''
}

const confirmDeletePhoto = (photo) => {
  if (!canManageRecords.value) {
    Notify.create({
      type: 'warning',
      message: 'This action is not available for PO accounts.',
      position: 'top',
    })
    return
  }
  photoToDelete.value = photo
  showDeletePhotoDialog.value = true
}

const deletePhoto = async () => {
  if (!canManageRecords.value) {
    Notify.create({
      type: 'warning',
      message: 'This action is not available for PO accounts.',
      position: 'top',
    })
    return
  }
  if (!photoToDelete.value) return

  try {
    deletingPhoto.value = true
    console.log('Deleting photo:', photoToDelete.value)

    // Delete from Firebase Storage if storage path exists
    if (photoToDelete.value.storage_path) {
      try {
        console.log('Deleting photo from storage:', photoToDelete.value.storage_path)
        await deleteFile(photoToDelete.value.storage_path)
        console.log('Photo deleted from storage successfully')
      } catch (storageError) {
        console.warn(
          'Failed to delete photo from storage (continuing with Firestore deletion):',
          storageError,
        )
      }
    }

    // Delete from Firestore
    await deleteDocument(
      `properties/${selectedProperty.value.id}/property_photos`,
      photoToDelete.value.id,
    )

    // Remove from local array
    const index = propertyPhotos.value.findIndex((photo) => photo.id === photoToDelete.value.id)
    if (index !== -1) {
      propertyPhotos.value.splice(index, 1)
    }

    // If this was the main photo, clear it from the property
    if (selectedProperty.value.image_url === photoToDelete.value.image_url) {
      selectedProperty.value.image_url = null
      // Optionally update the property record in Firestore
    }

    showDeletePhotoDialog.value = false
    photoToDelete.value = null

    Notify.create({
      type: 'positive',
      message: 'Photo deleted successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to delete photo. Please try again.',
      position: 'top',
    })
  } finally {
    deletingPhoto.value = false
  }
}

const setAsMainPhoto = async (photo) => {
  if (!canManageRecords.value) {
    Notify.create({
      type: 'warning',
      message: 'This action is not available for PO accounts.',
      position: 'top',
    })
    return
  }
  try {
    console.log('Setting photo as main:', photo.image_url)

    // Update the property's main image
    selectedProperty.value.image_url = photo.image_url

    // Update in Firestore
    await updateDocument('properties', selectedProperty.value.id, {
      image_url: photo.image_url,
    })

    Notify.create({
      type: 'positive',
      message: 'Main photo updated successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error setting main photo:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to set main photo. Please try again.',
      position: 'top',
    })
  }
}

// Watch for changes in store data
watch(
  () => userDataStore.userRoles,
  (newRoles) => {
    console.log('PropertyView - User roles changed:', newRoles)
  },
  { immediate: true },
)

watch(
  () => userDataStore.properties,
  (newProperties) => {
    console.log('PropertyView - Properties changed:', newProperties)
  },
  { immediate: true },
)

watch(
  () => userDataStore.userAccessibleProperties,
  (newAccessible) => {
    console.log('PropertyView - User accessible properties changed:', newAccessible)
  },
  { immediate: true },
)

// Add focus event listener to refresh data when page becomes visible
const handlePageFocus = () => {
  try {
    console.log('PropertyView - Page focused, checking if data needs refresh...')
    // Only refresh if we have no properties but should have some based on roles
    if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
      console.log('PropertyView - Page focused and data appears missing, refreshing...')
      refreshData()
    }
    if (selectedProperty.value) {
      loadPropertyServices()
    }
  } catch (error) {
    console.warn('PropertyView - Error in handlePageFocus:', error)
  }
}

// Handle visibility change to refresh data when tab becomes visible
const handleVisibilityChange = () => {
  try {
    if (!document.hidden) {
      console.log('PropertyView - Tab became visible, checking if data needs refresh...')
      // Check if we have roles but no properties, which might indicate missing data
      if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
        console.log('PropertyView - Tab visible and data appears missing, refreshing...')
        refreshData()
      }
      if (selectedProperty.value) {
        loadPropertyServices()
      }
    }
  } catch (error) {
    console.warn('PropertyView - Error in handleVisibilityChange:', error)
  }
}

onMounted(() => {
  try {
    console.log('PropertyView mounted')
    console.log('Initial store state:', {
      user: userDataStore.user,
      userId: userDataStore.userId,
      isAuthenticated: userDataStore.isAuthenticated,
      loading: userDataStore.loading,
      userRoles: userDataStore.userRoles,
      properties: userDataStore.properties,
      userAccessibleProperties: userDataStore.userAccessibleProperties,
    })

    // Check if user is authenticated
    if (!userDataStore.isAuthenticated) {
      console.log('User not authenticated, redirecting to home page')
      router.push('/')
      return
    }

    // Check if we need to trigger data loading
    if (userDataStore.isAuthenticated && !userDataStore.loading) {
      console.log('User is authenticated but not loading, checking if we need to load data...')
      if (userDataStore.userRoles.length === 0 || userDataStore.properties.length === 0) {
        console.log('Data appears to be missing, triggering data load...')
        userDataStore.loadAllUserData()
      }
    }

    // Add event listeners with safety checks
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handlePageFocus)
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Auto-select first property if available
    if (userProperties.value.length > 0 && !selectedProperty.value) {
      selectedProperty.value = cloneProperty(userProperties.value[0])
    }

    // Data is automatically loaded by the store when user is authenticated
  } catch (error) {
    console.error('PropertyView - Error in onMounted:', error)
  }
})

onUnmounted(() => {
  try {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handlePageFocus)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  } catch (error) {
    console.warn('PropertyView - Error removing event listeners:', error)
  }
})

// Watch for route changes to refresh data when returning from create property
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log('PropertyView - Route changed from', oldPath, 'to', newPath)
    // If we're returning to this page from create-property, refresh data
    if (newPath === '/property-view' && oldPath === '/create-property') {
      console.log('PropertyView - Returning from create property, refreshing data...')
      refreshData()
    }
  },
)

// Watch for when the page becomes active (useful for browser back/forward)
watch(
  () => route.name,
  (newName) => {
    if (newName === 'PropertyView') {
      console.log('PropertyView - Page activated, checking data...')
      // Small delay to ensure any pending operations complete
      setTimeout(() => {
        if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
          console.log('PropertyView - Page activated and data missing, refreshing...')
          refreshData()
        }
      }, 100)
    }
  },
)

// Watch for userProperties changes to auto-select first property
watch(
  userProperties,
  (newProperties) => {
    if (newProperties.length > 0 && !selectedProperty.value) {
      selectedProperty.value = cloneProperty(newProperties[0])
    }
  },
  { immediate: true },
)

// Watch for property changes to load photos
watch(
  selectedProperty,
  () => {
    // Load media and documents when property changes
    if (selectedProperty.value) {
      loadPropertyPhotos()
      loadPropertyDocuments()
      loadPropertyAssets()
      loadPropertyServices()
    } else {
      propertyAssets.value = []
      propertyServices.value = []
    }
  },
  { immediate: true },
)

const getStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Active: 'green',
    Occupied: 'blue',
    Maintenance: 'orange',
    Inactive: 'grey',
  }
  return colors[status] || 'grey'
}

const getRoleColor = (role) => {
  const normalized = normalizeRoleValue(role)
  if (normalized === 'po') return 'deep-purple'
  if (normalized === 'pm') return 'blue'
  if (normalized === 'tt') return 'green'
  if (normalized === 'sp') return 'orange'
  if (normalized === 'admin') return 'grey'
  return 'grey'
}

const getRoleLabel = (role) => roleLabel(role || '')

const getLeaseStatusColor = (status) => {
  const colors = {
    Active: 'green',
    Expired: 'red',
    Pending: 'orange',
    Cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

const getLeasePropertyId = (lease) =>
  lease?.property_id?.id || lease?.property_id || lease?.property?.id || null

const isActiveLeaseStatus = (status) => {
  const normalized = String(status || '').toLowerCase()
  return ['active', 'rented', 'occupied'].includes(normalized)
}

const isLeaseForSelectedProperty = (lease) => {
  if (!selectedProperty.value) return false
  return String(getLeasePropertyId(lease) || '') === String(selectedProperty.value.id || '')
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  const parsed = toDateObject(date)
  if (!parsed) return String(date)
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getAssetDisplayName = (asset) => asset?.nickname || asset?.name || 'Unnamed Asset'

const getAssetSubtitle = (asset) => {
  const parts = [asset?.type, asset?.brand, asset?.model].filter(Boolean)
  if (parts.length > 0) return parts.join(' · ')
  return 'No additional details'
}

const selectProperty = (property) => {
  selectedProperty.value = cloneProperty(property)
  console.log('PropertyView - Selected property:', property)
}

const handleSidebarPropertySelect = (propertyId) => {
  const property = userProperties.value.find((item) => item.id === propertyId)
  if (property) {
    selectProperty(property)
  }
}



const selectPropertyFromDialog = (property) => {
  selectProperty(property)
  showPropertySelectorDialog.value = false
}

const refreshData = async () => {
  console.log('PropertyView - Refreshing data...')
  try {
    await userDataStore.loadAllUserData()
    console.log('PropertyView - Data refresh completed')
  } catch (error) {
    console.error('PropertyView - Error refreshing data:', error)
  }
}

// Task summary functions
const getOpenMxRecordsCount = () => {
  if (!selectedProperty.value) return 0
  return userDataStore.mxRecords.filter(
    (record) => record.property_id === selectedProperty.value.id && record.status === 'open',
  ).length
}

const getPendingTransactionsCount = () => {
  if (!selectedProperty.value) return 0
  return userDataStore.transactions.filter(
    (transaction) =>
      transaction.property_id === selectedProperty.value.id && transaction.status === 'pending',
  ).length
}

const getActiveLeasesCount = () => {
  if (!selectedProperty.value) return 0
  return userDataStore.leases.filter((lease) => isLeaseForSelectedProperty(lease) && isActiveLeaseStatus(lease.status)).length
}

const getUpcomingRenewalsCount = () => {
  if (!selectedProperty.value) return 0
  const now = new Date()
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  return userDataStore.leases.filter((lease) => {
    if (!isLeaseForSelectedProperty(lease) || !isActiveLeaseStatus(lease.status)) return false
    const endDate = toDateObject(lease.lease_end_date || lease.end_date)
    if (!endDate) return false
    return endDate <= threeMonthsFromNow && endDate >= now
  }).length
}

// Financial summary functions
const getTotalIncome = () => {
  if (!selectedProperty.value) return '0.00'
  const propertyTransactions = userDataStore.transactions.filter(
    (transaction) =>
      transaction.property_id === selectedProperty.value.id && transaction.type === 'income',
  )
  const total = propertyTransactions.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
    0,
  )
  return total.toFixed(2)
}

const getTotalExpenses = () => {
  if (!selectedProperty.value) return '0.00'
  const propertyTransactions = userDataStore.transactions.filter(
    (transaction) =>
      transaction.property_id === selectedProperty.value.id && transaction.type === 'expense',
  )
  const total = propertyTransactions.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
    0,
  )
  return total.toFixed(2)
}

const getMonthlyIncome = () => {
  if (!selectedProperty.value) return '0.00'
  const propertyTransactions = userDataStore.transactions.filter(
    (transaction) =>
      transaction.property_id === selectedProperty.value.id && transaction.type === 'income',
  )

  if (propertyTransactions.length === 0) return '0.00'

  // Group by month and calculate average
  const monthlyTotals = {}
  propertyTransactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0
    monthlyTotals[monthKey] += parseFloat(transaction.amount) || 0
  })

  const months = Object.keys(monthlyTotals)
  if (months.length === 0) return '0.00'

  const total = months.reduce((sum, month) => sum + monthlyTotals[month], 0)
  return (total / months.length).toFixed(2)
}

const getMonthlyExpense = () => {
  if (!selectedProperty.value) return '0.00'
  const propertyTransactions = userDataStore.transactions.filter(
    (transaction) =>
      transaction.property_id === selectedProperty.value.id && transaction.type === 'expense',
  )

  if (propertyTransactions.length === 0) return '0.00'

  // Group by month and calculate average
  const monthlyTotals = {}
  propertyTransactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0
    monthlyTotals[monthKey] += parseFloat(transaction.amount) || 0
  })

  const months = Object.keys(monthlyTotals)
  if (months.length === 0) return '0.00'

  const total = months.reduce((sum, month) => sum + monthlyTotals[month], 0)
  return (total / months.length).toFixed(2)
}

// Lease functions
const getCurrentLease = () => {
  if (!selectedProperty.value) return null
  return userDataStore.leases.find((lease) => isLeaseForSelectedProperty(lease) && isActiveLeaseStatus(lease.status))
}

// Get all active leases for property
const getPropertyLeases = () => {
  if (!selectedProperty.value) return []
  return userDataStore.leases.filter((lease) => isLeaseForSelectedProperty(lease) && isActiveLeaseStatus(lease.status))
}

const getLeaseDisplayTenantName = (lease) =>
  lease?.tenant_name || lease?.tenant_email || lease?.tenant_id || 'N/A'

// Rent Tracking Functions
const getCurrentMonthYear = () => {
  const now = new Date()
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const getCurrentMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const getExpectedRent = () => {
  const leases = getPropertyLeases()
  const total = leases.reduce((sum, lease) => sum + (parseFloat(lease.rate_amount) || 0), 0)
  return total.toFixed(2)
}

const getCollectedRent = () => {
  if (!selectedProperty.value) return '0.00'
  const currentMonth = getCurrentMonthKey()

  // Find rent payments for current month
  const rentPayments = userDataStore.transactions.filter((t) => {
    const txnPropertyId = t.property_id?.id || t.property_id || t.property?.id
    if (String(txnPropertyId || '') !== String(selectedProperty.value.id || '')) return false
    if (t.type !== 'income') return false

    // Check if it's a rent payment (by category or description)
    const isRent =
      (t.category && t.category.toLowerCase().includes('rent')) ||
      (t.description && t.description.toLowerCase().includes('rent'))

    if (!isRent) return false

    // Check if it's from current month
    const transDate = new Date(t.transaction_date)
    const transMonth = `${transDate.getFullYear()}-${String(transDate.getMonth() + 1).padStart(2, '0')}`
    return transMonth === currentMonth
  })

  const total = rentPayments.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  return total.toFixed(2)
}

const getRentBalance = () => {
  const expected = parseFloat(getExpectedRent())
  const collected = parseFloat(getCollectedRent())
  return (expected - collected).toFixed(2)
}

const getRentBalanceClass = () => {
  const balance = parseFloat(getRentBalance())
  if (balance <= 0) return 'paid'
  if (balance > 0) return 'pending'
  return ''
}

const getLeaseRentStatus = (lease) => {
  if (!selectedProperty.value) return { status: 'unknown', label: 'Unknown', paid: 0 }

  const currentMonth = getCurrentMonthKey()
  const expectedRent = parseFloat(lease.rate_amount) || 0

  // Find rent payments for this lease in current month
  const rentPayments = userDataStore.transactions.filter((t) => {
    if (t.property_id !== selectedProperty.value.id) return false
    if (t.type !== 'income') return false

    // Check if it's a rent payment
    const isRent =
      (t.category && t.category.toLowerCase().includes('rent')) ||
      (t.description && t.description.toLowerCase().includes('rent'))

    if (!isRent) return false

    // Check if it matches this lease (by tenant name or lease_id if available)
    const matchesLease =
      (t.lease_id && t.lease_id === lease.id) ||
      (t.tenant_name && t.tenant_name === lease.tenant_name) ||
      !t.tenant_name // If no tenant specified, count towards property rent

    if (!matchesLease) return false

    // Check if it's from current month
    const transDate = new Date(t.transaction_date)
    const transMonth = `${transDate.getFullYear()}-${String(transDate.getMonth() + 1).padStart(2, '0')}`
    return transMonth === currentMonth
  })

  const paidAmount = rentPayments.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

  // Determine status
  const now = new Date()
  const dayOfMonth = now.getDate()

  if (paidAmount >= expectedRent) {
    return { status: 'paid', label: 'Paid', paid: paidAmount }
  } else if (paidAmount > 0 && paidAmount < expectedRent) {
    return { status: 'partial', label: 'Partial', paid: paidAmount }
  } else if (dayOfMonth > 5) {
    // If past the 5th and no payment, consider it overdue
    return { status: 'overdue', label: 'Overdue', paid: 0 }
  } else {
    return { status: 'pending', label: 'Pending', paid: 0 }
  }
}

const getRentStatusColor = (status) => {
  const colors = {
    paid: 'positive',
    partial: 'warning',
    pending: 'info',
    overdue: 'negative',
    unknown: 'grey',
  }
  return colors[status.status] || 'grey'
}

const getRentStatusIcon = (status) => {
  const icons = {
    paid: 'check_circle',
    partial: 'pending',
    pending: 'schedule',
    overdue: 'error',
    unknown: 'help',
  }
  return icons[status.status] || 'help'
}

const getTenantInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name[0].toUpperCase()
}

const getRecentRentPayments = () => {
  if (!selectedProperty.value) return []

  // Get last 5 rent payments
  const rentPayments = userDataStore.transactions
    .filter((t) => {
      const txnPropertyId = t.property_id?.id || t.property_id || t.property?.id
      if (String(txnPropertyId || '') !== String(selectedProperty.value.id || '')) return false
      if (t.type !== 'income') return false

      const isRent =
        (t.category && t.category.toLowerCase().includes('rent')) ||
        (t.description && t.description.toLowerCase().includes('rent'))

      return isRent
    })
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    .slice(0, 5)

  return rentPayments
}

// Document helper functions
const getDocumentUrl = (doc) => doc?.image_url || doc?.url || ''

const getDocumentDisplayName = (doc) =>
  doc?.name || doc?.description || doc?.original_filename || 'Document'

const getPropertyPreviewImageUrl = (property) =>
  property?.image_compressed_url ||
  property?.compressed_image_url ||
  property?.image_thumb_url ||
  property?.image_thumbnail_url ||
  property?.image_url ||
  '/placeholder-property.jpg'

const isImageFile = (doc) => {
  const contentType = String(doc?.content_type || '').toLowerCase()
  if (contentType.startsWith('image/')) return true

  const filename = getDocumentDisplayName(doc) || getDocumentUrl(doc) || ''
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic']
  const lowerFilename = filename.toLowerCase()
  return imageExtensions.some((ext) => lowerFilename.includes(ext))
}

const getFileExtension = (doc) => {
  const filename = getDocumentDisplayName(doc) || getDocumentUrl(doc) || ''
  const parts = filename.split('.')
  if (parts.length > 1) {
    return parts[parts.length - 1].toUpperCase()
  }
  if (doc?.content_type) return String(doc.content_type).split('/').pop().toUpperCase()
  return 'FILE'
}

const getFileIcon = (doc) => {
  const ext = getFileExtension(doc).toLowerCase()
  const iconMap = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    xls: 'table_chart',
    xlsx: 'table_chart',
    csv: 'table_chart',
    txt: 'article',
    zip: 'folder_zip',
    rar: 'folder_zip',
    mp4: 'video_file',
    mov: 'video_file',
    avi: 'video_file',
    mp3: 'audio_file',
    wav: 'audio_file',
    ppt: 'slideshow',
    pptx: 'slideshow',
  }
  return iconMap[ext] || 'insert_drive_file'
}

const getFileIconColor = (doc) => {
  const ext = getFileExtension(doc).toLowerCase()
  const colorMap = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    xls: 'green',
    xlsx: 'green',
    csv: 'green',
    txt: 'grey-7',
    zip: 'amber',
    rar: 'amber',
    mp4: 'purple',
    mov: 'purple',
    avi: 'purple',
    mp3: 'orange',
    wav: 'orange',
    ppt: 'deep-orange',
    pptx: 'deep-orange',
  }
  return colorMap[ext] || 'primary'
}

const viewDocument = (doc) => {
  const url = getDocumentUrl(doc)
  if (!url) return
  if (isImageFile(doc)) {
    showPhotoFullscreen(url, getDocumentDisplayName(doc))
  } else {
    // Open non-image files in a new tab
    window.open(url, '_blank')
  }
}

const downloadDocument = (doc) => {
  // Create a temporary link to download the file
  const link = document.createElement('a')
  link.href = getDocumentUrl(doc)
  link.download = getDocumentDisplayName(doc)
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openCreatePropertyDialog = () => {
  if (!canManageRecords.value) return
  router.push('/create-property')
}

// Navigation functions
const viewProperty = (propertyId) => {
  const property = userProperties.value.find((p) => p.id === propertyId)
  if (property) {
    selectedProperty.value = cloneProperty(property)
    showPropertyDialog.value = true
  }
}

// Dialog functions

const closeCreateMxRecordDialog = () => {
  try {
    showCreateMxRecordDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create task dialog:', error)
  }
}

const closeCreateTransactionDialog = () => {
  try {
    showCreateTransactionDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create transaction dialog:', error)
  }
}

const closeCreateLeaseDialog = () => {
  try {
    showCreateLeaseDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create lease dialog:', error)
  }
}

const closeCreateAssetDialog = () => {
  try {
    showCreateAssetDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create asset dialog:', error)
  }
}

// Event handlers for form completion

const onMxRecordCreated = () => {
  try {
    closeCreateMxRecordDialog()
    refreshData()
  } catch (error) {
    console.warn('PropertyView - Error in onMxRecordCreated:', error)
  }
}

const onTransactionCreated = () => {
  try {
    closeCreateTransactionDialog()
    refreshData()
  } catch (error) {
    console.warn('PropertyView - Error in onTransactionCreated:', error)
  }
}

const onLeaseCreated = () => {
  try {
    closeCreateLeaseDialog()
    refreshData()
  } catch (error) {
    console.warn('PropertyView - Error in onLeaseCreated:', error)
  }
}

const onAssetCreated = () => {
  try {
    closeCreateAssetDialog()
    refreshData()
    Notify.create({
      type: 'positive',
      message: 'Asset created successfully.',
      position: 'top',
    })
  } catch (error) {
    console.warn('PropertyView - Error in onAssetCreated:', error)
  }
}

// Dialog functions
const closePropertyDialog = () => {
  if (isEditMode.value) {
    cancelEdit()
  }
  showPropertyDialog.value = false
  isEditMode.value = false
}

const toggleEditMode = () => {
  if (!isEditMode.value && selectedProperty.value && !selectedProperty.value.spec) {
    selectedProperty.value.spec = {}
  }
  isEditMode.value = !isEditMode.value
}

const saveProperty = async () => {
  try {
    if (!selectedProperty.value?.id) return
    editLoading.value = true
    const payload = {
      address: String(selectedProperty.value.address || '').trim(),
      city: String(selectedProperty.value.city || '').trim(),
      state: String(selectedProperty.value.state || '').trim(),
      zip: String(selectedProperty.value.zip || '').trim(),
      nickname: selectedProperty.value.nickname || '',
      type: selectedProperty.value.type || '',
      status: selectedProperty.value.status || '',
      spec: {
        ...(selectedProperty.value.spec || {}),
      },
      updatedAt: new Date(),
    }
    await updateDocument('properties', selectedProperty.value.id, payload)

    isEditMode.value = false
    await refreshData()
    const refreshed = userProperties.value.find((p) => p.id === selectedProperty.value.id)
    if (refreshed) {
      selectedProperty.value = cloneProperty(refreshed)
    }
    Notify.create({
      type: 'positive',
      message: 'Property updated successfully.',
      position: 'top',
    })
  } catch (error) {
    console.error('Error saving property:', error)
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to update property.',
      position: 'top',
    })
  } finally {
    editLoading.value = false
  }
}

const cancelEdit = () => {
  const originalProperty = userProperties.value.find((p) => p.id === selectedProperty.value?.id)
  if (originalProperty) {
    selectedProperty.value = cloneProperty(originalProperty)
  }
  isEditMode.value = false
}
</script>

<style scoped>
.property-view-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 14px;
  height: calc(100vh - 120px);
}

.property-sidebar {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-list-card {
  height: fit-content;
  border-radius: 12px;
  overflow: hidden;
}

.property-list-card--summary {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.property-summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 6px;
}

.property-summary-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.property-summary-sub {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.45;
  margin-top: 4px;
  word-break: break-word;
}

.property-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.property-list-item:hover {
  background-color: rgba(36, 87, 115, 0.1);
}

.property-list-item.q-item--active {
  background-color: var(--primary-color);
  color: white;
}

.property-content {
  overflow-y: auto;
}

.property-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 12px;
  height: fit-content;
}

.property-image-card {
  grid-column: 1;
  grid-row: 1;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tasks-summary-card,
.transaction-summary-card,
.rent-tracking-card {
  grid-column: 1 / span 2;
}


.property-image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.property-main-image {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background: var(--neutral-100, #f5f6f8);
}

.property-main-image :deep(.q-img__container) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-main-image :deep(img) {
  object-fit: contain !important;
  object-position: center center !important;
}

.property-selector-dialog {
  min-width: 520px;
  max-width: 720px;
}

.property-selector-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.property-selector-btn {
  min-height: 88px;
  padding: 12px;
  border-radius: 12px;
  text-align: left;
  justify-content: flex-start;
  align-items: flex-start;
  border-width: 1px;
  border-color: var(--neutral-300);
  background: #fff;
  transition: all 0.18s ease;
}

.property-selector-btn:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.12);
}

.property-selector-btn--active {
  background: rgba(25, 118, 210, 0.1);
  border-color: var(--primary-color);
}

.property-selector-btn__title {
  font-weight: 600;
  font-size: 0.86rem;
  line-height: 1.3;
}

.property-selector-btn__sub {
  font-size: 0.74rem;
  color: var(--neutral-600);
  margin-top: 2px;
  white-space: normal;
}

.property-info-card {
  grid-column: 2;
  grid-row: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.property-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tasks-summary-card {
  grid-column: 1;
  grid-row: 2;
}

.transaction-summary-card {
  grid-column: 2;
  grid-row: 2;
}

.property-documents-card {
  grid-column: 1 / -1;
  grid-row: 4;
}

.rent-tracking-card {
  grid-column: 1 / -1;
  grid-row: 4;
}

.property-assets-card .q-expansion-item__container,
.property-documents-card .q-expansion-item__container {
  border-radius: 8px;
}

.assets-loading,
.no-assets {
  text-align: center;
  padding: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin-bottom: 4px;
}

.info-value {
  font-weight: 500;
  color: var(--neutral-800);
}

.tasks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.task-item {
  text-align: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.task-count {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.task-label {
  font-size: 0.875rem;
  color: var(--neutral-600);
}

.financial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.financial-item {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.financial-item.income {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.financial-item.expense {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.financial-item.net {
  background: var(--bg-secondary);
  border: 1px solid var(--neutral-300);
}

.financial-item.monthly {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.financial-label {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin-bottom: 4px;
}

.financial-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--neutral-800);
}

.financial-value.positive {
  color: var(--success-color);
}

.financial-value.negative {
  color: var(--error-color);
}

.lease-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lease-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-200);
}

.lease-item:last-child {
  border-bottom: none;
}

.lease-label {
  font-weight: 500;
  color: var(--neutral-700);
}

.lease-value {
  color: var(--neutral-600);
}

.no-lease {
  text-align: center;
  padding: 32px;
}

/* Dialog styles */
.dialog-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
}

.create-fullscreen-card {
  width: 100%;
  max-width: none;
  max-height: none;
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

.create-fullscreen-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(2px);
}

.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.elevated {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.property-detail-dialog-card {
  background: #f6f8fb;
}

.property-detail-frame {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.property-detail-header {
  position: relative;
  flex: 0 0 auto;
  padding-right: 112px;
}

.property-detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 4;
  color: var(--neutral-700);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(2px);
}

.property-detail-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-right: 48px;
}

.property-detail-content-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px calc(40px + env(safe-area-inset-bottom, 0px));
}

.property-detail-shell {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.property-detail-body {
  width: 100%;
  padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px));
}

.property-detail-image-panel {
  border: 1px solid var(--neutral-200);
  border-radius: 14px;
  background: #fff;
  padding: 16px;
}

.property-detail-img {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  background: var(--neutral-100, #f5f6f8);
}

.property-detail-img :deep(.q-img__container) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-detail-img :deep(img) {
  object-fit: contain !important;
  object-position: center center !important;
}

.detail-display-card {
  min-height: 56px;
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background: #f7f8fa;
  padding: 12px 14px;
}

.detail-display-label {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--neutral-600);
  margin-bottom: 6px;
}

.detail-display-value {
  color: var(--neutral-800);
  font-weight: 500;
  line-height: 1.35;
}

.property-detail-bottom-space {
  padding-bottom: 24px;
}

/* Responsive design */
@media (max-width: 1024px) {
  .property-view-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .property-sidebar {
    order: 2;
  }

  .property-content {
    order: 1;
  }

  .property-details-grid {
    grid-template-columns: 1fr;
  }

  .property-image-card {
    grid-column: 1;
    grid-row: 1;
  }

  .property-info-card {
    grid-column: 1;
    grid-row: 2;
  }

  .tasks-summary-card {
    grid-column: 1;
    grid-row: 3;
  }

  .transaction-summary-card {
    grid-column: 1;
    grid-row: 4;
  }

  .property-documents-card {
    grid-row: 7;
  }

  .rent-tracking-card {
    grid-row: 6;
  }
}

@media (max-width: 768px) {
  .info-grid,
  .tasks-grid,
  .financial-grid {
    grid-template-columns: 1fr;
  }

  .property-selector-dialog {
    min-width: 92vw;
  }

  .property-selector-grid {
    grid-template-columns: 1fr;
  }

  .property-detail-header {
    padding-right: 72px;
  }

  .property-detail-content-scroll {
    padding: 12px 12px calc(28px + env(safe-area-inset-bottom, 0px));
  }

  .property-detail-actions {
    justify-content: flex-start;
    padding-right: 0;
  }

  .property-detail-img {
    height: 160px;
  }
}

.photo-management-dialog {
  max-width: 100vw;
  max-height: 100vh;
}

.photo-management-content {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.photo-management-container {
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px dashed #e0e0e0;
}

.section-header {
  margin-bottom: 16px;
}

.upload-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-field {
  width: 100%;
}

.upload-actions {
  margin-top: 16px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.photo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-image:hover {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-container:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  display: flex;
  gap: 8px;
}

.photo-main-action {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
}

.photo-info {
  padding: 16px;
}

.photo-description {
  font-weight: 500;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.photo-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
}

.empty-photos {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-preview:hover {
  background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
}

.file-type-badge {
  margin-top: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading-photos {
  text-align: center;
  padding: 40px 20px;
}

.photo-fullscreen-dialog {
  background: rgba(0, 0, 0, 0.95);
}

.photo-fullscreen-content {
  padding: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-photo {
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .photo-container {
    height: 160px;
  }

  .upload-section {
    padding: 16px;
  }
}

/* Property Documents Styles */
.property-documents-card {
  background: white;
}

.documents-loading {
  text-align: center;
  padding: 32px;
}

.documents-list {
  border: 1px solid var(--neutral-200, #e5e5e5);
  border-radius: 8px;
  overflow: hidden;
}

.document-list-item {
  min-height: 56px;
}

.document-list-item :deep(.q-item__label) {
  font-size: 0.84rem;
}

.no-documents {
  text-align: center;
  padding: 32px;
}

/* Rent Tracking Styles */
.rent-tracking-card {
  background: white;
}

.rent-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.rent-summary-item {
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  background: var(--neutral-100, #f5f5f5);
  border: 1px solid var(--neutral-200, #e5e5e5);
}

.rent-summary-item.collected {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.rent-summary-item.paid {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.rent-summary-item.pending {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.rent-summary-label {
  font-size: 0.875rem;
  color: var(--neutral-600, #666);
  margin-bottom: 4px;
}

.rent-summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--neutral-800, #1a1a1a);
}

.rent-summary-item.collected .rent-summary-value,
.rent-summary-item.paid .rent-summary-value {
  color: var(--positive, #22c55e);
}

.rent-summary-item.pending .rent-summary-value {
  color: var(--negative, #ef4444);
}

.rent-status-list {
  margin-top: 16px;
}

.rent-status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--neutral-50, #fafafa);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--neutral-200, #e5e5e5);
  transition: all 0.2s ease;
}

.rent-status-item:hover {
  background: var(--neutral-100, #f5f5f5);
  border-color: var(--primary-color, #1976d2);
}

.rent-tenant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rent-tenant-details {
  display: flex;
  flex-direction: column;
}

.rent-tenant-name {
  font-weight: 600;
  color: var(--neutral-800, #1a1a1a);
}

.rent-tenant-amount {
  font-size: 0.875rem;
  color: var(--neutral-600, #666);
}

.rent-payment-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.rent-paid-amount {
  font-size: 0.75rem;
  color: var(--neutral-500, #888);
}

.no-rent-data {
  text-align: center;
  padding: 32px 16px;
}

.recent-rent-payments {
  border-top: 1px solid var(--neutral-200, #e5e5e5);
  padding-top: 16px;
}

.rent-payments-list {
  background: var(--neutral-50, #fafafa);
  border-radius: 8px;
}

.rent-payment-item {
  border-bottom: 1px solid var(--neutral-200, #e5e5e5);
}

.rent-payment-item:last-child {
  border-bottom: none;
}

/* Responsive Rent Tracking */
@media (max-width: 768px) {
  .rent-summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .rent-status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .rent-payment-status {
    align-items: flex-start;
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .property-documents-card {
    grid-column: 1;
    grid-row: 6;
  }

  .rent-tracking-card {
    grid-column: 1;
    grid-row: 7;
  }

  .documents-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

/* Dark Mode Styles */
:global(body.body--dark) .property-view-container {
  background: #121212;
}

:global(body.body--dark) .property-sidebar {
  background: transparent;
}

:global(body.body--dark) .property-list-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .property-list-card--summary {
  background: linear-gradient(180deg, #223041 0%, #15202b 100%) !important;
}

:global(body.body--dark) .property-summary-label {
  color: #9fb0c3;
}

:global(body.body--dark) .property-summary-title {
  color: #e6edf3;
}

:global(body.body--dark) .property-summary-sub {
  color: #9fb0c3;
}

:global(body.body--dark) .property-list-item {
  background: transparent;
  color: white;
}

:global(body.body--dark) .property-list-item:hover {
  background: #2d2d2d;
}

:global(body.body--dark) .property-content {
  background: transparent;
}

:global(body.body--dark) .property-image-card,
:global(body.body--dark) .property-info-card,
:global(body.body--dark) .tasks-summary-card,
:global(body.body--dark) .transaction-summary-card,
:global(body.body--dark) .lease-status-card,
:global(body.body--dark) .rent-tracking-card,
:global(body.body--dark) .property-documents-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .info-grid,
:global(body.body--dark) .tasks-grid,
:global(body.body--dark) .financial-grid {
  background: transparent;
}

:global(body.body--dark) .info-item,
:global(body.body--dark) .task-item,
:global(body.body--dark) .financial-item,
:global(body.body--dark) .lease-item {
  background: #2d2d2d !important;
  border-color: #3d3d3d !important;
  color: white;
}

:global(body.body--dark) .info-label,
:global(body.body--dark) .task-label,
:global(body.body--dark) .financial-label,
:global(body.body--dark) .lease-label {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .info-value,
:global(body.body--dark) .task-count,
:global(body.body--dark) .financial-value,
:global(body.body--dark) .lease-value {
  color: white !important;
}

:global(body.body--dark) .rent-summary,
:global(body.body--dark) .rent-status-list {
  background: transparent;
}

:global(body.body--dark) .rent-summary-item {
  background: #2d2d2d !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .rent-summary-label {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .rent-summary-value {
  color: white !important;
}

:global(body.body--dark) .rent-status-item {
  background: #2d2d2d !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .rent-tenant-name {
  color: white !important;
}

:global(body.body--dark) .rent-tenant-amount {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .documents-grid {
  background: transparent;
}

:global(body.body--dark) .document-item {
  background: #2d2d2d !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .document-thumbnail {
  background: #3d3d3d !important;
}

:global(body.body--dark) .document-file-icon {
  background: #3d3d3d !important;
}

:global(body.body--dark) .document-info {
  background: #2d2d2d !important;
}

:global(body.body--dark) .document-name {
  color: white !important;
}

:global(body.body--dark) .document-date {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .no-documents,
:global(body.body--dark) .no-lease,
:global(body.body--dark) .no-rent-data {
  background: transparent;
  color: #b0b0b0;
}

:global(body.body--dark) .photo-management-dialog {
  background: #121212 !important;
}

:global(body.body--dark) .photo-management-content {
  background: #121212 !important;
}

:global(body.body--dark) .upload-section {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .photos-grid {
  background: transparent;
}

:global(body.body--dark) .photo-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .photo-info {
  background: #1e1e1e !important;
}

:global(body.body--dark) .photo-description {
  color: white !important;
}

:global(body.body--dark) .meta-item {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .file-preview {
  background: #3d3d3d !important;
}

:global(body.body--dark) .file-type-badge {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .empty-photos {
  background: transparent;
  color: #b0b0b0;
}
</style>
