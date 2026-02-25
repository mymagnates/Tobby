<template>
  <transition name="detail-shell-slide">
    <section v-if="modelValue" class="detail-shell">
      <header class="detail-shell-header">
        <div class="detail-shell-title-wrap">
          <div class="detail-shell-title">{{ title }}</div>
          <div v-if="subtitle" class="detail-shell-subtitle">{{ subtitle }}</div>
        </div>
        <div class="detail-shell-actions">
          <slot name="actions" />
          <q-btn flat round dense icon="close" @click="closeShell" />
        </div>
      </header>

      <div class="detail-shell-body">
        <slot />
      </div>
    </section>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Detail' },
  subtitle: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const closeShell = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.detail-shell {
  position: fixed;
  top: 72px;
  right: 16px;
  bottom: 16px;
  left: 16px;
  background: #fff;
  border: 1px solid var(--neutral-200);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--neutral-200);
  background: #f8f9fa;
}

.detail-shell-title-wrap {
  min-width: 0;
}

.detail-shell-title {
  font-size: 1.12rem;
  font-weight: 700;
  color: #1f2937;
}

.detail-shell-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-shell-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-shell-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.detail-shell-slide-enter-active,
.detail-shell-slide-leave-active {
  transition: all 0.2s ease;
}

.detail-shell-slide-enter-from,
.detail-shell-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1024px) {
  .detail-shell {
    top: 60px;
    right: 8px;
    left: 8px;
    bottom: 8px;
    border-radius: 10px;
  }
}
</style>
