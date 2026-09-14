<template>
  <div class="owner-panel owner-workspace-view">
    <div class="owner-panel__header">
      <div>
        <h2 class="role-workspace-title">{{ title }}</h2>
        <div class="text-caption text-grey-7">
          View-only lease history and archived tenant occupancy records.
        </div>
      </div>
      <q-btn flat round icon="close" aria-label="Close lease history" v-close-popup />
    </div>

    <div v-if="!items.length" class="owner-panel__empty text-body2 text-grey-6">
      No historical lease records yet.
    </div>

    <q-list v-else separator class="owner-panel__list">
      <q-item v-for="lease in items" :key="lease.id" clickable @click="$emit('select', lease)">
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
