<template>
  <q-page class="q-pa-sm sp-credits-page role-workspace-page">
    <q-card flat bordered class="hero-card q-mb-sm">
      <q-card-section class="row items-start justify-between q-col-gutter-md">
        <div class="col-12 col-md">
          <div class="text-overline text-primary">SP Bid Credits</div>
          <div class="text-h5 text-weight-bold">Buy bid access without changing your workflow.</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Credits are only used when a bid is successfully accepted by the backend. Views,
            previews, and rejected duplicate bids do not consume balance.
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <div class="hero-actions">
            <q-btn flat no-caps icon="arrow_back" label="Back" @click="goBack" />
            <q-btn
              flat
              dense
              icon="refresh"
              aria-label="Refresh credits"
              @click="refreshAll"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="summary-grid q-mb-sm">
      <q-card v-for="card in summaryCards" :key="card.label" flat bordered class="summary-card">
        <q-card-section>
          <div class="text-caption text-grey-7">{{ card.label }}</div>
          <div class="text-h5 text-weight-bold q-mt-xs">{{ card.value }}</div>
          <div v-if="card.caption" class="text-caption text-grey-6 q-mt-xs">{{ card.caption }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="row q-col-gutter-sm q-mb-sm">
      <div v-for="sku in skuCatalog" :key="sku.code" class="col-12 col-md-6">
        <q-card flat bordered class="sku-card full-height">
          <q-card-section class="row items-start justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ sku.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{ sku.description }}</div>
            </div>
            <q-badge v-if="sku.badge" color="primary" rounded>{{ sku.badge }}</q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row items-end justify-between q-col-gutter-md">
              <div class="col">
                <div class="sku-price">{{ sku.priceLabel }}</div>
                <div class="text-caption text-grey-6">{{ sku.unitLabel }}</div>
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  :label="creatingSku === sku.code ? 'Creating order...' : 'Buy now'"
                  :loading="creatingSku === sku.code"
                  @click="purchaseSku(sku)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between q-py-sm q-px-md">
            <div>
              <div class="text-subtitle1 text-weight-medium">Purchase History</div>
              <div class="text-caption text-grey-7">Orders created for bid credit packs.</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-table
              flat
              dense
              :rows="orderRows"
              :columns="orderColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 6 }"
              :loading="loading"
              no-data-label="No purchase history yet"
            >
              <template #body-cell-created_at="props">
                <q-td :props="props">{{ formatDateTime(props.row.created_at) }}</q-td>
              </template>
              <template #body-cell-amount="props">
                <q-td :props="props">{{
                  formatCurrency(props.row.amount_cents, props.row.currency, props.row.amount)
                }}</q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="orderStatusColor(props.row.status)" rounded>
                    {{ formatStatus(props.row.status) }}
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">FAQ</div>
            <div class="faq-list">
              <div v-for="item in faqItems" :key="item.q" class="faq-item">
                <div class="text-body2 text-weight-medium">{{ item.q }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">{{ item.a }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div>
          <div class="text-subtitle1 text-weight-medium">Credit Ledger</div>
          <div class="text-caption text-grey-7">
            Auditable balance changes for purchases, usage, refunds, and adjustments.
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          flat
          dense
          :rows="ledgerRows"
          :columns="ledgerColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 8 }"
          :loading="loading"
          no-data-label="No ledger entries yet"
        >
          <template #body-cell-created_at="props">
            <q-td :props="props">{{ formatDateTime(props.row.created_at) }}</q-td>
          </template>
          <template #body-cell-delta="props">
            <q-td
              :props="props"
              :class="Number(props.row.delta || 0) >= 0 ? 'text-positive' : 'text-negative'"
            >
              {{ formatDelta(props.row.delta) }}
            </q-td>
          </template>
          <template #body-cell-entry_type="props">
            <q-td :props="props">{{ formatStatus(props.row.entry_type) }}</q-td>
          </template>
          <template #body-cell-details="props">
            <q-td :props="props">{{ formatLedgerDetails(props.row) }}</q-td>
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

const skuCatalog = [
  {
    code: 'sp_bid_single',
    title: 'Single Bid Credit',
    description: 'Low-friction entry for one qualified opportunity.',
    credits: 1,
    amountCents: 499,
    priceLabel: '$4.99',
    unitLabel: '1 bid credit',
    badge: 'Base SKU',
  },
  {
    code: 'sp_bid_starter_10',
    title: 'Starter Pack',
    description: 'Primary onboarding pack for repeat bidding.',
    credits: 10,
    amountCents: 2999,
    priceLabel: '$29.99',
    unitLabel: '10 bid credits',
    badge: 'Best launch value',
  },
]

const faqItems = [
  {
    q: 'When is a credit consumed?',
    a: 'Only after the backend accepts a valid bid. Previewing a lead or failing eligibility checks does not deduct credits.',
  },
  {
    q: 'What does one credit mean?',
    a: 'In phase 1, one credit equals one bid submission. Credits are not used for unrelated actions.',
  },
  {
    q: 'Why might my balance not change after I create an order?',
    a: 'Balance changes only after Stripe payment confirmation. If Stripe keys are not configured yet, checkout returns a safe placeholder.',
  },
]

const loading = ref(false)
const creatingSku = ref('')
const summary = ref({
  balance: 0,
  lifetime_purchased: 0,
  lifetime_used: 0,
  lifetime_granted: 0,
})
const historyItems = ref([])
const orderItems = ref([])

const summaryCards = computed(() => [
  { label: 'Current Balance', value: summary.value.balance, caption: 'Available bid credits' },
  { label: 'Available Bids', value: summary.value.balance, caption: '1 credit = 1 bid' },
  {
    label: 'Lifetime Purchased',
    value: summary.value.lifetime_purchased,
    caption: 'Paid credits confirmed',
  },
  {
    label: 'Lifetime Used',
    value: summary.value.lifetime_used,
    caption: 'Accepted bid submissions',
  },
])

const orderColumns = [
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'sku_name', label: 'SKU', field: 'sku_name', align: 'left' },
  { name: 'credits', label: 'Credits', field: 'credits', align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

const ledgerColumns = [
  { name: 'created_at', label: 'Time', field: 'created_at', align: 'left' },
  { name: 'entry_type', label: 'Type', field: 'entry_type', align: 'left' },
  { name: 'delta', label: 'Delta', field: 'delta', align: 'left' },
  { name: 'balance_after', label: 'Balance After', field: 'balance_after', align: 'left' },
  { name: 'details', label: 'Details', field: 'details', align: 'left' },
]

const orderRows = computed(() =>
  [...orderItems.value]
    .map((row) => ({
      ...row,
      sku_name: row.sku_name || inferSkuName(row),
      amount_cents: Number(row.amount_cents || 0),
    }))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))),
)

