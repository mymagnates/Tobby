<template>
  <q-page padding>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Lease Application</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">Complete your rental application</p>
          </div>
        </div>
      </div>

      <!-- Application Form -->
      <q-form @submit="submitApplication" class="application-form">
        <!-- Property/Lease Information -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="home" class="q-mr-sm" />
              Property & Lease Information
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="applicationForm.property_id"
                  :options="propertyOptions"
                  option-value="id"
                  option-label="label"
                  emit-value
                  map-options
                  label="Select Property *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Property is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="home_work" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.desired_move_in_date"
                  type="date"
                  label="Desired Move-in Date *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Move-in date is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="applicationForm.lease_term_months"
                  type="number"
                  label="Desired Lease Term (months) *"
                  outlined
                  dense
                  min="1"
                  :rules="[(val) => !!val || 'Lease term is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="applicationForm.number_of_occupants"
                  type="number"
                  label="Number of Occupants *"
                  outlined
                  dense
                  min="1"
                  :rules="[(val) => !!val || 'Number of occupants is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="people" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Main Applicant Information -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="person" class="q-mr-sm" />
              Main Applicant Information
            </div>

            <div class="row q-col-gutter-md">
              <!-- Personal Information -->
              <div class="col-12">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">Personal Details</div>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="applicationForm.applicant.first_name"
                  label="First Name *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'First name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="applicationForm.applicant.middle_name"
                  label="Middle Name"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="applicationForm.applicant.last_name"
                  label="Last Name *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Last name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="applicationForm.applicant.gender"
                  :options="genderOptions"
                  label="Gender *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Gender is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="wc" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="applicationForm.applicant.date_of_birth"
                  type="date"
                  label="Date of Birth *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Date of birth is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="applicationForm.applicant.ssn"
                  label="Social Security Number"
                  outlined
                  dense
                  mask="###-##-####"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <!-- Contact Information -->
              <div class="col-12 q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">Contact Information</div>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.email"
                  type="email"
                  label="Email *"
                  outlined
                  dense
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
                  v-model="applicationForm.applicant.phone"
                  label="Phone Number *"
                  outlined
                  dense
                  mask="(###) ###-####"
                  :rules="[(val) => !!val || 'Phone number is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <!-- Current Address -->
              <div class="col-12 q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">Current Address</div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="applicationForm.applicant.current_address.street"
                  label="Street Address *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Street address is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.current_address.city"
                  label="City *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'City is required']"
                />
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model="applicationForm.applicant.current_address.state"
                  label="State *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'State is required']"
                />
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model="applicationForm.applicant.current_address.zip"
                  label="ZIP Code *"
                  outlined
                  dense
                  mask="#####"
                  :rules="[(val) => !!val || 'ZIP code is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="applicationForm.applicant.current_address.monthly_rent"
                  type="number"
                  label="Current Monthly Rent"
                  outlined
                  dense
                  prefix="$"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.current_address.landlord_name"
                  label="Current Landlord Name"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.current_address.landlord_phone"
                  label="Current Landlord Phone"
                  outlined
                  dense
                  mask="(###) ###-####"
                />
              </div>

              <!-- Employment Information -->
              <div class="col-12 q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">Employment Information</div>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.employment.employer_name"
                  label="Employer Name *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Employer name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="work" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.employment.job_title"
                  label="Job Title *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Job title is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.employment.supervisor_name"
                  label="Supervisor Name"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.employment.work_phone"
                  label="Work Phone *"
                  outlined
                  dense
                  mask="(###) ###-####"
                  :rules="[(val) => !!val || 'Work phone is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="applicationForm.applicant.employment.work_address"
                  label="Work Address *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Work address is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="applicationForm.applicant.employment.monthly_income"
                  type="number"
                  label="Monthly Income *"
                  outlined
                  dense
                  prefix="$"
                  :rules="[(val) => !!val || 'Monthly income is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="applicationForm.applicant.employment.start_date"
                  type="date"
                  label="Employment Start Date"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vehicles Information -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="directions_car" class="q-mr-sm" />
                Vehicles
              </div>
              <q-btn
                flat
                dense
                color="primary"
                icon="add"
                label="Add Vehicle"
                @click="addVehicle"
              />
            </div>

            <div
              v-if="applicationForm.vehicles.length === 0"
              class="text-center text-grey-6 q-pa-md"
            >
              No vehicles added. Click "Add Vehicle" to add vehicle information.
            </div>

            <div
              v-for="(vehicle, index) in applicationForm.vehicles"
              :key="index"
              class="vehicle-item q-mb-md"
            >
              <div class="row q-col-gutter-md items-start">
                <div class="col-12">
                  <div class="row items-center justify-between">
                    <div class="text-subtitle2 text-weight-medium">Vehicle #{{ index + 1 }}</div>
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removeVehicle(index)"
                    >
                      <q-tooltip>Remove vehicle</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="col-12 col-md-3">
                  <q-input v-model="vehicle.make" label="Make" outlined dense />
                </div>

                <div class="col-12 col-md-3">
                  <q-input v-model="vehicle.model" label="Model" outlined dense />
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    v-model.number="vehicle.year"
                    type="number"
                    label="Year"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-input v-model="vehicle.color" label="Color" outlined dense />
                </div>

                <div class="col-12 col-md-2">
                  <q-input v-model="vehicle.license_plate" label="License Plate" outlined dense />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pets Information -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="pets" class="q-mr-sm" />
                Pets
              </div>
              <q-btn flat dense color="primary" icon="add" label="Add Pet" @click="addPet" />
            </div>

            <div v-if="applicationForm.pets.length === 0" class="text-center text-grey-6 q-pa-md">
              No pets added. Click "Add Pet" to add pet information.
            </div>

            <div v-for="(pet, index) in applicationForm.pets" :key="index" class="pet-item q-mb-md">
              <div class="row q-col-gutter-md items-start">
                <div class="col-12">
                  <div class="row items-center justify-between">
                    <div class="text-subtitle2 text-weight-medium">Pet #{{ index + 1 }}</div>
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removePet(index)"
                    >
                      <q-tooltip>Remove pet</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="col-12 col-md-3">
                  <q-select
                    v-model="pet.type"
                    :options="petTypeOptions"
                    label="Type"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-3">
                  <q-input v-model="pet.breed" label="Breed" outlined dense />
                </div>

                <div class="col-12 col-md-2">
                  <q-input v-model.number="pet.age" type="number" label="Age" outlined dense />
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    v-model.number="pet.weight"
                    type="number"
                    label="Weight (lbs)"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-input v-model="pet.name" label="Name" outlined dense />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Co-Applicants -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="group" class="q-mr-sm" />
                Co-Applicants
              </div>
              <q-btn
                flat
                dense
                color="primary"
                icon="add"
                label="Add Co-Applicant"
                @click="addCoApplicant"
              />
            </div>

            <div
              v-if="applicationForm.co_applicants.length === 0"
              class="text-center text-grey-6 q-pa-md"
            >
              No co-applicants added. Click "Add Co-Applicant" if there are additional applicants.
            </div>

            <div
              v-for="(coApplicant, index) in applicationForm.co_applicants"
              :key="index"
              class="co-applicant-item q-mb-lg"
            >
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle1 text-weight-medium">
                      Co-Applicant #{{ index + 1 }}
                    </div>
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removeCoApplicant(index)"
                    >
                      <q-tooltip>Remove co-applicant</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <q-input v-model="coApplicant.first_name" label="First Name" outlined dense />
                </div>

                <div class="col-12 col-md-4">
                  <q-input v-model="coApplicant.middle_name" label="Middle Name" outlined dense />
                </div>

                <div class="col-12 col-md-4">
                  <q-input v-model="coApplicant.last_name" label="Last Name" outlined dense />
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="coApplicant.gender"
                    :options="genderOptions"
                    label="Gender"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model="coApplicant.date_of_birth"
                    type="date"
                    label="Date of Birth"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-input
                    v-model="coApplicant.phone"
                    label="Phone"
                    outlined
                    dense
                    mask="(###) ###-####"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input v-model="coApplicant.email" type="email" label="Email" outlined dense />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="coApplicant.relationship"
                    label="Relationship to Main Applicant"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Supporting Documents -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="description" class="q-mr-sm" />
                Supporting Documents
              </div>
              <q-btn
                flat
                dense
                color="primary"
                icon="add"
                label="Add Document"
                @click="showAddDocumentDialog = true"
              />
            </div>

            <div
              v-if="applicationForm.documents.length === 0"
              class="text-center text-grey-6 q-pa-md"
            >
              No documents uploaded. Click "Add Document" to upload supporting documents.
            </div>

            <q-list separator v-if="applicationForm.documents.length > 0">
              <q-item v-for="(doc, index) in applicationForm.documents" :key="index">
                <q-item-section avatar>
                  <q-icon name="insert_drive_file" color="primary" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption v-if="doc.description">{{ doc.description }}</q-item-label>
                  <q-item-label caption v-if="doc.file">{{ doc.file.name }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeDocument(index)"
                  >
                    <q-tooltip>Remove document</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Additional Information -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="notes" class="q-mr-sm" />
              Additional Information
            </div>

            <q-input
              v-model="applicationForm.additional_notes"
              type="textarea"
              label="Additional Notes or Comments"
              outlined
              rows="4"
              hint="Any additional information you'd like to provide"
            />
          </q-card-section>
        </q-card>

        <!-- Submit Button -->
        <div class="row justify-end q-gutter-sm">
          <q-btn flat label="Cancel" color="grey-7" @click="resetForm" :disable="submitting" />
          <q-btn
            type="submit"
            label="Submit Application"
            color="primary"
            icon-right="send"
            :loading="submitting"
            class="btn-primary"
          />
        </div>
      </q-form>
    </div>

    <!-- Add Document Dialog -->
    <q-dialog v-model="showAddDocumentDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Add Document</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input
              v-model="newDocument.name"
              label="Document Name *"
              outlined
              dense
              hint="e.g., Pay Stub, ID, Bank Statement"
            />

            <q-input
              v-model="newDocument.description"
              label="Description (Optional)"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <q-file
              v-model="newDocument.file"
              label="Upload File *"
              outlined
              dense
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              max-file-size="10485760"
              @rejected="onFileRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" @click="closeDocumentDialog" />
          <q-btn
            flat
            label="Add"
            color="primary"
            @click="addDocument"
            :disable="!newDocument.name || !newDocument.file"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

const userDataStore = useUserDataStore()
const { createDocument, uploadImagesWithDetails } = useFirebase()

// Form state
const submitting = ref(false)
const showAddDocumentDialog = ref(false)

// Application form
const applicationForm = ref({
  property_id: null,
  desired_move_in_date: '',
  lease_term_months: 12,
  number_of_occupants: 1,
  applicant: {
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    ssn: '',
    email: '',
    phone: '',
    current_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      monthly_rent: null,
      landlord_name: '',
      landlord_phone: '',
    },
    employment: {
      employer_name: '',
      job_title: '',
      supervisor_name: '',
      work_phone: '',
      work_address: '',
      monthly_income: null,
      start_date: '',
    },
  },
  vehicles: [],
  pets: [],
  co_applicants: [],
  documents: [],
  additional_notes: '',
  status: 'pending',
  submitted_at: null,
})

