import { auth, authStateReady } from 'src/boot/firebase'

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '/api')
  .trim()
  .replace(/\/$/, '')
const TYPES = ['pnl', 'ledger', 'tasks', 'pm_statement']
const failure = (message, status = 0, code = 'REPORT_ERROR') =>
  Object.assign(new Error(message), { status, code })
const aborted = () => new DOMException('Request cancelled.', 'AbortError')

async function request(path, { signal } = {}) {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  signal?.addEventListener('abort', cancel, { once: true })
  if (signal?.aborted) cancel()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    cancel()
  }, 30000)
  let onAbort
  const cancelled = new Promise((_, reject) => {
    onAbort = () =>
      reject(timedOut ? failure('Report request timed out. Please retry.') : aborted())
    if (controller.signal.aborted) onAbort()
    else controller.signal.addEventListener('abort', onAbort, { once: true })
  })
  const run = async () => {
    await authStateReady
    if (controller.signal.aborted) throw aborted()
    const user = auth?.currentUser
    if (!user) throw failure('Please sign in to view reports.', 401, 'AUTH_REQUIRED')
    const token = await user.getIdToken()
    if (controller.signal.aborted) throw aborted()
    if (!token || auth.currentUser !== user)
      throw failure('Your session changed. Please sign in again.', 401, 'AUTH_REQUIRED')
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
    })
    const payload = await response.json().catch(() => null)
    if (response.status === 404) {
      throw failure(
        'The reporting service is not available on this server yet. Please retry after the service has been updated.',
        404,
        'REPORT_API_NOT_DEPLOYED',
      )
    }
    if (!response.ok || payload?.ok === false) {
      const details = payload?.error
      const message = [payload?.message, details?.message, details].find(
        (value) => typeof value === 'string' && value.trim(),
      )
      const fallback =
        response.status === 403
          ? 'You do not have access to this report scope.'
          : response.status === 401
            ? 'Your session expired. Please sign in again.'
            : 'Unable to load this report. Please retry.'
      throw failure(message || fallback, response.status, payload?.error_code || details?.code)
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw failure('The reporting server returned an invalid response. Please retry.')
    if (auth.currentUser !== user)
      throw failure('Your session changed. Please sign in again.', 401, 'AUTH_REQUIRED')
    return payload
  }
  try {
    return await Promise.race([run(), cancelled])
  } catch (error) {
    if (signal?.aborted) throw aborted()
    if (timedOut) throw failure('Report request timed out. Please retry.')
    if (error?.name === 'AbortError' || error?.status !== undefined) throw error
    if (String(error?.code || '').startsWith('auth/'))
      throw failure('Unable to verify your session. Please sign in again.', 401, error.code)
    throw failure('Unable to reach the reporting server. Check your connection and retry.')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
    controller.signal.removeEventListener('abort', onAbort)
  }
}

export async function getReportingOptions({ signal } = {}) {
  const result = await request('/reports/options', { signal })
  if (
    !Array.isArray(result.properties) ||
    !result.account ||
    typeof result.account.id !== 'string' ||
    typeof result.account.label !== 'string' ||
    typeof result.account.can_pm_statement !== 'boolean' ||
    result.properties.some(
      (property) =>
        !property ||
        typeof property.id !== 'string' ||
        typeof property.name !== 'string' ||
        typeof property.can_finance !== 'boolean' ||
        typeof property.can_tasks !== 'boolean' ||
        typeof property.is_owner !== 'boolean',
    )
  )
    throw failure('The reporting server returned invalid scope options. Please retry.')
  return result
}

