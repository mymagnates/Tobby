<template>
  <div class="owner-panel owner-workspace-view">
    <div class="owner-panel__header">
      <div>
        <h2 class="role-workspace-title">All Transactions</h2>
        <div class="text-caption text-grey-7">
          View-only ledger for this property. Newest transactions appear first.
        </div>
      </div>
      <q-btn flat round icon="close" aria-label="Close transaction history" v-close-popup />
    </div>

    <div v-if="!items.length" class="owner-panel__empty text-body2 text-grey-6">
      No transactions recorded for this property.
    </div>

    <q-list v-else separator class="owner-panel__list">
      <q-item v-for="item in items" :key="item.id" clickable @click="$emit('select', item)">
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ item.transac_type || item.type || 'Transaction' }}
          </q-item-label>
          <q-item-label caption>
            {{ formatDate(item.transac_date || item.created_datetime || item.date) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <div class="text-weight-medium">{{ formatAmount(item.amount) }}</div>
          <div class="text-caption text-grey-6">{{ normalizeStatus(item.status) }}</div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  formatDate: {
    type: Function,
    required: true,
  },
  formatAmount: {
    type: Function,
    required: true,
  },
  normalizeStatus: {
    type: Function,
    required: true,
  },
})

defineEmits(['select'])
</script>
