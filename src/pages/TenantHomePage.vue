<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Tenant Dashboard</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">
              Welcome back, {{ userDataStore.userDisplayName || 'Tenant' }}!
            </p>
          </div>
          <q-btn color="primary" icon="refresh" label="Refresh" @click="refreshData" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-mt-md">Loading your dashboard...</div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Quick Stats -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-3">
            <q-card class="stat-card bg-primary text-white">
              <q-card-section>
                <div class="text-h6">Current Lease</div>
                <div class="text-h3 q-mt-sm">{{ currentLease ? '1' : '0' }}</div>
                <div class="text-caption">Active lease</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="stat-card bg-green text-white">
              <q-card-section>
                <div class="text-h6">Transactions</div>
                <div class="text-h3 q-mt-sm">{{ transactions.length }}</div>
                <div class="text-caption">Total records</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="stat-card bg-orange text-white">
              <q-card-section>
                <div class="text-h6">Tasks</div>
                <div class="text-h3 q-mt-sm">{{ tasks.length }}</div>
                <div class="text-caption">Pending tasks</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="stat-card bg-indigo text-white">
              <q-card-section>
                <div class="text-h6">Past Leases</div>
                <div class="text-h3 q-mt-sm">{{ pastLeases.length }}</div>
                <div class="text-caption">Lease history</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Current Lease Section -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="home" class="q-mr-sm" />
              Current Lease
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="!currentLease" class="text-center q-pa-lg">
              <q-icon name="info" size="64px" color="grey-4" />
              <div class="text-body1 text-grey-6 q-mt-md">No active lease found</div>
              <div class="text-caption text-grey-5">
                You don't have an active lease at this time
              </div>
            </div>

            <div v-else class="lease-details">
              <div class="row q-col-gutter-md">
                <!-- Property Information -->
                <div class="col-12">
                  <div class="property-header q-pa-md bg-grey-1" style="border-radius: 8px">
                    <div class="text-h6 text-primary">
                      {{
                        currentLease.property_id?.nickname ||
                        currentLease.property_id?.displayName ||
                        'Property'
                      }}
                    </div>
                    <div class="text-body1">{{ currentLease.property_id?.address || 'N/A' }}</div>
                    <div class="text-caption text-grey-6">
                      {{ currentLease.property_id?.city }}, {{ currentLease.property_id?.state }}
                      {{ currentLease.property_id?.zip }}
                    </div>
                  </div>
                </div>

                <!-- Lease Details Grid -->
                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">Lease Status</div>
                    <q-chip :color="getLeaseStatusColor(currentLease.status)" text-color="white">
                      {{ currentLease.status }}
                    </q-chip>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">Monthly Rent</div>
                    <div class="detail-value text-primary text-h6">
                      ${{ formatAmount(currentLease.rate_amount) }}/{{
                        currentLease.rate_type || 'month'
                      }}
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">Lease Term</div>
                    <div class="detail-value">{{ currentLease.lease_term || 'N/A' }} months</div>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">Lease Start Date</div>
                    <div class="detail-value">{{ formatDate(currentLease.lease_create_date) }}</div>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">Security Deposit</div>
                    <div class="detail-value">${{ formatAmount(currentLease.deposit) }}</div>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="detail-item">
                    <div class="detail-label">LSID</div>
                    <div class="detail-value">{{ currentLease.LSID || 'N/A' }}</div>
                  </div>
                </div>

                <div class="col-12" v-if="currentLease.utilities_included?.length > 0">
                  <div class="detail-item">
                    <div class="detail-label">Utilities Included</div>
                    <div class="detail-value">{{ currentLease.utilities_included.join(', ') }}</div>
                  </div>
                </div>

                <div class="col-12" v-if="currentLease.special_terms">
                  <div class="detail-item">
                    <div class="detail-label">Special Terms</div>
                    <div class="detail-value">{{ currentLease.special_terms }}</div>
                  </div>
                </div>
              </div>

              <div class="q-mt-md">
                <q-btn color="primary" label="View Full Lease Details" @click="viewLeaseDetails" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Transactions Section -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-green text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Recent Transactions
              </div>
              <q-btn
                flat
                dense
                color="white"
                label="View All"
                @click="$router.push('/transactions')"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="transactions.length === 0" class="text-center q-pa-lg">
              <q-icon name="receipt" size="64px" color="grey-4" />
              <div class="text-body1 text-grey-6 q-mt-md">No transactions found</div>
              <div class="text-caption text-grey-5">Your payment history will appear here</div>
            </div>

            <q-list v-else separator>
              <q-item
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                clickable
                @click="viewTransaction(transaction)"
              >
                <q-item-section avatar>
                  <q-avatar :color="getTransactionColor(transaction.category)" text-color="white">
                    <q-icon :name="getTransactionIcon(transaction.category)" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ transaction.category || 'Transaction' }}</q-item-label>
                  <q-item-label caption>{{ formatDate(transaction.date) }}</q-item-label>
                  <q-item-label caption v-if="transaction.notes">
                    {{ transaction.notes }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-weight-bold" :class="getAmountClass(transaction.type)">
                    {{ transaction.type === 'income' ? '+' : '-' }}${{
                      formatAmount(transaction.amount)
                    }}
                  </div>
                  <q-chip
                    size="sm"
                    :color="getTransactionTypeColor(transaction.type)"
                    text-color="white"
                  >
                    {{ transaction.type }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="transactions.length > 5" class="q-mt-md text-center">
              <q-btn
                flat
                color="primary"
                label="View All Transactions"
                @click="$router.push('/transactions')"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Tasks Section -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-orange text-white">
            <div class="text-h6">
              <q-icon name="task" class="q-mr-sm" />
              Pending Tasks & Reminders
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="tasks.length === 0" class="text-center q-pa-lg">
              <q-icon name="check_circle" size="64px" color="grey-4" />
              <div class="text-body1 text-grey-6 q-mt-md">No pending tasks</div>
              <div class="text-caption text-grey-5">All caught up! Great job!</div>
            </div>

            <q-list v-else separator>
              <q-item v-for="task in tasks" :key="task.id" clickable>
                <q-item-section avatar>
                  <q-avatar color="orange" text-color="white">
                    <q-icon name="event" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ task.title || 'Task' }}</q-item-label>
                  <q-item-label caption v-if="task.description">
                    {{ task.description }}
                  </q-item-label>
                  <q-item-label caption> Due: {{ formatDate(task.due_date) }} </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-chip :color="getPriorityColor(task.priority)" text-color="white" size="sm">
                    {{ task.priority || 'normal' }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md text-center">
              <q-btn
                flat
                color="primary"
                label="View All Tasks"
                @click="$router.push('/reminders')"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Past Leases Section -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-indigo text-white">
            <div class="text-h6">
              <q-icon name="history" class="q-mr-sm" />
              Past Leases
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="pastLeases.length === 0" class="text-center q-pa-lg">
              <q-icon name="description" size="64px" color="grey-4" />
              <div class="text-body1 text-grey-6 q-mt-md">No past leases</div>
              <div class="text-caption text-grey-5">Your lease history will appear here</div>
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="lease in pastLeases" :key="lease.id" class="col-12 col-md-6">
                <q-card class="past-lease-card" clickable @click="viewPastLease(lease)">
                  <q-card-section class="bg-grey-2">
                    <div class="text-subtitle1 text-weight-bold">
                      {{
                        lease.property_id?.nickname || lease.property_id?.displayName || 'Property'
                      }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ lease.property_id?.address || 'N/A' }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Status</div>
                        <q-chip
                          :color="getLeaseStatusColor(lease.status)"
                          text-color="white"
                          size="sm"
                        >
                          {{ lease.status }}
                        </q-chip>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Rent</div>
                        <div class="text-body2">
                          ${{ formatAmount(lease.rate_amount) }}/{{ lease.rate_type }}
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Start Date</div>
                        <div class="text-body2">{{ formatDate(lease.lease_create_date) }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Term</div>
                        <div class="text-body2">{{ lease.lease_term || 'N/A' }} months</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-actions>
                    <q-btn
                      flat
                      color="primary"
                      label="View Details"
                      @click.stop="viewPastLease(lease)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'

const router = useRouter()
const userDataStore = useUserDataStore()

// State
const loading = ref(false)
const currentLease = ref(null)
const transactions = ref([])
const tasks = ref([])
const pastLeases = ref([])

// Computed
const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5)
})

