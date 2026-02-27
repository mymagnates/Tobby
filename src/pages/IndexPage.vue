<template>
  <q-page class="pm-po-feed-page q-pa-sm">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>
        <div class="loading-steps q-mt-lg">
          <div class="loading-step" :class="{ active: loadingStep >= 1, completed: loadingStep > 1 }">
            <q-icon name="person" size="20px" />
            <span>Loading User Profile</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 2, completed: loadingStep > 2 }">
            <q-icon name="home" size="20px" />
            <span>Loading Properties</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 3, completed: loadingStep > 3 }">
            <q-icon name="receipt" size="20px" />
            <span>Loading Transactions</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 4, completed: loadingStep > 4 }">
            <q-icon name="build" size="20px" />
            <span>Loading Tasks</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 5, completed: loadingStep > 5 }">
            <q-icon name="assignment" size="20px" />
            <span>Loading Leases</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 6, completed: dataLoaded }">
            <q-icon name="dashboard" size="20px" />
            <span>Preparing Feed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PM/PO Feed Layout: 3-column (Reminders | Main Feed | Rail) -->
    <div v-else class="feed-shell">
      <aside class="feed-reminders">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="reminder-section-header">
              <div class="rail-title">Reminders</div>
              <q-btn flat dense no-caps size="xs" color="primary" label="View All" class="reminder-view-all-btn" @click="$router.push('/reminders')" />
            </div>
            <q-card v-if="!filteredReminderItems.length" flat bordered class="reminder-card feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="reminder-title q-mb-xs">No Reminders Yet</div>
                <div class="reminder-brief">Reminder cards will appear here when due, updated, or created.</div>
              </q-card-section>
            </q-card>
            <div v-else class="reminder-list">
              <q-card
                v-for="item in filteredReminderItems"
                :key="item.id"
                flat
                bordered
                class="reminder-card reminder-card-compact q-mb-xs"
                :class="{ 'reminder-overdue': item.daysDue !== null && item.daysDue < 0 }"
                clickable
                @click="openReminderDetail(item)"
              >
                <q-card-section class="reminder-compact-section">
                  <div class="reminder-compact-row">
                    <div class="reminder-compact-left">
                      <div class="reminder-title">{{ item.title }}</div>
                      <div class="reminder-property-name">
                        <q-icon name="home" size="12px" class="q-mr-xs" />{{ item.propertyName }}
                      </div>
                    </div>
                    <div v-if="item.dueLabel" class="reminder-due-badge" :class="{ 'due-overdue': item.daysDue < 0, 'due-today': item.daysDue === 0, 'due-soon': item.daysDue > 0 }">
                      {{ item.dueLabel }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </aside>

      <div class="feed-main">
        <template v-if="isIndexHome">
        <!-- Stats row -->
        <div class="feed-stats-row q-mb-md">
          <q-card class="stat-card-mini income-card">
            <q-card-section class="q-pa-sm">
              <q-icon name="arrow_circle_up" size="20px" color="positive" />
              <div class="stat-mini-value">${{ formatCurrency(monthlyIncome) }}</div>
              <div class="stat-mini-label">Monthly Income</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini expense-card">
            <q-card-section class="q-pa-sm">
              <q-icon name="arrow_circle_down" size="20px" color="negative" />
              <div class="stat-mini-value">${{ formatCurrency(monthlyExpense) }}</div>
              <div class="stat-mini-label">Monthly Expense</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini tasks-card">
            <q-card-section class="q-pa-sm">
              <q-icon name="assignment" size="20px" color="warning" />
              <div class="stat-mini-value">{{ openTasks }}</div>
              <div class="stat-mini-label">Open Tasks</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini leases-card">
            <q-card-section class="q-pa-sm">
              <q-icon name="home_work" size="20px" color="info" />
              <div class="stat-mini-value">{{ activeLeases }}</div>
              <div class="stat-mini-label">Active Leases</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Create New Section -->
        <q-card class="create-new-card q-mb-md">
          <q-card-section class="create-new-section">

            <div class="create-new-actions">
              <q-btn flat dense no-caps icon="dns" label="Task" @click="openCreateTaskDialog" />
              <q-btn flat dense no-caps icon="receipt_long" label="Transaction" @click="showCreateTransactionDialog = true" />
              <q-btn flat dense no-caps icon="event" label="Lease" @click="showCreateLeaseDialog = true" />
              <q-btn flat dense no-caps icon="home" label="Property" @click="showCreatePropertyDialog = true" />
              <q-btn flat dense no-caps icon="alarm" label="Reminder" @click="showCreateReminderDialog = true" />
              <div class="feed-sort-group">
                <span class="feed-sort-label">Sort</span>
                <q-btn
                  flat dense no-caps
                  label="Time"
                  :icon-right="sortIcon('time')"
                  :color="feedSortField === 'time' ? 'primary' : 'grey-7'"
                  class="feed-sort-btn"
                  @click="toggleSort('time')"
                />
                <q-btn
                  flat dense no-caps
                  label="Type"
                  :icon-right="sortIcon('type')"
                  :color="feedSortField === 'type' ? 'primary' : 'grey-7'"
                  class="feed-sort-btn"
                  @click="toggleSort('type')"
                />
                <q-btn
                  flat dense no-caps
                  label="Property"
                  :icon-right="sortIcon('property')"
                  :color="feedSortField === 'property' ? 'primary' : 'grey-7'"
                  class="feed-sort-btn"
                  @click="toggleSort('property')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <TaskComposerFeedCard
          v-if="showTaskComposer"
          class="q-mb-md"
          @created="onTaskCreated"
          @close="showTaskComposer = false"
        />

        <!-- Feed -->
        <div class="feed-list">
          <q-card v-if="isMainFeedEmpty" class="feed-post feed-empty-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="post-title q-mb-xs">No Events Yet</div>
              <div class="post-body">
                This area shows timeline updates from tasks, leases, transactions, and reminders.
                Create or update records to populate this feed stream.
              </div>
            </q-card-section>
          </q-card>

          <q-card
            v-for="post in allFeedItems"
            :key="post.eventId || post.id"
            class="feed-post feed-post-clickable feed-mini-card"
            clickable
            @click="openDetail(post)"
          >
            <q-card-section class="feed-post-section">
              <div class="feed-card-row">
                <q-avatar size="32px" :color="post.avatarColor" text-color="white" class="feed-card-avatar">
                  <q-icon :name="post.avatarIcon" size="16px" />
                </q-avatar>
                <div class="feed-card-content">
                  <div class="feed-card-header">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-time">{{ formatEventTime(post) }}</div>
                  </div>
                  <div class="post-body">{{ post.brief }}</div>
                  <div class="feed-card-footer">
                    <span v-if="post.amount" class="post-amount">{{ post.amount }}</span>
                    <span v-else></span>
                    <div class="post-property">
                      <q-icon name="home" size="12px" class="q-mr-xs" />{{ post.property }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        </template>
        <template v-else>
          <div class="feed-main-router">
            <router-view />
          </div>
        </template>
      </div>

      <aside class="feed-rail">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Ad Slot</div>
            <div class="ad-placeholder">Reserved for future ad placement</div>
          </q-card-section>
        </q-card>
      </aside>
    </div>

    <!-- Contacts Dialog -->
    <q-dialog v-model="showContactsDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Contacts</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list separator>
            <q-item v-for="contact in contacts" :key="contact.id" clickable>
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="primary">{{ contact.initials }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ contact.name }}</q-item-label>
                <q-item-label caption>{{ contact.role }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

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
                  outline
                  class="btn-primary full-width"
                  @click="openCreatePropertyDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create Lease"
                  color="primary"
                  outline
                  class="btn-primary full-width"
                  @click="openCreateLeaseDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add Transaction"
                  color="primary"
                  outline
                  class="btn-primary full-width"
                  @click="openCreateTransactionDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create Task"
                  color="primary"
                  outline
                  class="btn-primary full-width"
                  @click="openCreateTaskDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add Document"
                  color="primary"
                  outline
                  class="btn-primary full-width"
                  @click="openDocumentsPage"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add Asset"
                  color="primary"
                  outline
                  class="btn-primary full-width"
                  @click="openAssetsPage"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Transaction Detail Dialog -->
      <q-dialog v-model="showTransactionDetail" position="standard">
        <q-card class="transaction-detail-dialog" style="min-width: 500px; max-width: 800px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Transaction Details</div>
            <q-space />
            <q-btn icon="close" flat round dense color="primary" v-close-popup />
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
                color="primary"
                @click="showCreatePropertyDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateProperty
              @property-created="onPropertyCreated"
              @cancel="showCreatePropertyDialog = false"
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
                color="primary"
                @click="showCreateTransactionDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateTransaction
              @transaction-created="onTransactionCreated"
              @cancel="showCreateTransactionDialog = false"
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
                color="primary"
                @click="showCreateLeaseDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateLease @lease-created="onLeaseCreated" @cancel="showCreateLeaseDialog = false" />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Renewal History Dialog -->
      <q-dialog v-model="showRenewalHistoryDialog" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="history" class="q-mr-sm" />
                Renewal History
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="primary"
                @click="closeRenewalHistoryDialog"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>

          <q-card-section v-if="selectedReminderForHistory">
            <!-- Reminder Info -->
            <div class="renewal-reminder-info q-mb-md">
              <div class="text-subtitle1 text-weight-medium">
                {{ selectedReminderForHistory.property_name }}
              </div>
              <div class="text-caption text-grey-6">
                {{ selectedReminderForHistory.title }}
              </div>
              <div class="text-caption text-grey-6">
                Current Due Date: {{ formatReminderDate(selectedReminderForHistory.due_date) }}
              </div>
            </div>

            <!-- Renewal History Timeline -->
            <div
              v-if="
                selectedReminderForHistory.renewals &&
                selectedReminderForHistory.renewals.length > 0
              "
            >
              <div class="text-subtitle2 q-mb-md">
                Total Renewals: {{ selectedReminderForHistory.renewals.length }}
              </div>

              <q-timeline color="primary" layout="comfortable">
                <q-timeline-entry
                  v-for="(renewal, index) in sortedRenewals"
                  :key="index"
                  :title="`Renewal #${selectedReminderForHistory.renewals.length - index}`"
                  :subtitle="formatReminderDate(renewal.renewed_at)"
                  icon="refresh"
                  :color="index === 0 ? 'positive' : 'primary'"
                >
                  <div class="renewal-details">
                    <div class="renewal-detail-item">
                      <span class="detail-label">Renewed On:</span>
                      <span class="detail-value">{{ formatDateTime(renewal.renewed_at) }}</span>
                    </div>
                    <div class="renewal-detail-item">
                      <span class="detail-label">Previous Due Date:</span>
                      <span class="detail-value">{{
                        formatReminderDate(renewal.previous_due_date)
                      }}</span>
                    </div>
                    <div class="renewal-detail-item">
                      <span class="detail-label">New Due Date:</span>
                      <span class="detail-value">{{
                        formatReminderDate(renewal.new_due_date)
                      }}</span>
                    </div>
                    <q-chip
                      v-if="index === 0"
                      color="positive"
                      text-color="white"
                      size="sm"
                      icon="check_circle"
                      class="q-mt-xs"
                    >
                      Most Recent
                    </q-chip>
                  </div>
                </q-timeline-entry>

                <!-- Initial Creation -->
                <q-timeline-entry
                  title="Initial Creation"
                  :subtitle="
                    formatReminderDate(
                      selectedReminderForHistory.created_date ||
                        selectedReminderForHistory.due_date,
                    )
                  "
                  icon="add_circle"
                  color="primary"
                >
                  <div class="renewal-details">
                    <div class="renewal-detail-item">
                      <span class="detail-label">Original Due Date:</span>
                      <span class="detail-value">
                        {{
                          formatReminderDate(
                            selectedReminderForHistory.created_date ||
                              selectedReminderForHistory.due_date,
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </div>

            <!-- No Renewals State -->
            <div v-else class="text-center q-pa-lg">
              <q-icon name="history" size="48px" color="grey-4" />
              <div class="text-body2 text-grey-6 q-mt-sm">No renewal history</div>
              <div class="text-caption text-grey-5">This reminder has not been renewed yet</div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Close" color="primary" @click="closeRenewalHistoryDialog" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Due Soon Reminders Alert -->
      <q-dialog v-model="showDueReminderAlert" persistent>
        <q-card class="due-reminder-dialog" style="min-width: 520px; max-width: 720px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="warning_amber" color="warning" class="q-mr-sm" />
                Reminders Due In 7 Days
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-body2 text-grey-7 q-mb-md">
              Please review the reminders below.
            </div>
            <q-list bordered separator class="rounded-borders">
              <q-item v-for="reminder in dueSoonReminders" :key="`due-${reminder.id}`">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ reminder.title }}</q-item-label>
                  <q-item-label caption>
                    {{ reminder.property_name || 'Unknown Property' }} •
                    {{ formatReminderDate(reminder.due_date) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="getDueReminderChipColor(reminder)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ getDueReminderChipLabel(reminder) }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              color="primary"
              text-color="white"
              label="I Understand"
              @click="closeDueReminderAlert"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import CreateProperty from '../components/CreateProperty.vue'
import TaskComposerFeedCard from '../components/TaskComposerFeedCard.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'

const router = useRouter()
const route = useRoute()
const { getCollectionData } = useFirebase()
const isIndexHome = computed(() => route.path === '/' || route.path === '/pm-po-feed')

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
const showTransactionDetail = ref(false)
const selectedTransaction = ref(null)
const showContactsDialog = ref(false)

// Reminders data
const reminders = ref([])
const propertyReminders = ref([])
const showDueReminderAlert = ref(false)
const initialLoadTriggered = ref(false)

const allCoreLoaded = computed(() => {
  return (
    userDataStore.isAuthenticated &&
    !userDataStore.profileLoading &&
    !userDataStore.propertiesLoading &&
    !userDataStore.mxRecordsLoading &&
    !userDataStore.transactionsLoading &&
    !userDataStore.leasesLoading
  )
})

const dataLoaded = computed(() => {
  if (!initialLoadTriggered.value) return false
  return allCoreLoaded.value
})

const loadingStep = computed(() => {
  if (!userDataStore.isAuthenticated) return 0
  if (userDataStore.profileLoading) return 1
  if (userDataStore.propertiesLoading) return 2
  if (userDataStore.transactionsLoading) return 3
  if (userDataStore.mxRecordsLoading) return 4
  if (userDataStore.leasesLoading) return 5
  return 6
})

const contacts = [
  { id: 'c1', name: 'AquaFix LLC', role: 'SP • Plumbing', initials: 'AF' },
  { id: 'c2', name: 'Westlake Tenant', role: 'TT', initials: 'WT' },
  { id: 'c3', name: 'Property Owner', role: 'PO', initials: 'PO' },
]

// Dialog states for create forms
const showCreatePropertyDialog = ref(false)
const showTaskComposer = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)

// Renewal history dialog
const showRenewalHistoryDialog = ref(false)
const selectedReminderForHistory = ref(null)

// Quick stats computed properties
const getTransactionDate = (t) => {
  const d = t.transac_date || t.created_datetime || t.date
  return d?.toDate ? d.toDate() : new Date(d)
}
const isIncomeType = (t) => {
  if (t.type === 'income') return true
  const tt = String(t.transac_type || '').toLowerCase()
  return tt.includes('rent') || tt.includes('deposit') || tt.includes('refund')
}
const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = getTransactionDate(t)
      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        isIncomeType(t)
      )
    })
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const monthlyExpense = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = getTransactionDate(t)
      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        !isIncomeType(t)
      )
    })
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const openTasks = computed(() => {
  return userDataStore.userAccessibleMxRecords.filter((mx) => !mx.status || mx.status === 'open')
    .length
})

