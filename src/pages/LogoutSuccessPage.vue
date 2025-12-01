<template>
  <div class="logout-success-page">
    <div class="success-container">
      <div class="success-content">
        <!-- Success Icon -->
        <div class="icon-container">
          <q-icon name="check_circle" size="100px" color="positive" class="animate-icon" />
        </div>

        <!-- Success Message -->
        <h1 class="success-title">Successfully Logged Out</h1>
        <p class="success-message">
          You have been securely logged out of your account.
        </p>

        <!-- Additional Info -->
        <div class="info-card">
          <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
          <div class="info-text">
            Your session has ended and all data has been cleared for security.
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            label="Log In Again"
            icon="login"
            @click="goToLogin"
            class="action-btn"
          />
          <q-btn
            flat
            color="primary"
            size="lg"
            label="Go to Home"
            icon="home"
            @click="goToHome"
            class="action-btn"
          />
        </div>

        <!-- Auto Redirect Message -->
        <div class="auto-redirect-message">
          <q-icon name="schedule" size="18px" class="q-mr-xs" />
          <span>Redirecting to login in {{ countdown }} seconds...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(5)
let countdownInterval = null

// Navigate to login
const goToLogin = () => {
  clearInterval(countdownInterval)
  router.push('/public/login')
}

// Navigate to home/public page
const goToHome = () => {
  clearInterval(countdownInterval)
  router.push('/public/login')
}

// Auto redirect countdown
onMounted(() => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      router.push('/public/login')
    }
  }, 1000)
})

// Cleanup
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.logout-success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.success-container {
  max-width: 600px;
  width: 100%;
}

.success-content {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.icon-container {
  margin-bottom: 24px;
}

.animate-icon {
  animation: scaleIn 0.6s ease-in-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.success-message {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.info-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7ff;
  border: 1px solid #1976d2;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
}

.info-text {
  color: #1976d2;
  font-size: 0.95rem;
  text-align: left;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 160px;
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auto-redirect-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .success-content {
    padding: 32px 24px;
  }

  .success-title {
    font-size: 1.5rem;
  }

  .success-message {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>

