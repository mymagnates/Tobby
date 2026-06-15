# Agent Project Tracker

This file is the shared coordination point for agents working in this repository.
Use it to track current priorities, assigned work, execution results, and blockers.

## How to Use

- Read this file before starting work.
- Update the `Current Focus` and `Work Queue` sections when priorities change.
- When you complete a task, add an entry to `Execution Log` with:
  - what was done
  - files changed
  - verification performed
  - remaining issues, if any
- If blocked, add a short note under `Blockers` and stop at the specific blocker.
- Keep entries concise and factual.

## Agent Check Cadence

- PM/product agents may publish new work here.
- Web/backend developer agent should check this tracker and `git status --short` roughly every 10 minutes while active.
- Mobile agent may run a similar cadence; avoid overwriting another agent's active row.
- If a row is assigned to another agent and marked `in_progress`, do not take it unless explicitly reassigned.
- If an automation/wakeup tool is unavailable, the cadence applies whenever the agent is active or explicitly resumed.
- Each check that changes task state should update `Work Queue`; routine no-op checks do not need log entries.

## Current Focus

- Stabilize the product for launch.
- Keep the mobile path aligned with the current Quasar/Capacitor direction.
- Keep the SP lead flow simple: task -> confirmed publish -> lead -> bid.
- Reduce iOS startup latency without widening the mobile scope.
- Reduce first-screen bundle weight and split heavy launch-time chunks.
- Optimize iOS first-screen payload and launch path only.
- Define support flow and payment/credit rules as separate launch tasks.
- Temporarily hide all `publish to SP` entry points on both web and mobile while iOS v1 is PM-only.
- Hide SP promotion from the public landing/register flow while keeping PM/PO entry visible.

## Agent Roles

| Agent | Scope | Primary Responsibilities |
| --- | --- | --- |
| Frontend Agent | Web app / shared UI | Router, page flow, responsive UI, auth/session UI, SP/PM/TT web surfaces |
| iOS Agent | Mobile app | Capacitor mobile shell, native permissions, mobile route scope, build readiness |
| Backend Agent | API / data model | Marketplace state machine, lead lifecycle, bids, assignments, credit flow, API contract |

## Work Queue

| Priority | Task | Status | Owner | Notes |
| --- | --- | --- | --- | --- |
| P0 | Stabilize marketplace lead/bid/assignment flow | completed | Backend Agent | Core monetization path stabilized in `/Users/MacAirEZ/.codex/worktrees/e4cc/projectTobby`; focused backend suite passing |
| P0 | Confirm mobile app structure and Capacitor readiness | complete | iOS Agent | Verified active Capacitor native project under `src-capacitor/ios/App`; iOS build/sync passed |
| P0 | Fix auth/session issues in Firebase boot/composables | completed | Frontend Agent | Verified current boot/auth observer flow and aligned tests with always-on LOCAL persistence behavior |
| P1 | Trim mobile/web routes to the launch-ready minimum | completed | Frontend Agent | Non-launch internal routes were downgraded to redirects; public externally used routes were preserved |
| P1 | Finalize lead lifecycle states and publish rules | completed | Backend Agent | Task publishing remains explicit; tenant cannot publish SP leads; selection sync now uses canonical bid states |
| P1 | Define mobile launch surface and native permissions | complete | iOS Agent | Launch surface documented in execution log; native permissions present for camera, photos, and microphone |
| P1 | Reduce iOS startup latency | complete | iOS Agent | Auth hydration no longer blocks first paint; Analytics is deferred/skipped on native; upload waits for auth readiness |
| P0 | Split first-screen bundles and reduce launch-time chunk weight | completed | Frontend Agent | Main entry split into vendor chunks; SPA `index` dropped from ~715 KB to ~63 KB |
| P0 | Optimize iOS first-screen payload and launch path | complete | iOS Agent | Capacitor iOS `index` dropped from ~724 KB to ~64 KB; native sync passed |
| P1 | Enforce PM-only launch scope on iOS | blocked | iOS Agent | Native/Capacitor route and navigation gates added in shared Quasar code; current checkout has no usable iOS project beyond an empty `ios/` directory, no `@capacitor/*` dependencies, and capacitor build prompts for initialization |
| P1 | Hide `publish to SP` entry points across web and mobile | completed | Frontend Agent | Task publish, bid, recommended-SP, quote, assignment, and SP-detail entry points are gated behind a disabled PM-only launch flag; task insight no longer recommends publishing to providers |
| P1 | Hide SP onboarding from the public landing flow | completed | Frontend Agent | `/public/register` now shows only the PM/PO workspace entry; static landing copy no longer promotes SP onboarding; direct `/public/sp-signup` route remains for compatibility |
| P1 | Define support flow and escalation rules | completed | Frontend Agent | Admin support inbox implemented in `admin-console` with backend ticket/comment APIs; result written back to `docs/ADMIN_SUPPORT_INBOX_SPEC_V01.md` |
| P1 | Design payment and credit consumption rules | completed | Backend Agent | Pricing and credit spec written in `docs/SP_BID_CREDIT_STRIPE_SPEC_V01.md`; payment rules now use a server-authoritative bid credit ledger |
| P1 | Implement SP bid credit backend and Stripe webhook flow | completed | Backend Agent | Core credit/order/ledger/consume/refund logic implemented; Stripe-compatible callback/webhook path verified with tests |
| P1 | Build SP credits purchase and history UI | completed | Frontend Agent | `sp-credits` now reflects launch SKUs, current balance, purchase cards, order history, ledger history, and FAQ help text |
| P1 | Extend admin-console billing ops for SP credit management | completed | Frontend Agent | Existing `admin-console` billing page now supports SP/date/status filters, richer order/ledger views, and manual adjustment guidance |

