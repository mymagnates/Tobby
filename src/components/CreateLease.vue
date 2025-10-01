<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h4">Create New Lease</div>
      <q-btn flat icon="arrow_back" label="Back to Leases" to="/leases" color="primary" />
    </div>

    <q-card class="q-pa-lg">
      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Property Selection -->
        <div class="row q-gutter-sm">
          <div class="col-12">
            <q-select
              v-model="selectedPropertyId"
              :options="propertyOptions"
              option-value="id"
              option-label="displayName"
              label="Select Property *"
              outlined
              clearable
              @update:model-value="onPropertySelected"
              :loading="userDataStore.propertiesLoading"
              :disable="userDataStore.propertiesLoading"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No properties available </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <!-- Property Information Display -->
        <div v-if="selectedPropertyId" class="q-mb-lg">
          <q-card flat bordered class="bg-grey-1">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-md">Selected Property Information</div>
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-6">Property Name</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.nickname || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-6">Address</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.address || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="text-caption text-grey-6">City</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.city || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-2">
                  <div class="text-caption text-grey-6">State</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.state || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-2">
                  <div class="text-caption text-grey-6">ZIP</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.zip_code || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-2">
                  <div class="text-caption text-grey-6">Type</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.property_type || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-1">
                  <div class="text-caption text-grey-6">Beds</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.bedrooms || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-1">
                  <div class="text-caption text-grey-6">Baths</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.bathrooms || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-1">
                  <div class="text-caption text-grey-6">Sq Ft</div>
                  <div class="text-body1">{{ selectedPropertyInfo?.square_feet || 'N/A' }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lease & Financial Information -->
        <div class="text-h6 text-primary q-mb-sm q-mt-md">Lease & Financial Information</div>
        <div class="row q-gutter-sm">
          <!-- Lease Status & Term -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="leaseData.status"
              :options="leaseStatusOptions"
              label="Lease Status *"
              outlined
              :rules="[(val) => !!val || 'Status is required']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="leaseData.lease_term"
              label="Lease Term (months) *"
              type="number"
              outlined
              :rules="[(val) => !!val || 'Lease term is required']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="leaseData.lease_create_date"
              label="Lease Create Date *"
              type="date"
              outlined
              :rules="[(val) => !!val || 'Create date is required']"
            />
          </div>

          <!-- Rate Type & Amount -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="leaseData.rate_type"
              :options="rateTypeOptions"
              label="Rate Type *"
              outlined
              @update:model-value="onRateTypeChange"
              :rules="[(val) => !!val || 'Rate type is required']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="leaseData.rate_amount"
              label="Rate Amount *"
              type="number"
              step="0.01"
              outlined
              :rules="[(val) => !!val || 'Rate amount is required']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="leaseData.deposit"
              label="Deposit Amount"
              type="number"
              step="0.01"
              outlined
            />
          </div>

          <!-- Fees -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="leaseData.pet_fee"
              label="Pet Fee"
              type="number"
              step="0.01"
              outlined
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="leaseData.application_fee_per_person"
              label="Application Fee per Person"
              type="number"
              step="0.01"
              outlined
            />
          </div>
        </div>

        <!-- Property Features -->
        <div class="text-h6 text-primary q-mb-sm q-mt-md">Property Features</div>
        <div class="row q-gutter-sm">
          <div class="col-12 col-md-8">
            <q-select
              v-model="leaseData.utilities_included"
              :options="utilitiesOptions"
              label="Utilities Included"
              multiple
              outlined
              use-chips
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="leaseData.furnished"
              :options="furnishedOptions"
              label="Furnished Status"
              outlined
            />
          </div>
        </div>

        <!-- Additional Information -->
        <div class="text-h6 text-primary q-mb-sm q-mt-md">Additional Information</div>
        <div class="row q-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="leaseData.special_terms"
              label="Special Terms"
              type="textarea"
              outlined
              rows="2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="leaseData.additional_notes"
              label="Additional Notes"
              type="textarea"
              outlined
              rows="2"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="row justify-end q-mt-md">
          <q-btn
            type="submit"
            color="primary"
            label="Create Lease"
            :loading="submitting"
            :disable="!isFormValid"
            size="lg"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import { Notify } from 'quasar'

// Router and Store
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument } = useFirebase()

// Reactive data
const selectedPropertyId = ref('')
const submitting = ref(false)

// Lease data structure
const leaseData = ref({
  // Property information (flattened to property level)
  property_id: '',
  property_nickname: '',
  property_address: '',
  property_city: '',
  property_state: '',
  property_zip_code: '',
  property_type: '',
  property_bedrooms: 0,
  property_bathrooms: 0,
  property_square_feet: 0,

  // Lease information
  status: '',
  lease_term: null,
  lease_create_date: '',

  // Financial information
  rate_type: '',
  rate_amount: null,
  deposit: null,
  pet_fee: null,
  application_fee_per_person: null,

  // Property features
  utilities_included: [],
  furnished: '',

  // Additional information
  special_terms: '',
  additional_notes: '',
})

