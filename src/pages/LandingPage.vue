<template>
  <div class="landing-page">
    <!-- NAV -->
    <nav class="landing-nav">
      <div class="logo" @click="goHome">Handout</div>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#ai">AI Assistant</a></li>
        <li><a href="#how">How It Works</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
      </ul>
      <div class="nav-actions">
        <button class="nav-cta" @click="startFree">Start Free</button>
        <button class="nav-login" @click="goLogin">Sign In</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero" id="top">
      <div class="hero-left">
        <div class="hero-badge">✦ Property Operations Platform</div>
        <h1 class="hero-title">
          Run Property Operations<br />
          <em>With Speed and Clarity</em>
        </h1>
        <p class="hero-sub">
          Handout connects PM/PO, tenants, and service providers in one modern workflow for tasks,
          leases, documents, transactions, and reminders.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="startFree">Start Free →</button>
          <button class="btn-ghost" @click="viewDemo">Watch Demo</button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-num">3x<span>+</span></div>
            <div class="stat-label">Faster operations</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">1<span>hub</span></div>
            <div class="stat-label">Everything in one place</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">24h</div>
            <div class="stat-label">AI always on</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div style="position: relative;">
          <div class="float-tag t1">
            <span class="dot g"></span> Rent received on time
          </div>
          <div class="float-tag t2">
            <span class="dot o"></span> AI renewal reminder
          </div>

          <div class="dashboard-card">
            <div class="dc-header">
              <div class="dc-title">Operations Snapshot</div>
              <div class="dc-date">March 2026</div>
            </div>

            <div class="property-list">
              <div class="property-item">
                <div class="prop-icon a">🏢</div>
                <div class="prop-info">
                  <div class="prop-name">Lease & Tenant Hub</div>
                  <div class="prop-addr">Agreements, profiles, and history</div>
                </div>
                <div class="prop-status ok">Healthy</div>
              </div>
              <div class="property-item">
                <div class="prop-icon b">🧾</div>
                <div class="prop-info">
                  <div class="prop-name">Transactions</div>
                  <div class="prop-addr">Income, expenses, and audit trail</div>
                </div>
                <div class="prop-status warn">Review</div>
              </div>
              <div class="property-item">
                <div class="prop-icon c">🛠</div>
                <div class="prop-info">
                  <div class="prop-name">Maintenance Tasks</div>
                  <div class="prop-addr">Requests, assignments, and updates</div>
                </div>
                <div class="prop-status ok">On Track</div>
              </div>
            </div>

            <div class="mini-metrics">
              <div class="metric-box">
                <div class="metric-val up">96%</div>
                <div class="metric-lbl">On-time tasks</div>
              </div>
              <div class="metric-box">
                <div class="metric-val">$8.2k</div>
                <div class="metric-lbl">Monthly net</div>
              </div>
              <div class="metric-box">
                <div class="metric-val up">+12%</div>
                <div class="metric-lbl">Quarter growth</div>
              </div>
            </div>

            <div class="tobby-card">
              <div class="tobby-avatar">🤖</div>
              <div class="tobby-content">
                <div class="tobby-name">Handout AI</div>
                <div class="tobby-msg">
                  Two leases renew in <strong>30 days</strong>. Drafts are ready with recommended rent
                  updates based on local comps.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section" id="features">
      <div class="section-inner">
        <div class="section-label">Core Features</div>
        <h2 class="section-title">Everything you need, in one workspace</h2>
        <p class="section-sub">
          From property records to finance, from maintenance to tenant communications, Handout
          connects every part of your operation.
        </p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon fi-brand">🗂</div>
            <div class="feature-title">Property Records</div>
            <div class="feature-desc">Centralize contracts, IDs, inspections, and service history.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon fi-teal">💰</div>
            <div class="feature-title">Financial Tracking</div>
            <div class="feature-desc">Track rent, fees, and expenses with real-time summaries.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon fi-purple">🔗</div>
            <div class="feature-title">Service Network</div>
            <div class="feature-desc">Connect trusted vendors, brokers, and specialists in one place.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon fi-blue">👥</div>
            <div class="feature-title">Tenant Management</div>
            <div class="feature-desc">Profiles, payment history, and communication threads.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon fi-green">🔔</div>
            <div class="feature-title">Smart Reminders</div>
            <div class="feature-desc">Renewals, insurance, and compliance dates never slip.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon fi-red">🛠</div>
            <div class="feature-title">Work Orders</div>
            <div class="feature-desc">Report, assign, and resolve maintenance with full visibility.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI -->
    <section class="tobby-section" id="ai">
      <div class="section-inner">
        <div class="tobby-inner">
          <div class="tobby-left">
            <div class="section-label">AI Assistant</div>
            <h2 class="section-title" style="color:white;">Meet Handout AI</h2>
            <p class="section-sub">
              Your 24/7 property operations advisor. Handout AI understands your data, flags risks,
              and helps you move faster.
            </p>

            <div class="tobby-features-list">
              <div class="tfl-item">
                <div class="tfl-icon">📊</div>
                Spot trends and issues before they grow
              </div>
              <div class="tfl-item">
                <div class="tfl-icon">⚡</div>
                Ask in natural language and get instant answers
              </div>
              <div class="tfl-item">
                <div class="tfl-icon">📝</div>
                Auto-generate notices, drafts, and summaries
              </div>
              <div class="tfl-item">
                <div class="tfl-icon">🎯</div>
                Price rent with market-aware guidance
              </div>
            </div>
          </div>

          <div class="tobby-demo">
            <div class="chat-bubble ai">
              <div class="chat-av tobby-av">🤖</div>
              <div class="chat-text">
                Vacancy alert: “Riverside Apt B2” has been open for 23 days. Want me to draft a new
                listing and adjust pricing?
              </div>
            </div>
            <div class="chat-bubble user">
              <div class="chat-av">👤</div>
              <div class="chat-text">Which property had the highest profit last quarter?</div>
            </div>
            <div class="chat-bubble ai">
              <div class="chat-av tobby-av">🤖</div>
              <div class="chat-text">
                Q4 summary:\n\n🥇 Harbor Loft: $42.8k net (34% margin)\n🥈 Uptown A: $28.5k net (27% margin)\n🥉 Central Home: $21.2k net (23% margin)\n\nHarbor Loft wins due to lower maintenance spend.
              </div>
            </div>
            <div class="chat-bubble user">
              <div class="chat-av">👤</div>
              <div class="chat-text">Draft a renewal notice for Central Home</div>
            </div>
            <div class="chat-bubble ai">
              <div class="chat-av tobby-av">🤖</div>
              <div class="chat-text">Draft ready with term options and response deadline. Review or send →</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how">
      <div class="section-inner">
        <div style="text-align:center;">
          <div class="section-label">How It Works</div>
          <h2 class="section-title" style="max-width:none;">Four steps to get started</h2>
        </div>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-num">01</div>
            <div class="step-title">Create an account</div>
            <div class="step-desc">Set up in minutes. No install required.</div>
          </div>
          <div class="step-item">
            <div class="step-num">02</div>
            <div class="step-title">Add properties</div>
            <div class="step-desc">Input assets, tenants, and contracts.</div>
          </div>
          <div class="step-item">
            <div class="step-num">03</div>
            <div class="step-title">Connect your network</div>
            <div class="step-desc">Invite service providers and partners.</div>
          </div>
          <div class="step-item">
            <div class="step-num">04</div>
            <div class="step-title">Let AI assist</div>
            <div class="step-desc">Automate reminders and insights.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testimonials-section" id="testimonials">
      <div class="section-inner">
        <div class="section-label">What People Say</div>
        <h2 class="section-title">Real operators. Real results.</h2>

        <div class="testimonials-grid">
          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <div class="testi-text">I used to run 7 units with spreadsheets and text threads. Now it’s all in <strong>Handout</strong>.</div>
            <div class="testi-author">
              <div class="testi-avatar av1">C</div>
              <div>
                <div class="testi-name">Chris M.</div>
                <div class="testi-role">Owns 7 units · Houston</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <div class="testi-text">As a part-time investor, time is everything. Handout cut my admin time in half.</div>
            <div class="testi-author">
              <div class="testi-avatar av2">L</div>
              <div>
                <div class="testi-name">Lina W.</div>
                <div class="testi-role">Owns 4 units · Seattle</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <div class="testi-text">Maintenance is finally smooth. <strong>Assign, track, close</strong>—no more chasing calls.</div>
            <div class="testi-author">
              <div class="testi-avatar av3">A</div>
              <div>
                <div class="testi-name">Alex P.</div>
                <div class="testi-role">Owns 12 units · Phoenix</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WORKSPACES -->
    <section class="section-wrap" id="workspaces">
      <div class="section-inner">
        <div class="section-label">Choose Your Workspace</div>
        <div class="section-title">Start with the workspace that fits your role</div>
        <p class="section-sub">
          Choose where you operate most. You can switch or add more workspaces later.
        </p>

        <div class="role-grid">
          <q-card class="role-card" flat bordered clickable @click="router.push('/public/pmpo-signup')">
            <q-card-section>
              <div class="role-icon role-pmpo"><q-icon name="apartment" size="22px" color="white" /></div>
              <div class="role-name">PM / PO</div>
              <div class="role-desc">Manage properties, leases, tasks, documents, and records.</div>
            </q-card-section>
          </q-card>

          <q-card class="role-card" flat bordered clickable @click="router.push('/public/sp-signup')">
            <q-card-section>
              <div class="role-icon role-sp"><q-icon name="construction" size="22px" color="white" /></div>
              <div class="role-name">Service Provider</div>
              <div class="role-desc">Discover leads, submit bids, track assignments, and invoice.</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="section-inner">
        <div class="cta-box">
          <div class="section-label" style="color: var(--brand-light);">Get Started</div>
          <h2 class="section-title">Ready to simplify property operations?</h2>
          <p class="section-sub" style="margin-top:14px;">Start free, no credit card required.</p>
          <div class="cta-actions">
            <button class="btn-primary" @click="startFree">Start Free</button>
            <button class="btn-ghost cta-ghost" @click="viewDemo">Watch Demo</button>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="footer-logo">Handout</div>
      <div class="footer-links">
        <a href="/public/about">About</a>
        <a href="/public/privacy">Privacy</a>
        <a href="/public/terms">Terms</a>
        <a href="/public/contact-support">Contact</a>
      </div>
      <div class="footer-copy">© 2026 Handout. All rights reserved.</div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const startFree = () => {
  router.push('/public/pmpo-signup')
}

