# Web PM Release Automation Test Plan v1

## 1. Purpose

Create a repeatable release gate for the PM-only web launch. The suite must
validate the actual PM workflow and prevent cross-property data exposure.

This plan does not cover iOS, live Stripe charging, or the future Property
History Pack transfer model.

## 2. Test Principles

- Do not run write tests against production Firebase data.
- Use Firebase Emulator Suite for permission and data-isolation tests.
- Use a dedicated staging project only for deploy smoke tests.
- Treat backend authorization as the source of truth; browser tests cannot
  replace security-rule and API tests.
- Keep the required PR suite under 10 minutes. Heavier smoke and visual suites
  run before release or on a schedule.

## 3. Tooling

| Layer | Tool | Purpose | Required for launch |
| --- | --- | --- | --- |
| Unit and component | Vitest + Vue Test Utils | Pure logic, composables, forms, route guards | Yes |
| API integration | Vitest + Supertest or native fetch | Functions API contracts, authentication, quotas, Support | Yes |
| Firebase authorization | Firebase Emulator Suite + `@firebase/rules-unit-testing` | Firestore and Storage cross-property isolation | Yes |
| Browser E2E | Playwright | Real PM critical paths in Chromium and WebKit | Yes |
| Deploy smoke | Playwright against staging | Hosted routes, API rewrite, auth entry, legal/support pages | Yes |
| Visual/performance | Playwright screenshots + Lighthouse CI | Landing and PM first-screen regressions | Release-preferred |
| Device/browser matrix | BrowserStack or Sauce Labs | Real Safari/iPhone web verification | Optional for first PM web launch |

## 4. Required Environments

### Local automated environment

- Firebase Auth, Firestore, Storage, and Functions emulators.
- Seeded test users: `pm-a`, `pm-b`, and `admin`.
- Seeded properties: `property-a` owned by PM A and `property-b` owned by PM B.
- Test files stored only in the Storage emulator.
- A local SMTP/email stub or asserted API response for Support and invite tests.

### Staging environment

- Separate Firebase project or isolated staging data namespace.
- Dedicated PM demo account with no production customer data.
- No live payment keys and no live customer email sends.

## 5. Required Test Suites

### A. Unit and component suite

Tool: Vitest + Vue Test Utils.

- Auth hydration never blocks first paint.
- PM-only native/shared route guards do not expose excluded launch routes.
- Create-property modes: `self_owned` and `managed_for_owner` produce the
  expected initial membership fields.
- Upload logic waits for authenticated state and presents actionable failures.
- AI and storage quota UI renders loading, available, and exhausted states.
- Account deletion, privacy, and Support forms validate and submit correctly.
- Existing failing `useFirebase.uploadFile` mock includes `authPersistenceReady`.

### B. API and authorization suite

Tool: Vitest + backend HTTP server test harness; Firebase Emulator Suite for
data and rules.

| Risk | Required assertion |
| --- | --- |
| Cross-property data leak | PM A cannot read, list, upload to, update, or delete PM B property data or Storage files. |
| Role escalation | A PM cannot write Owner membership, primary-owner fields, or another user's role directly. |
| File protection | Signed-in but unauthorized users cannot read property/lease uploads. |
| Support | A PM can create a ticket; only the authorized admin path can list or change it. |
| Deletion | A valid authenticated request creates one auditable deletion request; a missing/invalid token fails. |
| Quotas | Exhausted AI credit returns the defined `402 AI_CREDIT_EXHAUSTED`; storage preflight/commit rejects over-limit uploads. |
| Owner invite | Duplicate pending invitation is rejected; acceptance grants the intended property membership only. |

The first three rows are release blockers. They require committed Firestore and
Storage rules before this suite can be considered complete.

### C. PM critical-path browser suite

Tool: Playwright.

Run in Chromium on every pull request and in WebKit before a release.

1. PM registers or signs in and lands in the PM workspace.
2. PM creates a property and sees it in the property selector.
3. PM creates a maintenance record and attaches a file/photo.
4. PM creates a task, reminder, asset, document, and transaction.
5. PM reloads and can retrieve each record from the correct property.
6. PM sees usage/credit information and the exhaustion state does not create a
   misleading successful AI result.
7. PM opens Privacy Policy, submits a Support ticket, and requests account
   deletion.
8. PM cannot reach disabled publish-to-SP/bid routes from launch navigation.

Use test IDs for stable selectors. Do not build E2E tests around CSS classes or
translated text when a test ID can be added.

### D. Staging smoke suite

Tool: Playwright + HTTP health checks.

- `/landing`, `/privacy`, `/terms`, and `/contact-support` return the expected
  pages rather than SPA 404s.
- PM signup and login entry points load.
- `/api/**` reaches the deployed `mkpl` function.
- PM demo account completes one create/read cycle without console errors.
- Production build does not expose an active public SP publishing CTA.

## 6. CI Gates

| Trigger | Required command group | Block merge/deploy |
| --- | --- | --- |
| Pull request | lint, Vitest unit/API, emulator rules tests, Chromium Playwright | Yes |
| Main branch | all PR gates plus build artifact | Yes |
| Staging deploy | staging smoke | Yes |
| Release candidate | WebKit Playwright, screenshots, Lighthouse, manual PM smoke | Yes |

Suggested scripts:

```text
npm run test:unit
npm run test:api
npm run test:rules
npm run test:e2e
npm run test:e2e:webkit
npm run test:smoke:staging
npm run test:release
```

The implementation agent may name scripts differently, but must document the
final commands in `package.json` and this plan's execution log.

## 7. Agent Work Breakdown

### Agent A: Firebase security and emulator foundation

- Add committed Firestore rules, indexes if required, and emulator config.
- Replace broad Storage access with property-membership authorization.
- Seed PM A / PM B fixtures and write cross-property denial tests.
- Acceptance: unauthorized Firestore and Storage operations fail in emulator;
  authorized PM operations succeed.

### Agent B: Backend API contract tests

- Add an isolated Functions/API test harness.
- Cover quotas, Support, deletion, owner invitations, and role escalation.
- Fix the current `authPersistenceReady` test mock drift.
- Acceptance: API tests use no production credentials or data and run locally.

### Agent C: Playwright PM workflow

- Add Playwright configuration, fixtures, test IDs, and PM critical-path tests.
- Run Chromium locally/CI and WebKit as a release suite.
- Acceptance: one command starts required local services, executes the PM flow,
  and emits trace/screenshots on failure.

### Agent D: CI and release reporting

- Add CI workflow with explicit test stages and artifact upload.
- Add staging smoke checks and optional Lighthouse budget.
- Write a short failure-triage guide: environment failure, test failure, or
  product regression.
- Acceptance: a failed security/E2E test blocks deployment and links to useful
  test output.

## 8. Definition of Done

- No test writes to production data.
- All required suites pass from a clean checkout.
- PM A/PM B isolation is proven for Firestore and Storage.
- PM browser flow passes in Chromium and WebKit.
- Staging smoke passes after deployment.
- Test failure output includes screenshots/traces or API response evidence.
- `AGENT_PROJECT_TRACKER.md` records commands, results, and any residual risks.

## 9. Rollout Order

1. Agent A first: security rules and emulator baseline.
2. Agent B and Agent C in parallel after the baseline is usable.
3. Agent D after test commands are stable.
4. Run the complete release suite once before Web launch.
