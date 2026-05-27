<template>
  <q-page class="report-page q-pa-md">
    <q-card flat bordered class="report-hero q-mb-md">
      <q-card-section class="report-hero__header">
        <div>
          <div class="report-eyebrow">Real Estate Reporting</div>
          <h1 class="report-title">Financial & Operations Insights</h1>
          <p class="report-subtitle">
            P&amp;L, rent roll, cash movement, general ledger detail, and maintenance risk in one
            report set.
          </p>
        </div>
        <q-chip square class="perspective-chip" icon="visibility">
          {{ reportPerspectiveLabel }}
        </q-chip>
      </q-card-section>
      <q-card-section class="report-controls">
        <q-select
          v-model="selectedProperties"
          :options="propertyOptions"
          label="Properties"
          class="report-filter-control"
          outlined
          dense
          multiple
          emit-value
          map-options
          clearable
          use-chips
        />
        <q-select
          v-model="dateRange"
          :options="dateRangeOptions"
          label="Period"
          class="report-filter-control"
          outlined
          dense
        />
        <q-btn-dropdown
          icon="download"
          color="primary"
          label="Export"
          outline
          no-caps
          class="report-action-btn"
          split
          @click="exportAllReports"
        >
          <q-list>
            <q-item clickable v-close-popup @click="exportAllReports">
              <q-item-section>Full report package</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="downloadTransactionsCSV">
              <q-item-section>General ledger CSV</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="downloadTasksCSV">
              <q-item-section>Operations event CSV</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportSummaryReport">
              <q-item-section>P&amp;L summary CSV</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-card-section>
      <q-card-section class="accounting-basis">
        <q-icon name="info_outline" size="18px" />
        <span>{{ perspectiveDefinition }}</span>
      </q-card-section>
    </q-card>

    <section class="metric-grid q-mb-md" aria-label="Portfolio financial summary">
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Recorded Revenue</div>
        <div class="metric-value text-positive">${{ totalIncome }}</div>
        <div class="metric-caption">{{ revenueCaption }}</div>
      </q-card>
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Recorded Expenses</div>
        <div class="metric-value text-negative">${{ totalExpenses }}</div>
        <div class="metric-caption">{{ expenseCaption }}</div>
      </q-card>
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Net Recorded Cash</div>
        <div class="metric-value text-primary">${{ netProfit }}</div>
        <div class="metric-caption">Receipts less paid costs</div>
      </q-card>
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Scheduled Monthly Rent</div>
        <div class="metric-value">${{ formatAmount(scheduledMonthlyRent) }}</div>
        <div class="metric-caption">{{ activeLeaseCount }} active lease(s)</div>
      </q-card>
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Open Operations Events</div>
        <div class="metric-value risk-value">{{ openTaskCount }}</div>
        <div class="metric-caption">{{ overdueTaskCount }} past due task(s)</div>
      </q-card>
      <q-card flat bordered class="metric-card">
        <div class="metric-label">Task-Linked Ops Spend</div>
        <div class="metric-value">${{ formatAmount(taskLinkedOperationsSpend) }}</div>
        <div class="metric-caption">
          {{ formatPercent(maintenanceCostRatio) }} of recorded rent receipts
        </div>
      </q-card>
    </section>

    <div class="financial-grid q-mb-md">
      <q-card flat bordered class="report-panel">
        <q-card-section class="panel-header">
          <div>
            <div class="panel-kicker">Tax &amp; Finance</div>
            <div class="panel-title">Profit &amp; Loss</div>
          </div>
          <q-badge outline color="primary">{{ reportPerspectiveLabel }}</q-badge>
        </q-card-section>
        <q-card-section class="pnl-total-row">
          <div>
            <span>Revenue</span><strong class="text-positive">${{ totalIncome }}</strong>
          </div>
          <div>
            <span>Expenses</span><strong class="text-negative">(${{ totalExpenses }})</strong>
          </div>
          <div class="pnl-net">
            <span>Net result</span><strong>${{ netProfit }}</strong>
          </div>
        </q-card-section>
        <q-table
          :rows="profitLossRows"
          :columns="profitLossColumns"
          row-key="category"
          dense
          flat
          hide-bottom
          :pagination="{ rowsPerPage: 0 }"
          class="report-table pnl-table"
          no-data-label="No categorized transactions in this period."
        />
      </q-card>

      <q-card flat bordered class="report-panel">
        <q-card-section class="panel-header">
          <div>
            <div class="panel-kicker">Liquidity</div>
            <div class="panel-title">Cash Flow</div>
          </div>
          <span class="panel-note">Recorded movement by month</span>
        </q-card-section>
        <q-card-section>
          <div class="chart-container">
            <canvas ref="coreCashFlowChartCanvas" style="max-height: 285px"></canvas>
          </div>
          <div class="data-caveat">
            Based on paid/recorded transactions; it is not an accrual or bank-reconciliation
            statement.
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-card flat bordered class="report-panel q-mb-md">
      <q-card-section class="panel-header">
        <div>
          <div class="panel-kicker">Leasing &amp; Cash Planning</div>
          <div class="panel-title">Rent Roll</div>
        </div>
        <div class="rent-summary">
          <span>{{ activeLeaseCount }} active</span>
          <span>${{ formatAmount(scheduledAnnualRent) }} annual scheduled</span>
          <span>${{ formatAmount(recordedRentReceipts) }} recorded receipts</span>
        </div>
      </q-card-section>
      <q-table
        :rows="rentRollRows"
        :columns="rentRollColumns"
        row-key="id"
        :loading="loading"
        flat
        dense
        :pagination="rentRollPagination"
        class="report-table"
        no-data-label="No leases in the selected property scope."
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.value === 'Active' ? 'positive' : 'grey-6'"
              text-color="white"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-monthly_rent="props">
          <q-td :props="props">${{ formatAmount(props.value) }}</q-td>
        </template>
        <template v-slot:body-cell-annual_rent="props">
          <q-td :props="props">${{ formatAmount(props.value) }}</q-td>
        </template>
      </q-table>
    </q-card>

    <div class="operations-grid q-mb-md">
      <q-card flat bordered class="report-panel">
        <q-card-section class="panel-header">
          <div>
            <div class="panel-kicker">Operating Cost &amp; Risk</div>
            <div class="panel-title">Maintenance Event Trend</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="chart-container">
            <canvas ref="maintenanceChartCanvas" style="max-height: 270px"></canvas>
          </div>
        </q-card-section>
      </q-card>
      <q-card flat bordered class="report-panel risk-panel">
        <q-card-section class="panel-header">
          <div>
            <div class="panel-kicker">Review Queue</div>
            <div class="panel-title">Risk Signals</div>
          </div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="signal in riskSignals" :key="signal.label">
            <q-item-section>
              <q-item-label>{{ signal.label }}</q-item-label>
              <q-item-label caption>{{ signal.detail }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="signal.color" :label="signal.value" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-card flat bordered class="report-panel q-mb-md">
      <q-card-section class="panel-header">
        <div>
          <div class="panel-kicker">Operations / Maintenance</div>
          <div class="panel-title">Task Event Stream</div>
        </div>
        <q-btn
          outline
          dense
          color="primary"
          icon="download"
          label="Export Events"
          class="report-action-btn"
          @click="downloadTasksCSV"
        />
      </q-card-section>
      <q-table
        :rows="filteredTasks"
        :columns="taskColumns"
        row-key="id"
        :pagination="taskPagination"
        :loading="loading"
        flat
        dense
        class="report-table"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="getTaskStatusColor(props.value)" text-color="white" size="sm">
              {{ props.value || 'Open' }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-reported_role="props">
          <q-td :props="props">
            <q-chip :color="getRoleColor(props.value)" text-color="white" size="sm">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-property="props">
          <q-td :props="props">{{ getPropertyName(props.row.property_id) }}</q-td>
        </template>
        <template v-slot:body-cell-linked_tx_total="props">
          <q-td :props="props">${{ formatAmount(props.value) }}</q-td>
        </template>
      </q-table>
    </q-card>

    <q-card flat bordered class="report-panel q-mb-lg">
      <q-card-section class="panel-header">
        <div>
          <div class="panel-kicker">Accounting Detail</div>
          <div class="panel-title">General Ledger</div>
        </div>
        <q-btn
          outline
          dense
          color="primary"
          icon="download"
          label="Export Ledger"
          class="report-action-btn"
          @click="downloadTransactionsCSV"
        />
      </q-card-section>
      <q-table
        :rows="filteredTransactions"
        :columns="transactionColumns"
        row-key="id"
        :pagination="transactionPagination"
        :loading="loading"
        flat
        dense
        class="report-table"
      >
        <template v-slot:body-cell-transac_type="props">
          <q-td :props="props">
            <q-chip :color="getTransactionTypeColor(props.value)" text-color="white" size="sm">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-property="props">
          <q-td :props="props">{{ getPropertyName(props.row.property_id) }}</q-td>
        </template>
        <template v-slot:body-cell-flow="props">
          <q-td :props="props">
            <q-chip
              :color="
                props.value === 'Income'
                  ? 'positive'
                  : props.value === 'Expense'
                    ? 'negative'
                    : 'grey'
              "
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-amount="props">
          <q-td :props="props">
            <span :class="getAmountClass(props.row)">${{ formatAmount(props.value) }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-task_link="props">
          <q-td :props="props">{{ props.value || '-' }}</q-td>
        </template>
        <template v-slot:body-cell-picture="props">
          <q-td :props="props">
            <q-icon
              v-if="props.value"
              name="photo"
              color="primary"
              size="sm"
              class="cursor-pointer"
              @click="viewImage(props.value)"
            >
              <q-tooltip>View supporting image</q-tooltip>
            </q-icon>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Image Viewer Dialog -->
    <q-dialog v-model="showImageViewer" maximized>
      <q-card class="image-viewer-card">
        <q-card-section class="image-viewer-content">
          <q-img :src="currentImageUrl" class="fullscreen-image" fit="contain">
            <template v-slot:loading>
              <q-spinner-gears color="primary" size="50px" />
            </template>
          </q-img>
        </q-card-section>
        <q-card-actions class="absolute-top-right">
          <q-btn flat round dense icon="close" color="white" @click="closeImageViewer" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'
import { normalizeRoleValue } from '../utils/roleUtils'

const userDataStore = useUserDataStore()
const router = useRouter()
const route = useRoute()

// Reactive data
const loading = ref(false)
const dataLoaded = ref(false)
const selectedProperties = ref([])
const dateRange = ref('Current Tax Year')
// This route is the PM business report; owner reporting is provided on /po-dashboard.
const reportPerspective = ref('pm')
const chartsReady = ref(false)
let chartsUpdateTimer = null
const showImageViewer = ref(false)
const currentImageUrl = ref('')

// Chart references
const coreCashFlowChartCanvas = ref(null)
const maintenanceChartCanvas = ref(null)
let coreCashFlowChart = null
let maintenanceChart = null

// Options
const dateRangeOptions = [
  'Current Tax Year',
  'Previous Tax Year',
  'Last 30 Days',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'All Time',
]

const normalizePropertyId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value.id || value.property_id || '').trim()
  }
  return String(value).trim()
}

