import { describe, expect, it } from 'vitest'
import {
  buildPropertyReport,
  buildPmStatement,
  parseReportPeriod,
  REPORT_TRANSACTION_CATEGORIES,
} from '../../../backend/reporting.js'

const properties = [
  { id: 'p1', name: 'First property', ownership_share: 0.25 },
  { id: 'p2', nickname: 'Second property' },
]
const transaction = (overrides = {}) => ({
  id: 't1',
  property_id: 'p1',
  transac_date: '2026-09-09',
  transac_type: 'Rent',
  transac_from: 'tt',
  transac_to: 'pm',
  amount: 100,
  ...overrides,
})
const report = (transactions = [], overrides = {}) =>
  buildPropertyReport({
    type: 'pnl',
    properties,
    transactions,
    ...overrides,
  })
const statement = (transactions = [], overrides = {}) =>
  buildPmStatement({
    accountId: 'pm-current',
    accountLabel: 'Current PM',
    properties,
    transactions,
    ...overrides,
  })
const task = (overrides = {}) => ({
  id: 'task1',
  property_id: 'p1',
  title: 'Repair sink',
  report_date: '2026-09-09',
  status: 'open',
  ...overrides,
})
const tasksReport = (tasks = [], overrides = {}) =>
  report([], { type: 'tasks', tasks, ...overrides })
const zeroSummary = {
  income: 0,
  expenses: 0,
  net: 0,
  inflow: 0,
  outflow: 0,
  managementFees: 0,
  taskCount: 0,
  openTasks: 0,
  completedTasks: 0,
}
const categories = [
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
]

describe('reporting contract and periods', () => {
  it('exports the exact immutable canonical enum', () => {
    expect(REPORT_TRANSACTION_CATEGORIES).toEqual(categories)
    expect(Object.isFrozen(REPORT_TRANSACTION_CATEGORIES)).toBe(true)
  })

  it.each(['pnl', 'ledger', 'tasks'])('returns the shared empty %s envelope', (type) => {
    expect(report([], { type, properties: [] })).toEqual({
      type,
      basis: 'Recorded transactions; property-level amounts, not ownership shares.',
      summary: zeroSummary,
      rows: [],
      property_totals: [],
      warnings: [],
      excluded_count: 0,
      currency: 'USD',
    })
  })

  it('returns the same envelope for an empty PM account statement', () => {
    expect(statement()).toEqual({
      type: 'pm_statement',
      basis:
        'Actual account cash movements; only explicit management fees net of refunds are earned income. Not a company P&L.',
      summary: zeroSummary,
      rows: [],
      property_totals: [],
      warnings: [],
      excluded_count: 0,
      currency: 'USD',
    })
  })

  it('supports omitted and one-sided bounds', () => {
    expect(parseReportPeriod()).toEqual({ from: null, to: null })
    expect(parseReportPeriod({ from: '', to: null })).toEqual({ from: null, to: null })
    expect(parseReportPeriod({ from: '2024-02-29' })).toEqual({ from: '2024-02-29', to: null })
    expect(parseReportPeriod({ to: '2000-02-29' })).toEqual({ from: null, to: '2000-02-29' })
  })

  it.each([
    '2026-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-01-00',
    '0000-01-01',
    '09/09/2026',
    '2026-9-9',
    '2026-09-09T12:00:00Z',
    ' 2026-09-09',
    ' ',
    42,
    {},
    new Date('2026-09-09'),
  ])('rejects invalid bound %s', (value) => {
    expect(() => parseReportPeriod({ from: value })).toThrow(RangeError)
    expect(() => parseReportPeriod({ to: value })).toThrow(RangeError)
  })

  it('rejects reversed periods and unsupported report types', () => {
    expect(() => report([], { from: '2026-09-10', to: '2026-09-09' })).toThrow(/on or before/)
    expect(() => statement([], { from: 'yesterday' })).toThrow(RangeError)
    expect(() => report([], { type: 'gl' })).toThrow(/Unsupported/)
  })

  it('filters both endpoints inclusively without counting normal date filters as exclusions', () => {
    const transactions = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'].map((date) =>
      transaction({ id: date, transac_date: date }),
    )
    const result = report(transactions, { from: '2026-09-09', to: '2026-09-10' })
    expect(result.rows.map((row) => row.date)).toEqual(['2026-09-09', '2026-09-10'])
    expect(result.summary.income).toBe(200)
    expect(result.excluded_count).toBe(0)
    expect(result.warnings).toEqual([])
    expect(report(transactions, { from: '2026-09-11' }).rows).toHaveLength(1)
    expect(report(transactions, { to: '2026-09-08' }).rows).toHaveLength(1)
  })

  it('rejects malformed collections instead of claiming an empty successful report', () => {
    expect(() => report(null)).toThrow(TypeError)
    expect(() => report([], { properties: {} })).toThrow(TypeError)
    expect(() => tasksReport(null)).toThrow(TypeError)
  })
})

