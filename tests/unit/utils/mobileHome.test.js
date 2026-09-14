import { describe, expect, it } from 'vitest'
import {
  buildMobileAttention,
  isAttentionOpen,
  mobileAttachmentUrl,
  mobileCalendarDate,
  mobileDueDate,
  mobileTaskLocation,
  safeMobileReturnTo,
} from '../../../src/utils/mobileHome'

const now = new Date(2026, 8, 11, 12)
const properties = [{ id: 'p1' }, { id: 'p2' }]
const task = (id, extra = {}) => ({ id, property_id: 'p1', status: 'open', ...extra })

describe('mobile attention queue', () => {
  it('orders urgent, oldest overdue, then today, with stable IDs', () => {
    const rows = buildMobileAttention({
      now,
      properties,
      tasks: [
        task('today-z', { due_date: '2026-09-11' }),
        task('future', { due_date: '2026-09-12' }),
        task('undated'),
        task('overdue', { due_date: '2026-09-10' }),
        task('oldest', { due_date: '2026-08-01' }),
        task('urgent', { priority: 'Urgent' }),
        task('today-a', { due_date: '2026-09-11' }),
      ],
      reminders: [task('reminder', { due_date: '2026-09-09', status: true })],
    })
    expect(rows.map((row) => row.id)).toEqual([
      'urgent',
      'oldest',
      'reminder',
      'overdue',
      'today-a',
      'today-z',
    ])
    expect(rows.slice(0, 5)).toHaveLength(5)
    expect(rows.filter((row) => row.attention.overdue)).toHaveLength(3)
  })

  it.each([
    'closed',
    'Completed',
    'complete',
    'done',
    'resolved',
    'cancel',
    'cancelled',
    'canceled',
    'dismissed',
    'inactive',
    false,
  ])('excludes terminal status %s', (status) => {
    expect(isAttentionOpen({ status })).toBe(false)
  })

  it('excludes completed booleans and inaccessible properties', () => {
    const rows = buildMobileAttention({
      now,
      properties,
      property: 'p2',
      tasks: [
        task('p1', { priority: 'urgent' }),
        task('p2', { property_id: { id: 'p2' }, priority: 'urgent' }),
        task('denied', { property_id: 'secret', priority: 'urgent' }),
        task('completed', { property_id: 'p2', completed: true, priority: 'urgent' }),
      ],
    })
    expect(rows.map((row) => row.id)).toEqual(['p2'])
    expect(buildMobileAttention({ now, properties: [], tasks: rows })).toEqual([])
  })

  it('uses local calendar boundaries and rejects invalid/absent dates', () => {
    expect(mobileCalendarDate('2026-09-11')).toEqual(new Date(2026, 8, 11))
    expect(mobileCalendarDate('2026-02-30')).toBeNull()
    expect(mobileCalendarDate('bad')).toBeNull()
    expect(mobileCalendarDate(null)).toBeNull()
    const timestamp = new Date(2026, 8, 11, 0, 1)
    expect(mobileCalendarDate({ seconds: timestamp.getTime() / 1000 })).toEqual(
      new Date(2026, 8, 11),
    )
    expect(mobileCalendarDate({ toDate: () => timestamp })).toEqual(new Date(2026, 8, 11))
    expect(timestamp.getHours()).toBe(0)
    expect(timestamp.getMinutes()).toBe(1)
    const rows = [task('boundary', { due_date: '2026-09-11' })]
    expect(
      buildMobileAttention({ properties, tasks: rows, now: new Date(2026, 8, 10, 23, 59) }),
    ).toHaveLength(0)
    expect(
      buildMobileAttention({ properties, tasks: rows, now: new Date(2026, 8, 11, 0, 1) })[0]
        .attention.label,
    ).toBe('Today')
  })

  it('uses reminder start dates and Web recurrence rules without inventing task due dates', () => {
    expect(mobileDueDate({ start_date: '2026-09-11' }, 'reminders', now)).toEqual(
      new Date(2026, 8, 11),
    )
    expect(
      mobileDueDate({ start_date: '2026-09-11', report_date: '2026-09-01' }, 'tasks', now),
    ).toBeNull()
    expect(
      mobileDueDate({ due_date: '2026-09-01', repeat_by: 'weekly' }, 'reminders', now),
    ).toEqual(new Date(2026, 8, 15))
    expect(
      mobileDueDate(
        { due_date: '2026-09-01', repeat_unit: 'days', repeat_every: 2 },
        'reminders',
        now,
      ),
    ).toEqual(new Date(2026, 8, 11))
  })
})

describe('mobile navigation and attachments', () => {
  it.each([
    '//evil.test',
    'https://evil.test',
    '/mobile/pm/home/../create',
    '/mobile/pm/task/p/t',
    '/sp-leads',
    '/mobile/pm/home\\evil',
    [' /mobile/pm/home'],
  ])('rejects unsafe return paths %s', (input) => {
    expect(safeMobileReturnTo(input)).toBe('/mobile/pm/manage')
  })
  it('preserves list context and safely encodes task/property identifiers', () => {
    const source =
      '/mobile/pm/manage?property=p1&type=tasks&filter=attention&search=water&scroll=420&returnTo=%2Fmobile%2Fpm%2Fhome%3Fproperty%3Dp1'
    expect(safeMobileReturnTo(source)).toBe(source)
    expect(mobileTaskLocation(task('task/a', { property_id: 'property/b' }), source)).toEqual({
      path: '/mobile/pm/task/property%2Fb/task%2Fa',
      query: { returnTo: source },
    })
    expect(mobileTaskLocation({}, source)).toBeNull()
  })
  it('prefers valid picture_url and rejects unsafe legacy attachments', () => {
    expect(
      mobileAttachmentUrl({
        picture_url: 'https://example.test/photo.png',
        file_url: 'https://example.test/file.pdf',
      }),
    ).toBe('https://example.test/photo.png')
    expect(
      mobileAttachmentUrl({
        picture_url: 'javascript:alert(1)',
        file_url: 'https://example.test/file.pdf',
      }),
    ).toBe('https://example.test/file.pdf')
    expect(
      mobileAttachmentUrl({
        picture_url: 'https://user:pass@example.test/photo.png',
        url: 'data:image/png;base64,AAAA',
      }),
    ).toBeUndefined()
  })
})
