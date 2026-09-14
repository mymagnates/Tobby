import { describe, expect, it } from 'vitest'
import { compile } from 'sass'
import postcss from 'postcss'
import { resolve } from 'node:path'

const styles = Object.fromEntries(
  ['web-workspace', 'workspace-forms'].map((name) => {
    const path = resolve('src/css', `${name}.scss`)
    return [name, postcss.parse(compile(path).css)]
  }),
)

const declarations = (rule) =>
  Object.fromEntries(
    rule.nodes.filter((node) => node.type === 'decl').map((node) => [node.prop, node.value]),
  )

function rules(name, predicate) {
  const matches = []
  styles[name].walkRules((rule) => {
    if (predicate(rule, declarations(rule))) matches.push(rule)
  })
  return matches
}

const buttonMarkup = (buttonClass = '', contentClass = 'justify-center', label = true) => `
  <button class="q-btn ${buttonClass}">
    <span class="q-focus-helper"></span>
    <span class="q-btn__content row items-center ${contentClass}">
      <i class="q-icon">save</i>${label ? '<span class="block">Save property</span>' : ''}
    </span>
  </button>`

function fixture({
  form = false,
  web = true,
  theme = true,
  wrapper = '',
  buttonClass = '',
  contentClass,
  label,
} = {}) {
  document.body.className = theme ? 'workspace-forms-theme' : ''
  document.body.innerHTML = `
    <div class="${web ? 'dashboard-layout web-workspace' : 'mobile-workspace'}">
      <div class="content-main">
        <section class="${form ? 'workspace-form' : ''}">
          <div class="${wrapper}">${buttonMarkup(buttonClass, contentClass, label)}</div>
        </section>
      </div>
    </div>`
  return document.querySelector('button')
}

describe.each(['web-workspace', 'workspace-forms'])('%s bounded button styles', (name) => {
  const form = name === 'workspace-forms'
  const sizing = rules(name, (_rule, decl) => decl['min-width'] === 'min(88px, 100%)')

  it('compiles one content-based action sizing contract with direct-child centering', () => {
    expect(sizing).toHaveLength(1)
    expect(fixture({ form }).matches(sizing[0].selector)).toBe(true)
    expect(declarations(sizing[0])).toMatchObject({
      'min-height': '44px',
      height: 'auto',
      'max-width': '100%',
      padding: '8px 16px',
    })
    expect(declarations(sizing[0])).not.toHaveProperty('width')
    const centered = rules(
      name,
      (rule, decl) =>
        rule.selector.startsWith(sizing[0].selector) && decl['justify-content'] === 'center',
    )
    expect(centered).toHaveLength(1)
    expect(centered[0].selector.endsWith('> .q-btn__content')).toBe(true)
    expect(declarations(centered[0])).toMatchObject({
      'text-align': 'center',
      'white-space': 'normal',
    })
    expect(
      rules(
        name,
        (rule, decl) =>
          rule.selector.startsWith(sizing[0].selector) && decl['overflow-wrap'] === 'anywhere',
      ),
    ).toHaveLength(1)
  })

  it.each(['q-btn--round', 'q-btn--fab', 'q-btn--fab-mini', 'q-btn--rounded', 'q-btn--square'])(
    'does not resize the %s variant',
    (buttonClass) => {
      expect(fixture({ form, buttonClass }).matches(sizing[0].selector)).toBe(false)
    },
  )

  it('does not stretch icon-only controls', () => {
    expect(fixture({ form, label: false }).matches(sizing[0].selector)).toBe(false)
  })

  it.each(['justify-start', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly'])(
    'preserves explicit %s content alignment',
    (contentClass) => {
      expect(fixture({ form, contentClass }).matches(sizing[0].selector)).toBe(false)
    },
  )

  it.each(['q-btn-group', 'q-tabs', 'q-pagination', 'reports-workspace', 'report-pdf-dialog'])(
    'leaves %s controls with their owner',
    (wrapper) => {
      expect(fixture({ form, wrapper }).matches(sizing[0].selector)).toBe(false)
    },
  )

  it('preserves nav and tab controls', () => {
    const button = fixture({ form })
    button.parentElement.outerHTML = `<nav>${buttonMarkup()}</nav>`
    expect(document.querySelector('button').matches(sizing[0].selector)).toBe(false)
    const tab = fixture({ form })
    tab.setAttribute('role', 'tab')
    expect(tab.matches(sizing[0].selector)).toBe(false)
  })

  it('does not apply the sizing rule to a native/unthemed surface', () => {
    expect(fixture({ form, web: false, theme: false }).matches(sizing[0].selector)).toBe(false)
  })

  it('keeps loading and disabled geometry without overriding visibility or interaction', () => {
    const button = fixture({ form, buttonClass: 'disabled' })
    button.disabled = true
    button.setAttribute('aria-busy', 'true')
    expect(button.matches(sizing[0].selector)).toBe(true)
    for (const rule of rules(name, (rule) => rule.selector.startsWith(sizing[0].selector))) {
      const decl = declarations(rule)
      for (const property of ['opacity', 'visibility', 'pointer-events', 'display']) {
        expect(decl).not.toHaveProperty(property)
      }
      if (rule.selector.includes(':hover')) {
        expect(rule.selector).toContain(':not(.disabled):not([aria-busy=true])')
        expect(rule.selector).toContain(':not([role=progressbar])')
      }
    }
  })

  it.each(['negative', 'positive', 'warning', 'info'])(
    'retains Quasar %s text-color semantics',
    (tone) => {
      const token = { negative: 'error', positive: 'success', warning: 'warning', info: 'info' }[
        tone
      ]
      const semantic = rules(
        name,
        (rule, decl) =>
          rule.selector.startsWith(sizing[0].selector) &&
          rule.selector.endsWith(`.text-${tone}:not(.bg-${tone})`) &&
          decl.color === `var(--${token}-color)`,
      )
      expect(semantic).toHaveLength(1)
      expect(fixture({ form, buttonClass: `text-${tone}` }).matches(semantic[0].selector)).toBe(
        true,
      )
      expect(declarations(semantic[0])).toMatchObject({ 'border-color': `var(--${token}-color)` })
    },
  )
})

it('does not recolor destructive top-action form buttons as primary', () => {
  const button = fixture({ form: true, buttonClass: 'top-action-btn bg-negative text-white' })
  const primary = rules('workspace-forms', (_rule, decl) => decl.background === 'var(--form-brand)')
  expect(primary.length).toBeGreaterThan(0)
  expect(primary.some((rule) => button.matches(rule.selector))).toBe(false)
})

it('lets opted-in forms own their styling instead of receiving both sizing contracts', () => {
  const button = fixture({ form: true })
  const web = rules('web-workspace', (_rule, decl) => decl['min-width'] === 'min(88px, 100%)')[0]
  expect(button.matches(web.selector)).toBe(false)
})
