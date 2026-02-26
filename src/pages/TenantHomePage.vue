<template>
  <q-page class="tt-feed-page q-pa-sm">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>
        <div class="loading-steps q-mt-lg">
          <div class="loading-step" :class="{ active: loadingStep >= 1, completed: loadingStep > 1 }">
            <q-icon name="person" size="20px" />
            <span>Loading Profile</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 2, completed: loadingStep > 2 }">
            <q-icon name="description" size="20px" />
            <span>Loading Lease</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 3, completed: loadingStep > 3 }">
            <q-icon name="receipt_long" size="20px" />
            <span>Loading Transactions</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 4, completed: loadingStep > 4 }">
            <q-icon name="task" size="20px" />
            <span>Loading Tasks</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 5, completed: loadingStep > 5 }">
            <q-icon name="folder" size="20px" />
            <span>Loading Documents</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 6, completed: dataLoaded }">
            <q-icon name="dashboard" size="20px" />
            <span>Preparing Feed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-column Feed Layout -->
    <div v-else class="feed-shell">
      <!-- Left Rail: Lease Info -->
      <aside class="feed-reminders">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title">My Lease</div>

            <div v-if="!currentLease" class="lease-empty">
              <q-icon name="info" size="32px" color="grey-4" />
              <div class="lease-empty-text">No active lease</div>
            </div>

            <div v-else class="lease-info-list">
              <div class="lease-info-item">
                <q-icon name="home" size="16px" color="primary" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Property</div>
                  <div class="lease-info-value">{{ leasePropertyName }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="verified" size="16px" color="positive" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Status</div>
                  <div class="lease-info-value">{{ currentLease.status || 'N/A' }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="payments" size="16px" color="warning" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Monthly Rent</div>
                  <div class="lease-info-value rent-value">${{ formatAmount(currentLease.rate_amount) }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="event" size="16px" color="info" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Term</div>
                  <div class="lease-info-value">{{ currentLease.lease_term || 'N/A' }} months</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="savings" size="16px" color="purple" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Deposit</div>
                  <div class="lease-info-value">${{ formatAmount(currentLease.deposit) }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="timer" size="16px" color="accent" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Days to Renew</div>
                  <div class="lease-info-value">{{ leaseRemainingDays }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="calendar_today" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">Start</div>
                  <div class="lease-info-value">{{ formatDate(currentLease.lease_start_date) }}</div>
                </div>
              </div>
              <div class="lease-info-item">
                <q-icon name="event_busy" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="lease-info-detail">
                  <div class="lease-info-label">End</div>
                  <div class="lease-info-value">{{ formatDate(currentLease.lease_end_date) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Past Leases -->
        <q-card v-if="pastLeases.length" class="rail-card q-mt-sm">
          <q-card-section class="q-pa-sm">
            <div class="section-header">
              <div class="rail-title">Past Leases</div>
            </div>
            <div class="past-lease-list">
              <div
                v-for="lease in pastLeases"
                :key="lease.id"
                class="past-lease-item"
                @click="router.push('/leases')"
              >
                <div class="past-lease-name">{{ lease.property_id?.nickname || lease.property_id?.address || 'Property' }}</div>
                <div class="past-lease-meta">{{ lease.status }} · {{ lease.lease_term || '?' }}mo</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Lease Documents -->
        <q-card v-if="documents.length" class="rail-card q-mt-sm">
          <q-card-section class="q-pa-sm">
            <div class="section-header">
              <div class="rail-title">Documents</div>
              <q-btn flat dense no-caps size="xs" color="primary" label="Upload" icon="upload_file" @click="showUploadDialog = true" />
            </div>
            <div class="doc-list">
              <div
                v-for="doc in documents.slice(0, 5)"
                :key="doc.id"
                class="doc-item"
                @click="openDocument(doc)"
              >
                <q-icon :name="docIcon(doc.content_type)" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="doc-item-info">
                  <div class="doc-item-name">{{ doc.name }}</div>
                  <div class="doc-item-meta">{{ doc.category }} · {{ formatDate(doc.created_at) }}</div>
                </div>
              </div>
            </div>
            <div v-if="documents.length > 5" class="text-center q-mt-xs">
              <q-btn flat dense no-caps size="xs" color="primary" :label="`View all ${documents.length}`" @click="router.push('/documents')" />
            </div>
          </q-card-section>
        </q-card>
      </aside>

      <!-- Main Feed -->
      <div class="feed-main">
        <!-- Stats row -->
        <div class="feed-stats-row q-mb-md">
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="timer" size="20px" color="primary" />
              <div class="stat-mini-value">{{ leaseRemainingDays }}</div>
              <div class="stat-mini-label">Days to Renew</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="payments" size="20px" color="positive" />
              <div class="stat-mini-value">${{ formatAmount(currentLease?.rate_amount) }}</div>
              <div class="stat-mini-label">Monthly Rate</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="receipt_long" size="20px" color="warning" />
              <div class="stat-mini-value">{{ transactions.length }}</div>
              <div class="stat-mini-label">Transactions</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="task" size="20px" color="info" />
              <div class="stat-mini-value">{{ tasks.length }}</div>
              <div class="stat-mini-label">Tasks</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Actions + Sort -->
        <q-card class="create-new-card q-mb-md">
          <q-card-section class="create-new-section">
            <div class="create-new-actions">
              <q-btn flat dense no-caps icon="add_task" label="New Task" @click="showCreateTaskDialog = true" />
              <q-btn flat dense no-caps icon="upload_file" label="Upload" @click="showUploadDialog = true" />

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
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Feed -->
        <div class="feed-list">
          <q-card v-if="isMainFeedEmpty" class="feed-post feed-empty-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="post-title q-mb-xs">No Activity Yet</div>
              <div class="post-body">
                Your transactions, tasks, and lease events will appear here as a timeline.
              </div>
            </q-card-section>
          </q-card>

          <q-card
            v-for="post in allFeedItems"
            :key="post.id"
            class="feed-post feed-mini-card"
            :class="{ 'feed-post-expanded': expandedFeedId === post.id }"
          >
            <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(post.id)">
              <div class="feed-card-row">
                <q-avatar size="32px" :color="post.avatarColor" text-color="white" class="feed-card-avatar">
                  <q-icon :name="post.avatarIcon" size="16px" />
                </q-avatar>
                <div class="feed-card-content">
                  <div class="feed-card-header">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-time">{{ post.timeLabel }}</div>
                  </div>
                  <div class="post-body">{{ post.brief }}</div>
                  <div class="feed-card-footer">
                    <span v-if="post.badge" class="post-amount">{{ post.badge }}</span>
                    <span v-else></span>
                    <div v-if="post.sub" class="post-property">
                      <q-icon :name="post.subIcon || 'info'" size="12px" class="q-mr-xs" />{{ post.sub }}
                    </div>
                  </div>
                </div>
                <q-icon
                  :name="expandedFeedId === post.id ? 'expand_less' : 'expand_more'"
                  size="18px"
                  color="grey-5"
                  class="feed-expand-icon"
                />
              </div>
            </q-card-section>

            <!-- Expanded detail panel -->
            <q-slide-transition>
              <div v-show="expandedFeedId === post.id" class="feed-detail-panel">
                <q-separator />

                <!-- Task detail -->
                <div v-if="post.type === 'task'" class="feed-detail-body">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Category</span>
                      <span class="detail-value">{{ post.raw.category || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Priority</span>
                      <q-chip dense size="sm" :color="post.raw.priority === 'urgent' ? 'red' : post.raw.priority === 'high' ? 'orange' : post.raw.priority === 'medium' ? 'amber' : 'grey'" text-color="white">
                        {{ post.raw.priority || 'N/A' }}
                      </q-chip>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Status</span>
                      <span class="detail-value">{{ post.raw.status || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Due Date</span>
                      <span class="detail-value">{{ formatDate(post.raw.due_date) }}</span>
                    </div>
                  </div>
                  <div v-if="post.raw.description" class="detail-description">
                    <span class="detail-label">Description</span>
                    <p>{{ post.raw.description }}</p>
                  </div>
                </div>

                <!-- Document detail -->
                <div v-else-if="post.type === 'document'" class="feed-detail-body">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Category</span>
                      <span class="detail-value">{{ post.raw.category || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Uploaded</span>
                      <span class="detail-value">{{ formatDate(post.raw.created_at) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Type</span>
                      <span class="detail-value">{{ post.raw.content_type || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Size</span>
                      <span class="detail-value">{{ post.raw.size ? (post.raw.size / 1024).toFixed(1) + ' KB' : '—' }}</span>
                    </div>
                  </div>
                  <div v-if="post.raw.note" class="detail-description">
                    <span class="detail-label">Note</span>
                    <p>{{ post.raw.note }}</p>
                  </div>
                  <div class="detail-actions">
                    <q-btn flat dense no-caps size="sm" icon="open_in_new" label="Open File" color="primary" @click.stop="openDocument(post.raw)" />
                  </div>
                </div>

                <!-- Transaction detail -->
                <div v-else-if="post.type === 'transaction'" class="feed-detail-body">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Type</span>
                      <span class="detail-value">{{ post.raw.type || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Amount</span>
                      <span class="detail-value text-weight-bold">${{ formatAmount(post.raw.amount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Category</span>
                      <span class="detail-value">{{ post.raw.category || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Date</span>
                      <span class="detail-value">{{ formatDate(post.raw.date) }}</span>
                    </div>
                  </div>
                  <div v-if="post.raw.notes" class="detail-description">
                    <span class="detail-label">Notes</span>
                    <p>{{ post.raw.notes }}</p>
                  </div>
                </div>

                <!-- Lease detail -->
                <div v-else-if="post.type === 'lease'" class="feed-detail-body">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Status</span>
                      <span class="detail-value">{{ post.raw.status || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Monthly Rent</span>
                      <span class="detail-value text-weight-bold">${{ formatAmount(post.raw.rate_amount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Term</span>
                      <span class="detail-value">{{ post.raw.lease_term || '—' }} months</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Deposit</span>
                      <span class="detail-value">${{ formatAmount(post.raw.deposit) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </q-slide-transition>
          </q-card>
        </div>
      </div>

      <!-- Right Rail: Ad Slot -->
      <aside class="feed-rail">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Ad Slot</div>
            <div class="ad-placeholder">Reserved for future ad placement</div>
          </q-card-section>
        </q-card>
      </aside>
    </div>

    <!-- Upload Document Dialog -->
    <q-dialog v-model="showUploadDialog">
      <q-card class="upload-dialog-card">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Upload Document</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator class="q-mt-sm" />
        <q-card-section>
          <q-file
            v-model="uploadFiles"
            label="Select files"
            outlined
            multiple
            use-chips
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            max-files="5"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-select
            v-model="uploadCategory"
            :options="docCategories"
            label="Category"
            outlined
            class="q-mb-md"
          />
          <q-input v-model="uploadNote" label="Note (optional)" outlined />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Upload"
            :disable="!uploadFiles || uploadFiles.length === 0"
            :loading="uploading"
            @click="handleUpload"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create Task Dialog -->
    <q-dialog v-model="showCreateTaskDialog">
      <q-card style="min-width: 380px; max-width: 480px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Create Task</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator class="q-mt-sm" />
        <q-card-section class="q-gutter-sm">
          <q-input v-model="newTaskTitle" label="Title" outlined dense />
          <q-input v-model="newTaskDescription" label="Description" outlined dense type="textarea" autogrow />
          <q-select
            v-model="newTaskCategory"
            :options="taskCategories"
            label="Category"
            outlined
            dense
          />
          <q-select
            v-model="newTaskPriority"
            :options="['low', 'medium', 'high', 'urgent']"
            label="Priority"
            outlined
            dense
          />
          <q-input v-model="newTaskDueDate" label="Due Date" outlined dense type="date" />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Create"
            :disable="!newTaskTitle"
            :loading="creatingTask"
            @click="handleCreateTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../boot/firebase'
import { storage } from '../boot/firebase'

const router = useRouter()
const userDataStore = useUserDataStore()

const currentLease = ref(null)
const transactions = ref([])
const tasks = ref([])
const pastLeases = ref([])

// Upload dialog
const showUploadDialog = ref(false)
const uploadFiles = ref(null)
const uploadCategory = ref('General')
const uploadNote = ref('')
const uploading = ref(false)
const docCategories = ['General', 'Lease Agreement', 'ID / Proof of Identity', 'Insurance', 'Income Verification', 'Move-in / Move-out', 'Other']

// Create task dialog
const showCreateTaskDialog = ref(false)
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskCategory = ref('Maintenance')
const newTaskPriority = ref('medium')
const newTaskDueDate = ref('')
const creatingTask = ref(false)
const taskCategories = ['Maintenance', 'Repair', 'Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Pest Control', 'Cleaning', 'Safety', 'Other']

// Documents
const documents = ref([])
const documentsLoading = ref(true)

const leaseLoading = ref(true)
const transactionsLoading = ref(true)
const tasksLoading = ref(true)
const pastLeasesLoading = ref(true)

const loadingStep = computed(() => {
  if (!userDataStore.isAuthenticated) return 0
  if (leaseLoading.value && transactionsLoading.value && tasksLoading.value) return 1
  if (leaseLoading.value) return 2
  if (transactionsLoading.value) return 3
  if (tasksLoading.value) return 4
  if (documentsLoading.value) return 5
  return 6
})

const dataLoaded = computed(() => {
  return !leaseLoading.value && !transactionsLoading.value && !tasksLoading.value && !pastLeasesLoading.value && !documentsLoading.value
})

// Helpers
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    if (isNaN(dateObj.getTime())) return 'N/A'
    return dateObj.toLocaleDateString()
  } catch {
    return 'N/A'
  }
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const formatRelativeTime = (date) => {
  if (!date) return ''
  const dateObj = date?.toDate ? date.toDate() : new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  const now = new Date()
  const diffMs = now - dateObj
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getTimestamp = (date) => {
  if (!date) return 0
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

const leasePropertyName = computed(() => {
  if (!currentLease.value) return ''
  const p = currentLease.value.property_id
  return p?.nickname || p?.displayName || p?.address || 'My Property'
})

const leaseRemainingDays = computed(() => {
  if (!currentLease.value) return '—'
  const endDate = currentLease.value.lease_end_date
  if (!endDate) return '—'
  const end = endDate?.toDate ? endDate.toDate() : new Date(endDate)
  if (isNaN(end.getTime())) return '—'
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  return days > 0 ? days : 0
})

const docIcon = (contentType) => {
  if (!contentType) return 'insert_drive_file'
  if (contentType.includes('pdf')) return 'picture_as_pdf'
  if (contentType.includes('image')) return 'image'
  if (contentType.includes('word') || contentType.includes('doc')) return 'description'
  return 'insert_drive_file'
}

const openDocument = (doc) => {
  if (doc.url) window.open(doc.url, '_blank')
}

// Expanded feed item
const expandedFeedId = ref(null)
const toggleFeedExpand = (id) => {
  expandedFeedId.value = expandedFeedId.value === id ? null : id
}

// Feed items
const transactionFeedItems = computed(() =>
  transactions.value.map((txn) => ({
    id: `txn-${txn.id}`,
    type: 'transaction',
    avatarColor: txn.type === 'income' ? 'green-2' : 'red-2',
    avatarIcon: txn.type === 'income' ? 'arrow_circle_up' : 'arrow_circle_down',
    title: txn.category || 'Transaction',
    brief: txn.notes || `${txn.type || 'payment'} · ${formatDate(txn.date)}`,
    badge: txn.amount ? `${txn.type === 'income' ? '+' : '-'}$${formatAmount(txn.amount)}` : null,
    sub: txn.category || null,
    subIcon: 'receipt_long',
    eventDate: txn.date,
    timeLabel: formatRelativeTime(txn.date),
    raw: txn,
  })),
)

const taskFeedItems = computed(() =>
  tasks.value.map((task) => ({
    id: `task-${task.id}`,
    type: 'task',
    avatarColor: 'orange-2',
    avatarIcon: 'task',
    title: task.title || task.category || 'Task',
    brief: task.description || `Due: ${formatDate(task.due_date)}`,
    badge: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : null,
    sub: task.due_date ? `Due ${formatDate(task.due_date)}` : null,
    subIcon: 'event',
    eventDate: task.due_date || task.created_date,
    timeLabel: formatRelativeTime(task.due_date || task.created_date),
    raw: task,
  })),
)

const leaseFeedItems = computed(() => {
  const items = []
  if (currentLease.value) {
    items.push({
      id: `lease-${currentLease.value.id}`,
      type: 'lease',
      avatarColor: 'blue-2',
      avatarIcon: 'description',
      title: `Lease ${currentLease.value.LSID || ''}`,
      brief: `Status: ${currentLease.value.status || 'Active'} · Rent: $${formatAmount(currentLease.value.rate_amount)}/mo`,
      badge: currentLease.value.status || null,
      sub: leasePropertyName.value,
      subIcon: 'home',
      eventDate: currentLease.value.lease_create_date,
      timeLabel: formatRelativeTime(currentLease.value.lease_create_date),
      raw: currentLease.value,
    })
  }
  pastLeases.value.forEach((lease) => {
    items.push({
      id: `past-lease-${lease.id}`,
      type: 'lease',
      avatarColor: 'grey-4',
      avatarIcon: 'history',
      title: `Past Lease ${lease.LSID || ''}`,
      brief: `${lease.status || 'Ended'} · ${lease.lease_term || '?'} months · $${formatAmount(lease.rate_amount)}/mo`,
      badge: lease.status || null,
      sub: lease.property_id?.nickname || lease.property_id?.address || 'Property',
      subIcon: 'home',
      eventDate: lease.lease_create_date,
      timeLabel: formatRelativeTime(lease.lease_create_date),
      raw: lease,
    })
  })
  return items
})

const documentFeedItems = computed(() =>
  documents.value.map((doc) => ({
    id: `doc-${doc.id}`,
    type: 'document',
    avatarColor: 'purple-2',
    avatarIcon: docIcon(doc.content_type),
    title: doc.name || 'Document',
    brief: `${doc.category || 'General'} · ${doc.uploaded_by_role === 'tenant' ? 'Uploaded by you' : 'Shared with you'}`,
    badge: doc.category || null,
    sub: null,
    subIcon: 'folder',
    eventDate: doc.created_at,
    timeLabel: formatRelativeTime(doc.created_at),
    raw: doc,
  })),
)

// Sort
const feedSortField = ref('time')
const feedSortAsc = ref(false)

const allFeedItems = computed(() => {
  const items = [
    ...transactionFeedItems.value,
    ...taskFeedItems.value,
    ...leaseFeedItems.value,
    ...documentFeedItems.value,
  ]
  const field = feedSortField.value
  const asc = feedSortAsc.value
  items.sort((a, b) => {
    let cmp = 0
    if (field === 'time') {
      cmp = getTimestamp(a.eventDate) - getTimestamp(b.eventDate)
    } else if (field === 'type') {
      cmp = a.type.localeCompare(b.type)
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

// Data fetching
const fetchCurrentLease = async () => {
  try {
    const userId = userDataStore.userId
    if (!userId) return
    const leasesRef = collection(db, 'leases')
    const q = query(leasesRef, where('tenant_id', '==', userId), where('status', '==', 'Rented'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      currentLease.value = { id: snap.docs[0].id, ...snap.docs[0].data() }
    }
  } catch (error) {
    console.error('Error fetching current lease:', error)
  } finally {
    leaseLoading.value = false
  }
}

const fetchPastLeases = async () => {
  try {
    const userId = userDataStore.userId
    if (!userId) return
    const leasesRef = collection(db, 'leases')
    const q = query(leasesRef, where('tenant_id', '==', userId), where('status', 'in', ['Terminated', 'Expired']))
    const snap = await getDocs(q)
    pastLeases.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching past leases:', error)
  } finally {
    pastLeasesLoading.value = false
  }
}

const fetchTransactions = async () => {
  try {
    if (!currentLease.value) { transactionsLoading.value = false; return }
    const userId = userDataStore.userId
    const propertyId = currentLease.value.property_string_id || currentLease.value.property_id?.id
    if (!propertyId || !userId) return

    const txnRef = collection(db, 'transactions')
    const q = query(txnRef, where('property_id', '==', propertyId))
    const snap = await getDocs(q)
    const txns = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((txn) => {
        const fromId = typeof txn.from === 'string' ? txn.from : txn.from?.id || txn.from_id
        const toId = typeof txn.to === 'string' ? txn.to : txn.to?.id || txn.to_id
        return fromId === userId || toId === userId || txn.tenant_id === userId
      })
    txns.sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
    transactions.value = txns
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    transactionsLoading.value = false
  }
}

const fetchTasks = async () => {
  try {
    if (!currentLease.value) { tasksLoading.value = false; return }
    const propertyId = currentLease.value.property_string_id || currentLease.value.property_id?.id
    if (!propertyId) { tasksLoading.value = false; return }
    const remindersRef = collection(db, 'properties', propertyId, 'reminders')
    const snap = await getDocs(remindersRef)
    const list = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((t) => t.status !== 'completed')
    list.sort((a, b) => getTimestamp(a.due_date) - getTimestamp(b.due_date))
    tasks.value = list
  } catch (error) {
    console.error('Error fetching tasks:', error)
  } finally {
    tasksLoading.value = false
  }
}

const handleUpload = async () => {
  if (!uploadFiles.value || uploadFiles.value.length === 0) return
  uploading.value = true
  try {
    const userId = userDataStore.userId
    const propertyId = currentLease.value?.property_string_id || currentLease.value?.property_id?.id || 'general'

    for (const file of uploadFiles.value) {
      const filePath = `tenant-documents/${userId}/${propertyId}/${Date.now()}_${file.name}`
      const fileRef = storageRef(storage, filePath)
      await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(fileRef)

      await addDoc(collection(db, 'properties', propertyId, 'documents'), {
        name: file.name,
        category: uploadCategory.value,
        note: uploadNote.value || '',
        url: downloadURL,
        storage_path: filePath,
        uploaded_by: userId,
        uploaded_by_role: 'tenant',
        tenant_id: userId,
        lease_id: currentLease.value?.id || null,
        content_type: file.type,
        size: file.size,
        created_at: serverTimestamp(),
      })
    }

    Notify.create({ type: 'positive', message: `${uploadFiles.value.length} file(s) uploaded successfully.`, position: 'top' })
    showUploadDialog.value = false
    uploadFiles.value = null
    uploadCategory.value = 'General'
    uploadNote.value = ''
    await fetchDocuments()
  } catch (error) {
    console.error('Upload error:', error)
    Notify.create({ type: 'negative', message: error.message || 'Upload failed.', position: 'top' })
  } finally {
    uploading.value = false
  }
}

const fetchDocuments = async () => {
  try {
    if (!currentLease.value) return
    const propertyId = currentLease.value.property_string_id || currentLease.value.property_id?.id
    if (!propertyId) return
    const userId = userDataStore.userId
    const leaseId = currentLease.value.id

    const docsRef = collection(db, 'properties', propertyId, 'documents')
    const snap = await getDocs(docsRef)
    documents.value = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((d) => d.uploaded_by === userId || d.lease_id === leaseId || d.tenant_id === userId || d.visibility === 'tenant')
      .sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at))
  } catch (error) {
    console.error('Error fetching documents:', error)
  } finally {
    documentsLoading.value = false
  }
}

const handleCreateTask = async () => {
  if (!newTaskTitle.value) return
  creatingTask.value = true
  try {
    const propertyId = currentLease.value?.property_string_id || currentLease.value?.property_id?.id
    if (!propertyId) throw new Error('No active lease to create task for')

    await addDoc(collection(db, 'properties', propertyId, 'reminders'), {
      title: newTaskTitle.value,
      description: newTaskDescription.value || '',
      category: newTaskCategory.value,
      priority: newTaskPriority.value,
      due_date: newTaskDueDate.value ? new Date(newTaskDueDate.value) : null,
      status: 'pending',
      created_by: userDataStore.userId,
      created_by_role: 'tenant',
      lease_id: currentLease.value.id,
      property_id: propertyId,
      created_date: serverTimestamp(),
    })

    Notify.create({ type: 'positive', message: 'Task created successfully.', position: 'top' })
    showCreateTaskDialog.value = false
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskCategory.value = 'Maintenance'
    newTaskPriority.value = 'medium'
    newTaskDueDate.value = ''
    await fetchTasks()
  } catch (error) {
    console.error('Create task error:', error)
    Notify.create({ type: 'negative', message: error.message || 'Failed to create task.', position: 'top' })
  } finally {
    creatingTask.value = false
  }
}

onMounted(async () => {
  await fetchCurrentLease()
  await Promise.all([fetchPastLeases(), fetchTransactions(), fetchTasks(), fetchDocuments()])
})
</script>

<style scoped>
.tt-feed-page {
  padding: 10px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

/* Loading */
.data-loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.loading-content {
  max-width: 400px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--neutral-50, #f8f9fa);
  color: var(--neutral-400);
  transition: all 0.3s ease;
}

.loading-step.active {
  background: #e3f2fd;
  color: var(--primary-color, #1976d2);
  font-weight: 600;
}

.loading-step.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

/* 3-column grid */
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

/* Stats */
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

/* Rail cards */
.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.feed-reminders .rail-card {
  box-shadow: none !important;
}

.rail-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neutral-800);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.view-all-btn {
  font-size: 0.68rem !important;
  padding: 0 6px !important;
  min-height: 22px !important;
}

/* Lease info in left rail */
.lease-empty {
  text-align: center;
  padding: 16px 8px;
}

.lease-empty-text {
  font-size: 0.82rem;
  color: var(--neutral-500);
  margin-top: 6px;
}

.lease-info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lease-info-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 4px;
  border-bottom: 1px solid var(--neutral-100, #f3f4f6);
}

.lease-info-item:last-child {
  border-bottom: none;
}

.lease-info-detail {
  flex: 1;
  min-width: 0;
}

.lease-info-label {
  font-size: 0.68rem;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.lease-info-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--neutral-900);
}

.rent-value {
  color: var(--primary-color);
  font-size: 0.92rem;
}

/* Past leases in rail */
.past-lease-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.past-lease-item {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.past-lease-item:hover {
  background: var(--neutral-50, #f8f9fa);
}

.past-lease-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--neutral-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.past-lease-meta {
  font-size: 0.7rem;
  color: var(--neutral-500);
}

/* Quick actions */
.create-new-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.create-new-section {
  padding: 12px 16px !important;
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

/* Feed list */
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

.feed-post-clickable {
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.feed-post-clickable:hover {
  border-color: var(--neutral-400);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.feed-post-section {
  padding: 10px 14px !important;
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
}

.post-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-time {
  font-size: 0.7rem;
  color: var(--neutral-500);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-body {
  font-size: 0.8rem;
  color: var(--neutral-700);
  line-height: 1.4;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.post-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Ad placeholder */
.ad-placeholder {
  min-height: 120px;
  border-radius: 10px;
  border: 1px dashed var(--neutral-300);
  background: var(--bg-secondary);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
}

/* Responsive */
@media (max-width: 1440px) {
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

/* Dark mode */
:global(body.body--dark) .tt-feed-page {
  background: #121212 !important;
}

:global(body.body--dark) .data-loading-page {
  background: rgba(18, 18, 18, 0.95) !important;
}

:global(body.body--dark) .stat-card-mini,
:global(body.body--dark) .rail-card,
:global(body.body--dark) .feed-post,
:global(body.body--dark) .create-new-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .post-title,
:global(body.body--dark) .rail-title,
:global(body.body--dark) .stat-mini-value,
:global(body.body--dark) .lease-info-value {
  color: white !important;
}

.upload-dialog-card {
  min-width: 380px;
  max-width: 480px;
  border-radius: var(--border-radius-card, 10px);
}

/* Expand icon */
.feed-expand-icon {
  flex-shrink: 0;
  margin-left: 4px;
  align-self: center;
}

/* Expanded card highlight */
.feed-post-expanded {
  border-left: 3px solid var(--q-primary);
}

/* Detail panel */
.feed-detail-panel {
  overflow: hidden;
}

.feed-detail-body {
  padding: 10px 14px 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.68rem;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.detail-value {
  font-size: 0.82rem;
  color: var(--text-primary);
}

.detail-description {
  margin-top: 10px;
}
.detail-description p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.detail-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

/* Document list in rail */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.doc-item:hover {
  background: var(--bg-secondary);
}

.doc-item-info {
  flex: 1;
  min-width: 0;
}

.doc-item-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-item-meta {
  font-size: 0.68rem;
  color: var(--neutral-500);
}
</style>
