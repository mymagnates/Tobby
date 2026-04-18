<template>
  <section>
    <DateRangeBar v-model="preset" v-model:from="from" v-model:to="to" />

    <div class="filter-row panel">
      <input v-model="filters.request_id" placeholder="request_id" />
      <input v-model="filters.user_id" placeholder="user_id" />
      <input v-model="filters.task_id" placeholder="task_id / lead_id / order_id" />
      <button class="primary" @click="load">Search</button>
    </div>

    <div class="row">
      <div class="col panel">
        <strong>24h error spike:</strong>
        <span :class="`badge ${alerts.errorSpike}`">{{ alerts.errorSpike }}</span>
      </div>
      <div class="col panel">
        <strong>callback failure rate:</strong>
        <span :class="`badge ${alerts.callbackFailure}`">{{ alerts.callbackFailure }}</span>
      </div>
      <div class="col panel">
        <strong>negative credit balance:</strong>
        <span :class="`badge ${alerts.negativeCredit}`">{{ alerts.negativeCredit }}</span>
      </div>
    </div>

    <div class="panel table-wrap" style="margin-top: 12px">
      <h3>Event Logs</h3>
      <table>
        <thead><tr><th>created_at</th><th>event_type</th><th>user_id</th><th>entity_type</th><th>entity_id</th><th>request_id</th></tr></thead>
        <tbody>
          <tr v-for="row in events" :key="row.id">
            <td>{{ row.created_at }}</td><td>{{ row.event_type }}</td><td>{{ row.user_id }}</td><td>{{ row.entity_type }}</td><td>{{ row.entity_id }}</td><td>{{ row.request_id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel table-wrap" style="margin-top: 12px">
      <h3>Error Logs</h3>
      <table>
        <thead><tr><th>created_at</th><th>request_id</th><th>route</th><th>error_code</th><th>retryable</th></tr></thead>
        <tbody>
          <tr v-for="row in errors" :key="row.id">
            <td>{{ row.created_at }}</td><td>{{ row.request_id }}</td><td>{{ row.route }}</td><td>{{ row.error_code }}</td><td>{{ row.retryable }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DateRangeBar from '../components/DateRangeBar.vue'
import { adminApi } from '../services/adminApi'

const preset = ref('7d')
const from = ref('')
const to = ref('')
const events = ref([])
const errors = ref([])
const filters = reactive({ request_id: '', user_id: '', task_id: '' })

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

const load = async () => {
  const r = range()
  events.value = (await adminApi.listEvents({
    ...r,
    request_id: filters.request_id,
    user_id: filters.user_id,
    task_id: filters.task_id,
    lead_id: filters.task_id,
    order_id: filters.task_id,
  })).items || []
  errors.value = (await adminApi.listErrors({
    ...r,
    request_id: filters.request_id,
  })).items || []
}

const alerts = computed(() => {
  const errorSpike = errors.value.length > 20 ? 'warning' : 'ok'
  const callbackFailure = errors.value.filter((e) => String(e.route || '').includes('callback')).length > 3 ? 'warning' : 'ok'
  const negativeCredit = events.value.some((e) => Number(e.metadata?.balance_after || 0) < 0) ? 'critical' : 'ok'
  return { errorSpike, callbackFailure, negativeCredit }
})

watch([preset, from, to], load)
onMounted(load)
</script>
