export const toSlug = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  const normalized = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return normalized
}

export const resolveSpName = (profile = {}, fallback = 'Service Provider') => {
  return (
    profile.showcase_display_name ||
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    fallback
  )
}

export const resolveSpSlug = (profile = {}, fallbackId = '') => {
  const slugCandidate =
    profile.handout_slug ||
    profile.posts_slug ||
    profile.showcase_slug ||
    toSlug(resolveSpName(profile, ''))
  return slugCandidate || String(fallbackId || '').trim()
}
