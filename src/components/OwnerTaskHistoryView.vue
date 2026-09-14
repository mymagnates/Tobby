<template>
  <div class="owner-panel owner-workspace-view">
    <div class="owner-panel__header">
      <div>
        <h2 class="role-workspace-title">Task History</h2>
        <div class="text-caption text-grey-7">
          View-only task record for this property, including open work and historical resolutions.
        </div>
      </div>
      <q-btn flat round icon="close" aria-label="Close task history" v-close-popup />
    </div>

    <div v-if="!items.length" class="owner-panel__empty text-body2 text-grey-6">
      No tasks recorded for this property.
    </div>

    <template v-else>
      <div class="owner-panel__section-label">Open / In Progress</div>
      <q-list v-if="openItems.length" separator class="owner-panel__list q-mb-md">
        <q-item v-for="item in openItems" :key="item.id" clickable @click="$emit('select', item)">
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ item.task_title || item.description || item.category || 'Task' }}
            </q-item-label>
            <q-item-label caption>
              {{ formatDate(item.report_date || item.created_at || item.createAt) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip dense :color="getStatusColor(item.status)" text-color="white">
              {{ normalizeStatus(item.status) }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-body2 text-grey-6 q-mb-md">No active tasks.</div>

      <div class="owner-panel__section-label">History</div>
      <q-list v-if="historicalItems.length" separator class="owner-panel__list">
        <q-item
          v-for="item in historicalItems"
          :key="item.id"
          clickable
          @click="$emit('select', item)"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ item.task_title || item.description || item.category || 'Task' }}
            </q-item-label>
            <q-item-label caption>
              {{ formatDate(item.report_date || item.created_at || item.createAt) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip dense :color="getStatusColor(item.status)" text-color="white">
              {{ normalizeStatus(item.status) }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-body2 text-grey-6">No completed history yet.</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
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
  openTaskStatuses: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select'])

const openItems = computed(() =>
  props.items.filter((task) =>
    props.openTaskStatuses.includes(String(task.status || 'open').toLowerCase()),
  ),
)

const historicalItems = computed(() =>
  props.items.filter(
    (task) => !props.openTaskStatuses.includes(String(task.status || 'open').toLowerCase()),
  ),
)
</script>