const normalizeTransactionRole = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  if (!raw) return ''
  if (raw === 'pm' || raw === 'property manager' || raw === 'manager') return 'pm'
  if (raw === 'po' || raw === 'property owner' || raw === 'owner' || raw === 'landlord') return 'po'
  if (raw === 'tt' || raw === 'tenant') return 'tt'
  if (raw === 'sp' || raw === 'service provider' || raw === 'contractor') return 'sp'
  if (raw === 'admin' || raw === 'administrator') return 'admin'
  if (raw === 'government' || raw === 'gov') return 'government'
  if (raw === 'hoa') return 'hoa'
  return raw
}

const toDateSafe = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeFlowType = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (normalized === 'income' || normalized === 'expense') return normalized
  return ''
}

const getTransactionTaskLinkId = (transaction) =>
  String(transaction?.task_id || transaction?.related_task_id || '').trim()

const getTaskIdCandidates = (task) => [
  ...new Set(
    [task?.id, task?.mx_id, task?.task_id]
      .filter((value) => value !== null && value !== undefined && String(value).trim().length)
      .map((value) => String(value).trim()),
  ),
]

const classifyTransactionFlow = (transaction, roleOverride = null) => {
  const fromRole = normalizeTransactionRole(transaction?.transac_from || transaction?.role)
  const toRole = normalizeTransactionRole(transaction?.transac_to)
  const explicitRole = normalizeTransactionRole(roleOverride)
  const portfolioRoles = ['pm', 'po']

  if (explicitRole) {
    if (toRole && toRole === explicitRole) return 'income'
    if (fromRole && fromRole === explicitRole) return 'expense'
    if (toRole || fromRole) return 'ignore'
  } else {
    if (toRole && portfolioRoles.includes(toRole)) return 'income'
    if (fromRole && portfolioRoles.includes(fromRole)) return 'expense'
  }

  const explicitType = normalizeFlowType(transaction?.type)
  if (explicitType) return explicitType

  const amount = Number(transaction?.amount || 0)
  if (Number.isFinite(amount) && amount < 0) return 'expense'
  return 'ignore'
}

const getTransactionFlowLabel = (transaction, roleOverride = null) => {
  const flowType = classifyTransactionFlow(transaction, roleOverride)
  if (flowType === 'income') return 'Income'
  if (flowType === 'expense') return 'Expense'
  return 'N/A'
}

const reportPerspectiveLabel = computed(() => 'PM Business Report')

const perspectiveDefinition = computed(
  () =>
    'PM basis: management fees received from owners are management revenue; only payments made by the PM are expenses.',
)

