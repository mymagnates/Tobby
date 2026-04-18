<template>
  <q-card class="task-composer-feed-card">
    <q-card-section class="task-composer-header row items-center justify-between q-pb-sm">
      <div class="text-subtitle1 text-weight-medium">
        <q-icon name="dns" color="white" class="q-mr-xs" />
        Create Task
      </div>
      <q-btn
        flat
        dense
        round
        icon="close"
        color="white"
        class="task-composer-close-btn"
        @click="$emit('close')"
      />
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pt-md">
      <CreateMxRecord
        :property-id="propertyId"
        :property-name="propertyName"
        @mxrecord-created="(payload) => $emit('created', payload)"
        @cancel="$emit('close')"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import CreateMxRecord from './CreateMxRecord.vue'

defineProps({
  propertyId: {
    type: String,
    default: '',
  },
  propertyName: {
    type: String,
    default: '',
  },
})

defineEmits(['created', 'close'])
</script>

<style scoped>
.task-composer-feed-card {
  border-radius: 12px;
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.task-composer-header {
  background: #1f2937;
  color: #ffffff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.task-composer-close-btn,
.task-composer-close-btn :deep(.q-icon) {
  color: #ffffff !important;
}
</style>
