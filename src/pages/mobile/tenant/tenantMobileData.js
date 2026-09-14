export const tenantMobilePages = {
  home: {
    eyebrow: 'Tenant',
    title: 'Home',
    description: 'Lease status, requests, and recent notices.',
    metrics: [
      { label: 'Rent', value: '$2.4k', note: 'Due 1st' },
      { label: 'Requests', value: '1', note: 'Open' },
      { label: 'Docs', value: '3', note: 'Current' },
    ],
    sections: [
      {
        title: 'Today',
        items: [
          {
            icon: 'home',
            title: '123 Main St - Unit 2B',
            meta: 'Active lease - ends Aug 2026',
            status: 'Active',
            tone: 'accent',
          },
          {
            icon: 'build_circle',
            title: 'Dishwasher not draining',
            meta: 'Submitted yesterday - PM update pending',
            status: 'Open',
            tone: 'warning',
          },
        ],
      },
    ],
  },
  requests: {
    eyebrow: 'Tenant',
    title: 'Requests',
    description: 'Submit and track maintenance requests.',
    actionGroups: [
      {
        title: 'Create Request',
        intent: 'create',
        actions: [
          {
            icon: 'add_task',
            label: 'New Request',
            hint: 'Category, photos, urgency',
            to: '/mobile/tenant/requests/new',
          },
        ],
      },
    ],
    sections: [
      {
        title: 'Request History',
        items: [
          {
            icon: 'build',
            title: 'Dishwasher not draining',
            meta: 'Open - submitted yesterday',
            status: 'Open',
            tone: 'warning',
          },
          {
            icon: 'check_circle',
            title: 'Smoke detector battery',
            meta: 'Closed - completed last week',
          },
        ],
      },
    ],
  },
  lease: {
    eyebrow: 'Tenant',
    title: 'Lease',
    description: 'Lease summary, rent terms, and assigned inventory.',
    sections: [
      {
        title: 'Summary',
        items: [
          { icon: 'description', title: 'Lease term', meta: 'Sep 2025 - Aug 2026' },
          { icon: 'payments', title: 'Rent and deposit', meta: '$2,400 rent - $2,400 deposit' },
          {
            icon: 'inventory_2',
            title: 'Move-in inventory',
            meta: 'Assigned list available for tenant review',
            status: 'Open',
            tone: 'accent',
            to: '/mobile/tenant/lease/inventory',
          },
        ],
      },
    ],
  },
  documents: {
    eyebrow: 'Tenant',
    title: 'Documents',
    description: 'Lease documents, notices, receipts, and request files.',
    actionGroups: [
      {
        title: 'Create Document',
        intent: 'create',
        actions: [
          {
            icon: 'upload_file',
            label: 'Upload Document',
            hint: 'Attach a tenant file',
            to: '/mobile/tenant/documents/upload',
            wide: true,
          },
        ],
      },
    ],
    sections: [
      {
        title: 'Documents',
        items: [
          { icon: 'description', title: 'Lease agreement', meta: 'Lease - current term' },
          { icon: 'campaign', title: 'Entry notice', meta: 'Notice - uploaded May 18' },
          { icon: 'receipt', title: 'Rent receipt', meta: 'Receipt - May payment' },
        ],
      },
    ],
  },
  account: {
    eyebrow: 'Tenant',
    title: 'Account',
    description: 'Profile and notification settings.',
    sections: [
      {
        title: 'Settings',
        items: [
          { icon: 'person', title: 'Profile', meta: 'Contact details' },
          { icon: 'notifications', title: 'Notifications', meta: 'Request and lease updates' },
          { icon: 'logout', title: 'Sign out', meta: 'End this session' },
        ],
      },
    ],
  },
}
