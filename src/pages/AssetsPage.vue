<template>
  <q-page class="q-pa-md assets-page">
    <div class="page-toolbar page-toolbar--filters">
      <q-input
        v-model="searchQuery"
        borderless
        dense
        clearable
        placeholder="Search assets"
        class="page-tool-field"
      >
        <template #prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
      <div class="page-tool-toggle">
        <q-toggle v-model="showArchived" dense label="Archived" />
      </div>
      <q-btn
        flat
        dense
        round
        icon="refresh"
        color="grey-7"
        class="page-tool-icon-action"
        :loading="loading"
        @click="loadAssets"
      >
        <q-tooltip>Reload assets</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canManageRecords"
        color="primary"
        text-color="white"
        unelevated
        no-caps
        dense
        icon="add"
        label="Add"
        class="page-tool-action"
        @click="openCreateDialog"
      />
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="40px" color="primary" />
      <div class="q-mt-sm">Loading assets...</div>
    </div>

    <q-card v-else-if="filteredAssets.length === 0" flat bordered>
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="inventory_2" size="64px" color="grey-4" />
        <div class="text-h6 q-mt-md text-grey-6">No assets found</div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          Add equipment and appliances to keep records by property.
        </div>
      </q-card-section>
    </q-card>

    <div v-else class="entity-tiles">
      <article
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="entity-tile asset-tile"
        tabindex="0"
        @click="openAssetDetail(asset)"
        @keyup.enter="openAssetDetail(asset)"
      >
        <div class="entity-tile-head">
          <div class="entity-file-mark entity-file-mark--blue">
            <q-icon name="inventory_2" size="22px" />
          </div>
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              v-if="canManagePropertyAction(asset.property_id)"
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click.stop="openEditDialog(asset)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn
              v-if="canManagePropertyAction(asset.property_id) && asset.status !== 'archived'"
              flat
              dense
              round
              icon="archive"
              color="orange"
              @click.stop="archiveAsset(asset)"
            >
              <q-tooltip>Archive</q-tooltip>
            </q-btn>
            <q-btn
              v-else-if="canManagePropertyAction(asset.property_id)"
              flat
              dense
              round
              icon="unarchive"
              color="positive"
              @click.stop="unarchiveAsset(asset)"
            >
              <q-tooltip>Unarchive</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="entity-tile-title text-clamp-2">{{ asset.nickname || asset.type || 'Asset' }}</div>
        <div class="entity-tile-desc text-clamp-2">
          {{ [asset.brand, asset.model, asset.serial].filter(Boolean).join(' / ') || asset.location || 'No details' }}
        </div>
        <div class="entity-tile-meta">
          <span class="entity-chip entity-chip--blue">{{ asset.property_name || 'Property' }}</span>
          <span class="entity-chip" :class="asset.status === 'archived' ? 'entity-chip--orange' : 'entity-chip--green'">
            {{ asset.status === 'archived' ? 'Archived' : 'Active' }}
          </span>
        </div>
        <div class="entity-tile-foot">
          <span>{{ asset.location || asset.type || 'Asset' }}</span>
          <span>{{ asset.images?.length || 0 }} image{{ (asset.images?.length || 0) === 1 ? '' : 's' }}</span>
        </div>
      </article>
    </div>

    <q-dialog v-model="showFormDialog" persistent maximized>
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateAsset
            @asset-created="onAssetCreated"
            @cancel="closeDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <DetailShell
      v-model="showAssetDetail"
      title="Asset Details"
      :subtitle="selectedAsset ? `${selectedAsset.property_name || 'Property'} • ${selectedAsset.type || 'Asset'}` : ''"
    >
      <template #actions>
        <q-btn
          v-if="selectedAsset && canManageRecords && !isEditingAssetDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="edit"
          label="Edit"
          @click="editSelectedAsset"
        />
        <q-btn
          v-if="selectedAsset && canManageRecords && !isEditingAssetDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="photo_library"
          label="Manage Images"
          @click="editSelectedAsset"
        />
        <q-btn
          v-if="selectedAsset && canManageRecords && !isEditingAssetDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="sticky_note_2"
          label="Edit Note"
          @click="openAssetNoteDialog"
        />
        <q-btn
          v-if="selectedAsset && canManagePropertyAction(selectedAsset.property_id) && selectedAsset.status !== 'archived' && !isEditingAssetDetail"
          flat
          dense
          no-caps
          color="orange"
          icon="archive"
          label="Archive"
          @click="archiveSelectedAsset"
        />
        <q-btn
          v-else-if="selectedAsset && canManagePropertyAction(selectedAsset.property_id) && !isEditingAssetDetail"
          flat
          dense
          no-caps
          color="positive"
          icon="unarchive"
          label="Unarchive"
          @click="unarchiveSelectedAsset"
        />
        <q-btn
          v-if="selectedAsset && canManageRecords && isEditingAssetDetail"
          flat
          dense
          no-caps
          color="grey-7"
          icon="close"
          label="Cancel"
          @click="cancelAssetDetailEdit"
        />
        <q-btn
          v-if="selectedAsset && canManageRecords && isEditingAssetDetail"
          flat
          dense
          no-caps
          color="primary"
          icon="save"
          label="Save"
          :loading="saving"
          @click="saveAsset"
        />
      </template>

      <div v-if="selectedAsset" class="asset-detail-body">
        <template v-if="!isEditingAssetDetail">
        <div class="asset-detail-hero">
          <div class="asset-detail-hero__identity">
            <div class="asset-detail-badge">
              {{ (selectedAsset.type || selectedAsset.nickname || 'A').slice(0, 1).toUpperCase() }}
            </div>
            <div class="asset-detail-hero__copy">
              <div class="asset-detail-eyebrow">Asset Snapshot</div>
              <div class="asset-detail-title">{{ selectedAsset.nickname || selectedAsset.type || 'Unnamed Asset' }}</div>
              <div class="asset-detail-subtitle">
                {{ selectedAsset.property_name || 'No property assigned' }}
              </div>
            </div>
          </div>
          <div class="asset-detail-hero__meta">
            <q-chip
              :color="selectedAsset.status === 'archived' ? 'orange' : 'positive'"
              text-color="white"
              class="asset-detail-status"
            >
              {{ selectedAsset.status === 'archived' ? 'Archived' : 'Active' }}
            </q-chip>
            <div class="asset-detail-hero__amount">
              <span class="asset-detail-hero__meta-label">Location</span>
              <strong>{{ selectedAsset.location || 'Not set' }}</strong>
            </div>
          </div>
        </div>

        <div class="asset-detail-sections">
          <section class="asset-detail-section asset-detail-section--primary">
            <div class="asset-detail-section__header">
              <div>
                <div class="asset-detail-section__eyebrow">Overview</div>
                <h3>Core Information</h3>
              </div>
            </div>
            <div class="asset-detail-grid">
              <div class="detail-block">
                <div class="detail-label">Type</div>
                <div class="detail-value">{{ selectedAsset.type || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Brand</div>
                <div class="detail-value">{{ selectedAsset.brand || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Model</div>
                <div class="detail-value">{{ selectedAsset.model || 'N/A' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Serial Number</div>
                <div class="detail-value">{{ selectedAsset.serial || 'N/A' }}</div>
              </div>
            </div>
          </section>

          <section class="asset-detail-section">
            <div class="asset-detail-section__header">
              <div>
                <div class="asset-detail-section__eyebrow">Lifecycle</div>
                <h3>Dates & Tracking</h3>
              </div>
            </div>
            <div class="asset-detail-grid">
              <div class="detail-block">
                <div class="detail-label">MFG Date</div>
                <div class="detail-value">{{ formatAssetDate(selectedAsset.mfg_date) }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Acquired Date</div>
                <div class="detail-value">{{ formatAssetDate(selectedAsset.acquired_date) }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Created</div>
                <div class="detail-value">{{ formatAssetDate(selectedAsset.created_at) }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Updated</div>
                <div class="detail-value">{{ formatAssetDate(selectedAsset.updated_at) }}</div>
              </div>
            </div>
          </section>

          <section class="asset-detail-section">
            <div class="asset-detail-section__header">
              <div>
                <div class="asset-detail-section__eyebrow">Notes</div>
                <h3>Asset Notes</h3>
              </div>
            </div>
            <div class="asset-detail-note-card">
              {{ selectedAsset.notes || 'No notes added.' }}
            </div>
          </section>

          <aside class="asset-detail-sidecard">
            <div class="asset-detail-section__eyebrow">Reference</div>
            <h3>Placement</h3>
            <div class="asset-detail-sidecard__row">
              <span>Property</span>
              <strong>{{ selectedAsset.property_name || 'N/A' }}</strong>
            </div>
            <div class="asset-detail-sidecard__row">
              <span>Nickname</span>
              <strong>{{ selectedAsset.nickname || 'N/A' }}</strong>
            </div>
            <div class="asset-detail-sidecard__row">
              <span>Location</span>
              <strong>{{ selectedAsset.location || 'N/A' }}</strong>
            </div>
          </aside>
        </div>

        <div v-if="selectedAsset.images?.length" class="asset-detail-gallery">
          <div class="asset-detail-section__header asset-detail-section__header--gallery">
            <div>
              <div class="asset-detail-section__eyebrow">Gallery</div>
              <h3>Photos</h3>
            </div>
          </div>
          <div class="asset-detail-image-grid">
            <q-img
              v-for="(image, index) in selectedAsset.images"
              :key="`${image.storage_path || image.url}-${index}`"
              :src="image.url"
              fit="cover"
              class="asset-detail-image"
            />
          </div>
        </div>
        </template>

        <div v-else class="asset-detail-editor">
          <section class="asset-create-panel">
            <div class="asset-create-panel__header">
              <div class="section-label">Asset Details</div>
              <div class="text-caption text-grey-6">Core information, status, and placement.</div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <UniversalPropertySelect
                  v-model="form.property_id"
                  label="Property *"
                  :rules="[(val) => !!val || 'Property is required']"
                  :disable="!!editingAsset"
                  show-property-details
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nickname"
                  label="Nickname *"
                  outlined
                  dense
                  bg-color="grey-1"
                  :rules="[(val) => !!val || 'Nickname is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.type"
                  :options="assetTypeOptions"
                  label="Type *"
                  outlined
                  dense
                  bg-color="grey-1"
                  :rules="[(val) => !!val || 'Type is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.location"
                  :options="locationOptions"
                  label="Location"
                  outlined
                  dense
                  bg-color="grey-1"
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                />
              </div>
              <div v-if="form.location === 'Other'" class="col-12 col-md-6">
                <q-input
                  v-model="form.location_other"
                  label="Custom Location"
                  outlined
                  dense
                  bg-color="grey-1"
                  hint="Enter a custom location"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.brand" label="Brand" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.model" label="Model" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.serial" label="Serial Number" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.mfg_date" label="MFG Date" type="date" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.acquired_date" label="Acquired Date" type="date" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12">
                <q-input v-model="form.notes" label="Notes" type="textarea" rows="3" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status"
                  :options="assetStatusOptions"
                  label="Asset Status"
                  outlined
                  dense
                  bg-color="grey-1"
                  emit-value
                  map-options
                />
              </div>
            </div>
          </section>

          <section class="asset-create-panel">
            <div class="asset-create-panel__header">
              <div class="section-label">Product Tag Auto-Fill</div>
              <div class="text-caption text-grey-6">Use a label photo or pasted text to update fields quickly.</div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-file
                  v-model="tagScanFile"
                  label="Upload product tag image (optional)"
                  outlined
                  dense
                  accept="image/*"
                  clearable
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="tagTextInput"
                  type="textarea"
                  rows="2"
                  outlined
                  dense
                  bg-color="grey-1"
                  label="Or paste tag text"
                  hint="Supports parsing of brand/model/serial/date from label text."
                />
              </div>
            </div>
            <q-btn
              class="q-mt-sm"
              flat
              color="primary"
              icon="manage_search"
              label="Analyze Tag"
              @click="analyzeTagInput"
              :loading="analyzingTag"
            />
          </section>

          <section class="asset-create-panel">
            <div class="asset-create-panel__header">
              <div class="section-label">Asset Images</div>
              <div class="text-caption text-grey-6">Add, replace, or remove photos for this asset.</div>
            </div>

            <q-file
              v-model="newImageFilesModel"
              label="Add images"
              outlined
              dense
              multiple
              accept="image/*"
              clearable
              bg-color="grey-1"
              @update:model-value="onNewImagesSelected"
            />

            <div v-if="form.images.length > 0" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Existing Images</div>
              <div class="row q-col-gutter-sm">
                <div v-for="(img, idx) in form.images" :key="`${img.storage_path || img.url}-${idx}`" class="col-6 col-md-3">
                  <q-card flat bordered>
                    <q-img :src="img.url" style="height: 120px" fit="cover" />
                    <q-card-actions align="right" class="q-pa-xs">
                      <q-btn flat dense round icon="delete" color="negative" @click="removeExistingImage(idx)" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>

            <div v-if="newImagePreviews.length > 0" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">New Images</div>
              <div class="row q-col-gutter-sm">
                <div v-for="(img, idx) in newImagePreviews" :key="`${img.name}-${idx}`" class="col-6 col-md-3">
                  <q-card flat bordered>
                    <q-img :src="img.url" style="height: 120px" fit="cover" />
                    <q-card-actions align="between" class="q-pa-xs">
                      <div class="text-caption ellipsis">{{ img.name }}</div>
                      <q-btn flat dense round icon="delete" color="negative" @click="removeNewImage(idx)" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DetailShell>

    <q-dialog v-model="showAssetNoteDialog" persistent>
      <q-card class="asset-note-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold">Edit Asset Note</div>
            <div class="text-caption text-grey-6">
              This note can be updated anytime, including archived assets.
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showAssetNoteDialog = false" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="assetNoteDraft"
            type="textarea"
            autogrow
            outlined
            label="Asset Note"
            bg-color="grey-1"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" @click="showAssetNoteDialog = false" />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Save Note"
            :loading="savingAssetNote"
            @click="saveAssetNote"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import CreateAsset from '../components/CreateAsset.vue'
import UniversalPropertySelect from '../components/UniversalPropertySelect.vue'
import DetailShell from '../components/details/DetailShell.vue'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'

const $q = useQuasar()
const route = useRoute()
const userDataStore = useUserDataStore()
const { createDocument, updateDocument, getAllDocuments, uploadImagesWithDetails, deleteFile } = useFirebase()

const loading = ref(false)
const saving = ref(false)
const assets = ref([])
const searchQuery = ref('')
const selectedPropertyFilter = ref(null)
const showArchived = ref(false)
const showFormDialog = ref(false)
const editingAsset = ref(null)
const selectedAsset = ref(null)
const showAssetDetail = ref(false)
const isEditingAssetDetail = ref(false)
const showAssetNoteDialog = ref(false)
const assetNoteDraft = ref('')
const savingAssetNote = ref(false)
const analyzingTag = ref(false)

const tagScanFile = ref(null)
const tagTextInput = ref('')

const form = ref(getEmptyForm())
const imagesMarkedForRemoval = ref([])
const newImageFiles = ref([])
const newImageFilesModel = ref([])
const newImagePreviews = ref([])
const canManageRecords = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  return ['pm', 'po', 'admin'].includes(accountType)
})

const canManagePropertyAction = (propertyId) => {
  if (!propertyId) return false
  return userDataStore.canManageProperty(propertyId)
}

const assetTypeOptions = [
  'Appliance',
  'HVAC',
  'Pool/Spa',
  'Electrical',
  'Plumbing',
  'Safety',
  'Exterior',
  'Furniture',
  'Other',
]

const assetStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
]

const locationOptions = [
  'Kitchen',
  'Kitchen Pantry',
  'Dining Room',
  'Breakfast Nook',
  'Living Room',
  'Family Room',
  'Great Room',
  'Den',
  'Office',
  'Library',
  'Study',
  'Entryway',
  'Foyer',
  'Mudroom',
  'Hallway',
  'Staircase',
  'Laundry Room',
  'Utility Room',
  'Mechanical Room',
  'Boiler Room',
  'Main Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Bedroom 4',
  'Guest Bedroom',
  'Nursery',
  'Walk-in Closet',
  'Closet',
  'Linen Closet',
  'Bathroom',
  'Primary Bathroom',
  'Guest Bathroom',
  'Half Bath',
  'Basement',
  'Finished Basement',
  'Unfinished Basement',
  'Cellar',
  'Attic',
  'Loft',
  'Garage',
  'Garage Bay 1',
  'Garage Bay 2',
  'Carport',
  'Driveway',
  'Front Yard',
  'Back Yard',
  'Side Yard',
  'Garden',
  'Patio',
  'Deck',
  'Balcony',
  'Porch',
  'Sunroom',
  'Pool Area',
  'Spa/Hot Tub Area',
  'Outdoor Kitchen',
  'BBQ Area',
  'Shed',
  'Workshop',
  'Storage Room',
  'Gate',
  'Fence Line',
  'Roof',
  'Gutter',
  'Exterior Wall',
  'Foundation',
  'Crawl Space',
  'HVAC Closet',
  'Electrical Panel Area',
  'Water Heater Closet',
  'Other',
]

const filteredAssets = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()

  return assets.value
    .filter((asset) => {
      if (!showArchived.value && asset.status === 'archived') {
        return false
      }

      if (selectedPropertyFilter.value && asset.property_id !== selectedPropertyFilter.value) {
        return false
      }

      if (!term) return true

      const haystack = [
        asset.nickname,
        asset.type,
        asset.location,
        asset.brand,
        asset.model,
        asset.serial,
        asset.property_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
})

function getEmptyForm() {
  return {
    property_id: null,
    nickname: '',
    type: 'Appliance',
    location: '',
    location_other: '',
    brand: '',
    model: '',
    serial: '',
    mfg_date: '',
    acquired_date: '',
    notes: '',
    status: 'active',
    images: [],
  }
}

async function ensurePropertyDataLoaded() {
  if (!userDataStore.isAuthenticated) return
  if (userDataStore.userAccessibleProperties.length > 0) return
  await userDataStore.loadAllUserData()
}

async function loadAssets() {
  loading.value = true
  try {
    await ensurePropertyDataLoaded()

    const properties = userDataStore.userAccessibleProperties || []
    const results = await Promise.all(
      properties.map(async (property) => {
        try {
          const records = await getAllDocuments(`properties/${property.id}/assets`)
          return records.map((record) => ({
            id: record.id,
            ...record,
            property_id: property.id,
            property_name: property.nickname || property.address || 'Property',
            status: record.status || 'active',
            images: Array.isArray(record.images) ? record.images : [],
          }))
        } catch (error) {
          console.warn(`Failed loading assets for property ${property.id}:`, error)
          return []
        }
      }),
    )

    assets.value = results.flat()
  } catch (error) {
    console.error('Failed to load assets:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load assets.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  if (!canManageRecords.value) return
  const preselectedProperty = route.params.propertyId || route.query.propertyId || selectedPropertyFilter.value
  form.value = getEmptyForm()
  form.value.property_id = typeof preselectedProperty === 'string' ? preselectedProperty : null
  editingAsset.value = null
  imagesMarkedForRemoval.value = []
  resetNewImageSelection()
  tagScanFile.value = null
  tagTextInput.value = ''
  isEditingAssetDetail.value = false
  showFormDialog.value = true
}

function openEditDialog(asset) {
  if (!canManageRecords.value) return
  const normalizedLocation = locationOptions.includes(asset.location) ? asset.location : 'Other'
  editingAsset.value = asset
  form.value = {
    property_id: asset.property_id,
    nickname: asset.nickname || '',
    type: asset.type || 'Appliance',
    location: asset.location ? normalizedLocation : '',
    location_other: asset.location && normalizedLocation === 'Other' ? asset.location : '',
    brand: asset.brand || '',
    model: asset.model || '',
    serial: asset.serial || '',
    mfg_date: asset.mfg_date || '',
    acquired_date: asset.acquired_date || '',
    notes: asset.notes || '',
    status: asset.status || 'active',
    images: Array.isArray(asset.images) ? [...asset.images] : [],
  }
  imagesMarkedForRemoval.value = []
  resetNewImageSelection()
  tagScanFile.value = null
  tagTextInput.value = ''
  selectedAsset.value = asset
  showAssetDetail.value = true
  isEditingAssetDetail.value = true
}

function openAssetDetail(asset) {
  selectedAsset.value = asset
  isEditingAssetDetail.value = false
  showAssetDetail.value = true
}

function closeDialog() {
  showFormDialog.value = false
}

function editSelectedAsset() {
  if (!selectedAsset.value) return
  openEditDialog(selectedAsset.value)
}

function cancelAssetDetailEdit() {
  isEditingAssetDetail.value = false
  if (selectedAsset.value) {
    const asset = selectedAsset.value
    const normalizedLocation = locationOptions.includes(asset.location) ? asset.location : 'Other'
    form.value = {
      property_id: asset.property_id,
      nickname: asset.nickname || '',
      type: asset.type || 'Appliance',
      location: asset.location ? normalizedLocation : '',
      location_other: asset.location && normalizedLocation === 'Other' ? asset.location : '',
      brand: asset.brand || '',
      model: asset.model || '',
      serial: asset.serial || '',
      mfg_date: asset.mfg_date || '',
      acquired_date: asset.acquired_date || '',
      notes: asset.notes || '',
      status: asset.status || 'active',
      images: Array.isArray(asset.images) ? [...asset.images] : [],
    }
    imagesMarkedForRemoval.value = []
    resetNewImageSelection()
    tagScanFile.value = null
    tagTextInput.value = ''
  }
}

function openAssetNoteDialog() {
  if (!selectedAsset.value) return
  assetNoteDraft.value = selectedAsset.value.notes || ''
  showAssetNoteDialog.value = true
}

async function onAssetCreated() {
  $q.notify({
    type: 'positive',
    message: 'Asset created.',
    position: 'top',
  })
  closeDialog()
  await loadAssets()
}

function removeExistingImage(index) {
  const [removed] = form.value.images.splice(index, 1)
  if (removed?.storage_path) {
    imagesMarkedForRemoval.value.push(removed.storage_path)
  }
}

function onNewImagesSelected(files) {
  resetNewImageSelection()
  if (!files) return

  const normalized = Array.isArray(files) ? files : [files]
  newImageFiles.value = normalized
  newImageFilesModel.value = normalized
  newImagePreviews.value = normalized.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
    file,
  }))
}

function removeNewImage(index) {
  const preview = newImagePreviews.value[index]
  if (preview?.url) {
    URL.revokeObjectURL(preview.url)
  }
  newImagePreviews.value.splice(index, 1)
  newImageFiles.value.splice(index, 1)
  newImageFilesModel.value = [...newImageFiles.value]
}

function resetNewImageSelection() {
  newImagePreviews.value.forEach((preview) => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
  })
  newImagePreviews.value = []
  newImageFiles.value = []
  newImageFilesModel.value = []
}

async function saveAsset() {
  if (!form.value.property_id || !form.value.nickname || !form.value.type) {
    $q.notify({
      type: 'warning',
      message: 'Property, nickname, and type are required.',
      position: 'top',
    })
    return
  }

  saving.value = true
  try {
    const now = new Date().toISOString()
    const collectionPath = `properties/${form.value.property_id}/assets`

    let uploadedImages = []
    if (newImageFiles.value.length > 0) {
      const uploadResults = await uploadImagesWithDetails(newImageFiles.value, form.value.property_id, 'asset')
      uploadedImages = uploadResults.map((item) => ({
        url: item.url,
        file_name: item.fileName,
        original_name: item.originalName,
        storage_path: item.storagePath,
        size: item.size,
        uploaded_at: now,
      }))
    }

    if (imagesMarkedForRemoval.value.length > 0) {
      await Promise.allSettled(imagesMarkedForRemoval.value.map((path) => deleteFile(path)))
    }

    const finalLocation =
      form.value.location === 'Other'
        ? form.value.location_other?.trim() || 'Other'
        : form.value.location?.trim() || ''

    const payload = {
      property_id: form.value.property_id,
      nickname: form.value.nickname.trim(),
      type: form.value.type,
      location: finalLocation,
      brand: form.value.brand?.trim() || '',
      model: form.value.model?.trim() || '',
      serial: form.value.serial?.trim() || '',
      mfg_date: form.value.mfg_date || '',
      acquired_date: form.value.acquired_date || '',
      notes: form.value.notes?.trim() || '',
      status: form.value.status || 'active',
      images: [...form.value.images, ...uploadedImages],
      updated_at: now,
      archived_at: form.value.status === 'archived' ? now : null,
    }

    if (editingAsset.value) {
      await updateDocument(collectionPath, editingAsset.value.id, payload)
    } else {
      await createDocument(collectionPath, {
        ...payload,
        created_at: now,
      })
    }

    $q.notify({
      type: 'positive',
      message: editingAsset.value ? 'Asset updated.' : 'Asset created.',
      position: 'top',
    })

    if (editingAsset.value) {
      const updatedAsset = {
        ...editingAsset.value,
        ...payload,
        property_name: userDataStore.getPropertyName(form.value.property_id) || editingAsset.value.property_name || 'Property',
      }
      selectedAsset.value = updatedAsset
      assets.value = assets.value.map((asset) =>
        asset.id === editingAsset.value.id && asset.property_id === editingAsset.value.property_id
          ? updatedAsset
          : asset,
      )
      editingAsset.value = updatedAsset
      isEditingAssetDetail.value = false
      await loadAssets()
    } else {
      closeDialog()
      await loadAssets()
    }
  } catch (error) {
    console.error('Failed to save asset:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save asset.',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function archiveAsset(asset) {
  try {
    await updateDocument(`properties/${asset.property_id}/assets`, asset.id, {
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    await loadAssets()
    if (selectedAsset.value?.id === asset.id) {
      selectedAsset.value = { ...selectedAsset.value, status: 'archived', archived_at: new Date().toISOString() }
    }
    $q.notify({ type: 'positive', message: 'Asset archived.', position: 'top' })
  } catch (error) {
    console.error('Failed to archive asset:', error)
    $q.notify({ type: 'negative', message: 'Failed to archive asset.', position: 'top' })
  }
}

async function unarchiveAsset(asset) {
  try {
    await updateDocument(`properties/${asset.property_id}/assets`, asset.id, {
      status: 'active',
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    await loadAssets()
    if (selectedAsset.value?.id === asset.id) {
      selectedAsset.value = { ...selectedAsset.value, status: 'active', archived_at: null }
    }
    $q.notify({ type: 'positive', message: 'Asset unarchived.', position: 'top' })
  } catch (error) {
    console.error('Failed to unarchive asset:', error)
    $q.notify({ type: 'negative', message: 'Failed to unarchive asset.', position: 'top' })
  }
}

async function archiveSelectedAsset() {
  if (!selectedAsset.value) return
  await archiveAsset(selectedAsset.value)
}

async function unarchiveSelectedAsset() {
  if (!selectedAsset.value) return
  await unarchiveAsset(selectedAsset.value)
}

async function saveAssetNote() {
  if (!selectedAsset.value) return
  savingAssetNote.value = true
  try {
    const trimmedNote = assetNoteDraft.value?.trim() || ''
    const updatedAt = new Date().toISOString()
    await updateDocument(`properties/${selectedAsset.value.property_id}/assets`, selectedAsset.value.id, {
      notes: trimmedNote,
      updated_at: updatedAt,
    })

    selectedAsset.value = {
      ...selectedAsset.value,
      notes: trimmedNote,
      updated_at: updatedAt,
    }

    assets.value = assets.value.map((asset) =>
      asset.id === selectedAsset.value.id && asset.property_id === selectedAsset.value.property_id
        ? { ...asset, notes: trimmedNote, updated_at: updatedAt }
        : asset,
    )

    showAssetNoteDialog.value = false
    $q.notify({ type: 'positive', message: 'Asset note updated.', position: 'top' })
  } catch (error) {
    console.error('Failed to update asset note:', error)
    $q.notify({ type: 'negative', message: 'Failed to update asset note.', position: 'top' })
  } finally {
    savingAssetNote.value = false
  }
}

function formatAssetDate(value) {
  if (!value) return 'N/A'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function cleanValue(value) {
  return value ? value.replace(/^[:\s-]+/, '').trim() : ''
}

function parseDateToInput(value) {
  if (!value) return ''
  const text = value.trim()

  const yearMonth = text.match(/^(\d{1,2})[/-](\d{4})$/)
  if (yearMonth) {
    const month = yearMonth[1].padStart(2, '0')
    return `${yearMonth[2]}-${month}-01`
  }

  const slashDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slashDate) {
    const month = slashDate[1].padStart(2, '0')
    const day = slashDate[2].padStart(2, '0')
    const year = slashDate[3].length === 2 ? `20${slashDate[3]}` : slashDate[3]
    return `${year}-${month}-${day}`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const parsed = new Date(text)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return ''
}

function parseTagText(rawText) {
  const result = {}
  if (!rawText) return result

  const lines = rawText
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (!result.brand && /(brand|manufacturer)\b/i.test(line)) {
      result.brand = cleanValue(line.split(/brand|manufacturer/i)[1])
      continue
    }
    if (!result.model && /\b(model|mod)\b/i.test(line)) {
      result.model = cleanValue(line.split(/model|mod/i)[1])
      continue
    }
    if (!result.serial && /\b(serial|s\/n|sn)\b/i.test(line)) {
      result.serial = cleanValue(line.split(/serial|s\/n|sn/i)[1])
      continue
    }
    if (!result.mfg_date && /(mfg date|manufactured|mfd|mfg)\b/i.test(line)) {
      const candidate = cleanValue(line.split(/mfg date|manufactured|mfd|mfg/i)[1])
      result.mfg_date = parseDateToInput(candidate)
    }
  }

  return result
}

async function detectBarcodes(file) {
  if (!file || typeof window === 'undefined' || !('BarcodeDetector' in window)) {
    return []
  }

  try {
    const supportedFormats = typeof window.BarcodeDetector.getSupportedFormats === 'function'
      ? await window.BarcodeDetector.getSupportedFormats()
      : []
    const desiredFormats = ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
    const formats = desiredFormats.filter((format) => supportedFormats.includes(format))
    const detector = formats.length > 0 ? new window.BarcodeDetector({ formats }) : new window.BarcodeDetector()
    const bitmap = await createImageBitmap(file)
    const detected = await detector.detect(bitmap)
    if (typeof bitmap.close === 'function') bitmap.close()
    return detected.map((item) => item.rawValue).filter(Boolean)
  } catch (error) {
    console.warn('Barcode detection not available or failed:', error)
    return []
  }
}

async function analyzeTagInput() {
  analyzingTag.value = true
  try {
    const barcodeValues = await detectBarcodes(tagScanFile.value)
    const mergedText = [tagTextInput.value, ...barcodeValues].filter(Boolean).join('\n')
    const parsed = parseTagText(mergedText)

    if (!parsed.serial && barcodeValues.length > 0) {
      const candidate = barcodeValues.find((value) => /[A-Za-z0-9]{6,}/.test(value))
      parsed.serial = candidate || barcodeValues[0]
    }

    let updatedCount = 0
    ;['brand', 'model', 'serial', 'mfg_date'].forEach((field) => {
      if (parsed[field] && !form.value[field]) {
        form.value[field] = parsed[field]
        updatedCount += 1
      }
    })

    if (updatedCount === 0) {
      $q.notify({
        type: 'info',
        message: 'No new fields detected. Try pasting more tag text.',
        position: 'top',
      })
      return
    }

    $q.notify({
      type: 'positive',
      message: `Auto-filled ${updatedCount} field${updatedCount > 1 ? 's' : ''}.`,
      position: 'top',
    })
  } finally {
    analyzingTag.value = false
  }
}

watch(
  () => route.params.propertyId || route.query.propertyId,
  (propertyId) => {
    if (typeof propertyId === 'string') {
      selectedPropertyFilter.value = propertyId
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await loadAssets()
  if (route.query.create === 'true') {
    openCreateDialog()
  }
})

watch(
  () => route.query.create,
  (val) => {
    if (val === 'true') openCreateDialog()
  },
)

onUnmounted(() => {
  resetNewImageSelection()
})
</script>

<style scoped>
.assets-page .q-table {
  border-radius: 8px;
}

.asset-form-dialog {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.create-fullscreen-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.create-fullscreen-body {
  flex: 1;
  overflow-y: auto;
}

.asset-form-body {
  flex: 1;
  overflow-y: auto;
}

.asset-form-footer {
  border-top: 1px solid #e0e0e0;
  background: #fff;
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 12px 16px;
}

.asset-detail-body {
  padding: 18px;
}

.asset-detail-hero {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(227, 239, 255, 0.95), rgba(247, 250, 255, 0.92));
  border: 1px solid rgba(53, 109, 214, 0.12);
  box-shadow: 0 18px 44px rgba(29, 78, 216, 0.08);
}

.asset-detail-hero__identity {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.asset-detail-badge {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(53, 109, 214, 0.12);
  flex-shrink: 0;
}

.asset-detail-hero__copy {
  min-width: 0;
}

.asset-detail-eyebrow,
.asset-detail-section__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4f46e5;
}

.asset-detail-title {
  margin-top: 4px;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--neutral-900);
}

.asset-detail-subtitle {
  margin-top: 6px;
  color: var(--neutral-600);
  line-height: 1.45;
}

.asset-detail-hero__meta {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.asset-detail-status {
  font-weight: 700;
}

.asset-detail-hero__amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  color: var(--neutral-900);
}

.asset-detail-hero__meta-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--neutral-500);
}

.asset-detail-sections {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(240px, 0.72fr);
  gap: 16px;
  margin-top: 18px;
  align-items: start;
}

.asset-detail-editor {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.asset-detail-section,
.asset-detail-sidecard {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.asset-detail-section {
  padding: 18px;
}

.asset-detail-section--primary {
  grid-column: span 2;
}

.asset-detail-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.asset-detail-section__header h3,
.asset-detail-sidecard h3 {
  margin: 4px 0 0;
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--neutral-900);
}

.asset-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-block {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 14px;
  padding: 13px 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.98));
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-500);
}

.detail-value {
  margin-top: 7px;
  color: var(--neutral-900);
  line-height: 1.55;
}

.asset-detail-note-card {
  border-radius: 16px;
  padding: 16px 18px;
  background: linear-gradient(180deg, rgba(246, 249, 255, 0.9), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(20, 28, 45, 0.08);
  line-height: 1.65;
  color: var(--neutral-800);
  min-height: 116px;
}

.asset-detail-sidecard {
  padding: 18px;
}

.asset-detail-sidecard__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid rgba(20, 28, 45, 0.08);
}

.asset-detail-sidecard__row:first-of-type {
  margin-top: 8px;
}

.asset-detail-sidecard__row span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-500);
}

.asset-detail-sidecard__row strong {
  color: var(--neutral-900);
  line-height: 1.45;
}

.asset-detail-gallery {
  margin-top: 18px;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  padding: 18px;
}

.asset-detail-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.asset-detail-image {
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(20, 28, 45, 0.08);
}

.asset-note-dialog {
  width: min(560px, calc(100vw - 32px));
  border-radius: 18px;
}

@media (max-width: 768px) {
  .asset-detail-hero,
  .asset-detail-hero__identity {
    flex-direction: column;
    align-items: flex-start;
  }

  .asset-detail-hero__meta {
    min-width: 0;
    width: 100%;
    align-items: flex-start;
  }

  .asset-detail-sections {
    grid-template-columns: 1fr;
  }

  .asset-detail-section--primary {
    grid-column: auto;
  }

  .asset-detail-editor {
    grid-template-columns: 1fr;
  }

  .asset-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
