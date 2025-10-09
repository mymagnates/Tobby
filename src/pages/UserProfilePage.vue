<template>
  <q-page class="q-pa-sm">
    <div class="user-profile-container">
      <!-- User Profile Header -->
      <q-card class="profile-header q-mb-sm">
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-gutter-sm">
            <div class="col-auto">
              <q-avatar size="60px" color="primary" text-color="white">
                <q-icon name="person" size="30px" />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-h6 q-mb-xs">{{ userProfile?.user_name || 'Loading...' }}</div>
              <div class="text-body2 text-grey-7 q-mb-xs">
                <q-icon name="email" size="14px" class="q-mr-xs" />
                {{ userProfile?.email || 'No email' }}
              </div>
              <div class="text-body2 text-grey-7 q-mb-xs" v-if="userProfile?.cellphone">
                <q-icon name="phone" size="14px" class="q-mr-xs" />
                {{ userProfile.cellphone }}
              </div>
              <div class="text-caption text-grey-6">
                User ID: {{ userProfile?.user_id || 'Unknown' }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- User Details -->
      <q-card class="user-details q-mb-sm">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle1 q-mb-sm">Personal Information</div>

          <!-- Name Fields in Same Row -->
          <div class="row q-mb-md" style="padding: 5px">
            <div class="col-12 col-md-4" style="padding: 5px">
              <q-input
                :model-value="userProfile?.first_name || ''"
                label="First Name"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-3" style="padding: 5px">
              <q-input
                :model-value="userProfile?.middle_name || ''"
                label="Middle Name"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4" style="padding: 5px">
              <q-input
                :model-value="userProfile?.last_name || ''"
                label="Last Name"
                outlined
                readonly
                dense
              />
            </div>
          </div>

          <!-- Additional Contact Information -->
          <div class="row q-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input
                :model-value="userProfile?.mobile_phone || ''"
                label="Mobile Phone Number"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-5">
              <q-input
                :model-value="userProfile?.email || ''"
                label="Email"
                outlined
                readonly
                dense
              />
            </div>
          </div>

          <div class="row q-gutter-sm q-mt-sm">
            <div class="col-12 col-md-6">
              <q-input
                :model-value="userProfile?.company_name || ''"
                label="Company Name"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :model-value="userProfile?.mailing_address || ''"
                label="Mailing Address"
                outlined
                readonly
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- User Roles Section -->
      <q-card>
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle1 q-mb-sm">
            My Roles
            <q-badge color="primary" class="q-ml-sm">{{ userRoles.length }}</q-badge>
            <q-btn
              color="primary"
              icon="add"
              label="Assign Role"
              size="sm"
              class="q-ml-sm"
              @click="showAssignRoleDialog = true"
            />
          </div>

          <div v-if="rolesLoading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
            <div class="text-grey-6 q-mt-sm">Loading roles...</div>
          </div>

          <div v-else-if="userRoles.length === 0" class="text-center q-pa-md">
            <q-icon name="work_off" size="50px" color="grey-4" />
            <div class="text-subtitle1 text-grey-6 q-mt-sm">No Roles Assigned</div>
            <div class="text-grey-6">You haven't been assigned any property roles yet.</div>
          </div>

          <div v-else class="row q-gutter-sm">
            <div v-for="role in userRoles" :key="role.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-card class="role-card" flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle1 q-mb-xs">{{ getPropertyName(role.property_id) }}</div>

                  <div class="q-mb-sm">
                    <q-chip
                      :color="getRoleColor(role.role)"
                      text-color="white"
                      size="sm"
                      class="q-mb-xs"
                    >
                      {{ role.role }}
                    </q-chip>
                  </div>

                  <div class="text-caption text-grey-6 q-mb-xs">
                    <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
                    <strong>Started:</strong> {{ formatDate(role.role_date) }}
                  </div>

                  <div class="text-caption text-grey-6 q-mb-xs" v-if="role.expire_date">
                    <q-icon name="event_busy" size="14px" class="q-mr-xs" />
                    <strong>Expires:</strong> {{ formatDate(role.expire_date) }}
                  </div>

                  <div class="text-caption text-grey-6 q-mb-xs" v-if="role.role_grant_by">
                    <q-icon name="verified_user" size="14px" class="q-mr-xs" />
                    <strong>Granted by:</strong> {{ role.role_grant_by }}
                  </div>

                  <div class="text-caption text-grey-6">
                    <q-icon name="access_time" size="14px" class="q-mr-xs" />
                    <strong>Created:</strong> {{ formatDate(role.createdAt) }}
                  </div>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn
                    flat
                    color="primary"
                    size="sm"
                    label="View Property"
                    @click="viewProperty(role.property_id)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Debug Info (remove in production) -->
      <q-card class="debug-info q-mt-lg" v-if="showDebug">
        <q-card-section>
          <div class="text-h6 q-mb-md">Debug Information</div>
          <pre>{{
            JSON.stringify({ userProfile, userRoles, loading, rolesLoading }, null, 2)
          }}</pre>

          <div class="q-mt-md">
            <q-btn color="primary" label="Reload Data" @click="reloadData" :loading="loading" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Assign Role Dialog -->
    <q-dialog v-model="showAssignRoleDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Assign Role to Property</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="assignRole" class="q-gutter-md">
            <q-select
              v-model="newRole.property_id"
              :options="availableProperties"
              option-label="nickname"
              option-value="id"
              label="Select Property"
              outlined
              :rules="[(val) => !!val || 'Property is required']"
              emit-value
              map-options
            />

            <q-select
              v-model="newRole.role"
              :options="roleOptions"
              label="Select Role"
              outlined
              :rules="[(val) => !!val || 'Role is required']"
            />

            <q-input
              v-model="newRole.role_date"
              label="Role Start Date"
              type="date"
              outlined
              :rules="[(val) => !!val || 'Date is required']"
              :model-value="newRole.role_date"
            />

            <q-input
              v-model="newRole.expire_date"
              label="Role Expiry Date (Optional)"
              type="date"
              outlined
              :model-value="newRole.expire_date"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAssignRoleDialog = false" />
          <q-btn
            unelevated
            label="Assign Role"
            color="primary"
            @click="assignRole"
            :loading="assigningRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useQuasar } from 'quasar'

const router = useRouter()
const userDataStore = useUserDataStore()
const $q = useQuasar()

// Computed properties
const userProfile = computed(() => userDataStore.userProfile)
const userRoles = computed(() => userDataStore.userRoles)
const loading = computed(() => userDataStore.loading)
const rolesLoading = computed(() => userDataStore.rolesLoading)

// Debug mode (set to false in production)
const showDebug = ref(true)

// Assign role dialog
const showAssignRoleDialog = ref(false)
const assigningRole = ref(false)
const newRole = ref({
  property_id: '',
  role: '',
  role_date: '',
  expire_date: '',
})

const roleOptions = ['Property Owner', 'Property Manager', 'Tenant', 'Contractor', 'Other']

// Available properties (properties that the user doesn't already have a role for)
const availableProperties = computed(() => {
  if (!userDataStore.properties.length) return []

  const userPropertyIds = userRoles.value.map((role) => role.property_id)
  return userDataStore.properties.filter((property) => !userPropertyIds.includes(property.id))
})

onMounted(() => {
  console.log('UserProfilePage mounted')
  console.log('User Data Store State:', {
    user: userDataStore.user,
    userProfile: userDataStore.userProfile,
    userRoles: userDataStore.userRoles,
    properties: userDataStore.properties,
    loading: userDataStore.loading,
    rolesLoading: userDataStore.rolesLoading,
    propertiesLoading: userDataStore.propertiesLoading,
  })

  // Check if user is authenticated
  if (!userDataStore.isAuthenticated) {
    console.log('User not authenticated, redirecting to login')
    router.push('/')
    return
  }

  console.log('User is authenticated, UID:', userDataStore.userId)
  // Data is automatically loaded by the store when user is authenticated
})

// Watch for changes in user roles and properties
watch(
  userRoles,
  (newRoles) => {
    console.log('User roles changed:', newRoles)
  },
  { immediate: true },
)

watch(
  userDataStore.properties,
  (newProperties) => {
    console.log('Properties changed:', newProperties)
  },
  { immediate: true },
)

// Watch for dialog state to reset form
watch(showAssignRoleDialog, (isOpen) => {
  if (isOpen) {
    // Set default date to today
    const today = new Date()
    const dateString = today.toISOString().split('T')[0]
    newRole.value = {
      property_id: '',
      role: '',
      role_date: dateString,
      expire_date: '',
    }
  }
})

// Helper functions
const getPropertyName = (propertyId) => {
  const property = userDataStore.getPropertyById(propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

const getRoleColor = (role) => {
  const colors = {
    'Property Owner': 'deep-purple',
    'Property Manager': 'blue',
    Tenant: 'green',
    Contractor: 'orange',
    Other: 'grey',
  }
  return colors[role] || 'grey'
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  if (typeof date === 'string') return date
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return 'Invalid date'
}

const viewProperty = (propertyId) => {
  // Navigate to property details page
  // TODO: In the future, this could navigate to a specific property detail page
  console.log('Viewing property:', propertyId)
  router.push(`/my-properties`)
}

const reloadData = () => {
  console.log('Manually reloading data...')
  if (userDataStore.isAuthenticated) {
    userDataStore.loadAllUserData()
  }
}

const assignRole = async () => {
  if (!newRole.value.property_id || !newRole.value.role || !newRole.value.role_date) {
    console.error('Missing required fields')
    return
  }

  try {
    assigningRole.value = true

    // Create the role document in the user's roles subcollection
    const roleData = {
      property_id: newRole.value.property_id,
      user_id: userDataStore.userId,
      role: newRole.value.role,
      role_date: newRole.value.role_date,
      expire_date: newRole.value.expire_date || '',
      role_grant_by: 'Self-Assigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Use the userDataStore to create the role
    await userDataStore.createUserRole(roleData)

    // Reset form and close dialog
    newRole.value = {
      property_id: '',
      role: '',
      role_date: '',
      expire_date: '',
    }
    showAssignRoleDialog.value = false

    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Role assigned successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error assigning role:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to assign role. Please try again.',
      position: 'top',
    })
  } finally {
    assigningRole.value = false
  }
}
</script>

<style scoped>
.user-profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-header .q-card-section {
  color: white;
}

.role-card {
  transition: all 0.3s ease;
  height: 100%;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.debug-info {
  background-color: #f5f5f5;
  font-family: monospace;
  font-size: 12px;
}

.debug-info pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
