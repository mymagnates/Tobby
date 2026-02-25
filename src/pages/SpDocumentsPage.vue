<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm q-px-md">
        <div class="text-subtitle1 text-weight-medium">Documents</div>
        <q-space />
        <q-btn color="primary" dense label="Create New Document" @click="openCreateDialog" />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-sm">
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="document_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-document_url="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.document_url"
                flat
                dense
                color="primary"
                icon="open_in_new"
                label="Open"
                :href="props.row.document_url"
                target="_blank"
              />
              <span v-else class="text-grey-6">-</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="createDialog">
      <q-card style="min-width: 420px; max-width: 520px; width: 100%">
        <q-card-section class="text-subtitle1">Create New Document</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name" label="Document Name" dense outlined />
          <q-input v-model="form.category" label="Category" dense outlined />
          <q-select
            v-model="form.project_id"
            :options="projectOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            clearable
            label="Related Project (Optional)"
            dense
            outlined
          />
          <q-input v-model="form.document_url" label="Document URL (Optional)" dense outlined />
          <q-input v-model="form.note" type="textarea" autogrow label="Note" dense outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" :loading="creating" @click="createDocument" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()

const loading = ref(false)
const creating = ref(false)
const createDialog = ref(false)
const rows = ref([])
const projects = ref([])

const form = ref({
  name: '',
  category: '',
  project_id: '',
  document_url: '',
  note: '',
})

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
  { name: 'category', label: 'Category', field: 'category', align: 'left' },
  { name: 'project_id', label: 'Project', field: 'project_id', align: 'left' },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'document_url', label: 'File', field: 'document_url', align: 'left' },
]

const projectOptions = computed(() =>
  projects.value.map((row) => ({
    label: row.title,
    value: row.project_id,
  })),
)

const loadData = async () => {
  loading.value = true
  try {
    const [docRows, projectRows] = await Promise.all([
      spPortalApi.listDocuments(userStore.userId),
      spPortalApi.listProjects(userStore.userId),
    ])
    rows.value = docRows
    projects.value = projectRows
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load documents.', position: 'top' })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  form.value = {
    name: '',
    category: '',
    project_id: '',
    document_url: '',
    note: '',
  }
  createDialog.value = true
}

const createDocument = async () => {
  if (!form.value.name.trim()) {
    Notify.create({ type: 'warning', message: 'Document name is required.', position: 'top' })
    return
  }

  creating.value = true
  try {
    await spPortalApi.createDocument({
      sp_id: userStore.userId,
      name: form.value.name.trim(),
      category: form.value.category.trim() || 'General',
      project_id: form.value.project_id || '',
      document_url: form.value.document_url.trim(),
      note: form.value.note.trim(),
    })
    createDialog.value = false
    Notify.create({ type: 'positive', message: 'Document created.', position: 'top' })
    await loadData()
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Create document failed.', position: 'top' })
  } finally {
    creating.value = false
  }
}

onMounted(loadData)
</script>
