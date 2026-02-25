import {
  ALLOWED_INVOICE_ATTACHMENT_TYPES,
  ASSIGNMENT_STATUS,
  INVOICE_STATUS,
  MAX_INVOICE_ATTACHMENT_SIZE_MB,
  VERIFICATION_STATUS,
} from './constants.js'

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

export const getSpVerificationPermissionProfile = (verificationStatus) => {
  switch (verificationStatus) {
    case VERIFICATION_STATUS.DRAFT:
      return Object.freeze({
        canSeeOpportunities: false,
        canSubmitProposal: false,
        canSubmitVerification: false,
        readOnlyProfile: false,
        canResubmitDocs: true,
        canPerformTaskActions: false,
      })
    case VERIFICATION_STATUS.PENDING:
      return Object.freeze({
        canSeeOpportunities: false,
        canSubmitProposal: false,
        canSubmitVerification: false,
        readOnlyProfile: true,
        canResubmitDocs: false,
        canPerformTaskActions: false,
      })
    case VERIFICATION_STATUS.APPROVED:
      return Object.freeze({
        canSeeOpportunities: true,
        canSubmitProposal: true,
        canSubmitVerification: false,
        readOnlyProfile: false,
        canResubmitDocs: false,
        canPerformTaskActions: true,
      })
    case VERIFICATION_STATUS.REJECTED:
      return Object.freeze({
        canSeeOpportunities: false,
        canSubmitProposal: false,
        canSubmitVerification: true,
        readOnlyProfile: false,
        canResubmitDocs: true,
        canPerformTaskActions: false,
      })
    case VERIFICATION_STATUS.SUSPENDED:
      return Object.freeze({
        canSeeOpportunities: false,
        canSubmitProposal: false,
        canSubmitVerification: false,
        readOnlyProfile: true,
        canResubmitDocs: false,
        canPerformTaskActions: false,
      })
    default:
      return Object.freeze({
        canSeeOpportunities: false,
        canSubmitProposal: false,
        canSubmitVerification: false,
        readOnlyProfile: true,
        canResubmitDocs: false,
        canPerformTaskActions: false,
      })
  }
}

export const canTaskStatusBeUpdatedByActor = ({ taskCreatorUserId, actorUserId }) =>
  Boolean(taskCreatorUserId) && taskCreatorUserId === actorUserId

export const canSubmitInvoice = ({ assignmentStatus, isActiveAssignee }) =>
  Boolean(isActiveAssignee) && assignmentStatus === ASSIGNMENT_STATUS.ACTIVE

export const isInvoiceReadOnly = (invoiceStatus) =>
  invoiceStatus === INVOICE_STATUS.REJECTED || invoiceStatus === INVOICE_STATUS.PAID

const hasValidAttachmentType = (type) =>
  ALLOWED_INVOICE_ATTACHMENT_TYPES.includes(String(type || '').toUpperCase())

const hasValidAttachmentSize = (sizeBytes) =>
  Number.isFinite(sizeBytes) && sizeBytes <= MAX_INVOICE_ATTACHMENT_SIZE_MB * 1024 * 1024

export const validateInvoiceAttachments = (attachments = []) => {
  const errors = []

  attachments.forEach((attachment, index) => {
    if (!hasValidAttachmentType(attachment.fileType)) {
      errors.push(`attachment_${index}_invalid_type`)
    }
    if (!hasValidAttachmentSize(attachment.sizeBytes)) {
      errors.push(`attachment_${index}_invalid_size`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const computeInvoiceTotal = ({ subtotal = 0, tax = 0, discount = 0 }) =>
  Number(subtotal) + Number(tax) - Number(discount)

export const validateInvoiceSubmission = ({
  lineItems = [],
  subtotal = 0,
  tax = 0,
  discount = 0,
  total = 0,
  assignmentStatus,
  currency,
  attachments = [],
  isActiveAssignee = false,
}) => {
  const errors = []

  if (!lineItems.length) {
    errors.push('line_items_required')
  }

  if (!isNonEmptyString(currency)) {
    errors.push('currency_required')
  }

  if (!canSubmitInvoice({ assignmentStatus, isActiveAssignee })) {
    errors.push('assignment_not_submittable')
  }

  const expectedTotal = computeInvoiceTotal({ subtotal, tax, discount })
  if (Number(total) !== expectedTotal) {
    errors.push('invoice_total_mismatch')
  }

  const attachmentValidation = validateInvoiceAttachments(attachments)
  errors.push(...attachmentValidation.errors)

  return {
    valid: errors.length === 0,
    errors,
    expectedTotal,
  }
}

export const canUpdateCurrency = ({ currentStatus }) =>
  currentStatus === INVOICE_STATUS.DRAFT || currentStatus === INVOICE_STATUS.CHANGES_REQUESTED
