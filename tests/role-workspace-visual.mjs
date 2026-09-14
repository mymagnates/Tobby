import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const base = 'http://127.0.0.1:9000',
  output = '/private/tmp/handout-role-workspace-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' })
  await context.addInitScript(() => {
    window.__roleOffline = true
  })
  const js = (route, body) => route.fulfill({ contentType: 'application/javascript', body })
  await context.route('**/*', (route) => {
    const request = route.request(),
      url = new URL(request.url())
    if (url.origin !== base || request.method() !== 'GET') return route.abort('blockedbyclient')
    if (url.pathname === '/src/stores/userDataStore.js')
      return js(route, 'export const useUserDataStore = () => ({userId:"qa-sp"});')
    if (url.pathname === '/src/services/webApiClient.js')
      return js(
        route,
        'export const spPortalApi = { listLeads: async () => [{id:"lead-1",title:"Repair kitchen faucet",property:"Garden House",task_id:"task-1",budget_range:"$100 - $300",due_date:"2026-09-30",comment_count:0}] };',
      )
    if (url.pathname === '/src/services/contentModeration.js')
      return js(route, 'export const listBlockedUsers = async () => ({items:[]});')
    if (
      ['/src/components/SpBidDialog.vue', '/src/components/ReportContentDialog.vue'].includes(
        url.pathname,
      )
    )
      return js(route, 'export default {render:()=>null};')
    if (/\/src\/(boot|services|stores)\//.test(url.pathname))
      throw new Error(`Unexpected data dependency: ${url.pathname}`)
    return route.continue()
  })
  const page = await context.newPage(),
    errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const width of [1280, 390, 320])
    for (const dark of [false, true])
      for (const view of ['sp', 'transactions', 'tasks', 'leases']) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(
          `${base}/tests/visual/role-workspace.html?view=${view}${dark ? '&dark' : ''}`,
        )
        const target = page.locator(
          view === 'sp' ? '.role-workspace-page' : '.owner-workspace-view',
        )
        await expect(target).toBeVisible()
        await expect(
          page
            .getByText(
              view === 'sp'
                ? 'Repair kitchen faucet'
                : view === 'transactions'
                  ? 'Rent'
                  : view === 'tasks'
                    ? 'Open / In Progress'
                    : 'Garden House Tenant',
              { exact: true },
            )
            .first(),
        ).toBeVisible()
        expect(await target.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
        expect(await target.evaluate((el) => getComputedStyle(el).color)).toBe(
          dark ? 'rgb(228, 239, 231)' : 'rgb(36, 56, 48)',
        )
          await page.screenshot({
          path: `${output}/${view}-${width}-${dark ? 'dark' : 'light'}.png`,
            fullPage: true,
            animations: 'disabled',
        })
        if (view !== 'sp') {
          await page.getByRole('button', { name: /^Close .* history$/ }).click()
          await expect(target).toHaveCount(0)
        }
      }
  expect(errors).toEqual([])
  console.log(
    `24 responsive light/dark scenarios passed: real SP Leads read-only page and Owner transaction/task/lease components. No live data or bid writes. ${output}`,
  )
} finally {
  await browser.close()
}
