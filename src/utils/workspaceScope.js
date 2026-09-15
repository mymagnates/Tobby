export const PROPERTY_SCOPE_ROUTES = [
  '/',
  '/pm-po-feed',
  '/my-properties',
  '/property-view',
  '/transactions',
  '/mx-records',
  '/reminders',
  '/tenants',
  '/assets',
  '/property-services',
  '/leases',
  '/documents',
  '/reports',
  '/owner',
  '/po-dashboard',
]

export const supportsPropertyScope = (path) =>
  PROPERTY_SCOPE_ROUTES.some(
    (prefix) => path === prefix || (prefix !== '/' && path.startsWith(`${prefix}/`)),
  )

export const isPropertyBrowser = (path) =>
  ['/my-properties', '/property-view', '/owner/properties'].includes(path)

export const requiresSingleProperty = (path) =>
  ['/my-properties', '/property-view'].includes(path)

export const readPropertyScope = (route) => {
  const value = route.params?.propertyId || route.query?.propertyId
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export const propertyScopeLocation = (route, propertyId) => {
  const query = { ...route.query }
  if (propertyId) query.propertyId = propertyId
  else query.propertyId = ''
  // Legacy asset deep links use a path parameter that would override the query.
  const path = route.path.startsWith('/assets/') ? '/assets' : route.path
  return { path, query, hash: route.hash || '' }
}

export const propertyName = (property) =>
  String(property?.nickname || property?.address || property?.id || 'Unnamed property')

export const filterProperties = (properties, search) => {
  const terms = String(search || '')
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  return properties.filter((property) => {
    const text = [
      propertyName(property),
      property.address,
      property.city,
      property.state,
      property.zip,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()
    return terms.every((term) => text.includes(term))
  })
}
