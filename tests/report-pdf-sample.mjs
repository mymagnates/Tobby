import { mkdir, writeFile } from 'node:fs/promises'
import { createReportPdf } from '../src/services/reportPdf.js'
const dir = '/private/tmp/handout-report-pdf-qa'
await mkdir(dir, { recursive: true })
const document = {
  title: 'Garden Property Management | Tawakoni',
  companyName: 'Garden Property Management',
  reportTitle: 'Profit & Loss',
  period: '2026-09-01 to 2026-09-30',
  scope: ['Tawakoni'],
  metrics: [
    { label: 'Recorded income', value: '$2,700.00' },
    { label: 'Recorded expenses', value: '$200.00' },
    { label: 'Net recorded result', value: '$2,500.00' },
  ],
  columns: [
    { label: 'Category' },
    { label: 'Income', align: 'right' },
    { label: 'Expenses', align: 'right' },
    { label: 'Net result', align: 'right' },
  ],
  rows: [
    ['Rental Income', '$2,700.00', '$0.00', '$2,700.00'],
    ['Utilities', '$0.00', '$200.00', '-$200.00'],
  ],
  propertyColumns: [],
  propertyRows: [],
  basis: 'Recorded basis',
  notes: [
    'Based on recorded transactions, not accrual accounting, bank reconciliation or a double-entry general ledger.',
    'Deposits and transfers do not automatically contribute to property P&L.',
  ],
  generatedAt: '2026-09-10',
  landscape: false,
}
const pdf = createReportPdf(document)
await writeFile(`${dir}/report.pdf`, new Uint8Array(pdf.output('arraybuffer')))
console.log(`${dir}/report.pdf`)
