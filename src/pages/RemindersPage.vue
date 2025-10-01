<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Reminders</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="primary"
          label="Refresh"
          @click="refreshData"
          :loading="loading"
        />
        <q-btn
          icon="add"
          color="primary"
          label="Create Reminder"
          @click="showCreateDialog = true"
        />
        <q-btn icon="bug_report" color="warning" label="Test Firebase" @click="testFirebaseWrite" />
        <q-btn icon="info" color="info" label="Diagnose" @click="runDiagnostics" />
        <q-btn icon="bug_report" color="secondary" label="Debug Page" @click="debugRemindersPage" />
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
          <div class="text-h4 text-green">{{ activeReminders }}</div>
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
          <div class="text-h4 text-blue">{{ oneTimeReminders }}</div>
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
          :options="categoryOptions"
          label="Filter by Category"
          clearable
          outlined
          dense
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
    <div class="row q-gutter-md">
      <div
        v-for="reminder in filteredReminders"
        :key="reminder.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="reminder-card" :class="{ 'reminder-inactive': !reminder.status }">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-chip
                :color="getCategoryColor(reminder.category)"
                text-color="white"
                size="sm"
                class="q-mr-sm"
              >
                {{ reminder.category }}
              </q-chip>
              <q-chip
                :color="reminder.status ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ reminder.status ? 'Active' : 'Inactive' }}
              </q-chip>
            </div>

            <div class="text-h6 q-mb-sm">{{ getPropertyName(reminder.property_id) }}</div>

            <div class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              Start: {{ formatDate(reminder.start_date) }}
            </div>

            <div class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="repeat" size="16px" class="q-mr-xs" />
              Repeat: {{ reminder.repeat_by || 'One-time' }}
            </div>

            <div v-if="reminder.amount" class="text-body2 text-grey-6 q-mb-xs">
              <q-icon name="attach_money" size="16px" class="q-mr-xs" />
              Amount: ${{ formatCurrency(reminder.amount) }}
            </div>

            <div v-if="reminder.note" class="text-body2 text-grey-6 q-mb-sm">
              <q-icon name="note" size="16px" class="q-mr-xs" />
              {{ reminder.note }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :color="reminder.status ? 'negative' : 'positive'"
              :icon="reminder.status ? 'pause' : 'play_arrow'"
              :label="reminder.status ? 'Deactivate' : 'Activate'"
              @click="toggleReminderStatus(reminder)"
            />
            <q-btn flat color="primary" icon="edit" label="Edit" @click="editReminder(reminder)" />
            <q-btn flat color="negative" icon="delete" @click="deleteReminder(reminder)" />
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
                  :options="categoryOptions"
                  label="Category *"
                  outlined
                  dense
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
                  :options="repeatOptions"
                  label="Repeat By"
                  outlined
                  dense
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

            <!-- Debug Information -->
            <div v-if="showDebugInfo" class="debug-section">
              <q-separator class="q-my-md" />
              <div class="text-caption text-grey-6 q-mb-sm">Debug Information:</div>
              <div class="debug-content">
                <div class="debug-item">
                  <strong>Property ID:</strong> {{ reminderForm.property_id || 'Not selected' }}
                </div>
                <div class="debug-item">
                  <strong>Collection Path:</strong>
                  {{
                    reminderForm.property_id
                      ? `properties/${reminderForm.property_id}/reminders`
                      : 'N/A'
                  }}
                </div>
                <div class="debug-item">
                  <strong>Data to Write:</strong>
                  <pre class="debug-json">{{
                    JSON.stringify(getReminderDataForFirebase(), null, 2)
                  }}</pre>
                </div>
                <div class="debug-item">
                  <strong>User ID:</strong> {{ userDataStore.userId || 'Not authenticated' }}
                </div>
                <div class="debug-item">
                  <strong>Available Properties:</strong>
                  <div class="debug-properties">
                    <div
                      v-for="prop in userDataStore.userAccessibleProperties"
                      :key="prop.id"
                      class="debug-prop"
                    >
                      {{ prop.id }}: {{ prop.nickname || prop.address || 'Unnamed' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn
                flat
                :label="showDebugInfo ? 'Hide Debug' : 'Show Debug'"
                color="grey"
                @click="showDebugInfo = !showDebugInfo"
              />
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
const showDebugInfo = ref(false)

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
const categoryOptions = ['fee', 'rent', 'maintenance', 'tax', 'other']
const repeatOptions = ['daily', 'weekly', 'monthly', 'yearly', 'one-time']
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

const refreshData = async () => {
  await loadReminders()
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
    const propertyId = reminderForm.value.property_id
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

    if (!reminderForm.value.category) {
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

    const reminderData = {
      category: reminderForm.value.category,
      start_date: reminderForm.value.start_date,
      repeat_by: reminderForm.value.repeat_by,
      amount: reminderForm.value.amount,
      note: reminderForm.value.note,
      status: reminderForm.value.status,
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
        throw createError
      }
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving reminder:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save reminder',
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

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'fee':
      return 'primary'
    case 'rent':
      return 'positive'
    case 'maintenance':
      return 'warning'
    case 'tax':
      return 'negative'
    case 'other':
      return 'info'
    default:
      return 'grey'
  }
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

// Get reminder data formatted for Firebase
const getReminderDataForFirebase = () => {
  return {
    category: reminderForm.value.category,
    start_date: reminderForm.value.start_date,
    repeat_by: reminderForm.value.repeat_by,
    amount: reminderForm.value.amount,
    note: reminderForm.value.note,
    status: reminderForm.value.status,
    created_date: new Date().toISOString(),
    created_by: userDataStore.userId,
  }
}

// Test Firebase write capability
const testFirebaseWrite = async () => {
  try {
    console.log('=== TESTING FIREBASE WRITE ===')
    console.log('User authenticated:', userDataStore.isAuthenticated)
    console.log('User ID:', userDataStore.userId)
    console.log('Available properties:', userDataStore.userAccessibleProperties.length)

    if (!userDataStore.isAuthenticated) {
      Notify.create({
        type: 'negative',
        message: 'User not authenticated',
        position: 'top',
      })
      return
    }

    // Test 1: Write to simple collection
    console.log('Test 1: Writing to "test" collection...')
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      user_id: userDataStore.userId,
    }

    const testId = await createDocument('test', testData)
    console.log('✓ Test document created with ID:', testId)

    // Test 2: Write to property subcollection if available
    if (userDataStore.userAccessibleProperties.length > 0) {
      const testProperty = userDataStore.userAccessibleProperties[0]
      console.log(`Test 2: Writing to property ${testProperty.id} reminders subcollection...`)

      const reminderTestData = {
        category: 'test',
        start_date: new Date().toISOString().split('T')[0],
        note: 'Test reminder',
        status: true,
        created_date: new Date().toISOString(),
        created_by: userDataStore.userId,
      }

      const reminderTestId = await createDocument(
        `properties/${testProperty.id}/reminders`,
        reminderTestData,
      )
      console.log('✓ Test reminder created with ID:', reminderTestId)

      // Clean up test reminder
      await deleteDocument(`properties/${testProperty.id}/reminders`, reminderTestId)
      console.log('✓ Test reminder deleted')
    } else {
      console.log('⚠ No accessible properties for subcollection test')
    }

    // Clean up test document
    await deleteDocument('test', testId)
    console.log('✓ Test document deleted')

    Notify.create({
      type: 'positive',
      message: 'Firebase write test successful!',
      position: 'top',
    })
  } catch (error) {
    console.error('Firebase write test failed:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })

    let errorMessage = `Firebase test failed: ${error.message}`
    if (error.message.includes('asset not accessible')) {
      errorMessage = 'Firebase test failed: Access denied - check Firestore security rules'
    } else if (error.message.includes('permission-denied')) {
      errorMessage =
        'Firebase test failed: Permission denied - check user roles and Firestore rules'
    }

    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      caption: error.code || 'Unknown error',
    })
  }
}

// Run comprehensive diagnostics
const runDiagnostics = async () => {
  console.log('=== RUNNING COMPREHENSIVE DIAGNOSTICS ===')

  // 1. Check authentication
  console.log('1. AUTHENTICATION CHECK:')
  console.log('- User authenticated:', userDataStore.isAuthenticated)
  console.log('- User ID:', userDataStore.userId)
  console.log('- Firebase user object:', userDataStore.user)
  console.log('- User email:', userDataStore.user?.email)
  console.log('- User display name:', userDataStore.user?.displayName)

  // 2. Check Firebase configuration
  console.log('2. FIREBASE CONFIGURATION CHECK:')
  console.log('- API Key present:', !!import.meta.env.VITE_FIREBASE_API_KEY)
  console.log('- Project ID present:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID)
  console.log('- Auth Domain present:', !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  console.log('- Storage Bucket present:', !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
  console.log('- App ID present:', !!import.meta.env.VITE_FIREBASE_APP_ID)

  // 3. Check user data
  console.log('3. USER DATA CHECK:')
  console.log('- User roles count:', userDataStore.userRoles.length)
  console.log('- User roles:', userDataStore.userRoles)
  console.log('- Properties count:', userDataStore.properties.length)
  console.log(
    '- Properties:',
    userDataStore.properties.map((p) => ({ id: p.id, nickname: p.nickname, address: p.address })),
  )
  console.log('- Accessible properties count:', userDataStore.userAccessibleProperties.length)
  console.log(
    '- Accessible properties:',
    userDataStore.userAccessibleProperties.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      address: p.address,
    })),
  )

  // 4. Test basic Firebase operations
  console.log('4. FIREBASE OPERATIONS TEST:')
  try {
    // Test reading a simple document
    console.log('Testing basic Firestore read...')
    const testDoc = await getDocument('users/test')
    console.log('- Basic read test result:', testDoc)
  } catch (error) {
    console.error('- Basic read test failed:', error.message)
  }

  // 5. Test property access
  if (userDataStore.userAccessibleProperties.length > 0) {
    const testProperty = userDataStore.userAccessibleProperties[0]
    console.log('5. PROPERTY ACCESS TEST:')
    console.log('- Testing property:', testProperty.id)

    try {
      // Test reading the property document
      const propertyDoc = await getDocument(`properties/${testProperty.id}`)
      console.log('- Property document read result:', propertyDoc)

      // Test reading reminders subcollection
      const reminders = await getCollectionData(`properties/${testProperty.id}/reminders`)
      console.log('- Reminders subcollection read result:', reminders)
    } catch (error) {
      console.error('- Property access test failed:', error.message)
      console.error('- Error code:', error.code)
      console.error('- Error details:', error)
    }
  } else {
    console.log('5. PROPERTY ACCESS TEST: No accessible properties found')
  }

  // 6. Check for common issues
  console.log('6. COMMON ISSUES CHECK:')
  if (!userDataStore.isAuthenticated) {
    console.log('❌ ISSUE: User not authenticated')
  }
  if (!userDataStore.userId) {
    console.log('❌ ISSUE: No user ID available')
  }
  if (userDataStore.userAccessibleProperties.length === 0) {
    console.log('⚠️ INFO: No properties available - user may not have roles')
  }
  if (
    !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY.includes('demo-')
  ) {
    console.log('❌ ISSUE: Firebase configuration missing or using demo values')
  }

  Notify.create({
    type: 'info',
    message: 'Diagnostics completed - check console for details',
    position: 'top',
  })
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
}

.reminder-card {
  transition: all 0.2s ease;
}

.reminder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

/* Debug section styles */
.debug-section {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.debug-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.debug-item strong {
  color: #1976d2;
  font-size: 0.9rem;
}

.debug-json {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.debug-properties {
  max-height: 120px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}

.debug-prop {
  padding: 4px 8px;
  font-size: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
}

.debug-prop:last-child {
  border-bottom: none;
}
</style>
