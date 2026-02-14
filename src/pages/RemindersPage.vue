<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Reminders</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="add"
          color="primary"
          flat
          label="Create Reminder"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

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
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedProperty"
          :options="propertyOptions"
          label="Filter by Property"
          clearable
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedCategory"
          :options="categorySelectOptions"
          option-label="label"
          option-value="value"
          label="Filter by Category"
          clearable
          outlined
          dense
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedStatus"
          :options="statusOptions"
          label="Filter by Status"
          clearable
          outlined
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input v-model="searchText" label="Search" outlined dense clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Reminders List -->
    <div class="row" style="padding: 2px">
      <div
        v-for="reminder in filteredReminders"
        :key="reminder.id"
        class="col-12 col-md-6 col-lg-4"
        style="padding: 2px"
      >
        <q-card
          class="reminder-card"
          :class="{ 'reminder-inactive': !reminder.status }"
          style="padding: 2px"
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
            <div class="action-row">
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
                label="Defer"
                @click="renewReminder(reminder)"
                class="action-btn"
              >
                <q-tooltip>Defer reminder (restart clock)</q-tooltip>
              </q-btn>
            </div>

            <!-- Second Row: Status and Edit -->
            <div class="action-row">
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
            <div class="action-row">
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
    </div>

    <!-- Empty State -->
    <div v-if="filteredReminders.length === 0" class="text-center q-pa-xl">
      <q-icon name="notifications_off" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Reminders Found</div>
      <div class="text-caption text-grey-5">Create your first reminder to get started</div>
    </div>

    <!-- Create/Edit Reminder Dialog -->
    <q-dialog v-model="showCreateDialog" position="standard">
      <q-card class="reminder-dialog compact-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingReminder ? 'Edit Reminder' : 'Create New Reminder' }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="dialog-content">
          <q-form @submit="saveReminder" class="compact-form">
            <!-- Property and Category Row -->
            <div class="form-row">
              <div class="form-field">
                <UniversalPropertySelect
                  v-model="reminderForm.property_id"
                  label="Property *"
                  :rules="[(val) => !!val || 'Property is required']"
                  @property-change="onPropertyChange"
                />
              </div>
              <div class="form-field">
                <q-select
                  v-model="reminderForm.category"
                  :options="categorySelectOptions"
                  option-label="label"
                  option-value="value"
                  label="Category *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Category is required']"
                />
              </div>
            </div>

            <!-- Date and Repeat Row -->
            <div class="form-row">
              <div class="form-field">
                <q-input
                  v-model="reminderForm.start_date"
                  label="Start Date *"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Start date is required']"
                />
              </div>
              <div class="form-field">
                <q-select
                  v-model="reminderForm.repeat_by"
                  :options="repeatSelectOptions"
                  option-label="label"
                  option-value="value"
                  label="Repeat By"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
            </div>

            <!-- Amount and Status Row -->
            <div class="form-row">
              <div class="form-field">
                <q-input
                  v-model.number="reminderForm.amount"
                  label="Amount"
                  type="number"
                  step="0.01"
                  outlined
                  dense
                />
              </div>
              <div class="form-field status-field">
                <q-checkbox v-model="reminderForm.status" label="Active" />
              </div>
            </div>

            <!-- Note Field -->
            <div class="form-row">
              <div class="form-field full-width">
                <q-input
                  v-model="reminderForm.note"
                  label="Note"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn
                type="submit"
                :label="editingReminder ? 'Update' : 'Create'"
                color="primary"
                text-color="white"
                class="btn-primary"
                :loading="saving"
              />
            </div>
          </q-form>
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
              Current Start Date: {{ formatDate(selectedReminderForHistory.start_date) }}
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
                    <span class="detail-label">Previous Start Date:</span>
                    <span class="detail-value">{{ formatDate(renewal.previous_start_date) }}</span>
                  </div>
                  <div class="renewal-detail-item">
                    <span class="detail-label">New Start Date:</span>
                    <span class="detail-value">{{ formatDate(renewal.new_start_date) }}</span>
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
                    <span class="detail-label">Original Start Date:</span>
                    <span class="detail-value">
                      {{
                        formatDate(
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
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import UniversalPropertySelect from '../components/UniversalPropertySelect.vue'

const userDataStore = useUserDataStore()
const { createDocument, updateDocument, deleteDocument, getCollectionData, getDocument } =
  useFirebase()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const reminders = ref([])
const showCreateDialog = ref(false)
const editingReminder = ref(null)

// Renewal history dialog
const showRenewalHistoryDialog = ref(false)
const selectedReminderForHistory = ref(null)

// Filters
const selectedProperty = ref(null)
const selectedCategory = ref(null)
const selectedStatus = ref(null)
const searchText = ref('')

// Form data
const reminderForm = ref({
  property_id: null,
  category: '',
  start_date: new Date().toISOString().split('T')[0],
  repeat_by: '',
  amount: null,
  note: '',
  status: true,
})

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
const repeatSelectOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'One-time', value: 'one-time' },
]
const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]