## First Task Pack

### Frontend Agent

- Task: Fix auth/session handling and align launch-ready web routes.
- Goal: Remove the known `useFirebase` timeout bug and reduce route scope to the pages needed for launch.
- Constraints:
  - Do not reintroduce legacy iOS-specific assumptions.
  - Keep SP / PM / TT web entry points consistent with the current marketplace plan.
  - Preserve existing public routes that are already used externally.
- Acceptance:
  - Auth/session tests pass or are updated with matching behavior.
  - Route map is trimmed or clarified for launch scope.
  - Any route changes are reflected in the tracker notes.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Inspect `src/composables/useFirebase.js` and fix the `unsubscribe` timing issue.
  2. Re-run the affected unit tests and capture the result.
  3. Review `src/router/routes.js` against launch scope and remove or deprioritize non-essential routes.
  4. Update any route-related docs or notes that now mismatch the code.
  5. Write a concise tracker entry with files changed and verification status.

- Task: Split the first-screen bundles and reduce launch-time chunk weight.
- Goal: Make the app faster to paint on iOS/web by trimming the initial payload and deferring heavy feature chunks.
- Constraints:
  - Do not widen product scope or add new launch pages.
  - Preserve the current public route behavior.
  - Keep backend contracts unchanged unless a chunk boundary requires a safe import refactor.
- Acceptance:
  - Identify the largest launch-time chunks and the modules responsible for them.
  - Reduce first-screen payload through lazy loading or route-level split points.
  - Re-run build validation and note remaining warnings.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Inspect the current build output and identify the dominant first-screen chunks.
  2. Trace imports from the app entry and landing routes to find eager loading candidates.
  3. Apply route-level or component-level lazy loading where it is safe.
  4. Rebuild and record the before/after chunk observations.
  5. Update the tracker with the exact files changed and any residual bundle warnings.

- Task: Define support flow and escalation rules.
- Goal: Keep support narrow and explicit so it does not blur into billing or lead handling.
- Constraints:
  - Do not mix support with payment/credit flows.
  - Preserve the current launch scope and role boundaries.
  - Keep user-facing entry points simple and obvious.
- Acceptance:
  - Support entry points and ownership are specified.
  - Escalation / handoff rules are documented.
  - Any UI or route changes are reflected in the tracker notes.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Identify where support should live in the current navigation and role model.
  2. Define the minimal user-facing support actions.
  3. Define escalation and handoff behavior for unresolved cases.
  4. Keep support separate from billing and lead workflows.
  5. Write back the final support scope and any pages or routes changed.

### iOS Agent

- Task: Verify Capacitor readiness and define the mobile launch surface.
- Goal: Confirm the current mobile app is Capacitor-based, identify required native setup, and list the minimum screens for first release.
- Constraints:
  - Treat the old SwiftUI project as removed and do not restore it.
  - Keep mobile scope intentionally narrow.
  - Do not expand into full parity with web unless explicitly requested.
