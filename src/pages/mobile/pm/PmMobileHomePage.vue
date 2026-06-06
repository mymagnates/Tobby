<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Home" description="Today at a glance." />

      <div class="mobile-stat-strip" role="tablist" aria-label="PM home filters">
        <button
          v-for="stat in quickStats"
          :key="stat.value"
          type="button"
          :class="[
            'mobile-stat-strip__item',
            { 'mobile-stat-strip__item--active': activeFilter === stat.value },
          ]"
          @click="setFilter(stat.value)"
        >
          <span class="mobile-stat-strip__value">{{ stat.count }}</span>
          <span class="mobile-stat-strip__label">{{ stat.label }}</span>
        </button>
      </div>

      <section class="mobile-create-panel" aria-label="Create PM records">
        <div class="mobile-section-title mobile-section-title--inline">
          <span>Create Record</span>
        </div>

        <div class="mobile-create-grid">
          <button
            v-for="action in createActions"
            :key="action.label"
            type="button"
            :class="['mobile-create-button', { 'mobile-create-button--wide': action.wide }]"
            @click="pushMobile(action.to)"
          >
            <span class="mobile-create-button__icon">
              <q-icon :name="action.icon" size="18px" />
              <q-icon name="add" size="12px" class="mobile-create-button__plus" />
            </span>
            <span class="mobile-create-button__body">
              <span class="mobile-create-button__label">{{ action.label }}</span>
              <span class="mobile-create-button__hint">{{ action.hint }}</span>
            </span>
          </button>
        </div>
      </section>

      <section>
        <div class="mobile-section-title mobile-section-title--inline">
          <span>{{ sectionTitle }}</span>
          <button
            v-if="canToggleMore"
            type="button"
            class="mobile-text-action"
            @click="showAll = !showAll"
          >
            {{ showAll ? 'Show less' : 'View all' }}
          </button>
          <span v-else class="mobile-chip">{{ filteredItems.length }}</span>
        </div>

        <div v-if="loading" class="mobile-activity-list">
          <div v-for="index in 3" :key="index" class="mobile-activity-row">
            <q-skeleton type="circle" size="10px" />
            <div class="mobile-activity-row__body">
              <q-skeleton type="text" width="76%" />
              <q-skeleton type="text" width="52%" />
            </div>
          </div>
        </div>

        <div v-else-if="visibleItems.length" class="mobile-activity-list">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            role="button"
            tabindex="0"
            class="mobile-activity-row mobile-activity-row--button"
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
          title="Nothing needs attention"
          body="Tasks, bids, and due reminders will appear here when workspace data is available."
        />
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobileModerationMenu from 'components/mobile/MobileModerationMenu.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { marketplaceApi } from 'src/services/webApiClient'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'
import { useMobileModeration } from 'src/pages/mobile/useMobileModeration'
import { useMobilePropertyCollections } from 'src/pages/mobile/useMobilePropertyCollections'
import { pmFeedItems, pmReminders } from './pmMobileData'

const { pushMobile } = useMobileNav()
const { loadBlockedUsers, shouldHideModeratedItem } = useMobileModeration()
const route = useRoute()
const userDataStore = useUserDataStore()
const {
  loading: propertyCollectionsLoading,
  reminders,
  loadMobilePropertyCollections,
} = useMobilePropertyCollections()

const activeFilter = ref('attention')
const showAll = ref(false)
const bidRows = ref([])
const bidsLoading = ref(false)
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))

const tasks = computed(() => userDataStore.userAccessibleMxRecords || [])
const loading = computed(
  () => userDataStore.mxRecordsLoading || propertyCollectionsLoading.value || bidsLoading.value,
)

const createActions = [
  {
    icon: 'payments',
    label: 'New Transaction',
    hint: 'Log income or expense',
    to: '/mobile/pm/manage/transaction',
  },
  { icon: 'task_alt', label: 'New Task', hint: 'Create a work item', to: '/mobile/pm/manage/task' },
  {
    icon: 'event',
    label: 'New Reminder',
    hint: 'Add a follow-up date',
    to: '/mobile/pm/manage/reminder',
  },
  {
    icon: 'upload_file',
    label: 'New Document',
    hint: 'Upload a file or photo',
    to: '/mobile/pm/manage/document',
  },
  {
    icon: 'handyman',
    label: 'New Service',
    hint: 'Add service contact',
    to: '/mobile/pm/manage/service',
  },
  { icon: 'chair', label: 'New Asset', hint: 'Add a property item', to: '/mobile/pm/manage/asset' },
  {
    icon: 'inventory_2',
    label: 'Update Inventory List',
    hint: 'Choose a property first',
    to: '/mobile/pm/property',
    wide: true,
  },
]

