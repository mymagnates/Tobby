import { defineComponent, h, ref } from 'vue'
import { config, mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useWebFormTheme } from '../../../src/composables/useWebFormTheme'

describe('useWebFormTheme', () => {
  const plugins = config.global.plugins
  const wrappers = []
  const theme = 'workspace-forms-theme'
  const render = (enabled) => {
    const wrapper = mount(
      defineComponent({
        setup() {
          useWebFormTheme(enabled)
          return () => h('div')
        },
      }),
    )
    wrappers.push(wrapper)
    return wrapper
  }

  beforeAll(() => {
    config.global.plugins = []
  })
  afterAll(() => {
    config.global.plugins = plugins
  })
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.classList.remove(theme, 'unrelated-fixture-class')
  })

  it.each([
    ['default', undefined],
    ['boolean', true],
    ['ref', ref(true)],
    ['getter', () => true],
  ])('applies the body class on mount for enabled %s and removes it on unmount', (_, enabled) => {
    expect(document.body.classList.contains(theme)).toBe(false)
    document.body.classList.add('unrelated-fixture-class')
    const wrapper = render(enabled)
    expect(document.body.classList.contains(theme)).toBe(true)
    wrapper.unmount()
    expect(document.body.classList.contains(theme)).toBe(false)
    expect(document.body.classList.contains('unrelated-fixture-class')).toBe(true)
  })

  it.each([
    ['boolean', false],
    ['ref', ref(false)],
    ['getter', () => false],
  ])('does not apply the body class for disabled %s', (_, enabled) => {
    const wrapper = render(enabled)
    expect(document.body.classList.contains(theme)).toBe(false)
    wrapper.unmount()
    expect(document.body.classList.contains(theme)).toBe(false)
  })

  it('does not remove an active web layout theme when a disabled layout unmounts', () => {
    const web = render(true)
    const mobile = render(false)
    mobile.unmount()
    expect(document.body.classList.contains(theme)).toBe(true)
    web.unmount()
    expect(document.body.classList.contains(theme)).toBe(false)
  })

  it('keeps the theme until the last overlapping owner unmounts', () => {
    const outgoing = render(true)
    const incoming = render(true)
    outgoing.unmount()
    expect(document.body.classList.contains(theme)).toBe(true)
    incoming.unmount()
    expect(document.body.classList.contains(theme)).toBe(false)
  })
})
