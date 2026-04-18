<template>
  <div class="range-bar panel">
    <button :class="{ primary: modelValue === 'today' }" @click="$emit('update:modelValue', 'today')">Today</button>
    <button :class="{ primary: modelValue === '7d' }" @click="$emit('update:modelValue', '7d')">7d</button>
    <button :class="{ primary: modelValue === '30d' }" @click="$emit('update:modelValue', '30d')">30d</button>
    <button :class="{ primary: modelValue === 'custom' }" @click="$emit('update:modelValue', 'custom')">Custom</button>
    <template v-if="modelValue === 'custom'">
      <input type="date" :value="from" @input="$emit('update:from', $event.target.value)" />
      <input type="date" :value="to" @input="$emit('update:to', $event.target.value)" />
    </template>
  </div>
</template>

<script setup>
defineProps({ modelValue: String, from: String, to: String })
defineEmits(['update:modelValue', 'update:from', 'update:to'])
</script>
