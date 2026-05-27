<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div class="text-subtitle1 text-weight-medium">Leads</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-px-md q-py-sm">
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-property="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ getLeadPropertyName(props.row) }}</div>
              <div class="text-caption text-grey-6">{{ getLeadCityStateZip(props.row) }}</div>
            </q-td>
          </template>

          <template #body-cell-title="props">
            <q-td :props="props">
              <div class="lead-title-cell">
                <button class="lead-title-link" @click="openLeadDetail(props.row)">
                  {{ props.row.title || 'Untitled Lead' }}
                </button>
                <div class="lead-subtitle">
                  {{ props.row.description || props.row.scope || 'No task description provided.' }}
                </div>
                <div class="row q-gutter-xs q-mt-xs">
                  <q-chip dense size="sm" color="primary" text-color="white">
                    {{ props.row.status || 'open' }}
                  </q-chip>
                  <q-chip dense size="sm" color="grey-7" text-color="white">
                    {{ getCommentCountLabel(props.row) }}
                  </q-chip>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-task="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ getLeadTaskLabel(props.row) }}</div>
              <div class="text-caption text-grey-6">
                {{ props.row.task_status || props.row.lead_status || 'task synced' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-comments="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ getCommentCountLabel(props.row) }}</div>
              <div class="text-caption text-grey-6">
                {{ getLatestCommentSnippet(props.row) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                size="sm"
                outline
                color="secondary"
                label="Details"
                class="q-mr-sm"
                @click="openLeadDetail(props.row)"
              />
              <q-btn
                size="sm"
                color="primary"
                label="Bid"
                @click="openBidDialog(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="leadDetailDialog">
      <q-card style="min-width: 720px; max-width: 980px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-medium">{{ selectedLeadDetail?.title || 'Lead Details' }}</div>
            <div class="text-caption text-grey-6">{{ getLeadTaskLabel(selectedLeadDetail) }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section v-if="selectedLeadDetail">
          <div class="lead-detail-summary q-mb-md">
            <q-chip color="primary" text-color="white" dense>{{ selectedLeadDetail.status || 'open' }}</q-chip>
            <q-chip color="grey-8" text-color="white" dense>{{ getCommentCountLabel(selectedLeadDetail) }}</q-chip>
            <q-chip v-if="selectedLeadDetail.urgency" color="orange" text-color="white" dense>
              {{ selectedLeadDetail.urgency }}
            </q-chip>
          </div>

          <div class="lead-detail-section q-mb-md">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">House</div>
            <div class="lead-property-card">
              <div class="lead-detail-item">
                <div class="lead-detail-label">Property</div>
                <div class="lead-detail-value">{{ getLeadPropertyName(selectedLeadDetail) }}</div>
              </div>
              <div class="lead-detail-item">
                <div class="lead-detail-label">Location</div>
                <div class="lead-detail-value">{{ getLeadCityStateZip(selectedLeadDetail) }}</div>
              </div>
            </div>
          </div>

          <div v-if="getLeadImages(selectedLeadDetail).length" class="lead-detail-section q-mb-md">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Images</div>
            <div class="lead-image-grid">
              <q-card
                v-for="(imageUrl, index) in getLeadImages(selectedLeadDetail)"
                :key="`${imageUrl}-${index}`"
                flat
                bordered
                class="lead-image-card"
              >
                <q-img
                  :src="imageUrl"
                  class="lead-image-thumb"
                  fit="cover"
                  spinner-color="primary"
                  @click="openLeadImage(imageUrl)"
                />
              </q-card>
            </div>
          </div>

          <div class="lead-detail-grid q-mb-md">
            <div class="lead-detail-item">
              <div class="lead-detail-label">Task</div>
              <div class="lead-detail-value">{{ getLeadTaskLabel(selectedLeadDetail) }}</div>
            </div>
            <div class="lead-detail-item">
              <div class="lead-detail-label">Task Status</div>
              <div class="lead-detail-value">{{ selectedLeadDetail.task_status || 'N/A' }}</div>
            </div>
            <div class="lead-detail-item">
              <div class="lead-detail-label">Budget</div>
              <div class="lead-detail-value">{{ selectedLeadDetail.budget_range || 'N/A' }}</div>
            </div>
            <div class="lead-detail-item">
              <div class="lead-detail-label">Due Date</div>
              <div class="lead-detail-value">{{ formatDate(selectedLeadDetail.due_date) }}</div>
            </div>
            <div class="lead-detail-item">
              <div class="lead-detail-label">Location</div>
              <div class="lead-detail-value">{{ getLeadCityStateZip(selectedLeadDetail) }}</div>
            </div>
            <div class="lead-detail-item full-width">
              <div class="lead-detail-label">Scope</div>
              <div class="lead-detail-value">{{ selectedLeadDetail.scope || 'No scope provided.' }}</div>
            </div>
            <div class="lead-detail-item full-width">
              <div class="lead-detail-label">Semantic Tags</div>
              <div class="lead-detail-value">
                {{ Array.isArray(selectedLeadDetail.semantic_tags) && selectedLeadDetail.semantic_tags.length ? selectedLeadDetail.semantic_tags.join(', ') : 'N/A' }}
              </div>
            </div>
          </div>

          <div class="lead-comments-panel">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-medium">Task Comments</div>
              <div class="text-caption text-grey-6">{{ getCommentCountLabel(selectedLeadDetail) }}</div>
            </div>
            <div v-if="!getLeadComments(selectedLeadDetail).length" class="text-caption text-grey-6">
              No task comments were published with this lead.
            </div>
            <q-list v-else separator bordered class="lead-comments-list">
              <q-item v-for="(comment, index) in getLeadComments(selectedLeadDetail)" :key="comment.id || `${comment.created_at || 'comment'}-${index}`">
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ comment.user_name || comment.author_name || comment.user_id || 'Task Comment' }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ comment.action_type || 'comment' }} · {{ formatDate(comment.created_at) }}
                  </q-item-label>
                  <q-item-label class="q-mt-xs">
                    {{ comment.comment || comment.body || 'No comment text.' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn color="primary" label="Bid" @click="openBidFromDetail" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <SpBidDialog
      v-model="bidDialog"
      :lead="selectedLead"
      @submitted="handleBidSubmitted"
    />
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'
import SpBidDialog from 'src/components/SpBidDialog.vue'

const userStore = useUserDataStore()
const loading = ref(false)
const rows = ref([])
const bidDialog = ref(false)
const leadDetailDialog = ref(false)
const selectedLead = ref(null)
const selectedLeadDetail = ref(null)

const columns = [
  { name: 'title', label: 'Lead', field: 'title', align: 'left' },
  { name: 'property', label: 'Property', field: 'property', align: 'left' },
  { name: 'task', label: 'Task', field: 'task_id', align: 'left' },
  { name: 'budget_range', label: 'Budget', field: 'budget_range', align: 'left' },
  { name: 'due_date', label: 'Due', field: 'due_date', align: 'left' },
  { name: 'comments', label: 'Comments', field: 'comment_count', align: 'left' },
  { name: 'actions', label: 'Action', field: 'actions', align: 'right' },
]

const loadLeads = async () => {
  loading.value = true
  try {
    rows.value = await spPortalApi.listLeads(userStore.userId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load leads.', position: 'top' })
  } finally {
    loading.value = false
  }
}

const openBidDialog = (lead) => {
  selectedLead.value = lead
  bidDialog.value = true
}

const openLeadDetail = (lead) => {
  selectedLeadDetail.value = lead
  leadDetailDialog.value = true
}

const openBidFromDetail = () => {
  if (!selectedLeadDetail.value) return
  leadDetailDialog.value = false
  openBidDialog(selectedLeadDetail.value)
}

const getLeadImages = (lead) => {
  if (!lead) return []
  const urls = Array.isArray(lead.image_urls)
    ? lead.image_urls
    : Array.isArray(lead.photos)
      ? lead.photos
      : []
  return urls.filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim()))
}

const getLeadPropertyName = (lead) => {
  if (!lead) return 'N/A'
  return String(
    lead.property_name ||
      lead.property_address_line1 ||
      lead.property?.address?.street ||
      lead.property?.address?.line1 ||
      lead.property?.address?.street1 ||
      lead.property?.address?.address1 ||
      lead.property?.name ||
      lead.address ||
      'N/A',
  )
}

const getLeadCityStateZip = (lead) => {
  if (!lead) return 'N/A'
  const city = String(lead.property_city || lead.city || lead.property?.address?.city || lead.property?.city || '').trim()
  const state = String(lead.property_state || lead.state || lead.property?.address?.state || lead.property?.state || '').trim()
  const zip = String(
    lead.property_zip ||
      lead.zip ||
      lead.zip_code ||
      lead.postal_code ||
      lead.property?.address?.zip ||
      lead.property?.address?.zipCode ||
      lead.property?.zip ||
      '',
  ).trim()
  const parts = [city, state].filter(Boolean)
  const head = parts.join(', ')
  if (zip) return head ? `${head} ${zip}` : zip
  return head || 'N/A'
}

const getLeadComments = (lead) => {
  if (!lead) return []
  return (Array.isArray(lead.comments) ? lead.comments : [])
    .filter(Boolean)
    .map((comment, index) =>
      typeof comment === 'string'
        ? { id: `comment-${index}`, comment, created_at: null }
        : comment,
    )
    .sort((a, b) =>
      String(b.created_at || b.updated_at || '').localeCompare(String(a.created_at || a.updated_at || '')),
    )
}

const getCommentCount = (lead) => {
  if (!lead) return 0
  return Number(lead.comment_count ?? getLeadComments(lead).length ?? 0)
}

const getCommentCountLabel = (lead) => {
  const count = getCommentCount(lead)
  return `${count} comment${count === 1 ? '' : 's'}`
}

const getLatestCommentSnippet = (lead) => {
  const comments = getLeadComments(lead)
  if (!comments.length) return 'No task comments'
  const latest = comments[0]
  return String(latest.comment || latest.body || '').slice(0, 48) || 'Comment attached'
}

const getLeadTaskLabel = (lead) => {
  if (!lead) return 'Task N/A'
  return `Task ${lead.mx_id || lead.task_id || lead.task_doc_id || lead.lead_id || 'N/A'}`
}

const openLeadImage = (imageUrl) => {
  if (!imageUrl) return
  window.open(imageUrl, '_blank', 'noopener,noreferrer')
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString()
}

const handleBidSubmitted = (res) => {
  const leadDocId = selectedLead.value?.id || selectedLead.value?.lead_doc_id || selectedLead.value?.lead_id
  rows.value = rows.value.filter((row) => (row.id || row.lead_doc_id || row.lead_id) !== leadDocId)
  selectedLead.value = null
  const remaining = res?.credits_balance
  Notify.create({
    type: 'positive',
    message: remaining === undefined ? 'Bid submitted.' : `Bid submitted. Credits left: ${remaining}`,
    position: 'top',
  })
}

onMounted(loadLeads)
</script>

<style scoped>
.lead-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lead-title-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--q-primary);
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.lead-title-link:hover {
  text-decoration: underline;
}

.lead-subtitle {
  color: var(--neutral-600, #6b7280);
  font-size: 0.82rem;
  line-height: 1.35;
}

.lead-detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lead-detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead-property-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lead-image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.lead-image-card {
  overflow: hidden;
  border-radius: var(--border-radius-card);
}

.lead-image-thumb {
  width: 100%;
  height: 160px;
  cursor: pointer;
}

.lead-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.lead-detail-item,
.lead-comments-panel {
  border: 1px solid var(--neutral-200, #e5e7eb);
  border-radius: var(--border-radius-card);
  background: var(--bg-surface, #fff);
  padding: 12px;
}

.lead-detail-item.full-width {
  grid-column: 1 / -1;
}

.lead-detail-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--neutral-500, #6b7280);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.lead-detail-value {
  color: var(--neutral-900, #111827);
  font-weight: 600;
  white-space: pre-wrap;
  word-break: break-word;
}

.lead-comments-list {
  border-radius: var(--border-radius-card);
}

@media (max-width: 768px) {
  .lead-detail-grid {
    grid-template-columns: 1fr;
  }

  .lead-property-card,
  .lead-image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
