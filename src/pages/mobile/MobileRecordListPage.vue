<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader :eyebrow="eyebrow" :title="title" :description="description">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <div v-if="loading" class="mobile-list">
        <div v-for="index in 3" :key="index" class="mobile-list-row">
          <q-skeleton type="QAvatar" size="36px" />
          <div class="mobile-list-row__body">
            <q-skeleton type="text" width="70%" />
            <q-skeleton type="text" width="45%" />
          </div>
        </div>
      </div>

      <div v-else-if="visibleRows.length" class="mobile-list">
        <div
          v-for="row in visibleRows"
          :key="row.id || row.title"
          role="button"
          tabindex="0"
          class="mobile-list-row mobile-list-row--button"
          @click="openRecord(row)"
        >
          <div class="mobile-list-row__icon"><q-icon :name="icon" size="21px" /></div>
          <div class="mobile-list-row__body">
            <div class="mobile-list-row__title">{{ rowTitle(row) }}</div>
            <div class="mobile-list-row__meta">{{ rowMeta(row) }}</div>
          </div>
          <span v-if="rowStatus(row)" class="mobile-chip">{{ rowStatus(row) }}</span>
          <MobileModerationMenu
            v-if="rowModeration(row)"
            v-bind="rowModeration(row)"
            @reported="removeRowFromView(row)"
            @blocked="onModerationChanged"
          />
        </div>
      </div>

      <MobileEmptyState v-else title="No records" body="Records will appear here when available for this property." />
    </div>

    <q-dialog v-model="detailOpen" position="bottom">
      <q-card class="mobile-detail-sheet">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">{{ selected ? rowTitle(selected) : 'Record' }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">{{ selected ? rowMeta(selected) : '' }}</div>
          <div v-if="selected" class="mobile-key-values q-mt-md">
            <div v-for="item in detailFields" :key="item.label" class="mobile-key-value">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" v-close-popup />
          <q-btn v-if="fileUrl" unelevated no-caps color="primary" label="Open File" @click="openFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobileModerationMenu from 'components/mobile/MobileModerationMenu.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobileModeration } from 'src/pages/mobile/useMobileModeration'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { getAllDocuments } = useFirebase()
const { loadBlockedUsers, shouldHideModeratedItem } = useMobileModeration()

