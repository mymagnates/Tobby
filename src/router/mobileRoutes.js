const mobileRoutes = [
  {
    path: '/mobile',
    component: () => import('layouts/MobileWorkspaceLayout.vue'),
    children: [
      { path: '', redirect: '/mobile/pm/home' },
      {
        path: 'login',
        component: () => import('pages/mobile/WorkspaceLoginPage.vue'),
        meta: { mobileGuest: true },
      },
      {
        path: 'unavailable',
        component: () => import('pages/mobile/WorkspaceAccessPage.vue'),
        meta: { mobileGuest: true },
      },
      { path: 'pm', redirect: '/mobile/pm/home' },
      ...['home', 'property', 'manage', 'account'].map((mode) => ({
        path: `pm/${mode}`,
        component: () => import('pages/mobile/WorkspacePage.vue'),
        props: { mode },
        meta: { requiresAuth: true, mobilePm: true },
      })),
      {
        path: 'pm/task/:propertyId/:taskId',
        component: () => import('pages/mobile/WorkspaceTaskPage.vue'),
        meta: { requiresAuth: true, mobilePm: true, mobileDetail: true },
      },
      {
        path: 'pm/property/lease/:leaseId/inventory',
        component: () => import('pages/mobile/InventoryWorkspacePage.vue'),
        meta: { requiresAuth: true, mobilePm: true },
      },
      {
        path: 'pm/create',
        component: () => import('pages/mobile/WorkspaceCreatePage.vue'),
        meta: { requiresAuth: true, mobilePm: true },
      },
      { path: 'pm/records', redirect: (to) => ({ path: '/mobile/pm/manage', query: to.query }) },
    ],
  },
  {
    path: '/inventory-review',
    component: () => import('layouts/MobileWorkspaceLayout.vue'),
    children: [
      {
        path: ':leaseId',
        component: () => import('pages/mobile/InventoryWorkspacePage.vue'),
        meta: { requiresAuth: true, tenantReview: true },
      },
    ],
  },
]
export default mobileRoutes
