<template>
  <q-layout view="hHh lpR fFf" class="application-layout application-layout-root">
    <!-- Compact Header -->
    <q-header class="application-header">
      <q-toolbar class="q-px-lg">
        <q-toolbar-title class="row items-center">
          <div class="logo-container" @click="goHome">
            <span class="app-brand-mark">H</span>
            <span class="app-title">Handout</span>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat label="Sign In" icon="login" class="login-btn" @click="goToLogin" />
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
          © {{ currentYear }} Developed by Magnates Solution LLC. All rights reserved.
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
  background:
    radial-gradient(circle at top left, rgba(39, 194, 164, 0.1), transparent 30%), #eef3f5;
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
  background: transparent;
  box-shadow: none;
  border-bottom: 0;
  padding: max(12px, env(safe-area-inset-top, 12px)) 20px 0;
}

.application-header :deep(.q-toolbar) {
  min-height: 62px;
  padding: 0 18px;
  border: 1px solid rgba(162, 238, 220, 0.2);
  border-radius: var(--border-radius-card);
  background: linear-gradient(135deg, #19364d 0%, #132b40 100%);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.9;
}

.app-title {
  font-family: var(--font-title);
  font-size: 1.08rem;
  font-weight: 750;
  color: #f8fcff;
  letter-spacing: -0.035em;
}

.app-brand-mark {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #15364a;
  background: #27c2a4;
  font-size: 0.8rem;
  font-weight: 800;
}

.login-btn {
  color: #dff6f0 !important;
  font-weight: 600;
  border: 1px solid rgba(111, 230, 204, 0.42);
  border-radius: var(--border-radius-btn);
}

.login-btn:hover {
  background: rgba(39, 194, 164, 0.16) !important;
  border-color: #8ee8d3 !important;
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
  background: transparent;
  border-top: 1px solid rgba(36, 59, 83, 0.1);
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
    padding: min(12px, env(safe-area-inset-top, 10px)) 12px 0;
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
