<template>
  <q-page class="documents-page q-pa-md">
    <!-- Search and filters -->
    <div class="documents-toolbar q-mb-md">
      <q-input
        v-model="searchQuery"
        borderless
        dense
        placeholder="Search documents"
        clearable
        class="documents-search"
        @keyup.enter="applySearch"
      >
        <template #prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>

      <q-btn
        v-if="canCreateDocuments"
        color="primary"
        unelevated
        no-caps
        dense
        icon="add"
        label="Add"
        class="documents-add-btn"
        @click="openCreateDialog"
      />
    </div>

    <div class="source-stat-tiles q-mb-md">
      <button
        v-for="source in sourceStatCards"
        :key="source.key"
        type="button"
        class="source-stat-tile"
        :class="{ 'source-stat-tile--active': sourceFilter === source.value }"
        @click="setSourceFilter(source.value)"
      >
        <span class="source-stat-icon" :class="`source-stat-icon--${source.tone}`">
          <q-icon :name="source.icon" size="18px" />
        </span>
        <span class="source-stat-copy">
          <span class="source-stat-label">{{ source.label }}</span>
          <span class="source-stat-caption">{{ source.caption }}</span>
        </span>
        <span class="source-stat-count">{{ source.count }}</span>
      </button>
    </div>

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

    <!-- Documents tiles -->
    <div v-else class="documents-tiles">
      <article
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="document-tile"
        tabindex="0"
        @click="openViewDocument(doc)"
        @keyup.enter="openViewDocument(doc)"
      >
        <div class="tile-head">
          <div class="tile-file-mark" :class="`tile-file-mark--${getFileTone(doc)}`">
            <q-icon :name="getFileIcon(doc)" size="22px" />
          </div>
          <q-btn
            flat
            dense
            round
            size="sm"
            color="grey-7"
            icon="visibility"
            @click.stop="openViewDocument(doc)"
          >
            <q-tooltip>View document</q-tooltip>
          </q-btn>
        </div>

        <div class="tile-title text-ellipsis-2">{{ doc.name }}</div>
        <div class="tile-description text-ellipsis-2">{{ getDocumentDescription(doc) }}</div>

        <div class="tile-meta">
          <span class="tile-chip" :class="`tile-chip--${doc.source_type || 'default'}`">
            <q-icon :name="getSourceIcon(doc.source_type)" size="14px" />
            {{ getSourceShortLabel(doc) }}
          </span>
          <span class="tile-chip tile-chip--role">
            {{ getUploaderRoleLabel(doc) }}
          </span>
        </div>

        <div class="tile-foot">
          <span>{{ getDocumentPurpose(doc) }}</span>
          <span>{{ formatDate(doc.upload_date) }}</span>
        </div>
      </article>
    </div>

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
            <div v-if="selectedDocumentUrl" class="doc-preview-shell">
              <div class="doc-preview-meta">
                <span>{{ selectedDocumentFileLabel }}</span>
                <span>{{ formatDate(selectedDocument.upload_date) }}</span>
                <q-space />
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  label="Open"
                  icon="open_in_new"
                  :href="selectedDocumentUrl"
                  target="_blank"
                />
              </div>

              <div v-if="isImageType(selectedDocument)" class="doc-preview-image">
                <q-img
                  :src="selectedDocumentUrl"
                  fit="contain"
                  class="doc-preview-img"
                >
                  <template #loading>
                    <q-spinner color="primary" size="48px" />
                  </template>
                  <template #error>
                    <div class="absolute-full flex flex-center column bg-grey-3">
                      <q-icon name="broken_image" size="48px" color="grey-6" />
                      <div class="q-mt-sm">Could not load image preview</div>
                      <q-btn
                        flat
                        color="primary"
                        label="Open in new tab"
                        :href="selectedDocumentUrl"
                        target="_blank"
                        class="q-mt-sm"
                      />
                    </div>
                  </template>
                </q-img>
              </div>

              <iframe
                v-else
                class="doc-preview-frame"
                :src="selectedDocumentPreviewUrl"
                :title="selectedDocument.name || 'Document preview'"
              />
            </div>
            <div v-else class="doc-preview-empty">
              <q-icon name="draft" size="56px" color="grey-5" />
              <div class="text-body1 q-mt-md">{{ selectedDocument.name }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">No file URL is available for preview.</div>
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-if="canCreateDocuments"
      v-model="showCreateDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateDocument
            :allow-lease-source="true"
            @document-created="onDocumentCreated"
            @cancel="showCreateDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { normalizeRoleValue, roleLabel } from '../utils/roleUtils'
import CreateDocument from '../components/CreateDocument.vue'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const $q = useQuasar()
const { getAllDocuments } = useFirebase()

const loading = ref(false)
const allDocuments = ref([])
const selectedPropertyId = ref(null)
const searchQuery = ref('')
const sourceFilter = ref(null)
const showViewDocument = ref(false)
const selectedDocument = ref(null)
const showCreateDialog = ref(false)

const canCreateDocuments = computed(() => {
  const category = String(userDataStore.userCategory || userDataStore.accountType || '').toLowerCase()
  return ['pm', 'admin'].includes(category)
})

const sourceBaseDocuments = computed(() => {
  if (!selectedPropertyId.value) return allDocuments.value
  return allDocuments.value.filter((doc) => String(doc.property_id || '').trim() === selectedPropertyId.value)
})

const sourceStatCards = computed(() => {
  const list = sourceBaseDocuments.value
  const propertyCount = list.filter((doc) => doc.source_type === 'property').length
  const leaseCount = list.filter((doc) => doc.source_type === 'lease').length

  return [
    {
      key: 'all',
      label: 'All Sources',
      caption: 'Property + lease',
      value: null,
      count: list.length,
      icon: 'folder',
      tone: 'all',
    },
    {
      key: 'property',
      label: 'Property',
      caption: 'Property files',
      value: 'property',
      count: propertyCount,
      icon: 'home',
      tone: 'property',
    },
    {
      key: 'lease',
      label: 'Lease',
      caption: 'Lease files',
      value: 'lease',
      count: leaseCount,
      icon: 'description',
      tone: 'lease',
    },
  ]
})

const selectedDocumentUrl = computed(() => getDocumentUrl(selectedDocument.value))

const selectedDocumentExtension = computed(() => getDocumentExtension(selectedDocument.value))

const selectedDocumentFileLabel = computed(() => {
  const ext = selectedDocumentExtension.value
  return ext ? ext.toUpperCase() : 'File'
})

const selectedDocumentPreviewUrl = computed(() => {
  const url = selectedDocumentUrl.value
  if (!url) return ''
  if (shouldUseDocumentViewer(selectedDocument.value)) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
  }
  return url
})