- Acceptance:
  - Clear list of required Capacitor dependencies / platform steps.
  - Clear list of mobile launch pages and native permissions.
  - Any missing platform directories or configs are documented.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Confirm whether the repository already contains a live Capacitor native project or only Quasar config.
  2. Identify required Capacitor packages and platform setup steps.
  3. List the minimum mobile screens for first release and any screens to exclude.
  4. Check permission requirements for camera, photo library, files, location, and push.
  5. Write back a launch-readiness checklist with explicit missing items.

- Task: Optimize iOS first-screen payload and launch path.
- Goal: Make the iOS shell paint faster without changing product scope, using only iOS-first launch path reduction.
- Constraints:
  - Keep the scope limited to iOS first paint and startup imports.
  - Do not widen into global bundle work unless it directly impacts the iOS shell.
  - Preserve existing iOS launch behavior and route contracts.
- Acceptance:
  - Identify the launch path and imports that affect iOS first paint most.
  - Apply safe split points or deferrals that benefit the iOS shell.
  - Rebuild or verify and record any remaining warnings.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Inspect the iOS launch path and identify eager imports that block first paint.
  2. Trace route-level or boot-level modules that can be deferred safely for iOS.
  3. Apply iOS-only deferral or lazy loading where it does not affect functionality.
  4. Verify the change with build output or targeted tests.
  5. Write back exact files changed and residual issues in the tracker.

### Backend Agent

- Task: Stabilize marketplace lead, bid, assignment, and credit flow.
- Goal: Make the lead monetization path deterministic and safe for early SP charging.
- Constraints:
  - Lead must not auto-publish from every task.
  - Lead lifecycle must stay explicit and server-authoritative.
  - Credit consumption must remain atomic and explainable.
- Acceptance:
  - Lead creation, visibility, bid submission, assignment, and credit consumption paths are consistent.
  - State transitions match the marketplace spec.
  - Any failing tests are converted into a short fix list or resolved.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Review current lead state transitions and make sure task publishing does not happen implicitly.
  2. Inspect bid creation, duplicate prevention, and lead visibility rules.
  3. Verify assignment create/accept/decline/revoke/completion transitions.
  4. Verify credit consumption, free credit refresh, and history updates.
  5. Summarize failing tests into a backend-only fix list or patch them directly if simple.

- Task: Design payment and credit consumption rules.
- Goal: Make payment, credit deduction, refunds, and recharge behavior explicit and server-authoritative.
- Constraints:
  - Keep the billing model simple enough for early launch.
  - Do not let client-side state decide credit validity.
  - Avoid mixing payment logic with support escalation.
- Acceptance:
  - Payment triggers, credit deduction timing, and failure/rollback rules are documented.
  - Refund and dispute handling are explicitly defined.
  - Any existing payment or credit endpoints are mapped to the new rules.
- Write-back:
  - Update `Work Queue` status and add a short note in `Execution Log`.
- Subtasks:
  1. Review current payment/credit flow and identify where rules are implicit or duplicated.
  2. Define when credits are reserved, consumed, or refunded.
  3. Define how payment success/failure maps to credit state.
  4. Define how disputes or support cases affect billing state.
  5. Write back a concise billing rule spec for downstream implementation.

## Execution Log

### 2026-06-14 - Frontend Agent Privacy, Deletion, and Mobile Quota Fixes

- Added a real `/privacy` SPA page and redirected `/public/privacy` to it so the web privacy policy link no longer falls into 404.
- Updated the account deletion request flow to wait for auth readiness before building headers, which removes the silent no-op path on mobile when auth is still hydrating.
- Added storage and AI usage quota visibility to the SP mobile profile so launch users can see credit/storage limits in-app.
- Files changed: `src/pages/PrivacyPolicyPage.vue`, `src/router/routes.js`, `src/pages/UserProfilePage.vue`, `src/services/accountPrivacy.js`, `src/pages/SpProfilePage.vue`.
- Verification: `npm run build` passed successfully after the route and UI changes; remaining output is limited to the existing Browserslist, Firebase dynamic import, and chunk-size warnings.

### 2026-06-14 - Frontend Agent PM Mobile Quota Visibility

