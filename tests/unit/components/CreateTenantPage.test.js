import { shallowMount, config, flushPromises } from '@vue/test-utils'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import CreateTenantPage from '../../../src/pages/CreateTenantPage.vue'
const mocks = vi.hoisted(() => ({ save: vi.fn(), notify: vi.fn(), push: vi.fn() }))
vi.mock('../../../src/services/tenantApi', () => ({ createPropertyTenantRequest: mocks.save }))
vi.mock('../../../src/composables/useFirebase', () => ({ useFirebase: () => ({ uploadImagesWithDetails: vi.fn() }) }))
vi.mock('../../../src/stores/userDataStore', () => ({ useUserDataStore: () => ({ userAccessibleProperties: [], userAccessibleLeases: [] }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ push: mocks.push }) }))
vi.mock('quasar', async (original) => ({ ...(await original()), useQuasar: () => ({ notify: mocks.notify }) }))
const plugins = config.global.plugins
let wrapper
beforeEach(() => { config.global.plugins = []; vi.clearAllMocks(); mocks.save.mockResolvedValue({}); wrapper = shallowMount(CreateTenantPage) })
afterEach(() => { wrapper.unmount(); config.global.plugins = plugins })
it.each(['l1', null])('saves tenant with lease %s without duplicating lease dates or rent', async (leaseId) => {
  Object.assign(wrapper.vm.formData, { propertyId: 'p1', leaseId, firstName: 'A', lastName: 'B', email: 'a@example.test', phone: '1234567890' })
  await wrapper.vm.handleSubmit()
  await flushPromises()
  expect(mocks.save).toHaveBeenCalledOnce()
  expect(mocks.save.mock.calls[0][0]).toMatchObject({ propertyId: 'p1', leaseId })
  expect(mocks.save.mock.calls[0][0].tenant).not.toHaveProperty('leaseStartDate')
  expect(mocks.push).toHaveBeenCalledWith('/leases')
})
it('still rejects a missing property', async () => {
  await wrapper.vm.handleSubmit()
  expect(mocks.save).not.toHaveBeenCalled()
  expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ message: 'Please select a property' }))
})