function toDateObject(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (val?.toDate && typeof val.toDate === 'function') return val.toDate()
  const parsed = new Date(val)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(val) {
  if (!val) return '—'
  const dateObj = toDateObject(val)
  if (!dateObj) return '—'
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFileIcon(row) {
  const type = getDocumentExtension(row)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(type)) return 'image'
  if (type === 'pdf') return 'picture_as_pdf'
  if (['doc', 'docx', 'rtf', 'txt'].includes(type)) return 'article'
  if (['xls', 'xlsx', 'csv'].includes(type)) return 'table_chart'
  if (['ppt', 'pptx'].includes(type)) return 'slideshow'
  if (['mp4', 'mov', 'webm'].includes(type)) return 'movie'
  if (['mp3', 'wav', 'm4a'].includes(type)) return 'audio_file'
  return 'description'
}

function getFileTone(row) {
  const type = getDocumentExtension(row)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(type)) return 'image'
  if (type === 'pdf') return 'pdf'
  return 'document'
}

function getDocumentUrl(doc) {
  return String(doc?.file_url || doc?.image_url || doc?.url || '').trim()
}

function getDocumentExtension(doc) {
  const explicitType = String(doc?.file_type || '').toLowerCase().trim()
  if (explicitType && !explicitType.includes('/')) return explicitType.replace(/^\./, '')

  const mimeSubtype = explicitType.includes('/') ? explicitType.split('/').pop() : ''
  const filename = String(doc?.original_filename || doc?.name || getDocumentUrl(doc)).toLowerCase()
  const filenameExt = filename.split('?')[0].split('#')[0].split('.').pop()

  if (mimeSubtype === 'jpeg') return 'jpg'
  if (mimeSubtype === 'plain') return 'txt'
  if (mimeSubtype === 'msword') return 'doc'
  if (mimeSubtype === 'vnd.ms-excel') return 'xls'
  if (mimeSubtype === 'vnd.ms-powerpoint') return 'ppt'
  if (mimeSubtype === 'vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (mimeSubtype === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx'
  if (mimeSubtype === 'vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx'
  return filenameExt || mimeSubtype || ''
}

function shouldUseDocumentViewer(doc) {
  const ext = getDocumentExtension(doc)
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf'].includes(ext)
}

function getSourceIcon(sourceType) {
  return sourceType === 'property' ? 'home' : sourceType === 'lease' ? 'description' : 'folder'
}

function getUploaderRoleLabel(row) {
  const normalized = normalizeRoleValue(row?.uploaded_by_role || row?.role)
  if (normalized) return roleLabel(normalized)
  return row?.source_type === 'lease' ? 'Lease Flow' : 'Property Flow'
}

function getDocumentPurpose(row) {
  const value = String(row?.purpose || row?.category || row?.document_purpose || '').trim()
  return value || '—'
}

function getDocumentDescription(row) {
  const value = String(row?.description || row?.note || '').trim()
  return value || '—'
}

function getSourceShortLabel(row) {
  const label = String(row?.source_label || '').trim()
  return label.replace(/^Property:\s*/i, '').replace(/^Lease:\s*/i, '') || 'Document'
}

function isImageType(doc) {
  const ext = getDocumentExtension(doc)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
}

const filteredDocuments = computed(() => {
  let list = allDocuments.value

  if (selectedPropertyId.value) {
    list = list.filter((d) => String(d.property_id || '').trim() === selectedPropertyId.value)
  }

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

async function loadAllDocuments() {
  loading.value = true
  const flat = []

  try {
    const properties = userDataStore.userAccessibleProperties || []
    for (const prop of properties) {
      try {
        // property media collection
        const photos = await getAllDocuments(`properties/${prop.id}/property_photos`)
        const list = (photos || []).map((p) => ({
          id: `property_${prop.id}_${p.id}`,
          name: p.description || p.original_filename || 'Property document',
          description: p.description || null,
          purpose: p.purpose || p.category || null,
          upload_date: p.upload_date || p.created_datetime,
          file_url: p.image_url,
          image_url: p.image_url,
          original_filename: p.original_filename,
          file_type: (p.original_filename || '').split('.').pop()?.toLowerCase(),
          source_type: 'property',
          source_id: prop.id,
          property_id: prop.id,
          source_label: `Property: ${prop.nickname || prop.address || prop.id}`,
        }))
        flat.push(...list)
      } catch (e) {
        console.warn('DocumentsPage: failed to load property_photos for', prop.id, e)
      }

      try {
        // property documents collection (includes tenant uploads)
        const docs = await getAllDocuments(`properties/${prop.id}/documents`)
        const list = (docs || []).map((d) => ({
          id: `property_doc_${prop.id}_${d.id}`,
          name: d.name || d.description || d.original_filename || 'Property document',
          description: d.note || d.description || null,
          purpose: d.purpose || d.category || d.document_purpose || null,
          upload_date: d.upload_date || d.created_at || d.created_datetime,
          file_url: d.url || d.file_url || d.image_url,
          image_url: d.url || d.file_url || d.image_url,
          original_filename: d.original_filename || d.name,
          file_type:
            d.file_type ||
            d.content_type?.split('/')?.pop()?.toLowerCase() ||
            (d.original_filename || d.name || '').split('.').pop()?.toLowerCase(),
          file_size: d.file_size || d.size || null,
          uploaded_by_role: d.uploaded_by_role || null,
          source_type: 'property',
          source_id: prop.id,
          property_id: prop.id,
          source_label: `Property: ${prop.nickname || prop.address || prop.id}`,
        }))
        flat.push(...list)
      } catch (e) {
        console.warn('DocumentsPage: failed to load documents for', prop.id, e)
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
          purpose: d.purpose || d.category || d.document_purpose || null,
          upload_date: d.upload_date || d.created_datetime,
          file_url: d.file_url,
          image_url: d.file_url,
          original_filename: d.original_filename,
          file_type: d.file_type,
          file_size: d.file_size,
          source_type: 'lease',
          source_id: lease.id,
          property_id: String(propId),
          source_label: `Lease: ${lease.lease_id || lease.id} (${userDataStore.getPropertyName(propId)})`,
        }))
        flat.push(...list)
      } catch (e) {
        console.warn('DocumentsPage: failed to load lease_docs for lease', lease.id, e)
      }
    }

    flat.sort(
      (a, b) => (toDateObject(b.upload_date)?.getTime() || 0) - (toDateObject(a.upload_date)?.getTime() || 0),
    )
    allDocuments.value = flat
  } finally {
    loading.value = false
  }
}

function applySearch() {
  // Search is reactive; this keeps Enter behavior consistent with other pages.
}

function setSourceFilter(value) {
  sourceFilter.value = value
}

function openViewDocument(doc) {
  selectedDocument.value = doc
  showViewDocument.value = true
}

function openCreateDialog() {
  if (!canCreateDocuments.value) return
  showCreateDialog.value = true
}

async function onDocumentCreated() {
  $q.notify({ type: 'positive', message: 'Document created successfully.', position: 'top' })
  showCreateDialog.value = false
  await loadAllDocuments()
}

onMounted(() => {
  loadAllDocuments()
})

watch(
  [() => route.query.create, canCreateDocuments],
  ([val, canCreate]) => {
    if (val === 'true' && canCreate) {
      openCreateDialog()
      const nextQuery = { ...route.query }
      delete nextQuery.create
      router.replace({ query: nextQuery }).catch(() => {})
    }
  },
  { immediate: true },
)

watch(
  () => route.query.propertyId,
  (propertyId) => {
    const value = String(propertyId || '').trim()
    selectedPropertyId.value = value || null
  },
  { immediate: true },
)
</script>

<style scoped>
.documents-page {
  max-width: 1200px;
  margin: 0 auto;
}

.empty-card {
  border-radius: var(--border-radius-card);
}

.documents-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 6px;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 30px rgba(20, 28, 45, 0.04);
}

