<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div class="text-subtitle1 text-weight-medium">Leads</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-px-md q-py-sm">
        <q-table
          flat
          dense
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                size="sm"
                color="primary"
                label="Bid"
                @click="openBidDialog(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="bidDialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-subtitle1">Submit Bid</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model.number="bidForm.amount" type="number" label="Bid Amount" dense outlined />
          <q-input v-model="bidForm.notes" type="textarea" autogrow label="Notes" dense outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" :loading="submitting" @click="submitBid" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'
import { useFirebase } from 'src/composables/useFirebase'

const userStore = useUserDataStore()
const { createDocument } = useFirebase()
const loading = ref(false)
const rows = ref([])
const bidDialog = ref(false)
const submitting = ref(false)
const selectedLead = ref(null)

const bidForm = ref({
  amount: null,
  notes: '',
})

const columns = [
  { name: 'title', label: 'Lead', field: 'title', align: 'left' },
  { name: 'location', label: 'Location', field: 'location', align: 'left' },
  { name: 'budget_range', label: 'Budget', field: 'budget_range', align: 'left' },
  { name: 'due_date', label: 'Due', field: 'due_date', align: 'left' },
  { name: 'actions', label: 'Action', field: 'actions', align: 'right' },
]

const loadLeads = async () => {
  loading.value = true
  try {
    rows.value = await spPortalApi.listLeads(userStore.userId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load leads.', position: 'top' })
  } finally {
    loading.value = false
  }
}

const openBidDialog = (lead) => {
  selectedLead.value = lead
  bidForm.value = { amount: null, notes: '' }
  bidDialog.value = true
}

const getSpBidCore = () => {
  const profile = userStore.userProfile || {}
  const spName =
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    userStore.user?.displayName ||
    userStore.user?.email ||
    'Service Provider'

  const spContact = {
    email: profile.email || userStore.user?.email || '',
    phone: profile.phone || profile.contact_phone || '',
    contact_name: profile.contact_name || profile.full_name || userStore.user?.displayName || spName,
  }

  return {
    sp_id: String(userStore.userId || ''),
    sp_name: spName,
    sp_contact: spContact,
  }
}

const submitBid = async () => {
  const leadDocId = selectedLead.value?.id || selectedLead.value?.lead_doc_id || selectedLead.value?.lead_id
  const leadPublicId = selectedLead.value?.lead_id || leadDocId
  const amount = Number(bidForm.value.amount)
  if (!selectedLead.value || !leadDocId || !Number.isFinite(amount) || amount <= 0) {
    Notify.create({ type: 'warning', message: 'Bid amount is required.', position: 'top' })
    return
  }

  submitting.value = true
  try {
    const bidId = `bid-${Date.now()}`
    await createDocument(
      `marketplace_leads/${leadDocId}/bids`,
      {
        id: bidId,
        bid_id: bidId,
        ...getSpBidCore(),
        lead_id: leadPublicId,
        lead_doc_id: leadDocId,
        mx_id: selectedLead.value.mx_id || selectedLead.value.task_id || null,
        task_id: selectedLead.value.task_id || selectedLead.value.mx_id || null,
        task_doc_id: selectedLead.value.task_doc_id || null,
        title: selectedLead.value.title || '',
        amount,
        note: bidForm.value.notes || '',
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      bidId
    )

    rows.value = rows.value.filter((row) => (row.id || row.lead_doc_id || row.lead_id) !== leadDocId)
    selectedLead.value = null
    bidForm.value = { amount: null, notes: '' }
    bidDialog.value = false

    Notify.create({ type: 'positive', message: 'Bid saved to Firebase.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Submit failed.', position: 'top' })
  } finally {
    submitting.value = false
  }
}

onMounted(loadLeads)
</script>