const activeLeases = computed(() => {
  return userDataStore.userAccessibleLeases.filter(
    (lease) => lease.status === 'active' || lease.status === 'occupied',
  ).length
})

// Feed helpers (PM/PO design)
const normalizeId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const parsed = String(value).trim()
    if (!parsed || parsed.toLowerCase() === 'undefined' || parsed.toLowerCase() === 'null') continue
    return parsed
  }
  return ''
}
const makeEventId = (type, dataId) => `${type}-${dataId}`
const toDateSafe = (value) => {
  if (!value) return null
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const getEventTimestamp = (item) => {
  const date =
    toDateSafe(item?.eventDate) ||
    toDateSafe(item?.created_datetime) ||
    toDateSafe(item?.created_date) ||
    toDateSafe(item?.report_date) ||
    toDateSafe(item?.transac_date) ||
    toDateSafe(item?.lease_create_date) ||
    toDateSafe(item?.start_date)
  return date ? date.getTime() : 0
}
const getEventDate = (item) =>
  toDateSafe(item?.eventDate) ||
  toDateSafe(item?.created_datetime) ||
  toDateSafe(item?.created_date) ||
  toDateSafe(item?.report_date) ||
  toDateSafe(item?.transac_date) ||
  toDateSafe(item?.lease_create_date) ||
  toDateSafe(item?.start_date)
const formatEventTime = (item) => {
  const eventDate = getEventDate(item)
  if (!eventDate) return 'Created: N/A'
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const diffDays = Math.floor((today - eventDay) / (24 * 60 * 60 * 1000))
  let relativeLabel = 'Today'
  if (diffDays === 1) relativeLabel = '1 day ago'
  if (diffDays > 1) relativeLabel = `${diffDays} days ago`
  return `Created: ${eventDate.toLocaleDateString()} • ${relativeLabel}`
}

const resolvePropertyName = (propertyId) => {
  if (!propertyId) return 'Unknown Property'
  const prop = (userDataStore.userAccessibleProperties || []).find((p) => p.id === propertyId)
  return prop ? prop.nickname || prop.address || 'Unknown Property' : 'Unknown Property'
}

const taskFeedItems = computed(() =>
  (userDataStore.userAccessibleMxRecords || [])
    .map((task) => ({
      eventId: makeEventId('task', normalizeId(task.id, task.mx_id)),
      id: `task-${task.id}`,
      type: 'task',
      avatarColor: 'blue-2',
      avatarIcon: 'build',
      title: `Task ${task.mx_id || `#${task.id}`}`,
      property: resolvePropertyName(task.property_id),
      brief: task.description || 'Task has new updates.',
      detailPath: '/mx-records',
      dataType: 'task',
      dataId: normalizeId(task.id, task.mx_id),
      eventDate: task.updatedAt || task.createAt || task.report_date,
    }))
)

const transactionFeedItems = computed(() =>
  (userDataStore.userAccessibleTransactions || [])
    .map((transaction) => ({
      eventId: makeEventId('transaction', normalizeId(transaction.id, transaction.transac_id)),
      id: `txn-${transaction.id}`,
      type: 'transaction',
      avatarColor: 'green-2',
      avatarIcon: 'receipt_long',
      title: `${transaction.transac_type || 'Transaction'}`,
      property: resolvePropertyName(transaction.property_id),
      brief: transaction.note || transaction.description || 'Transaction record updated.',
      amount: transaction.amount ? `$${parseFloat(transaction.amount).toLocaleString()}` : null,
      detailPath: '/transactions',
      dataType: 'transaction',
      dataId: normalizeId(transaction.id, transaction.transac_id),
      eventDate: transaction.created_datetime || transaction.transac_date || transaction.date,
    }))
)

const leaseFeedItems = computed(() =>
  (userDataStore.userAccessibleLeases || [])
    .map((lease) => {
      const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
      return {
        eventId: makeEventId('lease', normalizeId(lease.id, lease.lease_id, lease.LSID)),
        id: `lease-${lease.id}`,
        type: 'lease',
        avatarColor: 'orange-2',
        avatarIcon: 'event',
        title: `Lease ${lease.LSID || `#${lease.id}`}`,
        property: resolvePropertyName(leasePropertyId),
        brief: lease.status ? `Status: ${lease.status}` : 'Lease details updated.',
        detailPath: '/leases',
        dataType: 'lease',
        dataId: normalizeId(lease.id, lease.lease_id, lease.LSID),
        eventDate: lease.updatedAt || lease.created_datetime || lease.lease_create_date,
      }
    })
)

// Sort state
const feedSortField = ref('time')
const feedSortAsc = ref(false)

const allFeedItems = computed(() => {
  const items = [
    ...taskFeedItems.value,
    ...transactionFeedItems.value,
    ...leaseFeedItems.value,
  ]
  const field = feedSortField.value
  const asc = feedSortAsc.value
  items.sort((a, b) => {
    let cmp = 0
    if (field === 'time') {
      cmp = getEventTimestamp(a) - getEventTimestamp(b)
    } else if (field === 'type') {
      cmp = a.type.localeCompare(b.type)
    } else if (field === 'property') {
      cmp = (a.property || '').localeCompare(b.property || '')
    }
    return asc ? cmp : -cmp
  })
  return items
})
const isMainFeedEmpty = computed(() => allFeedItems.value.length === 0)

const toggleSort = (field) => {
  if (feedSortField.value === field) {
    feedSortAsc.value = !feedSortAsc.value
  } else {
    feedSortField.value = field
    feedSortAsc.value = field === 'time' ? false : true
  }
}
const sortIcon = (field) => {
  if (feedSortField.value !== field) return 'unfold_more'
  return feedSortAsc.value ? 'arrow_upward' : 'arrow_downward'
}

// Reminder items for left rail (mock + rent reminders)
const toMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const propertyReminderItems = computed(() =>
  (propertyReminders.value || []).map((reminder) => {
    const propId = reminder.property_id?.id || reminder.property_id
    const propertyName = resolvePropertyName(propId)
    const today = toMidnight(new Date())
    let daysDue = null
    let dueLabel = ''
    if (reminder.start_date) {
      const startDate = new Date(reminder.start_date)
      if (!isNaN(startDate)) {
        daysDue = Math.floor((toMidnight(startDate) - today) / (24 * 60 * 60 * 1000))
        if (daysDue < 0) dueLabel = `${Math.abs(daysDue)}d overdue`
        else if (daysDue === 0) dueLabel = 'Due today'
        else dueLabel = `${daysDue}d left`
      }
    }
    return {
      eventId: makeEventId('reminder', normalizeId(reminder.id, reminder.reminder_id)),
      id: normalizeId(reminder.id, reminder.reminder_id),
      type: 'reminder',
      avatarColor: reminder.status ? 'purple-2' : 'grey-4',
      avatarIcon: reminder.status ? 'notifications_active' : 'notifications_off',
      title: `${String(reminder.category || 'Reminder').toUpperCase()} reminder`,
      propertyName,
      daysDue,
      dueLabel,
      detailPath: '/reminders',
      dataType: 'reminder',
      dataId: normalizeId(reminder.id, reminder.reminder_id),
      eventDate: reminder.created_date || reminder.start_date,
    }
  })
)

const reminderItems = computed(() => [...propertyReminderItems.value])
const filteredReminderItems = computed(() =>
  reminderItems.value.filter((item) => normalizeId(item.dataId, item.targetId))
)

const openDetail = (post) => {
  if (!post?.detailPath) return
  const dataType = String(post?.dataType || post?.targetType || '').trim()
  const dataId = normalizeId(post?.dataId, post?.targetId)
  if (!dataType || !dataId) {
    Notify.create({ type: 'warning', message: 'This feed item is not linked to a detail record yet.', position: 'top' })
    return
  }
  if (dataType === 'transaction') {
    const txn = userDataStore.userAccessibleTransactions.find(
      (t) => t.id === dataId || t.transac_id === dataId
    )
    if (txn) {
      selectedTransaction.value = txn
      showTransactionDetail.value = true
      return
    }
  }
  router.push({ path: post.detailPath, query: { openType: dataType, openId: dataId } })
}

const openReminderDetail = (item) => {
  if (item?.detailPath) router.push(item.detailPath)
}

// Process dashboard data
const processDashboardData = () => {
  console.log('Processing dashboard data...')

  // Get recent tasks (last 5)
  recentMxRecords.value = userDataStore.userAccessibleMxRecords
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
    .slice(0, 5)

  // Get recent transactions (last 5)
  const getTxnDate = (t) => {
    const d = t.transac_date || t.created_datetime || t.date
    return d?.toDate ? d.toDate() : new Date(d)
  }
  recentTransactions.value = userDataStore.userAccessibleTransactions
    .sort((a, b) => getTxnDate(b) - getTxnDate(a))
    .slice(0, 5)

  console.log('Dashboard data processed:', {
    mxRecords: recentMxRecords.value.length,
    transactions: recentTransactions.value.length,
  })
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

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Computed property for sorted renewals (most recent first)
const sortedRenewals = computed(() => {
  if (!selectedReminderForHistory.value?.renewals) return []

  return [...selectedReminderForHistory.value.renewals].sort((a, b) => {
    return new Date(b.renewed_at) - new Date(a.renewed_at)
  })
})

const dueSoonReminders = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return reminders.value.filter((reminder) => {
    if (!reminder?.due_date) return false
    const dueDate = new Date(reminder.due_date)
    if (Number.isNaN(dueDate.getTime())) return false
    dueDate.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })
})

