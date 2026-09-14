<template>
  <RoleWorkflowPage :content="content" :loading="loading" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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
const route = useRoute()
const {
  loading: propertyCollectionsLoading,
  documents,
  assets,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()

const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewProperties = [
  { id: 'preview-main', property_id: 'preview-main', nickname: '123 Main St', address: '123 Main St' },
  { id: 'preview-oak', property_id: 'preview-oak', nickname: '456 Oak Ave', address: '456 Oak Ave' },
]
const previewLeases = [
  { id: 'preview-lease-main', property_id: 'preview-main', status: 'active', start_date: '2025-08-01', end_date: '2026-07-31' },
]
const previewTasks = [
  { id: 'preview-task-sink', property_id: 'preview-main', task_title: 'Kitchen sink repair', status: 'open', report_date: '2026-05-20' },
]
const previewTransactions = [
  { id: 'preview-rent', property_id: 'preview-main', transac_type: 'Rent', transac_from: 'Tenant', transac_to: 'Property Owner', amount: 2400, transac_date: '2026-05-01', note: 'Rent received' },
  { id: 'preview-repair', property_id: 'preview-main', transac_type: 'Repair', transac_from: 'Property Owner', transac_to: 'Service Provider', amount: 280, transac_date: '2026-05-18', note: 'Plumbing repair' },
]
const previewRows = (rows, fallback) => rows.length ? rows : (isPreviewRoute.value ? fallback : [])

const properties = computed(() => previewRows(userDataStore.userAccessibleProperties || [], previewProperties))
const tasks = computed(() => previewRows(userDataStore.userAccessibleMxRecords || [], previewTasks))
const transactions = computed(() => previewRows(userDataStore.userAccessibleTransactions || [], previewTransactions))
const leases = computed(() => previewRows(userDataStore.userAccessibleLeases || [], previewLeases))
const loading = computed(() => userDataStore.propertiesLoading || userDataStore.mxRecordsLoading || userDataStore.transactionsLoading || userDataStore.leasesLoading || propertyCollectionsLoading.value)

const normalizePropertyId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value.id || value.property_id || '').trim()
  return String(value).trim()
}

const propertyName = (propertyId) => {
  const normalizedId = normalizePropertyId(propertyId)
  const property = properties.value.find((row) => normalizePropertyId(row.id || row.property_id) === normalizedId)
  return property?.nickname || property?.displayName || property?.address || propertyId || 'Property'
}

const money = (value) => `$${Number(value || 0).toLocaleString()}`
const percent = (value) => `${Math.round(Number(value || 0))}%`
const normalizeStatus = (value) => String(value || '').trim().toLowerCase()
const isOpenTask = (task) => !['resolved', 'closed', 'cancel', 'cancelled'].includes(normalizeStatus(task.status))
const isResolvedTask = (task) => ['resolved', 'closed'].includes(normalizeStatus(task.status))
const isOutstandingTransaction = (transaction) => {
  const status = normalizeStatus(transaction.status)
  return ['late', 'overdue', 'past_due', 'past due', 'unpaid', 'open', 'outstanding'].includes(status)
}
const normalizeTransactionRole = (value) => {
  const normalized = normalizeStatus(value)
  if (['po', 'property owner', 'owner', 'landlord'].includes(normalized)) return 'po'
  if (['pm', 'property manager', 'manager'].includes(normalized)) return 'pm'
  return normalized
}
const transactionFlow = (transaction) => {
  const fromRole = normalizeTransactionRole(transaction.transac_from || transaction.role)
  const toRole = normalizeTransactionRole(transaction.transac_to)
  if (['pm', 'po'].includes(toRole)) return 'income'
  if (['pm', 'po'].includes(fromRole)) return 'expense'
  const explicitType = normalizeStatus(transaction.type || transaction.transac_type)
  if (['income', 'expense'].includes(explicitType)) return explicitType
  return Number(transaction.amount || 0) < 0 ? 'expense' : 'ignore'
}
const transactionAmount = (flow, amount) => {
  const prefix = flow === 'expense' ? '-' : flow === 'income' ? '+' : ''
  return `${prefix}${money(amount)}`
}
const formatDate = (value) => {
  if (!value) return ''
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const toDateSafe = (value) => {
  if (!value) return null
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const daysBetween = (start, end) => {
  const startDate = toDateSafe(start)
  const endDate = toDateSafe(end)
  if (!startDate || !endDate) return null
  return Math.max(0, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)))
}

