<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Property" description="Open property records and current lease inventory." />

      <div class="mobile-list">
        <MobileCard
          v-for="property in visibleProperties"
          :key="property.id"
          :title="property.title"
          :subtitle="property.meta"
          :status="property.status"
          :tone="property.tone"
        >
          <div class="mobile-card-actions">
            <q-btn
              outline
              no-caps
              color="primary"
              label="View Records"
              @click="pushMobile(`/mobile/pm/property/${property.id}`)"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Inventory"
              @click="pushMobile(`/mobile/pm/property/${property.id}/inventory`)"
            />
          </div>
        </MobileCard>
      </div>

      <MobileEmptyState
        v-if="!propertiesLoading && visibleProperties.length === 0"
        title="No properties available"
        body="Accessible properties will appear here after your PM workspace data loads."
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { pmProperties } from './pmMobileData'

const userDataStore = useUserDataStore()
const { pushMobile } = useMobileNav()

const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const accessibleProperties = computed(() => userDataStore.userAccessibleProperties || [])
const accessibleLeases = computed(() => userDataStore.userAccessibleLeases || [])
const accessibleTasks = computed(() => userDataStore.userAccessibleMxRecords || [])

const getPropertyName = (property) => property.nickname || property.displayName || property.address || property.id

const getPropertyLease = (propertyId) => accessibleLeases.value.find((lease) => {
  const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
  return String(leasePropertyId || '') === String(propertyId || '')
})

const getPropertyTaskCount = (propertyId) => accessibleTasks.value.filter((task) => {
  return String(task.property_id || '') === String(propertyId || '') && String(task.status || '').toLowerCase() !== 'closed'
}).length

const visibleProperties = computed(() => {
  if (accessibleProperties.value.length === 0) return pmProperties

  return accessibleProperties.value.map((property) => {
    const lease = getPropertyLease(property.id)
    const taskCount = getPropertyTaskCount(property.id)
    const leaseStatus = lease ? 'Active lease' : 'No active lease'
    const taskText = taskCount === 1 ? '1 open task' : `${taskCount} open tasks`

    return {
      id: property.id || property.property_id,
      title: getPropertyName(property),
      meta: `${property.address || getPropertyName(property)} - ${leaseStatus} - ${taskText}`,
      status: lease ? 'Inventory' : 'Records',
      tone: lease ? 'accent' : '',
    }
  })
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
})
</script>
