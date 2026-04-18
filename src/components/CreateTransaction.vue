<template>
  <div class="create-transaction animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div class="col">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">
              <q-icon name="receipt_long" class="q-mr-sm" />
              Create New Transaction Record
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Record a payment or cost with participants, amount, date, and optional proof.
            </div>
          </div>
          <div class="col-auto row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn"
              @click="handleCancel"
            />
            <q-btn
              type="submit"
              form="create-transaction-form"
              class="top-action-btn"
              color="primary"
              text-color="white"
              :loading="loading"
              label="Save"
              unelevated
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form id="create-transaction-form" @submit="onSubmit" class="q-gutter-sm">
          <div class="section-label q-mb-xs">Transaction Context</div>
          <div class="row q-gutter-sm">
            <div v-if="propertyId && !showPropertySelect" class="col-12 col-md-6">
              <q-input
                :model-value="propertyName"
                label="Property"
                outlined
                dense
                readonly
                bg-color="grey-1"
              />
            </div>
            <q-select
              v-else
              v-model="selectedPropertyId"
              :options="availableProperties"
              option-label="nickname"
              option-value="id"
              label="Select Property"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Property selection is required']"
              class="col-12 col-md-6"
              :loading="propertiesLoading"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="home" color="primary" />
              </template>
            </q-select>

            <q-select
              v-model="transactionData.transac_type"
              :options="transactionTypeOptions"
              label="Transaction Type"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Transaction type is required']"
              bg-color="grey-1"
              class="col-12 col-md-6"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>

          <div
            v-if="showPropertySelect && !propertiesLoading && availableProperties.length === 0"
            class="text-caption text-primary q-mb-sm"
          >
            No properties found. Check console for details.
          </div>
          <div class="row q-gutter-sm">
            <q-input
              v-model="transactionData.role"
              label="User Role"
              outlined
              dense
              readonly
              class="col-12"
              bg-color="grey-1"
              style="display: none"
            />
          </div>

          <div class="section-label q-mb-xs q-mt-sm">Transaction Details</div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="transactionData.transac_from"
              :options="fromRoleOptions"
              label="Transaction From *"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Please select who the transaction is from']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="north_east" color="primary" />
              </template>
            </q-select>

            <q-select
              v-model="transactionData.transac_to"
              :options="toRoleOptions"
              label="Transaction To *"
              outlined
              dense
              required
              :rules="[
                (val) => !!val || 'Please select who the transaction is to',
                (val) => val !== transactionData.transac_from || 'From and To cannot be the same',
              ]"
              :disable="!transactionData.transac_from"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="south_west" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model.number="transactionData.amount"
              label="Amount"
              outlined
              dense
              required
              type="number"
              step="0.01"
              :rules="[
                (val) => !!val || 'Amount is required',
                (val) => val > 0 || 'Amount must be positive',
              ]"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="payments" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="transactionData.transac_date"
              label="Transaction Date"
              outlined
              dense
              required
              type="date"
              :rules="[(val) => !!val || 'Transaction date is required']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <q-input
            v-model="transactionData.note"
            label="Note"
            outlined
            dense
            type="textarea"
            rows="3"
            bg-color="grey-1"
          />

          <!-- Picture Upload Section -->
          <div class="picture-upload-section">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="photo_camera" class="q-mr-xs" />
              Attach Picture (Optional)
            </div>

            <q-file
              v-model="selectedFile"
              accept="image/*"
              outlined
              dense
              label="Choose picture"
              bg-color="grey-1"
              class="q-mb-sm"
              @update:model-value="onFileSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview q-mb-sm">
              <div class="text-caption q-mb-xs">Preview:</div>
              <q-img
                :src="imagePreview"
                style="max-width: 300px; max-height: 200px"
                class="rounded-borders"
                fit="contain"
              />
              <q-btn
                flat
                dense
                round
                icon="close"
                color="negative"
                class="absolute-top-right q-ma-xs"
                @click="removeImage"
              />
            </div>
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import {
  normalizePropertyId,
  comparePropertyIds,
  extractPropertyId,
} from '../utils/propertyIdUtils'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
  allowPropertyEdit: {
    type: Boolean,
    default: true,
  },
  prefill: {
    type: Object,
    default: null,
  },
})

const route = useRoute()
const propertyId = computed(() => props.propertyId || route.params.propertyId)
const propertyName = computed(() => props.propertyName || route.query.propertyName || 'Unknown Property')

