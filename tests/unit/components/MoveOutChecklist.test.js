import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config, mount } from '@vue/test-utils'
import MoveOutChecklist from '../../../src/components/inventory/MoveOutChecklist.vue'

let wrapper
const plugins = config.global.plugins
beforeEach(() => { config.global.plugins = [] })
const entry = (overrides = {}) => ({
  item_id: 'keys', name: 'Front door keys', area: 'Entrance', kind: 'access',
  condition: 'good', quantity: null, checked: false, photos: [],
  move_in: { batch_id: 'in', condition: 'good', quantity: 2, photos: [{ path: 'in', url: '/in.jpg' }] },
  reference: { batch_id: 'later', condition: 'good', quantity: 3, photos: [{ path: 'later', url: '/later.jpg' }] },
  ...overrides,
})
function render(item = entry(), props = {}) {
  wrapper = mount(MoveOutChecklist, {
    props: { entries: [item], conditions: [{ value: 'good', label: 'Good' }], ...props },
    global: { stubs: {
      'q-checkbox': { name: 'QCheckbox', props: ['disable', 'modelValue'], template: '<input type="checkbox" :disabled="disable" />' },
      'q-select': { name: 'QSelect', props: ['modelValue'], template: '<div />' },
    } },
  })
  return wrapper
}
afterEach(() => { wrapper?.unmount(); config.global.plugins = plugins })

describe('access quantities', () => {
  it('shows both reference counts and keeps an unknown actual count blank', () => {
    render()
    expect(wrapper.get('input[type="number"]').element.value).toBe('')
    expect(wrapper.text()).toContain('Count: 2')
    expect(wrapper.text()).toContain('Count: 3')
    expect(wrapper.text()).toContain('Enter a whole number from 0 to 999 to check.')
  })

  it.each([null, undefined, -1, 1000, 1.5, '2', NaN])('blocks checking invalid count %s', quantity => {
    render(entry({ quantity }))
    expect(wrapper.getComponent({ name: 'QCheckbox' }).props('disable')).toBe(true)
  })

  it.each([0, 2, 999])('allows checking valid count %s', quantity => {
    render(entry({ quantity }))
    expect(wrapper.getComponent({ name: 'QCheckbox' }).props('disable')).toBe(false)
  })

  it('emits numeric changes and null when cleared without mutating the entry', async () => {
    const item = entry()
    render(item)
    const input = wrapper.get('input')
    for (const [value, expected] of [['0', 0], ['999', 999], ['1.5', 1.5], ['1000', 1000], ['', null]]) {
      input.element.value = value
      await input.trigger('change')
      expect(wrapper.emitted('quantity').at(-1)).toEqual([item, expected])
    }
    expect(item.quantity).toBeNull()
  })

  it.each(['busy', 'readonly'])('disables editing and checking when %s', flag => {
    render(entry({ quantity: 2 }), { [flag]: true })
    expect(wrapper.get('input').element.disabled).toBe(true)
    expect(wrapper.getComponent({ name: 'QCheckbox' }).props('disable')).toBe(true)
  })

  it('still requires an observed condition', () => {
    render(entry({ quantity: 2, condition: 'not_checked' }))
    expect(wrapper.getComponent({ name: 'QCheckbox' }).props('disable')).toBe(true)
  })

  it('includes count-only differences in the summary and filter using move-in first', async () => {
    render(entry({ quantity: 3 }))
    expect(wrapper.text()).toContain('1 items with differences')
    expect(wrapper.text()).toContain('Count differs: 2 → 3')
    wrapper.findAllComponents({ name: 'QSelect' })[0].vm.$emit('update:modelValue', 'differences')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-item-id="keys"]').exists()).toBe(true)
    await wrapper.setProps({ entries: [entry({ quantity: 2 })] })
    expect(wrapper.text()).toContain('0 items with differences')
    expect(wrapper.find('[data-item-id="keys"]').exists()).toBe(false)
  })

  it('falls back to the later reference and distinguishes missing counts from zero', async () => {
    render(entry({ move_in: null, quantity: 3 }))
    expect(wrapper.text()).toContain('0 items with differences')
    await wrapper.setProps({ entries: [entry({ move_in: null, quantity: 0, reference: { condition: 'good' } })] })
    expect(wrapper.text()).toContain('Count differs: Not recorded → 0')
    expect(wrapper.text()).toContain('1 items with differences')
  })

  it('does not require or display quantities for ordinary items', () => {
    render(entry({ kind: 'item' }))
    expect(wrapper.find('input[type="number"]').exists()).toBe(false)
    expect(wrapper.getComponent({ name: 'QCheckbox' }).props('disable')).toBe(false)
  })
})

it('uses labeled native non-submit buttons for both reference photo sets', async () => {
  render()
  const buttons = wrapper.findAll('details button')
  expect(buttons).toHaveLength(2)
  for (const [index, button] of buttons.entries()) {
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toContain('Front door keys')
    expect(button.element.tabIndex).toBe(0)
    await button.trigger('click')
    expect(wrapper.emitted('photo').at(-1)).toEqual([index === 0 ? '/in.jpg' : '/later.jpg'])
  }
})
