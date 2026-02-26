<template>
  <div class="register-landing">
    <div class="register-container">
      <div class="register-header">
        <h1 class="app-title">Handout</h1>
        <p class="register-subtitle">Choose how you'd like to get started</p>
      </div>

      <div class="role-grid">
        <q-card
          flat bordered
          class="role-card"
          clickable
          @click="router.push('/public/pmpo-signup')"
        >
          <q-card-section class="role-card-body">
            <div class="role-icon-wrap role-icon-pmpo">
              <q-icon name="apartment" size="32px" color="white" />
            </div>
            <div class="role-label">Property Manager / Owner</div>
            <div class="role-desc">Manage properties, tenants, leases, transactions, and maintenance tasks.</div>
          </q-card-section>
        </q-card>

        <q-card
          flat bordered
          class="role-card"
          clickable
          @click="router.push('/public/sp-signup')"
        >
          <q-card-section class="role-card-body">
            <div class="role-icon-wrap role-icon-sp">
              <q-icon name="construction" size="32px" color="white" />
            </div>
            <div class="role-label">Service Provider</div>
            <div class="role-desc">Receive leads, submit bids, manage projects, and send invoices.</div>
          </q-card-section>
        </q-card>

        <q-card
          flat bordered
          class="role-card"
          clickable
          @click="router.push('/public/tenant-signup')"
        >
          <q-card-section class="role-card-body">
            <div class="role-icon-wrap role-icon-tt">
              <q-icon name="person" size="32px" color="white" />
            </div>
            <div class="role-label">Tenant</div>
            <div class="role-desc">View your lease, pay rent, submit maintenance requests, and upload documents.</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="register-footer">
        <span>Already have an account?</span>
        <q-btn flat dense no-caps color="primary" label="Sign in" @click="router.push('/public/login')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

.register-landing {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color, #5c6bc0) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.register-container {
  background: white;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  max-width: 640px;
  width: 100%;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  font-weight: 400;
  color: var(--primary-color);
  margin: 0 0 8px 0;
}

.register-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.role-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.role-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.role-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
}

.role-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-pmpo { background: linear-gradient(135deg, #1976d2, #1565c0); }
.role-icon-sp { background: linear-gradient(135deg, #f57c00, #e65100); }
.role-icon-tt { background: linear-gradient(135deg, #43a047, #2e7d32); }

.role-label {
  font-size: 1rem;
  font-weight: 700;
  color: #212121;
  margin-bottom: 2px;
}

.role-desc {
  font-size: 0.82rem;
  color: #757575;
  line-height: 1.4;
}

.register-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 28px;
  color: #757575;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .register-container {
    padding: 28px 20px;
  }
  .role-card-body {
    flex-direction: column;
    text-align: center;
  }
}
</style>
