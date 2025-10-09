<template>
  <div class="create-transaction animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-weight-bold text-primary q-mb-sm">
          <q-icon name="receipt_long" class="q-mr-sm" />
          Create New Transaction Record
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-sm">
          <!-- Property Selection and Transaction Type Row -->
          <div class="row q-gutter-sm">
            <div v-if="propertyId" class="col-12 col-md-6">
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
            />

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
            />
          </div>

          <div
            v-if="!propertyId && !propertiesLoading && availableProperties.length === 0"
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

          <!-- From/To Role Selection Row -->
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
            />

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
            />
          </div>

          <!-- Amount and Date Row -->
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
            />

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
            />
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

          <!-- Action Buttons Row -->
          <div class="row q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Save Transaction"
              class="col-12 col-md-6"
              size="md"
              unelevated
            >
              <template v-slot:prepend>
                <q-icon name="save" />
              </template>
            </q-btn>
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
})

const route = useRoute()
const propertyId = computed(() => props.propertyId || route.params.propertyId)
const propertyName = computed(() => route.query.propertyName || 'Unknown Property')

const emit = defineEmits(['transaction-created', 'cancel'])
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, loading, uploadImages } = useFirebase()

const availableProperties = computed(() => userDataStore.userAccessibleProperties)
const selectedPropertyId = ref('')
const propertiesLoading = computed(() => userDataStore.propertiesLoading)

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
      transac_from: transactionData.transac_from,
      transac_to: transactionData.transac_to,
      amount: parseFloat(transactionData.amount),
      transac_date: transactionData.transac_date,
      transac_type: transactionData.transac_type,
      note: transactionData.note || '',
      picture_url: pictureUrl, // Add the uploaded image URL
      created_by: userDataStore.userId,
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

    // Navigate back to transactions page
    router.push('/transactions')
  } catch (error) {
    console.error('Error creating transaction:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to create transaction. Please try again.',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.create-transaction {
  max-width: 600px;
  margin: 0 auto;
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