- Added a quota tracker block to the PM mobile home/feed page so the PM workspace also shows AI token and storage usage at launch.
- Reused the billing usage API on `IndexPage` and kept the display compact enough for the mobile feed layout.
- Files changed: `src/pages/IndexPage.vue`.
- Verification: `npm run build` passed successfully after the PM quota UI addition; only the pre-existing build warnings remain.

### 2026-06-10 - Frontend Agent PM-only Public Landing

- Applied `docs/WEB_LANDING_PM_ONLY_SCOPE_V01.md` to the public landing/register surface.
- Removed the `Provide Services` card and SP CTA from `/public/register`; PM/PO signup remains the single primary workspace entry.
- Reworked static landing copy from service-provider promotion to PM/PO owner-access coordination, including the navigation anchor and CTA copy.
- Preserved direct `/public/sp-signup` route compatibility without promoting it from landing/register.
- Files changed: `src/pages/RegisterLandingPage.vue`, `public/landing.html`, `AGENT_PROJECT_TRACKER.md`.
- Verification: `rg` confirmed no SP onboarding terms or `/public/sp-signup` links remain in `src/pages/RegisterLandingPage.vue` or `public/landing.html`; `npm run build` passed with only existing Browserslist, Firebase import, and chunk-size warnings.

### 2026-06-10 - Frontend Agent PM-only Publish-to-SP Gate

- Hid task publish, published-status filter/chips, assigned-SP banners, bid sections, bid/SP detail dialogs, recommended-SP cards, quote/contact actions, and create-task publish prompts behind a disabled PM-only launch flag.
- Updated task insight fallback/prompt normalization so PM-only task details do not recommend publishing or provider outreach while the launch surface is PM/PO-only.
- Files changed: `src/pages/MxRecordsPage.vue`, `backend/agent/skills/taskInsight.js`, `backend/agent/prompts/taskInsightPrompt.js`, `AGENT_PROJECT_TRACKER.md`.
- Verification: `rg` confirmed public landing/register no longer links to SP signup or SP onboarding copy; SP publish strings remaining in task UI are only in disabled `showSpPublishUi` compatibility code; `npm run build` passed with only existing Browserslist, Firebase import, and chunk-size warnings.

### 2026-06-10 - iOS Agent PM-only Shared Route Gate

- Applied `docs/IOS_PM_ONLY_LAUNCH_SCOPE_V01.md` as far as the current checkout allows by adding native-only guards for owner, tenant, SP, SP signup/showcase, SP credits, bid, invoice, and payment routes in the shared Quasar router.
- Filtered native PM-only navigation and global create options so owner/tenant/SP launch paths are not exposed from the mobile menu model.
- Verified `trash/legacy-ios` is not a valid restoration target for this task: its README marks it reference-only, and its SwiftUI source still contains tenant and SP tabs/flows.
- Files changed: `src/router/index.js`, `src/layouts/MainLayout.vue`, `AGENT_PROJECT_TRACKER.md`.
- Verification: `npm run build` passed with only existing Browserslist, Firebase import, and chunk-size warnings; `find` showed the current `ios/` directory contains no buildable native project files; `./node_modules/.bin/quasar build -m capacitor -T ios --skip-pkg` prompts for a new Capacitor app id, confirming the current checkout is not initialized for non-interactive iOS build verification.

### 2026-06-07 - Frontend Agent Support Inbox

- Implemented the launch support inbox in the existing `admin-console` app.
- Added backend support ticket APIs for user submission/status and admin list/detail/update/comment flows in `backend/apiServer.js`.
- Added admin UI route `/support` and `/support/:ticketId`, sidebar entry `Support Inbox`, and a table-driven ticket detail/action panel.
- Support remains separate from billing and lead handling; tickets can link to source entities and can flag billing/backend/frontend/iOS review without mutating those systems.
- Files changed: `backend/apiServer.js`, `admin-console/src/services/adminApi.js`, `admin-console/src/router/index.js`, `admin-console/src/layouts/AdminShell.vue`, `admin-console/src/pages/SupportInboxPage.vue`, `admin-console/src/styles.css`, `docs/ADMIN_SUPPORT_INBOX_SPEC_V01.md`, `AGENT_PROJECT_TRACKER.md`.
- Verification: focused ESLint passed with only the existing CSS config warning; `admin-console` build passed under Node 22.

### 2026-06-06

