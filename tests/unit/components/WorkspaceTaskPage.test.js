import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { config, flushPromises, mount } from '@vue/test-utils'
const plugins = config.global.plugins
vi.mock('src/boot/firebase', () => ({ auth: { currentUser: null }, authStateReady: Promise.resolve() }))
vi.unmock('vue-router')
import { createMemoryHistory, createRouter } from 'vue-router'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), key: vi.fn(), upload: vi.fn(), createUpload: vi.fn() }))
vi.mock('src/services/taskCommentsApi', async (original) => ({
  ...await original(), getTaskComments: api.get, postTaskComment: api.post, createTaskCommentKey: api.key,
}))
vi.mock('src/services/recordPhotoUpload', () => ({ createRecordPhotoUpload: api.createUpload }))
vi.mock('src/components/RecordPhotoPicker.vue', () => ({
  default: defineComponent({ name: 'RecordPhotoPicker', props: ['modelValue', 'disabled'], emits: ['update:modelValue', 'busy', 'error'], template: '<div data-photo-picker />' }),
}))
import WorkspaceTaskPage from '../../../src/pages/mobile/WorkspaceTaskPage.vue'

const fixture = () => ({
  id: 't1', task_title: 'Repair leaking faucet', property_name: 'Pinewood', status: 'open', priority: 'urgent', description: 'Kitchen sink',
  image_urls: ['https://example.com/task.jpg', 'javascript:alert(1)'],
  logs: [
    { comment: 'Original report', user_name: 'Ada', log_timestamp: { seconds: 1700000000 }, action_type: 'comment', image_urls: ['https://example.com/photo.jpg'] },
    { comment: 'Legacy without metadata', image_urls: ['data:text/html,bad'] },
  ],
})
let wrapper, router
const button = (text) => wrapper.findAll('button').find((node) => node.text() === text)
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
async function start(query = {}) {
  router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/mobile/pm/task/:propertyId/:taskId', component: WorkspaceTaskPage },
    { path: '/mobile/pm/manage', component: { template: '<p>Manage destination</p>' } },
    { path: '/mobile/pm/home', component: { template: '<p>Home destination</p>' } },
  ] })
  await router.push({ path: '/mobile/pm/task/p1/t1', query })
  wrapper = mount(defineComponent({ template: '<router-view />' }), {
    global: { plugins: [router], stubs: {
      'q-dialog': defineComponent({ props: ['modelValue'], template: '<div v-if="modelValue" role="dialog"><slot /></div>' }),
      'q-card': { template: '<div><slot /></div>' },
    } },
  })
  await flushPromises()
}
async function fill(text = 'I called the plumber') { await wrapper.get('textarea').setValue(text) }
async function submit() { await wrapper.get('form').trigger('submit'); await flushPromises() }

