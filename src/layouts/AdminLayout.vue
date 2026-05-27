<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout">
    <q-drawer v-model="drawerOpen" show-if-above bordered :width="220" class="admin-drawer">
      <div class="admin-brand">Handout Admin</div>
      <q-list class="q-pa-sm">
        <q-item
          v-for="item in menu"
          :key="item.to"
          clickable
          :active="route.path === item.to"
          active-class="admin-menu-active"
          @click="router.push(item.to)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-header class="admin-header">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>Admin Supervision</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const drawerOpen = ref(true)

const menu = [
  { label: 'Overview', to: '/admin/overview', icon: 'dashboard' },
  { label: 'Users', to: '/admin/users', icon: 'group' },
  { label: 'Billing', to: '/admin/billing', icon: 'payments' },
  { label: 'Logs', to: '/admin/logs', icon: 'receipt_long' },
]
</script>

<style scoped>
.admin-layout {
  background: var(--bg-primary);
}

.admin-header {
  background: transparent;
  color: var(--neutral-800);
  padding: 10px 14px 0;
}

.admin-header :deep(.q-toolbar) {
  background: var(--bg-surface);
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-card);
  min-height: 68px;
  padding: 0 18px;
}

.admin-header :deep(.q-toolbar__title) {
  font-size: 1.18rem;
  font-weight: 700;
  text-align: center;
}

.admin-drawer {
  background: var(--bg-surface);
  border-right: 1px solid var(--neutral-200);
  color: var(--neutral-700);
}

.admin-brand {
  color: var(--neutral-800);
  font-family: var(--font-title);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.04em;
  padding: 26px 18px 20px;
}

.admin-menu-active {
  background: #eaf8f6;
  color: var(--neutral-800);
}

.admin-drawer :deep(.q-item) {
  border-radius: var(--border-radius-sm);
  margin-bottom: 4px;
}

:global(body.body--dark) .admin-menu-active {
  background: rgba(45, 212, 191, 0.15);
}
</style>
