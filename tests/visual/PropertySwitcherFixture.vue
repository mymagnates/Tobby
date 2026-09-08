<template>
  <div class="dashboard-layout web-workspace" style="min-height: 100dvh">
    <header class="q-header dashboard-header" style="position: relative">
      <div class="header-toolbar" style="display: flex">
        <strong class="header-app-title" style="color: var(--workspace-ink)">Handout</strong>
        <PropertyContextSwitcher
          :model-value="selected"
          :properties="properties"
          user-id="visual-fixture"
          show-create
          @update:model-value="select"
          @manage="feedback = 'Manage properties clicked'"
          @create="feedback = 'Add property clicked'"
        />
      </div>
    </header>
    <main style="padding: 28px">
      <h1 style="font-size: 24px">Property switcher verification</h1>
      <p>Synthetic data. This page does not connect to Firebase or the backend.</p>
      <p role="status">Selected: {{ feedback }}</p>
    </main>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import PropertyContextSwitcher from '../../src/components/PropertyContextSwitcher.vue'
import { propertyScopeLocation } from '../../src/utils/workspaceScope.js'

// Synthetic records only; no Firebase, API or auth imports.
const properties = [
  { id: 'fixture-garden', nickname: 'Garden House', address: '123 Example Lane' },
  { id: 'fixture-cedar', nickname: 'Cedar Apartment', address: '45 Sample Road' },
  {
    id: 'fixture-long',
    nickname:
      'The exceptionally long property name that should truncate without hiding the dropdown arrow',
    address: '678 Demonstration Street',
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `fixture-${i}`,
    nickname: `Sample property ${i + 1}`,
    address: `${i + 10} Test Avenue`,
  })),
]
const selected = ref(null)
const feedback = ref('All properties')
function select(id) {
  selected.value = id
  const location = propertyScopeLocation(
    { path: window.location.pathname, query: { check: 'visual' } },
    id,
  )
  history.replaceState(null, '', `${location.path}?${new URLSearchParams(location.query)}`)
  feedback.value = id || 'All properties'
}
</script>
