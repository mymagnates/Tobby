export const mobileTabsByRole = {
  pm: [
    { label: 'Home', icon: 'home', to: '/mobile/pm/home' },
    { label: 'Manage', icon: 'add_box', to: '/mobile/pm/manage' },
    { label: 'Property', icon: 'apartment', to: '/mobile/pm/property' },
    { label: 'Tobby AI', icon: 'support_agent', to: '/mobile/pm/tobby' },
    { label: 'Account', icon: 'person', to: '/mobile/pm/account' },
  ],
  owner: [
    { label: 'Home', icon: 'home', to: '/mobile/owner/home' },
    { label: 'Manage', icon: 'add_box', to: '/mobile/owner/manage' },
    { label: 'Property', icon: 'apartment', to: '/mobile/owner/property' },
    { label: 'Reports', icon: 'query_stats', to: '/mobile/owner/financial' },
    { label: 'Account', icon: 'person', to: '/mobile/owner/account' },
  ],
  sp: [
    { label: 'Home', icon: 'home', to: '/mobile/sp/home' },
    { label: 'Bids', icon: 'request_quote', to: '/mobile/sp/bids' },
    { label: 'Projects', icon: 'work', to: '/mobile/sp/projects' },
    { label: 'Handout', icon: 'article', to: '/mobile/sp/handout' },
    { label: 'Account', icon: 'person', to: '/mobile/sp/account' },
  ],
  tenant: [
    { label: 'Home', icon: 'home', to: '/mobile/tenant/home' },
    { label: 'Requests', icon: 'build_circle', to: '/mobile/tenant/requests' },
    { label: 'Lease', icon: 'description', to: '/mobile/tenant/lease' },
    { label: 'Documents', icon: 'folder', to: '/mobile/tenant/documents' },
    { label: 'Account', icon: 'person', to: '/mobile/tenant/account' },
  ],
}

