<template>
  <q-page class="pm-po-feed-page q-pa-sm">
    <div class="feed-shell">
      <aside class="feed-reminders">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Reminders</div>
            <q-card v-if="!filteredReminderItems.length" flat bordered class="reminder-card feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="reminder-title q-mb-xs">No Reminders Yet</div>
                <div class="reminder-brief">
                  Reminder cards will appear here when due, updated, or created.
                </div>
              </q-card-section>
            </q-card>
            <div v-else class="reminder-list">
              <q-card
                v-for="item in filteredReminderItems"
                :key="item.id"
                flat
                bordered
                class="reminder-card q-mb-sm"
              >
                <q-card-section class="q-pa-sm">
                  <div class="reminder-title">{{ item.title }}</div>
                  <div class="reminder-meta q-mb-xs">{{ item.meta }}</div>
                  <div class="reminder-brief q-mb-sm">{{ item.brief }}</div>
                  <q-btn
                    flat
                    no-caps
                    color="primary"
                    label="Open"
                    @click="openDetail(item)"
                  />
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </aside>

      <div class="feed-main">
        <div class="feed-list feed-grid">
          <q-card v-if="isMainFeedEmpty" class="feed-post feed-empty-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="post-title q-mb-xs">No Events Yet</div>
              <div class="post-body">
                This area shows timeline updates from tasks, leases, transactions, and reminders.
                Create or update records to populate this feed stream.
              </div>
            </q-card-section>
          </q-card>

          <div v-for="section in groupedFeedSections" :key="section.type" class="feed-type-section">
            <div class="feed-type-title">{{ section.label }}</div>
            <div class="feed-type-grid">
              <q-card
                v-for="post in section.items"
                :key="post.eventId || post.id"
                class="feed-post feed-post-clickable feed-mini-card"
                clickable
                @click="openDetail(post)"
              >
                <q-card-section class="feed-post-section">
                  <div class="row items-center q-gutter-sm q-mb-xs">
                    <q-avatar size="28px" :color="post.avatarColor" text-color="white">
                      <q-icon :name="post.avatarIcon" size="14px" />
                    </q-avatar>
                    <div class="col">
                      <div class="post-title">{{ post.title }}</div>
                      <div class="post-meta">{{ post.meta }}</div>
                      <div class="post-time">{{ formatEventTime(post) }}</div>
                    </div>
                  </div>

                  <div class="post-body">{{ post.brief }}</div>

                  <div class="post-open-hint">Tap card to open detail</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <aside class="feed-rail">
        <q-card class="rail-card q-mb-sm">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Ad Slot</div>
            <div class="ad-placeholder">
              Reserved for future ad placement
            </div>
          </q-card-section>
        </q-card>

        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Contacts</div>
            <q-btn outline color="primary" label="Open Contacts Dialog" class="full-width" @click="showContactsDialog = true" />
          </q-card-section>
        </q-card>
      </aside>
    </div>

    <q-dialog v-model="showContactsDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Contacts</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list separator>
            <q-item v-for="contact in contacts" :key="contact.id" clickable>
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="primary">{{ contact.initials }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ contact.name }}</q-item-label>
                <q-item-label caption>{{ contact.role }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

const router = useRouter()
const userDataStore = useUserDataStore()
const { getCollectionData } = useFirebase()

const showContactsDialog = ref(false)
const propertyReminders = ref([])

const contacts = [
  { id: 'c1', name: 'AquaFix LLC', role: 'SP • Plumbing', initials: 'AF' },
  { id: 'c2', name: 'Westlake Tenant', role: 'TT', initials: 'WT' },
  { id: 'c3', name: 'Property Owner', role: 'PO', initials: 'PO' },
]

const loadPropertyReminders = async () => {
  try {
    const properties = userDataStore.userAccessibleProperties || []
    if (!properties.length) {
      propertyReminders.value = []
      return
    }

    const reminderGroups = await Promise.all(
      properties.map((property) => getCollectionData(`properties/${property.id}/reminders`))
    )
    propertyReminders.value = reminderGroups.flat().filter(Boolean)
  } catch (error) {
    console.error('Failed to load property reminders for feed:', error)
    propertyReminders.value = []
  }
}

onMounted(async () => {
  try {
    const hasCoreFeedData =
      (userDataStore.userAccessibleMxRecords || []).length > 0 ||
      (userDataStore.userAccessibleTransactions || []).length > 0 ||
      (userDataStore.userAccessibleLeases || []).length > 0

    if (userDataStore.isAuthenticated && !hasCoreFeedData) {
      await userDataStore.loadAllUserData()
    }
  } catch (error) {
    console.error('Failed to initialize feed core data:', error)
  }

  await loadPropertyReminders()
})

watch(
  () => userDataStore.userAccessibleProperties.length,
  () => {
    loadPropertyReminders()
  }
)

const activePropertyLabel = computed(() => 'All Properties')
const normalizeId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const parsed = String(value).trim()
    if (!parsed || parsed.toLowerCase() === 'undefined' || parsed.toLowerCase() === 'null') continue
    return parsed
  }
  return ''
}
const makeEventId = (type, dataId) => `${type}-${dataId}`

