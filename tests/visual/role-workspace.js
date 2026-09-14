import { createApp, h, ref } from 'vue'
import * as Quasar from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '../../src/css/app.scss'
import '../../src/css/web-workspace.scss'
import '../../src/css/workspace-forms.scss'
import '../../src/css/role-workspace.scss'

if (window.__roleOffline === true) {
  const params = new URLSearchParams(location.search),
    view = params.get('view') || 'sp'
  const component =
    view === 'sp'
      ? (await import('../../src/pages/SpLeadsPage.vue')).default
      : (
          await import(
            `../../src/components/Owner${{ transactions: 'TransactionList', tasks: 'TaskHistory', leases: 'LeaseHistory' }[view]}View.vue`
          )
        ).default
  document.body.classList.add('workspace-forms-theme')
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: `qa-${i}`,
    transac_type: i ? 'Property maintenance' : 'Rent',
    amount: 2700,
    transac_date: '2026-09-10',
    report_date: '2026-09-10',
    lease_start_date: '2026-09-01',
    lease_end_date: '2027-09-01',
    task_title: 'Inspect and repair the kitchen faucet in Garden House',
    status: i ? 'completed' : 'open',
  }))
  createApp({
    setup() {
      const open = ref(true)
      const props = {
        items,
        formatDate: (v) => String(v || ''),
        normalizeStatus: (v) => v,
        formatAmount: (v) => `$${v.toFixed(2)}`,
        getStatusColor: () => 'primary',
        getLeaseDisplayTenantName: () => 'Garden House Tenant',
        openTaskStatuses: ['open'],
      }
      return () =>
        h(Quasar.QLayout, { class: 'dashboard-layout web-workspace' }, () =>
          h(Quasar.QPageContainer, { style: 'padding:24px 16px' }, () =>
            h('div', { class: 'content-main' }, [
              view === 'sp'
                ? h(component)
                : h(
                    Quasar.QDialog,
                    {
                      modelValue: open.value,
                      'onUpdate:modelValue': (value) => {
                        open.value = value
                      },
                      maximized: true,
                    },
                    () => h(component, props),
                  ),
            ]),
          ),
        )
    },
  })
    .use(Quasar.Quasar, {
      components: Object.fromEntries(
        Object.entries(Quasar).filter(([name]) => /^Q[A-Z]/.test(name)),
      ),
      directives: { ClosePopup: Quasar.ClosePopup },
      plugins: { Notify: Quasar.Notify },
      config: { dark: params.has('dark') },
    })
    .mount('#app')
}
