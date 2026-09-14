import { createApp, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import * as UI from 'quasar'
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import routes from 'src/router/mobileRoutes'
import LeaseInventoryDialog from 'src/components/inventory/LeaseInventoryDialog.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...routes,
    {
      path: '/web-inventory',
      component: { render: () => h(LeaseInventoryDialog, { leaseId: 'l1' }) },
    },
    { path: '/', redirect: '/mobile/pm/home' },
  ],
})
const app = createApp({
  render: () =>
    h('div', [
      h(
        'div',
        {
          style:
            'font:12px -apple-system,sans-serif;text-align:center;padding:5px;background:#fff3cd;color:#493910',
        },
        'Design fixture · Not live data',
      ),
      h(RouterView),
    ]),
})
app.use(UI.Quasar, {
  components: Object.fromEntries(Object.entries(UI).filter(([name]) => /^Q[A-Z]/.test(name))),
  plugins: { Notify: UI.Notify, Dialog: UI.Dialog },
})
app.use(router).mount('#app')
