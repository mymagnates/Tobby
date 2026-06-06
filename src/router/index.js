import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserDataStore } from '../stores/userDataStore'
import { getMobileHomePathForStore, isNativeMobileRuntime } from '../utils/mobileRuntime'

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
  Router.beforeEach(async (to, from, next) => {
    const userDataStore = useUserDataStore()
    const userCategory = userDataStore.userCategory
    const isAuthenticated = !!userDataStore.user
    const isNativeMobile = isNativeMobileRuntime()
    const hasSpServiceAreaConfigured = () => {
      const profile = userDataStore.userProfile || {}
      const spProfile = profile.sp_service_profile || {}
      const zipCodes = Array.isArray(spProfile.service_zip_codes) ? spProfile.service_zip_codes : []
      return zipCodes.length > 0 || Boolean(spProfile.service_area_shape)
    }

    console.log('Router Guard - Navigation to:', to.path)
    console.log('Router Guard - From:', from.path)
    console.log('Router Guard - User category:', userCategory)
    console.log('Router Guard - Authenticated:', isAuthenticated)

    // ============================================
    // 0. STANDALONE ROUTES (Always Allow)
    // ============================================
    const standaloneRoutes = ['/loading', '/logout-success', '/public/logout-success']
    if (standaloneRoutes.includes(to.path)) {
      console.log('Router Guard - Standalone route, allowing access')
      next()
      return
    }

    if (to.path === '/mobile-login') {
      if (isAuthenticated) {
        next(getMobileHomePathForStore(userDataStore))
        return
      }
      next()
      return
    }

    if (isNativeMobile && ['/', '/landing', '/public/login'].includes(to.path)) {
      if (isAuthenticated) {
        next(getMobileHomePathForStore(userDataStore))
        return
      }
      next({
        path: '/mobile-login',
        query: { redirect: '/mobile' },
      })
      return
    }

    // ============================================
    // 1. PUBLIC ROUTES (GuestLayout)
    // ============================================
    const isPublicRoute = to.path.startsWith('/public')

    // Allow access to public routes
    if (isPublicRoute) {
      // Allow login page access if:
      // 1. User is not authenticated
      // 2. Coming from logout-success
      // 3. Has redirect query parameter (means they were redirected here)
      if (to.path === '/public/login') {
        if (!isAuthenticated || from.path === '/logout-success' || to.query.redirect || to.query.expired) {
          console.log('Router Guard - Allowing access to login page')
          next()
          return
        }
        // Already authenticated and no special conditions, check if data is loaded
        if (isAuthenticated && userDataStore.userAccessibleProperties.length > 0) {
          console.log('Router Guard - Already authenticated with data, redirecting to dashboard')
          next('/')
          return
        }
        // Authenticated but no data yet, go to loading
        if (isAuthenticated) {
          console.log('Router Guard - Already authenticated, redirecting to loading page')
          next('/loading')
          return
        }
      }
      next()
      return
    }

    // ============================================
    // 2. AUTHENTICATED ROUTES (MainLayout)
    // ============================================
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !isAuthenticated) {
      console.log('Router Guard - Authentication required, redirecting to landing')
      if (isNativeMobile) {
        next({
          path: '/mobile-login',
          query: { redirect: to.fullPath },
        })
        return
      }
      // Save the intended destination to redirect after login
      next({
        path: '/landing',
        query: { redirect: to.fullPath },
      })
      return
    }

    if (isNativeMobile && to.path.startsWith('/mobile')) {
      next()
      return
    }

    // ============================================
    // 2.1 ONE-TIME ACCOUNT TYPE SETUP
    // ============================================
    if (isAuthenticated && to.path !== '/account-type-setup') {
      if (!userDataStore.userProfile && !userDataStore.profileLoading) {
        await userDataStore.loadUserProfile()
      }
      const profile = userDataStore.userProfile || {}
      const hasAccountType = Boolean(profile.account_type || profile.user_category)
      if (!hasAccountType) {
        next('/account-type-setup')
        return
      }
    }

    if (isAuthenticated && to.path === '/account-type-setup') {
      if (!userDataStore.userProfile && !userDataStore.profileLoading) {
        await userDataStore.loadUserProfile()
      }
      const profile = userDataStore.userProfile || {}
      const hasAccountType = Boolean(profile.account_type || profile.user_category)
      if (hasAccountType) {
        next('/')
        return
      }
    }

    // ============================================
    // 3. ROLE-BASED ACCESS CONTROL
    // ============================================
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
    const profile = userDataStore.userProfile || {}
    const rawRole = String(profile.account_type || profile.user_category || userCategory || '').toLowerCase()
    const isAdmin = rawRole === 'admin'
    if (requiresAdmin) {
      if (!isAdmin) {
        next('/')
        return
      }
    }
    if (isAdmin && to.path === '/') {
      next('/admin/overview')
      return
    }
    
    // Define tenant-allowed routes (only for tenants)
    const tenantAllowedRoutes = [
      '/tenant-home',
      '/application-detail',
      '/documents',
    ]

    // Check if route path matches tenant-allowed routes
    const isTenantAllowed = tenantAllowedRoutes.some(route => to.path.startsWith(route))

    // If user is a tenant and trying to access a non-allowed route
    if (String(userCategory || '').toLowerCase() === 'tt' && !isTenantAllowed) {
      console.log('Router Guard - Tenant attempting to access restricted route:', to.path)
      console.log('Router Guard - Redirecting to /tenant-home')
      next('/tenant-home')
      return
    }

    // Service provider allowed routes
    const spAllowedRoutes = [
      '/',
      '/sp-dashboard',
      '/sp-credits',
      '/sp-payment-method',
      '/sp-leads',
      '/sp-bids',
      '/sp-documents',
      '/sp-messages',
      '/sp-projects',
      '/sp-invoices',
      '/sp-services',
      '/sp-profile',
      '/user-profile',
    ]
    const isServiceProvider = ['sp'].includes(String(userCategory || '').toLowerCase())
    if (isServiceProvider) {
      if (to.path === '/') {
        if (!hasSpServiceAreaConfigured()) {
          next('/sp-services')
          return
        }
        next('/sp-dashboard')
        return
      }
      const isSpAllowed = spAllowedRoutes.some((route) =>
        route === '/' ? to.path === '/' : to.path.startsWith(route),
      )
      if (!isSpAllowed) {
        console.log('Router Guard - SP attempting to access restricted route:', to.path)
        console.log('Router Guard - Redirecting to /sp-leads')
        next('/sp-leads')
        return
      }
    }

    const normalizedAccountType = String(userDataStore.accountType || userCategory || '').toLowerCase()
    const hasPoMembership = Boolean(userDataStore.hasPoMembership)
    const hasPmMembership = Boolean(userDataStore.hasPmMembership)
    const hasLegacyPoAccount = Boolean(userDataStore.hasLegacyPoAccount)
    const isOwnerWorkspaceOnly = Boolean(userDataStore.isOwnerOnlyUser)
    const canAccessOwnerWorkspace = Boolean(userDataStore.hasOwnerWorkspaceAccess)

    if (canAccessOwnerWorkspace && (isOwnerWorkspaceOnly || to.path.startsWith('/po-dashboard'))) {
      if (to.path === '/') {
        next('/po-dashboard')
        return
      }
      const poAllowedRoutes = ['/po-dashboard']
      const isPoAllowed = poAllowedRoutes.some((route) =>
        route === '/' ? to.path === '/' : to.path.startsWith(route),
      )
      if (isOwnerWorkspaceOnly && !isPoAllowed) {
        console.log('Router Guard - PO attempting to access restricted route:', to.path)
        next('/po-dashboard')
        return
      }
    }

    if (normalizedAccountType === 'pm' && !hasPmMembership && !hasPoMembership && to.path === '/po-dashboard') {
      next('/')
      return
    }

    // Migration-only redirect for legacy PO accounts. New owner access should be
    // driven by PO membership instead of account_type/user_category.
    if (hasLegacyPoAccount && !to.path.startsWith('/po-dashboard') && to.path === '/') {
      next('/po-dashboard')
      return
    }

    // NOTE: PM/PO tenant-home block removed for cross-role testing

    // Allow navigation
    next()
  })

  return Router
})
