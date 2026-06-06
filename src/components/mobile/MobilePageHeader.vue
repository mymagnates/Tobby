<template>
  <header class="mobile-page-header">
    <div>
      <div class="mobile-page-header__title">{{ title }}</div>
    </div>
    <div v-if="$slots.action" class="mobile-page-header__action">
      <slot name="action" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
