<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="pm-mobile-action-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader
        :eyebrow="config.eyebrow"
        :title="config.title"
        :description="config.description"
      >
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard
        v-if="needsProperty"
        title="Context"
        subtitle="Select the property this record belongs to."
      >
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

      <MobileCard v-if="action === 'transaction'" title="Transaction" subtitle="Quick PM-side financial entry.">
        <div class="mobile-form-stack">
          <q-select v-model="form.transac_type" :options="transactionTypes" label="Type" outlined dense :rules="[required]" />
          <q-input v-model.number="form.amount" type="number" label="Amount" prefix="$" outlined dense :rules="[required, positiveAmount]" />
          <q-input v-model="form.transac_date" type="date" label="Date" outlined dense :rules="[required]" />
          <q-select v-model="form.transac_from" :options="roleOptions" label="From" outlined dense :rules="[required]" />
          <q-select v-model="form.transac_to" :options="toRoleOptions" label="To" outlined dense :disable="!form.transac_from" :rules="[required, differentTransactionSide]" />
          <q-input v-model="form.note" label="Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'reminder'" title="Reminder" subtitle="Create a dated follow-up.">
        <div class="mobile-form-stack">
          <q-select v-model="form.category" :options="reminderCategories" label="Category" outlined dense :rules="[required]" />
          <q-input v-model="form.start_date" type="date" label="Start Date" outlined dense :rules="[required]" />
          <q-input v-model="form.due_date" type="date" label="Due Date" outlined dense />
          <q-select v-model="form.repeat_by" :options="repeatOptions" label="Repeat" outlined dense />
          <q-input v-model.number="form.amount" type="number" label="Amount" prefix="$" outlined dense />
          <q-input v-model="form.note" label="Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'task'" title="Task" subtitle="Create a property task using the same mxrecords structure as web.">
        <div class="mobile-form-stack">
          <q-input v-model="form.task_title" label="Title" outlined dense />
          <q-input v-model="form.report_date" type="date" label="Report Date" outlined dense :rules="[required]" />
          <q-select v-model="form.status" :options="taskStatuses" label="Status" outlined dense :rules="[required]" />
          <q-select v-model="form.priority" :options="taskPriorities" label="Priority" outlined dense />
          <q-input v-model="form.description" label="Description" type="textarea" autogrow outlined dense :rules="[required]" />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'document'" title="Document" subtitle="Upload a property file or photo.">
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

      <MobileCard v-else-if="action === 'service'" title="Service" subtitle="Create a service record for the selected property.">
        <div class="mobile-form-stack">
          <q-select v-model="form.service_type" :options="serviceTypes" label="Service Type" outlined dense :rules="[required]" />
          <q-input v-model="form.company_name" label="Company Name" outlined dense />
          <q-input v-model="form.agent_name" label="Contact Name" outlined dense />
          <q-input v-model="form.agent_phone" label="Phone" outlined dense />
          <q-input v-model="form.agent_email" label="Email" type="email" outlined dense />
          <q-input v-model="form.service_start_date" type="date" label="Start Date" outlined dense />
          <q-input v-model="form.term" label="Term / Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'asset'" title="Asset" subtitle="Add core asset information onsite.">
        <div class="mobile-form-stack">
          <q-input v-model="form.nickname" label="Name / Label" outlined dense :rules="[required]" />
          <q-select v-model="form.type" :options="assetTypes" label="Type" outlined dense :rules="[required]" />
          <q-input v-model="form.location" label="Location / Room" outlined dense />
          <q-input v-model="form.brand" label="Brand" outlined dense />
          <q-input v-model="form.model" label="Model" outlined dense />
          <q-input v-model="form.serial" label="Serial Number" outlined dense />
          <q-input v-model="form.notes" label="Notes" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="action === 'inventory'" title="Inventory is lease-bound" subtitle="Open inventory from a property card so the active lease context is known.">
        <button type="button" class="mobile-list-row mobile-list-row--button" @click="pushMobile('/mobile/pm/property')">
          <div class="mobile-list-row__icon">
            <q-icon name="apartment" size="21px" />
          </div>
          <div class="mobile-list-row__body">
            <div class="mobile-list-row__title">Open Property</div>
            <div class="mobile-list-row__meta">Choose a property, then open its current lease inventory.</div>
          </div>
        </button>
      </MobileCard>

      <MobileCard v-else-if="action === 'bids'" title="Bid Review" subtitle="Review actions will connect to submitted SP bids.">
        <div class="mobile-list">
          <div v-for="bid in sampleBids" :key="bid.title" class="mobile-list-row">
            <div class="mobile-list-row__icon">
              <q-icon name="request_quote" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ bid.title }}</div>
              <div class="mobile-list-row__meta">{{ bid.meta }}</div>
            </div>
            <span :class="['mobile-chip', chipClass(bid.tone)]">{{ bid.status }}</span>
          </div>
        </div>
      </MobileCard>

      <MobileCard v-else :title="`${config.title} mobile form`" subtitle="This manage action is not configured yet." />
    </q-form>

    <div class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="pm-mobile-action-form"
        :label="config.primaryAction"
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
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { pmManageActions } from './pmMobileData'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, uploadFile } = useFirebase()
const { pushMobile } = useMobileNav()