// Format helpers
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return parseFloat(amount).toFixed(2)
}

// Status colors
const getLeaseStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Rented: 'blue',
    Pending: 'orange',
    Expired: 'red',
    Terminated: 'purple',
  }
  return colors[status] || 'grey'
}

const getTransactionColor = (category) => {
  const colors = {
    Rent: 'blue',
    Utilities: 'orange',
    Maintenance: 'red',
    Deposit: 'green',
    Other: 'grey',
  }
  return colors[category] || 'grey'
}

const getTransactionIcon = (category) => {
  const icons = {
    Rent: 'home',
    Utilities: 'bolt',
    Maintenance: 'build',
    Deposit: 'savings',
    Other: 'receipt',
  }
  return icons[category] || 'receipt'
}

const getTransactionTypeColor = (type) => {
  return type === 'income' ? 'green' : 'red'
}

const getAmountClass = (type) => {
  return type === 'income' ? 'text-green' : 'text-red'
}

const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
    normal: 'grey',
  }
  return colors[priority?.toLowerCase()] || 'grey'
}

// Fetch current lease
const fetchCurrentLease = async () => {
  try {
    console.log('Fetching current lease...')
    const userId = userDataStore.userId

    if (!userId) {
      console.log('No user ID available')
      return
    }

    // Query for leases where the user is a tenant and status is Rented
    const leasesRef = collection(db, 'leases')
    const q = query(leasesRef, where('tenant_id', '==', userId), where('status', '==', 'Rented'))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const leaseDoc = querySnapshot.docs[0]
      currentLease.value = {
        id: leaseDoc.id,
        ...leaseDoc.data(),
      }
      console.log('Current lease found:', currentLease.value)
    } else {
      console.log('No active lease found')
    }
  } catch (error) {
    console.error('Error fetching current lease:', error)
  }
}

