<template>
  <q-card class="task-composer-feed-card">
    <q-card-section class="row items-center justify-between q-pb-sm">
      <div class="text-subtitle1 text-weight-medium">
        <q-icon name="dns" color="primary" class="q-mr-xs" />
        Create Task
      </div>
      <q-btn flat dense round icon="close" color="grey-7" @click="$emit('close')" />
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
</style>
