# Reporting Rebuild

Status: Web implementation verified locally; `mkpl` API deployed to `tobbythebutler` on 2026-09-09. Both reporting account-ID fields have all configured indexes verified READY. Hosting and security rules were not deployed.

## Product Scope

| Workspace       | Reports                                               | Scope                                                                                                |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Property        | P&L, Task History, General Ledger                     | One, multiple, or all authorized properties                                                          |
| Owner portfolio | Same property reports                                 | Select `My owned properties`; full property amounts, not ownership-share allocations                 |
| PM account      | PM Account Statement, including management fee income | Current authenticated account across properties, including explicitly attributed historical activity |

Owner and manager share the same property calculation. Property membership controls access; the signup label is not a grant to someone else's properties.

PM statement includes money in/out but is **not a company P&L**. Collected rent, payments for property repairs, advances, deposits and owner remittances are not automatically PM business revenue/expenses. Only explicit management fees received, less fee refunds paid, contribute to known earned fees. Company name is a heading, not an authorization or account-merging key.

## UX

- Reports navigation remains visible for eligible workspace roles even when no records are loaded.
- A property/account switch, property selector and date selector replace the old report catalog.
- Property tabs: P&L, Task History, General Ledger. Owner portfolio is a selection, not a fourth report.
- P&L groups categories; optional property breakdown shows income, expenses and net by property.
- Ledger retains non-operating and unclassified movements. Signed P&L income/expense columns make refund treatment explicit.
- PM statement shows net management fees, total money in and money out, plus individual movements.
- Global workspace property selection is respected via `propertyId` in route query. Select all in the workspace header to build a portfolio report.
- This month and last month cover complete calendar months; year to date ends on the local current day. Custom dates are inclusive and unchanged by refresh.
- Transaction defaults and AI transaction-draft fallbacks use the user's local calendar date, not a UTC ISO slice. Explicitly selected dates and existing records are never silently rewritten.
- A confirmed transaction API save invalidates the current report immediately. The Refresh button also reloads existing selections, including changes made elsewhere.
- Desktop uses one report surface. Narrow screens use compact stacked metrics and a horizontally scrollable table.
- Errors never become fake zero totals. Changing scope clears old rows/export immediately; obsolete responses cannot overwrite the current report.
- CSV carries period, scope, basis, data notes and details. P&L includes the displayed grouped totals and property breakdown. Text cells neutralize spreadsheet formulas.
- No PDF, share-to-owner or chart controls are presented as completed capabilities.

## Authorization

| Property relationship           | Task History | P&L / Ledger | Create transaction |
| ------------------------------- | ------------ | ------------ | ------------------ |
| `owner_user_ids`                | Yes          | Yes          | Yes                |
| `manager_user_ids`              | Yes          | Yes          | Yes                |
| `viewer_user_ids`               | Yes          | No           | No                 |
| Tenant / SP / unrelated account | No           | No           | No                 |

These checks use current property arrays, not stale user role indexes or forged request headers. A view-only owner invitation represented by viewer membership remains task-only.

PM statement requires a PM profile or current manager membership. Queries match `from_account_id` / `to_account_id` to the verified Firebase UID. They may return that account's historical transactions after property access ends, but do not reopen access to the former property's full ledger or tasks.

Nested transaction reads in Firestore rules are also restricted to owner/manager. Direct owner/manager legacy writes still exist elsewhere in the app; this is not a claim that all transaction mutation paths have been migrated to immutable backend accounting.

## Data Contract

Transactions remain under `properties/{propertyId}/transactions/{id}`. Tasks use `properties/{propertyId}/mxrecords/{id}`. No transaction moves or destructive migration are performed.

New Web transaction creation uses the authenticated API, adding:

| Field                                           | Meaning                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `financial_category`                            | Canonical reporting category                                         |
| `from_account_id`, `to_account_id`              | Explicit current manager UID for a PM party; null for non-PM parties |
| `currency`                                      | USD in this release                                                  |
| `property_id`, `property_name`                  | Server-owned path identity and display snapshot                      |
| `created_by`, `created_by_user_id`, role fields | Server-owned actor audit metadata                                    |
| `attribution_version`                           | `1` for this new attribution flow                                    |

