<template>
  <q-page padding>
    <div class="page-container" style="max-width: 1200px; margin: 0 auto;">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Create New Tenant</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">
              Add tenant information and upload documents
            </p>
          </div>
          <q-btn
            flat
            icon="arrow_back"
            label="Back"
            color="grey-7"
            @click="$router.back()"
          />
        </div>
      </div>

      <q-form @submit="handleSubmit" class="q-gutter-md">
        <!-- Property Selection -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="home" class="q-mr-sm" />
              Property Selection
            </div>
          </q-card-section>
          <q-card-section>
            <q-select
              v-model="formData.propertyId"
              :options="propertyOptions"
              label="Select Property *"
              outlined
              emit-value
              map-options
              option-value="value"
              option-label="label"
              :rules="[(val) => !!val || 'Property is required']"
            >
              <template v-slot:prepend>
                <q-icon name="apartment" />
              </template>
            </q-select>
          </q-card-section>
        </q-card>

        <!-- Personal Information -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">
              <q-icon name="person" class="q-mr-sm" />
              Personal Information
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.firstName"
                  label="First Name *"
                  outlined
                  :rules="[(val) => !!val || 'First name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.middleName"
                  label="Middle Name"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.lastName"
                  label="Last Name *"
                  outlined
                  :rules="[(val) => !!val || 'Last name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.email"
                  type="email"
                  label="Email *"
                  outlined
                  :rules="[
                    (val) => !!val || 'Email is required',
                    (val) => /.+@.+\..+/.test(val) || 'Email must be valid',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.phone"
                  label="Phone Number *"
                  outlined
                  mask="(###) ###-####"
                  :rules="[(val) => !!val || 'Phone number is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.dateOfBirth"
                  label="Date of Birth *"
                  outlined
                  :rules="[(val) => !!val || 'Date of birth is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formData.dateOfBirth" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.gender"
                  :options="['Male', 'Female', 'Other', 'Prefer not to say']"
                  label="Gender"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="wc" />
                  </template>
                </q-select>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formData.ssn"
                  label="Social Security Number"
                  outlined
                  mask="###-##-####"
                >
                  <template v-slot:prepend>
                    <q-icon name="credit_card" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Current Address -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-info text-white">
            <div class="text-h6">
              <q-icon name="location_on" class="q-mr-sm" />
              Current Address
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="formData.currentAddress.street"
                  label="Street Address"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="home" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.currentAddress.city"
                  label="City"
                  outlined
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.currentAddress.state"
                  label="State"
                  outlined
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.currentAddress.zipCode"
                  label="ZIP Code"
                  outlined
                  mask="#####"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Lease Information -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">
              <q-icon name="description" class="q-mr-sm" />
              Lease Information
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.leaseStartDate"
                  label="Lease Start Date *"
                  outlined
                  :rules="[(val) => !!val || 'Lease start date is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formData.leaseStartDate" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.leaseEndDate"
                  label="Lease End Date *"
                  outlined
                  :rules="[(val) => !!val || 'Lease end date is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formData.leaseEndDate" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.monthlyRent"
                  type="number"
                  label="Monthly Rent *"
                  outlined
                  prefix="$"
                  :rules="[(val) => !!val || 'Monthly rent is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.securityDeposit"
                  type="number"
                  label="Security Deposit"
                  outlined
                  prefix="$"
                >
                  <template v-slot:prepend>
                    <q-icon name="shield" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.paymentMethod"
                  :options="['Bank Transfer', 'Check', 'Cash', 'Online Payment', 'Other']"
                  label="Payment Method"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="payment" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Emergency Contact -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-warning text-white">
            <div class="text-h6">
              <q-icon name="emergency" class="q-mr-sm" />
              Emergency Contact
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.emergencyContact.name"
                  label="Contact Name"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.emergencyContact.relationship"
                  label="Relationship"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="family_restroom" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.emergencyContact.phone"
                  label="Phone Number"
                  outlined
                  mask="(###) ###-####"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Document Upload -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-deep-purple text-white">
            <div class="text-h6">
              <q-icon name="upload_file" class="q-mr-sm" />
              Upload Documents
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">Upload tenant documents (ID, lease agreement, etc.)</div>
            
            <!-- File Upload Area -->
            <q-file
              v-model="uploadFiles"
              multiple
              outlined
              label="Select Files"
              max-file-size="10485760"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              @update:model-value="handleFileSelection"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint>
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
              </template>
            </q-file>

            <!-- Document List with Details -->
            <div v-if="documents.length > 0" class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Uploaded Documents:</div>
              <q-list bordered separator>
                <q-item v-for="(doc, index) in documents" :key="index">
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(doc.file.name)" color="primary" size="md" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ doc.file.name }}</q-item-label>
                    <q-item-label caption>
                      {{ formatFileSize(doc.file.size) }} • {{ doc.documentType }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-select
                      v-model="doc.documentType"
                      :options="documentTypeOptions"
                      outlined
                      dense
                      label="Document Type"
                      style="min-width: 200px"
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="removeDocument(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>

        <!-- Additional Notes -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <q-input
              v-model="formData.notes"
              type="textarea"
              label="Additional Notes"
              outlined
              rows="4"
              hint="Any additional information about the tenant"
            >
              <template v-slot:prepend>
                <q-icon name="notes" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>

        <!-- Action Buttons -->
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md justify-end">
              <q-btn
                flat
                label="Cancel"
                color="grey-7"
                icon="cancel"
                @click="$router.back()"
                :disable="submitting"
              />
              <q-btn
                type="submit"
                label="Create Tenant"
                color="primary"
                icon="person_add"
                :loading="submitting"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { createDocument, uploadImagesWithDetails } from '../composables/useFirebase'

const router = useRouter()
const $q = useQuasar()
const userDataStore = useUserDataStore()

// Form Data
const formData = ref({
  propertyId: null,
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  ssn: '',
  currentAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
  leaseStartDate: '',
  leaseEndDate: '',
  monthlyRent: null,
  securityDeposit: null,
  paymentMethod: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  notes: '',
})

// Document Upload
const uploadFiles = ref(null)
const documents = ref([])
const submitting = ref(false)

const documentTypeOptions = [
  'Government ID',
  'Driver License',
  'Passport',
  'Lease Agreement',
  'Proof of Income',
  'Bank Statement',
  'Reference Letter',
  'Background Check',
  'Credit Report',
  'Insurance Document',
  'Other',
]

// Property Options
const propertyOptions = computed(() => {
  return userDataStore.userAccessibleProperties.map((property) => ({
    label: property.displayName || property.address,
    value: property.id,
  }))
})

// Handle File Selection
const handleFileSelection = (files) => {
  if (files) {
    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach((file) => {
      documents.value.push({
        file: file,
        documentType: 'Other', // Default type
      })
    })
    uploadFiles.value = null // Reset file input
  }
}

// Remove Document
const removeDocument = (index) => {
  documents.value.splice(index, 1)
}

// Get File Icon
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
  }
  return iconMap[ext] || 'insert_drive_file'
}

