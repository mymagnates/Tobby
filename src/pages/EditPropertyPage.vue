<template>
  <q-page class="edit-property q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">Edit Property</div>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Basic Property Information -->
              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propertyData.address"
                    label="Address"
                    outlined
                    :rules="[(val) => !!val || 'Address is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="propertyData.nickname"
                    label="Property Nickname"
                    outlined
                    :rules="[(val) => !!val || 'Nickname is required']"
                  />
                </div>
              </div>

              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="propertyData.type"
                    :options="propertyTypes"
                    label="Property Type"
                    outlined
                    :rules="[(val) => !!val || 'Property type is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="propertyData.status"
                    :options="propertyStatuses"
                    label="Status"
                    outlined
                    :rules="[(val) => !!val || 'Status is required']"
                  />
                </div>
              </div>

              <!-- Property Specifications -->
              <q-card class="q-mt-md" flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Property Specifications</div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="propertyData.spec.type"
                        :options="specTypes"
                        label="Spec Type"
                        outlined
                        :rules="[(val) => !!val || 'Spec type is required']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.story"
                        label="Number of Stories"
                        type="number"
                        outlined
                        :rules="[(val) => val > 0 || 'Must be greater than 0']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.bedroom"
                        label="Bedrooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.full_bathroom"
                        label="Full Bathrooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.kitchen"
                        label="Kitchens"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.meeting_room"
                        label="Meeting Rooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.office"
                        label="Offices"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.half_bathroom"
                        label="Half Bathrooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.garage"
                        label="Garage Spaces"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.size"
                        label="Size (sq ft)"
                        type="number"
                        outlined
                        :rules="[(val) => val > 0 || 'Must be greater than 0']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="propertyData.spec.lot_size"
                        label="Lot Size (sq ft)"
                        type="number"
                        outlined
                        :rules="[(val) => val > 0 || 'Must be greater than 0']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="propertyData.spec.hoa_name" label="HOA Name" outlined />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="propertyData.spec.hoa_contact"
                        label="HOA Contact"
                        outlined
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Action Buttons -->
              <div class="row q-gutter-md q-mt-lg">
                <div class="col-12 col-md-6">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Update Property"
                    class="full-width"
                    :loading="updating"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-btn color="secondary" label="Cancel" class="full-width" @click="onCancel" />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()

const propertyId = route.params.propertyId
const updating = ref(false)

// Property data structure
const propertyData = ref({
  address: '',
  nickname: '',
  type: 'Residential',
  status: 'Active',
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

// Load existing property data
onMounted(async () => {
  if (!propertyId) {
    Notify.create({
      type: 'negative',
      message: 'Property ID is required',
      position: 'top',
    })
    router.push('/my-properties')
    return
  }

  try {
    const property = userDataStore.getPropertyById(propertyId)
    if (!property) {
      Notify.create({
        type: 'negative',
        message: 'Property not found',
        position: 'top',
      })
      router.push('/my-properties')
      return
    }

    // Check if user has access to this property
    const userRole = userDataStore.getUserRoleForProperty(propertyId)
    if (!userRole) {
      Notify.create({
        type: 'negative',
        message: 'You do not have access to edit this property',
        position: 'top',
      })
      router.push('/my-properties')
      return
    }

    // Populate form with existing data
    propertyData.value = {
      address: property.address || '',
      nickname: property.nickname || '',
      type: property.type || 'Residential',
      status: property.status || 'Active',
      spec: {
        type: property.spec?.type || 'Single Family',
        story: property.spec?.story || 1,
        bedroom: property.spec?.bedroom || 3,
        full_bathroom: property.spec?.full_bathroom || 2,
        kitchen: property.spec?.kitchen || 1,
        meeting_room: property.spec?.meeting_room || 0,
        office: property.spec?.office || 0,
        half_bathroom: property.spec?.half_bathroom || 1,
        garage: property.spec?.garage || 2,
        size: property.spec?.size || 1500,
        lot_size: property.spec?.lot_size || 5000,
        hoa_name: property.spec?.hoa_name || '',
        hoa_contact: property.spec?.hoa_contact || '',
      },
    }
  } catch (error) {
    console.error('Error loading property:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load property data',
      position: 'top',
    })
    router.push('/my-properties')
  }
})

const onSubmit = async () => {
  try {
    updating.value = true

    // Update the property document
    await userDataStore.updateProperty(propertyId, {
      address: propertyData.value.address,
      nickname: propertyData.value.nickname,
      type: propertyData.value.type,
      status: propertyData.value.status,
      spec: propertyData.value.spec,
      updatedAt: new Date(),
    })

    Notify.create({
      type: 'positive',
      message: 'Property updated successfully!',
      position: 'top',
    })

    // Navigate back to My Properties page
    router.push('/my-properties')
  } catch (error) {
    console.error('Error updating property:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update property. Please try again.',
      position: 'top',
    })
  } finally {
    updating.value = false
  }
}

const onCancel = () => {
  router.push('/my-properties')
}
</script>

<style scoped>
.edit-property {
  max-width: 800px;
  margin: 0 auto;
}
</style>