const revenueCaption = computed(
  () => `Includes $${formatAmount(managementFeeIncome.value)} in management fee revenue`,
)

const expenseCaption = computed(() => 'Payments made by the PM business')

const perspectivePropertyIds = computed(() => {
  const roleMatches = userDataStore.userRoles
    .filter(
      (role) =>
        normalizeRoleValue(role?.role) === reportPerspective.value &&
        (role?.status || 'active') === 'active',
    )
    .map((role) => normalizePropertyId(role?.property_id))
    .filter(Boolean)
  return new Set(
    roleMatches.length ? roleMatches : userDataStore.userAccessibleProperties.map((p) => p.id),
  )
})

const scopedProperties = computed(() =>
  userDataStore.userAccessibleProperties.filter((property) =>
    perspectivePropertyIds.value.has(normalizePropertyId(property.id)),
  ),
)

const reportProperties = computed(() =>
  selectedProperties.value?.length
    ? scopedProperties.value.filter((property) =>
        selectedProperties.value.includes(normalizePropertyId(property.id)),
      )
    : scopedProperties.value,
)

// Property options stay within the selected accounting perspective.
const propertyOptions = computed(() => {
  return scopedProperties.value.map((p) => ({
    label: p.nickname || p.address,
    value: p.id,
  }))
})

// Total data count for status banner
const totalDataCount = computed(() => {
  const transactionCount = userDataStore.userAccessibleTransactions.length
  const taskCount = userDataStore.userAccessibleMxRecords.length
  const leaseCount = userDataStore.userAccessibleLeases.length
  return transactionCount + taskCount + leaseCount
})

const hasReportData = computed(() => totalDataCount.value > 0)

// Filtered data based on role and property selection
const scopedTransactions = computed(() => {
  let transactions = Array.isArray(userDataStore.userAccessibleTransactions)
    ? userDataStore.userAccessibleTransactions
    : []

  transactions = transactions.filter((t) =>
    perspectivePropertyIds.value.has(normalizePropertyId(t.property_id)),
  )

  // Filter by properties (multiple selection)
  if (selectedProperties.value && selectedProperties.value.length > 0) {
    transactions = transactions.filter((t) =>
      selectedProperties.value.includes(normalizePropertyId(t.property_id)),
    )
  }

  // Filter by date range
  transactions = filterByDateRange(transactions, 'transac_date')

  return transactions
})

const filteredTransactions = computed(() => {
  return scopedTransactions.value.filter(
    (transaction) => classifyTransactionFlow(transaction, reportPerspective.value) !== 'ignore',
  )
})

const filteredTasks = computed(() => {
  let tasks = Array.isArray(userDataStore.userAccessibleMxRecords)
    ? userDataStore.userAccessibleMxRecords
    : []

  tasks = tasks.filter((t) => perspectivePropertyIds.value.has(normalizePropertyId(t.property_id)))

  // Filter by properties (multiple selection)
  if (selectedProperties.value && selectedProperties.value.length > 0) {
    tasks = tasks.filter((t) =>
      selectedProperties.value.includes(normalizePropertyId(t.property_id)),
    )
  }

  // Filter by date range
  tasks = filterByDateRange(tasks, 'report_date')

  return tasks
})

const getLeasePropertyId = (lease) =>
  normalizePropertyId(lease?.property?.id || lease?.property_id?.id || lease?.property_id)

const filteredLeases = computed(() => {
  let leases = Array.isArray(userDataStore.userAccessibleLeases)
    ? userDataStore.userAccessibleLeases
    : []
  leases = leases.filter((lease) => perspectivePropertyIds.value.has(getLeasePropertyId(lease)))
  if (selectedProperties.value?.length) {
    leases = leases.filter((lease) => selectedProperties.value.includes(getLeasePropertyId(lease)))
  }
  return leases
})

const taskTransactionsIndex = computed(() => {
  const map = new Map()
  scopedTransactions.value.forEach((transaction) => {
    const taskLinkId = getTransactionTaskLinkId(transaction)
    if (!taskLinkId) return
    if (!map.has(taskLinkId)) {
      map.set(taskLinkId, [])
    }
    map.get(taskLinkId).push(transaction)
  })
  return map
})

const getTaskLinkedTransactions = (task) => {
  const candidates = getTaskIdCandidates(task)
  if (!candidates.length) return []
  const linked = []
  const seen = new Set()
  candidates.forEach((candidate) => {
    const rows = taskTransactionsIndex.value.get(candidate) || []
    rows.forEach((row) => {
      const rowKey = String(row?.id || row?.transac_id || JSON.stringify(row))
      if (seen.has(rowKey)) return
      seen.add(rowKey)
      linked.push(row)
    })
  })
  return linked
}

const getTaskLinkedTransactionCount = (task) => getTaskLinkedTransactions(task).length

const getTaskLinkedTransactionTotal = (task) =>
  getTaskLinkedTransactions(task).reduce((sum, transaction) => {
    if (classifyTransactionFlow(transaction) !== 'expense') return sum
    const amount = transactionAmount(transaction)
    return sum + amount
  }, 0)

// Summary calculations
const transactionAmount = (transaction) => Number(transaction?.amount || 0) || 0

const recordedRevenue = computed(() =>
  filteredTransactions.value
    .filter(
      (transaction) => classifyTransactionFlow(transaction, reportPerspective.value) === 'income',
    )
    .reduce((sum, transaction) => sum + transactionAmount(transaction), 0),
)

const recordedExpenses = computed(() =>
  filteredTransactions.value
    .filter(
      (transaction) => classifyTransactionFlow(transaction, reportPerspective.value) === 'expense',
    )
    .reduce((sum, transaction) => sum + transactionAmount(transaction), 0),
)

const totalIncome = computed(() => formatAmount(recordedRevenue.value))
const totalExpenses = computed(() => formatAmount(recordedExpenses.value))
const netProfit = computed(() => formatAmount(recordedRevenue.value - recordedExpenses.value))

const isManagementFee = (transaction) =>
  /management|manager fee|pm fee/i.test(String(transaction?.transac_type || ''))

const managementFeeIncome = computed(() =>
  filteredTransactions.value
    .filter(
      (transaction) =>
        isManagementFee(transaction) &&
        classifyTransactionFlow(transaction, reportPerspective.value) === 'income',
    )
    .reduce((sum, transaction) => sum + transactionAmount(transaction), 0),
)

const transactionCategory = (transaction) =>
  String(transaction?.transac_type || 'Uncategorized').trim() || 'Uncategorized'

const profitLossRows = computed(() => {
  const categories = new Map()
  filteredTransactions.value.forEach((transaction) => {
    const flow = classifyTransactionFlow(transaction, reportPerspective.value)
    if (flow !== 'income' && flow !== 'expense') return
    const category = transactionCategory(transaction)
    const row = categories.get(category) || { category, revenue: 0, expenses: 0, net: 0 }
    row[flow === 'income' ? 'revenue' : 'expenses'] += transactionAmount(transaction)
    row.net = row.revenue - row.expenses
    categories.set(category, row)
  })
  return [...categories.values()].sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
})

