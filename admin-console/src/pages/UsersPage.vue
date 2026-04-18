<template>
  <section>
    <DateRangeBar v-model="preset" v-model:from="from" v-model:to="to" />

    <div class="filter-row panel">
      <select v-model="filters.role">
        <option value="">All roles</option>
        <option value="admin">admin</option>
        <option value="pm_po">pm_po</option>
        <option value="tt">tt</option>
        <option value="sp">sp</option>
      </select>
      <select v-model="filters.status">
        <option value="">All status</option>
        <option value="active">active</option>
        <option value="frozen">frozen</option>
      </select>
      <select v-model="filters.paid">
        <option value="">All paid</option>
        <option value="true">paid</option>
        <option value="false">free</option>
      </select>
      <button class="primary" @click="load">Refresh</button>
    </div>

    <div class="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>user_id</th>
            <th>email</th>
            <th>account_type</th>
            <th>status</th>
            <th>last_active_at</th>
            <th>created_at</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.user_id">
            <td><a href="#" @click.prevent="openDetail(row.user_id)">{{ row.user_id }}</a></td>
            <td>{{ row.email }}</td>
            <td>{{ row.account_type }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.last_active_at }}</td>
            <td>{{ row.created_at }}</td>
            <td>
              <button
                v-if="row.status !== 'frozen'"
                class="danger"
                @click="freeze(row.user_id)"
              >Freeze</button>
              <button v-else class="success" @click="unfreeze(row.user_id)">Unfreeze</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <aside class="drawer" v-if="detail">
      <h3>User Detail</h3>
      <p><strong>ID:</strong> {{ detail.user_id }}</p>
      <p><strong>Email:</strong> {{ detail.email_masked }}</p>
      <p><strong>Status:</strong> {{ detail.status }}</p>
      <p><strong>Linked assets:</strong> {{ detail.linked_assets }}</p>
      <h4>Recent Timeline</h4>
      <ul>
        <li v-for="event in detail.recent_timeline || []" :key="event.id">
          {{ event.created_at }} - {{ event.event_type }}
        </li>
      </ul>
      <button @click="detail = null">Close</button>
    </aside>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import DateRangeBar from '../components/DateRangeBar.vue'
import { adminApi } from '../services/adminApi'

const preset = ref('7d')
const from = ref('')
const to = ref('')
const rows = ref([])
const detail = ref(null)

const filters = reactive({ role: '', status: '', paid: '' })

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
  const result = await adminApi.listUsers({ ...range(), ...filters, page: 1, page_size: 100 })
  rows.value = result.items || []
}

const openDetail = async (userId) => {
  detail.value = await adminApi.getUser(userId)
}

const freeze = async (userId) => {
  await adminApi.freezeUser(userId, { reason: 'manual_freeze' })
  await load()
}

const unfreeze = async (userId) => {
  await adminApi.unfreezeUser(userId, { reason: 'manual_unfreeze' })
  await load()
}

watch([preset, from, to], load)
onMounted(load)
</script>