The form requires actual manager selection when a party is PM. It never assumes creator = recipient. Property changes clear previous manager selection, including late participant-fetch results.

Categories: `rental_income`, `management_fee`, `maintenance`, `utilities`, `insurance`, `property_tax`, `hoa`, `other_income`, `other_expense`, `security_deposit`, `owner_contribution`, `owner_distribution`, `transfer`, `reimbursement`, `unclassified`.

- P&L income: rental/other income. Expenses: management fee, maintenance, utilities, insurance, property tax, HOA, other expense.
- Deposit, contributions, distributions, transfers and reimbursements are non-operating unless appropriately categorized at source. Do not count both an expense and its reimbursement as new expenses.
- Positive `Refund` amounts reverse their explicit category's property P&L effect. An unclassified refund is not guessed.
- Known legacy types map conservatively: Rent, Deposit, Tax, Insurance, Utility, Maintenance, Labor, HOA. Generic Fee/Refund/Other are flagged; role labels never establish management fee ownership.
- Legacy transactions without actual account IDs do not enter PM account totals. No automatic ID backfill from `created_by`, `pm`, or a company name.
- Invalid dates, unsupported currencies, invalid amounts and duplicate document identities are excluded with notes. Missing dates are never replaced with today.
- Integer-cent aggregation and serialization checks prevent floating-point drift and unsafe monetary totals.
- These are recorded-transaction reports, not double-entry accounting, accrual statements, bank reconciliation, tax advice, ownership-share returns or independently verified records.
- Task History filters by recorded task date, not completion date; completion is displayed separately.

## API

All active endpoints require a verified Firebase bearer token. No fake-data fallback.

| Method | Path                                              | Purpose                                         |
| ------ | ------------------------------------------------- | ----------------------------------------------- | ------ | ----- | ------------------------------------------- |
| GET    | `/api/reports/options`                            | Authorized scopes and current account heading   |
| GET    | `/api/reports/workspace`                          | `type=pnl                                       | ledger | tasks | pm_statement`, `property_ids`, `from`, `to` |
| GET    | `/api/reports/participants?property_id=...`       | Current PM choices for authorized owner/manager |
| POST   | `/api/properties/:propertyId/report-transactions` | Validated transaction creation                  |

PM omitted property scope means all explicitly matched account activity, including former properties. A supplied scope narrows those movements. Other property reports require explicit non-empty selection in the Web client. Backend omitted scope means all currently authorized properties for that report.

The legacy task-status and income-expense URLs now use the same authenticated reporting engine and new envelope. Legacy sample occupancy and annual-tax endpoints return `410 REPORT_RETIRED`; their placeholder data and payment gate are removed. Consumers relying on the old response shapes must migrate.

Guardrails: 100 properties, 5,000 source rows per request. Limits fail visibly, never silently truncate. Reads currently cap the source data before date filtering; selecting a shorter date interval does not bypass that cap. PM historical scope filtering happens after the account query. Larger accounts require paginated/date-indexed reads in a later iteration. The initial options endpoint also has the 100-property cap.

## Verification

Tools: Vitest (domain, adapter, HTTP, component and service tests), ESLint, Quasar/Vite production build, Playwright/Chromium (real Reports Vue + Quasar components with offline API interception).

Commands:

```bash
npx vitest run tests/unit/backend/reporting.test.js tests/unit/backend/reportingAccess.test.js tests/unit/backend/reportingHttp.test.js tests/unit/components/CreateTransactionReporting.test.js tests/unit/services/reportingApi.test.js
npx vitest run tests/unit/backend/apiContract.test.js
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/reporting-visual.mjs
npm run build
```

Current results: 261 tests passed across reporting domain/access/HTTP, API contract, transaction component, report transport and shell title regression tests. Playwright checked 1280/390/320px layouts, PM property scope, CSV download, permission failure/retry, stale response handling and viewer restrictions. The fixture does not test a production Firebase session or the complete authenticated MainLayout.

