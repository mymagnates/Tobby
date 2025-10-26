const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
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
      {
        path: 'lease-application/:leaseId?',
        component: () => import('pages/LeaseApplicationPage.vue'),
      },
      {
        path: 'application-detail/:applicationId',
        component: () => import('pages/ApplicationDetailPage.vue'),
      },
      { path: 'tenant-home', component: () => import('pages/TenantHomePage.vue') },
      { path: 'user-profile', component: () => import('pages/UserProfilePage.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('components/FirebaseAuth.vue'),
  },
  {
    path: '/loading',
    component: () => import('pages/LoadingPage.vue'),
  },
  {
    path: '/tenant-signup/:propertyId',
    component: () => import('pages/TenantSignUpPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
