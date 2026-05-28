import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import LoginPage from '../pages/LoginPage.vue'
import AdminShell from '../layouts/AdminShell.vue'
import OverviewPage from '../pages/OverviewPage.vue'
import UsersPage from '../pages/UsersPage.vue'
import BillingPage from '../pages/BillingPage.vue'
import LogsPage from '../pages/LogsPage.vue'
import DataManagementPage from '../pages/DataManagementPage.vue'
import { auth } from '../firebase'
import { validateAdminSession } from '../services/adminApi'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { public: true } },
    {
      path: '/',
      component: AdminShell,
      children: [
        { path: '', redirect: '/overview' },
        { path: 'overview', component: OverviewPage },
        { path: 'users', component: UsersPage },
        { path: 'billing', component: BillingPage },
        { path: 'logs', component: LogsPage },
        { path: 'data-management', component: DataManagementPage },
      ],
    },
  ],
})

const ensureAuthReady = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe()
      resolve()
    })
  })

router.beforeEach(async (to) => {
  await ensureAuthReady()

  if (to.meta.public) {
    const user = auth.currentUser
    if (!user) return true
    const isAdmin = await validateAdminSession().catch(() => false)
    return isAdmin ? '/overview' : true
  }

  if (!auth.currentUser) return '/login'
  const ok = await validateAdminSession().catch(() => false)
  return ok ? true : '/login'
})

export default router
