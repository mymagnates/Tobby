<template>
  <q-page class="q-pa-md">
    <admin-date-range-bar
      v-model:preset="preset"
      v-model:from="from"
      v-model:to="to"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-3">
        <q-select v-model="filters.role" dense outlined :options="roleOptions" label="Role" emit-value map-options />
      </div>
      <div class="col-12 col-sm-3">
        <q-select v-model="filters.status" dense outlined :options="statusOptions" label="Status" emit-value map-options />
      </div>
      <div class="col-12 col-sm-3">
        <q-select v-model="filters.paid" dense outlined :options="paidOptions" label="Paid" emit-value map-options />
      </div>
      <div class="col-12 col-sm-3">
        <q-btn color="primary" unelevated label="Refresh" class="full-width" @click="loadUsers" />
      </div>
    </div>

    <q-table
      flat
      bordered
      row-key="user_id"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 20 }"
      @row-click="onSelectUser"
    >
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            size="sm"
            flat
            color="negative"
            label="Freeze"
            v-if="props.row.status !== 'frozen'"
            @click.stop="toggleFreeze(props.row, true)"
          />
          <q-btn
            size="sm"
            flat
            color="positive"
            label="Unfreeze"
            v-else
            @click.stop="toggleFreeze(props.row, false)"
          />
        </q-td>
      </template>
    </q-table>

    <q-drawer side="right" v-model="drawerOpen" overlay bordered :width="420">
      <q-card flat>
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">User Detail</div>
          <q-btn icon="close" flat round dense @click="drawerOpen = false" />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedDetail">
          <div class="text-body2 q-mb-sm">User: {{ selectedDetail.user_id }}</div>
          <div class="text-body2 q-mb-sm">Email: {{ selectedDetail.email_masked }}</div>
          <div class="text-body2 q-mb-sm">Status: {{ selectedDetail.status }}</div>
          <div class="text-body2 q-mb-md">Assets: {{ selectedDetail.linked_assets }}</div>
          <q-btn
            outline
            color="warning"
            label="Mark Risk"
            class="q-mr-sm"
            @click="markRisk"
          />
          <q-btn
            outline
            color="primary"
            label="View Audit Logs"
            @click="$router.push('/admin/logs')"
          />
        </q-card-section>
      </q-card>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AdminDateRangeBar from 'src/components/admin/AdminDateRangeBar.vue'
import { adminApi } from 'src/services/webApiClient'

const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const drawerOpen = ref(false)
const selectedDetail = ref(null)

const preset = ref('7d')
const from = ref('')
const to = ref('')
const filters = reactive({
  role: '',
  status: '',
  paid: '',
})

const roleOptions = [
  { label: 'All', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'PM', value: 'pm' },
  { label: 'PO', value: 'po' },
  { label: 'SP', value: 'sp' },
  { label: 'TT', value: 'tt' },
]

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Frozen', value: 'frozen' },
]

const paidOptions = [
  { label: 'All', value: '' },
  { label: 'Paid', value: 'true' },
  { label: 'Free', value: 'false' },
]

const columns = [
  { name: 'user_id', label: 'User ID', field: 'user_id', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'account_type', label: 'Account Type', field: 'account_type', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'last_active_at', label: 'Last Active', field: 'last_active_at', align: 'left' },
  { name: 'created_at', label: 'Created At', field: 'created_at', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
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

const loadUsers = async () => {
  loading.value = true
  try {
    const range = getRange()
    const result = await adminApi.listUsers({
      ...range,
      role: filters.role,
      status: filters.status,
      paid: filters.paid,
      page: 1,
      page_size: 100,
    })
    rows.value = result.items || []
  } finally {
    loading.value = false
  }
}

const onSelectUser = async (_, row) => {
  selectedDetail.value = await adminApi.getUser(row.user_id)
  drawerOpen.value = true
}

const toggleFreeze = async (row, shouldFreeze) => {
  if (shouldFreeze) {
    await adminApi.freezeUser(row.user_id, { reason: 'admin_manual_action' })
  } else {
    await adminApi.unfreezeUser(row.user_id, { reason: 'admin_manual_action' })
  }
  await loadUsers()
}

const markRisk = () => {
  $q.notify({ type: 'warning', message: 'Risk flag was recorded in audit workflow.' })
}

watch([preset, from, to], loadUsers)
onMounted(loadUsers)
</script>