const isActiveLease = (lease) =>
  ['active', 'rented', 'occupied'].includes(String(lease?.status || '').toLowerCase())

const rentRollRows = computed(() =>
  filteredLeases.value.map((lease) => {
    const monthlyRent = Number(lease?.rate_amount || 0) || 0
    return {
      id: lease.id || lease.lease_id,
      property: getPropertyName(getLeasePropertyId(lease)),
      status: isActiveLease(lease) ? 'Active' : String(lease?.status || 'Unknown'),
      monthly_rent: monthlyRent,
      annual_rent: monthlyRent * 12,
      start_date: lease.start_date || lease.lease_start_date || lease.move_in_date,
      end_date: lease.lease_end_date || lease.end_date,
    }
  }),
)

const activeLeases = computed(() => filteredLeases.value.filter((lease) => isActiveLease(lease)))
const activeLeaseCount = computed(() => activeLeases.value.length)
const scheduledMonthlyRent = computed(() =>
  activeLeases.value.reduce((sum, lease) => sum + (Number(lease?.rate_amount || 0) || 0), 0),
)
const scheduledAnnualRent = computed(() => scheduledMonthlyRent.value * 12)
const recordedRentReceipts = computed(() =>
  scopedTransactions.value
    .filter(
      (transaction) =>
        /rent/i.test(transactionCategory(transaction)) &&
        classifyTransactionFlow(transaction) === 'income',
    )
    .reduce((sum, transaction) => sum + transactionAmount(transaction), 0),
)

const completedTasks = computed(() => {
  return filteredTasks.value.filter((t) =>
    ['resolved', 'closed'].includes(String(t.status).toLowerCase()),
  ).length
})

const openTaskCount = computed(() => filteredTasks.value.length - completedTasks.value)
const overdueTaskCount = computed(() => {
  const now = new Date()
  return filteredTasks.value.filter((task) => {
    if (['resolved', 'closed'].includes(String(task.status).toLowerCase())) return false
    const dueDate = toDateSafe(task.due_date)
    return Boolean(dueDate && dueDate < now)
  }).length
})

const agingOpenTaskCount = computed(() => {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - 30)
  return filteredTasks.value.filter((task) => {
    if (['resolved', 'closed'].includes(String(task.status).toLowerCase())) return false
    const reportedDate = toDateSafe(task.report_date)
    return Boolean(reportedDate && reportedDate < threshold)
  }).length
})

const taskLinkedOperationsSpend = computed(() =>
  scopedTransactions.value
    .filter(
      (transaction) =>
        getTransactionTaskLinkId(transaction) && classifyTransactionFlow(transaction) === 'expense',
    )
    .reduce((sum, transaction) => sum + transactionAmount(transaction), 0),
)

