<template>
  <RoleWorkflowPage avatar-text="TT" :content="content" :loading="loading" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import RoleWorkflowPage from 'src/pages/mobile/RoleWorkflowPage.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobilePropertyCollections } from 'src/pages/mobile/useMobilePropertyCollections'
import { tenantMobilePages } from './tenantMobileData'

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
})

const userDataStore = useUserDataStore()
const {
  loading: propertyCollectionsLoading,
  documents,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()

const leases = computed(() => userDataStore.userAccessibleLeases || [])
const tasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const loading = computed(() => userDataStore.leasesLoading || userDataStore.mxRecordsLoading || propertyCollectionsLoading.value)

const currentLease = computed(() => leases.value[0] || null)
const propertyId = (lease) => lease?.property?.id || lease?.property_id?.id || lease?.property_id || lease?.property_string_id || ''
const leaseLabel = (lease) => lease?.LSID || lease?.lease_lsid || lease?.lease_id || lease?.id || 'Lease'
const money = (value) => Number(value || 0) ? `$${Number(value || 0).toLocaleString()}` : 'N/A'
const tenantTasks = computed(() => {
  const activePropertyId = propertyId(currentLease.value)
  return tasks.value
    .filter((task) => !activePropertyId || String(task.property_id || '') === String(activePropertyId || ''))
    .slice(0, 8)
})
const tenantDocuments = computed(() => {
  const userId = String(userDataStore.userId || '')
  const leaseId = String(currentLease.value?.id || currentLease.value?.lease_doc_id || '')
  return documents.value
    .filter((doc) => {
      return doc.uploaded_by === userId ||
        doc.tenant_id === userId ||
        String(doc.lease_id || '') === leaseId ||
        doc.visibility === 'tenant'
    })
    .slice(0, 12)
})

const requestItems = computed(() => tenantTasks.value.map((task) => ({
  icon: String(task.status || '').toLowerCase() === 'closed' ? 'check_circle' : 'build',
  title: task.task_title || task.description || 'Request',
  meta: `${task.status || 'open'} - ${task.report_date || ''}`,
  status: task.status || 'open',
  tone: String(task.status || '').toLowerCase() === 'open' ? 'warning' : '',
})))

const leaseItems = computed(() => {
  const lease = currentLease.value
  if (!lease) return []
  return [
    {
      icon: 'description',
      title: 'Lease term',
      meta: [lease.start_date || lease.lease_start_date, lease.end_date || lease.lease_end_date].filter(Boolean).join(' - ') || leaseLabel(lease),
    },
    {
      icon: 'payments',
      title: 'Rent and deposit',
      meta: `${money(lease.rate_amount || lease.rent_amount)} rent - ${money(lease.deposit_amount)} deposit`,
    },
    {
      icon: 'inventory_2',
      title: 'Move-in inventory',
      meta: 'Assigned list available for tenant review',
      status: 'Open',
      tone: 'accent',
      to: '/mobile/tenant/lease/inventory',
    },
  ]
})
const documentItems = computed(() => [
  { icon: 'upload_file', title: 'Upload document', meta: 'Attach a tenant file to the lease', status: 'Add', tone: 'accent', to: '/mobile/tenant/documents/upload' },
  ...tenantDocuments.value.map((doc) => ({
    icon: 'description',
    title: doc.name || doc.original_filename || 'Document',
    meta: [doc.category || doc.purpose || 'General', doc.upload_date || doc.created_at || doc.created_datetime || ''].filter(Boolean).join(' - '),
    status: doc.uploaded_by === userDataStore.userId ? 'Yours' : '',
    tone: doc.uploaded_by === userDataStore.userId ? 'accent' : '',
  })),
])

const content = computed(() => {
  const base = tenantMobilePages[props.pageKey] || tenantMobilePages.home
  if (props.pageKey === 'home') {
    return {
      ...base,
      metrics: [
        { label: 'Rent', value: money(currentLease.value?.rate_amount || currentLease.value?.rent_amount), note: 'Lease' },
        { label: 'Requests', value: `${requestItems.value.filter((item) => String(item.status).toLowerCase() !== 'closed').length}`, note: 'Open' },
        { label: 'Lease', value: currentLease.value ? '1' : '0', note: 'Current' },
      ],
      sections: [
        {
          title: 'Today',
          items: [
            ...(currentLease.value ? [{ icon: 'home', title: leaseLabel(currentLease.value), meta: currentLease.value?.address || currentLease.value?.property_address || 'Active lease', status: 'Active', tone: 'accent' }] : []),
            ...requestItems.value.slice(0, 4),
          ],
        },
      ],
    }
  }
  if (props.pageKey === 'requests') {
    return {
      ...base,
      sections: [{ title: 'Request History', items: requestItems.value }],
    }
  }
  if (props.pageKey === 'lease') {
    return {
      ...base,
      sections: [{ title: 'Summary', items: leaseItems.value }],
    }
  }
  if (props.pageKey === 'documents') {
    return {
      ...base,
      sections: [{ title: 'Documents', items: documentItems.value }],
    }
  }
  return base
})

onMounted(async () => {
  if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) await userDataStore.loadLeases?.()
  if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) await userDataStore.loadMxRecords?.()
  await loadMobilePropertyCollections()
})
</script>
