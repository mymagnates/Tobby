export const isNativeMobileRuntime = () => {
  if (typeof window === 'undefined') return false
  return (
    window.location.protocol === 'capacitor:' || Boolean(window.Capacitor?.isNativePlatform?.())
  )
}

export const PM_MOBILE_HOME_PATH = '/mobile/pm/home'

export const isPmMobilePath = (path = '') => {
  const value = String(path || '')
  return value === '/mobile' || value === '/mobile/pm' || value.startsWith('/mobile/pm/')
}

export const getMobileHomePathForStore = (userDataStore) => {
  if (isNativeMobileRuntime()) return PM_MOBILE_HOME_PATH
  const accountType = String(
    userDataStore.accountType || userDataStore.userCategory || '',
  ).toLowerCase()
  if (accountType === 'admin') return '/mobile/pm/home'
  if (accountType === 'sp') return '/mobile/sp/home'
  if (accountType === 'tt') return '/mobile/tenant/home'
  if (userDataStore.isOwnerOnlyUser || accountType === 'po') return '/mobile/owner/home'
  return PM_MOBILE_HOME_PATH
}
