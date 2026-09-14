# Lease workspace repair

## September 12 follow-up

### Visible ink and stable card actions

- Reproduced the blank signature canvas: during dialog animation its backing
  width became zero while coordinate collection continued. Canvas sizing now
  uses client layout dimensions before every paint and on resize, and redraws
  recorded and in-progress strokes after a size change.
- The shared signature component is used by Web and mobile. Five component tests
  pass; browser fixtures assert nontransparent pixels DURING mouse and simulated
  touch drawing, rather than only accepting a saved coordinate array.
- Lease card View/Inventory actions now occupy a dedicated fixed-width grid row;
  tenant/share context reserves its own height. Removed card hover translation.
  Browser checks compare View geometry before and after opening/closing details.
- Web and Capacitor builds/sync passed. No Hosting/API deployment or physical
  device install was performed; real device touch acceptance remains manual.

### Signature input and persistence repair

- Added explicit trackpad no-holding mode: click to begin a stroke, move the
  pointer, click/Escape to finish. Leaving the canvas ends the stroke. Normal
  press-drag and touch input remain available. Four signature component tests
  and desktop/narrow browser fixtures cover input, undo and reset behavior.
- Signed workflow data previously passed nested coordinate arrays directly to
  Firestore Standard, which does not permit nested array values. The previous
  in-memory service tests did not model that storage restriction.
- Inventory storage now serializes strokes_json at the persistence boundary and
  restores strokes arrays in API responses, including signed history. It does
  not change coordinates, participant audit fields or signed content digests.
- Service tests now reject nested-array writes; round-trip compatibility tests
  cover both workflow and history. All 335 backend tests passed. Resource errors
  now log request ID, resource and error code/name, never signature/body content.
- No production signature is submitted by the agent. User retry remains the
  final authenticated confirmation check after the API deployment.

### Embedded inventory and inline signatures

- Web Dashboard and Lease entries now navigate to /inventory/:leaseId? under the
  existing MainLayout/Index shell, rather than a full-screen inventory modal.
  The upper-right Close action returns to Home or Leases; unsaved edits are guarded.
- The shared Web/mobile main list contains signature status and signing actions.
  The separate review-and-sign page and Continue step are removed. Historical
  signed versions remain available as read-only details.
- Compact room groups show item condition, notes, photos and closure requests.
  A top Signatures shortcut scrolls to the agreement section without another page.
- Desktop signature pad is wider/taller and supports Undo last stroke and Clear.
  Pointer capture, parent model resets and readonly protection are tested.
- 39 focused tests and 1280px/390px browser fixture checks passed. Real logged-in
  local browser read checks confirmed the main application toolbar, existing lease
  inventory, both signing actions and Close returning to Leases. No real signatures
  or inventory writes were submitted. Web/Capacitor builds passed; no Hosting/API
  deployment or physical-device installation is included in this change.

### Tenant signing without account activation

- Web and Capacitor use the same InventoryWorkspace and command API. A resolved
  lease tenant profile is sufficient; registration/invitation is not required.
- The PM can hand the device to the named tenant using "Tenant signs on this
  device". The dialog identifies the signer and requires signature/consent.
- Assisted signatures store tenant_profile_id, captured_by, capture_method and
  signer name; user_id is null rather than falsely claiming a tenant login.
  Authenticated tenant signing remains available through the existing account.
- Signing context is frozen for the batch. Subsequent account activation does
  not change the content digest; edits still invalidate the signatures.
- Single active/explicit primary tenant resolution is automatic. Multiple active
  tenants with no primary are not guessed; signer selection for that case remains
  a follow-up rather than silently attributing a signature to the wrong tenant.
- 333 backend tests, targeted ESLint, Web build and Capacitor build/sync passed.
  Browser fixtures at 1280px and 390px verified the no-account signing dialog.
  These are fixture checks, not real tenant signatures or physical-device tests.

### Simplified list-level agreement

- Main flow: Add items, either party edits/adds, Continue, each party signs the
  entire list once. Add item and Continue are at the top of the list, not fixed
  over the bottom rows. Saving an item returns to the list.
