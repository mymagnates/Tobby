import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { config, mount } from '@vue/test-utils'
import InventorySignature from '../../../src/components/mobile/InventorySignature.vue'

let wrapper
const plugins = config.global.plugins
beforeEach(() => {
  config.global.plugins = []
  config.global.stubs['q-btn'] = { props: ['label', 'disable'], template: '<button :disabled="disable">{{ label }}</button>' }
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} })
  HTMLCanvasElement.prototype.setPointerCapture = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 600, height: 240 })
  vi.spyOn(HTMLCanvasElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
  vi.spyOn(HTMLCanvasElement.prototype, 'clientHeight', 'get').mockReturnValue(240)
})
afterEach(() => { wrapper?.unmount(); config.global.plugins = plugins; delete config.global.stubs['q-btn']; vi.restoreAllMocks(); vi.unstubAllGlobals() })
const strokes = [[[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]]
it('sizes the backing canvas from layout rather than a collapsed dialog transform', () => {
  HTMLCanvasElement.prototype.getBoundingClientRect.mockReturnValue({ left: 0, top: 0, width: 0, height: 0 })
  wrapper = mount(InventorySignature, { props: { modelValue: strokes, readonly: true } })
  expect(wrapper.find('canvas').element.width).toBe(600 * window.devicePixelRatio)
  expect(wrapper.find('canvas').element.height).toBe(240 * window.devicePixelRatio)
})
function pointer(canvas, type, values = {}) {
  const event = new Event(type)
  Object.assign(event, values)
  canvas.element.dispatchEvent(event)
}
it('undoes supplied strokes and respects parent resets before the next drawing', async () => {
  wrapper = mount(InventorySignature, { props: { modelValue: strokes } })
  const undo = wrapper.findAll('button').find(button => button.text().includes('Undo last stroke'))
  await undo.trigger('click')
  expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual([])
  await wrapper.setProps({ modelValue: [] })
  const canvas = wrapper.find('canvas')
  pointer(canvas, 'pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 60, clientY: 24 })
  pointer(canvas, 'pointermove', { pointerId: 1, clientX: 120, clientY: 48 })
  pointer(canvas, 'pointermove', { pointerId: 1, clientX: 180, clientY: 72 })
  pointer(canvas, 'pointerup', { pointerId: 1 })
  expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual([[[0.1, 0.1], [0.2, 0.2], [0.3, 0.3]]])
})
it('does not draw in readonly mode or with the right mouse button', async () => {
  wrapper = mount(InventorySignature, { props: { readonly: true, modelValue: strokes } })
  const canvas = wrapper.find('canvas')
  pointer(canvas, 'pointerdown', { pointerId: 1, button: 0 })
  pointer(canvas, 'pointerup')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ readonly: false })
  pointer(canvas, 'pointerdown', { pointerId: 1, pointerType: 'mouse', button: 2 })
  pointer(canvas, 'pointerup')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('draws without holding a trackpad button and finishes on the second click', async () => {
  wrapper = mount(InventorySignature)
  await wrapper.findAll('button').find(button => button.text().includes('Use trackpad mode')).trigger('click')
  const canvas = wrapper.find('canvas')
  await canvas.trigger('click', { clientX: 60, clientY: 24 })
  pointer(canvas, 'pointermove', { pointerId: 7, buttons: 0, clientX: 120, clientY: 48 })
  pointer(canvas, 'pointermove', { pointerId: 7, buttons: 0, clientX: 180, clientY: 72 })
  pointer(canvas, 'pointerup', { pointerId: 7 })
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await canvas.trigger('click', { clientX: 180, clientY: 72 })
  expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual([[[0.1, 0.1], [0.2, 0.2], [0.3, 0.3]]])
})

it('ends a trackpad stroke on leaving the pad and never records hover movement afterwards', async () => {
  wrapper = mount(InventorySignature)
  await wrapper.findAll('button').find(button => button.text().includes('Use trackpad mode')).trigger('click')
  const canvas = wrapper.find('canvas')
  await canvas.trigger('click', { clientX: 60, clientY: 24 })
  pointer(canvas, 'pointermove', { pointerId: 7, clientX: 120, clientY: 48 })
  pointer(canvas, 'pointerleave')
  const saved = wrapper.emitted('update:modelValue').at(-1)[0]
  pointer(canvas, 'pointermove', { pointerId: 7, clientX: 500, clientY: 100 })
  expect(saved).toEqual([[[0.1, 0.1], [0.2, 0.2]]])
  expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
})