const maintenanceCostRatio = computed(() =>
  recordedRentReceipts.value
    ? (taskLinkedOperationsSpend.value / recordedRentReceipts.value) * 100
    : 0,
)

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`

const riskSignals = computed(() => [
  {
    label: 'Open maintenance events',
    detail: 'Outstanding tasks requiring operational follow-up',
    value: String(openTaskCount.value),
    color: openTaskCount.value ? 'warning' : 'positive',
  },
  {
    label: 'Past due tasks',
    detail: 'Open events with a recorded due date before today',
    value: String(overdueTaskCount.value),
    color: overdueTaskCount.value ? 'negative' : 'positive',
  },
  {
    label: 'Open more than 30 days',
    detail: 'Aged unresolved issues that may increase exposure',
    value: String(agingOpenTaskCount.value),
    color: agingOpenTaskCount.value ? 'negative' : 'positive',
  },
  {
    label: 'Task-linked cost ratio',
    detail: 'Recorded property task spend divided by recorded rent receipts',
    value: formatPercent(maintenanceCostRatio.value),
    color: maintenanceCostRatio.value > 20 ? 'negative' : 'primary',
  },
])

// Table columns
const profitLossColumns = [
  { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
  {
    name: 'revenue',
    label: 'Revenue',
    field: 'revenue',
    align: 'right',
    format: (value) => `$${formatAmount(value)}`,
    sortable: true,
  },
  {
    name: 'expenses',
    label: 'Expenses',
    field: 'expenses',
    align: 'right',
    format: (value) => `$${formatAmount(value)}`,
    sortable: true,
  },
  {
    name: 'net',
    label: 'Net',
    field: 'net',
    align: 'right',
    format: (value) => `$${formatAmount(value)}`,
    sortable: true,
  },
]

const rentRollColumns = [
  { name: 'property', label: 'Property', field: 'property', align: 'left', sortable: true },
  { name: 'status', label: 'Lease Status', field: 'status', align: 'left', sortable: true },
  {
    name: 'monthly_rent',
    label: 'Monthly Rent',
    field: 'monthly_rent',
    align: 'right',
    sortable: true,
  },
  {
    name: 'annual_rent',
    label: 'Annualized',
    field: 'annual_rent',
    align: 'right',
    sortable: true,
  },
  {
    name: 'start_date',
    label: 'Start',
    field: 'start_date',
    align: 'left',
    format: (value) => formatDate(value),
    sortable: true,
  },
  {
    name: 'end_date',
    label: 'End',
    field: 'end_date',
    align: 'left',
    format: (value) => formatDate(value),
    sortable: true,
  },
]

const transactionColumns = [
  {
    name: 'transac_date',
    label: 'Date',
    field: 'transac_date',
    sortable: true,
    format: (val) => formatDate(val),
    align: 'left',
  },
  {
    name: 'transac_type',
    label: 'Type',
    field: 'transac_type',
    sortable: true,
    align: 'left',
  },
  {
    name: 'task_link',
    label: 'Task ID',
    field: (row) => getTransactionTaskLinkId(row),
    sortable: true,
    align: 'left',
  },
  {
    name: 'property',
    label: 'Property',
    field: 'property_id',
    sortable: true,
    align: 'left',
  },
  {
    name: 'transac_from',
    label: 'From',
    field: 'transac_from',
    sortable: true,
    align: 'left',
  },
  {
    name: 'transac_to',
    label: 'To',
    field: 'transac_to',
    sortable: true,
    align: 'left',
  },
  {
    name: 'flow',
    label: 'Accounting Flow',
    field: (row) => getTransactionFlowLabel(row, reportPerspective.value),
    sortable: true,
    align: 'center',
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: true,
    align: 'right',
  },
  {
    name: 'picture',
    label: 'Image',
    field: 'picture_url',
    align: 'center',
  },
]

const taskColumns = [
  {
    name: 'report_date',
    label: 'Reported Date',
    field: 'report_date',
    sortable: true,
    format: (val) => formatDate(val),
    align: 'left',
  },
  {
    name: 'property',
    label: 'Property',
    field: 'property_id',
    sortable: true,
    align: 'left',
  },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    sortable: true,
    align: 'left',
  },
  {
    name: 'reported_role',
    label: 'Reported By (Role)',
    field: 'reported_role',
    sortable: true,
    align: 'left',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center',
  },
  {
    name: 'linked_tx_count',
    label: 'Linked Tx',
    field: (row) => getTaskLinkedTransactionCount(row),
    sortable: true,
    align: 'right',
  },
  {
    name: 'linked_tx_total',
    label: 'Linked Ops Spend',
    field: (row) => getTaskLinkedTransactionTotal(row),
    sortable: true,
    align: 'right',
  },
  {
    name: 'resolv_date',
    label: 'Resolved Date',
    field: 'resolv_date',
    sortable: true,
    format: (val) => (val ? formatDate(val) : '-'),
    align: 'left',
  },
]

// Pagination
const transactionPagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'transac_date',
  descending: true,
})

const rentRollPagination = ref({
  page: 1,
  rowsPerPage: 8,
  sortBy: 'property',
  descending: false,
})

const taskPagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'report_date',
  descending: true,
})

// Helper functions
const filterByDateRange = (items, dateField) => {
  const now = new Date()
  let startDate = new Date()
  let endDate = null

  switch (dateRange.value) {
    case 'Current Tax Year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'Previous Tax Year':
      startDate = new Date(now.getFullYear() - 1, 0, 1)
      endDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'Last 30 Days':
      startDate.setDate(now.getDate() - 30)
      break
    case 'Last 3 Months':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'Last 6 Months':
      startDate.setMonth(now.getMonth() - 6)
      break
    case 'Last Year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case 'All Time':
      return items
  }

  return items.filter((item) => {
    const itemDate = toDateSafe(item?.[dateField] || item?.created_datetime || item?.createdAt)
    if (!itemDate) return false
    return itemDate >= startDate && (!endDate || itemDate < endDate)
  })
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const parsedDate = toDateSafe(date)
  if (!parsedDate) return 'N/A'
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getPropertyName = (propertyId) => {
  const property = userDataStore.getPropertyById(propertyId)
  return property ? property.nickname || property.address || 'Unknown' : 'Unknown'
}

const getTransactionTypeColor = (type) => {
  const colors = {
    'Rent Payment': 'positive',
    'Security Deposit': 'info',
    'Maintenance Fee': 'warning',
    'Utility Payment': 'accent',
    'Insurance Payment': 'primary',
    'Property Tax': 'deep-orange',
    'HOA Fee': 'purple',
  }
  return colors[type] || 'grey'
}

const getTaskStatusColor = (status) => {
  const colors = {
    open: 'warning',
    'in-progress': 'info',
    resolved: 'positive',
    closed: 'grey',
  }
  return colors[status?.toLowerCase()] || 'warning'
}

const getRoleColor = (role) => {
  const normalized = normalizeRoleValue(role)
  if (normalized === 'po') return 'deep-purple'
  if (normalized === 'pm') return 'blue'
  if (normalized === 'tt') return 'green'
  if (normalized === 'sp') return 'orange'
  return 'grey'
}

const getAmountClass = (transaction) => {
  const flowType = classifyTransactionFlow(transaction, reportPerspective.value)
  if (flowType === 'income') return 'text-positive text-bold'
  if (flowType === 'expense') return 'text-negative text-bold'
  return 'text-grey-7 text-bold'
}

// Chart functions
const initializeCharts = () => {
  // Import Chart.js dynamically
  import('chart.js/auto').then((Chart) => {
    createCoreCashFlowChart(Chart.default)
    createMaintenanceChart(Chart.default)
  })
}

const getMonthsForSelectedRange = () => {
  const now = new Date()
  if (dateRange.value === 'Current Tax Year') {
    return Array.from({ length: now.getMonth() + 1 }, (_, index) => {
      const d = new Date(now.getFullYear(), index, 1)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      }
    })
  }
  if (dateRange.value === 'Previous Tax Year') {
    return Array.from({ length: 12 }, (_, index) => {
      const d = new Date(now.getFullYear() - 1, index, 1)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      }
    })
  }

  let monthsToShow = 6
  switch (dateRange.value) {
    case 'Last 30 Days':
      monthsToShow = 1
      break
    case 'Last 3 Months':
      monthsToShow = 3
      break
    case 'Last 6 Months':
      monthsToShow = 6
      break
    case 'Last Year':
      monthsToShow = 12
      break
    case 'All Time':
      monthsToShow = 12
      break
  }

  const months = []
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    })
  }
  return months
}

const createCoreCashFlowChart = (Chart) => {
  if (!coreCashFlowChartCanvas.value) return
  const ctx = coreCashFlowChartCanvas.value.getContext('2d')
  if (coreCashFlowChart) coreCashFlowChart.destroy()

  const months = getMonthsForSelectedRange()
  const monthly = {}
  months.forEach((m) => {
    monthly[m.key] = { income: 0, expense: 0 }
  })

  filteredTransactions.value.forEach((t) => {
    const d = toDateSafe(t.transac_date)
    if (!d) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) return
    const amount = parseFloat(t.amount) || 0
    const flowType = classifyTransactionFlow(t, reportPerspective.value)
    if (flowType === 'income') monthly[key].income += amount
    else if (flowType === 'expense') monthly[key].expense += amount
  })

  coreCashFlowChart = new Chart(ctx, {
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          data: months.map((m) => monthly[m.key].income),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          type: 'bar',
          label: 'Expenses',
          data: months.map((m) => monthly[m.key].expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
        {
          type: 'line',
          label: 'Net Cash Flow',
          data: months.map((m) => monthly[m.key].income - monthly[m.key].expense),
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          tension: 0.35,
          fill: false,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => `$${Number(v).toLocaleString()}` },
        },
      },
    },
  })
}

const createMaintenanceChart = (Chart) => {
  if (!maintenanceChartCanvas.value) return
  const ctx = maintenanceChartCanvas.value.getContext('2d')
  if (maintenanceChart) maintenanceChart.destroy()

  const months = getMonthsForSelectedRange()
  const monthly = {}
  months.forEach((m) => {
    monthly[m.key] = { open: 0, closed: 0, resolutionDays: [] }
  })

  filteredTasks.value.forEach((task) => {
    const reportDate = toDateSafe(task.report_date)
    if (!reportDate) return
    const key = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) return

    const status = String(task.status || 'open').toLowerCase()
    if (status === 'resolved' || status === 'closed') {
      monthly[key].closed += 1
      const resolvDate = toDateSafe(task.resolv_date)
      if (resolvDate) {
        const days = Math.max(0, Math.floor((resolvDate - reportDate) / (1000 * 60 * 60 * 24)))
        monthly[key].resolutionDays.push(days)
      }
    } else {
      monthly[key].open += 1
    }
  })

  maintenanceChart = new Chart(ctx, {
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          type: 'bar',
          label: 'Open Tasks',
          data: months.map((m) => monthly[m.key].open),
          backgroundColor: 'rgba(245, 158, 11, 0.65)',
        },
        {
          type: 'bar',
          label: 'Closed Tasks',
          data: months.map((m) => monthly[m.key].closed),
          backgroundColor: 'rgba(34, 197, 94, 0.65)',
        },
        {
          type: 'line',
          label: 'Avg Resolution Days',
          data: months.map((m) => {
            const arr = monthly[m.key].resolutionDays
            if (!arr.length) return 0
            return arr.reduce((s, d) => s + d, 0) / arr.length
          }),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.35,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, position: 'left' },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => `${Number(v).toFixed(0)}d` },
        },
      },
    },
  })
}

const updateCharts = () => {
  if (!dataLoaded.value || !hasReportData.value) return
  console.log('updateCharts called - recreating all charts')
  import('chart.js/auto')
    .then((Chart) => {
      createCoreCashFlowChart(Chart.default)
      createMaintenanceChart(Chart.default)
      chartsReady.value = true
    })
    .catch((error) => {
      console.error('Error updating charts:', error)
    })
}

const scheduleUpdateCharts = () => {
  if (!dataLoaded.value || !hasReportData.value) return
  if (chartsUpdateTimer) clearTimeout(chartsUpdateTimer)
  chartsUpdateTimer = setTimeout(() => {
    updateCharts()
  }, 120)
}

const downloadTransactionsCSV = () => {
  try {
    // Create CSV headers
    const headers = [
      'Date',
      'Type',
      'Property',
      'From',
      'To',
      'Flow (Income/Expense)',
      'Amount',
      'Role',
      'Task ID',
      'Transaction ID',
      'Lease ID',
    ]

    // Create CSV rows
    const rows = filteredTransactions.value.map((t) => {
      const flow = getTransactionFlowLabel(t, reportPerspective.value)

      return [
        formatDate(t.transac_date),
        t.transac_type || '',
        getPropertyName(t.property_id),
        t.transac_from || '',
        t.transac_to || '',
        flow,
        t.amount || 0,
        t.role || '',
        getTransactionTaskLinkId(t),
        t.transac_id || '',
        t.lease_id || '',
      ]
    })

    // Build CSV content
    let csvContent = ''

    // Add summary section
    csvContent += '=== GENERAL LEDGER SUMMARY ===\n'
    csvContent += `Reporting Perspective,${reportPerspectiveLabel.value}\n`
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += '\n'

    // Add filter information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.map((id) => getPropertyName(id)).join('; ') : 'All Properties'}\n`
    csvContent += `Total Records,${filteredTransactions.value.length}\n`
    csvContent += '\n'

    // Add data
    csvContent += headers.join(',') + '\n'
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    // Download file
    downloadCSV(csvContent, `General_Ledger_${reportPerspective.value.toUpperCase()}`)
  } catch (error) {
    console.error('Error downloading transactions CSV:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to download transactions CSV',
      position: 'top',
    })
  }
}

