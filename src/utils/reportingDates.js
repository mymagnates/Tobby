// Business dates follow the user's calendar. UTC remains appropriate for audit timestamps.
export function localCalendarDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function reportingPeriod(period, now = new Date()) {
  if (period === 'custom') return null
  const year = now.getFullYear()
  const month = now.getMonth()
  if (period === 'year')
    return { from: localCalendarDate(new Date(year, 0, 1)), to: localCalendarDate(now) }
  if (!['month', 'last_month'].includes(period)) throw new Error('Unsupported report period')
  const selectedMonth = month - Number(period === 'last_month')
  return {
    from: localCalendarDate(new Date(year, selectedMonth, 1)),
    to: localCalendarDate(new Date(year, selectedMonth + 1, 0)),
  }
}
