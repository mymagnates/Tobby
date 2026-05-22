import { useRoute, useRouter } from 'vue-router'

export function useMobileNav() {
  const route = useRoute()
  const router = useRouter()

  const resolveMobileTo = (to) => {
    if (!route.path.startsWith('/mobile-preview')) return to
    return String(to || '').replace('/mobile/', '/mobile-preview/')
  }

  const pushMobile = (to) => router.push(resolveMobileTo(to))

  return {
    pushMobile,
    resolveMobileTo,
  }
}