const downloadTasksCSV = () => {
  try {
    // Create CSV headers
    const headers = [
      'Reported Date',
      'Property',
      'Description',
      'Reported By (Role)',
      'Status',
      'Linked Transaction Count',
      'Linked Operating Spend',
      'Resolved Date',
      'Resolved By',
    ]

    // Create CSV rows
    const rows = filteredTasks.value.map((t) => [
      formatDate(t.report_date),
      getPropertyName(t.property_id),
      t.description || '',
      t.reported_role || '',
      t.status || 'Open',
      getTaskLinkedTransactionCount(t),
      formatAmount(getTaskLinkedTransactionTotal(t)),
      t.resolv_date ? formatDate(t.resolv_date) : '-',
      t.resolv_by || '-',
    ])

    // Build CSV content
    let csvContent = ''

    // Add summary section
    csvContent += '=== OPERATIONS EVENT SUMMARY ===\n'
    csvContent += `Reporting Perspective,${reportPerspectiveLabel.value}\n`
    csvContent += `Total Tasks,${filteredTasks.value.length}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += `Open Tasks,${filteredTasks.value.length - completedTasks.value}\n`
    csvContent += '\n'

    // Add filter information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.map((id) => getPropertyName(id)).join('; ') : 'All Properties'}\n`
    csvContent += `Total Records,${filteredTasks.value.length}\n`
    csvContent += '\n'

    // Add data
    csvContent += headers.join(',') + '\n'
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    // Download file
    downloadCSV(csvContent, `Operations_Events_${reportPerspective.value.toUpperCase()}`)
  } catch (error) {
    console.error('Error downloading tasks CSV:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to download tasks CSV',
      position: 'top',
    })
  }
}

const downloadCSV = (csvContent, reportType) => {
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${reportType}_${timestamp}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)

  Notify.create({
    type: 'positive',
    message: `${reportType.replace(/_/g, ' ')} exported successfully!`,
    position: 'top',
    caption: filename,
  })

  console.log('CSV exported:', filename)
}

// Export all reports - comprehensive bulk export
const exportAllReports = () => {
  try {
    // Create CSV content for transactions
    const transactionHeaders = [
      'Date',
      'Type',
      'Property',
      'From',
      'To',
      'Flow (Income/Expense)',
      'Amount',
      'Role',
      'Task ID',
      'Transaction ID',
      'Lease ID',
    ]

    const transactionRows = filteredTransactions.value.map((t) => {
      const flow = getTransactionFlowLabel(t, reportPerspective.value)

      return [
        formatDate(t.transac_date),
        t.transac_type || '',
        getPropertyName(t.property_id),
        t.transac_from || '',
        t.transac_to || '',
        flow,
        t.amount || 0,
        t.role || '',
        getTransactionTaskLinkId(t),
        t.transac_id || '',
        t.lease_id || '',
      ]
    })

    // Create CSV content for tasks
    const taskHeaders = [
      'Reported Date',
      'Property',
      'Description',
      'Reported By (Role)',
      'Status',
      'Linked Transaction Count',
      'Linked Operating Spend',
      'Resolved Date',
      'Resolved By',
    ]

    const taskRows = filteredTasks.value.map((t) => [
      formatDate(t.report_date),
      getPropertyName(t.property_id),
      t.description || '',
      t.reported_role || '',
      t.status || 'Open',
      getTaskLinkedTransactionCount(t),
      formatAmount(getTaskLinkedTransactionTotal(t)),
      t.resolv_date ? formatDate(t.resolv_date) : '-',
      t.resolv_by || '-',
    ])

    // Combine both reports
    let csvContent = ''

    // Add report header
    csvContent += '=== HANDOUT PROPERTY REPORT PACKAGE ===\n'
    csvContent += `Generated on,${new Date().toLocaleString()}\n`
    csvContent += `Reporting Perspective,${reportPerspectiveLabel.value}\n`
    csvContent += '\n'

    // Add summary section
    csvContent += '=== PROFIT AND LOSS SUMMARY ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += `Total Transactions,${filteredTransactions.value.length}\n`
    csvContent += '\n'

    // Add task summary
    csvContent += '=== OPERATIONS AND MAINTENANCE SUMMARY ===\n'
    csvContent += `Total Tasks,${filteredTasks.value.length}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += `Open Tasks,${filteredTasks.value.length - completedTasks.value}\n`
    csvContent += '\n'

    // Add filters information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.map((id) => getPropertyName(id)).join('; ') : 'All Properties'}\n`
    csvContent += '\n'

    // Add transactions section
    csvContent += '=== GENERAL LEDGER ===\n'
    csvContent += transactionHeaders.join(',') + '\n'
    transactionRows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })
    csvContent += '\n'

    // Add tasks section
    csvContent += '=== TASK EVENT STREAM ===\n'
    csvContent += taskHeaders.join(',') + '\n'
    taskRows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    // Download combined report
    downloadCSV(csvContent, `Property_Report_Package_${reportPerspective.value.toUpperCase()}`)

    Notify.create({
      type: 'positive',
      message: 'Bulk export completed successfully!',
      caption: `${filteredTransactions.value.length} transactions, ${filteredTasks.value.length} tasks exported`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    console.error('Error exporting all reports:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export reports',
      position: 'top',
    })
  }
}

