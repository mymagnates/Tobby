<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader :eyebrow="roleLabel" :title="title">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <div v-if="loading" class="mobile-list">
        <div v-for="index in 4" :key="index" class="mobile-list-row">
          <q-skeleton type="QAvatar" size="36px" />
          <div class="mobile-list-row__body">
            <q-skeleton type="text" width="72%" />
            <q-skeleton type="text" width="48%" />
          </div>
        </div>
      </div>

      <template v-else-if="record">
        <MobileCard :title="recordTitle" :subtitle="recordSubtitle">
          <template #headerAction>
            <MobileModerationMenu
              v-if="recordModeration"
              v-bind="recordModeration"
              @reported="hideCurrentRecord"
              @blocked="hideCurrentRecord"
            />
          </template>
          <div class="mobile-key-values">
            <div v-for="field in detailFields" :key="field.label" class="mobile-key-value">
              <span>{{ field.label }}</span>
              <strong>{{ field.value }}</strong>
            </div>
          </div>
          <div v-if="longText" class="mobile-note-box">{{ longText }}</div>
        </MobileCard>

        <MobileCard v-if="fileUrl" title="File" subtitle="Open the uploaded file in a browser tab.">
          <q-btn unelevated no-caps color="primary" label="Open File" class="full-width" @click="openFile" />
        </MobileCard>
      </template>

      <MobileEmptyState
        v-else
        title="Record not found"
        body="This record may still be syncing, or the current mobile user may not have access to it."
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobileModerationMenu from 'components/mobile/MobileModerationMenu.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobileModeration } from 'src/pages/mobile/useMobileModeration'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { getDocument } = useFirebase()
const { loadBlockedUsers, shouldHideModeratedItem } = useMobileModeration()