const saving = ref(false)
const selectedPropertyId = ref('')
const selectedFile = ref(null)

const action = computed(() => String(route.params.action || ''))
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewWriteOnly = computed(() => isPreviewRoute.value && !userDataStore.userId)
const config = computed(() => (
  pmManageActions[action.value] || {
    eyebrow: 'PM Manage',
    title: 'Unknown action',
    description: 'This manage action is not configured yet.',
    icon: 'help',
    primaryAction: 'Continue',
    fields: [],
  }
))
const needsProperty = computed(() => !['bids', 'inventory'].includes(action.value))

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

const form = reactive({
  task_title: '',
  report_date: new Date().toISOString().split('T')[0],
  status: 'open',
  priority: 'normal',
  description: '',
  transac_type: 'expense',
  amount: null,
  transac_date: new Date().toISOString().split('T')[0],
  transac_from: '',
  transac_to: '',
  note: '',
  category: 'general',
  start_date: new Date().toISOString().split('T')[0],
  due_date: '',
  repeat_by: 'one-time',
  name: '',
  purpose: 'general',
  service_type: 'maintenance',
  company_name: '',
  agent_name: '',
  agent_phone: '',
  agent_email: '',
  service_start_date: '',
  term: '',
  nickname: '',
  type: 'appliance',
  location: '',
  brand: '',
  model: '',
  serial: '',
  notes: '',
})

const transactionTypes = ['income', 'expense', 'payment', 'refund', 'deposit']
const taskStatuses = ['open', 'closed', 'cancel']
const taskPriorities = ['low', 'normal', 'urgent']
const roleOptions = ['Property Owner', 'Property Manager', 'Tenant', 'Service Provider', 'Government', 'HOA']
const reminderCategories = ['general', 'maintenance', 'lease', 'payment', 'inspection']
const repeatOptions = ['one-time', 'weekly', 'monthly', 'quarterly', 'yearly']
const documentPurposes = ['general', 'lease', 'receipt', 'invoice', 'notice', 'inspection']
const serviceTypes = ['maintenance', 'utility', 'insurance', 'loan', 'management', 'other']
const assetTypes = ['appliance', 'furniture', 'fixture', 'equipment', 'system', 'other']
const sampleBids = [
  { title: 'Plumbing repair quote', meta: 'ABC Plumbing - $280 - today', status: 'Review', tone: 'accent' },
  { title: 'Fence repair estimate', meta: 'Bay Fence - $740 - revision requested', status: 'Revise', tone: 'warning' },
]
const toRoleOptions = computed(() => {
  if (!form.transac_from) return []
  return roleOptions.filter((option) => option !== form.transac_from)
})

