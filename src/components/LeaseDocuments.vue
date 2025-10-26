<template>
  <div class="lease-documents">
    <q-card class="documents-card">
      <q-card-section class="documents-header">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold text-primary">
              <q-icon name="folder" class="q-mr-sm" />
              Lease Documents
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Upload and manage documents and pictures related to this lease
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="emit('close')" class="dialog-close-btn" />
        </div>
      </q-card-section>

      <q-card-section class="documents-content">
        <!-- Upload Section -->
        <div class="upload-section q-mb-lg">
          <div class="section-header">
            <div class="text-subtitle1 text-weight-medium">Upload New Document</div>
          </div>

          <q-form @submit="uploadDocument" class="upload-form">
            <div class="upload-fields">
              <!-- File Upload -->
              <div class="upload-field">
                <q-file
                  v-model="uploadFile"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  outlined
                  dense
                  label="Choose file *"
                  bg-color="grey-1"
                  :rules="[(val) => !!val || 'File is required']"
                  @update:model-value="onFileSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>

              <!-- Document Name -->
              <div class="upload-field">
                <q-input
                  v-model="documentData.name"
                  label="Document Name *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Document name is required']"
                  placeholder="e.g., Lease Agreement, Property Photos, etc."
                />
              </div>

              <!-- Description -->
              <div class="upload-field">
                <q-input
                  v-model="documentData.description"
                  label="Description"
                  type="textarea"
                  rows="3"
                  outlined
                  dense
                  placeholder="Brief description of the document..."
                />
              </div>

              <!-- Upload Button -->
              <div class="upload-actions">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="cloud_upload"
                  label="Upload Document"
                  :loading="uploading"
                  :disable="!uploadFile || !documentData.name"
                />
              </div>
            </div>
          </q-form>
        </div>

        <!-- Documents List -->
        <div class="documents-list-section">
          <div class="section-header">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-medium">
                Documents ({{ documents.length }})
              </div>
              <q-btn
                flat
                round
                dense
                icon="refresh"
                color="primary"
                @click="loadDocuments"
                :loading="loading"
                size="sm"
              >
                <q-tooltip>Refresh documents</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-documents q-mt-md">
            <div class="text-center q-pa-md">
              <q-spinner-dots size="40px" color="primary" />
              <div class="text-body2 text-grey-6 q-mt-sm">Loading documents...</div>
            </div>
          </div>

          <!-- Documents Grid -->
          <div v-else-if="documents.length > 0" class="documents-grid q-mt-md">
            <div v-for="doc in documents" :key="doc.id" class="document-card">
              <!-- Document Header -->
              <div class="document-header">
                <div class="document-icon">
                  <q-icon
                    :name="getDocumentIcon(doc.file_type)"
                    size="32px"
                    :color="getDocumentColor(doc.file_type)"
                  />
                </div>
                <div class="document-actions">
                  <q-btn
                    flat
                    round
                    icon="download"
                    size="sm"
                    color="primary"
                    @click="downloadDocument(doc)"
                  >
                    <q-tooltip>Download</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    color="negative"
                    @click="confirmDeleteDocument(doc)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Document Content -->
              <div class="document-content">
                <div class="document-name-row">
                  <div class="document-name">{{ doc.name }}</div>
                  <q-chip
                    v-if="doc.source === 'application'"
                    size="sm"
                    color="blue-2"
                    text-color="blue-9"
                    icon="description"
                    dense
                  >
                    From Application
                    <q-tooltip>
                      Copied from application on {{ formatDate(doc.copied_at) }}
                    </q-tooltip>
                  </q-chip>
                </div>
                <div class="document-description">
                  {{ doc.description || 'No description' }}
                </div>
                <div class="document-meta">
                  <div class="meta-item">
                    <q-icon name="event" size="14px" class="q-mr-xs" />
                    {{ formatDate(doc.upload_date) }}
                  </div>
                  <div class="meta-item">
                    <q-icon name="folder" size="14px" class="q-mr-xs" />
                    {{ doc.file_type.toUpperCase() }}
                  </div>
                  <div v-if="doc.file_size" class="meta-item">
                    <q-icon name="storage" size="14px" class="q-mr-xs" />
                    {{ formatFileSize(doc.file_size) }}
                  </div>
                </div>
              </div>

              <!-- Image Preview (for images) -->
              <div v-if="isImage(doc.file_type)" class="document-preview">
                <q-img
                  :src="doc.file_url"
                  class="preview-image"
                  fit="cover"
                  @click="showImageFullscreen(doc.file_url, doc.name)"
                >
                  <template v-slot:loading>
                    <q-spinner-gears color="primary" />
                  </template>
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      <q-icon name="broken_image" size="24px" />
                    </div>
                  </template>
                </q-img>
                <div class="preview-overlay">
                  <q-icon name="zoom_in" size="20px" color="white" />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-documents">
            <q-icon name="description" size="48px" color="grey-4" />
            <div class="text-body2 text-grey-6 q-mt-sm">No documents uploaded yet</div>
            <div class="text-caption text-grey-5">Upload documents and pictures for this lease</div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="documents-actions">
        <q-btn flat label="Close" @click="emit('close')" />
      </q-card-actions>
    </q-card>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Delete Document</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete "{{ documentToDelete?.name }}"? This action cannot be
          undone.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeleteDialog = false" />
          <q-btn color="negative" label="Delete" :loading="deleting" @click="deleteDocument" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Fullscreen Image Viewer -->
    <q-dialog v-model="showImageViewer" maximized>
      <q-card class="image-viewer-card">
        <q-card-section class="image-viewer-header">
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">{{ currentImageTitle }}</div>
            <q-btn flat round icon="close" @click="closeImageViewer" class="close-btn" />
          </div>
        </q-card-section>
        <q-card-section class="image-viewer-content">
          <q-img :src="currentImageUrl" class="fullscreen-image" fit="contain">
            <template v-slot:loading>
              <q-spinner-gears color="primary" size="50px" />
            </template>
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                <div class="text-center">
                  <q-icon name="broken_image" size="64px" />
                  <div class="q-mt-sm">Failed to load image</div>
                </div>
              </div>
            </template>
          </q-img>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