// Renewal history functions
const closeRenewalHistoryDialog = () => {
  showRenewalHistoryDialog.value = false
  selectedReminderForHistory.value = null
}

const getDueReminderChipLabel = (reminder) => {
  if (!reminder?.due_date) return 'Unknown'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(reminder.due_date)
  dueDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 Day'
  return `${diffDays} Days`
}

const getDueReminderChipColor = (reminder) => {
  const label = getDueReminderChipLabel(reminder)
  if (label === 'Today') return 'negative'
  if (label === '1 Day') return 'warning'
  return 'primary'
}

const getDueAlertSessionKey = () => {
  const userId = userDataStore.userId || 'anonymous'
  const today = new Date().toISOString().split('T')[0]
  return `due-reminder-alert-dismissed:${userId}:${today}`
}

const maybeShowDueReminderAlert = () => {
  if (!userDataStore.isAuthenticated) return
  if (dueSoonReminders.value.length === 0) return
  const dismissed = sessionStorage.getItem(getDueAlertSessionKey())
  if (dismissed === 'true') return
  showDueReminderAlert.value = true
}

const closeDueReminderAlert = () => {
  showDueReminderAlert.value = false
  sessionStorage.setItem(getDueAlertSessionKey(), 'true')
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

// Quick actions dialog handlers
const openCreatePropertyDialog = () => {
  showCreatePropertyDialog.value = true
  showQuickActions.value = false
}

const openCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = true
  showQuickActions.value = false
}

