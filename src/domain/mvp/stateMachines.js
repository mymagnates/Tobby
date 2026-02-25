import {
  ASSIGNMENT_STATUS,
  INVOICE_STATUS,
  OPPORTUNITY_STATUS,
  PROPOSAL_STATUS,
  ROLES,
} from './constants.js'

const allowByRole = (allowedRoles, actorRole) => allowedRoles.includes(actorRole)

const transitionResult = (allowed, reason = null) => ({ allowed, reason })

const buildMachine = (transitions) => Object.freeze(transitions)

export const opportunityTransitions = buildMachine({
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.PAUSED}`]: [ROLES.PM_PO],
  [`${OPPORTUNITY_STATUS.PAUSED}->${OPPORTUNITY_STATUS.OPEN}`]: [ROLES.PM_PO],
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.ASSIGNED}`]: [ROLES.PM_PO],
  [`${OPPORTUNITY_STATUS.ASSIGNED}->${OPPORTUNITY_STATUS.CLOSED}`]: [ROLES.PM_PO, ROLES.SYSTEM],
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.CANCELLED}`]: [ROLES.PM_PO],
  [`${OPPORTUNITY_STATUS.PAUSED}->${OPPORTUNITY_STATUS.CANCELLED}`]: [ROLES.PM_PO],
})

export const proposalTransitions = buildMachine({
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.WITHDRAWN}`]: [ROLES.SP],
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.SHORTLISTED}`]: [ROLES.PM_PO],
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.SELECTED}`]: [ROLES.PM_PO],
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.SELECTED}`]: [ROLES.PM_PO],
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.REJECTED}`]: [ROLES.PM_PO],
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.REJECTED}`]: [ROLES.PM_PO],
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.EXPIRED}`]: [ROLES.SYSTEM],
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.EXPIRED}`]: [ROLES.SYSTEM],
})

export const assignmentTransitions = buildMachine({
  [`${ASSIGNMENT_STATUS.PENDING_ACCEPTANCE}->${ASSIGNMENT_STATUS.ACTIVE}`]: [ROLES.SP],
  [`${ASSIGNMENT_STATUS.PENDING_ACCEPTANCE}->${ASSIGNMENT_STATUS.DECLINED}`]: [ROLES.SP],
  [`${ASSIGNMENT_STATUS.ACTIVE}->${ASSIGNMENT_STATUS.REVOKED}`]: [ROLES.PM_PO],
  [`${ASSIGNMENT_STATUS.ACTIVE}->${ASSIGNMENT_STATUS.COMPLETED}`]: [ROLES.PM_PO, ROLES.SYSTEM],
})

export const invoiceTransitions = buildMachine({
  [`${INVOICE_STATUS.DRAFT}->${INVOICE_STATUS.SUBMITTED}`]: [ROLES.SP],
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.CHANGES_REQUESTED}`]: [ROLES.PM_PO],
  [`${INVOICE_STATUS.CHANGES_REQUESTED}->${INVOICE_STATUS.SUBMITTED}`]: [ROLES.SP],
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.APPROVED}`]: [ROLES.PM_PO],
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.REJECTED}`]: [ROLES.PM_PO],
  [`${INVOICE_STATUS.CHANGES_REQUESTED}->${INVOICE_STATUS.REJECTED}`]: [ROLES.PM_PO],
  [`${INVOICE_STATUS.APPROVED}->${INVOICE_STATUS.PAID}`]: [ROLES.PM_PO],
})

const canTransition = (transitions, from, to, actorRole) => {
  const key = `${from}->${to}`
  const allowedRoles = transitions[key]

  if (!allowedRoles) {
    return transitionResult(false, 'invalid_transition')
  }

  if (!allowByRole(allowedRoles, actorRole)) {
    return transitionResult(false, 'actor_not_allowed')
  }

  return transitionResult(true)
}

export const canTransitionOpportunity = ({ from, to, actorRole }) =>
  canTransition(opportunityTransitions, from, to, actorRole)

export const canTransitionProposal = ({ from, to, actorRole }) =>
  canTransition(proposalTransitions, from, to, actorRole)

export const canTransitionAssignment = ({ from, to, actorRole }) =>
  canTransition(assignmentTransitions, from, to, actorRole)

export const canTransitionInvoice = ({ from, to, actorRole }) =>
  canTransition(invoiceTransitions, from, to, actorRole)

export const canOpportunityAcceptProposals = (opportunityStatus) =>
  opportunityStatus === OPPORTUNITY_STATUS.OPEN

export const canSelectProposal = ({ hasActiveSelectedProposal = false } = {}) =>
  !hasActiveSelectedProposal

export const getActiveAssignmentTaskCapabilities = (assignmentStatus) => {
  const isActive = assignmentStatus === ASSIGNMENT_STATUS.ACTIVE
  return Object.freeze({
    canCommentOnTask: isActive,
    canUploadEvidence: isActive,
    canUpdateTaskProgress: isActive,
  })
}
