<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="q-py-sm q-px-md text-subtitle1 text-weight-medium">My Bids</q-card-section>
      <q-separator />
      <q-card-section class="q-px-md q-py-sm">
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="bid_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()
const loading = ref(false)
const rows = ref([])

const columns = [
  { name: 'title', label: 'Lead', field: 'title', align: 'left' },
  { name: 'amount', label: 'Amount', field: (row) => `$${Number(row.amount || 0).toFixed(2)}`, align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'created_at', label: 'Submitted', field: 'created_at', align: 'left' },
]

const loadBids = async () => {
  loading.value = true
  try {
    rows.value = await spPortalApi.listBids(userStore.userId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load bids.', position: 'top' })
  } finally {
    loading.value = false
  }
}

onMounted(loadBids)
</script>
