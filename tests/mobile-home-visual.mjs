import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// Isolated auth/data fixture. Never writes records or calls production services.
const base = process.env.MOBILE_QA_URL || 'http://localhost:9000'
const output = '/private/tmp/tobby-mobile-home-qa'
await mkdir(output, { recursive: true })
const property = { id: 'p1', nickname: 'Pinewood', address: '123 Pinewood Drive' }
const store = {
  user: { uid: 'pm1', email: 'pm@example.test' },
  userProfile: { account_type: 'pm', display_name: 'Alex' },
  userCategory: 'pm', accountType: 'pm', isManagerCapableUser: true,
  userAccessibleProperties: [property], userAccessibleLeases: [],
  userAccessibleMxRecords: [], userAccessibleTransactions: [], properties: [property], userRoles: [],
}
const tasks = Array.from({ length: 7 }, (_, i) => ({ id: `task-${i}`, property_id: 'p1',
  task_title: i ? `Urgent maintenance request ${i}` : 'Repair leaking faucet in the upstairs bathroom with a very long descriptive title',
  status: 'open', priority: 'urgent',
}))
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/src/boot/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript',
    body: `export const auth={currentUser:{uid:'pm1',getIdToken:async()=> 'fixture'}}; export const authStateReady=Promise.resolve(); export const authPersistenceReady=Promise.resolve(); export const db={}; export const storage={}; export const app={}; export const sessionManager={}; export default ()=>{};`,
  }))
  await page.route('**/src/boot/auth-init.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export default ()=>{};' }))
  await page.route('**/src/stores/userDataStore.js*', (route) => route.fulfill({ contentType: 'application/javascript',
    body: `const store=${JSON.stringify(store)}; for(const key of ['loadUserRoles','loadProperties','loadMxRecords','loadTransactions','loadLeases','loadUserProfile','setUser']) store[key]=async()=>{}; export const useUserDataStore=()=>store;`,
  }))
  await page.route('**/src/composables/useFirebase.js*', (route) => route.fulfill({ contentType: 'application/javascript',
    body: `export const useFirebase=()=>({getAllDocuments:async(path)=>path.endsWith('/mxrecords')?${JSON.stringify(tasks)}:[],getDocument:async()=>null});`,
  }))
  await page.route('**/api/**', (route) => route.fulfill({ json: {} }))
  await page.goto(`${base}/mobile/pm/home`)
  await expect(page.locator('button.ios-row')).toHaveCount(5)
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'New record', exact: true })).toBeVisible()
  const newRecord = page.getByRole('button', { name: 'New record', exact: true })
  await newRecord.hover()
  await page.mouse.down()
  await expect(newRecord).toHaveCSS('outline-style', 'none')
  await expect(newRecord).toHaveCSS('transform', 'none')
  await expect(newRecord).toHaveCSS('box-shadow', 'none')
  await expect(newRecord.locator('.q-ripple')).toHaveCount(0)
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  // Quasar restores pointer focus to its internal helper after dismissing a sheet.
  const helper = newRecord.locator('.q-focus-helper')
  await expect(helper).toHaveCSS('outline-style', 'none')
  await expect(helper).toHaveCSS('opacity', '0')
  await page.screenshot({ path: `${output}/new-record-after-click.png`, fullPage: true })
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(newRecord).toBeFocused()
  await expect(newRecord).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByText('Transaction', { exact: true }).click()
  await expect(page).toHaveURL(/\/mobile\/pm\/create\?.*kind=transaction/)
  await page.goto(`${base}/mobile/pm/home`)
  await expect(page.locator('button.ios-row')).toHaveCount(5)
  await expect(page.locator('.ios-property-select')).toContainText('All properties')
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  await expect.poll(noOverflow).toBe(true)
  await page.screenshot({ path: `${output}/home-light-375.png`, fullPage: true })
  await page.evaluate(() => document.body.classList.add('body--dark'))
  await page.screenshot({ path: `${output}/home-dark-375.png`, fullPage: true })
  const colors = await page.locator('.ios-workspace').evaluate((node) => {
    const style = getComputedStyle(node)
    return { background: style.backgroundColor, color: style.color }
  })
  if (colors.background !== 'rgb(25, 37, 30)' || colors.color !== 'rgb(228, 239, 231)') throw new Error(`Incorrect dark palette: ${JSON.stringify(colors)}`)
  await page.evaluate(() => document.body.classList.remove('body--dark'))
  await page.setViewportSize({ width: 320, height: 640 })
  await expect.poll(noOverflow).toBe(true)
  const newRecordBounds = await page.getByRole('button', { name: 'New record', exact: true }).boundingBox()
  if (newRecordBounds.height < 44 || newRecordBounds.x + newRecordBounds.width > 320) throw new Error('Home create target is too small or clipped')
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole('button', { name: 'View all', exact: true }).click()
  await expect(page).toHaveURL(/\/mobile\/pm\/manage\?.*filter=attention/)
  await expect(page.locator('button.ios-row')).toHaveCount(7)
  await expect(page.getByRole('button', { name: 'New record', exact: true })).toBeVisible()
  await page.screenshot({ path: `${output}/manage-light-375.png`, fullPage: true })
  await page.setViewportSize({ width: 812, height: 375 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => document.documentElement.style.fontSize = '24px')
  if (!await noOverflow()) throw new Error('Manage has landscape overflow')
  await page.screenshot({ path: `${output}/manage-landscape.png`, fullPage: true })
  await page.locator('button.ios-row').first().click()
  await expect(page).toHaveURL(/\/mobile\/pm\/task\/p1\/task-0\?returnTo=/)
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
  tasks.splice(0, tasks.length, { id: 'ordinary', property_id: 'p1', task_title: 'Ordinary open task', status: 'open' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(`${base}/mobile/pm/home`)
  await expect(page.getByText('No urgent, overdue or due-today items.')).toBeVisible()
  await newRecord.tap()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(newRecord.locator('.q-ripple')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(helper).toHaveCSS('outline-style', 'none')
  await expect(helper).toHaveCSS('opacity', '0')
  await page.screenshot({ path: `${output}/home-empty-375.png`, fullPage: true })
  await page.getByRole('button', { name: 'View all tasks', exact: true }).click()
  await expect(page).toHaveURL(/\/mobile\/pm\/manage\?.*type=tasks/)
  await expect(page.locator('button.ios-row')).toHaveCount(1)
  await expect(page.locator('button.ios-row')).toContainText('Ordinary open task')
  await page.goto(`${base}/mobile/pm/account`)
  const privacy = page.getByRole('link', { name: 'Privacy Policy' })
  await expect(privacy).toHaveAttribute('href', 'https://tobbythebutler.web.app/privacy')
  // Exercise focus without opening the external policy site in this fixture.
  await privacy.evaluate((node) => node.addEventListener('click', (event) => event.preventDefault()))
  await privacy.tap()
  await expect(privacy).toHaveCSS('outline-style', 'none')
  await expect(privacy).toHaveCSS('box-shadow', 'none')
  await expect(privacy).toHaveCSS('transform', 'none')
  await expect(privacy).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await page.screenshot({ path: `${output}/account-privacy-after-tap.png`, fullPage: true })
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(privacy).toBeFocused()
  await expect(privacy).toHaveCSS('outline-style', 'solid')
  if (errors.length) throw new Error(errors.join('\n'))
  console.log(`Home/Manage fixture checks passed; screenshots: ${output}`)
} finally {
  await browser.close()
}
