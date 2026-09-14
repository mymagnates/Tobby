// Recorded cash activity only: not an accrual, tax, or double-entry general ledger.
export const REPORT_TRANSACTION_CATEGORIES = Object.freeze([
  'rental_income',
  'management_fee',
  'maintenance',
  'utilities',
  'insurance',
  'property_tax',
  'hoa',
  'other_income',
  'other_expense',
  'security_deposit',
  'owner_contribution',
  'owner_distribution',
  'transfer',
  'reimbursement',
  'unclassified',
])

const BASIS = 'Recorded transactions; property-level amounts, not ownership shares.'
const INCOME = new Set(['rental_income', 'other_income'])
const EXPENSE = new Set([
  'management_fee',
  'maintenance',
  'utilities',
  'insurance',
  'property_tax',
  'hoa',
  'other_expense',
])
const LEGACY = new Map([
  ['Rent', 'rental_income'],
  ['Deposit', 'security_deposit'],
  ['Tax', 'property_tax'],
  ['Insurance', 'insurance'],
  ['Utility', 'utilities'],
  ['Maintenance', 'maintenance'],
  ['Labor', 'maintenance'],
  ['HOA', 'hoa'],
])
const MONEY_KEYS = ['income', 'expenses', 'net', 'inflow', 'outflow', 'managementFees']
const MAX_CENTS = BigInt(Number.MAX_SAFE_INTEGER)
const text = (value) => (typeof value === 'string' ? value.trim() : '')
const periodError = (message) =>
  Object.assign(new RangeError(message), {
    status: 400,
    code: 'INVALID_REPORT_PERIOD',
  })

function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1] ? value : null
}

/** Optional bounds are inclusive YYYY-MM-DD calendar dates; malformed bounds throw. */
export function parseReportPeriod({ from, to } = {}) {
  const result = { from: null, to: null }
  for (const [key, value] of Object.entries({ from, to })) {
    if (value === undefined || value === null || value === '') continue
    if (!calendarDate(value)) throw periodError(`${key} must be a valid YYYY-MM-DD date`)
    result[key] = value
  }
  if (result.from && result.to && result.from > result.to) {
    throw periodError('from must be on or before to')
  }
  return result
}

function taskDate(value) {
  if (calendarDate(value)) return value
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(
      value,
    )
  )
    return null
  return Number.isFinite(Date.parse(value)) ? calendarDate(value.slice(0, 10)) : null
}

function inPeriod(date, period) {
  return (!period.from || date >= period.from) && (!period.to || date <= period.to)
}

function cents(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const raw = String(value).trim()
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || raw.length > 32) return null
  const [whole, fraction = ''] = raw.split('.')
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  return result > 0n && safeMoney(result) ? result : null
}

function safeMoney(value) {
  const absolute = value < 0n ? -value : value
  if (absolute > MAX_CENTS) return false
  // JSON serializes Number.toString(), not toFixed(): verify that round trip too.
  const serialized = String(Number(absolute) / 100)
  if (!/^\d+(?:\.\d{1,2})?$/.test(serialized)) return false
  const [whole, fraction = ''] = serialized.split('.')
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')) === absolute
}

export const isValidReportAmount = (value) => cents(value) !== null

const dollars = (value) => Number(value) / 100
const emptyMoney = () => Object.fromEntries(MONEY_KEYS.map((key) => [key, 0n]))

function propertyIndex(properties) {
  if (!Array.isArray(properties)) throw new TypeError('properties must be an array')
  const result = new Map()
  for (const property of properties) {
    const id = text(property?.id) || text(property?.property_id)
    if (!id) continue
    const address = property?.address
    result.set(
      id,
      text(property.property_name) ||
        text(property.nickname) ||
        text(property.displayName) ||
        text(property.name) ||
        text(address) ||
        text(address?.line1) ||
        text(address?.street) ||
        id,
    )
  }
  return result
}

function createReport(type, properties) {
  return {
    result: {
      type,
      basis: BASIS,
      summary: { ...emptyMoney(), taskCount: 0, openTasks: 0, completedTasks: 0 },
      rows: [],
      property_totals: [],
      warnings: [],
      excluded_count: 0,
      currency: 'USD',
    },
    totals: new Map(
      [...properties].map(([id, name]) => [
        id,
        {
          property_id: id,
          property_name: name,
          income: 0n,
          expenses: 0n,
          net: 0n,
        },
      ]),
    ),
    ids: new Set(),
  }
}

function warn(state, label, reason, excluded = true) {
  state.result.warnings.push(`${label}: ${reason}`)
  if (excluded) state.result.excluded_count += 1
}

function rowIdentity(record, index) {
  const propertyId = text(record?.property_id)
  const sourceId = text(record?.id) || text(record?.transac_id) || text(record?.mx_id)
  // Tuple encoding avoids collisions between delimiter-containing nested IDs.
  return {
    propertyId,
    id: JSON.stringify(sourceId ? [propertyId, sourceId] : [propertyId, null, index]),
  }
}

