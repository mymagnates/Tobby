<template>
  <q-page class="q-pa-md">
    <div class="page-with-sidebar">
      <div class="page-main-column">
        <!-- Filters Row -->
        <div class="page-toolbar page-toolbar--stacked">
          <q-input
            v-model="searchQuery"
            borderless
            dense
            placeholder="Search transactions"
            clearable
            class="page-tool-field"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
          <q-select
            v-model="activeTypeFilter"
            :options="transactionTypeFilterOptions"
            borderless
            dense
            emit-value
            map-options
            :display-value="transactionTypeFilterLabel"
            class="page-tool-field"
          >
            <template v-slot:prepend>
              <q-icon name="tune" size="18px" />
            </template>
          </q-select>
          <q-select
            v-model="dateFilter"
            :options="dateFilterOptions"
            borderless
            dense
            clearable
            :display-value="dateFilter || 'All time'"
            class="page-tool-field"
          >
            <template v-slot:prepend>
              <q-icon name="date_range" size="18px" />
            </template>
          </q-select>
          <q-btn
            @click="openCreateTransactionDialog"
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
        <div v-else class="transactions-list entity-tiles">
      <q-card
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="transaction-row clickable-row entity-tile"
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
            <div
              class="amount-value"
              :class="{ 'amount-value-expense': isExpenseType(transaction.transac_type) }"
            >
              ${{ formatAmount(transaction.amount) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
        </div>
      </div>
    </div>

    <!-- Transaction Details Panel -->
    <DetailShell
      v-model="showTransactionDialog"
      title="Transaction Details"
      :subtitle="selectedTransaction?.transac_type || ''"
      @close="closeTransactionDialog"
    >
      <div class="dialog-content">
          <div v-if="selectedTransaction" class="transaction-details-full">
            <!-- Basic Information -->
            <div class="details-section">
              <div class="section-title">Transaction Information</div>
              <div class="details-grid transaction-info-grid">
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
                  <div
                    class="detail-value"
                    :class="{ 'amount-value-expense': isExpenseType(selectedTransaction.transac_type) }"
                  >
                    ${{ formatAmount(selectedTransaction.amount) }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Property</div>
                  <div class="detail-value">
                    {{ getPropertyName(selectedTransaction.property_id) }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Lease ID</div>
                  <div class="detail-value">{{ selectedTransaction.lease_id || 'N/A' }}</div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Flow</div>
                  <div class="transaction-flow-graph">
                    <div class="flow-node flow-node-from">
                      <div class="flow-node-label">From</div>
                      <div class="flow-node-value">
                        {{ capitalizeFirst(selectedTransaction.transac_from || 'Unknown') }}
                      </div>
                    </div>
                    <div class="flow-center">
                      <div
                        class="flow-amount"
                        :class="{ 'amount-value-expense': isExpenseType(selectedTransaction.transac_type) }"
                      >
                        ${{ formatAmount(selectedTransaction.amount) }}
                      </div>
                      <div class="flow-arrow-wrap">
                        <q-icon name="arrow_forward" class="flow-arrow" />
                      </div>
                      <div class="flow-date">
                        {{ formatDate(selectedTransaction.transac_date) }}
                      </div>
                    </div>
                    <div class="flow-arrow-wrap flow-arrow-wrap-mobile">
                      <q-icon name="arrow_forward" class="flow-arrow" />
                    </div>
                    <div class="flow-node flow-node-to">
                      <div class="flow-node-label">To</div>
                      <div class="flow-node-value">
                        {{ capitalizeFirst(selectedTransaction.transac_to || 'Unknown') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Image Section -->
            <div class="details-section">
              <div class="section-title">
                <q-icon name="photo" class="q-mr-sm" />
                Transaction Image
                <q-btn
                  v-if="canEditSelectedTransaction"
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
                <div class="text-caption text-grey-5">
                  {{ canEditSelectedTransaction ? 'Click \"Add Picture\" to attach an image' : 'Only the creator can attach an image.' }}
                </div>
              </div>
            </div>

            <!-- User Information -->
            <div class="details-section">
              <div class="section-title">User Information</div>
              <div class="details-grid user-info-grid">
                <div class="detail-item">
                  <div class="detail-label">Role</div>
                  <div class="detail-value">
                    {{ roleLabel(selectedTransaction.role || 'Unknown') }}
                  </div>
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
      </div>
    </DetailShell>

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

    <q-dialog
      v-model="showCreateTransactionDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <div class="create-transaction-dialog-scroll">
          <CreateTransaction
            @transaction-created="onTransactionCreated"
            @cancel="closeCreateTransactionDialog"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import CreateTransaction from '../components/CreateTransaction.vue'
import DetailShell from '../components/details/DetailShell.vue'
import { extractPropertyId } from '../utils/propertyIdUtils'
import { Notify } from 'quasar'
import { roleLabel } from '../utils/roleUtils'

const userDataStore = useUserDataStore()
const { updateDocument, uploadImages } = useFirebase()
const route = useRoute()

// Dialog states
const showTransactionDialog = ref(false)
const selectedTransaction = ref(null)
const showCreateTransactionDialog = ref(false)

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
const selectedProperty = ref(null)
const dateFilter = ref(null)
const deepLinkHandled = ref(false)

// Filter options
const dateFilterOptions = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'All Time',
]

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

const transactionTypeFilterOptions = computed(() => [
  { label: 'All types', value: 'all' },
  ...transactionTypes.value.map((type) => ({ label: type, value: type })),
])

const transactionTypeFilterLabel = computed(() =>
  activeTypeFilter.value === 'all' ? 'All types' : activeTypeFilter.value,
)

// Get transactions the user has access to
const userAccessibleTransactions = computed(() => userDataStore.userAccessibleTransactions)
const isPoUser = computed(() => {
  return !!userDataStore.hasPoMembership && !userDataStore.hasPmMembership
})
const canEditSelectedTransaction = computed(() => {
  if (!selectedTransaction.value) return false
  if (!isPoUser.value) return true
  const creator =
    selectedTransaction.value.created_by_user_id || selectedTransaction.value.created_by
  return creator === userDataStore.userId
})

// Filter transactions based on search query, type filter, property filter, and date filter
const filteredTransactions = computed(() => {
  let transactions = userAccessibleTransactions.value

  // Apply type filter
  if (activeTypeFilter.value !== 'all') {
    transactions = transactions.filter(
      (transaction) => transaction.transac_type === activeTypeFilter.value,
    )
  }

  // Apply property filter
  if (selectedProperty.value) {
    transactions = transactions.filter(
      (transaction) => transaction.property_id === selectedProperty.value,
    )
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date()
    let startDate = new Date()

    switch (dateFilter.value) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'Last 6 Months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'Last Year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'All Time':
        startDate = new Date(0) // Beginning of time
        break
    }

    transactions = transactions.filter((transaction) => {
      const transacDate = new Date(transaction.transac_date)
      return transacDate >= startDate
    })
  }

  // Apply search filter
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

const isExpenseType = (type) => {
  if (!type || typeof type !== 'string') return false
  return type.trim().toLowerCase() === 'expense'
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

const tryOpenDeepLinkedTransaction = () => {
  if (deepLinkHandled.value) return
  const openType = String(route.query.openType || '').toLowerCase()
  const openId = String(route.query.openId || '')
  if (!openId || openType !== 'transaction') return
  if (!userAccessibleTransactions.value.length) return

  const normalizedOpenId = openId.toLowerCase()
  const targetTransaction = userAccessibleTransactions.value.find((transaction) => {
    const idCandidates = [transaction.id, transaction.transac_id]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
    return idCandidates.includes(normalizedOpenId)
  })
  if (!targetTransaction) return

  viewTransaction(targetTransaction)
  deepLinkHandled.value = true
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
  if (!canEditSelectedTransaction.value) {
    Notify.create({
      type: 'warning',
      message: 'Only the creator can update this transaction.',
      position: 'top',
    })
    return
  }
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

// Create transaction dialog functions
const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
}

const closeCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = false
}

const onTransactionCreated = () => {
  closeCreateTransactionDialog()
  refreshData()
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
  tryOpenDeepLinkedTransaction()
})

watch(
  () => userAccessibleTransactions.value.length,
  () => {
    tryOpenDeepLinkedTransaction()
  },
  { immediate: true }
)

watch(
  () => [route.query.openType, route.query.openId],
  () => {
    deepLinkHandled.value = false
    tryOpenDeepLinkedTransaction()
  }
)

watch(
  () => route.query.propertyId,
  (propertyId) => {
    const value = String(propertyId || '').trim()
    selectedProperty.value = value || null
  },
  { immediate: true },
)
</script>

<style scoped>
.transactions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.transaction-row {
  min-height: 190px;
  border-radius: var(--border-radius-card);
  box-shadow: none;
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  height: 100%;
  padding: 0;
  position: relative;
}

.transaction-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: var(--border-radius-sm);
}

.transaction-description {
  min-width: 0;
}

.description-title {
  min-height: 40px;
  font-size: 15px;
  font-weight: 650;
  color: #0f172a;
  line-height: 1.32;
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
  text-align: left;
}

.date-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0;
  margin-bottom: 4px;
}

.date-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.transaction-amount {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(20, 28, 45, 0.06);
  text-align: left;
}

.amount-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0;
  margin-bottom: 4px;
  text-align: left;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1976d2;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  white-space: nowrap;
}

.amount-value-expense {
  color: #dc2626 !important;
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

.create-transaction-dialog-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  scroll-padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
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

.transaction-info-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.user-info-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
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

.transaction-flow-graph {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius-sm);
  background: #f8fafc;
}

.flow-node {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  border: 1px solid #dbe3ef;
  background: #ffffff;
}

.flow-node-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}

.flow-node-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

.flow-arrow-wrap {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 120px;
}

.flow-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #1976d2;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  white-space: nowrap;
}

.flow-date {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.flow-arrow-wrap-mobile {
  display: none;
}

.flow-arrow {
  color: #64748b;
  font-size: 20px;
}

.activity-log {
  background: #f8f9fa;
  border-radius: var(--border-radius-sm);
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
  }

  .transaction-icon {
    width: 38px;
    height: 38px;
  }

  .transaction-amount {
    text-align: left;
    padding: 10px 0 0;
    border-top: 1px solid #e9ecef;
  }

  .transaction-date {
    text-align: left;
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

  .transaction-info-grid {
    grid-template-columns: 1fr;
  }

  .user-info-grid {
    grid-template-columns: 1fr;
  }

  .transaction-flow-graph {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .flow-center .flow-arrow-wrap {
    display: none;
  }

  .flow-arrow-wrap-mobile {
    display: flex;
    margin: -2px 0;
  }

  .flow-arrow-wrap-mobile .flow-arrow {
    transform: rotate(90deg);
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
  border-radius: var(--border-radius-card);
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
  border-radius: var(--border-radius-card);
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
  border-radius: var(--border-radius-card);
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

.page-with-sidebar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.property-sidebar-column {
  align-self: start;
}

@media (max-width: 1024px) {
  .page-with-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