const goLogin = () => {
  router.push('/public/login')
}

const viewDemo = () => {
  router.push('/public/contact-support')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:global(html) { scroll-behavior: smooth; }

.landing-page {
  --cream: #faf8f3;
  --paper: #f2ede4;
  --ink: #1a1612;
  --ink-soft: #4a4540;
  --brand: var(--primary-color);
  --brand-light: var(--primary-light);
  --brand-dark: var(--primary-dark);
  --brand-pale: color-mix(in srgb, var(--primary-color) 12%, white);
  --teal: #1a8c7a;
  --teal-light: #e3f5f1;
  --border: #ddd8ce;
  --shadow: rgba(26, 22, 18, 0.08);

  font-family: 'Noto Sans SC', sans-serif;
  background: var(--cream);
  color: var(--ink);
  overflow-x: hidden;
  padding-top: 80px;
}

/* NAV */
.landing-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 48px;
  background: rgba(250, 248, 243, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.logo {
  font-family: 'Sora', sans-serif;
  font-weight: 800; font-size: 22px;
  color: var(--ink);
  letter-spacing: -0.5px;
  cursor: pointer;
}

.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a {
  font-size: 14px; font-weight: 500;
  color: var(--ink-soft); text-decoration: none;
  transition: color 0.2s;
}
.nav-links a:hover { color: var(--brand); }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-cta {
  background: var(--brand);
  color: white;
  border: 1px solid var(--brand-dark);
  padding: 10px 22px;
  border-radius: 100px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Noto Sans SC', sans-serif;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.nav-cta:hover {
  background: var(--brand-dark);
  transform: translateY(-1px);
}

.nav-login {
  background: transparent;
  color: var(--brand);
  border: 1px solid color-mix(in srgb, var(--brand) 55%, white);
  padding: 10px 18px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Sans SC', sans-serif;
}

.nav-login:hover {
  background: var(--brand-pale);
  transform: translateY(-1px);
}

/* HERO */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  padding: 120px 48px 80px;
  gap: 60px;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--brand-pale);
  border: 1px solid color-mix(in srgb, var(--brand) 55%, white);
  border-radius: 100px;
  padding: 6px 14px; font-size: 12px; font-weight: 500;
  color: color-mix(in srgb, var(--brand) 60%, #4a4540);
  margin-bottom: 28px;
  animation: fadeUp 0.6s ease both;
}
.hero-badge::before {
  content: ''; width: 6px; height: 6px;
  border-radius: 50%; background: var(--brand);
  animation: pulse 2s ease infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

.hero-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(38px, 4.5vw, 62px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -2px;
  color: var(--ink);
  animation: fadeUp 0.6s 0.1s ease both;
}
.hero-title em {
  font-style: normal;
  color: var(--brand);
  position: relative;
}
.hero-title em::after {
  content: '';
  position: absolute; bottom: 2px; left: 0; right: 0; height: 4px;
  background: var(--brand-light);
  border-radius: 2px; opacity: 0.5;
}

.hero-sub {
  margin-top: 20px;
  font-size: 17px; line-height: 1.75;
  color: var(--ink-soft);
  max-width: 520px;
  animation: fadeUp 0.6s 0.2s ease both;
}

.hero-actions {
  display: flex; align-items: center; gap: 16px;
  margin-top: 36px;
  animation: fadeUp 0.6s 0.3s ease both;
}

.btn-primary {
  background: var(--brand); color: white;
  border: 1px solid var(--brand-dark);
  padding: 14px 28px;
  border-radius: 100px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Noto Sans SC', sans-serif;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}
.btn-primary:hover { background: var(--brand-dark); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22); }

.btn-ghost {
  background: none; color: var(--ink-soft);
  border: 1px solid var(--border);
  padding: 14px 24px; border-radius: 100px;
  font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Noto Sans SC', sans-serif;
}
.btn-ghost:hover { border-color: var(--brand); color: var(--brand); }

.hero-stats {
  display: flex; gap: 32px; margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
  animation: fadeUp 0.6s 0.4s ease both;
}

.stat-num {
  font-family: 'Sora', sans-serif;
  font-size: 28px; font-weight: 800; color: var(--ink);
  letter-spacing: -1px;
}
.stat-num span { color: var(--brand); }
.stat-label { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }

/* HERO VISUAL */
.hero-visual {
  animation: fadeUp 0.6s 0.2s ease both;
  position: relative;
}

.dashboard-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px var(--shadow), 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
}

.dc-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.dc-title { font-size: 14px; font-weight: 600; color: var(--ink); }
.dc-date { font-size: 12px; color: var(--ink-soft); }

.property-list { display: flex; flex-direction: column; gap: 10px; }
.property-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--cream);
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.property-item:hover { background: var(--brand-pale); border-color: color-mix(in srgb, var(--brand) 55%, white); }
.prop-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.prop-icon.a { background: var(--brand-pale); }
.prop-icon.b { background: var(--teal-light); }
.prop-icon.c { background: #ede9f5; }
.prop-info { flex: 1; min-width: 0; }
.prop-name { font-size: 13px; font-weight: 600; color: var(--ink); }
.prop-addr { font-size: 11px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prop-status {
  font-size: 11px; font-weight: 600; padding: 3px 8px;
  border-radius: 100px;
}
.prop-status.ok { background: #e3f5e8; color: #1a7a35; }
.prop-status.warn { background: var(--brand-pale); color: var(--brand-dark); }

.tobby-card {
  margin-top: 14px;
  background: linear-gradient(135deg, #1a1612 0%, #2d2520 100%);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex; align-items: flex-start; gap: 12px;
}
.tobby-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 30%, transparent);
}
.tobby-content { flex: 1; }
.tobby-name { font-size: 11px; color: var(--brand-light); font-weight: 600; margin-bottom: 4px; }
.tobby-msg { font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.5; }
.tobby-msg strong { color: var(--brand-light); }

.mini-metrics {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 10px; margin-top: 14px;
}
.metric-box {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.metric-val {
  font-family: 'Sora', sans-serif;
  font-size: 20px; font-weight: 700; color: var(--ink);
}
.metric-val.up { color: var(--teal); }
.metric-lbl { font-size: 10px; color: var(--ink-soft); margin-top: 2px; }

.float-tag {
  position: absolute;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px var(--shadow);
  font-size: 12px; font-weight: 600; color: var(--ink);
  white-space: nowrap;
  animation: float 3s ease-in-out infinite;
}
.float-tag.t1 { top: -20px; right: -10px; animation-delay: 0s; }
.float-tag.t2 { bottom: 30px; left: -20px; animation-delay: 1.5s; }
.float-tag .dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }
.float-tag .dot.g { background: #2db86d; }
.float-tag .dot.o { background: var(--brand); }
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* SECTION BASE */
section { padding: 100px 48px; }
.section-inner { max-width: 1280px; margin: 0 auto; }
.section-label {
  font-size: 12px; font-weight: 600; letter-spacing: 2px;
  color: var(--brand); text-transform: uppercase; margin-bottom: 16px;
}
.section-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(28px, 3.5vw, 46px);
  font-weight: 800; letter-spacing: -1.5px;
  line-height: 1.15; color: var(--ink);
  max-width: 620px;
}
.section-sub {
  font-size: 16px; color: var(--ink-soft);
  line-height: 1.7; max-width: 520px;
  margin-top: 16px;
}

/* FEATURES */
.features-section { background: var(--paper); }
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}
.feature-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s;
  position: relative; overflow: hidden;
}
.feature-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--brand), var(--brand-light));
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s;
}
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px var(--shadow); }
.feature-card:hover::before { transform: scaleX(1); }
.feature-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 20px;
}
.fi-brand { background: var(--brand-pale); }
.fi-teal { background: var(--teal-light); }
.fi-purple { background: #ede9f5; }
.fi-blue { background: #e5f0fd; }
.fi-green { background: #e3f5e8; }
.fi-red { background: #fde8e3; }
.feature-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: var(--ink-soft); line-height: 1.65; }

/* AI SECTION */
.tobby-section {
  background: linear-gradient(135deg, #1a1612 0%, #2a2018 100%);
  position: relative; overflow: hidden;
}
.tobby-section::before {
  content: '';
  position: absolute; top: -200px; right: -200px;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26,22,18,0.35) 0%, transparent 70%);
}
.tobby-inner {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
.tobby-left .section-label { color: var(--brand-light); }
.tobby-left .section-title { color: white; }
.tobby-left .section-sub { color: rgba(255,255,255,0.65); }

.tobby-demo {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
  padding: 24px;
}
.chat-bubble { display: flex; gap: 10px; margin-bottom: 16px; }
.chat-bubble.user { flex-direction: row-reverse; }
.chat-av {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.chat-av.tobby-av { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%); }
.chat-text {
  max-width: 80%;
  padding: 10px 14px; border-radius: 16px;
  font-size: 13px; line-height: 1.55;
}
.chat-bubble.ai .chat-text {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  border-bottom-left-radius: 4px;
}
.chat-bubble.user .chat-text {
  background: var(--brand);
  color: white;
  border-bottom-right-radius: 4px;
}
.tobby-features-list { margin-top: 32px; display: flex; flex-direction: column; gap: 14px; }
.tfl-item {
  display: flex; align-items: center; gap: 12px;
  font-size: 14px; color: rgba(255,255,255,0.75);
}
.tfl-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: color-mix(in srgb, var(--brand) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand) 35%, transparent);
  display: flex; align-items: center; justify-content: center; font-size: 14px;
  flex-shrink: 0;
}

/* HOW IT WORKS */
.steps-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; margin-top: 56px;
  position: relative;
}
.steps-grid::before {
  content: '';
  position: absolute; top: 28px; left: 14%; right: 14%;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--border) 0, var(--border) 6px, transparent 6px, transparent 14px);
}
.step-item { padding: 0 20px; text-align: center; }
.step-num {
  width: 56px; height: 56px; border-radius: 50%;
  background: white; border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 18px; font-weight: 800; color: var(--brand);
  margin: 0 auto 20px;
  position: relative; z-index: 1;
  box-shadow: 0 4px 12px var(--shadow);
}
.step-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.step-desc { font-size: 13px; color: var(--ink-soft); line-height: 1.6; }

