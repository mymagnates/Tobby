<template>
  <q-page class="documents-page q-pa-md">
    <!-- Page header -->
    <div class="page-header row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none">Document Management</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Centralized view of all documents. Search and open the source record in a dialog.
        </p>
      </div>
    </div>

    <!-- Search and filters -->
    <q-card flat bordered class="search-card q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              placeholder="Search by name, description, or source..."
              clearable
              bg-color="grey-1"
              class="search-input"
              @keyup.enter="applySearch"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
              <template #append>
                <q-icon
                  v-if="searchQuery"
                  name="close"
                  class="cursor-pointer"
                  @click="searchQuery = ''"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="sourceFilter"
              :options="sourceFilterOptions"
              outlined
              dense
              options-dense
              emit-value
              map-options
              label="Source type"
              clearable
              bg-color="grey-1"
              class="source-filter"
            >
              <template #prepend>
                <q-icon name="folder" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-2 flex items-center">
            <q-btn
              color="primary"
              label="Search"
              icon="search"
              flat
              @click="applySearch"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="48px" color="primary" />
      <div class="text-body2 text-grey-7 q-ml-md">Loading documents...</div>
    </div>

    <!-- Empty state -->
    <q-card v-else-if="filteredDocuments.length === 0" flat bordered class="empty-card">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="folder_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No documents found</div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          {{ searchQuery || sourceFilter ? 'Try changing your search or filters.' : 'Documents from properties and leases will appear here.' }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Documents list (table on desktop, cards on mobile) -->
    <q-card v-else flat bordered class="documents-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="filteredDocuments"
          :columns="columns"
          row-key="id"
          flat
          bordered
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50]"
          class="documents-table"
        >
          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-icon
                  :name="getFileIcon(props.row)"
                  :color="getFileColor(props.row)"
                  size="24px"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-weight-medium">{{ props.row.name }}</div>
                  <div v-if="props.row.description" class="text-caption text-grey-7 text-ellipsis" style="max-width: 240px">
                    {{ props.row.description }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-source="props">
            <q-td :props="props">
              <q-chip
                dense
                size="sm"
                :color="getSourceChipColor(props.row.source_type)"
                text-color="white"
                :icon="getSourceIcon(props.row.source_type)"
              >
                {{ props.row.source_label }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-source_type="props">
            <q-td :props="props">
              <span class="text-body2 text-capitalize">{{ props.row.source_type || '—' }}</span>
            </q-td>
          </template>

          <template #body-cell-date="props">
            <q-td :props="props">
              <span class="text-body2">{{ formatDate(props.row.upload_date) }}</span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row no-wrap q-gutter-xs">
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  icon="visibility"
                  @click="openViewDocument(props.row)"
                >
                  <q-tooltip>View document</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  icon="link"
                  @click="openViewSourceRecord(props.row)"
                >
                  <q-tooltip>View source record</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: View document (preview or open link) -->
    <q-dialog v-model="showViewDocument" position="standard" maximized>
      <q-card class="view-doc-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedDocument?.name || 'Document' }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="view-doc-content">
          <template v-if="selectedDocument">
            <div v-if="isImageType(selectedDocument)" class="doc-preview-image">
              <q-img
                :src="selectedDocument.file_url || selectedDocument.image_url"
                fit="contain"
                class="rounded-borders"
                style="max-height: 70vh; max-width: 100%;"
              >
                <template #loading>
                  <q-spinner color="primary" size="48px" />
                </template>
                <template #error>
                  <div class="absolute-full flex flex-center column bg-grey-3">
                    <q-icon name="broken_image" size="48px" color="grey-6" />
                    <div class="q-mt-sm">Could not load image</div>
                    <q-btn
                      flat
                      color="primary"
                      label="Open in new tab"
                      :href="selectedDocument.file_url || selectedDocument.image_url"
                      target="_blank"
                      class="q-mt-sm"
                    />
                  </div>
                </template>
              </q-img>
            </div>
            <div v-else class="doc-preview-other">
              <q-icon name="description" size="64px" color="grey-5" />
              <div class="text-body1 q-mt-md">{{ selectedDocument.name }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                {{ selectedDocument.file_type?.toUpperCase() || 'File' }} •
                {{ formatDate(selectedDocument.upload_date) }}
              </div>
              <q-btn
                unelevated
                color="primary"
                label="Open in new tab"
                :href="selectedDocument.file_url || selectedDocument.image_url"
                target="_blank"
                icon="open_in_new"
                class="q-mt-md"
              />
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn
            v-if="selectedDocument"
            flat
            label="View source record"
            color="primary"
            icon="link"
            @click="showViewDocument = false; openViewSourceRecord(selectedDocument)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: View source record (no redirect) -->
    <q-dialog v-model="showViewSourceRecord" position="standard" class="source-record-dialog">
      <q-card class="source-record-card" style="min-width: 360px; max-width: 560px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 row items-center">
            <q-icon :name="getSourceIcon(selectedDocument?.source_type)" class="q-mr-sm" color="primary" />
            Source record
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="source-record-body">
          <template v-if="selectedDocument && sourceRecordSummary">
            <!-- Property source -->
            <template v-if="selectedDocument.source_type === 'property'">
              <div class="source-summary">
                <div class="text-subtitle1 text-weight-medium">{{ sourceRecordSummary.nickname || sourceRecordSummary.address || 'Property' }}</div>
                <div class="text-body2 text-grey-7 q-mt-xs">{{ sourceRecordSummary.address }}</div>
                <div v-if="sourceRecordSummary.city" class="text-caption text-grey-6">
                  {{ sourceRecordSummary.city }}{{ sourceRecordSummary.state ? `, ${sourceRecordSummary.state}` : '' }}
                  {{ sourceRecordSummary.zip ? sourceRecordSummary.zip : '' }}
                </div>
              </div>
            </template>
            <!-- Lease source -->
            <template v-else-if="selectedDocument.source_type === 'lease'">
              <div class="source-summary">
                <div class="text-subtitle1 text-weight-medium">Lease {{ sourceRecordSummary.lease_id || selectedDocument.source_id }}</div>
                <div class="text-body2 text-grey-7 q-mt-xs">
                  Property: {{ sourceRecordSummary.property_name || '—' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Status: {{ sourceRecordSummary.status || '—' }} •
                  Rent: {{ sourceRecordSummary.monthly_rent ? `$${formatCurrency(sourceRecordSummary.monthly_rent)}` : '—' }}
                </div>
                <div v-if="sourceRecordSummary.start_date" class="text-caption text-grey-6">
                  {{ formatDate(sourceRecordSummary.start_date) }} – {{ formatDate(sourceRecordSummary.end_date) }}
                </div>
              </div>
            </template>
            <!-- Fallback -->
            <template v-else>
              <div class="source-summary">
                <div class="text-body2">{{ sourceRecordSummary.label || selectedDocument.source_label }}</div>
              </div>
            </template>
          </template>
          <div v-else-if="selectedDocument" class="text-body2 text-grey-6">
            Source: {{ selectedDocument.source_label }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'

const userDataStore = useUserDataStore()
const { getAllDocuments } = useFirebase()

const loading = ref(false)
const allDocuments = ref([])
const searchQuery = ref('')
const sourceFilter = ref(null)
const showViewDocument = ref(false)
const showViewSourceRecord = ref(false)
const selectedDocument = ref(null)

const pagination = ref({
  page: 1,
  rowsPerPage: 25,
})

const sourceFilterOptions = [
  { label: 'Property', value: 'property' },
  { label: 'Lease', value: 'lease' },
]

const columns = [
  { name: 'name', label: 'Document', field: 'name', align: 'left', sortable: true },
  { name: 'source', label: 'Source', field: 'source_label', align: 'left' },
  { name: 'source_type', label: 'Source type', field: 'source_type', align: 'left' },
  { name: 'date', label: 'Date', field: 'upload_date', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center', sortable: false },
]

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(num) {
  if (num == null) return '—'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
}

function getFileIcon(row) {
  const type = (row.file_type || row.original_filename || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return 'image'
  if (type === 'pdf') return 'picture_as_pdf'
  return 'description'
}

function getFileColor(row) {
  const type = (row.file_type || row.original_filename || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return 'primary'
  if (type === 'pdf') return 'negative'
  return 'grey-7'
}

function getSourceIcon(sourceType) {
  return sourceType === 'property' ? 'home' : sourceType === 'lease' ? 'description' : 'folder'
}

function getSourceChipColor(sourceType) {
  return sourceType === 'property' ? 'primary' : sourceType === 'lease' ? 'teal' : 'grey-7'
}

function isImageType(doc) {
  const type = (doc.file_type || doc.original_filename || '').toLowerCase()
  const ext = type || (doc.original_filename || '').split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

const filteredDocuments = computed(() => {
  let list = allDocuments.value

  const q = (searchQuery.value || '').trim().toLowerCase()
  if (q) {
    list = list.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.source_label && d.source_label.toLowerCase().includes(q)) ||
        (d.original_filename && d.original_filename.toLowerCase().includes(q)),
    )
  }

  if (sourceFilter.value) {
    list = list.filter((d) => d.source_type === sourceFilter.value)
  }

  return list
})

const sourceRecordSummary = computed(() => {
  if (!selectedDocument.value) return null
  const doc = selectedDocument.value
  if (doc.source_type === 'property') {
    const prop = userDataStore.getPropertyById(doc.source_id) || {}
    return {
      nickname: prop.nickname,
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip: prop.zip,
    }
  }
  if (doc.source_type === 'lease') {
    const lease = userDataStore.userAccessibleLeases.find((l) => l.id === doc.source_id)
    if (!lease) return { label: doc.source_label }
    const propId = lease.property_id?.id ?? lease.property_id
    return {
      lease_id: lease.lease_id || lease.id,
      property_name: userDataStore.getPropertyName(propId),
      status: lease.status,
      monthly_rent: lease.monthly_rent,
      start_date: lease.start_date,
      end_date: lease.end_date,
    }
  }
  return { label: doc.source_label }
})

async function loadAllDocuments() {
  loading.value = true
  const flat = []

  try {
    const properties = userDataStore.userAccessibleProperties || []
    for (const prop of properties) {
      try {
        const photos = await getAllDocuments(`properties/${prop.id}/property_photos`)
        const list = (photos || []).map((p) => ({
          id: `property_${prop.id}_${p.id}`,
          name: p.description || p.original_filename || 'Property document',
          description: p.description || null,
          upload_date: p.upload_date || p.created_datetime,
          file_url: p.image_url,
          image_url: p.image_url,
          original_filename: p.original_filename,
          file_type: (p.original_filename || '').split('.').pop()?.toLowerCase(),
          source_type: 'property',
          source_id: prop.id,
          source_label: `Property: ${prop.nickname || prop.address || prop.id}`,
        }))
        flat.push(...list)
      } catch (e) {
        console.warn('DocumentsPage: failed to load property_photos for', prop.id, e)
      }
    }

    const leases = userDataStore.userAccessibleLeases || []
    for (const lease of leases) {
      const propId = lease.property_id?.id ?? lease.property_id
      if (!propId) continue
      try {
        const docs = await getAllDocuments(`properties/${propId}/leases/${lease.id}/lease_docs`)
        const list = (docs || []).map((d) => ({
          id: `lease_${lease.id}_${d.id}`,
          name: d.name || d.original_filename || 'Lease document',
          description: d.description || null,
          upload_date: d.upload_date || d.created_datetime,
          file_url: d.file_url,
          image_url: d.file_url,
          original_filename: d.original_filename,
          file_type: d.file_type,
          file_size: d.file_size,
          source_type: 'lease',
          source_id: lease.id,
          source_label: `Lease: ${lease.lease_id || lease.id} (${userDataStore.getPropertyName(propId)})`,
        }))
        flat.push(...list)
      } catch (e) {
        console.warn('DocumentsPage: failed to load lease_docs for lease', lease.id, e)
      }
    }

    flat.sort((a, b) => new Date(b.upload_date || 0) - new Date(a.upload_date || 0))
    allDocuments.value = flat
  } finally {
    loading.value = false
  }
}

function applySearch() {
  pagination.value.page = 1
}

function openViewDocument(doc) {
  selectedDocument.value = doc
  showViewDocument.value = true
}

function openViewSourceRecord(doc) {
  selectedDocument.value = doc
  showViewSourceRecord.value = true
}

onMounted(() => {
  loadAllDocuments()
})
</script>

<style scoped>
.documents-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-card,
.documents-card,
.empty-card {
  border-radius: 12px;
}

.documents-table {
  font-size: 0.9375rem;
}

.view-doc-dialog .view-doc-content {
  min-height: 200px;
}

.doc-preview-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.source-record-card .source-summary {
  padding: 4px 0;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode */
:global(body.body--dark) .search-card,
:global(body.body--dark) .documents-card,
:global(body.body--dark) .empty-card {
  background: var(--q-dark);
}
</style>
