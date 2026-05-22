<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <div class="mobile-page-stack">
      <MobilePageHeader
        eyebrow="PM Property"
        :title="isInventory ? 'Current Lease Inventory' : propertyTitle"
        :description="isInventory ? 'Inventory list is entered from property context but bound to the active lease.' : 'Property-scoped records and lease context.'"
      >
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard :title="propertyTitle" :subtitle="leaseSubtitle">
        <div class="mobile-list">
          <div class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-icon name="description" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Active lease</div>
              <div class="mobile-list-row__meta">{{ activeLease ? activeLeaseMeta : 'No active lease found for this property.' }}</div>
            </div>
            <span v-if="activeLease" class="mobile-chip mobile-chip--accent">Lease</span>
          </div>
        </div>
      </MobileCard>

      <MobileCard v-if="!isInventory" title="Record types">
        <div class="mobile-list">
          <button
            v-for="row in rows"
            :key="row.title"
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="row.to && pushMobile(row.to)"
          >
            <div class="mobile-list-row__icon"><q-icon :name="row.icon" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ row.title }}</div>
              <div class="mobile-list-row__meta">{{ row.meta }}</div>
            </div>
          </button>
        </div>
      </MobileCard>

      <template v-else>
        <MobileCard title="Inventory list" :subtitle="inventorySubtitle">
          <div v-if="inventoryLoading" class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-spinner-dots color="primary" size="22px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Loading inventory</div>
              <div class="mobile-list-row__meta">Reading current lease inventory.</div>
            </div>
          </div>

          <div v-else-if="inventoryRecord" class="mobile-list">
            <div v-for="row in inventoryRows" :key="row.title" class="mobile-list-row">
              <div class="mobile-list-row__icon"><q-icon :name="row.icon" size="21px" /></div>
              <div class="mobile-list-row__body">
                <div class="mobile-list-row__title">{{ row.title }}</div>
                <div class="mobile-list-row__meta">{{ row.meta }}</div>
              </div>
              <span v-if="row.status" class="mobile-chip">{{ row.status }}</span>
            </div>
          </div>

          <MobileEmptyState
            v-else
            title="No inventory yet"
            body="Create a lease-bound inventory list for this property before adding items."
          />
        </MobileCard>

        <MobileCard v-if="showAddItem" title="Add Inventory Item" subtitle="This item will be saved to the active lease inventory.">
          <div class="mobile-form-stack">
            <q-input v-model="newItem.area" label="Room / Area" outlined dense />
            <q-input v-model="newItem.item" label="Item" outlined dense :rules="[(val) => !!String(val || '').trim() || 'Item is required']" />
            <q-input v-model="newItem.move_in_comment" label="Condition / Note" type="textarea" autogrow outlined dense />
          </div>
        </MobileCard>
      </template>
    </div>

    <div v-if="isInventory" class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        :label="primaryInventoryLabel"
        :loading="inventorySaving"
        @click="onInventoryPrimaryAction"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobilePropertyCollections } from 'src/pages/mobile/useMobilePropertyCollections'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { pmProperties } from './pmMobileData'

