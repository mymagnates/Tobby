<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Home" description="Feed and reminders that need attention.">
        <template #action>
          <q-avatar size="36px" color="primary" text-color="white">PM</q-avatar>
        </template>
      </MobilePageHeader>

      <div class="mobile-grid-actions">
        <button type="button" class="mobile-action-tile" @click="pushMobile('/mobile/pm/manage')">
          <q-icon name="add_box" size="24px" class="mobile-action-tile__icon" />
          <div>
            <div class="mobile-action-tile__label">Manage</div>
            <div class="mobile-action-tile__hint">Create or process records</div>
          </div>
        </button>
        <button type="button" class="mobile-action-tile" @click="pushMobile('/mobile/pm/property')">
          <q-icon name="apartment" size="24px" class="mobile-action-tile__icon" />
          <div>
            <div class="mobile-action-tile__label">Property</div>
            <div class="mobile-action-tile__hint">Records and lease inventory</div>
          </div>
        </button>
      </div>

      <q-btn-toggle
        v-model="activePanel"
        no-caps
        unelevated
        spread
        class="mobile-toggle"
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Feed', value: 'feed' },
          { label: 'Reminders', value: 'reminders' },
        ]"
      />

      <section>
        <div class="mobile-section-title">
          {{ activePanel === 'feed' ? 'Feed' : 'Reminders' }}
          <span class="mobile-chip">{{ visibleItems.length }}</span>
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
        <div v-else-if="visibleItems.length" class="mobile-list">
          <button
            v-for="item in visibleItems"
            :key="item.title"
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="item.to && pushMobile(item.to)"
          >
            <div class="mobile-list-row__icon">
              <q-icon :name="item.icon" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ item.title }}</div>
              <div class="mobile-list-row__meta">{{ item.meta }}</div>
            </div>
            <span v-if="item.status" :class="['mobile-chip', chipClass(item.tone)]">{{ item.status }}</span>
          </button>
        </div>
        <MobileEmptyState
          v-else
          title="Nothing here yet"
          body="Feed and reminders will appear here when workspace data is available."
        />
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { useMobilePropertyCollections } from 'src/pages/mobile/useMobilePropertyCollections'
import { pmFeedItems, pmReminders } from './pmMobileData'

const { pushMobile } = useMobileNav()
const userDataStore = useUserDataStore()
const {
  loading: propertyCollectionsLoading,
  reminders,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()
const activePanel = ref('feed')

const tasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const loading = computed(() => userDataStore.mxRecordsLoading || propertyCollectionsLoading.value)
const propertyName = (propertyId) => userDataStore.getPropertyName?.(propertyId) || propertyId || 'Property'
const taskFeedItems = computed(() => tasks.value.slice(0, 8).map((task) => ({
  icon: String(task.priority || '').toLowerCase() === 'urgent' ? 'priority_high' : 'build_circle',
  title: task.task_title || task.description || 'Task',
  meta: `${propertyName(task.property_id)} - ${task.report_date || ''}`,
  status: task.priority || task.status || 'Open',
  tone: String(task.priority || '').toLowerCase() === 'urgent' ? 'danger' : String(task.status || '').toLowerCase() === 'open' ? 'warning' : '',
  to: '/mobile/pm/manage/task',
})))
const reminderItems = computed(() => reminders.value
  .slice(0, 8)
  .map((reminder) => ({
    icon: 'event',
    title: reminder.category || 'Reminder',
    meta: `${reminder.due_date || reminder.start_date || ''} - ${propertyName(reminder.property_id)}`,
    status: reminder.status ? 'Done' : 'Open',
    tone: 'warning',
  })))
const visibleItems = computed(() => {
  if (activePanel.value === 'feed') return taskFeedItems.value.length ? taskFeedItems.value : pmFeedItems
  return reminderItems.value.length ? reminderItems.value : pmReminders
})

const chipClass = (tone) => {
  if (tone === 'accent') return 'mobile-chip--accent'
  if (tone === 'warning') return 'mobile-chip--warning'
  if (tone === 'danger') return 'mobile-chip--danger'
  return ''
}

onMounted(async () => {
  if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) {
    await userDataStore.loadMxRecords?.()
  }
  await loadMobilePropertyCollections()
})
</script>