.documents-search {
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-sm);
  background: #f8fafc;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.documents-search:focus-within {
  border-color: rgba(25, 118, 210, 0.32);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.08);
}

.documents-search :deep(.q-field__control) {
  min-height: 34px;
}

.documents-search :deep(.q-field__native) {
  font-size: 13px;
  color: #334155;
}

.documents-add-btn {
  min-width: 76px;
  min-height: 36px;
  border-radius: var(--border-radius-btn);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}

.source-stat-tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.source-stat-tile {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 70px;
  padding: 12px;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-card);
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.source-stat-tile:hover,
.source-stat-tile--active {
  border-color: rgba(25, 118, 210, 0.32);
  box-shadow: 0 12px 28px rgba(20, 28, 45, 0.08);
  transform: translateY(-1px);
}

.source-stat-tile--active {
  background: #f8fbff;
}

.source-stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-sm);
  color: #475569;
  background: #f1f5f9;
}

.source-stat-icon--property {
  color: #1565c0;
  background: #e3f2fd;
}

.source-stat-icon--lease {
  color: #00695c;
  background: #e0f2f1;
}

.source-stat-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.source-stat-label {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-stat-caption {
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-stat-count {
  color: #0f172a;
  font-size: 20px;
  font-weight: 750;
  line-height: 1;
}

.documents-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}

.document-tile {
  min-height: 172px;
  padding: 14px;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-card);
  background: #fff;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.document-tile:hover,
.document-tile:focus-visible {
  border-color: rgba(25, 118, 210, 0.24);
  box-shadow: 0 14px 34px rgba(20, 28, 45, 0.08);
  transform: translateY(-1px);
}

.tile-head,
.tile-meta,
.tile-foot {
  display: flex;
  align-items: center;
}

.tile-head {
  justify-content: space-between;
  margin-bottom: 12px;
}

.tile-file-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--border-radius-sm);
  color: #475569;
  background: #f1f5f9;
}