const activeLeaseStatuses = new Set(['rented', 'active', 'occupied', 'current'])
const vacantLeaseStatuses = new Set(['available', 'pending', 'expired', 'terminated'])
const activeLeasePropertyIds = computed(() => new Set(
  leases.value
    .filter((lease) => activeLeaseStatuses.has(normalizeStatus(lease.status)))
    .map((lease) => normalizePropertyId(lease.property?.id || lease.property_id)),
))

const propertyItems = computed(() => properties.value.map((property) => {
  const id = normalizePropertyId(property.id || property.property_id)
  const hasActiveLease = activeLeasePropertyIds.value.has(id)
  const openCount = tasks.value.filter((task) => normalizePropertyId(task.property_id) === id && isOpenTask(task)).length
  const docCount = documents.value.filter((doc) => normalizePropertyId(doc.property_id) === id).length
  const assetCount = assets.value.filter((asset) => normalizePropertyId(asset.property_id) === id).length
  return {
    icon: 'home',
    title: property.nickname || property.displayName || property.address || id,
    meta: [property.address, hasActiveLease ? 'Active lease' : 'No active lease', `${openCount} open task${openCount === 1 ? '' : 's'}`, `${docCount} docs`, `${assetCount} assets`].filter(Boolean).join(' - '),
    status: hasActiveLease ? 'Active' : openCount ? 'Watch' : 'Records',
    tone: hasActiveLease ? 'accent' : openCount ? 'warning' : '',
    to: `/mobile/owner/property/${id}/documents`,
  }
}))

const sortedTransactions = computed(() => [...transactions.value].sort((left, right) => {
  const leftDate = new Date(left.transac_date || left.created_datetime || 0).getTime() || 0
  const rightDate = new Date(right.transac_date || right.created_datetime || 0).getTime() || 0
  return rightDate - leftDate
}))

const transactionItems = computed(() => sortedTransactions.value.slice(0, 8).map((row) => ({
  icon: transactionFlow(row) === 'expense' ? 'north_east' : 'south_west',
  title: row.note || row.transac_type || 'Transaction',
  meta: `${propertyName(row.property_id)} - ${transactionAmount(transactionFlow(row), row.amount)} - ${formatDate(row.transac_date)}`,
  status: row.transac_type || '',
  tone: transactionFlow(row) === 'expense' ? 'warning' : transactionFlow(row) === 'income' ? 'accent' : '',
})))

const reportIncome = computed(() => transactions.value
  .filter((row) => transactionFlow(row) === 'income')
  .reduce((sum, row) => sum + Number(row.amount || 0), 0))
const reportExpense = computed(() => transactions.value
  .filter((row) => transactionFlow(row) === 'expense')
  .reduce((sum, row) => sum + Number(row.amount || 0), 0))

const taskItems = computed(() => tasks.value.filter(isOpenTask).slice(0, 6).map((task) => ({
  icon: 'build',
  title: task.task_title || task.description || 'Task',
  meta: `${propertyName(task.property_id)} - ${formatDate(task.report_date)}`,
  status: task.status || 'open',
  tone: 'warning',
})))