const props = defineProps({
  role: {
    type: String,
    default: '',
  },
  propertyId: {
    type: String,
    default: '',
  },
  recordType: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const rows = ref([])
const selected = ref(null)
const detailOpen = ref(false)

const role = computed(() => String(props.role || route.params.role || 'pm'))
const recordType = computed(() => String(props.recordType || route.params.recordType || 'documents'))
const propertyId = computed(() => String(props.propertyId || route.params.propertyId || ''))
const leasePropertyId = (lease) => lease?.property?.id || lease?.property_id?.id || lease?.property_id || lease?.property_string_id || ''

const typeConfig = {
  documents: { title: 'Documents', icon: 'folder', path: 'documents' },
  leases: { title: 'Leases', icon: 'description', store: 'leases' },
  transactions: { title: 'Transactions', icon: 'payments', store: 'transactions' },
  tasks: { title: 'Tasks', icon: 'task_alt', store: 'tasks' },
  reminders: { title: 'Reminders', icon: 'event', path: 'reminders' },
  services: { title: 'Services', icon: 'handyman', path: 'services' },
  assets: { title: 'Assets', icon: 'chair', path: 'assets' },
}
const config = computed(() => typeConfig[recordType.value] || typeConfig.documents)
const eyebrow = computed(() => role.value === 'owner' ? 'Owner Property' : 'PM Property')
const title = computed(() => config.value.title)
const description = computed(() => propertyId.value
  ? `Property-scoped ${config.value.title.toLowerCase()}.`
  : `All accessible ${config.value.title.toLowerCase()}.`)
const icon = computed(() => config.value.icon)
const fileUrl = computed(() => selected.value?.file_url || selected.value?.url || selected.value?.image_url || '')
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const mobileBase = computed(() => isPreviewRoute.value ? '/mobile-preview' : '/mobile')
const firstText = (...values) => values.map((value) => String(value || '').trim()).find(Boolean) || ''

const rowTitle = (row) => {
  if (recordType.value === 'leases') return row.LSID || row.lease_lsid || row.lease_id || row.id || 'Lease'
  return row.name || row.task_title || row.nickname || row.category || row.service_type || row.transac_type || row.description || row.id || 'Record'
}
const rowMeta = (row) => {
  if (recordType.value === 'leases') return [
    row.LSID || row.lease_lsid || row.lease_id || row.id,
    row.status || '',
    row.start_date || row.lease_start_date || '',
    row.end_date || row.lease_end_date || '',
  ].filter(Boolean).join(' - ')
  if (recordType.value === 'transactions') return `${row.transac_date || ''} - $${Number(row.amount || 0).toLocaleString()}`
  if (recordType.value === 'documents') return [row.category || row.purpose || 'General', row.upload_date || row.created_at || row.created_datetime].filter(Boolean).join(' - ')
  if (recordType.value === 'tasks') return [row.status || 'open', row.report_date].filter(Boolean).join(' - ')
  return [row.status, row.created_at || row.updated_at || row.created_date].filter(Boolean).join(' - ')
}
const rowStatus = (row) => row.status || row.transac_type || ''
const contentTypeForRow = computed(() => {
  if (recordType.value === 'tasks') return 'task_comment'
  if (recordType.value === 'documents') return 'file'
  return 'other'
})
const rowUserId = (row = {}) =>
  firstText(
    row.author_user_id,
    row.created_by_user_id,
    row.uploaded_by_user_id,
    row.reported_by_user_id,
    row.reporter_user_id,
    row.user_id,
    row.tenant_id,
    row.sp_id,
  )
const rowUserName = (row = {}) =>
  firstText(row.author_name, row.created_by_name, row.uploaded_by, row.reported_by, row.user_name)
const rowModeration = (row = {}) => {
  const id = firstText(row.id, row.mx_id, row.transac_id, row.lease_id, row.LSID, row.reminder_id)
  if (!id) return null
  const basePath =
    propertyId.value && config.value.path
      ? `properties/${propertyId.value}/${config.value.path}/${id}`
      : ''
  return {
    contentType: contentTypeForRow.value,
    contentId: id,
    contentPath: basePath,
    reportedUserId: rowUserId(row),
    reportedUserDisplayName: rowUserName(row),
  }
}
const visibleRows = computed(() =>
  rows.value.filter((row) => !shouldHideModeratedItem({ moderation: rowModeration(row) })),
)
const detailFields = computed(() => {
  const row = selected.value || {}
  return [
    { label: 'ID', value: row.id || row.mx_id || row.transac_id || '-' },
    { label: 'Status', value: row.status || row.transac_type || '-' },
    { label: 'Date', value: row.report_date || row.transac_date || row.start_date || row.lease_start_date || row.upload_date || row.created_at || row.created_datetime || '-' },
    { label: 'Note', value: row.note || row.description || row.notes || '-' },
  ]
})

const openRecord = (row) => {
  const id = String(row.id || row.mx_id || row.transac_id || row.lease_id || row.LSID || '').trim()
  const rowPropertyId = String(row.property_id || leasePropertyId(row) || propertyId.value || '').trim()
  if (!id) {
    selected.value = row
    detailOpen.value = true
    return
  }
  router.push({
    path: `${mobileBase.value}/${role.value}/manage/view/${recordType.value}/${encodeURIComponent(id)}`,
    query: rowPropertyId ? { propertyId: rowPropertyId } : {},
  })
}

const openFile = () => {
  if (fileUrl.value) window.open(fileUrl.value, '_blank', 'noopener,noreferrer')
}

const removeRowFromView = (row) => {
  const id = firstText(row?.id, row?.mx_id, row?.transac_id, row?.lease_id, row?.LSID, row?.reminder_id)
  if (!id) return
  rows.value = rows.value.filter((item) => firstText(item?.id, item?.mx_id, item?.transac_id, item?.lease_id, item?.LSID, item?.reminder_id) !== id)
}

const onModerationChanged = () => {}

const loadRows = async () => {
  loading.value = true
  try {
    if (recordType.value === 'transactions') {
      if (!userDataStore.transactionsLoading && userDataStore.transactions.length === 0) await userDataStore.loadTransactions?.()
      const source = userDataStore.userAccessibleTransactions || []
      rows.value = propertyId.value
        ? source.filter((row) => String(row.property_id || '') === propertyId.value)
        : source
      return
    }
    if (recordType.value === 'tasks') {
      if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) await userDataStore.loadMxRecords?.()
      const source = userDataStore.userAccessibleMxRecords || []
      rows.value = propertyId.value
        ? source.filter((row) => String(row.property_id || '') === propertyId.value)
        : source
      return
    }
    if (recordType.value === 'leases') {
      if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) await userDataStore.loadLeases?.()
      const source = userDataStore.userAccessibleLeases || []
      rows.value = propertyId.value
        ? source.filter((row) => String(leasePropertyId(row)) === propertyId.value)
        : source
      return
    }
    if (propertyId.value) {
      rows.value = await getAllDocuments(`properties/${propertyId.value}/${config.value.path}`).catch(() => [])
      return
    }
    const properties = userDataStore.userAccessibleProperties || []
    const groups = await Promise.all(properties.map(async (property) => {
      const id = String(property.id || property.property_id || '').trim()
      if (!id) return []
      const records = await getAllDocuments(`properties/${id}/${config.value.path}`).catch(() => [])
      return records.map((row) => ({ ...row, property_id: row.property_id || id }))
    }))
    rows.value = groups.flat()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBlockedUsers()
  await loadRows()
})
</script>
