const routes = [
  // ============================================
  // PUBLIC ROUTES (GuestLayout - No Sidebar)
  // ============================================
  {
    path: '/public',
    component: () => import('layouts/GuestLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('components/FirebaseAuth.vue'),
        meta: { isPublic: true },
      },
      {
        path: 'lease-application/:leaseId?',
        component: () => import('pages/LeaseApplicationPage.vue'),
        meta: { isPublic: true },
      },
      {
        path: 'application-detail/:applicationId',
        component: () => import('pages/ApplicationDetailPage.vue'),
        meta: { isPublic: true },
      },
      {
        path: 'tenant-signup/:propertyId',
        component: () => import('pages/TenantSignUpPage.vue'),
        meta: { isPublic: true },
      },
    ],
  },

  // ============================================
  // AUTHENTICATED ROUTES (MainLayout - With Sidebar)
  // ============================================
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'firebase-test', component: () => import('pages/FirebaseTestPage.vue') },
      { path: 'create-property', component: () => import('components/CreateProperty.vue') },
      { path: 'edit-property/:propertyId', component: () => import('pages/EditPropertyPage.vue') },
      { path: 'create-mxrecord', component: () => import('components/CreateMxRecord.vue') },
      {
        path: 'create-mxrecord/:propertyId',
        component: () => import('components/CreateMxRecord.vue'),
      },
      { path: 'create-transaction', component: () => import('components/CreateTransaction.vue') },
      {
        path: 'create-transaction/:propertyId',
        component: () => import('components/CreateTransaction.vue'),
      },
      { path: 'create-lease', component: () => import('components/CreateLease.vue') },
      {
        path: 'create-lease/:propertyId',
        component: () => import('components/CreateLease.vue'),
      },
      { path: 'my-properties', component: () => import('pages/PropertyView.vue') },
      { path: 'property-view', component: () => import('pages/PropertyView.vue') },
      { path: 'mx-records', component: () => import('pages/MxRecordsPage.vue') },
      { path: 'transactions', component: () => import('pages/TransactionsPage.vue') },
      { path: 'leases', component: () => import('pages/LeasesPage.vue') },
      { path: 'reminders', component: () => import('pages/RemindersPage.vue') },
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
      { path: 'tenant-home', component: () => import('pages/TenantHomePage.vue') },
      { path: 'create-tenant', component: () => import('pages/CreateTenantPage.vue') },
      { path: 'user-profile', component: () => import('pages/UserProfilePage.vue') },
      {
        path: 'application-detail/:applicationId',
        component: () => import('pages/ApplicationDetailPage.vue'),
        meta: { isPrivate: true },
      },
    ],
  },

  // ============================================
  // STANDALONE ROUTES (No Layout)
  // ============================================
  {
    path: '/loading',
    component: () => import('pages/LoadingPage.vue'),
  },
  {
    path: '/logout-success',
    component: () => import('pages/LogoutSuccessPage.vue'),
  },

  // ============================================
  // REDIRECTS (Backward Compatibility)
  // ============================================
  {
    path: '/login',
    redirect: '/public/login',
  },
  {
    path: '/lease-application/:leaseId?',
    redirect: (to) => `/public/lease-application/${to.params.leaseId || ''}`,
  },
  {
    path: '/tenant-signup/:propertyId',
    redirect: (to) => `/public/tenant-signup/${to.params.propertyId}`,
  },
  {
    path: '/application-detail/:applicationId',
    redirect: (to) => `/public/application-detail/${to.params.applicationId}`,
  },

  // ============================================
  // ERROR PAGES
  // ============================================
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
