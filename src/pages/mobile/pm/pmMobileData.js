export const pmFeedItems = [
  {
    icon: 'priority_high',
    title: 'Kitchen sink leaking',
    meta: 'Tenant request - 123 Main St - Updated 12 min ago',
    status: 'Urgent',
    tone: 'danger',
    to: '/mobile/pm/manage/task',
  },
  {
    icon: 'request_quote',
    title: 'Plumbing quote received',
    meta: 'Bid response - ABC Plumbing - $280',
    status: 'Review',
    tone: 'accent',
    to: '/mobile/pm/manage/bids',
  },
  {
    icon: 'assignment',
    title: 'Move-in checklist pending',
    meta: 'Inventory - Current lease',
    status: 'Open',
    to: '/mobile/pm/property/123-main/inventory',
  },
]

export const pmReminders = [
  {
    icon: 'event',
    title: 'Follow up with HVAC provider',
    meta: 'Today 3:00 PM - 456 Oak Ave',
    status: 'Today',
    tone: 'warning',
    to: '/mobile/pm/manage/reminder',
  },
  {
    icon: 'schedule',
    title: 'Lease renewal check',
    meta: 'Tomorrow - 123 Main St',
    status: 'Upcoming',
  },
]

export const pmManageGroups = [
  {
    title: 'Quick',
    actions: [
      {
        icon: 'support_agent',
        label: 'Describe with Tobby',
        hint: 'Turn notes into a structured draft',
        to: '/mobile/pm/tobby',
      },
    ],
  },
  {
    title: 'Create Records',
    actions: [
      {
        icon: 'payments',
        label: 'Transaction',
        hint: 'Income, expense, payment',
        to: '/mobile/pm/manage/transaction',
      },
      {
        icon: 'task_alt',
        label: 'Task',
        hint: 'Work item or issue',
        to: '/mobile/pm/manage/task',
      },
    ],
  },
  {
    title: 'Operations',
    actions: [
      {
        icon: 'event',
        label: 'Reminder',
        hint: 'Follow-up date',
        to: '/mobile/pm/manage/reminder',
      },
      {
        icon: 'upload_file',
        label: 'Document',
        hint: 'File or photo upload',
        to: '/mobile/pm/manage/document',
      },
      {
        icon: 'inventory_2',
        label: 'Inventory Form',
        hint: 'Lease-bound items',
        to: '/mobile/pm/manage/inventory',
      },
      {
        icon: 'handyman',
        label: 'Service',
        hint: 'SP service record',
        to: '/mobile/pm/manage/service',
      },
      {
        icon: 'chair',
        label: 'Asset',
        hint: 'Property asset',
        to: '/mobile/pm/manage/asset',
      },
    ],
  },
  {
    title: 'Review',
    actions: [
      {
        icon: 'rate_review',
        label: 'Bids',
        hint: 'Approve, reject, request revision',
        to: '/mobile/pm/manage/bids',
      },
    ],
  },
]

export const pmManageActions = {
  transaction: {
    eyebrow: 'PM Manage',
    title: 'Transaction',
    description: 'Quickly log income, expense, payment, refund, or receipt.',
    icon: 'payments',
    primaryAction: 'Save Transaction',
    fields: ['Transaction type', 'Amount', 'Category', 'Property', 'Date', 'Receipt photo optional', 'Note optional'],
  },
  task: {
    eyebrow: 'PM Manage',
    title: 'Task',
    description: 'Create a work item or issue that needs follow-up.',
    icon: 'task_alt',
    primaryAction: 'Create Task',
    fields: ['Property', 'Title', 'Issue type', 'Priority', 'Description', 'Due date optional', 'Photos optional'],
  },
  reminder: {
    eyebrow: 'PM Manage',
    title: 'Reminder',
    description: 'Create a follow-up tied to a date, property, or record.',
    icon: 'event',
    primaryAction: 'Create Reminder',
    fields: ['Title', 'Due date', 'Due time optional', 'Related property optional', 'Related record optional', 'Repeat optional'],
  },
  document: {
    eyebrow: 'PM Manage',
    title: 'Document',
    description: 'Upload a file or photo and connect it to property records.',
    icon: 'upload_file',
    primaryAction: 'Upload Document',
    fields: ['File or photo', 'Document type', 'Related property optional', 'Related lease optional', 'Related task/service optional', 'Note optional'],
  },
  inventory: {
    eyebrow: 'PM Manage',
    title: 'Inventory Form',
    description: 'Update inventory items under the current lease context.',
    icon: 'inventory_2',
    primaryAction: 'Save Inventory Update',
    fields: ['Property', 'Active lease', 'Room / area', 'Item', 'Condition', 'Photos', 'Create task from this optional'],
  },
  service: {
    eyebrow: 'PM Manage',
    title: 'Service',
    description: 'Create or update a service record related to SP work.',
    icon: 'handyman',
    primaryAction: 'Create Service',
    fields: ['Property', 'Service type', 'Title', 'Description', 'Priority', 'Related task optional', 'Need bid optional'],
  },
  asset: {
    eyebrow: 'PM Manage',
    title: 'Asset',
    description: 'Add property asset information with location and condition.',
    icon: 'chair',
    primaryAction: 'Save Asset',
    fields: ['Property', 'Asset type', 'Name / label', 'Location / room', 'Condition', 'Photos optional', 'Serial number optional'],
  },
  bids: {
    eyebrow: 'PM Review',
    title: 'Bids',
    description: 'Review submitted bids and choose the next action.',
    icon: 'rate_review',
    primaryAction: 'Open Selected Bid',
    fields: ['Service / task title', 'Property', 'SP name', 'Bid amount', 'Submitted time', 'Status', 'PM feedback'],
  },
}

export const pmProperties = [
  {
    id: '123-main',
    title: '123 Main St',
    meta: 'Sarah Lee - Active lease - Inventory ready',
    status: 'Inventory',
    tone: 'accent',
  },
  {
    id: '456-oak',
    title: '456 Oak Ave',
    meta: 'Vacant - 2 open tasks - No active lease',
    status: 'Records',
  },
]
