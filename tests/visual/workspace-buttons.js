import { createApp, h, ref } from 'vue'
import { Quasar, QBtn, QBtnDropdown, QBtnToggle, QTab, QTabs } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '../../src/css/app.scss'
import '../../src/css/web-workspace.scss'
import '../../src/css/workspace-forms.scss'

// Isolated real Quasar controls: no app routes, authentication or data modules.
const params = new URLSearchParams(location.search)
const native = params.has('native')
document.body.classList.toggle('workspace-forms-theme', !native)
document.body.classList.toggle('body--dark', params.has('dark'))

createApp({
  setup() {
    const busy = ref(false)
    const clicks = ref(0)
    const button = (id, props = {}) =>
      h(QBtn, { 'data-testid': id, label: 'Save', noCaps: true, ...props })
    const controls = (scope) => [
      h('h2', scope),
      h('div', { class: 'row q-gutter-sm', style: 'margin:0' }, [
        button(`${scope}-short`, { color: 'primary', unelevated: true }),
        button(`${scope}-long`, { color: 'primary', label: 'Create property report' }),
        button(`${scope}-icon-label`, { color: 'primary', icon: 'add', label: 'Add property' }),
        button(`${scope}-outline`, { color: 'primary', outline: true, label: 'Preview' }),
        button(`${scope}-flat`, { color: 'primary', flat: true, label: 'Back' }),
        button(`${scope}-cancel`, { class: 'workspace-form-cancel', flat: true, label: 'Cancel' }),
        button(`${scope}-danger`, { color: 'negative', class: 'top-action-btn', label: 'Delete' }),
        button(`${scope}-danger-flat`, { color: 'negative', flat: true, label: 'Remove' }),
        button(`${scope}-disabled`, {
          color: 'primary',
          unelevated: true,
          disable: true,
          label: 'Disabled',
          onClick: () => clicks.value++,
        }),
        button(`${scope}-loading`, {
          color: 'primary',
          unelevated: true,
          loading: busy.value,
          percentage: 40,
          label: 'Save changes',
          onClick: () => {
            clicks.value++
            busy.value = true
          },
        }),
        button(`${scope}-icon`, { label: undefined, icon: 'edit', flat: true, dense: true }),
        button(`${scope}-round`, {
          label: undefined,
          icon: 'close',
          flat: true,
          round: true,
          dense: true,
        }),
        button(`${scope}-aligned`, { align: 'left', label: 'Left aligned', style: 'width:220px' }),
        h(QBtnDropdown, {
          'data-testid': `${scope}-dropdown`,
          label: 'Export report',
          color: 'primary',
        }),
        h(QBtnToggle, {
          'data-testid': `${scope}-toggle`,
          modelValue: 'a',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        }),
      ]),
      h('nav', [
        button(`${scope}-nav`, { align: 'left', label: 'Navigation', style: 'width:220px' }),
      ]),
      h(QTabs, { modelValue: 'a', align: 'left', 'data-testid': `${scope}-tabs` }, () => [
        h(QTab, { name: 'a', label: 'Overview' }),
        h(QTab, { name: 'b', label: 'Details' }),
      ]),
      h('div', { class: 'row justify-between', 'data-testid': `${scope}-nonbutton` }, [
        h('span', 'Left content'),
        h('span', 'Right content'),
      ]),
      h('div', { class: 'workspace-form-actions row justify-end' }, [
        button(`${scope}-footer-icon`, { label: undefined, icon: 'close', flat: true }),
        button(`${scope}-footer-short`, { label: 'Cancel', class: 'workspace-form-cancel' }),
        button(`${scope}-footer-long`, {
          color: 'primary',
          icon: 'save',
          label: 'Save the updated property and notify all owners',
        }),
      ]),
      button(`${scope}-full`, { label: 'Full width', class: 'full-width', color: 'primary' }),
      h('div', { style: 'width:160px;max-width:100%' }, [
        button(`${scope}-wrap`, {
          color: 'primary',
          icon: 'save',
          label: 'SaveThisVeryLongUnbrokenTranslatedPropertyLabel',
        }),
      ]),
    ]
    return () =>
      h(
        'main',
        {
          class: native ? 'mobile-workspace' : 'dashboard-layout web-workspace',
          style: 'padding:16px',
        },
        [
          h('div', { class: 'content-main' }, [
            h('section', controls('web')),
            h('section', { class: 'workspace-form' }, controls('form')),
          ]),
          h('output', { 'data-testid': 'clicks' }, clicks.value),
          h(
            'button',
            {
              'data-testid': 'reset-loading',
              onClick: () => {
                busy.value = false
              },
            },
            'Reset',
          ),
        ],
      )
  },
})
  .use(Quasar, { config: { dark: params.has('dark') } })
  .mount('#app')
