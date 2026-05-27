<template>
  <q-card flat bordered class="property-sidebar-picker">
    <q-card-section class="property-picker-section">
      <div class="property-picker-title">Properties</div>
      <q-list class="property-picker-list">
        <q-item
          v-if="includeAll"
          clickable
          :active="modelValue === null"
          active-class="picker-active"
          @click="$emit('update:modelValue', null)"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium">All Properties</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-for="property in properties"
          :key="property.id"
          clickable
          :active="modelValue === property.id"
          active-class="picker-active"
          @click="$emit('update:modelValue', property.id)"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ property.nickname || property.address || property.id }}
            </q-item-label>
            <q-item-label caption>{{ property.address || property.id }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  properties: {
    type: Array,
    default: () => [],
  },
  includeAll: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.property-sidebar-picker {
  border-radius: var(--border-radius-card);
  min-height: 306px;
  background: var(--bg-surface);
}

.property-picker-section {
  padding: 22px 18px !important;
}

.property-picker-title {
  margin-bottom: 16px;
  color: var(--neutral-600);
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.property-picker-list :deep(.q-item) {
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  margin-bottom: 8px;
  min-height: 64px;
  padding: 12px 14px;
}

.property-picker-list :deep(.q-item__label) {
  color: var(--neutral-800);
  font-size: 1rem;
  line-height: 1.3;
}

.property-picker-list :deep(.q-item__label--caption) {
  color: var(--neutral-600);
  font-size: 0.92rem;
  font-weight: 400;
  margin-top: 5px;
}

.picker-active {
  background: #eaf8f6;
  border: 1px solid #b7e7df !important;
}

:global(body.body--dark) .picker-active {
  background: rgba(45, 212, 191, 0.15);
  border-color: rgba(45, 212, 191, 0.42) !important;
}
</style>
