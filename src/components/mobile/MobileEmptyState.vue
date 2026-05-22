<template>
  <div class="mobile-empty-state">
    <div class="mobile-empty-state__title">{{ title }}</div>
    <div class="mobile-empty-state__body">{{ body }}</div>
    <div v-if="$slots.default" class="q-mt-md">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
})
</script>
