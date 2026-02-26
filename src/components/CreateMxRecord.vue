<template>
  <div class="create-mxrecord animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="text-h6 text-weight-bold text-primary q-mb-sm">
          <q-icon name="dns" class="q-mr-sm" />
          Create New Task
        </div>
        <div class="text-caption text-grey-7 q-mb-sm">
          Capture task details and optional evidence photos in one step.
        </div>
        <div v-if="hasMatchedFixedProperty" class="text-caption text-grey-6 q-mb-xs">
          Property: {{ resolvedFixedPropertyName }}
        </div>
        <div v-else class="section-label q-mb-xs">Property Context</div>
        <q-select
          v-if="!hasMatchedFixedProperty"
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
          class="q-mb-xs"
          :loading="propertiesLoading"
          bg-color="grey-1"
        >
          <template v-slot:prepend>
            <q-icon name="home" color="primary" />
          </template>
        </q-select>
        <div v-if="!hasMatchedFixedProperty" class="text-caption text-grey-6 q-mb-xs">
          <div v-if="fixedPropertyId && !hasMatchedFixedProperty" class="text-warning q-mb-xs">
            Fixed property context is invalid, please choose from your accessible properties.
          </div>
          <div v-if="propertiesLoading" class="text-primary">Loading properties...</div>
          <div v-if="!propertiesLoading && propertyOptions.length === 0" class="text-primary">
            No properties found. Check console for details.
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-sm">
          <div class="section-label q-mb-xs">Task Details</div>
          <div class="row q-gutter-sm">
            <q-input
              v-model="mxRecordData.description"
              label="Task Description"
              outlined
              autogrow
              required
              :rules="[(val) => !!String(val || '').trim() || 'Description is required']"
              type="textarea"
              :input-style="{ minHeight: '110px' }"
              class="col-12"
              bg-color="grey-1"
            />
          </div>

          <div class="row q-gutter-sm">
            <q-input
              v-model="mxRecordData.report_date"
              label="Report Date"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Report date is required']"
              type="date"
              class="col-12 col-md-6"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
            <q-select
              v-model="mxRecordData.status"
              :options="statusOptions"
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

          <!-- Picture Upload Section -->
          <div class="picture-upload-section">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="photo_camera" class="q-mr-xs" />
              Attach Picture (Optional)
            </div>

            <q-file
              v-model="selectedFiles"
              accept="image/*"
              outlined
              dense
              multiple
              label="Choose pictures"
              hint="Upload photos of the issue (multiple files allowed)"
              bg-color="grey-1"
              class="q-mb-sm"
              @update:model-value="onFilesSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Image Previews -->
            <div v-if="imagePreviews.length > 0" class="image-previews q-mb-sm">
              <div class="text-caption q-mb-xs">
                Previews ({{ imagePreviews.length }} image{{
                  imagePreviews.length > 1 ? 's' : ''
                }}):
              </div>
              <div class="row q-gutter-sm">
                <div
                  v-for="(preview, index) in imagePreviews"
                  :key="index"
                  class="image-preview-item"
                >
                  <q-img
                    :src="preview.url"
                    style="width: 120px; height: 120px"
                    class="rounded-borders"
                    fit="cover"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    color="negative"
                    size="sm"
                    class="absolute-top-right q-ma-xs"
                    @click="removeImage(index)"
                  />
                  <div class="text-caption text-center q-mt-xs">
                    {{ preview.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mt-sm">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Create Task"
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
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
  propertyName: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const propertyId = computed(() => {
  return props.propertyId || route.params.propertyId
})
const propertyName = computed(() => {
  return props.propertyName || route.query.propertyName || 'Unknown Property'
})

const emit = defineEmits(['mxrecord-created', 'cancel'])
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, uploadImages } = useFirebase()
const loading = ref(false)

const availableProperties = computed(() => userDataStore.userAccessibleProperties || [])
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label: property.nickname || property.displayName || property.address || property.id,
    value: property.id || property.property_id,
  })),
)
const selectedPropertyId = ref('')
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const fixedPropertyId = computed(() => String(propertyId.value || '').trim())
const matchedFixedProperty = computed(() =>
  availableProperties.value.find(
    (property) => String(property.id || property.property_id || '').trim() === fixedPropertyId.value,
  ) || null,
)
const hasMatchedFixedProperty = computed(() => Boolean(matchedFixedProperty.value))
const resolvedFixedPropertyName = computed(() =>
  matchedFixedProperty.value
    ? matchedFixedProperty.value.nickname ||
      matchedFixedProperty.value.displayName ||
      matchedFixedProperty.value.address ||
      propertyName.value
    : propertyName.value,
)

const mxRecordData = reactive({
  description: '',
  report_date: new Date().toISOString().split('T')[0],
  status: 'open',
  image_urls: [], // Will store the uploaded image URLs
})

// File upload related data
const selectedFiles = ref([])
const imagePreviews = ref([])

const statusOptions = ['open', 'closed', 'cancel']

