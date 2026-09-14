import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config, shallowMount } from '@vue/test-utils'
const plugins = config.global.plugins
import { reactive } from 'vue'
import WorkspaceCreatePage from 'src/pages/mobile/WorkspaceCreatePage.vue'
const mocks = vi.hoisted(() => ({ route: null, router: null, store: null, guard: null, getDocument: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => mocks.route, useRouter: () => mocks.router, onBeforeRouteLeave: (fn) => { mocks.guard = fn } }))
vi.mock('src/stores/userDataStore', () => ({ useUserDataStore: () => mocks.store }))
vi.mock('src/composables/useFirebase', () => ({ useFirebase: () => ({ getDocument: mocks.getDocument }) }))
let wrapper
beforeEach(() => {
  config.global.plugins = []
  vi.clearAllMocks()
  mocks.route = reactive({ query: { kind: 'transaction', property: 'p1' } })
  mocks.router = { push: vi.fn(), back: vi.fn(), options: { history: { state: {} } } }
  mocks.store = { userAccessibleProperties: [{ id: 'p1', nickname: 'One' }], loadProperties: vi.fn() }
  mocks.getDocument.mockResolvedValue(null)
})
afterEach(() => { wrapper?.unmount(); config.global.plugins = plugins })
function render() {
  wrapper = shallowMount(WorkspaceCreatePage, { global: { stubs: { 'q-page': { template: '<main><slot /></main>' } } } })
  return wrapper
}
describe('mobile transaction receipt and return context', () => {
  it('shows the saved image after readback and clears the draft guard', async () => {
    render()
    wrapper.vm.hasDraft = true
    mocks.getDocument.mockResolvedValueOnce({ picture_url: 'https://example.test/readback.jpg', amount: 10 })
    await wrapper.vm.complete({ id: 't1', property_id: 'p1', picture_url: 'https://example.test/photo.jpg' })
    expect(wrapper.find('img').attributes('src')).toBe('https://example.test/readback.jpg')
    expect(mocks.getDocument).toHaveBeenCalledWith('properties/p1/transactions/t1')
    expect(mocks.guard()).toBe(true)
  })
  it('keeps the confirmed receipt if readback fails', async () => {
    render()
    mocks.getDocument.mockRejectedValueOnce(new Error('offline'))
    await wrapper.vm.complete({ id: 't1', picture_url: 'https://example.test/photo.jpg' })
    expect(wrapper.find('img').attributes('src')).toBe('https://example.test/photo.jpg')
  })
  it('does not render unsafe legacy URLs', async () => {
    render()
    await wrapper.vm.complete({ id: 't1', picture_url: 'javascript:alert(1)' })
    expect(wrapper.find('img').exists()).toBe(false)
  })
  it('returns to the exact sanitized list/filter/scroll context', () => {
    mocks.route.query.returnTo = '/mobile/pm/manage?property=p1&type=transactions&filter=attention&scroll=380'
    render()
    wrapper.vm.returnToContext()
    expect(mocks.router.push).toHaveBeenCalledWith(mocks.route.query.returnTo)
  })
  it('uses history back when returning to the same context', () => {
    mocks.route.query.returnTo = '/mobile/pm/property?property=p1'
    mocks.router.options.history.state.back = mocks.route.query.returnTo
    render()
    wrapper.vm.returnToContext()
    expect(mocks.router.back).toHaveBeenCalledOnce()
  })
  it('rejects an external return target and keeps property context in fallback', () => {
    mocks.route.query.returnTo = 'https://attacker.test'
    render()
    wrapper.vm.returnToContext()
    expect(mocks.router.push).toHaveBeenCalledWith({ path: '/mobile/pm/manage', query: { property: 'p1' } })
  })
  it('blocks navigation during picker/save and confirms draft discard', async () => {
    render()
    wrapper.vm.formBusy = true
    expect(mocks.guard()).toBe(false)
    wrapper.vm.returnToContext()
    expect(mocks.router.push).not.toHaveBeenCalled()
    wrapper.vm.formBusy = false
    wrapper.vm.hasDraft = true
    const kept = mocks.guard()
    wrapper.vm.answerDiscard(false)
    expect(await kept).toBe(false)
    expect(wrapper.vm.hasDraft).toBe(true)
    const discarded = mocks.guard()
    wrapper.vm.answerDiscard(true)
    expect(await discarded).toBe(true)
  })
})