const emit = defineEmits(['transaction-created', 'cancel'])
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, loading, uploadImages } = useFirebase()

const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const selectedPropertyId = ref('')
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const showPropertySelect = computed(() => props.allowPropertyEdit || !propertyId.value)

// Role options for from/to fields
const roleOptions = [
  'Property Owner',
  'Property Manager',
  'Tenant',
  'Service Provider',
  'Government',
  'HOA',
]

// Transaction data - declare early so it can be used in computed properties
const transactionData = reactive({
  role: '',
  transac_from: '',
  transac_to: '',
  amount: null,
  transac_date: new Date().toISOString().split('T')[0],
  transac_type: '',
  note: '',
  picture_url: '', // Will store the uploaded image URL
})

// Computed options for "From" field (all available options)
const fromRoleOptions = computed(() => roleOptions)

// Computed options for "To" field (exclude selected "from" option)
const toRoleOptions = computed(() => {
  if (!transactionData.transac_from) return []
  return roleOptions.filter((option) => option !== transactionData.transac_from)
})

// Watcher to clear "to" field when "from" changes
watch(
  () => transactionData.transac_from,
  (newFromValue, oldFromValue) => {
    if (newFromValue !== oldFromValue) {
      // Clear the "to" field when "from" changes
      transactionData.transac_to = ''
    }
  },
)

watch(
  () => props.prefill,
  (value) => {
    if (!value) return
    if (typeof value.transac_type === 'string') transactionData.transac_type = value.transac_type
    if (typeof value.transac_from === 'string') transactionData.transac_from = value.transac_from
    if (typeof value.transac_to === 'string') transactionData.transac_to = value.transac_to
    if (value.amount !== undefined && value.amount !== null) transactionData.amount = value.amount
    if (typeof value.transac_date === 'string') transactionData.transac_date = value.transac_date
    if (typeof value.note === 'string') transactionData.note = value.note
    if (value.property_id) selectedPropertyId.value = String(value.property_id)
  },
  { immediate: true },
)

// Property ID utilities are now imported from ../utils/propertyIdUtils.js

// Debug function to test property ID matching - call from browser console: window.testPropertyMatching()
const testPropertyMatching = () => {
  console.log('=== PROPERTY ID MATCHING TEST ===')
  const currentPropertyId = propertyId.value || selectedPropertyId.value

  console.log('Current Property Info:')
  console.log('  From route:', propertyId.value)
  console.log('  From selection:', selectedPropertyId.value)
  console.log('  Final property ID:', currentPropertyId)
  console.log('  Property ID type:', typeof currentPropertyId)

  console.log('Available Properties:')
  userDataStore.userAccessibleProperties.forEach((prop, index) => {
    console.log(`  Property ${index + 1}:`)
    console.log('    ID:', prop.id)
    console.log('    Type:', typeof prop.id)
    console.log('    Nickname:', prop.nickname)
    console.log('    Address:', prop.address)
  })

  console.log('User Roles:')
  userDataStore.userRoles.forEach((role, index) => {
    console.log(`  Role ${index + 1}:`)
    console.log('    Role ID:', role.id)
    console.log('    Property ID:', role.property_id)
    console.log('    Property ID Type:', typeof role.property_id)
    console.log('    Role:', role.role)
  })

  if (currentPropertyId) {
    console.log('Testing role lookup for current property...')
    const result = getUserRoleForProperty(currentPropertyId)
    console.log('Result:', result)
  }

  console.log('=== END PROPERTY ID MATCHING TEST ===')
}

// Make function available globally
window.testPropertyMatching = testPropertyMatching

