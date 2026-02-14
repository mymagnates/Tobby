<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Reports & Analytics</div>
      <div class="row q-gutter-sm">

      </div>
    </div>

    <!-- End of Selection -->


    <!-- Role Filter -->
    <div class="row q-mb-md q-padding-sm">
      <div class="col-12 col-md-3" style="padding-left: 2px; padding-right: 2px">
        <q-select
          v-model="selectedRole"
          :options="roleOptions"
          label="Filter by Role"
          outlined
          dense
          clearable
          bg-color="grey-1"
          @update:model-value="onRoleFilterChange"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3" style="padding-left: 2px; padding-right: 2px">
        <q-select
          v-model="dateRange"
          :options="dateRangeOptions"
          label="Date Range"
          outlined
          dense
          bg-color="grey-1"
          @update:model-value="updateCharts"
        >
          <template v-slot:prepend>
            <q-icon name="date_range" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3" style="padding-left: 2px; padding-right: 2px">
        <q-select
          v-model="selectedProperties"
          :options="propertyOptions"
          label="Filter by Properties (Multiple)"
          outlined
          dense
          clearable
          multiple
          bg-color="grey-1"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          use-chips
          @update:model-value="updateCharts"
        >
          <template v-slot:prepend>
            <q-icon name="home" />
          </template>
          <template v-slot:hint> Select one or more properties to filter </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              label="Select All"
              @click.stop="selectAllProperties"
              class="select-all-btn"
            />
          </template>
        </q-select>

      </div>
      <div class="col-12 col-md-3" style="padding-left: 2px; padding-right: 2px">

      <q-btn-dropdown
          icon="download"
          color="primary"
          label="Bulk Export"
          split
          @click="exportAllReports"
        >
          <q-list>
            <q-item clickable v-close-popup @click="exportAllReports">
              <q-item-section avatar>
                <q-icon name="folder_zip" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export All Reports</q-item-label>
                <q-item-label caption>Combined transactions & tasks</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="downloadTransactionsCSV">
              <q-item-section avatar>
                <q-icon name="account_balance" color="positive" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export Transactions</q-item-label>
                <q-item-label caption>Financial records only</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="downloadTasksCSV">
              <q-item-section avatar>
                <q-icon name="assignment" color="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export Tasks</q-item-label>
                <q-item-label caption>Task history only</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportSummaryReport">
              <q-item-section avatar>
                <q-icon name="summarize" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Export Summary</q-item-label>
                <q-item-label caption>Key metrics & statistics</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        </div>
      </div>

    <!-- Summary Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card class="summary-card col">
        <q-card-section class="text-center">
          <q-icon name="attach_money" size="32px" color="positive" />
          <div class="text-h5 text-positive q-mt-sm">${{ totalIncome }}</div>
          <div class="text-subtitle2">Total Income</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card col">
        <q-card-section class="text-center">
          <q-icon name="money_off" size="32px" color="negative" />
          <div class="text-h5 text-negative q-mt-sm">${{ totalExpenses }}</div>
          <div class="text-subtitle2">Total Expenses</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card col">
        <q-card-section class="text-center">
          <q-icon name="trending_up" size="32px" color="primary" />
          <div class="text-h5 text-primary q-mt-sm">${{ netProfit }}</div>
          <div class="text-subtitle2">Net Profit</div>
        </q-card-section>
      </q-card>

      <q-card class="summary-card col">
        <q-card-section class="text-center">
          <q-icon name="task_alt" size="32px" color="info" />
          <div class="text-h5 text-info q-mt-sm">{{ completedTasks }}</div>
          <div class="text-subtitle2">Completed Tasks</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Core Reports (Free) -->
    <div class="q-mb-lg">
      <div class="row items-center q-mb-sm">
        <div class="text-h6">
          <q-icon name="dashboard" class="q-mr-sm" />
          Core Reports
        </div>
      </div>
      <div class="core-charts-grid">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Monthly Cash Flow</div>
            <div class="chart-container">
              <canvas ref="coreCashFlowChartCanvas" style="max-height: 300px"></canvas>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Occupancy & Vacancy Trend</div>
            <div class="chart-container">
              <canvas ref="occupancyChartCanvas" style="max-height: 300px"></canvas>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Delinquency Aging</div>
            <div class="chart-container">
              <canvas ref="delinquencyChartCanvas" style="max-height: 300px"></canvas>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="chart-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Maintenance Performance</div>
            <div class="chart-container">
              <canvas ref="maintenanceChartCanvas" style="max-height: 300px"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Premium Charts (Future Paid) -->
    <div class="q-mb-lg premium-section">
      <div class="row items-center q-mb-sm">
        <div class="text-h6">
          <q-icon name="workspace_premium" class="q-mr-sm" />
          Premium Charts
        </div>
        <q-chip color="warning" text-color="black" size="sm" class="q-ml-sm">Future Paid</q-chip>
      </div>
      <div class="premium-grid">
        <q-card class="premium-card">
          <q-card-section>
            <div class="premium-title">
              <q-icon name="lock" size="16px" class="q-mr-xs" />
              Delinquency Recovery Cohort
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Recovery rate by overdue age bucket and cohort month.
            </div>
          </q-card-section>
        </q-card>
        <q-card class="premium-card">
          <q-card-section>
            <div class="premium-title">
              <q-icon name="lock" size="16px" class="q-mr-xs" />
              Renewal Risk Prediction
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Predicted lease non-renewal risk by tenant and property.
            </div>
          </q-card-section>
        </q-card>
        <q-card class="premium-card">
          <q-card-section>
            <div class="premium-title">
              <q-icon name="lock" size="16px" class="q-mr-xs" />
              Maintenance Cost Forecast
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Forecasted maintenance spend by property and category.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Financial Transactions Table -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-card class="table-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="account_balance" class="q-mr-sm" />
                Financial Transactions Report
              </div>
              <q-btn
                flat
                dense
                color="primary"
                icon="download"
                label="Download CSV"
                @click="downloadTransactionsCSV"
              />
            </div>

            <!-- Table -->
            <q-table
              :rows="filteredTransactions"
              :columns="transactionColumns"
              row-key="id"
              :pagination="transactionPagination"
              :loading="loading"
              flat
              bordered
              class="report-table"
            >
              <template v-slot:body-cell-transac_type="props">
                <q-td :props="props">
                  <q-chip
                    :color="getTransactionTypeColor(props.value)"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
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
                  <span :class="getAmountClass(props.row.type)">
                    ${{ formatAmount(props.value) }}
                  </span>
                </q-td>
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
                    <q-tooltip>View image</q-tooltip>
                  </q-icon>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Task History Table -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-card class="table-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="assignment" class="q-mr-sm" />
                Task History Report
              </div>
              <q-btn
                flat
                dense
                color="primary"
                icon="download"
                label="Download CSV"
                @click="downloadTasksCSV"
              />
            </div>

            <!-- Table -->
            <q-table
              :rows="filteredTasks"
              :columns="taskColumns"
              row-key="id"
              :pagination="taskPagination"
              :loading="loading"
              flat
              bordered
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
                <q-td :props="props">
                  {{ getPropertyName(props.row.property_id) }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'

const userDataStore = useUserDataStore()

// Reactive data
const loading = ref(false)
const dataLoaded = ref(false)
const selectedRole = ref(null)
const selectedProperties = ref([])
const dateRange = ref('Last 6 Months')
const showImageViewer = ref(false)
const currentImageUrl = ref('')

// Chart references
const coreCashFlowChartCanvas = ref(null)
const occupancyChartCanvas = ref(null)
const delinquencyChartCanvas = ref(null)
const maintenanceChartCanvas = ref(null)
let coreCashFlowChart = null
let occupancyChart = null
let delinquencyChart = null
let maintenanceChart = null

// Options
const roleOptions = ['Property Owner', 'Property Manager', 'Tenant']
const dateRangeOptions = ['Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year', 'All Time']

// Property options
const propertyOptions = computed(() => {
  return userDataStore.userAccessibleProperties.map((p) => ({
    label: p.nickname || p.address,
    value: p.id,
  }))
})

// Total data count for status banner
const totalDataCount = computed(() => {
  const transactionCount = userDataStore.userAccessibleTransactions.length
  const taskCount = userDataStore.userAccessibleMxRecords.length
  return transactionCount + taskCount
})

// Filtered data based on role and property selection
const filteredTransactions = computed(() => {
  let transactions = userDataStore.userAccessibleTransactions

  // Filter by role
  if (selectedRole.value) {
    transactions = transactions.filter(
      (t) =>
        t.transac_from === selectedRole.value ||
        t.transac_to === selectedRole.value ||
        t.role === selectedRole.value,
    )
  }

  // Filter by properties (multiple selection)
  if (selectedProperties.value && selectedProperties.value.length > 0) {
    transactions = transactions.filter((t) => selectedProperties.value.includes(t.property_id))
  }

  // Filter by date range
  transactions = filterByDateRange(transactions, 'transac_date')

  return transactions
})

const filteredTasks = computed(() => {
  let tasks = userDataStore.userAccessibleMxRecords

  // NOTE: Task history does NOT filter by role - shows all tasks

  // Filter by properties (multiple selection)
  if (selectedProperties.value && selectedProperties.value.length > 0) {
    tasks = tasks.filter((t) => selectedProperties.value.includes(t.property_id))
  }

  // Filter by date range
  tasks = filterByDateRange(tasks, 'report_date')

  return tasks
})

// Helper function to determine if transaction is income or expense for selected role
const isIncomeForRole = (transaction, role) => {
  // If role is in "to" field, it's income
  return transaction.transac_to === role
}

const isExpenseForRole = (transaction, role) => {
  // If role is in "from" field, it's expense
  return transaction.transac_from === role
}

// Summary calculations
const totalIncome = computed(() => {
  let income = 0

  filteredTransactions.value.forEach((t) => {
    // If a specific role is selected, check if transaction is income for that role
    if (selectedRole.value) {
      if (isIncomeForRole(t, selectedRole.value)) {
        income += parseFloat(t.amount) || 0
      }
    } else {
      // If no role filter, use the transaction's type field
      if (t.type === 'income') {
        income += parseFloat(t.amount) || 0
      }
    }
  })

  return formatAmount(income)
})

const totalExpenses = computed(() => {
  let expenses = 0

  filteredTransactions.value.forEach((t) => {
    // If a specific role is selected, check if transaction is expense for that role
    if (selectedRole.value) {
      if (isExpenseForRole(t, selectedRole.value)) {
        expenses += parseFloat(t.amount) || 0
      }
    } else {
      // If no role filter, use the transaction's type field
      if (t.type === 'expense') {
        expenses += parseFloat(t.amount) || 0
      }
    }
  })

  return formatAmount(expenses)
})

const netProfit = computed(() => {
  const income = parseFloat(totalIncome.value.replace(/,/g, ''))
  const expenses = parseFloat(totalExpenses.value.replace(/,/g, ''))
  return formatAmount(income - expenses)
})

const completedTasks = computed(() => {
  return filteredTasks.value.filter((t) => t.status === 'resolved' || t.status === 'closed').length
})

// Table columns
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
    label: 'Flow',
    field: (row) => {
      if (selectedRole.value) {
        if (isIncomeForRole(row, selectedRole.value)) return 'Income'
        if (isExpenseForRole(row, selectedRole.value)) return 'Expense'
        return 'N/A'
      }
      return row.type === 'income' ? 'Income' : 'Expense'
    },
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

  switch (dateRange.value) {
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
    const itemDate = new Date(item[dateField])
    return itemDate >= startDate
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
  return new Date(date).toLocaleDateString('en-US', {
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
  const colors = {
    'Property Owner': 'deep-purple',
    'Property Manager': 'blue',
    Tenant: 'green',
  }
  return colors[role] || 'grey'
}

const getAmountClass = (type) => {
  return type === 'income' ? 'text-positive text-bold' : 'text-negative text-bold'
}

// Chart functions
const initializeCharts = () => {
  // Import Chart.js dynamically
  import('chart.js/auto').then((Chart) => {
    createCoreCashFlowChart(Chart.default)
    createOccupancyChart(Chart.default)
    createDelinquencyChart(Chart.default)
    createMaintenanceChart(Chart.default)
  })
}

const toDateSafe = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const getMonthsForSelectedRange = () => {
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

  const now = new Date()
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
    if (t.type === 'income') monthly[key].income += amount
    else monthly[key].expense += amount
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

const createOccupancyChart = (Chart) => {
  if (!occupancyChartCanvas.value) return
  const ctx = occupancyChartCanvas.value.getContext('2d')
  if (occupancyChart) occupancyChart.destroy()

  const months = getMonthsForSelectedRange()
  const totalProps = userDataStore.userAccessibleProperties.length || 1
  const occupancyRate = months.map(() => 0)
  const vacancyCount = months.map(() => 0)

  const occupiedStatuses = new Set(['rented', 'active', 'occupied'])
  const vacantStatuses = new Set(['available', 'pending', 'expired', 'terminated'])

  months.forEach((m, idx) => {
    const occupiedProperties = new Set()
    const vacantProperties = new Set()
    userDataStore.userAccessibleLeases.forEach((lease) => {
      const status = String(lease.status || '').toLowerCase()
      const propertyId = lease.property_id?.id || lease.property_id
      if (!propertyId) return
      if (occupiedStatuses.has(status)) occupiedProperties.add(propertyId)
      else if (vacantStatuses.has(status)) vacantProperties.add(propertyId)
    })
    occupancyRate[idx] = Math.min(100, (occupiedProperties.size / totalProps) * 100)
    vacancyCount[idx] = vacantProperties.size
  })

  occupancyChart = new Chart(ctx, {
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          type: 'line',
          label: 'Occupancy Rate (%)',
          data: occupancyRate,
          borderColor: 'rgba(22, 163, 74, 1)',
          backgroundColor: 'rgba(22, 163, 74, 0.15)',
          tension: 0.35,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Vacant Properties',
          data: vacancyCount,
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
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
          max: 100,
          ticks: { callback: (v) => `${v}%` },
          position: 'left',
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
        },
      },
    },
  })
}

const createDelinquencyChart = (Chart) => {
  if (!delinquencyChartCanvas.value) return
  const ctx = delinquencyChartCanvas.value.getContext('2d')
  if (delinquencyChart) delinquencyChart.destroy()

  const buckets = { '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  const now = new Date()

  filteredTransactions.value.forEach((t) => {
    const typeText = String(t.transac_type || '').toLowerCase()
    const isRentLike = typeText.includes('rent') || t.type === 'expense'
    if (!isRentLike) return
    const d = toDateSafe(t.transac_date)
    if (!d) return
    const days = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    const amount = parseFloat(t.amount) || 0
    if (days <= 0) return
    if (days <= 30) buckets['1-30'] += amount
    else if (days <= 60) buckets['31-60'] += amount
    else if (days <= 90) buckets['61-90'] += amount
    else buckets['90+'] += amount
  })

  delinquencyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: 'Outstanding Amount',
          data: Object.values(buckets),
          backgroundColor: [
            'rgba(251, 191, 36, 0.65)',
            'rgba(249, 115, 22, 0.65)',
            'rgba(239, 68, 68, 0.65)',
            'rgba(185, 28, 28, 0.75)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
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
  console.log('updateCharts called - recreating all charts')
  import('chart.js/auto')
    .then((Chart) => {
      createCoreCashFlowChart(Chart.default)
      createOccupancyChart(Chart.default)
      createDelinquencyChart(Chart.default)
      createMaintenanceChart(Chart.default)
    })
    .catch((error) => {
      console.error('Error updating charts:', error)
    })
}

// Event handlers
const onRoleFilterChange = () => {
  updateCharts()
}

const selectAllProperties = () => {
  // Select all available property IDs
  selectedProperties.value = propertyOptions.value.map((p) => p.value)

  // Update charts with all properties selected
  updateCharts()

  Notify.create({
    type: 'info',
    message: `All ${selectedProperties.value.length} properties selected`,
    position: 'top',
    timeout: 2000,
  })
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
      'Transaction ID',
      'Lease ID',
    ]

    // Create CSV rows
    const rows = filteredTransactions.value.map((t) => {
      // Determine flow based on role filter
      let flow = 'N/A'
      if (selectedRole.value) {
        if (isIncomeForRole(t, selectedRole.value)) flow = 'Income'
        else if (isExpenseForRole(t, selectedRole.value)) flow = 'Expense'
      } else {
        flow = t.type === 'income' ? 'Income' : 'Expense'
      }

      return [
        formatDate(t.transac_date),
        t.transac_type || '',
        getPropertyName(t.property_id),
        t.transac_from || '',
        t.transac_to || '',
        flow,
        t.amount || 0,
        t.role || '',
        t.transac_id || '',
        t.lease_id || '',
      ]
    })

    // Build CSV content
    let csvContent = ''

    // Add summary section
    csvContent += '=== FINANCIAL SUMMARY ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += '\n'

    // Add filter information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Role,${selectedRole.value || 'All Roles'}\n`
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
    downloadCSV(csvContent, 'Financial_Transactions')
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
      t.resolv_date ? formatDate(t.resolv_date) : '-',
      t.resolv_by || '-',
    ])

    // Build CSV content
    let csvContent = ''

    // Add summary section
    csvContent += '=== TASK SUMMARY ===\n'
    csvContent += `Total Tasks,${filteredTasks.value.length}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += `Open Tasks,${filteredTasks.value.length - completedTasks.value}\n`
    csvContent += '\n'

    // Add filter information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Role,${selectedRole.value || 'All Roles'}\n`
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
    downloadCSV(csvContent, 'Task_History')
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
  const roleFilter = selectedRole.value ? `_${selectedRole.value.replace(/\s+/g, '-')}` : ''
  const filename = `${reportType}${roleFilter}_${timestamp}.csv`

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
      'Transaction ID',
      'Lease ID',
    ]

    const transactionRows = filteredTransactions.value.map((t) => {
      // Determine flow based on role filter
      let flow = 'N/A'
      if (selectedRole.value) {
        if (isIncomeForRole(t, selectedRole.value)) flow = 'Income'
        else if (isExpenseForRole(t, selectedRole.value)) flow = 'Expense'
      } else {
        flow = t.type === 'income' ? 'Income' : 'Expense'
      }

      return [
        formatDate(t.transac_date),
        t.transac_type || '',
        getPropertyName(t.property_id),
        t.transac_from || '',
        t.transac_to || '',
        flow,
        t.amount || 0,
        t.role || '',
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
      'Resolved Date',
      'Resolved By',
    ]

    const taskRows = filteredTasks.value.map((t) => [
      formatDate(t.report_date),
      getPropertyName(t.property_id),
      t.description || '',
      t.reported_role || '',
      t.status || 'Open',
      t.resolv_date ? formatDate(t.resolv_date) : '-',
      t.resolv_by || '-',
    ])

    // Combine both reports
    let csvContent = ''

    // Add report header
    csvContent += '=== HANDOUT BULK EXPORT REPORT ===\n'
    csvContent += `Generated on,${new Date().toLocaleString()}\n`
    csvContent += '\n'

    // Add summary section
    csvContent += '=== FINANCIAL SUMMARY ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += `Total Transactions,${filteredTransactions.value.length}\n`
    csvContent += '\n'

    // Add task summary
    csvContent += '=== TASK SUMMARY ===\n'
    csvContent += `Total Tasks,${filteredTasks.value.length}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += `Open Tasks,${filteredTasks.value.length - completedTasks.value}\n`
    csvContent += '\n'

    // Add filters information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Role Filter,${selectedRole.value || 'All Roles'}\n`
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.map((id) => getPropertyName(id)).join('; ') : 'All Properties'}\n`
    csvContent += '\n'

    // Add transactions section
    csvContent += '=== FINANCIAL TRANSACTIONS ===\n'
    csvContent += transactionHeaders.join(',') + '\n'
    transactionRows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })
    csvContent += '\n'

    // Add tasks section
    csvContent += '=== TASK HISTORY ===\n'
    csvContent += taskHeaders.join(',') + '\n'
    taskRows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    // Download combined report
    downloadCSV(csvContent, 'Bulk_Export_Report')

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
    csvContent += '=== HANDOUT SUMMARY REPORT ===\n'
    csvContent += `Generated on,${new Date().toLocaleString()}\n`
    csvContent += '\n'

    // Financial Summary
    csvContent += '=== FINANCIAL METRICS ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += `Profit Margin,${((parseFloat(netProfit.value.replace(/,/g, '')) / parseFloat(totalIncome.value.replace(/,/g, ''))) * 100 || 0).toFixed(1)}%\n`
    csvContent += '\n'

    // Transaction Summary
    csvContent += '=== TRANSACTION METRICS ===\n'
    csvContent += `Total Transactions,${filteredTransactions.value.length}\n`
    csvContent += `Income Transactions,${filteredTransactions.value.filter((t) => t.type === 'income').length}\n`
    csvContent += `Expense Transactions,${filteredTransactions.value.filter((t) => t.type === 'expense').length}\n`
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
    csvContent += `Total Properties,${userDataStore.userAccessibleProperties.length}\n`

    // Group transactions by property
    const propertyStats = {}
    userDataStore.userAccessibleProperties.forEach((p) => {
      const propTransactions = filteredTransactions.value.filter((t) => t.property_id === p.id)
      const propIncome = propTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      const propExpense = propTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
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
    csvContent += `Role Filter,${selectedRole.value || 'All Roles'}\n`
    csvContent += `Date Range,${dateRange.value}\n`
    csvContent += `Properties Selected,${selectedProperties.value && selectedProperties.value.length > 0 ? selectedProperties.value.length : 'All'}\n`

    downloadCSV(csvContent, 'Summary_Report')

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
        userDataStore.userAccessibleMxRecords.length === 0

      if (needsData) {
        console.log('Loading all user data...')
        await userDataStore.loadAllUserData()
      }

      // Verify data was loaded
      console.log('Data verification:', {
        properties: userDataStore.userAccessibleProperties.length,
        transactions: userDataStore.userAccessibleTransactions.length,
        tasks: userDataStore.userAccessibleMxRecords.length,
        totalRecords: totalDataCount.value,
      })

      dataLoaded.value = true
      loading.value = false

      // Initialize charts after data is loaded
      setTimeout(() => {
        initializeCharts()
      }, 100)

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
  [selectedRole, selectedProperties, dateRange],
  () => {
    console.log('Filters changed:', {
      role: selectedRole.value,
      properties: selectedProperties.value?.length || 0,
      dateRange: dateRange.value,
    })
    // Use setTimeout to debounce rapid filter changes
    setTimeout(() => {
      updateCharts()
    }, 100)
  },
  { deep: true },
)

onUnmounted(() => {
  // Clean up charts
  if (coreCashFlowChart) coreCashFlowChart.destroy()
  if (occupancyChart) occupancyChart.destroy()
  if (delinquencyChart) delinquencyChart.destroy()
  if (maintenanceChart) maintenanceChart.destroy()
})
</script>

<style scoped>
.summary-card {
  min-width: 200px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  width: 100%;
  padding: 16px 0;
}

.core-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.premium-section {
  border: 1px dashed var(--neutral-300);
  border-radius: 12px;
  padding: 12px;
  background: var(--neutral-50);
}

.premium-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.premium-card {
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  background: white;
}

.premium-title {
  font-weight: 700;
  display: flex;
  align-items: center;
  color: var(--neutral-800);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-table {
  border-radius: 8px;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .summary-card {
    min-width: 150px;
  }

  .core-charts-grid {
    grid-template-columns: 1fr;
  }

  .premium-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    padding: 8px 0;
  }

  .report-table {
    font-size: 0.85rem;
  }
}

/* ========================================
   DARK MODE STYLES
   ======================================== */

:global(body.body--dark) .summary-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .chart-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .chart-container {
  background: #1e1e1e !important;
}

:global(body.body--dark) .table-card {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .premium-section {
  background: #1e1e1e !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .premium-card {
  background: #242424 !important;
  border-color: #3d3d3d !important;
}

:global(body.body--dark) .report-table {
  background: #1e1e1e !important;
}

:global(body.body--dark) .image-viewer-card {
  background: rgba(0, 0, 0, 0.98) !important;
}
</style>
