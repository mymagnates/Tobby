<template>
  <div
    class="create-property animate-fade-in"
    :class="{ 'create-property--dialog': inDialog }"
  >
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 q-ma-none">Create New Property</h4>
          <p class="text-subtitle1 text-grey-7 q-mt-sm">
            Set up the address, management context, and property specs in one flow.
          </p>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Cancel"
            class="top-action-btn"
            @click="emit('cancel')"
          />
          <q-btn
            type="submit"
            form="create-property-form"
            unelevated
            color="primary"
            text-color="white"
            label="Save"
            class="top-action-btn"
            :loading="loading"
            :disable="Boolean(gateBlockMessage)"
          />
        </div>
      </div>
    </div>

    <q-form id="create-property-form" @submit="onSubmit" class="q-gutter-md">
      <q-card class="q-mb-lg">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="home" class="q-mr-sm" />
            Basic Information
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="propertyData.address"
                label="Address *"
                outlined
                :rules="[(val) => !!val || 'Address is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="propertyData.nickname"
                label="Nickname *"
                outlined
                :rules="[(val) => !!val || 'Nickname is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="propertyData.city"
                label="City *"
                outlined
                :rules="[(val) => !!String(val || '').trim() || 'City is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="propertyData.state"
                label="State *"
                outlined
                :rules="[(val) => !!String(val || '').trim() || 'State is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="map" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="propertyData.zip"
                label="ZIP *"
                outlined
                :rules="[(val) => !!String(val || '').trim() || 'ZIP is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="pin" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="propertyData.type"
                :options="propertyTypes"
                label="Property Type *"
                outlined
                :rules="[(val) => !!val || 'Property type is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="propertyData.status"
                :options="propertyStatuses"
                label="Status *"
                outlined
                :rules="[(val) => !!val || 'Status is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="flag" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">
            <q-icon name="groups" class="q-mr-sm" />
            Ownership Setup
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-select
                v-model="propertyData.ownershipMode"
                :options="ownershipModes"
                label="Ownership Setup *"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Ownership setup is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="manage_accounts" />
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">
                Choose whether this property is your own asset or one you manage for another owner.
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section class="bg-info text-white">
          <div class="text-h6">
            <q-icon name="settings" class="q-mr-sm" />
            Property Specifications
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div v-if="showSpecField('story')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.story"
                label="Stories"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="layers" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('bedroom')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.bedroom"
                label="Bedrooms"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="bed" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('full_bathroom')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.full_bathroom"
                label="Full Bathrooms"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="bathroom" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('restroom')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.restroom"
                label="Restrooms"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="wc" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('half_bathroom')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.half_bathroom"
                label="Half Bathrooms"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="bathroom" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('kitchen')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.kitchen"
                label="Kitchens"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="kitchen" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('living_room')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.living_room"
                label="Living Rooms"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="weekend" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('dinning_area')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.dinning_area"
                label="Dining Areas"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="restaurant" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('office')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.office"
                label="Offices"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('garage')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.garage"
                label="Garage Spaces"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="garage" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('size')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.size"
                label="Size (sq ft)"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="square_foot" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('lot_size')" class="col-12 col-md-4">
              <q-input
                v-model.number="propertyData.spec.lot_size"
                label="Lot Size (sq ft)"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="crop_square" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('hoa')" class="col-12 col-md-6">
              <q-input
                v-model="propertyData.spec.hoa_name"
                label="HOA Name"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" />
                </template>
              </q-input>
            </div>
            <div v-if="showSpecField('hoa')" class="col-12 col-md-6">
              <q-input
                v-model="propertyData.spec.hoa_contact"
                label="HOA Contact"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="contact_phone" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="gateBlockMessage"
        class="bg-orange-1 text-orange-10 q-mt-md"
        rounded
      >
        <q-icon name="lock" class="q-mr-xs" />
        {{ gateBlockMessage }}
      </q-banner>
    </q-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { billingApi } from '../services/webApiClient'
import { generateOwnerInviteToken, createOwnerInviteExpiry, buildOwnerInviteUrl } from '../utils/ownerInviteUtils'

