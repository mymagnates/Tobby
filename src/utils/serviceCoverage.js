export const servicePropertyIds = (service) => [...new Set([
  ...(Array.isArray(service?.property_ids) ? service.property_ids : []),
  ...(Array.isArray(service?.properties) ? service.properties.map((property) => property?.id) : []),
  service?.property_id,
].map((id) => String(id || '').trim()).filter(Boolean))]

export const serviceCoversProperty = (service, propertyId) =>
  !propertyId || servicePropertyIds(service).includes(String(propertyId))
