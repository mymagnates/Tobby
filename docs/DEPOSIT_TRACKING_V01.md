# Property / Lease Deposit Tracking v0.1

Updated: 2026-09-10. Local implementation; new deposit API and Web Hosting are not deployed.

## Product Scope

- Deposits belong to a property and are tracked per lease. `lease.deposit` remains the agreement's required amount, never proof of receipt.
- Lease details show required, received, refunded, deducted, held balance, status and immutable action history.
- Property page: header more menu (`...`) > **Deposits** opens all lease balances, status/search filters, CSV and unlinked transactions. There is no new top-level report.
- Current property owners and managers can read and record actions. View-only members, tenants and unrelated accounts cannot use deposit APIs. Global PM role alone grants no property access.
- No automatic payout, bank integration, tax filing, legal deduction determination or automated settlement.

## Actions And Balance

`held balance = received - refunded - deducted`, with corrections applied as inverse entries.

| Action | Behavior |
| --- | --- |
| Receipt | Record money actually received outside Handout; increase held balance. |
| Refund | Record a completed external refund; decrease held balance; never send money. |
| Deduction | Record an agreed allocation to rent, repair or other purpose; decrease held balance. Requires separate-accounting acknowledgement. |
| Reversal | Append an inverse entry; keep the original and correction marker. An entry can be reversed once. |
| Settle | Require zero held balance plus explicit reconciliation confirmation. |
| Reopen | Reopen a settled account with a date and reason before further actions. |

All actions require an effective date and description/reference. Amounts are positive USD with two-decimal precision. The server uses integer cents, checks resulting totals and rejects overdrawing or reversing already-used receipts. A lease becoming Expired, Terminated or Archived does not change its deposit balance; it signals pending settlement instead.

## Existing Transactions

- No automatic migration or assumption that an agreed deposit was collected.
- Property Deposits lists unlinked `security_deposit` transactions and uncategorized legacy `Deposit` transactions.
- Explicit `Deposit` receipts and `Refund` transactions categorized as deposits can be linked to a lease after review. Link receipts before refunds so sufficient held funds exist.
- Linking copies the original amount/date to the deposit ledger without creating another financial transaction. Invalid amounts/dates, non-USD and ambiguous direction require correction/review first.
- One source transaction can be actively linked once across all leases of a property.
- Reversing an imported entry removes its lease association, not the original cash transaction. It reappears as unlinked and can be assigned to the correct lease, provided the reversal does not overdraw the original lease.
- Generic Create Transaction remains available, but warns that deposit transactions must be linked from Property Deposits to affect lease balances.

## Reports And Accounting Boundary

- New receipt/refund/deduction/reversal actions are mirrored to the property's General Ledger with `financial_category: security_deposit`, `deposit_entry_id` and the lease ID. Imports and import-association reversals do not create mirrors.
- These deposit movements do not enter P&L. A deduction is a deposit allocation, not automatically rental income or repair compensation. Any appropriate P&L entry must be handled separately without double-counting existing entries.
- PM account statements still require explicit from/to account identity. Deposit tracking does not guess the actual funds holder or bank payee and does not automatically populate those identities.
- This is an operational deposit subledger, not a complete double-entry trust-accounting or jurisdiction-specific compliance system.

## Backend And Integrity

Endpoints:

```text
GET  /api/properties/:propertyId/deposits
GET  /api/properties/:propertyId/leases/:leaseId/deposit
POST /api/properties/:propertyId/leases/:leaseId/deposit/entries
```

Private canonical paths:

```text
property_deposits/{propertyId}/accounts/{leaseId}
property_deposits/{propertyId}/entries/{operationId}
property_deposits/{propertyId}/sources/{transactionId}
property_deposits/{propertyId}/reversals/{originalEntryId}
```

- Existing top-level Firestore deny rules block client access to these collections; no new rules/index changes are required for this feature.
- Every write rechecks authenticated property membership and lease ownership inside a Firestore transaction. It atomically updates account balance/version, immutable entry, deduplication markers and any financial mirror.
- `expected_version` prevents competing writes against stale balances. `operation_id` plus content fingerprint prevents duplicate retries or ID reuse with different content.
- Client retries retain the same payload/version/operation ID after an unknown result. Inputs lock until the same operation is retried or refresh confirms it in history. Request timeout covers authentication and network waits.
- Reloading/navigating away discards the in-memory pending form. Users must check ledger history before manually entering the same payment again; no background automatic retry is scheduled.
- Lease reads use a consistent read transaction. Property summaries fail explicitly rather than silently truncate beyond 200 leases/accounts or 5,000 transactions/source markers; lease history currently has a 1,000-entry read limit. Pagination is future work.
- Existing legacy client financial write paths are unchanged. Canonical deposit records are backend-only, but legacy transactions and General Ledger mirrors remain subject to existing transaction editing rules. Full immutable financial-ledger migration is outside this feature.

## Files

- Backend: `backend/deposits.js`; routes in `backend/apiServer.js`.
- UI: `src/components/deposits/DepositWorkspace.vue`; Lease and Property page integrations.
- Client: `src/services/depositApi.js`, `src/utils/depositAccess.js`.
- Regression tests: `tests/unit/backend/deposits.test.js`, `tests/unit/services/depositApi.test.js`, deposit routes in `reportingHttp.test.js`.
- Isolated browser QA: `tests/deposits-visual.mjs` and guarded `tests/visual/deposits.*` fixture. Intercepts all financial requests; no real account or production data changes.

## Verification / Release Gates

- Focused backend/reporting/client/component suite: 289 tests passed (7 files).
- Targeted ESLint passed. SPA build succeeded; existing Firebase import/chunk and stale Browserslist warnings remain.
- Playwright real-component isolated checks passed: CSV, receipt, deduction, over-refund rejection, refund, settlement, reopen, lost-response retry and refresh, failed-read state, and 1280/390/320px layouts. Screenshots inspected in `/private/tmp/handout-deposit-qa/`.
- Added direct-client canonical-deposit denial tests under `tests/rules/pmPropertyIsolation.rules.test.js`; not executed because the local Java/emulator prerequisite is unavailable.
- New deposit API is not yet deployed. The current localhost proxy targets the remote backend and displays a deployment-required message until that API is published.
- Production Firebase transaction behavior and a controlled authenticated receipt/refund round trip remain release checks; no production financial test entries were created.
- Do not deploy Hosting, rules, indexes or unrelated mobile/inventory work as part of deposit delivery without explicit authorization. Review the complete current `mkpl` source before any function deployment because the working tree contains concurrent feature work.
