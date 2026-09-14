export function canAccessDeposit(property, userId) {
  return !!userId && [property?.owner_user_ids, property?.manager_user_ids].some((ids) => Array.isArray(ids) && ids.includes(userId))
}
