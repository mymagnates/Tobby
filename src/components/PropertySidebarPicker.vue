<template>
  <q-card flat bordered class="property-sidebar-picker">
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Properties</div>
      <q-list dense>
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
  border-radius: 12px;
}

.picker-active {
  background: rgba(25, 118, 210, 0.12);
  border-left: 3px solid #1976d2;
}
</style>
