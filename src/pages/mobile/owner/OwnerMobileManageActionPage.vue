<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="owner-mobile-action-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader eyebrow="Owner Manage" :title="pageTitle" :description="pageDescription">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard title="Context" subtitle="Choose the property for this owner record.">
        <q-select
          v-model="selectedPropertyId"
          :options="propertyOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Property"
          outlined
          dense
          :loading="propertiesLoading"
          :rules="[(val) => !!val || 'Property is required']"
        >
          <template #prepend>
            <q-icon name="home" color="primary" />
          </template>
        </q-select>
      </MobileCard>

      <MobileCard v-if="action === 'task'" title="Task" subtitle="Owner-submitted maintenance or follow-up item.">
        <div class="mobile-form-stack">
          <q-input v-model="form.report_date" type="date" label="Report Date" outlined dense :rules="[required]" />
          <q-select v-model="form.status" :options="taskStatuses" label="Status" outlined dense :rules="[required]" />
          <q-input v-model="form.description" label="Description" type="textarea" autogrow outlined dense :rules="[required]" />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'transaction'" title="Transaction" subtitle="Owner-side income, expense, or payment note.">
        <div class="mobile-form-stack">
          <q-select v-model="form.transac_type" :options="transactionTypes" label="Type" outlined dense :rules="[required]" />
          <q-input v-model.number="form.amount" type="number" label="Amount" prefix="$" outlined dense :rules="[required, positiveAmount]" />
          <q-input v-model="form.transac_date" type="date" label="Date" outlined dense :rules="[required]" />
          <q-select v-model="form.transac_from" :options="roleOptions" label="From" outlined dense :rules="[required]" />
          <q-select v-model="form.transac_to" :options="toRoleOptions" label="To" outlined dense :disable="!form.transac_from" :rules="[required, differentTransactionSide]" />
          <q-input v-model="form.note" label="Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'document'" title="Document" subtitle="Upload owner-supplied files.">
        <div class="mobile-form-stack">
          <q-file v-model="selectedFile" label="File" outlined dense :rules="[(val) => !!val || 'File is required']">
            <template #prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
          </q-file>
          <q-input v-model="form.name" label="Document Name" outlined dense />
          <q-select v-model="form.purpose" :options="documentPurposes" label="Purpose" outlined dense />
          <q-input v-model="form.description" label="Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else title="Owner action" subtitle="This action is not configured yet." />
    </q-form>

    <div class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="owner-mobile-action-form"
        :label="primaryLabel"
        :loading="saving"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, uploadFile } = useFirebase()

const saving = ref(false)
const selectedPropertyId = ref('')
const selectedFile = ref(null)
const action = computed(() => String(route.params.action || ''))
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewWriteOnly = computed(() => isPreviewRoute.value && !userDataStore.userId)

const form = reactive({
  report_date: new Date().toISOString().split('T')[0],
  status: 'open',
  description: '',
  transac_type: 'expense',
  amount: null,
  transac_date: new Date().toISOString().split('T')[0],
  transac_from: '',
  transac_to: '',
  note: '',
  name: '',
  purpose: 'general',
})

const taskStatuses = ['open', 'closed', 'cancel']
const transactionTypes = ['income', 'expense', 'payment', 'refund']
const roleOptions = ['Property Owner', 'Property Manager', 'Tenant', 'Service Provider', 'Government', 'HOA']
const documentPurposes = ['general', 'receipt', 'statement', 'invoice', 'notice']
const toRoleOptions = computed(() => {
  if (!form.transac_from) return []
  return roleOptions.filter((option) => option !== form.transac_from)
})

const previewProperties = [
  { id: 'preview-property-main', property_id: 'preview-property-main', nickname: '123 Main St', address: '123 Main St' },
]
const availableProperties = computed(() => {
  const rows = userDataStore.userAccessibleProperties || []
  return rows.length ? rows : (isPreviewRoute.value ? previewProperties : [])
})
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label: property.nickname || property.displayName || property.address || property.id,
    value: property.id || property.property_id,
  })),
)

const pageTitle = computed(() => {
  if (action.value === 'task') return 'Task'
  if (action.value === 'transaction') return 'Transaction'
  if (action.value === 'document') return 'Document'
  return 'Manage'
})
const pageDescription = computed(() => {
  if (action.value === 'task') return 'Create an owner-visible task or issue.'
  if (action.value === 'transaction') return 'Log an owner-side transaction.'
  if (action.value === 'document') return 'Upload a property document.'
  return 'Owner manage action.'
})
const primaryLabel = computed(() => {
  if (action.value === 'task') return 'Create Task'
  if (action.value === 'transaction') return 'Save Transaction'
  if (action.value === 'document') return 'Upload Document'
  return 'Continue'
})

