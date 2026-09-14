import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

// Run against the existing Quasar dev server; never starts/stops servers or writes backend data.
// PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/workspace-forms-visual.mjs
const base = process.env.FORMS_QA_URL || 'http://127.0.0.1:9000'
const output = process.env.FORMS_QA_OUTPUT || '/private/tmp/handout-workspace-forms-qa'
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname)) {
  throw new Error('FORMS_QA_URL must be a local development server')
}
await mkdir(output, { recursive: true })
const report = { base, scenarios: [], failures: [], blockedRequests: [], errors: [] }
const browser = await chromium.launch({ headless: true })
const forms = [
  'property',
  'maintenance',
  'transaction',
  'lease',
  'asset',
  'document',
  'reminder',
  'service',
  'tenant',
  'edit-property',
]
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' })
  const sourceResponse = await context.request.get(`${base}/src/components/CreateProperty.vue`)
  const source = await sourceResponse.text()
  const vueModule = source.match(/from ["']([^"']*\/deps\/vue\.js[^"']*)["']/)?.[1]
  if (!sourceResponse.ok() || !vueModule) {
    throw new Error('Expected Vite-transformed components from the Quasar dev server on port 9000')
  }
  const prelude = `import { ref } from ${JSON.stringify(vueModule)};
    const deny = (name) => async (...args) => {
      window.__workspaceFormsCalls.push({ name, args });
      throw new Error('Unexpected backend operation in visual fixture: ' + name);
    };`
  const mocks = {
    '/src/composables/useFirebase.js': `${prelude}
      export const useFirebase = () => ({
        loading: ref(false), userId: ref('fixture-user'), isAuthenticated: ref(true),
        createDocument: deny('createDocument'), updateDocument: deny('updateDocument'),
        deleteDocument: deny('deleteDocument'), uploadFile: deny('uploadFile'),
        uploadImages: deny('uploadImages'), uploadImagesWithDetails: deny('uploadImagesWithDetails')
      });`,
    '/src/stores/userDataStore.js': `${prelude}
      const property = { id: 'fixture-property', nickname: 'Garden House', address: '123 Example Lane',
        city: 'Austin', state: 'TX', zip: '78701', type: 'Single Family', status: 'Active',
        ownership_mode: 'self_owned', spec: { story: 1, bedroom: 3, full_bathroom: 2,
          half_bathroom: 1, kitchen: 1, size: 1500, lot_size: 5000 }, notes: 'Synthetic QA property' };
      const role = { id: 'fixture-role', property_id: property.id, user_id: 'fixture-user', role: 'pm' };
      const store = {
        userId: 'fixture-user', user: { uid: 'fixture-user', displayName: 'Fixture Manager' },
        accountType: 'pm', userCategory: 'pm', isAuthenticated: true,
        userAccessibleProperties: [property], userAccessibleLeases: [], userRoles: [role],
        propertiesLoading: false, userRolesLoading: false,
        getPropertyById: () => property, getPropertyName: () => property.nickname,
        getUserRoleForProperty: () => role, getUserRolesForProperty: () => [role],
        updateProperty: deny('updateProperty'), refreshProperties: deny('refreshProperties'),
        refreshLeases: deny('refreshLeases')
      };
      export const useUserDataStore = () => store;`,
    '/src/services/webApiClient.js': `${prelude}
      export const billingApi = { getUsage: async () => {
        window.__workspaceFormsReads.push('billing.getUsage');
        return { properties_used: 1, properties_limit:
          new URLSearchParams(location.search).get('state') === 'disabled' ? 1 : 100 };
      }};`,
    '/src/services/leaseApi.js': `${prelude}
      export const createPropertyLeaseRequest = deny('createPropertyLeaseRequest');`,
    '/src/services/tenantApi.js': `${prelude}
      export const createPropertyTenantRequest = deny('createPropertyTenantRequest');`,
  }
  await context.addInitScript(() => {
    window.__workspaceFormsOffline = true
    window.__workspaceFormsCalls = []
    window.__workspaceFormsReads = []
  })
  // Fail closed: mocked boundaries are fulfilled in memory; only local static GETs may pass.
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === new URL(base).origin && mocks[url.pathname]) {
      return route.fulfill({ contentType: 'application/javascript', body: mocks[url.pathname] })
    }
    const forbidden =
      url.origin !== new URL(base).origin ||
      request.method() !== 'GET' ||
      ['fetch', 'xhr', 'eventsource'].includes(request.resourceType()) ||
      /\/(api|__\/auth|src\/(boot|services|stores))\//.test(url.pathname) ||
      /firebase|googleapis|openai|anthropic/i.test(url.pathname) ||
      (url.pathname.startsWith('/src/composables/') && !url.pathname.includes('useWebFormTheme'))
    if (forbidden) {
      report.blockedRequests.push({ url: request.url(), type: request.resourceType() })
      return route.abort('blockedbyclient')
    }
    return route.continue()
  })
  // A synthetic Vite handshake avoids HMR console errors without connecting to any server.
  await context.routeWebSocket('**/*', (socket) => {
    const url = new URL(socket.url())
    if (url.host === new URL(base).host && url.pathname === '/') {
      socket.send(JSON.stringify({ type: 'connected' }))
    } else {
      report.blockedRequests.push({ url: socket.url(), type: 'websocket' })
      socket.close()
    }
  })
  const page = await context.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (error) => report.errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || /Failed to resolve component/.test(message.text())) {
      report.errors.push(message.text())
    }
  })

  async function check(scenario, name, action) {
    try {
      await action()
      scenario.checks.push({ name, passed: true })
    } catch (error) {
      const failure = { scenario: scenario.name, check: name, message: error.message }
      scenario.checks.push({ name, passed: false })
      report.failures.push(failure)
      console.error(`${scenario.name}: ${name}: ${error.message}`)
    }
  }

  async function capture(scenario, suffix) {
    const path = `${output}/${scenario.name}-${suffix}.png`
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    scenario.screenshots.push(path)
  }

  async function unclipped(locator) {
    await locator.scrollIntoViewIfNeeded()
    await expect(locator).toBeVisible()
    const result = await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const problems = []
      if (
        rect.left < -1 ||
        rect.right > innerWidth + 1 ||
        rect.top < -1 ||
        rect.bottom > innerHeight + 1
      ) {
        problems.push('outside viewport')
      }
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent)
        const box = parent.getBoundingClientRect()
        const left = box.left + parent.clientLeft
        const top = box.top + parent.clientTop
        if (
          /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
          (rect.left < left - 1 || rect.right > left + parent.clientWidth + 1)
        )
          problems.push('horizontal ancestor clipping')
        if (
          /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
          (rect.top < top - 1 || rect.bottom > top + parent.clientHeight + 1)
        )
          problems.push('vertical ancestor clipping')
      }
      // Rounded button corners are intentionally not hit targets; sample the center.
      for (const [x, y] of [[rect.left + rect.width / 2, rect.top + rect.height / 2]]) {
        const hit = document.elementFromPoint(x, y)
        if (!hit || !el.contains(hit)) problems.push('occluded control')
      }
      return problems
    })
    expect(result).toEqual([])
  }

  async function colors(locator, kind) {
    const css = await locator.evaluate((el) => {
      const style = getComputedStyle(el)
      return { background: style.backgroundColor, color: style.color }
    })
    const rgb = (value) => value.match(/[\d.]+/g).map(Number)
    const [r, g, b, alpha = 1] = rgb(css.background)
    expect(alpha, `${kind} background must be opaque: ${JSON.stringify(css)}`).toBe(1)
    if (kind === 'primary') {
      expect(g, JSON.stringify(css)).toBeGreaterThan(r)
      expect(g, JSON.stringify(css)).toBeGreaterThan(b)
      expect(Math.max(r, g, b), JSON.stringify(css)).toBeLessThan(140)
      expect(Math.min(...rgb(css.color).slice(0, 3))).toBeGreaterThan(220)
    } else {
      expect(Math.min(r, g, b), JSON.stringify(css)).toBeGreaterThanOrEqual(210)
      expect(Math.max(...rgb(css.color).slice(0, 3))).toBeLessThan(180)
    }
  }

  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 })
    for (const form of forms) {
      const scenario = { name: `${form}-${width}`, checks: [], screenshots: [] }
      report.scenarios.push(scenario)
      await check(scenario, 'render and visual contract', async () => {
        await page.goto(`${base}/tests/visual/workspace-forms.html?form=${form}`)
        const root = page.locator('.workspace-form')
        await expect(root).toBeVisible()
        await expect(page.locator('body')).toHaveClass(/workspace-forms-theme/)
        await expect(root.locator('.q-field').first()).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        // Let existing component entrance animations settle before measuring geometry.
        await page.waitForTimeout(400)
        await capture(scenario, 'top')
        await check(scenario, 'no horizontal overflow including dialog scroll host', async () => {
          const overflow = await page.evaluate(() => {
            const nodes = [
              document.documentElement,
              ...document.querySelectorAll(
                '.workspace-form, .q-dialog__inner, .create-fullscreen-body',
              ),
            ]
            return nodes
              .filter((el) => el.scrollWidth > el.clientWidth + 1)
              .map((el) => ({
                class: el.className,
                scroll: el.scrollWidth,
                client: el.clientWidth,
              }))
          })
          expect(overflow).toEqual([])
        })
        await check(scenario, 'all rendered input fonts at least 16px', async () => {
          const inputs = root.locator('input:visible:not([type="file"]), textarea:visible')
          expect(await inputs.count()).toBeGreaterThan(0)
          const small = await inputs.evaluateAll((nodes) =>
            nodes
              .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
              .map((el) => ({
                label: el.getAttribute('aria-label'),
                font: getComputedStyle(el).fontSize,
              })),
          )
          expect(small).toEqual([])
        })
        const save = root.getByRole('button', {
          name: form === 'edit-property' ? 'Update Property' : 'Save',
          exact: true,
        })
        const cancel = root.getByRole('button', { name: 'Cancel', exact: true })
        await check(scenario, 'primary dark green', () => colors(save, 'primary'))
        await check(scenario, 'cancel light', () => colors(cancel, 'cancel'))
        await check(scenario, 'final field reachable without clipping', async () => {
          await unclipped(root.locator('.q-field:visible').last())
          await capture(scenario, 'bottom')
        })
        await check(scenario, 'save and cancel reachable without clipping', async () => {
          await unclipped(save)
          await expect(save).toBeEnabled()
          await save.click({ trial: true })
          await unclipped(cancel)
          await cancel.click({ trial: true })
        })
        if (form === 'property') {
          await check(
            scenario,
            'real Quasar required validation prevents backend submit',
            async () => {
              // QForm validates sequentially. Resolve each error before submitting again.
              for (const [label, message, value] of [
                ['Address *', 'Address is required', '123 Example Lane'],
                ['Nickname *', 'Nickname is required', 'Garden House'],
                ['City *', 'City is required', 'Austin'],
                ['State *', 'State is required', 'TX'],
                ['ZIP *', 'ZIP is required', '78701'],
                ['Property Type *', 'Property type is required', null],
              ]) {
                await save.click()
                await expect(root.getByText(message, { exact: true })).toBeVisible()
                if (value) await root.getByLabel(label, { exact: true }).fill(value)
              }
              expect(await page.evaluate(() => window.__workspaceFormsCalls)).toEqual([])
              expect(await page.evaluate(() => window.__workspaceFormsReads)).toEqual([
                'billing.getUsage',
              ])
              await capture(scenario, 'validation')
            },
          )
        }
        if (form === 'reminder' || form === 'edit-property') {
          await check(scenario, 'close icon reachable without clipping', async () => {
            const close = root
              .locator('button')
              .filter({ has: page.locator('.q-icon', { hasText: /^close$/ }) })
            await unclipped(close)
            await close.click({ trial: true })
          })
        }
        if (!['tenant', 'edit-property'].includes(form)) {
          await check(scenario, 'cancel dismisses the real dialog without writes', async () => {
            await cancel.click()
            await expect(page.locator('.q-dialog')).toHaveCount(0)
            await expect(page.getByTestId('fixture-closed')).toBeVisible()
          })
        }
        expect(await page.evaluate(() => window.__workspaceFormsCalls)).toEqual([])
      })
    }
    const disabled = { name: `property-disabled-${width}`, checks: [], screenshots: [] }
    report.scenarios.push(disabled)
    await check(
      disabled,
      'billing gate preserves disabled native button and no submission',
      async () => {
        await page.goto(`${base}/tests/visual/workspace-forms.html?form=property&state=disabled`)
        const save = page.getByRole('button', { name: 'Save', exact: true })
        await expect(save).toBeDisabled()
        await expect(page.getByText(/Property limit reached \(1\/1\)/)).toBeVisible()
        await save.evaluate((el) => el.click())
        expect(await page.evaluate(() => window.__workspaceFormsCalls)).toEqual([])
        expect(await page.evaluate(() => window.__workspaceFormsReads)).toEqual([
          'billing.getUsage',
        ])
        await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeEnabled()
        await capture(disabled, 'top')
      },
    )
  }
  const unthemed = { name: 'property-theme-off', checks: [], screenshots: [] }
  report.scenarios.push(unthemed)
  await check(unthemed, 'theme remains opt-in', async () => {
    await page.goto(`${base}/tests/visual/workspace-forms.html?form=property&theme=off`)
    await expect(page.locator('.workspace-form')).toBeVisible()
    await expect(page.locator('body')).not.toHaveClass(/workspace-forms-theme/)
    const cancel = page.getByRole('button', { name: 'Cancel', exact: true })
    const background = await cancel.evaluate((el) => getComputedStyle(el).backgroundColor)
    const channels = background
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number)
    expect(Math.min(...channels)).toBeLessThan(210)
    await capture(unthemed, 'top')
  })
  if (report.blockedRequests.length || report.errors.length) {
    report.failures.push({
      check: 'offline isolation and browser runtime',
      blockedRequests: report.blockedRequests,
      errors: report.errors,
    })
  }
} finally {
  await browser.close()
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}
console.log(
  `${report.scenarios.length} scenarios; ${report.failures.length} failures. Report/screenshots: ${output}`,
)
if (report.failures.length) process.exitCode = 1
