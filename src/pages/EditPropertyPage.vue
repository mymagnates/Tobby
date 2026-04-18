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
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="propertyData.city"
                    label="City"
                    outlined
                    :rules="[(val) => !!String(val || '').trim() || 'City is required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="propertyData.state"
                    label="State"
                    outlined
                    :rules="[(val) => !!String(val || '').trim() || 'State is required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="propertyData.zip"
                    label="ZIP"
                    outlined
                    :rules="[(val) => !!String(val || '').trim() || 'ZIP is required']"
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

              <q-card class="q-mt-md" flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-sm">Your Role</div>
                  <div class="text-body2 text-grey-7 q-mb-md">
                    Select the roles you hold on this property. You can be both manager and owner.
                  </div>
                  <div class="column q-gutter-sm">
                    <q-checkbox
                      v-model="propertyData.currentRoles"
                      val="pm"
                      color="primary"
                      label="Property Manager (PM)"
                    />
                    <q-checkbox
                      v-model="propertyData.currentRoles"
                      val="po"
                      color="primary"
                      label="Property Owner / Co-Owner (PO)"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Property Specifications -->
              <q-card class="q-mt-md" flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Property Specifications</div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('story')"
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
                        v-if="showSpecField('bedroom')"
                        v-model.number="propertyData.spec.bedroom"
                        label="Bedrooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('full_bathroom')"
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
                        v-if="showSpecField('kitchen')"
                        v-model.number="propertyData.spec.kitchen"
                        label="Kitchens"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('living_room')"
                        v-model.number="propertyData.spec.living_room"
                        label="Living Rooms"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('dinning_area')"
                        v-model.number="propertyData.spec.dinning_area"
                        label="Dining Areas"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('office')"
                        v-model.number="propertyData.spec.office"
                        label="Offices"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('half_bathroom')"
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
                        v-if="showSpecField('garage')"
                        v-model.number="propertyData.spec.garage"
                        label="Garage Spaces"
                        type="number"
                        outlined
                        :rules="[(val) => val >= 0 || 'Must be 0 or greater']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('size')"
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
                        v-if="showSpecField('lot_size')"
                        v-model.number="propertyData.spec.lot_size"
                        label="Lot Size (sq ft)"
                        type="number"
                        outlined
                        :rules="[(val) => val > 0 || 'Must be greater than 0']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('hoa')"
                        v-model="propertyData.spec.hoa_name"
                        label="HOA Name"
                        outlined
                      />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="showSpecField('hoa')"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()
const { createDocument, deleteDocument } = useFirebase()

const propertyId = route.params.propertyId
const updating = ref(false)

// Property data structure
const propertyData = ref({
  address: '',
  city: '',
  state: '',
  zip: '',
  nickname: '',
  type: 'Residential',
  status: 'Active',
  currentRoles: ['pm'],
  spec: {
    type: 'Single Family',
    story: 1,
    bedroom: 3,
    full_bathroom: 2,
    kitchen: 1,
    living_room: 0,
    dinning_area: 0,
    office: 0,
    half_bathroom: 1,
    garage: 2,
    size: 1500,
    lot_size: 5000,
    hoa_name: '',
    hoa_contact: '',
  },
})

const parseLegacyAddress = (rawAddress) => {
  const text = String(rawAddress || '').trim()
  if (!text) return { city: '', state: '', zip: '' }

  const parts = text.split(',').map((item) => item.trim()).filter(Boolean)
  if (parts.length < 2) return { city: '', state: '', zip: '' }

  const city = parts.length >= 2 ? parts[parts.length - 2] : ''
  const stateZip = parts[parts.length - 1] || ''
  const match = stateZip.match(/^([A-Za-z]{2,})\s+(\S+)$/)
  if (match) {
    return {
      city,
      state: match[1],
      zip: match[2],
    }
  }
  return {
    city,
    state: stateZip,
    zip: '',
  }
}

const propertyTypes = [
  'Single Family',
  'Townhouse',
  'Condo',
  'Apartment',
  'Office Building',
  'Retail Space',
  'Warehouse',
  'Land',
]
const propertyStatuses = ['Active', 'Inactive']

const propertyTypeKey = computed(() => String(propertyData.value.type || '').toLowerCase())