watch(
  propertyOptions,
  (options) => {
    if (!selectedPropertyId.value && options.length > 0) selectedPropertyId.value = options[0].value
  },
  { immediate: true },
)

watch(
  () => form.transac_from,
  () => {
    if (form.transac_to === form.transac_from) {
      form.transac_to = ''
    }
  },
)

onMounted(async () => {
  if (!userDataStore.propertiesLoading && availableProperties.value.length === 0) {
    await userDataStore.loadProperties?.()
  }
})

const required = (val) => !!String(val ?? '').trim() || 'Required'
const positiveAmount = (val) => Number(val) > 0 || 'Amount must be positive'
const differentTransactionSide = (val) => val !== form.transac_from || 'From and To cannot be the same'
const createMobileDocument = async (path, payload) => {
  if (previewWriteOnly.value) return `preview-${Date.now()}`
  return createDocument(path, payload)
}

const onSubmit = async () => {
  const propertyId = String(selectedPropertyId.value || '').trim()
  if (!propertyId) {
    Notify.create({ type: 'warning', message: 'Please select a property.', position: 'top' })
    return
  }

  saving.value = true
  try {
    if (action.value === 'task') await saveTask(propertyId)
    else if (action.value === 'transaction') await saveTransaction(propertyId)
    else if (action.value === 'document') await saveDocument(propertyId)
    else Notify.create({ type: 'info', message: 'This action is not configured yet.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Failed to save.', position: 'top' })
  } finally {
    saving.value = false
  }
}

const saveTask = async (propertyId) => {
  const now = new Date()
  const role = userDataStore.getUserRoleForProperty(propertyId)?.role || 'Owner'
  const userName = userDataStore.user?.displayName || userDataStore.user?.email || 'Owner'
  await createMobileDocument(`properties/${propertyId}/mxrecords`, {
    create_id: userDataStore.userId,
    createAt: now,
    report_date: form.report_date,
    description: form.description,
    status: form.status,
    logs: [{ log_timestamp: now, comment: 'Initial owner report submitted', user_id: userDataStore.userId, user_name: userName, user_role: role }],
    mx_id: `mx_${Date.now()}`,
    property_id: propertyId,
    reported_by: userName,
    reported_role: role,
    image_urls: [],
    sp_published: false,
    sp_publish_status: 'draft',
    sp_publish_source: null,
    sp_publish_includes_comments: false,
    sp_published_at: null,
    sp_published_by: null,
    sp_published_by_role: null,
    sp_publish_count: 0,
    sp_lead_id: null,
    updatedAt: now,
  })
  Notify.create({ type: 'positive', message: 'Task created.', position: 'top' })
}

const saveTransaction = async (propertyId) => {
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be positive.')
  const role = userDataStore.getUserRoleForProperty(propertyId)?.role || 'Owner'
  await createMobileDocument(`properties/${propertyId}/transactions`, {
    transac_id: `txn_${Date.now()}`,
    property_id: propertyId,
    role,
    created_by_role: role,
    transac_from: form.transac_from,
    transac_to: form.transac_to,
    amount,
    transac_date: form.transac_date,
    transac_type: form.transac_type,
    note: form.note || '',
    picture_url: '',
    created_by: userDataStore.userId,
    created_by_user_id: userDataStore.userId,
    created_datetime: new Date(),
  })
  Notify.create({ type: 'positive', message: 'Transaction saved.', position: 'top' })
}

const saveDocument = async (propertyId) => {
  const file = selectedFile.value
  if (!file) throw new Error('Please choose a file.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const extension = file.name?.split('.').pop()?.toLowerCase() || ''
  const fileUrl = previewWriteOnly.value ? '' : await uploadFile(`properties/${propertyId}/documents/${Date.now()}_${safeName}`, file)
  const now = new Date().toISOString()
  await createMobileDocument(`properties/${propertyId}/documents`, {
    name: form.name || file.name,
    description: form.description || null,
    note: form.description || null,
    purpose: form.purpose || null,
    category: form.purpose || null,
    document_purpose: form.purpose || null,
    file_url: fileUrl,
    url: fileUrl,
    image_url: fileUrl,
    original_filename: file.name,
    file_type: extension,
    content_type: file.type || null,
    size: file.size || null,
    uploaded_by_role: userDataStore.getUserRoleForProperty(propertyId)?.role || userDataStore.accountType || null,
    upload_date: now,
    created_datetime: now,
  })
  selectedFile.value = null
  Notify.create({ type: 'positive', message: 'Document uploaded.', position: 'top' })
}
</script>
