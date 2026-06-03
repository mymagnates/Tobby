<template>
  <div class="create-asset">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div>
            <div class="text-h6 text-primary q-mb-xs">
              <q-icon name="inventory_2" class="q-mr-sm" />
              Create New Asset
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Track equipment details, tag data, and photos in one step.
            </div>
            <div v-if="hasMatchedFixedProperty && !showPropertySelect" class="text-caption text-grey-6 q-mb-xs">
              Property: {{ resolvedPropertyName || 'Selected Property' }}
            </div>
            <div v-else class="section-label q-mb-xs">Property Context</div>
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
              form="create-asset-form"
              color="primary"
              text-color="white"
              unelevated
              :loading="loading"
              label="Save"
              class="top-action-btn"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form id="create-asset-form" @submit="onSubmit" class="q-gutter-md">
          <section class="asset-create-panel">
            <div class="asset-create-panel__header">
              <div class="section-label">Asset Details</div>
              <div class="text-caption text-grey-6">Core information and placement.</div>
            </div>

            <q-select
              v-if="showPropertySelect"
              v-model="selectedPropertyId"
              :options="propertyOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Select Property"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Property selection is required']"
              :loading="propertiesLoading"
              bg-color="grey-1"
            />
            <div
              v-if="showPropertySelect && !propertiesLoading && propertyOptions.length === 0"
              class="text-caption text-primary"
            >
              No properties found. Check console for details.
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="assetData.nickname"
                  label="Nickname *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Nickname is required']"
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="assetData.type"
                  :options="assetTypeOptions"
                  label="Type *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Type is required']"
                  bg-color="grey-1"
                />
              </div>
            </div>

            <q-select
              v-model="assetData.location"
              :options="locationOptions"
              label="Location"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              bg-color="grey-1"
            />

            <q-input
              v-if="assetData.location === 'Other'"
              v-model="assetData.location_other"
              label="Custom Location"
              outlined
              dense
              bg-color="grey-1"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input v-model="assetData.brand" label="Brand" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="assetData.model" label="Model" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="assetData.serial" label="Serial Number" outlined dense bg-color="grey-1" />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="assetData.mfg_date" label="MFG Date" type="date" outlined dense bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="assetData.acquired_date"
                  label="Acquired Date"
                  type="date"
                  outlined
                  dense
                  bg-color="grey-1"
                />
              </div>
            </div>

            <q-input v-model="assetData.notes" label="Notes" type="textarea" rows="2" outlined dense bg-color="grey-1" />
          </section>

          <section class="asset-create-panel">
            <div class="asset-create-panel__header">
              <div class="section-label">Product Tag Auto-Fill</div>
              <div class="text-caption text-grey-6">Use a label photo or pasted text to prefill fields.</div>
            </div>

            <div class="row q-col-gutter-sm">
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
                  label="Or paste tag text"
                  bg-color="grey-1"
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
              <div class="text-caption text-grey-6">Add gallery images during creation.</div>
            </div>

            <q-file
              v-model="selectedFilesModel"
              accept="image/*"
              outlined
              dense
              multiple
              label="Asset Images (Optional)"
              clearable
              bg-color="grey-1"
              @update:model-value="onFilesSelected"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <div v-if="imagePreviews.length > 0" class="row q-col-gutter-sm">
              <div v-for="(preview, index) in imagePreviews" :key="`${preview.name}-${index}`" class="col-6 col-md-3">
                <q-card flat bordered>
                  <q-img :src="preview.url" style="height: 100px" fit="cover" />
                  <q-card-actions align="right" class="q-pa-xs">
                    <q-btn flat dense round icon="delete" color="negative" @click="removeImage(index)" />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </section>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref, computed, watch } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { extractPropertyId } from '../utils/propertyIdUtils'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
  propertyName: {
    type: String,
    default: '',
  },
  allowPropertyEdit: {
    type: Boolean,
    default: true,
  },
  prefill: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['asset-created', 'cancel'])
const userDataStore = useUserDataStore()
const { createDocument, uploadImagesWithDetails, loading } = useFirebase()
const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const selectedPropertyId = ref('')
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label: property.nickname || property.displayName || property.address || property.id,
    value: property.id || property.property_id,
  }))
)
const fixedPropertyId = computed(() => String(props.propertyId || '').trim())
const hasMatchedFixedProperty = computed(() =>
  propertyOptions.value.some((option) => String(option.value || '').trim() === fixedPropertyId.value)
)
const showPropertySelect = computed(() => props.allowPropertyEdit || !hasMatchedFixedProperty.value)
const resolvedPropertyName = computed(() => {
  const selectedId = extractPropertyId(selectedPropertyId.value) || fixedPropertyId.value
  if (!selectedId) return props.propertyName || ''
  const match = propertyOptions.value.find(
    (option) => String(option.value || '').trim() === String(selectedId).trim(),
  )
  return match?.label || props.propertyName || ''
})

