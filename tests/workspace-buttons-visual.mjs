import { chromium, expect } from '@playwright/test'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import { mkdir, mkdtemp } from 'node:fs/promises'

// PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/workspace-buttons-visual.mjs
// Own a local static fixture server; do not run Quasar's app boot or predev hooks.
const root = fileURLToPath(new URL('..', import.meta.url))
const output = process.env.BUTTONS_QA_OUTPUT || '/private/tmp/handout-workspace-buttons-qa'
await mkdir(output, { recursive: true })
const server = await createServer({
  root,
  configFile: false,
  cacheDir: await mkdtemp('/private/tmp/handout-buttons-vite-'),
  optimizeDeps: { entries: ['tests/visual/workspace-buttons.html'] },
  server: { host: '127.0.0.1', port: 0 },
  css: {
    preprocessorOptions: {
      scss: { quietDeps: true, silenceDeprecations: ['legacy-js-api', 'import'] },
    },
  },
})
let browser
let scenarios = 0
try {
  await server.listen()
  const base = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' })
  const errors = []
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (
      url.origin !== base ||
      request.method() !== 'GET' ||
      /\/src\/(boot|services|stores)\//.test(url.pathname)
    ) {
      errors.push(`Blocked unexpected request: ${url}`)
      return route.abort()
    }
    return route.continue()
  })
  await context.routeWebSocket('**/*', (socket) =>
    socket.send(JSON.stringify({ type: 'connected' })),
  )
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  const get = (id) => page.getByTestId(id)
  const css = (locator) =>
    locator.evaluate((el) => {
      const s = getComputedStyle(el)
      return {
        color: s.color,
        background: s.backgroundColor,
        radius: s.borderRadius,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        justify: s.justifyContent,
        opacity: s.opacity,
      }
    })
  async function toggleStyles(disabled) {
    await page.evaluate((value) => {
      for (const style of document.querySelectorAll('style[data-vite-dev-id]')) {
        if (/\/(web-workspace|workspace-forms)\.scss$/.test(style.dataset.viteDevId))
          style.sheet.disabled = value
      }
    }, disabled)
  }
  for (const width of [1280, 390, 320]) {
    for (const dark of [false, true]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${base}/tests/visual/workspace-buttons.html${dark ? '?dark' : ''}`)
      await expect(get('web-short')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const brand = dark ? 'rgb(184, 222, 197)' : 'rgb(37, 75, 57)'
      for (const scope of ['web', 'form']) {
        const short = get(`${scope}-short`)
        expect((await css(short)).background).toBe(brand)
        expect((await css(short)).color).toBe(dark ? 'rgb(25, 37, 30)' : 'rgb(255, 255, 255)')
        expect((await css(short)).height).toBeGreaterThanOrEqual(44)
        expect((await css(short)).width).toBeGreaterThanOrEqual(88)
        expect((await css(get(`${scope}-long`))).width).toBeGreaterThan((await css(short)).width)
        const iconButton = get(`${scope}-icon-label`)
        await expect(iconButton.locator('.q-icon')).toBeVisible()
        expect((await css(iconButton.locator('.q-icon'))).color).toBe((await css(iconButton)).color)
        for (const kind of ['short', 'long', 'icon-label', 'wrap', 'footer-long', 'dropdown']) {
          const control = get(`${scope}-${kind}`)
          const content = control.locator(':scope > .q-btn__content')
          expect((await css(content)).justify, `${scope}-${kind} centered`).toBe('center')
          const clipped = await control.evaluate((el) => {
            const content = el.querySelector('.q-btn__content')
            const label = content.querySelector('.block')
            const box = el.getBoundingClientRect()
            const text = label.getBoundingClientRect()
            return (
              el.scrollWidth > el.clientWidth + 1 ||
              content.scrollWidth > content.clientWidth + 1 ||
              text.left < box.left ||
              text.right > box.right ||
              text.bottom > box.bottom
            )
          })
          expect(clipped, `${scope}-${kind} unclipped`).toBe(false)
        }
        const round = await css(get(`${scope}-round`))
        expect(round.radius).toBe('50%')
        expect(Math.abs(round.width - round.height)).toBeLessThan(1)
        expect((await css(get(`${scope}-footer-icon`))).width).toBeLessThan(88)
        expect((await css(get(`${scope}-nonbutton`))).justify).toBe('space-between')
        expect((await css(get(`${scope}-aligned`).locator('.q-btn__content'))).justify).toBe(
          'flex-start',
        )
        await expect(get(`${scope}-disabled`)).toBeDisabled()
        expect(Number((await css(get(`${scope}-disabled`))).opacity)).toBeLessThan(1)
        const previousClicks = await get('clicks').textContent()
        await get(`${scope}-disabled`).evaluate((el) => el.click())
        await expect(get('clicks')).toHaveText(previousClicks)
        for (const kind of ['danger', 'danger-flat']) {
          const color = (await css(get(`${scope}-${kind}`))).color.match(/\d+/g).map(Number)
          expect(color[0], `${scope}-${kind} stays red`).toBeGreaterThan(color[1])
          expect(color[0], `${scope}-${kind} stays red`).toBeGreaterThan(color[2])
        }
        const loading = get(`${scope}-loading`)
        const initial = await css(loading)
        await loading.click()
        await expect(loading).toHaveAttribute('role', 'progressbar')
        await expect(loading.locator('.q-spinner')).toBeVisible()
        const loadingClicks = await get('clicks').textContent()
        await loading.evaluate((el) => el.click())
        await expect(get('clicks')).toHaveText(loadingClicks)
        expect((await css(loading)).width).toBe(initial.width)
        expect((await css(loading)).height).toBe(initial.height)
        await get('reset-loading').click()
        await expect(loading).not.toHaveAttribute('role', 'progressbar')
        await short.hover()
        await expect
          .poll(async () => (await css(short)).background)
          .toBe(dark ? 'rgb(204, 235, 214)' : 'rgb(30, 62, 47)')
        await page.keyboard.press('Tab')
        await short.focus()
        expect(await short.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
        await page.mouse.move(0, 0)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      // Unrelated controls must keep their pre-change computed geometry and alignment.
      for (const id of ['web-icon', 'web-nav', 'web-toggle', 'web-tabs']) {
        const themed = await css(get(id))
        await toggleStyles(true)
        const baseline = await css(get(id))
        for (const property of ['width', 'height', 'justify']) {
          expect(baseline[property], `${id} ${property} unaffected`).toEqual(themed[property])
        }
        await toggleStyles(false)
      }
      await page.screenshot({
        path: `${output}/buttons-${width}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
        animations: 'disabled',
      })
      scenarios++
    }
  }
  await page.goto(`${base}/tests/visual/workspace-buttons.html?native`)
  await expect(get('web-short')).toBeVisible()
  for (const id of ['web-short', 'form-short', 'form-round', 'web-nav']) {
    const themed = await css(get(id))
    await toggleStyles(true)
    expect(await css(get(id)), `${id} native unchanged`).toEqual(themed)
    await toggleStyles(false)
  }
  expect(errors).toEqual([])
  console.log(
    `${scenarios} responsive light/dark scenarios plus native scope passed. Screenshots: ${output}`,
  )
} finally {
  await browser?.close()
  await server.close()
}
