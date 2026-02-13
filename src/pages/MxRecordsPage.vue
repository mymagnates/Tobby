<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Tasks</div>
      <div class="row q-gutter-sm">
        <q-btn @click="openCreateMxRecordDialog" color="primary" icon="add" label="Create Task" />
      </div>
    </div>

    <!-- Filters Row -->
    <div class="row q-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search tasks..."
          clearable
          bg-color="grey-1"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedProperty"
          :options="propertyFilterOptions"
          label="Filter by Property"
          outlined
          dense
          clearable
          bg-color="grey-1"
          option-label="label"
          option-value="value"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="home" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="dateFilter"
          :options="dateFilterOptions"
          label="Filter by Time"
          outlined
          dense
          clearable
          bg-color="grey-1"
        >
          <template v-slot:prepend>
            <q-icon name="date_range" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="row q-gutter-md q-mb-md">
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'all' }"
        @click="setFilter('all')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ filteredMxRecords.length }}</div>
          <div class="text-caption">Total Tasks</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'open' }"
        @click="setFilter('open')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ openRecords.length }}</div>
          <div class="text-caption">Open</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'Closed' }"
        @click="setFilter('Closed')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-green">{{ closedRecords.length }}</div>
          <div class="text-caption">Closed</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'cancel' }"
        @click="setFilter('cancel')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-red">{{ cancelRecords.length }}</div>
          <div class="text-caption">Cancelled</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Active Filter Display -->
    <div v-if="activeFilter !== 'all'" class="q-mb-md">
      <q-chip
        :color="getFilterColor(activeFilter)"
        text-color="white"
        removable
        @remove="clearFilter"
      >
        <q-icon :name="getFilterIcon(activeFilter)" class="q-mr-xs" />
        {{ getFilterLabel(activeFilter) }}
        <q-badge color="white" text-color="black" class="q-ml-xs">
          {{ getFilteredCount() }}
        </q-badge>
      </q-chip>
    </div>

    <div v-if="userDataStore.mxRecordsLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Loading tasks...</div>
    </div>

    <div v-else-if="filteredMxRecords.length === 0" class="text-center q-pa-lg">
      <q-icon name="dns" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{ searchQuery ? 'No tasks found matching your search' : 'No tasks found' }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          searchQuery
            ? 'Try adjusting your search terms'
            : "You don't have any tasks for your properties yet."
        }}
      </div>
    </div>

    <div v-else class="mx-records-list">
      <q-card
        v-for="mxRecord in filteredMxRecords"
        :key="mxRecord.id"
        class="mxrecord-row clickable-row"
        @click="viewMxRecord(mxRecord)"
      >
        <q-card-section class="mxrecord-row-content">
          <!-- Property and Description -->
          <div class="mxrecord-description">
            <div class="description-title">{{ getPropertyName(mxRecord.property_id) }}</div>
          </div>
          <div class="mxrecord-description">
            <div class="description-property">{{ mxRecord.description || 'No Description' }}</div>
          </div>

          <!-- Date -->
          <div class="mxrecord-date">
            <div class="date-label">Reported</div>
            <div class="date-value">{{ formatDate(mxRecord.report_date) }}</div>
          </div>

          <!-- Reported By -->
          <div class="mxrecord-reporter">
            <div class="reporter-label">Reported By</div>
            <div class="reporter-value">{{ mxRecord.reported_by || 'Unknown' }}</div>
            <div class="reporter-role">{{ mxRecord.reported_role || 'Unknown Role' }}</div>
          </div>

          <!-- Status -->
          <div class="mxrecord-status">
            <q-chip
              :color="getStatusColor(mxRecord.status)"
              text-color="white"
              size="md"
              class="status-chip"
            >
              {{ mxRecord.status || 'open' }}
            </q-chip>
          </div>

          <!-- Add Comment Button (only action remaining) -->
          <div class="mxrecord-actions">
            <q-btn
              outline
              color="primary"
              label="Add Comment"
              class="action-btn"
              @click.stop="addComment(mxRecord)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>

  <!-- Task Details Dialog -->
  <q-dialog v-model="showMxRecordDialog" maximized>
    <q-card class="mxrecord-dialog">
      <q-card-section class="dialog-header">
        <div class="row items-center justify-between">
          <div class="text-h5 text-weight-bold">Task Details</div>
          <div class="row q-gutter-sm">
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeMxRecordDialog"
              class="dialog-close-btn"
            />
            <q-btn
              color="primary"
              text-color="white"
              icon="photo_camera"
              label="Add Photos"
              size="sm"
              class="add-photos-btn"
              @click="addPhotosToMxRecord"
            />
            <q-btn
              outline
              color="primary"
              label="Add Comment"
              class="add-comment-btn"
              @click="addCommentFromDialog"
            />
            <q-btn flat round icon="close" @click="closeMxRecordDialog" class="close-btn" />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="dialog-content">
        <div v-if="selectedMxRecord" class="mxrecord-details-full">
          <!-- Basic Information -->
          <div class="details-section">
            <div class="section-title">Basic Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">MX ID</div>
                <div class="detail-value">{{ selectedMxRecord.mx_id || 'N/A' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">
                  {{ selectedMxRecord.description || 'No Description' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <q-chip
                    :color="getStatusColor(selectedMxRecord.status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ selectedMxRecord.status || 'open' }}
                  </q-chip>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Property</div>
                <div class="detail-value">{{ getPropertyName(selectedMxRecord.property_id) }}</div>
              </div>
            </div>
          </div>

          <!-- Reporting Information -->
          <div class="details-section">
            <div class="section-title">Reporting Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Reported By</div>
                <div class="detail-value">{{ selectedMxRecord.reported_by || 'Unknown' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Reporter Role</div>
                <div class="detail-value">{{ selectedMxRecord.reported_role || 'Unknown' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Report Date</div>
                <div class="detail-value">{{ formatDate(selectedMxRecord.report_date) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Created</div>
                <div class="detail-value">{{ formatDate(selectedMxRecord.createAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div
            v-if="selectedMxRecord.image_urls && selectedMxRecord.image_urls.length > 0"
            class="details-section"
          >
            <div class="section-title">
              <q-icon name="photo_library" class="q-mr-sm" />
              Attached Images ({{ selectedMxRecord.image_urls.length }})
            </div>
            <div class="images-grid">
              <div
                v-for="(imageUrl, index) in selectedMxRecord.image_urls"
                :key="index"
                class="image-preview-container"
              >
                <q-img
                  :src="imageUrl"
                  class="image-preview cursor-pointer"
                  fit="cover"
                  @click="viewImageFullscreen(imageUrl, index)"
                >
                  <div class="absolute-bottom text-caption image-overlay">
                    Image {{ index + 1 }}
                  </div>
                  <q-tooltip>Click to view full size</q-tooltip>
                </q-img>
              </div>
            </div>
          </div>

          <!-- Activity Log -->
          <div
            v-if="selectedMxRecord.logs && selectedMxRecord.logs.length > 0"
            class="details-section"
          >
            <div class="section-title">Activity Log</div>
            <div class="activity-log">
              <div v-for="log in selectedMxRecord.logs" :key="log.log_timestamp" class="log-entry">
                <div class="log-header">
                  <div class="log-user">
                    <strong>{{ log.user_name }}</strong>
                    <span class="log-role">({{ log.user_role }})</span>
                  </div>
                  <div class="log-actions">
                    <q-btn
                      flat
                      dense
                      round
                      icon="photo_camera"
                      color="primary"
                      size="sm"
                      @click="addPhotosToComment(log)"
                      class="add-comment-photos-btn"
                    >
                      <q-tooltip>Add photos to this comment</q-tooltip>
                    </q-btn>
                    <div class="log-time">{{ formatDate(log.log_timestamp) }}</div>
                  </div>
                </div>
                <div class="log-comment">{{ log.comment }}</div>
                <!-- Display existing comment images if any -->
                <div v-if="log.image_urls && log.image_urls.length > 0" class="log-images q-mt-sm">
                  <div class="text-caption q-mb-xs">Attached Images:</div>
                  <div class="row q-gutter-xs">
                    <q-img
                      v-for="(imageUrl, imgIndex) in log.image_urls"
                      :key="imgIndex"
                      :src="imageUrl"
                      style="width: 60px; height: 60px"
                      class="rounded-borders cursor-pointer"
                      fit="cover"
                      @click="
                        viewCommentImageFullscreen(imageUrl, imgIndex, log.image_urls, log.comment)
                      "
                    >
                      <q-tooltip>Click to view full image</q-tooltip>
                    </q-img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Add Comment Dialog -->
  <q-dialog v-model="showCommentDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">Add Comment to Task</div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ selectedMxRecord?.description || 'No Description' }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeCommentDialog"
            class="dialog-close-btn"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="submitComment" class="q-gutter-md">
          <q-input
            v-model="newComment.comment"
            label="Comment"
            type="textarea"
            outlined
            rows="4"
            :rules="[(val) => !!val || 'Comment is required']"
            placeholder="Enter your comment or update about this task..."
          />

          <q-select
            v-model="newComment.action_type"
            :options="actionTypeOptions"
            label="Action Type"
            outlined
            :rules="[(val) => !!val || 'Action type is required']"
            emit-value
            map-options
          />

          <!-- Picture Upload Section for Comments -->
          <div class="comment-picture-upload-section">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="photo_camera" class="q-mr-xs" />
              Attach Pictures (Optional)
            </div>

            <q-file
              v-model="commentSelectedFiles"
              accept="image/*"
              outlined
              dense
              multiple
              label="Choose pictures"
              hint="Upload photos related to this comment"
              bg-color="grey-1"
              class="q-mb-sm"
              @update:model-value="onCommentFilesSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Comment Image Previews -->
            <div v-if="commentImagePreviews.length > 0" class="comment-image-previews q-mb-sm">
              <div class="text-caption q-mb-xs">
                Previews ({{ commentImagePreviews.length }} image{{
                  commentImagePreviews.length > 1 ? 's' : ''
                }}):
              </div>
              <div class="row q-gutter-sm">
                <div
                  v-for="(preview, index) in commentImagePreviews"
                  :key="index"
                  class="comment-image-preview-item"
                >
                  <q-img
                    :src="preview.url"
                    style="width: 80px; height: 80px"
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
                    @click="removeCommentImage(index)"
                  />
                  <div
                    class="text-caption text-center q-mt-xs"
                    style="max-width: 80px; font-size: 0.7rem"
                  >
                    {{
                      preview.name.length > 10
                        ? preview.name.substring(0, 10) + '...'
                        : preview.name
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Add More Photos Button -->
            <div class="text-center q-mt-sm">
              <q-btn
                flat
                color="primary"
                icon="add_photo_alternate"
                label="Add More Photos"
                size="sm"
                @click="addMorePhotosToComment"
                class="add-more-photos-btn"
              >
                <q-tooltip>Select additional photos for this comment</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeCommentDialog" />
        <q-btn
          unelevated
          label="Add Comment"
          color="primary"
          @click="submitComment"
          :loading="submittingComment"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Photos to Task Dialog -->
  <q-dialog v-model="showAddPhotosDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Add Photos to Task</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ selectedMxRecord?.description || 'No Description' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Picture Upload Section for Additional Photos -->
        <div class="additional-picture-upload-section">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            Add More Pictures
          </div>

          <q-file
            v-model="additionalSelectedFiles"
            accept="image/*"
            outlined
            dense
            multiple
            label="Choose pictures"
            hint="Upload additional photos for this task"
            bg-color="grey-1"
            class="q-mb-sm"
            @update:model-value="onAdditionalFilesSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- Additional Image Previews -->
          <div v-if="additionalImagePreviews.length > 0" class="additional-image-previews q-mb-sm">
            <div class="text-caption q-mb-xs">
              Previews ({{ additionalImagePreviews.length }} image{{
                additionalImagePreviews.length > 1 ? 's' : ''
              }}):
            </div>
            <div class="row q-gutter-sm">
              <div
                v-for="(preview, index) in additionalImagePreviews"
                :key="index"
                class="additional-image-preview-item"
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
                  @click="removeAdditionalImage(index)"
                />
                <div
                  class="text-caption text-center q-mt-xs"
                  style="max-width: 120px; font-size: 0.8rem"
                >
                  {{
                    preview.name.length > 15 ? preview.name.substring(0, 15) + '...' : preview.name
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeAddPhotosDialog" />
        <q-btn
          unelevated
          label="Upload Photos"
          color="primary"
          @click="submitAdditionalPhotos"
          :loading="uploadingPhotos"
          :disable="additionalImagePreviews.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Photos to Comment Dialog -->
  <q-dialog v-model="showAddCommentPhotosDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Add Photos to Comment</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ selectedCommentLog?.comment || 'No Comment' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Picture Upload Section for Comment Photos -->
        <div class="comment-additional-picture-upload-section">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            Add Photos to Comment
          </div>

          <q-file
            v-model="commentAdditionalSelectedFiles"
            accept="image/*"
            outlined
            dense
            multiple
            label="Choose pictures"
            hint="Upload photos for this comment"
            bg-color="grey-1"
            class="q-mb-sm"
            @update:model-value="onCommentAdditionalFilesSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- Comment Additional Image Previews -->
          <div
            v-if="commentAdditionalImagePreviews.length > 0"
            class="comment-additional-image-previews q-mb-sm"
          >
            <div class="text-caption q-mb-xs">
              Previews ({{ commentAdditionalImagePreviews.length }} image{{
                commentAdditionalImagePreviews.length > 1 ? 's' : ''
              }}):
            </div>
            <div class="row q-gutter-sm">
              <div
                v-for="(preview, index) in commentAdditionalImagePreviews"
                :key="index"
                class="comment-additional-image-preview-item"
              >
                <q-img
                  :src="preview.url"
                  style="width: 100px; height: 100px"
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
                  @click="removeCommentAdditionalImage(index)"
                />
                <div
                  class="text-caption text-center q-mt-xs"
                  style="max-width: 100px; font-size: 0.75rem"
                >
                  {{
                    preview.name.length > 12 ? preview.name.substring(0, 12) + '...' : preview.name
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeAddCommentPhotosDialog" />
        <q-btn
          unelevated
          label="Upload Photos"
          color="primary"
          @click="submitCommentAdditionalPhotos"
          :loading="uploadingCommentPhotos"
          :disable="commentAdditionalImagePreviews.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Fullscreen Image Viewer Dialog -->
  <q-dialog v-model="showImageViewer" maximized>
    <q-card class="image-viewer-card">
      <q-card-section class="image-viewer-header">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">
              Image {{ currentImageIndex + 1 }} of {{ currentImageList.length }}
            </div>
            <div class="text-caption text-grey-4" v-if="currentImageContext">
              {{ currentImageContext }}
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              v-if="currentImageList.length > 1"
              flat
              round
              icon="keyboard_arrow_left"
              @click="previousImage"
              :disable="currentImageIndex === 0"
              class="image-nav-btn"
            >
              <q-tooltip>Previous image</q-tooltip>
            </q-btn>
            <q-btn
              v-if="currentImageList.length > 1"
              flat
              round
              icon="keyboard_arrow_right"
              @click="nextImage"
              :disable="currentImageIndex === currentImageList.length - 1"
              class="image-nav-btn"
            >
              <q-tooltip>Next image</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="open_in_new"
              @click="viewImage(currentImageUrl)"
              class="image-nav-btn"
            >
              <q-tooltip>Open in new tab</q-tooltip>
            </q-btn>
            <q-btn flat round icon="close" @click="closeImageViewer" class="image-nav-btn" />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="image-viewer-content">
        <div class="image-viewer-container">
          <q-img
            :src="currentImageUrl"
            class="fullscreen-image"
            fit="contain"
            @click="closeImageViewer"
          >
            <q-tooltip>Click to close</q-tooltip>
          </q-img>
        </div>
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
          @mx-record-created="onMxRecordCreated"
          @cancel="closeCreateMxRecordDialog"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import CreateMxRecord from '../components/CreateMxRecord.vue'

const userDataStore = useUserDataStore()
const { updateDocument, uploadImages } = useFirebase()
const searchQuery = ref('')
const activeFilter = ref('all') // 'all', 'pending', 'resolved'
const selectedProperty = ref(null)
const dateFilter = ref(null)

// Filter options
const dateFilterOptions = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'All Time',
]

const propertyFilterOptions = computed(() => {
  return userDataStore.userAccessibleProperties.map((p) => ({
    label: p.nickname || p.address,
    value: p.id,
  }))
})
const showMxRecordDialog = ref(false)
const selectedMxRecord = ref(null)
const showCreateMxRecordDialog = ref(false)
const showCommentDialog = ref(false)
const submittingComment = ref(false)
const newComment = ref({
  comment: '',
  action_type: '',
  image_urls: [], // Will store uploaded image URLs for the comment
})

// Comment file upload related data
const commentSelectedFiles = ref([])
const commentImagePreviews = ref([])

// Additional photos dialog data
const showAddPhotosDialog = ref(false)
const uploadingPhotos = ref(false)
const additionalSelectedFiles = ref([])
const additionalImagePreviews = ref([])

// Comment additional photos dialog data
const showAddCommentPhotosDialog = ref(false)
const uploadingCommentPhotos = ref(false)
const selectedCommentLog = ref(null)
const commentAdditionalSelectedFiles = ref([])
const commentAdditionalImagePreviews = ref([])

const actionTypeOptions = [
  { label: 'Update', value: 'update' },
  { label: 'Comment', value: 'comment' },
  { label: 'Cancel', value: 'cancel' },
  { label: 'Resolution', value: 'resolution' },
]

// Use computed properties from the store
const userAccessibleMxRecords = computed(() => {
  return userDataStore.userAccessibleMxRecords
})

// Filtered tasks based on search query, status filter, property filter, and date filter
const filteredMxRecords = computed(() => {
  let records = userAccessibleMxRecords.value

  // Apply status filter first
  if (activeFilter.value === 'open') {
    records = records.filter((record) => !record.status || record.status === 'open')
  } else if (activeFilter.value === 'closed') {
    records = records.filter((record) => record.status === 'closed')
  } else if (activeFilter.value === 'cancel') {
    records = records.filter((record) => record.status === 'cancel')
  }

  // Apply property filter
  if (selectedProperty.value) {
    records = records.filter((record) => record.property_id === selectedProperty.value)
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date()
    let startDate = new Date()

    switch (dateFilter.value) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'Last 6 Months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'Last Year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'All Time':
        startDate = new Date(0) // Beginning of time
        break
    }

    records = records.filter((record) => {
      const reportDate = new Date(record.report_date)
      return reportDate >= startDate
    })
  }

  // Apply search filter
  if (!searchQuery.value.trim()) {
    return records
  }

  const query = searchQuery.value.toLowerCase().trim()
  return records.filter((mxRecord) => {
    const description = (mxRecord.description || '').toLowerCase()
    const propertyName = getPropertyName(mxRecord.property_id).toLowerCase()
    const reportedBy = (mxRecord.reported_by || '').toLowerCase()
    const mxId = (mxRecord.mx_id || '').toLowerCase()

    return (
      description.includes(query) ||
      propertyName.includes(query) ||
      reportedBy.includes(query) ||
      mxId.includes(query)
    )
  })
})

// Summary statistics (unfiltered)
const openRecords = computed(() =>
  userAccessibleMxRecords.value.filter((record) => !record.status || record.status === 'open'),
)

const closedRecords = computed(() =>
  userAccessibleMxRecords.value.filter((record) => record.status === 'closed'),
)

const cancelRecords = computed(() =>
  userAccessibleMxRecords.value.filter((record) => record.status === 'cancel'),
)

// Filter functions
const setFilter = (filter) => {
  activeFilter.value = filter
  console.log('Tasks filter set to:', filter)
}

const clearFilter = () => {
  activeFilter.value = 'all'
  console.log('Tasks filter cleared')
}

const getFilterColor = (filter) => {
  const colors = {
    all: 'primary',
    open: 'orange',
    closed: 'green',
    cancel: 'red',
  }
  return colors[filter] || 'primary'
}

const getFilterIcon = (filter) => {
  const icons = {
    all: 'dns',
    open: 'radio_button_unchecked',
    closed: 'check_circle',
    cancel: 'cancel',
  }
  return icons[filter] || 'dns'
}

const getFilterLabel = (filter) => {
  const labels = {
    all: 'All Records',
    open: 'Open',
    closed: 'Closed',
    cancel: 'Cancelled',
  }
  return labels[filter] || 'All Records'
}

const getFilteredCount = () => {
  return filteredMxRecords.value.length
}

onMounted(async () => {
  if (userDataStore.isAuthenticated) {
    // Check if we have the necessary data
    if (userDataStore.userRoles.length === 0 || userDataStore.properties.length === 0) {
      await userDataStore.loadAllUserData()
    } else if (userDataStore.mxRecords.length === 0) {
      await userDataStore.loadMxRecords()
    }
  }
})

const getPropertyName = (propertyId) => {
  const property = userDataStore.getPropertyById(propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

const getStatusColor = (status) => {
  if (!status || status === 'open') return 'orange'
  if (status === 'closed') return 'green'
  if (status === 'cancel') return 'red'
  return 'grey'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString()
}

const viewMxRecord = (mxRecord) => {
  selectedMxRecord.value = mxRecord
  showMxRecordDialog.value = true
}

const closeMxRecordDialog = () => {
  showMxRecordDialog.value = false
  selectedMxRecord.value = null
}

const addComment = (mxRecord) => {
  selectedMxRecord.value = mxRecord
  showCommentDialog.value = true
  // Reset form
  newComment.value = {
    comment: '',
    action_type: '',
  }
}

const addCommentFromDialog = () => {
  showCommentDialog.value = true
  // Reset form
  newComment.value = {
    comment: '',
    action_type: '',
  }
}

const closeCommentDialog = () => {
  showCommentDialog.value = false
  newComment.value = {
    comment: '',
    action_type: '',
    image_urls: [],
  }
  // Clear comment file uploads
  commentSelectedFiles.value = []
  commentImagePreviews.value = []
}

// Comment file upload functions
const onCommentFilesSelected = (files) => {
  console.log('Comment files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        commentImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeCommentImage = (index) => {
  commentImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  commentSelectedFiles.value = commentImagePreviews.value.map((preview) => preview.file)
}

const addMorePhotosToComment = () => {
  // Create a hidden file input to select more photos
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true

  input.onchange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      console.log('Additional comment files selected:', files)

      // Process each additional file
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          commentImagePreviews.value.push({
            url: e.target.result,
            name: file.name,
            file: file,
          })
        }
        reader.readAsDataURL(file)
      })

      // Update the selected files array
      const allFiles = commentImagePreviews.value.map((preview) => preview.file)
      commentSelectedFiles.value = allFiles

      // Show notification
      import('quasar').then(({ Notify }) => {
        Notify.create({
          type: 'positive',
          message: `${files.length} additional photo${files.length > 1 ? 's' : ''} selected`,
          position: 'top',
          timeout: 2000,
        })
      })
    }
  }

  // Trigger file selection
  input.click()
}

// Function to upload comment images to Firebase Storage is now imported from useFirebase

// Additional photos functions
const addPhotosToMxRecord = () => {
  showAddPhotosDialog.value = true
}

const closeAddPhotosDialog = () => {
  showAddPhotosDialog.value = false
  additionalSelectedFiles.value = []
  additionalImagePreviews.value = []
}

const onAdditionalFilesSelected = (files) => {
  console.log('Additional files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        additionalImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  additionalSelectedFiles.value = additionalImagePreviews.value.map((preview) => preview.file)
}

const submitAdditionalPhotos = async () => {
  if (!selectedMxRecord.value || additionalImagePreviews.value.length === 0) {
    return
  }

  uploadingPhotos.value = true

  try {
    // Upload additional photos
    const additionalFilesToUpload = additionalImagePreviews.value.map((preview) => preview.file)
    console.log(`Uploading ${additionalFilesToUpload.length} additional photos...`)

    const newImageUrls = await uploadImages(
      additionalFilesToUpload,
      selectedMxRecord.value.property_id,
      'mxrecord',
    )

    console.log('Additional photos uploaded successfully:', newImageUrls)

    // Get existing image URLs and merge with new ones
    const existingImageUrls = selectedMxRecord.value.image_urls || []
    const updatedImageUrls = [...existingImageUrls, ...newImageUrls]

    // Update the task with new image URLs
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)

    const updateData = {
      image_urls: updatedImageUrls,
      updatedAt: new Date(),
    }

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    // Update local data
    selectedMxRecord.value.image_urls = updatedImageUrls

    // Close dialog and refresh data
    closeAddPhotosDialog()
    await userDataStore.loadMxRecords()

    // Show success notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'positive',
        message: `${newImageUrls.length} photo${newImageUrls.length > 1 ? 's' : ''} added successfully!`,
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error uploading additional photos:', error)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to upload photos. Please try again.',
        position: 'top',
      })
    })
  } finally {
    uploadingPhotos.value = false
  }
}

// Comment additional photos functions
const addPhotosToComment = (log) => {
  selectedCommentLog.value = log
  showAddCommentPhotosDialog.value = true
}

const closeAddCommentPhotosDialog = () => {
  showAddCommentPhotosDialog.value = false
  selectedCommentLog.value = null
  commentAdditionalSelectedFiles.value = []
  commentAdditionalImagePreviews.value = []
}

const onCommentAdditionalFilesSelected = (files) => {
  console.log('Comment additional files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        commentAdditionalImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeCommentAdditionalImage = (index) => {
  commentAdditionalImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  commentAdditionalSelectedFiles.value = commentAdditionalImagePreviews.value.map(
    (preview) => preview.file,
  )
}

const viewImage = (imageUrl) => {
  // Open image in a new tab/window
  window.open(imageUrl, '_blank')
}

// Function to view comment images in fullscreen
const viewCommentImageFullscreen = (imageUrl, index, commentImages, commentText = '') => {
  currentImageUrl.value = imageUrl
  currentImageIndex.value = index
  currentImageList.value = commentImages || []
  currentImageContext.value = commentText
    ? `Comment: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`
    : 'Comment Images'
  showImageViewer.value = true

  // Add keyboard event listener
  document.addEventListener('keydown', handleImageViewerKeyboard)
}

// Fullscreen image viewer
const showImageViewer = ref(false)
const currentImageUrl = ref('')
const currentImageIndex = ref(0)
const currentImageList = ref([])
const currentImageContext = ref('')

const handleImageViewerKeyboard = (event) => {
  if (!showImageViewer.value) return

  switch (event.key) {
    case 'Escape':
      closeImageViewer()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

const nextImage = () => {
  if (currentImageIndex.value < currentImageList.value.length - 1) {
    currentImageIndex.value++
    currentImageUrl.value = currentImageList.value[currentImageIndex.value]
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    currentImageUrl.value = currentImageList.value[currentImageIndex.value]
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
  currentImageIndex.value = 0
  currentImageList.value = []
  currentImageContext.value = ''

  // Remove keyboard event listener
  document.removeEventListener('keydown', handleImageViewerKeyboard)
}

const viewImageFullscreen = (imageUrl, index) => {
  currentImageUrl.value = imageUrl
  currentImageIndex.value = index
  currentImageList.value = selectedMxRecord.value.image_urls || []
  currentImageContext.value = 'Task Images'
  showImageViewer.value = true

  // Add keyboard event listener
  document.addEventListener('keydown', handleImageViewerKeyboard)
}

const submitCommentAdditionalPhotos = async () => {
  if (
    !selectedMxRecord.value ||
    !selectedCommentLog.value ||
    commentAdditionalImagePreviews.value.length === 0
  ) {
    return
  }

  uploadingCommentPhotos.value = true

  try {
    // Upload additional comment photos
    const commentAdditionalFilesToUpload = commentAdditionalImagePreviews.value.map(
      (preview) => preview.file,
    )
    console.log(`Uploading ${commentAdditionalFilesToUpload.length} additional comment photos...`)

    const newImageUrls = await uploadImages(
      commentAdditionalFilesToUpload,
      selectedMxRecord.value.property_id,
      'comment',
    )

    console.log('Additional comment photos uploaded successfully:', newImageUrls)

    // Get existing comment image URLs and merge with new ones
    const existingImageUrls = selectedCommentLog.value.image_urls || []
    const updatedImageUrls = [...existingImageUrls, ...newImageUrls]

    // Find the comment in the logs and update it
    const updatedLogs = selectedMxRecord.value.logs.map((log) => {
      if (log.log_timestamp === selectedCommentLog.value.log_timestamp) {
        return {
          ...log,
          image_urls: updatedImageUrls,
        }
      }
      return log
    })

    // Update the task with updated logs
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)

    const updateData = {
      logs: updatedLogs,
      updatedAt: new Date(),
    }

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    // Update local data
    selectedMxRecord.value.logs = updatedLogs
    selectedCommentLog.value.image_urls = updatedImageUrls

    // Close dialog and refresh data
    closeAddCommentPhotosDialog()
    await userDataStore.loadMxRecords()

    // Show success notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'positive',
        message: `${newImageUrls.length} photo${newImageUrls.length > 1 ? 's' : ''} added to comment successfully!`,
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error uploading additional comment photos:', error)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to upload photos to comment. Please try again.',
        position: 'top',
      })
    })
  } finally {
    uploadingCommentPhotos.value = false
  }
}

const submitComment = async () => {
  console.log('submitComment called with:', {
    comment: newComment.value.comment,
    action_type: newComment.value.action_type,
    selectedMxRecord: selectedMxRecord.value?.id,
  })

  if (!newComment.value.comment || !newComment.value.action_type) {
    console.error('Missing required fields:', {
      comment: newComment.value.comment,
      action_type: newComment.value.action_type,
    })

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Please fill in all required fields',
        position: 'top',
      })
    })
    return
  }

  if (!selectedMxRecord.value || !selectedMxRecord.value.id) {
    console.error('No selected task or missing ID:', selectedMxRecord.value)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'No task selected',
        position: 'top',
      })
    })
    return
  }

  submittingComment.value = true

  try {
    // Handle comment image uploads if files are selected
    let commentImageUrls = []
    const commentFilesToUpload = commentImagePreviews.value.map((preview) => preview.file)
    if (commentFilesToUpload.length > 0) {
      try {
        console.log(`Uploading ${commentFilesToUpload.length} comment images...`)
        commentImageUrls = await uploadImages(
          commentFilesToUpload,
          selectedMxRecord.value.property_id,
          'comment',
        )
        console.log('Comment images uploaded successfully to Firebase Storage:', commentImageUrls)
      } catch (error) {
        console.error('Error uploading comment images to Firebase Storage:', error)
        // Continue with comment submission even if image upload fails
        import('quasar').then(({ Notify }) => {
          Notify.create({
            type: 'warning',
            message: 'Images could not be uploaded, but comment will still be added',
            position: 'top',
          })
        })
      }
    }

    // Create new log entry
    const newLogEntry = {
      log_timestamp: new Date(),
      comment: newComment.value.comment,
      user_id: userDataStore.userId,
      user_name: userDataStore.user?.displayName || userDataStore.user?.email || 'Unknown User',
      user_role:
        userDataStore.getUserRoleForProperty(selectedMxRecord.value.property_id)?.role ||
        'Unknown Role',
      action_type: newComment.value.action_type,
      image_urls: commentImageUrls, // Add uploaded comment image URLs
    }

    // Add the log entry to the task
    const updatedLogs = [...(selectedMxRecord.value.logs || []), newLogEntry]

    // Validate IDs before constructing path
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    console.log('Validating IDs for Firebase update:', {
      propertyId: propertyId,
      propertyIdType: typeof propertyId,
      mxRecordId: mxRecordId,
      mxRecordIdType: typeof mxRecordId,
      selectedMxRecord: selectedMxRecord.value,
    })

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    // Ensure IDs are strings
    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)
    const documentPath = `properties/${propertyIdStr}/mxrecords/${mxRecordIdStr}`

    // Prepare update data
    const updateData = {
      logs: updatedLogs,
      updatedAt: new Date(),
    }

    // If action type is 'resolution', automatically change status to 'closed'
    if (newComment.value.action_type === 'resolution') {
      updateData.status = 'closed'
      console.log('Resolution comment detected - automatically setting status to closed')
    }

    console.log('Updating task with new comment...', {
      documentPath,
      newLogEntry,
      totalLogs: updatedLogs.length,
      updateData,
      willAutoClose: newComment.value.action_type === 'resolution',
    })

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    console.log('Task updated successfully with new comment')

    // Update the local selected record
    selectedMxRecord.value.logs = updatedLogs

    // Update local status if it was changed
    if (newComment.value.action_type === 'resolution') {
      selectedMxRecord.value.status = 'closed'
      console.log('Local task status updated to closed')
    }

    // Close dialog and reset form
    closeCommentDialog()

    // Refresh data to show updated record
    await userDataStore.loadMxRecords()

    // Show success notification
    const isResolution = newComment.value.action_type === 'resolution'
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'positive',
        message: isResolution
          ? 'Resolution comment added and task closed successfully!'
          : 'Comment added successfully!',
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error adding comment:', error)

    // Show error notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to add comment. Please try again.',
        position: 'top',
      })
    })
  } finally {
    submittingComment.value = false
  }
}