- Backend Agent finalized lead lifecycle publish rules in `/Users/MacAirEZ/.codex/worktrees/e4cc/projectTobby`.
- Confirmed task creation does not auto-publish to SP; tightened `/leads/from-task` so only PM/PO can explicitly publish task leads, fixed duplicate task-lead update behavior, blocked `/leads` from republishing an already bridged task, and removed a repeated-publish timestamp crash.
- Updated Firestore task selection sync to match API canonical states: selected bid uses `selected` with `ui_status: accepted`, active competing bids move to `rejected`, and unselection restores selected/accepted bids to `submitted`.
- Verification: `npm run test:run -- tests/unit/backend/marketplace.test.js tests/unit/backend/spCreditDataFlow.test.js tests/unit/backend/apiContract.test.js tests/unit/domain/mvpRules.test.js tests/unit/backend/adSlot.test.js` passed 80 tests; `npm run build` passed.
- Full `npm run test:run` still fails in this worktree with 14 non-backend failures: route expectation drift, always-on session timeout test drift, and one `useFirebase` upload mock observer initialization issue.
- Backend Agent stabilized marketplace lead/bid/assignment/credit flow in `/Users/MacAirEZ/.codex/worktrees/e4cc/projectTobby`.
- Added canonical task bid selection fallback coverage, duplicate active bid prevention before credit consumption, and frontend fallback guard so backend `DUPLICATE_BID` cannot be bypassed locally.
- Verified explicit lead publishing, bid submission, selection, assignment transitions, SP credit consumption, free credit refresh, and ad-slot no-Firestore stability with `npm run test:run -- tests/unit/backend/marketplace.test.js tests/unit/backend/spCreditDataFlow.test.js tests/unit/backend/apiContract.test.js tests/unit/domain/mvpRules.test.js tests/unit/backend/adSlot.test.js` passing 77 tests.
- Ran `npm run build` successfully. Full `npm run test:run` still has 14 non-backend failures: route expectation drift, always-on session timeout test drift, and one `useFirebase` upload mock issue.
- Removed the legacy SwiftUI iOS folder `ios/Handout/`.
- Removed obsolete iOS execution plan doc `docs/iOS_APP_EXECUTION_PLAN.md`.
- Updated `docs/AGENT_IO_SCHEMA_SPEC_V01.md` to remove the deleted iOS path reference.
- Verified the repository no longer contains references to the deleted legacy iOS files, except for this tracker and general docs that were updated.
- Archived the deleted legacy SwiftUI iOS files into `trash/legacy-ios/` for reference instead of leaving the old content unrecoverable.
- Verified the archive contains 57 preserved legacy files matching Git HEAD, plus one `README.md` note for the trash folder.

### 2026-06-06 - Coordination Update

- Defined three working agents for this repository: Frontend, iOS, Backend.
- Split the active work queue by owner so tasks are unambiguous.
- Kept this tracker as the shared handoff file for task claims, progress notes, and completion results.

### 2026-06-06 - Frontend Agent

- Reviewed `src/composables/useFirebase.js` and `src/boot/auth-init.js`; current auth observer unsubscribe flow is acceptable, and the active behavior is always-on LOCAL persistence rather than timeout-based session expiry.
- Updated `tests/unit/boot/sessionManager.test.js` to match the current always-on persistence contract (`setLoginTime` clears stale timeout state, session expiry is disabled, remaining time is infinite, formatted label is `Always`).
- Updated `tests/e2e/routes.test.js` to match the current route tree, including `/apply/lease-application/:leaseId?`, `/public/tenant-signup/:leaseId?`, nested authenticated shell routes, and the current create-property page entry.
- Verification: `npm run test:run -- tests/unit/boot/sessionManager.test.js tests/e2e/routes.test.js` passed under Node 22.
- Remaining route work: launch-scope pruning is still open; tests now document the current route map so future trimming can happen intentionally without drifting from externally used public routes.

### 2026-06-06 - iOS Startup Optimization