const ledgerRows = computed(() =>
  [...historyItems.value].sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || '')),
  ),
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
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const formatStatus = (value) =>
  String(value || '-')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const orderStatusColor = (status) => {
  const value = String(status || '').toLowerCase()
  if (['paid', 'credited'].includes(value)) return 'positive'
  if (['failed', 'cancelled', 'canceled', 'refunded'].includes(value)) return 'negative'
  return 'grey-7'
}

const formatDelta = (value) => {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '-'
  return amount > 0 ? `+${amount}` : String(amount)
}

const formatCurrency = (amountCents, currency = 'USD', amountValue = null) => {
  const cents = Number(amountCents || 0)
  if (Number.isFinite(cents) && cents > 0) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }
  const amount = Number(amountValue || 0)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

const inferSkuName = (row) => {
  const matched = skuCatalog.find(
    (sku) => sku.code === row.sku_code || sku.credits === Number(row.credits || 0),
  )
  return matched?.title || row.sku_code || 'Bid Credit Order'
}

const formatLedgerDetails = (row) => {
  const parts = []
  if (row.source_type) parts.push(formatStatus(row.source_type))
  if (row.source_id) parts.push(String(row.source_id))
  if (row.note) parts.push(String(row.note))
  if (row.provider_ref) parts.push(`ref ${row.provider_ref}`)
  if (row.meta?.provider_ref) parts.push(`ref ${row.meta.provider_ref}`)
  if (row.meta?.currency && (row.meta?.amount || row.meta?.amount_cents)) {
    parts.push(formatCurrency(row.meta.amount_cents, row.meta.currency, row.meta.amount))
  }
  return parts.length ? parts.join(' · ') : '-'
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
  orderItems.value = data?.orders || []
}

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([loadSummary(), loadHistory()])
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to load credit data.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const purchaseSku = async (sku) => {
  creatingSku.value = sku.code
  try {
    const response = await spCreditApi.createCheckoutSession(userStore.userId, {
      sku_code: sku.code,
      success_url: `${window.location.origin}/sp-credits?checkout=success`,
      cancel_url: `${window.location.origin}/sp-credits?checkout=cancel`,
    })
    const order = response?.order
    const checkoutUrl = response?.checkout_session?.checkout_url
    if (checkoutUrl) {
      window.location.href = checkoutUrl
      return
    }
    Notify.create({
      type: 'warning',
      message:
        response?.checkout_session?.message ||
        (order?.id
          ? `Order ${order.id} created. Stripe checkout is not configured yet.`
          : 'Order created. Stripe checkout is not configured yet.'),
      position: 'top',
    })
    await loadHistory()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to create bid credit order.',
      position: 'top',
    })
  } finally {
    creatingSku.value = ''
  }
}

onMounted(refreshAll)
</script>

<style scoped>
.hero-card {
  background:
    radial-gradient(circle at top right, rgba(25, 118, 210, 0.12), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.hero-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}

.summary-card,
.sku-card {
  border-radius: 18px;
}

.sku-price {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}

.faq-list {
  display: grid;
  gap: 14px;
}

.faq-item + .faq-item {
  padding-top: 14px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

@media (max-width: 767px) {
  .hero-actions {
    justify-content: flex-start;
  }
}
</style>
