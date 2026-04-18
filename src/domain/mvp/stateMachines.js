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
const PM_PO_ROLES = [ROLES.PM, ROLES.PO]

export const opportunityTransitions = buildMachine({
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.PAUSED}`]: PM_PO_ROLES,
  [`${OPPORTUNITY_STATUS.PAUSED}->${OPPORTUNITY_STATUS.OPEN}`]: PM_PO_ROLES,
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.ASSIGNED}`]: PM_PO_ROLES,
  [`${OPPORTUNITY_STATUS.ASSIGNED}->${OPPORTUNITY_STATUS.CLOSED}`]: [...PM_PO_ROLES, ROLES.SYSTEM],
  [`${OPPORTUNITY_STATUS.OPEN}->${OPPORTUNITY_STATUS.CANCELLED}`]: PM_PO_ROLES,
  [`${OPPORTUNITY_STATUS.PAUSED}->${OPPORTUNITY_STATUS.CANCELLED}`]: PM_PO_ROLES,
})

export const proposalTransitions = buildMachine({
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.WITHDRAWN}`]: [ROLES.SP],
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.SHORTLISTED}`]: PM_PO_ROLES,
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.SELECTED}`]: PM_PO_ROLES,
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.SELECTED}`]: PM_PO_ROLES,
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.REJECTED}`]: PM_PO_ROLES,
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.REJECTED}`]: PM_PO_ROLES,
  [`${PROPOSAL_STATUS.SUBMITTED}->${PROPOSAL_STATUS.EXPIRED}`]: [ROLES.SYSTEM],
  [`${PROPOSAL_STATUS.SHORTLISTED}->${PROPOSAL_STATUS.EXPIRED}`]: [ROLES.SYSTEM],
})

export const assignmentTransitions = buildMachine({
  [`${ASSIGNMENT_STATUS.PENDING_ACCEPTANCE}->${ASSIGNMENT_STATUS.ACTIVE}`]: [ROLES.SP],
  [`${ASSIGNMENT_STATUS.PENDING_ACCEPTANCE}->${ASSIGNMENT_STATUS.DECLINED}`]: [ROLES.SP],
  [`${ASSIGNMENT_STATUS.ACTIVE}->${ASSIGNMENT_STATUS.REVOKED}`]: PM_PO_ROLES,
  [`${ASSIGNMENT_STATUS.ACTIVE}->${ASSIGNMENT_STATUS.COMPLETED}`]: [...PM_PO_ROLES, ROLES.SYSTEM],
})

export const invoiceTransitions = buildMachine({
  [`${INVOICE_STATUS.DRAFT}->${INVOICE_STATUS.SUBMITTED}`]: [ROLES.SP],
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.CHANGES_REQUESTED}`]: PM_PO_ROLES,
  [`${INVOICE_STATUS.CHANGES_REQUESTED}->${INVOICE_STATUS.SUBMITTED}`]: [ROLES.SP],
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.APPROVED}`]: PM_PO_ROLES,
  [`${INVOICE_STATUS.SUBMITTED}->${INVOICE_STATUS.REJECTED}`]: PM_PO_ROLES,
  [`${INVOICE_STATUS.CHANGES_REQUESTED}->${INVOICE_STATUS.REJECTED}`]: PM_PO_ROLES,
  [`${INVOICE_STATUS.APPROVED}->${INVOICE_STATUS.PAID}`]: PM_PO_ROLES,
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