const props = defineProps({
  role: {
    type: String,
    default: '',
  },
  recordType: {
    type: String,
    default: '',
  },
  recordId: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const record = ref(null)

const role = computed(() => String(props.role || route.params.role || 'pm'))
const recordType = computed(() => String(props.recordType || route.params.recordType || 'documents'))
const recordId = computed(() => String(props.recordId || route.params.recordId || ''))
const propertyId = computed(() => String(route.query.propertyId || route.params.propertyId || ''))
const roleLabel = computed(() => role.value === 'owner' ? 'Owner' : 'PM')

const typeConfig = {
  documents: { title: 'Document', path: 'documents' },
  transactions: { title: 'Transaction', path: 'transactions' },
  tasks: { title: 'Task', path: 'mxrecords' },
  reminders: { title: 'Reminder', path: 'reminders' },
  services: { title: 'Service', path: 'services' },
  assets: { title: 'Asset', path: 'assets' },
  leases: { title: 'Lease' },
}
const config = computed(() => typeConfig[recordType.value] || typeConfig.documents)
const title = computed(() => config.value.title)
const firstText = (...values) => values.map((value) => String(value || '').trim()).find(Boolean) || ''

const normalizeDate = (value) => {
  if (!value) return ''
  if (typeof value?.toDate === 'function') return value.toDate().toLocaleString()
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toLocaleString()
  return String(value)
}

const money = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return `$${Number(value || 0).toLocaleString()}`
}

const recordTitle = computed(() => {
  const row = record.value || {}
  if (recordType.value === 'transactions') return `${row.transac_type || 'Transaction'} ${money(row.amount)}`
  if (recordType.value === 'tasks') return row.task_title || row.description || 'Task'
  if (recordType.value === 'documents') return row.name || row.original_filename || 'Document'
  if (recordType.value === 'reminders') return row.category || row.title || 'Reminder'
  if (recordType.value === 'services') return row.company_name || row.service_type || 'Service'
  if (recordType.value === 'assets') return row.nickname || row.type || 'Asset'
  if (recordType.value === 'leases') return row.LSID || row.lease_id || 'Lease'
  return row.name || row.id || 'Record'
})

const recordSubtitle = computed(() => {
  const row = record.value || {}
  return [
    userDataStore.getPropertyName?.(row.property_id || propertyId.value) || row.property_id || propertyId.value,
    row.status || row.transac_type || row.category || row.type,
  ].filter(Boolean).join(' - ')
})

const fileUrl = computed(() => record.value?.file_url || record.value?.url || record.value?.image_url || '')
const longText = computed(() => record.value?.note || record.value?.description || record.value?.notes || '')
const contentType = computed(() => {
  if (recordType.value === 'tasks') return 'task_comment'
  if (recordType.value === 'documents') return 'file'
  return 'other'
})
const recordUserId = computed(() => {
  const row = record.value || {}
  return firstText(
    row.author_user_id,
    row.created_by_user_id,
    row.uploaded_by_user_id,
    row.reported_by_user_id,
    row.reporter_user_id,
    row.user_id,
    row.tenant_id,
    row.sp_id,
  )
})
const recordUserName = computed(() => {
  const row = record.value || {}
  return firstText(row.author_name, row.created_by_name, row.uploaded_by, row.reported_by, row.user_name)
})
const recordModeration = computed(() => {
  if (!record.value) return null
  const id = firstText(
    record.value.id,
    record.value.mx_id,
    record.value.transac_id,
    record.value.lease_id,
    record.value.LSID,
    recordId.value,
  )
  return {
    contentType: contentType.value,
    contentId: id,
    contentPath:
      propertyId.value && config.value.path
        ? `properties/${propertyId.value}/${config.value.path}/${id}`
        : '',
    reportedUserId: recordUserId.value,
    reportedUserDisplayName: recordUserName.value,
  }
})

const detailFields = computed(() => {
  const row = record.value || {}
  if (recordType.value === 'transactions') {
    return [
      { label: 'Amount', value: money(row.amount) || '-' },
      { label: 'Type', value: row.transac_type || '-' },
      { label: 'From', value: row.transac_from || '-' },
      { label: 'To', value: row.transac_to || '-' },
      { label: 'Date', value: normalizeDate(row.transac_date || row.created_datetime) || '-' },
      { label: 'Property', value: userDataStore.getPropertyName?.(row.property_id) || row.property_id || '-' },
    ]
  }
  if (recordType.value === 'tasks') {
    return [
      { label: 'Status', value: row.status || '-' },
      { label: 'Priority', value: row.priority || '-' },
      { label: 'Report Date', value: normalizeDate(row.report_date || row.createAt) || '-' },
      { label: 'Reported By', value: row.reported_by || '-' },
      { label: 'Property', value: userDataStore.getPropertyName?.(row.property_id) || row.property_id || '-' },
    ]
  }
  if (recordType.value === 'documents') {
    return [
      { label: 'Purpose', value: row.purpose || row.category || row.document_purpose || '-' },
      { label: 'File Type', value: row.file_type || row.content_type || '-' },
      { label: 'Uploaded', value: normalizeDate(row.upload_date || row.created_datetime) || '-' },
      { label: 'File Name', value: row.original_filename || '-' },
    ]
  }
  if (recordType.value === 'reminders') {
    return [
      { label: 'Category', value: row.category || '-' },
      { label: 'Start Date', value: normalizeDate(row.start_date) || '-' },
      { label: 'Due Date', value: normalizeDate(row.due_date) || '-' },
      { label: 'Repeat', value: row.repeat_by || '-' },
      { label: 'Amount', value: money(row.amount) || '-' },
    ]
  }
  if (recordType.value === 'services') {
    return [
      { label: 'Type', value: row.service_type || '-' },
      { label: 'Company', value: row.company_name || row.agent?.company || '-' },
      { label: 'Contact', value: row.agent?.name || row.agent_name || '-' },
      { label: 'Phone', value: row.agent?.phone || row.agent_phone || '-' },
      { label: 'Email', value: row.agent?.email || row.agent_email || '-' },
      { label: 'Start Date', value: normalizeDate(row.service_start_date) || '-' },
    ]
  }
  if (recordType.value === 'assets') {
    return [
      { label: 'Type', value: row.type || '-' },
      { label: 'Location', value: row.location || '-' },
      { label: 'Brand', value: row.brand || '-' },
      { label: 'Model', value: row.model || '-' },
      { label: 'Serial', value: row.serial || '-' },
      { label: 'Status', value: row.status || '-' },
    ]
  }
  return [
    { label: 'ID', value: row.id || recordId.value || '-' },
    { label: 'Status', value: row.status || '-' },
    { label: 'Date', value: normalizeDate(row.created_at || row.created_datetime || row.updated_at) || '-' },
  ]
})

const findStoreRecord = async () => {
  if (recordType.value === 'transactions') {
    if (!userDataStore.transactionsLoading && userDataStore.transactions.length === 0) await userDataStore.loadTransactions?.()
    return (userDataStore.userAccessibleTransactions || []).find((row) =>
      [row.id, row.transac_id].map(String).includes(recordId.value),
    )
  }
  if (recordType.value === 'tasks') {
    if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) await userDataStore.loadMxRecords?.()
    return (userDataStore.userAccessibleMxRecords || []).find((row) =>
      [row.id, row.mx_id, row.task_id].map(String).includes(recordId.value),
    )
  }
  if (recordType.value === 'leases') {
    if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) await userDataStore.loadLeases?.()
    return (userDataStore.userAccessibleLeases || []).find((row) =>
      [row.id, row.lease_id, row.LSID].map(String).includes(recordId.value),
    )
  }
  return null
}

const loadRecord = async () => {
  loading.value = true
  try {
    let row = null
    if (propertyId.value && config.value.path) {
      row = await getDocument(`properties/${propertyId.value}/${config.value.path}/${recordId.value}`).catch(() => null)
    }
    if (!row) row = await findStoreRecord()
    record.value = row
    if (row && shouldHideModeratedItem({ moderation: recordModeration.value })) {
      record.value = null
    }
  } finally {
    loading.value = false
  }
}

const openFile = () => {
  if (fileUrl.value) window.open(fileUrl.value, '_blank', 'noopener,noreferrer')
}

const hideCurrentRecord = () => {
  record.value = null
}

onMounted(async () => {
  await loadBlockedUsers()
  await loadRecord()
})
</script>
