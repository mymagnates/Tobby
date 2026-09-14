<template>
  <section class="deposit-workspace" aria-label="Deposit tracking">
    <header class="deposit-heading">
      <div>
        <h2>{{ activeLeaseId ? 'Lease deposit' : 'Property deposits' }}</h2>
        <p>Track funds held, refunds and agreed deductions. No automatic money transfers.</p>
      </div>
      <div class="row no-wrap">
        <q-btn
          v-if="!leaseId && activeLeaseId"
          flat
          no-caps
          label="All leases"
          @click="activeLeaseId = ''"
        />
        <q-btn
          flat
          round
          icon="refresh"
          aria-label="Refresh deposits"
          :disable="loading || saving"
          @click="load"
        />
      </div>
    </header>
    <div v-if="error" class="deposit-error" role="alert">
      {{ error }} <q-btn v-if="!saving" flat no-caps label="Retry load" @click="load" />
    </div>
    <p v-if="loading" role="status"><q-spinner /> Loading deposits...</p>
    <template v-else-if="data">
      <template v-if="!activeLeaseId">
        <div class="deposit-filters">
          <q-input v-model="search" outlined dense label="Find lease" />
          <q-select
            v-model="filter"
            :options="statusOptions"
            outlined
            dense
            label="Status"
            emit-value
            map-options
          />
          <q-btn
            outline
            no-caps
            label="Export CSV"
            :disable="!filteredAccounts.length"
            @click="download"
          />
        </div>
        <q-table
          flat
          :rows="filteredAccounts"
          :columns="accountColumns"
          row-key="lease_id"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-open="cell"
            ><q-td :props="cell"
              ><q-btn flat no-caps label="View" @click="activeLeaseId = cell.row.lease_id" /></q-td
          ></template>
        </q-table>
        <details v-if="data.unlinked.length" class="deposit-unlinked">
          <summary>{{ data.unlinked.length }} unlinked deposit transactions need review</summary>
          <p>
            These are not included in lease balances until you link them. Never record a new receipt
            for money already recorded here. Link receipts before refunds; invalid source records
            need manual review.
          </p>
          <div v-for="item in data.unlinked" :key="item.id" class="deposit-legacy-row">
            <span>{{ item.date }} · {{ money(item.amount) }} · {{ item.type }}</span>
            <template v-if="item.importable">
              <q-select
                v-model="linkTargets[item.id]"
                :options="leaseOptions"
                emit-value
                map-options
                dense
                outlined
                label="Choose lease"
              />
              <q-btn
                outline
                no-caps
                label="Link transaction"
                :disable="saving || !linkTargets[item.id]"
                @click="linkReceipt(item)"
              />
            </template>
          </div>
        </details>
      </template>
      <template v-else>
        <p>
          <strong>{{ data.summary.label }}</strong> · {{ label(data.summary.status) }}
        </p>
        <div class="deposit-metrics">
          <div v-for="metric in metrics" :key="metric.key">
            <span>{{ metric.title }}</span
            ><strong>{{ money(data.summary[metric.key]) }}</strong>
          </div>
        </div>
        <p v-if="data.summary.status === 'pending_settlement'" class="deposit-notice">
          Review the remaining balance and history before marking this deposit settled. Ending or
          archiving a lease does not clear its deposit.
        </p>
        <p v-if="data.summary.status === 'not_received'" class="deposit-notice">
          Required is the lease agreement amount, not proof of receipt. Check the property's
          unlinked legacy deposits before recording a new receipt.
        </p>
        <q-btn
          v-if="!showForm"
          outline
          no-caps
          :label="data.summary.status === 'settled' ? 'Reopen deposit' : 'Record deposit action'"
          @click="openForm"
        />
        <q-form v-if="showForm" class="deposit-form" @submit="save">
          <p v-if="uncertain" role="status">
            The save result is unknown. Retry this same record or refresh to check its status. Do
            not enter another receipt for the same payment.
          </p>
          <q-select
            v-model="form.action"
            :options="actionOptions"
            emit-value
            map-options
            outlined
            label="Action"
            :disable="saving || uncertain"
          />
          <q-input
            v-if="['receipt', 'refund', 'deduction'].includes(form.action)"
            v-model.number="form.amount"
            type="number"
            min="0.01"
            step="0.01"
            outlined
            label="Amount (USD)"
            :disable="saving || uncertain"
            :rules="[(v) => Number(v) > 0 || 'Enter a positive amount']"
          />
          <q-input
            v-model="form.date"
            type="date"
            outlined
            label="Transaction date"
            :disable="saving || uncertain"
          />
          <template v-if="form.action === 'deduction'">
            <q-select
              v-model="form.reason"
              :options="reasonOptions"
              emit-value
              map-options
              outlined
              label="Purpose"
              :disable="saving || uncertain"
            />
            <q-checkbox
              v-model="form.accounting_confirmed"
              label="This reduces funds held only. Any rent or compensation P&L entry is handled separately, without duplication."
              :disable="saving || uncertain"
            />
          </template>
          <q-select
            v-if="form.action === 'reversal'"
            v-model="form.reverses_id"
            :options="reversalOptions"
            emit-value
            map-options
            outlined
            label="Entry to correct"
            :disable="saving || uncertain"
          />
          <q-checkbox
            v-if="form.action === 'settle'"
            v-model="form.reconciliation_confirmed"
            label="All receipts, refunds, deductions and legacy records have been reviewed; no actions remain pending."
            :disable="saving || uncertain"
          />
          <q-input
            v-model="form.note"
            outlined
            type="textarea"
            autogrow
            label="Description / payment or settlement reference"
            maxlength="2000"
            :disable="saving || uncertain"
            :rules="[(v) => !!v?.trim() || 'A reference is required']"
          />
          <p>
            Only record completed or agreed actions. Refund here records an external payment; it
            does not send money. Corrections preserve the original entry. Reversing a linked
            transaction removes its lease association, not the original transaction; it can then be
            linked to the correct lease.
          </p>
          <div class="row q-gutter-sm">
            <q-btn
              type="submit"
              unelevated
              no-caps
              label="Save record"
              color="primary"
              :loading="saving"
            /><q-btn
              flat
              no-caps
              label="Cancel"
              :disable="saving || uncertain"
              @click="showForm = false"
            />
          </div>
        </q-form>
        <q-table
          flat
          :rows="data.entries"
          :columns="entryColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 10, sortBy: 'version', descending: true }"
        />
      </template>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  getPropertyDeposits,
  getLeaseDeposit,
  recordDepositEntry,
  depositCsv,
} from '../../services/depositApi'
import { localCalendarDate } from '../../utils/reportingDates'
const props = defineProps({
  propertyId: { type: String, required: true },
  leaseId: { type: String, default: '' },
  leaseStatus: { type: String, default: '' },
})
const activeLeaseId = ref(props.leaseId),
  data = ref(null),
  error = ref(''),
  loading = ref(false),
  saving = ref(false),
  uncertain = ref(false),
  showForm = ref(false)