const reportPropertyItems = computed(() => properties.value.map((property) => {
  const id = normalizePropertyId(property.id || property.property_id)
  const propertyLeases = leases.value.filter((lease) => normalizePropertyId(lease.property?.id || lease.property_id) === id)
  const hasActiveLease = activeLeasePropertyIds.value.has(id)
  const vacant = propertyLeases.some((lease) => vacantLeaseStatuses.has(normalizeStatus(lease.status)))
  const openTasks = tasks.value.filter((task) => normalizePropertyId(task.property_id) === id && isOpenTask(task)).length
  const status = hasActiveLease ? 'Occupied' : vacant ? 'Vacant' : 'No lease'
  return {
    icon: hasActiveLease ? 'home' : 'home_work',
    title: property.nickname || property.displayName || property.address || id,
    meta: `${status} - ${openTasks} open task${openTasks === 1 ? '' : 's'}`,
    status: openTasks ? 'Watch' : status,
    tone: openTasks ? 'warning' : hasActiveLease ? 'accent' : '',
  }
}))

const outstandingTransactions = computed(() => sortedTransactions.value.filter(isOutstandingTransaction))
const outstandingAmount = computed(() => outstandingTransactions.value.reduce((sum, row) => sum + Number(row.amount || 0), 0))
const occupancyRate = computed(() => properties.value.length ? (activeLeasePropertyIds.value.size / properties.value.length) * 100 : 0)
const vacantPropertyCount = computed(() => Math.max(0, properties.value.length - activeLeasePropertyIds.value.size))
const delinquencyAgeBuckets = computed(() => {
  const buckets = { '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  const now = new Date()
  outstandingTransactions.value.forEach((row) => {
    const date = toDateSafe(row.due_date || row.transac_date || row.created_datetime)
    const amount = Number(row.amount || 0)
    if (!date || !Number.isFinite(amount)) return
    const days = Math.max(1, Math.floor((now - date) / (1000 * 60 * 60 * 24)))
    if (days <= 30) buckets['1-30'] += amount
    else if (days <= 60) buckets['31-60'] += amount
    else if (days <= 90) buckets['61-90'] += amount
    else buckets['90+'] += amount
  })
  return buckets
})
const largestDelinquencyBucket = computed(() => {
  const entries = Object.entries(delinquencyAgeBuckets.value).filter(([, amount]) => amount > 0)
  if (!entries.length) return null
  return entries.sort((left, right) => right[1] - left[1])[0]
})

const resolvedTasks = computed(() => tasks.value.filter(isResolvedTask))
const avgResolutionDays = computed(() => {
  const values = resolvedTasks.value
    .map((task) => daysBetween(task.report_date || task.created_at || task.createAt, task.resolv_date || task.updated_at))
    .filter((value) => Number.isFinite(value))
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
})
const statusSummaryItems = computed(() => {
  const openTasks = tasks.value.filter(isOpenTask).length
  const net = reportIncome.value - reportExpense.value
  const delinquencyMeta = largestDelinquencyBucket.value
    ? `${money(outstandingAmount.value)} outstanding - largest ${largestDelinquencyBucket.value[0]} days`
    : `${money(0)} outstanding`
  return [
    {
      icon: 'account_balance_wallet',
      title: 'Cash flow',
      meta: `${money(reportIncome.value)} income - ${money(reportExpense.value)} expense - ${money(net)} net`,
      status: net >= 0 ? 'Positive' : 'Negative',
      tone: net >= 0 ? 'accent' : 'warning',
    },
    {
      icon: 'home',
      title: 'Occupancy',
      meta: `${activeLeasePropertyIds.value.size} occupied - ${vacantPropertyCount.value} vacant`,
      status: percent(occupancyRate.value),
      tone: occupancyRate.value >= 90 ? 'accent' : vacantPropertyCount.value ? 'warning' : '',
    },
    {
      icon: outstandingTransactions.value.length ? 'warning' : 'check_circle',
      title: 'Rent risk',
      meta: delinquencyMeta,
      status: outstandingTransactions.value.length ? 'Watch' : 'Clear',
      tone: outstandingTransactions.value.length ? 'warning' : 'accent',
    },
    {
      icon: openTasks ? 'build' : 'task_alt',
      title: 'Maintenance',
      meta: avgResolutionDays.value === null
        ? `${openTasks} open - ${resolvedTasks.value.length} resolved`
        : `${openTasks} open - ${resolvedTasks.value.length} resolved - avg ${avgResolutionDays.value} days`,
      status: openTasks ? 'Watch' : 'Clear',
      tone: openTasks ? 'warning' : 'accent',
    },
  ]
})

const attentionItems = computed(() => [
  ...outstandingTransactions.value.slice(0, 3).map((row) => ({
    icon: 'warning',
    title: row.note || row.transac_type || 'Outstanding balance',
    meta: `${propertyName(row.property_id)} - ${money(row.amount)} - ${formatDate(row.due_date || row.transac_date || row.created_datetime)}`,
    status: row.status || 'Past due',
    tone: 'warning',
  })),
  ...taskItems.value,
].slice(0, 5))

const recentActivityItems = computed(() => {
  const taskRows = tasks.value.map((task) => ({
    type: 'task',
    date: toDateSafe(task.report_date || task.created_at || task.createAt),
    item: {
      icon: isOpenTask(task) ? 'build' : 'task_alt',
      title: task.task_title || task.description || 'Task',
      meta: `${propertyName(task.property_id)} - ${formatDate(task.report_date || task.created_at || task.createAt)}`,
      status: task.status || 'open',
      tone: isOpenTask(task) ? 'warning' : '',
    },
  }))
  const transactionRows = sortedTransactions.value.map((row) => ({
    type: 'transaction',
    date: toDateSafe(row.transac_date || row.created_datetime),
    item: {
      icon: transactionFlow(row) === 'expense' ? 'north_east' : 'south_west',
      title: row.note || row.transac_type || 'Transaction',
      meta: `${propertyName(row.property_id)} - ${transactionAmount(transactionFlow(row), row.amount)} - ${formatDate(row.transac_date || row.created_datetime)}`,
      status: row.transac_type || '',
      tone: transactionFlow(row) === 'expense' ? 'warning' : transactionFlow(row) === 'income' ? 'accent' : '',
    },
  }))
  return [...taskRows, ...transactionRows]
    .sort((left, right) => (right.date?.getTime?.() || 0) - (left.date?.getTime?.() || 0))
    .slice(0, 5)
    .map((row) => row.item)
})

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
  const income = reportIncome.value
  const expense = reportExpense.value
  const openTasks = tasks.value.filter(isOpenTask).length
  const attentionCount = openTasks + outstandingTransactions.value.length

  if (props.pageKey === 'home') {
    return {
      ...base,
      metrics: [
        { label: 'Net', value: money(income - expense), note: 'Recorded' },
        { label: 'Leases', value: `${leases.value.length}`, note: 'Accessible' },
        { label: 'Open', value: `${openTasks}`, note: 'Tasks' },
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
    const healthTone = attentionCount ? 'Watch' : 'Clear'
    return {
      ...base,
      metrics: [
        { label: 'Health', value: healthTone, note: `${attentionCount} item${attentionCount === 1 ? '' : 's'}` },
        { label: 'Net', value: money(income - expense), note: 'Recorded' },
        { label: 'Occ.', value: `${activeLeasePropertyIds.value.size}/${properties.value.length || 0}`, note: 'Properties' },
      ],
      sections: [
        {
          title: 'Status Summary',
          items: statusSummaryItems.value,
        },
        {
          title: 'Property Status',
          items: reportPropertyItems.value,
          emptyTitle: 'No property data',
          emptyBody: 'Property status will appear when accessible properties are available.',
        },
        {
          title: 'Needs Attention',
          items: attentionItems.value,
          emptyTitle: 'No attention items',
          emptyBody: 'No outstanding balances or open maintenance items need attention.',
        },
        {
          title: 'Recent Activity',
          items: recentActivityItems.value,
          emptyTitle: 'No recent activity',
          emptyBody: 'Recent transactions and tasks will appear here when recorded.',
        },
      ],
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
