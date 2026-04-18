<template>
  <div class="range-bar row items-center q-col-gutter-sm">
    <div class="col-auto">
      <q-btn-toggle
        v-model="modelPreset"
        :options="presetOptions"
        toggle-color="primary"
        unelevated
      />
    </div>
    <div class="col-auto" v-if="modelPreset === 'custom'">
      <q-input v-model="modelFrom" dense outlined type="date" label="From" />
    </div>
    <div class="col-auto" v-if="modelPreset === 'custom'">
      <q-input v-model="modelTo" dense outlined type="date" label="To" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  preset: { type: String, default: '7d' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
})

const emit = defineEmits(['update:preset', 'update:from', 'update:to'])

const presetOptions = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'Custom', value: 'custom' },
]

const modelPreset = computed({
  get: () => props.preset,
  set: (value) => emit('update:preset', value),
})

const modelFrom = computed({
  get: () => props.from,
  set: (value) => emit('update:from', value),
})

const modelTo = computed({
  get: () => props.to,
  set: (value) => emit('update:to', value),
})
</script>

<style scoped>
.range-bar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
}
</style>
