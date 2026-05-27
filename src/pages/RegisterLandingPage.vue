<template>
  <div class="public-auth-page">
    <div class="register-container">
      <div class="register-header">
        <p class="public-auth-card-label">Get Started</p>
        <h1>Choose your workspace</h1>
        <p class="register-subtitle">
          Choose how you will use Handout. Property owners access shared records through an
          invitation from their property manager.
        </p>
      </div>

      <div class="role-grid">
        <q-card
          flat
          bordered
          class="role-card"
          clickable
          @click="router.push('/public/pmpo-signup')"
        >
          <q-card-section class="role-card-body">
            <div class="role-icon-wrap role-icon-pmpo">
              <q-icon name="apartment" size="27px" color="white" />
            </div>
            <div class="role-copy">
              <div class="role-label">Manage Properties</div>
              <div class="role-desc">
                Create a Property Manager workspace for records, tasks, leases, and owner access.
              </div>
            </div>
            <q-icon class="role-arrow" name="arrow_forward" size="20px" />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="role-card" clickable @click="router.push('/public/sp-signup')">
          <q-card-section class="role-card-body">
            <div class="role-icon-wrap role-icon-sp">
              <q-icon name="construction" size="27px" color="white" />
            </div>
            <div class="role-copy">
              <div class="role-label">Provide Services</div>
              <div class="role-desc">
                Discover leads, submit bids, manage projects, and invoice.
              </div>
            </div>
            <q-icon class="role-arrow" name="arrow_forward" size="20px" />
          </q-card-section>
        </q-card>
      </div>

      <div class="register-footer">
        <span>Already have an account?</span>
        <q-btn
          flat
          dense
          no-caps
          class="public-auth-text-link"
          label="Sign In"
          @click="router.push('/public/login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.register-container {
  max-width: 870px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 62px);
  border: 1px solid var(--auth-border);
  border-radius: 28px;
  background: white;
  box-shadow: 0 18px 54px var(--auth-shadow);
}

.register-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 42px;
}

.register-header h1 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(31px, 4vw, 42px);
  font-weight: 800;
  color: var(--auth-ink);
  letter-spacing: -1.2px;
}

.register-subtitle {
  max-width: 500px;
  margin: 14px auto 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--auth-ink-soft);
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.role-card {
  border: 1px solid var(--auth-border);
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.role-card:hover {
  border-color: color-mix(in srgb, var(--primary-color) 45%, white);
  box-shadow: 0 16px 36px var(--auth-shadow);
  transform: translateY(-3px);
}

.role-card-body {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 150px;
  padding: 24px !important;
}

.role-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-pmpo {
  background: linear-gradient(135deg, #1a8c7a, #2db5a0);
}
.role-icon-sp {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
}
.role-copy {
  flex: 1;
}
.role-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--auth-ink);
  margin-bottom: 6px;
}

.role-desc {
  font-size: 13px;
  color: var(--auth-ink-soft);
  line-height: 1.55;
}

.role-arrow {
  color: var(--primary-color);
}

.register-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 36px;
  color: var(--auth-ink-soft);
  font-size: 14px;
}

@media (max-width: 680px) {
  .register-container {
    padding: 28px 20px;
  }

  .role-grid {
    grid-template-columns: 1fr;
  }

  .role-card-body {
    min-height: auto;
  }
}
</style>
