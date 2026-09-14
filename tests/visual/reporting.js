import { createApp, h } from 'vue'
import * as Quasar from 'quasar'
import { createMemoryHistory, createRouter } from 'vue-router'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '../../src/css/app.scss'
import '../../src/css/web-workspace.scss'

if (window.__reportingOffline === true) {
  const { default: Reports } = await import('../../src/pages/ReportsPage.vue')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/reports', component: Reports }],
  })
  await router.push('/reports')
  await router.isReady()
  createApp({
    render: () =>
      h(Quasar.QLayout, { class: 'dashboard-layout web-workspace' }, () =>
        h(Quasar.QPageContainer, { style: 'max-width:1120px;margin:auto;padding:24px 16px' }, () =>
          h('div', { class: 'content-main' }, [h(Reports)]),
        ),
      ),
  })
    .use(router)
    .use(Quasar.Quasar, {
      components: Object.fromEntries(
        Object.entries(Quasar).filter(([name]) => /^Q[A-Z]/.test(name)),
      ),
    })
    .mount('#app')
}
