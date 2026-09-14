<template>
  <q-layout
    view="hHh lpR fFf"
    class="ios-workspace"
    :style="{
      '--ios-actions-bottom': hideTabs ? '0px' : 'calc(62px + env(safe-area-inset-bottom))',
    }"
  >
    <q-page-container><router-view /></q-page-container>
    <q-footer v-if="!hideTabs" class="ios-tabs">
      <nav aria-label="Main navigation">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tabLocation(tab.path)"
          :aria-current="route.path.startsWith(tab.path) ? 'page' : undefined"
        >
          <q-icon :name="tab.icon" size="24px" /><span>{{ tab.label }}</span>
        </router-link>
      </nav>
    </q-footer>
  </q-layout>
</template>
<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import 'src/css/mobile-workspace.scss'
const route = useRoute()
const hideTabs = computed(
  () => route.meta.mobileGuest || route.meta.tenantReview || route.meta.mobileDetail,
)
const tabQueries = reactive({})
watch(
  () => route.fullPath,
  () => {
    if (/^\/mobile\/pm\/(home|property|manage|account)$/.test(route.path)) {
      tabQueries[route.path] = { ...route.query }
    }
  },
  { immediate: true },
)
function tabLocation(path) {
  const query = { ...tabQueries[path] }
  if (path !== '/mobile/pm/account' && route.path !== '/mobile/pm/account') {
    query.property = route.query.property || undefined
  }
  delete query.returnTo
  delete query.scroll
  return { path, query }
}
const tabs = [
  { path: '/mobile/pm/home', label: 'Home', icon: 'home' },
  { path: '/mobile/pm/property', label: 'Property', icon: 'apartment' },
  { path: '/mobile/pm/manage', label: 'Manage', icon: 'view_list' },
  { path: '/mobile/pm/account', label: 'Account', icon: 'person_outline' },
]
</script>
