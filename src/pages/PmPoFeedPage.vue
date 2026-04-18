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
        <div class="ad-slot-wrap q-mb-sm">
          <q-skeleton v-if="adSlotLoading" type="rect" class="ad-slot-skeleton" />
          <q-card
            v-else-if="adSlotItem"
            ref="adSlotCardRef"
            class="ad-slot-card"
            :style="adCardStyle"
            clickable
            @click="openAdSlot"
          >
            <q-img
              :src="adSlotItem.image_url"
              class="ad-slot-image"
              fit="cover"
              no-spinner
            />
            <div class="ad-slot-overlay">
              <div class="ad-slot-title">{{ adSlotItem.title }}</div>
              <div class="ad-slot-summary">{{ adSlotItem.summary }}</div>
              <div class="ad-slot-label">{{ adSlotItem.service_type_label }}</div>
            </div>
          </q-card>
          <q-banner
            v-else-if="adSlotError"
            dense
            inline-actions
            class="ad-slot-error"
          >
            {{ adSlotError }}
            <template #action>
              <q-btn flat dense label="Retry" @click="loadAdSlot" />
            </template>
          </q-banner>
        </div>

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
                  <div
                    v-if="post.type === 'task' && post.bidCount > 0"
                    class="post-body text-purple-8 q-mt-xs"
                  >
                    {{ post.latestBidSummary }}
                  </div>

                  <div class="post-open-hint">Tap card to open detail</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <aside class="feed-rail">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import { adSlotApi, marketplaceApi } from '../services/webApiClient'

const router = useRouter()
const userDataStore = useUserDataStore()
const { getCollectionData } = useFirebase()

const showContactsDialog = ref(false)
const propertyReminders = ref([])
const bidFeedItems = ref([])
const taskBidSummaries = ref({})
const adSlotLoading = ref(false)
const adSlotError = ref('')
const adSlotItem = ref(null)
const adSlotCardRef = ref(null)
const adImpressionSent = ref(false)
let adObserver = null

const contacts = []

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
  await loadBidFeedItems()
  await loadAdSlot()
})

onBeforeUnmount(() => {
  if (adObserver) {
    adObserver.disconnect()
    adObserver = null
  }
})

watch(
  () => userDataStore.userAccessibleProperties.length,
  () => {
    loadPropertyReminders()
  }
)

watch(
  () => userDataStore.user?.uid,
  (uid, prevUid) => {
    if (!uid || uid === prevUid) return
    loadAdSlot()
  }
)

watch(
  () => [
    userDataStore.userId,
    selectedPropertyTasks.value.map((task) => normalizeId(task.id, task.mx_id, task.task_id)).join('|'),
  ],
  () => {
    loadBidFeedItems()
  },
  { immediate: true }
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
    toDateSafe(lease?.lease_start_date) ||
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

const getTaskBidSummary = (task) => {
  const taskId = normalizeId(task?.id, task?.mx_id, task?.task_id)
  if (!taskId) return null
  return taskBidSummaries.value[taskId] || null
}

const loadBidFeedItems = async () => {
  try {
    const tasks = selectedPropertyTasks.value || []
    if (!tasks.length || !userDataStore.userId) {
      bidFeedItems.value = []
      taskBidSummaries.value = {}
      return
    }

    const summaryByTask = {}
    const rowsByTask = await Promise.all(
      tasks.map(async (task) => {
        const taskRef = normalizeId(task?.mx_id, task?.task_id, task?.id)
        if (!taskRef) return []
        try {
          const rows = await marketplaceApi.getTaskBids(taskRef, {
            actor_id: userDataStore.userId,
            actor_role: 'pm_po',
          })
          const taskDataId = normalizeId(task?.id, task?.mx_id, task?.task_id, taskRef)
          const latestBid = Array.isArray(rows) && rows.length ? rows[0] : null
          if (taskDataId) {
            summaryByTask[taskDataId] = {
              bidCount: Array.isArray(rows) ? rows.length : 0,
              latestBidAmount: latestBid?.amount || null,
              latestBidStatus: latestBid?.status || 'submitted',
              latestBidSpName: latestBid?.sp_business_name || latestBid?.sp_name || 'SP',
              latestBidAt: latestBid?.created_at || null,
            }
          }
          return (rows || []).map((bid) => ({
            eventId: makeEventId('bid', normalizeId(bid?.id, bid?.bid_id)),
            id: `bid-${normalizeId(bid?.id, bid?.bid_id)}`,
            type: 'bid',
            avatarColor: 'purple-2',
            avatarIcon: 'gavel',
            title: `Bid received for ${task?.task_title || task?.title || `Task ${taskRef}`}`,
            meta: `${activePropertyLabel.value} • Bids`,
            brief: `$${Number(bid?.amount || 0).toLocaleString()} · ${bid?.status || 'submitted'} · ${
              bid?.sp_business_name || bid?.sp_name || 'SP'
            }`,
            detailPath: '/mx-records',
            dataType: 'bid',
            dataId: normalizeId(bid?.id, bid?.bid_id),
            taskId: taskDataId,
            eventDate: bid?.created_at,
          }))
        } catch {
          return []
        }
      })
    )

    bidFeedItems.value = rowsByTask
      .flat()
      .filter(Boolean)
      .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
      .slice(0, 10)
    taskBidSummaries.value = summaryByTask
  } catch (error) {
    console.error('Failed to load bid feed items:', error)
    bidFeedItems.value = []
    taskBidSummaries.value = {}
  }
}

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
    .map((task) => {
      const taskId = normalizeId(task.id, task.mx_id)
      const bidSummary = getTaskBidSummary(task)
      return {
        eventId: makeEventId('task', taskId),
        id: `task-${task.id}`,
        type: 'task',
        avatarColor: 'blue-2',
        avatarIcon: 'build',
        title: `Task ${task.mx_id || `#${task.id}`} updated`,
        meta: `${activePropertyLabel.value} • PM`,
        brief: task.description || 'Task has new updates.',
        bidCount: bidSummary?.bidCount || 0,
        latestBidAmount: bidSummary?.latestBidAmount || null,
        latestBidStatus: bidSummary?.latestBidStatus || null,
        latestBidSpName: bidSummary?.latestBidSpName || null,
        latestBidAt: bidSummary?.latestBidAt || null,
        latestBidSummary:
          bidSummary && bidSummary.bidCount > 0
            ? `${bidSummary.bidCount} bid${bidSummary.bidCount > 1 ? 's' : ''} · Latest ${
                bidSummary.latestBidSpName
              } $${Number(bidSummary.latestBidAmount || 0).toLocaleString()}`
            : '',
        detailPath: '/mx-records',
        dataType: 'task',
        dataId: taskId,
        eventDate: task.updatedAt || task.createAt || task.report_date,
      }
    })
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
  bid: 'Bids',
  transaction: 'Transactions',
  lease: 'Leases',
}
const feedTypeOrder = [
  { type: 'task', items: taskFeedItems },
  { type: 'bid', items: bidFeedItems },
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
  const query = { openType: dataType, openId: dataId }
  if (dataType === 'bid') {
    query.openTaskId = normalizeId(post?.taskId, post?.task_id, post?.taskDataId)
  }
  router.push({ path: post.detailPath, query })
}

