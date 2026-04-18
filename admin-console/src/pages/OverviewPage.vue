<template>
  <section>
    <DateRangeBar v-model="preset" v-model:from="from" v-model:to="to" />

    <div class="kpi-grid">
      <div class="panel" v-for="card in kpis" :key="card.label">
        <div class="kpi-title">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
      </div>
    </div>

    <div class="row">
      <div class="col panel">
        <h3>Behavior Funnel</h3>
        <ul>
          <li v-for="(v, k) in overview.funnel || {}" :key="k">{{ k }}: {{ v }}</li>
        </ul>
      </div>
      <div class="col panel">
        <h3>System Health</h3>
        <ul>
          <li>API success: {{ overview.system_health?.api_success_rate || 0 }}%</li>
          <li>P95 latency: {{ overview.system_health?.p95_ms || 0 }}ms</li>
          <li>Frontend errors: {{ overview.system_health?.frontend_errors || 0 }}</li>
          <li>Function failures: {{ overview.system_health?.function_failures || 0 }}</li>
        </ul>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="panel" v-for="card in adKpis" :key="card.label">
        <div class="kpi-title">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
      </div>
    </div>

    <div class="row">
      <div class="col panel">
        <h3>Ad Slot By Slot</h3>
        <ul>
          <li v-for="row in adStats.by_slot || []" :key="row.slot_id">
            {{ row.slot_id }}: served {{ row.served }}, impressions {{ row.impressions }}, clicks {{ row.clicks }}, ctr {{ row.ctr }}%
          </li>
          <li v-if="!(adStats.by_slot || []).length">No slot data in selected range.</li>
        </ul>
      </div>
      <div class="col panel">
        <h3>Ad Slot By Service Type</h3>
        <ul>
          <li v-for="row in adStats.by_service_type || []" :key="row.service_type">
            {{ row.service_type }}: served {{ row.served }}, impressions {{ row.impressions }}, clicks {{ row.clicks }}, ctr {{ row.ctr }}%
          </li>
          <li v-if="!(adStats.by_service_type || []).length">No service type data in selected range.</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DateRangeBar from '../components/DateRangeBar.vue'
import { adminApi } from '../services/adminApi'

const preset = ref('7d')
const from = ref('')
const to = ref('')
const overview = ref({})
const adStats = ref({})

const ymd = (d) => d.toISOString().slice(0, 10)
const params = () => {
  const now = new Date()
  if (preset.value === 'today') return { from: ymd(now), to: ymd(now) }
  if (preset.value === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { from: ymd(start), to: ymd(now) }
  }
  if (preset.value === '30d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 29)
    return { from: ymd(start), to: ymd(now) }
  }
  return { from: from.value, to: to.value }
}

const load = async () => {
  const range = params()
  const [overviewPayload, adStatsPayload] = await Promise.all([
    adminApi.getOverview(range),
    adminApi.getAdSlotStats(range),
  ])
  overview.value = overviewPayload || {}
  adStats.value = adStatsPayload || {}
}

const kpis = computed(() => [
  { label: 'DAU', value: overview.value.kpis?.dau || 0 },
  { label: 'WAU', value: overview.value.kpis?.wau || 0 },
  { label: '7d retention', value: `${overview.value.kpis?.retention_7d || 0}%` },
  { label: 'Cost estimate', value: `$${overview.value.cost_overview?.cost_estimate_usd || 0}` },
])

const adKpis = computed(() => [
  { label: 'Ad Served', value: adStats.value.summary?.served || 0 },
  { label: 'Ad Impressions', value: adStats.value.summary?.impressions || 0 },
  { label: 'Ad Clicks', value: adStats.value.summary?.clicks || 0 },
  { label: 'Ad CTR', value: `${adStats.value.summary?.ctr || 0}%` },
])

watch([preset, from, to], load)
onMounted(load)
</script>
