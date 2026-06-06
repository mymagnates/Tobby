export const isNativeMobileRuntime = () => {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'capacitor:' || Boolean(window.Capacitor?.isNativePlatform?.())
}

export const getMobileHomePathForStore = (userDataStore) => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  if (accountType === 'admin') return '/mobile/pm/home'
  if (accountType === 'sp') return '/mobile/sp/home'
  if (accountType === 'tt') return '/mobile/tenant/home'
  if (userDataStore.isOwnerOnlyUser || accountType === 'po') return '/mobile/owner/home'
  return '/mobile/pm/home'
}
