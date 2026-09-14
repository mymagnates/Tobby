<template>
  <header class="ios-header">
    <q-btn v-if="back" flat round icon="arrow_back" aria-label="Back" @click="$emit('back')" />
    <h1>{{ title }}</h1>
    <div class="ios-header-action"><slot /></div>
  </header>
</template>
<script setup>
defineProps({ title: { type: String, required: true }, back: Boolean })
defineEmits(['back'])
</script>
