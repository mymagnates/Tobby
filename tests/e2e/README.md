# PM browser E2E suite

This suite is intentionally restricted to Firebase Emulator Suite or an isolated staging project. Do not point `E2E_BASE_URL` at production.

## Prerequisites

1. Install Playwright as a development dependency and install its browsers. This Agent C task does not modify `package.json`.
2. Start the Quasar web app and Firebase emulators, or an isolated staging environment.
3. Seed a PM account and a property owned by that account.

```sh
E2E_BASE_URL=http://127.0.0.1:9000 \
E2E_PM_EMAIL=pm-a@example.test \
E2E_PM_PASSWORD=fixture-password \
E2E_PROPERTY_ID=property-a \
npx playwright test --config tests/e2e/playwright.config.js --project=chromium
```

For an isolated staging run, set `E2E_ENV=staging` and use only the dedicated staging PM account. Failure artifacts are written to `test-results/playwright` and `playwright-report`.

The Support submission test is deliberately marked `fixme`: the current public Support page is a mailto page, not an in-app ticket form. Account deletion is opened but never submitted by browser E2E because the API suite must own destructive request coverage.
