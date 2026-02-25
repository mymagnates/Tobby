<template>
  <q-page class="q-pa-sm sp-dashboard-page">
    <div class="dashboard-grid q-gutter-sm">
      <q-card flat bordered class="metric-card">
        <q-card-section class="q-py-sm">
          <div class="text-caption text-grey-7">New Leads</div>
          <div class="text-h5 text-weight-bold">{{ newLeadCount }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="metric-card">
        <q-card-section class="q-py-sm">
          <div class="text-caption text-grey-7">Bid Count</div>
          <div class="text-h5 text-weight-bold">{{ totalBids }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="metric-card">
        <q-card-section class="q-py-sm">
          <div class="text-caption text-grey-7">Total Projects</div>
          <div class="text-h5 text-weight-bold">{{ totalProjects }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="metric-card">
        <q-card-section class="q-py-sm">
          <div class="text-caption text-grey-7">Bid Success Rate</div>
          <div class="text-h5 text-weight-bold">{{ bidSuccessRate }}%</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="row q-col-gutter-sm q-mt-xs">
      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-card-section class="row items-center q-py-sm q-px-md">
            <div class="text-subtitle1 text-weight-medium">History Overview (6 Months)</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-md">
            <div class="chart-wrap">
              <canvas ref="historyChartCanvas" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center q-py-sm q-px-md">
            <div class="text-subtitle1 text-weight-medium">Latest Leads</div>
            <q-space />
            <q-btn flat dense color="primary" label="View All" @click="router.push('/sp-leads')" />
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="lead in latestLeads" :key="lead.lead_id" dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ lead.title }}</q-item-label>
                <q-item-label caption>{{ lead.location }} · Due {{ lead.due_date || '-' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="primary" outline>{{ lead.budget_range || '-' }}</q-badge>
              </q-item-section>
            </q-item>
            <q-item v-if="!latestLeads.length">
              <q-item-section>
                <q-item-label caption>No leads yet.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <div class="q-mt-sm">
      <q-card flat bordered>
        <q-card-section class="row items-center q-py-sm q-px-md">
          <div class="text-subtitle1 text-weight-medium">Recent Bids</div>
          <q-space />
          <q-btn flat dense color="primary" label="View All" @click="router.push('/sp-bids')" />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-sm">
          <q-table
            flat
            dense
            :rows="recentBids"
            :columns="bidColumns"
            row-key="bid_id"
            :loading="loading"
            :pagination="{ rowsPerPage: 5 }"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { Chart, registerables } from 'chart.js'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

Chart.register(...registerables)

const router = useRouter()
const userStore = useUserDataStore()

const loading = ref(false)
const leads = ref([])
const bids = ref([])
const projects = ref([])

const historyChartCanvas = ref(null)
let historyChart = null

const bidColumns = [
  { name: 'title', label: 'Lead', field: 'title', align: 'left' },
  { name: 'amount', label: 'Amount', field: (row) => `$${Number(row.amount || 0).toFixed(2)}`, align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'created_at', label: 'Submitted', field: (row) => formatShortDate(row.created_at), align: 'left' },
]

const newLeadCount = computed(() => leads.value.filter((row) => row.status === 'open').length)
const totalBids = computed(() => bids.value.length)
const totalProjects = computed(() => projects.value.length)

const successfulBidCount = computed(() => bids.value.filter((row) => row.status === 'selected').length)
const bidSuccessRate = computed(() => {
  if (!totalBids.value) return 0
  return Math.round((successfulBidCount.value / totalBids.value) * 100)
})

const latestLeads = computed(() =>
  [...leads.value]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5),
)

const recentBids = computed(() =>
  [...bids.value]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 8),
)

const formatShortDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getRecentMonthLabels = () => {
  const labels = []
  const now = new Date()
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return labels
}

const toMonthKey = (value) => {
  const date = new Date(value || 0)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const buildHistorySeries = () => {
  const labels = getRecentMonthLabels()

  const projectMap = labels.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
  const bidMap = labels.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  projects.value.forEach((row) => {
    const key = toMonthKey(row.accepted_at || row.created_at)
    if (projectMap[key] !== undefined) projectMap[key] += 1
  })

  bids.value.forEach((row) => {
    const key = toMonthKey(row.created_at)
    if (bidMap[key] !== undefined) bidMap[key] += 1
  })

  return {
    labels: labels.map((key) => {
      const [year, month] = key.split('-')
      return `${month}/${year.slice(-2)}`
    }),
    projectsData: labels.map((key) => projectMap[key]),
    bidsData: labels.map((key) => bidMap[key]),
  }
}

const renderHistoryChart = async () => {
  await nextTick()
  if (!historyChartCanvas.value) return

  const { labels, projectsData, bidsData } = buildHistorySeries()
  const ctx = historyChartCanvas.value.getContext('2d')

  if (historyChart) {
    historyChart.destroy()
  }

  historyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Projects',
          data: projectsData,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderRadius: 6,
        },
        {
          label: 'Bids',
          data: bidsData,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const [leadRows, bidRows, projectRows] = await Promise.all([
      spPortalApi.listLeads(userStore.userId),
      spPortalApi.listBids(userStore.userId),
      spPortalApi.listProjects(userStore.userId),
    ])

    leads.value = leadRows
    bids.value = bidRows
    projects.value = projectRows

    await renderHistoryChart()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to load SP dashboard.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)

onBeforeUnmount(() => {
  if (historyChart) {
    historyChart.destroy()
    historyChart = null
  }
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  min-height: 94px;
}

.chart-wrap {
  position: relative;
  height: 280px;
}

.full-height {
  height: 100%;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .chart-wrap {
    height: 240px;
  }
}
</style>