const selectedFiles = ref([])
const selectedFilesModel = ref([])
const imagePreviews = ref([])
const tagScanFile = ref(null)
const tagTextInput = ref('')
const analyzingTag = ref(false)

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

const assetData = reactive({
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
})

const onFilesSelected = (files) => {
  cleanupPreviews()
  if (!files) return
  const normalized = Array.isArray(files) ? files : [files]
  selectedFiles.value = normalized
  selectedFilesModel.value = normalized
  imagePreviews.value = normalized.map((file) => ({
    name: file.name,
    file,
    url: URL.createObjectURL(file),
  }))
}

const removeImage = (index) => {
  const preview = imagePreviews.value[index]
  if (preview?.url) URL.revokeObjectURL(preview.url)
  imagePreviews.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
  selectedFilesModel.value = [...selectedFiles.value]
}

const cleanupPreviews = () => {
  imagePreviews.value.forEach((preview) => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
  })
  imagePreviews.value = []
}

const cleanValue = (value) => {
  return value ? value.replace(/^[:\s-]+/, '').trim() : ''
}

const parseDateToInput = (value) => {
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

const parseTagText = (rawText) => {
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

const detectBarcodes = async (file) => {
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

const analyzeTagInput = async () => {
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
      if (parsed[field] && !assetData[field]) {
        assetData[field] = parsed[field]
        updatedCount += 1
      }
    })

    if (updatedCount === 0) {
      Notify.create({
        type: 'info',
        message: 'No new fields detected. Try pasting more tag text.',
        position: 'top',
      })
      return
    }

    Notify.create({
      type: 'positive',
      message: `Auto-filled ${updatedCount} field${updatedCount > 1 ? 's' : ''}.`,
      position: 'top',
    })
  } finally {
    analyzingTag.value = false
  }
}

watch(
  () => props.prefill,
  (value) => {
    if (!value) return
    if (typeof value.nickname === 'string') assetData.nickname = value.nickname
    if (typeof value.type === 'string') assetData.type = value.type
    if (typeof value.location === 'string') assetData.location = value.location
    if (typeof value.brand === 'string') assetData.brand = value.brand
    if (typeof value.model === 'string') assetData.model = value.model
    if (typeof value.serial === 'string') assetData.serial = value.serial
    if (typeof value.mfg_date === 'string') assetData.mfg_date = value.mfg_date
    if (typeof value.acquired_date === 'string') assetData.acquired_date = value.acquired_date
    if (typeof value.notes === 'string') assetData.notes = value.notes
    if (value.property_id) selectedPropertyId.value = String(value.property_id)
  },
  { immediate: true },
)

watch(
  () => props.propertyId,
  (value) => {
    if (!selectedPropertyId.value && value) {
      selectedPropertyId.value = String(value)
    }
  },
  { immediate: true },
)

const onSubmit = async () => {
  try {
    const rawPropertyId = selectedPropertyId.value || props.propertyId
    const finalPropertyId = extractPropertyId(rawPropertyId)

    if (!finalPropertyId) {
      Notify.create({
        type: 'negative',
        message: 'Please select a property',
        position: 'top',
      })
      return
    }

    const now = new Date().toISOString()
    let images = []

    if (selectedFiles.value.length > 0) {
      const uploadResults = await uploadImagesWithDetails(selectedFiles.value, finalPropertyId, 'asset')
      images = uploadResults.map((item) => ({
        url: item.url,
        file_name: item.fileName,
        original_name: item.originalName,
        storage_path: item.storagePath,
        size: item.size,
        uploaded_at: now,
      }))
    }

    const finalLocation =
      assetData.location === 'Other'
        ? assetData.location_other?.trim() || 'Other'
        : assetData.location?.trim() || ''

    const payload = {
      property_id: finalPropertyId,
      nickname: assetData.nickname.trim(),
      type: assetData.type,
      location: finalLocation,
      brand: assetData.brand?.trim() || '',
      model: assetData.model?.trim() || '',
      serial: assetData.serial?.trim() || '',
      mfg_date: assetData.mfg_date || '',
      acquired_date: assetData.acquired_date || '',
      notes: assetData.notes?.trim() || '',
      status: 'active',
      images,
      created_at: now,
      updated_at: now,
      created_by: userDataStore.userId || '',
    }

    const assetId = await createDocument(`properties/${finalPropertyId}/assets`, payload)
    emit('asset-created', { id: assetId, ...payload })
  } catch (error) {
    console.error('Error creating asset:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to create asset.',
      position: 'top',
    })
  }
}

onUnmounted(() => {
  cleanupPreviews()
})
</script>

<style scoped>
.create-asset {
  max-width: 1200px;
  margin: 0 auto;
}

.elevated {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.asset-create-panel {
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.82), rgba(255, 255, 255, 0.98));
  padding: 16px;
}

.asset-create-panel__header {
  margin-bottom: 12px;
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-asset .elevated,
:global(body.body--dark) .create-asset .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-asset .bg-grey-1,
:global(body.body--dark) .create-asset .q-field__control {
  background: #223041 !important;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}
</style>
