import { auth, authStateReady } from 'src/boot/firebase'
import { notifyReportTransactionSaved } from './reportingChanges'

async function request(path, { method = 'GET', body, signal } = {}) {
  const base = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  const controller = new AbortController()
  const cancel = () => controller.abort()
  signal?.addEventListener('abort', cancel, { once: true })
  if (signal?.aborted) controller.abort()
  const timer = setTimeout(cancel, 30000)
  let onAbort
  const cancelled = new Promise((_, reject) => {
    onAbort = () =>
      reject(
        signal?.aborted
          ? new DOMException('Request cancelled.', 'AbortError')
          : new Error('Deposit request timed out. Check the ledger before retrying a save.'),
      )
    if (controller.signal.aborted) onAbort()
    else controller.signal.addEventListener('abort', onAbort, { once: true })
  })
  const run = async () => {
    await authStateReady
    if (controller.signal.aborted) throw new DOMException('Request cancelled.', 'AbortError')
    const user = auth.currentUser
    if (!user) throw new Error('Please sign in to view deposits.')
    const token = await user.getIdToken()
    if (controller.signal.aborted) throw new DOMException('Request cancelled.', 'AbortError')
    if (!token || auth.currentUser !== user) throw new Error('Your session changed. Please reload.')
    const response = await fetch(`${base}${path}`, {
      method,
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload) {
      throw Object.assign(
        new Error(
          response.status === 404 && payload?.message === 'API route not found'
            ? 'Deposit tracking needs a backend update before it can be used.'
            : payload?.message ||
              'Deposit service unavailable. Check the ledger before retrying a save.',
        ),
        { status: response.status, code: payload?.error_code },
      )
    }
    if (auth.currentUser !== user)
      throw new Error('Your session changed. Check the deposit history before retrying.')
    return payload
  }
  try {
    return await Promise.race([run(), cancelled])
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
    controller.signal.removeEventListener('abort', onAbort)
  }
}
const propertyPath = (id) => `/properties/${encodeURIComponent(id)}`
const leasePath = (propertyId, leaseId) =>
  `${propertyPath(propertyId)}/leases/${encodeURIComponent(leaseId)}/deposit`
export async function getPropertyDeposits(propertyId, options) {
  const result = await request(`${propertyPath(propertyId)}/deposits`, options)
  if (
    result.currency !== 'USD' ||
    !Array.isArray(result.accounts) ||
    !Array.isArray(result.unlinked)
  )
    throw new Error('Invalid deposit summary response.')
  return result
}
export async function getLeaseDeposit(propertyId, leaseId, options) {
  const result = await request(leasePath(propertyId, leaseId), options)
  if (result.currency !== 'USD' || !result.summary || !Array.isArray(result.entries))
    throw new Error('Invalid deposit ledger response.')
  return result
}
export async function recordDepositEntry(propertyId, leaseId, body) {
  const result = await request(`${leasePath(propertyId, leaseId)}/entries`, {
    method: 'POST',
    body,
  })
  if (!result.summary || !Array.isArray(result.entries))
    throw new Error('Save was not confirmed. Check the ledger before retrying.')
  notifyReportTransactionSaved()
  return result
}

export function depositCsv(accounts) {
  const cell = (value) => {
    let text = String(value ?? '')
    const firstVisible = [...text].find((char) => char.trim() && char.charCodeAt(0) >= 32)
    if (
      typeof value !== 'number' &&
      (['=', '+', '@', '-'].includes(firstVisible) || text.charCodeAt(0) < 32)
    )
      text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return [
    [
      'Lease',
      'Lease status',
      'Required',
      'Received',
      'Refunded',
      'Deducted',
      'Held balance',
      'Deposit status',
    ],
    ...accounts.map((r) => [
      r.label,
      r.lease_status,
      r.expected,
      r.received,
      r.refunded,
      r.deducted,
      r.balance,
      r.status,
    ]),
  ]
    .map((r) => r.map(cell).join(','))
    .join('\r\n')
}
