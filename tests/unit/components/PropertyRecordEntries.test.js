import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { config, flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { readFileSync } from 'node:fs'
import PropertyView from '../../../src/pages/PropertyView.vue'

const mocks = vi.hoisted(() => ({ store: null, read: vi.fn(), refresh: vi.fn() }))
vi.mock('src/stores/userDataStore', () => ({ useUserDataStore: () => mocks.store }))
vi.mock('src/composables/useFirebase', () => ({ useFirebase: () => ({
  getAllDocuments: mocks.read, getDocument: async () => null,
}) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {}, path: '/property-view' }), useRouter: () => ({ push: vi.fn() }) }))
vi.mock('src/boot/firebase', () => ({ auth: {}, db: {}, authStateReady: Promise.resolve() }))

const plugins = config.global.plugins
let wrapper
beforeEach(() => {
  config.global.plugins = []
  vi.clearAllMocks()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  mocks.read.mockResolvedValue([])
  mocks.refresh.mockResolvedValue(undefined)
  const property = { id: 'p1', nickname: 'Pine', spec: {} }
  mocks.store = reactive({
    user: { uid: 'pm1' }, userId: 'pm1', isAuthenticated: true,
    isManagerCapableUser: true, loading: false,
    properties: [property], userAccessibleProperties: [property], userRoles: [{ role: 'pm', property_id: 'p1' }],
    mxRecords: [], transactions: [], leases: [], userAccessibleLeases: [],
    userAccessibleMxRecords: [], userAccessibleTransactions: [],
    getUserRoleForProperty: () => ({ role: 'pm' }), canManageProperty: () => true,
    canShareProperty: () => false, loadAllUserData: mocks.refresh,
  })
})
afterEach(() => {
  wrapper?.unmount()
  config.global.plugins = plugins
  vi.restoreAllMocks()
})
async function render() {
  wrapper = shallowMount(PropertyView, { global: { renderStubDefaultSlot: true } })
  await flushPromises()
}

it.each([
  ['task', 'showCreateMxRecordDialog'], ['transaction', 'showCreateTransactionDialog'],
  ['lease', 'showCreateLeaseDialog'], ['asset', 'showCreateAssetDialog'],
  ['document', 'showExtraRecordDialog'], ['service', 'showExtraRecordDialog'], ['reminder', 'showExtraRecordDialog'],
])('opens the %s create entry with the selected property', async (kind, state) => {
  await render()
  await wrapper.findAll('q-btn-stub').find((button) => button.attributes('label') === `Create ${kind}`).trigger('click')
  await flushPromises()
  expect(wrapper.vm[state]).toBe(true)
  expect(wrapper.vm.selectedProperty.id).toBe('p1')
  if (state === 'showExtraRecordDialog') expect(wrapper.vm.extraRecordKind).toBe(kind)
})

it('hides create entries and blocks handlers for a read-only property', async () => {
  mocks.store.canManageProperty = () => false
  await render()
  expect(wrapper.findAll('q-btn-stub').some((button) => /^Create (lease|task|transaction|asset|document|service|reminder)$/.test(button.attributes('label') || ''))).toBe(false)
  wrapper.vm.openPropertyRecord('lease')
  expect(wrapper.vm.showCreateLeaseDialog).toBe(false)
})

it('refreshes property-local records after creating a reminder, document or service', async () => {
  await render()
  mocks.read.mockClear()
  await wrapper.vm.onExtraRecordCreated()
  expect(mocks.refresh).toHaveBeenCalledOnce()
  expect(mocks.read).toHaveBeenCalledWith('properties/p1/reminders')
  expect(mocks.read).toHaveBeenCalledWith('properties/p1/documents')
})

it('places Lease after Document on Home and passes the active property into the lease form', () => {
  const source = readFileSync('src/pages/IndexPage.vue', 'utf8')
  const actions = source.slice(source.indexOf('aria-label="Create a new record"'), source.indexOf('aria-label="Operations summary"'))
  expect(actions.indexOf('label="+Lease"')).toBeGreaterThan(actions.indexOf('label="+Document"'))
  expect(actions.indexOf('label="+Lease"')).toBeLessThan(actions.indexOf('label="Ask Tobby"'))
  expect(source).toContain('<CreateLease :property-id="dashboardPropertyId"')
})
