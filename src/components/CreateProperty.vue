<template>
  <div class="create-property animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-weight-bold text-primary q-mb-sm">
          <q-icon name="home" class="q-mr-sm" />
          Create New Property
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-sm">
          <!-- Basic Information -->
          <div class="section-header">
            <div class="text-subtitle2 text-weight-medium text-grey-7 q-mb-xs">
              <q-icon name="info" size="14px" class="q-mr-xs" />
              Basic Information
            </div>
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model="propertyData.address"
              label="Address"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Address is required']"
              class="col-12 col-md-8"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="primary" />
              </template>
            </q-input>
            <q-input
              v-model="propertyData.nickname"
              label="Nickname"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Nickname is required']"
              class="col-12 col-md-4"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="label" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="row q-gutter-sm">
            <q-select
              v-model="propertyData.type"
              :options="propertyTypes"
              label="Property Type"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Property type is required']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
            <q-select
              v-model="propertyData.status"
              :options="propertyStatuses"
              label="Status"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Status is required']"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="flag" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Property Specifications -->
          <div class="section-header q-mt-md">
            <div class="text-subtitle2 text-weight-medium text-grey-7 q-mb-xs">
              <q-icon name="settings" size="14px" class="q-mr-xs" />
              Property Specifications
            </div>
          </div>

          <q-card class="specs-card q-pa-sm" flat>
            <div class="row q-gutter-sm">
              <q-select
                v-model="propertyData.spec.type"
                :options="specTypes"
                label="Spec Type"
                outlined
                dense
                class="col-12 col-md-6"
                bg-color="white"
              />
              <q-input
                v-model.number="propertyData.spec.story"
                label="Stories"
                type="number"
                outlined
                dense
                class="col-12 col-md-6"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="layers" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="row q-gutter-sm q-mt-sm">
              <q-input
                v-model.number="propertyData.spec.bedroom"
                label="Bedrooms"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="bed" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.full_bathroom"
                label="Full Bathrooms"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="bathroom" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.half_bathroom"
                label="Half Bathrooms"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="bathroom" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.kitchen"
                label="Kitchens"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="kitchen" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="row q-gutter-sm q-mt-sm">
              <q-input
                v-model.number="propertyData.spec.meeting_room"
                label="Meeting Rooms"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="meeting_room" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.office"
                label="Offices"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.garage"
                label="Garage Spaces"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="garage" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model.number="propertyData.spec.size"
                label="Size (sq ft)"
                type="number"
                outlined
                dense
                class="col-12 col-md-3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="square_foot" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="row q-gutter-sm q-mt-sm">
              <q-input
                v-model.number="propertyData.spec.lot_size"
                label="Lot Size (sq ft)"
                type="number"
                outlined
                dense
                class="col-12 col-md-6"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="crop_square" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model="propertyData.spec.hoa_name"
                label="HOA Name"
                outlined
                dense
                class="col-12 col-md-6"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="primary" />
                </template>
              </q-input>
            </div>

            <q-input
              v-model="propertyData.spec.hoa_contact"
              label="HOA Contact"
              outlined
              dense
              class="q-mt-sm"
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="contact_phone" color="primary" />
              </template>
            </q-input>
          </q-card>

          <q-select
            v-model="propertyData.userRole"
            :options="userRoles"
            label="Your Role in This Property"
            outlined
            dense
            required
            :rules="[(val) => !!val || 'Your role is required']"
            class="q-mt-md"
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Create Property"
              class="col-12 col-md-6"
              size="md"
              unelevated
            >
              <template v-slot:prepend>
                <q-icon name="add" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'

const emit = defineEmits(['property-created', 'cancel'])
const router = useRouter()

const { createDocument, loading, userId } = useFirebase()

const propertyData = reactive({
  address: '',
  nickname: '',
  type: 'Residential',
  status: 'Available',
  spec: {
    type: 'Single Family',
    story: 1,
    bedroom: 3,
    full_bathroom: 2,
    kitchen: 1,
    meeting_room: 0,
    office: 0,
    half_bathroom: 1,
    garage: 2,
    size: 1500,
    lot_size: 5000,
    hoa_name: '',
    hoa_contact: '',
  },
  userRole: '',
})

const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use']

const propertyStatuses = ['Active', 'Inactive']

const specTypes = [
  'Single Family',
  'Townhouse',
  'Condo',
  'Apartment',
  'Office Building',
  'Retail Space',
  'Warehouse',
  'Land',
]

const userRoles = ['Property Owner', 'Property Manager']

const onSubmit = async () => {
  try {
    const propertyId = await createDocument('properties', {
      address: propertyData.address,
      nickname: propertyData.nickname,
      type: propertyData.type,
      status: propertyData.status,
      spec: propertyData.spec,
      equipments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Save user-role-property relationship to user's roles subcollection
    if (userId.value) {
      const today = new Date()
      const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format

      await createDocument(`users/${userId.value}/roles`, {
        property_id: propertyId,
        user_id: userId.value,
        role: propertyData.userRole,
        role_date: dateString,
        expire_date: '', // Default to blank
        role_grant_by: 'System', // Auto-filled by UI
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Reset form
    propertyData.address = ''
    propertyData.nickname = ''
    propertyData.type = 'Residential'
    propertyData.status = 'Available'
    propertyData.spec = {
      type: 'Single Family',
      story: 1,
      bedroom: 3,
      full_bathroom: 2,
      kitchen: 1,
      meeting_room: 0,
      office: 0,
      half_bathroom: 1,
      garage: 2,
      size: 1500,
      lot_size: 5000,
      hoa_name: '',
      hoa_contact: '',
    }
    propertyData.userRole = ''

    emit('property-created', { id: propertyId, ...propertyData })

    // Navigate back to My Properties page
    router.push('/my-properties')
  } catch (error) {
    console.error('Error creating property:', error)
  }
}
</script>

<style scoped>
.create-property {
  max-width: 900px;
  margin: 0 auto;
}

.section-header {
  border-bottom: 1px solid var(--neutral-200);
  padding-bottom: 4px;
}

.specs-card {
  background: linear-gradient(135deg, var(--neutral-50) 0%, white 100%);
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius);
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
</style>