// Format File Size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Handle Submit
const handleSubmit = async () => {
  try {
    submitting.value = true

    // Validate required fields
    if (!formData.value.propertyId) {
      throw new Error('Please select a property')
    }
    if (!formData.value.firstName || !formData.value.lastName) {
      throw new Error('First name and last name are required')
    }
    if (!formData.value.email || !formData.value.phone) {
      throw new Error('Email and phone number are required')
    }
    if (!formData.value.leaseStartDate || !formData.value.leaseEndDate) {
      throw new Error('Lease start and end dates are required')
    }
    if (!formData.value.monthlyRent) {
      throw new Error('Monthly rent is required')
    }

    // Upload documents first
    let uploadedDocuments = []
    if (documents.value.length > 0) {
      $q.notify({
        type: 'info',
        message: 'Uploading documents...',
        position: 'top',
      })

      const filesWithDetails = documents.value.map((doc) => ({
        file: doc.file,
        fileName: doc.file.name,
        category: doc.documentType,
      }))

      const storagePath = `tenants/${formData.value.propertyId}/${Date.now()}`
      uploadedDocuments = await uploadImagesWithDetails(filesWithDetails, storagePath)
    }

    // Create tenant document
    const tenantData = {
      property_id: formData.value.propertyId,
      personal_info: {
        first_name: formData.value.firstName,
        middle_name: formData.value.middleName,
        last_name: formData.value.lastName,
        email: formData.value.email,
        phone: formData.value.phone,
        date_of_birth: formData.value.dateOfBirth,
        gender: formData.value.gender,
        ssn: formData.value.ssn,
      },
      current_address: formData.value.currentAddress,
      lease_info: {
        start_date: formData.value.leaseStartDate,
        end_date: formData.value.leaseEndDate,
        monthly_rent: formData.value.monthlyRent,
        security_deposit: formData.value.securityDeposit,
        payment_method: formData.value.paymentMethod,
      },
      emergency_contact: formData.value.emergencyContact,
      documents: uploadedDocuments,
      notes: formData.value.notes,
      status: 'active',
      created_at: new Date().toISOString(),
      created_by: userDataStore.userId,
    }

    // Save to Firestore
    await createDocument('tenants', tenantData)

    $q.notify({
      type: 'positive',
      message: 'Tenant created successfully!',
      position: 'top',
      icon: 'check_circle',
    })

    // Navigate back or to tenant list
    router.push('/')
  } catch (error) {
    console.error('Error creating tenant:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create tenant',
      position: 'top',
      icon: 'error',
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // Check if user has properties
  if (propertyOptions.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Please create a property first before adding tenants',
      position: 'top',
    })
  }
})
</script>

<style scoped>
.page-container {
  padding-bottom: 50px;
}

.page-header {
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.animate-success {
  animation: scaleIn 0.5s ease-in-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

