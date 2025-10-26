<template>
  <q-page class="q-pa-md">
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
              emit-value
              map-options
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
          <q-card flat bordered class="property-info-card">
            <q-card-section>
              <!-- Debug: Property Data Structure -->
              <div class="property-debug-section q-mb-md">
                <q-expansion-item
                  icon="code"
                  label="Debug: View Property Data Structure"
                  header-class="bg-grey-2"
                >
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-caption text-weight-bold q-mb-sm">Selected Property ID:</div>
                      <pre class="debug-json">{{ selectedPropertyId }}</pre>

                      <div class="text-caption text-weight-bold q-mb-sm q-mt-md">
                        Selected Property Object:
                      </div>
                      <pre class="debug-json">{{ JSON.stringify(selectedProperty, null, 2) }}</pre>

                      <div class="text-caption text-weight-bold q-mb-sm q-mt-md">
                        Lease Data Property (what will be saved):
                      </div>
                      <pre class="debug-json">{{
                        JSON.stringify(leaseData.property, null, 2)
                      }}</pre>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>

              <!-- Property Specifications -->
              <div class="property-specs-compact q-mt-md">
                <div class="row q-col-gutter-md">
                  <div class="col">
                    <div class="spec-compact-item">
                      <q-icon name="category" size="16px" color="primary" class="q-mr-xs" />
                      <div>
                        <div class="spec-compact-label">Type</div>
                        <div class="spec-compact-value">
                          {{ selectedPropertyInfo?.property_type || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="spec-compact-item">
                      <q-icon name="bed" size="16px" color="primary" class="q-mr-xs" />
                      <div>
                        <div class="spec-compact-label">Bedrooms</div>
                        <div class="spec-compact-value">
                          {{ selectedPropertyInfo?.bedrooms || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="spec-compact-item">
                      <q-icon name="bathtub" size="16px" color="primary" class="q-mr-xs" />
                      <div>
                        <div class="spec-compact-label">Bathrooms</div>
                        <div class="spec-compact-value">
                          {{ selectedPropertyInfo?.bathrooms || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="spec-compact-item">
                      <q-icon name="local_parking" size="16px" color="primary" class="q-mr-xs" />
                      <div>
                        <div class="spec-compact-label">Garage</div>
                        <div class="spec-compact-value">
                          {{ selectedPropertyInfo?.garage || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="spec-compact-item">
                      <q-icon name="square_foot" size="16px" color="primary" class="q-mr-xs" />
                      <div>
                        <div class="spec-compact-label">Size</div>
                        <div class="spec-compact-value">
                          {{
                            selectedPropertyInfo?.size
                              ? selectedPropertyInfo.size.toLocaleString() + ' sq ft'
                              : 'N/A'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lease & Financial Information -->
        <div class="text-h6 text-primary q-mb-sm q-mt-md">Lease Terms and Specs</div>
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
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import { Notify } from 'quasar'

// Define emits
const emit = defineEmits(['lease-created', 'cancel'])

// Store
const userDataStore = useUserDataStore()
const { createDocument } = useFirebase()

// Reactive data
const selectedPropertyId = ref('')
const submitting = ref(false)

// Lease data structure
const leaseData = ref({
  // Property information (full object)
  property_id: '',
  property: null, // Full property object

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
    displayName: `${property.nickname || property.name || 'Unnamed'} - ${property.address || 'No Address'}`,
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
  const property = selectedProperty.value

  if (!property) return null

  return {
    nickname: property.nickname || property.name || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip_code: property.zip_code || property.zipCode || '',
    property_type: property.spec?.type || property.type || property.property_type || '',
    bedrooms: property.spec?.bedroom || property.spec?.bedrooms || 0,
    bathrooms: property.spec?.full_bathroom || property.spec?.bathrooms || 0,
    garage: property.spec?.garage || property.garage || 'N/A',
    size: property.spec?.size || property.spec?.square_feet || property.size || 0,
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
      // Store full property object and property ID
      leaseData.value.property_id = property.id
      leaseData.value.property = { ...property } // Store full property object

      console.log('Property selected:', property)
      console.log('Property object stored:', leaseData.value.property)
      console.log('Property ID stored:', leaseData.value.property_id)
    } else {
      console.error('Property not found for ID:', propertyId)
    }
  } else {
    // Clear property information
    leaseData.value.property_id = ''
    leaseData.value.property = null
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
    console.log('leaseData.value.property:', leaseData.value.property)
    console.log('leaseData.value.property_id:', leaseData.value.property_id)
    console.log('Full leaseData.value:', leaseData.value)
    console.log('========================')

    // Generate LSID (Lease ID) using property nickname and timestamp
    const now = new Date()
    const propertyNickname =
      leaseData.value.property?.nickname || leaseData.value.property?.name || 'Property'
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const LSID = `${propertyNickname}${year}${month}${hour}${minutes}${seconds}`

    // Prepare lease data for saving (with full property object)
    const leaseDataToSave = {
      // Property information (full object)
      property_id: leaseData.value.property, // Full property object (what LeasesPage expects)
      property_string_id: selectedPropertyId.value, // String ID for reference

      // Lease ID
      LSID: LSID,

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
    console.log('Generated LSID:', LSID)
    console.log('Creating lease with data:', leaseDataToSave)
    console.log('Property String ID:', leaseDataToSave.property_string_id)
    console.log('Property Object (property_id):', leaseDataToSave.property_id)
    console.log(
      'Property nickname:',
      leaseDataToSave.property_id?.nickname || leaseDataToSave.property_id?.name,
    )
    console.log('Property address:', leaseDataToSave.property_id?.address)
    console.log('==========================')

    // Save to Firebase
    await createDocument('leases', leaseDataToSave)

    Notify.create({
      type: 'positive',
      message: 'Lease created successfully!',
    })

    // Refresh leases data
    await userDataStore.refreshLeases()

    // Emit event to close dialog
    emit('lease-created')
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

/* Property Information Card Styling */
.property-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(36, 87, 115, 0.1);
}

/* Property Hero Section */
.property-hero-section {
  background: linear-gradient(135deg, rgba(36, 87, 115, 0.05) 0%, rgba(36, 87, 115, 0.1) 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.property-title-section {
  width: 100%;
}

.property-address-section {
  margin-top: 8px;
}

/* Property Specifications Grid */
.property-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.spec-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(36, 87, 115, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.spec-section:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(36, 87, 115, 0.15);
  transform: translateY(-2px);
}

.spec-section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(36, 87, 115, 0.1);
}

.spec-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(36, 87, 115, 0.03);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  transition: all 0.2s ease;
}

.spec-item:hover {
  background: rgba(36, 87, 115, 0.08);
  transform: translateX(4px);
}

.spec-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(36, 87, 115, 0.1);
  border-radius: 8px;
  margin-right: 12px;
  color: var(--primary-color);
}

.spec-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spec-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-600);
  min-width: 120px;
}

.spec-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--neutral-800);
  text-align: right;
  flex: 1;
}

/* Property Description Section */
.property-description-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(36, 87, 115, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.property-description-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--neutral-700);
  background: rgba(36, 87, 115, 0.03);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
}

/* Property Save Section */
.property-save-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(36, 87, 115, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.property-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.property-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  transition: all 0.2s ease;
}

.property-detail-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(2px);
}

.property-detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-600);
  min-width: 100px;
}

.property-detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--neutral-800);
  text-align: right;
  flex: 1;
}

/* Property Save Information Styling */
.property-save-info {
  background: rgba(36, 87, 115, 0.05);
  border: 1px solid rgba(36, 87, 115, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.save-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(36, 87, 115, 0.1);
}

.save-info-item:last-child {
  border-bottom: none;
}

.save-info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 120px;
}

.save-info-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--neutral-700);
  text-align: right;
  flex: 1;
}

.property-data-preview {
  margin-top: 12px;
}

.property-data-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.property-data-json {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #495057;
  background: transparent;
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

/* Debug Section */
.property-debug-section {
  margin-bottom: 16px;
}

.debug-json {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #212529;
  max-height: 400px;
  overflow-y: auto;
}

/* Compact Property Specifications */
.property-specs-compact {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(36, 87, 115, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.spec-compact-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(36, 87, 115, 0.03);
  border-radius: 6px;
  border-left: 3px solid var(--primary-color);
}

.spec-compact-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spec-compact-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-800);
  margin-top: 2px;
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