const search = ref(''),
  filter = ref('all'),
  linkTargets = reactive({})
const form = reactive({
  action: 'receipt',
  amount: null,
  date: localCalendarDate(),
  note: '',
  reason: 'rent',
  reverses_id: '',
  accounting_confirmed: false,
  reconciliation_confirmed: false,
})
const label = (value) => String(value || '').replaceAll('_', ' ')
const money = (v) =>
  v === null || v === undefined || !Number.isFinite(Number(v))
    ? 'Not available'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v))
const metrics = [
  { key: 'expected', title: 'Required' },
  { key: 'received', title: 'Received' },
  { key: 'refunded', title: 'Refunded' },
  { key: 'deducted', title: 'Deducted' },
  { key: 'balance', title: 'Held balance' },
]
const col = (field, title, format) => ({
  name: field,
  field,
  label: title,
  align: format === money ? 'right' : 'left',
  format,
  sortable: true,
})
const accountColumns = [
  col('label', 'Lease'),
  ...metrics.map((m) => col(m.key, m.title, money)),
  col('status', 'Status', label),
  col('open', ''),
]
const entryColumns = [
  col('version', '#'),
  col('date', 'Date'),
  col('action', 'Action', label),
  col('amount', 'Amount', money),
  col('note', 'Reference'),
  col('reversed', 'Corrected', (v) => (v ? 'Reversed' : '')),
  col('recorded_at', 'Recorded at'),
]
const statusOptions = [
  { label: 'All', value: 'all' },
  ...[
    'not_received',
    'partially_received',
    'held',
    'pending_settlement',
    'settled',
    'not_required',
    'needs_review',
  ].map((v) => ({ label: label(v), value: v })),
]
const filteredAccounts = computed(() =>
  (data.value?.accounts || []).filter(
    (row) =>
      (filter.value === 'all' || row.status === filter.value) &&
      String(row.label).toLowerCase().includes(search.value.toLowerCase()),
  ),
)
const leaseOptions = computed(() =>
  (data.value?.accounts || [])
    .filter((r) => r.status !== 'needs_review')
    .map((r) => ({ label: r.label, value: r.lease_id })),
)
const actionOptions = computed(() =>
  (data.value?.summary?.status === 'settled'
    ? ['reopen']
    : ['receipt', 'refund', 'deduction', 'reversal', 'settle']
  ).map((v) => ({ label: label(v), value: v })),
)
const reasonOptions = ['rent', 'repair', 'other'].map((v) => ({ label: label(v), value: v }))
const reversalOptions = computed(() =>
  (data.value?.entries || [])
    .filter((e) => ['receipt', 'refund', 'deduction'].includes(e.action) && !e.reversed)
    .map((e) => ({ label: `${e.date} ${e.action} ${money(e.amount)} - ${e.note}`, value: e.id })),
)
let sequence = 0,
  controller,
  pending = null
