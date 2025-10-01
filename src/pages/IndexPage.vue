<template>
  <q-page class="dashboard-page">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>

        <!-- Loading Steps -->
        <div class="loading-steps q-mt-lg">
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 1, completed: loadingStep > 1 }"
          >
            <q-icon name="person" size="20px" />
            <span>Loading User Profile</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 2, completed: loadingStep > 2 }"
          >
            <q-icon name="home" size="20px" />
            <span>Loading Properties</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 3, completed: loadingStep > 3 }"
          >
            <q-icon name="receipt" size="20px" />
            <span>Loading Transactions</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 4, completed: loadingStep > 4 }"
          >
            <q-icon name="build" size="20px" />
            <span>Loading MX Records</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 5, completed: loadingStep > 5 }"
          >
            <q-icon name="assignment" size="20px" />
            <span>Loading Leases</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1 class="text-h4 text-weight-bold">Dashboard</h1>
            <p class="text-subtitle1 text-grey-6">
              Welcome back! Here's your property management overview.
            </p>
          </div>
          <div class="header-actions">
            <q-btn
              round
              icon="refresh"
              color="primary"
              text-color="white"
              @click="refreshDashboard"
              :loading="dashboardLoading"
              class="refresh-btn"
            />
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-section">
        <div class="row" style="margin: 5px">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card income-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="trending_up" size="24px" color="positive" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">${{ formatCurrency(monthlyIncome) }}</div>
                  <div class="stat-card__label">Monthly Income</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card expense-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="trending_down" size="24px" color="negative" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">${{ formatCurrency(monthlyExpense) }}</div>
                  <div class="stat-card__label">Monthly Expense</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card tasks-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="assignment" size="24px" color="warning" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">{{ openTasks }}</div>
                  <div class="stat-card__label">Open Tasks</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card leases-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="home_work" size="24px" color="info" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">{{ activeLeases }}</div>
                  <div class="stat-card__label">Active Leases</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Dashboard Sections -->
      <div class="dashboard-sections">
        <div class="row q-gutter-">
          <!-- Left Column -->
          <div class="col-12 col-lg-6">
            <!-- Recent MX Records -->
            <q-card class="dashboard-section">
              <q-card-section class="section-header">
                <div class="section-title">
                  <q-icon name="build" size="24px" color="primary" />
                  <span class="text-h6 q-ml-sm">Recent MX Records</span>
                </div>
                <q-btn
                  dense
                  label="View All"
                  color="primary"
                  text-color="white"
                  class="btn-primary"
                  @click="$router.push('/mx-records')"
                />
              </q-card-section>

              <q-card-section class="section-content">
                <div v-if="recentMxRecords.length === 0" class="empty-state">
                  <q-icon name="build" size="48px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">No MX Records</div>
                  <div class="text-caption text-grey-5">Create your first maintenance record</div>
                </div>

                <div v-else class="records-list">
                  <div
                    v-for="record in recentMxRecords.slice(0, 3)"
                    :key="record.id"
                    class="record-item clickable"
                    @click="viewMxRecordDetail(record)"
                  >
                    <div class="record-content">
                      <div class="record-description">
                        {{ record.description || 'No description available' }}
                      </div>
                      <div class="record-details">
                        <q-chip
                          :color="getStatusColor(record.status)"
                          text-color="white"
                          size="sm"
                          dense
                        >
                          {{ record.status || 'Open' }}
                        </q-chip>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ formatDate(record.created_at) }}
                        </span>
                        <span class="text-caption text-weight-bold text-primary">
                          ${{ formatCurrency(record.amount || 0) }}
                        </span>
                        <q-icon name="chevron_right" size="16px" color="grey-5" class="q-ml-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right Column -->
          <div class="col-12 col-lg-6">
            <!-- Recent Transactions -->
            <q-card class="dashboard-section">
              <q-card-section class="section-header">
                <div class="section-title">
                  <q-icon name="receipt" size="24px" color="primary" />
                  <span class="text-h6 q-ml-sm">Recent Transactions</span>
                </div>
                <q-btn
                  dense
                  label="View All"
                  color="primary"
                  text-color="white"
                  class="btn-primary"
                  @click="$router.push('/transactions')"
                />
              </q-card-section>

              <q-card-section class="section-content">
                <div v-if="recentTransactions.length === 0" class="empty-state">
                  <q-icon name="receipt" size="48px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">No Transactions</div>
                  <div class="text-caption text-grey-5">
                    Your recent transactions will appear here
                  </div>
                </div>

                <div v-else class="transactions-list">
                  <div
                    v-for="transaction in recentTransactions.slice(0, 3)"
                    :key="transaction.id"
                    class="transaction-item clickable"
                    @click="viewTransactionDetail(transaction)"
                  >
                    <div class="transaction-content">
                      <div class="transaction-details">
                        <q-chip
                          :color="getTransactionTypeColor(transaction.transac_type)"
                          text-color="white"
                          size="sm"
                          dense
                        >
                          {{ transaction.transac_type || 'Payment' }}
                        </q-chip>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ formatDate(transaction.transac_date) }}
                        </span>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ transaction.transac_from || 'N/A' }} →
                          {{ transaction.transac_to || 'N/A' }}
                        </span>
                        <span
                          class="text-caption text-weight-bold"
                          :class="getTransactionAmountColor(transaction.transac_type)"
                        >
                          ${{ formatCurrency(transaction.amount || 0) }}
                        </span>
                        <q-icon name="chevron_right" size="16px" color="grey-5" class="q-ml-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Floating Action Button for Quick Actions -->
      <q-page-sticky position="bottom-right" :offset="[20, 20]">
        <q-btn
          fab
          icon="add"
          color="primary"
          size="lg"
          @click="showQuickActions = true"
          class="quick-actions-fab"
        />
      </q-page-sticky>

      <!-- Quick Actions Dialog -->
      <q-dialog v-model="showQuickActions" position="bottom">
        <q-card class="quick-actions-dialog">
          <q-card-section class="text-h6 text-center">Quick Actions</q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row q-gutter-sm">
              <div class="col-6">
                <q-btn
                  label="Create Property"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="navigateTo('/create-property')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create Lease"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="navigateTo('/create-lease')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add Transaction"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="navigateTo('/create-transaction')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create MX Record"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="navigateTo('/create-mxrecord')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- MX Record Detail Dialog -->
      <q-dialog v-model="showMxRecordDetail" position="standard">
        <q-card class="mx-record-detail-dialog" style="min-width: 500px; max-width: 800px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">MX Record Details</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedMxRecord" class="q-pt-none">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-chip
                  :color="getStatusColor(selectedMxRecord.status)"
                  text-color="white"
                  size="md"
                  class="q-mb-md"
                >
                  {{ selectedMxRecord.status || 'Open' }}
                </q-chip>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Property</div>
                <div class="text-body1">{{ getPropertyName(selectedMxRecord.property_id) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Amount</div>
                <div class="text-body1 text-weight-bold">
                  ${{ formatCurrency(selectedMxRecord.amount || 0) }}
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Created Date</div>
                <div class="text-body1">{{ formatDate(selectedMxRecord.created_at) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Priority</div>
                <div class="text-body1">{{ selectedMxRecord.priority || 'Medium' }}</div>
              </div>

              <div class="col-12" v-if="selectedMxRecord.description">
                <div class="text-caption text-grey-6">Description</div>
                <div class="text-body1">{{ selectedMxRecord.description }}</div>
              </div>

              <div class="col-12" v-if="selectedMxRecord.notes">
                <div class="text-caption text-grey-6">Notes</div>
                <div class="text-body1">{{ selectedMxRecord.notes }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Close" color="primary" v-close-popup />
            <q-btn
              label="Add Log"
              color="primary"
              text-color="white"
              class="btn-primary"
              icon="add_comment"
              @click="addLogToMxRecord(selectedMxRecord)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Transaction Detail Dialog -->
      <q-dialog v-model="showTransactionDetail" position="standard">
        <q-card class="transaction-detail-dialog" style="min-width: 500px; max-width: 800px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Transaction Details</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedTransaction" class="q-pt-none">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-chip
                  :color="getTransactionTypeColor(selectedTransaction.transac_type)"
                  text-color="white"
                  size="md"
                  class="q-mb-md"
                >
                  {{ selectedTransaction.transac_type || 'Payment' }}
                </q-chip>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">From</div>
                <div class="text-body1">{{ selectedTransaction.transac_from || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">To</div>
                <div class="text-body1">{{ selectedTransaction.transac_to || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Amount</div>
                <div
                  class="text-body1 text-weight-bold"
                  :class="getTransactionAmountColor(selectedTransaction.transac_type)"
                >
                  ${{ formatCurrency(selectedTransaction.amount || 0) }}
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Date</div>
                <div class="text-body1">{{ formatDate(selectedTransaction.transac_date) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Property</div>
                <div class="text-body1">{{ getPropertyName(selectedTransaction.property_id) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Lease ID</div>
                <div class="text-body1">{{ selectedTransaction.lease_id || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Role</div>
                <div class="text-body1">{{ selectedTransaction.role || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Transaction ID</div>
                <div class="text-body1">{{ selectedTransaction.transac_id || 'N/A' }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'

const router = useRouter()

// Initialize userDataStore with error handling
let userDataStore
try {
  userDataStore = useUserDataStore()
  console.log('UserDataStore initialized successfully')
} catch (error) {
  console.error('Failed to initialize userDataStore:', error)
  // Create a fallback store object
  userDataStore = {
    isAuthenticated: false,
    userId: null,
    userAccessibleProperties: [],
    userAccessibleMxRecords: [],
    userAccessibleTransactions: [],
    userAccessibleLeases: [],
    loadUserRoles: () => Promise.resolve(),
    loadProperties: () => Promise.resolve(),
    loadTransactions: () => Promise.resolve(),
    loadMxRecords: () => Promise.resolve(),
    loadLeases: () => Promise.resolve(),
  }
}

// Reactive data
const recentMxRecords = ref([])
const recentTransactions = ref([])
const showQuickActions = ref(false)
const showMxRecordDetail = ref(false)
const selectedMxRecord = ref(null)
const showTransactionDetail = ref(false)
const selectedTransaction = ref(null)
const dashboardLoading = ref(false)
const dataLoaded = ref(false)
const loadingStep = ref(0)

// Quick stats computed properties
const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === 'income'
      )
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const monthlyExpense = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === 'expense'
      )
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const openTasks = computed(() => {
  return userDataStore.userAccessibleMxRecords.filter(
    (mx) => mx.status === 'open' || mx.status === 'pending',
  ).length
})

const activeLeases = computed(() => {
  return userDataStore.userAccessibleLeases.filter(
    (lease) => lease.status === 'active' || lease.status === 'occupied',
  ).length
})

// Data loading function
const loadDashboardData = async (isRefresh = false) => {
  try {
    console.log('Loading dashboard data...', {
      isRefresh,
      isAuthenticated: userDataStore.isAuthenticated,
    })

    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      throw new Error('Firebase API key is not configured. Please check your .env file.')
    }

    if (!userDataStore.isAuthenticated) {
      console.log('User not authenticated, skipping data load')
      dataLoaded.value = true
      return
    }

    dataLoaded.value = false
    loadingStep.value = 0

    // Load data sequentially with progress tracking
    try {
      loadingStep.value = 1
      await userDataStore.loadUserRoles()

      loadingStep.value = 2
      await userDataStore.loadProperties()

      loadingStep.value = 3
      await userDataStore.loadTransactions()

      loadingStep.value = 4
      await userDataStore.loadMxRecords()

      loadingStep.value = 5
      await userDataStore.loadLeases()
    } catch (apiError) {
      console.error('API Error during data loading:', apiError)
      throw new Error(`Failed to load data: ${apiError.message}`)
    }

    // Process the loaded data
    processDashboardData()
  } catch (error) {
    console.error('Dashboard data loading failed:', error)
    const errorMessage = error.message.includes('Firebase API key')
      ? 'Firebase configuration error. Please check your environment variables.'
      : 'Network or API error. Please check your connection and try again.'

    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    })

    dataLoaded.value = true
  }
}

// Process dashboard data
const processDashboardData = () => {
  console.log('Processing dashboard data...')

  // Get recent MX records (last 5)
  recentMxRecords.value = userDataStore.userAccessibleMxRecords
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  // Get recent transactions (last 5)
  recentTransactions.value = userDataStore.userAccessibleTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  console.log('Dashboard data processed:', {
    mxRecords: recentMxRecords.value.length,
    transactions: recentTransactions.value.length,
  })

  dataLoaded.value = true
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'positive'
    case 'in_progress':
      return 'warning'
    case 'pending':
      return 'info'
    default:
      return 'grey'
  }
}

// Transaction utility functions
const getTransactionTypeColor = (transacType) => {
  switch (transacType?.toLowerCase()) {
    case 'rent payment':
      return 'primary'
    case 'security deposit':
      return 'info'
    case 'maintenance fee':
      return 'warning'
    case 'utility payment':
      return 'secondary'
    case 'late fee':
      return 'negative'
    case 'refund':
      return 'positive'
    default:
      return 'grey'
  }
}

const getTransactionAmountColor = (transacType) => {
  switch (transacType?.toLowerCase()) {
    case 'rent payment':
    case 'maintenance fee':
    case 'utility payment':
    case 'late fee':
      return 'text-negative'
    case 'refund':
      return 'text-positive'
    default:
      return 'text-grey'
  }
}

const refreshDashboard = async () => {
  dashboardLoading.value = true
  await loadDashboardData(true)
  dashboardLoading.value = false
  Notify.create({
    type: 'positive',
    message: 'Dashboard refreshed successfully',
    position: 'top',
    timeout: 2000,
  })
}

const navigateTo = (path) => {
  showQuickActions.value = false
  router.push(path)
}

// MX Record functions
const viewMxRecordDetail = (record) => {
  selectedMxRecord.value = record
  showMxRecordDetail.value = true
}

const addLogToMxRecord = (record) => {
  showMxRecordDetail.value = false
  // Navigate to MX records page with the specific record selected for adding a log
  router.push(`/mx-records?recordId=${record.id}&action=addLog`)
}

// Transaction functions
const viewTransactionDetail = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetail.value = true
}

const getPropertyName = (propertyId) => {
  if (!propertyId) return 'Unknown Property'
  const property = userDataStore.userAccessibleProperties.find((prop) => prop.id === propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

// Watchers
watch(
  () => userDataStore.isAuthenticated,
  async (newValue) => {
    if (newValue) {
      await loadDashboardData(true)
    } else {
      // Clear data on logout
      recentMxRecords.value = []
      recentTransactions.value = []
      dataLoaded.value = false
      loadingStep.value = 0
    }
  },
)

watch(
  () => userDataStore.userAccessibleMxRecords,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

watch(
  () => userDataStore.userAccessibleTransactions,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

watch(
  () => userDataStore.userAccessibleProperties,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

// Watch for data availability and redirect to loading page if needed
watch(
  () => [
    userDataStore.isAuthenticated,
    userDataStore.userAccessibleProperties.length,
    userDataStore.profileLoading,
    userDataStore.propertiesLoading,
    userDataStore.userRolesLoading,
  ],
  ([isAuth, propertiesCount, profileLoading, propertiesLoading, rolesLoading]) => {
    // Only redirect if user is authenticated but has no data and nothing is loading
    if (
      isAuth &&
      propertiesCount === 0 &&
      !profileLoading &&
      !propertiesLoading &&
      !rolesLoading &&
      router.currentRoute.value.path === '/'
    ) {
      console.log('IndexPage - Data cleared, redirecting to loading page')
      router.push('/loading')
    }
  },
)

// Lifecycle
onMounted(async () => {
  console.log('IndexPage mounted')

  // Check if user is authenticated and has data loaded
  if (userDataStore.isAuthenticated) {
    // If no properties are loaded yet and not currently loading, redirect to loading page
    if (
      userDataStore.userAccessibleProperties.length === 0 &&
      !userDataStore.profileLoading &&
      !userDataStore.propertiesLoading &&
      !userDataStore.userRolesLoading
    ) {
      console.log('IndexPage - No data available, redirecting to loading page')
      router.push('/loading')
      return
    }
  }

  await loadDashboardData(true)
})
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}

.data-loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  max-width: 400px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
}

.loading-step.active {
  background: #e3f2fd;
  color: #1976d2;
}

.loading-step.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title h1 {
  margin: 0;
  color: #1a1a1a;
}

.header-title p {
  margin: 4px 0 0 0;
}

.refresh-btn {
  margin-left: 16px;
}

.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  height: 100px;
  min-height: 100px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin: 2px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card__content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px;
}

.stat-card__icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(25, 118, 210, 0.1);
}

.income-card .stat-card__icon {
  background: rgba(76, 175, 80, 0.1);
}

.expense-card .stat-card__icon {
  background: rgba(244, 67, 54, 0.1);
}

.tasks-card .stat-card__icon {
  background: rgba(255, 152, 0, 0.1);
}

.leases-card .stat-card__icon {
  background: rgba(33, 150, 243, 0.1);
}

.stat-card__info {
  flex: 1;
}

.stat-card__value {
  font-size: 1.2rem !important;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
  color: #1a1a1a;
}

.stat-card__label {
  font-size: 0.75rem !important;
  line-height: 1.3;
  color: #666;
  margin: 0;
}

.dashboard-sections {
  margin-bottom: 32px;
}

.dashboard-section {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  margin-right: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1a1a1a;
}

.section-content {
  padding: 20px 24px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.records-list,
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.record-item:hover,
.transaction-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.record-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item.clickable:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.transaction-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.transaction-item.clickable:hover {
  background: #e8f5e8;
  border-color: #4caf50;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.transaction-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.record-description {
  flex: 1;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.record-info,
.transaction-info {
  flex: 1;
}

.record-title,
.transaction-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.record-meta,
.transaction-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-amount,
.transaction-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.quick-actions-fab {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.quick-actions-dialog {
  border-radius: 16px 16px 0 0;
  min-width: 320px;
  max-width: 500px;
}

.quick-actions-dialog .q-card-section {
  padding: 20px 24px;
}

.quick-actions-dialog .q-card-section:first-child {
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

/* Button Text Styling - Keep Default Colors */
.btn-primary,
.btn-secondary,
.refresh-btn {
  color: white !important;
  font-weight: 600 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .stat-card__value {
    font-size: 1.1rem !important;
  }

  .stat-card__label {
    font-size: 0.7rem !important;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .record-item,
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .record-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .record-description {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .record-details {
    width: 100%;
    justify-content: space-between;
  }

  .transaction-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .transaction-details {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
