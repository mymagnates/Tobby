<template>
  <q-layout view="hHh lpr fFf" class="guest-layout">
    <q-header class="guest-header">
      <q-toolbar class="guest-toolbar">
        <div class="logo-container" @click="goHome">Handout</div>
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

    <q-footer class="guest-footer">
      <div class="footer-content">
        <div class="footer-logo">Handout</div>
        <div class="footer-links">
          <router-link to="/public/about" class="footer-link">About</router-link>
          <router-link to="/public/contact-support" class="footer-link">Contact &amp; Support</router-link>
          <router-link to="/public/privacy" class="footer-link">Privacy Policy</router-link>
          <router-link to="/public/terms" class="footer-link">Terms of Service</router-link>
        </div>
        <div class="footer-copy">&copy; {{ currentYear }} Magnates Solution LLC. All rights reserved.</div>
      </div>
    </q-footer>
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
  router.push('/landing')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.guest-layout {
  background: #faf8f3;
  font-family: 'Noto Sans SC', sans-serif;
}

.guest-header {
  background: rgba(250, 248, 243, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: none;
  border-bottom: 1px solid #ddd8ce;
  color: #1a1612;
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
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  cursor: pointer;
}

.primary-action,
.secondary-action {
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 100px !important;
}

.primary-action {
  box-shadow: 0 6px 18px rgba(26, 22, 18, 0.15);
}

.guest-footer {
  position: static;
  background: #1a1612;
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
