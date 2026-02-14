<template>
  <div class="create-asset">
    <q-card flat>
      <q-card-section class="q-pa-sm">
        <div class="text-h6 text-primary q-mb-xs">
          <q-icon name="inventory_2" class="q-mr-sm" />
          Add Asset
        </div>
        <div class="text-caption text-grey-7">
          Property: {{ propertyName || 'Selected Property' }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-sm">
          <q-input
            v-model="assetData.nickname"
            label="Nickname *"
            outlined
            dense
            :rules="[(val) => !!val || 'Nickname is required']"
          />

          <q-select
            v-model="assetData.type"
            :options="assetTypeOptions"
            label="Type *"
            outlined
            dense
            :rules="[(val) => !!val || 'Type is required']"
          />

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
          />

          <q-input
            v-if="assetData.location === 'Other'"
            v-model="assetData.location_other"
            label="Custom Location"
            outlined
            dense
          />

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input v-model="assetData.brand" label="Brand" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="assetData.model" label="Model" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="assetData.serial" label="Serial Number" outlined dense />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input v-model="assetData.mfg_date" label="MFG Date" type="date" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="assetData.acquired_date"
                label="Acquired Date"
                type="date"
                outlined
                dense
              />
            </div>
          </div>

          <q-input v-model="assetData.notes" label="Notes" type="textarea" rows="2" outlined dense />

          <q-separator />

          <div>
            <div class="text-subtitle2 q-mb-sm">Product Tag Auto-Fill (Beta)</div>
            <div class="row q-col-gutter-sm">
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

          <q-file
            v-model="selectedFilesModel"
            accept="image/*"
            outlined
            dense
            multiple
            label="Asset Images (Optional)"
            clearable
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

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancel" @click="emit('cancel')" />
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Create Asset"
              icon="add"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'

const props = defineProps({
  propertyId: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['asset-created', 'cancel'])
const userDataStore = useUserDataStore()
const { createDocument, uploadImagesWithDetails, loading } = useFirebase()

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

const onSubmit = async () => {
  if (!props.propertyId) return

  try {
    const now = new Date().toISOString()
    let images = []

    if (selectedFiles.value.length > 0) {
      const uploadResults = await uploadImagesWithDetails(selectedFiles.value, props.propertyId, 'asset')
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
      property_id: props.propertyId,
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

    const assetId = await createDocument(`properties/${props.propertyId}/assets`, payload)
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
  max-width: 900px;
}
</style>