describe('dedicated mobile task detail', () => {
  beforeEach(() => {
    config.global.plugins = []
    vi.clearAllMocks()
    api.get.mockResolvedValue({ task: fixture(), can_comment: true })
    api.post.mockResolvedValue({ task: { ...fixture(), logs: [...fixture().logs, { id: 'c1', user_name: 'Server Author', log_timestamp: '2026-09-11T12:00:00Z', action_type: 'update', comment: 'Saved by server' }] }, comment: { id: 'c1' }, can_comment: true })
    api.key.mockReturnValue('stable-key')
    api.upload.mockResolvedValue('https://example.com/committed.jpg')
    api.createUpload.mockReturnValue({ upload: api.upload })
  })
  afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals(); config.global.plugins = plugins })

  it('renders canonical legacy logs and server metadata without inventing authors or dates', async () => {
    await start()
    expect(wrapper.text()).toContain('Pinewood')
    expect(wrapper.text()).toContain('Original report')
    expect(wrapper.text()).toContain('Author not recorded')
    expect(wrapper.text()).toContain('Time not recorded')
    expect(wrapper.get('time').attributes('datetime')).toBe('2023-11-14T22:13:20.000Z')
    expect(wrapper.findAll('img')).toHaveLength(2)
    expect(wrapper.findAll('a').every((link) => link.attributes('href').startsWith('https://'))).toBe(true)
  })
  it('shows history without a composer when server denies commenting', async () => {
    api.get.mockResolvedValue({ task: fixture(), can_comment: false })
    await start()
    expect(wrapper.text()).toContain('Read-only history')
    expect(wrapper.text()).toContain('Original report')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(api.post).not.toHaveBeenCalled()
  })
  it('defaults to update, disables blanks, adopts only server success and clears draft', async () => {
    await start()
    expect(wrapper.get('select').element.value).toBe('update')
    expect(button('Send').element.disabled).toBe(true)
    await fill()
    await submit()
    expect(api.post).toHaveBeenCalledWith('p1', 't1', { comment: 'I called the plumber', action_type: 'update', image_urls: [] }, expect.objectContaining({ idempotencyKey: 'stable-key' }))
    expect(wrapper.text()).toContain('Server Author')
    expect(wrapper.text()).toContain('Saved by server')
    expect(wrapper.text()).toContain('Update sent.')
    expect(wrapper.get('textarea').element.value).toBe('')
  })
  it('locks pending sends, prevents double submission and does not append optimistic logs', async () => {
    const waiting = deferred()
    api.post.mockReturnValue(waiting.promise)
    await start(); await fill(); await submit(); await submit()
    expect(api.post).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('.task-timeline li')).toHaveLength(2)
    expect(button('Sending...').element.disabled).toBe(true)
    expect(wrapper.get('textarea').element.disabled).toBe(true)
    waiting.reject(new Error('Offline'))
    await flushPromises()
  })
  it('retains a failed draft and retries its exact body and key without mutating history', async () => {
    api.post.mockRejectedValueOnce(new Error('Offline'))
    await start(); await fill(); await submit()
    expect(wrapper.text()).toContain('Offline')
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
    expect(wrapper.findAll('.task-timeline li')).toHaveLength(2)
    expect(button('Retry send')).toBeTruthy()
    await submit()
    expect(api.key).toHaveBeenCalledTimes(1)
    expect(api.post.mock.calls[1].slice(0, 3)).toEqual(api.post.mock.calls[0].slice(0, 3))
    expect(api.post.mock.calls[1][3].idempotencyKey).toBe('stable-key')
  })
  it('requires explicit resolve confirmation and preserves draft on cancel', async () => {
    await start(); await fill()
    expect(wrapper.find('option[value="resolution"]').exists()).toBe(false)
    await button('Resolve...').trigger('click')
    expect(api.post).not.toHaveBeenCalled()
    await button('Keep editing').trigger('click'); await flushPromises()
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
    await button('Resolve...').trigger('click')
    await button('Resolve task').trigger('click'); await flushPromises()
    expect(api.post.mock.calls[0][2].action_type).toBe('resolution')
  })
  it('cancel action is a normal history event and never changes status locally', async () => {
    api.post.mockRejectedValue(new Error('Offline'))
    await start(); await fill(); await wrapper.get('select').setValue('cancel'); await submit()
    expect(api.post.mock.calls[0][2].action_type).toBe('cancel')
    expect(wrapper.text()).toContain('Status: open')
  })
  it('retains drafts on rejected navigation and restores the sanitized return context after discard', async () => {
    await start({ returnTo: '/mobile/pm/manage?property=p1&filter=attention&scroll=240' })
    await fill()
    await wrapper.get('[aria-label="Back to records"]').trigger('click'); await flushPromises()
    expect(wrapper.text()).toContain('Leave and discard draft?')
    await button('Keep editing').trigger('click'); await flushPromises()
    expect(router.currentRoute.value.path).toBe('/mobile/pm/task/p1/t1')
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
    await wrapper.get('[aria-label="Back to records"]').trigger('click'); await flushPromises()
    await button('Discard and leave').trigger('click'); await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/mobile/pm/manage?property=p1&filter=attention&scroll=240')
  })
  it('blocks browser/task-to-task navigation and preserves drafts on query-only updates', async () => {
    await start(); await fill()
    await router.replace({ query: { returnTo: '/mobile/pm/home' } }); await flushPromises()
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
    const navigation = router.push('/mobile/pm/task/p2/t2')
    await flushPromises()
    await button('Keep editing').trigger('click'); await navigation
    expect(api.get).toHaveBeenCalledTimes(1)
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
  it('requires discard confirmation rather than silently clearing a draft', async () => {
    await start(); await fill(); await button('Discard').trigger('click')
    await button('Keep editing').trigger('click'); await flushPromises()
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
    await button('Discard').trigger('click'); await button('Discard draft').trigger('click'); await flushPromises()
    expect(wrapper.get('textarea').element.value).toBe('')
  })
  it('fails closed on access loss without changing task history and can recheck access', async () => {
    api.post.mockRejectedValueOnce(Object.assign(new Error('Access removed'), { status: 403 }))
    await start(); await fill(); await submit()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('unsent draft is retained')
    expect(wrapper.findAll('.task-timeline li')).toHaveLength(2)
    await button('Check access again').trigger('click'); await flushPromises()
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
  })
  it('distinguishes loading failure from empty history and retries', async () => {
    api.get.mockRejectedValueOnce(new Error('Network unavailable'))
    await start()
    expect(wrapper.text()).toContain('Network unavailable')
    expect(wrapper.text()).not.toContain('No updates yet.')
    await button('Retry loading').trigger('click'); await flushPromises()
    expect(wrapper.text()).toContain('Original report')
  })
  it('never sends without a selected photo after upload failure and reuses its upload attempt', async () => {
    api.upload.mockRejectedValueOnce(new Error('Upload failed'))
    await start(); await fill()
    const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })
    wrapper.findComponent({ name: 'RecordPhotoPicker' }).vm.$emit('update:modelValue', photo)
    await nextTick(); await submit()
    expect(api.post).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Upload failed')
    expect(wrapper.findComponent({ name: 'RecordPhotoPicker' }).props('modelValue')).toBe(photo)
    await submit()
    expect(api.createUpload).toHaveBeenCalledTimes(1)
    expect(api.upload).toHaveBeenCalledTimes(2)
    expect(api.post.mock.calls[0][2].image_urls).toEqual(['https://example.com/committed.jpg'])
  })
  it('reuses committed photo and comment key after failed POST', async () => {
    api.post.mockRejectedValueOnce(new Error('Lost response'))
    await start(); await fill()
    wrapper.findComponent({ name: 'RecordPhotoPicker' }).vm.$emit('update:modelValue', new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }))
    await nextTick(); await submit(); await submit()
    expect(api.upload).toHaveBeenCalledTimes(1)
    expect(api.createUpload).toHaveBeenCalledTimes(1)
    expect(api.post.mock.calls[1][3].idempotencyKey).toBe(api.post.mock.calls[0][3].idempotencyKey)
  })
  it('preserves input on picker cancellation and prevents navigation while native picker is busy', async () => {
    await start(); await fill()
    const picker = wrapper.findComponent({ name: 'RecordPhotoPicker' })
    picker.vm.$emit('busy', true); await nextTick()
    expect(button('Send').element.disabled).toBe(true)
    await router.push('/mobile/pm/manage'); await flushPromises()
    expect(router.currentRoute.value.path).toBe('/mobile/pm/task/p1/t1')
    picker.vm.$emit('busy', false); await nextTick()
    expect(wrapper.get('textarea').element.value).toBe('I called the plumber')
  })
  it('tracks the visual viewport for keyboard-safe fixed layout and cleans up listeners', async () => {
    const viewport = new EventTarget()
    Object.assign(viewport, { height: 410, offsetTop: 24 })
    const remove = vi.spyOn(viewport, 'removeEventListener')
    vi.stubGlobal('visualViewport', viewport)
    await start()
    expect(wrapper.get('main').attributes('style')).toContain('--task-height: 410px')
    expect(wrapper.get('main').attributes('style')).toContain('--task-top: 24px')
    viewport.height = 700; viewport.dispatchEvent(new Event('resize')); await nextTick()
    expect(wrapper.get('main').attributes('style')).toContain('--task-height: 700px')
    wrapper.unmount(); wrapper = null
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
