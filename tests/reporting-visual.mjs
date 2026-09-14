import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { buildPropertyReport, buildPmStatement } from '../backend/reporting.js'

const base = process.env.REPORT_QA_URL || 'http://127.0.0.1:9000'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Local dev server only')
const output = '/private/tmp/handout-reporting-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = [],
  requests = [],
  checks = []
let viewer = false,
  failNext = false,
  slowNext = false
let rentRegression = false,
  savedRent = false
const properties = [
  { id: 'p1', name: 'Garden House' },
  { id: 'p2', name: 'Lakeview Residence' },
]
try {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    timezoneId: 'America/Chicago',
  })
  await context.addInitScript(() => {
    window.__reportingOffline = true
  })
  await context.route('**/*', async (route) => {
    const req = route.request(),
      url = new URL(req.url())
    if (url.origin !== new URL(base).origin) return route.abort('blockedbyclient')
    if (
      rentRegression &&
      req.method() === 'POST' &&
      url.pathname === '/api/properties/p1/report-transactions'
    ) {
      expect(req.headers().authorization).toBe('Bearer offline-qa-token')
      savedRent = true
      return route.fulfill({ json: { id: 'saved-rent', transaction: req.postDataJSON() } })
    }
    if (req.method() !== 'GET') return route.abort('blockedbyclient')
    if (url.pathname === '/src/boot/firebase.js')
      return route.fulfill({
        contentType: 'application/javascript',
        body: 'export const auth = { currentUser: { uid: "qa-pm", getIdToken: async () => "offline-qa-token" } }; export const authStateReady = Promise.resolve();',
      })
    if (url.pathname.startsWith('/api/')) {
      requests.push(req.url())
      if (req.headers().authorization !== 'Bearer offline-qa-token')
        throw new Error('Missing bearer token')
      if (url.pathname === '/api/reports/options')
        return route.fulfill({
          json: {
            properties: properties.map((p) => ({
              ...p,
              can_finance: !viewer,
              can_tasks: true,
              is_owner: !viewer,
            })),
            account: {
              id: 'qa-pm',
              label: 'Garden Property Management',
              company_name: 'Garden Property Management',
              can_pm_statement: !viewer,
            },
          },
        })
      if (url.pathname !== '/api/reports/workspace') throw new Error('Unexpected API request')
      if (failNext) {
        failNext = false
        return route.fulfill({
          status: 403,
          json: { message: 'Report access is unavailable. Retry or change scope.' },
        })
      }
      if (slowNext) {
        slowNext = false
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
      const type = url.searchParams.get('type'),
        date = url.searchParams.get('from')
      const scope = url.searchParams.get('property_ids')?.split(',') || properties.map((p) => p.id)
      let transactions = [
        {
          id: 'rent',
          property_id: 'p1',
          transac_date: date,
          transac_type: 'Rent',
          financial_category: 'rental_income',
          amount: 2400,
          to_account_id: 'qa-pm',
          transac_from: 'tt',
        },
        {
          id: 'fee',
          property_id: 'p1',
          transac_date: date,
          transac_type: 'Fee',
          financial_category: 'management_fee',
          amount: 240,
          to_account_id: 'qa-pm',
          transac_from: 'po',
        },
        {
          id: 'repair',
          property_id: 'p2',
          transac_date: date,
          transac_type: 'Maintenance',
          amount: 150,
          from_account_id: 'qa-pm',
          transac_to: 'sp',
          note: 'Kitchen faucet repair',
        },
      ].filter((row) => scope.includes(row.property_id))
      if (rentRegression)
        transactions = [
          {
            id: 'utility',
            property_id: 'p1',
            transac_date: '2026-09-01',
            amount: 200,
            financial_category: 'utilities',
          },
          ...(savedRent
            ? [
                {
                  id: 'saved-rent',
                  property_id: 'p1',
                  transac_date: '2026-09-10',
                  amount: 2700,
                  financial_category: 'rental_income',
                },
              ]
            : []),
          {
            id: 'next-month',
            property_id: 'p1',
            transac_date: '2026-10-01',
            amount: 9999,
            financial_category: 'rental_income',
          },
        ]
      const payload =
        type === 'pm_statement'
          ? buildPmStatement({
              accountId: 'qa-pm',
              transactions,
              properties,
              from: date,
              to: url.searchParams.get('to'),
            })
          : buildPropertyReport({
              type,
              from: date,
              to: url.searchParams.get('to'),
              properties: properties.filter((p) => scope.includes(p.id)),
              transactions,
              tasks: [
                {
                  id: 'task1',
                  property_id: 'p1',
                  title: 'Kitchen faucet repair',
                  status: 'completed',
                  report_date: date,
                },
              ],
            })
      return route.fulfill({ json: payload })
    }
    if (
      ['fetch', 'xhr', 'eventsource'].includes(req.resourceType()) ||
      /firebase|googleapis/.test(url.pathname)
    )
      return route.abort('blockedbyclient')
    return route.continue()
  })
  await context.routeWebSocket('**/*', (socket) =>
    socket.send(JSON.stringify({ type: 'connected' })),
  )
  const page = await context.newPage()
  await page.clock.setFixedTime(new Date('2026-09-10T04:33:50Z'))
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    // Chromium logs the intentionally injected permission failure as a resource error.
    if (
      message.type() === 'error' &&
      !(
        message.text().includes('403 (Forbidden)') &&
        message.location().url.includes('/api/reports/workspace')
      )
    )
      errors.push(message.text())
  })
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${base}/tests/visual/reporting.html`)
    await expect(page.getByRole('heading', { name: 'Profit & Loss' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
    await expect(page.locator('.report-metrics')).toContainText('$2,010.00')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
    await page.screenshot({ path: `${output}/pnl-${width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'PM account statement', exact: true }).click()
    await expect(page.locator('.report-metrics')).toContainText('$240.00')
    await expect(page.locator('.report-metrics')).toContainText('$2,640.00')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
    await page.screenshot({ path: `${output}/pm-${width}.png`, fullPage: true })
    checks.push(`P&L and PM statement at ${width}px; no page overflow`)
  }
  await page.getByTestId('report-properties').click()
  const narrowed = page.waitForResponse((response) => response.url().includes('property_ids=p1'))
  await page.getByRole('option', { name: 'Garden House', exact: true }).click()
  await narrowed
  await page.keyboard.press('Escape')
  await expect(page.locator('.report-metrics')).toContainText('$0.00')
  checks.push('PM property selection narrows the actual API query and displayed flows')
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  expect((await downloaded).suggestedFilename()).toMatch(/^pm_statement_.*\.csv$/)
  checks.push('CSV download')
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click()
  await expect(page.getByLabel('Company name (optional)')).toHaveValue('Garden Property Management')
  await page.getByLabel('Company name (optional)').fill('QA Management Company')
  await expect(page.locator('.report-pdf-title')).toContainText('QA Management Company')
  const pdfDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click()
  const pdfFile = await pdfDownload
  expect(pdfFile.suggestedFilename()).toMatch(/\.pdf$/)
  await pdfFile.saveAs(`${output}/downloaded-report.pdf`)
  checks.push('Real PDF download with editable company title and current property scope')
  await page.getByRole('button', { name: 'Property reports', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
  failNext = true
  await page.getByRole('button', { name: 'General Ledger', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Report access is unavailable')
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  await expect(page.locator('.report-metrics')).toHaveCount(0)
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
  checks.push('Permission failure clears old totals/export; retry succeeds')
  slowNext = true
  await page.getByRole('button', { name: 'P&L', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  await page.getByRole('button', { name: 'Task History', exact: true }).click()
  await expect(page.locator('.report-metrics')).toContainText('Recorded tasks')
  await page.waitForTimeout(1000)
  await expect(page.locator('.report-metrics')).not.toContainText('$')
  checks.push('Late previous response does not overwrite task report')
  viewer = true
  await page.reload()
  await expect(page.locator('.report-metrics')).toContainText('Recorded tasks')
  await expect(page.getByRole('button', { name: 'PM account statement', exact: true })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: 'P&L', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  await expect(page.locator('.report-metrics')).toHaveCount(0)
  checks.push('Viewer defaults to task history and cannot load financial reports')
  viewer = false
  rentRegression = true
  await page.reload()
  await expect(page.locator('.report-metrics')).toContainText('-$200.00')
  await expect(page.locator('.report-content-heading')).toContainText('2026-09-01 to 2026-09-30')
  await page.evaluate(async () => {
    const { createReportTransaction } = await import('/src/services/reportTransactionApi.js')
    await createReportTransaction('p1', {
      amount: 2700,
      transac_date: '2026-09-10',
      financial_category: 'rental_income',
    })
  })
  await expect(page.locator('.report-metrics')).toContainText('$2,700.00')
  await expect(page.locator('.report-metrics')).toContainText('$2,500.00')
  await page.getByRole('button', { name: 'Refresh report', exact: true }).click()
  await expect(page.locator('.report-metrics')).toContainText('$2,500.00')
  await page.screenshot({ path: `${output}/rent-2700-regression.png`, fullPage: true })
  checks.push(
    'Chicago evening: September 10 rent auto-refreshes September report; next-month rent excluded; manual refresh works',
  )
  expect(errors).toEqual([])
  console.log(JSON.stringify({ checks, requests: requests.length, errors, output }, null, 2))
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ checks, requests, errors }, null, 2))
  await browser.close()
}
