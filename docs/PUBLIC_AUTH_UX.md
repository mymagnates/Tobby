# Public Authentication UX

Updated: 2026-09-09

## Scope

- Match the web workspace and landing page: warm white, deep green, thin borders and restrained typography.
- Desktop: left-aligned form, quiet supporting panel on the right.
- At 880px and below: hide the supporting panel; at 600px and below use 20px horizontal page padding.
- Login: email, password, accessible password visibility control and inline password recovery.
- Registration: `/public/register` directly renders the manager registration form, also available at `/public/pmpo-signup`.
- Four required fields: full name, email, password, confirmation. Company, phone and management scope are in a native, keyboard-accessible optional disclosure.
- Preserve the existing manager profile payload and default `manage_scope: ['Own']`. No changes to ownership, membership, backend authorization or database schema.
- Preserve invitation redirects when switching between login/register and entering the loading route; reject protocol-relative redirect targets.
- Keep SP direct signup and tenant invitation routes. The main registration page no longer promotes the SP workspace.
- Guest header/footer and shared auth CSS also affect other public guest pages. Independent native/mobile workspace login pages are not redesigned here.

## Files

- `src/layouts/GuestLayout.vue`: compact shared header/footer.
- `src/css/public-auth.scss`: responsive visual system.
- `src/components/AuthWorkspaceStory.vue`: shared desktop supporting panel.
- `src/components/FirebaseAuth.vue`: login and inline recovery.
- `src/pages/PmPoSignUpPage.vue`: simplified registration.
- `src/pages/RegisterLandingPage.vue`: direct registration entry.

## Verification

- Targeted ESLint: passed for edited Vue components and new tests.
- Production web build: passed. Existing Browserslist age and mixed static/dynamic Firebase import warnings remain.
- Vitest: 14 passed, 1 existing skipped test across `PublicAuthForms.test.js`, `FirebaseAuth.test.js`, and `PropertyContextSwitcher.test.js`.
- New component tests exercise store hydration before login navigation, invitation redirect preservation, inline reset success/failure, password visibility, optional registration fields, profile payload, unsafe redirect rejection and registration failure recovery.
- Chromium UI checks passed at 1280px, 390px and 320px: form placement, no horizontal overflow, mobile panel hiding, autofill attributes, password visibility, login/register navigation, optional disclosure, compact spacing and mismatched-password validation.
- Screenshots: `/private/tmp/handout-auth-qa/`. Browser tests intercept Firebase/store modules and block external requests. They do not verify production authentication, send emails or create accounts.
- Not covered: full test suite, real-device Safari/keyboard behavior, authenticated end-to-end tests, or SP/tenant invitation flow regression.
- No Firebase deployment or Git commit/push performed for this change.

## Reproduce

```bash
node_modules/.bin/vitest run tests/unit/components/PublicAuthForms.test.js tests/unit/components/FirebaseAuth.test.js tests/unit/components/PropertyContextSwitcher.test.js
npm run build
# Requires a running Quasar dev server; override AUTH_QA_URL if its port differs.
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/public-auth-visual.mjs
```

The temporary Chromium runtime used here is installed under `/private/tmp/handout-auth-browsers`. If unavailable, install a Playwright Chromium runtime or use the environment's existing runtime path before running the browser script.
