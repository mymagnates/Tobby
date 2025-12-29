<template>
  <q-page class="q-pa-md" style="padding-right: 5px">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Property View</div>
    </div>

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
          to="/create-property"
          color="primary"
          label="Create Your First Property"
          class="q-mr-sm"
        />
        <q-btn to="/user-profile" color="secondary" label="Assign Roles to Properties" flat />
      </div>
    </div>

    <div v-else class="property-view-container">
      <!-- Left Sidebar - Property Selection -->
      <div class="property-sidebar">
        <q-card class="property-list-card">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle1 q-mb-sm">Select Property</div>
            <q-list dense>
              <q-item
                v-for="property in userProperties"
                :key="property.id"
                clickable
                v-ripple
                :active="selectedProperty?.id === property.id"
                @click="selectProperty(property)"
                class="property-list-item"
              >
                <q-item-section>
                  <q-item-label>{{ property.nickname || property.address }}</q-item-label>
                  <q-item-label caption>{{ property.address }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip :color="getStatusColor(property.status)" text-color="white" size="sm">
                    {{ property.status }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Action Buttons Card -->
        <q-card class="action-buttons-card">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle1 q-mb-sm">Actions</div>
            <div class="action-buttons">
              <q-btn
                icon="refresh"
                color="primary"
                label="Refresh"
                @click="refreshData"
                :loading="loading"
                flat
                class="action-btn"
              />
              <q-btn
                v-if="selectedProperty"
                color="primary"
                icon="photo_camera"
                label="Manage Photos"
                @click="openPhotoManagementDialog"
                class="action-btn"
                no-caps
              />
              <q-btn
                color="primary"
                icon="add"
                label="Create Property"
                @click="openCreatePropertyDialog"
                class="action-btn"
              />
              <q-btn
                v-if="selectedProperty"
                color="primary"
                icon="dns"
                label="Create Task"
                @click="openCreateMxRecordDialog"
                class="action-btn"
              />
              <q-btn
                v-if="selectedProperty"
                color="primary"
                icon="receipt_long"
                label="Create Transaction"
                @click="openCreateTransactionDialog"
                class="action-btn"
              />
              <q-btn
                v-if="selectedProperty"
                color="primary"
                icon="home_work"
                label="Create Lease"
                @click="openCreateLeaseDialog"
                class="action-btn"
              />
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
              :src="selectedProperty.image_url || '/placeholder-property.jpg'"
              :alt="selectedProperty.nickname"
              class="property-main-image"
              fit="cover"
            >
            </q-img>
          </q-card>

          <!-- Basic Information Card -->
          <q-card class="property-info-card" clickable @click="viewProperty(selectedProperty.id)">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" />
                Basic Information
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
                      {{ selectedProperty.userRole }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tasks Summary Card -->
          <q-card class="tasks-summary-card">
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
          <q-card class="transaction-summary-card">
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

          <!-- Lease Status Card -->
          <q-card class="lease-status-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="home_work" class="q-mr-sm" />
                Current Lease Status
              </div>

              <div v-if="getCurrentLease()" class="lease-info">
                <div class="lease-item">
                  <div class="lease-label">Tenant</div>
                  <div class="lease-value">{{ getCurrentLease().tenant_name || 'N/A' }}</div>
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
                    {{ formatDate(getCurrentLease().lease_start_date) }}
                  </div>
                </div>
                <div class="lease-item">
                  <div class="lease-label">Lease End</div>
                  <div class="lease-value">{{ formatDate(getCurrentLease().lease_end_date) }}</div>
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

              <div v-else class="no-lease">
                <q-icon name="home_work" size="50px" color="grey-4" />
                <div class="text-grey-6 q-mt-sm">No Active Lease</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Rent Tracking Card -->
          <q-card class="rent-tracking-card">
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

    <!-- Property Detail Dialog (kept from original) -->
    <q-dialog v-model="showPropertyDialog" maximized>
      <q-card>
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">
              {{
                selectedProperty
                  ? selectedProperty.nickname || 'Property Details'
                  : 'Property Details'
              }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="closePropertyDialog"
                class="dialog-close-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="primary"
                icon="edit"
                label="Edit"
                @click="toggleEditMode"
                class="edit-btn"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div v-if="selectedProperty" class="property-detail-content">
            <!-- Property Image -->
            <div class="property-detail-image q-mb-lg">
              <q-img
                :src="selectedProperty.image_url || '/placeholder-property.jpg'"
                :alt="selectedProperty.nickname"
                class="property-detail-img"
                fit="cover"
              />
            </div>

            <!-- Property Information -->
            <div class="property-detail-info">
              <div class="row q-gutter-lg">
                <div class="col-12 col-md-6">
                  <div class="detail-section">
                    <div class="text-h6 q-mb-md">Basic Information</div>
                    <div class="detail-item">
                      <div class="detail-label">Property Name</div>
                      <div class="detail-value">{{ selectedProperty.nickname || 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Address</div>
                      <div class="detail-value">{{ selectedProperty.address || 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Type</div>
                      <div class="detail-value">{{ selectedProperty.type || 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Status</div>
                      <div class="detail-value">
                        <q-chip
                          :color="getStatusColor(selectedProperty.status)"
                          text-color="white"
                          size="sm"
                        >
                          {{ selectedProperty.status }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="detail-section">
                    <div class="text-h6 q-mb-md">Specifications</div>
                    <div class="detail-item">
                      <div class="detail-label">Bedrooms</div>
                      <div class="detail-value">{{ selectedProperty.spec?.bedroom || 'N/A' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Bathrooms</div>
                      <div class="detail-value">
                        {{ selectedProperty.spec?.full_bathroom || 'N/A' }}
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Size</div>
                      <div class="detail-value">
                        {{
                          selectedProperty.spec?.size
                            ? `${selectedProperty.spec?.size} sq ft`
                            : 'N/A'
                        }}
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Your Role</div>
                      <div class="detail-value">
                        <q-chip
                          :color="getRoleColor(selectedProperty.userRole)"
                          text-color="white"
                          size="sm"
                        >
                          {{ selectedProperty.userRole }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn v-if="isEditMode" flat label="Cancel" @click="cancelEdit" class="q-mr-sm" />
          <q-btn
            v-if="isEditMode"
            color="primary"
            label="Save"
            @click="saveProperty"
            :loading="editLoading"
          />
          <q-btn v-else flat label="Close" @click="closePropertyDialog" />
        </q-card-actions>
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
            @mx-record-created="onMxRecordCreated"
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
          <CreateLease
            :property-id="selectedProperty?.id"
            :property-name="selectedProperty?.nickname"
            @lease-created="onLeaseCreated"
            @cancel="closeCreateLeaseDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Property Dialog -->
    <q-dialog v-model="showCreatePropertyDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Property</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreatePropertyDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateProperty
            @property-created="onPropertyCreated"
            @cancel="closeCreatePropertyDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Photo Management Dialog -->
    <q-dialog v-model="showPhotoManagementDialog" maximized>
      <q-card class="photo-management-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">
              <q-icon name="photo_camera" class="q-mr-sm" />
              Manage Property Photos
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
            <div class="upload-section q-mb-lg">
              <div class="section-header">
                <div class="text-h6 text-weight-medium">Upload New Photos</div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Upload new photos for {{ selectedProperty.nickname || selectedProperty.address }}
                </div>
              </div>

              <q-form @submit="uploadPhotos" class="upload-form">
                <div class="upload-fields">
                  <!-- File Upload -->
                  <div class="upload-field">
                    <q-file
                      v-model="uploadFiles"
                      accept="image/*"
                      outlined
                      dense
                      label="Choose photos *"
                      multiple
                      bg-color="grey-1"
                      :rules="[(val) => !!val || 'At least one photo is required']"
                      @update:model-value="onPhotosSelected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="photo_library" />
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
                    label="Upload Photos"
                    :loading="uploading"
                    :disable="!uploadFiles || uploadFiles.length === 0"
                  />
                </div>
              </q-form>
            </div>

            <!-- Current Photos Section -->
            <div class="photos-section">
              <div class="section-header">
                <div class="row items-center justify-between">
                  <div class="text-h6 text-weight-medium">
                    Current Photos ({{ propertyPhotos.length }})
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="refresh"
                    color="primary"
                    @click="loadPropertyPhotos"
                    :loading="loadingPhotos"
                    size="sm"
                  >
                    <q-tooltip>Refresh photos</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loadingPhotos" class="loading-photos q-mt-md">
                <div class="text-center q-pa-md">
                  <q-spinner-dots size="40px" color="primary" />
                  <div class="text-body2 text-grey-6 q-mt-sm">Loading photos...</div>
                </div>
              </div>

              <!-- Photos Grid -->
              <div v-else-if="propertyPhotos.length > 0" class="photos-grid q-mt-md">
                <div v-for="photo in propertyPhotos" :key="photo.id" class="photo-card">
                  <!-- Photo -->
                  <div class="photo-container">
                    <q-img
                      :src="photo.image_url"
                      :alt="photo.description || 'Property photo'"
                      class="photo-image"
                      fit="cover"
                      @click="showPhotoFullscreen(photo.image_url, photo.description)"
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

                    <!-- Photo Overlay -->
                    <div class="photo-overlay">
                      <div class="photo-actions">
                        <q-btn
                          flat
                          round
                          icon="zoom_in"
                          color="white"
                          size="sm"
                          @click.stop="showPhotoFullscreen(photo.image_url, photo.description)"
                        >
                          <q-tooltip>View fullscreen</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="negative"
                          size="sm"
                          @click.stop="confirmDeletePhoto(photo)"
                        >
                          <q-tooltip>Delete photo</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <!-- Set as Main Photo Button -->
                    <div class="photo-main-action">
                      <q-btn
                        v-if="selectedProperty.image_url !== photo.image_url"
                        flat
                        dense
                        color="primary"
                        size="sm"
                        icon="star_border"
                        label="Set as Main"
                        @click="setAsMainPhoto(photo)"
                      />
                      <q-chip
                        v-else
                        color="primary"
                        text-color="white"
                        size="sm"
                        icon="star"
                        label="Main Photo"
                      />
                    </div>
                  </div>

                  <!-- Photo Info -->
                  <div class="photo-info">
                    <div class="photo-description">
                      {{ photo.description || 'No description' }}
                    </div>
                    <div class="photo-meta">
                      <div class="meta-item">
                        <q-icon name="event" size="14px" class="q-mr-xs" />
                        {{ formatDate(photo.upload_date) }}
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
  </q-page>
</template>

<script setup>
import { onMounted, computed, watch, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'
import CreateProperty from '../components/CreateProperty.vue'

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
} = useFirebase()

// Dialog state
const showPropertyDialog = ref(false)
const selectedProperty = ref(null)
const isEditMode = ref(false)
const editLoading = ref(false)

// Create form dialogs
const showCreatePropertyDialog = ref(false)
const showCreateMxRecordDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)

// Photo management dialogs
const showPhotoManagementDialog = ref(false)
const showPhotoFullscreenDialog = ref(false)
const showDeletePhotoDialog = ref(false)

// Photo management data
const propertyPhotos = ref([])
const uploadFiles = ref(null)
const uploading = ref(false)
const loadingPhotos = ref(false)
const deletingPhoto = ref(false)
const photoToDelete = ref(null)
const currentPhotoUrl = ref('')
const currentPhotoTitle = ref('')

const loading = computed(() => userDataStore.loading)
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
  if (selectedProperty.value) {
    showPhotoManagementDialog.value = true
    loadPropertyPhotos()
  }
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

const onPhotosSelected = (files) => {
  console.log('Photos selected:', files?.length || 0)
}

const uploadPhotos = async () => {
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
  photoToDelete.value = photo
  showDeletePhotoDialog.value = true
}

const deletePhoto = async () => {
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
      selectedProperty.value = userProperties.value[0]
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
      selectedProperty.value = newProperties[0]
    }
  },
  { immediate: true },
)

// Watch for property changes to load photos
watch(
  selectedProperty,
  () => {
    // Load photos when property changes
    if (selectedProperty.value) {
      loadPropertyPhotos()
    }
  },
  { immediate: true },
)

const getStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Occupied: 'blue',
    Maintenance: 'orange',
    Inactive: 'grey',
  }
  return colors[status] || 'grey'
}

const getRoleColor = (role) => {
  const colors = {
    'Property Owner': 'deep-purple',
    'Property Manager': 'blue',
    Tenant: 'green',
    Contractor: 'orange',
    Other: 'grey',
  }
  return colors[role] || 'grey'
}

const getLeaseStatusColor = (status) => {
  const colors = {
    Active: 'green',
    Expired: 'red',
    Pending: 'orange',
    Cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  if (typeof date === 'string') return date
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return 'Invalid date'
}

const selectProperty = (property) => {
  selectedProperty.value = property
  console.log('PropertyView - Selected property:', property)
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
  return userDataStore.leases.filter(
    (lease) => lease.property_id === selectedProperty.value.id && lease.status === 'Active',
  ).length
}

const getUpcomingRenewalsCount = () => {
  if (!selectedProperty.value) return 0
  const now = new Date()
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  return userDataStore.leases.filter((lease) => {
    if (lease.property_id !== selectedProperty.value.id || lease.status !== 'Active') return false
    const endDate = new Date(lease.lease_end_date)
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
  return userDataStore.leases.find(
    (lease) => lease.property_id === selectedProperty.value.id && lease.status === 'Active',
  )
}

// Get all active leases for property
const getPropertyLeases = () => {
  if (!selectedProperty.value) return []
  return userDataStore.leases.filter(
    (lease) => lease.property_id === selectedProperty.value.id && lease.status === 'Active',
  )
}

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
    if (t.property_id !== selectedProperty.value.id) return false
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
      if (t.property_id !== selectedProperty.value.id) return false
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

// Navigation functions
const viewProperty = (propertyId) => {
  const property = userProperties.value.find((p) => p.id === propertyId)
  if (property) {
    selectedProperty.value = { ...property }
    showPropertyDialog.value = true
  }
}

// Dialog functions
const openCreatePropertyDialog = () => {
  try {
    showCreatePropertyDialog.value = true
  } catch (error) {
    console.warn('PropertyView - Error opening create property dialog:', error)
  }
}

const closeCreatePropertyDialog = () => {
  try {
    showCreatePropertyDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create property dialog:', error)
  }
}

const openCreateMxRecordDialog = () => {
  try {
    showCreateMxRecordDialog.value = true
  } catch (error) {
    console.warn('PropertyView - Error opening create task dialog:', error)
  }
}

const closeCreateMxRecordDialog = () => {
  try {
    showCreateMxRecordDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create task dialog:', error)
  }
}

const openCreateTransactionDialog = () => {
  try {
    showCreateTransactionDialog.value = true
  } catch (error) {
    console.warn('PropertyView - Error opening create transaction dialog:', error)
  }
}

const closeCreateTransactionDialog = () => {
  try {
    showCreateTransactionDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create transaction dialog:', error)
  }
}

const openCreateLeaseDialog = () => {
  try {
    showCreateLeaseDialog.value = true
  } catch (error) {
    console.warn('PropertyView - Error opening create lease dialog:', error)
  }
}

const closeCreateLeaseDialog = () => {
  try {
    showCreateLeaseDialog.value = false
  } catch (error) {
    console.warn('PropertyView - Error closing create lease dialog:', error)
  }
}

// Event handlers for form completion
const onPropertyCreated = () => {
  try {
    closeCreatePropertyDialog()
    refreshData()
  } catch (error) {
    console.warn('PropertyView - Error in onPropertyCreated:', error)
  }
}

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

// Dialog functions
const closePropertyDialog = () => {
  showPropertyDialog.value = false
  selectedProperty.value = null
  isEditMode.value = false
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const saveProperty = async () => {
  try {
    editLoading.value = true
    // For now, we'll just show a success message
    // In a real app, you'd call userDataStore.updateProperty(selectedProperty.value)

    isEditMode.value = false
    // Refresh the data to get updated information
    await refreshData()
  } catch (error) {
    console.error('Error saving property:', error)
  } finally {
    editLoading.value = false
  }
}

const cancelEdit = () => {
  // Reset to original property data
  const originalProperty = userProperties.value.find((p) => p.id === selectedProperty.value.id)
  if (originalProperty) {
    selectedProperty.value = { ...originalProperty }
  }
  isEditMode.value = false
}
</script>

<style scoped>
.property-view-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 120px);
}

.property-sidebar {
  overflow-y: auto;
}

.property-list-card {
  height: fit-content;
  max-height: calc(50vh - 80px);
  margin-bottom: 16px;
}

.action-buttons-card {
  height: fit-content;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
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
  gap: 24px;
  height: fit-content;
}

.property-image-card {
  grid-column: 1 / -1;
  grid-row: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.property-image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.property-main-image {
  height: 300px;
  border-radius: 8px;
}

.property-info-card {
  grid-column: 1;
  grid-row: 2;
  transition: all 0.2s ease;
  cursor: pointer;
}

.property-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tasks-summary-card {
  grid-column: 2;
  grid-row: 2;
}

.transaction-summary-card {
  grid-column: 1;
  grid-row: 3;
}

.lease-status-card {
  grid-column: 2;
  grid-row: 3;
}

.rent-tracking-card {
  grid-column: 1 / -1;
  grid-row: 4;
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

.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}

.property-detail-content {
  max-width: 1200px;
  margin: 0 auto;
}

.property-detail-image {
  text-align: center;
}

.property-detail-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--neutral-200);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--neutral-700);
}

.detail-value {
  color: var(--neutral-600);
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

  .lease-status-card {
    grid-column: 1;
    grid-row: 5;
  }
}

@media (max-width: 768px) {
  .info-grid,
  .tasks-grid,
  .financial-grid {
    grid-template-columns: 1fr;
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
  .rent-tracking-card {
    grid-column: 1;
    grid-row: 6;
  }
}
</style>
