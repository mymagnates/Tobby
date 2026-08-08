<template>
  <q-layout view="hHh lpr fFf" class="guest-layout">
    <q-header class="guest-header">
      <q-toolbar class="guest-toolbar">
        <div class="logo-container" @click="goHome">
          <span class="guest-brand-mark">H</span>
          <span>Handout</span>
        </div>
        <div class="guest-actions">
          <q-btn
            v-if="isLoginPage"
            unelevated
            no-caps
            label="Get Started"
            color="primary"
            class="primary-action"
            @click="goToRegister"
          />
          <q-btn
            v-else
            outline
            no-caps
            label="Sign In"
            color="primary"
            class="secondary-action"
            @click="goToLogin"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer class="guest-footer">
      <div class="footer-content">
        <div class="footer-logo">Handout</div>
        <div class="footer-links">
          <a href="/about.html" class="footer-link">About</a>
          <a href="/contact-support.html" class="footer-link">Contact &amp; Support</a>
          <a href="/privacy.html" class="footer-link">Privacy Policy</a>
          <a href="/terms.html" class="footer-link">Terms of Service</a>
        </div>
        <div class="footer-copy">
          &copy; {{ currentYear }} Magnates Solution LLC. All rights reserved.
        </div>
      </div>
    </footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Check if current page is login page
const isLoginPage = computed(() => {
  return route.path.includes('/login')
})

// Get current year for footer
const currentYear = computed(() => {
  return new Date().getFullYear()
})

// Navigate to login
const goToLogin = () => {
  router.push('/public/login')
}

const goToRegister = () => {
  router.push('/public/register')
}

const goHome = () => {
  const host = String(window.location.hostname || '').toLowerCase()
  const isLocalDev = ['localhost', '127.0.0.1', '0.0.0.0'].includes(host)
  window.location.assign(isLocalDev ? '/landing.html' : '/landing')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.guest-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(39, 194, 164, 0.08), transparent 26%), #f4f7f9;
  font-family: 'Noto Sans SC', sans-serif;
}

.guest-header {
  background: rgba(16, 34, 52, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: none;
  border-bottom: 1px solid rgba(162, 238, 220, 0.14);
  color: #f8fcff;
}

.guest-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1280px, 100%);
  min-height: 78px;
  margin: 0 auto;
  padding: 0 48px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  cursor: pointer;
}

.guest-brand-mark {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #15364a;
  background: #27c2a4;
  font-family: var(--font-title);
  font-size: 0.8rem;
  font-weight: 800;
}

.primary-action,
.secondary-action {
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 10px !important;
}

body .guest-layout .q-btn.primary-action {
  background: #16786a !important;
  color: #fff !important;
  box-shadow: 0 8px 18px rgba(22, 120, 106, 0.16);
}

body .guest-layout .q-btn.secondary-action {
  border-color: #16786a !important;
  color: #16786a !important;
  background: transparent !important;
}

.guest-footer {
  position: static;
  background: #10283c;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 48px;
}

.footer-logo {
  font-family: 'Sora', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--accent-light);
}

.footer-copy {
  color: rgba(255, 255, 255, 0.36);
  font-size: 12px;
}

@media (max-width: 768px) {
  .guest-toolbar {
    min-height: 70px;
    padding: 0 20px;
  }

  .logo-container {
    font-size: 20px;
  }

  .footer-content {
    align-items: flex-start;
    flex-direction: column;
    padding: 30px 24px;
  }
}

/* Print Styles */
@media print {
  .guest-header,
  .guest-footer {
    display: none !important;
  }
}
</style>
