<template>
  <div class="public-auth-page">
    <div class="register-container">
      <div class="register-header">
        <p class="public-auth-card-label">Start your workspace</p>
        <h1>What work are you here to move forward?</h1>
        <p class="register-subtitle">
          Pick the view that matches your role. You can bring your properties, partners, and next
          request into one connected workflow.
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
            <div class="role-card-topline"><span>01</span><q-icon name="arrow_forward" size="20px" /></div>
            <div class="role-icon-wrap role-icon-pmpo">
              <q-icon name="dashboard_customize" size="25px" color="white" />
            </div>
            <div class="role-copy">
              <div class="role-label">Run the portfolio</div>
              <div class="role-desc">
                Coordinate requests, leases, vendors, records, and owner decisions from one
                command center.
              </div>
            </div>
            <div class="role-card-footer"><span>For property managers</span><strong>Set up a workspace</strong></div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          class="role-card"
          clickable
          @click="router.push('/public/sp-signup')"
        >
          <q-card-section class="role-card-body">
            <div class="role-card-topline"><span>02</span><q-icon name="arrow_forward" size="20px" /></div>
            <div class="role-icon-wrap role-icon-sp">
              <q-icon name="handyman" size="25px" color="white" />
            </div>
            <div class="role-copy">
              <div class="role-label">Win and manage work</div>
              <div class="role-desc">
                Receive qualified requests, submit proposals, and keep every service project on
                track.
              </div>
            </div>
            <div class="role-card-footer"><span>For service providers</span><strong>Build a service profile</strong></div>
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
  max-width: 1010px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(34px, 6vw, 64px);
  border: 1px solid var(--auth-border);
  border-radius: 20px;
  background: white;
  box-shadow: 0 22px 58px var(--auth-shadow);
}

.register-header {
  text-align: center;
  max-width: 690px;
  margin: 0 auto 46px;
}

.register-header h1 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(31px, 4vw, 46px);
  font-weight: 800;
  color: var(--auth-ink);
  letter-spacing: -1.5px;
}

.register-subtitle {
  max-width: 570px;
  margin: 14px auto 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--auth-ink-soft);
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin: 0 auto;
}

.role-card {
  border: 1px solid var(--auth-border);
  min-height: 310px;
  overflow: hidden;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.role-card:hover {
  border-color: #8bdcca;
  box-shadow: 0 18px 38px var(--auth-shadow);
  transform: translateY(-3px);
}

.role-card-body {
  display: flex;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px !important;
}

.role-card-topline {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #90a0ae;
  font-size: 12px;
  font-weight: 700;
}

.role-card-topline .q-icon {
  color: #16786a;
  transition: transform 0.2s ease;
}

.role-card:hover .role-card-topline .q-icon {
  transform: translateX(4px);
}

.role-icon-wrap {
  width: 50px;
  height: 50px;
  margin-top: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-pmpo {
  background: linear-gradient(135deg, #157a6a, #45bda7);
}

.role-icon-sp {
  background: linear-gradient(135deg, #2a5272, #5e8db3);
}
.role-copy {
  margin-top: 25px;
}
.role-label {
  font-family: 'Sora', sans-serif;
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--auth-ink);
  margin-bottom: 10px;
}

.role-desc {
  font-size: 13px;
  color: var(--auth-ink-soft);
  line-height: 1.55;
}

.role-card-footer {
  width: 100%;
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid var(--auth-border);
}

.role-card-footer span {
  color: var(--auth-ink-soft);
  font-size: 11px;
}

.role-card-footer strong {
  color: #16786a;
  font-size: 12px;
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
    min-height: 275px;
  }
}
</style>
