<template>
  <nav v-if="tabs.length" class="mobile-bottom-tabs" aria-label="Mobile navigation">
    <div class="mobile-bottom-tabs__inner">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="resolveTabTo(tab.to)"
        :class="[
          'mobile-bottom-tabs__item',
          isActive(tab.to) ? 'mobile-bottom-tabs__item--active' : '',
        ]"
      >
        <q-icon :name="tab.icon" size="22px" />
        <span class="mobile-bottom-tabs__label">{{ tab.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mobileTabsByRole } from 'src/pages/mobile/mobileContent'
import { useMobileNav } from 'src/pages/mobile/useMobileNav'

const route = useRoute()
const { resolveMobileTo } = useMobileNav()

const role = computed(() => route.meta?.mobileRole || route.params?.role || '')
const tabs = computed(() => mobileTabsByRole[role.value] || [])

const resolveTabTo = (to) => resolveMobileTo(to)

const isActive = (to) => {
  const resolvedTo = resolveTabTo(to)
  return route.path === resolvedTo || route.path.startsWith(`${resolvedTo}/`)
}
</script>
