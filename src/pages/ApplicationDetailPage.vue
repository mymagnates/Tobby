<template>
  <!-- Standalone Version (no layout) -->
  <div v-if="!isWithinLayout" class="application-detail-standalone">
    <!-- Top Navigation Bar -->
    <div class="top-nav-bar">
      <div class="nav-content">
        <div class="nav-left">
          <q-icon name="description" size="24px" color="white" class="q-mr-sm" />
          <span class="nav-title">Application Details</span>
        </div>
        <!-- View Lease button hidden for public users -->
      </div>
    </div>

    <div class="page-container">
      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-mt-md">Loading application details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error_outline" size="100px" color="negative" />
        <div class="text-h6 q-mt-md text-negative">{{ error }}</div>
        <q-btn flat label="Go Back" color="primary" class="q-mt-md" @click="$router.push('/')" />
      </div>

      <!-- Success Content -->
      <div v-else-if="application">
        <!-- Success Header -->
        <div class="success-header q-mb-xl">
          <div class="text-center">
            <q-icon name="check_circle" size="100px" color="positive" class="animate-success" />
            <h4 class="text-h4 q-ma-none q-mt-md">Application Submitted Successfully!</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">
              Your application has been received and is under review.
            </p>
            <div class="text-body2 text-grey-6 q-mt-sm">
              Application ID: <strong>{{ application.id }}</strong>
            </div>
            <div class="text-body2 text-grey-6">
              Submitted: {{ formatDateTime(application.submitted_at) }}
            </div>
          </div>
        </div>

        <!-- Application Status - Hidden for public users -->

        <!-- Property & Lease Information -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="home" class="q-mr-sm" />
              Property & Lease Information
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12" v-if="propertyData">
                <div class="text-h6 text-primary">
                  {{ propertyData.displayName || propertyData.address }}
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Desired Move-in Date</div>
                <div class="detail-value">{{ formatDate(application.desired_move_in_date) }}</div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Lease Term</div>
                <div class="detail-value">{{ application.lease_term_months }} months</div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Number of Occupants</div>
                <div class="detail-value">{{ application.number_of_occupants }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Applicant Information -->
        <q-card class="q-mb-lg" v-if="application.applicant">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">
              <q-icon name="person" class="q-mr-sm" />
              Main Applicant Information
            </div>
          </q-card-section>
          <q-card-section>
            <!-- Personal Information -->
            <div class="section-subtitle">Personal Details</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">
                  {{ application.applicant.first_name }} {{ application.applicant.middle_name }}
                  {{ application.applicant.last_name }}
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Gender</div>
                <div class="detail-value">{{ application.applicant.gender || 'N/A' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Date of Birth</div>
                <div class="detail-value">
                  {{ formatDate(application.applicant.date_of_birth) }}
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="section-subtitle">Contact Information</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="detail-label">Email</div>
                <div class="detail-value">
                  <a :href="`mailto:${application.applicant.email}`">{{
                    application.applicant.email
                  }}</a>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="detail-label">Phone</div>
                <div class="detail-value">
                  <a :href="`tel:${application.applicant.phone}`">{{
                    application.applicant.phone
                  }}</a>
                </div>
              </div>
            </div>

            <!-- Current Address -->
            <div class="section-subtitle">Current Address</div>
            <div class="row q-col-gutter-md q-mb-md" v-if="application.applicant.current_address">
              <div class="col-12 col-md-6">
                <div class="detail-label">Address</div>
                <div class="detail-value">
                  {{ application.applicant.current_address.street }},
                  {{ application.applicant.current_address.city }},
                  {{ application.applicant.current_address.state }}
                  {{ application.applicant.current_address.zip }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Current Rent</div>
                <div class="detail-value">
                  ${{ formatAmount(application.applicant.current_address.monthly_rent) }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Landlord</div>
                <div class="detail-value">
                  {{ application.applicant.current_address.landlord_name || 'N/A' }}
                </div>
              </div>
            </div>

            <!-- Employment Information -->
            <div class="section-subtitle">Employment Information</div>
            <div class="row q-col-gutter-md" v-if="application.applicant.employment">
              <div class="col-12 col-md-4">
                <div class="detail-label">Employer</div>
                <div class="detail-value">{{ application.applicant.employment.employer_name }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Job Title</div>
                <div class="detail-value">{{ application.applicant.employment.job_title }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Monthly Income</div>
                <div class="detail-value">
                  ${{ formatAmount(application.applicant.employment.monthly_income) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vehicles -->
        <q-card class="q-mb-lg" v-if="application.vehicles && application.vehicles.length > 0">
          <q-card-section class="bg-indigo text-white">
            <div class="text-h6">
              <q-icon name="directions_car" class="q-mr-sm" />
              Vehicles ({{ application.vehicles.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="(vehicle, index) in application.vehicles"
                :key="index"
                class="col-12 col-md-6"
              >
                <div class="vehicle-item">
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    Vehicle {{ index + 1 }}
                  </div>
                  <div class="text-body2">
                    {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                  </div>
                  <div class="text-caption text-grey-6">
                    Color: {{ vehicle.color }} • Plate: {{ vehicle.license_plate }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pets -->
        <q-card class="q-mb-lg" v-if="application.pets && application.pets.length > 0">
          <q-card-section class="bg-teal text-white">
            <div class="text-h6">
              <q-icon name="pets" class="q-mr-sm" />
              Pets ({{ application.pets.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div v-for="(pet, index) in application.pets" :key="index" class="col-12 col-md-6">
                <div class="pet-item">
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    {{ pet.name || `Pet ${index + 1}` }}
                  </div>
                  <div class="text-body2">{{ pet.type }} - {{ pet.breed }}</div>
                  <div class="text-caption text-grey-6">
                    Age: {{ pet.age }} years • Weight: {{ pet.weight }} lbs
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Co-Applicants -->
        <q-card
          class="q-mb-lg"
          v-if="application.co_applicants && application.co_applicants.length > 0"
        >
          <q-card-section class="bg-purple text-white">
            <div class="text-h6">
              <q-icon name="group" class="q-mr-sm" />
              Co-Applicants ({{ application.co_applicants.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div
              v-for="(coApplicant, index) in application.co_applicants"
              :key="index"
              class="co-applicant-item q-mb-md"
            >
              <div class="text-subtitle2 text-weight-medium q-mb-sm">
                Co-Applicant {{ index + 1 }}
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="detail-label">Name</div>
                  <div class="detail-value">
                    {{ coApplicant.first_name }} {{ coApplicant.middle_name }}
                    {{ coApplicant.last_name }}
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="detail-label">Email</div>
                  <div class="detail-value">{{ coApplicant.email }}</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="detail-label">Relationship</div>
                  <div class="detail-value">{{ coApplicant.relationship || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Documents -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="description" class="q-mr-sm" />
                Supporting Documents ({{ application.documents?.length || 0 }})
              </div>
              <q-btn
                flat
                dense
                color="white"
                icon="add"
                label="Add Document"
                @click="showAddDocumentDialog = true"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div
              v-if="!application.documents || application.documents.length === 0"
              class="text-center q-pa-md text-grey-6"
            >
              <q-icon name="description" size="64px" color="grey-4" />
              <div class="text-body2 q-mt-sm">No documents uploaded yet</div>
              <div class="text-caption">Click "Add Document" to upload supporting documents</div>
            </div>
            <q-list v-else separator>
              <q-item v-for="(doc, index) in application.documents" :key="index">
                <q-item-section avatar>
                  <q-icon name="insert_drive_file" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption v-if="doc.description">{{ doc.description }}</q-item-label>
                  <q-item-label caption>{{ doc.file_name }}</q-item-label>
                  <q-item-label caption v-if="doc.uploaded_at">
                    Uploaded: {{ formatDate(doc.uploaded_at) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    color="primary"
                    icon="download"
                    @click="downloadDocument(doc.url)"
                  >
                    <q-tooltip>Download</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Additional Notes -->
        <q-card class="q-mb-lg" v-if="application.additional_notes">
          <q-card-section class="bg-grey-3">
            <div class="text-h6">
              <q-icon name="notes" class="q-mr-sm" />
              Additional Notes
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-body1">{{ application.additional_notes }}</div>
          </q-card-section>
        </q-card>

        <!-- Action Buttons -->
        <div class="row justify-center q-gutter-md q-mt-xl">
          <q-btn
            flat
            label="Print Application"
            color="primary"
            icon="print"
            @click="printApplication"
          />
        </div>
      </div>
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
              :rules="[(val) => !!val || 'Document name is required']"
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
              :rules="[(val) => !!val || 'File is required']"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint> Max file size: 10MB </template>
            </q-file>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeAddDocumentDialog" />
          <q-btn
            label="Upload"
            color="primary"
            @click="uploadDocument"
            :disable="!newDocument.name || !newDocument.file"
            :loading="uploadingDocument"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Start Date Dialog -->
    <q-dialog v-model="showStartDateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">
            <q-icon name="event" class="q-mr-sm" />
            Set Lease Start Date
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-md">
            Please select the actual lease start date for this application.
          </div>
          <q-input
            v-model="leaseStartDate"
            label="Lease Start Date *"
            outlined
            dense
            type="date"
            hint="Select the date when the tenant will move in"
            :rules="[(val) => !!val || 'Start date is required']"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_today" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeStartDateDialog" />
          <q-btn
            label="Confirm & Approve"
            color="positive"
            icon="check_circle"
            @click="confirmApproval"
            :disable="!leaseStartDate"
            :loading="approving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

  <!-- Layout Version (with MainLayout) -->
  <q-page v-else padding>
    <div class="page-container">
      <!-- Page Header for Layout Version -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none">Application Review</h4>
            <p class="text-subtitle1 text-grey-7 q-mt-sm">Detailed application information</p>
          </div>
          <div>
            <q-btn
              v-if="application && application.lease_id"
              flat
              label="View Lease"
              color="primary"
              icon="description"
              @click="navigateToLease"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-mt-md">Loading application details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error_outline" size="100px" color="negative" />
        <div class="text-h6 q-mt-md text-negative">{{ error }}</div>
        <q-btn flat label="Go Back" color="primary" class="q-mt-md" @click="$router.push('/leases')" />
      </div>

      <!-- Application Content - same contentstructure as standalone without success header -->
      <div v-else-if="application">
        <!-- Application Status -->
        <q-card class="q-mb-lg status-card">
          <q-card-section class="bg-info text-white">
            <div class="text-h6">
              <q-icon name="info" class="q-mr-sm" />
              Application Status
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row items-center justify-center q-gutter-md">
              <q-chip :color="getStatusColor(application.status)" text-color="white" size="lg">
                <q-icon name="verified" class="q-mr-sm" />
                {{ application.status || 'Pending' }}
              </q-chip>
            </div>
            <div class="text-center q-mt-md text-body2 text-grey-7">
              We will review your application and contact you within 2-3 business days.
            </div>

            <!-- Action Buttons (for property managers/owners) -->
            <div
              v-if="application.status === 'pending' || application.status === 'under review'"
              class="row justify-center q-gutter-md q-mt-lg"
            >
              <q-btn
                color="positive"
                icon="check_circle"
                label="Approve Application"
                @click="openStartDateDialog"
                :loading="approving"
                class="action-btn"
              />
              <q-btn
                color="negative"
                icon="cancel"
                label="Reject Application"
                @click="confirmRejectApplication"
                :loading="rejecting"
                class="action-btn"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Application Info - Submitted Date and ID -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-body2 text-grey-6">
              Application ID: <strong>{{ application.id }}</strong>
            </div>
            <div class="text-body2 text-grey-6">
              Submitted: {{ formatDateTime(application.submitted_at) }}
            </div>
          </q-card-section>
        </q-card>

        <!-- Property & Lease Information -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="home" class="q-mr-sm" />
              Property & Lease Information
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12" v-if="propertyData">
                <div class="text-h6 text-primary">
                  {{ propertyData.displayName || propertyData.address }}
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Desired Move-in Date</div>
                <div class="detail-value">{{ formatDate(application.desired_move_in_date) }}</div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Lease Term</div>
                <div class="detail-value">{{ application.lease_term_months }} months</div>
              </div>

              <div class="col-12 col-md-4">
                <div class="detail-label">Number of Occupants</div>
                <div class="detail-value">{{ application.number_of_occupants }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Applicant Information -->
        <q-card class="q-mb-lg" v-if="application.applicant">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">
              <q-icon name="person" class="q-mr-sm" />
              Main Applicant Information
            </div>
          </q-card-section>
          <q-card-section>
            <!-- Personal Information -->
            <div class="section-subtitle">Personal Details</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">
                  {{ application.applicant.first_name }} {{ application.applicant.middle_name }}
                  {{ application.applicant.last_name }}
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Gender</div>
                <div class="detail-value">{{ application.applicant.gender || 'N/A' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Date of Birth</div>
                <div class="detail-value">
                  {{ formatDate(application.applicant.date_of_birth) }}
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="section-subtitle">Contact Information</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="detail-label">Email</div>
                <div class="detail-value">
                  <a :href="`mailto:${application.applicant.email}`">{{
                    application.applicant.email
                  }}</a>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="detail-label">Phone</div>
                <div class="detail-value">
                  <a :href="`tel:${application.applicant.phone}`">{{
                    application.applicant.phone
                  }}</a>
                </div>
              </div>
            </div>

            <!-- Current Address -->
            <div class="section-subtitle">Current Address</div>
            <div class="row q-col-gutter-md q-mb-md" v-if="application.applicant.current_address">
              <div class="col-12 col-md-6">
                <div class="detail-label">Address</div>
                <div class="detail-value">
                  {{ application.applicant.current_address.street }},
                  {{ application.applicant.current_address.city }},
                  {{ application.applicant.current_address.state }}
                  {{ application.applicant.current_address.zip }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Current Rent</div>
                <div class="detail-value">
                  ${{ formatAmount(application.applicant.current_address.monthly_rent) }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Landlord</div>
                <div class="detail-value">
                  {{ application.applicant.current_address.landlord_name || 'N/A' }}
                </div>
              </div>
            </div>

            <!-- Employment Information -->
            <div class="section-subtitle">Employment Information</div>
            <div class="row q-col-gutter-md" v-if="application.applicant.employment">
              <div class="col-12 col-md-4">
                <div class="detail-label">Employer</div>
                <div class="detail-value">{{ application.applicant.employment.employer_name }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Job Title</div>
                <div class="detail-value">{{ application.applicant.employment.job_title }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="detail-label">Monthly Income</div>
                <div class="detail-value">
                  ${{ formatAmount(application.applicant.employment.monthly_income) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vehicles -->
        <q-card class="q-mb-lg" v-if="application.vehicles && application.vehicles.length > 0">
          <q-card-section class="bg-indigo text-white">
            <div class="text-h6">
              <q-icon name="directions_car" class="q-mr-sm" />
              Vehicles ({{ application.vehicles.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="(vehicle, index) in application.vehicles"
                :key="index"
                class="col-12 col-md-6"
              >
                <div class="vehicle-item">
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    Vehicle {{ index + 1 }}
                  </div>
                  <div class="text-body2">
                    {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                  </div>
                  <div class="text-caption text-grey-6">
                    Color: {{ vehicle.color }} • Plate: {{ vehicle.license_plate }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pets -->
        <q-card class="q-mb-lg" v-if="application.pets && application.pets.length > 0">
          <q-card-section class="bg-teal text-white">
            <div class="text-h6">
              <q-icon name="pets" class="q-mr-sm" />
              Pets ({{ application.pets.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div v-for="(pet, index) in application.pets" :key="index" class="col-12 col-md-6">
                <div class="pet-item">
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    {{ pet.name || `Pet ${index + 1}` }}
                  </div>
                  <div class="text-body2">{{ pet.type }} - {{ pet.breed }}</div>
                  <div class="text-caption text-grey-6">
                    Age: {{ pet.age }} years • Weight: {{ pet.weight }} lbs
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Co-Applicants -->
        <q-card
          class="q-mb-lg"
          v-if="application.co_applicants && application.co_applicants.length > 0"
        >
          <q-card-section class="bg-purple text-white">
            <div class="text-h6">
              <q-icon name="group" class="q-mr-sm" />
              Co-Applicants ({{ application.co_applicants.length }})
            </div>
          </q-card-section>
          <q-card-section>
            <div
              v-for="(coApplicant, index) in application.co_applicants"
              :key="index"
              class="co-applicant-item q-mb-md"
            >
              <div class="text-subtitle2 text-weight-medium q-mb-sm">
                Co-Applicant {{ index + 1 }}
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="detail-label">Name</div>
                  <div class="detail-value">
                    {{ coApplicant.first_name }} {{ coApplicant.middle_name }}
                    {{ coApplicant.last_name }}
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="detail-label">Email</div>
                  <div class="detail-value">{{ coApplicant.email }}</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="detail-label">Relationship</div>
                  <div class="detail-value">{{ coApplicant.relationship || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Documents -->
        <q-card class="q-mb-lg">
          <q-card-section class="bg-deep-orange text-white">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="description" class="q-mr-sm" />
                Supporting Documents ({{ application.documents?.length || 0 }})
              </div>
              <q-btn
                flat
                dense
                color="white"
                icon="add"
                label="Add Document"
                @click="showAddDocumentDialog = true"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div
              v-if="!application.documents || application.documents.length === 0"
              class="text-center q-pa-md text-grey-6"
            >
              <q-icon name="description" size="64px" color="grey-4" />
              <div class="text-body2 q-mt-sm">No documents uploaded yet</div>
              <div class="text-caption">Click "Add Document" to upload supporting documents</div>
            </div>
            <q-list v-else separator>
              <q-item v-for="(doc, index) in application.documents" :key="index">
                <q-item-section avatar>
                  <q-icon name="insert_drive_file" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.name }}</q-item-label>
                  <q-item-label caption v-if="doc.description">{{ doc.description }}</q-item-label>
                  <q-item-label caption>{{ doc.file_name }}</q-item-label>
                  <q-item-label caption v-if="doc.uploaded_at">
                    Uploaded: {{ formatDate(doc.uploaded_at) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    color="primary"
                    icon="download"
                    @click="downloadDocument(doc.url)"
                  >
                    <q-tooltip>Download</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Additional Notes -->
        <q-card class="q-mb-lg" v-if="application.additional_notes">
          <q-card-section class="bg-grey-3">
            <div class="text-h6">
              <q-icon name="notes" class="q-mr-sm" />
              Additional Notes
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-body1">{{ application.additional_notes }}</div>
          </q-card-section>
        </q-card>

        <!-- Action Buttons -->
        <div class="row justify-center q-gutter-md q-mt-xl">
          <q-btn
            flat
            label="Print Application"
            color="primary"
            icon="print"
            @click="printApplication"
          />
        </div>
      </div>
    </div>

    <!-- Shared Dialogs -->
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
              :rules="[(val) => !!val || 'Document name is required']"
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
              :rules="[(val) => !!val || 'File is required']"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint> Max file size: 10MB </template>
            </q-file>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeAddDocumentDialog" />
          <q-btn
            label="Upload"
            color="primary"
            @click="uploadDocument"
            :disable="!newDocument.name || !newDocument.file"
            :loading="uploadingDocument"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Start Date Dialog -->
    <q-dialog v-model="showStartDateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">
            <q-icon name="event" class="q-mr-sm" />
            Set Lease Start Date
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-md">
            Please select the actual lease start date for this application.
          </div>
          <q-input
            v-model="leaseStartDate"
            label="Lease Start Date *"
            outlined
            dense
            type="date"
            hint="Select the date when the tenant will move in"
            :rules="[(val) => !!val || 'Start date is required']"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_today" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeStartDateDialog" />
          <q-btn
            label="Confirm & Approve"
            color="positive"
            icon="check_circle"
            @click="confirmApproval"
            :disable="!leaseStartDate"
            :loading="approving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'

const route = useRoute()
const router = useRouter()
const { getDocument, updateDocument, uploadImagesWithDetails } = useFirebase()

// Determine if page is within MainLayout based on route meta
const isWithinLayout = computed(() => {
  // Check if route is in private (MainLayout) or public (GuestLayout)
  // isPrivate = MainLayout with sidebar (logged in users)
  // isPublic = GuestLayout without sidebar (applicants)
  return route.meta.isPrivate === true
})

// State
const application = ref(null)
const propertyData = ref(null)
const loading = ref(false)
const error = ref(null)

// Document upload state
const showAddDocumentDialog = ref(false)
const uploadingDocument = ref(false)
const newDocument = ref({
  name: '',
  description: '',
  file: null,
})

// Application action states
const approving = ref(false)
const rejecting = ref(false)
const showStartDateDialog = ref(false)
const leaseStartDate = ref('')

// Format helpers
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate ? date.toDate() : date
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate ? date.toDate() : date
    return dateObj.toLocaleString()
  } catch {
    return 'Invalid Date'
  }
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    'under review': 'blue',
  }
  return colors[status?.toLowerCase()] || 'grey'
}

// Fetch application data
const fetchApplicationData = async (applicationId) => {
  loading.value = true
  error.value = null

  try {
    console.log('Fetching application data for ID:', applicationId)
    const appDoc = await getDocument(`lease_applications/${applicationId}`)

    if (!appDoc) {
      error.value = 'Application not found.'
      return
    }

    application.value = appDoc

    // Fetch property details if property_id exists
    if (appDoc.property_id) {
      try {
        const propertyId =
          typeof appDoc.property_id === 'string' ? appDoc.property_id : appDoc.property_id.id
        const propDoc = await getDocument(`properties/${propertyId}`)
        propertyData.value = propDoc
      } catch (propError) {
        console.error('Error fetching property data:', propError)
        // Continue even if property fetch fails
      }
    }

    console.log('Application data loaded:', application.value)
  } catch (err) {
    console.error('Error fetching application data:', err)
    error.value = 'Failed to load application details.'
  } finally {
    loading.value = false
  }
}

// Download document
const downloadDocument = (url) => {
  window.open(url, '_blank')
}

// Print application
const printApplication = () => {
  window.print()
}

// Navigate to lease
const navigateToLease = () => {
  if (application.value && application.value.lease_id) {
    // Navigate to leases page (works from both standalone and layout versions)
    router.push('/leases')
  }
}

// File rejected handler
const onFileRejected = () => {
  Notify.create({
    type: 'negative',
    message: 'File rejected. Please check file size and type.',
    position: 'top',
  })
}

// Close add document dialog
const closeAddDocumentDialog = () => {
  showAddDocumentDialog.value = false
  newDocument.value = {
    name: '',
    description: '',
    file: null,
  }
}

// Upload document
const uploadDocument = async () => {
  if (!newDocument.value.name || !newDocument.value.file) {
    Notify.create({
      type: 'warning',
      message: 'Please provide document name and file',
      position: 'top',
    })
    return
  }

  uploadingDocument.value = true

  try {
    console.log('Uploading document...')

    // Upload file to Firebase Storage
    const files = [newDocument.value.file]
    const uploadPath = `lease_applications/${application.value.id}/documents`
    const uploadResults = await uploadImagesWithDetails(files, uploadPath)

    // Prepare document data
    const documentData = {
      name: newDocument.value.name,
      description: newDocument.value.description,
      url: uploadResults[0].url,
      storage_path: uploadResults[0].storagePath,
      file_name: uploadResults[0].fileName,
      uploaded_at: new Date().toISOString(),
    }

    // Get existing documents or initialize empty array
    const existingDocuments = application.value.documents || []

    // Add new document to the array
    const updatedDocuments = [...existingDocuments, documentData]

    // Update application in Firestore
    await updateDocument('lease_applications', application.value.id, {
      documents: updatedDocuments,
      updated_at: new Date().toISOString(),
    })

    // Update local application data
    application.value.documents = updatedDocuments

    Notify.create({
      type: 'positive',
      message: 'Document uploaded successfully!',
      position: 'top',
    })

    console.log('Document uploaded successfully')

    // Close dialog and reset form
    closeAddDocumentDialog()
  } catch (err) {
    console.error('Error uploading document:', err)
    Notify.create({
      type: 'negative',
      message: 'Failed to upload document. Please try again.',
      position: 'top',
    })
  } finally {
    uploadingDocument.value = false
  }
}

// Open start date dialog
const openStartDateDialog = () => {
  // Set default date to the desired move-in date if available
  if (application.value?.desired_move_in_date) {
    const date = new Date(application.value.desired_move_in_date)
    leaseStartDate.value = date.toISOString().split('T')[0]
  } else {
    // Default to today
    leaseStartDate.value = new Date().toISOString().split('T')[0]
  }
  showStartDateDialog.value = true
}

// Close start date dialog
const closeStartDateDialog = () => {
  showStartDateDialog.value = false
  leaseStartDate.value = ''
}

// Confirm approval with start date
const confirmApproval = async () => {
  if (!leaseStartDate.value) {
    Notify.create({
      type: 'warning',
      message: 'Please select a start date',
      position: 'top',
    })
    return
  }

  showStartDateDialog.value = false
  await approveApplication()
}

// Approve application
const approveApplication = async () => {
  if (!application.value || !application.value.lease_id) {
    Notify.create({
      type: 'negative',
      message: 'Cannot approve: No lease ID found in application',
      position: 'top',
    })
    return
  }

  approving.value = true

  try {
    console.log('Approving application...')

    const leaseId = application.value.lease_id
    const applicationId = application.value.id

    // Prepare tenant data (copy from application)
    const tenantData = {
      // Application reference
      application_id: applicationId,

      // Main applicant information
      applicant: application.value.applicant,

      // Co-applicants
      co_applicants: application.value.co_applicants || [],

      // Vehicles
      vehicles: application.value.vehicles || [],

      // Pets
      pets: application.value.pets || [],

      // Additional info
      number_of_occupants: application.value.number_of_occupants,
      desired_move_in_date: application.value.desired_move_in_date,
      lease_term_months: application.value.lease_term_months,
      additional_notes: application.value.additional_notes,

      // Tenant status
      tenant_status: 'active',
      move_in_date: leaseStartDate.value, // Use the selected start date

      // Metadata
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    // Add tenant to lease's tenants subcollection
    const tenantRef = doc(collection(db, 'leases', leaseId, 'tenants'), applicationId)
    await setDoc(tenantRef, tenantData)

    console.log('Tenant data added to lease subcollection')

    // Copy application documents to lease
    if (application.value.documents && application.value.documents.length > 0) {
      console.log('Copying application documents to lease...')

      // Get current lease to check for existing documents
      const leaseDoc = await getDocument(`leases/${leaseId}`)
      const existingDocuments = leaseDoc?.documents || []

      // Add application documents with metadata
      const applicationDocuments = application.value.documents.map((doc) => ({
        ...doc,
        source: 'application',
        application_id: applicationId,
        copied_at: new Date().toISOString(),
        category: doc.category || 'Application Documents',
      }))

      // Merge with existing documents
      const mergedDocuments = [...existingDocuments, ...applicationDocuments]

      // Update lease with merged documents
      await updateDocument('leases', leaseId, {
        documents: mergedDocuments,
      })

      console.log(`Copied ${applicationDocuments.length} documents to lease`)
    }

    // Update application status to approved
    await updateDocument('lease_applications', applicationId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Update lease status to "Rented" and set start_date
    await updateDocument('leases', leaseId, {
      status: 'Rented',
      start_date: leaseStartDate.value, // Save the start date to the lease
      rented_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    console.log('Lease status updated to Rented with start date')

    // Update local application data
    application.value.status = 'approved'
    application.value.approved_at = new Date().toISOString()

    const documentsCount = application.value.documents?.length || 0
    const caption =
      documentsCount > 0
        ? `Tenant data and ${documentsCount} document(s) added. Lease starts on ${formatDate(leaseStartDate.value)}`
        : `Tenant data added and lease starts on ${formatDate(leaseStartDate.value)}`

    Notify.create({
      type: 'positive',
      message: 'Application approved successfully!',
      caption: caption,
      position: 'top',
    })

    console.log('Application approved successfully')
  } catch (err) {
    console.error('Error approving application:', err)
    Notify.create({
      type: 'negative',
      message: 'Failed to approve application. Please try again.',
      position: 'top',
    })
  } finally {
    approving.value = false
  }
}

// Confirm reject application
const confirmRejectApplication = () => {
  Notify.create({
    type: 'warning',
    message: 'Are you sure you want to reject this application?',
    actions: [
      {
        label: 'Cancel',
        color: 'white',
        handler: () => {
          // Do nothing
        },
      },
      {
        label: 'Reject',
        color: 'negative',
        handler: () => {
          rejectApplication()
        },
      },
    ],
    timeout: 0,
    position: 'center',
  })
}

// Reject application
const rejectApplication = async () => {
  if (!application.value) {
    return
  }

  rejecting.value = true

  try {
    console.log('Rejecting application...')

    // Update application status to rejected
    await updateDocument('lease_applications', application.value.id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Update local application data
    application.value.status = 'rejected'
    application.value.rejected_at = new Date().toISOString()

    Notify.create({
      type: 'positive',
      message: 'Application has been rejected',
      position: 'top',
    })

    console.log('Application rejected successfully')
  } catch (err) {
    console.error('Error rejecting application:', err)
    Notify.create({
      type: 'negative',
      message: 'Failed to reject application. Please try again.',
      position: 'top',
    })
  } finally {
    rejecting.value = false
  }
}

onMounted(async () => {
  const applicationId = route.params.applicationId
  if (!applicationId) {
    error.value = 'No application ID provided.'
    Notify.create({
      type: 'warning',
      message: 'No application ID provided',
    })
    return
  }

  await fetchApplicationData(applicationId)
})
</script>

<style scoped>
.application-detail-standalone {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.top-nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 24px 24px;
}

.page-header h4 {
  color: #1a1a1a;
  font-weight: 600;
}

.success-header {
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 32px;
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

.status-card {
  border: 2px solid #21ba45;
  box-shadow: 0 4px 12px rgba(33, 186, 69, 0.2);
}

.detail-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1rem;
  color: #333;
  word-break: break-word;
}

.detail-value a {
  color: #1976d2;
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.section-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 16px;
  margin-top: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.section-subtitle:first-child {
  margin-top: 0;
}

.vehicle-item,
.pet-item,
.co-applicant-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

/* Print styles */
@media print {
  .q-page {
    padding: 20px !important;
  }

  button {
    display: none !important;
  }

  .success-header {
    background: white !important;
    border: 1px solid #ddd;
  }

  .animate-success {
    animation: none;
  }

  .status-card {
    border: 1px solid #ddd;
    box-shadow: none;
  }

  .bg-primary,
  .bg-secondary,
  .bg-indigo,
  .bg-teal,
  .bg-purple,
  .bg-deep-orange,
  .bg-info,
  .bg-grey-3 {
    background: white !important;
    color: black !important;
    border-bottom: 2px solid #333;
  }
}

/* Action buttons */
.action-btn {
  min-width: 180px;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .top-nav-bar {
    padding: 12px 16px;
  }

  .nav-title {
    font-size: 1rem;
  }

  .nav-right .q-btn {
    font-size: 0.85rem;
  }

  .page-container {
    padding: 0 16px 16px 16px;
  }

  .success-header {
    padding: 30px 15px;
  }

  .text-h4 {
    font-size: 1.5rem;
  }

  .action-btn {
    min-width: 140px;
    font-size: 0.9rem;
  }
}

/* Print - hide navigation bar */
@media print {
  .top-nav-bar {
    display: none !important;
  }
}
</style>
