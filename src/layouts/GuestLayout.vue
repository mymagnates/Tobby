<template>
  <q-layout view="hHh lpr fFf" class="guest-layout">
    <q-header class="guest-header">
      <q-toolbar class="guest-toolbar">
        <a
          class="logo-container"
          href="/landing.html"
          aria-label="Handout home"
          @click.prevent="goHome"
        >
          <img
            src="/icons/favicon-32x32.png"
            class="guest-brand-mark"
            width="28"
            height="28"
            alt=""
          />
          <span>Handout</span>
        </a>
        <div class="guest-actions">
          <q-btn
            v-if="isLoginPage"
            unelevated
            no-caps
            label="Create account"
            color="primary"
            class="primary-action"
            @click="goToRegister"
          />
          <q-btn
            v-else
            outline
            no-caps
            label="Sign in"
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
  router.push({
    path: '/public/login',
    query: route.query.redirect ? { redirect: route.query.redirect } : {},
  })
}

const goToRegister = () => {
  router.push({
    path: '/public/register',
    query: route.query.redirect ? { redirect: route.query.redirect } : {},
  })
}

const goHome = () => {
  const host = String(window.location.hostname || '').toLowerCase()
  const isLocalDev = ['localhost', '127.0.0.1', '0.0.0.0'].includes(host)
  window.location.assign(isLocalDev ? '/landing.html' : '/landing')
}
</script>

<style scoped>
.guest-layout {
  min-height: 100dvh;
  background: #f7f8f4;
  color: #243830;
  font-family: 'Avenir Next', 'Sora', 'Trebuchet MS', sans-serif;
}
.guest-header {
  background: #f7f8f4f5;
  color: #243830;
  border-bottom: 1px solid #dfe6dc;
  box-shadow: none;
  backdrop-filter: blur(12px);
}
.guest-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1200px, 100%);
  min-height: 72px;
  margin: 0 auto;
  padding: 0 36px;
  font-family: inherit;
}
.logo-container {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 21px;
  font-weight: 750;
  letter-spacing: -0.045em;
  color: inherit;
  text-decoration: none;
}
.guest-brand-mark {
  display: block;
  border-radius: 7px;
}
.guest-layout .guest-header .q-btn.primary-action,
.guest-layout .guest-header .q-btn.secondary-action {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px !important;
  font-family: inherit;
  font-size: 13px;
  box-shadow: none;
}
.guest-layout .guest-header .q-btn.primary-action {
  background: #254b39 !important;
  color: white !important;
  border: 1px solid #254b39 !important;
}
.guest-layout .guest-header .q-btn.secondary-action {
  background: transparent !important;
  color: #254b39 !important;
  border: 1px solid #dfe6dc !important;
}
.guest-footer {
  position: static;
  border-top: 1px solid #dfe6dc;
  background: #f7f8f4;
}
.footer-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 22px 36px;
}
.footer-logo {
  display: none;
}
.footer-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 20px;
}
.footer-link {
  color: #65756c;
  font-size: 11px;
  text-decoration: none;
  padding-block: 10px;
}
.footer-link:hover {
  color: #254b39;
  text-decoration: underline;
}
.footer-copy {
  margin-left: auto;
  color: #65756c;
  font-size: 10px;
}
.logo-container:focus-visible,
.footer-link:focus-visible {
  outline: 2px solid #14806d;
  outline-offset: 4px;
}
@media (max-width: 760px) {
  .guest-toolbar {
    min-height: 64px;
    padding: 0 20px;
    padding-top: env(safe-area-inset-top, 0px);
  }
  .logo-container {
    font-size: 19px;
  }
  .guest-layout .guest-header .q-btn.primary-action {
    font-size: 12px;
    padding-inline: 12px;
  }
  .footer-content {
    padding: 16px 20px max(16px, env(safe-area-inset-bottom, 0px));
    gap: 8px;
  }
  .footer-links {
    gap: 4px 16px;
  }
  .footer-copy {
    width: 100%;
    margin: 0;
    font-size: 9px;
  }
}
@media print {
  .guest-header,
  .guest-footer {
    display: none !important;
  }
}
</style>
