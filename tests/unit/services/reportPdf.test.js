// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createReportPdf } from '../../../src/services/reportPdf.js'
import {
  reportDocumentTitle,
  needsUnicodePrint,
  reportPrintHtml,
  reportFilename,
} from '../../../src/utils/reportDocument.js'

const sample = () => ({
  title: 'Garden Management | Garden House',
  companyName: 'Garden Management',
  reportTitle: 'Profit & Loss',
  period: '2026-09-01 to 2026-09-30',
  scope: ['Garden House'],
  metrics: [
    { label: 'Income', value: '$2,700.00' },
    { label: 'Expenses', value: '$200.00' },
    { label: 'Net result', value: '$2,500.00' },
  ],
  columns: [
    { label: 'Category' },
    { label: 'Income', align: 'right' },
    { label: 'Expenses', align: 'right' },
  ],
  rows: [
    ['Rental income', '$2,700.00', '$0.00'],
    ['Utilities', '$0.00', '$200.00'],
  ],
  propertyRows: [],
  propertyColumns: [],
  basis: 'Recorded basis',
  notes: ['Not bank reconciliation.'],
  landscape: false,
  generatedAt: '2026-09-10',
})
describe('report PDF output', () => {
  it('builds company/property titles without inventing a company name', () => {
    expect(reportDocumentTitle(' Garden Management ', ['Garden House'])).toBe(
      'Garden Management | Garden House',
    )
    expect(reportDocumentTitle('', ['Garden House'])).toBe('Garden House')
    expect(reportDocumentTitle('Acme', ['A', 'B'])).toBe('Acme | Property portfolio (2)')
    expect(reportDocumentTitle('Acme', ['A', 'B'], true)).toBe('Acme | All account properties')
  })
  it('creates a real PDF with document title metadata and correct orientation', () => {
    const pdf = createReportPdf(sample())
    expect(pdf.output().startsWith('%PDF-')).toBe(true)
    expect(pdf.getNumberOfPages()).toBe(1)
    expect(pdf.output()).toContain('/Title (Garden Management | Garden House)')
    const landscape = createReportPdf({ ...sample(), landscape: true })
    expect(landscape.internal.pageSize.getWidth()).toBeGreaterThan(
      landscape.internal.pageSize.getHeight(),
    )
  })
  it('paginates the full table and wraps long titles and notes', () => {
    const document = sample()
    document.title = 'Very long property and company name '.repeat(12)
    document.rows = Array.from({ length: 150 }, (_, i) => [
      `Transaction ${i + 1}`,
      '$10.00',
      '$0.00',
    ])
    document.notes = ['Explanation '.repeat(300)]
    const pdf = createReportPdf(document)
    expect(pdf.getNumberOfPages()).toBeGreaterThan(4)
    expect(pdf.lastAutoTable.body).toHaveLength(150)
  })
  it('preserves Unicode using print output instead of silently generating broken glyphs', () => {
    const document = { ...sample(), title: '安居公司 | 湖边住宅' }
    expect(needsUnicodePrint(document)).toBe(true)
    expect(() => createReportPdf(document)).toThrow('non-Latin')
    expect(reportPrintHtml(document)).toContain('安居公司 | 湖边住宅')
  })
  it('escapes all user-controlled print HTML including title, notes and cells', () => {
    const attack = '<img src=x onerror="alert(1)">'
    const html = reportPrintHtml({ ...sample(), title: attack, rows: [[attack]], notes: [attack] })
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
    expect(html).toContain('thead{display:table-header-group}')
  })
  it('generates safe filenames without property path characters', () => {
    expect(reportFilename('pnl/../../', '2026-09-01', '2026-09-30')).toBe(
      'pnl________2026-09-01_2026-09-30.pdf',
    )
  })
})