// Options
const leaseStatusOptions = ['Available', 'Rented', 'Pending', 'Expired', 'Terminated']
const rateTypeOptions = ['month', 'day', 'year']
const utilitiesOptions = ['Electricity', 'Water', 'Gas', 'Internet', 'Cable TV', 'Trash', 'Sewer']
const furnishedOptions = ['Yes', 'No', 'Partially']

// Computed properties
const propertyOptions = computed(() => {
  return userDataStore.userAccessibleProperties.map((property) => ({
    id: property.id,
    displayName: `${property.nickname || property.address} - ${property.city}, ${property.state}`,
    ...property,
  }))
})

const selectedProperty = computed(() => {
  if (!selectedPropertyId.value) return null
  return userDataStore.userAccessibleProperties.find((prop) => prop.id === selectedPropertyId.value)
})

// Reactive property information for display
const selectedPropertyInfo = computed(() => {
  if (!selectedPropertyId.value) return null
  const property = userDataStore.userAccessibleProperties.find(
    (prop) => prop.id === selectedPropertyId.value,
  )
  if (!property) return null

  return {
    nickname: property.nickname || property.name || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip_code: property.zip_code || property.zipCode || '',
    property_type: property.property_type || property.type || '',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    square_feet: property.square_feet || property.squareFeet || 0,
  }
})

const isFormValid = computed(() => {
  return !!(
    selectedPropertyId.value &&
    leaseData.value.status &&
    leaseData.value.lease_term &&
    leaseData.value.lease_create_date &&
    leaseData.value.rate_type &&
    leaseData.value.rate_amount
  )
})

// Methods
const onPropertySelected = (propertyId) => {
  console.log('onPropertySelected called with propertyId:', propertyId)
  console.log('Available properties:', userDataStore.userAccessibleProperties)

  if (propertyId) {
    const property = userDataStore.userAccessibleProperties.find((prop) => prop.id === propertyId)
    console.log('Found property:', property)

    if (property) {
      // Populate property information in lease data (flattened structure)
      leaseData.value.property_id = property.id
      leaseData.value.property_nickname = property.nickname || property.name || ''
      leaseData.value.property_address = property.address || ''
      leaseData.value.property_city = property.city || ''
      leaseData.value.property_state = property.state || ''
      leaseData.value.property_zip_code = property.zip_code || property.zipCode || ''
      leaseData.value.property_type = property.property_type || property.type || ''
      leaseData.value.property_bedrooms = property.bedrooms || 0
      leaseData.value.property_bathrooms = property.bathrooms || 0
      leaseData.value.property_square_feet = property.square_feet || property.squareFeet || 0

      console.log('Property selected:', property)
      console.log('Property nickname from property:', property.nickname)
      console.log('Property name from property:', property.name)
      console.log('Lease property data (flattened):', {
        property_id: leaseData.value.property_id,
        property_nickname: leaseData.value.property_nickname,
        property_address: leaseData.value.property_address,
        property_city: leaseData.value.property_city,
        property_state: leaseData.value.property_state,
        property_zip_code: leaseData.value.property_zip_code,
        property_type: leaseData.value.property_type,
        property_bedrooms: leaseData.value.property_bedrooms,
        property_bathrooms: leaseData.value.property_bathrooms,
        property_square_feet: leaseData.value.property_square_feet,
      })
    } else {
      console.error('Property not found for ID:', propertyId)
    }
  } else {
    // Clear property information
    leaseData.value.property_id = ''
    leaseData.value.property_nickname = ''
    leaseData.value.property_address = ''
    leaseData.value.property_city = ''
    leaseData.value.property_state = ''
    leaseData.value.property_zip_code = ''
    leaseData.value.property_type = ''
    leaseData.value.property_bedrooms = 0
    leaseData.value.property_bathrooms = 0
    leaseData.value.property_square_feet = 0
  }
}

const onRateTypeChange = () => {
  // Clear rate amount when rate type changes
  leaseData.value.rate_amount = null
}