.tile-file-mark--image {
  color: #00695c;
  background: #e0f2f1;
}

.tile-file-mark--pdf {
  color: #b71c1c;
  background: #ffebee;
}

.tile-title {
  min-height: 40px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.32;
}

.tile-description {
  min-height: 34px;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.tile-meta {
  gap: 6px;
  margin-top: 12px;
  overflow: hidden;
}

.tile-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-chip--property {
  color: #1565c0;
  background: #e3f2fd;
}

.tile-chip--lease {
  color: #00695c;
  background: #e0f2f1;
}

.tile-chip--role {
  flex: 0 0 auto;
  color: #4a148c;
  background: #f3e5f5;
}

.tile-foot {
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(20, 28, 45, 0.06);
  color: #64748b;
  font-size: 11px;
}

.tile-foot span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-doc-dialog .view-doc-content {
  height: calc(100vh - 112px);
  min-height: 420px;
  padding-top: 12px;
}

.doc-preview-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-card);
  background: #f8fafc;
}

.doc-preview-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 10px 6px 14px;
  border-bottom: 1px solid rgba(20, 28, 45, 0.08);
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.doc-preview-image {
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.doc-preview-img {
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-sm);
}

.doc-preview-frame {
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 0;
  background: #fff;
}

.doc-preview-empty {
  display: flex;
  min-height: 340px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid rgba(20, 28, 45, 0.08);
  border-radius: var(--border-radius-card);
  background: #f8fafc;
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

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 700px) {
  .documents-page {
    padding: 12px;
  }

  .documents-toolbar {
    grid-template-columns: 1fr auto;
  }

  .documents-search {
    min-width: 0;
  }

  .source-stat-tiles {
    grid-template-columns: 1fr;
  }

  .documents-tiles {
    grid-template-columns: 1fr;
  }

  .view-doc-dialog .view-doc-content {
    height: calc(100vh - 104px);
    min-height: 360px;
    padding: 10px;
  }

  .doc-preview-meta {
    min-height: 40px;
    padding-left: 10px;
  }
}