async function load() {
  const request = ++sequence
  controller?.abort()
  controller = new AbortController()
  data.value = null
  error.value = ''
  loading.value = true
  try {
    const result = activeLeaseId.value
      ? await getLeaseDeposit(props.propertyId, activeLeaseId.value, { signal: controller.signal })
      : await getPropertyDeposits(props.propertyId, { signal: controller.signal })
    if (request === sequence) {
      data.value = result
      if (pending && result.entries?.some((entry) => entry.id === pending.body.operation_id)) {
        pending = null
        uncertain.value = false
        showForm.value = false
      }
    }
  } catch (e) {
    if (request === sequence && e.name !== 'AbortError') error.value = e.message
  } finally {
    if (request === sequence) loading.value = false
  }
}
function openForm() {
  if (uncertain.value) return
  pending = null
  Object.assign(form, {
    action: data.value.summary.status === 'settled' ? 'reopen' : 'receipt',
    amount: null,
    date: localCalendarDate(),
    note: '',
    reverses_id: '',
    accounting_confirmed: false,
    reconciliation_confirmed: false,
  })
  showForm.value = true
}
async function save() {
  if (saving.value || !data.value?.summary) return
  if (form.action === 'deduction' && !form.accounting_confirmed) {
    error.value = 'Confirm the separate accounting treatment first.'
    return
  }
  if (form.action === 'settle' && !form.reconciliation_confirmed) {
    error.value = 'Review and confirm that no actions remain pending.'
    return
  }
  const input = { ...form }
  const signature = JSON.stringify(input)
  if (!pending || pending.signature !== signature)
    pending = {
      signature,
      body: {
        ...input,
        expected_version: data.value.summary.version,
        operation_id: crypto.randomUUID(),
      },
    }
  const request = sequence
  saving.value = true
  error.value = ''
  try {
    const result = await recordDepositEntry(props.propertyId, activeLeaseId.value, pending.body)
    if (request === sequence) {
      data.value = result
      showForm.value = false
      pending = null
      uncertain.value = false
    }
  } catch (e) {
    if (request === sequence) {
      if (e.status === 400 || e.status === 409) {
        pending = null
        uncertain.value = false
        await load()
      } else uncertain.value = true
      error.value = e.message
    }
  } finally {
    saving.value = false
  }
}
async function linkReceipt(item) {
  if (saving.value) return
  const propertyId = props.propertyId,
    leaseId = linkTargets[item.id],
    request = sequence
  saving.value = true
  error.value = ''
  try {
    const current = await getLeaseDeposit(propertyId, leaseId)
    if (request !== sequence) return
    await recordDepositEntry(propertyId, leaseId, {
      action: 'import',
      date: localCalendarDate(),
      note: `Linked deposit transaction ${item.id}`,
      source_transaction_id: item.id,
      expected_version: current.summary.version,
      operation_id: `import-${item.id}`,
    })
    if (request === sequence) await load()
  } catch (e) {
    if (request === sequence) error.value = e.message
  } finally {
    saving.value = false
  }
}
function download() {
  const url = URL.createObjectURL(
    new Blob(['\ufeff', depositCsv(filteredAccounts.value)], { type: 'text/csv;charset=utf-8' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'property-deposits.csv'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
watch(
  () => [props.propertyId, props.leaseId],
  () => {
    activeLeaseId.value = props.leaseId
    showForm.value = false
    pending = null
    uncertain.value = false
    load()
  },
)
watch(
  [activeLeaseId, () => props.leaseStatus],
  () => {
    showForm.value = false
    pending = null
    uncertain.value = false
    load()
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  sequence += 1
  controller?.abort()
})
</script>

<style scoped>
.deposit-workspace {
  padding: 20px;
  border: 1px solid #dce5dd;
  border-radius: 12px;
  background: #fff;
  color: #243b30;
  min-width: 0;
}
.deposit-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}
h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
}
p {
  font-size: 12px;
  line-height: 1.6;
  color: #627269;
}
.deposit-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.deposit-metrics span {
  display: block;
  font-size: 12px;
  color: #627269;
}
.deposit-metrics strong {
  display: block;
  font-size: 20px;
  overflow-wrap: anywhere;
}
.deposit-filters,
.deposit-legacy-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 20px 0;
}
.deposit-filters .q-field,
.deposit-legacy-row .q-field {
  min-width: 160px;
  flex: 1;
}
.deposit-error {
  padding: 12px;
  color: #954031;
  background: #fff2e8;
  margin: 16px 0;
}
.deposit-form {
  display: grid;
  gap: 12px;
  max-width: 640px;
  margin: 20px 0;
  padding: 16px;
  background: #f4f7f1;
  border-radius: 10px;
}
.deposit-notice,
.deposit-unlinked {
  background: #f4f7f1;
  padding: 12px;
  border-radius: 8px;
}
.deposit-unlinked summary {
  cursor: pointer;
}
:deep(.q-table__middle) {
  overflow-x: auto;
}
@media (max-width: 600px) {
  .deposit-workspace {
    padding: 14px;
  }
  .deposit-metrics {
    grid-template-columns: 1fr 1fr;
  }
  .deposit-heading {
    flex-wrap: wrap;
  }
}
</style>
