import { describe, it, expect } from 'vitest'
import {
  ASSIGNMENT_STATUS,
  INVOICE_STATUS,
  OPPORTUNITY_STATUS,
  PROPOSAL_STATUS,
  ROLES,
  VERIFICATION_STATUS,
  canOpportunityAcceptProposals,
  canSelectProposal,
  canTaskStatusBeUpdatedByActor,
  canTransitionAssignment,
  canTransitionInvoice,
  canTransitionOpportunity,
  canTransitionProposal,
  computeInvoiceTotal,
  getSpVerificationPermissionProfile,
  validateInvoiceSubmission,
  isInvoiceReadOnly,
  canUpdateCurrency,
} from '../../../src/domain/mvp/index.js'

describe('mvpRules', () => {
  describe('opportunity state machine', () => {
    it('allows PM/PO to pause open opportunity', () => {
      const result = canTransitionOpportunity({
        from: OPPORTUNITY_STATUS.OPEN,
        to: OPPORTUNITY_STATUS.PAUSED,
        actorRole: ROLES.PM_PO,
      })
      expect(result.allowed).toBe(true)
    })

    it('blocks SP from changing opportunity status', () => {
      const result = canTransitionOpportunity({
        from: OPPORTUNITY_STATUS.OPEN,
        to: OPPORTUNITY_STATUS.PAUSED,
        actorRole: ROLES.SP,
      })
      expect(result).toEqual({ allowed: false, reason: 'actor_not_allowed' })
    })

    it('accepts proposals only for open opportunities', () => {
      expect(canOpportunityAcceptProposals(OPPORTUNITY_STATUS.OPEN)).toBe(true)
      expect(canOpportunityAcceptProposals(OPPORTUNITY_STATUS.PAUSED)).toBe(false)
      expect(canOpportunityAcceptProposals(OPPORTUNITY_STATUS.ASSIGNED)).toBe(false)
    })
  })

  describe('proposal state machine', () => {
    it('allows SP to withdraw submitted proposal', () => {
      const result = canTransitionProposal({
        from: PROPOSAL_STATUS.SUBMITTED,
        to: PROPOSAL_STATUS.WITHDRAWN,
        actorRole: ROLES.SP,
      })
      expect(result.allowed).toBe(true)
    })

    it('allows PM/PO to shortlist proposal', () => {
      const result = canTransitionProposal({
        from: PROPOSAL_STATUS.SUBMITTED,
        to: PROPOSAL_STATUS.SHORTLISTED,
        actorRole: ROLES.PM_PO,
      })
      expect(result.allowed).toBe(true)
    })

    it('enforces single active selected proposal by helper', () => {
      expect(canSelectProposal({ hasActiveSelectedProposal: false })).toBe(true)
      expect(canSelectProposal({ hasActiveSelectedProposal: true })).toBe(false)
    })
  })

  describe('assignment state machine', () => {
    it('allows SP acceptance from pending', () => {
      const result = canTransitionAssignment({
        from: ASSIGNMENT_STATUS.PENDING_ACCEPTANCE,
        to: ASSIGNMENT_STATUS.ACTIVE,
        actorRole: ROLES.SP,
      })
      expect(result.allowed).toBe(true)
    })

    it('blocks PM/PO from acceptance transition', () => {
      const result = canTransitionAssignment({
        from: ASSIGNMENT_STATUS.PENDING_ACCEPTANCE,
        to: ASSIGNMENT_STATUS.ACTIVE,
        actorRole: ROLES.PM_PO,
      })
      expect(result).toEqual({ allowed: false, reason: 'actor_not_allowed' })
    })
  })

  describe('verification permissions', () => {
    it('grants proposal permission only to approved SP', () => {
      expect(getSpVerificationPermissionProfile(VERIFICATION_STATUS.DRAFT).canSubmitProposal).toBe(
        false
      )
      expect(
        getSpVerificationPermissionProfile(VERIFICATION_STATUS.PENDING).canSubmitProposal
      ).toBe(false)
      expect(
        getSpVerificationPermissionProfile(VERIFICATION_STATUS.APPROVED).canSubmitProposal
      ).toBe(true)
      expect(
        getSpVerificationPermissionProfile(VERIFICATION_STATUS.REJECTED).canSubmitProposal
      ).toBe(false)
      expect(
        getSpVerificationPermissionProfile(VERIFICATION_STATUS.SUSPENDED).canSubmitProposal
      ).toBe(false)
    })
  })

  describe('task ownership', () => {
    it('allows task status update only by creator', () => {
      expect(
        canTaskStatusBeUpdatedByActor({ taskCreatorUserId: 'u1', actorUserId: 'u1' })
      ).toBe(true)
      expect(
        canTaskStatusBeUpdatedByActor({ taskCreatorUserId: 'u1', actorUserId: 'u2' })
      ).toBe(false)
    })
  })

  describe('invoice state + validation', () => {
    it('allows valid invoice transition path', () => {
      const submitted = canTransitionInvoice({
        from: INVOICE_STATUS.DRAFT,
        to: INVOICE_STATUS.SUBMITTED,
        actorRole: ROLES.SP,
      })
      const approved = canTransitionInvoice({
        from: INVOICE_STATUS.SUBMITTED,
        to: INVOICE_STATUS.APPROVED,
        actorRole: ROLES.PM_PO,
      })
      const paid = canTransitionInvoice({
        from: INVOICE_STATUS.APPROVED,
        to: INVOICE_STATUS.PAID,
        actorRole: ROLES.PM_PO,
      })
      expect(submitted.allowed).toBe(true)
      expect(approved.allowed).toBe(true)
      expect(paid.allowed).toBe(true)
    })

    it('validates submission totals and attachment policies', () => {
      const validation = validateInvoiceSubmission({
        lineItems: [{ description: 'Fix sink', quantity: 1, unitPrice: 100, amount: 100 }],
        subtotal: 100,
        tax: 10,
        discount: 5,
        total: 105,
        assignmentStatus: ASSIGNMENT_STATUS.ACTIVE,
        currency: 'USD',
        isActiveAssignee: true,
        attachments: [{ fileType: 'pdf', sizeBytes: 1024 }],
      })

      expect(validation.valid).toBe(true)
      expect(validation.expectedTotal).toBe(computeInvoiceTotal({ subtotal: 100, tax: 10, discount: 5 }))
    })

    it('fails submission for closed assignment and invalid attachment', () => {
      const validation = validateInvoiceSubmission({
        lineItems: [{ description: 'Fix sink', quantity: 1, unitPrice: 100, amount: 100 }],
        subtotal: 100,
        tax: 10,
        discount: 5,
        total: 106,
        assignmentStatus: ASSIGNMENT_STATUS.REVOKED,
        currency: 'USD',
        isActiveAssignee: false,
        attachments: [{ fileType: 'exe', sizeBytes: 8 * 1024 * 1024 }],
      })

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('assignment_not_submittable')
      expect(validation.errors).toContain('invoice_total_mismatch')
      expect(validation.errors).toContain('attachment_0_invalid_type')
      expect(validation.errors).toContain('attachment_0_invalid_size')
    })

    it('treats rejected and paid invoices as read-only', () => {
      expect(isInvoiceReadOnly(INVOICE_STATUS.REJECTED)).toBe(true)
      expect(isInvoiceReadOnly(INVOICE_STATUS.PAID)).toBe(true)
      expect(isInvoiceReadOnly(INVOICE_STATUS.DRAFT)).toBe(false)
    })

    it('locks currency after submission', () => {
      expect(canUpdateCurrency({ currentStatus: INVOICE_STATUS.DRAFT })).toBe(true)
      expect(canUpdateCurrency({ currentStatus: INVOICE_STATUS.CHANGES_REQUESTED })).toBe(true)
      expect(canUpdateCurrency({ currentStatus: INVOICE_STATUS.SUBMITTED })).toBe(false)
    })
  })
})
