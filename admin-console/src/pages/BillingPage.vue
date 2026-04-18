<template>
  <section>
    <DateRangeBar v-model="preset" v-model:from="from" v-model:to="to" />

    <div class="kpi-grid">
      <div class="panel" v-for="card in cards" :key="card.label">
        <div class="kpi-title">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
      </div>
    </div>

    <div class="panel" style="margin-top: 12px">
      <h3>Credit Reconciliation Tool</h3>
      <div class="filter-row">
        <input v-model="adjust.sp_id" placeholder="sp_id" />
        <input v-model.number="adjust.delta" type="number" placeholder="delta" />
        <input v-model="adjust.reason" placeholder="reason" />
        <button class="danger" @click="runAdjust">Adjust (CONFIRM)</button>
      </div>
    </div>

    <div class="panel table-wrap" style="margin-top: 12px">
      <h3>Credit Accounts</h3>
      <table>
        <thead><tr><th>sp_id</th><th>balance</th><th>lifetime_purchased</th><th>lifetime_used</th><th>updated_at</th></tr></thead>
        <tbody>
          <tr v-for="row in accounts" :key="row.sp_id">
            <td>{{ row.sp_id }}</td><td>{{ row.balance }}</td><td>{{ row.lifetime_purchased }}</td><td>{{ row.lifetime_used }}</td><td>{{ row.updated_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row">
      <div class="col panel table-wrap">
        <h3>Orders</h3>
        <table>
          <thead><tr><th>order_id</th><th>sp_id</th><th>credits</th><th>amount</th><th>status</th><th>provider</th><th>created_at</th></tr></thead>
          <tbody>
            <tr v-for="row in orders" :key="row.id">
              <td>{{ row.id }}</td><td>{{ row.sp_id }}</td><td>{{ row.credits }}</td><td>{{ row.amount }}</td><td>{{ row.status }}</td><td>{{ row.provider }}</td><td>{{ row.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col panel table-wrap">
        <h3>Ledger</h3>
        <table>
          <thead><tr><th>entry_id</th><th>sp_id</th><th>entry_type</th><th>delta</th><th>balance_after</th><th>source_type</th><th>source_id</th></tr></thead>
          <tbody>
            <tr v-for="row in ledger" :key="row.id">
              <td>{{ row.id }}</td><td>{{ row.sp_id }}</td><td>{{ row.entry_type }}</td><td>{{ row.delta }}</td><td>{{ row.balance_after }}</td><td>{{ row.source_type }}</td><td>{{ row.source_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DateRangeBar from '../components/DateRangeBar.vue'
import { adminApi } from '../services/adminApi'

const preset = ref('30d')
const from = ref('')
const to = ref('')
const summary = ref({})
const accounts = ref([])
const orders = ref([])
const ledger = ref([])
const adjust = reactive({ sp_id: '', delta: 0, reason: '' })

const ymd = (d) => d.toISOString().slice(0, 10)
const range = () => {
  const now = new Date()
  if (preset.value === 'today') return { from: ymd(now), to: ymd(now) }
  if (preset.value === '7d') {
    const s = new Date(now)
    s.setDate(s.getDate() - 6)
    return { from: ymd(s), to: ymd(now) }
  }
  if (preset.value === '30d') {
    const s = new Date(now)
    s.setDate(s.getDate() - 29)
    return { from: ymd(s), to: ymd(now) }
  }
  return { from: from.value, to: to.value }
}

const load = async () => {
  const r = range()
  summary.value = await adminApi.getBillingSummary(r)
  accounts.value = (await adminApi.listCreditAccounts({ page: 1, page_size: 200 })).items || []
  orders.value = (await adminApi.listCreditOrders(r)).items || []
  ledger.value = (await adminApi.listCreditLedger(r)).items || []
}

const runAdjust = async () => {
  await adminApi.adjustCredits({
    sp_id: adjust.sp_id,
    delta: Number(adjust.delta || 0),
    reason: adjust.reason,
    confirm_token: 'CONFIRM',
  })
  await load()
}

const cards = computed(() => [
  { label: 'MRR (estimate)', value: `$${summary.value.plan_overview?.mrr_estimate_usd || 0}` },
  { label: 'Conversion rate', value: `${summary.value.plan_overview?.conversion_rate || 0}%` },
  { label: 'Total purchased', value: summary.value.sp_credit_overview?.total_purchased || 0 },
  { label: 'Total balance', value: summary.value.sp_credit_overview?.total_balance || 0 },
])

watch([preset, from, to], load)
onMounted(load)
</script>
