<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobileEmptyState title="Loading mobile workspace" body="Routing to the right mobile home." />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import { useUserDataStore } from 'src/stores/userDataStore'
import { normalizeAccountType, normalizeRoleValue } from 'src/utils/roleUtils'

const router = useRouter()
const userDataStore = useUserDataStore()

const resolveRoleHome = () => {
  const profileType = normalizeAccountType(userDataStore.accountType || userDataStore.userCategory)
  if (profileType === 'sp') return '/mobile/sp/home'
  if (profileType === 'tt') return '/mobile/tenant/home'
  if (profileType === 'po') return '/mobile/owner/home'

  const roles = (userDataStore.userRoles || []).map((role) => normalizeRoleValue(role?.role))
  if (roles.includes('sp')) return '/mobile/sp/home'
  if (roles.includes('tt')) return '/mobile/tenant/home'
  if (roles.includes('po') && !roles.includes('pm')) return '/mobile/owner/home'
  return '/mobile/pm/home'
}

onMounted(async () => {
  if (!userDataStore.isInitialized && userDataStore.user) {
    await userDataStore.initialize(userDataStore.user).catch(() => {})
  }
  router.replace(resolveRoleHome())
})
</script>