function categoryOf(record) {
  const explicit = record.financial_category
  if (explicit !== undefined && explicit !== null && explicit !== '') {
    return REPORT_TRANSACTION_CATEGORIES.includes(explicit) ? explicit : 'unclassified'
  }
  return LEGACY.get(record.transac_type) || 'unclassified'
}

function propertyAmounts(category, amount, refund) {
  const signed = refund ? -amount : amount
  const income = INCOME.has(category) ? signed : 0n
  const expenses = EXPENSE.has(category) ? signed : 0n
  return {
    ...emptyMoney(),
    income,
    expenses,
    net: income - expenses,
    inflow: (income > 0n ? income : 0n) + (expenses < 0n ? -expenses : 0n),
    outflow: (expenses > 0n ? expenses : 0n) + (income < 0n ? -income : 0n),
    managementFees: category === 'management_fee' ? signed : 0n,
  }
}

function accountAmounts(category, amount, refund, incoming, outgoing) {
  const money = emptyMoney()
  if (incoming && outgoing) return money
  money.inflow = incoming ? amount : 0n
  money.outflow = outgoing ? amount : 0n
  // Property rent/repairs may be custodial funds, not PM business revenue/costs.
  // Only explicitly earned management fees (net of refunds) establish income here.
  if (category === 'management_fee' && incoming && !refund) money.managementFees = amount
  if (category === 'management_fee' && outgoing && refund) money.managementFees = -amount
  money.income = money.managementFees
  money.net = money.income - money.expenses
  return money
}

function accumulate(state, propertyId, propertyName, money, label) {
  const total = state.totals.get(propertyId) || {
    property_id: propertyId,
    property_name: propertyName,
    income: 0n,
    expenses: 0n,
    net: 0n,
  }
  const summary = state.result.summary
  if (
    MONEY_KEYS.some((key) => !safeMoney(summary[key] + money[key])) ||
    ['income', 'expenses', 'net'].some((key) => !safeMoney(total[key] + money[key]))
  ) {
    warn(state, label, 'amount would exceed safe monetary totals; record excluded')
    return false
  }
  for (const key of MONEY_KEYS) summary[key] += money[key]
  for (const key of ['income', 'expenses', 'net']) total[key] += money[key]
  state.totals.set(propertyId, total)
  return true
}

function addTransactions(state, transactions, properties, period, accountId) {
  if (!Array.isArray(transactions)) throw new TypeError('transactions must be an array')
  const statement = accountId !== undefined
  transactions.forEach((record, index) => {
    const { propertyId, id } = rowIdentity(record, index)
    const label = `Transaction ${id}`
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      warn(state, label, 'invalid record; excluded')
      return
    }
    const incoming = text(record.to_account_id) === accountId
    const outgoing = text(record.from_account_id) === accountId
    if (statement && !incoming && !outgoing) {
      warn(state, label, 'no explicit account match; legacy roles are not account identity')
      return
    }
    if (!statement && !properties.has(propertyId)) {
      warn(state, label, 'property is not in the supplied report scope')
      return
    }
    const date = calendarDate(record.transac_date)
    if (!date) {
      warn(state, label, 'invalid or missing transaction date; excluded')
      return
    }
    if (!inPeriod(date, period)) return
    if (record.currency !== undefined && record.currency !== 'USD') {
      warn(state, label, 'invalid or unsupported currency; only USD is supported')
      return
    }
    const amount = cents(record.amount)
    if (amount === null) {
      warn(state, label, 'amount must be positive, cents-exact, and safely representable; excluded')
      return
    }
    if (state.ids.has(id)) {
      warn(state, label, 'duplicate record within property; excluded')
      return
    }
    state.ids.add(id)
    const category = categoryOf(record)
    const classification = INCOME.has(category)
      ? 'income'
      : EXPENSE.has(category)
        ? 'expense'
        : category === 'unclassified'
          ? 'unclassified'
          : 'non_operating'
    if (classification === 'unclassified') {
      warn(
        state,
        label,
        'unclassified transaction; excluded from P&L, retained in ledger/statement',
        false,
      )
    }
    if (state.result.type === 'pnl' && !['income', 'expense'].includes(classification)) {
      state.result.excluded_count += 1
      return
    }
    const refund = record.transac_type === 'Refund'
    const money = statement
      ? accountAmounts(category, amount, refund, incoming, outgoing)
      : propertyAmounts(category, amount, refund)
    const propertyName =
      properties.get(propertyId) || text(record.property_name) || propertyId || 'Unassigned'
    if (!accumulate(state, propertyId, propertyName, money, label)) return
    const flow = statement
      ? incoming && outgoing
        ? 'internal'
        : incoming
          ? 'inflow'
          : 'outflow'
      : money.income > 0n || money.expenses < 0n
        ? 'inflow'
        : money.expenses > 0n || money.income < 0n
          ? 'outflow'
          : 'unclassified'
    const row = {
      id,
      property_id: propertyId,
      property_name: propertyName,
      date,
      category,
      from: text(record.from_account_id) || text(record.transac_from),
      to: text(record.to_account_id) || text(record.transac_to),
      amount: dollars(amount),
      income: dollars(money.income),
      expense: dollars(money.expenses),
      flow,
      classification:
        statement && category !== 'unclassified'
          ? money.income !== 0n
            ? 'income'
            : money.expenses !== 0n
              ? 'expense'
              : 'non_operating'
          : classification,
      note: text(record.note),
    }
    if (statement)
      Object.assign(row, {
        inflow: dollars(money.inflow),
        outflow: dollars(money.outflow),
        management_fee: dollars(money.managementFees),
      })
    state.result.rows.push(row)
  })
}