- No check-type selection, checked/pending tabs or per-item checking requirement
  in the new flow. Condition is optional descriptive information.
- New drafts include all active items and preserve prior confirmed descriptions,
  photos and conditions. A list signature rejects omitted active items.
- Editing after one signature invalidates it and advances the version. Editing
  after both signatures starts a new list revision; history stays unchanged.
- Historical check-mode contracts remain readable and compatible. Resuming an
  old unfinished check upgrades it to full-list scope before signing.
- 331 backend tests passed. Browser fixtures passed adding items, returning to
  the list, top Continue placement and whole-list signing availability without
  per-item checks at desktop and phone widths. No real signatures were submitted.

- Lease cards open Inventory directly, without a legacy inventory fetch first.
- Dashboard has Inventory List immediately after Lease, opening a searchable,
  property-scoped lease picker. Returning from a list restores the picker.
- Inventory overrides the old global 720px dialog limit and hidden overflow.
  Its dedicated scroll container fills the viewport, with bottom clearance for
  fixed actions. Desktop items use two columns; narrow screens use one column.
- Backend resolves tenant profile IDs to accepted account IDs automatically.
  A single active lease tenant can be resolved without an explicit primary flag.
  Empty inventory participant slots are refreshed on reads, not just writes.
  Ambiguous tenants are not guessed, and archived tenants are excluded.
- Account activation is no longer required for on-device signing (see above).
- Full backend suite: 328 passed. Browser fixture checks Dashboard/card entry points,
  full width and scrolling through 40 items at 1280px and 390px passed.

## Implemented

- Tenant creation no longer requires nonexistent lease date/rent fields. Property,
  name and contact validation remain. Tenant records link to a lease optionally.
- Lease detail exposes start/end dates. Tenant detail reads lease dates, agreed
  rent and required deposit from the selected lease rather than duplicate fields.
- Lease detail and Documents/Inventory dialogs use readable actions, responsive
  widths, wrapping titles and accessible scrolling. Local dialog overrides prevent
  legacy global CSS from forcing white icons onto white headers.
- Home includes Lease after Document. Property sections have scoped create actions;
  the task form keeps its selected property instead of showing an empty selector.
- Deposit API errors distinguish missing resources from undeployed routes.
- Inventory workflow GET, commands and history routes use verified identity,
  current PM membership or linked tenant identity, assigned participants,
  Firestore transactions, expected revisions and immutable confirmed batch history.
  A replacement tenant cannot access the previous tenant's inventory. Participant
  changes fail closed and need a separate handover workflow.
- Legacy inventory remains in its original document. Initialization preserves
  custom items and key/access records as unsigned reference information.

## Verification

- Full backend suite: 325 passed. Two marketplace fixture dates were made relative
  because their hard-coded August expiry dates had become invalid; business logic
  was not changed.
- Tenant/property-entry/deposit client suites: 23 passed.
- Final inventory suites after preserving key records: 19 passed.
- Targeted ESLint and Web production build passed.
- Playwright uses real Vue components with simulated authentication and data:
  seven property actions, Home Lease action, Lease detail, Documents and Inventory
  at 1280px and 390px; verifies the end-date section can be scrolled into view.
- Deployed API probes without credentials return 401 rather than route-not-found
  for deposit, inventory workflow and inventory history.

## Release scope and remaining acceptance

- Authorized deployment: Firebase mkpl only. No Hosting, rules or indexes.
- mkpl also includes the preceding pending canonical comments and upload retry
  changes, covered by the backend suite.
- No real tenant, deposit or inventory writes were performed for verification.
  Authenticated PM/tenant cross-account and physical-device acceptance remain.
- Existing storage reservation endpoints are PM-only; tenant photo uploads need
  a separate lease-scoped authorization path. Do not broaden generic storage
  permissions to solve that follow-up.
- Web UI is updated locally and built, not published to Hosting. No iOS binary
  was installed and no Git commit/push was requested in this repair.
- Firebase warned that Node 20 requires an upcoming runtime upgrade; this repair
  intentionally does not combine that infrastructure migration with the API fix.