describe('property P&L and recorded ledger', () => {
  it('provides full property amounts and cross-property totals, never ownership shares', () => {
    const transactions = [
      transaction({ amount: '1200.25' }),
      transaction({ id: 'cost', transac_type: 'Maintenance', amount: '100.15' }),
      transaction({ property_id: 'p2', amount: '900.10' }),
    ]
    const owner = report(transactions)
    const pm = report(transactions.map((row) => ({ ...row, transac_from: 'pm', transac_to: 'po' })))
    expect(owner.summary).toEqual({
      ...zeroSummary,
      income: 2100.35,
      expenses: 100.15,
      net: 2000.2,
      inflow: 2100.35,
      outflow: 100.15,
    })
    expect(pm.summary).toEqual(owner.summary)
    expect(pm.property_totals).toEqual(owner.property_totals)
    expect(owner.property_totals).toEqual([
      {
        property_id: 'p1',
        property_name: 'First property',
        income: 1200.25,
        expenses: 100.15,
        net: 1100.1,
      },
      {
        property_id: 'p2',
        property_name: 'Second property',
        income: 900.1,
        expenses: 0,
        net: 900.1,
      },
    ])
  })

  it.each([
    ['Rent', 'rental_income', 'income'],
    ['Tax', 'property_tax', 'expense'],
    ['Insurance', 'insurance', 'expense'],
    ['Utility', 'utilities', 'expense'],
    ['Maintenance', 'maintenance', 'expense'],
    ['Labor', 'maintenance', 'expense'],
    ['HOA', 'hoa', 'expense'],
  ])('infers only clear legacy %s', (transac_type, category, classification) => {
    const result = report([transaction({ transac_type })])
    expect(result.rows[0]).toMatchObject({ category, classification })
    expect(result.summary[classification === 'income' ? 'income' : 'expenses']).toBe(100)
    expect(result.warnings).toEqual([])
  })

  it.each(['Fee', 'Refund', 'Other', 'Surprise', undefined])(
    'never infers ambiguous %s from PM roles',
    (transac_type) => {
      const input = [transaction({ transac_type, transac_from: 'po', transac_to: 'pm' })]
      const pnl = report(input)
      expect(pnl.rows).toEqual([])
      expect(pnl.summary).toEqual(zeroSummary)
      expect(pnl.excluded_count).toBe(1)
      expect(pnl.warnings.join(' ')).toMatch(/unclassified/)
      const ledger = report(input, { type: 'ledger' })
      expect(ledger.rows[0]).toMatchObject({
        category: 'unclassified',
        amount: 100,
        income: 0,
        expense: 0,
      })
      expect(ledger.excluded_count).toBe(0)
      expect(ledger.warnings).toHaveLength(1)
    },
  )

  it.each(categories)(
    'honors explicit canonical category %s over legacy type',
    (financial_category) => {
      const result = report([transaction({ transac_type: 'Other', financial_category })], {
        type: 'ledger',
      })
      expect(result.rows[0].category).toBe(financial_category)
    },
  )

  it.each(['invalid', 'Management_Fee', {}, 123, 'unclassified'])(
    'does not fall back from explicit invalid/unclassified category %s to Rent',
    (financial_category) => {
      const result = report([transaction({ financial_category })])
      expect(result.summary.income).toBe(0)
      expect(result.excluded_count).toBe(1)
      expect(result.warnings.join(' ')).toMatch(/unclassified/)
    },
  )

  it.each([
    'security_deposit',
    'owner_contribution',
    'owner_distribution',
    'transfer',
    'reimbursement',
  ])('retains %s without automatic profit', (financial_category) => {
    const input = [transaction({ financial_category })]
    expect(report(input).summary).toEqual(zeroSummary)
    expect(report(input).excluded_count).toBe(1)
    const ledger = report(input, { type: 'ledger' })
    expect(ledger.rows[0]).toMatchObject({
      category: financial_category,
      classification: 'non_operating',
      income: 0,
      expense: 0,
    })
    expect(ledger.summary).toEqual(zeroSummary)
    expect(ledger.excluded_count).toBe(0)
  })

  it('infers a legacy deposit as a non-operating security deposit', () => {
    expect(
      report([transaction({ transac_type: 'Deposit' })], { type: 'ledger' }).rows[0],
    ).toMatchObject({ category: 'security_deposit', classification: 'non_operating', income: 0 })
  })

  it('reverses explicitly categorized refunds with positive recorded amounts', () => {
    const result = report([
      transaction({ amount: 1000 }),
      transaction({
        id: 'rent-refund',
        transac_type: 'Refund',
        financial_category: 'rental_income',
        amount: 100,
      }),
      transaction({ id: 'repair', transac_type: 'Maintenance', amount: 200 }),
      transaction({
        id: 'repair-refund',
        transac_type: 'Refund',
        financial_category: 'maintenance',
        amount: 25,
      }),
      transaction({ id: 'fee', financial_category: 'management_fee', amount: 80 }),
      transaction({
        id: 'fee-refund',
        transac_type: 'Refund',
        financial_category: 'management_fee',
        amount: 10,
      }),
    ])
    expect(result.summary).toEqual({
      ...zeroSummary,
      income: 900,
      expenses: 245,
      net: 655,
      inflow: 1035,
      outflow: 380,
      managementFees: 70,
    })
    expect(result.rows.find((row) => row.id.includes('rent-refund'))).toMatchObject({
      amount: 100,
      income: -100,
      expense: 0,
      flow: 'outflow',
    })
    expect(result.rows.find((row) => row.id.includes('repair-refund'))).toMatchObject({
      amount: 25,
      income: 0,
      expense: -25,
      flow: 'inflow',
    })
  })

  it('emits the exact ledger row shape, preserving endpoints and notes', () => {
    const result = report([transaction({ note: 'September rent' })], { type: 'ledger' })
    expect(result.rows[0]).toEqual({
      id: '["p1","t1"]',
      property_id: 'p1',
      property_name: 'First property',
      date: '2026-09-09',
      category: 'rental_income',
      from: 'tt',
      to: 'pm',
      amount: 100,
      income: 100,
      expense: 0,
      flow: 'inflow',
      classification: 'income',
      note: 'September rent',
    })
  })

  it('preserves nested IDs across properties and excludes true same-property duplicates', () => {
    const result = report([transaction(), transaction({ property_id: 'p2' }), transaction()])
    expect(result.rows).toHaveLength(2)
    expect(new Set(result.rows.map((row) => row.id)).size).toBe(2)
    expect(result.summary.income).toBe(200)
    expect(result.excluded_count).toBe(1)
    expect(result.warnings.join(' ')).toMatch(/duplicate/)
  })

  it('avoids delimiter and synthetic ID collisions', () => {
    const result = report(
      [
        transaction({ property_id: 'a:b', id: 'c' }),
        transaction({ property_id: 'a', id: 'b:c' }),
        transaction({ property_id: 'a', id: undefined }),
        transaction({ property_id: 'a', id: '@row:2' }),
      ],
      { properties: [{ id: 'a:b' }, { id: 'a' }] },
    )
    expect(new Set(result.rows.map((row) => row.id)).size).toBe(4)
    expect(result.excluded_count).toBe(0)
  })

  it('keeps zero-activity properties and rejects out-of-scope transactions', () => {
    const result = report([transaction({ property_id: 'unknown' })])
    expect(result.rows).toEqual([])
    expect(result.property_totals).toHaveLength(2)
    expect(result.property_totals.every((row) => row.net === 0)).toBe(true)
    expect(result.excluded_count).toBe(1)
  })
})

