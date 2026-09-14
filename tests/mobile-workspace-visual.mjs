import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { applyInventoryCommand, createInventoryWorkflow } from '../backend/inventoryWorkflow.js'

// Isolated browser fixture: every auth, data and API request is intercepted.
// This exercises UI behavior, not production authentication or persistence.
const base = process.env.MOBILE_QA_URL || 'http://127.0.0.1:9010'
const output = '/private/tmp/tobby-mobile-qa'
await mkdir(output, { recursive: true })
let sequence = 0
const now = '2026-09-08T12:00:00Z',
  actor = { id: 'pm1', email: 'pm@example.test' }
const signature = [
  [
    [0.1, 0.2],
    [0.4, 0.6],
    [0.8, 0.3],
  ],
]
let state = createInventoryWorkflow(
  null,
  {
    property_id: 'p1',
    lease_id: 'l1',
    lease_label: 'Lease 2026',
    pm_user_id: 'pm1',
    pm_name: 'Alex Morgan',
    tenant_user_id: 'tt1',
    tenant_name: 'Taylor Lee',
  },
  now,
)
const command = (body, signer = actor) =>
  (state = applyInventoryCommand(
    state,
    { expected_revision: state.revision, ...body },
    signer,
    now,
    `event-${++sequence}`,
  ))
command({ type: 'start', stage: 'move_in' })
for (const [id, name, area] of [
  ['fridge', 'Refrigerator', 'Kitchen'],
  ['oven', 'Oven', 'Kitchen'],
  ['carpet', 'Carpet', 'Living room'],
])
  command({
    type: 'save_item',
    new_item_id: id,
    entry: { name, area, condition: 'good', photos: [] },
  })
command({ type: 'sign', batch_version: 1, signature })
command({ type: 'sign', batch_version: 1, signature }, { id: 'tt1', email: 'tenant@example.test' })
const confirmed = structuredClone(state)
const property = { id: 'p1', nickname: 'Pinewood', address: '123 Pinewood Drive' }
const fakeStore = {
  user: { uid: 'pm1', email: 'pm@example.test' },
  userProfile: { account_type: 'pm', display_name: 'Alex Morgan' },
  userCategory: 'pm',
  accountType: 'pm',
  isManagerCapableUser: true,
  userAccessibleProperties: [property],
  userAccessibleMxRecords: [
    { id: 'task1', property_id: 'p1', task_title: 'Repair kitchen faucet', status: 'open' },
  ],
  userAccessibleLeases: [{ id: 'l1', property_id: 'p1', LSID: 'Lease 2026', status: 'Rented' }],
  userAccessibleTransactions: [],
  properties: [property],
  userRoles: [],
  leases: [],
  mxRecords: [],
}
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/src/boot/firebase.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export const auth={currentUser:{uid:'pm1',email:'pm@example.test',getIdToken:async()=> 'fixture-token'}}; export const authStateReady=Promise.resolve(auth.currentUser); export const authPersistenceReady=Promise.resolve(); export const db={}; export const storage={}; export const app={}; export const sessionManager={}; export default ()=>{};`,
    }),
  )
  await page.route('**/src/boot/auth-init.js*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'export default ()=>{};' }),
  )
  await page.route('**/src/stores/userDataStore.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `const store=${JSON.stringify(fakeStore)}; for(const name of ['loadProperties','loadMxRecords','loadLeases','loadTransactions','loadUserProfile','setUser'])store[name]=async()=>{}; export const useUserDataStore=()=>store;`,
    }),
  )
  await page.route('**/src/composables/useFirebase.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'export const useFirebase=()=>({getAllDocuments:async()=>[],getDocument:async()=>null});',
    }),
  )
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname.replace(/^\/api/, '')
    let payload = {}
    if (path.endsWith('/inventory-workflow/commands')) {
      try {
        command(route.request().postDataJSON())
        payload = { inventory: state }
      } catch (err) {
        return route.fulfill({
          status: err.status || 400,
          json: { message: err.message, error_code: err.code },
        })
      }
    } else if (path.endsWith('/inventory-workflow')) payload = { inventory: state }
    else if (path.endsWith('/notes')) payload = { items: [] }
    else if (path.endsWith('/history'))
      payload = { items: [{ ...confirmed.batch, history_id: 'first' }] }
    else if (path.endsWith('/leases')) payload = { leases: fakeStore.userAccessibleLeases }
    else if (path.endsWith('/credits')) payload = { balance: 42 }
    else if (path.endsWith('/usage'))
      payload = {
        ai_tokens_used: 120,
        ai_tokens_limit: 500,
        storage_used_mb: 4,
        storage_limit_mb: 512,
      }
    await route.fulfill({ json: payload })
  })
  async function capture(name) {
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    )
    if (overflow) throw new Error(`Horizontal overflow: ${name}`)
  }
  await page.goto(`${base}/mobile/pm/home`)
  await page.getByRole('heading', { name: 'Home', exact: true }).waitFor()
  await capture('home-390')
  await page.getByRole('link', { name: 'Property', exact: true }).click()
  await page.getByRole('button', { name: 'Inventory List', exact: true }).waitFor()
  await capture('property-390')
  await page.getByRole('button', { name: 'Inventory List', exact: true }).click()
  await page.getByRole('button', { name: 'Start check', exact: true }).waitFor()
  await capture('inventory-390')
  await page.getByRole('button', { name: 'Start check', exact: true }).click()
  await page.getByText('Move-out check', { exact: true }).click()
  await page.getByRole('button', { name: 'Add item', exact: true }).waitFor()
  await capture('move-out-390')
  await page.getByRole('button', { name: /Refrigerator/ }).click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Item name', { exact: true }).waitFor()
  await capture('item-edit-390')
  const camera = page.locator('input[capture="environment"]')
  if ((await camera.count()) !== 1) throw new Error('Missing item camera input')
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('button', { name: 'Mark unchanged', exact: true }).click()
  await page.getByText('Refrigerator', { exact: true }).last().click()
  await page.getByText('Oven', { exact: true }).last().click()
  await page.getByText('Carpet', { exact: true }).last().click()
  await page.getByRole('button', { name: 'Mark selected unchanged', exact: true }).click()
  await page.getByRole('button', { name: 'Review & sign', exact: true }).click()
  await page.locator('canvas').waitFor()
  await capture('signature-390')
  const rect = await page.locator('canvas').boundingBox()
  await page.mouse.move(rect.x + 20, rect.y + 60)
  await page.mouse.down()
  await page.mouse.move(rect.x + 120, rect.y + 100, { steps: 12 })
  await page.mouse.move(rect.x + 220, rect.y + 50, { steps: 12 })
  await page.mouse.up()
  await page.getByText('I have reviewed and agree to this batch.', { exact: true }).click()
  await page.getByRole('button', { name: 'Confirm & sign', exact: true }).click()
  await page.getByRole('button', { name: 'Share confirmation link', exact: true }).waitFor()
  if (state.batch.status !== 'awaiting_confirmation')
    throw new Error('Single signature incorrectly completed batch')
  await page.setViewportSize({ width: 320, height: 568 })
  await capture('batch-320')
  await page.goto(`${base}/mobile/pm/account`)
  await page.getByText('42', { exact: true }).waitFor()
  await capture('account-320')
  await page.goto(`${base}/mobile/login`)
  await page.getByRole('heading', { name: 'Handout', exact: true }).waitFor()
  await capture('login-320')
  if (errors.length) throw new Error(errors.join('\n'))
  console.log(
    JSON.stringify(
      {
        result: 'passed',
        output,
        screenshots: 9,
        scope: 'mocked UI only; no live API, auth, or device camera validation',
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
