<template>
  <section>
    <DateRangeBar v-model="preset" v-model:from="from" v-model:to="to" />

    <div class="kpi-grid">
      <div class="panel" v-for="card in cards" :key="card.label">
        <div class="kpi-title">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div v-if="card.caption" class="metric-caption">{{ card.caption }}</div>
      </div>
    </div>

    <div class="panel billing-note" style="margin-top: 12px">
      <strong>Phase 1 scope:</strong>
      SP billing covers bid credits only. Launch SKUs are `sp_bid_single` ($4.99 / 1 credit) and
      `sp_bid_starter_10` ($29.99 / 10 credits). Payment confirmation and crediting remain separate events.
    </div>

    <div class="panel" style="margin-top: 12px">
      <h3>Manual Credit Adjustment</h3>
      <div class="filter-row">
        <input v-model.trim="adjust.sp_id" placeholder="sp_id" />
        <input v-model.number="adjust.delta" type="number" placeholder="delta" />
        <input v-model.trim="adjust.reason" placeholder="reason (required)" />
        <button class="danger" @click="runAdjust">Adjust (CONFIRM)</button>
      </div>
      <div class="inline-note">Every adjustment requires a reason and is expected to create an auditable ledger entry.</div>
    </div>

    <div class="panel" style="margin-top: 12px">
      <h3>Filters</h3>
      <div class="filter-row">
        <input v-model.trim="filters.sp_id" placeholder="Filter by sp_id" />
        <select v-model="filters.order_status">
          <option value="">All order statuses</option>
          <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
        <select v-model="filters.entry_type">
          <option value="">All ledger types</option>
          <option v-for="entryType in ledgerEntryTypes" :key="entryType" :value="entryType">{{ entryType }}</option>
        </select>
        <button class="primary" @click="load">Apply Filters</button>
      </div>
    </div>

    <div class="panel table-wrap" style="margin-top: 12px">
      <div class="section-header">
        <h3>Credit Accounts</h3>
        <span class="inline-note">Current balance snapshot by SP.</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>sp_id</th>
            <th>balance</th>
            <th>lifetime_purchased</th>
            <th>lifetime_used</th>
            <th>updated_at</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in accounts" :key="row.sp_id">
            <td>{{ row.sp_id }}</td>
            <td>{{ row.balance }}</td>
            <td>{{ row.lifetime_purchased }}</td>
            <td>{{ row.lifetime_used }}</td>
            <td>{{ formatDateTime(row.updated_at) }}</td>
          </tr>
          <tr v-if="!accounts.length">
            <td colspan="5" class="empty-state">No matching accounts.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row">
      <div class="col panel table-wrap">
        <div class="section-header">
          <h3>Orders</h3>
          <span class="inline-note">Inspect created, paid, failed, and refunded purchases.</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>order_id</th>
              <th>sp_id</th>
              <th>sku</th>
              <th>credits</th>
              <th>amount</th>
              <th>status</th>
              <th>provider</th>
              <th>created_at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in orders" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.sp_id }}</td>
              <td>{{ row.sku_name || row.sku_code || inferSku(row) }}</td>
              <td>{{ row.credits }}</td>
              <td>{{ formatCurrency(row.amount_cents, row.currency, row.amount) }}</td>
              <td><span :class="statusClass(row.status)">{{ row.status || 'created' }}</span></td>
              <td>{{ row.provider || '-' }}</td>
              <td>{{ formatDateTime(row.created_at) }}</td>
            </tr>
            <tr v-if="!orders.length">
              <td colspan="8" class="empty-state">No matching orders.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col panel table-wrap">
        <div class="section-header">
          <h3>Ledger</h3>
          <span class="inline-note">Append-only audit trail for purchases, consume, refunds, and adjustments.</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>entry_id</th>
              <th>sp_id</th>
              <th>entry_type</th>
              <th>delta</th>
              <th>balance_after</th>
              <th>source_type</th>
              <th>source_id</th>
              <th>created_at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ledger" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.sp_id }}</td>
              <td>{{ row.entry_type }}</td>
              <td :class="Number(row.delta || 0) >= 0 ? 'delta-positive' : 'delta-negative'">
                {{ formatDelta(row.delta) }}
              </td>
              <td>{{ row.balance_after }}</td>
              <td>{{ row.source_type || '-' }}</td>
              <td>{{ row.source_id || row.note || '-' }}</td>
              <td>{{ formatDateTime(row.created_at) }}</td>
            </tr>
            <tr v-if="!ledger.length">
              <td colspan="8" class="empty-state">No matching ledger entries.</td>
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
const filters = reactive({ sp_id: '', order_status: '', entry_type: '' })

const orderStatuses = ['pending', 'created', 'checkout_created', 'paid', 'credited', 'failed', 'canceled', 'cancelled', 'refunded']
const ledgerEntryTypes = ['purchase', 'consume', 'refund', 'adjustment', 'void', 'bid_use', 'usage']

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

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const formatDelta = (value) => {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '-'
  return amount > 0 ? `+${amount}` : String(amount)
}

const inferSku = (row) => {
  if (Number(row.credits || 0) === 10) return 'sp_bid_starter_10'
  if (Number(row.credits || 0) === 1) return 'sp_bid_single'
  return '-'
}

const formatCurrency = (amountCents, currency = 'USD', amountValue = null) => {
  const cents = Number(amountCents || 0)
  const amount = Number(amountValue || 0)
  const value = Number.isFinite(cents) && cents > 0 ? cents / 100 : amount
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

const statusClass = (status) => {
  const value = String(status || '').toLowerCase()
  if (['pending', 'created', 'checkout_created'].includes(value)) return 'badge warning'
  if (['paid', 'credited'].includes(value)) return 'badge ok'
  if (['failed', 'refunded', 'canceled', 'cancelled'].includes(value)) return 'badge critical'
  return 'badge warning'
}

const load = async () => {
  const r = range()
  const accountFilters = {
    page: 1,
    page_size: 200,
    sp_id: filters.sp_id,
  }
  const orderFilters = {
    ...r,
    sp_id: filters.sp_id,
    status: filters.order_status,
  }
  const ledgerFilters = {
    ...r,
    sp_id: filters.sp_id,
    entry_type: filters.entry_type,
  }

  summary.value = await adminApi.getBillingSummary(r)
  accounts.value = (await adminApi.listCreditAccounts(accountFilters)).items || []
  orders.value = (await adminApi.listCreditOrders(orderFilters)).items || []
  ledger.value = (await adminApi.listCreditLedger(ledgerFilters)).items || []
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
  { label: 'Total purchased', value: summary.value.sp_credit_overview?.total_purchased || 0, caption: 'Confirmed credit purchases' },
  { label: 'Total balance', value: summary.value.sp_credit_overview?.total_balance || 0, caption: 'Current outstanding credits' },
])

watch([preset, from, to], load)
onMounted(load)
</script>