const route = useRoute()
const router = useRouter()
const { pushMobile } = useMobileNav()
const userDataStore = useUserDataStore()
const { getDocument, getAllDocuments, createDocument, updateDocument } = useFirebase()
const {
  loading: propertyCollectionsLoading,
  documents,
  reminders,
  services,
  assets,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()

const PRIMARY_INVENTORY_DOC_ID = 'primary'
const inventoryRecord = ref(null)
const inventoryLoading = ref(false)
const inventorySaving = ref(false)
const showAddItem = ref(false)
const newItem = reactive({
  area: '',
  item: '',
  move_in_comment: '',
})

const accessibleProperties = computed(() => userDataStore.userAccessibleProperties || [])
const accessibleLeases = computed(() => userDataStore.userAccessibleLeases || [])
const accessibleTasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const accessibleTransactions = computed(() => userDataStore.userAccessibleTransactions || [])
const routePropertyId = computed(() => String(route.params.propertyId || ''))

const property = computed(() => {
  const liveProperty = accessibleProperties.value.find((item) => String(item.id || item.property_id || '') === routePropertyId.value)
  if (liveProperty) return liveProperty
  return pmProperties.find((item) => item.id === route.params.propertyId)
})
const propertyTitle = computed(() => property.value?.nickname || property.value?.displayName || property.value?.address || property.value?.title || 'Property records')
const isInventory = computed(() => route.path.endsWith('/inventory'))

const getLeasePropertyId = (lease) => lease?.property?.id || lease?.property_id?.id || lease?.property_id
const getLeaseDocId = (lease) => String(lease?.lease_doc_id || lease?.id || lease?.doc_id || '').trim()
const getLeaseDisplayId = (lease) => String(lease?.LSID || lease?.lease_lsid || lease?.lease_id || getLeaseDocId(lease)).trim()
const normalizeStatus = (value) => String(value || '').trim().toLowerCase()

const propertyLeases = computed(() => accessibleLeases.value.filter((lease) => String(getLeasePropertyId(lease) || '') === routePropertyId.value))
const activeLease = computed(() => {
  return propertyLeases.value.find((lease) => ['active', 'current'].includes(normalizeStatus(lease.status))) || propertyLeases.value[0] || null
})
const activeLeaseMeta = computed(() => {
  if (!activeLease.value) return ''
  const start = activeLease.value.start_date || activeLease.value.lease_start_date || activeLease.value.move_in_date || ''
  const end = activeLease.value.end_date || activeLease.value.lease_end_date || activeLease.value.move_out_date || ''
  const dateRange = start || end ? `${start || 'Start TBD'} - ${end || 'End TBD'}` : 'Dates not set'
  return `${getLeaseDisplayId(activeLease.value)} - ${normalizeStatus(activeLease.value.status) || 'lease'} - ${dateRange}`
})
const leaseSubtitle = computed(() => activeLease.value ? 'Current lease context' : 'Property records can still be reviewed.')

const propertyTaskCount = computed(() => accessibleTasks.value.filter((task) => String(task.property_id || '') === routePropertyId.value).length)
const propertyOpenTaskCount = computed(() => accessibleTasks.value.filter((task) => {
  return String(task.property_id || '') === routePropertyId.value && normalizeStatus(task.status) !== 'closed'
}).length)
const propertyTransactionCount = computed(() => accessibleTransactions.value.filter((transaction) => String(transaction.property_id || '') === routePropertyId.value).length)
const propertyDocumentCount = computed(() => documents.value.filter((row) => String(row.property_id || '') === routePropertyId.value).length)
const propertyReminderCount = computed(() => reminders.value.filter((row) => String(row.property_id || '') === routePropertyId.value).length)
const propertyServiceCount = computed(() => services.value.filter((row) => String(row.property_id || '') === routePropertyId.value || (Array.isArray(row.property_ids) && row.property_ids.map(String).includes(routePropertyId.value))).length)
const propertyAssetCount = computed(() => assets.value.filter((row) => String(row.property_id || '') === routePropertyId.value).length)

const recordRows = computed(() => [
  { icon: 'folder', title: 'Documents', meta: propertyCollectionsLoading.value ? 'Loading documents' : `${propertyDocumentCount.value} property file${propertyDocumentCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/documents` },
  { icon: 'description', title: 'Lease', meta: `${propertyLeases.value.length} lease record${propertyLeases.value.length === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/leases` },
  { icon: 'payments', title: 'Transactions', meta: `${propertyTransactionCount.value} property financial record${propertyTransactionCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/transactions` },
  { icon: 'task_alt', title: 'Tasks', meta: `${propertyOpenTaskCount.value} open / ${propertyTaskCount.value} total work item${propertyTaskCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/tasks` },
  { icon: 'event', title: 'Reminders', meta: propertyCollectionsLoading.value ? 'Loading reminders' : `${propertyReminderCount.value} reminder${propertyReminderCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/reminders` },
  { icon: 'handyman', title: 'Services', meta: propertyCollectionsLoading.value ? 'Loading services' : `${propertyServiceCount.value} service record${propertyServiceCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/services` },
  { icon: 'chair', title: 'Assets', meta: propertyCollectionsLoading.value ? 'Loading assets' : `${propertyAssetCount.value} asset record${propertyAssetCount.value === 1 ? '' : 's'}`, to: `/mobile/pm/property/${routePropertyId.value}/assets` },
])

const ktcsRows = computed(() => {
  const items = inventoryRecord.value?.ktcs_items || {}
  const labels = [
    ['door_keys', 'Door keys'],
    ['garage_tokens', 'Garage tokens'],
    ['security_card', 'Security card'],
    ['mailbox_keys', 'Mailbox keys'],
  ]
  return labels.map(([key, label]) => {
    const entry = items[key] || {}
    return {
      icon: 'vpn_key',
      title: label,
      meta: `Received ${Number(entry.received || 0)} - Returned ${Number(entry.returned || 0)}`,
      status: Number(entry.received || 0) > 0 ? 'Set' : '',
    }
  })
})

const customRows = computed(() => {
  const customItems = Array.isArray(inventoryRecord.value?.custom_items) ? inventoryRecord.value.custom_items : []
  return customItems.map((item) => ({
    icon: 'inventory_2',
    title: item.item || 'Inventory item',
    meta: `${item.area || 'No area'} - ${item.move_in_comment || 'No condition note'}`,
    status: item.move_in_photo_url ? 'Photo' : '',
  }))
})

const inventoryRows = computed(() => [...ktcsRows.value, ...customRows.value])
const inventorySubtitle = computed(() => {
  if (!activeLease.value) return 'No active lease context.'
  if (!inventoryRecord.value) return 'Inventory has not been created for this lease.'
  const customCount = Array.isArray(inventoryRecord.value.custom_items) ? inventoryRecord.value.custom_items.length : 0
  return `${getLeaseDisplayId(activeLease.value)} - ${customCount} custom item${customCount === 1 ? '' : 's'}`
})

const rows = computed(() => (isInventory.value ? inventoryRows.value : recordRows.value))
const primaryInventoryLabel = computed(() => {
  if (!activeLease.value) return 'No Active Lease'
  if (!inventoryRecord.value) return 'Create Inventory List'
  return showAddItem.value ? 'Save Inventory Item' : 'Add Inventory Item'
})

const toInventoryTimestamp = (value) => {
  if (!value) return 0
  const next = value?.toDate ? value.toDate() : new Date(value)
  const time = next instanceof Date ? next.getTime() : NaN
  return Number.isFinite(time) ? time : 0
}

const pickBestInventoryRecord = (records) => {
  if (!Array.isArray(records) || records.length === 0) return null
  return [...records].sort((a, b) => {
    const aHasData = (Array.isArray(a?.custom_items) && a.custom_items.length > 0)
    const bHasData = (Array.isArray(b?.custom_items) && b.custom_items.length > 0)
    if (aHasData !== bHasData) return aHasData ? -1 : 1
    const aTime = toInventoryTimestamp(a?.updated_datetime) || toInventoryTimestamp(a?.created_datetime)
    const bTime = toInventoryTimestamp(b?.updated_datetime) || toInventoryTimestamp(b?.created_datetime)
    return bTime - aTime
  })[0]
}

const loadInventory = async () => {
  if (!isInventory.value || !activeLease.value) return
  const leaseDocId = getLeaseDocId(activeLease.value)
  if (!leaseDocId) return

  inventoryLoading.value = true
  try {
    let record = await getDocument(`leases/${leaseDocId}/inventories/${PRIMARY_INVENTORY_DOC_ID}`)
    if (!record) {
      const records = await getAllDocuments(`leases/${leaseDocId}/inventories`)
      record = pickBestInventoryRecord(records)
    }
    inventoryRecord.value = record
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to load inventory.', position: 'top' })
  } finally {
    inventoryLoading.value = false
  }
}

const createInventoryRecord = async () => {
  const lease = activeLease.value
  const leaseDocId = getLeaseDocId(lease)
  if (!lease || !leaseDocId) return
  const now = new Date().toISOString()
  const payload = {
    property_id: routePropertyId.value,
    property_address: property.value?.address || propertyTitle.value,
    lease_doc_id: leaseDocId,
    lease_lsid: getLeaseDisplayId(lease),
    ktcs_items: {
      door_keys: { received: 0, returned: 0 },
      garage_tokens: { received: 0, returned: 0 },
      security_card: { received: 0, returned: 0 },
      mailbox_keys: { received: 0, returned: 0 },
    },
    custom_items: [],
    created_datetime: now,
    updated_datetime: now,
  }
  const id = await createDocument(`leases/${leaseDocId}/inventories`, payload, PRIMARY_INVENTORY_DOC_ID)
  inventoryRecord.value = { id, ...payload }
  Notify.create({ type: 'positive', message: 'Inventory list created.', position: 'top' })
}

const saveNewInventoryItem = async () => {
  const itemName = String(newItem.item || '').trim()
  if (!itemName) {
    Notify.create({ type: 'warning', message: 'Item name is required.', position: 'top' })
    return
  }
  const leaseDocId = getLeaseDocId(activeLease.value)
  const inventoryId = inventoryRecord.value?.id || PRIMARY_INVENTORY_DOC_ID
  const nextItems = [
    ...(Array.isArray(inventoryRecord.value?.custom_items) ? inventoryRecord.value.custom_items : []),
    {
      area: String(newItem.area || '').trim(),
      item: itemName,
      collapsed: false,
      created_datetime: new Date().toISOString(),
      move_in_comment: String(newItem.move_in_comment || '').trim(),
      move_out_comment: '',
      move_in_photo_url: '',
      move_out_photo_url: '',
      move_in_photo_uploaded_at: '',
      move_out_photo_uploaded_at: '',
      move_in_photo_storage_path: '',
      move_out_photo_storage_path: '',
    },
  ]
  await updateDocument(`leases/${leaseDocId}/inventories`, inventoryId, {
    custom_items: nextItems,
    updated_datetime: new Date().toISOString(),
  })
  inventoryRecord.value = {
    ...inventoryRecord.value,
    custom_items: nextItems,
    updated_datetime: new Date().toISOString(),
  }
  newItem.area = ''
  newItem.item = ''
  newItem.move_in_comment = ''
  showAddItem.value = false
  Notify.create({ type: 'positive', message: 'Inventory item saved.', position: 'top' })
}

const onInventoryPrimaryAction = async () => {
  if (!activeLease.value) return
  inventorySaving.value = true
  try {
    if (!inventoryRecord.value) {
      await createInventoryRecord()
      return
    }
    if (!showAddItem.value) {
      showAddItem.value = true
      return
    }
    await saveNewInventoryItem()
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Inventory update failed.', position: 'top' })
  } finally {
    inventorySaving.value = false
  }
}

watch(activeLease, () => {
  inventoryRecord.value = null
  loadInventory()
})

onMounted(async () => {
  if (!userDataStore.propertiesLoading && accessibleProperties.value.length === 0) {
    await userDataStore.loadProperties?.()
  }
  if (!userDataStore.leasesLoading && userDataStore.leases.length === 0) {
    await userDataStore.loadLeases?.()
  }
  if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) {
    await userDataStore.loadMxRecords?.()
  }
  if (!userDataStore.transactionsLoading && userDataStore.transactions.length === 0) {
    await userDataStore.loadTransactions?.()
  }
  if (routePropertyId.value) {
    await loadMobilePropertyCollections([routePropertyId.value])
  }
  await loadInventory()
})
</script>