// File upload functions
const onFileSelected = (file) => {
  console.log('File selected:', file)
  if (file) {
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = null
  transactionData.picture_url = ''
}

// Function to upload image to Firebase Storage
const uploadImage = async (file) => {
  try {
    console.log('Uploading transaction image:', file.name)

    // Get the property ID for the upload context
    const propertyIdForUpload = extractPropertyId(selectedPropertyId.value || propertyId.value)

    if (!propertyIdForUpload) {
      throw new Error('Property ID is required for image upload')
    }

    // Upload using the uploadImages function with 'transaction' context
    const uploadedUrls = await uploadImages([file], propertyIdForUpload, 'transaction')

    if (uploadedUrls && uploadedUrls.length > 0) {
      console.log('Transaction image uploaded successfully:', uploadedUrls[0])
      return uploadedUrls[0]
    } else {
      throw new Error('Failed to upload image - no URL returned')
    }
  } catch (error) {
    console.error('Error uploading transaction image:', error)
    throw error
  }
}

// Enhanced getUserRoleForProperty function for CreateTransaction
const getUserRoleForProperty = (propertyId) => {
  console.log('=== CreateTransaction - getUserRoleForProperty (Universal) ===')
  console.log('Step 1: Retrieving all roles of current user')
  console.log('All user roles:', userDataStore.userRoles)
  console.log('Total roles count:', userDataStore.userRoles.length)

  const normalizedSearchId = normalizePropertyId(propertyId)
  if (!normalizedSearchId) {
    console.log('No valid property ID provided:', propertyId)
    return null
  }

  console.log('Step 2: Searching for property ID in accessible roles')
  console.log('Looking for property ID:', propertyId, 'Type:', typeof propertyId)
  console.log('Normalized search ID:', normalizedSearchId)

  // Enhanced debugging for property ID matching
  console.log('=== DETAILED PROPERTY ID MATCHING DEBUG ===')
  console.log('Search Property ID Details:')
  console.log('  Raw:', propertyId)
  console.log('  Type:', typeof propertyId)
  console.log('  String representation:', String(propertyId))
  console.log('  Length:', String(propertyId).length)
  console.log('  Trimmed:', String(propertyId).trim())
  console.log('  Normalized:', normalizedSearchId)

  console.log('Available User Roles:')
  userDataStore.userRoles.forEach((role, index) => {
    const rolePropertyId = extractPropertyId(role.property_id)
    const rolePropertyIdString = String(rolePropertyId)
    const searchPropertyIdString = String(propertyId)

    console.log(`  Role ${index + 1}:`)
    console.log('    Role ID:', role.id)
    console.log('    Role Name:', role.role)
    console.log('    Original property_id:', role.property_id)
    console.log('    Extracted property_id:', rolePropertyId)
    console.log('    Property ID type:', typeof role.property_id)
    console.log('    Property ID string:', rolePropertyIdString)
    console.log('    Property ID length:', rolePropertyIdString.length)
    console.log('    Search ID string:', searchPropertyIdString)
    console.log('    Search ID length:', searchPropertyIdString.length)
    console.log('    Exact equality (===):', rolePropertyId === propertyId)
    console.log('    String equality:', rolePropertyIdString === searchPropertyIdString)
    console.log(
      '    Trimmed equality:',
      rolePropertyIdString.trim() === searchPropertyIdString.trim(),
    )
    console.log('    ComparePropertyIds result:', comparePropertyIds(rolePropertyId, propertyId))
    console.log('    ---')
  })

  // Search through all user roles to find matching property_id
  const matchingRole = userDataStore.userRoles.find((role) => {
    const rolePropertyId = extractPropertyId(role.property_id)
    const isMatch = comparePropertyIds(rolePropertyId, propertyId)
    return isMatch
  })

  console.log('Step 3: Return matching role')
  if (matchingRole) {
    console.log('✅ CreateTransaction - Found matching role:', matchingRole.role)
    return matchingRole
  } else {
    console.log('❌ CreateTransaction - No matching role found for property ID:', propertyId)
    console.log('=== END DETAILED PROPERTY ID MATCHING DEBUG ===')
    return null
  }
}

// File upload related data
const selectedFile = ref(null)
const imagePreview = ref(null)

const transactionTypeOptions = [
  'Rent',
  'Deposit',
  'Tax',
  'Insurance',
  'Utility',
  'Maintenance',
  'Labor',
  'HOA',
  'Fee',
  'Refund',
  'Other',
]

// Watch for property selection to auto-fill user role
watch(selectedPropertyId, (newPropertyId) => {
  console.log('Property selected via dropdown (raw):', newPropertyId, 'Type:', typeof newPropertyId)

  // Extract property ID from object if needed
  const extractedPropertyId = extractPropertyId(newPropertyId)
  console.log('Extracted property ID:', extractedPropertyId, 'Type:', typeof extractedPropertyId)

  if (extractedPropertyId) {
    console.log('=== CreateTransaction - Property Selection ===')

    if (userDataStore.userRoles.length > 0) {
      console.log('Step 1: Retrieve all roles of current user')
      console.log('All user roles:', userDataStore.userRoles)

      console.log('Step 2: Search property ID in accessible roles')
      const userRole = getUserRoleForProperty(extractedPropertyId)

      console.log('Step 3: Fill with matching role name')
      if (userRole) {
        transactionData.role = userRole.role
        console.log('✅ Auto-filled user role:', userRole.role)
      } else {
        console.warn('❌ No user role found for property:', extractedPropertyId)
        transactionData.role = ''
      }
    } else {
      console.log('⏳ User roles not loaded yet, will auto-fill when roles are loaded')
    }
  }
})

// Watch for route propertyId to auto-fill user role
watch(propertyId, (newPropertyId) => {
  console.log('Property selected via route (raw):', newPropertyId, 'Type:', typeof newPropertyId)

  // Extract property ID from object if needed
  const extractedPropertyId = extractPropertyId(newPropertyId)
  console.log(
    'Extracted property ID from route:',
    extractedPropertyId,
    'Type:',
    typeof extractedPropertyId,
  )

  if (extractedPropertyId) {
    console.log('=== CreateTransaction - Route Property Selection ===')

    if (userDataStore.userRoles.length > 0) {
      console.log('Step 1: Retrieve all roles of current user')
      console.log('All user roles:', userDataStore.userRoles)

      console.log('Step 2: Search property ID in accessible roles')
      const userRole = getUserRoleForProperty(extractedPropertyId)

      console.log('Step 3: Fill with matching role name')
      if (userRole) {
        transactionData.role = userRole.role
        console.log('✅ Auto-filled user role:', userRole.role)
      } else {
        console.warn('❌ No user role found for property:', extractedPropertyId)
        transactionData.role = ''
      }
    } else {
      console.log('⏳ User roles not loaded yet, will auto-fill when roles are loaded')
    }
  }
})

// Watch for when user roles are loaded and auto-fill role if property is already selected
watch(
  () => userDataStore.userRoles.length,
  (newRolesCount) => {
    console.log('=== CreateTransaction - User Roles Loaded ===')
    console.log('User roles count changed to:', newRolesCount)

    if (newRolesCount > 0) {
      // Get current property ID (either from route or selected)
      const currentPropertyId = propertyId.value || selectedPropertyId.value
      console.log(
        'User roles loaded, current property ID (raw):',
        currentPropertyId,
        'Type:',
        typeof currentPropertyId,
      )

      // Extract property ID from object if needed
      const extractedPropertyId = extractPropertyId(currentPropertyId)
      console.log(
        'Extracted property ID for roles loaded:',
        extractedPropertyId,
        'Type:',
        typeof extractedPropertyId,
      )

      if (extractedPropertyId && !transactionData.role) {
        console.log('Auto-filling role for property:', extractedPropertyId)
        const userRole = getUserRoleForProperty(extractedPropertyId)

        if (userRole) {
          transactionData.role = userRole.role
          console.log('✅ Auto-filled user role after roles loaded:', userRole.role)
        } else {
          console.warn(
            '❌ No user role found for property after roles loaded:',
            extractedPropertyId,
          )
        }
      }
    }
  },
)

onMounted(() => {
  console.log('CreateTransaction mounted, propertyId:', propertyId.value)
  console.log('Available properties:', availableProperties.value)
  console.log('User accessible properties:', userDataStore.userAccessibleProperties)
  console.log('User roles loaded on mount:', userDataStore.userRoles.length)
  console.log('User roles loading state:', userDataStore.userRolesLoading)

  // Auto-fill user role if property is already selected and roles are loaded
  if (propertyId.value) {
    console.log('=== CreateTransaction - OnMount Property Selection ===')
    console.log('Property ID on mount (raw):', propertyId.value, 'Type:', typeof propertyId.value)

    // Extract property ID from object if needed
    const extractedPropertyId = extractPropertyId(propertyId.value)
    console.log(
      'Extracted property ID on mount:',
      extractedPropertyId,
      'Type:',
      typeof extractedPropertyId,
    )

    if (userDataStore.userRoles.length > 0 && extractedPropertyId) {
      console.log('Step 1: Retrieve all roles of current user')
      console.log('All user roles on mount:', userDataStore.userRoles)

      console.log('Step 2: Search property ID in accessible roles')
      const userRole = getUserRoleForProperty(extractedPropertyId)

      console.log('Step 3: Fill with matching role name')
      if (userRole) {
        transactionData.role = userRole.role
        console.log('✅ Auto-filled user role on mount:', userRole.role)
      } else {
        console.warn('❌ No user role found for property on mount:', extractedPropertyId)
        transactionData.role = ''
      }
    } else {
      console.log(
        '⏳ User roles not loaded yet on mount or no valid property ID, will auto-fill when roles are loaded',
      )
    }
  }
})

const onSubmit = async () => {
  try {
    const rawPropertyId = propertyId.value || selectedPropertyId.value
    const finalPropertyId = extractPropertyId(rawPropertyId)
    console.log('CreateTransaction onSubmit - propertyId.value:', propertyId.value)
    console.log('CreateTransaction onSubmit - selectedPropertyId.value:', selectedPropertyId.value)
    console.log(
      'CreateTransaction onSubmit - rawPropertyId:',
      rawPropertyId,
      'Type:',
      typeof rawPropertyId,
    )
    console.log(
      'CreateTransaction onSubmit - finalPropertyId (extracted):',
      finalPropertyId,
      'Type:',
      typeof finalPropertyId,
    )
    console.log('CreateTransaction onSubmit - availableProperties:', availableProperties.value)

    if (!finalPropertyId) {
      console.error('No property selected')
      Notify.create({
        type: 'negative',
        message: 'Please select a property',
        position: 'top',
      })
      return
    }

    const currentTimestamp = new Date()

    // Handle image upload if a file is selected
    let pictureUrl = ''
    if (selectedFile.value) {
      try {
        console.log('Uploading image...')
        pictureUrl = await uploadImage(selectedFile.value)
        console.log('Image uploaded successfully:', pictureUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        Notify.create({
          type: 'warning',
          message: 'Image upload failed, but transaction will be saved without the image.',
          position: 'top',
        })
      }
    }

    const transactionDataToSave = {
      transac_id: `txn_${Date.now()}`,
      property_id: finalPropertyId,
      role: transactionData.role,
      created_by_role: getUserRoleForProperty(finalPropertyId)?.role || transactionData.role || '',
      transac_from: transactionData.transac_from,
      transac_to: transactionData.transac_to,
      amount: parseFloat(transactionData.amount),
      transac_date: transactionData.transac_date,
      transac_type: transactionData.transac_type,
      note: transactionData.note || '',
      picture_url: pictureUrl, // Add the uploaded image URL
      created_by: userDataStore.userId,
      created_by_user_id: userDataStore.userId,
      created_datetime: currentTimestamp,
    }

    console.log('CreateTransaction onSubmit - transactionDataToSave:', transactionDataToSave)

    // Save to property subcollection: properties/{propertyId}/transactions
    const transactionId = await createDocument(
      `properties/${finalPropertyId}/transactions`,
      transactionDataToSave,
    )
    console.log('CreateTransaction onSubmit - transactionId created:', transactionId)

    // Reset form
    transactionData.role = ''
    transactionData.transac_from = ''
    transactionData.transac_to = ''
    transactionData.amount = null
    transactionData.transac_date = new Date().toISOString().split('T')[0]
    transactionData.transac_type = ''
    transactionData.note = ''
    transactionData.picture_url = ''

    // Reset image upload fields
    selectedFile.value = null
    imagePreview.value = null

    emit('transaction-created', { id: transactionId, ...transactionData })

    Notify.create({
      type: 'positive',
      message: 'Transaction created successfully!',
      position: 'top',
    })

    if (String(route.path || '').startsWith('/create-transaction')) {
      router.push('/transactions')
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to create transaction. Please try again.',
      position: 'top',
    })
  }
}

const handleCancel = () => {
  emit('cancel')
  if (String(route.path || '').startsWith('/create-transaction')) {
    router.back()
  }
}
</script>

<style scoped>
.create-transaction {
  max-width: 1200px;
  margin: 0 auto;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-transaction .elevated,
:global(body.body--dark) .create-transaction .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-transaction .bg-grey-1,
:global(body.body--dark) .create-transaction .q-field__control,
:global(body.body--dark) .create-transaction .picture-upload-section,
:global(body.body--dark) .create-transaction .image-preview {
  background: #223041 !important;
  border-color: #35506a;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.q-input {
  transition: var(--transition);
}

.q-input:hover {
  transform: translateY(-1px);
}

.q-select {
  transition: var(--transition);
}

.q-select:hover {
  transform: translateY(-1px);
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

.picture-upload-section {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.image-preview {
  position: relative;
  display: inline-block;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.image-preview .q-img {
  display: block;
}
</style>
