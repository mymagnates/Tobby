<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="q-py-sm q-px-md text-subtitle1 text-weight-medium">My Bids</q-card-section>
      <q-separator />
      <q-card-section class="q-px-md q-py-sm">
        <q-table
          flat
          dense
          :rows="sortedRows"
          :columns="columns"
          row-key="bid_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-title="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.title || 'Untitled Lead' }}</div>
              <div class="text-caption text-grey-7">
                Version {{ props.row.version_number || 1 }} · {{ pricingTypeLabel(props.row.pricing_type) }}
              </div>
              <div v-if="props.row.project_title" class="text-caption text-grey-6">
                Project: {{ props.row.project_title }}
              </div>
            </q-td>
          </template>

          <template #body-cell-included_scope="props">
            <q-td :props="props">
              <div class="bid-scope-snippet">
                {{ props.row.included_scope || props.row.note || 'No scope provided.' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                dense
                size="sm"
                :color="statusColor(props.row.status)"
                text-color="white"
              >
                {{ statusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-valid_until="props">
            <q-td :props="props">
              {{ formatDate(props.row.valid_until) }}
            </q-td>
          </template>

          <template #body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                v-if="props.row.status === 'accepted' && props.row.project_id"
                size="sm"
                color="primary"
                no-caps
                label="Open Project"
                @click="openProject(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()
const router = useRouter()
const loading = ref(false)
const rows = ref([])

const columns = [
  { name: 'title', label: 'Lead', field: 'title', align: 'left' },
  { name: 'amount', label: 'Amount', field: (row) => `$${Number(row.amount || 0).toFixed(2)}`, align: 'left' },
  { name: 'included_scope', label: 'Included Scope', field: 'included_scope', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'valid_until', label: 'Valid Until', field: 'valid_until', align: 'left' },
  { name: 'created_at', label: 'Submitted', field: 'created_at', align: 'left' },
  { name: 'actions', label: 'Action', field: 'actions', align: 'right' },
]

const toTimestamp = (value) => {
  const parsed = new Date(value || '')
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

const sortedRows = computed(() =>
  [...rows.value].sort((a, b) => {
    const aAccepted = String(a?.status || '').trim().toLowerCase() === 'accepted'
    const bAccepted = String(b?.status || '').trim().toLowerCase() === 'accepted'
    if (aAccepted !== bAccepted) return bAccepted ? 1 : -1
    const aTime = toTimestamp(a?.accepted_at || a?.created_at)
    const bTime = toTimestamp(b?.accepted_at || b?.created_at)
    return bTime - aTime
  })
)

const formatDate = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString()
}

const pricingTypeLabel = (value) => {
  const labels = {
    one_time: 'One-time',
    monthly: 'Monthly',
    weekly: 'Weekly',
    per_visit: 'Per visit',
    per_phase: 'Per phase',
  }
  return labels[String(value || '').trim().toLowerCase()] || 'One-time'
}

const statusLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'Submitted'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusColor = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'accepted') return 'positive'
  if (normalized === 'expired') return 'orange'
  if (normalized === 'rejected' || normalized === 'withdrawn') return 'negative'
  return 'grey-7'
}

const openProject = (row) => {
  const projectId = String(row?.project_id || '').trim()
  if (!projectId) return
  router.push({ path: '/sp-projects', query: { project: projectId } })
}

const loadBids = async () => {
  loading.value = true
  try {
    rows.value = await spPortalApi.listBids(userStore.userId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load bids.', position: 'top' })
  } finally {
    loading.value = false
  }
}

onMounted(loadBids)
</script>

<style scoped>
.bid-scope-snippet {
  max-width: 340px;
  white-space: normal;
  line-height: 1.4;
}
</style>
