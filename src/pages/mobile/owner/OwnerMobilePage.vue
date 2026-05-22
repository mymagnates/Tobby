<template>
  <RoleWorkflowPage avatar-text="OW" :content="content" :loading="loading" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import RoleWorkflowPage from 'src/pages/mobile/RoleWorkflowPage.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobilePropertyCollections } from 'src/pages/mobile/useMobilePropertyCollections'
import { ownerMobilePages } from './ownerMobileData'

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
  assets,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()

const properties = computed(() => userDataStore.userAccessibleProperties || [])
const tasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const transactions = computed(() => userDataStore.userAccessibleTransactions || [])
const leases = computed(() => userDataStore.userAccessibleLeases || [])
const loading = computed(() => userDataStore.propertiesLoading || userDataStore.mxRecordsLoading || userDataStore.transactionsLoading || userDataStore.leasesLoading || propertyCollectionsLoading.value)

const propertyName = (propertyId) => {
  const property = properties.value.find((row) => String(row.id || row.property_id || '') === String(propertyId || ''))
  return property?.nickname || property?.displayName || property?.address || propertyId || 'Property'
}

const money = (value) => `$${Number(value || 0).toLocaleString()}`
const isOpenTask = (task) => String(task.status || '').toLowerCase() !== 'closed' && String(task.status || '').toLowerCase() !== 'cancel'
const transactionAmount = (type, amount) => {
  const normalized = String(type || '').toLowerCase()
  const prefix = ['expense', 'refund'].includes(normalized) ? '-' : '+'
  return `${prefix}${money(amount)}`
}

const propertyItems = computed(() => properties.value.map((property) => {
  const id = property.id || property.property_id
  const lease = leases.value.find((row) => String(row.property?.id || row.property_id?.id || row.property_id || '') === String(id || ''))
  const openCount = tasks.value.filter((task) => String(task.property_id || '') === String(id || '') && isOpenTask(task)).length
  const docCount = documents.value.filter((doc) => String(doc.property_id || '') === String(id || '')).length
  const assetCount = assets.value.filter((asset) => String(asset.property_id || '') === String(id || '')).length
  return {
    icon: 'home',
    title: property.nickname || property.displayName || property.address || id,
    meta: [property.address, lease ? 'Active lease' : 'No active lease', `${openCount} open task${openCount === 1 ? '' : 's'}`, `${docCount} docs`, `${assetCount} assets`].filter(Boolean).join(' - '),
    status: lease ? 'Active' : openCount ? 'Watch' : 'Records',
    tone: lease ? 'accent' : openCount ? 'warning' : '',
    to: `/mobile/owner/property/${id}/documents`,
  }
}))

const transactionItems = computed(() => transactions.value.slice(0, 8).map((row) => ({
  icon: String(row.transac_type || '').toLowerCase() === 'expense' ? 'north_east' : 'south_west',
  title: row.note || row.transac_type || 'Transaction',
  meta: `${propertyName(row.property_id)} - ${transactionAmount(row.transac_type, row.amount)} - ${row.transac_date || ''}`,
  status: row.transac_type || '',
  tone: String(row.transac_type || '').toLowerCase() === 'expense' ? 'warning' : 'accent',
})))

const taskItems = computed(() => tasks.value.filter(isOpenTask).slice(0, 6).map((task) => ({
  icon: 'build',
  title: task.task_title || task.description || 'Task',
  meta: `${propertyName(task.property_id)} - ${task.report_date || ''}`,
  status: task.status || 'open',
  tone: 'warning',
})))

const propertyHistoryItems = computed(() => properties.value.flatMap((property) => {
  const id = property.id || property.property_id
  const name = property.nickname || property.displayName || property.address || id
  return [
    { icon: 'description', title: `${name} lease`, meta: 'Terms, rent, deposit, renewal dates', to: `/mobile/owner/property/${id}/leases` },
    { icon: 'folder', title: `${name} documents`, meta: 'Lease, invoice, receipt, notice', to: `/mobile/owner/property/${id}/documents` },
    { icon: 'payments', title: `${name} transactions`, meta: 'Income, expense, and payment records', to: `/mobile/owner/property/${id}/transactions` },
    { icon: 'build', title: `${name} tasks`, meta: 'Maintenance and service timeline', to: `/mobile/owner/property/${id}/tasks` },
  ]
}).slice(0, 8))

const content = computed(() => {
  const base = ownerMobilePages[props.pageKey] || ownerMobilePages.home
  const income = transactions.value
    .filter((row) => String(row.transac_type || '').toLowerCase() !== 'expense')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const expense = transactions.value
    .filter((row) => String(row.transac_type || '').toLowerCase() === 'expense')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)

  if (props.pageKey === 'home') {
    return {
      ...base,
      metrics: [
        { label: 'Net', value: money(income - expense), note: 'Recorded' },
        { label: 'Leases', value: `${leases.value.length}`, note: 'Accessible' },
        { label: 'Open', value: `${tasks.value.filter(isOpenTask).length}`, note: 'Tasks' },
      ],
      sections: [{ title: 'Portfolio Feed', items: [...taskItems.value, ...transactionItems.value].slice(0, 8) }],
    }
  }
  if (props.pageKey === 'property') {
    return {
      ...base,
      sections: [
        { title: 'Properties', items: propertyItems.value },
        { title: 'History', items: propertyHistoryItems.value },
      ],
    }
  }
  if (props.pageKey === 'financial') {
    return {
      ...base,
      metrics: [
        { label: 'Income', value: money(income), note: 'Recorded' },
        { label: 'Expense', value: money(expense), note: 'Recorded' },
        { label: 'Net', value: money(income - expense), note: 'Estimated' },
      ],
      sections: [{ title: 'Transactions', items: transactionItems.value }],
    }
  }
  return base
})

onMounted(async () => {
  if (!userDataStore.propertiesLoading && properties.value.length === 0) await userDataStore.loadProperties?.()
  if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) await userDataStore.loadMxRecords?.()
  if (!userDataStore.transactionsLoading && userDataStore.transactions.length === 0) await userDataStore.loadTransactions?.()
  if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) await userDataStore.loadLeases?.()
  await loadMobilePropertyCollections()
})
</script>
