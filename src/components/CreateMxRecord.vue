<template>
  <div class="create-mxrecord animate-fade-in">
    <q-card class="elevated">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-weight-bold text-primary q-mb-sm">
          <q-icon name="dns" class="q-mr-sm" />
          Create New MX Record
        </div>
        <div v-if="propertyId" class="text-caption text-grey-6 q-mb-xs">
          Property: {{ propertyName }}
        </div>
        <q-select
          v-else
          v-model="selectedPropertyId"
          :options="availableProperties"
          option-label="nickname"
          option-value="id"
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
        <div v-if="!propertyId" class="text-caption text-grey-6 q-mb-xs">
          <div v-if="propertiesLoading" class="text-primary">Loading properties...</div>
          <div v-if="!propertiesLoading && availableProperties.length === 0" class="text-primary">
            No properties found. Check console for details.
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-sm">
          <div class="row q-gutter-sm">
            <q-input
              v-model="mxRecordData.description"
              label="Description"
              outlined
              dense
              required
              :rules="[(val) => !!val || 'Description is required']"
              type="textarea"
              rows="4"
              class="col-12"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
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
              @click="onCancel"
              color="grey-7"
              label="Cancel"
              flat
              class="col-12 col-md-6"
              size="md"
            >
              <template v-slot:prepend>
                <q-icon name="close" />
              </template>
            </q-btn>
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Create MX Record"
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
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
})

const route = useRoute()
const propertyId = computed(() => {
  return props.propertyId || route.params.propertyId
})
const propertyName = computed(() => {
  return route.query.propertyName || 'Unknown Property'
})

const emit = defineEmits(['mxrecord-created', 'cancel'])
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, uploadImages } = useFirebase()

const availableProperties = computed(() => userDataStore.userAccessibleProperties)
const selectedPropertyId = ref('')
const propertiesLoading = computed(() => userDataStore.propertiesLoading)

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

const onSubmit = async () => {
  try {
    console.log('=== MX Record Creation Started ===')
    const finalPropertyId = propertyId.value || selectedPropertyId.value
    console.log('CreateMxRecord onSubmit - propertyId.value:', propertyId.value)
    console.log('CreateMxRecord onSubmit - selectedPropertyId.value:', selectedPropertyId.value)
    console.log('CreateMxRecord onSubmit - finalPropertyId:', finalPropertyId)
    console.log('CreateMxRecord onSubmit - availableProperties:', availableProperties.value)
    console.log('CreateMxRecord onSubmit - userDataStore.userId:', userDataStore.userId)

    if (!finalPropertyId) {
      console.error('No property selected')
      return
    }

    const currentTimestamp = new Date()

    // Handle image uploads if files are selected
    let imageUrls = []
    const filesToUpload = imagePreviews.value.map((preview) => preview.file)
    if (filesToUpload.length > 0) {
      try {
        console.log(`Uploading ${filesToUpload.length} images for MX record...`)
        imageUrls = await uploadImages(filesToUpload, finalPropertyId, 'mxrecord')
        console.log('Images uploaded successfully to Firebase Storage:', imageUrls)
      } catch (error) {
        console.error('Error uploading images to Firebase Storage:', error)
        // Continue with MX record creation even if image upload fails
        import('quasar').then(({ Notify }) => {
          Notify.create({
            type: 'warning',
            message: 'Images could not be uploaded, but MX record will still be created',
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
    console.log('=== MX Record Creation Completed Successfully ===')

    // Reset form
    mxRecordData.description = ''
    mxRecordData.report_date = new Date().toISOString().split('T')[0]
    mxRecordData.status = 'open'
    mxRecordData.image_urls = []

    // Reset image upload fields
    removeAllImages()

    emit('mxrecord-created', { id: mxRecordId, ...mxRecordData })

    // Navigate back to MX Records page
    router.push('/mx-records')
  } catch (error) {
    console.error('=== MX Record Creation Failed ===')
    console.error('Error creating MX record:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
    // You might want to show a user-friendly error message here
  }
}

const onCancel = () => {
  emit('cancel')
  // Navigate back to MX Records page
  router.push('/mx-records')
}
</script>

<style scoped>
.create-mxrecord {
  max-width: 600px;
  margin: 0 auto;
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

.picture-upload-section {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
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