const props = defineProps({
  autoNavigate: {
    type: Boolean,
    default: true,
  },
  inDialog: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['property-created', 'cancel'])
const router = useRouter()
const $q = useQuasar()
const userDataStore = useUserDataStore()

const { createDocument, loading, userId } = useFirebase()
const gateBlockMessage = ref('')

const propertyData = reactive({
  address: '',
  city: '',
  state: '',
  zip: '',
  nickname: '',
  type: '',
  status: 'Active',
  spec: {
    type: 'Single Family',
    story: 1,
    bedroom: 3,
    full_bathroom: 2,
    restroom: 2,
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
  ownershipMode: 'self_owned',
})

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


const ownershipModes = [
  { label: 'This is my property', value: 'self_owned' },
  { label: 'I manage this for another owner', value: 'managed_for_owner' },
]

const propertyTypeKey = computed(() => String(propertyData.type || '').toLowerCase())

const showSpecField = (field) => {
  const type = propertyTypeKey.value
  const isResidential = ['single family', 'townhouse', 'condo', 'apartment'].includes(type)
  const isCommercial = ['office building', 'retail space', 'warehouse'].includes(type)
  const isLand = type === 'land'

  if (['bedroom', 'full_bathroom', 'half_bathroom', 'living_room', 'dinning_area', 'garage'].includes(field)) {
    return isResidential
  }
  if (field === 'restroom') return !isLand
  if (field === 'office') return isCommercial
  if (field === 'kitchen') return isResidential || isCommercial
  if (field === 'hoa') return isResidential
  if (field === 'story') return !isLand
  if (field === 'size' || field === 'lot_size') return true
  return true
}

const refreshPropertyGate = async () => {
  gateBlockMessage.value = ''
  try {
    const usage = await billingApi.getUsage()
    const used = Math.max(
      Number(usage.properties_used || 0),
      Number(userDataStore.userAccessibleProperties.length || 0)
    )
    const limit = Number(usage.properties_limit || 0)
    if (limit > 0 && used >= limit) {
      gateBlockMessage.value = `Property limit reached (${used}/${limit}). Upgrade plan or buy add-on to create another property.`
    }
  } catch (error) {
    console.error('Failed to evaluate property gate:', error)
  }
}

onMounted(() => {
  refreshPropertyGate()
})

const onSubmit = async () => {
  try {
    await refreshPropertyGate()
    if (gateBlockMessage.value) {
      $q.notify({
        type: 'warning',
        message: gateBlockMessage.value,
        position: 'top',
      })
      return
    }

    const normalizedAddress = String(propertyData.address || '').trim()
    const normalizedCity = String(propertyData.city || '').trim()
    const normalizedState = String(propertyData.state || '').trim()
    const normalizedZip = String(propertyData.zip || '').trim()
    const ownershipMode = String(propertyData.ownershipMode || 'self_owned')

    const propertyId = await createDocument('properties', {
      address: normalizedAddress,
      city: normalizedCity,
      state: normalizedState,
      zip: normalizedZip,
      nickname: String(propertyData.nickname || '').trim(),
      type: propertyData.type,
      status: propertyData.status,
      spec: {
        ...propertyData.spec,
        type: propertyData.type,
      },
      equipments: [],
      ownership_mode: ownershipMode,
      owner_user_ids: ownershipMode === 'self_owned' && userId.value ? [userId.value] : [],
      manager_user_ids: userId.value ? [userId.value] : [],
      primary_owner_user_id:
        ownershipMode === 'self_owned' && userId.value ? userId.value : null,
      created_by_user_id: userId.value || null,
      updated_by_user_id: userId.value || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (userId.value) {
      const now = new Date()
      const dateString = now.toISOString().split('T')[0]

      await createDocument(`users/${userId.value}/roles`, {
        property_id: propertyId,
        user_id: userId.value,
        role: 'pm',
        role_date: dateString,
        expire_date: '',
        role_grant_by: userId.value,
        status: 'active',
        relationship_type: 'manager',
        invite_id: null,
        granted_by: userId.value,
        created_at: now,
        updated_at: now,
        createdAt: now,
        updatedAt: now,
      })

      if (ownershipMode === 'self_owned') {
        await createDocument(`users/${userId.value}/roles`, {
          property_id: propertyId,
          user_id: userId.value,
          role: 'po',
          role_date: dateString,
          expire_date: '',
          role_grant_by: userId.value,
          status: 'active',
          relationship_type: 'owner',
          invite_id: null,
          granted_by: userId.value,
          created_at: now,
          updated_at: now,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    // Reset form
    propertyData.address = ''
    propertyData.city = ''
    propertyData.state = ''
    propertyData.zip = ''
    propertyData.nickname = ''
    propertyData.type = 'Residential'
    propertyData.status = 'Active'
    propertyData.spec = {
      type: 'Single Family',
      story: 1,
      bedroom: 3,
      full_bathroom: 2,
      restroom: 2,
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
    }
    const inviteContext =
      ownershipMode === 'managed_for_owner'
        ? {
            canInviteOwner: true,
            createInviteLink: () => {
              const token = generateOwnerInviteToken()
              const inviteId = token.slice(0, 20)
              const now = new Date()
              return createDocument('owner_invites', {
                invite_id: inviteId,
                property_id: propertyId,
                pm_user_id: userId.value,
                owner_email: '',
                status: 'pending',
                token,
                expires_at: createOwnerInviteExpiry(),
                accepted_at: null,
                accepted_by_user_id: null,
                created_at: now,
                updated_at: now,
              }, inviteId).then(() => buildOwnerInviteUrl(token))
            },
          }
        : { canInviteOwner: false }

    propertyData.ownershipMode = 'self_owned'

    emit('property-created', { id: propertyId, ownership_mode: ownershipMode, ...inviteContext })

    if (props.autoNavigate) {
      // Route-mode usage keeps previous behavior.
      router.push('/my-properties')
    }
  } catch (error) {
    console.error('Error creating property:', error)
    const message = error?.message || 'Error creating property'
    $q.notify({
      type: 'negative',
      message,
      caption: error?.upgrade_hint || '',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.create-property {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0 8px 64px;
}

.create-property--dialog {
  max-width: none;
  max-height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.page-header {
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

:global(body.body--dark) .create-property .q-card,
:global(body.body--dark) .create-property .q-card__section:not(.bg-primary):not(.bg-secondary):not(.bg-info) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-property .bg-grey-1,
 :global(body.body--dark) .create-property .q-field__control {
  background: #223041 !important;
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
