import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config, flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { readFileSync } from 'node:fs'
import WorkspacePage from '../../../src/pages/mobile/WorkspacePage.vue'
import mobileRoutes from '../../../src/router/mobileRoutes'

const mocks = vi.hoisted(() => ({
  store: null,
  route: null,
  rows: {},
  push: vi.fn(),
  replace: vi.fn(),
  read: vi.fn(),
}))
vi.mock('quasar', () => ({ Quasar: { install() {} }, Notify: { create: vi.fn() } }))
vi.mock('src/stores/userDataStore', () => ({ useUserDataStore: () => mocks.store }))
vi.mock('src/composables/useFirebase', () => ({
  useFirebase: () => ({ getAllDocuments: mocks.read }),
}))
vi.mock('src/boot/firebase', () => ({ auth: {} }))
vi.mock('src/services/mobileApi', () => ({ mobileRequest: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
    resolve: ({ path, query }) => ({
      fullPath: `${path}?${new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined))}`,
    }),
  }),
}))

let wrapper
const originalPlugins = config.global.plugins
const render = (mode = 'home') => {
  wrapper = mount(WorkspacePage, {
    props: { mode },
    global: {
      renderStubDefaultSlot: true,
      stubs: {
        WorkspaceHeader: {
          props: ['title', 'back'],
          template: '<header><h1>{{ title }}</h1><slot /></header>',
        },
      },
    },
  })
  return flushPromises()
}
beforeEach(() => {
  config.global.plugins = []
  vi.clearAllMocks()
  mocks.route = reactive({ path: '/mobile/pm/home', fullPath: '/mobile/pm/home', query: {} })
  mocks.store = reactive({
    userAccessibleProperties: [{ id: 'p1', nickname: 'Pinewood' }],
    loadUserRoles: vi.fn().mockResolvedValue(undefined),
    loadProperties: vi.fn(),
    loadLeases: vi.fn(),
  })
  mocks.rows = {
    mxrecords: Array.from({ length: 7 }, (_, i) => ({
      id: `task-${i}`,
      task_title: `Urgent task ${i}`,
      status: 'open',
      priority: 'urgent',
    })),
    reminders: [],
  }
  mocks.read.mockImplementation(async (path) => mocks.rows[path.split('/').at(-1)] || [])
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    callback()
    return 1
  })
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  wrapper?.unmount()
  config.global.plugins = originalPlugins
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('active Workspace Home/Manage wiring', () => {
  it('refreshes memberships before fetching properties, including a newly created property', async () => {
    let finishRoles
    mocks.store.loadUserRoles.mockImplementation(() => new Promise((resolve) => { finishRoles = resolve }))
    mocks.store.loadProperties.mockImplementation(async () => {
      mocks.store.userAccessibleProperties = [{ id: 'new-property', nickname: 'New property' }]
    })
    await render('property')
    expect(mocks.store.loadProperties).not.toHaveBeenCalled()
    finishRoles()
    await flushPromises()
    expect(mocks.store.loadProperties).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('New property')
  })

  it('refreshes on resume/network recovery and removes listeners on unmount', async () => {
    vi.useFakeTimers()
    await render('property')
    vi.clearAllMocks()
    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('online'))
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(150)
    await flushPromises()
    expect(mocks.store.loadUserRoles).toHaveBeenCalledOnce()
    expect(mocks.store.loadProperties).toHaveBeenCalledOnce()
    wrapper.unmount()
    vi.clearAllMocks()
    window.dispatchEvent(new Event('focus'))
    await vi.advanceTimersByTimeAsync(150)
    expect(mocks.store.loadUserRoles).not.toHaveBeenCalled()
  })

  it('renders five attention rows and moves the exact filter to Manage', async () => {
    await render()
    expect(wrapper.findAll('button.ios-row')).toHaveLength(5)
    expect(wrapper.find('header').text()).toBe('Home')
    expect(wrapper.find('header q-btn-stub').attributes('label')).toBe('New record')
    expect(wrapper.find('header q-btn-stub').attributes('ripple')).toBe('false')
    expect(wrapper.find('.ios-summary').exists()).toBe(false)
    expect(wrapper.find('q-select-stub').attributes('dropdown-icon')).toBe('expand_more')
    await wrapper.find('q-btn-stub[label="View all"]').trigger('click')
    expect(mocks.push.mock.calls.at(-1)[0]).toMatchObject({
      path: '/mobile/pm/manage',
      query: { filter: 'attention', returnTo: '/mobile/pm/home' },
    })
    await wrapper.find('button.ios-row').trigger('click')
    expect(mocks.push.mock.calls.at(-1)[0]).toEqual({
      path: '/mobile/pm/task/p1/task-0',
      query: { returnTo: '/mobile/pm/home' },
    })
  })

  it('opens the shared creation menu from Home with property and return context', async () => {
    mocks.route.query = { property: 'p1' }
    await render()
    await wrapper.find('header q-btn-stub[label="New record"]').trigger('click')
    const createDialog = wrapper.findAll('q-dialog-stub').find((dialog) => dialog.text().includes('New record'))
    expect(createDialog.attributes('modelvalue')).toBe('true')
    const transaction = wrapper.findAll('q-item-stub').find((item) => item.text().includes('Transaction'))
    await transaction.trigger('click')
    expect(mocks.push.mock.calls.at(-1)[0]).toMatchObject({
      path: '/mobile/pm/create',
      query: { kind: 'transaction', property: 'p1', returnTo: '/mobile/pm/home?property=p1' },
    })
  })

  it('explains a filtered empty queue and offers all tasks without the attention filter', async () => {
    mocks.route.query = { property: 'p1' }
    mocks.rows.mxrecords = [{ id: 'ordinary', task_title: 'Ordinary open task', status: 'open' }]
    await render()
    expect(wrapper.findAll('button.ios-row')).toHaveLength(0)
    expect(wrapper.text()).toContain('No urgent, overdue or due-today items.')
    await wrapper.find('q-btn-stub[label="View all tasks"]').trigger('click')
    expect(mocks.push.mock.calls.at(-1)[0]).toEqual({
      path: '/mobile/pm/manage',
      query: { type: 'tasks', property: 'p1', returnTo: '/mobile/pm/home?property=p1' },
    })
  })

  it('shows full attention in Manage and forwards property/filter context to creation', async () => {
    mocks.route.path = '/mobile/pm/manage'
    mocks.route.query = { property: 'p1', filter: 'attention', search: 'task' }
    await render('manage')
    expect(wrapper.findAll('button.ios-row')).toHaveLength(7)
    expect(wrapper.find('header q-btn-stub').attributes('label')).toBe('New record')
    const transaction = wrapper
      .findAll('q-item-stub')
      .find((item) => item.text().includes('Transaction'))
    await transaction.trigger('click')
    expect(mocks.push.mock.calls.at(-1)[0]).toMatchObject({
      path: '/mobile/pm/create',
      query: {
        kind: 'transaction',
        property: 'p1',
        returnTo: '/mobile/pm/manage?property=p1&filter=attention&search=task',
      },
    })
  })

  it('shows a saved transaction image and excludes inaccessible rows', async () => {
    mocks.route.query = { type: 'transactions' }
    mocks.rows.transactions = [
      { id: 'tx', description: 'Saved receipt', picture_url: 'https://example.test/receipt.png' },
    ]
    await render('manage')
    await wrapper.find('button.ios-row').trigger('click')
    expect(wrapper.find('img.ios-receipt').attributes('src')).toBe(
      'https://example.test/receipt.png',
    )
    mocks.store.userAccessibleProperties = []
    await flushPromises()
    expect(wrapper.findAll('button.ios-row')).toHaveLength(0)
    expect(wrapper.find('img.ios-receipt').exists()).toBe(false)
  })

  it('distinguishes request failure and no-properties state from all-clear', async () => {
    mocks.read.mockRejectedValueOnce(new Error('Offline'))
    await render()
    expect(wrapper.find('[role="alert"]').text()).toContain('Offline')
    expect(wrapper.text()).not.toContain('No urgent, overdue or due-today items.')
    wrapper.unmount()
    mocks.store.userAccessibleProperties = []
    await render()
    expect(wrapper.text()).toContain('Set up a property on the web')
    expect(wrapper.text()).not.toContain('No urgent, overdue or due-today items.')
  })

  it('keeps the guarded task route and legacy records query redirect', () => {
    const children = mobileRoutes[0].children
    expect(children.find((route) => route.path === 'pm/task/:propertyId/:taskId').meta).toEqual({
      requiresAuth: true,
      mobilePm: true,
      mobileDetail: true,
    })
    const query = { property: 'p1', type: 'transactions' }
    expect(children.find((route) => route.path === 'pm/records').redirect({ query })).toEqual({
      path: '/mobile/pm/manage',
      query,
    })
    const layout = readFileSync('src/layouts/MobileWorkspaceLayout.vue', 'utf8')
    expect(layout).toContain('route.meta.mobileDetail')
    expect(layout).toContain("label: 'Manage'")
  })
})
