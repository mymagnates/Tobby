<template>
  <q-page class="q-pa-md">
    <admin-date-range-bar
      v-model:preset="preset"
      v-model:from="from"
      v-model:to="to"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3" v-for="card in summaryCards" :key="card.label">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">{{ card.label }}</div>
            <div class="text-h6 text-weight-bold">{{ card.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Manual Credit Adjust</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-3"><q-input v-model="adjustForm.sp_id" dense outlined label="SP ID" /></div>
          <div class="col-12 col-sm-2"><q-input v-model.number="adjustForm.delta" dense outlined type="number" label="Delta" /></div>
          <div class="col-12 col-sm-4"><q-input v-model="adjustForm.reason" dense outlined label="Reason" /></div>
          <div class="col-12 col-sm-3">
            <q-btn color="negative" unelevated label="Adjust (CONFIRM)" class="full-width" @click="runAdjust" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-table flat bordered title="Credit Accounts" :rows="accounts" :columns="accountColumns" row-key="sp_id" class="q-mb-md" />
    <q-table flat bordered title="Orders" :rows="orders" :columns="orderColumns" row-key="id" class="q-mb-md" />
    <q-table flat bordered title="Ledger" :rows="ledger" :columns="ledgerColumns" row-key="id" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AdminDateRangeBar from 'src/components/admin/AdminDateRangeBar.vue'
import { adminApi } from 'src/services/webApiClient'

const $q = useQuasar()
const preset = ref('30d')
const from = ref('')
const to = ref('')

const billingSummary = ref({})
const accounts = ref([])
const orders = ref([])
const ledger = ref([])
const adjustForm = reactive({
  sp_id: '',
  delta: 0,
  reason: '',
})

const accountColumns = [
  { name: 'sp_id', label: 'SP ID', field: 'sp_id', align: 'left' },
  { name: 'balance', label: 'Balance', field: 'balance', align: 'left' },
  { name: 'lifetime_purchased', label: 'Lifetime Purchased', field: 'lifetime_purchased', align: 'left' },
  { name: 'lifetime_used', label: 'Lifetime Used', field: 'lifetime_used', align: 'left' },
  { name: 'updated_at', label: 'Updated', field: 'updated_at', align: 'left' },
]

const orderColumns = [
  { name: 'id', label: 'Order ID', field: 'id', align: 'left' },
  { name: 'sp_id', label: 'SP ID', field: 'sp_id', align: 'left' },
  { name: 'credits', label: 'Credits', field: 'credits', align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'provider', label: 'Provider', field: 'provider', align: 'left' },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
]

const ledgerColumns = [
  { name: 'id', label: 'Entry ID', field: 'id', align: 'left' },
  { name: 'sp_id', label: 'SP ID', field: 'sp_id', align: 'left' },
  { name: 'entry_type', label: 'Type', field: 'entry_type', align: 'left' },
  { name: 'delta', label: 'Delta', field: 'delta', align: 'left' },
  { name: 'balance_after', label: 'Balance After', field: 'balance_after', align: 'left' },
  { name: 'source_type', label: 'Source Type', field: 'source_type', align: 'left' },
  { name: 'source_id', label: 'Source ID', field: 'source_id', align: 'left' },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
]

const toYmd = (date) => date.toISOString().slice(0, 10)
const getRange = () => {
  const today = new Date()
  if (preset.value === 'today') {
    const day = toYmd(today)
    return { from: day, to: day }
  }
  if (preset.value === '7d') {
    const start = new Date(today)
    start.setDate(today.getDate() - 6)
    return { from: toYmd(start), to: toYmd(today) }
  }
  if (preset.value === '30d') {
    const start = new Date(today)
    start.setDate(today.getDate() - 29)
    return { from: toYmd(start), to: toYmd(today) }
  }
  return { from: from.value, to: to.value }
}

const load = async () => {
  const range = getRange()
  billingSummary.value = await adminApi.getBillingSummary(range)
  accounts.value = (await adminApi.listCreditAccounts({ page: 1, page_size: 200 })).items || []
  orders.value = (await adminApi.listCreditOrders(range)).items || []
  ledger.value = (await adminApi.listCreditLedger(range)).items || []
}

const runAdjust = async () => {
  await adminApi.adjustCredits({
    sp_id: adjustForm.sp_id,
    delta: Number(adjustForm.delta || 0),
    reason: adjustForm.reason,
    confirm_token: 'CONFIRM',
  })
  $q.notify({ type: 'positive', message: 'Credit adjusted and audited.' })
  await load()
}

const summaryCards = computed(() => [
  { label: 'MRR (est.)', value: `$${billingSummary.value.plan_overview?.mrr_estimate_usd || 0}` },
  { label: 'Plan Conversion', value: `${billingSummary.value.plan_overview?.conversion_rate || 0}%` },
  { label: 'Credits Purchased', value: billingSummary.value.sp_credit_overview?.total_purchased || 0 },
  { label: 'Credits Balance', value: billingSummary.value.sp_credit_overview?.total_balance || 0 },
])

watch([preset, from, to], load)
onMounted(load)
</script>
