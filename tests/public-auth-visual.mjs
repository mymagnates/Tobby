import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// UI-only verification: isolated guest state; no real accounts, emails or backend writes.
const base = process.env.AUTH_QA_URL || 'http://127.0.0.1:9000'
const output = process.env.AUTH_QA_OUTPUT || '/private/tmp/handout-auth-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const source = await (await page.request.get(`${base}/src/components/FirebaseAuth.vue`)).text()
  const vueModule = source.match(/from "([^"]*\/deps\/vue\.js[^"]*)"/)?.[1]
  if (!vueModule) throw new Error('Run this UI test against the Quasar development server')
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== new URL(base).origin) return route.abort()
    return route.continue()
  })
  await page.route('**/src/boot/firebase.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'export const auth={currentUser:null}; export const authStateReady=Promise.resolve(null); export const authPersistenceReady=Promise.resolve(); export const db={}; export const storage={}; export const app={}; export const sessionManager={}; export default ()=>{};',
    }),
  )
  await page.route('**/src/boot/auth-init.js*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'export default ()=>{};' }),
  )
  await page.route('**/src/stores/userDataStore.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'export const useUserDataStore=()=>({user:null,userProfile:null,userCategory:null,setUser:async()=>{},loadUserProfile:async()=>{}});',
    }),
  )
  await page.route('**/src/composables/useFirebase.js*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `import {ref} from ${JSON.stringify(vueModule)}; export const useFirebase=()=>({loading:ref(false),error:ref(''),isAuthenticated:ref(false),userEmail:ref(''),signIn:async()=>{throw Error('Unexpected sign-in in visual test')},signUp:async()=>{throw Error('Unexpected signup in visual test')},resetPassword:async()=>{throw Error('Unexpected reset in visual test')},logout:async()=>{}});`,
    }),
  )
  async function capture(name) {
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    )
  }
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 })
    await page.goto(`${base}/public/login?redirect=%2Fproperty%2Finvitation`)
    await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible()
    await expect(page.getByLabel('Email address', { exact: true })).toHaveAttribute(
      'autocomplete',
      'username',
    )
    if (width > 880) {
      const form = await page.locator('.public-auth-card').boundingBox()
      const story = await page.locator('.public-auth-story').boundingBox()
      expect(form.x + form.width).toBeLessThan(story.x)
    } else {
      await expect(page.locator('.public-auth-story')).toBeHidden()
    }
    await capture(`login-${width}`)
    await page.getByLabel('Password', { exact: true }).fill('example-only')
    await page.getByRole('button', { name: 'Show password', exact: true }).click()
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
    await capture(`reset-${width}`)
    await page.getByRole('button', { name: 'Back to sign in' }).click()
    await page.locator('.guest-header').getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/public\/register\?redirect=/)
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.locator('input:visible')).toHaveCount(4)
    await capture(`register-${width}`)
    expect((await page.locator('details').boundingBox()).height).toBeLessThanOrEqual(50)
    if (width <= 600) {
      expect((await page.locator('.public-auth-card').boundingBox()).x).toBe(20)
    }
    for (const name of ['name', 'email', 'password', 'confirm-password']) {
      const font = await page
        .locator(`input[name="${name}"]`)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(font).toBeGreaterThanOrEqual(16)
    }
    await page.locator('summary').click()
    await expect(page.getByLabel('Company name', { exact: true })).toBeVisible()
    await capture(`register-expanded-${width}`)
    await page.locator('summary').click()
    await page.getByLabel('Full name', { exact: true }).fill('Alex Example')
    await page.getByLabel('Email address', { exact: true }).fill('alex@example.test')
    await page.getByLabel('Password', { exact: true }).fill('secret123')
    await page.getByLabel('Confirm password', { exact: true }).fill('different')
    await page.getByTestId('pm-signup-submit').click()
    await expect(page.getByText('Passwords do not match', { exact: true })).toBeVisible()
    await capture(`register-validation-${width}`)
  }
  expect(errors).toEqual([])
  console.log(`Auth UI passed at 1280px, 390px and 320px. Screenshots: ${output}`)
} finally {
  await browser.close()
}