// Props
const props = defineProps({
  leaseId: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
})

// Emits
const emit = defineEmits(['close'])

// Composables
const {
  createDocument,
  deleteDocument: deleteFirestoreDocument,
  // uploadImages,
  uploadImagesWithDetails,
  deleteFile,
  getAllDocuments,
} = useFirebase()

// Reactive data
const uploading = ref(false)
const deleting = ref(false)
const loading = ref(false)
const uploadFile = ref(null)
const documents = ref([])
const documentData = ref({
  name: '',
  description: '',
})

// Delete dialog
const showDeleteDialog = ref(false)
const documentToDelete = ref(null)

// Image viewer
const showImageViewer = ref(false)
const currentImageUrl = ref('')
const currentImageTitle = ref('')

// File upload handling
const onFileSelected = (file) => {
  if (file && !documentData.value.name) {
    // Auto-fill document name with filename (without extension)
    const fileName = file.name
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
    documentData.value.name = nameWithoutExtension
  }
}

// Upload document
const uploadDocument = async () => {
  if (!uploadFile.value) return

  try {
    uploading.value = true

    // Upload file to Firebase Storage
    const uploadResults = await uploadImagesWithDetails(
      [uploadFile.value],
      props.propertyId,
      'lease_docs',
    )

    if (!uploadResults || uploadResults.length === 0) {
      throw new Error('Failed to upload file')
    }

    const uploadResult = uploadResults[0]
    const fileUrl = uploadResult.url
    const storagePath = uploadResult.storagePath
    const fileExtension = uploadFile.value.name.split('.').pop()?.toLowerCase() || 'unknown'

    // Create document metadata
    const docData = {
      lease_id: props.leaseId,
      property_id: props.propertyId,
      name: documentData.value.name,
      description: documentData.value.description,
      file_url: fileUrl,
      storage_path: storagePath,
      file_type: fileExtension,
      file_size: uploadFile.value.size,
      original_filename: uploadFile.value.name,
      upload_date: new Date().toISOString(),
      created_datetime: new Date().toISOString(),
    }

    // Save to Firestore subcollection
    const result = await createDocument(
      `properties/${props.propertyId}/leases/${props.leaseId}/lease_docs`,
      docData,
    )

    // Add to local array
    documents.value.push({ id: result.id, ...docData })

    // Reset form
    uploadFile.value = null
    documentData.value = {
      name: '',
      description: '',
    }

    Notify.create({
      type: 'positive',
      message: 'Document uploaded successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to upload document. Please try again.',
      position: 'top',
    })
  } finally {
    uploading.value = false
  }
}

