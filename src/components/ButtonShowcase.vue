<template>
  <div class="button-showcase">
    <div class="text-h6 text-weight-semibold q-mb-md">Standardized Button Styles</div>

    <!-- Button Variants -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Button Variants</div>
      <div class="btn-grid btn-grid--4">
        <q-btn class="btn-primary" label="Primary" />
        <q-btn class="btn-accent" label="Accent" />
        <q-btn class="btn-success" label="Success" />
        <q-btn class="btn-finance" label="Finance" />
      </div>
    </div>

    <!-- Button Styles -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Button Styles</div>
      <div class="btn-grid btn-grid--4">
        <q-btn class="btn-primary" label="Primary" />
        <q-btn class="btn-secondary" label="Secondary" />
        <q-btn class="btn-outline" label="Outline" />
        <q-btn class="btn-ghost" label="Ghost" />
      </div>
    </div>

    <!-- Button Sizes -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Button Sizes</div>
      <div class="btn-group">
        <q-btn class="btn-primary btn-sm" label="Small" />
        <q-btn class="btn-primary btn-md" label="Medium" />
        <q-btn class="btn-primary btn-lg" label="Large" />
        <q-btn class="btn-primary btn-xl" label="Extra Large" />
      </div>
    </div>

    <!-- Button States -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Button States</div>
      <div class="btn-grid btn-grid--3">
        <q-btn class="btn-primary" label="Normal" />
        <q-btn class="btn-primary" disabled label="Disabled" />
        <q-btn class="btn-primary btn-loading" label="Loading" />
      </div>
    </div>

    <!-- Button Layouts -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Button Layouts</div>

      <div class="q-mb-md">
        <div class="text-caption q-mb-xs">Button Group</div>
        <div class="btn-group">
          <q-btn class="btn-primary" label="Left" />
          <q-btn class="btn-primary" label="Center" />
          <q-btn class="btn-primary" label="Right" />
        </div>
      </div>

      <div class="q-mb-md">
        <div class="text-caption q-mb-xs">Button Grid</div>
        <div class="btn-grid btn-grid--3">
          <q-btn class="btn-primary" label="Grid 1" />
          <q-btn class="btn-primary" label="Grid 2" />
          <q-btn class="btn-primary" label="Grid 3" />
        </div>
      </div>

      <div class="q-mb-md">
        <div class="text-caption q-mb-xs">Button Stack</div>
        <div class="btn-stack">
          <q-btn class="btn-primary" label="Stack 1" />
          <q-btn class="btn-secondary" label="Stack 2" />
          <q-btn class="btn-accent" label="Stack 3" />
        </div>
      </div>
    </div>

    <!-- Interactive Examples -->
    <div class="q-mb-lg">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Interactive Examples</div>
      <div class="btn-grid btn-grid--2">
        <q-btn class="btn-primary" @click="handleClick" label="Click Me" />
        <q-btn class="btn-secondary" @click="handleClick" label="Secondary Action" />
      </div>
      <div class="text-caption text-neutral-600 q-mt-sm">Click count: {{ clickCount }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>

<style scoped>
.button-showcase {
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--neutral-200);
  box-shadow: var(--shadow-sm);
}

.btn-grid {
  margin-bottom: var(--spacing-md);
}

.btn-group {
  margin-bottom: var(--spacing-md);
}

.btn-stack {
  margin-bottom: var(--spacing-md);
}
</style>
