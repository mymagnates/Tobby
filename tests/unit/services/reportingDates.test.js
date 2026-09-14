import { describe, expect, it } from 'vitest'
import { localCalendarDate, reportingPeriod } from '../../../src/utils/reportingDates'
import { buildPropertyReport } from '../../../backend/reporting.js'

describe('report calendar dates', () => {
  it('uses local calendar components rather than the UTC ISO date', () => {
    const evening = new Date(2026, 8, 9, 23, 33)
    expect(localCalendarDate(evening)).toBe('2026-09-09')
    expect(reportingPeriod('month', evening)).toEqual({ from: '2026-09-01', to: '2026-09-30' })
  })
  it('handles leap years, year boundaries, year to date and untouched custom ranges', () => {
    expect(reportingPeriod('month', new Date(2028, 1, 3)).to).toBe('2028-02-29')
    expect(reportingPeriod('last_month', new Date(2026, 0, 5))).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    })
    expect(reportingPeriod('year', new Date(2026, 8, 9))).toEqual({
      from: '2026-01-01',
      to: '2026-09-09',
    })
    expect(reportingPeriod('custom')).toBeNull()
  })
  it('includes the 2700 rent dated September 10 in September, without including October', () => {
    const report = buildPropertyReport({
      type: 'pnl',
      properties: [{ id: 'p1' }],
      ...reportingPeriod('month', new Date(2026, 8, 9, 23, 33)),
      transactions: [
        {
          id: 'rent',
          property_id: 'p1',
          amount: 2700,
          transac_date: '2026-09-10',
          financial_category: 'rental_income',
        },
        {
          id: 'utility',
          property_id: 'p1',
          amount: 200,
          transac_date: '2026-09-01',
          financial_category: 'utilities',
        },
        {
          id: 'next',
          property_id: 'p1',
          amount: 9999,
          transac_date: '2026-10-01',
          financial_category: 'rental_income',
        },
      ],
    })
    expect(report.summary).toMatchObject({ income: 2700, expenses: 200, net: 2500 })
    expect(report.rows).toHaveLength(2)
  })
})
