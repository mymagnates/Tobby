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

      <template v-for="group in content.actionGroups || []" :key="group.title">
        <div class="mobile-section-title">{{ group.title }}</div>
        <div class="mobile-grid-actions">
          <button
            v-for="action in group.actions"
            :key="action.label"
            type="button"
            class="mobile-action-tile"
          >
            <q-icon :name="action.icon" size="24px" class="mobile-action-tile__icon" />
            <div>
              <div class="mobile-action-tile__label">{{ action.label }}</div>
              <div class="mobile-action-tile__hint">{{ action.hint }}</div>
            </div>
          </button>
        </div>
      </template>

      <template v-for="section in content.sections || []" :key="section.title">
        <div class="mobile-section-title">{{ section.title }}</div>
        <div v-if="section.items?.length" class="mobile-list">
          <div v-for="item in section.items" :key="`${section.title}-${item.title}`" class="mobile-list-row">
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
          </div>
        </div>
        <MobileEmptyState
          v-else
          title="Nothing here yet"
          body="Records for this section will appear here when available."
        />
      </template>

      <MobileCard v-if="!hasContent" title="Page shell ready" subtitle="This route is ready for data wiring.">
        <MobileEmptyState
          title="No page content configured"
          body="Add real data modules when this mobile page is connected to the backend."
        />
      </MobileCard>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { mobilePageContent } from './mobileContent'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
  pageKey: {
    type: String,
    required: true,
  },
})

const content = computed(() => mobilePageContent[props.role]?.[props.pageKey] || {
  eyebrow: props.role.toUpperCase(),
  title: props.pageKey,
  description: '',
  sections: [],
})

const avatarText = computed(() => {
  if (props.role === 'pm') return 'PM'
  if (props.role === 'owner') return 'OW'
  if (props.role === 'sp') return 'SP'
  if (props.role === 'tenant') return 'TT'
  return 'M'
})

const hasContent = computed(() => Boolean(
  (content.value.sections && content.value.sections.length) ||
    (content.value.actionGroups && content.value.actionGroups.length),
))

const chipClass = (tone) => {
  if (tone === 'accent') return 'mobile-chip--accent'
  if (tone === 'warning') return 'mobile-chip--warning'
  if (tone === 'danger') return 'mobile-chip--danger'
  return ''
}
</script>
