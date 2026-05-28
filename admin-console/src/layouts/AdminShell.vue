<template>
  <div class="admin-app">
    <aside class="admin-sidebar">
      <div class="brand">Handout Admin</div>
      <router-link class="nav-link" to="/overview" active-class="active">Overview</router-link>
      <router-link class="nav-link" to="/users" active-class="active">Users & Roles</router-link>
      <router-link class="nav-link" to="/billing" active-class="active">Billing & Credits</router-link>
      <router-link class="nav-link" to="/logs" active-class="active">Ops Logs</router-link>
      <router-link class="nav-link" to="/data-management" active-class="active">Data Management</router-link>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <strong>Admin Supervision MVP</strong>
        <button @click="logout">Logout</button>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logoutFirebase } from '../services/adminApi'

const router = useRouter()
const logout = async () => {
  await logoutFirebase()
  router.push('/login')
}
</script>
