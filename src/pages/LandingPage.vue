<template>
  <div class="landing-page">
    <header class="site-header">
      <button type="button" class="wordmark" @click="goHome">Handout</button>
      <nav class="site-links" aria-label="Main navigation">
        <a href="#workspace">Workspace</a>
        <a href="#manage">What it tracks</a>
        <a href="#service">Service help</a>
      </nav>
      <div class="site-actions">
        <button type="button" class="text-button" @click="goLogin">Sign In</button>
        <button type="button" class="primary-button primary-button--nav" @click="startFree">
          Get Started
        </button>
      </div>
    </header>

    <main>
      <section class="hero" aria-label="Handout property management workspace">
        <div class="hero-content">
          <div class="eyebrow">Property management workspace</div>
          <h1>Manage every property from one clear workspace.</h1>
          <p class="hero-copy">
            Handout keeps documents, maintenance, expenses, leases, reminders, and owner visibility
            connected across the properties you manage.
          </p>
          <div class="hero-actions">
            <button type="button" class="primary-button" @click="startFree">
              Create a PM workspace
            </button>
            <button type="button" class="outline-button" @click="goLogin">Sign In</button>
          </div>
          <div class="hero-signals">
            <span><q-icon name="folder_open" /> Documents</span>
            <span><q-icon name="home_repair_service" /> Maintenance</span>
            <span><q-icon name="event_available" /> Reminders</span>
          </div>
        </div>
      </section>

      <section id="workspace" class="workspace-section">
        <div class="section-heading">
          <div class="eyebrow eyebrow--dark">One record for every property</div>
          <h2>Designed around day-to-day property operations.</h2>
          <p>
            Select a property, find its files and history, and see what needs attention across
            leases, maintenance, and owner communication.
          </p>
        </div>

        <div class="product-frame" aria-label="Handout application preview">
          <div class="product-header">
            <span class="product-brand">Handout</span>
            <span class="product-title">Documents</span>
            <div class="product-tools">
              <q-icon name="search" />
              <q-icon name="add_circle" />
              <q-icon name="account_circle" />
            </div>
          </div>
          <div class="product-columns">
            <aside class="preview-properties">
              <div class="preview-label">Properties</div>
              <button class="preview-property preview-property--active" type="button">
                <span>Willow Rental</span>
                <small>42 Willow Lane</small>
              </button>
              <button class="preview-property" type="button">
                <span>Oak Rental</span>
                <small>112 Oak Street</small>
              </button>
            </aside>

            <div class="preview-main">
              <div class="preview-toolbar">
                <span><q-icon name="search" /> Search documents</span>
                <button type="button"><q-icon name="add" /> Add</button>
              </div>
              <div class="preview-source-row">
                <div class="preview-source preview-source--selected">
                  <strong>14</strong><span>All files</span>
                </div>
                <div class="preview-source"><strong>8</strong><span>Willow</span></div>
                <div class="preview-source"><strong>6</strong><span>Lease</span></div>
              </div>
              <div class="preview-files">
                <div class="preview-file">
                  <q-icon name="picture_as_pdf" class="file-pdf" />
                  <strong>Insurance policy</strong>
                  <small>Willow Rental - Updated May 12</small>
                </div>
                <div class="preview-file">
                  <q-icon name="receipt_long" class="file-doc" />
                  <strong>Roof service receipt</strong>
                  <small>Maintenance - Apr 29</small>
                </div>
              </div>
            </div>

            <aside class="preview-rail">
              <div class="preview-label">Quick status</div>
              <div class="rail-item">
                <span>Open tasks</span>
                <strong>2</strong>
              </div>
              <div class="rail-item">
                <span>Next reminder</span>
                <strong>May 30</strong>
              </div>
              <button class="rail-action" type="button">
                <q-icon name="notifications_none" /> Add reminder
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section id="manage" class="management-section">
        <div class="section-heading section-heading--left">
          <div class="eyebrow eyebrow--dark">The essentials</div>
          <h2>Keep records organized. Keep owners informed.</h2>
        </div>
        <div class="management-grid">
          <article>
            <q-icon name="description" />
            <h3>Documents and details</h3>
            <p>Keep leases, insurance, photos, and property details with the address they belong to.</p>
          </article>
          <article>
            <q-icon name="build_circle" />
            <h3>Maintenance history</h3>
            <p>Record issues, repairs, receipts, and assets so the next decision starts with context.</p>
          </article>
          <article>
            <q-icon name="payments" />
            <h3>Costs and reminders</h3>
            <p>Track expenses and due dates, then share the relevant view with invited owners.</p>
          </article>
        </div>
      </section>

      <section class="routine-section">
        <div class="routine-copy">
          <div class="eyebrow eyebrow--dark">A simple routine</div>
          <h2>Capture it once. Keep every stakeholder aligned.</h2>
          <p>
            Add the file, task, receipt, or reminder at the moment it matters. Handout keeps the
            history readable by property instead of scattering it across folders and messages.
          </p>
        </div>
        <div class="routine-flow">
          <div class="flow-line">
            <span class="flow-icon"><q-icon name="home" /></span>
            <div><strong>Add a property</strong><small>A property under your management</small></div>
          </div>
          <div class="flow-line">
            <span class="flow-icon"><q-icon name="upload_file" /></span>
            <div><strong>Attach records</strong><small>Documents, receipts, assets, and leases</small></div>
          </div>
          <div class="flow-line">
            <span class="flow-icon"><q-icon name="schedule" /></span>
            <div><strong>Stay prepared</strong><small>Tasks and reminders when action is due</small></div>
          </div>
        </div>
      </section>

      <section id="service" class="service-section">
        <div class="service-inner">
          <div>
            <div class="eyebrow eyebrow--mint">Optional when work is needed</div>
            <h2>Connect to trade help only when a job calls for it.</h2>
          </div>
          <p>
            If a repair needs outside help, share a maintenance task with a service provider and
            manage responses alongside the property's existing records. The marketplace supports
            your management record; it does not replace it.
          </p>
          <div class="service-tags">
            <span><q-icon name="plumbing" /> Plumbing</span>
            <span><q-icon name="electrical_services" /> Electrical</span>
            <span><q-icon name="roofing" /> Roofing</span>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Start a clearer property management workflow.</h2>
        <p>Organize the property first. Invite owners and connect service providers as needed.</p>
        <div class="cta-actions">
          <button type="button" class="primary-button" @click="startFree">Create a PM account</button>
          <button type="button" class="secondary-button" @click="goLogin">Sign In</button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-wordmark">Handout</div>
      <div class="footer-links">
        <a href="/public/about">About</a>
        <a href="/public/privacy">Privacy Policy</a>
        <a href="/public/terms">Terms of Service</a>
        <a href="/public/contact-support">Contact &amp; Support</a>
      </div>
      <div class="footer-copy">&copy; 2026 Magnates Solution LLC. All rights reserved.</div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => router.push('/landing')
