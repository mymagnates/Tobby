<template>
  <q-page class="q-pa-md">
    <admin-date-range-bar
      v-model:preset="preset"
      v-model:from="from"
      v-model:to="to"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in kpiCards" :key="card.label">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">{{ card.label }}</div>
            <div class="text-h6 text-weight-bold">{{ card.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Funnel</div>
            <q-list dense class="q-mt-sm">
              <q-item v-for="(value, key) in overview.funnel || {}" :key="key">
                <q-item-section>{{ key }}</q-item-section>
                <q-item-section side>{{ value }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">System Health</div>
            <q-list dense class="q-mt-sm">
              <q-item>
                <q-item-section>API Success</q-item-section>
                <q-item-section side>{{ overview.system_health?.api_success_rate || 0 }}%</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>P95 Latency</q-item-section>
                <q-item-section side>{{ overview.system_health?.p95_ms || 0 }} ms</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Frontend Errors</q-item-section>
                <q-item-section side>{{ overview.system_health?.frontend_errors || 0 }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Function Failures</q-item-section>
                <q-item-section side>{{ overview.system_health?.function_failures || 0 }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Ad Slot Stats</div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-sm-6 col-md-3" v-for="card in adKpiCards" :key="card.label">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-caption text-grey-7">{{ card.label }}</div>
                    <div class="text-h6 text-weight-bold">{{ card.value }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">By Slot</div>
            <q-list dense class="q-mt-sm">
              <q-item v-for="row in adStats.by_slot || []" :key="row.slot_id">
                <q-item-section>{{ row.slot_id }}</q-item-section>
                <q-item-section side>Served {{ row.served }} / Impr {{ row.impressions }} / Click {{ row.clicks }} / CTR {{ row.ctr }}%</q-item-section>
              </q-item>
              <q-item v-if="!(adStats.by_slot || []).length">
                <q-item-section class="text-grey-6">No slot data in selected range.</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">By Service Type</div>
            <q-list dense class="q-mt-sm">
              <q-item v-for="row in adStats.by_service_type || []" :key="row.service_type">
                <q-item-section>{{ row.service_type }}</q-item-section>
                <q-item-section side>Served {{ row.served }} / Impr {{ row.impressions }} / Click {{ row.clicks }} / CTR {{ row.ctr }}%</q-item-section>
              </q-item>
              <q-item v-if="!(adStats.by_service_type || []).length">
                <q-item-section class="text-grey-6">No service type data in selected range.</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AdminDateRangeBar from 'src/components/admin/AdminDateRangeBar.vue'
import { adminApi } from 'src/services/webApiClient'

const preset = ref('7d')
const from = ref('')
const to = ref('')
const overview = ref({})
const adStats = ref({})

const toYmd = (date) => date.toISOString().slice(0, 10)

const buildRange = () => {
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
  const range = buildRange()
  const [overviewPayload, adStatsPayload] = await Promise.all([
    adminApi.getOverview(range),
    adminApi.getAdSlotStats(range),
  ])
  overview.value = overviewPayload || {}
  adStats.value = adStatsPayload || {}
}

const kpiCards = computed(() => [
  { label: 'DAU', value: overview.value.kpis?.dau ?? 0 },
  { label: 'WAU', value: overview.value.kpis?.wau ?? 0 },
  { label: '7日留存', value: `${overview.value.kpis?.retention_7d ?? 0}%` },
  { label: '当月成本估算', value: `$${overview.value.cost_overview?.cost_estimate_usd ?? 0}` },
])

const adKpiCards = computed(() => [
  { label: 'Served', value: adStats.value.summary?.served ?? 0 },
  { label: 'Impressions', value: adStats.value.summary?.impressions ?? 0 },
  { label: 'Clicks', value: adStats.value.summary?.clicks ?? 0 },
  { label: 'CTR', value: `${adStats.value.summary?.ctr ?? 0}%` },
])

watch([preset, from, to], load)
onMounted(load)
</script>
