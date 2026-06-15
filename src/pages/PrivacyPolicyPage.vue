<template>
  <q-page class="privacy-page q-pa-md">
    <div class="privacy-shell">
      <q-card flat bordered class="privacy-card">
        <q-card-section class="privacy-header">
          <div class="text-overline text-primary">Legal</div>
          <h1>Privacy Policy</h1>
          <div class="privacy-meta">Effective date: June 14, 2026</div>
          <p class="privacy-summary">
            This policy explains what Handout collects, how it uses data, how information may be
            shared, and how account deletion requests work.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="privacy-body">
          <section class="privacy-section">
            <h2>1. Who We Are</h2>
            <p>
              Handout is operated by Magnates Solution LLC. We provide property management and
              related collaboration software for owners, property managers, tenants, and service
              providers.
            </p>
          </section>

          <section class="privacy-section">
            <h2>2. Data We Collect</h2>
            <p>
              We collect account details, contact information, role and property context,
              records you create or upload, task and maintenance data, lease and transaction data,
              invoices, support requests, service provider profile data, usage data, diagnostic
              data, and files or photos you choose to attach.
            </p>
            <p>
              On mobile devices, we may also collect camera, photo library, file, and microphone
              content only when you choose to use a feature that needs it.
            </p>
          </section>

          <section class="privacy-section">
            <h2>3. How We Use Data</h2>
            <p>
              We use data to operate the app, authenticate users, authorize role-based access,
              support property workflows, connect relevant users, generate reports, maintain audit
              trails, prevent abuse, and improve reliability.
            </p>
          </section>

          <section class="privacy-section">
            <h2>4. Sharing</h2>
            <p>
              We do not sell personal information. We may share data with service providers that
              help us operate the product, secure the service, process payments, provide analytics,
              or support customer requests. Information may also be visible to users who have a
              configured role-based relationship to the same property, lease, task, or workspace.
            </p>
          </section>

          <section class="privacy-section">
            <h2>5. Storage and Retention</h2>
            <p>
              We retain data as needed for business, security, accounting, and legal purposes.
              Property, lease, task, invoice, support, and audit records may be retained after
              account closure if required for compliance or shared-workspace continuity.
            </p>
          </section>

          <section class="privacy-section">
            <h2>6. Your Choices</h2>
            <p>
              You can review and update profile information, request account deletion, and use
              available privacy or support controls inside the app. If you want help with a
              deletion request, use the Contact &amp; Support page.
            </p>
          </section>

          <section class="privacy-section">
            <h2>7. Changes</h2>
            <p>
              We may update this policy from time to time. When we do, we will update the effective
              date and, when appropriate, provide notice in the product.
            </p>
          </section>

          <section class="privacy-section">
            <h2>8. Contact</h2>
            <p>
              For privacy questions, contact Magnates Solution LLC through the support channels in
              the app.
            </p>
          </section>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="privacy-actions">
          <q-btn flat no-caps label="Back" icon="arrow_back" @click="goBack" />
          <q-btn flat no-caps color="primary" label="Contact Support" @click="goSupport" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}

const goSupport = () => {
  router.push('/contact-support')
}
</script>

<style scoped>
.privacy-page {
  background: linear-gradient(180deg, #fbfaf7 0%, #f4f0e8 100%);
  min-height: 100%;
}

.privacy-shell {
  max-width: 980px;
  margin: 0 auto;
}

.privacy-card {
  border-radius: 24px;
  overflow: hidden;
  border-color: #e4ddcf;
  box-shadow: 0 16px 44px rgba(26, 22, 18, 0.08);
}

.privacy-header {
  padding: 28px 28px 20px;
}

.privacy-header h1 {
  margin: 6px 0 10px;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.privacy-meta {
  color: #7a6f62;
  font-size: 13px;
}

.privacy-summary {
  margin: 14px 0 0;
  max-width: 760px;
  color: #4f463d;
  line-height: 1.7;
}

.privacy-body {
  padding: 24px 28px;
}

.privacy-section + .privacy-section {
  margin-top: 22px;
}

.privacy-section h2 {
  font-size: 18px;
  margin: 0 0 10px;
}

.privacy-section p {
  margin: 0;
  color: #4f463d;
  line-height: 1.75;
}

.privacy-section p + p {
  margin-top: 10px;
}

.privacy-actions {
  padding: 16px 20px;
}

@media (max-width: 640px) {
  .privacy-header,
  .privacy-body {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