Screenshots and browser results: `/private/tmp/handout-reporting-qa/`. The fixture is guarded so ordinary navigation cannot initialize production Firebase through it.

Rules regression cases are added in `tests/rules/pmPropertyIsolation.rules.test.js`, but not executed: this machine has no Java runtime. Production Firestore rules/index enforcement and real authenticated read/write are still release gates. No full repository test suite claim is made. Existing Firebase mixed dynamic/static import and Browserslist-age build warnings remain.

## Release Sequence

1. Review unrelated dirty files before release; do not include another agent's incomplete work by accident.
2. Install a compatible Java runtime and run the repository's rules emulator tests, especially viewer financial read denial.
3. Review property membership arrays on representative legacy accounts; do not restore access using stale role-index records as a shortcut.
4. Deploy the transaction account-ID collection-group indexes in `firestore.indexes.json`; wait until ready.
5. Deploy reviewed Firestore rules and the `mkpl` backend function with `reporting.js` and `reportingAccess.js`. No new secret keys are required.
6. With test accounts, create a management fee, verify identical Owner/PM property expense, verify only the named PM's fee income, and check revoked/view-only access plus historical PM activity.
7. Deploy Web hosting only after API/index readiness. Verify authenticated options, each report type, portfolio scope and CSV against known records.
8. Do not bulk assign legacy PM IDs without evidence. A reviewed backfill/correction workflow is a separate task; until then, exclusions remain visible.

## Deployment Follow-Up: Missing API Route

The local Quasar dev server proxies `/api` to the deployed `mkpl` Cloud Run URL by default. Local source changes alone do not update that backend. The user's `/reports` page therefore received `404 NOT_FOUND` from the old server, despite offline UI tests passing.

With explicit user approval, ran:

```bash
npx firebase deploy --only functions:mkpl,firestore:indexes --project tobbythebutler --non-interactive
```

- `mkpl` update succeeded. No Hosting, security rules or other functions were released.
- All four report endpoint probes through `http://localhost:9000/api` now return `401 UNAUTHENTICATED` without a token, not `404`. This proves route availability and the unauthenticated boundary, not authenticated data correctness.
- Report account-ID index definitions were deployed; `from_account_id` and `to_account_id` indexes were subsequently verified READY, including COLLECTION_GROUP scope.
- `/reports` now owns its heading via route metadata; MainLayout no longer duplicates it. Other page headings are preserved.
- The Web service explains a missing API deployment instead of exposing raw `API route not found` text.
- Source changes are available on the local dev server. The updated Web build has not been uploaded to Hosting.
- Firestore rules remain as previously deployed. The local viewer-finance restriction still requires a separately approved rules release and emulator regression; do not treat this API rollout as closing every direct-SDK authorization path.
- Firebase CLI warns that the deployed Node.js 20 runtime is deprecated, with decommissioning on 2026-10-30. Plan a separately tested runtime/dependency upgrade; no runtime change was bundled into this bug fix.

No Git commit/push, iOS build or Android change was performed. Real authenticated report read/write verification remains pending.

## Follow-Up: Newly Created Rent Missing From This Month

Read-only inspection of the reported 2700 rent confirmed a valid `rental_income` record dated 2026-09-10, created during the local evening of September 9. The form used UTC for its default date, while Reports used a local month-to-date cutoff of September 9 despite labeling it `This month`. The former range excluded the rent; a full September calculation over the same two source records returned income 2700, expenses 200 and net 2500. No source transaction was edited.

Fix: shared local-calendar date helpers, full calendar-month bounds, transaction-save invalidation and manual refresh. No backend or Hosting deployment is needed for the current localhost page, and none was performed for this follow-up.

Verification: 219 focused Vitest tests passed under `TZ=America/Chicago`, targeted ESLint and production build passed. Offline Playwright uses Chicago time fixed to the reported evening, verifies a successful transaction-service save refreshes P&L without a page reload, preserves the 2700/200/2500 result and excludes a next-month transaction. Read-only real-data recomputation and mocked-browser verification are distinct from a live authenticated browser write test.