// New document form
const newDocument = ref({
  name: '',
  description: '',
  file: null,
})

// Options
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const petTypeOptions = ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Other']

// Computed properties
const propertyOptions = computed(() => {
  return userDataStore.userAccessibleProperties.map((property) => ({
    id: property.id,
    label: `${property.address} - ${property.city}, ${property.state}`,
  }))
})

// Vehicle methods
const addVehicle = () => {
  applicationForm.value.vehicles.push({
    make: '',
    model: '',
    year: null,
    color: '',
    license_plate: '',
  })
}

const removeVehicle = (index) => {
  applicationForm.value.vehicles.splice(index, 1)
}

// Pet methods
const addPet = () => {
  applicationForm.value.pets.push({
    type: '',
    breed: '',
    age: null,
    weight: null,
    name: '',
  })
}

const removePet = (index) => {
  applicationForm.value.pets.splice(index, 1)
}

// Co-applicant methods
const addCoApplicant = () => {
  applicationForm.value.co_applicants.push({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    email: '',
    relationship: '',
  })
}

const removeCoApplicant = (index) => {
  applicationForm.value.co_applicants.splice(index, 1)
}

// Document methods
const addDocument = () => {
  if (!newDocument.value.name || !newDocument.value.file) {
    Notify.create({
      type: 'warning',
      message: 'Please provide document name and file',
      position: 'top',
    })
    return
  }

  applicationForm.value.documents.push({
    name: newDocument.value.name,
    description: newDocument.value.description,
    file: newDocument.value.file,
  })

  closeDocumentDialog()
}

