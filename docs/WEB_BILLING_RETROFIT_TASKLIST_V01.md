# Web Billing Retrofit Tasklist v0.1

Date: 2026-02-16

## 1) Background
- Current Web implementation does not include complete paid-feature controls.
- Billing/credits must be integrated into existing Web app flows.
- Server-side remains source of truth for all feature gates.

## 2) Retrofit Goals
1. Show billing and credit status in Web Profile.
2. Enforce plan/usage/credit checks across gated Web actions.
3. Provide clear upgrade/add-on UX when blocked.
4. Keep Web behavior aligned with iOS and backend rules.
5. Add account-level and property-level role context support.

## 3) Web Pages/Modules to Update

### 3.1 Profile Page
- Add billing section:
  - current plan
  - subscription status
  - next renewal date
  - credit balance
  - usage bars (properties/voice/storage)
- Add actions:
  - upgrade plan
  - buy add-on
  - billing history
- Add role context section:
  - account type
  - current active property
  - current property role (`PO` or `PM`)

### 3.2 Property Create Flow
- Before create:
  - check `properties_used < properties_limit`
- On exceed:
  - block create
  - show upgrade modal

### 3.2.1 Manager/Owner Role Context
- Add active property switcher in key PM/PO pages.
- All permission checks and page actions must use `active_property_id` + `property_roles`.

### 3.3 Voice Fill Entry (reserved)
- Keep UI slot/entry.
- If called in future:
  - run gate check for voice quota/credits.

### 3.4 Video Upload Controls
- If user not eligible:
  - disable/hide video upload UI
  - show feature locked state.

### 3.5 Reports Page
- Advanced report tabs/exports gated by plan.
- Basic reports remain available per scope.

### 3.6 Marketplace / SP Cards
- If future paid SP features enabled (featured/lead pack):
  - show package status and purchase entry.

## 4) Required Backend Integrations (Web calls)
- `GET /billing/profile-summary`
- `GET /billing/usage`
- `GET /billing/credits`
- `POST /billing/upgrade`
- `POST /billing/addon/purchase`
- `GET /billing/history`

## 5) Frontend Guard Pattern
1. Load billing summary at session start and on profile open.
2. For each gated action:
   - optimistic check in UI
   - execute action request
   - handle backend denial as final authority
3. Handle server errors:
   - `PLAN_NOT_ELIGIBLE`
   - `LIMIT_EXCEEDED`
   - `INSUFFICIENT_CREDITS`
   - `SUBSCRIPTION_INACTIVE`

## 6) UX Requirements
- Never silently fail a gated action.
- Show reason + next action (upgrade/add-on).
- Do not block read access to existing historical data.
- If over limit, block only new/gated actions.

## 7) Acceptance Criteria
1. Web Profile shows accurate plan/usage/credits.
2. Property create is blocked correctly at plan limit.
3. Advanced reports are hidden or blocked for non-eligible plans.
4. Gated action denial messaging is consistent.
5. Server-side gates always override client assumptions.

## 8) Test Checklist (Web)
1. Free user at property limit cannot create new property.
2. Pro user can create until plan limit.
3. Gated report endpoint denied for Free.
4. Profile usage counters update after gated actions.
5. Error-code-specific UI handling works.
6. Same user with multiple properties sees role-correct actions per active property.
