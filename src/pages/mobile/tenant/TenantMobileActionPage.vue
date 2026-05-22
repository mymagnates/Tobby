<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="tenant-mobile-action-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader :eyebrow="eyebrow" :title="title" :description="description">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard title="Lease Context" :subtitle="leaseSubtitle">
        <q-select
          v-model="selectedLeaseId"
          :options="leaseOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Lease"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="description" color="primary" />
          </template>
        </q-select>
      </MobileCard>

      <MobileCard v-if="section === 'requests'" title="Maintenance Request" subtitle="Submit a tenant request to the property task list.">
        <div class="mobile-form-stack">
          <q-input v-model="form.title" label="Title" outlined dense :rules="[required]" />
          <q-select v-model="form.category" :options="requestCategories" label="Category" outlined dense />
          <q-select v-model="form.priority" :options="priorities" label="Priority" outlined dense />
          <q-input v-model="form.description" label="Description" type="textarea" autogrow outlined dense :rules="[required]" />
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'documents'" title="Upload Document" subtitle="Attach a file to the lease/property record.">
        <div class="mobile-form-stack">
          <q-file v-model="selectedFile" label="File" outlined dense :rules="[(val) => !!val || 'File is required']">
            <template #prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
          </q-file>
          <q-select v-model="form.category" :options="documentCategories" label="Category" outlined dense />
          <q-input v-model="form.note" label="Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'lease'" title="Inventory" subtitle="Tenant inventory updates stay bound to the assigned lease.">
        <div v-if="inventoryRecord" class="mobile-key-values q-mb-md">
          <div class="mobile-key-value">
            <span>Status</span>
            <strong>{{ inventoryStatusLabel }}</strong>
          </div>
        </div>
        <div class="mobile-form-stack">
          <q-input v-model="form.area" label="Room / Area" outlined dense :disable="inventorySubmitted" />
          <q-input v-model="form.item" label="Item" outlined dense :disable="inventorySubmitted" :rules="[required]" />
          <q-input v-model="form.note" label="Condition / Note" type="textarea" autogrow outlined dense :disable="inventorySubmitted" />
        </div>
      </MobileCard>
    </q-form>

    <div class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="tenant-mobile-action-form"
        :label="primaryLabel"
        :loading="saving"
        :disable="section === 'lease' && inventorySubmitted"
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
const { createDocument, getDocument, getAllDocuments, updateDocument, uploadFile } = useFirebase()

const props = defineProps({
  section: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    default: '',
  },
})

const saving = ref(false)
const selectedFile = ref(null)
const selectedLeaseId = ref('')
const inventoryRecord = ref(null)
const section = computed(() => String(props.section || route.params.section || ''))
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewWriteOnly = computed(() => isPreviewRoute.value && !userDataStore.userId)

const form = reactive({
  title: '',
  category: 'General',
  priority: 'normal',
  description: '',
  note: '',
  area: '',
  item: '',
})

const requestCategories = ['General', 'Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Safety']
const documentCategories = ['General', 'Lease', 'Notice', 'Receipt', 'Request']
const priorities = ['low', 'normal', 'urgent']
const PRIMARY_INVENTORY_DOC_ID = 'primary'

