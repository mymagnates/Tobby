<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Reports & Analytics</div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="primary"
          label="Refresh"
          @click="refreshData"
          :loading="loading"
        />
        <q-btn icon="download" color="secondary" label="Export" @click="exportReport" />
      </div>
    </div>

    <!-- Data Loading Status -->
    <div v-if="!dataLoaded" class="data-status-banner q-mb-md">
      <q-banner class="bg-warning text-white">
        <template v-slot:avatar>
          <q-spinner-dots size="24px" />
        </template>
        Loading data... Please wait.
      </q-banner>
    </div>

    <div v-else class="data-status-banner q-mb-md">
      <q-banner class="bg-positive text-white">
        <template v-slot:avatar>
          <q-icon name="check_circle" />
        </template>
        Data loaded successfully! {{ totalDataCount }} records available.
      </q-banner>
    </div>

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
      <div class="col-12 col-md-6" style="padding-left: 2px; padding-right: 2px">
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

    <!-- Transaction Timeline Chart -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="show_chart" class="q-mr-sm" />
              Transaction Timeline ({{ dateRange }})
            </div>
            <div class="chart-container">
              <canvas ref="timelineChartCanvas" style="max-height: 300px"></canvas>
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
const financialChartCanvas = ref(null)
const taskChartCanvas = ref(null)
const timelineChartCanvas = ref(null)
let financialChart = null
let taskChart = null
let timelineChart = null

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
    createFinancialChart(Chart.default)
    createTaskChart(Chart.default)
    createTimelineChart(Chart.default)
  })
}

const createFinancialChart = (Chart) => {
  if (!financialChartCanvas.value) return

  const ctx = financialChartCanvas.value.getContext('2d')

  // Destroy existing chart if it exists
  if (financialChart) {
    financialChart.destroy()
  }

  // Calculate data by role
  const roleData = {}
  roleOptions.forEach((role) => {
    const roleTransactions = filteredTransactions.value.filter(
      (t) => t.transac_from === role || t.transac_to === role || t.role === role,
    )

    // Calculate income: transactions where role is in "to" field
    const income = roleTransactions
      .filter((t) => isIncomeForRole(t, role))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

    // Calculate expenses: transactions where role is in "from" field
    const expenses = roleTransactions
      .filter((t) => isExpenseForRole(t, role))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

    roleData[role] = { income, expenses }
  })

  financialChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: roleOptions,
      datasets: [
        {
          label: 'Income',
          data: roleOptions.map((role) => roleData[role].income),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
        },
        {
          label: 'Expenses',
          data: roleOptions.map((role) => roleData[role].expenses),
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + value.toLocaleString()
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': $' + context.parsed.y.toLocaleString()
            },
          },
        },
      },
    },
  })
}

const createTaskChart = (Chart) => {
  if (!taskChartCanvas.value) return

  const ctx = taskChartCanvas.value.getContext('2d')

  // Destroy existing chart if it exists
  if (taskChart) {
    taskChart.destroy()
  }

  // Calculate task status by role
  const statusData = {}
  roleOptions.forEach((role) => {
    const roleTasks = filteredTasks.value.filter((t) => t.reported_role === role)

    statusData[role] = {
      open: roleTasks.filter((t) => !t.status || t.status === 'open').length,
      resolved: roleTasks.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    }
  })

  taskChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Open Tasks', 'Resolved Tasks'],
      datasets: [
        {
          data: [
            filteredTasks.value.filter((t) => !t.status || t.status === 'open').length,
            filteredTasks.value.filter((t) => t.status === 'resolved' || t.status === 'closed')
              .length,
          ],
          backgroundColor: ['rgba(255, 193, 7, 0.7)', 'rgba(76, 175, 80, 0.7)'],
          borderColor: ['rgba(255, 193, 7, 1)', 'rgba(76, 175, 80, 1)'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
    },
  })
}

