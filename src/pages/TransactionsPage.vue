<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">My Transactions</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="primary"
          label="Refresh"
          @click="refreshData"
          :loading="userDataStore.transactionsLoading"
        />
        <q-btn to="/create-transaction" color="primary" icon="add" label="Create Transaction" />
      </div>
    </div>

    <!-- Search Bar -->
    <div class="q-mb-md">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search transactions by description, property, or transaction type..."
        clearable
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Summary Stats -->
    <div class="row q-gutter-md q-mb-md">
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeTypeFilter === 'all' }"
        @click="clearTypeFilter"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ filteredTransactions.length }}</div>
          <div class="text-caption">Total Transactions</div>
        </q-card-section>
      </q-card>
      <q-card
        v-for="type in transactionTypes"
        :key="type"
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeTypeFilter === type }"
        @click="setTypeFilter(type)"
      >
        <q-card-section class="text-center">
          <div class="text-h6" :class="getTransactionTypeTextColor(type)">
            {{ getTypeCount(type) }}
          </div>
          <div class="text-caption">{{ type }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Active Filter Display -->
    <div v-if="activeTypeFilter !== 'all'" class="q-mb-md">
      <q-chip
        :color="getTransactionTypeColor(activeTypeFilter)"
        text-color="white"
        removable
        @remove="clearTypeFilter"
      >
        <q-icon :name="getTransactionIcon(activeTypeFilter)" class="q-mr-xs" />
        {{ activeTypeFilter }}
        <q-badge color="white" text-color="black" class="q-ml-xs">
          {{ getTypeCount(activeTypeFilter) }}
        </q-badge>
      </q-chip>
    </div>

    <!-- Loading State -->
    <div v-if="userDataStore.transactionsLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Loading transactions...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center q-pa-lg">
      <q-icon name="receipt" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{
          searchQuery || activeTypeFilter !== 'all'
            ? 'No transactions found matching your filters'
            : 'No transactions found'
        }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          searchQuery || activeTypeFilter !== 'all'
            ? 'Try adjusting your search terms or filters'
            : "You don't have any transactions for your properties yet."
        }}
      </div>
    </div>

    <!-- Transactions List -->
    <div v-else class="transactions-list">
      <q-card
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="transaction-row clickable-row"
        @click="viewTransaction(transaction)"
      >
        <q-card-section class="transaction-row-content">
          <!-- Transaction Type Icon -->
          <div class="transaction-icon">
            <q-icon
              :name="getTransactionIcon(transaction.transac_type)"
              size="32px"
              :color="getTransactionTypeColor(transaction.transac_type)"
            />
            <!-- Image indicator -->
            <q-icon
              v-if="transaction.picture_url"
              name="photo"
              size="14px"
              color="primary"
              class="image-indicator"
            >
              <q-tooltip>This transaction has an attached image</q-tooltip>
            </q-icon>
          </div>

          <!-- Combined Description -->
          <div class="transaction-description">
            <div class="description-title">{{ transaction.transac_type || 'Unknown Type' }}</div>
            <div class="description-subtitle">
              {{ getPropertyName(transaction.property_id) }} •
              {{ capitalizeFirst(transaction.transac_from || 'Unknown') }} →
              {{ capitalizeFirst(transaction.transac_to || 'Unknown') }}
            </div>
          </div>

          <!-- Date -->
          <div class="transaction-date">
            <div class="date-label">Date</div>
            <div class="date-value">{{ formatDate(transaction.transac_date) }}</div>
          </div>

          <!-- Amount -->
          <div class="transaction-amount">
            <div class="amount-label">Amount</div>
            <div class="amount-value">${{ formatAmount(transaction.amount) }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showTransactionDialog" maximized>
      <q-card class="transaction-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">Transaction Details</div>
            <q-btn flat round icon="close" @click="closeTransactionDialog" class="close-btn" />
          </div>
        </q-card-section>

        <q-card-section class="dialog-content">
          <div v-if="selectedTransaction" class="transaction-details-full">
            <!-- Basic Information -->
            <div class="details-section">
              <div class="section-title">Transaction Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Transaction ID</div>
                  <div class="detail-value">{{ selectedTransaction.transac_id || 'N/A' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Type</div>
                  <div class="detail-value">
                    <q-chip
                      :color="getTransactionTypeColor(selectedTransaction.transac_type)"
                      text-color="white"
                      size="sm"
                    >
                      {{ selectedTransaction.transac_type || 'Unknown' }}
                    </q-chip>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Amount</div>
                  <div class="detail-value">${{ formatAmount(selectedTransaction.amount) }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Property</div>
                  <div class="detail-value">
                    {{ getPropertyName(selectedTransaction.property_id) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Details -->
            <div class="details-section">
              <div class="section-title">Transaction Details</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">From</div>
                  <div class="detail-value">
                    {{ capitalizeFirst(selectedTransaction.transac_from || 'Unknown') }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">To</div>
                  <div class="detail-value">
                    {{ capitalizeFirst(selectedTransaction.transac_to || 'Unknown') }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Date</div>
                  <div class="detail-value">{{ formatDate(selectedTransaction.transac_date) }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Lease ID</div>
                  <div class="detail-value">{{ selectedTransaction.lease_id || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Transaction Image Section -->
            <div class="details-section">
              <div class="section-title">
                <q-icon name="photo" class="q-mr-sm" />
                Transaction Image
                <q-btn
                  flat
                  dense
                  :icon="selectedTransaction.picture_url ? 'edit' : 'add_photo_alternate'"
                  :label="selectedTransaction.picture_url ? 'Update Picture' : 'Add Picture'"
                  color="primary"
                  class="q-ml-auto"
                  @click="openPictureUploadDialog"
                />
              </div>

              <!-- Existing Image Preview -->
              <div
                v-if="selectedTransaction.picture_url"
                class="transaction-image-preview-container"
              >
                <div
                  class="image-preview-card"
                  @click="showImageFullscreen(selectedTransaction.picture_url)"
                >
                  <q-img
                    :src="selectedTransaction.picture_url"
                    class="transaction-image-preview"
                    fit="cover"
                  >
                    <template v-slot:loading>
                      <q-spinner-gears color="primary" />
                    </template>
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        <div class="text-center">
                          <q-icon name="broken_image" size="24px" />
                          <div class="q-mt-xs text-caption">Failed to load</div>
                        </div>
                      </div>
                    </template>
                  </q-img>
                  <div class="image-preview-overlay">
                    <q-icon name="zoom_in" size="24px" color="white" />
                    <div class="text-caption text-white q-mt-xs">Click to enlarge</div>
                  </div>
                </div>
              </div>

              <!-- No Image State -->
              <div v-else class="no-image-state">
                <q-icon name="image" size="48px" color="grey-4" />
                <div class="text-body2 text-grey-6 q-mt-sm">
                  No image attached to this transaction
                </div>
                <div class="text-caption text-grey-5">Click "Add Picture" to attach an image</div>
              </div>
            </div>

            <!-- User Information -->
            <div class="details-section">
              <div class="section-title">User Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Role</div>
                  <div class="detail-value">{{ selectedTransaction.role || 'Unknown' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Created By</div>
                  <div class="detail-value">
                    {{ getCreatedByDisplay(selectedTransaction.created_by) }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">
                    {{ formatDate(selectedTransaction.created_datetime) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Log -->
            <div
              v-if="selectedTransaction.logs && selectedTransaction.logs.length > 0"
              class="details-section"
            >
              <div class="section-title">Activity Log</div>
              <div class="activity-log">
                <div
                  v-for="log in selectedTransaction.logs"
                  :key="log.log_timestamp"
                  class="log-entry"
                >
                  <div class="log-header">
                    <div class="log-user">
                      <strong>{{ log.user_name }}</strong>
                      <span class="log-role">({{ log.user_role }})</span>
                    </div>
                    <div class="log-time">{{ formatDate(log.log_timestamp) }}</div>
                  </div>
                  <div class="log-comment">{{ log.comment }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Fullscreen Image Viewer -->
    <q-dialog v-model="showImageViewer" maximized>
      <q-card class="image-viewer-card">
        <q-card-section class="image-viewer-header">
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">Transaction Image</div>
            <q-btn flat round icon="close" @click="closeImageViewer" class="close-btn" />
          </div>
        </q-card-section>
        <q-card-section class="image-viewer-content">
          <q-img :src="currentImageUrl" class="fullscreen-image" fit="contain">
            <template v-slot:loading>
              <q-spinner-gears color="primary" size="50px" />
            </template>
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                <div class="text-center">
                  <q-icon name="broken_image" size="64px" />
                  <div class="q-mt-sm">Failed to load image</div>
                </div>
              </div>
            </template>
          </q-img>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Picture Upload Dialog -->
    <q-dialog v-model="showPictureUploadDialog" persistent>
      <q-card class="picture-upload-card">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">
              {{ selectedTransaction?.picture_url ? 'Update' : 'Add' }} Transaction Picture
            </div>
            <q-btn flat round icon="close" @click="closePictureUploadDialog" />
          </div>
        </q-card-section>

        <q-card-section class="dialog-content">
          <!-- File Upload -->
          <div class="picture-upload-section">
            <q-file
              v-model="uploadFile"
              accept="image/*"
              outlined
              dense
              label="Choose picture"
              bg-color="grey-1"
              class="q-mb-sm"
              @update:model-value="onUploadFileSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Current Image Preview -->
            <div
              v-if="selectedTransaction?.picture_url && !uploadImagePreview"
              class="current-image-section q-mb-md"
            >
              <div class="text-subtitle2 q-mb-sm">Current Image:</div>
              <div class="current-image-preview">
                <q-img :src="selectedTransaction.picture_url" class="current-image" fit="cover" />
              </div>
            </div>

            <!-- New Image Preview -->
            <div v-if="uploadImagePreview" class="new-image-preview q-mb-md">
              <div class="text-subtitle2 q-mb-sm">New Image Preview:</div>
              <div class="image-preview-container">
                <q-img :src="uploadImagePreview" class="upload-preview-image" fit="cover" />
                <q-btn
                  round
                  flat
                  icon="close"
                  color="negative"
                  class="remove-preview-btn"
                  @click="removeUploadImage"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="dialog-actions">
          <q-btn flat label="Cancel" @click="closePictureUploadDialog" />
          <q-btn
            color="primary"
            label="Save Picture"
            :loading="uploadingPicture"
            :disable="!uploadFile"
            @click="savePicture"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { extractPropertyId } from '../utils/propertyIdUtils'
import { Notify } from 'quasar'

const userDataStore = useUserDataStore()
const { updateDocument, uploadImages } = useFirebase()

// Dialog states
const showTransactionDialog = ref(false)
const selectedTransaction = ref(null)

// Image viewer states
const showImageViewer = ref(false)
const currentImageUrl = ref('')

// Picture upload states
const showPictureUploadDialog = ref(false)
const uploadFile = ref(null)
const uploadImagePreview = ref('')
const uploadingPicture = ref(false)

const searchQuery = ref('')
const activeTypeFilter = ref('all')

// Get all unique transaction types from available transactions
const transactionTypes = computed(() => {
  const types = new Set()
  userDataStore.userAccessibleTransactions.forEach((transaction) => {
    if (transaction.transac_type) {
      types.add(transaction.transac_type)
    }
  })
  return Array.from(types).sort()
})

// Get transactions the user has access to
const userAccessibleTransactions = computed(() => userDataStore.userAccessibleTransactions)

// Filter transactions based on search query and type filter
const filteredTransactions = computed(() => {
  let transactions = userAccessibleTransactions.value

  // Apply type filter first
  if (activeTypeFilter.value !== 'all') {
    transactions = transactions.filter(
      (transaction) => transaction.transac_type === activeTypeFilter.value,
    )
  }

  // Then apply search filter
  if (!searchQuery.value.trim()) {
    return transactions
  }

  const query = searchQuery.value.toLowerCase().trim()
  return transactions.filter((transaction) => {
    const transacType = (transaction.transac_type || '').toLowerCase()
    const propertyName = getPropertyName(transaction.property_id).toLowerCase()
    const transacFrom = (transaction.transac_from || '').toLowerCase()
    const transacTo = (transaction.transac_to || '').toLowerCase()
    const transacId = (transaction.transac_id || '').toLowerCase()
    const leaseId = (transaction.lease_id || '').toLowerCase()

    return (
      transacType.includes(query) ||
      propertyName.includes(query) ||
      transacFrom.includes(query) ||
      transacTo.includes(query) ||
      transacId.includes(query) ||
      leaseId.includes(query)
    )
  })
})

// Get count of transactions for a specific type
const getTypeCount = (type) => {
  if (type === 'all') {
    return userAccessibleTransactions.value.length
  }
  return userAccessibleTransactions.value.filter((transaction) => transaction.transac_type === type)
    .length
}

// Set type filter
const setTypeFilter = (type) => {
  activeTypeFilter.value = type
  console.log('Transaction type filter set to:', type)
}

// Clear type filter
const clearTypeFilter = () => {
  activeTypeFilter.value = 'all'
  console.log('Transaction type filter cleared')
}

// Get property name by ID
const getPropertyName = (propertyId) => {
  const property = userDataStore.getPropertyById(propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

// Get created by display name
const getCreatedByDisplay = (userId) => {
  if (userId === userDataStore.userId) {
    return 'You'
  }
  return userId || 'Unknown User'
}

// Format amount
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '0.00'

  // Format with commas for thousands and ensure 2 decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Capitalize first character of a string
const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'

  try {
    if (date.toDate) {
      // Firebase Timestamp
      return date.toDate().toLocaleDateString()
    } else if (date instanceof Date) {
      // JavaScript Date
      return date.toLocaleDateString()
    } else {
      // String date
      return new Date(date).toLocaleDateString()
    }
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

// Get color for transaction type
const getTransactionTypeColor = (type) => {
  const colors = {
    'Rent Payment': 'green',
    'Security Deposit': 'blue',
    'Maintenance Fee': 'orange',
    'Utility Payment': 'purple',
    'Insurance Payment': 'indigo',
    'Property Tax': 'red',
    'HOA Fee': 'teal',
    Other: 'grey',
  }
  return colors[type] || 'grey'
}

// Get text color class for transaction type
const getTransactionTypeTextColor = (type) => {
  const colors = {
    'Rent Payment': 'text-green',
    'Security Deposit': 'text-blue',
    'Maintenance Fee': 'text-orange',
    'Utility Payment': 'text-purple',
    'Insurance Payment': 'text-indigo',
    'Property Tax': 'text-red',
    'HOA Fee': 'text-teal',
    Other: 'text-grey',
  }
  return colors[type] || 'text-grey'
}

// View transaction details
const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDialog.value = true
}

const closeTransactionDialog = () => {
  showTransactionDialog.value = false
  selectedTransaction.value = null
}

// Image viewer functions
const showImageFullscreen = (imageUrl) => {
  currentImageUrl.value = imageUrl
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
}

// Picture upload functions
const openPictureUploadDialog = () => {
  showPictureUploadDialog.value = true
}

const closePictureUploadDialog = () => {
  showPictureUploadDialog.value = false
  uploadFile.value = null
  uploadImagePreview.value = ''
}

const onUploadFileSelected = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    uploadImagePreview.value = ''
  }
}

const removeUploadImage = () => {
  uploadFile.value = null
  uploadImagePreview.value = ''
}

const savePicture = async () => {
  if (!uploadFile.value || !selectedTransaction.value) {
    return
  }

  try {
    uploadingPicture.value = true

    // Extract property ID for upload context
    const propertyId = extractPropertyId(selectedTransaction.value.property_id)

    if (!propertyId) {
      throw new Error('Property ID is required for image upload')
    }

    // Upload image to Firebase Storage
    const uploadedUrls = await uploadImages([uploadFile.value], propertyId, 'transaction')

    if (!uploadedUrls || uploadedUrls.length === 0) {
      throw new Error('Failed to upload image')
    }

    const imageUrl = uploadedUrls[0]

    // Update transaction document in Firestore
    await updateDocument(`properties/${propertyId}/transactions`, selectedTransaction.value.id, {
      picture_url: imageUrl,
    })

    // Update local selectedTransaction
    selectedTransaction.value.picture_url = imageUrl

    // Update the transaction in the store
    const transactionIndex = userDataStore.userAccessibleTransactions.findIndex(
      (t) => t.id === selectedTransaction.value.id,
    )
    if (transactionIndex !== -1) {
      userDataStore.userAccessibleTransactions[transactionIndex].picture_url = imageUrl
    }

    // Show success message
    Notify.create({
      type: 'positive',
      message: 'Picture saved successfully!',
      position: 'top',
    })

    // Close dialog
    closePictureUploadDialog()
  } catch (error) {
    console.error('Error saving picture:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save picture. Please try again.',
      position: 'top',
    })
  } finally {
    uploadingPicture.value = false
  }
}

// Get transaction icon based on type
const getTransactionIcon = (type) => {
  const icons = {
    'Rent Payment': 'payments',
    'Security Deposit': 'security',
    'Maintenance Fee': 'build',
    'Utility Payment': 'electrical_services',
    'Insurance Payment': 'shield',
    'Property Tax': 'account_balance',
    'HOA Fee': 'home',
    Other: 'receipt',
  }
  return icons[type] || 'receipt'
}

// Refresh data
const refreshData = async () => {
  console.log('Refreshing transactions...')
  await userDataStore.loadAllUserData()
}

onMounted(async () => {
  if (userDataStore.isAuthenticated) {
    // Check if we have the necessary data
    if (userDataStore.userRoles.length === 0 || userDataStore.properties.length === 0) {
      await userDataStore.loadAllUserData()
    } else if (userDataStore.transactions.length === 0) {
      await userDataStore.loadTransactions()
    }
  }
})
</script>

<style scoped>
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-row {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin-bottom: 0;
}

.transaction-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--q-primary);
}

.transaction-row-content {
  display: grid;
  grid-template-columns: 64px 1fr 120px 150px;
  align-items: center;
  gap: 16px;
  padding: 16px;
  position: relative;
}

.transaction-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  grid-column: 1;
}

.transaction-description {
  min-width: 0;
  grid-column: 2;
}

.description-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 4px;
  word-break: break-word;
}

.description-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin-top: 2px;
  line-height: 1.3;
}

.transaction-date {
  text-align: center;
  grid-column: 3;
  justify-self: center;
}

.date-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.date-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.transaction-amount {
  text-align: right;
  grid-column: 4;
  justify-self: end;
  min-width: 120px;
  padding-left: 8px;
}

.amount-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  text-align: right;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1976d2;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  white-space: nowrap;
}

.search-input {
  max-width: 600px;
}

.cursor-pointer {
  cursor: pointer;
}

.summary-card {
  min-width: 120px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.summary-card.filter-active {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--q-primary);
}

/* Transaction Details Dialog Styles */
.transaction-dialog {
  background: white;
  border-radius: 0;
}

.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
}

.close-btn {
  color: #666;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.add-comment-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  min-height: 36px;
}

.dialog-content {
  padding: 24px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.transaction-details-full {
  max-width: 800px;
  margin: 0 auto;
}

.details-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
}

.activity-log {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #1976d2;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-role {
  color: #666;
  font-size: 0.875rem;
}

.log-time {
  color: #666;
  font-size: 0.875rem;
}

.log-comment {
  color: #1a1a1a;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .transaction-row-content {
    display: grid;
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto auto;
    gap: 12px;
    padding: 12px;
    grid-template-areas:
      'icon description'
      'amount amount'
      'date date';
  }

  .transaction-icon {
    grid-area: icon;
    width: 48px;
    height: 48px;
  }

  .transaction-description {
    grid-area: description;
  }

  .transaction-amount {
    grid-area: amount;
    text-align: left;
    justify-self: start;
    padding: 8px 0;
    border-top: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
  }

  .transaction-date {
    grid-area: date;
    text-align: left;
    justify-self: start;
  }

  .dialog-header {
    padding: 12px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* Image-related styles */
.image-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  background: white;
  border-radius: 50%;
  padding: 1px;
}

.transaction-image-preview-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.image-preview-card {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--neutral-200);
}

.image-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.transaction-image-preview {
  width: 100%;
  height: 100%;
}

.image-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-card:hover .image-preview-overlay {
  opacity: 1;
}

.image-viewer-card {
  background: #000;
}

.image-viewer-header {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
}

.image-viewer-content {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.fullscreen-image {
  width: 100%;
  height: 100%;
}

.close-btn {
  color: white;
}

/* Picture upload dialog styles */
.picture-upload-card {
  min-width: 400px;
  max-width: 600px;
}

.picture-upload-section {
  padding: 16px 0;
}

.current-image-preview,
.image-preview-container {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--neutral-200);
}

.current-image,
.upload-preview-image {
  width: 100%;
  height: 100%;
}

.remove-preview-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.no-image-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px dashed var(--neutral-300);
}

.dialog-actions {
  padding: 16px 24px;
  justify-content: flex-end;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
