import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { applyDepositEntry, depositSummary } from '../backend/deposits.js'

const base = process.env.DEPOSIT_QA_URL || 'http://127.0.0.1:9000'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local QA only')
const output = '/private/tmp/handout-deposit-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const lease = { id: 'l1', LSID: 'Garden House Lease', deposit: 1000, status: 'Rented' }
let account = {},
  entries = [],
  loseResponse = false,
  failRead = false,
  posts = 0
const result = () => ({
  summary: depositSummary(lease, account),
  currency: 'USD',
  entries: entries.map((e) => ({ ...e, reversed: entries.some((r) => r.reverses_id === e.id) })),
})
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' })
  await context.addInitScript(() => {
    window.__depositOffline = true
  })
  await context.route('**/*', async (route) => {
    const req = route.request(),
      url = new URL(req.url())
    if (url.origin !== new URL(base).origin) return route.abort('blockedbyclient')
    if (url.pathname === '/src/boot/firebase.js')
      return route.fulfill({
        contentType: 'application/javascript',
        body: 'export const auth = { currentUser: { uid: "qa", getIdToken: async () => "offline-qa" } }; export const authStateReady = Promise.resolve();',
      })
    if (!url.pathname.startsWith('/api/')) return route.continue()
    expect(req.headers().authorization).toBe('Bearer offline-qa')
    if (req.method() === 'GET') {
      if (failRead) return route.fulfill({ status: 403, json: { message: 'Access unavailable' } })
      if (url.pathname === '/api/properties/p1/deposits')
        return route.fulfill({
          json: {
            accounts: [result().summary],
            unlinked: [],
            currency: 'USD',
          },
        })
      return route.fulfill({ json: result() })
    }
    if (req.method() !== 'POST' || !url.pathname.endsWith('/deposit/entries'))
      return route.abort('blockedbyclient')
    posts++
    const body = req.postDataJSON()
    if (entries.some((e) => e.id === body.operation_id)) return route.fulfill({ json: result() })
    try {
      expect(body.expected_version).toBe(account.version || 0)
      const entry = {
        ...body,
        id: body.operation_id,
        amount_cents: Math.round((body.amount || 0) * 100),
      }
      account = applyDepositEntry(
        account,
        entry,
        entries.find((e) => e.id === entry.reverses_id),
      )
      entries.push({
        ...entry,
        version: account.version,
        amount: entry.amount_cents / 100,
        recorded_at: new Date().toISOString(),
      })
      if (loseResponse) {
        loseResponse = false
        return route.abort('failed')
      }
      return route.fulfill({ json: result() })
    } catch (error) {
      return route.fulfill({ status: error.status || 409, json: { message: error.message } })
    }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.error(error.message)
  })
  await page.goto(`${base}/tests/visual/deposits.html`)
  await expect(page.getByText('Garden House Lease', { exact: true })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('property-deposits.csv')
  await page.getByRole('button', { name: 'View', exact: true }).click()
  await expect(page.getByText('not received', { exact: false }).first()).toBeVisible()
  async function fill(action, amount, note) {
    await page.getByRole('button', { name: /Record deposit action|Reopen deposit/ }).click()
    await page.getByLabel('Action', { exact: true }).click()
    await page.getByRole('option', { name: action, exact: true }).click()
    if (amount !== null) await page.getByLabel('Amount (USD)').fill(String(amount))
    await page.getByLabel('Description / payment or settlement reference').fill(note)
  }
  const save = () => page.getByRole('button', { name: 'Save record', exact: true }).click()
  await fill('receipt', 1000, 'Bank receipt 1')
  loseResponse = true
  await save()
  await expect(page.getByText('The save result is unknown.', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Amount (USD)')).toBeDisabled()
  await save()
  await expect(page.locator('.deposit-form')).toHaveCount(0)
  expect(posts).toBe(2)
  expect(entries).toHaveLength(1)
  expect(account.balance_cents).toBe(100000)

  await fill('deduction', 200, 'Agreed repair deduction')
  await page.getByRole('checkbox', { name: /This reduces funds held only/ }).click()
  await save()
  await expect(page.locator('.deposit-form')).toHaveCount(0)
  await fill('refund', 900, 'Too large')
  await save()
  await expect(page.getByRole('alert')).toContainText('exceeds the available deposit')
  expect(account.balance_cents).toBe(80000)
  await page.getByLabel('Amount (USD)').fill('800')
  await page.getByLabel('Description / payment or settlement reference').fill('Bank refund 1')
  await save()
  await expect(page.locator('.deposit-form')).toHaveCount(0)
  await fill('settle', null, 'Reviewed with tenant')
  await page.getByRole('checkbox', { name: /All receipts, refunds/ }).click()
  await save()
  await expect(page.getByRole('button', { name: 'Reopen deposit' })).toBeVisible()
  expect(account.settled).toBe(true)
  await fill('reopen', null, 'Correction requested')
  await save()
  await expect(page.locator('.deposit-form')).toHaveCount(0)
  expect(account.settled).toBe(false)

  await fill('receipt', 100, 'Second receipt unknown outcome')
  loseResponse = true
  await save()
  await expect(page.getByText('The save result is unknown.', { exact: false })).toBeVisible()
  const postsBeforeRefresh = posts
  await page.getByRole('button', { name: 'Retry load' }).click()
  await expect(page.locator('.deposit-form')).toHaveCount(0)
  expect(posts).toBe(postsBeforeRefresh)
  expect(account.balance_cents).toBe(10000)

  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.screenshot({ path: `${output}/lease-${width}.png`, fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
  }
  await page.getByRole('button', { name: 'All leases' }).click()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible()
  await page.screenshot({ path: `${output}/property-320.png`, fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  )
  failRead = true
  await page.getByRole('button', { name: 'Refresh deposits' }).click()
  await expect(page.getByRole('alert')).toContainText('Access unavailable')
  await expect(page.getByRole('button', { name: 'Export CSV' })).toHaveCount(0)
  expect(errors).toEqual([])
  console.log(
    'PASS: isolated real deposit UI, CSV, receipt, deduction, refund guard, settlement, reopen, lost-response retry/refresh, failed-read state, 1280/390/320 layouts. No live financial writes.',
  )
} finally {
  await browser.close()
}