// Fetch past leases
const fetchPastLeases = async () => {
  try {
    console.log('Fetching past leases...')
    const userId = userDataStore.userId

    if (!userId) {
      console.log('No user ID available')
      return
    }

    // Query for terminated or expired leases
    const leasesRef = collection(db, 'leases')
    const q = query(
      leasesRef,
      where('tenant_id', '==', userId),
      where('status', 'in', ['Terminated', 'Expired']),
    )

    const querySnapshot = await getDocs(q)
    const leases = []

    querySnapshot.forEach((doc) => {
      leases.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    pastLeases.value = leases
    console.log(`Found ${leases.length} past leases`)
  } catch (error) {
    console.error('Error fetching past leases:', error)
  }
}

// Fetch transactions
const fetchTransactions = async () => {
  try {
    console.log('Fetching transactions...')

    if (!currentLease.value) {
      console.log('No current lease, skipping transactions')
      return
    }

    const propertyId = currentLease.value.property_string_id || currentLease.value.property_id?.id

    if (!propertyId) {
      console.log('No property ID available')
      return
    }

    // Query transactions for the current property
    const transactionsRef = collection(db, 'transactions')
    const q = query(transactionsRef, where('property_id', '==', propertyId))

    const querySnapshot = await getDocs(q)
    const txns = []

    querySnapshot.forEach((doc) => {
      txns.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    // Sort by date, most recent first
    txns.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
      return dateB - dateA
    })

    transactions.value = txns
    console.log(`Found ${txns.length} transactions`)
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
}

// Fetch tasks/reminders
const fetchTasks = async () => {
  try {
    console.log('Fetching tasks...')

    if (!currentLease.value) {
      console.log('No current lease, skipping tasks')
      return
    }

    const propertyId = currentLease.value.property_string_id || currentLease.value.property_id?.id

    if (!propertyId) {
      console.log('No property ID available')
      return
    }

    // Query reminders for the current property
    const remindersRef = collection(db, 'properties', propertyId, 'reminders')
    const querySnapshot = await getDocs(remindersRef)

    const tasksList = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Only include pending/active tasks
      if (data.status !== 'completed') {
        tasksList.push({
          id: doc.id,
          ...data,
        })
      }
    })

    // Sort by due date
    tasksList.sort((a, b) => {
      const dateA = a.due_date?.toDate ? a.due_date.toDate() : new Date(a.due_date)
      const dateB = b.due_date?.toDate ? b.due_date.toDate() : new Date(b.due_date)
      return dateA - dateB
    })

    tasks.value = tasksList
    console.log(`Found ${tasksList.length} tasks`)
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

// Load all data
const loadAllData = async () => {
  loading.value = true
  try {
    await fetchCurrentLease()
    await Promise.all([fetchPastLeases(), fetchTransactions(), fetchTasks()])
  } catch (error) {
    console.error('Error loading tenant data:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load dashboard data',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Refresh data
const refreshData = async () => {
  await loadAllData()
  Notify.create({
    type: 'positive',
    message: 'Dashboard refreshed',
    position: 'top',
  })
}

// Navigation functions
const viewLeaseDetails = () => {
  if (currentLease.value) {
    router.push('/leases')
  }
}

const viewTransaction = (transaction) => {
  console.log('View transaction:', transaction)
  router.push('/transactions')
}

const viewPastLease = (lease) => {
  console.log('View past lease:', lease)
  router.push('/leases')
}

onMounted(async () => {
  console.log('TenantHomePage mounted')
  await loadAllData()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header h4 {
  color: #1a1a1a;
  font-weight: 600;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lease-details {
  padding: 16px 0;
}

.property-header {
  margin-bottom: 24px;
  border-left: 4px solid var(--q-primary);
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1rem;
  color: #333;
}

.past-lease-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.past-lease-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--q-primary);
}

/* Print styles */
@media print {
  .q-btn {
    display: none !important;
  }

  .stat-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header h4 {
    font-size: 1.5rem;
  }

  .stat-card {
    margin-bottom: 12px;
  }
}
</style>
