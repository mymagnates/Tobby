import { auth, authStateReady } from 'src/boot/firebase'
import { notifyReportTransactionSaved } from './reportingChanges'
import { mobileApiBase } from './mobileApi'

export const financialCategoryOptions = [
  { value: 'rental_income', label: 'Rental Income' },
  { value: 'management_fee', label: 'Management Fee' },
  { value: 'maintenance', label: 'Maintenance and Repairs' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'property_tax', label: 'Property Tax' },
  { value: 'hoa', label: 'HOA Dues' },
  { value: 'other_income', label: 'Other Income' },
  { value: 'other_expense', label: 'Other Expense' },
  { value: 'security_deposit', label: 'Security Deposit' },
  { value: 'owner_contribution', label: 'Owner Contribution (Funds In)' },
  { value: 'owner_distribution', label: 'Owner Distribution (Funds Out)' },
  { value: 'transfer', label: 'Transfer Between Accounts' },
  { value: 'reimbursement', label: 'Reimbursement' },
  { value: 'unclassified', label: 'Unclassified (Needs Review)' },
]

export const isFinancialCategory = (value) =>
  financialCategoryOptions.some((option) => option.value === value)

const typeCategories = {
  rent: 'rental_income',
  deposit: 'security_deposit',
  tax: 'property_tax',
  insurance: 'insurance',
  utility: 'utilities',
  maintenance: 'maintenance',
  labor: 'maintenance',
  hoa: 'hoa',
  'management fee': 'management_fee',
}

export const defaultFinancialCategory = (type) =>
  typeCategories[
    String(type || '')
      .trim()
      .toLowerCase()
  ] || 'unclassified'

async function reportRequest(path, { method = 'GET', body, idempotencyKey } = {}) {
  await authStateReady
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in again to record transactions.')
  const token = await user.getIdToken()
  if (!token || auth.currentUser !== user)
    throw new Error('Your session changed. Please sign in again.')
  const base = mobileApiBase().trim().replace(/\/$/, '')
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    credentials: 'omit',
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.ok === false) {
    throw Object.assign(new Error(payload?.message || 'Unable to save or load transaction data.'), {
      status: response.status,
      code: payload?.error_code,
    })
  }
  if (!payload) throw new Error('The transaction service returned an invalid response.')
  if (auth.currentUser !== user)
    throw new Error('Your session changed. Check transactions before retrying.')
  return payload
}

export async function getReportParticipants(propertyId) {
  const payload = await reportRequest(
    `/reports/participants?property_id=${encodeURIComponent(propertyId)}`,
  )
  if (!Array.isArray(payload.participants)) {
    throw new Error('Unable to load property manager accounts. Please try again.')
  }
  return payload.participants.filter(
    (participant) =>
      participant?.role === 'pm' && typeof participant.id === 'string' && participant.id.trim(),
  )
}

export async function createReportTransaction(propertyId, transaction, { idempotencyKey } = {}) {
  const payload = await reportRequest(
    `/properties/${encodeURIComponent(propertyId)}/report-transactions`,
    {
      method: 'POST',
      body: transaction,
      idempotencyKey,
    },
  )
  if (typeof payload.id !== 'string' || !payload.id.trim()) {
    throw new Error(
      'The server did not confirm a transaction ID. Check transactions before retrying.',
    )
  }
  notifyReportTransactionSaved()
  return payload
}