const toDateSafe = (value) => {
  if (!value) return null
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const toMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const getLastDayOfMonth = (year, month) => new Date(year, month + 1, 0).getDate()

const getDueDayFromLease = (lease) => {
  const explicitDueDay = Number(
    lease?.rent_due_day || lease?.due_day || lease?.payment_due_day || lease?.rentDueDay || 0
  )
  if (explicitDueDay >= 1 && explicitDueDay <= 31) return explicitDueDay

  const anchorDate =
    toDateSafe(lease?.rent_due_date) ||
    toDateSafe(lease?.next_rent_due_date) ||
    toDateSafe(lease?.start_date) ||
    toDateSafe(lease?.lease_create_date) ||
    toDateSafe(lease?.move_in_date)
  return anchorDate ? anchorDate.getDate() : null
}

const propertyReminderItems = computed(() => {
  if (!propertyReminders.value.length) return []

  return propertyReminders.value.map((reminder) => ({
    eventId: makeEventId('reminder', normalizeId(reminder.id, reminder.reminder_id)),
    id: normalizeId(reminder.id, reminder.reminder_id),
    type: 'reminder',
    avatarColor: reminder.status ? 'purple-2' : 'grey-4',
    avatarIcon: reminder.status ? 'notifications_active' : 'notifications_off',
    title: `${String(reminder.category || 'Reminder').toUpperCase()} reminder`,
    meta: `${activePropertyLabel.value} • ${reminder.status ? 'Active' : 'Inactive'}`,
    brief:
      reminder.note ||
      `Start: ${reminder.start_date || 'N/A'} • Repeat: ${reminder.repeat_by || 'one-time'}`,
    detailPath: '/reminders',
    dataType: 'reminder',
    dataId: normalizeId(reminder.id, reminder.reminder_id),
    eventDate: reminder.created_date || reminder.start_date,
  }))
})

const rentReminderItems = computed(() => {
  const today = toMidnight(new Date())
  const sourceLeases = userDataStore.userAccessibleLeases || []

  return sourceLeases
    .map((lease) => {
      const dueDay = getDueDayFromLease(lease)
      if (!dueDay) return null

      const currentMonthMaxDay = getLastDayOfMonth(today.getFullYear(), today.getMonth())
      const normalizedDueDay = Math.min(dueDay, currentMonthMaxDay)
      const currentMonthDueDate = new Date(today.getFullYear(), today.getMonth(), normalizedDueDay)
      const daysDiff = Math.floor((toMidnight(currentMonthDueDate) - today) / (24 * 60 * 60 * 1000))
      const amount = Number(lease?.rate_amount || 0)
      const leaseLabel = lease?.LSID || lease?.id || 'Lease'
      const dueDateText = currentMonthDueDate.toLocaleDateString()

      if (daysDiff < 0) {
        return {
          eventId: makeEventId('rent-overdue', normalizeId(lease?.id, lease?.lease_id, lease?.LSID)),
          id: `rent-overdue-${lease.id || leaseLabel}`,
          type: 'reminder',
          avatarColor: 'red-2',
          avatarIcon: 'warning',
          title: 'Rent overdue',
          meta: `${activePropertyLabel.value} • System`,
          brief: `${leaseLabel}: Rent of $${amount.toFixed(2)} was due on ${dueDateText} (${Math.abs(daysDiff)} day(s) overdue).`,
          detailPath: '/leases',
          dataType: 'lease',
          dataId: normalizeId(lease?.id, lease?.lease_id, lease?.LSID),
          eventDate: currentMonthDueDate,
        }
      }

      if (daysDiff <= 5) {
        return {
          eventId: makeEventId('rent-due', normalizeId(lease?.id, lease?.lease_id, lease?.LSID)),
          id: `rent-due-${lease.id || leaseLabel}`,
          type: 'reminder',
          avatarColor: 'amber-2',
          avatarIcon: 'schedule',
          title: 'Rent due within 5 days',
          meta: `${activePropertyLabel.value} • System`,
          brief: `${leaseLabel}: Rent of $${amount.toFixed(2)} is due on ${dueDateText} (in ${daysDiff} day(s)).`,
          detailPath: '/leases',
          dataType: 'lease',
          dataId: normalizeId(lease?.id, lease?.lease_id, lease?.LSID),
          eventDate: currentMonthDueDate,
        }
      }

      return null
    })
    .filter(Boolean)
})

const reminderItems = computed(() => [...rentReminderItems.value, ...propertyReminderItems.value])

const selectedPropertyTasks = computed(() =>
  userDataStore.userAccessibleMxRecords || []
)

const selectedPropertyTransactions = computed(() =>
  userDataStore.userAccessibleTransactions || []
)

const selectedPropertyLeases = computed(() =>
  userDataStore.userAccessibleLeases || []
)

const getEventTimestamp = (item) => {
  const date =
    toDateSafe(item?.eventDate) ||
    toDateSafe(item?.created_datetime) ||
    toDateSafe(item?.created_date) ||
    toDateSafe(item?.report_date) ||
    toDateSafe(item?.transac_date) ||
    toDateSafe(item?.lease_create_date) ||
    toDateSafe(item?.start_date)
  return date ? date.getTime() : 0
}

const getEventDate = (item) =>
  toDateSafe(item?.eventDate) ||
  toDateSafe(item?.created_datetime) ||
  toDateSafe(item?.created_date) ||
  toDateSafe(item?.report_date) ||
  toDateSafe(item?.transac_date) ||
  toDateSafe(item?.lease_create_date) ||
  toDateSafe(item?.start_date)

const formatEventTime = (item) => {
  const eventDate = getEventDate(item)
  if (!eventDate) return 'Created: N/A'

  const eventDay = toMidnight(eventDate)
  const today = toMidnight(new Date())
  const diffDays = Math.floor((today - eventDay) / (24 * 60 * 60 * 1000))

  let relativeLabel = 'Today'
  if (diffDays === 1) relativeLabel = '1 day ago'
  if (diffDays > 1) relativeLabel = `${diffDays} days ago`

  return `Created: ${eventDate.toLocaleDateString()} • ${relativeLabel}`
}

const taskFeedItems = computed(() =>
  selectedPropertyTasks.value
    .map((task) => ({
      eventId: makeEventId('task', normalizeId(task.id, task.mx_id)),
      id: `task-${task.id}`,
      type: 'task',
      avatarColor: 'blue-2',
      avatarIcon: 'build',
      title: `Task ${task.mx_id || `#${task.id}`} updated`,
      meta: `${activePropertyLabel.value} • PM`,
      brief: task.description || 'Task has new updates.',
      detailPath: '/mx-records',
      dataType: 'task',
      dataId: normalizeId(task.id, task.mx_id),
      eventDate: task.updatedAt || task.createAt || task.report_date,
    }))
    .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
    .slice(0, 5)
)

const transactionFeedItems = computed(() =>
  selectedPropertyTransactions.value
    .map((transaction) => ({
      eventId: makeEventId('transaction', normalizeId(transaction.id, transaction.transac_id)),
      id: `txn-${transaction.id}`,
      type: 'transaction',
      avatarColor: 'green-2',
      avatarIcon: 'receipt_long',
      title: `${transaction.transac_type || 'Transaction'} submitted`,
      meta: `${activePropertyLabel.value} • Finance`,
      brief: transaction.note || transaction.description || 'Transaction record updated.',
      detailPath: '/transactions',
      dataType: 'transaction',
      dataId: normalizeId(transaction.id, transaction.transac_id),
      eventDate: transaction.created_datetime || transaction.transac_date,
    }))
    .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
    .slice(0, 5)
)

const leaseFeedItems = computed(() =>
  selectedPropertyLeases.value
    .map((lease) => ({
      eventId: makeEventId('lease', normalizeId(lease.id, lease.lease_id, lease.LSID)),
      id: `lease-${lease.id}`,
      type: 'lease',
      avatarColor: 'orange-2',
      avatarIcon: 'event',
      title: `Lease ${lease.LSID || `#${lease.id}`}`,
      meta: `${activePropertyLabel.value} • Lease`,
      brief: 'Lease details updated.',
      detailPath: '/leases',
      dataType: 'lease',
      dataId: normalizeId(lease.id, lease.lease_id, lease.LSID),
      eventDate: lease.updatedAt || lease.created_datetime || lease.lease_create_date,
    }))
    .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
    .slice(0, 5)
)

const filteredReminderItems = ref([])
const feedTypeLabels = {
  task: 'Tasks',
  transaction: 'Transactions',
  lease: 'Leases',
}
const feedTypeOrder = [
  { type: 'task', items: taskFeedItems },
  { type: 'transaction', items: transactionFeedItems },
  { type: 'lease', items: leaseFeedItems },
]
const groupedFeedSections = computed(() =>
  feedTypeOrder
    .map((section) => ({
      type: section.type,
      label: feedTypeLabels[section.type] || section.type,
      items: section.items.value,
    }))
    .filter((section) => section.items.length > 0)
)
const isMainFeedEmpty = computed(() => groupedFeedSections.value.length === 0)

watch(
  reminderItems,
  (items) => {
    filteredReminderItems.value = items.filter((item) => normalizeId(item.dataId, item.targetId))
  },
  { immediate: true }
)

const openDetail = (post) => {
  if (!post?.detailPath) return
  const dataType = String(post?.dataType || post?.targetType || '').trim()
  const dataId = normalizeId(post?.dataId, post?.targetId)

  if (!dataType || !dataId) {
    Notify.create({
      type: 'warning',
      message: 'This feed item is not linked to a detail record yet.',
      position: 'top',
    })
    return
  }
  const query = {}
  query.openType = dataType
  query.openId = dataId
  router.push({ path: post.detailPath, query })
}
</script>

<style scoped>
.feed-shell {
  max-width: 1580px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 280px;
  gap: 12px;
}

.feed-reminders,
.feed-main {
  min-width: 0;
}

.feed-list.feed-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-type-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feed-type-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--neutral-700);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding-left: 2px;
}

