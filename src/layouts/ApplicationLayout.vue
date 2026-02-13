<template>
  <q-layout view="hHh lpR fFf" class="application-layout application-layout-root">
    <!-- Compact Header -->
    <q-header class="application-header">
      <q-toolbar class="q-px-lg">
        <q-toolbar-title class="row items-center">
          <div class="logo-container" @click="goHome">
            <span class="app-title">Handout</span>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          label="Login"
          icon="login"
          class="login-btn"
          @click="goToLogin"
        />
      </q-toolbar>
    </q-header>

    <!-- Main Content - Centered form frame -->
    <q-page-container class="application-page-container">
      <div class="application-frame">
        <router-view />
      </div>
    </q-page-container>

    <!-- Minimal Footer -->
    <q-footer class="application-footer">
      <div class="footer-content">
        <span class="text-caption text-grey-6">
          © {{ currentYear }} Handout Property Management
        </span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentYear = computed(() => new Date().getFullYear())

const goHome = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/public/login')
}
</script>

<style scoped>
.application-layout {
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

.application-layout-root {
  display: flex;
  flex-direction: column;
}

.application-layout-root .q-page-container {
  flex: 1;
}

.application-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  box-shadow: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: max(10px, env(safe-area-inset-top, 10px));
}

.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.9;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  letter-spacing: 0.02em;
}

.login-btn {
  color: white !important;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-btn);
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: white !important;
}

.application-page-container {
  padding: 24px 0 48px;
}

.application-frame {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

.application-footer {
  background: var(--neutral-100);
  border-top: 1px solid var(--neutral-200);
  padding: 12px 24px;
  margin-top: auto;
  flex-shrink: 0;
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .application-header {
    padding-top: min(12px, env(safe-area-inset-top, 10px));
  }

  .application-page-container {
    padding: 8px 0 24px;
  }

  .application-frame {
    padding: 0 12px;
  }

  .app-title {
    font-size: 1.25rem;
  }
}

/* Dark mode */
:global(body.body--dark) .application-layout {
  background-color: var(--bg-primary);
}

:global(body.body--dark) .application-footer {
  background: #1e1e1e;
  border-top-color: #3d3d3d;
}
</style>