- Removed the auth startup bottleneck by making `src/boot/auth-init.js` resolve after auth state is known while user hydration continues in the background.
- Deferred Firebase Analytics initialization in `src/boot/firebase.js` and skipped it for native Capacitor launches to reduce mobile startup work.
- Fixed the `waitForAuthenticatedUser` unsubscribe timing bug in `src/composables/useFirebase.js`, which also unblocks file upload flows.
- Verification: `npm run test:run -- tests/unit/boot/sessionManager.test.js tests/unit/composables/useFirebase.test.js` passed after aligning the upload test with an authenticated mock user, and `npm run build` passed with the usual chunk-size warnings only.
- Files changed: `src/boot/auth-init.js`, `src/boot/firebase.js`, `src/composables/useFirebase.js`, `tests/unit/composables/useFirebase.test.js`.

### 2026-06-06 - iOS Agent Capacitor Readiness

- Re-checked the repository state and found no committed `src-capacitor/` native project directory in the workspace snapshot.
- Confirmed only the Quasar `capacitor` config block is present in `quasar.config.js`; Capacitor native readiness still needs a real platform sync before it can be treated as complete.
- Minimum mobile launch surface remains intentionally narrow, but the native shell itself still needs verification before launch planning can rely on it.
- Recommending that the next iOS pass verify actual native platform generation or formally create it before marking readiness complete.

### 2026-06-07 - SP Pricing and Credit Spec

- Defined the SP launch pricing model around a fixed base bid SKU and a permanent starter pack.
- Locked the first-phase behavior to low-friction bid credits, with future expansion via new SKUs rather than repricing the base entry package.
- Added a Stripe-ready purchase/checkout/webhook flow and a server-authoritative credit ledger model in `docs/SP_BID_CREDIT_STRIPE_SPEC_V01.md`.
- Kept PM billing out of phase 1 and kept billing/support boundaries separate from the support inbox spec.

### 2026-06-08 - SP Credit Backend Implementation

- Implemented the backend SP bid credit flow with order creation, Stripe checkout placeholder, provider callback/webhook fulfillment, refund handling, and atomic credit consumption on bid submit.
- Added compatibility for the legacy manual placeholder flow used by validation tests while keeping the launch SKUs as `sp_bid_single` and `sp_bid_starter_10`.
- Aligned ledger history semantics with the current audit model (`adjustment`, `purchase`, `consume`, `refund`) and verified the SP credit flow with `npm run test:run -- tests/unit/backend/spCreditDataFlow.test.js`.
- Updated the SP credits UI and admin billing page earlier in the workstream so the UI now matches the backend credit model and the admin can inspect order/ledger state.

### 2026-06-08 - Stripe Local Env Wiring

- Added local Stripe env wiring for development: frontend publishable key in `.env.local` and backend secret key in `backend/.env.local`.
- Updated `backend/server.js` to load `backend/.env.local` automatically for local API runs.
- Backend checkout creation now uses the Stripe API when `STRIPE_SECRET_KEY` is present, and the webhook path verifies Stripe signatures when `STRIPE_WEBHOOK_SECRET` is configured.
- Live webhook fulfillment still needs `STRIPE_WEBHOOK_SECRET` before the production webhook path can be fully activated end-to-end.

### 2026-06-07 - Frontend Agent SP Credits UI

- Reworked `src/pages/SpCreditsPage.vue` around the launch pricing spec: current balance, available bid count, two purchase cards (`sp_bid_single` and `sp_bid_starter_10`), purchase history, ledger history, and non-upsell FAQ text.
- Updated `src/services/webApiClient.js` `spCreditApi.createOrder()` so the client sends spec-aligned SKU metadata (`sku_code`, `sku_name`, `amount_cents`) and keeps fallback order status at `created`.
- Expanded `admin-console/src/pages/BillingPage.vue` into the required operations surface with SP/date/status filters, clearer order and ledger views, and explicit manual-adjustment guidance.
- Added supporting admin-console presentation styles in `admin-console/src/styles.css`.
- Files changed: `src/pages/SpCreditsPage.vue`, `src/services/webApiClient.js`, `admin-console/src/pages/BillingPage.vue`, `admin-console/src/styles.css`, `AGENT_PROJECT_TRACKER.md`.
- Verification: `npm run build` passed in `/Users/MacAirEZ/Desktop/projectTobby` under Node 22 with the existing Browserslist/chunk-size warnings only; `npm run build` passed in `/Users/MacAirEZ/Desktop/projectTobby/admin-console`.

### 2026-06-06 - iOS Agent Startup + Capacitor Verification

