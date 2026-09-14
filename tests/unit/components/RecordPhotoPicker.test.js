import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config, flushPromises, mount } from '@vue/test-utils'
const plugins = config.global.plugins
import RecordPhotoPicker from 'src/components/RecordPhotoPicker.vue'
import { pickNativePhoto } from 'src/services/recordPhoto'
vi.mock('src/services/recordPhoto', async (original) => ({ ...(await original()), pickNativePhoto: vi.fn() }))
vi.mock('src/utils/mobileRuntime', () => ({ isNativeMobileRuntime: () => true }))
let wrapper
let createURL, revokeURL
const file = new File(['receipt'], 'receipt.png', { type: 'image/png' })
beforeEach(() => {
  config.global.plugins = []
  vi.clearAllMocks()
  createURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks(); config.global.plugins = plugins })
function render(props = {}) {
  wrapper = mount(RecordPhotoPicker, { props })
  return wrapper
}
describe('record photo picker', () => {
  it('renders a preview and revokes replaced and unmounted preview URLs', async () => {
    render({ modelValue: file })
    expect(wrapper.find('img').attributes('src')).toBe('blob:preview')
    await wrapper.setProps({ modelValue: new File(['new'], 'new.png', { type: 'image/png' }) })
    expect(revokeURL).toHaveBeenCalledWith('blob:preview')
    expect(createURL).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    wrapper = null
    expect(revokeURL).toHaveBeenCalledTimes(2)
  })
  it('preserves the existing photo on native cancel and permission error', async () => {
    render({ modelValue: file })
    pickNativePhoto.mockResolvedValueOnce(null)
    await wrapper.vm.chooseNative('photos')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('busy')).toEqual([[true], [false]])
    pickNativePhoto.mockRejectedValueOnce(new Error('Access denied. Your draft is unchanged.'))
    await wrapper.vm.chooseNative('camera')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').text()).toContain('draft is unchanged')
    expect(wrapper.find('img').exists()).toBe(true)
  })
  it('emits valid native replacements only after selection completes', async () => {
    render({ modelValue: file })
    const replacement = new File(['new'], 'new.jpg', { type: 'image/jpeg' })
    pickNativePhoto.mockResolvedValueOnce(replacement)
    await wrapper.vm.chooseNative('camera')
    expect(wrapper.emitted('update:modelValue')).toEqual([[replacement]])
  })
  it('preserves model on browser cancel or invalid file and supports explicit removal', () => {
    render({ modelValue: file })
    wrapper.vm.chooseFile({ target: { files: [] } })
    wrapper.vm.chooseFile({ target: { files: [new File(['bad'], 'bad.txt', { type: 'text/plain' })] } })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.vm.chooseFile({ target: { files: [file] } })
    expect(wrapper.emitted('update:modelValue')).toEqual([[file]])
    wrapper.vm.remove()
    expect(wrapper.emitted('update:modelValue')[1]).toEqual([null])
  })
  it('blocks native selection and removal while disabled', async () => {
    render({ modelValue: file, disabled: true })
    await wrapper.vm.chooseNative('camera')
    wrapper.vm.remove()
    expect(pickNativePhoto).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
  it('ignores a late picker result after unmount', async () => {
    render()
    let resolve
    pickNativePhoto.mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    const pending = wrapper.vm.chooseNative('camera')
    wrapper.unmount()
    resolve(file)
    await pending
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper = null
  })
})
