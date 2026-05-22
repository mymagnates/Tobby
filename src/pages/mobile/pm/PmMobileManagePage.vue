<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Manage" description="Create records and process operational work." />

      <template v-for="group in pmManageGroups" :key="group.title">
        <div class="mobile-section-title">{{ group.title }}</div>
        <div class="mobile-grid-actions">
          <button
            v-for="action in group.actions"
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
      </template>
    </div>
  </q-page>
</template>

<script setup>
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { pmManageGroups } from './pmMobileData'

const { pushMobile } = useMobileNav()
</script>