// Export summary report only
const exportSummaryReport = () => {
  try {
    let csvContent = ''

    // Header
    csvContent += '=== HANDOUT P&L SUMMARY REPORT ===\n'
    csvContent += `Generated on,${new Date().toLocaleString()}\n`
    csvContent += `Reporting Perspective,${reportPerspectiveLabel.value}\n`
    csvContent += '\n'

    // Financial Summary
    csvContent += '=== PROFIT AND LOSS ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += `Profit Margin,${((parseFloat(netProfit.value.replace(/,/g, '')) / parseFloat(totalIncome.value.replace(/,/g, ''))) * 100 || 0).toFixed(1)}%\n`
    csvContent += '\n'

    // Transaction Summary
    csvContent += '=== TRANSACTION METRICS ===\n'
    csvContent += `Total Transactions,${filteredTransactions.value.length}\n`
    csvContent += `Income Transactions,${filteredTransactions.value.filter((t) => classifyTransactionFlow(t, reportPerspective.value) === 'income').length}\n`
    csvContent += `Expense Transactions,${filteredTransactions.value.filter((t) => classifyTransactionFlow(t, reportPerspective.value) === 'expense').length}\n`
    csvContent += `Task-linked Transactions,${filteredTransactions.value.filter((t) => Boolean(getTransactionTaskLinkId(t))).length}\n`
    csvContent += '\n'

    // Task Summary
    csvContent += '=== TASK METRICS ===\n'
    csvContent += `Total Tasks,${filteredTasks.value.length}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += `Open Tasks,${filteredTasks.value.length - completedTasks.value}\n`
    csvContent += `Completion Rate,${((completedTasks.value / filteredTasks.value.length) * 100 || 0).toFixed(1)}%\n`
    csvContent += '\n'

    // Property Summary
    csvContent += '=== PROPERTY SUMMARY ===\n'
    csvContent += `Total Properties,${reportProperties.value.length}\n`

    // Group transactions by property
    const propertyStats = {}
    reportProperties.value.forEach((p) => {
      const propTransactions = filteredTransactions.value.filter(
        (t) => normalizePropertyId(t.property_id) === normalizePropertyId(p.id),
      )
      const propIncome = propTransactions
        .filter((t) => classifyTransactionFlow(t, reportPerspective.value) === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      const propExpense = propTransactions
        .filter((t) => classifyTransactionFlow(t, reportPerspective.value) === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      propertyStats[p.id] = {
        name: p.nickname || p.address,
        income: propIncome,
        expense: propExpense,
        net: propIncome - propExpense,
      }
    })

    csvContent += '\n=== PROPERTY BREAKDOWN ===\n'
    csvContent += 'Property,Income,Expenses,Net\n'
    Object.values(propertyStats).forEach((stat) => {
      csvContent += `"${stat.name}",$${formatAmount(stat.income)},$${formatAmount(stat.expense)},$${formatAmount(stat.net)}\n`
    })

    // Filters
    csvContent += '\n=== FILTERS APPLIED ===\n'
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties Selected,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.length : 'All'}\n`

    downloadCSV(csvContent, `Profit_Loss_Summary_${reportPerspective.value.toUpperCase()}`)

    Notify.create({
      type: 'positive',
      message: 'Summary report exported successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error exporting summary report:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export summary report',
      position: 'top',
    })
  }
}

const viewImage = (imageUrl) => {
  currentImageUrl.value = imageUrl
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
}

// Lifecycle
onMounted(async () => {
  console.log('ReportsPage mounted')

  try {
    // Load data if not already loaded
    if (userDataStore.isAuthenticated) {
      loading.value = true

      // Check if we need to load data
      const needsData =
        userDataStore.userAccessibleProperties.length === 0 ||
        userDataStore.userAccessibleTransactions.length === 0 ||
        userDataStore.userAccessibleMxRecords.length === 0 ||
        userDataStore.userAccessibleLeases.length === 0

      if (needsData) {
        console.log('Loading all user data...')
        await userDataStore.loadAllUserData()
      }

      // Verify data was loaded
      console.log('Data verification:', {
        properties: userDataStore.userAccessibleProperties.length,
        transactions: userDataStore.userAccessibleTransactions.length,
        tasks: userDataStore.userAccessibleMxRecords.length,
        leases: userDataStore.userAccessibleLeases.length,
        totalRecords: totalDataCount.value,
      })

      dataLoaded.value = true
      loading.value = false

      // Initialize charts after data is loaded
      setTimeout(() => {
        if (hasReportData.value) {
          initializeCharts()
          scheduleUpdateCharts()
        }
      }, 100)

      if (!hasReportData.value) {
        Notify.create({
          type: 'info',
          message: 'No report data available yet.',
          position: 'top',
        })
        router.replace('/')
        return
      }

      Notify.create({
        type: 'positive',
        message: `Reports loaded: ${totalDataCount.value} records`,
        position: 'top',
      })
    } else {
      console.warn('User not authenticated')
      dataLoaded.value = false
    }
  } catch (error) {
    console.error('Error loading reports data:', error)
    dataLoaded.value = false
    loading.value = false

    Notify.create({
      type: 'negative',
      message: 'Failed to load reports data',
      position: 'top',
    })
  }
})

// Watch for filter changes to update charts
watch(
  [selectedProperties, dateRange],
  () => {
    console.log('Filters changed:', {
      properties: selectedProperties.value?.length || 0,
      dateRange: dateRange.value,
      perspective: reportPerspective.value,
    })
    scheduleUpdateCharts()
  },
  { deep: true },
)

