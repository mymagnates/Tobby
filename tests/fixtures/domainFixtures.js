/**
 * Domain fixtures for MVP rules and state machine tests.
 * Uses constants from src/domain/mvp for consistency.
 */
import {
  ASSIGNMENT_STATUS,
  INVOICE_STATUS,
  OPPORTUNITY_STATUS,
  PROPOSAL_STATUS,
  ROLES,
  VERIFICATION_STATUS,
} from '../../src/domain/mvp/constants.js'

export const opportunityFixtures = [
  { id: 'opp-1', status: OPPORTUNITY_STATUS.OPEN, task_id: 'task-1' },
  { id: 'opp-2', status: OPPORTUNITY_STATUS.PAUSED, task_id: 'task-2' },
  { id: 'opp-3', status: OPPORTUNITY_STATUS.ASSIGNED, task_id: 'task-3' },
  { id: 'opp-4', status: OPPORTUNITY_STATUS.CLOSED, task_id: 'task-4' },
  { id: 'opp-5', status: OPPORTUNITY_STATUS.CANCELLED, task_id: 'task-5' },
]

export const proposalFixtures = [
  { id: 'prop-1', opportunity_id: 'opp-1', sp_id: 'sp-101', status: PROPOSAL_STATUS.SUBMITTED },
  { id: 'prop-2', opportunity_id: 'opp-1', sp_id: 'sp-102', status: PROPOSAL_STATUS.SHORTLISTED },
  { id: 'prop-3', opportunity_id: 'opp-1', sp_id: 'sp-103', status: PROPOSAL_STATUS.SELECTED },
  { id: 'prop-4', opportunity_id: 'opp-2', sp_id: 'sp-101', status: PROPOSAL_STATUS.REJECTED },
  { id: 'prop-5', opportunity_id: 'opp-2', sp_id: 'sp-102', status: PROPOSAL_STATUS.WITHDRAWN },
  { id: 'prop-6', opportunity_id: 'opp-2', sp_id: 'sp-103', status: PROPOSAL_STATUS.EXPIRED },
]

export const assignmentFixtures = [
  { id: 'asn-1', opportunity_id: 'opp-3', sp_id: 'sp-101', status: ASSIGNMENT_STATUS.PENDING_ACCEPTANCE },
  { id: 'asn-2', opportunity_id: 'opp-3', sp_id: 'sp-102', status: ASSIGNMENT_STATUS.ACTIVE },
  { id: 'asn-3', opportunity_id: 'opp-4', sp_id: 'sp-101', status: ASSIGNMENT_STATUS.COMPLETED },
  { id: 'asn-4', opportunity_id: 'opp-4', sp_id: 'sp-103', status: ASSIGNMENT_STATUS.DECLINED },
  { id: 'asn-5', opportunity_id: 'opp-4', sp_id: 'sp-104', status: ASSIGNMENT_STATUS.REVOKED },
]

export const invoiceFixtures = [
  {
    id: 'invoc-draft',
    task_id: 'task-1',
    status: INVOICE_STATUS.DRAFT,
    line_items: [{ description: 'Plumbing repair', quantity: 1, unitPrice: 200, amount: 200 }],
    subtotal: 200,
    tax: 16,
    discount: 0,
    total: 216,
    currency: 'USD',
  },
  {
    id: 'invoc-submitted',
    task_id: 'task-2',
    status: INVOICE_STATUS.SUBMITTED,
    line_items: [{ description: 'AC service', quantity: 1, unitPrice: 150, amount: 150 }],
    subtotal: 150,
    tax: 12,
    discount: 0,
    total: 162,
    currency: 'USD',
  },
  {
    id: 'invoc-approved',
    task_id: 'task-3',
    status: INVOICE_STATUS.APPROVED,
    line_items: [{ description: 'Electrical work', quantity: 2, unitPrice: 85, amount: 170 }],
    subtotal: 170,
    tax: 0,
    discount: 10,
    total: 160,
    currency: 'USD',
  },
  {
    id: 'invoc-paid',
    task_id: 'task-4',
    status: INVOICE_STATUS.PAID,
    line_items: [{ description: 'Painting', quantity: 1, unitPrice: 500, amount: 500 }],
    subtotal: 500,
    tax: 0,
    discount: 0,
    total: 500,
    currency: 'USD',
  },
  {
    id: 'invoc-rejected',
    task_id: 'task-5',
    status: INVOICE_STATUS.REJECTED,
    line_items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
  },
  {
    id: 'invoc-changes',
    task_id: 'task-6',
    status: INVOICE_STATUS.CHANGES_REQUESTED,
    line_items: [{ description: 'Roof repair', quantity: 1, unitPrice: 1200, amount: 1200 }],
    subtotal: 1200,
    tax: 96,
    discount: 0,
    total: 1296,
    currency: 'USD',
    review_note: 'Please add itemized breakdown',
  },
]

export const spProfileFixtures = [
  { sp_id: 'sp-101', verification_status: VERIFICATION_STATUS.APPROVED, display_name: 'FixFast Plumbing' },
  { sp_id: 'sp-102', verification_status: VERIFICATION_STATUS.PENDING, display_name: 'Prime Electric' },
  { sp_id: 'sp-103', verification_status: VERIFICATION_STATUS.DRAFT, display_name: 'Cool Air HVAC' },
  { sp_id: 'sp-104', verification_status: VERIFICATION_STATUS.REJECTED, display_name: 'Quick Fix' },
  { sp_id: 'sp-105', verification_status: VERIFICATION_STATUS.SUSPENDED, display_name: 'Reliable Repairs' },
]

/** Valid invoice submission payload for validateInvoiceSubmission */
export const validInvoiceSubmissionPayload = {
  lineItems: [{ description: 'Fix sink', quantity: 1, unitPrice: 100, amount: 100 }],
  subtotal: 100,
  tax: 10,
  discount: 5,
  total: 105,
  assignmentStatus: ASSIGNMENT_STATUS.ACTIVE,
  currency: 'USD',
  isActiveAssignee: true,
  attachments: [{ fileType: 'pdf', sizeBytes: 1024 }],
}

/** Invalid invoice submission payloads */
export const invalidInvoicePayloads = [
  {
    name: 'total_mismatch',
    payload: { ...validInvoiceSubmissionPayload, total: 106 },
    expectedErrors: ['invoice_total_mismatch'],
  },
  {
    name: 'revoked_assignment',
    payload: { ...validInvoiceSubmissionPayload, assignmentStatus: ASSIGNMENT_STATUS.REVOKED },
    expectedErrors: ['assignment_not_submittable'],
  },
  {
    name: 'invalid_attachment_type',
    payload: {
      ...validInvoiceSubmissionPayload,
      attachments: [{ fileType: 'exe', sizeBytes: 1024 }],
    },
    expectedErrors: ['attachment_0_invalid_type'],
  },
  {
    name: 'attachment_too_large',
    payload: {
      ...validInvoiceSubmissionPayload,
      attachments: [{ fileType: 'pdf', sizeBytes: 8 * 1024 * 1024 }],
    },
    expectedErrors: ['attachment_0_invalid_size'],
  },
]
