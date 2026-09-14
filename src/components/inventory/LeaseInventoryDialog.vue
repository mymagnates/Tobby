<template>
  <q-card class="ios-workspace inventory-web-dialog">
    <InventoryWorkspace v-if="activeLeaseId" :lease-id="activeLeaseId" embedded @close="closeInventory" />
    <section v-else class="inventory-lease-picker">
      <header class="inventory-picker-heading"><div><h1>Inventory Lists</h1><p>Select a lease to view its items and inspection history.</p></div>
        <q-btn flat round icon="close" aria-label="Close inventory lists" @click="$emit('close')" />
      </header>
      <q-input v-model="search" outlined clearable label="Find a property or lease" class="q-my-lg" />
      <div class="inventory-lease-grid">
        <button v-for="lease in filteredLeases" :key="lease.id" class="inventory-lease-choice" @click="selectedLeaseId = lease.id">
          <q-icon name="inventory_2" size="24px" /><span><strong>{{ lease.label }}</strong><small>{{ lease.subtitle }}</small></span><q-icon name="chevron_right" />
        </button>
      </div>
      <p v-if="!filteredLeases.length">{{ search ? 'No matching leases.' : 'Create a lease for this property to start its inventory list.' }}</p>
    </section>
  </q-card>
</template>
<script setup>
import InventoryWorkspace from './InventoryWorkspace.vue'
import { computed, ref } from 'vue'
import { useUserDataStore } from '../../stores/userDataStore'
const props = defineProps({ leaseId: { type: String, default: '' }, propertyId: { type: String, default: '' } })
const emit = defineEmits(['close'])
const store = useUserDataStore()
const selectedLeaseId = ref(''), search = ref('')
const activeLeaseId = computed(() => {
  const id = props.leaseId || selectedLeaseId.value
  return (store.userAccessibleLeases || []).find(lease => lease.id === id)?.inventory_source_lease_id || id
})
const filteredLeases = computed(() => (store.userAccessibleLeases || []).filter(lease => {
  const pid = lease.property_string_id || (typeof lease.property_id === 'string' ? lease.property_id : lease.property_id?.id)
  return !props.propertyId || props.propertyId === pid
}).map(lease => {
  const pid = lease.property_string_id || (typeof lease.property_id === 'string' ? lease.property_id : lease.property_id?.id)
  const property = (store.userAccessibleProperties || []).find(p => p.id === pid) || lease.property_id || {}
  return { id: lease.id, label: property.nickname || property.address || 'Property', subtitle: [lease.LSID || lease.id, lease.status].filter(Boolean).join(' · ') }
}).filter(lease => `${lease.label} ${lease.subtitle}`.toLowerCase().includes((search.value || '').toLowerCase())))
function closeInventory() { emit('close') }
</script>
<style scoped>
.inventory-web-dialog {
  width: 100%;
  padding: 20px 24px;
  box-shadow: none;
  background: var(--brand-canvas, #f7f8f4) !important;
  color: var(--brand-ink, #243830);
}
.inventory-lease-picker { width: 100%; }
.inventory-picker-heading { display: flex; justify-content: space-between; gap: 20px; }
.inventory-lease-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px; }
.inventory-lease-choice { display: flex; align-items: center; gap: 16px; padding: 20px; text-align: left; border: 1px solid var(--brand-border); border-radius: 12px; background: var(--brand-surface); color: var(--brand-ink); cursor: pointer; }
.inventory-lease-choice span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.inventory-lease-choice strong, .inventory-lease-choice small { display: block; }
.inventory-lease-choice small { margin-top: 6px; color: var(--brand-muted); }
.inventory-lease-choice:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 3px; }
.inventory-web-dialog :deep(.ios-row-title), .inventory-web-dialog :deep(.ios-row-meta) { white-space: normal; overflow-wrap: anywhere; }
.inventory-web-dialog :deep(.q-btn) {
  min-height: 44px;
  color: var(--brand-primary, #254b39) !important;
  text-transform: none;
}
.inventory-web-dialog :deep(.ios-primary.q-btn) {
  background: var(--brand-primary, #254b39) !important;
  color: var(--brand-on-primary, #fff) !important;
  border-color: var(--brand-primary, #254b39) !important;
}
.inventory-web-dialog :deep(.q-btn__content) { white-space: normal; text-align: center; }
.inventory-web-dialog :deep(.inventory-workspace) {
  flex: 0 0 auto;
  width: 100%;
  max-width: none;
  margin: 0 auto;
}
@media (max-width: 600px) {
  .inventory-web-dialog {
    padding: 12px 16px;
  }
}
</style>
