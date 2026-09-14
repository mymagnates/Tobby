import { ref } from 'vue'
import { config, flushPromises, mount } from '@vue/test-utils'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import CreateProperty from '../../../src/components/CreateProperty.vue'

const mocks = vi.hoisted(() => ({ createDocument: vi.fn(), notify: vi.fn() }))
vi.mock('../../../src/composables/useFirebase', () => ({
  useFirebase: () => ({
    createDocument: mocks.createDocument,
    loading: ref(false),
    userId: ref('pm1'),
  }),
}))
vi.mock('../../../src/stores/userDataStore', () => ({
  useUserDataStore: () => ({ userAccessibleProperties: [] }),
}))
vi.mock('../../../src/services/webApiClient', () => ({
  billingApi: { getUsage: vi.fn().mockResolvedValue({ properties_used: 0, properties_limit: 10 }) },
}))
vi.mock('quasar', async (original) => ({
  ...(await original()),
  useQuasar: () => ({ notify: mocks.notify }),
}))

const plugins = config.global.plugins
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
