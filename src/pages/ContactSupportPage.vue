<template>
  <q-page class="legal-page q-pa-md">
    <div class="legal-container">
      <h1 class="text-h4 text-weight-bold q-mb-sm">Contact & Support</h1>
      <div class="text-caption text-grey-6 q-mb-lg">Magnates Solution LLC</div>

      <section class="legal-section">
        <p>
          For product questions, account support, feature requests, or issue reporting, contact us at:
        </p>
        <p class="q-mt-sm">
          <a href="mailto:mymagnates@gmail.com" class="support-link">mymagnates@gmail.com</a>
        </p>
      </section>

      <section class="legal-section">
        <p>
          To help us resolve your request faster, please include your name, account email, and a short
          description of the issue.
        </p>
      </section>
    </div>
  </q-page>
</template>

<style scoped>
.legal-page {
  background: var(--bg-secondary);
  min-height: calc(100vh - 160px);
}

.legal-container {
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg-surface);
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  padding: 24px;
}

.legal-section {
  margin-bottom: 14px;
}

.legal-section p {
  margin: 0;
  color: var(--neutral-700);
  line-height: 1.7;
}

.support-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.support-link:hover {
  text-decoration: underline;
}
</style>
