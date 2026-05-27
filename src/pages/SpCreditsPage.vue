<template>
  <q-page class="q-pa-sm sp-credits-page">
    <q-card flat bordered class="q-mb-sm">
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div>
          <div class="text-subtitle1 text-weight-medium">Credits</div>
          <div class="text-caption text-grey-7">Track your balance, grants, and credit usage.</div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn flat no-caps icon="arrow_back" label="Back" @click="goBack" />
          <q-btn flat dense icon="refresh" @click="refreshAll" :loading="loading" />
        </div>
      </q-card-section>
    </q-card>

    <div class="credits-grid">
      <q-card flat bordered class="credits-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-caption text-grey-7">Current Balance</div>
            <div class="text-h4 text-weight-bold">{{ summary.balance }}</div>
          </div>
          <q-icon name="token" size="38px" color="primary" />
        </q-card-section>
        <q-separator />
        <q-card-section class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="text-caption text-grey-7">Free Credits Granted</div>
            <div class="text-subtitle1 text-weight-medium">{{ summary.lifetime_granted }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-7">Lifetime Used</div>
            <div class="text-subtitle1 text-weight-medium">{{ summary.lifetime_used }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="credits-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Free Credit Policy</div>
          <div class="text-body2 q-mb-sm">Every SP starts with {{ starterCredits }} free credits.</div>
          <div class="text-body2 q-mb-sm">You receive 1 free credit every 7 days.</div>
          <div class="text-caption text-grey-7">
            Free credits are applied automatically when your account is loaded, when you submit a bid,
            and when you open credit history.
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-card flat bordered class="q-mt-sm">
      <q-card-section class="q-py-sm q-px-md">
        <div class="text-subtitle1 text-weight-medium">Credit History</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          flat
          dense
          :rows="historyRows"
          :columns="historyColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 8 }"
          :loading="loading"
          no-data-label="No credit history yet"
        >
          <template #body-cell-created_at="props">
            <q-td :props="props">{{ formatDateTime(props.row.created_at) }}</q-td>
          </template>
          <template #body-cell-delta="props">
            <q-td :props="props" :class="props.row.delta >= 0 ? 'text-positive' : 'text-negative'">
              {{ props.row.delta > 0 ? `+${props.row.delta}` : props.row.delta }}
            </q-td>
          </template>
          <template #body-cell-meta="props">
            <q-td :props="props">{{ formatMeta(props.row) }}</q-td>
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
import { spCreditApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()
const router = useRouter()

const loading = ref(false)
const starterCredits = 3

const summary = ref({
  balance: 0,
  lifetime_purchased: 0,
  lifetime_used: 0,
  lifetime_granted: 0,
})

const historyItems = ref([])

const historyColumns = [
  { name: 'created_at', label: 'Time', field: 'created_at', align: 'left' },
  { name: 'entry_type', label: 'Type', field: 'entry_type', align: 'left' },
  { name: 'delta', label: 'Delta', field: 'delta', align: 'left' },
  { name: 'balance_after', label: 'Balance After', field: 'balance_after', align: 'left' },
  { name: 'meta', label: 'Details', field: 'meta', align: 'left' },
]

const historyRows = computed(() =>
  [...historyItems.value].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/sp-dashboard')
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

const formatMeta = (row) => {
  if (row.entry_type === 'grant') {
    return row?.meta?.grant_type || 'free grant'
  }
  if (row.entry_type === 'purchase') {
    const amount = Number(row?.meta?.amount || 0)
    const currency = row?.meta?.currency || 'USD'
    return `${currency} ${amount.toFixed(2)}`
  }
  if (row.entry_type === 'bid_use') {
    return row.source_id || row.lead_id || '-'
  }
  return '-'
}

const loadSummary = async () => {
  const data = await spCreditApi.getSummary(userStore.userId)
  summary.value = {
    balance: Number(data?.balance || 0),
    lifetime_purchased: Number(data?.lifetime_purchased || 0),
    lifetime_used: Number(data?.lifetime_used || 0),
    lifetime_granted: Number(data?.lifetime_granted || 0),
  }
}

const loadHistory = async () => {
  const data = await spCreditApi.getHistory(userStore.userId, 100)
  historyItems.value = data?.items || []
}

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([loadSummary(), loadHistory()])
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load credit data.', position: 'top' })
  } finally {
    loading.value = false
  }
}

onMounted(refreshAll)
</script>

<style scoped>
.credits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.credits-card {
  min-height: 170px;
}
</style>
