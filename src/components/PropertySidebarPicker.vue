<template>
  <q-card
    flat
    bordered
    class="property-sidebar-picker"
    :class="{ 'property-sidebar-picker--compact': compact }"
  >
    <q-card-section class="property-picker-section">
      <div v-if="!compact" class="property-picker-title">Properties</div>
      <div v-if="compact" class="property-picker-grid" aria-label="Property filter">
        <button
          v-if="showCreate"
          type="button"
          class="property-picker-tile property-picker-tile--create"
          aria-label="Create Property"
          @click="$emit('create')"
        >
          <q-icon name="add_home" size="18px" />
          <q-tooltip anchor="center right" self="center left">Create Property</q-tooltip>
        </button>
        <button
          v-if="includeAll"
          type="button"
          class="property-picker-tile property-picker-tile--all"
          :class="{ 'property-picker-tile--active': modelValue === null }"
          aria-label="All Properties"
          @click="$emit('update:modelValue', null)"
        >
          <span>ALL</span>
          <q-tooltip anchor="center right" self="center left">All Properties</q-tooltip>
        </button>
        <button
          v-for="(property, index) in properties"
          :key="property.id"
          type="button"
          class="property-picker-tile"
          :class="[
            `property-picker-tile--tone-${index % 4}`,
            { 'property-picker-tile--active': modelValue === property.id },
          ]"
          :aria-label="propertyDisplayLabel(property)"
          @click="$emit('update:modelValue', property.id)"
        >
          <span>{{ propertyShortCode(property) }}</span>
          <q-tooltip anchor="center right" self="center left">
            {{ propertyDisplayLabel(property) }}
          </q-tooltip>
        </button>
      </div>
      <q-list v-else class="property-picker-list">
        <q-item
          v-if="showCreate"
          clickable
          class="property-picker-create-item"
          @click="$emit('create')"
        >
          <q-item-section avatar>
            <q-icon name="add_home" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Create Property</q-item-label>
          </q-item-section>
        </q-item>
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
  compact: {
    type: Boolean,
    default: false,
  },
  showCreate: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'create'])

const propertyDisplayLabel = (property) => {
  const name = property?.nickname || property?.address || property?.id || 'Property'
  const address = property?.address
  return address && address !== name ? `${name} - ${address}` : name
}

const propertyShortCode = (property) => {
  const source = String(property?.nickname || property?.address || property?.id || 'PR')
  const words = source
    .replace(/^\s*\d+\s*/, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word && !/^(st|street|rd|road|ln|lane|dr|drive|ave|avenue)$/i.test(word))

  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return (words[0] || source).slice(0, 2).toUpperCase()
}
</script>

<style scoped>
.property-sidebar-picker {
  border-radius: var(--border-radius-card);
  min-height: 306px;
  background: var(--bg-surface);
}

.property-sidebar-picker--compact {
  min-height: 0;
}

.property-picker-section {
  padding: 22px 18px !important;
}

.property-sidebar-picker--compact .property-picker-section {
  padding: 12px 10px !important;
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

.property-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 10px;
}

.property-sidebar-picker--compact .property-picker-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

.property-picker-tile {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #edf4f7;
  color: #345068;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.property-picker-tile:hover {
  transform: translateY(-1px);
  border-color: rgba(22, 127, 109, 0.3);
  box-shadow: 0 6px 14px rgba(28, 55, 75, 0.1);
}

.property-picker-tile--all {
  background: #eaf8f6;
  color: #167f6d;
  font-size: 0.68rem;
}

.property-picker-tile--create {
  background: #173d50;
  color: #ffffff;
}

.property-picker-create-item {
  background: #eef8f6;
  border-color: #b7e7df !important;
  color: #173d50;
}

.property-picker-tile--tone-0 {
  background: #e8f2ff;
  color: #2372ac;
}

.property-picker-tile--tone-1 {
  background: #f3ecff;
  color: #7651ad;
}

.property-picker-tile--tone-2 {
  background: #fff1df;
  color: #a36116;
}

.property-picker-tile--tone-3 {
  background: #e9f8f1;
  color: #177f63;
}

.property-picker-tile--active {
  border-color: #70d5c5;
  box-shadow: 0 0 0 3px rgba(105, 220, 197, 0.18);
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