// Create task dialog functions
const openCreateMxRecordDialog = () => {
  showCreateMxRecordDialog.value = true
}

const closeCreateMxRecordDialog = () => {
  showCreateMxRecordDialog.value = false
}

const onMxRecordCreated = () => {
  closeCreateMxRecordDialog()
  refreshData()
}

const refreshData = async () => {
  await userDataStore.loadAllUserData()
}
</script>

<style scoped>
.mx-records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mxrecord-row {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin-bottom: 0;
}

.mxrecord-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* Comment picture upload styles */
.comment-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.comment-image-previews {
  max-height: 200px;
  overflow-y: auto;
}

.comment-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.comment-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.comment-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Additional photos upload styles */
.additional-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.additional-image-previews {
  max-height: 300px;
  overflow-y: auto;
}

.additional-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.additional-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.additional-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Comment additional photos upload styles */
.comment-additional-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.comment-additional-image-previews {
  max-height: 250px;
  overflow-y: auto;
}

.comment-additional-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.comment-additional-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.comment-additional-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Log entry styles */
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-comment-photos-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.log-entry:hover .add-comment-photos-btn {
  opacity: 1;
}

.log-images {
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #1976d2;
}

.cursor-pointer {
  cursor: pointer;
}

/* Add More Photos Button */
.add-more-photos-btn {
  border: 1px dashed #1976d2;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.add-more-photos-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
  border-color: #1976d2;
  transform: translateY(-1px);
}

