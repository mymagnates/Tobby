<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="q-py-sm q-px-md text-subtitle1 text-weight-medium">Accepted Projects</q-card-section>
      <q-separator />
      <q-card-section class="q-px-md q-py-sm">
        <q-banner
          v-if="selectedProjectHint"
          rounded
          class="bg-blue-1 text-primary q-mb-sm"
        >
          Opened from accepted bid: {{ selectedProjectHint }}
        </q-banner>
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="project_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()
const route = useRoute()
const loading = ref(false)
const rows = ref([])

const columns = [
  { name: 'title', label: 'Project', field: 'title', align: 'left' },
  { name: 'location', label: 'Location', field: 'location', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'accepted_at', label: 'Accepted', field: 'accepted_at', align: 'left' },
]

const selectedProjectHint = computed(() => {
  const selectedId = String(route.query.project || '').trim()
  if (!selectedId) return ''
  const selected = rows.value.find((row) => String(row?.project_id || '') === selectedId)
  return selected?.title || selected?.task_title || selectedId
})

const loadProjects = async () => {
  loading.value = true
  try {
    rows.value = await spPortalApi.listProjects(userStore.userId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load projects.', position: 'top' })
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)
</script>
