<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader
        :eyebrow="content.eyebrow"
        :title="content.title"
        :description="content.description"
      >
        <template #action>
          <q-avatar size="36px" color="primary" text-color="white">
            {{ avatarText }}
          </q-avatar>
        </template>
      </MobilePageHeader>

      <div v-if="content.metrics?.length" class="mobile-metric-grid">
        <div v-for="metric in content.metrics" :key="metric.label" class="mobile-metric">
          <div class="mobile-metric__label">{{ metric.label }}</div>
          <div class="mobile-metric__value">{{ metric.value }}</div>
          <div v-if="metric.note" class="mobile-metric__note">{{ metric.note }}</div>
        </div>
      </div>

      <div v-if="loading" class="mobile-list">
        <div v-for="index in 3" :key="index" class="mobile-list-row">
          <q-skeleton type="QAvatar" size="36px" />
          <div class="mobile-list-row__body">
            <q-skeleton type="text" width="72%" />
            <q-skeleton type="text" width="48%" />
          </div>
        </div>
      </div>

      <template v-for="group in loading ? [] : content.actionGroups || []" :key="group.title">
        <div class="mobile-section-title">{{ group.title }}</div>
        <div class="mobile-grid-actions">
          <button
            v-for="action in group.actions"
            :key="action.label"
            type="button"
            class="mobile-action-tile"
            @click="action.to && pushMobile(action.to)"
          >
            <q-icon :name="action.icon" size="24px" class="mobile-action-tile__icon" />
            <div>
              <div class="mobile-action-tile__label">{{ action.label }}</div>
              <div class="mobile-action-tile__hint">{{ action.hint }}</div>
            </div>
          </button>
        </div>
      </template>

      <template v-for="section in loading ? [] : content.sections || []" :key="section.title">
        <div class="mobile-section-title">
          {{ section.title }}
          <span v-if="section.items?.length" class="mobile-chip">{{ section.items.length }}</span>
        </div>
        <div v-if="section.items?.length" class="mobile-list">
          <button
            v-for="item in section.items"
            :key="`${section.title}-${item.title}`"
            type="button"
            :class="['mobile-list-row', item.to ? 'mobile-list-row--button' : '']"
            @click="item.to && pushMobile(item.to)"
          >
            <div class="mobile-list-row__icon">
              <q-icon :name="item.icon" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ item.title }}</div>
              <div class="mobile-list-row__meta">{{ item.meta }}</div>
            </div>
            <span v-if="item.status" :class="['mobile-chip', chipClass(item.tone)]">
              {{ item.status }}
            </span>
          </button>
        </div>
        <MobileEmptyState
          v-else
          title="Nothing here yet"
          body="Records for this section will appear here when available."
        />
      </template>

      <MobileEmptyState
        v-if="!loading && !(content.actionGroups?.length) && !(content.sections?.length)"
        title="Nothing here yet"
        body="Records for this page will appear here when available."
      />
    </div>
  </q-page>
</template>

<script setup>
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useMobileNav } from './useMobileNav'

defineProps({
  avatarText: {
    type: String,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { pushMobile } = useMobileNav()

const chipClass = (tone) => {
  if (tone === 'accent') return 'mobile-chip--accent'
  if (tone === 'warning') return 'mobile-chip--warning'
  if (tone === 'danger') return 'mobile-chip--danger'
  return ''
}
</script>
