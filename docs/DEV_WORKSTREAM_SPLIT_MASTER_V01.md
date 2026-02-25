# Development Workstream Split Master v0.1

Date: 2026-02-16

## Objective
- Split development into 3 parallel tracks for 3 developer agents.
- Prevent conflicts with clear ownership, API contracts, and dependency boundaries.

## Workstreams
1. Web Improvement Track
2. Mobile (iOS) Track
3. Backend Services/API Track

## Ownership Rules
- UI changes:
  - Web Track owns Web UI/UX and Web routing changes.
  - Mobile Track owns iOS UI/UX and iOS navigation changes.
- Business logic and permission gates:
  - Backend Track owns all server-side rules and enforcement.
- Shared contracts:
  - Backend Track publishes API schema.
  - Web/Mobile consume contracts; no ad-hoc field drift.

## Source Documents by Track

### 1) Web Improvement Track
- `docs/WEB_BILLING_RETROFIT_TASKLIST_V01.md`
- `docs/WEB_TASK_RECOMMENDED_SP_AND_CARDS_FLOW_V01.md`
- `docs/WEB_ANNUAL_TAX_REPORT_SPEC_V01.md`
- `docs/REPORT_ROLE_FINANCE_MAPPING_V01.md`

### 2) Mobile (iOS) Track
- `docs/TT_DEVELOPER_HANDOFF.md`
- `docs/MVP_IA_ROLE_SCOPE.md`
- `docs/MVP_PAGE_FIELD_SPEC.md`

### 3) Backend Services/API Track
- `docs/MCP_API_READINESS_SPEC_V01.md`
- `docs/PRICING_BILLING_CREDIT_CONTROL_SPEC_V01.md`
- `docs/MARKETPLACE_STATE_MACHINE_SPEC_V01.md`
- `docs/INVOICE_APPROVAL_PAYMENT_SPEC_V01.md`
- `docs/SP_ONBOARDING_VERIFICATION_SPEC_V01.md`
- `docs/AI_MATCHING_LOW_COST_DESIGN_AND_ESTIMATE_V01.md`

## Shared Baseline (All Tracks)
- `docs/MVP_SCOPE_FREEZE_V01.md`
- `docs/DEVELOPER_AGENT_HANDOFF.md`
- `docs/MVP_IA_ROLE_SCOPE.md`
- `docs/MVP_PAGE_FIELD_SPEC.md`

## No-Conflict Rules
1. Backend returns are the source of truth for:
   - permission outcomes
   - quota/billing gate status
   - state transitions
2. Web/Mobile must not implement independent business rules that diverge from backend.
3. Any schema change requires updating shared field spec first.
4. Track-level PRs should avoid editing files owned by another track unless via agreed contract update.

