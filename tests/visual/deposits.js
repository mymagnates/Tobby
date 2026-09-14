import { createApp, h } from 'vue'
import * as Quasar from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

// This fixture cannot start authenticated requests outside the isolated test harness.
if (window.__depositOffline === true) {
  const { default: DepositWorkspace } = await import(
    '../../src/components/deposits/DepositWorkspace.vue'
  )
  createApp({
    render: () =>
      h('main', { style: 'max-width:1100px;margin:24px auto;padding:0 8px' }, [
        h(DepositWorkspace, { propertyId: 'p1' }),
      ]),
  })
    .use(Quasar.Quasar, {
      components: Object.fromEntries(
        Object.entries(Quasar).filter(([name]) => /^Q[A-Z]/.test(name)),
      ),
    })
    .mount('#app')
}
