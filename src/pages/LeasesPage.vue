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
        <q-btn to="/create-lease" color="primary" icon="add" label="Create New Lease" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-primary">{{ filteredLeases.length }}</div>
          <div class="text-subtitle2">Total Leases</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-green">{{ availableCount }}</div>
          <div class="text-subtitle2">Available</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-blue">{{ rentedCount }}</div>
          <div class="text-subtitle2">Rented</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-orange">{{ pendingCount }}</div>
          <div class="text-subtitle2">Pending</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-red">{{ expiredCount }}</div>
          <div class="text-subtitle2">Expired</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Search and Filters -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input v-model="searchQuery" placeholder="Search leases..." outlined dense clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
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
        {{ searchQuery ? 'No leases found matching your search' : 'No leases found' }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          searchQuery ? 'Try adjusting your search terms' : 'Create your first lease to get started'
        }}
      </div>
    </div>

    <!-- Leases Grid -->
    <div v-else class="row">
      <div
        v-for="lease in filteredLeases"
        :key="lease.id"
        class="col-12 col-md-6 q-gutter-md"
        style="margin-right: 5px"
      >
        <q-card class="lease-card h-100" clickable @click="viewLease(lease)">
          <!-- Header Section -->
          <q-card-section class="bg-primary text-white compact-header">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">
                  {{ lease.property_id?.nickname || lease.property_id?.displayName || 'N/A' }}
                </div>
                <div class="text-caption opacity-80">
                  {{ lease.property_id?.address || 'N/A' }}
                </div>
                <q-chip
                  :color="getLeaseStatusColor(lease.status)"
                  text-color="white"
                  size="sm"
                  class="q-mt-xs"
                >
                  {{ lease.status || 'Unknown' }}
                </q-chip>
              </div>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  color="secondary"
                  icon="inventory"
                  label="Inventory"
                  @click.stop="openInventoryDialog(lease)"
                  class="inventory-btn"
                  size="sm"
                />
                <q-btn
                  flat
                  color="secondary"
                  icon="description"
                  label="Documents"
                  @click.stop="openDocumentsDialog(lease)"
                  class="documents-btn"
                  size="sm"
                />
              </div>
            </div>
            <div class="text-caption q-mt-xs opacity-80">ID: {{ lease.id || 'N/A' }}</div>
          </q-card-section>

          <!-- Content Section -->
          <q-card-section class="flex-grow compact-content">
            <!-- Rate Information -->
            <div class="text-center q-mb-sm">
              <div class="text-h6 text-primary text-weight-bold">
                ${{ formatAmount(lease.rate_amount) }}
              </div>
              <div class="text-caption text-grey-6">per {{ getRateType(lease) }}</div>
            </div>

            <!-- Property Details -->
            <div class="row q-mb-sm" v-if="lease.property_id">
              <div class="col-6">
                <div class="text-caption text-grey-6">Property Type</div>
                <div class="text-caption">{{ lease.property_id.spec?.type || 'N/A' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Bedrooms</div>
                <div class="text-caption">{{ lease.property_id.spec?.bedroom || 'N/A' }}</div>
              </div>
            </div>

            <!-- Key Details -->
            <div class="row q-mb-sm">
              <div class="col-3">
                <div class="text-caption text-grey-6">Available</div>
                <div class="text-caption">
                  {{ formatDate(lease.lease_create_date) }}
                </div>
              </div>
              <div class="col-3">
                <div class="text-caption text-grey-6">Deposit</div>
                <div class="text-caption">${{ formatAmount(lease.deposit) }}</div>
              </div>
              <div class="col-3">
                <div class="text-caption text-grey-6">Pet Fee</div>
                <div class="text-caption">${{ formatAmount(lease.pet_fee) }}</div>
              </div>
              <div class="col-3">
                <div class="text-caption text-grey-6">App Fee</div>
                <div class="text-caption">
                  ${{ formatAmount(lease.application_fee_per_person) }}
                </div>
              </div>
            </div>

            <div class="row q-gutter-xs q-mb-sm"></div>
            <!-- Special Terms (only if exists) -->
            <div v-if="lease.special_terms" class="q-mb-sm">
              <div class="text-caption text-grey-6">Special Terms</div>
              <div class="text-caption text-truncate">
                {{ lease.special_terms }}
              </div>
            </div>

            <!-- Created Date -->
            <div class="text-caption text-grey-6 q-mt-sm">
              Created: {{ formatDate(lease.created_datetime) }}
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
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">
              {{
                selectedLease
                  ? selectedLease.property_id?.nickname ||
                    selectedLease.property_id?.displayName ||
                    'Lease Details'
                  : 'Lease Details'
              }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!isEditMode"
                color="secondary"
                icon="inventory"
                label="Inventory"
                @click="openInventoryDialog"
                class="inventory-btn"
              />
              <q-btn
                v-if="!isEditMode"
                color="info"
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import InventoryList from '../components/InventoryList.vue'
import LeaseDocuments from '../components/LeaseDocuments.vue'
import { Notify } from 'quasar'

// Store
const userDataStore = useUserDataStore()
const { updateDocument } = useFirebase()

// Reactive data
const searchQuery = ref('')
const showLeaseDialog = ref(false)
const selectedLease = ref(null)
const isEditMode = ref(false)
const editLoading = ref(false)

// Inventory dialog states
const showInventoryDialog = ref(false)
const currentInventoryData = ref(null)

// Documents dialog states
const showDocumentsDialog = ref(false)

// Get leases the user has access to
const userAccessibleLeases = computed(() => userDataStore.userAccessibleLeases)

// Filter leases based on search query
const filteredLeases = computed(() => {
  let leases = userAccessibleLeases.value

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

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

// Get color for lease status
const getLeaseStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Rented: 'blue',
    Pending: 'orange',
    Expired: 'red',
    Terminated: 'grey',
  }
  return colors[status] || 'grey'
}

// Dialog functions
const viewLease = (lease) => {
  selectedLease.value = { ...lease }
  isEditMode.value = false
  showLeaseDialog.value = true
}

const closeLeaseDialog = () => {
  showLeaseDialog.value = false
  selectedLease.value = null
  isEditMode.value = false
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
})

// Watch for changes in accessible leases
watch(
  () => userAccessibleLeases.value,
  (newLeases) => {
    console.log('=== User accessible leases changed ===')
    console.log('New accessible leases count:', newLeases.length)
    console.log('New accessible leases:', newLeases)
  },
  { deep: true },
)
</script>

<style scoped>
.summary-card {
  min-width: 120px;
  flex: 1;
}

.lease-card {
  max-height: 400px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.lease-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(36, 87, 115, 0.02) 0%, rgba(36, 87, 115, 0.05) 100%);
}

.compact-header {
  padding: 12px 16px;
}

.compact-content {
  padding: 16px;
  flex-grow: 1;
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
  background: var(--q-primary);
  color: white;
  padding: 16px 24px;
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
}
</style>
