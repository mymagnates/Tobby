import { ref } from 'vue'
import { config, flushPromises, mount } from '@vue/test-utils'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import CreateProperty from '../../../src/components/CreateProperty.vue'

const mocks = vi.hoisted(() => ({ createDocument: vi.fn(), notify: vi.fn(), refresh: vi.fn(), push: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('../../../src/composables/useFirebase', () => ({
  useFirebase: () => ({
    createDocument: mocks.createDocument,
    loading: ref(false),
    userId: ref('pm1'),
  }),
}))
vi.mock('../../../src/stores/userDataStore', () => ({
  useUserDataStore: () => ({ userAccessibleProperties: [{ id: 'property1' }], loadAllUserData: mocks.refresh }),
}))
vi.mock('../../../src/services/webApiClient', () => ({
  billingApi: { getUsage: vi.fn().mockResolvedValue({ properties_used: 0, properties_limit: 10 }) },
}))
vi.mock('quasar', async (original) => ({
  ...(await original()),
  useQuasar: () => ({ notify: mocks.notify }),
}))

const plugins = config.global.plugins
beforeEach(() => {
  vi.clearAllMocks()
  mocks.refresh.mockResolvedValue(undefined)
  mocks.createDocument.mockResolvedValue('property1')
})
beforeAll(() => {
  config.global.plugins = []
})
afterAll(() => {
  config.global.plugins = plugins
})

it('omits restrooms from the form, new property payload and reset defaults', async () => {
  mocks.createDocument.mockResolvedValue('property1')
  const wrapper = mount(CreateProperty, {
    props: { autoNavigate: false },
    global: {
      stubs: {
        'q-form': { template: '<form><slot /></form>' },
        'q-card': { template: '<div><slot /></div>' },
        'q-card-section': { template: '<section><slot /></section>' },
        'q-input': { props: ['label'], template: '<label>{{ label }}</label>' },
      },
    },
  })
  await flushPromises()
  wrapper.vm.propertyData.type = 'Single Family'
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).not.toContain('Restrooms')
  expect(wrapper.text()).toContain('Full Bathrooms')
  expect(wrapper.text()).toContain('Half Bathrooms')
  expect(wrapper.vm.propertyData.spec).not.toHaveProperty('restroom')
  await wrapper.vm.onSubmit()
  const payload = mocks.createDocument.mock.calls.find(
    ([collection]) => collection === 'properties',
  )[1]
  expect(payload.spec).not.toHaveProperty('restroom')
  expect(payload.spec).toMatchObject({ full_bathroom: 2, half_bathroom: 1 })
  expect(wrapper.vm.propertyData.spec).not.toHaveProperty('restroom')
  expect(wrapper.emitted('property-created')).toHaveLength(1)
  wrapper.unmount()
})

it.each([true, false])('refreshes before completion for autoNavigate=%s and blocks duplicate saves', async (autoNavigate) => {
  let finishRefresh
  mocks.refresh.mockImplementation(() => new Promise((resolve) => { finishRefresh = resolve }))
  const wrapper = mount(CreateProperty, { props: { autoNavigate } })
  await flushPromises()
  const pending = wrapper.vm.onSubmit()
  await flushPromises()
  // Property plus PM/Owner role writes must finish before the refresh starts.
  expect(mocks.createDocument.mock.calls.map(([path]) => path)).toEqual([
    'properties', 'users/pm1/roles', 'users/pm1/roles',
  ])
  expect(mocks.refresh).toHaveBeenCalledOnce()
  expect(wrapper.emitted('property-created')).toBeUndefined()
  expect(mocks.push).not.toHaveBeenCalled()
  await wrapper.vm.onSubmit()
  expect(mocks.createDocument).toHaveBeenCalledTimes(3)
  finishRefresh()
  await pending
  expect(wrapper.emitted('property-created')).toHaveLength(1)
  if (autoNavigate) expect(mocks.push).toHaveBeenCalledWith('/my-properties')
  else expect(mocks.push).not.toHaveBeenCalled()
  wrapper.unmount()
})

it('reports refresh failure as saved, not as a failed creation', async () => {
  mocks.refresh.mockRejectedValue(new Error('Offline'))
  const wrapper = mount(CreateProperty, { props: { autoNavigate: false } })
  await flushPromises()
  await wrapper.vm.onSubmit()
  expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
    type: 'warning', message: expect.stringContaining('Property saved'),
  }))
  expect(wrapper.emitted('property-created')).toHaveLength(1)
  expect(wrapper.vm.submitting).toBe(false)
  wrapper.unmount()
})

it('keeps layout refresh dependency ordered rather than racing role and property fetches', () => {
  const source = readFileSync('src/layouts/MainLayout.vue', 'utf8')
  const handler = source.slice(source.indexOf('const handlePropertyCreated'), source.indexOf('const handleCreateRecordSaved'))
  expect(handler).not.toContain('loadProperties')
  const loader = source.slice(source.indexOf('const loadAllUserData = async'), source.indexOf('// Track if we need to redirect'))
  expect(loader).toContain('await userDataStore.loadAllUserData()')
  expect(loader).not.toContain('Promise.all')
})
