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

  // Navigation guard for authentication and role-based access control
  Router.beforeEach((to, from, next) => {
    const userDataStore = useUserDataStore()
    const userCategory = userDataStore.userCategory
    const isAuthenticated = !!userDataStore.user

    console.log('Router Guard - Navigation to:', to.path)
    console.log('Router Guard - User category:', userCategory)
    console.log('Router Guard - Authenticated:', isAuthenticated)

    // ============================================
    // 1. PUBLIC ROUTES (GuestLayout)
    // ============================================
    const isPublicRoute = to.path.startsWith('/public') || to.path === '/loading'

    // Allow access to public routes
    if (isPublicRoute) {
      // If already logged in and trying to access login, redirect to dashboard
      if (to.path === '/public/login' && isAuthenticated) {
        console.log('Router Guard - Already authenticated, redirecting to dashboard')
        next('/')
        return
      }
      next()
      return
    }

    // ============================================
    // 2. AUTHENTICATED ROUTES (MainLayout)
    // ============================================
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !isAuthenticated) {
      console.log('Router Guard - Authentication required, redirecting to login')
      // Save the intended destination to redirect after login
      next({
        path: '/public/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // ============================================
    // 3. ROLE-BASED ACCESS CONTROL
    // ============================================
    
    // Define tenant-allowed routes (only for tenants)
    const tenantAllowedRoutes = [
      '/tenant-home',
      '/user-profile',
      '/application-detail',
    ]

    // Check if route path matches tenant-allowed routes
    const isTenantAllowed = tenantAllowedRoutes.some(route => to.path.startsWith(route))

    // If user is a tenant and trying to access a non-allowed route
    if (userCategory === 'tenant' && !isTenantAllowed) {
      console.log('Router Guard - Tenant attempting to access restricted route:', to.path)
      console.log('Router Guard - Redirecting to /tenant-home')
      next('/tenant-home')
      return
    }

    // PM/PO and other roles have full access (no restrictions)
    const isPropertyManager =
      ['PM', 'PO', 'PM/PO', 'owner', 'manager', 'admin'].includes(userCategory)
    
    if (isPropertyManager) {
      // Block PM/PO from accessing tenant-only pages
      if (to.path === '/tenant-home') {
        console.log('Router Guard - PM/PO attempting to access tenant-only page')
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
