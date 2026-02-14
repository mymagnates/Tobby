<template>
  <q-layout view="hHh lpr fFf" class="guest-layout">
    <!-- Simple Header -->
    <q-header elevated class="guest-header">
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="row items-center">
          <div class="logo-container">
            <span class="app-title">Handout</span>
          </div>
        </q-toolbar-title>

        <!-- Login Button (only show if not on login page) -->
        <q-btn
          v-if="!isLoginPage"
          flat
          label="Login"
          icon="login"
          color="white"
          @click="goToLogin"
          class="login-btn"
        />
      </q-toolbar>
    </q-header>

    <!-- Main Content Area (no sidebar) -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="guest-footer">
      <div class="footer-content">
        <div class="text-center q-pa-md">
          <div class="footer-links q-mb-sm">
            <router-link to="/public/about" class="footer-link">About</router-link>
            <span class="footer-separator">•</span>
            <router-link to="/public/contact-support" class="footer-link"
              >Contact & Support</router-link
            >
            <span class="footer-separator">•</span>
            <router-link to="/public/privacy" class="footer-link">Privacy Policy</router-link>
            <span class="footer-separator">•</span>
            <router-link to="/public/terms" class="footer-link">Terms of Service</router-link>
          </div>
          <div class="text-body2 text-grey-6">
            © {{ currentYear }} Developed by Magnates Solution LLC. All rights reserved.
          </div>
        </div>
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

.guest-layout {
  background-color: var(--bg-secondary);
}

.guest-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  box-shadow: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  letter-spacing: 0.02em;
}

.login-btn {
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.guest-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.footer-link {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #3498db;
  text-decoration: underline;
}

.footer-separator {
  color: #7f8c8d;
  margin: 0 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.2rem;
  }

  .login-btn {
    padding: 6px 16px;
    font-size: 0.9rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 4px;
  }

  .footer-separator {
    display: none;
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
