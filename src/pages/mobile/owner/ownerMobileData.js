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
          { icon: 'receipt_long', title: 'May owner statement ready', meta: '2 properties - income and expense summary', status: 'New', tone: 'accent' },
          { icon: 'build', title: 'Kitchen sink repair updated', meta: '123 Main St - SP completed work photo', status: 'Review' },
          { icon: 'description', title: 'Lease renewal check', meta: '456 Oak Ave - PM follow-up scheduled' },
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
        title: 'Add',
        actions: [
          { icon: 'task_alt', label: 'Task', hint: 'Create a maintenance or follow-up item', to: '/mobile/owner/manage/task' },
          { icon: 'payments', label: 'Transaction', hint: 'Log owner-side income or expense', to: '/mobile/owner/manage/transaction' },
        ],
      },
      {
        title: 'Document',
        actions: [
          { icon: 'upload_file', label: 'Upload', hint: 'Attach receipt, notice, or statement', to: '/mobile/owner/manage/document' },
          { icon: 'folder', label: 'Recent', hint: 'Review uploaded owner files', to: '/mobile/owner/property' },
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
          { icon: 'home', title: '123 Main St', meta: 'Occupied - lease ends Aug 2026 - $2,400 rent', status: 'Active', tone: 'accent' },
          { icon: 'home_work', title: '456 Oak Ave', meta: 'Vacant - 1 open maintenance item', status: 'Watch', tone: 'warning' },
        ],
      },
      {
        title: 'History',
        items: [
          { icon: 'description', title: 'Lease summary', meta: 'Terms, rent, deposit, renewal dates' },
          { icon: 'build', title: 'Task history', meta: 'Maintenance and service timeline' },
          { icon: 'folder', title: 'Documents', meta: 'Lease, invoice, receipt, notice' },
        ],
      },
    ],
  },
  financial: {
    eyebrow: 'Owner',
    title: 'Financial',
    description: 'Income, expenses, net view, and transaction history.',
    metrics: [
      { label: 'Income', value: '$4.8k', note: 'Received' },
      { label: 'Expense', value: '$620', note: 'Recorded' },
      { label: 'Net', value: '$4.18k', note: 'Estimated' },
    ],
    sections: [
      {
        title: 'Transactions',
        items: [
          { icon: 'south_west', title: 'Rent received', meta: '123 Main St - May rent - $2,400', status: 'Paid', tone: 'accent' },
          { icon: 'north_east', title: 'Plumbing repair', meta: '123 Main St - $280 - Receipt attached' },
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
          { icon: 'notifications', title: 'Notifications', meta: 'Statements and property updates' },
          { icon: 'logout', title: 'Sign out', meta: 'End this session' },
        ],
      },
    ],
  },
}
