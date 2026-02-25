# Parallel Development Execution Plan v0.1

Date: 2026-02-16

## Team Split
1. Agent A: Web Improvement
2. Agent B: Mobile (iOS)
3. Agent C: Backend Services/API

## Sprint 1 Priority

### Agent C (Backend) - First Deliverables
1. Auth/permission endpoints
2. Task + inventory APIs
3. Billing profile/usage/credits APIs
4. Marketplace recommended SP + assign + SP cards APIs
5. Invoice create/submit/review APIs

### Agent A (Web) - In Parallel
1. Records + Task Detail right SP panel UI
2. SP Cards management page with private note
3. Profile billing section
4. Annual tax report page and export
5. Integrate gating error handling from backend
6. Implement active property context switch and role-based PM/PO view adaptation

### Agent B (iOS) - In Parallel
1. TT flows:
   - create task
   - lease-bound inventory fill/submit
   - records and profile
2. Profile plan/usage/credit display
3. Reserved Voice Fill entry point in Create form (no active logic yet)
4. Implement account-type entry routing and active-property role context handling

## Dependency Rules
1. Backend API schema is blocking dependency for final integration.
2. Web/Mobile can start with mock contracts matching `API_INTERFACE_BOUNDARY_CONTRACT_V01.md`.
3. Final QA must run against real backend contract before merge.

## Merge Safety
1. Each agent modifies only owned modules.
2. Shared contract files require coordinated update:
   - `MVP_PAGE_FIELD_SPEC.md`
   - `API_INTERFACE_BOUNDARY_CONTRACT_V01.md`
3. No direct business-rule logic in frontend beyond display guards.

## Definition of Done (Per Agent)

### Agent A (Web)
- All target pages complete and connected to backend.
- Billing gates and error states visible and functional.

### Agent B (iOS)
- TT core flows complete and role-scope compliant.
- Profile billing visibility complete.

### Agent C (Backend)
- APIs stable, permission-enforced, and idempotent where needed.
- Audit and error contracts consistent.
