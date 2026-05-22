<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM Review" title="Bids" description="Review submitted SP bids and send PM feedback.">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <div v-if="loading" class="mobile-list">
        <div v-for="index in 3" :key="index" class="mobile-list-row">
          <q-skeleton type="QAvatar" size="36px" />
          <div class="mobile-list-row__body">
            <q-skeleton type="text" width="72%" />
            <q-skeleton type="text" width="48%" />
          </div>
        </div>
      </div>

      <MobileCard v-else-if="selectedBid" title="Bid Detail" :subtitle="selectedBid.lead_title || selectedBid.title || selectedBid.lead_id">
        <div class="mobile-key-values">
          <div class="mobile-key-value"><span>SP</span><strong>{{ selectedBid.sp_name || selectedBid.sp_id || 'Service Provider' }}</strong></div>
          <div class="mobile-key-value"><span>Amount</span><strong>{{ money(selectedBid.amount) }}</strong></div>
          <div class="mobile-key-value"><span>Status</span><strong>{{ selectedBid.status || 'submitted' }}</strong></div>
          <div class="mobile-key-value"><span>Submitted</span><strong>{{ selectedBid.created_at || '' }}</strong></div>
        </div>
        <div v-if="selectedBid.note" class="mobile-note-box">{{ selectedBid.note }}</div>
        <q-input v-model="feedback" class="q-mt-md" label="PM feedback" type="textarea" autogrow outlined dense />
      </MobileCard>

      <template v-else>
        <div class="mobile-section-title">Submitted Bids <span class="mobile-chip">{{ bidRows.length }}</span></div>
        <div v-if="bidRows.length" class="mobile-list">
          <button
            v-for="bid in bidRows"
            :key="bid.id || bid.bid_id"
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="openBid(bid)"
          >
            <div class="mobile-list-row__icon"><q-icon name="request_quote" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ bid.lead_title || bid.title || 'Submitted bid' }}</div>
              <div class="mobile-list-row__meta">{{ bid.sp_name || bid.sp_id || 'SP' }} - {{ money(bid.amount) }}</div>
            </div>
            <span :class="['mobile-chip', chipClass(bid.status)]">{{ bid.status || 'submitted' }}</span>
          </button>
        </div>
        <MobileEmptyState v-else title="No submitted bids" body="Bids submitted by SPs will appear here after tasks are published as leads." />
      </template>
    </div>

    <div v-if="selectedBid" class="mobile-primary-action mobile-primary-action--stack">
      <q-btn outline no-caps color="warning" label="Request Revision" :loading="saving" @click="saveBidStatus('revision_requested')" />
      <q-btn outline no-caps color="negative" label="Reject" :loading="saving" @click="saveBidStatus('rejected')" />
      <q-btn unelevated no-caps color="primary" label="Accept" :loading="saving" @click="saveBidStatus('accepted')" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { marketplaceApi } from 'src/services/webApiClient'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()
const { getCollectionData, updateDocument } = useFirebase()

const loading = ref(false)
const saving = ref(false)
const bidRows = ref([])
const selectedBid = ref(null)
const feedback = ref('')
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewWriteOnly = computed(() => isPreviewRoute.value && !userDataStore.userId)
const previewBidRows = [
  {
    id: 'bid-plumbing-repair',
    bid_id: 'bid-plumbing-repair',
    lead_id: 'lead-kitchen-sink',
    lead_doc_id: 'lead-kitchen-sink',
    lead_title: 'Kitchen sink leak',
    title: 'Plumbing repair quote',
    sp_id: 'sp-mobile-preview',
    sp_name: 'ABC Plumbing',
    amount: 280,
    status: 'submitted',
    note: 'Includes leak inspection, trap replacement if needed, and cleanup.',
    created_at: '2026-05-21',
  },
  {
    id: 'bid-fence-repair',
    bid_id: 'bid-fence-repair',
    lead_id: 'lead-fence-repair',
    lead_doc_id: 'lead-fence-repair',
    lead_title: 'Fence repair',
    title: 'Fence repair estimate',
    sp_id: 'sp-mobile-preview',
    sp_name: 'Bay Fence',
    amount: 740,
    status: 'revision_requested',
    note: 'PM requested a clearer material breakdown before approval.',
    created_at: '2026-05-20',
  },
]

const tasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const money = (value) => `$${Number(value || 0).toLocaleString()}`

const chipClass = (status) => {
  const next = String(status || '').toLowerCase()
  if (['accepted', 'submitted'].includes(next)) return 'mobile-chip--accent'
  if (['revision_requested', 'revise', 'pending'].includes(next)) return 'mobile-chip--warning'
  if (['rejected', 'cancelled'].includes(next)) return 'mobile-chip--danger'
  return ''
}

const openBid = (bid) => {
  selectedBid.value = bid
  feedback.value = bid.pm_feedback || ''
}

const loadBids = async () => {
  loading.value = true
  try {
    if (!userDataStore.mxRecordsLoading && tasks.value.length === 0) {
      await userDataStore.loadMxRecords?.()
    }
    const taskRefs = tasks.value.flatMap((task) => [task.id, task.mx_id, task.task_id, task.task_doc_id]).filter(Boolean)
    const apiGroups = await Promise.all(taskRefs.map((taskRef) =>
      marketplaceApi.getTaskBids(taskRef, {
        actor_id: userDataStore.userId,
        actor_role: 'pm',
      }).catch(() => []),
    ))
    let rows = apiGroups.flat()

    if (!rows.length) {
      const leads = await getCollectionData('marketplace_leads').catch(() => [])
      const taskRefSet = new Set(taskRefs.map(String))
      const matchedLeads = leads.filter((lead) => [lead.mx_id, lead.task_id, lead.task_doc_id].some((value) => taskRefSet.has(String(value || ''))))
      const bidGroups = await Promise.all(matchedLeads.map((lead) => {
        const leadId = String(lead.id || lead.lead_id || '')
        return leadId ? getCollectionData(`marketplace_leads/${leadId}/bids`).catch(() => []) : []
      }))
      rows = bidGroups.flat()
    }

    const seen = new Set()
    const sourceRows = rows.length ? rows : (isPreviewRoute.value ? previewBidRows : [])
    bidRows.value = sourceRows.filter((bid) => {
      const key = String(bid.id || bid.bid_id || '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  } finally {
    loading.value = false
  }
}

const saveBidStatus = async (status) => {
  const bid = selectedBid.value
  const leadId = String(bid?.lead_doc_id || '').trim()
  const bidId = String(bid?.bid_id || bid?.id || '').trim()
  if (!leadId || !bidId) {
    Notify.create({ type: 'negative', message: 'Bid document reference is missing.', position: 'top' })
    return
  }
  saving.value = true
  try {
    const now = new Date().toISOString()
    const payload = {
      status,
      pm_feedback: String(feedback.value || '').trim(),
      reviewed_by: userDataStore.userId || '',
      reviewed_at: now,
      updated_at: now,
    }
    if (!previewWriteOnly.value) {
      await updateDocument(`marketplace_leads/${leadId}/bids`, bidId, payload)
    }
    bidRows.value = bidRows.value.map((row) => {
      const id = String(row.bid_id || row.id || '').trim()
      return id === bidId ? { ...row, ...payload } : row
    })
    selectedBid.value = null
    if (!previewWriteOnly.value) await loadBids()
    Notify.create({ type: 'positive', message: 'Bid updated.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Failed to update bid.', position: 'top' })
  } finally {
    saving.value = false
  }
}

onMounted(loadBids)
</script>