// File upload functions
const onFilesSelected = (files) => {
  console.log('Files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index) => {
  imagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  selectedFiles.value = imagePreviews.value.map((preview) => preview.file)
}

const removeAllImages = () => {
  selectedFiles.value = []
  imagePreviews.value = []
  mxRecordData.image_urls = []
}

// Function to upload multiple images to Firebase Storage is now imported from useFirebase

onMounted(() => {
  console.log('CreateMxRecord mounted, propertyId:', propertyId.value)
  // Data is automatically loaded by the store when user is authenticated
})

const resolvePropertyId = () => {
  const fromProp = hasMatchedFixedProperty.value ? fixedPropertyId.value : ''
  const fromSelect = selectedPropertyId.value
  const raw =
    (typeof fromProp === 'object' ? fromProp?.id || fromProp?.property_id : fromProp) ||
    (typeof fromSelect === 'object'
      ? fromSelect?.id || fromSelect?.value || fromSelect?.property_id
      : fromSelect)
  return String(raw || '').trim()
}

watch(
  propertyOptions,
  (options) => {
    if (!hasMatchedFixedProperty.value && !selectedPropertyId.value && options.length > 0) {
      selectedPropertyId.value = options[0].value
    }
  },
  { immediate: true },
)

const onSubmit = async () => {
  loading.value = true
  try {
    console.log('=== Task Creation Started ===')
    const finalPropertyId = resolvePropertyId()
    console.log('CreateMxRecord onSubmit - propertyId.value:', propertyId.value)
    console.log('CreateMxRecord onSubmit - selectedPropertyId.value:', selectedPropertyId.value)
    console.log('CreateMxRecord onSubmit - finalPropertyId:', finalPropertyId)
    console.log('CreateMxRecord onSubmit - availableProperties:', availableProperties.value)
    console.log('CreateMxRecord onSubmit - userDataStore.userId:', userDataStore.userId)

    if (!finalPropertyId) {
      console.error('No property selected')
      Notify.create({
        type: 'warning',
        message: 'Please select a valid property before creating a task.',
        position: 'top',
      })
      return
    }

    const matchedProperty = availableProperties.value.find(
      (property) => String(property.id || property.property_id || '').trim() === finalPropertyId,
    )
    if (!matchedProperty) {
      Notify.create({
        type: 'negative',
        message: 'Selected property does not match your accessible properties. Please reselect and try again.',
        position: 'top',
      })
      return
    }

    const currentTimestamp = new Date()

    // Handle image uploads if files are selected
    let imageUrls = []
    const filesToUpload = imagePreviews.value.map((preview) => preview.file)
    if (filesToUpload.length > 0) {
      try {
        console.log(`Uploading ${filesToUpload.length} images for task...`)
        imageUrls = await uploadImages(filesToUpload, finalPropertyId, 'mxrecord')
        console.log('Images uploaded successfully to Firebase Storage:', imageUrls)
      } catch (error) {
        console.error('Error uploading images to Firebase Storage:', error)
        // Continue with task creation even if image upload fails
        import('quasar').then(({ Notify }) => {
          Notify.create({
            type: 'warning',
            message: 'Images could not be uploaded, but task will still be created',
            position: 'top',
          })
        })
      }
    }

    const mxRecordDataToSave = {
      create_id: userDataStore.userId,
      createAt: currentTimestamp,
      report_date: mxRecordData.report_date,
      description: mxRecordData.description,
      status: mxRecordData.status,
      logs: [
        {
          log_timestamp: currentTimestamp,
          comment: 'Initial report submitted',
          user_id: userDataStore.userId,
          user_name: userDataStore.user?.displayName || userDataStore.user?.email || 'Unknown User',
          user_role: userDataStore.getUserRoleForProperty(finalPropertyId)?.role || 'Unknown Role',
        },
      ],
      mx_id: `mx_${Date.now()}`,
      property_id: finalPropertyId,
      reported_by: userDataStore.user?.displayName || userDataStore.user?.email || 'Unknown User',
      reported_role: userDataStore.getUserRoleForProperty(finalPropertyId)?.role || 'Unknown Role',
      image_urls: imageUrls, // Add the uploaded image URLs array
      updatedAt: currentTimestamp,
    }

    console.log('CreateMxRecord onSubmit - mxRecordDataToSave:', mxRecordDataToSave)
    console.log(
      'CreateMxRecord onSubmit - Firebase path:',
      `properties/${finalPropertyId}/mxrecords`,
    )

    // Save to property subcollection: properties/{propertyId}/mxrecords
    console.log('CreateMxRecord onSubmit - Calling createDocument...')
    const mxRecordId = await createDocument(
      `properties/${finalPropertyId}/mxrecords`,
      mxRecordDataToSave,
    )
    console.log('CreateMxRecord onSubmit - mxRecordId created:', mxRecordId)
    console.log('=== Task Creation Completed Successfully ===')

    const createdRecordPayload = { id: mxRecordId, ...mxRecordDataToSave }

    // Notify parent pages to refresh list data
    emit('mxrecord-created', createdRecordPayload)

    // Reset form
    mxRecordData.description = ''
    mxRecordData.report_date = new Date().toISOString().split('T')[0]
    mxRecordData.status = 'open'
    mxRecordData.image_urls = []

    // Reset image upload fields
    removeAllImages()

    // Navigate back to tasks page
    router.push('/mx-records')
  } catch (error) {
    console.error('=== Task Creation Failed ===')
    console.error('Error creating task:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to create task. Please try again.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-mxrecord {
  max-width: 760px;
  margin: 0 auto;
}

.elevated {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.q-btn {
  transition: var(--transition);
}

.q-btn:hover {
  transform: translateY(-2px);
}

.picture-upload-section {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background-color: #fafcff;
}

.image-previews {
  max-height: 300px;
  overflow-y: auto;
}

.image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-item:hover .q-img {
  border-color: #1976d2;
}
</style>
