<template>
  <div class="owner-panel">
    <div class="owner-panel__header">
      <div>
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <div class="text-caption text-grey-7">
          View-only lease history and archived tenant occupancy records.
        </div>
      </div>
    </div>

    <div v-if="!items.length" class="owner-panel__empty text-body2 text-grey-6">
      No historical lease records yet.
    </div>

    <q-list v-else separator class="owner-panel__list">
      <q-item
        v-for="lease in items"
        :key="lease.id"
        clickable
        @click="$emit('select', lease)"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ getLeaseDisplayTenantName(lease) }}
          </q-item-label>
          <q-item-label caption>
            {{ formatDate(lease.lease_start_date || lease.start_date || lease.move_in_date) }}
            -
            {{ formatDate(lease.lease_end_date || lease.end_date) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip dense :color="getStatusColor(lease.status)" text-color="white">
            {{ normalizeStatus(lease.status) }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Historical Tenants & Leases',
  },
  items: {
    type: Array,
    default: () => [],
  },
  formatDate: {
    type: Function,
    required: true,
  },
  normalizeStatus: {
    type: Function,
    required: true,
  },
  getStatusColor: {
    type: Function,
    required: true,
  },
  getLeaseDisplayTenantName: {
    type: Function,
    required: true,
  },
})

defineEmits(['select'])
</script>

<style scoped>
.owner-panel {
  width: min(680px, 92vw);
  max-width: 100%;
  background: #fff;
  min-height: 100%;
  padding: 20px;
}

.owner-panel__header {
  margin-bottom: 16px;
}

.owner-panel__empty {
  padding: 24px 0;
}

.owner-panel__list {
  max-height: 75vh;
  overflow: auto;
}
</style>