const isOpenTask = (task) => {
  const status = String(task.status || 'open')
    .trim()
    .toLowerCase()
  return !['closed', 'cancel', 'cancelled', 'done', 'completed'].includes(status)
}

const isUrgentTask = (task) =>
  String(task.priority || '')
    .trim()
    .toLowerCase() === 'urgent'

const propertyName = (propertyId) =>
  userDataStore.getPropertyName?.(propertyId) || propertyId || 'Property'

const firstText = (...values) => values.map((value) => String(value || '').trim()).find(Boolean) || ''

const taskAuthorId = (task) =>
  firstText(
    task.author_user_id,
    task.created_by_user_id,
    task.reported_by_user_id,
    task.reporter_user_id,
    task.user_id,
    task.tenant_id,
    task.created_by,
  )

const taskAuthorName = (task) =>
  firstText(task.author_name, task.created_by_name, task.reported_by, task.reporter_name, task.user_name)

const recordDetailTo = (recordType, recordId, propertyId) => {
  if (!recordId) return `/mobile/pm/manage/view/${recordType}`
  const query = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : ''
  return `/mobile/pm/manage/view/${recordType}/${encodeURIComponent(recordId)}${query}`
}

const normalizeDate = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value) => {
  const date = normalizeDate(value)
  if (!date) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const isDueTodayOrOverdue = (value) => {
  const date = normalizeDate(value)
  if (!date) return false
  const today = new Date()
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return due.getTime() <= current.getTime()
}

const isPendingBid = (bid) => {
  const status = String(bid.status || 'submitted')
    .trim()
    .toLowerCase()
  return ['submitted', 'pending', 'revision_submitted', 'revised'].includes(status)
}

const fallbackTaskItems = computed(() =>
  pmFeedItems.map((item, index) => ({
    ...item,
    id: `fallback-feed-${index}`,
    kind: item.tone === 'accent' ? 'bid' : 'task',
    to: item.tone === 'accent' ? '/mobile/pm/manage/bids' : '/mobile/pm/manage/view/tasks',
    eventDate: '',
  })),
)

const fallbackReminderItems = computed(() =>
  pmReminders.map((item, index) => ({
    ...item,
    id: `fallback-reminder-${index}`,
    kind: 'reminder',
    to: '/mobile/pm/manage/view/reminders',
    eventDate: '',
  })),
)

const taskItems = computed(() => {
  const source = tasks.value.length ? tasks.value.filter(isOpenTask) : []
  return source.map((task) => {
    const urgent = isUrgentTask(task)
    const date = task.updatedAt || task.createAt || task.report_date
    return {
      id: `task-${task.id || task.mx_id || task.task_id || task.task_title}`,
      kind: 'task',
      icon: urgent ? 'priority_high' : 'build',
      title: task.task_title || task.description || 'Task',
      meta: [propertyName(task.property_id), 'Task', formatDate(date)].filter(Boolean).join(' · '),
      status: urgent ? 'Urgent' : '',
      tone: urgent ? 'danger' : '',
      eventDate: date,
      to: recordDetailTo('tasks', task.id || task.mx_id || task.task_id, task.property_id),
      moderation: {
        contentType: 'task_comment',
        contentId: String(task.id || task.mx_id || task.task_id || task.task_doc_id || ''),
        contentPath: task.property_id
          ? `properties/${task.property_id}/mxrecords/${task.id || task.mx_id || task.task_id || ''}`
          : '',
        reportedUserId: taskAuthorId(task),
        reportedUserDisplayName: taskAuthorName(task),
      },
    }
  })
})

const bidItems = computed(() =>
  bidRows.value.filter(isPendingBid).map((bid) => {
    const date = bid.created_at || bid.updated_at || bid.submitted_at
    return {
      id: `bid-${bid.id || bid.bid_id}`,
      kind: 'bid',
      icon: 'request_quote',
      title: bid.lead_title || bid.title || 'Bid received',
      meta: [bid.sp_name || bid.sp_business_name || 'SP', money(bid.amount), formatDate(date)]
        .filter(Boolean)
        .join(' · '),
      status: 'Review',
      tone: 'accent',
      eventDate: date,
      to: '/mobile/pm/manage/bids',
      moderation: {
        contentType: 'bid',
        contentId: String(bid.id || bid.bid_id || ''),
        contentPath: bid.lead_doc_id
          ? `marketplace_leads/${bid.lead_doc_id}/bids/${bid.bid_id || bid.id || ''}`
          : '',
        reportedUserId: firstText(bid.sp_id, bid.author_user_id),
        reportedUserDisplayName: firstText(bid.sp_name, bid.sp_business_name),
      },
    }
  }),
)

const reminderItems = computed(() => {
  const source = reminders.value.length ? reminders.value : []
  return source
    .filter((reminder) => !reminder.status)
    .map((reminder) => {
      const dueDate = reminder.due_date || reminder.start_date
      const due = isDueTodayOrOverdue(dueDate)
      return {
        id: `reminder-${reminder.id || reminder.reminder_id || reminder.category || dueDate}`,
        kind: 'reminder',
        icon: 'event',
        title: reminder.category || reminder.title || 'Reminder',
        meta: [propertyName(reminder.property_id), 'Reminder', formatDate(dueDate)]
          .filter(Boolean)
          .join(' · '),
        status: due ? 'Due' : '',
        tone: due ? 'warning' : '',
        eventDate: dueDate,
        to: recordDetailTo('reminders', reminder.id || reminder.reminder_id, reminder.property_id),
      }
    })
})

const openTaskCount = computed(() => {
  const count = tasks.value.filter(isOpenTask).length
  return (
    count ||
    (isPreviewRoute.value
      ? fallbackTaskItems.value.filter((item) => item.kind === 'task').length
      : 0)
  )
})

const pendingBidCount = computed(() => {
  const count = bidRows.value.filter(isPendingBid).length
  return (
    count ||
    (isPreviewRoute.value
      ? fallbackTaskItems.value.filter((item) => item.kind === 'bid').length
      : 0)
  )
})

const dueReminderCount = computed(() => {
  const count = reminders.value.filter(
    (reminder) => !reminder.status && isDueTodayOrOverdue(reminder.due_date || reminder.start_date),
  ).length
  return count || (isPreviewRoute.value ? fallbackReminderItems.value.length : 0)
})

const quickStats = computed(() => [
  { label: 'Need attention', count: openTaskCount.value, value: 'attention' },
  { label: 'Bids waiting', count: pendingBidCount.value, value: 'bids' },
  { label: 'Due today', count: dueReminderCount.value, value: 'due' },
])

const allItems = computed(() => {
  const realItems = [...taskItems.value, ...bidItems.value, ...reminderItems.value]
  const source =
    realItems.length || !isPreviewRoute.value
      ? realItems
      : [...fallbackTaskItems.value, ...fallbackReminderItems.value]
  return source
    .filter((item) => !shouldHideModeratedItem(item))
    .slice()
    .sort(
      (a, b) =>
        (normalizeDate(b.eventDate)?.getTime() || 0) - (normalizeDate(a.eventDate)?.getTime() || 0),
    )
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'bids') return allItems.value.filter((item) => item.kind === 'bid')
  if (activeFilter.value === 'due') {
    return allItems.value.filter(
      (item) => item.kind === 'reminder' && (item.status || item.tone === 'warning'),
    )
  }
  return allItems.value.filter((item) => item.kind !== 'reminder' || item.tone === 'warning')
})

