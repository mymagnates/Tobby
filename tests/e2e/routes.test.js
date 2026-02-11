import { describe, it, expect, vi } from 'vitest'

// Mock dynamic imports in routes
vi.mock('../../src/layouts/GuestLayout.vue', () => ({}))
vi.mock('../../src/layouts/MainLayout.vue', () => ({}))
vi.mock('../../src/components/FirebaseAuth.vue', () => ({}))
vi.mock('../../src/pages/LeaseApplicationPage.vue', () => ({}))
vi.mock('../../src/pages/ApplicationDetailPage.vue', () => ({}))
vi.mock('../../src/pages/TenantSignUpPage.vue', () => ({}))
vi.mock('../../src/pages/IndexPage.vue', () => ({}))
vi.mock('../../src/pages/FirebaseTestPage.vue', () => ({}))
vi.mock('../../src/components/CreateProperty.vue', () => ({}))
vi.mock('../../src/pages/EditPropertyPage.vue', () => ({}))
vi.mock('../../src/components/CreateMxRecord.vue', () => ({}))
vi.mock('../../src/components/CreateTransaction.vue', () => ({}))
vi.mock('../../src/components/CreateLease.vue', () => ({}))
vi.mock('../../src/pages/PropertyView.vue', () => ({}))
vi.mock('../../src/pages/MxRecordsPage.vue', () => ({}))
vi.mock('../../src/pages/TransactionsPage.vue', () => ({}))
vi.mock('../../src/pages/LeasesPage.vue', () => ({}))
vi.mock('../../src/pages/TenantsPage.vue', () => ({}))
vi.mock('../../src/pages/RemindersPage.vue', () => ({}))
vi.mock('../../src/pages/ReportsPage.vue', () => ({}))
vi.mock('../../src/pages/TenantHomePage.vue', () => ({}))
vi.mock('../../src/pages/CreateTenantPage.vue', () => ({}))
vi.mock('../../src/pages/UserProfilePage.vue', () => ({}))
vi.mock('../../src/pages/LoadingPage.vue', () => ({}))
vi.mock('../../src/pages/LogoutSuccessPage.vue', () => ({}))
vi.mock('../../src/pages/ErrorNotFound.vue', () => ({}))

import routes from '../../src/router/routes'

describe('Router Routes', () => {
  describe('route structure', () => {
    it('should have public routes', () => {
      const publicRoute = routes.find((r) => r.path === '/public')
      expect(publicRoute).toBeDefined()
      expect(publicRoute.children).toBeDefined()
    })

    it('should have authenticated routes', () => {
      const authRoute = routes.find((r) => r.path === '/')
      expect(authRoute).toBeDefined()
      expect(authRoute.meta?.requiresAuth).toBe(true)
    })

    it('should have error route', () => {
      const errorRoute = routes.find((r) => r.path === '/:catchAll(.*)*')
      expect(errorRoute).toBeDefined()
    })
  })

  describe('public routes', () => {
    it('should have login route', () => {
      const publicRoute = routes.find((r) => r.path === '/public')
      const loginRoute = publicRoute.children.find((r) => r.path === 'login')
      expect(loginRoute).toBeDefined()
      expect(loginRoute.meta?.isPublic).toBe(true)
    })

    it('should have lease application route', () => {
      const publicRoute = routes.find((r) => r.path === '/public')
      const leaseRoute = publicRoute.children.find((r) => r.path === 'lease-application/:leaseId?')
      expect(leaseRoute).toBeDefined()
      expect(leaseRoute.meta?.isPublic).toBe(true)
    })

    it('should have tenant signup route', () => {
      const publicRoute = routes.find((r) => r.path === '/public')
      const signupRoute = publicRoute.children.find((r) => r.path === 'tenant-signup/:propertyId')
      expect(signupRoute).toBeDefined()
      expect(signupRoute.meta?.isPublic).toBe(true)
    })
  })

  describe('authenticated routes', () => {
    it('should have index route', () => {
      const authRoute = routes.find((r) => r.path === '/')
      const indexRoute = authRoute.children.find((r) => r.path === '')
      expect(indexRoute).toBeDefined()
    })

    it('should have properties routes', () => {
      const authRoute = routes.find((r) => r.path === '/')
      const createPropRoute = authRoute.children.find((r) => r.path === 'create-property')
      const myPropsRoute = authRoute.children.find((r) => r.path === 'my-properties')
      
      expect(createPropRoute).toBeDefined()
      expect(myPropsRoute).toBeDefined()
    })

    it('should have leases routes', () => {
      const authRoute = routes.find((r) => r.path === '/')
      const leasesRoute = authRoute.children.find((r) => r.path === 'leases')
      const createLeaseRoute = authRoute.children.find((r) => r.path === 'create-lease')
      
      expect(leasesRoute).toBeDefined()
      expect(createLeaseRoute).toBeDefined()
    })

    it('should have transactions route', () => {
      const authRoute = routes.find((r) => r.path === '/')
      const transactionsRoute = authRoute.children.find((r) => r.path === 'transactions')
      expect(transactionsRoute).toBeDefined()
    })

    it('should have tenants route', () => {
      const authRoute = routes.find((r) => r.path === '/')
      const tenantsRoute = authRoute.children.find((r) => r.path === 'tenants')
      expect(tenantsRoute).toBeDefined()
    })
  })

  describe('redirects', () => {
    it('should have login redirect', () => {
      const loginRedirect = routes.find((r) => r.path === '/login')
      expect(loginRedirect).toBeDefined()
      expect(loginRedirect.redirect).toBe('/public/login')
    })
  })
})
