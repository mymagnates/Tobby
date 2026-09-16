const terminalStatuses = new Set([
  'closed',
  'complete',
  'completed',
  'done',
  'resolved',
  'cancel',
  'canceled',
  'cancelled',
  'dismissed',
  'inactive',
  'false',
])

export const recordPropertyId = (record) => {
  const value = record?.property_id || record?.property_string_id
  return typeof value === 'object' ? value?.id : value
}

export function isAttentionOpen(record) {
  return (
    record.status !== false &&
    record.completed !== true &&
    !terminalStatuses.has(
      String(record.status ?? '')
        .trim()
        .toLowerCase(),
    )
  )
}

// Form date fields are calendar dates, not UTC instants. Timestamps use local time.
export function mobileCalendarDate(value) {
  if (value === undefined || value === null || value === '') return null
  let date
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return null
  } else if (typeof value?.toDate === 'function') date = value.toDate()
  else if (typeof value?.seconds === 'number') date = new Date(value.seconds * 1000)
  else date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date
}

export function mobileDueDate(record, type, now = new Date()) {
  const due = mobileCalendarDate(record.due_date)
  if (type !== 'reminders') return due
  const start = mobileCalendarDate(record.start_date)
  const legacyUnits = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }
  const rawUnit = String(record.repeat_unit || '').toLowerCase()
  const unit = rawUnit ? rawUnit.replace(/s$/, '') + 's' : legacyUnits[record.repeat_by]
  if (!['days', 'weeks', 'months', 'years'].includes(unit)) return due || start
  const interval = Number(record.repeat_every || record.repeat_interval || 1)
  const every = Number.isFinite(interval) ? Math.max(1, Math.floor(interval)) : 1
  const today = mobileCalendarDate(now)
  // Match the existing Web recurrence rule; never substitute creation/report dates.
  const candidates = [due, start].filter(Boolean).map((base) => {
    const next = new Date(base)
    let guard = 0
    while (next < today && guard++ < 1000) {
      if (unit === 'days') next.setDate(next.getDate() + every)
      if (unit === 'weeks') next.setDate(next.getDate() + every * 7)
      if (unit === 'months') next.setMonth(next.getMonth() + every)
      if (unit === 'years') next.setFullYear(next.getFullYear() + every)
    }
    return next
  })
  return candidates.sort((a, b) => a - b)[0] || null
}

export function buildMobileAttention({
  tasks = [],
  reminders = [],
  properties = [],
  property = '',
  now = new Date(),
}) {
  const allowed = new Set(properties.map((row) => row.id))
  const today = mobileCalendarDate(now)
  const recentStart = new Date(today)
  recentStart.setDate(recentStart.getDate() - 6)
  const upcomingEnd = new Date(today)
  upcomingEnd.setDate(upcomingEnd.getDate() + 7)
  return [
    ...tasks.map((row) => ({ ...row, type: 'tasks' })),
    ...reminders.map((row) => ({ ...row, type: 'reminders' })),
  ]
    .filter(
      (row) =>
        allowed.has(recordPropertyId(row)) &&
        (!property || recordPropertyId(row) === property) &&
        isAttentionOpen(row),
    )
    .map((row) => {
      const due = mobileDueDate(row, row.type, now)
      const urgent =
        row.type === 'tasks' &&
        ['urgent', 'emergency', 'critical'].includes(
          String(row.priority || row.urgency || '')
            .trim()
            .toLowerCase(),
        )
      const overdue = Boolean(due && due < today)
      const dueToday = Boolean(due && due.getTime() === today.getTime())
      const created = mobileCalendarDate(row.created_at || row.created_datetime || row.report_date)
      const recentTask = row.type === 'tasks' && Boolean(created && created >= recentStart && created <= today)
      const upcoming = row.type === 'reminders' && Boolean(due && due > today && due <= upcomingEnd)
      return {
        ...row,
        attention: {
          due,
          overdue,
          dueToday,
          urgent,
          recentTask,
          upcoming,
          rank: urgent ? 0 : overdue ? 1 : dueToday ? 2 : upcoming ? 3 : recentTask ? 4 : 5,
          label: urgent ? 'Urgent' : overdue ? 'Overdue' : dueToday ? 'Today' : upcoming ? 'Due soon' : recentTask ? 'Recent task' : '',
        },
      }
    })
    .filter((row) => row.attention.rank < 5)
    .sort(
      (a, b) =>
        a.attention.rank - b.attention.rank ||
        (a.attention.due?.getTime() ?? Infinity) - (b.attention.due?.getTime() ?? Infinity) ||
        String(a.id).localeCompare(String(b.id)) ||
        `${recordPropertyId(a)}:${a.type}`.localeCompare(`${recordPropertyId(b)}:${b.type}`),
    )
}

export function safeMobileReturnTo(value, fallback = '/mobile/pm/manage', depth = 0) {
  if (typeof value !== 'string' || value.includes('\\') || [...value].some((char) => char.charCodeAt(0) < 32)) return fallback
  const [path] = value.split(/[?#]/)
  if (!/^\/mobile\/pm\/(home|property|manage|records|account)$/.test(path)) return fallback
  const url = new URL(value, 'https://mobile.invalid')
  const query = new URLSearchParams()
  for (const key of ['property', 'type', 'filter', 'search']) {
    const entry = url.searchParams.get(key)
    if (entry) query.set(key, entry)
  }
  const scroll = Number(url.searchParams.get('scroll'))
  if (Number.isFinite(scroll) && scroll > 0)
    query.set('scroll', String(Math.min(Math.round(scroll), 1000000)))
  const parent = url.searchParams.get('returnTo')
  if (parent && depth < 2)
    query.set('returnTo', safeMobileReturnTo(parent, '/mobile/pm/home', depth + 1))
  return `${path}${query.size ? `?${query}` : ''}`
}

export function mobileTaskLocation(record, returnTo) {
  const property = recordPropertyId(record)
  if (!property || !record.id) return null
  return {
    path: `/mobile/pm/task/${encodeURIComponent(property)}/${encodeURIComponent(record.id)}`,
    query: { returnTo: safeMobileReturnTo(returnTo) },
  }
}

export function mobileAttachmentUrl(record) {
  for (const value of [record?.picture_url, record?.file_url, record?.url]) {
    if (typeof value !== 'string' || !/^https:\/\//i.test(value)) continue
    try {
      const url = new URL(value)
      if (url.hostname && !url.username && !url.password) return url.href
    } catch {
      /* Ignore malformed legacy attachments. */
    }
  }
  return undefined
}