- Read `docs/MOBILE_CAPACITOR_DESIGN_SPEC_V01.md`, `docs/DEVELOPER_AGENT_HANDOFF.md`, `docs/PARALLEL_DEVELOPMENT_EXECUTION_PLAN_V01.md`, and `docs/MVP_SCOPE_FREEZE_V01.md` before implementation.
- Verified the active mobile project in `/Users/MacAirEZ/.codex/worktrees/93aa/projectTobby` includes `src-capacitor/ios/App`, Capacitor config, generated web assets, and iOS `Info.plist` permission strings.
- Reduced native startup blocking by changing `src/boot/auth-init.js` so first auth-state resolution no longer waits for full profile/property hydration.
- Deferred Firebase Analytics loading in `src/boot/firebase.js` and skipped analytics startup for native Capacitor runtime.
- Added authenticated-user waiting before Storage upload operations in `src/composables/useFirebase.js` to avoid upload calls racing Firebase auth restoration.
- Updated focused tests in `tests/unit/boot/sessionManager.test.js` and `tests/unit/composables/useFirebase.test.js`.
- Verification passed: `npm run test:run -- tests/unit/boot/sessionManager.test.js tests/unit/composables/useFirebase.test.js`, `npm run build`, and `npx quasar build -m capacitor -T ios --skip-pkg`.
- Remaining warnings are existing Browserslist/chunk-size warnings only.

### 2026-06-06 - Frontend Agent Route Trim

- Trimmed `src/router/routes.js` to reduce non-launch internal surfaces without breaking existing links by converting lower-priority routes into redirects.
- Downgraded `/sp-cards`, `/sp-documents`, `/sp-messages`, `/sp-projects`, `/sp-payment-method`, `/sp-handout-builder`, `/universal-search`, and `/firebase-test` to redirect into supported launch routes.
- Updated `src/router/index.js` SP allowlist to match the trimmed launch surface.
- Hid the header universal search entry in `src/layouts/MainLayout.vue` so launch navigation does not advertise a deprioritized route.
- Verification: `npm run test:run -- tests/e2e/routes.test.js` passed under Node 22, and `npm run build` passed with existing chunk-size and Browserslist warnings only.

### 2026-06-06 - First-Screen Bundle Split

- Read `AGENT_PROJECT_TRACKER.md` and confirmed the new pending work was first-screen bundle reduction for Frontend and iOS launch paths.
- Added Vite/Rollup `manualChunks` through `quasar.config.js` `extendViteConf`, splitting heavy dependencies into `vendor-vue`, `vendor-firebase`, `vendor-quasar`, `vendor-charts`, `vendor-http`, and `vendor-misc`.
- SPA build observation: main `index` chunk dropped from about 715 KB to about 63 KB; heavy Firebase, Quasar, Vue, Chart, and Axios code now sits in named vendor chunks.
- Capacitor iOS build observation: native `index` chunk dropped from about 724 KB to about 64 KB; `npx quasar build -m capacitor -T ios --skip-pkg` synced iOS successfully.
- Verification passed: `npm run build` and `npx quasar build -m capacitor -T ios --skip-pkg`.
- Remaining warnings are existing Browserslist staleness, the Firebase dynamic/static import warning, and large vendor cache chunks for `vendor-quasar` and `vendor-firebase`.

### 2026-06-14 - PM Mobile Quota Tracking

- Added read-only PM quota tracking to the actual Capacitor mobile Account page rather than the desktop profile surface.
- Mobile Account now calls the existing backend billing APIs for plan summary, usage, and credit balance through `billingApi`; it does not write Firestore and does not expose mobile purchase actions.
- The quota card shows credit balance, AI token usage, storage usage, and property usage with lightweight mobile progress rows aligned to the current app styling.
- Files changed: `src/pages/mobile/MobileAccountPage.vue`, `src/css/mobile.scss`.
- Verification passed under Node 22: `npm run build` and `npx quasar build -m capacitor -T ios --skip-pkg`.
- Remaining warnings are existing Browserslist staleness, Firebase dynamic/static import warning, and large vendor cache chunks.

## Blockers

- None at the moment.

## Notes for Next Agent

- If you pick up a task, update the corresponding row in `Work Queue` first.
- After execution, add a new dated bullet under `Execution Log`.
- If you change project direction, update `Current Focus` so future agents do not drift.
- Keep ownership explicit. If a task touches multiple areas, split it into separate subtasks instead of leaving it ambiguous.