const previewLeases = [
  {
    id: 'preview-lease-main',
    lease_doc_id: 'preview-lease-main',
    lease_lsid: 'LS-preview-main',
    LSID: 'LS-preview-main',
    property_string_id: 'preview-property-main',
  },
]
const accessibleLeases = computed(() => {
  const rows = userDataStore.userAccessibleLeases || []
  return rows.length ? rows : (isPreviewRoute.value ? previewLeases : [])
})
const leaseOptions = computed(() => accessibleLeases.value.map((lease) => ({
  label: lease.LSID || lease.lease_lsid || lease.lease_id || lease.id,
  value: lease.id || lease.lease_doc_id,
  lease,
})))
const selectedLease = computed(() => leaseOptions.value.find((option) => option.value === selectedLeaseId.value)?.lease || accessibleLeases.value[0] || null)
const propertyId = computed(() => selectedLease.value?.property_string_id || selectedLease.value?.property?.id || selectedLease.value?.property_id?.id || selectedLease.value?.property_id || '')
const leaseSubtitle = computed(() => selectedLease.value ? `Lease ${selectedLease.value.LSID || selectedLease.value.lease_lsid || selectedLease.value.id}` : 'Lease data will appear after tenant context loads.')
const normalizeStatus = (value) => String(value || '').trim().toLowerCase()
const inventoryStatus = computed(() => normalizeStatus(inventoryRecord.value?.inventory_status || inventoryRecord.value?.status || 'draft'))
const inventorySubmitted = computed(() => ['submitted', 'complete', 'completed'].includes(inventoryStatus.value) || Boolean(inventoryRecord.value?.submitted_at))
const inventoryStatusLabel = computed(() => inventorySubmitted.value ? 'Submitted' : (inventoryStatus.value || 'Draft'))

const eyebrow = computed(() => section.value === 'documents' ? 'Tenant Documents' : section.value === 'lease' ? 'Tenant Lease' : 'Tenant Request')
const title = computed(() => section.value === 'documents' ? 'Upload' : section.value === 'lease' ? 'Inventory' : 'Submit Request')
const description = computed(() => section.value === 'documents' ? 'Upload tenant files.' : section.value === 'lease' ? 'Update assigned move-in inventory draft.' : 'Create a maintenance request.')
const primaryLabel = computed(() => {
  if (section.value === 'documents') return 'Upload Document'
  if (section.value === 'lease') return inventorySubmitted.value ? 'Inventory Submitted' : 'Save Inventory Item'
  return 'Submit Request'
})

watch(leaseOptions, (options) => {
  if (!selectedLeaseId.value && options.length > 0) selectedLeaseId.value = options[0].value
}, { immediate: true })

watch(selectedLeaseId, () => {
  loadInventoryStatus()
})

onMounted(async () => {
  if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) {
    await userDataStore.loadLeases?.()
  }
  await loadInventoryStatus()
})

const required = (val) => !!String(val ?? '').trim() || 'Required'
const createMobileDocument = async (path, payload) => {
  if (previewWriteOnly.value) return `preview-${Date.now()}`
  return createDocument(path, payload)
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (section.value === 'requests') await submitRequest()
    else if (section.value === 'documents') await uploadDocument()
    else if (section.value === 'lease') await saveInventoryItem()
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Action failed.', position: 'top' })
  } finally {
    saving.value = false
  }
}

const submitRequest = async () => {
  if (!propertyId.value) throw new Error('No active lease property found.')
  const now = new Date()
  const reporterName = userDataStore.userProfile?.full_name || userDataStore.userProfile?.user_name || userDataStore.user?.displayName || userDataStore.user?.email || 'Tenant'
  await createMobileDocument(`properties/${propertyId.value}/mxrecords`, {
    mx_id: `mx_${Date.now()}`,
    task_title: form.title,
    description: form.description,
    category: form.category,
    priority: form.priority,
    report_date: new Date().toISOString().split('T')[0],
    status: 'open',
    created_by: userDataStore.userId,
    created_by_name: reporterName,
    created_by_role: 'tt',
    reported_by: reporterName,
    reported_by_id: userDataStore.userId,
    reported_role: 'tt',
    lease_id: selectedLease.value?.id || selectedLeaseId.value || null,
    property_id: propertyId.value,
    createAt: now,
    updatedAt: now,
    created_date: now,
    logs: [
      {
        log_timestamp: now,
        comment: 'Initial tenant request submitted',
        user_id: userDataStore.userId,
        user_name: reporterName,
        user_role: 'tt',
      },
    ],
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
  })
  Notify.create({ type: 'positive', message: 'Request submitted.', position: 'top' })
}