describe('monetary and record validation', () => {
  it('sums decimal cents exactly, not floating-point additions', () => {
    const input = Array.from({ length: 1000 }, (_, id) =>
      transaction({ id: String(id), amount: '0.01' }),
    )
    expect(report(input).summary.income).toBe(10)
    expect(
      report([transaction({ amount: 0.1 }), transaction({ id: 'two', amount: 0.2 })]).summary
        .income,
    ).toBe(0.3)
  })

  it.each([
    0,
    -1,
    '-0.01',
    '',
    ' ',
    null,
    undefined,
    true,
    false,
    {},
    [],
    NaN,
    Infinity,
    -Infinity,
    'NaN',
    'Infinity',
    '1e3',
    '1,000',
    '$20',
    '1.001',
    0.001,
    0.1 + 0.2,
    '9007199254740992',
    '9'.repeat(100),
    '90071992547409.91',
  ])('excludes invalid/unsafe amount %s without NaN', (amount) => {
    const result = report([transaction({ amount })], { type: 'ledger' })
    expect(result.rows).toEqual([])
    expect(result.summary).toEqual(zeroSummary)
    expect(result.excluded_count).toBe(1)
    expect(result.warnings.join(' ')).toMatch(/amount/)
    expect(JSON.stringify(result)).not.toMatch(/NaN/)
  })

  it('excludes aggregate overflow without losing previously safe totals', () => {
    const result = report([
      transaction({ amount: '50000000000000.00' }),
      transaction({ id: 'second', property_id: 'p2', amount: '50000000000000.00' }),
    ])
    expect(result.summary.income).toBe(50000000000000)
    expect(result.rows).toHaveLength(1)
    expect(result.excluded_count).toBe(1)
    expect(result.warnings.join(' ')).toMatch(/safe monetary totals/)
    expect(result.property_totals[1].income).toBe(0)
  })

  it.each(['EUR', 'usd', '', null, {}, 123])(
    'excludes unsupported or malformed currency %s',
    (currency) => {
      const result = report([transaction({ currency })])
      expect(result.rows).toEqual([])
      expect(result.excluded_count).toBe(1)
      expect(result.warnings.join(' ')).toMatch(/currency/)
    },
  )

  it('accepts legacy omitted currency and explicit USD', () => {
    expect(
      report([transaction(), transaction({ id: 'usd', currency: 'USD' })]).summary.income,
    ).toBe(200)
  })

  it.each([undefined, null, '', 'today', '2026-02-30', '2026-09-09T00:00:00Z', 42])(
    'never substitutes today for invalid transaction date %s',
    (transac_date) => {
      const result = report([transaction({ transac_date })], { type: 'ledger' })
      expect(result.rows).toEqual([])
      expect(result.excluded_count).toBe(1)
      expect(result.warnings.join(' ')).toMatch(/date/)
    },
  )

  it('excludes malformed records without throwing', () => {
    const result = report([null, undefined, [], 'bad', 3])
    expect(result.excluded_count).toBe(5)
    expect(result.rows).toEqual([])
  })

  it('is deterministic and does not mutate deeply frozen inputs', () => {
    const transactions = Object.freeze([
      Object.freeze(transaction({ id: 'later', transac_date: '2026-09-10' })),
      Object.freeze(transaction({ id: 'earlier', transac_date: '2026-09-08' })),
    ])
    const props = Object.freeze(properties.map((property) => Object.freeze({ ...property })))
    const first = report(transactions, { properties: props })
    expect(first).toEqual(report(transactions, { properties: props }))
    expect(first.rows.map((row) => row.date)).toEqual(['2026-09-08', '2026-09-10'])
    expect(transactions[0].id).toBe('later')
    expect(() => JSON.stringify(first)).not.toThrow()
  })
})

