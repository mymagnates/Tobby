export const SP_MOBILE_PREVIEW_SP_ID = 'sp-mobile-preview'

export const spMobilePreviewLeads = [
  {
    id: 'lead-kitchen-sink',
    lead_doc_id: 'lead-kitchen-sink',
    lead_id: 'lead-kitchen-sink',
    mx_id: 'mx-preview-kitchen-sink',
    task_id: 'mx-preview-kitchen-sink',
    title: 'Kitchen sink leak',
    task_title: 'Kitchen sink leak',
    category: 'Plumbing',
    city: 'San Jose',
    property_address: '188 Market St, San Jose',
    budget_range: '$200-$350',
    status: 'open',
  },
  {
    id: 'lead-ac-cooling',
    lead_doc_id: 'lead-ac-cooling',
    lead_id: 'lead-ac-cooling',
    mx_id: 'mx-preview-ac-cooling',
    task_id: 'mx-preview-ac-cooling',
    title: 'AC not cooling',
    task_title: 'AC not cooling',
    category: 'HVAC',
    city: 'Santa Clara',
    property_address: '42 Benton Ave, Santa Clara',
    budget_range: '$450-$750',
    status: 'open',
  },
]

export const spMobilePreviewBids = [
  {
    id: 'bid-plumbing-repair',
    bid_id: 'bid-plumbing-repair',
    sp_id: SP_MOBILE_PREVIEW_SP_ID,
    lead_id: 'lead-kitchen-sink',
    lead_doc_id: 'lead-kitchen-sink',
    title: 'Plumbing repair quote',
    lead_title: 'Kitchen sink leak',
    amount: 280,
    currency: 'USD',
    estimated_duration: '2 hours',
    availability_date: '2026-05-23',
    note: 'Includes leak inspection, trap replacement if needed, and cleanup.',
    status: 'submitted',
    created_at: '2026-05-21',
  },
  {
    id: 'bid-fence-repair',
    bid_id: 'bid-fence-repair',
    sp_id: SP_MOBILE_PREVIEW_SP_ID,
    lead_id: 'lead-fence-repair',
    lead_doc_id: 'lead-fence-repair',
    title: 'Fence repair estimate',
    lead_title: 'Fence repair',
    amount: 740,
    currency: 'USD',
    estimated_duration: '1 day',
    availability_date: '2026-05-24',
    note: 'PM requested a clearer material breakdown before approval.',
    status: 'revision_requested',
    created_at: '2026-05-20',
  },
]

export const spMobilePreviewProjects = [
  {
    id: 'project-bathroom-faucet',
    project_id: 'project-bathroom-faucet',
    sp_id: SP_MOBILE_PREVIEW_SP_ID,
    task_title: 'Bathroom faucet repair',
    title: 'Bathroom faucet repair',
    project_title: 'Bathroom faucet repair',
    address: '915 Mission St, San Francisco',
    property_address: '915 Mission St, San Francisco',
    status: 'active',
    accepted_at: '2026-05-20',
    phases: {
      scheduled: { done: true, completed_at: '2026-05-20T15:30:00.000Z' },
      in_progress: { done: false, completed_at: null },
      completed: { done: false, completed_at: null },
    },
    comments: [
      { text: 'PM confirmed access window for tomorrow morning.', created_at: '2026-05-20T18:00:00.000Z', author: 'pm-preview' },
    ],
  },
]

export const spMobilePages = {
  home: {
    eyebrow: 'SP',
    title: 'Home',
    description: 'Leads available for review and bidding.',
    metrics: [
      { label: 'New', value: '2', note: 'Leads' },
      { label: 'Due', value: '1', note: 'Bid' },
      { label: 'Active', value: '2', note: 'Projects' },
    ],
    sections: [
      {
        title: 'Leads',
        items: [
          { icon: 'plumbing', title: 'Kitchen sink leak', meta: 'Plumbing - San Jose - Posted 1h ago', status: 'Bid', tone: 'accent', to: '/mobile/sp/leads/lead-kitchen-sink/bid' },
          { icon: 'hvac', title: 'AC not cooling', meta: 'HVAC - Santa Clara - urgent', status: 'New', tone: 'warning', to: '/mobile/sp/leads/lead-ac-cooling/bid' },
        ],
      },
    ],
  },
  bids: {
    eyebrow: 'SP',
    title: 'Bids',
    description: 'Submitted bids, PM feedback, and revision work.',
    sections: [
      {
        title: 'Submitted',
        items: [
          { icon: 'request_quote', title: 'Plumbing repair quote', meta: '$280 - submitted today', status: 'Submitted', to: '/mobile/sp/bids/bid-plumbing-repair/revision' },
          { icon: 'rate_review', title: 'Fence repair estimate', meta: '$740 - PM requested revision', status: 'Revise', tone: 'warning', to: '/mobile/sp/bids/bid-fence-repair/revision' },
        ],
      },
    ],
  },
  projects: {
    eyebrow: 'SP',
    title: 'Projects',
    description: 'Accepted work, proof, and invoices in one place.',
    sections: [
      {
        title: 'Active Projects',
        items: [
          { icon: 'work', title: 'Bathroom faucet repair', meta: 'Accepted - invoice not sent', status: 'Active', tone: 'accent', to: '/mobile/sp/projects/project-bathroom-faucet/detail' },
          { icon: 'upload_file', title: 'Completion proof', meta: 'Track phases and project notes', to: '/mobile/sp/projects/project-bathroom-faucet/detail' },
        ],
      },
      {
        title: 'Invoices',
        items: [
          { icon: 'receipt_long', title: 'Create invoice', meta: 'Invoice stays attached to project', status: 'Project', to: '/mobile/sp/projects/project-bathroom-faucet/invoice' },
          { icon: 'payments', title: 'Paid invoices', meta: 'Payment history and receipts' },
        ],
      },
    ],
  },
  handout: {
    eyebrow: 'SP',
    title: 'Handout',
    description: 'Manage posts and the public service handout page.',
    actionGroups: [
      {
        title: 'Create',
        actions: [
          { icon: 'post_add', label: 'Post', hint: 'Work example for handout material', to: '/mobile/sp/handout/post' },
          { icon: 'preview', label: 'Preview', hint: 'Review public handout page', to: '/mobile/sp/handout/preview' },
        ],
      },
    ],
    sections: [
      {
        title: 'Handout Content',
        items: [
          { icon: 'collections', title: 'Selected posts', meta: '3 posts visible on handout', status: 'Live', tone: 'accent' },
          { icon: 'map', title: 'Coverage and services', meta: 'Read from profile and services setup' },
          { icon: 'ios_share', title: 'Share link', meta: 'Copy or send the public page' },
        ],
      },
    ],
  },
  account: {
    eyebrow: 'SP',
    title: 'Account',
    description: 'Business profile, service scope, and settings.',
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
}
