import { createApp } from 'vue'
import * as QuasarComponents from 'quasar'
import { createMemoryHistory, createRouter } from 'vue-router'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '../../src/css/app.scss'
import '../../src/css/web-workspace.scss'
import '../../src/css/workspace-forms.scss'

// Never import the production component graph from an unguarded browser visit.
if (window.__workspaceFormsOffline === true) {
  const { default: Fixture } = await import('./WorkspaceFormsFixture.vue')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
      { path: '/property/:propertyId/edit', component: { template: '<div />' } },
    ],
  })
  await router.push('/property/fixture-property/edit')
  await router.isReady()
  createApp(Fixture)
    .use(router)
    .use(QuasarComponents.Quasar, {
      components: Object.fromEntries(
        Object.entries(QuasarComponents).filter(([name]) => /^Q[A-Z]/.test(name)),
      ),
      plugins: { Notify: QuasarComponents.Notify, Dialog: QuasarComponents.Dialog },
    })
    .mount('#app')
}
