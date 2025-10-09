<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">My Properties</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="secondary"
          label="Refresh"
          @click="refreshData"
          :loading="loading"
          flat
        />
        <q-btn
          @click="openCreatePropertyDialog"
          color="primary"
          icon="add"
          label="Create Property"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Loading your properties...</div>
    </div>

    <div v-else-if="userProperties.length === 0" class="text-center q-pa-lg">
      <q-icon name="home" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">No properties found</div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          userDataStore.userRoles.length === 0
            ? "You don't have any roles assigned to properties yet."
            : "You don't have access to any properties yet."
        }}
      </div>
      <div class="q-mt-md">
        <q-btn
          @click="openCreatePropertyDialog"
          color="primary"
          label="Create Your First Property"
          class="q-mr-sm"
        />
        <q-btn to="/user-profile" color="secondary" label="Assign Roles to Properties" flat />
      </div>
    </div>

    <div v-else class="properties-grid">
      <q-card v-for="property in userProperties" :key="property.id" class="property-card">
        <!-- Property Image -->
        <div class="property-image">
          <q-img
            :src="property.image_url || '/placeholder-property.jpg'"
            :alt="property.nickname"
            class="property-img"
            fit="cover"
          >
            <div class="absolute-top-right q-pa-sm">
              <q-btn
                round
                dense
                flat
                icon="favorite_border"
                color="white"
                size="sm"
                class="favorite-btn"
              />
            </div>
            <div class="absolute-bottom-left q-pa-sm">
              <q-chip
                :color="getStatusColor(property.status)"
                text-color="white"
                size="sm"
                class="status-chip"
              >
                {{ property.status }}
              </q-chip>
            </div>
          </q-img>
        </div>

        <!-- Property Details -->
        <q-card-section class="property-details">
          <div class="property-title">{{ property.nickname || 'Property' }}</div>
          <div class="property-developer">By {{ property.developer || 'Property Owner' }}</div>

          <!-- Price Information -->
          <div class="property-price">
            <span class="price-range"
              >₹ {{ formatPrice(property.price_min) }} - {{ formatPrice(property.price_max) }}</span
            >
            <div class="price-per-sqft">₹ {{ formatPrice(property.price_per_sqft) }} / sq.ft.</div>
          </div>

          <!-- Property Features -->
          <div class="property-features">
            <div class="feature-item">
              <q-icon name="bed" size="16px" color="grey-6" />
              <span>{{ property.spec?.bedroom || 'N/A' }} Bed</span>
            </div>
            <div class="feature-item">
              <q-icon name="bathtub" size="16px" color="grey-6" />
              <span
                >{{
                  (property.spec?.full_bathroom || 0) + (property.spec?.half_bathroom || 0) || 'N/A'
                }}
                Bath</span
              >
            </div>
            <div class="feature-item">
              <q-icon name="local_parking" size="16px" color="grey-6" />
              <span>{{ property.spec?.garage || 'N/A' }} Parking</span>
            </div>
            <div class="feature-item">
              <q-icon name="square_foot" size="16px" color="grey-6" />
              <span>{{ property.spec?.size || 'N/A' }} sq ft</span>
            </div>
          </div>

          <!-- Property Details -->
          <div class="property-details-section">
            <div class="detail-row">
              <span class="detail-label">Property Type:</span>
              <q-chip
                :color="getTypeColor(property.type)"
                text-color="white"
                size="sm"
                class="detail-chip"
              >
                {{ property.type }}
              </q-chip>
            </div>

            <div class="detail-row">
              <span class="detail-label">Style:</span>
              <span class="detail-value">{{ property.spec?.type || 'N/A' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Your Role:</span>
              <q-chip
                :color="getRoleColor(property.userRole)"
                text-color="white"
                size="sm"
                class="detail-chip"
              >
                {{ property.userRole }}
              </q-chip>
            </div>

            <div class="detail-row">
              <span class="detail-label">Lease Status:</span>
              <q-chip
                :color="getLeaseStatusColor(property)"
                text-color="white"
                size="sm"
                class="detail-chip"
              >
                {{ getLeaseStatus(property) }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <!-- Action Buttons -->
        <q-card-actions class="property-actions">
          <div class="action-buttons-grid">
            <q-btn
              color="primary"
              text-color="white"
              label="View Details"
              class="action-btn"
              @click="viewProperty(property.id)"
            />
            <q-btn
              color="primary"
              text-color="white"
              label="Create Transaction"
              class="action-btn"
              @click="openCreateTransactionDialog(property.id, property.nickname)"
            />
            <q-btn
              color="primary"
              text-color="white"
              label="Create Task"
              class="action-btn"
              @click="openCreateMxRecordDialog(property.id, property.nickname)"
            />
            <q-btn
              color="primary"
              text-color="white"
              label="Create Lease"
              class="action-btn"
              @click="openCreateLeaseDialog(property.id, property.nickname)"
            />
          </div>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Property Details Dialog -->
    <q-dialog v-model="showPropertyDialog" maximized>
      <q-card class="property-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h5 text-weight-bold">
              {{ selectedProperty?.nickname || 'Property Details' }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!isEditMode"
                flat
                round
                icon="edit"
                color="primary"
                @click="toggleEditMode"
                class="edit-btn"
              />
              <q-btn
                v-if="isEditMode"
                flat
                round
                icon="save"
                color="positive"
                @click="savePropertyChanges"
                :loading="editLoading"
                class="save-btn"
              />
              <q-btn
                v-if="isEditMode"
                flat
                round
                icon="close"
                color="negative"
                @click="cancelEdit"
                class="cancel-btn"
              />
              <q-btn flat round icon="close" @click="closePropertyDialog" class="close-btn" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="property-details-container">
            <!-- Basic Information -->
            <div class="details-section">
              <div class="section-title">
                <q-icon name="info" size="20px" color="primary" />
                <span class="text-h6 q-ml-sm">Basic Information</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <label class="detail-label">Address:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model="selectedProperty.address"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{ selectedProperty?.address || 'N/A' }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Nickname:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model="selectedProperty.nickname"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{ selectedProperty?.nickname || 'N/A' }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Property Type:</label>
                  <q-select
                    v-if="isEditMode"
                    v-model="selectedProperty.type"
                    :options="['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use']"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{ selectedProperty?.type || 'N/A' }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Status:</label>
                  <q-select
                    v-if="isEditMode"
                    v-model="selectedProperty.status"
                    :options="['Available', 'Sold', 'Under Contract', 'Off Market', 'Pending']"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{ selectedProperty?.status || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Property Specifications -->
            <div class="details-section">
              <div class="section-title">
                <q-icon name="settings" size="20px" color="primary" />
                <span class="text-h6 q-ml-sm">Property Specifications</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <label class="detail-label">Spec Type:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model="selectedProperty.spec.type"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.type || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Stories:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.story"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.story || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Bedrooms:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.bedroom"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.bedroom || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Full Bathrooms:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.full_bathroom"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.full_bathroom || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Half Bathrooms:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.half_bathroom"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.half_bathroom || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Kitchens:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.kitchen"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.kitchen || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Garage Spaces:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.garage"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.garage || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Size (sq ft):</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.size"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value"
                    >{{ selectedProperty?.spec?.size || 'N/A' }} sq ft</span
                  >
                </div>

                <div class="detail-item">
                  <label class="detail-label">Lot Size (sq ft):</label>
                  <q-input
                    v-if="isEditMode"
                    v-model.number="selectedProperty.spec.lot_size"
                    type="number"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value"
                    >{{ selectedProperty?.spec?.lot_size || 'N/A' }} sq ft</span
                  >
                </div>

                <div class="detail-item">
                  <label class="detail-label">HOA Name:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model="selectedProperty.spec.hoa_name"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.hoa_name || 'N/A'
                  }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">HOA Contact:</label>
                  <q-input
                    v-if="isEditMode"
                    v-model="selectedProperty.spec.hoa_contact"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{
                    selectedProperty?.spec?.hoa_contact || 'N/A'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- User Role Information -->
            <div class="details-section">
              <div class="section-title">
                <q-icon name="person" size="20px" color="primary" />
                <span class="text-h6 q-ml-sm">User Role Information</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <label class="detail-label">Your Role:</label>
                  <q-select
                    v-if="isEditMode"
                    v-model="selectedProperty.userRole"
                    :options="['Property Owner', 'Tenant', 'Property Manager', 'Owner']"
                    outlined
                    dense
                    class="detail-input"
                  />
                  <span v-else class="detail-value">{{ selectedProperty?.userRole || 'N/A' }}</span>
                </div>

                <div class="detail-item">
                  <label class="detail-label">Access Since:</label>
                  <span class="detail-value">{{ formatDate(selectedProperty?.role_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Property Dialog -->
    <q-dialog v-model="showCreatePropertyDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Property</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreatePropertyDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateProperty
            @property-created="onPropertyCreated"
            @cancel="closeCreatePropertyDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Task Dialog -->
    <q-dialog v-model="showCreateMxRecordDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Task</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateMxRecordDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateMxRecord
            :property-id="selectedPropertyForDialog?.id"
            :property-name="selectedPropertyForDialog?.nickname"
            @mx-record-created="onMxRecordCreated"
            @cancel="closeCreateMxRecordDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Transaction Dialog -->
    <q-dialog v-model="showCreateTransactionDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Transaction</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateTransactionDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateTransaction
            :property-id="selectedPropertyForDialog?.id"
            :property-name="selectedPropertyForDialog?.nickname"
            @transaction-created="onTransactionCreated"
            @cancel="closeCreateTransactionDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Lease Dialog -->
    <q-dialog v-model="showCreateLeaseDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">Create Lease</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateLeaseDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <CreateLease
            :property-id="selectedPropertyForDialog?.id"
            :property-name="selectedPropertyForDialog?.nickname"
            @lease-created="onLeaseCreated"
            @cancel="closeCreateLeaseDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, computed, watch, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import CreateProperty from '../components/CreateProperty.vue'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()

// Dialog state
const showPropertyDialog = ref(false)
const selectedProperty = ref(null)
const isEditMode = ref(false)
const editLoading = ref(false)

// Create form dialogs
const showCreatePropertyDialog = ref(false)
const showCreateMxRecordDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)
const selectedPropertyForDialog = ref(null)

const loading = computed(() => userDataStore.loading)
const userProperties = computed(() => {
  console.log('MyPropertiesPage - Computing userProperties')
  console.log('userDataStore.userAccessibleProperties:', userDataStore.userAccessibleProperties)
  console.log('userDataStore.userRoles:', userDataStore.userRoles)
  console.log('userDataStore.properties:', userDataStore.properties)

  // If we don't have user roles yet, return empty array
  if (!userDataStore.userRoles || userDataStore.userRoles.length === 0) {
    console.log('MyPropertiesPage - No user roles yet, returning empty array')
    return []
  }

  // If we don't have properties yet, return empty array
  if (!userDataStore.properties || userDataStore.properties.length === 0) {
    console.log('MyPropertiesPage - No properties yet, returning empty array')
    return []
  }

  const result = userDataStore.userAccessibleProperties
    .map((property) => {
      const userRole = userDataStore.getUserRoleForProperty(property.id)
      console.log(`MyPropertiesPage - Property ${property.id} has role:`, userRole)
      if (userRole) {
        return {
          ...property,
          userRole: userRole.role,
          role_date: userRole.role_date,
        }
      }
      return null
    })
    .filter(Boolean)

  console.log('MyPropertiesPage - Final userProperties result:', result)
  return result
})

// Watch for changes in store data
watch(
  () => userDataStore.userRoles,
  (newRoles) => {
    console.log('MyPropertiesPage - User roles changed:', newRoles)
  },
  { immediate: true },
)

watch(
  () => userDataStore.properties,
  (newProperties) => {
    console.log('MyPropertiesPage - Properties changed:', newProperties)
  },
  { immediate: true },
)

watch(
  () => userDataStore.userAccessibleProperties,
  (newAccessible) => {
    console.log('MyPropertiesPage - User accessible properties changed:', newAccessible)
  },
  { immediate: true },
)

// Add focus event listener to refresh data when page becomes visible
const handlePageFocus = () => {
  console.log('MyPropertiesPage - Page focused, checking if data needs refresh...')
  // Only refresh if we have no properties but should have some based on roles
  if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
    console.log('MyPropertiesPage - Page focused and data appears missing, refreshing...')
    refreshData()
  }
}

// Handle visibility change to refresh data when tab becomes visible
const handleVisibilityChange = () => {
  if (!document.hidden) {
    console.log('MyPropertiesPage - Tab became visible, checking if data needs refresh...')
    // Check if we have roles but no properties, which might indicate missing data
    if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
      console.log('MyPropertiesPage - Tab visible and data appears missing, refreshing...')
      refreshData()
    }
  }
}

onMounted(() => {
  console.log('MyPropertiesPage mounted')
  console.log('Initial store state:', {
    user: userDataStore.user,
    userId: userDataStore.userId,
    isAuthenticated: userDataStore.isAuthenticated,
    loading: userDataStore.loading,
    userRoles: userDataStore.userRoles,
    properties: userDataStore.properties,
    userAccessibleProperties: userDataStore.userAccessibleProperties,
  })

  // Check if user is authenticated
  if (!userDataStore.isAuthenticated) {
    console.log('User not authenticated, redirecting to home page')
    router.push('/')
    return
  }

  // Check if we need to trigger data loading
  if (userDataStore.isAuthenticated && !userDataStore.loading) {
    console.log('User is authenticated but not loading, checking if we need to load data...')
    if (userDataStore.userRoles.length === 0 || userDataStore.properties.length === 0) {
      console.log('Data appears to be missing, triggering data load...')
      userDataStore.loadAllUserData()
    }
  }

  // Add event listeners
  window.addEventListener('focus', handlePageFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Data is automatically loaded by the store when user is authenticated
})

onUnmounted(() => {
  window.removeEventListener('focus', handlePageFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Watch for route changes to refresh data when returning from create property
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log('MyPropertiesPage - Route changed from', oldPath, 'to', newPath)
    // If we're returning to this page from create-property, refresh data
    if (newPath === '/my-properties' && oldPath === '/create-property') {
      console.log('MyPropertiesPage - Returning from create property, refreshing data...')
      refreshData()
    }
  },
)

// Watch for when the page becomes active (useful for browser back/forward)
watch(
  () => route.name,
  (newName) => {
    if (newName === 'MyProperties') {
      console.log('MyPropertiesPage - Page activated, checking data...')
      // Small delay to ensure any pending operations complete
      setTimeout(() => {
        if (userDataStore.userRoles.length > 0 && userDataStore.properties.length === 0) {
          console.log('MyPropertiesPage - Page activated and data missing, refreshing...')
          refreshData()
        }
      }, 100)
    }
  },
)

const getTypeColor = (type) => {
  const colors = {
    Residential: 'blue',
    Commercial: 'green',
    Industrial: 'orange',
    Land: 'brown',
    'Mixed Use': 'purple',
  }
  return colors[type] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    Available: 'green',
    Sold: 'red',
    'Under Contract': 'orange',
    'Off Market': 'grey',
    Pending: 'yellow',
  }
  return colors[status] || 'grey'
}

const getRoleColor = (role) => {
  return role === 'Property Owner' ? 'deep-purple' : 'teal'
}

const formatPrice = (price) => {
  if (!price) return '0'
  if (price >= 10000000) {
    return (price / 10000000).toFixed(1) + ' Cr'
  } else if (price >= 100000) {
    return (price / 100000).toFixed(1) + ' Lacs'
  }
  return price.toLocaleString()
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getLeaseStatus = (property) => {
  // Check if property has any active leases
  const propertyLeases = userDataStore.userAccessibleLeases.filter((lease) => {
    const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
    return leasePropertyId === property.id
  })

  if (propertyLeases.length === 0) {
    return 'No Lease'
  }

  const activeLease = propertyLeases.find(
    (lease) => lease.leasedetail?.status === 'active' || lease.status === 'active',
  )

  if (activeLease) {
    return 'Leased'
  }

  return 'Available'
}

const getLeaseStatusColor = (property) => {
  const status = getLeaseStatus(property)
  switch (status) {
    case 'Leased':
      return 'positive'
    case 'Available':
      return 'info'
    case 'No Lease':
      return 'grey'
    default:
      return 'grey'
  }
}

const viewProperty = (propertyId) => {
  // Find the property by ID
  const property = userProperties.value.find((p) => p.id === propertyId)
  if (property) {
    selectedProperty.value = { ...property }
    showPropertyDialog.value = true
  }
}

// Dialog functions
const openCreatePropertyDialog = () => {
  showCreatePropertyDialog.value = true
}

const closeCreatePropertyDialog = () => {
  showCreatePropertyDialog.value = false
}

const openCreateMxRecordDialog = (propertyId, propertyName) => {
  selectedPropertyForDialog.value = { id: propertyId, nickname: propertyName }
  showCreateMxRecordDialog.value = true
}

const closeCreateMxRecordDialog = () => {
  showCreateMxRecordDialog.value = false
  selectedPropertyForDialog.value = null
}

const openCreateTransactionDialog = (propertyId, propertyName) => {
  selectedPropertyForDialog.value = { id: propertyId, nickname: propertyName }
  showCreateTransactionDialog.value = true
}

const closeCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = false
  selectedPropertyForDialog.value = null
}

const openCreateLeaseDialog = (propertyId, propertyName) => {
  selectedPropertyForDialog.value = { id: propertyId, nickname: propertyName }
  showCreateLeaseDialog.value = true
}

const closeCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = false
  selectedPropertyForDialog.value = null
}

// Event handlers for form completion
const onPropertyCreated = () => {
  closeCreatePropertyDialog()
  refreshData()
}

const onMxRecordCreated = () => {
  closeCreateMxRecordDialog()
  refreshData()
}

const onTransactionCreated = () => {
  closeCreateTransactionDialog()
  refreshData()
}

const onLeaseCreated = () => {
  closeCreateLeaseDialog()
  refreshData()
}

const refreshData = async () => {
  console.log('MyPropertiesPage - Refreshing data...')
  try {
    await userDataStore.loadAllUserData()
    console.log('MyPropertiesPage - Data refresh completed')
  } catch (error) {
    console.error('MyPropertiesPage - Error refreshing data:', error)
  }
}

// Dialog functions
const closePropertyDialog = () => {
  showPropertyDialog.value = false
  selectedProperty.value = null
  isEditMode.value = false
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const savePropertyChanges = async () => {
  if (!selectedProperty.value) return

  editLoading.value = true
  try {
    // Here you would typically call an API to update the property
    console.log('Saving property changes:', selectedProperty.value)

    // For now, we'll just show a success message
    // In a real app, you'd call userDataStore.updateProperty(selectedProperty.value)

    isEditMode.value = false
    // Refresh the data to get updated information
    await refreshData()
  } catch (error) {
    console.error('Error saving property:', error)
  } finally {
    editLoading.value = false
  }
}

const cancelEdit = () => {
  // Reset to original property data
  const originalProperty = userProperties.value.find((p) => p.id === selectedProperty.value.id)
  if (originalProperty) {
    selectedProperty.value = { ...originalProperty }
  }
  isEditMode.value = false
}
</script>

<style scoped>
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 16px 0;
}

.property-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  background: white;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.property-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.property-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.status-chip {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.property-details {
  padding: 20px;
}

.property-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.3;
}

.property-developer {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;
}

.property-price {
  margin-bottom: 16px;
}

.price-range {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 4px;
}

.price-per-sqft {
  font-size: 0.85rem;
  color: #666;
}

.property-features {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
}

.property-details-section {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 500;
}

.detail-chip {
  font-size: 0.75rem;
  font-weight: 500;
}

.property-actions {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  min-height: 36px;
  color: white;
  background: #1976d2;
}

.action-btn:hover {
  background: #1565c0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 12px 0;
  }

  .property-card {
    margin: 0 8px;
  }

  .property-image {
    height: 180px;
  }

  .property-details {
    padding: 16px;
  }

  .property-features {
    gap: 12px;
  }

  .property-actions {
    padding: 12px 16px;
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .property-image {
    height: 160px;
  }

  .property-title {
    font-size: 1.1rem;
  }

  .price-range {
    font-size: 1rem;
  }
}

/* Property Dialog Styles */
.property-dialog {
  max-width: 100vw;
  max-height: 100vh;
}

.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 24px;
}

.dialog-content {
  padding: 24px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.property-details-container {
  max-width: 1200px;
  margin: 0 auto;
}

.details-section {
  margin-bottom: 32px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
  padding: 8px 0;
}

.detail-input {
  width: 100%;
}

.edit-btn,
.save-btn,
.cancel-btn,
.close-btn {
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(25, 118, 210, 0.1);
}

.save-btn:hover {
  background: rgba(76, 175, 80, 0.1);
}

.cancel-btn:hover {
  background: rgba(244, 67, 54, 0.1);
}

.close-btn:hover {
  background: rgba(158, 158, 158, 0.1);
}

/* Responsive Dialog */
@media (max-width: 768px) {
  .dialog-content {
    padding: 16px;
  }

  .details-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .dialog-header {
    padding: 16px;
  }

  .dialog-header .text-h5 {
    font-size: 1.25rem;
  }
}
</style>