watch(
  propertyOptions,
  () => {
    const propertyIds = new Set(propertyOptions.value.map((option) => String(option.value)))
    selectedProperties.value = selectedProperties.value.filter((propertyId) =>
      propertyIds.has(String(propertyId)),
    )
  },
  { immediate: true },
)

watch(
  hasReportData,
  (hasData) => {
    if (!dataLoaded.value) return
    if (!hasData) {
      if (router.currentRoute.value.path === '/reports') {
        Notify.create({
          type: 'info',
          message: 'Reports are available after you have data.',
          position: 'top',
        })
        router.replace('/')
      }
      return
    }
    initializeCharts()
    scheduleUpdateCharts()
  },
  { immediate: false },
)

watch(
  [() => route.query.propertyId, propertyOptions],
  ([propertyId]) => {
    const value = String(propertyId || '').trim()
    if (!value) {
      selectedProperties.value = []
      return
    }
    const exists = propertyOptions.value.some((option) => String(option.value) === value)
    if (exists) {
      selectedProperties.value = [value]
    } else {
      selectedProperties.value = []
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (chartsUpdateTimer) {
    clearTimeout(chartsUpdateTimer)
    chartsUpdateTimer = null
  }
  // Clean up charts
  if (coreCashFlowChart) coreCashFlowChart.destroy()
  if (maintenanceChart) maintenanceChart.destroy()
})
</script>

<style scoped>
.report-page {
  max-width: 1520px;
  margin: 0 auto;
  color: var(--neutral-900, #16243a);
}

.report-hero,
.report-panel,
.metric-card {
  border-radius: var(--border-radius-card);
  border-color: var(--neutral-200, #e5eaf1);
  background: var(--bg-surface, #fff);
}

.report-hero {
  overflow: hidden;
  background: linear-gradient(112deg, #ffffff 35%, #f3f7ff 100%);
}

.report-hero__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px 12px;
}

.report-eyebrow,
.panel-kicker {
  color: #4f6f9c;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.report-title {
  margin: 4px 0 3px;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-weight: 650;
  line-height: 1.2;
}

.report-subtitle {
  margin: 0;
  max-width: 660px;
  color: var(--neutral-600, #617187);
  font-size: 0.9rem;
}

.perspective-chip {
  color: #1b4b91;
  background: #e9f0ff;
  font-weight: 600;
}

.report-controls {
  display: grid;
  grid-template-columns: 220px minmax(230px, 1fr) 185px auto;
  align-items: start;
  gap: 10px;
  padding: 10px 24px 16px;
}

.report-filter-control :deep(.q-field__control) {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--neutral-300, #d5dde8);
  background: var(--bg-surface, #fff);
}

.report-filter-control :deep(.q-field__native),
.report-filter-control :deep(.q-field__input) {
  font-size: 0.86rem;
}

.report-action-btn {
  border-radius: var(--border-radius-btn);
  font-weight: 600;
  min-height: 40px;
}

.accounting-basis {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-top: 1px solid #e6edf7;
  background: #f7faff;
  color: #4a5c75;
  font-size: 0.82rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric-card {
  min-height: 107px;
  padding: 14px 15px;
}

.metric-label {
  color: var(--neutral-600, #66758b);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.metric-value {
  margin: 8px 0 4px;
  color: var(--neutral-900, #17263c);
  font-size: clamp(1.18rem, 1.55vw, 1.46rem);
  font-weight: 650;
  line-height: 1.15;
}

.risk-value {
  color: #d97706;
}

.metric-caption {
  color: var(--neutral-500, #728197);
  font-size: 0.75rem;
  line-height: 1.35;
}

.financial-grid,
.operations-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.operations-grid {
  grid-template-columns: 1fr;
}

.report-panel {
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px 12px;
}

.panel-title {
  margin-top: 2px;
  color: var(--neutral-900, #17263c);
  font-size: 1.05rem;
  font-weight: 650;
}

.panel-note {
  color: var(--neutral-500, #718198);
  font-size: 0.77rem;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 275px;
  padding: 6px 0;
}

.pnl-total-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0 18px 14px;
}

.pnl-total-row > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 11px;
  border-radius: var(--border-radius-sm);
  background: #f7f9fc;
}

.pnl-total-row span {
  color: #687990;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
}

.pnl-total-row strong {
  font-size: 1.05rem;
}

.pnl-net {
  color: #183f79;
  background: #edf4ff !important;
}

.pnl-table {
  border-top: 1px solid var(--neutral-200, #e5eaf1);
}

.data-caveat {
  margin-top: 7px;
  padding: 8px 10px;
  border-radius: var(--border-radius-sm);
  color: #637389;
  background: #f7f9fc;
  font-size: 0.75rem;
}

.rent-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.rent-summary span {
  padding: 5px 9px;
  border-radius: 20px;
  color: #365271;
  background: #f1f5fb;
  font-size: 0.76rem;
  font-weight: 500;
}

.risk-panel :deep(.q-item) {
  min-height: 55px;
  padding-left: 18px;
  padding-right: 18px;
}

.report-table {
  border-top: 1px solid var(--neutral-200, #e5eaf1);
}

.report-table :deep(.q-table__top) {
  padding: 8px 16px;
}

.report-table :deep(.q-table__bottom) {
  padding: 8px 16px;
}

.image-viewer-card {
  background: rgba(0, 0, 0, 0.95);
}

.image-viewer-content {
  padding: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
}

@media (max-width: 900px) {
  .report-controls {
    grid-template-columns: 1fr;
  }

  .report-action-btn {
    width: 100%;
  }
}

@media (max-width: 650px) {
  .report-hero__header {
    flex-direction: column;
    padding: 18px 16px 10px;
  }

  .report-controls,
  .accounting-basis {
    padding-left: 16px;
    padding-right: 16px;
  }

  .metric-grid,
  .pnl-total-row {
    grid-template-columns: 1fr;
  }

  .rent-summary {
    justify-content: flex-start;
  }

  .panel-header {
    align-items: start;
    flex-direction: column;
  }

  .report-table {
    font-size: 0.82rem;
  }
}

:global(body.body--dark) .report-hero,
:global(body.body--dark) .report-panel,
:global(body.body--dark) .metric-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .report-title,
:global(body.body--dark) .panel-title,
:global(body.body--dark) .metric-value {
  color: #f5f6f8;
}

:global(body.body--dark) .accounting-basis,
:global(body.body--dark) .pnl-total-row > div,
:global(body.body--dark) .data-caveat,
:global(body.body--dark) .rent-summary span {
  background: #242a33 !important;
  border-color: #3d3d3d !important;
  color: #c2ccdb;
}

:global(body.body--dark) .pnl-net {
  background: #1e3658 !important;
}

:global(body.body--dark) .report-table {
  background: #1e1e1e !important;
}

:global(body.body--dark) .image-viewer-card {
  background: rgba(0, 0, 0, 0.98) !important;
}
</style>