/* Images Grid Styles */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-preview-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.image-preview-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.image-overlay {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  text-align: center;
}

/* Fullscreen Image Viewer Styles */
.image-viewer-card {
  background: #000;
  color: white;
}

.image-viewer-header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1;
}

.image-viewer-content {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
}

.image-nav-btn {
  color: white;
}

.image-nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

.mxrecord-row-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.mxrecord-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.issue-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.image-overlay {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
}

.mxrecord-description {
  flex: 1;
  min-width: 0;
}

.description-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 4px;
  word-break: break-word;
}

.description-property {
  font-size: 0.85rem;
  color: #666;
}

.mxrecord-date {
  flex-shrink: 0;
  width: 100px;
  text-align: center;
}

.date-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.date-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.mxrecord-reporter {
  flex-shrink: 0;
  width: 120px;
  text-align: center;
}

.reporter-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.reporter-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.reporter-role {
  font-size: 0.8rem;
  color: #666;
}

.mxrecord-status {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.status-chip {
  font-weight: 500;
}

.mxrecord-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.85rem;
  min-height: 36px;
  white-space: nowrap;
}

.search-input {
  max-width: 500px;
}

.summary-card {
  min-width: 120px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.summary-card.filter-active {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--q-primary);
}

.cursor-pointer {
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mxrecord-row-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }

  .mxrecord-image {
    width: 100%;
    height: 120px;
    align-self: center;
  }

  .mxrecord-description {
    width: 100%;
  }

  .mxrecord-date,
  .mxrecord-reporter {
    width: auto;
    text-align: left;
  }

  .mxrecord-status {
    align-self: flex-start;
  }

  .mxrecord-actions {
    align-self: stretch;
    flex-direction: row;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
  }
}

/* Task Details Dialog Styles */
.mxrecord-dialog {
  background: white;
  border-radius: 0;
}

.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
}

.close-btn {
  color: #666;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.add-comment-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  min-height: 36px;
}

.dialog-content {
  padding: 24px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.mxrecord-details-full {
  max-width: 800px;
  margin: 0 auto;
}

.details-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
}

.activity-log {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #1976d2;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-role {
  color: #666;
  font-size: 0.875rem;
}

.log-time {
  color: #666;
  font-size: 0.875rem;
}

.log-comment {
  color: #1a1a1a;
  line-height: 1.5;
}

/* Responsive Dialog */
@media (max-width: 768px) {
  .dialog-header {
    padding: 12px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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
