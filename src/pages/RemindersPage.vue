<template>
  <q-page class="q-pa-md">
    <!-- Quick Stats -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-primary">{{ reminders.length }}</div>
          <div class="text-subtitle2">Total Reminders</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-primary">{{ activeReminders }}</div>
          <div class="text-subtitle2">Active</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-orange">{{ recurringReminders }}</div>
          <div class="text-subtitle2">Recurring</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card">
        <q-card-section class="text-center">
          <div class="text-h4 text-primary">{{ oneTimeReminders }}</div>
          <div class="text-subtitle2">One-time</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Filters -->
    <div class="page-toolbar page-toolbar--stacked">
      <q-input v-model="searchText" placeholder="Search tasks" borderless dense clearable class="page-tool-field">
        <template v-slot:prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
      <q-select
        v-model="selectedCategory"
        :options="categorySelectOptions"
        option-label="label"
        option-value="value"
        clearable
        borderless
        dense
        emit-value
        map-options
        :display-value="reminderCategoryFilterLabel"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="category" size="18px" />
        </template>
      </q-select>
      <q-select
        v-model="selectedStatus"
        :options="statusOptions"
        clearable
        borderless
        dense
        emit-value
        map-options
        :display-value="reminderStatusFilterLabel"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="tune" size="18px" />
        </template>
      </q-select>
      <q-btn
        v-if="canManageRecords"
        icon="add"
        color="primary"
        unelevated
        text-color="white"
        no-caps
        dense
        label="Add"
        class="page-tool-action"
        @click="openCreateDialog"
      />
    </div>

    <!-- Reminders List -->
    <div v-if="filteredReminders.length > 0" class="reminders-grid entity-tiles">
        <q-card
          v-for="reminder in filteredReminders"
          :key="reminder.id"
          class="reminder-card entity-tile"
          :class="{ 'reminder-inactive': !reminder.status }"
          flat
          bordered
        >
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-chip size="sm" class="q-mr-sm chip-tag">
                {{ reminder.category }}
              </q-chip>
              <q-chip
                :color="reminder.status ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ reminder.status ? 'Active' : 'Inactive' }}
              </q-chip>
              <q-chip>{{ getPropertyName(reminder.property_id) }}</q-chip>
            </div>

            <div class="text-h6 q-mb-sm">
              <div v-if="reminder.note" class="text-body  q-mb-md">
              <q-icon name="note" size="16px" class="q-mr-xs" />
              {{ reminder.note }}
            </div>
           </div>

            <div class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              Start: {{ formatDate(reminder.start_date) }}
              <q-badge
                v-if="reminder.renewals && reminder.renewals.length > 0"
                color="orange"
                :label="`${reminder.renewals.length}x renewed`"
                class="q-ml-sm cursor-pointer"
                @click.stop="viewRenewalHistory(reminder)"
              >
                <q-tooltip>Click to view renewal history</q-tooltip>
              </q-badge>
            </div>
            <div class="text-body2 text-grey-7 q-mb-xs">
              <q-icon name="event_available" size="16px" class="q-mr-xs" />
              {{ getReminderDueLabel(reminder) }}
            </div>

            <div class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="repeat" size="16px" class="q-mr-xs" />
              Repeat: {{ reminder.repeat_by || 'One-time' }}
            </div>

            <div v-if="reminder.amount" class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="attach_money" size="16px" class="q-mr-xs" />
              Amount: ${{ formatCurrency(reminder.amount) }}
            </div>


          </q-card-section>

          <q-card-actions class="reminder-actions">
            <!-- First Row: Complete and Renew -->
            <div class="action-row" v-if="canManageRecords">
              <q-btn
                flat
                dense
                color="positive"
                icon="check_circle"
                label="Complete"
                @click="completeReminder(reminder)"
                class="action-btn"
              >
                <q-tooltip>
                  {{
                    reminder.repeat_by &&
                    String(reminder.repeat_by).toLowerCase() !== 'one-time'
                      ? 'Complete & auto-defer'
                      : 'Complete & deactivate'
                  }}
                </q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="refresh"
                label="Renew"
                @click="renewReminder(reminder)"
                class="action-btn"
              >
                <q-tooltip>Renew reminder and set next due date</q-tooltip>
              </q-btn>
            </div>

            <!-- Second Row: Status and Edit -->
            <div class="action-row" v-if="canManageRecords">
              <q-btn
                flat
                dense
                :color="reminder.status ? 'negative' : 'positive'"
                :icon="reminder.status ? 'pause' : 'play_arrow'"
                :label="reminder.status ? 'Deactivate' : 'Activate'"
                @click="toggleReminderStatus(reminder)"
                class="action-btn"
              />
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                label="Edit"
                @click="editReminder(reminder)"
                class="action-btn"
              />
            </div>

            <!-- Third Row: Delete -->
            <div class="action-row" v-if="canManageRecords">
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                label="Delete"
                @click="deleteReminder(reminder)"
                class="action-btn full-width"
              />
            </div>
          </q-card-actions>
        </q-card>
    </div>

    <!-- Empty State -->
    <div v-if="filteredReminders.length === 0" class="text-center q-pa-xl">
      <q-icon name="notifications_off" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Reminders Found</div>
      <div class="text-caption text-grey-5">Create your first reminder to get started</div>
    </div>

    <!-- Create/Edit Reminder Dialog -->
    <q-dialog v-model="showCreateDialog" persistent maximized>
      <q-card class="create-fullscreen-card reminder-create-fullscreen elevated">
        <q-card-section class="create-fullscreen-body dialog-content">
          <CreateReminder
            :property-id="fixedPropertyId"
            :prefill="editingReminder"
            :allow-property-edit="!hasMatchedFixedProperty"
            @reminder-saved="onReminderSaved"
            @cancel="showCreateDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <DetailShell
      v-model="showReminderDetail"
      title="Reminder Details"
      :subtitle="
        selectedReminder
          ? `${getPropertyName(selectedReminder.property_id)} • ${selectedReminder.category || 'Reminder'}`
          : ''
      "
      @close="closeReminderDetail"
    >
      <div class="reminder-detail-body" v-if="selectedReminder">
        <div v-if="canManageRecords" class="reminder-detail-actions">
          <q-btn
            color="primary"
            unelevated
            icon="refresh"
            label="Renew"
            @click="renewReminder(selectedReminder)"
          />
        </div>
        <div class="reminder-detail-grid">
          <div class="detail-block">
            <div class="detail-label">Property</div>
            <div class="detail-value">{{ getPropertyName(selectedReminder.property_id) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Category</div>
            <div class="detail-value">{{ selectedReminder.category || 'N/A' }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <q-chip
                :color="selectedReminder.status ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ selectedReminder.status ? 'Active' : 'Inactive' }}
              </q-chip>
            </div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Start Date</div>
            <div class="detail-value">{{ formatDate(selectedReminder.start_date) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Due</div>
            <div class="detail-value">{{ getReminderDueLabel(selectedReminder) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Repeat</div>
            <div class="detail-value">{{ selectedReminder.repeat_by || 'One-time' }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Amount</div>
            <div class="detail-value">
              {{ selectedReminder.amount ? `$${formatCurrency(selectedReminder.amount)}` : 'N/A' }}
            </div>
          </div>
          <div class="detail-block full-width">
            <div class="detail-label">Note</div>
            <div class="detail-value">{{ selectedReminder.note || 'No notes added.' }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Created</div>
            <div class="detail-value">{{ formatDate(selectedReminder.created_date) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Renewals</div>
            <div class="detail-value">
              {{ selectedReminder.renewals ? selectedReminder.renewals.length : 0 }}
            </div>
          </div>
        </div>
      </div>
    </DetailShell>

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
              @click="closeRenewalHistoryDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedReminderForHistory">
          <!-- Reminder Info -->
          <div class="renewal-reminder-info q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              {{ getPropertyName(selectedReminderForHistory.property_id) }}
            </div>
            <div class="text-caption text-grey-6">
              Category: {{ selectedReminderForHistory.category }}
              <span v-if="selectedReminderForHistory.created_date" class="q-ml-sm">
                • Created: {{ formatDate(selectedReminderForHistory.created_date) }}
              </span>
            </div>
            <div class="text-caption text-grey-6">
              Current Due Date: {{ formatDate(selectedReminderForHistory.due_date) }}
            </div>
          </div>

          <!-- Renewal History Timeline -->
          <div
            v-if="
              selectedReminderForHistory.renewals && selectedReminderForHistory.renewals.length > 0
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
                :subtitle="formatDate(renewal.renewed_at)"
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
                      formatDate(renewal.previous_due_date || renewal.previous_start_date)
                    }}</span>
                  </div>
                  <div class="renewal-detail-item">
                    <span class="detail-label">New Due Date:</span>
                    <span class="detail-value">{{
                      formatDate(renewal.new_due_date || renewal.new_start_date)
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
                  formatDate(
                    selectedReminderForHistory.created_date ||
                      selectedReminderForHistory.start_date,
                  )
                "
                icon="add_circle"
                color="grey"
              >
                <div class="renewal-details">
                  <div class="renewal-detail-item">
                    <span class="detail-label">Original Due Date:</span>
                    <span class="detail-value">
                      {{
                        formatDate(
                          selectedReminderForHistory.due_date ||
                            selectedReminderForHistory.created_date ||
                            selectedReminderForHistory.start_date,
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import CreateReminder from '../components/CreateReminder.vue'
import DetailShell from '../components/details/DetailShell.vue'

const userDataStore = useUserDataStore()
const route = useRoute()
const { updateDocument, deleteDocument, getCollectionData } =
  useFirebase()

// Reactive data
const loading = ref(false)
const reminders = ref([])
const showCreateDialog = ref(false)
const editingReminder = ref(null)
const selectedReminder = ref(null)
const showReminderDetail = ref(false)

// Renewal history dialog
const showRenewalHistoryDialog = ref(false)
const selectedReminderForHistory = ref(null)

// Filters
const selectedProperty = ref(null)
const selectedCategory = ref(null)
const selectedStatus = ref(null)
const searchText = ref('')
const deepLinkHandled = ref(false)
const canManageRecords = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  return ['pm', 'po', 'admin'].includes(accountType)
})

const fixedPropertyId = computed(() =>
  String(route.params.propertyId || route.query.propertyId || route.query.property || '').trim(),
)
const matchedFixedProperty = computed(() =>
  (userDataStore.userAccessibleProperties || []).find(
    (property) => String(property.id || property.property_id || '').trim() === fixedPropertyId.value,
  ) || null,
)
const hasMatchedFixedProperty = computed(() => Boolean(matchedFixedProperty.value))

const openCreateDialog = () => {
  if (!canManageRecords.value) return
  editingReminder.value = null
  showCreateDialog.value = true
}

// Options
const categorySelectOptions = [
  { label: 'Fee', value: 'fee' },
  { label: 'HOA', value: 'hoa' },
  { label: 'Rent', value: 'rent' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Labor', value: 'labor' },
  { label: 'Tax', value: 'tax' },
  { label: 'Other', value: 'other' },
]
const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]
// Computed properties
const reminderCategoryFilterLabel = computed(() => {
  return categorySelectOptions.find((option) => option.value === selectedCategory.value)?.label || 'All categories'
})
const reminderStatusFilterLabel = computed(() => {
  if (selectedStatus.value === true) return 'Active'
  if (selectedStatus.value === false) return 'Inactive'
  return 'All statuses'
})
const activeReminders = computed(() => reminders.value.filter((r) => r.status).length)

const recurringReminders = computed(
  () => reminders.value.filter((r) => r.repeat_by && r.repeat_by !== 'one-time').length,
)

const oneTimeReminders = computed(
  () => reminders.value.filter((r) => !r.repeat_by || r.repeat_by === 'one-time').length,
)

const filteredReminders = computed(() => {
  let filtered = reminders.value

  if (selectedProperty.value) {
    filtered = filtered.filter((r) => r.property_id === selectedProperty.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((r) => r.category === selectedCategory.value)
  }

  if (selectedStatus.value !== null) {
    filtered = filtered.filter((r) => r.status === selectedStatus.value)
  }

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.note?.toLowerCase().includes(search) ||
        getPropertyName(r.property_id).toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search),
    )
  }

  return filtered
})

const MS_PER_DAY = 24 * 60 * 60 * 1000
const toMidnightDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const toIsoDate = (value) => {
  const date = toMidnightDate(value)
  return date ? date.toISOString().split('T')[0] : ''
}

const normalizeRepeatValue = (value) => String(value || 'one-time').trim().toLowerCase()

const calculateNextDueDate = (baseDateValue, repeatBy) => {
  const repeatValue = normalizeRepeatValue(repeatBy)
  const base = toMidnightDate(baseDateValue) || toMidnightDate(new Date())
  const next = new Date(base)
  if (repeatValue === 'daily') next.setDate(next.getDate() + 1)
  else if (repeatValue === 'weekly') next.setDate(next.getDate() + 7)
  else if (repeatValue === 'monthly') next.setMonth(next.getMonth() + 1)
  else if (repeatValue === 'yearly') next.setFullYear(next.getFullYear() + 1)
  else next.setDate(next.getDate() + 30)
  return toIsoDate(next)
}

const getReminderDueDate = (reminder) => toMidnightDate(reminder?.due_date || reminder?.start_date)

const getReminderDueLabel = (reminder) => {
  const dueDate = getReminderDueDate(reminder)
  if (!dueDate) return 'Due: N/A'
  const today = toMidnightDate(new Date())
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY)
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

const syncUpdatedReminder = (updatedReminder) => {
  const index = reminders.value.findIndex((r) => r.id === updatedReminder.id)
  if (index !== -1) {
    reminders.value[index] = updatedReminder
  }
  if (selectedReminder.value?.id === updatedReminder.id) {
    selectedReminder.value = { ...updatedReminder }
  }
  if (selectedReminderForHistory.value?.id === updatedReminder.id) {
    selectedReminderForHistory.value = { ...updatedReminder }
  }
}

// Methods
const loadReminders = async () => {
  loading.value = true
  try {
    console.log('=== LOAD REMINDERS DEBUG ===')
    console.log('userAccessibleProperties:', userDataStore.userAccessibleProperties)
    console.log('Properties count:', userDataStore.userAccessibleProperties.length)

    const allReminders = []

    // Load reminders from each property's subcollection
    for (const property of userDataStore.userAccessibleProperties) {
      console.log(
        `Loading reminders for property: ${property.id} (${property.nickname || property.address})`,
      )
      try {
        const remindersSnapshot = await getCollectionData(`properties/${property.id}/reminders`)
        if (remindersSnapshot) {
          console.log(`Found ${remindersSnapshot.length} reminders for property ${property.id}`)
          remindersSnapshot.forEach((reminder) => {
            allReminders.push({
              ...reminder,
              property_id: property.id,
              id: reminder.id,
            })
          })
        } else {
          console.log(`No reminders found for property ${property.id}`)
        }
      } catch (error) {
        console.warn(`Error loading reminders for property ${property.id}:`, error)
      }
    }

    console.log('Total reminders loaded:', allReminders.length)
    console.log('=== END LOAD REMINDERS DEBUG ===')
    reminders.value = allReminders
    tryOpenDeepLinkedReminder()
  } catch (error) {
    console.error('Error loading reminders:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load reminders',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const tryOpenDeepLinkedReminder = () => {
  if (deepLinkHandled.value) return
  const openType = String(route.query.openType || '').toLowerCase()
  const openId = String(route.query.openId || '')
  if (!openId || openType !== 'reminder') return
  if (!reminders.value.length) return

  const normalizedOpenId = openId.toLowerCase()
  const targetReminder = reminders.value.find((reminder) => {
    const idCandidates = [reminder.id, reminder.reminder_id]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
    return idCandidates.includes(normalizedOpenId)
  })
  if (!targetReminder) return

  openReminderDetail(targetReminder)
  deepLinkHandled.value = true
}

// Debug function to test property ID matching
const testPropertyMatching = () => {
  console.log('=== TEST PROPERTY MATCHING ===')
  console.log('Available properties:', userDataStore.userAccessibleProperties)
  console.log('Property options:', userDataStore.universalPropertyOptions)

  if (userDataStore.userAccessibleProperties.length > 0) {
    const testProperty = userDataStore.userAccessibleProperties[0]
    console.log('Testing with first property:', testProperty)
    console.log('Property ID:', testProperty.id, 'Type:', typeof testProperty.id)

    const foundProperty = userDataStore.getPropertyById(testProperty.id)
    console.log('Found property:', foundProperty)
    console.log('Match successful:', !!foundProperty)
  } else {
    console.log('No properties available for testing')
  }
  console.log('=== END TEST PROPERTY MATCHING ===')
}

// Make test function available globally for debugging
window.testPropertyMatching = testPropertyMatching

// Additional debug function to check store state
const debugStoreState = () => {
  console.log('=== DEBUG STORE STATE ===')
  console.log('User authenticated:', userDataStore.isAuthenticated)
  console.log('User ID:', userDataStore.userId)
  console.log('User object:', userDataStore.user)
  console.log('User roles:', userDataStore.userRoles)
  console.log('All properties:', userDataStore.properties)
  console.log('User accessible properties:', userDataStore.userAccessibleProperties)
  console.log('Universal property options:', userDataStore.universalPropertyOptions)
  console.log('=== END DEBUG STORE STATE ===')
}

window.debugStoreState = debugStoreState

const onReminderSaved = async () => {
  showCreateDialog.value = false
  editingReminder.value = null
  await loadReminders()
}

const editReminder = (reminder) => {
  if (!canManageRecords.value) return
  editingReminder.value = reminder
  showCreateDialog.value = true
}

const openReminderDetail = (reminder) => {
  selectedReminder.value = reminder
  showReminderDetail.value = true
}

const closeReminderDetail = () => {
  showReminderDetail.value = false
  selectedReminder.value = null
}

const completeReminder = async (reminder) => {
  try {
    const isRecurring =
      reminder.repeat_by && String(reminder.repeat_by).toLowerCase() !== 'one-time'

    if (isRecurring) {
      // For recurring reminders: Auto-defer
      console.log('Completing recurring reminder - auto-deferring...')

      const previousStartDate = reminder.start_date
      const previousDueDate = reminder.due_date || reminder.start_date
      const today = new Date()
      const newStartDate = today.toISOString().split('T')[0]
      const newDueDate = calculateNextDueDate(previousDueDate, reminder.repeat_by)

      // Create renewal record
      const renewalRecord = {
        renewed_at: new Date().toISOString(),
        previous_start_date: previousStartDate,
        new_start_date: newStartDate,
        previous_due_date: previousDueDate,
        new_due_date: newDueDate,
        reason: 'Auto-deferred on completion',
      }

      // Initialize renewals array if it doesn't exist
      const renewals = Array.isArray(reminder.renewals) ? [...reminder.renewals] : []
      renewals.push(renewalRecord)

      // Initialize completions array if it doesn't exist
      const completions = Array.isArray(reminder.completions) ? [...reminder.completions] : []
      completions.push({
        completed_at: new Date().toISOString(),
        completed_date: previousStartDate,
      })

      const updatedReminder = {
        ...reminder,
        start_date: newStartDate,
        due_date: newDueDate,
        renewals: renewals,
        completions: completions,
        status: true, // Keep active
      }

      await updateDocument(
        `properties/${reminder.property_id}/reminders`,
        reminder.id,
        updatedReminder,
      )

      syncUpdatedReminder(updatedReminder)

      Notify.create({
        type: 'positive',
        message: `Recurring reminder completed and renewed.`,
        position: 'top',
        caption: `Next due: ${formatDate(newDueDate)} • Total completions: ${completions.length}`,
        timeout: 3000,
      })
    } else {
      // For one-time reminders: Complete and deactivate
      console.log('Completing one-time reminder - deactivating...')

      const completions = reminder.completions || []
      completions.push({
        completed_at: new Date().toISOString(),
        completed_date: reminder.start_date,
      })

      const updatedReminder = {
        ...reminder,
        completions: completions,
        status: false, // Deactivate
        completed: true,
      }

      await updateDocument(
        `properties/${reminder.property_id}/reminders`,
        reminder.id,
        updatedReminder,
      )

      const index = reminders.value.findIndex((r) => r.id === reminder.id)
      if (index !== -1) {
        reminders.value[index] = updatedReminder
      }

      Notify.create({
        type: 'positive',
        message: `One-time reminder completed and deactivated!`,
        position: 'top',
        caption: 'This reminder is now inactive',
        timeout: 3000,
      })
    }

    console.log('Reminder completed:', {
      id: reminder.id,
      isRecurring: isRecurring,
      repeat_by: reminder.repeat_by,
    })
  } catch (error) {
    console.error('Error completing reminder:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to complete reminder',
      position: 'top',
    })
  }
}

const renewReminder = async (reminder) => {
  if (!canManageRecords.value) return
  try {
    // Store current schedule dates before renewal
    const previousStartDate = reminder.start_date
    const previousDueDate = reminder.due_date || reminder.start_date

    // Start new cycle today and set next due date
    const today = new Date()
    const newStartDate = today.toISOString().split('T')[0]
    const newDueDate = calculateNextDueDate(previousDueDate, reminder.repeat_by)

    // Create renewal record
    const renewalRecord = {
      renewed_at: new Date().toISOString(),
      previous_start_date: previousStartDate,
      new_start_date: newStartDate,
      previous_due_date: previousDueDate,
      new_due_date: newDueDate,
    }

    // Initialize renewals array if it doesn't exist
    const renewals = Array.isArray(reminder.renewals) ? [...reminder.renewals] : []
    renewals.push(renewalRecord)

    // Update the reminder with new cycle dates
    const updatedReminder = {
      ...reminder,
      start_date: newStartDate,
      due_date: newDueDate,
      renewals: renewals,
    }

    await updateDocument(
      `properties/${reminder.property_id}/reminders`,
      reminder.id,
      updatedReminder,
    )

    syncUpdatedReminder(updatedReminder)

    Notify.create({
      type: 'positive',
      message: `Reminder renewed successfully.`,
      position: 'top',
      caption: `Next due: ${formatDate(newDueDate)}`,
    })

    console.log('Reminder deferred:', {
      id: reminder.id,
      previousStartDate: previousStartDate,
      newStartDate: newStartDate,
      previousDueDate: previousDueDate,
      newDueDate: newDueDate,
      renewalCount: updatedReminder.renewals.length,
      createdDate: updatedReminder.created_date, // Original creation date
    })
  } catch (error) {
    console.error('Error deferring reminder:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to defer reminder',
      position: 'top',
    })
  }
}

const toggleReminderStatus = async (reminder) => {
  if (!canManageRecords.value) return
  try {
    const updatedReminder = { ...reminder, status: !reminder.status }
    await updateDocument(
      `properties/${reminder.property_id}/reminders`,
      reminder.id,
      updatedReminder,
    )

    const index = reminders.value.findIndex((r) => r.id === reminder.id)
    if (index !== -1) {
      reminders.value[index] = updatedReminder
    }

    Notify.create({
      type: 'positive',
      message: `Reminder ${updatedReminder.status ? 'activated' : 'deactivated'}`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error toggling reminder status:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update reminder status',
      position: 'top',
    })
  }
}

const deleteReminder = async (reminder) => {
  if (!canManageRecords.value) return
  try {
    await deleteDocument(`properties/${reminder.property_id}/reminders`, reminder.id)
    const index = reminders.value.findIndex((r) => r.id === reminder.id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
    }

    Notify.create({
      type: 'positive',
      message: 'Reminder deleted successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to delete reminder',
      position: 'top',
    })
  }
}

// Use universal getPropertyName from the store
const getPropertyName = (propertyId) => {
  return userDataStore.getPropertyName(propertyId)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

// Renewal history functions
const viewRenewalHistory = (reminder) => {
  selectedReminderForHistory.value = reminder
  showRenewalHistoryDialog.value = true
}

const closeRenewalHistoryDialog = () => {
  showRenewalHistoryDialog.value = false
  selectedReminderForHistory.value = null
}

// Enhanced debugging function for RemindersPage
const debugRemindersPage = () => {
  console.log('=== REMINDERS PAGE DEBUG ===')
  console.log('User authenticated:', userDataStore.isAuthenticated)
  console.log('User ID:', userDataStore.userId)
  console.log('User object:', userDataStore.user)
  console.log('User roles:', userDataStore.userRoles)
  console.log('All properties:', userDataStore.properties)
  console.log('User accessible properties:', userDataStore.userAccessibleProperties)
  console.log('Universal property options:', userDataStore.universalPropertyOptions)
  console.log('Editing reminder:', editingReminder.value)
  console.log('Current reminders:', reminders.value.length)
  console.log('Loading states:', {
    loading: loading.value,
    propertiesLoading: userDataStore.propertiesLoading,
    userRolesLoading: userDataStore.userRolesLoading,
  })

  // Test property selection
  if (userDataStore.userAccessibleProperties.length > 0) {
    const testProperty = userDataStore.userAccessibleProperties[0]
    console.log('Testing first property:', testProperty)
    const foundProperty = userDataStore.getPropertyById(testProperty.id)
    console.log('Property lookup result:', foundProperty)
  }

  console.log('=== END REMINDERS PAGE DEBUG ===')
}

// Make debug function available globally
window.debugRemindersPage = debugRemindersPage

// Lifecycle
onMounted(() => {
  console.log('=== REMINDERS PAGE MOUNTED ===')
  debugRemindersPage()

  if (route.query.create === 'true') {
    showCreateDialog.value = true
  }

  // Load reminders if user is authenticated and data is available
  if (userDataStore.isAuthenticated && userDataStore.userAccessibleProperties.length > 0) {
    console.log('RemindersPage - Loading reminders with available properties')
    loadReminders()
  } else {
    console.log('RemindersPage - Waiting for data to be loaded by MainLayout')

    // Watch for properties to be loaded
    const unwatch = watch(
      () => userDataStore.userAccessibleProperties.length,
      (newLength) => {
        console.log(`RemindersPage - Properties count changed to: ${newLength}`)
        if (newLength > 0) {
          console.log('RemindersPage - Properties loaded, running debug and loading reminders')
          debugRemindersPage()
          loadReminders()
          unwatch() // Stop watching once data is loaded
        }
      },
    )

    // Also watch for authentication changes
    watch(
      () => userDataStore.isAuthenticated,
      (isAuth) => {
        console.log(`RemindersPage - Authentication changed to: ${isAuth}`)
        if (isAuth) {
          debugRemindersPage()
        }
      },
    )
  }
})

watch(
  () => reminders.value.length,
  () => {
    tryOpenDeepLinkedReminder()
  },
  { immediate: true }
)

watch(
  () => route.query.create,
  (val) => {
    if (val === 'true') showCreateDialog.value = true
  },
)

watch(
  () => [route.query.openType, route.query.openId],
  () => {
    deepLinkHandled.value = false
    tryOpenDeepLinkedReminder()
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
.summary-card {
  min-width: 120px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
  transition: var(--transition);
}

.summary-card:hover {
  box-shadow: var(--shadow-md);
}

.reminder-card {
  transition: all 0.2s ease;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
}

.reminder-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.reminder-inactive {
  opacity: 0.6;
  background-color: #f5f5f5;
}

.reminder-detail-body {
  padding: 20px;
}

.reminder-detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.reminder-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-block {
  background: #f8fafc;
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-card);
  padding: 12px 14px;
}

.detail-block.full-width {
  grid-column: 1 / -1;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.reminder-create-fullscreen {
  width: 100%;
  height: 100%;
  max-height: none;
  max-width: none !important;
  min-width: 0 !important;
  border-radius: 0;
}

.dialog-header {
  padding: 16px 20px 8px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-content {
  padding: 16px 20px 20px 20px;
}

.create-reminder-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.create-reminder-head {
  border-bottom: 1px solid var(--neutral-200);
  padding-bottom: 6px;
}

.elevated {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.create-fullscreen-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.create-fullscreen-body {
  flex: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-toggle-card {
  background: #f8fbff;
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .dialog-header,
  .dialog-content {
    padding-left: 16px;
    padding-right: 16px;
  }
}

/* Reminder Actions Layout */
.reminder-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
}

.action-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.action-btn {
  flex: 1;
  min-width: 0;
}

.action-btn.full-width {
  width: 100%;
}

/* Mobile responsiveness for buttons */
@media (max-width: 600px) {
  .action-row {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

/* Renewal History Dialog Styles */
.renewal-reminder-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: var(--border-radius-sm);
  border-left: 4px solid #1976d2;
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
  border-bottom: 1px solid #e0e0e0;
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

@media (max-width: 900px) {
  .reminder-detail-grid {
    grid-template-columns: 1fr;
  }
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style>
