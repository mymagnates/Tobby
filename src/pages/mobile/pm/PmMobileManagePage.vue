<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Manage" description="View mobile records." />

      <div class="mobile-section-title">View Records</div>
      <div class="mobile-grid-actions">
        <button
          v-for="action in viewActions"
          :key="action.label"
          type="button"
          class="mobile-action-tile"
          @click="pushMobile(action.to)"
        >
          <q-icon :name="action.icon" size="24px" class="mobile-action-tile__icon" />
          <div>
            <div class="mobile-action-tile__label">{{ action.label }}</div>
            <div class="mobile-action-tile__hint">{{ action.hint }}</div>
          </div>
        </button>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'

const { pushMobile } = useMobileNav()

const viewActions = [
  { icon: 'payments', label: 'Transactions', hint: 'View saved financial records', to: '/mobile/pm/manage/view/transactions' },
  { icon: 'task_alt', label: 'Tasks', hint: 'View created work items', to: '/mobile/pm/manage/view/tasks' },
  { icon: 'rate_review', label: 'Bids', hint: 'Review submitted bid feedback', to: '/mobile/pm/manage/bids' },
  { icon: 'event', label: 'Reminders', hint: 'View dated follow-ups', to: '/mobile/pm/manage/view/reminders' },
  { icon: 'folder', label: 'Documents', hint: 'View uploaded files', to: '/mobile/pm/manage/view/documents' },
  { icon: 'handyman', label: 'Services', hint: 'View service records', to: '/mobile/pm/manage/view/services' },
  { icon: 'chair', label: 'Assets', hint: 'View property assets', to: '/mobile/pm/manage/view/assets' },
  { icon: 'inventory_2', label: 'Inventory', hint: 'Open lease-bound inventory by property', to: '/mobile/pm/property' },
]
</script>
