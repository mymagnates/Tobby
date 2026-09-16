<template>
  <q-btn unelevated no-caps :ripple="false" class="ios-filter-card" :label="selectedLabel" :aria-label="`${label}: ${selectedLabel}`" :disable="disable" icon-right="expand_more">
    <q-menu class="ios-filter-menu">
      <q-list style="min-width: 180px; max-width: 300px" role="listbox" :aria-label="label">
        <q-item v-for="option in normalizedOptions" :key="option.value" clickable v-close-popup role="option" :aria-selected="option.value === modelValue" :active="option.value === modelValue" @click="$emit('update:modelValue', option.value)">
          <q-item-section>{{ option.label }}</q-item-section>
          <q-item-section v-if="option.value === modelValue" side><q-icon name="check" size="18px" /></q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  label: { type: String, default: 'Select' },
  disable: Boolean,
})
defineEmits(['update:modelValue'])
const normalizedOptions = computed(() => props.options.map(option => typeof option === 'object' ? option : { label: option, value: option }))
const selectedLabel = computed(() => normalizedOptions.value.find(option => option.value === props.modelValue)?.label || props.label)
</script>