const createTimelineChart = (Chart) => {
  if (!timelineChartCanvas.value) return

  const ctx = timelineChartCanvas.value.getContext('2d')

  // Destroy existing chart if it exists
  if (timelineChart) {
    timelineChart.destroy()
  }

  console.log('Creating timeline chart with filters:', {
    role: selectedRole.value,
    properties: selectedProperties.value,
    dateRange: dateRange.value,
    transactionCount: filteredTransactions.value.length,
  })

  // Determine number of months based on date range filter
  let monthsToShow = 6 // Default
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
      monthsToShow = 12 // Show last 12 months for "All Time"
      break
    default:
      monthsToShow = 6
  }

  console.log(`Timeline will show ${monthsToShow} months`)

  // Group transactions by month
  const monthlyData = {}
  const timelineMonths = []
  const now = new Date()

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    timelineMonths.push({ key: monthKey, label: monthLabel })
    monthlyData[monthKey] = { income: 0, expenses: 0 }
  }

  let processedCount = 0
  filteredTransactions.value.forEach((t) => {
    const date = new Date(t.transac_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (monthlyData[monthKey]) {
      const amount = parseFloat(t.amount) || 0

      // Determine income/expense based on role filter or transaction type
      if (selectedRole.value) {
        if (isIncomeForRole(t, selectedRole.value)) {
          monthlyData[monthKey].income += amount
          processedCount++
        } else if (isExpenseForRole(t, selectedRole.value)) {
          monthlyData[monthKey].expenses += amount
          processedCount++
        }
      } else {
        // Fallback to transaction type if no role filter
        if (t.type === 'income') {
          monthlyData[monthKey].income += amount
          processedCount++
        } else {
          monthlyData[monthKey].expenses += amount
          processedCount++
        }
      }
    }
  })

  console.log(
    `Timeline processed ${processedCount} transactions out of ${filteredTransactions.value.length}`,
  )
  console.log('Monthly data:', monthlyData)

  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timelineMonths.map((m) => m.label),
      datasets: [
        {
          label: 'Income',
          data: timelineMonths.map((m) => monthlyData[m.key].income),
          borderColor: 'rgba(76, 175, 80, 1)',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: timelineMonths.map((m) => monthlyData[m.key].expenses),
          borderColor: 'rgba(244, 67, 54, 1)',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + value.toLocaleString()
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': $' + context.parsed.y.toLocaleString()
            },
          },
        },
      },
    },
  })
}

const updateCharts = () => {
  console.log('updateCharts called - recreating all charts')
  import('chart.js/auto')
    .then((Chart) => {
      createFinancialChart(Chart.default)
      createTaskChart(Chart.default)
      createTimelineChart(Chart.default)
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

const refreshData = async () => {
  loading.value = true
  dataLoaded.value = false

  try {
    await userDataStore.loadAllUserData()

    // Verify data was loaded
    console.log('Data refreshed:', {
      properties: userDataStore.userAccessibleProperties.length,
      transactions: userDataStore.userAccessibleTransactions.length,
      tasks: userDataStore.userAccessibleMxRecords.length,
      totalRecords: totalDataCount.value,
    })

    dataLoaded.value = true
    updateCharts()

    Notify.create({
      type: 'positive',
      message: `Reports refreshed: ${totalDataCount.value} records loaded`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    dataLoaded.value = false

    Notify.create({
      type: 'negative',
      message: 'Failed to refresh reports',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
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

const exportReport = () => {
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

    // Add summary section
    csvContent += '=== COMBINED REPORT SUMMARY ===\n'
    csvContent += `Total Income,$${totalIncome.value}\n`
    csvContent += `Total Expenses,$${totalExpenses.value}\n`
    csvContent += `Net Profit,$${netProfit.value}\n`
    csvContent += `Completed Tasks,${completedTasks.value}\n`
    csvContent += '\n'

    // Add filters information
    csvContent += '=== FILTERS APPLIED ===\n'
    csvContent += `Role,${selectedRole.value || 'All Roles'}\n`
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
    downloadCSV(csvContent, 'Combined_Report')
  } catch (error) {
    console.error('Error exporting report:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export report',
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
  if (financialChart) financialChart.destroy()
  if (taskChart) taskChart.destroy()
  if (timelineChart) timelineChart.destroy()
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

  .chart-container {
    padding: 8px 0;
  }

  .report-table {
    font-size: 0.85rem;
  }
}
</style>