const onSubmit = async () => {
  if (!isFormValid.value) {
    Notify.create({
      type: 'negative',
      message: 'Please fill in all required fields',
    })
    return
  }

  submitting.value = true

  try {
    // Debug: Log the current leaseData before saving
    console.log('=== LEASE DATA DEBUG ===')
    console.log('selectedPropertyId.value:', selectedPropertyId.value)
    console.log('leaseData.value.property_nickname:', leaseData.value.property_nickname)
    console.log('leaseData.value.property_address:', leaseData.value.property_address)
    console.log('Full leaseData.value:', leaseData.value)
    console.log('========================')

    // Prepare lease data for saving (flattened property structure)
    const leaseDataToSave = {
      // Property information (flattened to property level)
      property_id: selectedPropertyId.value,
      property_nickname: leaseData.value.property_nickname,
      property_address: leaseData.value.property_address,
      property_city: leaseData.value.property_city,
      property_state: leaseData.value.property_state,
      property_zip_code: leaseData.value.property_zip_code,
      property_type: leaseData.value.property_type,
      property_bedrooms: leaseData.value.property_bedrooms,
      property_bathrooms: leaseData.value.property_bathrooms,
      property_square_feet: leaseData.value.property_square_feet,

      // Lease information
      status: leaseData.value.status,
      lease_term: parseInt(leaseData.value.lease_term),
      lease_create_date: leaseData.value.lease_create_date,

      // Financial information
      rate_type: leaseData.value.rate_type,
      rate_amount: parseFloat(leaseData.value.rate_amount),
      deposit: parseFloat(leaseData.value.deposit) || 0,
      pet_fee: parseFloat(leaseData.value.pet_fee) || 0,
      application_fee_per_person: parseFloat(leaseData.value.application_fee_per_person) || 0,

      // Property features
      utilities_included: leaseData.value.utilities_included || [],
      furnished: leaseData.value.furnished || '',

      // Additional information
      special_terms: leaseData.value.special_terms || '',
      additional_notes: leaseData.value.additional_notes || '',

      // Metadata
      created_at: new Date().toISOString(),
      created_datetime: new Date(), // Firebase timestamp for sorting
      created_by: userDataStore.userId,
      updated_at: new Date().toISOString(),
    }

    console.log('=== LEASE DATA TO SAVE ===')
    console.log('Creating lease with data:', leaseDataToSave)
    console.log('Property ID:', leaseDataToSave.property_id)
    console.log('Property nickname:', leaseDataToSave.property_nickname)
    console.log('Property address:', leaseDataToSave.property_address)
    console.log('==========================')

    // Save to Firebase
    await createDocument('leases', leaseDataToSave)

    Notify.create({
      type: 'positive',
      message: 'Lease created successfully!',
    })

    // Refresh leases data
    await userDataStore.refreshLeases()

    // Redirect to leases page
    router.push('/leases')
  } catch (error) {
    console.error('Error creating lease:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to create lease. Please try again.',
    })
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('CreateLease mounted')
  console.log('User accessible properties:', userDataStore.userAccessibleProperties)

  // Log each property to see the structure
  userDataStore.userAccessibleProperties.forEach((property, index) => {
    console.log(`Property ${index}:`, {
      id: property.id,
      nickname: property.nickname,
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      zipCode: property.zipCode,
      property_type: property.property_type,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.square_feet,
      squareFeet: property.squareFeet,
    })
  })

  // Set default date to today
  leaseData.value.lease_create_date = new Date().toISOString().split('T')[0]
})

// Watch for changes in accessible properties
watch(
  () => userDataStore.userAccessibleProperties,
  (newProperties) => {
    console.log('User accessible properties updated:', newProperties)
  },
  { deep: true },
)

// Watch for changes in selectedPropertyId
watch(
  () => selectedPropertyId.value,
  (newPropertyId) => {
    console.log('selectedPropertyId changed to:', newPropertyId)
    if (newPropertyId) {
      const property = userDataStore.userAccessibleProperties.find(
        (prop) => prop.id === newPropertyId,
      )
      console.log('Found property for selectedPropertyId:', property)
    }
  },
)

// Watch for changes in selectedProperty
watch(
  () => selectedProperty.value,
  (newProperty) => {
    console.log('selectedProperty changed to:', newProperty)
  },
)

// Watch for changes in selectedPropertyInfo and update leaseData
watch(
  () => selectedPropertyInfo.value,
  (newPropertyInfo) => {
    console.log('selectedPropertyInfo changed to:', newPropertyInfo)
    if (newPropertyInfo) {
      // Update leaseData with the property information
      leaseData.value.property_id = selectedPropertyId.value
      leaseData.value.property_nickname = newPropertyInfo.nickname
      leaseData.value.property_address = newPropertyInfo.address
      leaseData.value.property_city = newPropertyInfo.city
      leaseData.value.property_state = newPropertyInfo.state
      leaseData.value.property_zip_code = newPropertyInfo.zip_code
      leaseData.value.property_type = newPropertyInfo.property_type
      leaseData.value.property_bedrooms = newPropertyInfo.bedrooms
      leaseData.value.property_bathrooms = newPropertyInfo.bathrooms
      leaseData.value.property_square_feet = newPropertyInfo.square_feet

      console.log('Updated leaseData with property info:', {
        property_id: leaseData.value.property_id,
        property_nickname: leaseData.value.property_nickname,
        property_address: leaseData.value.property_address,
      })
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.q-card {
  max-width: 1000px;
  margin: 0 auto;
}

.text-h6 {
  margin-top: 24px;
  margin-bottom: 16px;
}

.q-gutter-md > * + * {
  margin-top: 16px;
}

.q-mb-lg {
  margin-bottom: 24px;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-mt-lg {
  margin-top: 24px;
}

.bg-grey-1 {
  background-color: #f5f5f5;
}

.text-primary {
  color: var(--q-primary);
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.25;
}

.text-body1 {
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .q-pa-md {
    padding: 16px;
  }

  .q-pa-lg {
    padding: 20px;
  }
}
</style>