function addTasks(state, tasks, properties, period) {
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array')
  tasks.forEach((task, index) => {
    const { propertyId, id } = rowIdentity(task, index)
    const label = `Task ${id}`
    if (!task || typeof task !== 'object' || Array.isArray(task) || !properties.has(propertyId)) {
      warn(state, label, 'invalid task or property outside supplied report scope')
      return
    }
    const date = taskDate(task.date ?? task.report_date ?? task.created_at)
    if (!date) {
      warn(state, label, 'invalid or missing task date; excluded')
      return
    }
    if (!inPeriod(date, period)) return
    if (state.ids.has(id)) {
      warn(state, label, 'duplicate task within property; excluded')
      return
    }
    state.ids.add(id)
    let completedAt = task.completed_at ?? null
    if (completedAt !== null && !taskDate(completedAt)) {
      warn(state, label, 'invalid completion date; omitted', false)
      completedAt = null
    }
    const status = text(task.status) || text(task.task_status) || 'unknown'
    const normalized = status.toLowerCase()
    const completed = ['completed', 'closed', 'done', 'resolved'].includes(normalized)
    const open = [
      'open',
      'pending',
      'in_progress',
      'in progress',
      'assigned',
      'scheduled',
      'paused',
    ].includes(normalized)
    if (!completed && !open && !['cancel', 'cancelled', 'canceled'].includes(normalized)) {
      warn(state, label, 'unknown status; not counted as open or completed', false)
    }
    state.result.summary.taskCount += 1
    state.result.summary.openTasks += Number(open)
    state.result.summary.completedTasks += Number(completed)
    state.result.rows.push({
      id,
      property_id: propertyId,
      property_name: properties.get(propertyId),
      date,
      title: text(task.title) || text(task.task_title) || text(task.description) || 'Untitled task',
      status,
      completed_at: completedAt,
    })
  })
}

function finish(state) {
  const result = state.result
  for (const key of MONEY_KEYS) result.summary[key] = dollars(result.summary[key])
  result.property_totals = [...state.totals.values()]
    .map((total) => ({
      ...total,
      income: dollars(total.income),
      expenses: dollars(total.expenses),
      net: dollars(total.net),
    }))
    .sort((a, b) => a.property_id.localeCompare(b.property_id))
  result.rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  return result
}

/** Properties are the caller-authorized scope; no ownership proration or role inference. */
export function buildPropertyReport({
  type,
  properties = [],
  transactions = [],
  tasks = [],
  from,
  to,
}) {
  if (!['pnl', 'ledger', 'tasks'].includes(type))
    throw new RangeError('Unsupported property report type')
  const period = parseReportPeriod({ from, to })
  const lookup = propertyIndex(properties)
  const state = createReport(type, lookup)
  if (type === 'tasks') addTasks(state, tasks, lookup, period)
  else addTransactions(state, transactions, lookup, period)
  return finish(state)
}

/** Properties label rows, not account scope. Adapters authorize the supplied transactions.
 * Net represents known management fees only, never a PM company P&L.
 * Inflow/outflow include custodial and other non-profit cash movements.
 * Dates outside the period are ordinary filters, not excluded data-quality records.
 */
export function buildPmStatement({
  accountId,
  accountLabel,
  transactions = [],
  properties = [],
  from,
  to,
}) {
  if (!text(accountId)) throw new TypeError('accountId must be an explicit non-empty account ID')
  const period = parseReportPeriod({ from, to })
  const lookup = propertyIndex(properties)
  const state = createReport('pm_statement', new Map())
  state.result.basis =
    'Actual account cash movements; only explicit management fees net of refunds are earned income. Not a company P&L.'
  // Label is display-only and can never substitute for account identity.
  void accountLabel
  addTransactions(state, transactions, lookup, period, text(accountId))
  return finish(state)
}
