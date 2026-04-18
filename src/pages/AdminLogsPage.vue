<template>
  <q-page class="q-pa-md">
    <admin-date-range-bar
      v-model:preset="preset"
      v-model:from="from"
      v-model:to="to"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4" v-for="alert in alerts" :key="alert.label">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle2">{{ alert.label }}</div>
            <q-badge :color="alert.color">{{ alert.value }}</q-badge>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-3"><q-input v-model="filters.request_id" dense outlined label="request_id" /></div>
      <div class="col-12 col-sm-3"><q-input v-model="filters.user_id" dense outlined label="user_id" /></div>
      <div class="col-12 col-sm-3"><q-input v-model="filters.task_id" dense outlined label="task_id/lead_id/order_id" /></div>
      <div class="col-12 col-sm-3"><q-btn color="primary" unelevated label="Search" class="full-width" @click="load" /></div>
    </div>

    <q-table flat bordered title="Event Logs" :rows="events" :columns="eventColumns" row-key="id" class="q-mb-md" />
    <q-table flat bordered title="Error Logs" :rows="errors" :columns="errorColumns" row-key="id" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AdminDateRangeBar from 'src/components/admin/AdminDateRangeBar.vue'
import { adminApi } from 'src/services/webApiClient'

const preset = ref('7d')
const from = ref('')
const to = ref('')
const events = ref([])
const errors = ref([])
const filters = reactive({
  request_id: '',
  user_id: '',
  task_id: '',
})

const eventColumns = [
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'event_type', label: 'Type', field: 'event_type', align: 'left' },
  { name: 'user_id', label: 'User', field: 'user_id', align: 'left' },
  { name: 'entity_type', label: 'Entity', field: 'entity_type', align: 'left' },
  { name: 'entity_id', label: 'Entity ID', field: 'entity_id', align: 'left' },
  { name: 'request_id', label: 'Request', field: 'request_id', align: 'left' },
]

const errorColumns = [
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'route', label: 'Route', field: 'route', align: 'left' },
  { name: 'error_code', label: 'Code', field: 'error_code', align: 'left' },
  { name: 'retryable', label: 'Retryable', field: 'retryable', align: 'left' },
  { name: 'request_id', label: 'Request', field: 'request_id', align: 'left' },
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
  const eventRes = await adminApi.listEvents({
    ...range,
    request_id: filters.request_id,
    user_id: filters.user_id,
    task_id: filters.task_id,
    lead_id: filters.task_id,
    order_id: filters.task_id,
  })
  const errorRes = await adminApi.listErrors({
    ...range,
    request_id: filters.request_id,
  })
  events.value = eventRes.items || []
  errors.value = errorRes.items || []
}

const alerts = computed(() => {
  const errorCount = errors.value.length
  const callbackFailures = errors.value.filter((row) =>
    String(row.route || '').includes('callback')
  ).length
  const negativeBalanceSignal = events.value.some((row) =>
    String(row.event_type || '').includes('credit_adjusted') &&
    Number(row.metadata?.balance_after || 0) < 0
  )
  return [
    { label: '24h error spike', value: errorCount > 20 ? 'warning' : 'ok', color: errorCount > 20 ? 'warning' : 'positive' },
    { label: 'callback failure rate', value: callbackFailures > 3 ? 'warning' : 'ok', color: callbackFailures > 3 ? 'warning' : 'positive' },
    { label: 'negative credit balance', value: negativeBalanceSignal ? 'critical' : 'ok', color: negativeBalanceSignal ? 'negative' : 'positive' },
  ]
})

watch([preset, from, to], load)
onMounted(load)
</script>
