export const STANDARD_ROLES = Object.freeze(['tt', 'pm', 'po', 'sp', 'admin'])

export const normalizeMembershipRole = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return null
  if (['pm', 'property manager', 'manager', 'management'].includes(raw)) return 'pm'
  if (['po', 'property owner', 'owner', 'landlord', 'homeowner', 'home owner'].includes(raw)) return 'po'
  if (['tt', 'tenant', 'renter'].includes(raw)) return 'tt'
  if (['sp', 'service provider', 'contractor', 'vendor'].includes(raw)) return 'sp'
  if (raw === 'admin' || raw === 'administrator') return 'admin'
  if (raw === 'pm_po' || raw === 'pmpo' || raw === 'pm/po') return 'pm'
  return null
}

export const normalizeRoleValue = (value) => normalizeMembershipRole(value)

export const normalizeAccountType = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return null
  if (['pm', 'property manager', 'manager', 'management', 'pm_po', 'pmpo', 'pm/po'].includes(raw)) return 'pm'
  // Legacy-only compatibility: keep exact stored "po" readable during migration,
  // but do not normalize owner-like labels into account-level PO for new logic.
  if (raw === 'po') return 'po'
  if (['tt', 'tenant', 'renter'].includes(raw)) return 'tt'
  if (['sp', 'service provider', 'contractor', 'vendor'].includes(raw)) return 'sp'
  if (raw === 'admin' || raw === 'administrator') return 'admin'
  return null
}

export const roleLabel = (value) => {
  const role = normalizeRoleValue(value)
  if (role === 'pm') return 'Property Manager'
  if (role === 'po') return 'Property Owner'
  if (role === 'tt') return 'Tenant'
  if (role === 'sp') return 'Service Provider'
  if (role === 'admin') return 'Admin'
  return String(value || '')
}

export const isPmPoRole = (value) => {
  const role = normalizeRoleValue(value)
  return role === 'pm' || role === 'po'
}
