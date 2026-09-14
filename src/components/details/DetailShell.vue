<template>
  <transition name="detail-shell-slide">
    <div
      v-if="modelValue"
      class="detail-shell-layer"
      :class="{ 'detail-shell-layer--centered': centered }"
    >
      <button
        v-if="centered"
        type="button"
        class="detail-shell-backdrop"
        aria-label="Close detail"
        @click="closeShell"
      />

      <section
        class="detail-shell"
        :class="{ 'detail-shell--centered': centered }"
      >
        <header v-if="!hideHeader" class="detail-shell-header">
          <div class="detail-shell-title-wrap">
            <div class="detail-shell-title">{{ title }}</div>
            <div v-if="subtitle" class="detail-shell-subtitle">{{ subtitle }}</div>
          </div>
          <div class="detail-shell-actions">
            <slot name="actions" />
            <q-btn flat round icon="close" aria-label="Close detail" :ripple="false" @click="closeShell" />
          </div>
        </header>

        <div class="detail-shell-body">
          <slot />
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Detail' },
  subtitle: { type: String, default: '' },
  centered: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

const closeShell = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.detail-shell-layer {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

.detail-shell-layer--centered {
  display: block;
}

.detail-shell-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  margin: 0;
  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(2px);
  cursor: default;
}

.detail-shell {
  position: fixed;
  top: 72px;
  right: 16px;
  bottom: 16px;
  left: 16px;
  background: var(--brand-canvas, #f7f8f4);
  color: var(--brand-ink, #243830);
  font-family: inherit;
  border: 1px solid var(--brand-border, #dbe3dc);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgb(36 56 48 / 10%);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-shell--centered {
  top: 50%;
  right: auto;
  bottom: auto;
  left: 50%;
  width: min(760px, calc(100vw - 32px));
  max-height: min(78vh, 860px);
  transform: translate(-50%, -50%);
}

.detail-shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--brand-border, #dbe3dc);
  background: var(--brand-surface, #fff);
  flex-shrink: 0;
}

.detail-shell-title-wrap {
  min-width: 0;
}

.detail-shell-title {
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--brand-ink, #243830);
}

.detail-shell-subtitle {
  font-size: 0.8rem;
  color: var(--brand-muted, #61736a);
  overflow-wrap: anywhere;
}

.detail-shell-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.detail-shell-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 20px 24px max(24px, env(safe-area-inset-bottom));
}

.detail-shell-body :deep(.q-card),
.detail-shell-body :deep(.details-section),
.detail-shell-body :deep(.service-detail-section),
.detail-shell-body :deep(.service-detail-sidecard),
.detail-shell-body :deep(.service-detail-note-card),
.detail-shell-body :deep(.service-detail-hero),
.detail-shell-body :deep(.asset-detail-hero),
.detail-shell-body :deep(.detail-block),
.detail-shell-body :deep(.task-bid-button-card),
.detail-shell-body :deep(.task-bid-detail-head),
.detail-shell-body :deep(.task-bid-detail-summary) {
  background: var(--brand-surface, #fff) !important;
  color: var(--brand-ink, #243830);
  border-color: var(--brand-border, #dbe3dc) !important;
  box-shadow: none !important;
}
.detail-shell-body :deep(.asset-detail-badge),
.detail-shell-body :deep(.service-detail-badge) { background: var(--brand-soft, #ecf3ed); color: var(--brand-primary, #254b39); }
.detail-shell-body :deep(.task-bid-button-card--selected) { border-color: var(--brand-primary, #254b39) !important; background: var(--brand-soft, #ecf3ed) !important; }
.detail-shell-body :deep(.task-bid-button-card:hover) { transform: none; }
.detail-shell-body :deep(.detail-label),
.detail-shell-body :deep(.service-detail-eyebrow),
.detail-shell-body :deep(.service-detail-section__eyebrow) { color: var(--brand-muted, #61736a); }
.detail-shell-body :deep(.detail-value),
.detail-shell-body :deep(.section-title),
.detail-shell-body :deep(.service-detail-title) { color: var(--brand-ink, #243830); overflow-wrap: anywhere; }
.detail-shell :deep(.q-btn) { min-height: 44px; border-radius: 8px; box-shadow: none; text-transform: none; }
.detail-shell :deep(.q-btn__content) { justify-content: center; text-align: center; white-space: normal; gap: 4px; }
.detail-shell :deep(.q-btn.bg-primary) { background: var(--brand-primary, #254b39) !important; color: var(--brand-on-primary, #fff) !important; }
.detail-shell :deep(.q-btn.text-primary) { color: var(--brand-primary, #254b39) !important; }
@media (max-width: 600px) {
  .detail-shell-header { padding: 12px 16px; flex-wrap: wrap; }
  .detail-shell-actions { margin-left: auto; }
  .detail-shell-body { padding: 12px 16px max(20px, env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion: reduce) {
  .detail-shell-slide-enter-active, .detail-shell-slide-leave-active { transition: none; }
}

.detail-shell-slide-enter-active,
.detail-shell-slide-leave-active {
  transition: opacity 0.2s ease;
}

.detail-shell-slide-enter-from,
.detail-shell-slide-leave-to {
  opacity: 0;
}

.detail-shell-slide-enter-from .detail-shell {
  transform: translateY(10px);
}

.detail-shell-slide-leave-to .detail-shell {
  transform: translateY(10px);
}

.detail-shell-slide-enter-from .detail-shell--centered {
  transform: translate(-50%, calc(-50% + 10px));
}

.detail-shell-slide-leave-to .detail-shell--centered {
  transform: translate(-50%, calc(-50% + 10px));
}

@media (max-width: 1024px) {
  .detail-shell {
    top: 60px;
    right: 8px;
    left: 8px;
    bottom: 8px;
    border-radius: 10px;
  }

  .detail-shell--centered {
    top: 50%;
    right: auto;
    bottom: auto;
    left: 50%;
    width: min(680px, calc(100vw - 16px));
    max-height: min(84vh, 860px);
    transform: translate(-50%, -50%);
  }
}
</style>
