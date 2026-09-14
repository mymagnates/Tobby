export const leasePropertyId = lease => lease?.property_string_id || (typeof lease?.property_id === 'string' ? lease.property_id : lease?.property_id?.id)
const day = value => typeof value === 'string' ? value.slice(0, 10) : ''
export const leaseDates = lease => ({ start: day(lease.lease_start_date || lease.start_date), end: day(lease.lease_end_date) })
export function leaseStatus(lease, today = new Date().toISOString().slice(0, 10)) {
  const raw = String(lease.status || '').toLowerCase()
  if (lease.archived || raw === 'archived') return 'Archived'
  if (['terminated', 'closed'].includes(raw)) return 'Terminated'
  if (['draft', 'available', 'pending', ''].includes(raw)) return 'Draft'
  const { start, end } = leaseDates(lease)
  if (end && end < today) return 'Expired'
  if (start && start > today) return 'Scheduled'
  return raw === 'expired' ? 'Expired' : 'Active'
}
export const leaseView = lease => ({ ...lease, status: leaseStatus(lease) })
export const propertyLeasingStatus = (leases, propertyId) => leases.some(lease => leasePropertyId(lease) === propertyId && leaseStatus(lease) === 'Active') ? 'Leased' : 'Vacant'
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status, code: 'LEASE_LIFECYCLE_INVALID' }) }
export function validateLeaseDates(lease) {
  const { start, end } = leaseDates(lease)
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  if ((start && !valid(start)) || (end && !valid(end))) fail('Enter valid lease dates.')
  if (start && end && end < start) fail('The end date must not precede the start date.')
  if (!['Draft', 'Terminated', 'Archived'].includes(leaseStatus(lease)) && (!start || !end)) fail('Start and end dates are required before confirming a lease.')
  for (const field of ['rate_amount', 'deposit', 'pet_fee', 'application_fee_per_person']) {
    if (lease[field] != null && (!Number.isFinite(Number(lease[field])) || Number(lease[field]) < 0)) fail('Amounts must be non-negative numbers.')
  }
}
export function assertLeaseDoesNotOverlap(lease, others) {
  if (['Draft', 'Terminated', 'Archived'].includes(leaseStatus(lease))) return
  const { start, end } = leaseDates(lease)
  for (const other of others) {
    if (other.id === lease.id || ['Draft', 'Terminated', 'Archived'].includes(leaseStatus(other))) continue
    const dates = leaseDates(other)
    if (!dates.start || !dates.end) fail('An existing confirmed lease has missing dates. Complete its dates before confirming another lease.', 409)
    if (start <= dates.end && end >= dates.start) fail('These dates overlap another confirmed lease for this property.', 409)
  }
}