watch(
  propertyOptions,
  (options) => {
    if (!selectedPropertyId.value && options.length > 0) {
      selectedPropertyId.value = options[0].value
    }
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

const getPropertyId = () => String(selectedPropertyId.value || '').trim()

const notifySaved = (label) => {
  Notify.create({ type: 'positive', message: `${label} saved.`, position: 'top' })
}

const createMobileDocument = async (path, payload) => {
  if (previewWriteOnly.value) return `preview-${Date.now()}`
  return createDocument(path, payload)
}

const resetFileFields = () => {
  selectedFile.value = null
}

const onSubmit = async () => {
  if (action.value === 'inventory') {
    pushMobile('/mobile/pm/property')
    return
  }
  if (action.value === 'bids') {
    pushMobile('/mobile/pm/manage/bids')
    return
  }

  const propertyId = getPropertyId()
  if (needsProperty.value && !propertyId) {
    Notify.create({ type: 'warning', message: 'Please select a property.', position: 'top' })
    return
  }

  saving.value = true
  try {
    if (action.value === 'transaction') await saveTransaction(propertyId)
    if (action.value === 'task') await saveTask(propertyId)
    if (action.value === 'reminder') await saveReminder(propertyId)
    if (action.value === 'document') await saveDocument(propertyId)
    if (action.value === 'service') await saveService(propertyId)
    if (action.value === 'asset') await saveAsset(propertyId)
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Failed to save record.', position: 'top' })
  } finally {
    saving.value = false
  }
}

const saveTransaction = async (propertyId) => {
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be positive.')
  await createMobileDocument(`properties/${propertyId}/transactions`, {
    transac_id: `txn_${Date.now()}`,
    property_id: propertyId,
    role: userDataStore.getUserRoleForProperty(propertyId)?.role || 'PM',
    created_by_role: userDataStore.getUserRoleForProperty(propertyId)?.role || 'PM',
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
  notifySaved('Transaction')
}

const saveReminder = async (propertyId) => {
  await createMobileDocument(`properties/${propertyId}/reminders`, {
    category: form.category,
    start_date: form.start_date,
    due_date: form.due_date || form.start_date,
    repeat_by: form.repeat_by || 'one-time',
    amount: form.amount === null || form.amount === '' ? null : Number(form.amount),
    note: form.note || '',
    status: false,
    created_date: new Date().toISOString(),
    created_by: userDataStore.userId,
  })
  notifySaved('Reminder')
}

const saveDocument = async (propertyId) => {
  const file = selectedFile.value
  if (!file) throw new Error('Please choose a file.')
  const extension = file.name?.split('.').pop()?.toLowerCase() || ''
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `properties/${propertyId}/documents/${Date.now()}_${safeName}`
  const fileUrl = previewWriteOnly.value ? '' : await uploadFile(storagePath, file)
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
  resetFileFields()
  notifySaved('Document')
}

const saveTask = async (propertyId) => {
  const now = new Date()
  const role = userDataStore.getUserRoleForProperty(propertyId)?.role || 'PM'
  const userName = userDataStore.user?.displayName || userDataStore.user?.email || 'Property Manager'
  const description = String(form.description || '').trim()
  if (!description) throw new Error('Description is required.')
  await createMobileDocument(`properties/${propertyId}/mxrecords`, {
    create_id: userDataStore.userId || '',
    createAt: now,
    task_title: String(form.task_title || '').trim(),
    report_date: form.report_date,
    description,
    status: form.status || 'open',
    priority: form.priority || 'normal',
    logs: [
      {
        log_timestamp: now,
        comment: 'Initial report submitted',
        user_id: userDataStore.userId || '',
        user_name: userName,
        user_role: role,
      },
    ],
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
  notifySaved('Task')
}

const saveService = async (propertyId) => {
  const now = new Date().toISOString()
  const propertyLabel = propertyOptions.value.find((property) => property.value === propertyId)?.label || propertyId
  await createMobileDocument(`properties/${propertyId}/services`, {
    service_type: form.service_type || 'maintenance',
    property_ids: [propertyId],
    properties: [{ id: propertyId, label: propertyLabel }],
    company_name: form.company_name || '',
    company_website: '',
    agent: {
      company: form.company_name || '',
      name: form.agent_name || '',
      phone: form.agent_phone || '',
      email: form.agent_email || '',
    },
    service_start_date: form.service_start_date || '',
    term: form.term || '',
    created_at: now,
    updated_at: now,
  })
  notifySaved('Service')
}

const saveAsset = async (propertyId) => {
  const now = new Date().toISOString()
  await createMobileDocument(`properties/${propertyId}/assets`, {
    property_id: propertyId,
    nickname: form.nickname.trim(),
    type: form.type,
    location: form.location?.trim() || '',
    brand: form.brand?.trim() || '',
    model: form.model?.trim() || '',
    serial: form.serial?.trim() || '',
    mfg_date: '',
    acquired_date: '',
    notes: form.notes?.trim() || '',
    status: 'active',
    images: [],
    created_at: now,
    updated_at: now,
    created_by: userDataStore.userId || '',
  })
  notifySaved('Asset')
}

const chipClass = (tone) => {
  if (tone === 'accent') return 'mobile-chip--accent'
  if (tone === 'warning') return 'mobile-chip--warning'
  if (tone === 'danger') return 'mobile-chip--danger'
  return ''
}
</script>
