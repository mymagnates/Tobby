<template>
  <q-page class="inventory-page ios-workspace">
    <LeaseInventoryDialog :lease-id="String(route.params.leaseId || '')" :property-id="String(route.query.propertyId || '')" @close="close" />
  </q-page>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import LeaseInventoryDialog from 'src/components/inventory/LeaseInventoryDialog.vue'
const route = useRoute(), router = useRouter()
function close() { router.push(route.query.from === 'home' ? '/' : '/leases') }
</script>
<style scoped>
.inventory-page { width: 100%; min-width: 0; padding: 0 0 24px; }
</style>