const startFree = () => router.push('/public/pmpo-signup')
const goLogin = () => router.push('/public/login')
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

.landing-page {
  --landing-primary: #243b53;
  --landing-deep: #172536;
  --landing-accent: #27c2a4;
  --landing-accent-dark: #14806d;
  --landing-bg: #f5f7fb;
  --landing-surface: #ffffff;
  --landing-border: #dfe6ef;
  --landing-muted: #526277;
  --landing-ink: #16212f;
  min-height: 100vh;
  color: var(--landing-ink);
  background: var(--landing-bg);
  font-family: var(--font-field);
}

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 68px;
  padding: 0 clamp(20px, 5vw, 56px);
  display: flex;
  align-items: center;
  gap: 36px;
  background: rgba(23, 37, 54, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.wordmark {
  border: 0;
  padding: 0;
  background: transparent;
  color: #fff;
  font-family: var(--font-title);
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
}

.site-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.site-links a {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.site-links a:hover {
  color: #fff;
}

.site-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

.text-button {
  min-height: 40px;
  border: 0;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-button,
.outline-button,
.secondary-button {
  min-height: 46px;
  padding: 0 22px;
  border-radius: 8px;
  font-family: var(--font-field);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.primary-button {
  border: 1px solid var(--landing-accent);
  color: #112536;
  background: var(--landing-accent);
}

.primary-button:hover {
  border-color: #5ed8c0;
  background: #5ed8c0;
  transform: translateY(-1px);
}

.primary-button--nav {
  min-height: 40px;
  padding: 0 17px;
}

.outline-button {
  border: 1px solid rgba(255, 255, 255, 0.42);
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}

.outline-button:hover {
  border-color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.1);
}

.secondary-button {
  border: 1px solid var(--landing-border);
  color: var(--landing-primary);
  background: #fff;
}

.secondary-button:hover {
  border-color: var(--landing-primary);
  background: #f8fafc;
}

.hero {
  position: relative;
  height: calc(100svh - 64px);
  max-height: 760px;
  padding-top: 68px;
  display: flex;
  align-items: center;
  background-image:
    linear-gradient(90deg, rgba(18, 30, 44, 0.93) 0%, rgba(18, 30, 44, 0.84) 35%, rgba(18, 30, 44, 0.36) 59%, rgba(18, 30, 44, 0.08) 100%),
    url('/images/landing-home-records-hero.jpg');
  background-position: center, center;
  background-size: cover;
}

.hero-content {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding-bottom: 8px;
}

.eyebrow {
  margin-bottom: 20px;
  color: #6ee3cb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.eyebrow--dark {
  color: var(--landing-accent-dark);
}

.eyebrow--mint {
  color: #71e2cf;
}

.hero h1 {
  max-width: 570px;
  margin: 0;
  color: #fff;
  font-family: var(--font-title);
  font-size: 56px;
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
}

.hero-copy {
  max-width: 490px;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 17px;
  line-height: 1.62;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 34px;
}

.hero-signals {
  display: flex;
  gap: 25px;
  margin-top: 48px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
  font-weight: 500;
}

.hero-signals span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.hero-signals .q-icon {
  color: #71e2cf;
  font-size: 17px;
}

.workspace-section,
.management-section,
.routine-section,
.cta-section {
  max-width: 1180px;
  margin: 0 auto;
}

.workspace-section {
  padding: 72px 24px 78px;
}

.section-heading {
  max-width: 690px;
  margin: 0 auto 38px;
  text-align: center;
}

.section-heading h2,
.routine-copy h2,
.service-inner h2,
.cta-section h2 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0;
}

.section-heading p,
.routine-copy p,
.service-inner p,
.cta-section p {
  margin: 14px 0 0;
  color: var(--landing-muted);
  font-size: 15px;
  line-height: 1.7;
}

.product-frame {
  border: 1px solid var(--landing-border);
  border-radius: 8px;
  overflow: hidden;
  background: #eef2f8;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.product-header {
  height: 58px;
  padding: 0 18px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid var(--landing-border);
  background: #fff;
}

.product-brand {
  font-family: var(--font-title);
  font-size: 19px;
  font-weight: 700;
  color: var(--landing-primary);
}

.product-title {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}

.product-tools {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  color: var(--landing-primary);
  font-size: 20px;
}

.product-columns {
  display: grid;
  grid-template-columns: 204px minmax(0, 1fr) 214px;
  gap: 12px;
  padding: 12px;
}

.preview-properties,
.preview-main,
.preview-rail {
  min-width: 0;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  background: #fff;
}

.preview-properties,
.preview-rail {
  padding: 14px;
}

.preview-label {
  margin-bottom: 12px;
  color: var(--landing-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-property {
  width: 100%;
  margin-bottom: 7px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  text-align: left;
  background: transparent;
  color: var(--landing-ink);
}

.preview-property--active {
  border-color: rgba(39, 194, 164, 0.24);
  background: #e9fbf7;
}

.preview-property span {
  display: block;
  font-size: 13px;
  font-weight: 700;
}

.preview-property small {
  display: block;
  margin-top: 3px;
  color: var(--landing-muted);
  font-size: 11px;
}

.preview-main {
  padding: 12px;
}

.preview-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.preview-toolbar span {
  flex: 1;
  min-height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  color: #8795a8;
  background: #f8fafc;
  font-size: 12px;
}

.preview-toolbar button,
.rail-action {
  min-height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--landing-primary);
  border-radius: 6px;
  color: #fff;
  background: var(--landing-primary);
  font-size: 12px;
  font-weight: 600;
}

.preview-source-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin-bottom: 10px;
}

.preview-source {
  min-height: 50px;
  padding: 8px 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  color: var(--landing-muted);
  font-size: 11px;
}

.preview-source--selected {
  border-color: rgba(39, 194, 164, 0.35);
  background: #e9fbf7;
}

.preview-source strong {
  color: var(--landing-ink);
  font-size: 16px;
}

.preview-files {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.preview-file {
  min-height: 104px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
}

.preview-file .q-icon {
  font-size: 23px;
}

.file-pdf {
  color: #dc2626;
}

.file-doc {
  color: var(--landing-accent-dark);
}

.preview-file strong {
  font-size: 13px;
}

.preview-file small {
  color: var(--landing-muted);
  font-size: 11px;
}

.rail-item {
  margin-bottom: 8px;
  padding: 11px 10px;
  display: flex;
  justify-content: space-between;
  gap: 7px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  font-size: 12px;
}

.rail-item span {
  color: var(--landing-muted);
}

.rail-action {
  width: 100%;
  justify-content: center;
  margin-top: 7px;
}

.management-section {
  padding: 10px 24px 76px;
}

.section-heading--left {
  margin: 0 0 38px;
  text-align: left;
  max-width: 660px;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--landing-border);
  border-bottom: 1px solid var(--landing-border);
}

.management-grid article {
  padding: 32px 30px 34px 0;
}

.management-grid article + article {
  padding-left: 30px;
  border-left: 1px solid var(--landing-border);
}

.management-grid .q-icon {
  margin-bottom: 18px;
  color: var(--landing-accent-dark);
  font-size: 25px;
}

.management-grid h3 {
  margin: 0 0 9px;
  font-family: var(--font-title);
  font-size: 18px;
  font-weight: 700;
}

.management-grid p {
  margin: 0;
  color: var(--landing-muted);
  font-size: 14px;
  line-height: 1.65;
}

.routine-section {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 0.8fr);
  gap: 72px;
  padding: 0 24px 86px;
  align-items: center;
}

.routine-flow {
  border: 1px solid var(--landing-border);
  border-radius: 8px;
  background: #fff;
  padding: 12px 20px;
}

.flow-line {
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.flow-line + .flow-line {
  border-top: 1px solid var(--landing-border);
}

.flow-icon {
  width: 39px;
  height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: var(--landing-accent-dark);
  background: #e9fbf7;
  font-size: 21px;
}

.flow-line strong {
  display: block;
  margin-bottom: 2px;
  font-size: 14px;
}

.flow-line small {
  color: var(--landing-muted);
  font-size: 12px;
}

.service-section {
  padding: 68px 24px;
  color: #fff;
  background: var(--landing-primary);
}

.service-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  gap: 38px 60px;
  align-items: start;
}

.service-inner h2 {
  color: #fff;
  font-size: 31px;
}

.service-inner p {
  color: rgba(255, 255, 255, 0.72);
  margin-top: 35px;
}

.service-tags {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
}

.service-tags span {
  min-height: 40px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(113, 226, 207, 0.28);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;
}

.service-tags .q-icon {
  color: #71e2cf;
  font-size: 18px;
}

.cta-section {
  padding: 74px 24px 82px;
  text-align: center;
}

.cta-section p {
  max-width: 510px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  margin-top: 29px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.site-footer {
  min-height: 74px;
  padding: 18px clamp(20px, 5vw, 56px);
  display: flex;
  align-items: center;
  gap: 32px;
  color: var(--landing-muted);
  border-top: 1px solid var(--landing-border);
  background: #fff;
}

.footer-wordmark {
  font-family: var(--font-title);
  color: var(--landing-primary);
  font-size: 18px;
  font-weight: 700;
}

.footer-links {
  display: flex;
  gap: 22px;
}

.footer-links a {
  color: var(--landing-muted);
  font-size: 12px;
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--landing-primary);
}

.footer-copy {
  margin-left: auto;
  font-size: 12px;
}

@media (max-height: 650px) and (min-width: 769px) {
  .hero h1 {
    font-size: 43px;
  }

  .hero-copy {
    margin-top: 14px;
    font-size: 15px;
  }

  .hero-actions {
    margin-top: 22px;
  }

  .hero-signals {
    display: none;
  }
}

@media (max-width: 900px) {
  .site-header {
    height: 64px;
    gap: 14px;
    padding: 0 18px;
  }

  .site-links {
    display: none;
  }

  .wordmark {
    font-size: 21px;
  }

  .primary-button--nav {
    display: none;
  }

  .hero {
    height: calc(100svh - 54px);
    max-height: none;
    padding-top: 64px;
    background-image:
      linear-gradient(90deg, rgba(18, 30, 44, 0.94) 0%, rgba(18, 30, 44, 0.83) 66%, rgba(18, 30, 44, 0.44) 100%),
      url('/images/landing-home-records-hero.jpg');
    background-position: center, 17% center;
  }

  .hero-content {
    width: calc(100% - 40px);
  }

  .hero h1 {
    max-width: 390px;
    font-size: 41px;
  }

  .hero-copy {
    max-width: 360px;
    font-size: 15px;
  }

  .hero-signals {
    gap: 15px;
    margin-top: 37px;
    font-size: 12px;
  }

  .workspace-section {
    padding: 56px 20px 58px;
  }

  .section-heading h2,
  .routine-copy h2,
  .service-inner h2,
  .cta-section h2 {
    font-size: 29px;
  }

  .product-columns {
    grid-template-columns: 1fr;
  }

  .preview-properties,
  .preview-rail {
    display: none;
  }

  .management-section {
    padding: 0 20px 54px;
  }

  .management-grid {
    display: block;
  }

  .management-grid article,
  .management-grid article + article {
    padding: 25px 0;
    border-left: 0;
  }

  .management-grid article + article {
    border-top: 1px solid var(--landing-border);
  }

  .routine-section {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 20px 62px;
  }

  .service-section {
    padding: 52px 20px;
  }

  .service-inner {
    display: block;
  }

  .service-inner p {
    margin-top: 18px;
  }

  .service-tags {
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .cta-section {
    padding: 55px 20px 60px;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
  }

  .footer-copy {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .text-button {
    padding: 0 5px;
  }

  .hero h1 {
    font-size: 35px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    margin-top: 27px;
  }

  .hero-signals {
    flex-wrap: wrap;
    margin-top: 25px;
  }

  .preview-source-row,
  .preview-files {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 680px) and (max-width: 900px) {
  .eyebrow {
    margin-bottom: 12px;
  }

  .hero h1 {
    font-size: 31px;
  }

  .hero-copy {
    margin-top: 13px;
    line-height: 1.48;
  }

  .hero-actions {
    margin-top: 18px;
  }

  .hero-signals {
    display: none;
  }
}
</style>
