export const ownerMobilePages = {
  home: {
    eyebrow: 'Owner',
    title: 'Home',
    description: 'Portfolio quality, financial health, and recent activity.',
    metrics: [
      { label: 'Net', value: '$4.18k', note: 'This month' },
      { label: 'Occupancy', value: '2 / 3', note: 'Active leases' },
      { label: 'Open', value: '1', note: 'Task' },
    ],
    sections: [
      {
        title: 'Portfolio Feed',
        items: [
          {
            icon: 'receipt_long',
            title: 'May owner statement ready',
            meta: '2 properties - income and expense summary',
            status: 'New',
            tone: 'accent',
          },
          {
            icon: 'build',
            title: 'Kitchen sink repair updated',
            meta: '123 Main St - SP completed work photo',
            status: 'Review',
          },
          {
            icon: 'description',
            title: 'Lease renewal check',
            meta: '456 Oak Ave - PM follow-up scheduled',
          },
        ],
      },
    ],
  },
  manage: {
    eyebrow: 'Owner',
    title: 'Manage',
    description: 'Owner input is limited to records the owner can supply.',
    actionGroups: [
      {
        title: 'Create Record',
        intent: 'create',
        actions: [
          {
            icon: 'task_alt',
            label: 'New Task',
            hint: 'Create maintenance or follow-up',
            to: '/mobile/owner/manage/task',
          },
          {
            icon: 'payments',
            label: 'New Transaction',
            hint: 'Log owner income or expense',
            to: '/mobile/owner/manage/transaction',
          },
        ],
      },
      {
        title: 'Document',
        actions: [
          {
            icon: 'upload_file',
            label: 'Upload Document',
            hint: 'Attach receipt, notice, or statement',
            to: '/mobile/owner/manage/document',
            intent: 'create',
          },
          {
            icon: 'folder',
            label: 'View Documents',
            hint: 'Review uploaded owner files',
            to: '/mobile/owner/property',
            create: false,
          },
        ],
      },
      {
        title: 'View Records',
        actions: [
          {
            icon: 'payments',
            label: 'Transactions',
            hint: 'View saved owner transactions',
            to: '/mobile/owner/manage/view/transactions',
          },
          {
            icon: 'task_alt',
            label: 'Tasks',
            hint: 'View owner-visible tasks',
            to: '/mobile/owner/manage/view/tasks',
          },
          {
            icon: 'folder',
            label: 'Documents',
            hint: 'View uploaded documents',
            to: '/mobile/owner/manage/view/documents',
          },
        ],
      },
    ],
  },
  property: {
    eyebrow: 'Owner',
    title: 'Property',
    description: 'Property cards focus on history and information quality.',
    sections: [
      {
        title: 'Properties',
        items: [
          {
            icon: 'home',
            title: '123 Main St',
            meta: 'Occupied - lease ends Aug 2026 - $2,400 rent',
            status: 'Active',
            tone: 'accent',
          },
          {
            icon: 'home_work',
            title: '456 Oak Ave',
            meta: 'Vacant - 1 open maintenance item',
            status: 'Watch',
            tone: 'warning',
          },
        ],
      },
      {
        title: 'History',
        items: [
          {
            icon: 'description',
            title: 'Lease summary',
            meta: 'Terms, rent, deposit, renewal dates',
          },
          { icon: 'build', title: 'Task history', meta: 'Maintenance and service timeline' },
          { icon: 'folder', title: 'Documents', meta: 'Lease, invoice, receipt, notice' },
        ],
      },
    ],
  },
  financial: {
    eyebrow: 'Owner',
    title: 'Reports',
    description: 'Simple portfolio status without full web report tools.',
    metrics: [
      { label: 'Health', value: 'Watch', note: '1 item' },
      { label: 'Net', value: '$4.18k', note: 'Recorded' },
      { label: 'Occ.', value: '2/3', note: 'Properties' },
    ],
    sections: [
      {
        title: 'Status Summary',
        items: [
          {
            icon: 'account_balance_wallet',
            title: 'Cash flow',
            meta: '$4,800 income - $620 expense - $4,180 net',
            status: 'Positive',
            tone: 'accent',
          },
          { icon: 'home', title: 'Occupancy', meta: '2 occupied - 1 vacant', status: '67%' },
          {
            icon: 'warning',
            title: 'Rent risk',
            meta: '$0 outstanding',
            status: 'Clear',
            tone: 'accent',
          },
          {
            icon: 'build',
            title: 'Maintenance',
            meta: '1 open - 3 resolved - avg 2 days',
            status: 'Watch',
            tone: 'warning',
          },
        ],
      },
      {
        title: 'Needs Attention',
        items: [
          {
            icon: 'build',
            title: 'Kitchen sink repair',
            meta: '123 Main St - Open since May 20',
            status: 'Open',
            tone: 'warning',
          },
        ],
      },
      {
        title: 'Recent Activity',
        items: [
          {
            icon: 'receipt',
            title: 'Plumbing repair',
            meta: '123 Main St - -$280 - May 18',
            status: 'Repair',
          },
          {
            icon: 'south_west',
            title: 'Rent received',
            meta: '123 Main St - +$2,400 - May 1',
            status: 'Rent',
            tone: 'accent',
          },
        ],
      },
    ],
  },
  account: {
    eyebrow: 'Owner',
    title: 'Account',
    description: 'Profile, notification, and session settings.',
    sections: [
      {
        title: 'Settings',
        items: [
          { icon: 'person', title: 'Profile', meta: 'Contact and account details' },
          {
            icon: 'notifications',
            title: 'Notifications',
            meta: 'Statements and property updates',
          },
          { icon: 'logout', title: 'Sign out', meta: 'End this session' },
        ],
      },
    ],
  },
}
