<template>
  <div class="owner-panel">
    <div class="owner-panel__header">
      <div>
        <div class="text-h6 text-weight-bold">All Transactions</div>
        <div class="text-caption text-grey-7">
          View-only ledger for this property. Newest transactions appear first.
        </div>
      </div>
    </div>

    <div v-if="!items.length" class="owner-panel__empty text-body2 text-grey-6">
      No transactions recorded for this property.
    </div>

    <q-list v-else separator class="owner-panel__list">
      <q-item
        v-for="item in items"
        :key="item.id"
        clickable
        @click="$emit('select', item)"
      >
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

<style scoped>
.owner-panel {
  width: min(640px, 92vw);
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
