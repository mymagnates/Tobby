<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="not-found-brand"><span>H</span> Handout</div>
      <div class="not-found-code">404</div>
      <h1>That page is not in this workspace.</h1>
      <p>It may have moved, or the link may no longer be available.</p>
      <q-btn class="q-mt-lg" color="primary" unelevated to="/" label="Back to dashboard" no-caps />
    </div>
  </div>
</template>

<script setup>
//
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 18% 10%, rgba(39, 194, 164, 0.18), transparent 26%),
    linear-gradient(135deg, #19364d 0%, #10283c 100%);
}

.not-found-card {
  width: min(520px, 100%);
  padding: 42px;
  border: 1px solid rgba(190, 233, 224, 0.22);
  border-radius: 20px;
  color: #f8fcff;
  background: rgba(255, 255, 255, 0.07);
  text-align: center;
}

.not-found-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 750;
}

.not-found-brand span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #15364a;
  background: #27c2a4;
  font-size: 0.8rem;
  font-weight: 800;
}

.not-found-code {
  margin-top: 34px;
  color: #8ee8d3;
  font-size: clamp(4.8rem, 16vw, 7.5rem);
  font-weight: 800;
  letter-spacing: -0.08em;
  line-height: 0.85;
}

h1 {
  margin: 28px 0 10px;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.05;
}

p {
  margin: 0;
  color: rgba(235, 247, 252, 0.7);
}

@media (max-width: 640px) {
  .not-found-card {
    padding: 32px 22px;
  }
}
</style>