const showSpecField = (field) => {
  const type = propertyTypeKey.value
  const isResidential = ['single family', 'townhouse', 'condo', 'apartment'].includes(type)
  const isCommercial = ['office building', 'retail space', 'warehouse'].includes(type)
  const isLand = type === 'land'

  if (['bedroom', 'full_bathroom', 'half_bathroom', 'living_room', 'dinning_area', 'garage'].includes(field)) {
    return isResidential
  }
  if (field === 'office') return isCommercial
  if (field === 'kitchen') return isResidential || isCommercial
  if (field === 'hoa') return isResidential
  if (field === 'story') return !isLand
  if (field === 'size' || field === 'lot_size') return true
  return true
}

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
    const userRoles = userDataStore.getUserRolesForProperty(propertyId) || []
    if (!userRole) {
      Notify.create({
        type: 'negative',
        message: 'You do not have access to edit this property',
        position: 'top',
      })
      router.push('/my-properties')
      return
    }

    const parsedLegacyAddress = parseLegacyAddress(property.address)

    // Populate form with existing data
    propertyData.value = {
      address: property.address || '',
      city: property.city || property.city_name || parsedLegacyAddress.city || '',
      state: property.state || property.state_code || parsedLegacyAddress.state || '',
      zip:
        property.zip ||
        property.zip_code ||
        property.zipCode ||
        property.postal_code ||
        parsedLegacyAddress.zip ||
        '',
      nickname: property.nickname || '',
      type: property.type || property.spec?.type || 'Single Family',
      status: property.status || 'Active',
      currentRoles: (() => {
        const roles = Array.from(new Set(
          userRoles
            .map((role) => String(role?.role || '').toLowerCase())
            .filter((role) => ['pm', 'po'].includes(role)),
        ))
        return roles.length ? roles : ['pm']
      })(),
      spec: {
        type: property.type || property.spec?.type || 'Single Family',
        story: property.spec?.story || 1,
        bedroom: property.spec?.bedroom || 3,
        full_bathroom: property.spec?.full_bathroom || 2,
        kitchen: property.spec?.kitchen || 1,
        living_room: property.spec?.living_room || property.spec?.meeting_room || 0,
        dinning_area: property.spec?.dinning_area || 0,
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
    const currentUserId = userDataStore.userId
    const rolesForProperty = userDataStore.getUserRolesForProperty(propertyId) || []
    const selectedRoles = Array.from(new Set(
      (propertyData.value.currentRoles || []).map((role) => String(role || '').toLowerCase()),
    )).filter((role) => ['pm', 'po'].includes(role))
    if (!selectedRoles.length) {
      Notify.create({
        type: 'warning',
        message: 'Select at least one role for this property.',
        position: 'top',
      })
      return
    }
    const wantsPmRole = selectedRoles.includes('pm')
    const wantsPoRole = selectedRoles.includes('po')
    const existingPmRole = rolesForProperty.find((role) => String(role?.role || '').toLowerCase() === 'pm')
    const existingPoRole = rolesForProperty.find((role) => String(role?.role || '').toLowerCase() === 'po')
    const property = userDataStore.getPropertyById(propertyId) || {}
    const existingOwnerIds = Array.isArray(property.owner_user_ids) ? property.owner_user_ids : []
    const existingManagerIds = Array.isArray(property.manager_user_ids) ? property.manager_user_ids : []
    const ownerIds = wantsPoRole && currentUserId
      ? [...new Set([...existingOwnerIds, currentUserId])]
      : existingOwnerIds.filter((ownerId) => ownerId !== currentUserId)
    const managerIds = wantsPmRole && currentUserId
      ? [...new Set([...existingManagerIds, currentUserId])]
      : existingManagerIds.filter((managerId) => managerId !== currentUserId)
    const nextPrimaryOwnerId =
      property.primary_owner_user_id === currentUserId && !wantsPoRole
        ? (ownerIds[0] || null)
        : (property.primary_owner_user_id || ownerIds[0] || (wantsPoRole ? currentUserId : null))

    // Update the property document
    await userDataStore.updateProperty(propertyId, {
      address: String(propertyData.value.address || '').trim(),
      city: String(propertyData.value.city || '').trim(),
      state: String(propertyData.value.state || '').trim(),
      zip: String(propertyData.value.zip || '').trim(),
      nickname: String(propertyData.value.nickname || '').trim(),
      type: propertyData.value.type,
      status: propertyData.value.status,
      spec: {
        ...propertyData.value.spec,
        type: propertyData.value.type,
      },
      ownership_mode: ownerIds.length > 0 ? 'self_owned' : 'managed_for_owner',
      owner_user_ids: ownerIds,
      manager_user_ids: managerIds,
      primary_owner_user_id: nextPrimaryOwnerId,
      updatedAt: new Date(),
    })

    if (currentUserId) {
      if (wantsPoRole && !existingPoRole) {
        const now = new Date()
        await createDocument(`users/${currentUserId}/roles`, {
          property_id: propertyId,
          user_id: currentUserId,
          role: 'po',
          role_date: now.toISOString().split('T')[0],
          expire_date: '',
          role_grant_by: currentUserId,
          status: 'active',
          relationship_type: 'owner',
          invite_id: null,
          granted_by: currentUserId,
          created_at: now,
          updated_at: now,
          createdAt: now,
          updatedAt: now,
        })
      }

      if (!wantsPoRole && existingPoRole?.id) {
        await deleteDocument(`users/${currentUserId}/roles`, existingPoRole.id)
      }

      if (wantsPmRole && !existingPmRole) {
        const now = new Date()
        await createDocument(`users/${currentUserId}/roles`, {
          property_id: propertyId,
          user_id: currentUserId,
          role: 'pm',
          role_date: now.toISOString().split('T')[0],
          expire_date: '',
          role_grant_by: currentUserId,
          status: 'active',
          relationship_type: 'manager',
          invite_id: null,
          granted_by: currentUserId,
          created_at: now,
          updated_at: now,
          createdAt: now,
          updatedAt: now,
        })
      }

      if (!wantsPmRole && existingPmRole?.id) {
        await deleteDocument(`users/${currentUserId}/roles`, existingPmRole.id)
      }
    }

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