// Load existing documents
const loadDocuments = async () => {
  try {
    loading.value = true
    console.log('Loading documents for lease:', props.leaseId, 'property:', props.propertyId)
    const collectionPath = `properties/${props.propertyId}/leases/${props.leaseId}/lease_docs`
    console.log('Collection path:', collectionPath)

    const docs = await getAllDocuments(collectionPath)
    console.log('Loaded documents:', docs)

    documents.value = docs || []
    console.log('Documents array updated:', documents.value.length, 'documents')
  } catch (error) {
    console.error('Error loading documents:', error)
    documents.value = []
  } finally {
    loading.value = false
  }
}

// Confirm delete document
const confirmDeleteDocument = (doc) => {
  documentToDelete.value = doc
  showDeleteDialog.value = true
}

// Delete document
const deleteDocument = async () => {
  if (!documentToDelete.value) return

  try {
    deleting.value = true

    console.log('Deleting document:', documentToDelete.value)

    // Delete from Firebase Storage if storage path exists
    if (documentToDelete.value.storage_path) {
      try {
        console.log('Deleting file from storage:', documentToDelete.value.storage_path)
        await deleteFile(documentToDelete.value.storage_path)
        console.log('File deleted from storage successfully')
      } catch (storageError) {
        console.warn(
          'Failed to delete file from storage (continuing with Firestore deletion):',
          storageError,
        )
        // Continue with Firestore deletion even if storage deletion fails
      }
    } else {
      console.warn('No storage path found for document, skipping storage deletion')
    }

    // Delete from Firestore
    await deleteFirestoreDocument(
      `properties/${props.propertyId}/leases/${props.leaseId}/lease_docs`,
      documentToDelete.value.id,
    )

    // Remove from local array
    const index = documents.value.findIndex((doc) => doc.id === documentToDelete.value.id)
    if (index !== -1) {
      documents.value.splice(index, 1)
    }

    showDeleteDialog.value = false
    documentToDelete.value = null

    Notify.create({
      type: 'positive',
      message: 'Document deleted successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to delete document. Please try again.',
      position: 'top',
    })
  } finally {
    deleting.value = false
  }
}

// Download document
const downloadDocument = (doc) => {
  const link = document.createElement('a')
  link.href = doc.file_url
  link.download = doc.original_filename || doc.name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Image viewer functions
const showImageFullscreen = (imageUrl, title) => {
  currentImageUrl.value = imageUrl
  currentImageTitle.value = title
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
  currentImageTitle.value = ''
}

// Utility functions
const getDocumentIcon = (fileType) => {
  const icons = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    txt: 'text_snippet',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
  }
  return icons[fileType.toLowerCase()] || 'insert_drive_file'
}

const getDocumentColor = (fileType) => {
  const colors = {
    pdf: 'red-6',
    doc: 'blue-6',
    docx: 'blue-6',
    txt: 'grey-6',
    jpg: 'green-6',
    jpeg: 'green-6',
    png: 'green-6',
    gif: 'green-6',
    bmp: 'green-6',
    webp: 'green-6',
  }
  return colors[fileType.toLowerCase()] || 'grey-6'
}

const isImage = (fileType) => {
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType.toLowerCase())
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size'
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Initialize
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.documents-card {
  max-width: 1000px;
  margin: 0 auto;
}

.documents-header {
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.upload-form {
  background: var(--bg-surface);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  padding: 20px;
}

.upload-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.upload-field {
  width: 100%;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.document-card {
  background: var(--bg-surface);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  padding: 16px;
  transition: all 0.3s ease;
}

.document-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.document-icon {
  flex-shrink: 0;
}

.document-actions {
  display: flex;
  gap: 4px;
}

.document-content {
  margin-bottom: 12px;
}

.document-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.document-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-800);
  line-height: 1.3;
  flex: 1;
}

.document-description {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin-bottom: 8px;
  line-height: 1.4;
}

.document-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--neutral-500);
}

.document-preview {
  position: relative;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.document-preview:hover .preview-overlay {
  opacity: 1;
}

.empty-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--neutral-300);
}

.documents-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
  justify-content: flex-end;
}

/* Image viewer styles */
.image-viewer-card {
  background: #000;
}

.image-viewer-header {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
}

.image-viewer-content {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.fullscreen-image {
  width: 100%;
  height: 100%;
}

.close-btn {
  color: white;
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }

  .upload-fields {
    grid-template-columns: 1fr;
  }

  .document-header {
    flex-direction: column;
    gap: 8px;
  }

  .document-actions {
    align-self: flex-end;
  }
}

/* Dialog Close Button Styling */
.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}
</style>