export async function getWorkspaceReport({ type, property_ids = [], from, to }, { signal } = {}) {
  if (!TYPES.includes(type)) throw failure('Choose a supported report.')
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }
  if (!validDate(from) || !validDate(to) || from > to)
    throw failure('Choose a valid date range with the start on or before the end.')
  if (
    !Array.isArray(property_ids) ||
    property_ids.length > 100 ||
    property_ids.some(
      (id) => typeof id !== 'string' || !id.trim() || id.length > 128 || /[/,]/.test(id),
    )
  )
    throw failure('Choose a valid property scope.')
  if (type !== 'pm_statement' && !property_ids.length)
    throw failure('Select at least one property.')
  const query = new URLSearchParams({ type, from, to })
  // PM identity is server-authenticated; an optional property selection only narrows its flows.
  if (property_ids.length) query.set('property_ids', [...new Set(property_ids)].join(','))
  const result = await request(`/reports/workspace?${query}`, { signal })
  if (
    result.type !== type ||
    result.currency !== 'USD' ||
    !Array.isArray(result.rows) ||
    result.rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row)) ||
    !result.summary ||
    typeof result.summary !== 'object' ||
    !Array.isArray(result.property_totals) ||
    !Array.isArray(result.warnings)
  )
    throw failure('The reporting server returned an invalid report. Please retry.')
  const metrics = [
    'income',
    'expenses',
    'net',
    'inflow',
    'outflow',
    'managementFees',
    'taskCount',
    'openTasks',
    'completedTasks',
  ]
  if (
    metrics.some(
      (key) => typeof result.summary[key] !== 'number' || !Number.isFinite(result.summary[key]),
    ) ||
    !Number.isInteger(result.excluded_count) ||
    result.excluded_count < 0
  )
    throw failure('The reporting server returned invalid totals. Please retry.')
  const moneyKeys =
    type === 'tasks'
      ? []
      : type === 'pm_statement'
        ? ['amount', 'income', 'expense', 'inflow', 'outflow', 'management_fee']
        : ['amount', 'income', 'expense']
  const finite = (value) => typeof value === 'number' && Number.isFinite(value)
  if (
    result.rows.some(
      (row) =>
        !row.id ||
        typeof row.property_name !== 'string' ||
        typeof row.date !== 'string' ||
        moneyKeys.some((key) => !finite(row[key])),
    ) ||
    result.property_totals.some(
      (row) =>
        !row ||
        typeof row.property_name !== 'string' ||
        ['income', 'expenses', 'net'].some((key) => !finite(row[key])),
    ) ||
    result.warnings.some((value) => typeof value !== 'string')
  )
    throw failure('The reporting server returned invalid report rows. Please retry.')
  return result
}

export const reportExportColumns = {
  pnl: ['property_name', 'category', 'income', 'expense'],
  ledger: [
    'property_name',
    'date',
    'category',
    'from',
    'to',
    'amount',
    'income',
    'expense',
    'flow',
    'classification',
    'note',
    'inflow',
    'outflow',
  ],
  tasks: ['property_name', 'date', 'title', 'status', 'completed_at'],
  pm_statement: [
    'property_name',
    'date',
    'category',
    'from',
    'to',
    'amount',
    'management_fee',
    'flow',
    'classification',
    'note',
    'inflow',
    'outflow',
  ],
}

export function groupPnlRows(rows) {
  const groups = new Map()
  for (const row of rows) {
    const group = groups.get(row.category) || {
      id: row.category,
      category: row.category,
      income: 0n,
      expense: 0n,
    }
    group.income += BigInt(Math.round(row.income * 100))
    group.expense += BigInt(Math.round(row.expense * 100))
    groups.set(row.category, group)
  }
  return [...groups.values()].map((row) => ({
    ...row,
    income: Number(row.income) / 100,
    expense: Number(row.expense) / 100,
    net: Number(row.income - row.expense) / 100,
  }))
}

export function reportToCsv(report, { from = '', to = '', scope = '' } = {}) {
  const columns = reportExportColumns[report?.type]
  if (!columns || !Array.isArray(report?.rows)) throw failure('No report is available to export.')
  const cell = (value) => {
    let text = String(value ?? '')
    // Neutralize formulas, including formulas hidden behind whitespace/control bytes.
    const first = [...text].find((char) => !/\s/.test(char) && char.charCodeAt(0) > 31)
    if (typeof value !== 'number' && (text.charCodeAt(0) < 32 || /^[=+@-]$/.test(first || '')))
      text = `'${text}`
    return `"${text.replace(/"/g, '""')}"`
  }
  const lines = [
    ['Report', report.type],
    ['Period', from, to],
    ['Scope', scope],
    ['Currency', report.currency],
    ['Basis', report.basis],
    ['Excluded records', report.excluded_count],
    [],
  ]
  if (report.type === 'pnl') {
    lines.push(
      ['Category', 'Income', 'Expenses', 'Net result'],
      ...groupPnlRows(report.rows).map((row) => [row.category, row.income, row.expense, row.net]),
      ['Total', report.summary.income, report.summary.expenses, report.summary.net],
      [],
      ['Property', 'Income', 'Expenses', 'Net result'],
      ...report.property_totals.map((row) => [
        row.property_name,
        row.income,
        row.expenses,
        row.net,
      ]),
      [],
      ['Transaction detail'],
    )
  }
  lines.push(
    columns,
    ...report.rows.map((row) => columns.map((key) => row[key])),
    [],
    ['Data notes'],
    ...(report.warnings || []).map((warning) => [warning]),
  )
  return lines.map((row) => row.map(cell).join(',')).join('\r\n')
}
