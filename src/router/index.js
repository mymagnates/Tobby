import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserDataStore } from '../stores/userDataStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Navigation guard for role-based access control
  Router.beforeEach((to, from, next) => {
    const userDataStore = useUserDataStore()
    const userCategory = userDataStore.userCategory

    console.log('Router Guard - Navigation to:', to.path)
    console.log('Router Guard - User category:', userCategory)

    // Define tenant-allowed routes (only for tenants)
    const tenantAllowedRoutes = [
      '/tenant-home',
      '/lease-application',
      '/login',
      '/loading',
      '/user-profile',
    ]

    // Check if route is tenant-allowed or starts with allowed prefix
    const isTenantAllowed =
      tenantAllowedRoutes.includes(to.path) ||
      to.path.startsWith('/lease-application/') ||
      to.path.startsWith('/tenant-signup/')

    // If user is a tenant and trying to access a non-allowed route
    if (userCategory === 'tenant' && !isTenantAllowed) {
      console.log('Router Guard - Tenant attempting to access restricted route:', to.path)
      console.log('Router Guard - Redirecting to /tenant-home')

      // Redirect to tenant home
      next('/tenant-home')
      return
    }

    // PM/PO and other roles have full access (no restrictions)
    // They can access all routes including property management pages
    if (['PM', 'PO', 'owner', 'manager', 'admin'].includes(userCategory)) {
      // Block PM/PO from accessing tenant-only pages
      if (to.path === '/tenant-home') {
        console.log('Router Guard - PM/PO attempting to access tenant-only page:', to.path)
        console.log('Router Guard - Redirecting to /')
        next('/')
        return
      }
    }

    // Allow navigation
    next()
  })

  return Router
})