/* TESTIMONIALS */
.testimonials-section { background: var(--paper); }
.testimonials-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-top: 56px;
}
.testi-card {
  background: white; border: 1px solid var(--border);
  border-radius: 20px; padding: 28px;
  transition: all 0.3s;
}
.testi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px var(--shadow); }
.testi-stars { color: var(--brand); font-size: 14px; margin-bottom: 14px; }
.testi-text { font-size: 14px; line-height: 1.7; color: var(--ink-soft); margin-bottom: 20px; }
.testi-text strong { color: var(--ink); }
.testi-author { display: flex; align-items: center; gap: 10px; }
.testi-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: white;
}
.av1 { background: linear-gradient(135deg, var(--brand), var(--brand-light)); }
.av2 { background: linear-gradient(135deg, #1a8c7a, #2db5a0); }
.av3 { background: linear-gradient(135deg, #6b5ce7, #9580ff); }
.testi-name { font-size: 13px; font-weight: 700; color: var(--ink); }
.testi-role { font-size: 11px; color: var(--ink-soft); }

/* WORKSPACES */
.section-wrap { background: var(--paper); }
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.role-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: white;
  color: var(--ink);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 28px var(--shadow);
}

.role-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--brand) 55%, white);
  box-shadow: 0 18px 40px var(--shadow);
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.role-pmpo { background: linear-gradient(135deg, #1a8c7a, #2db5a0); }
.role-sp { background: linear-gradient(135deg, var(--brand), var(--brand-light)); }

.role-name { font-weight: 700; margin-bottom: 6px; font-size: 1rem; }
.role-desc { font-size: 0.9rem; color: var(--ink-soft); }

/* CTA */
.cta-section { text-align: center; background: var(--cream); }
.cta-box {
  max-width: 640px; margin: 0 auto;
  background: linear-gradient(135deg, #1a1612 0%, #2a2018 100%);
  border-radius: 32px; padding: 60px 40px;
  position: relative; overflow: hidden;
}
.cta-box::before {
  content: '';
  position: absolute; top: -100px; right: -100px;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand) 30%, transparent) 0%, transparent 70%);
}
.cta-box .section-title { color: white; max-width: none; }
.cta-box .section-sub { color: rgba(255,255,255,0.6); max-width: none; margin: 0 auto; }
.cta-actions { display: flex; gap: 14px; justify-content: center; margin-top: 36px; }
.cta-ghost { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }

/* FOOTER */
footer {
  background: var(--ink);
  padding: 40px 48px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 20px;
}
.footer-logo {
  font-family: 'Sora', sans-serif;
  font-weight: 800; font-size: 20px; color: white;
}
.footer-links { display: flex; gap: 28px; }
.footer-links a { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; }
.footer-links a:hover { color: var(--brand); }
.footer-copy { font-size: 12px; color: rgba(255,255,255,0.3); }

/* RESPONSIVE */
@media (max-width: 900px) {
  .landing-nav { padding: 16px 24px; }
  .nav-links { display: none; }
  .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
  .hero-visual { display: none; }
  section { padding: 70px 24px; }
  .features-grid { grid-template-columns: 1fr; }
  .tobby-inner { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .role-grid { grid-template-columns: 1fr; }
  footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; }
  .steps-grid::before { display: none; }
}
</style>
