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
  background: #f3f5f9;
}

.admin-header {
  background: #0f172a;
  color: #fff;
}

.admin-drawer {
  background: #111827;
  color: #d1d5db;
}

.admin-brand {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  padding: 18px 16px 8px;
}

.admin-menu-active {
  background: rgba(59, 130, 246, 0.18);
  color: #fff;
}
</style>
