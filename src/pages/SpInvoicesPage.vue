<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm q-px-md">
        <div class="text-subtitle1 text-weight-medium">Invoices</div>
        <q-space />
        <q-btn flat no-caps icon="arrow_back" label="Back" class="q-mr-sm" @click="goBack" />
        <q-btn color="primary" dense label="Create Invoice" @click="openCreateDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-px-md q-py-sm">
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="invoice_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                v-if="props.row.status === 'draft'"
                color="primary"
                dense
                size="sm"
                label="Submit"
                :loading="submittingId === props.row.invoice_id"
                @click="submitInvoice(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="createDialog">
      <q-card style="min-width: 380px">
        <q-card-section class="text-subtitle1">Create Invoice</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-select
            v-model="invoiceForm.project_id"
            :options="projectOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="Project"
            dense
            outlined
          />
          <q-input v-model.number="invoiceForm.amount" type="number" label="Total Amount" dense outlined />
          <q-input v-model="invoiceForm.note" type="textarea" autogrow label="Note" dense outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save Draft" :loading="creating" @click="createInvoice" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'

const userStore = useUserDataStore()
const router = useRouter()
const loading = ref(false)
const creating = ref(false)
const createDialog = ref(false)
const submittingId = ref('')

const rows = ref([])
const projects = ref([])
const invoiceForm = ref({
  project_id: '',
  amount: null,
  note: '',
})

const columns = [
  { name: 'invoice_id', label: 'Invoice', field: 'invoice_id', align: 'left' },
  { name: 'project_id', label: 'Project', field: 'project_id', align: 'left' },
  { name: 'amount', label: 'Amount', field: (row) => `$${Number(row.amount || 0).toFixed(2)}`, align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'updated_at', label: 'Updated', field: 'updated_at', align: 'left' },
  { name: 'actions', label: 'Action', field: 'actions', align: 'right' },
]

const projectOptions = computed(() => projects.value.map((row) => ({ label: row.title, value: row.project_id })))

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/sp-dashboard')
}

const loadData = async () => {
  loading.value = true
  try {
    const [projectRows, invoiceRows] = await Promise.all([
      spPortalApi.listProjects(userStore.userId),
      spPortalApi.listInvoices(userStore.userId),
    ])
    projects.value = projectRows
    rows.value = invoiceRows
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load invoices.', position: 'top' })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  invoiceForm.value = { project_id: '', amount: null, note: '' }
  createDialog.value = true
}

const createInvoice = async () => {
  if (!invoiceForm.value.project_id || !invoiceForm.value.amount) {
    Notify.create({ type: 'warning', message: 'Project and amount are required.', position: 'top' })
    return
  }

  creating.value = true
  try {
    await spPortalApi.createInvoice({
      sp_id: userStore.userId,
      project_id: invoiceForm.value.project_id,
      amount: invoiceForm.value.amount,
      note: invoiceForm.value.note,
    })
    createDialog.value = false
    Notify.create({ type: 'positive', message: 'Draft invoice created.', position: 'top' })
    await loadData()
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Create invoice failed.', position: 'top' })
  } finally {
    creating.value = false
  }
}

const submitInvoice = async (row) => {
  submittingId.value = row.invoice_id
  try {
    await spPortalApi.submitInvoice(row.invoice_id)
    Notify.create({ type: 'positive', message: 'Invoice submitted.', position: 'top' })
    await loadData()
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Submit failed.', position: 'top' })
  } finally {
    submittingId.value = ''
  }
}

onMounted(loadData)
</script>
