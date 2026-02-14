<template>
  <q-page class="q-pa-md assets-page">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4">Asset Registry</div>
        <div class="text-caption text-grey-7">
          Track appliances, systems, and equipment by property.
        </div>
      </div>
      <q-btn color="primary" icon="add" label="Add Asset" @click="openCreateDialog" />
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <UniversalPropertySelect
              v-model="selectedPropertyFilter"
              label="Filter by Property"
              clearable
              show-property-details
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              clearable
              label="Search nickname, brand, model, serial"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <q-toggle v-model="showArchived" label="Show Archived" />
          </div>
          <div class="col-12 col-md-2 text-right">
            <q-btn flat icon="refresh" label="Reload" @click="loadAssets" :loading="loading" />
          </div>
        </div>
      </q-card-section>
    </q-card>

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

    <q-card v-else flat bordered>
      <q-table
        :rows="filteredAssets"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-property_name="props">
          <q-td :props="props">{{ props.row.property_name }}</q-td>
        </template>
        <template #body-cell-nickname="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nickname }}</div>
            <div class="text-caption text-grey-7">{{ props.row.type }}</div>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="props.row.status === 'archived' ? 'grey-6' : 'positive'" text-color="white" size="sm">
              {{ props.row.status === 'archived' ? 'Archived' : 'Active' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-images="props">
          <q-td :props="props">
            <q-chip size="sm" color="blue-1" text-color="primary">
              {{ props.row.images?.length || 0 }} image{{ (props.row.images?.length || 0) === 1 ? '' : 's' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-updated_at="props">
          <q-td :props="props">{{ formatDate(props.row.updated_at) }}</q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row no-wrap q-gutter-xs">
              <q-btn flat dense round icon="edit" color="primary" @click="openEditDialog(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status !== 'archived'"
                flat
                dense
                round
                icon="archive"
                color="orange"
                @click="archiveAsset(props.row)"
              >
                <q-tooltip>Archive</q-tooltip>
              </q-btn>
              <q-btn
                v-else
                flat
                dense
                round
                icon="unarchive"
                color="positive"
                @click="unarchiveAsset(props.row)"
              >
                <q-tooltip>Unarchive</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showFormDialog" persistent maximized>
      <q-card class="asset-form-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingAsset ? 'Edit Asset' : 'Add Asset' }}</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </q-card-section>

        <q-card-section class="asset-form-body">
          <q-form @submit="saveAsset" class="q-gutter-md">
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
                  hint="Enter a custom location"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.brand" label="Brand" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.model" label="Model" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.serial" label="Serial Number" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.mfg_date" label="MFG Date" type="date" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.acquired_date" label="Acquired Date" type="date" outlined dense />
              </div>
              <div class="col-12">
                <q-input v-model="form.notes" label="Notes" type="textarea" rows="3" outlined dense />
              </div>
            </div>

            <q-separator />

            <div>
              <div class="text-subtitle2 q-mb-sm">Product Tag Auto-Fill (Beta)</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="tagScanFile"
                    label="Upload product tag image (optional)"
                    outlined
                    dense
                    accept="image/*"
                    clearable
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="tagTextInput"
                    type="textarea"
                    rows="2"
                    outlined
                    dense
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
            </div>

            <q-separator />

            <div>
              <div class="text-subtitle2 q-mb-sm">Asset Images</div>
              <q-file
                v-model="newImageFilesModel"
                label="Add images"
                outlined
                dense
                multiple
                accept="image/*"
                clearable
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
            </div>

          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="asset-form-footer">
          <q-btn flat label="Cancel" @click="closeDialog" />
          <q-btn
            color="primary"
            @click="saveAsset"
            :label="editingAsset ? 'Update Asset' : 'Create Asset'"
            :loading="saving"
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
import UniversalPropertySelect from '../components/UniversalPropertySelect.vue'
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
const analyzingTag = ref(false)

const tagScanFile = ref(null)
const tagTextInput = ref('')

const form = ref(getEmptyForm())
const imagesMarkedForRemoval = ref([])
const newImageFiles = ref([])
const newImageFilesModel = ref([])
const newImagePreviews = ref([])

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

const columns = [
  { name: 'property_name', label: 'Property', field: 'property_name', align: 'left', sortable: true },
  { name: 'nickname', label: 'Asset', field: 'nickname', align: 'left', sortable: true },
  { name: 'location', label: 'Location', field: 'location', align: 'left', sortable: true },
  { name: 'brand', label: 'Brand', field: 'brand', align: 'left', sortable: true },
  { name: 'model', label: 'Model', field: 'model', align: 'left', sortable: true },
  { name: 'serial', label: 'Serial', field: 'serial', align: 'left' },
  { name: 'images', label: 'Images', field: 'images', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'updated_at', label: 'Updated', field: 'updated_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
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

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  const preselectedProperty = route.params.propertyId || route.query.propertyId || selectedPropertyFilter.value
  form.value = getEmptyForm()
  form.value.property_id = typeof preselectedProperty === 'string' ? preselectedProperty : null
  editingAsset.value = null
  imagesMarkedForRemoval.value = []
  resetNewImageSelection()
  tagScanFile.value = null
  tagTextInput.value = ''
  showFormDialog.value = true
}

function openEditDialog(asset) {
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
  showFormDialog.value = true
}

function closeDialog() {
  showFormDialog.value = false
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

    closeDialog()
    await loadAssets()
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
    $q.notify({ type: 'positive', message: 'Asset unarchived.', position: 'top' })
  } catch (error) {
    console.error('Failed to unarchive asset:', error)
    $q.notify({ type: 'negative', message: 'Failed to unarchive asset.', position: 'top' })
  }
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
})

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
</style>