const adCardStyle = computed(() => {
  const width = Number(adSlotItem.value?.card_spec?.width_px || 320)
  const height = Number(adSlotItem.value?.card_spec?.height_px || 180)
  return {
    '--ad-card-width': `${width}px`,
    '--ad-card-height': `${height}px`,
    aspectRatio: `${width} / ${height}`,
  }
})

const reportAdImpression = async (entry) => {
  if (!adSlotItem.value?.impression_token || adImpressionSent.value) return
  try {
    await adSlotApi.reportImpression({
      userId: userDataStore.user?.uid,
      role: 'pm_po',
      impressionToken: adSlotItem.value.impression_token,
      viewportRatio: Number(entry?.intersectionRatio || 0),
      dwellMs: null,
    })
    adImpressionSent.value = true
  } catch (error) {
    console.error('Failed to report ad impression:', error)
  }
}

const bindAdObserver = async () => {
  if (adObserver) {
    adObserver.disconnect()
    adObserver = null
  }
  await nextTick()
  const el = adSlotCardRef.value?.$el || adSlotCardRef.value
  if (!el || !adSlotItem.value) return
  adObserver = new IntersectionObserver(
    (entries) => {
      const first = entries?.[0]
      if (!first?.isIntersecting) return
      if ((first.intersectionRatio || 0) < 0.6) return
      reportAdImpression(first)
    },
    { threshold: [0.6, 0.8] }
  )
  adObserver.observe(el)
}

const loadAdSlot = async () => {
  if (!userDataStore.user?.uid) return
  adSlotLoading.value = true
  adSlotError.value = ''
  try {
    const response = await adSlotApi.getFeed({
      userId: userDataStore.user.uid,
      role: 'pm_po',
      slotId: 'pm_feed_top',
      limit: 1,
    })
    adSlotItem.value = (response.items || [])[0] || null
    adImpressionSent.value = false
    await bindAdObserver()
  } catch (error) {
    adSlotItem.value = null
    adSlotError.value = error?.message || 'Failed to load sponsored content.'
  } finally {
    adSlotLoading.value = false
  }
}

const openAdSlot = () => {
  const clickPath = adSlotItem.value?.tracking?.click_url
  const target = adSlotApi.resolveClickUrl(clickPath)
  if (!target) return
  window.location.assign(target)
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

.feed-reminders {
  grid-column: 1;
}

.feed-main {
  grid-column: 2;
}

.feed-rail {
  grid-column: 3;
}

.feed-list.feed-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ad-slot-wrap {
  display: flex;
  justify-content: flex-start;
}

.ad-slot-card {
  width: min(100%, var(--ad-card-width, 320px));
  max-width: var(--ad-card-width, 320px);
  min-height: var(--ad-card-height, 180px);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--neutral-200);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.ad-slot-image {
  width: 100%;
  height: 100%;
}

.ad-slot-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 18%, rgba(0, 0, 0, 0.66) 100%);
  color: #fff;
}

.ad-slot-title {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.2;
}

.ad-slot-summary {
  font-size: 0.74rem;
  opacity: 0.95;
  margin-top: 2px;
  margin-bottom: 6px;
}

.ad-slot-label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  background: rgba(11, 18, 32, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.66rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ad-slot-skeleton {
  width: min(100%, 320px);
  max-width: 320px;
  height: 180px;
  border-radius: 12px;
}

.ad-slot-error {
  width: min(100%, 560px);
  border-radius: 10px;
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
    grid-template-columns: 220px minmax(0, 1fr) 240px;
  }
}

@media (max-width: 768px) {
  .feed-shell {
    grid-template-columns: 1fr;
  }

  .feed-reminders,
  .feed-main,
  .feed-rail {
    grid-column: auto;
  }

  .feed-list.feed-grid {
    gap: 10px;
  }

  .ad-slot-wrap {
    justify-content: center;
  }

  .feed-type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