const uploadDocument = async () => {
  if (!propertyId.value) throw new Error('No active lease property found.')
  const file = selectedFile.value
  if (!file) throw new Error('Please choose a file.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `images/tenants/${propertyId.value}/${userDataStore.userId}/${Date.now()}_${safeName}`
  const fileUrl = previewWriteOnly.value ? '' : await uploadFile(storagePath, file)
  const now = new Date().toISOString()
  const extension = file.name?.split('.').pop()?.toLowerCase() || ''
  await createMobileDocument(`properties/${propertyId.value}/documents`, {
    name: file.name,
    category: form.category,
    note: form.note || '',
    url: fileUrl,
    file_url: fileUrl,
    image_url: fileUrl,
    storage_path: storagePath,
    original_filename: file.name,
    file_type: extension,
    uploaded_by: userDataStore.userId,
    uploaded_by_role: 'tt',
    tenant_id: userDataStore.userId,
    lease_id: selectedLease.value?.id || selectedLeaseId.value || null,
    source_type: 'tenant_upload',
    source_page: 'tenant_mobile',
    content_type: file.type,
    size: file.size,
    created_at: now,
    upload_date: now,
    created_datetime: now,
  })
  selectedFile.value = null
  Notify.create({ type: 'positive', message: 'Document uploaded.', position: 'top' })
}

const loadInventoryStatus = async () => {
  inventoryRecord.value = null
  if (section.value !== 'lease' || previewWriteOnly.value) return
  const leaseDocId = String(selectedLease.value?.lease_doc_id || selectedLease.value?.id || selectedLeaseId.value || '').trim()
  if (!leaseDocId) return
  let inventory = await getDocument(`leases/${leaseDocId}/inventories/${PRIMARY_INVENTORY_DOC_ID}`).catch(() => null)
  if (!inventory) {
    const rows = await getAllDocuments(`leases/${leaseDocId}/inventories`).catch(() => [])
    inventory = Array.isArray(rows) && rows.length ? rows[0] : null
  }
  inventoryRecord.value = inventory || null
}

const saveInventoryItem = async () => {
  const leaseDocId = String(selectedLease.value?.lease_doc_id || selectedLease.value?.id || selectedLeaseId.value || '').trim()
  if (!leaseDocId) throw new Error('No active lease found.')
  const itemName = String(form.item || '').trim()
  if (!itemName) throw new Error('Item is required.')
  if (previewWriteOnly.value) {
    form.area = ''
    form.item = ''
    form.note = ''
    Notify.create({ type: 'positive', message: 'Inventory item saved.', position: 'top' })
    return
  }

  let inventory = inventoryRecord.value || await getDocument(`leases/${leaseDocId}/inventories/${PRIMARY_INVENTORY_DOC_ID}`)
  if (!inventory) {
    const rows = await getAllDocuments(`leases/${leaseDocId}/inventories`)
    inventory = Array.isArray(rows) && rows.length ? rows[0] : null
  }
  if (!inventory) throw new Error('Assigned inventory list was not found.')
  inventoryRecord.value = inventory
  if (inventorySubmitted.value) throw new Error('Submitted inventory cannot be edited.')

  const nextItems = [
    ...(Array.isArray(inventory.custom_items) ? inventory.custom_items : []),
    {
      area: String(form.area || '').trim(),
      item: itemName,
      collapsed: false,
      created_datetime: new Date().toISOString(),
      move_in_comment: String(form.note || '').trim(),
      move_out_comment: '',
      move_in_photo_url: '',
      move_out_photo_url: '',
      move_in_photo_uploaded_at: '',
      move_out_photo_uploaded_at: '',
      move_in_photo_storage_path: '',
      move_out_photo_storage_path: '',
    },
  ]
  await updateDocument(`leases/${leaseDocId}/inventories`, inventory.id || PRIMARY_INVENTORY_DOC_ID, {
    custom_items: nextItems,
    updated_datetime: new Date().toISOString(),
  })
  inventoryRecord.value = { ...inventory, custom_items: nextItems, updated_datetime: new Date().toISOString() }
  form.area = ''
  form.item = ''
  form.note = ''
  Notify.create({ type: 'positive', message: 'Inventory item saved.', position: 'top' })
}
</script>