describe('actual PM account statement', () => {
  it.each([undefined, null, '', ' ', 42, {}])(
    'requires a real explicit account ID, not label %s',
    (accountId) => {
      expect(() => statement([], { accountId, accountLabel: 'pm-current' })).toThrow(/accountId/)
    },
  )

  it('never attributes legacy PM role or another PM account to the current actor', () => {
    const result = statement([
      transaction({ transac_from: 'po', transac_to: 'pm', financial_category: 'management_fee' }),
      transaction({ id: 'other-pm', from_account_id: 'po1', to_account_id: 'pm-other' }),
      transaction({ id: 'label', to_account_id: 'Current PM' }),
    ])
    expect(result.rows).toEqual([])
    expect(result.summary).toEqual(zeroSummary)
    expect(result.excluded_count).toBe(3)
    expect(result.warnings.every((warning) => warning.includes('explicit account match'))).toBe(
      true,
    )
  })

  it('includes all actual inflows/outflows including non-profit cash and unclassified fees', () => {
    const result = statement([
      transaction({
        id: 'fee',
        transac_type: 'Fee',
        financial_category: 'management_fee',
        to_account_id: 'pm-current',
        amount: 25,
      }),
      transaction({
        id: 'deposit',
        financial_category: 'security_deposit',
        to_account_id: 'pm-current',
        amount: 500,
      }),
      transaction({
        id: 'distribution',
        financial_category: 'owner_distribution',
        from_account_id: 'pm-current',
        amount: 300,
      }),
      transaction({
        id: 'transfer',
        financial_category: 'transfer',
        from_account_id: 'pm-current',
        amount: 100,
      }),
      transaction({
        id: 'ambiguous-fee',
        transac_type: 'Fee',
        to_account_id: 'pm-current',
        amount: 5,
      }),
      transaction({
        id: 'repair',
        financial_category: 'maintenance',
        from_account_id: 'pm-current',
        amount: 10,
      }),
    ])
    expect(result.rows).toHaveLength(6)
    expect(result.summary).toEqual({
      ...zeroSummary,
      income: 25,
      expenses: 0,
      net: 25,
      inflow: 530,
      outflow: 410,
      managementFees: 25,
    })
    expect(result.rows.find((row) => row.category === 'management_fee')).toMatchObject({
      to: 'pm-current',
      inflow: 25,
      outflow: 0,
      management_fee: 25,
      income: 25,
      expense: 0,
      classification: 'income',
    })
    expect(result.rows.find((row) => row.category === 'unclassified')).toMatchObject({
      amount: 5,
      inflow: 5,
      management_fee: 0,
      income: 0,
    })
    expect(result.excluded_count).toBe(0)
    expect(result.warnings).toHaveLength(1)
  })

  it('does not book outgoing management fees as PM revenue', () => {
    const result = statement([
      transaction({
        financial_category: 'management_fee',
        from_account_id: 'pm-current',
        to_account_id: 'pm-other',
      }),
    ])
    expect(result.summary).toEqual({ ...zeroSummary, outflow: 100 })
    expect(result.rows[0]).toMatchObject({
      inflow: 0,
      outflow: 100,
      income: 0,
      expense: 0,
      management_fee: 0,
    })
  })

  it('treats same-actor endpoints as a neutral internal movement, even for management fees', () => {
    const result = statement([
      transaction({
        financial_category: 'management_fee',
        from_account_id: 'pm-current',
        to_account_id: 'pm-current',
      }),
    ])
    expect(result.summary).toEqual(zeroSummary)
    expect(result.rows[0]).toMatchObject({
      amount: 100,
      flow: 'internal',
      classification: 'non_operating',
      inflow: 0,
      outflow: 0,
      income: 0,
      expense: 0,
      management_fee: 0,
    })
    expect(result.excluded_count).toBe(0)
  })

  it('uses properties as labels without hiding actual account movements lacking property metadata', () => {
    const result = statement(
      [
        transaction({
          to_account_id: 'pm-current',
          property_id: 'unlisted',
          property_name: 'Old property',
        }),
        transaction({
          id: 'no-property',
          from_account_id: 'pm-current',
          property_id: undefined,
          financial_category: 'transfer',
        }),
      ],
      { properties: [] },
    )
    expect(result.rows).toHaveLength(2)
    expect(result.rows.map((row) => row.property_name).sort()).toEqual([
      'Old property',
      'Unassigned',
    ])
    expect(result.summary.inflow).toBe(100)
    expect(result.summary.outflow).toBe(100)
  })

  it('applies account-specific refund directions rather than role labels', () => {
    const result = statement([
      transaction({
        id: 'fee-refund',
        transac_type: 'Refund',
        financial_category: 'management_fee',
        from_account_id: 'pm-current',
        amount: 10,
      }),
      transaction({
        id: 'repair-refund',
        transac_type: 'Refund',
        financial_category: 'maintenance',
        to_account_id: 'pm-current',
        amount: 5,
      }),
      transaction({
        id: 'fee-cost-refund',
        transac_type: 'Refund',
        financial_category: 'management_fee',
        to_account_id: 'pm-current',
        amount: 2,
      }),
    ])
    expect(result.summary).toEqual({
      ...zeroSummary,
      income: -10,
      expenses: 0,
      net: -10,
      inflow: 7,
      outflow: 10,
      managementFees: -10,
    })
  })

  it('never mistakes collected rent or property repairs for company profit', () => {
    const result = statement([
      transaction({
        id: 'rent',
        financial_category: 'rental_income',
        to_account_id: 'pm-current',
        amount: 2000,
      }),
      transaction({
        id: 'repair',
        financial_category: 'maintenance',
        from_account_id: 'pm-current',
        amount: 300,
      }),
    ])
    expect(result.summary).toEqual({ ...zeroSummary, inflow: 2000, outflow: 300 })
    expect(result.rows.every((row) => row.classification === 'non_operating')).toBe(true)
  })

  it('uses the same validation and inclusive period rules as property reports', () => {
    const result = statement(
      [
        transaction({ id: 'before', to_account_id: 'pm-current', transac_date: '2026-09-08' }),
        transaction({ to_account_id: 'pm-current' }),
        transaction({ id: 'invalid', to_account_id: 'pm-current', transac_date: null }),
        transaction({ id: 'bad-money', to_account_id: 'pm-current', amount: -1 }),
        transaction({ id: 'eur', to_account_id: 'pm-current', currency: 'EUR' }),
      ],
      { from: '2026-09-09', to: '2026-09-09' },
    )
    expect(result.rows).toHaveLength(1)
    expect(result.summary.inflow).toBe(100)
    expect(result.excluded_count).toBe(3)
  })
})

