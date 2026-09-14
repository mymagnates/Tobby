import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile, defineComponent } from 'vue'
import { mount, config } from '@vue/test-utils'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
vi.unmock('vue-router')
import { createMemoryHistory, createRouter } from 'vue-router'
import routes from '../../../src/router/routes'

// Render the real shell header fragment with real resolved route metadata.
const source = readFileSync(resolve('src/layouts/MainLayout.vue'), 'utf8')
const fragment = source.match(
  /<div\s+v-if="[^"]+"\s+class="workspace-page-heading"[\s\S]*?<\/div>/,
)?.[0]
const router = createRouter({ history: createMemoryHistory(), routes })
const heading = (path, overrides = {}) =>
  mount(
    defineComponent({
      setup: () => ({
        route: router.resolve(path),
        isNativePmOnlyLaunch: false,
        isIndexDashboard: false,
        requiresSingleProperty: () => false,
        headerPageTitle: 'Workspace title',
        ...overrides,
      }),
      render: compile(fragment),
    }),
  )

describe('workspace page headings', () => {
  let plugins
  beforeEach(() => {
    plugins = config.global.plugins
    config.global.plugins = []
  })
  afterEach(() => {
    config.global.plugins = plugins
  })
  it('lets the reporting page own its only title, including property-scoped URLs', () => {
    for (const path of ['/reports', '/reports?propertyId=p1']) {
      expect(router.resolve(path).meta.ownsPageHeading).toBe(true)
      const wrapper = heading(path)
      expect(wrapper.find('h1').exists()).toBe(false)
      wrapper.unmount()
    }
  })
  it('preserves headings for other workspace pages', () => {
    const wrapper = heading('/transactions')
    expect(wrapper.find('h1').text()).toBe('Workspace title')
    wrapper.unmount()
  })
})
