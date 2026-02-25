export const ROLES = Object.freeze({
  TT: 'tt',
  PM_PO: 'pm_po',
  SP: 'sp',
  ADMIN: 'admin',
  SYSTEM: 'system',
})

export const PLATFORM_SCOPE = Object.freeze(['web', 'ios'])

export const LOCKED_MVP_DECISIONS = Object.freeze({
  paymentFlowInMvp: false,
  disputesInMvp: false,
  taskStatusManagedByCreator: true,
  invoiceImageFirstPayload: false,
  dedicatedNotificationSystem: false,
  defaultRetentionPolicy: 'permanent',
  supportChannels: ['email', 'in_app_support_page'],
})

export const TT_TABS = Object.freeze(['Dashboard', 'Create', 'Inbox', 'Records', 'Profile'])

export const PM_PO_TABS = Object.freeze([
  'Dashboard',
  'Create',
  'Inbox',
  'Records',
  'Reports',
  'Profile',
])

export const PM_PO_REPORTS = Object.freeze([
  'Rent Collection Summary',
  'Task Status Summary',
  'Occupancy & Lease Summary',
  'Income vs Expense Summary',
])

export const VERIFICATION_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
})

export const INVOICE_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
})

export const OPPORTUNITY_STATUS = Object.freeze({
  OPEN: 'open',
  PAUSED: 'paused',
  ASSIGNED: 'assigned',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
})

export const PROPOSAL_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  WITHDRAWN: 'withdrawn',
  SHORTLISTED: 'shortlisted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
})

export const ASSIGNMENT_STATUS = Object.freeze({
  PENDING_ACCEPTANCE: 'pending_acceptance',
  ACTIVE: 'active',
  DECLINED: 'declined',
  REVOKED: 'revoked',
  COMPLETED: 'completed',
})

export const ALLOWED_INVOICE_ATTACHMENT_TYPES = Object.freeze(['PDF', 'JPG', 'PNG'])
export const MAX_INVOICE_ATTACHMENT_SIZE_MB = 5

