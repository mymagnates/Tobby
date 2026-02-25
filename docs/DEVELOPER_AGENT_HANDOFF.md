# Developer Agent Handoff

## Scope
- All requirements apply to both Web and iOS unless explicitly marked otherwise.
- Keep business rules, field definitions, permissions, and state machines consistent across platforms.
- Existing Web app currently has no full billing/credit controls; Web must be retrofitted across relevant modules.
- Identity model is two-layer:
  - account-level type (`MANAGER_OWNER` / `SP` / `TT_INVITED`)
  - property-level role mapping (`PO`/`PM` per property).

## Read First (Core)
1. `docs/MVP_SCOPE_FREEZE_V01.md`
2. `docs/MVP_IA_ROLE_SCOPE.md`
3. `docs/MVP_PAGE_FIELD_SPEC.md`

## Marketplace + SP
1. `docs/SP_ONBOARDING_VERIFICATION_SPEC_V01.md`
2. `docs/MARKETPLACE_STATE_MACHINE_SPEC_V01.md`
3. `docs/AI_MATCHING_LOW_COST_DESIGN_AND_ESTIMATE_V01.md`
4. `docs/SP_WEB_IA_AND_PAGE_SCOPE_V01.md`

## Invoice + Data Governance
1. `docs/INVOICE_APPROVAL_PAYMENT_SPEC_V01.md`
2. `docs/DATA_GOVERNANCE_NOTE_V01.md`

## Reporting
1. `docs/REPORT_ROLE_FINANCE_MAPPING_V01.md`
2. `docs/WEB_ANNUAL_TAX_REPORT_SPEC_V01.md`

## Parallel Dev Coordination
1. `docs/DEV_WORKSTREAM_SPLIT_MASTER_V01.md`
2. `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md`
3. `docs/PARALLEL_DEVELOPMENT_EXECUTION_PLAN_V01.md`

## Admin
1. `docs/ADMIN_CONSOLE_PRD_V01.md`

## Locked Product Decisions
- Payment flow is out of MVP.
- Disputes/offline incident handling is out of MVP.
- Task status is creator-managed.
- Invoice is SP-managed and field-based (not image-first).
- Move-in inventory list is lease-bound and created by PO/PM; TT fills/updates assigned draft and submits.
- PM/PO can save SP cards into owner-scoped library and write private notes on each card.
- Saved SP card is stored as owner-specific snapshot copy (decoupled from live profile rendering).
- Billing/credits are surfaced in Profile and all paid-feature gating is server-enforced.
- No dedicated notification system in MVP.
- TT is invite-only (`TT_INVITED`) and not open for self-signup.

## Mandatory Web Retrofit
- Developer must update existing Web flows to support plan/usage/credit gating end-to-end.
- Retrofit is not limited to new pages; existing pages/actions must be guarded where applicable.
- Data retained permanently by default; manual deletion request only.
- Support via email and/or in-app communication channel page.
