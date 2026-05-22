<template>
  <article class="mobile-card">
    <div class="mobile-card__section">
      <div v-if="title || subtitle || status || $slots.headerAction" class="mobile-card__header">
        <div>
          <div v-if="title" class="mobile-card__title">{{ title }}</div>
          <div v-if="subtitle" class="mobile-card__subtitle">{{ subtitle }}</div>
        </div>
        <slot name="headerAction">
          <span v-if="status" :class="['mobile-chip', statusToneClass]">{{ status }}</span>
        </slot>
      </div>
      <slot />
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'neutral',
  },
})

const statusToneClass = computed(() => {
  if (props.tone === 'accent') return 'mobile-chip--accent'
  if (props.tone === 'warning') return 'mobile-chip--warning'
  if (props.tone === 'danger') return 'mobile-chip--danger'
  return ''
})
</script>
