export const ownerWorkspaceLinks = [
  { title: 'Dashboard', icon: 'dashboard', link: '/po-dashboard' },
  { title: 'Properties', icon: 'holiday_village', link: '/owner/properties', collection: null },
  { title: 'Reports', icon: 'assessment', link: '/owner/reports' },
  { title: 'Tasks', icon: 'handyman', link: '/owner/tasks', collection: 'mxrecords' },
  { title: 'Leases', icon: 'description', link: '/owner/leases', collection: 'leases' },
  { title: 'Transactions', icon: 'receipt_long', link: '/owner/transactions', collection: 'transactions' },
  { title: 'Documents', icon: 'folder', link: '/owner/documents', collection: 'documents' },
  { title: 'Assets', icon: 'inventory_2', link: '/owner/assets', collection: 'assets' },
  { title: 'Reminders', icon: 'notifications', link: '/owner/reminders', collection: 'reminders' },
]

export const isOwnerWorkspacePath = (path) => ownerWorkspaceLinks.some((item) => item.link === path)