const visibleItems = computed(() =>
  showAll.value ? filteredItems.value : filteredItems.value.slice(0, 3),
)
const canToggleMore = computed(() => filteredItems.value.length > 3)

const sectionTitle = computed(() => {
  if (activeFilter.value === 'bids') return 'Bids waiting'
  if (activeFilter.value === 'due') return 'Due today'
  return 'Needs attention'
})

const money = (value) => (value ? `$${Number(value || 0).toLocaleString()}` : '')

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

const setFilter = (value) => {
  activeFilter.value = activeFilter.value === value ? 'attention' : value
  showAll.value = false
}

const onModerationChanged = () => {
  showAll.value = false
}

const loadBids = async () => {
  const taskRefs = Array.from(
    new Set(
      tasks.value
        .flatMap((task) => [task.id, task.mx_id, task.task_id, task.task_doc_id])
        .filter(Boolean)
        .map(String),
    ),
  ).slice(0, 20)

  if (!taskRefs.length) {
    bidRows.value = []
    return
  }

  bidsLoading.value = true
  try {
    const groups = await Promise.all(
      taskRefs.map((taskRef) =>
        marketplaceApi
          .getTaskBids(taskRef, {
            actor_id: userDataStore.userId,
            actor_role: 'pm',
          })
          .catch(() => []),
      ),
    )
    const seen = new Set()
    bidRows.value = groups.flat().filter((bid) => {
      const id = String(bid.id || bid.bid_id || '').trim()
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
  } finally {
    bidsLoading.value = false
  }
}

onMounted(async () => {
  await loadBlockedUsers()
  if (!userDataStore.mxRecordsLoading && userDataStore.mxRecords.length === 0) {
    await userDataStore.loadMxRecords?.()
  }
  await Promise.all([loadMobilePropertyCollections(), loadBids()])
})
</script>