const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
  showQuickActions.value = false
}

const openCreateTaskDialog = () => {
  showTaskComposer.value = true
  showQuickActions.value = false
}

const openDocumentsPage = () => {
  router.push('/documents')
  showQuickActions.value = false
}

const openAssetsPage = () => {
  router.push('/assets')
  showQuickActions.value = false
}

// Transaction functions
const getPropertyName = (propertyId) => {
  if (!propertyId) return 'Unknown Property'
  const property = userDataStore.userAccessibleProperties.find((prop) => prop.id === propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

// Reminders functions
const loadReminders = () => {
  try {
    // Mock reminders data - in real app, this would come from your backend
    reminders.value = [
      {
        id: '1',
        title: 'Property Inspection Due',
        description: 'Quarterly inspection for Downtown Apartment',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        property_id: 'prop1',
        property_name: 'Downtown Apartment',
        status: 'pending',
        renewals: [], // Track renewal history
      },
      {
        id: '2',
        title: 'Lease Renewal',
        description: 'Lease renewal discussion with tenant',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        property_id: 'prop2',
        property_name: 'Suburban House',
        status: 'pending',
        renewals: [], // Track renewal history
      },
      {
        id: '3',
        title: 'Maintenance Check',
        description: 'HVAC system maintenance scheduled',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue
        property_id: 'prop1',
        property_name: 'Downtown Apartment',
        status: 'overdue',
        renewals: [
          {
            renewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            previous_due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            new_due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ], // Has been renewed once
      },
    ]
  } catch (error) {
    console.error('Error loading reminders:', error)
    reminders.value = []
  }
}

const formatReminderDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else {
    return `In ${diffDays} days`
  }
}

// Dialog event handlers
const onPropertyCreated = () => {
  showCreatePropertyDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Property created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onTaskCreated = async () => {
  showTaskComposer.value = false
  await userDataStore.loadAllUserData()
  Notify.create({
    type: 'positive',
    message: 'Task created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onTransactionCreated = () => {
  showCreateTransactionDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Transaction created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onLeaseCreated = () => {
  showCreateLeaseDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Lease created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

// Watchers
watch(
  () => userDataStore.isAuthenticated,
  async (newValue) => {
    if (newValue) {
      initialLoadTriggered.value = true
      processDashboardData()
    } else {
      recentMxRecords.value = []
      recentTransactions.value = []
      initialLoadTriggered.value = false
    }
  },
)

watch(allCoreLoaded, (ready) => {
  if (ready) {
    processDashboardData()
  }
})

watch(
  () => userDataStore.userAccessibleMxRecords,
  () => {
    if (allCoreLoaded.value) processDashboardData()
  },
)

watch(
  () => userDataStore.userAccessibleTransactions,
  () => {
    if (allCoreLoaded.value) processDashboardData()
  },
)

watch(
  () => userDataStore.userAccessibleProperties,
  () => {
    if (allCoreLoaded.value) processDashboardData()
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

const loadPropertyReminders = async () => {
  try {
    const properties = userDataStore.userAccessibleProperties || []
    if (!properties.length) {
      propertyReminders.value = []
      return
    }
    const reminderGroups = await Promise.all(
      properties.map((property) => getCollectionData(`properties/${property.id}/reminders`))
    )
    propertyReminders.value = reminderGroups.flat().filter(Boolean)
  } catch (error) {
    console.error('Failed to load property reminders for feed:', error)
    propertyReminders.value = []
  }
}

// Lifecycle
onMounted(async () => {
  console.log('IndexPage mounted')

  if (userDataStore.isAuthenticated) {
    initialLoadTriggered.value = true

    const hasCoreFeedData =
      (userDataStore.userAccessibleMxRecords || []).length > 0 ||
      (userDataStore.userAccessibleTransactions || []).length > 0 ||
      (userDataStore.userAccessibleLeases || []).length > 0

    if (!hasCoreFeedData) {
      await userDataStore.loadAllUserData()
    }

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

    processDashboardData()
  }

  await loadPropertyReminders()
  loadReminders()
  maybeShowDueReminderAlert()
})

onUnmounted(() => {})

watch(
  () => userDataStore.userAccessibleProperties.length,
  () => {
    loadPropertyReminders()
  }
)

watch(() => reminders.value.length, maybeShowDueReminderAlert)
</script>

<style scoped>
.pm-po-feed-page {
  padding: 10px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.feed-shell {
  max-width: 1580px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 280px;
  gap: 12px;
}

.feed-reminders,
.feed-main {
  min-width: 0;
}

.feed-main-router {
  width: 100%;
}

.feed-main-router :deep(.q-page) {
  padding: 0 !important;
  min-height: auto !important;
  background: transparent !important;
}

.feed-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-card-mini {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
  transition: all 0.2s ease;
}

.stat-card-mini:hover {
  border-color: var(--neutral-400);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-mini-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--neutral-900);
  margin-top: 4px;
}

.stat-mini-label {
  font-size: 0.7rem;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-context,
.feed-post,
.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.feed-reminders .rail-card {
  box-shadow: none !important;
}

.feed-card-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feed-card-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.feed-card-content {
  flex: 1;
  min-width: 0;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 2px;
}

.post-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-time {
  font-size: 0.7rem;
  color: var(--neutral-500);
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.6;
}

.feed-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.post-property {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.post-body {
  font-size: 0.8rem;
  color: var(--neutral-800);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.post-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.feed-post-section {
  padding: 12px 14px;
}

.feed-post-clickable {
  cursor: pointer;
  transition: box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
}

.feed-post-clickable:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.feed-mini-card {
  border-radius: var(--border-radius-card);
}

.feed-empty-card {
  border-style: dashed;
}

.reminder-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reminder-view-all-btn {
  font-size: 0.68rem !important;
  padding: 0 6px !important;
  min-height: 22px !important;
}

.rail-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neutral-800);
}

.reminder-card-compact {
  border-radius: var(--border-radius-card);
  box-shadow: none !important;
  cursor: pointer;
  transition: background 0.15s ease;
}

.reminder-card-compact:hover {
  background: var(--neutral-50, #f8f9fa) !important;
}

.reminder-compact-section {
  padding: 8px 10px !important;
}

.reminder-compact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.reminder-compact-left {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--neutral-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-property-name {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.reminder-due-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.reminder-due-badge.due-overdue {
  background: #ffebee;
  color: #d32f2f;
}

.reminder-due-badge.due-today {
  background: #fff3e0;
  color: #e65100;
}

.reminder-due-badge.due-soon {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Create New Section */
.create-new-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.create-new-section {
  padding: 12px 16px !important;
}

.create-new-prompt {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--border-radius-card);
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.create-new-prompt:hover {
  background: var(--neutral-100);
  border-color: var(--neutral-300);
}

.create-new-text {
  font-size: 0.875rem;
  color: var(--neutral-500);
}

.create-new-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.create-new-actions > .q-btn {
  font-size: 0.8rem;
  color: var(--neutral-700) !important;
  border: none !important;
  background: transparent !important;
}

.create-new-actions > .q-btn:hover {
  background: var(--neutral-100) !important;
  color: var(--primary-color) !important;
}

.feed-sort-group {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.feed-sort-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-400);
  margin-right: 2px;
}

.feed-sort-btn {
  font-size: 0.75rem;
  padding: 2px 6px;
  min-height: 26px;
}

/* Ad Placeholder */
.ad-placeholder {
  min-height: 120px;
  border-radius: 10px;
  border: 1px dashed var(--neutral-300);
  background: var(--bg-secondary);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
  font-size: 0.85rem;
}

@media (max-width: 1480px) {
  .feed-shell {
    grid-template-columns: 240px minmax(0, 1fr) 260px;
  }
}

@media (max-width: 1280px) {
  .feed-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }
  .feed-rail {
    grid-column: 1 / -1;
  }
  .feed-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .feed-shell {
    grid-template-columns: 1fr;
  }
  .feed-reminders,
  .feed-rail {
    grid-column: auto;
  }
  .feed-list {
    gap: 8px;
  }
  .create-new-actions {
    gap: 2px;
  }
  .feed-stats-row {
    grid-template-columns: 1fr;
  }
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
  background: var(--tag-blue-bg);
  color: var(--primary-color);
}

.loading-step.completed {
  background: var(--tag-blue-alt);
  color: var(--primary-dark);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 8px 2px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-grid__full {
  width: 100%;
}

.dashboard-grid__row {
  width: 100%;
}

.dashboard-grid__two-col {
  width: 100%;
}

.page-header .header-title p {
  color: var(--neutral-600);
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.quick-actions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
}

.quick-action-btn {
  font-weight: 600;
}

.header-title h1 {
  margin: 0;
  color: var(--neutral-900);
}

.header-title p {
  margin: 4px 0 0 0;
}

.refresh-btn {
  margin-left: 16px;
}

.stats-section {
  margin-bottom: 12px;
}

.stat-card {
  height: 110px;
  min-height: 110px;
  border-radius: var(--border-radius-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-300);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-surface);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
  border-color: var(--neutral-400);
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
  background: var(--primary-glow);
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
  font-size: 1.5rem !important;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
  color: var(--neutral-900);
  letter-spacing: -0.02em;
}

.stat-card__label {
  font-size: 0.8125rem !important;
  line-height: 1.4;
  color: var(--neutral-600);
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-sections {
  margin-bottom: 24px;
}

.dashboard-section {
  border-radius: var(--border-radius-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  background: var(--bg-surface);
  border: 1px solid var(--neutral-300);
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.dashboard-section:hover {
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
  border-color: var(--neutral-400);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.section-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--neutral-900);
  font-size: 1.125rem;
  letter-spacing: -0.01em;
}

.section-content {
  padding: 16px 20px;
  background: var(--bg-surface);
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
  gap: 8px;
}

.record-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--neutral-300);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
}

.record-item:hover,
.transaction-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.record-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item.clickable:hover {
  background: var(--accent-glow);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.transaction-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.transaction-item.clickable:hover {
  background: var(--accent-glow);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.transaction-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.record-description {
  flex: 1;
  font-weight: 600;
  color: var(--neutral-900);
  font-size: 0.9375rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-details {
  display: flex;
  align-items: center;
  gap: 6px;
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
  box-shadow: 0 4px 16px var(--accent-glow);
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
  border-bottom: 1px solid var(--border-color);
  background: #f8f9fa;
}

/* Button Text Styling - Use outline style colors */
.btn-primary,
.btn-secondary,
.refresh-btn {
  font-weight: 600 !important;
  /* Color is handled by global button styles - no override needed */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 10px;
  }

  .header-content {
    gap: 8px;
  }

  .quick-actions-bar {
    gap: 8px;
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

/* Dialog Styles */
.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
}

.dialog-close-btn {
  color: #666;
}

.dialog-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Legacy reminder styles removed — compact reminder styles are above */

/* Renewal History Dialog Styles */
.renewal-reminder-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
}

.due-reminder-dialog {
  border-radius: 12px;
}

.renewal-details {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.renewal-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.renewal-detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 600;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

/* ========================================
   DARK MODE STYLES
   ======================================== */

:global(body.body--dark) .pm-po-feed-page {
  background: #121212 !important;
}

:global(body.body--dark) .data-loading-page {
  background: rgba(18, 18, 18, 0.95) !important;
}

:global(body.body--dark) .loading-step {
  background: var(--bg-tertiary) !important;
  color: white !important;
}

:global(body.body--dark) .loading-step.active {
  background: var(--accent-glow) !important;
  color: var(--accent-light) !important;
}

:global(body.body--dark) .loading-step.completed {
  background: rgba(76, 175, 80, 0.2) !important;
  color: #4caf50 !important;
}

:global(body.body--dark) .header-title h1 {
  color: white !important;
}

:global(body.body--dark) .stat-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .stat-card__value {
  color: white !important;
}

:global(body.body--dark) .stat-card__label {
  color: #ffffff !important;
}

:global(body.body--dark) .stat-card__icon {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .dashboard-section {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .section-header {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .section-title {
  color: white !important;
}

:global(body.body--dark) .section-content {
  background: var(--bg-surface) !important;
}

:global(body.body--dark) .record-item,
:global(body.body--dark) .transaction-item {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .record-item:hover,
:global(body.body--dark) .transaction-item:hover {
  background: rgba(45, 212, 191, 0.16) !important;
  border-color: var(--accent-color) !important;
}

:global(body.body--dark) .record-description,
:global(body.body--dark) .record-title,
:global(body.body--dark) .transaction-title {
  color: white !important;
}

:global(body.body--dark) .record-amount,
:global(body.body--dark) .transaction-amount {
  color: white !important;
}

:global(body.body--dark) .empty-state {
  color: #ffffff !important;
}

:global(body.body--dark) .quick-actions-dialog {
  background: var(--bg-surface) !important;
}

:global(body.body--dark) .quick-actions-dialog .q-card-section {
  background: var(--bg-surface) !important;
}

:global(body.body--dark) .quick-actions-dialog .q-card-section:first-child {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .dialog-header {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .dialog-close-btn {
  color: white !important;
}

:global(body.body--dark) .reminders-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .reminder-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .reminder-card.reminder-overdue {
  background: rgba(244, 67, 54, 0.1) !important;
}

:global(body.body--dark) .reminder-title {
  color: white !important;
}

:global(body.body--dark) .reminder-description {
  color: #ffffff !important;
}

:global(body.body--dark) .reminder-date {
  color: #ffffff !important;
}

:global(body.body--dark) .carousel-dot {
  background: #4a4a4a !important;
}

:global(body.body--dark) .carousel-dot.active {
  background: var(--accent-color) !important;
}

:global(body.body--dark) .reminders-carousel::-webkit-scrollbar-thumb {
  background: #4a4a4a !important;
}

:global(body.body--dark) .empty-reminders {
  background: transparent !important;
  color: #ffffff !important;
}

:global(body.body--dark) .renewal-reminder-info {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .renewal-details {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .renewal-detail-item {
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .detail-label {
  color: #ffffff !important;
}

:global(body.body--dark) .detail-value {
  color: white !important;
}
</style>
