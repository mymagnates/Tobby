<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader
        :eyebrow="content.eyebrow"
        :title="content.title"
        :description="content.description"
      />

      <div v-if="content.metrics?.length" class="mobile-stat-strip mobile-stat-strip--passive">
        <div v-for="metric in content.metrics" :key="metric.label" class="mobile-stat-strip__item">
          <span class="mobile-stat-strip__value">{{ metric.value }}</span>
          <span class="mobile-stat-strip__label">{{ metric.label }}</span>
          <span v-if="metric.note" class="mobile-stat-strip__note">{{ metric.note }}</span>
        </div>
      </div>

      <div v-if="loading" class="mobile-activity-list">
        <div v-for="index in 3" :key="index" class="mobile-activity-row">
          <q-skeleton type="circle" size="10px" />
          <div class="mobile-activity-row__body">
            <q-skeleton type="text" width="72%" />
            <q-skeleton type="text" width="48%" />
          </div>
        </div>
      </div>

      <template v-for="group in loading ? [] : content.actionGroups || []" :key="group.title">
        <section class="mobile-create-panel">
          <div class="mobile-section-title mobile-section-title--inline">{{ group.title }}</div>
          <div class="mobile-create-grid">
            <button
              v-for="action in group.actions"
              :key="action.label"
              type="button"
              :class="['mobile-create-button', { 'mobile-create-button--wide': action.wide }]"
              @click="action.to && pushMobile(action.to)"
            >
              <span class="mobile-create-button__icon">
                <q-icon :name="action.icon" size="18px" />
                <q-icon
                  v-if="isCreateAction(group, action)"
                  name="add"
                  size="12px"
                  class="mobile-create-button__plus"
                />
              </span>
              <span class="mobile-create-button__body">
                <span class="mobile-create-button__label">{{ action.label }}</span>
                <span class="mobile-create-button__hint">{{ action.hint }}</span>
              </span>
            </button>
          </div>
        </section>
      </template>

      <template v-for="section in loading ? [] : visibleSections" :key="section.title">
        <div class="mobile-section-title">
          {{ section.title }}
          <span v-if="section.items?.length" class="mobile-chip">{{ section.items.length }}</span>
        </div>
        <div v-if="section.items?.length" class="mobile-activity-list">
          <div
            v-for="item in section.items"
            :key="`${section.title}-${item.title}`"
            role="button"
            tabindex="0"
            :class="['mobile-activity-row', item.to ? 'mobile-activity-row--button' : '']"
            @click="item.to && pushMobile(item.to)"
          >
            <span :class="['mobile-activity-row__dot', dotClass(item.tone)]">
              <q-icon :name="item.icon" size="14px" />
            </span>
            <span class="mobile-activity-row__body">
              <span class="mobile-activity-row__title">{{ item.title }}</span>
              <span class="mobile-activity-row__meta">{{ item.meta }}</span>
            </span>
            <span
              v-if="item.status"
              :class="['mobile-chip mobile-chip--soft', chipClass(item.tone)]"
            >
              {{ item.status }}
            </span>
            <MobileModerationMenu
              v-if="item.moderation"
              v-bind="item.moderation"
              @reported="onModerationChanged"
              @blocked="onModerationChanged"
            />
          </div>
        </div>
        <MobileEmptyState
          v-else
          :title="section.emptyTitle || 'Nothing here yet'"
          :body="section.emptyBody || 'Records for this section will appear here when available.'"
        />
      </template>

      <MobileEmptyState
        v-if="!loading && !content.actionGroups?.length && !content.sections?.length"
        title="Nothing here yet"
        body="Records for this page will appear here when available."
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobileModerationMenu from 'components/mobile/MobileModerationMenu.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useMobileNav } from './useMobileNav'
import { useMobileModeration } from './useMobileModeration'

const props = defineProps({
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
const { loadBlockedUsers, shouldHideModeratedItem } = useMobileModeration()

const visibleSections = computed(() =>
  (props.content.sections || []).map((section) => ({
    ...section,
    items: (section.items || []).filter((item) => !shouldHideModeratedItem(item)),
  })),
)

const onModerationChanged = () => {
  // Shared moderation state updates inside the composable; this keeps the
  // template event explicit for item-level menus.
}

const isCreateAction = (group, action) =>
  action.create !== false &&
  (action.intent === 'create' ||
    group.intent === 'create' ||
    /^new\b|^create\b|^upload\b|^submit\b|^send\b|^add\b/i.test(String(action.label || '')))

const chipClass = (tone) => {
  if (tone === 'accent') return 'mobile-chip--accent'
  if (tone === 'warning') return 'mobile-chip--warning'
  if (tone === 'danger') return 'mobile-chip--danger'
  return ''
}

const dotClass = (tone) => {
  if (tone === 'accent') return 'mobile-activity-row__dot--accent'
  if (tone === 'warning') return 'mobile-activity-row__dot--warning'
  if (tone === 'danger') return 'mobile-activity-row__dot--danger'
  return ''
}

onMounted(() => {
  loadBlockedUsers()
})
</script>
