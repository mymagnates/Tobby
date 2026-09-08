import { config, mount } from '@vue/test-utils'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import PropertyContextSwitcher from '../../../src/components/PropertyContextSwitcher.vue'

const properties = [
  { id: 'p1', nickname: 'Garden House', address: '123 Oak Lane' },
  { id: 'p2', nickname: 'Cedar Apartment', address: '45 Cedar Road' },
]
const mountSwitcher = (props = {}) =>
  mount(PropertyContextSwitcher, {
    props: { properties, userId: 'test-user', ...props },
    global: {
      stubs: {
        'q-btn': { template: '<button><slot /></button>' },
        'q-popup-proxy': { template: '<div><slot /></div>' },
        'q-input': {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        'q-icon': { props: ['name'], template: '<i :data-icon="name" />' },
      },
    },
  })
const option = (wrapper, label) =>
  wrapper.findAll('.property-context-option').find((node) => node.text().includes(label))

describe('PropertyContextSwitcher', () => {
  const plugins = config.global.plugins
  // This suite tests component behavior with explicit stubs, not Quasar's SSR installer.
  beforeAll(() => {
    config.global.plugins = []
  })
  afterAll(() => {
    config.global.plugins = plugins
  })
  beforeEach(() => sessionStorage.clear())
  it('always renders the chevron and exposes expanded state', async () => {
    const wrapper = mountSwitcher()
    const trigger = wrapper.get('[data-testid="property-switcher"]')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('[data-testid="property-chevron"]').attributes('data-icon')).toBe(
      'expand_more',
    )
    await trigger.trigger('keydown.down')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-testid="property-chevron"]').attributes('data-icon')).toBe(
      'expand_less',
    )
    wrapper.unmount()
  })
  it('emits selection, marks selected row, and closes', async () => {
    const wrapper = mountSwitcher({ modelValue: 'p1' })
    expect(option(wrapper, 'Garden House').attributes('aria-pressed')).toBe('true')
    await option(wrapper, 'Cedar Apartment').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['p2']])
    expect(wrapper.get('[data-testid="property-switcher"]').attributes('aria-expanded')).toBe(
      'false',
    )
    wrapper.unmount()
  })
  it('clears aggregate scope but hides that option on detail pages', async () => {
    const wrapper = mountSwitcher({ modelValue: 'p1' })
    await option(wrapper, 'All properties').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    await wrapper.setProps({ includeAll: false })
    expect(option(wrapper, 'All properties')).toBeUndefined()
    wrapper.unmount()
  })
  it('searches and gives a no-result state', async () => {
    const wrapper = mountSwitcher()
    await wrapper.get('input').setValue('cedar')
    expect(wrapper.findAll('.property-context-option')).toHaveLength(1)
    await wrapper.get('input').setValue('missing')
    expect(wrapper.text()).toContain('No matching properties')
    wrapper.unmount()
  })
  it('never renders inaccessible recent IDs and isolates users', async () => {
    sessionStorage.setItem('handout:recent-properties:test-user', JSON.stringify(['revoked', 'p2']))
    const wrapper = mountSwitcher()
    expect(wrapper.text()).not.toContain('revoked')
    expect(wrapper.text()).toContain('Recent')
    await wrapper.setProps({ userId: 'another-user' })
    expect(wrapper.text()).not.toContain('Recent')
    wrapper.unmount()
  })
  it('distinguishes an inaccessible selection from aggregate context', () => {
    const wrapper = mountSwitcher({ modelValue: 'revoked', properties: [] })
    expect(wrapper.get('[data-testid="property-switcher"]').attributes('aria-label')).toContain(
      'Unavailable property',
    )
    expect(wrapper.text()).toContain('No properties yet')
    wrapper.unmount()
  })
})