export const mobilePageContent = {
  pm: {
    home: {
      eyebrow: 'PM',
      title: 'Home',
      description: 'Feed and reminders that need attention.',
      sections: [
        {
          title: 'Feed',
          items: [
            {
              icon: 'priority_high',
              title: 'Kitchen sink leaking',
              meta: 'Tenant request - 123 Main St - Updated 12 min ago',
              status: 'Urgent',
              tone: 'danger',
            },
            {
              icon: 'request_quote',
              title: 'Plumbing quote received',
              meta: 'Bid response - ABC Plumbing - $280',
              status: 'Review',
              tone: 'accent',
            },
            {
              icon: 'assignment',
              title: 'Move-in checklist pending',
              meta: 'Inventory - Current lease',
              status: 'Open',
            },
          ],
        },
        {
          title: 'Reminders',
          items: [
            {
              icon: 'event',
              title: 'Follow up with HVAC provider',
              meta: 'Today 3:00 PM - 456 Oak Ave',
              status: 'Today',
              tone: 'warning',
            },
          ],
        },
      ],
    },
    manage: {
      eyebrow: 'PM',
      title: 'Manage',
      description: 'Create records and process operational work.',
      actionGroups: [
        {
          title: 'Quick',
          actions: [
            { icon: 'support_agent', label: 'Describe with Tobby', hint: 'Turn notes into a draft' },
          ],
        },
        {
          title: 'Create Records',
          actions: [
            { icon: 'payments', label: 'Transaction', hint: 'Income, expense, payment' },
            { icon: 'task_alt', label: 'Task', hint: 'Work item or issue' },
          ],
        },
        {
          title: 'Operations',
          actions: [
            { icon: 'event', label: 'Reminder', hint: 'Follow-up date' },
            { icon: 'upload_file', label: 'Document', hint: 'File or photo upload' },
            { icon: 'inventory_2', label: 'Inventory Form', hint: 'Lease-bound items' },
            { icon: 'handyman', label: 'Service', hint: 'SP service record' },
            { icon: 'chair', label: 'Asset', hint: 'Property asset' },
          ],
        },
        {
          title: 'Review',
          actions: [
            { icon: 'rate_review', label: 'Bids', hint: 'Approve, reject, request revision' },
          ],
        },
      ],
    },
    property: {
      eyebrow: 'PM',
      title: 'Property',
      description: 'Open property records and current lease inventory.',
      sections: [
        {
          title: 'Properties',
          items: [
            {
              icon: 'apartment',
              title: '123 Main St',
              meta: 'Sarah Lee - Active lease - Inventory ready',
              status: 'Inventory',
              tone: 'accent',
            },
            {
              icon: 'home_work',
              title: '456 Oak Ave',
              meta: 'Vacant - 2 open tasks - No active lease',
              status: 'Records',
            },
          ],
        },
        {
          title: 'Record Types',
          items: [
            { icon: 'folder', title: 'Documents', meta: 'Property and lease files' },
            { icon: 'description', title: 'Lease', meta: 'Current and historical lease records' },
            { icon: 'payments', title: 'Transactions', meta: 'Property financial records' },
            { icon: 'inventory_2', title: 'Current Lease Inventory', meta: 'Inventory list bound to lease' },
          ],
        },
      ],
    },
    tobby: {
      eyebrow: 'PM',
      title: 'Tobby AI',
      description: 'Structured drafts using the same boundaries as the web assistant.',
      sections: [
        {
          title: 'Supported Drafts',
          items: [
            { icon: 'task_alt', title: 'Task draft', meta: 'Create task form review required' },
            { icon: 'payments', title: 'Transaction draft', meta: 'Property and role rules matched locally' },
            { icon: 'event', title: 'Reminder draft', meta: 'Category and repeat options normalized' },
            { icon: 'handyman', title: 'Service draft', meta: 'PM/Admin capability only' },
            { icon: 'chair', title: 'Asset draft', meta: 'Type and location hints resolved locally' },
          ],
        },
        {
          title: 'Boundary',
          items: [
            { icon: 'verified_user', title: 'Review before save', meta: 'AI opens forms with draft values, never writes directly' },
            { icon: 'report', title: 'No DIY repair advice', meta: 'Task insight explains issue meaning and urgency only' },
          ],
        },
      ],
    },
    account: {
      eyebrow: 'PM',
      title: 'Account',
      description: 'Profile and mobile preferences.',
      sections: [
        {
          title: 'Settings',
          items: [
            { icon: 'person', title: 'Profile', meta: 'Name, email, organization' },
            { icon: 'notifications', title: 'Notifications', meta: 'Mobile alerts and reminders' },
            { icon: 'logout', title: 'Sign out', meta: 'End this session' },
          ],
        },
      ],
    },
  },
  owner: {
    home: {
      eyebrow: 'Owner',
      title: 'Home',
      description: 'Portfolio snapshot and recent updates.',
      sections: [
        {
          title: 'Snapshot',
          items: [
            { icon: 'apartment', title: '3 active properties', meta: '2 occupied - 1 vacant' },
            { icon: 'build', title: '1 active maintenance item', meta: 'Updated yesterday' },
            { icon: 'folder', title: '2 new documents', meta: 'Statements and receipts' },
          ],
        },
      ],
    },
    manage: {
      eyebrow: 'Owner',
      title: 'Manage',
      description: 'Limited owner input for tasks, transactions, and documents.',
      actionGroups: [
        {
          title: 'Add',
          actions: [
            { icon: 'task_alt', label: 'Task', hint: 'Create a maintenance or follow-up item' },
            { icon: 'payments', label: 'Transaction', hint: 'Log income, expense, or payment' },
          ],
        },
        {
          title: 'Document',
          actions: [
            { icon: 'upload_file', label: 'Upload Document', hint: 'Attach owner-related files' },
            { icon: 'folder', label: 'Recent Documents', hint: 'Review uploaded records' },
          ],
        },
      ],
    },
    property: {
      eyebrow: 'Owner',
      title: 'Property',
      description: 'High-quality property information and history.',
      sections: [
        {
          title: 'Properties',
          items: [
            { icon: 'home', title: '123 Main St', meta: 'Occupied - Lease ends Aug 2026 - $2,400 rent' },
            { icon: 'home', title: '456 Oak Ave', meta: 'Vacant - 1 active maintenance item' },
          ],
        },
        {
          title: 'Records',
          items: [
            { icon: 'description', title: 'Lease Summary', meta: 'Terms, rent, deposit, dates' },
            { icon: 'build', title: 'Maintenance', meta: 'Tasks and service status' },
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
            { icon: 'account_balance_wallet', title: 'Cash flow', meta: '$4,800 income - $620 expense - $4,180 net', status: 'Positive', tone: 'accent' },
            { icon: 'home', title: 'Occupancy', meta: '2 occupied - 1 vacant', status: '67%' },
            { icon: 'warning', title: 'Rent risk', meta: '$0 outstanding', status: 'Clear', tone: 'accent' },
            { icon: 'build', title: 'Maintenance', meta: '1 open - 3 resolved - avg 2 days', status: 'Watch', tone: 'warning' },
          ],
        },
        {
          title: 'Needs Attention',
          items: [
            { icon: 'build', title: 'Kitchen sink repair', meta: '123 Main St - Open since May 20', status: 'Open', tone: 'warning' },
          ],
        },
        {
          title: 'Recent Activity',
          items: [
            { icon: 'receipt', title: 'Plumbing repair', meta: '123 Main St - -$280 - May 18', status: 'Repair' },
            { icon: 'south_west', title: 'Rent received', meta: '123 Main St - +$2,400 - May 1', status: 'Rent', tone: 'accent' },
          ],
        },
      ],
    },
    account: {
      eyebrow: 'Owner',
      title: 'Account',
      description: 'Profile, notifications, and session settings.',
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
  },
  sp: {
    home: {
      eyebrow: 'SP',
      title: 'Home',
      description: 'Leads available for review and bidding.',
      sections: [
        {
          title: 'Leads',
          items: [
            { icon: 'plumbing', title: 'Kitchen sink leak', meta: 'Plumbing - San Jose - Posted 1h ago', status: 'Bid', tone: 'accent' },
            { icon: 'hvac', title: 'AC not cooling', meta: 'HVAC - Santa Clara - Urgent', status: 'New', tone: 'warning' },
          ],
        },
      ],
    },
    bids: {
      eyebrow: 'SP',
      title: 'Bids',
      description: 'Manage submitted bids and PM feedback.',
      sections: [
        {
          title: 'Submitted',
          items: [
            { icon: 'request_quote', title: 'Plumbing repair quote', meta: '$280 - Submitted today', status: 'Submitted' },
            { icon: 'rate_review', title: 'Fence repair estimate', meta: '$740 - PM requested revision', status: 'Revise', tone: 'warning' },
          ],
        },
      ],
    },
    projects: {
      eyebrow: 'SP',
      title: 'Projects',
      description: 'Manage accepted work, proof, and project invoices.',
      sections: [
        {
          title: 'Active Projects',
          items: [
            { icon: 'work', title: 'Bathroom faucet repair', meta: 'Accepted - Invoice not sent', status: 'Active', tone: 'accent' },
            { icon: 'upload_file', title: 'Upload completion proof', meta: 'Photos and note required' },
          ],
        },
        {
          title: 'Invoices',
          items: [
            { icon: 'receipt_long', title: 'Create Invoice', meta: 'Invoice stays attached to project' },
          ],
        },
      ],
    },
    handout: {
      eyebrow: 'SP',
      title: 'Handout',
      description: 'Manage posts and the service handout page.',
      sections: [
        {
          title: 'Posts',
          items: [
            { icon: 'post_add', title: 'Create post', meta: 'Add work examples as handout material' },
            { icon: 'collections', title: 'Selected posts', meta: 'Choose what appears in the handout' },
          ],
        },
        {
          title: 'Handout',
          items: [
            { icon: 'preview', title: 'Preview handout', meta: 'Profile, services, coverage, selected posts' },
            { icon: 'ios_share', title: 'Share link', meta: 'Copy or send the public page' },
          ],
        },
      ],
    },
    account: {
      eyebrow: 'SP',
      title: 'Account',
      description: 'Profile, service scope, and settings.',
      sections: [
        {
          title: 'Settings',
          items: [
            { icon: 'person', title: 'Profile', meta: 'Business and contact info' },
            { icon: 'map', title: 'Service area', meta: 'Categories and coverage' },
            { icon: 'logout', title: 'Sign out', meta: 'End this session' },
          ],
        },
      ],
    },
  },
  tenant: {
    home: {
      eyebrow: 'Tenant',
      title: 'Home',
      description: 'Lease status, requests, and recent notices.',
      sections: [
        {
          title: 'Lease',
          items: [
            { icon: 'home', title: '123 Main St - Unit 2B', meta: 'Active lease - Ends Aug 2026' },
            { icon: 'payments', title: 'Monthly rent', meta: '$2,400 - Due on the 1st' },
          ],
        },
        {
          title: 'Open Requests',
          items: [
            { icon: 'build_circle', title: 'Dishwasher not draining', meta: 'Submitted yesterday - PM update pending', status: 'Open' },
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
          title: 'Create',
          actions: [
            { icon: 'add_task', label: 'Submit Request', hint: 'Category, photos, description, urgency' },
          ],
        },
      ],
      sections: [
        {
          title: 'Request History',
          items: [
            { icon: 'build', title: 'Dishwasher not draining', meta: 'Open - Submitted yesterday' },
            { icon: 'check_circle', title: 'Smoke detector battery', meta: 'Closed - Completed last week' },
          ],
        },
      ],
    },
    lease: {
      eyebrow: 'Tenant',
      title: 'Lease',
      description: 'Lease summary and assigned inventory list.',
      sections: [
        {
          title: 'Summary',
          items: [
            { icon: 'description', title: 'Lease term', meta: 'Sep 2025 - Aug 2026' },
            { icon: 'payments', title: 'Rent and deposit', meta: '$2,400 rent - $2,400 deposit' },
            { icon: 'inventory_2', title: 'Move-in inventory', meta: 'Assigned draft list - Tenant can update before submit' },
          ],
        },
      ],
    },
    documents: {
      eyebrow: 'Tenant',
      title: 'Documents',
      description: 'Lease documents, notices, receipts, and request files.',
      sections: [
        {
          title: 'Documents',
          items: [
            { icon: 'description', title: 'Lease agreement', meta: 'Lease - Current term' },
            { icon: 'campaign', title: 'Entry notice', meta: 'Notice - Uploaded May 18' },
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
  },
}
