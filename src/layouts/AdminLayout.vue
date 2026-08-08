<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout">
    <q-drawer v-model="drawerOpen" show-if-above bordered :width="220" class="admin-drawer">
      <div class="admin-brand">
        <span class="admin-brand-mark">H</span>
        <span>Handout <small>Admin</small></span>
      </div>
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
      <q-toolbar class="admin-toolbar">
        <q-btn flat round dense icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>Admin Supervision</q-toolbar-title>
        <div class="admin-status"><span></span> System live</div>
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
  min-height: 100vh;
  background: radial-gradient(circle at 8% 0%, rgba(39, 194, 164, 0.09), transparent 24%), #eef3f5;
}

.admin-header {
  background: transparent;
  color: #f8fcff;
  padding: 12px 20px 0;
}

.admin-header :deep(.q-toolbar) {
  background: linear-gradient(135deg, #19364d 0%, #132b40 100%);
  border: 1px solid rgba(162, 238, 220, 0.2);
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
  background: #f7fafc;
  border-right: 1px solid #dbe6ec;
  color: #314154;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #243b53;
  font-family: var(--font-title);
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.04em;
  padding: 24px 18px 20px;
}

.admin-brand small {
  color: #668094;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-brand-mark {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #15364a;
  background: #27c2a4;
  font-size: 0.9rem;
  font-weight: 800;
}

.admin-menu-active {
  background: #e5f7f2;
  color: #173d50;
}

.admin-drawer :deep(.q-item) {
  min-height: 46px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.admin-drawer :deep(.q-item__section--avatar) {
  min-width: 38px;
  color: #668094;
}

.admin-drawer :deep(.q-item--active .q-icon) {
  color: #14806d;
}

.admin-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: rgba(248, 252, 255, 0.7);
  font-size: 0.78rem;
  font-weight: 600;
}

.admin-status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #81e6ca;
  box-shadow: 0 0 0 4px rgba(129, 230, 202, 0.12);
}

@media (max-width: 768px) {
  .admin-header {
    padding: 10px 12px 0;
  }

  .admin-status {
    display: none;
  }
}

:global(body.body--dark) .admin-menu-active {
  background: rgba(45, 212, 191, 0.15);
}
</style>
