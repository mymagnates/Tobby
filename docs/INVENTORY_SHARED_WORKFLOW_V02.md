# Shared Inventory Workflow V02

Status: shared frontend implemented locally; server integration and release blocked.

## Confirmed Product Rules

- One canonical Inventory List per lease, not separate move-in and move-out lists.
- Property, lease, assigned PM, and primary tenant come from existing records.
- Move-in creates items. Move-out reviews those same active items, retains move-in evidence, and allows additions. Inspections may also add items.
- Both parties may edit unconfirmed items and add item-level notes. Camera/photos belong to an item, including attachments on that item's notes.
- Both parties confirm a complete explicit batch/version once, with signatures and server timestamps. Checking item condition is not a signature.
- Changing a partially signed batch requires a new version and both signatures again; retain earlier signature evidence.
- Notes are an append-only discussion, not modifications to signed evidence.
- Closure is a request until both parties sign its batch. The requester may withdraw; the other party may decline. Never close unilaterally.
- Confirmed snapshots remain immutable. Later changes occur in a new check.

## Shared Frontend

- `src/components/inventory/InventoryWorkspace.vue` owns list, item, batch, notes, closure, and history screens.
- Web: `LeasesPage.vue` -> `LeaseInventoryDialog.vue` -> shared workspace.
- iOS: `InventoryWorkspacePage.vue` wraps the same workspace in QPage.
- Browser tenant confirmation: `/inventory-review/:leaseId` uses the same workspace without PM bottom navigation. The future backend must restrict access to the actual lease participants.
- Web uses a wider responsive container; mobile uses safe-area spacing and Home / Property / Account. Flow and state rules are not forked.
- `src/services/mobileApi.js` is the shared transport with Firebase ID token, X-User-Id, timeout, error propagation, and native HTTPS handling.
- Legacy inventories display read-only on missing workflow endpoints. Move-in, move-out, and key counts are retained; no old record is assumed signed.

## Intended Server Contract (Not Registered)

All routes under `/api/leases/:leaseId/inventory-workflow`:

- GET -> `{ inventory }`, canonical current state or null.
- POST `/commands` -> `{ inventory }`; command includes `expected_revision`.
- GET `/history` -> `{ items }`, immutable batch snapshots.
- GET/POST `/items/:itemId/notes` -> item discussion records.
- Commands: initialize, start, save_item, unchanged, request_close, withdraw_close, reject_close, sign.
- `backend/inventoryWorkflow.js` is a pure reducer tested locally, not a persistence layer or deployed API.

## Required Before Release

1. Obtain explicit authorization for shared backend routes and primary-tenant item photo upload access. Do not bypass the rejected permission review.
2. Resolve canonical lease participants server-side using existing schemas; reject unrelated PMs, co-tenants, and spoofed role headers.
3. Persist current state, immutable snapshots, signatures/digests, and audit records in a single transaction with revision conflicts. Keep one list per lease under concurrent initialization.
4. Preserve legacy key records during migration. Prevent the old inventory PUT endpoint from replacing signed v2 data. Define legacy-client compatibility before deployment.
5. Apply existing quota reservations/commit to item-scoped uploads for both authorized parties. Validate object ownership and metadata, not only a client-supplied HTTPS URL.
6. Make notes append-only, server-timestamped, paginated, and compatible with centralized report/block controls. Verify tenant read-only access outside permitted records.
7. Test two real authenticated sessions: one party signs, the other changes content, stale signing fails, a new batch requires both signatures, and closure cannot occur after only one signature.
8. Verify real iPhone camera/photo selection, upload retry, signed evidence display, offline errors, and native back/navigation.

No hosting/functions/rules deployment, signed archive, or App Store readiness claim is authorized by the current frontend completion.

## Validation and Preview

- 23 focused tests: inventory reducer (14), transport (6), legacy projection (3).
- Targeted ESLint and SPA/Capacitor UI builds passed; Capacitor synced iOS resources. This is not an Xcode native build.
- CUA checked mobile 390x844 and desktop 1280x800 using explicit fixture data, including draft save and historical signature rendering.
- Standalone Playwright script was not run successfully because its browser binary could not be downloaded. Real auth/data and physical-device tests remain open.
- Local fixture server: Node 22 `node tests/mobile-preview/server.mjs`.
- Web fixture: `http://127.0.0.1:9011/web-inventory`; mobile fixture: `http://127.0.0.1:9011/mobile/pm/home`. It is marked "Design fixture - Not live data" and does not write production data.
- Existing Browserslist freshness and Firebase mixed-import warnings remain. They are not compile failures.