.feed-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.feed-context,
.feed-post,
.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.post-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  font-size: 0.72rem;
  color: var(--neutral-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-time {
  font-size: 0.7rem;
  color: var(--neutral-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-body {
  font-size: 0.8rem;
  color: var(--neutral-800);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.28;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.feed-post-section {
  padding: 8px 9px;
}

.feed-post-clickable {
  cursor: pointer;
  transition: box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
}

.feed-post-clickable:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.post-open-hint {
  font-size: 0.7rem;
  color: var(--neutral-500);
  text-align: right;
  margin-top: 1px;
}

.feed-mini-card {
  border-radius: 12px;
}

.feed-empty-card {
  border-style: dashed;
}

.rail-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neutral-800);
}

.ad-placeholder {
  min-height: 120px;
  border-radius: 10px;
  border: 1px dashed var(--neutral-300);
  background: var(--bg-secondary);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
}

.reminder-card {
  border-radius: 10px;
}

.reminder-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.reminder-meta {
  font-size: 0.75rem;
  color: var(--neutral-600);
}

.reminder-brief {
  font-size: 0.86rem;
  color: var(--neutral-800);
}

@media (max-width: 1480px) {
  .feed-shell {
    grid-template-columns: 240px minmax(0, 1fr) 260px;
  }
}

@media (max-width: 1280px) {
  .feed-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }
  .feed-rail {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .feed-shell {
    grid-template-columns: 1fr;
  }

  .feed-reminders,
  .feed-rail {
    grid-column: auto;
  }

  .feed-list.feed-grid {
    gap: 10px;
  }

  .feed-type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