const removeDocument = (index) => {
  applicationForm.value.documents.splice(index, 1)
}

const closeDocumentDialog = () => {
  showAddDocumentDialog.value = false
  newDocument.value = {
    name: '',
    description: '',
    file: null,
  }
}

const onFileRejected = () => {
  Notify.create({
    type: 'negative',
    message: 'File rejected. Please check file size and type.',
    position: 'top',
  })
}

// Submit application
const submitApplication = async () => {
  try {
    submitting.value = true

    // Upload documents first
    let uploadedDocuments = []
    if (applicationForm.value.documents.length > 0) {
      const files = applicationForm.value.documents.map((doc) => doc.file)
      const uploadPath = `lease_applications/${Date.now()}`

      const uploadResults = await uploadImagesWithDetails(files, uploadPath)

      uploadedDocuments = applicationForm.value.documents.map((doc, index) => ({
        name: doc.name,
        description: doc.description,
        url: uploadResults[index].url,
        storage_path: uploadResults[index].storagePath,
        file_name: uploadResults[index].fileName,
        uploaded_at: new Date().toISOString(),
      }))
    }

    // Prepare application data
    const applicationData = {
      ...applicationForm.value,
      documents: uploadedDocuments,
      submitted_at: new Date().toISOString(),
      submitted_by: userDataStore.userId,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    // Save to Firestore
    await createDocument('lease_applications', applicationData)

    Notify.create({
      type: 'positive',
      message: 'Application submitted successfully!',
      position: 'top',
      caption: 'We will review your application and get back to you soon.',
    })

    // Reset form
    resetForm()

    // Optionally navigate away
    // router.push('/')
  } catch (error) {
    console.error('Error submitting application:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to submit application',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  applicationForm.value = {
    property_id: null,
    desired_move_in_date: '',
    lease_term_months: 12,
    number_of_occupants: 1,
    applicant: {
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: '',
      date_of_birth: '',
      ssn: '',
      email: '',
      phone: '',
      current_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        monthly_rent: null,
        landlord_name: '',
        landlord_phone: '',
      },
      employment: {
        employer_name: '',
        job_title: '',
        supervisor_name: '',
        work_phone: '',
        work_address: '',
        monthly_income: null,
        start_date: '',
      },
    },
    vehicles: [],
    pets: [],
    co_applicants: [],
    documents: [],
    additional_notes: '',
    status: 'pending',
    submitted_at: null,
  }
}

onMounted(() => {
  console.log('Lease Application Page mounted')
})
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h4 {
  color: #1a1a1a;
  font-weight: 600;
}

.application-form {
  width: 100%;
}

.vehicle-item,
.pet-item,
.co-applicant-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 8px;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header h4 {
    font-size: 1.5rem;
  }

  .text-h6 {
    font-size: 1.1rem;
  }
}
</style>