// Use universal property options from the store
const propertyOptions = computed(() => {
  console.log('=== REMINDERS PAGE - Using Universal Property Options ===')
  console.log('Universal property options:', userDataStore.universalPropertyOptions)
  return userDataStore.universalPropertyOptions
})

// Computed properties
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

const saveReminder = async () => {
  console.log('=== SAVE REMINDER CALLED ===')
  console.log('Form data:', reminderForm.value)
  console.log('User authenticated:', userDataStore.isAuthenticated)
  console.log('User ID:', userDataStore.userId)
  console.log('Firebase auth user:', userDataStore.user)
  console.log('Available properties count:', userDataStore.userAccessibleProperties.length)

  // Run full debug before proceeding
  debugRemindersPage()

  // Check authentication first
  if (!userDataStore.isAuthenticated) {
    console.log('ERROR: User not authenticated')
    Notify.create({
      type: 'negative',
      message: 'Please sign in to create reminders',
      position: 'top',
    })
    return
  }

  if (!userDataStore.userId) {
    console.log('ERROR: No user ID available')
    Notify.create({
      type: 'negative',
      message: 'User ID not available. Please sign in again.',
      position: 'top',
    })
    return
  }

  saving.value = true
  try {
    const propertyId =
      reminderForm.value.property_id?.value ||
      reminderForm.value.property_id?.id ||
      reminderForm.value.property_id
    console.log('Property ID:', propertyId)
    console.log('Property ID type:', typeof propertyId)

    if (!propertyId) {
      console.log('ERROR: No property selected')
      Notify.create({
        type: 'negative',
        message: 'Please select a property',
        position: 'top',
      })
      return
    }

    // Get the selected property (no accessibility check)
    console.log('=== PROPERTY SELECTION ===')
    console.log('Selected property ID:', propertyId, 'Type:', typeof propertyId)
    console.log(
      'Available properties in store:',
      userDataStore.userAccessibleProperties.map((p) => ({
        id: p.id,
        type: typeof p.id,
        nickname: p.nickname,
      })),
    )

    const selectedProperty = userDataStore.getPropertyById(propertyId)
    console.log('Selected property:', selectedProperty)

    if (!selectedProperty) {
      console.log('ERROR: Selected property not found in store')
      Notify.create({
        type: 'negative',
        message: 'Selected property not found. Please refresh and try again.',
        position: 'top',
      })
      return
    }

    const normalizedCategory = String(
      reminderForm.value.category?.value || reminderForm.value.category || '',
    )
      .trim()
      .toLowerCase()
    if (!normalizedCategory) {
      console.log('ERROR: No category selected')
      Notify.create({
        type: 'negative',
        message: 'Please select a category',
        position: 'top',
      })
      return
    }

    if (!reminderForm.value.start_date) {
      console.log('ERROR: No start date selected')
      Notify.create({
        type: 'negative',
        message: 'Please select a start date',
        position: 'top',
      })
      return
    }

    const normalizedRepeat = String(
      reminderForm.value.repeat_by?.value || reminderForm.value.repeat_by || '',
    )
      .trim()
      .toLowerCase()

    const amountValue = reminderForm.value.amount
    const normalizedAmount =
      amountValue === null || amountValue === '' || Number.isNaN(Number(amountValue))
        ? null
        : Number(amountValue)

    const reminderData = {
      category: normalizedCategory,
      start_date: reminderForm.value.start_date,
      repeat_by: normalizedRepeat || 'one-time',
      amount: normalizedAmount,
      note: (reminderForm.value.note || '').trim(),
      status: !!reminderForm.value.status,
      created_date: new Date().toISOString(),
      created_by: userDataStore.userId,
    }

    if (editingReminder.value) {
      // Update existing reminder in property's subcollection
      await updateDocument(
        `properties/${propertyId}/reminders`,
        editingReminder.value.id,
        reminderData,
      )
      const index = reminders.value.findIndex((r) => r.id === editingReminder.value.id)
      if (index !== -1) {
        reminders.value[index] = {
          ...reminderData,
          id: editingReminder.value.id,
          property_id: propertyId,
        }
      }
      Notify.create({
        type: 'positive',
        message: 'Reminder updated successfully',
        position: 'top',
      })
    } else {
      // Create new reminder in property's subcollection
      console.log('Creating new reminder...')
      console.log('Reminder data:', reminderData)
      console.log('Collection path:', `properties/${propertyId}/reminders`)

      try {
        console.log(
          'Attempting to create reminder in collection:',
          `properties/${propertyId}/reminders`,
        )
        console.log('Reminder data being sent:', reminderData)

        const newReminder = await createDocument(`properties/${propertyId}/reminders`, reminderData)
        console.log('SUCCESS: Reminder created with ID:', newReminder)

        // Verify the reminder was actually saved by reading it back
        try {
          const savedReminder = await getDocument(
            `properties/${propertyId}/reminders/${newReminder}`,
          )
          if (savedReminder) {
            console.log('VERIFIED: Reminder successfully saved to Firebase:', savedReminder)
          } else {
            console.log('WARNING: Could not verify reminder was saved')
          }
        } catch (verifyError) {
          console.error('WARNING: Could not verify reminder was saved:', verifyError)
        }

        reminders.value.unshift({ ...reminderData, id: newReminder, property_id: propertyId })
        Notify.create({
          type: 'positive',
          message: 'Reminder created successfully',
          position: 'top',
        })
      } catch (createError) {
        console.error('ERROR creating reminder:', createError)
        console.error('Error details:', {
          message: createError.message,
          code: createError.code,
          stack: createError.stack,
        })

        // Show specific error message to user
        let errorMessage = 'Failed to create reminder'
        if (createError.message.includes('asset not accessible')) {
          errorMessage = 'Access denied: Please check your authentication and permissions'
        } else if (createError.message.includes('permission-denied')) {
          errorMessage = 'Permission denied: You may not have access to this property'
        } else if (createError.message.includes('unauthenticated')) {
          errorMessage = 'Authentication required: Please sign in again'
        } else if (createError.message.includes('not-found')) {
          errorMessage = 'Property not found: The selected property may have been deleted'
        }

        Notify.create({
          type: 'negative',
          message: errorMessage,
          position: 'top',
          caption: createError.message,
        })
        return
      }
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving reminder:', error)
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to save reminder',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

const editReminder = (reminder) => {
  console.log('=== EDITING REMINDER ===')
  console.log('Reminder being edited:', reminder)
  console.log('Reminder property_id:', reminder.property_id, 'Type:', typeof reminder.property_id)

  editingReminder.value = reminder
  reminderForm.value = { ...reminder }

  console.log('Form after setting:', reminderForm.value)
  console.log(
    'Form property_id:',
    reminderForm.value.property_id,
    'Type:',
    typeof reminderForm.value.property_id,
  )

  showCreateDialog.value = true
}

const completeReminder = async (reminder) => {
  try {
    const isRecurring =
      reminder.repeat_by && String(reminder.repeat_by).toLowerCase() !== 'one-time'

    if (isRecurring) {
      // For recurring reminders: Auto-defer
      console.log('Completing recurring reminder - auto-deferring...')

      const previousStartDate = reminder.start_date
      const today = new Date()
      const newStartDate = today.toISOString().split('T')[0]

      // Create renewal record
      const renewalRecord = {
        renewed_at: new Date().toISOString(),
        previous_start_date: previousStartDate,
        new_start_date: newStartDate,
        reason: 'Auto-deferred on completion',
      }

      // Initialize renewals array if it doesn't exist
      const renewals = reminder.renewals || []
      renewals.push(renewalRecord)

      // Initialize completions array if it doesn't exist
      const completions = reminder.completions || []
      completions.push({
        completed_at: new Date().toISOString(),
        completed_date: previousStartDate,
      })

      const updatedReminder = {
        ...reminder,
        start_date: newStartDate,
        renewals: renewals,
        completions: completions,
        status: true, // Keep active
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
        message: `Recurring reminder completed and deferred!`,
        position: 'top',
        caption: `New cycle starts today. Total completions: ${completions.length}`,
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
  try {
    // Store the current start date as previous date
    const previousStartDate = reminder.start_date

    // Set new start date to TODAY (clock restarts)
    const today = new Date()
    const newStartDate = today.toISOString().split('T')[0]

    // Create renewal record
    const renewalRecord = {
      renewed_at: new Date().toISOString(),
      previous_start_date: previousStartDate,
      new_start_date: newStartDate,
    }

    // Initialize renewals array if it doesn't exist
    const renewals = reminder.renewals || []
    renewals.push(renewalRecord)

    // Update the reminder with new start date and renewals
    // NOTE: created_date remains unchanged - it's the original creation date
    // start_date is updated to today - this is when the clock starts for this renewal cycle
    const updatedReminder = {
      ...reminder,
      start_date: newStartDate, // Clock starts today
      renewals: renewals,
      // created_date stays the same (original creation date)
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
      message: `Reminder deferred! Clock restarted from today.`,
      position: 'top',
      caption: `New start date: ${formatDate(newStartDate)}`,
    })

    console.log('Reminder deferred:', {
      id: reminder.id,
      previousStartDate: previousStartDate,
      newStartDate: newStartDate,
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

const resetForm = () => {
  reminderForm.value = {
    property_id: null,
    category: '',
    start_date: new Date().toISOString().split('T')[0],
    repeat_by: '',
    amount: null,
    note: '',
    status: true,
  }
  editingReminder.value = null
}

// Use universal getPropertyName from the store
const getPropertyName = (propertyId) => {
  return userDataStore.getPropertyName(propertyId)
}

// Handle property change from universal select
const onPropertyChange = ({ propertyId, property }) => {
  console.log('Property changed:', { propertyId, property })
  // Additional logic can be added here if needed
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
  console.log('Reminder form data:', reminderForm.value)
  console.log('Current reminders:', reminders.value.length)
  console.log('Loading states:', {
    loading: loading.value,
    saving: saving.value,
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

.btn-primary {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  color: white;
  border: none;
}

.reminder-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.compact-dialog {
  min-width: 450px;
  max-width: 550px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 8px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-content {
  padding: 16px 20px 20px 20px;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.form-field {
  flex: 1;
  min-width: 0;
}

.form-field.full-width {
  flex: 1 1 100%;
}

.status-field {
  display: flex;
  align-items: center;
  padding-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .compact-dialog {
    min-width: 320px;
    max-width: 95vw;
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .form-field {
    width: 100%;
  }

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
  border-radius: 8px;
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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style>