describe('property task reports', () => {
  it('emits task rows and separates open, completed, and canceled tasks', () => {
    const result = tasksReport([
      task(),
      task({ id: 'closed', status: 'closed', completed_at: '2026-09-10T12:00:00Z' }),
      task({ id: 'cancel', status: 'cancel' }),
      task({ property_id: 'p2', status: 'in_progress', title: 'Paint' }),
    ])
    expect(result.summary).toEqual({
      ...zeroSummary,
      taskCount: 4,
      openTasks: 2,
      completedTasks: 1,
    })
    expect(result.rows.find((row) => row.id === '["p1","task1"]')).toEqual({
      id: '["p1","task1"]',
      property_id: 'p1',
      property_name: 'First property',
      date: '2026-09-09',
      title: 'Repair sink',
      status: 'open',
      completed_at: null,
    })
    expect(result.rows.find((row) => row.status === 'closed').completed_at).toBe(
      '2026-09-10T12:00:00Z',
    )
    expect(new Set(result.rows.map((row) => row.id)).size).toBe(4)
    expect(result.property_totals.every((row) => row.net === 0)).toBe(true)
  })

  it('filters by recorded task date, not due/completion date or timezone-shifted today', () => {
    const result = tasksReport(
      [
        task({ report_date: '2026-09-08', due_date: '2026-09-09' }),
        task({ id: 'created', report_date: undefined, created_at: '2026-09-09T23:30:00-06:00' }),
        task({ id: 'after', report_date: '2026-09-10', completed_at: '2026-09-09' }),
      ],
      { from: '2026-09-09', to: '2026-09-09' },
    )
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].date).toBe('2026-09-09')
    expect(result.excluded_count).toBe(0)
  })

  it.each([
    undefined,
    null,
    '',
    '2026-02-30',
    '2026-02-30T12:00:00Z',
    '2026-09-09T24:00:00Z',
    '2026-09-09T12:00:00',
    new Date('2026-09-09'),
  ])('flags invalid/missing task date %s', (report_date) => {
    const result = tasksReport([task({ report_date })])
    expect(result.rows).toEqual([])
    expect(result.excluded_count).toBe(1)
    expect(result.warnings.join(' ')).toMatch(/date/)
  })

  it('flags invalid completion dates without fabricating task completion', () => {
    const result = tasksReport([
      task({ completed_at: 'nonsense' }),
      task({ id: 'unknown', status: 'surprise' }),
    ])
    expect(result.summary).toEqual({ ...zeroSummary, taskCount: 2, openTasks: 1 })
    expect(result.rows.every((row) => row.completed_at === null)).toBe(true)
    expect(result.warnings).toHaveLength(2)
    expect(result.excluded_count).toBe(0)
  })

  it('excludes duplicate and out-of-scope tasks', () => {
    const result = tasksReport([task(), task(), task({ property_id: 'unknown' }), null])
    expect(result.summary.taskCount).toBe(1)
    expect(result.excluded_count).toBe(3)
  })

  it('supports current API task fields without mutating them', () => {
    const input = Object.freeze({
      id: 'api-task',
      property_id: 'p1',
      task_title: 'API title',
      task_status: 'completed',
      created_at: '2026-09-09T12:00:00.000Z',
    })
    const result = tasksReport(Object.freeze([input]))
    expect(result.rows[0]).toMatchObject({
      title: 'API title',
      status: 'completed',
      date: '2026-09-09',
    })
    expect(result.summary.completedTasks).toBe(1)
  })
})