/* Dark mode */
:global(body.body--dark) .documents-toolbar,
:global(body.body--dark) .empty-card {
  background: var(--q-dark);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(body.body--dark) .documents-search,
:global(body.body--dark) .document-tile,
:global(body.body--dark) .source-stat-tile,
:global(body.body--dark) .doc-preview-shell,
:global(body.body--dark) .doc-preview-empty {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(body.body--dark) .source-stat-tile--active {
  background: rgba(144, 202, 249, 0.1);
  border-color: rgba(144, 202, 249, 0.3);
}

:global(body.body--dark) .document-tile:hover,
:global(body.body--dark) .document-tile:focus-visible {
  border-color: rgba(144, 202, 249, 0.3);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.2);
}

:global(body.body--dark) .documents-search :deep(.q-field__native),
:global(body.body--dark) .tile-title,
:global(body.body--dark) .source-stat-label,
:global(body.body--dark) .source-stat-count {
  color: rgba(255, 255, 255, 0.9);
}

:global(body.body--dark) .tile-description,
:global(body.body--dark) .tile-foot,
:global(body.body--dark) .source-stat-caption,
:global(body.body--dark) .doc-preview-meta {
  color: rgba(255, 255, 255, 0.62);
}

:global(body.body--dark) .tile-foot,
:global(body.body--dark) .doc-preview-meta {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
