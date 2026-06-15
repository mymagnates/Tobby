# AI Credit and Storage UI Spec v0.1

Date: 2026-06-14

## 1) Goal

Present AI usage and storage usage in a way that is easy to understand, but keep enforcement on the backend.

## 2) Scope

- User profile billing/quota display.
- Warning states when usage nears the limit.
- Simple purchase or upgrade entry points only when the product phase allows them.
- No client-side enforcement logic.

## 3) UI Requirements

### 3.1 Profile Quota Cards

Show two clear cards:

- `AI Tokens`
- `Storage`

Each card should display:

- used amount,
- limit,
- percentage or progress bar,
- remaining amount,
- status color:
  - normal
  - warning
  - blocked

### 3.2 Primary Action

When the product phase allows it, provide a single action per quota type:

- `Buy Tokens`
- `Buy +20GB`

If the phase is PM-only or pricing is hidden, hide the action buttons and keep display only.

### 3.3 Messaging

Use stable, user-facing language:

- `left this month`
- `used`
- `limit reached`
- `upgrade required`

Avoid exposing internal cost formulas or backend ledger details.

## 4) State Mapping

### 4.1 Normal

- usage < 80%
- progress bar uses the primary color

### 4.2 Warning

- usage >= 80% and < 100%
- progress bar uses warning color
- show a short hint that the limit is nearing

### 4.3 Blocked

- usage >= 100%
- progress bar uses negative color
- show a hard stop message from the backend

## 5) Data Sources

Use backend values only:

- `ai_tokens_used`
- `ai_tokens_limit`
- `storage_used_mb`
- `storage_limit_mb`
- `subscription_status`
- `gate_status`

Fallback to `0` only when the API is unavailable.

## 6) Existing Files to Update

- [`src/pages/UserProfilePage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/UserProfilePage.vue)
- [`src/services/webApiClient.js`](/Users/MacAirEZ/Desktop/projectTobby/src/services/webApiClient.js)
- [`backend/apiServer.js`](/Users/MacAirEZ/Desktop/projectTobby/backend/apiServer.js)
- [`backend/store.js`](/Users/MacAirEZ/Desktop/projectTobby/backend/store.js)

## 7) Acceptance

- Quota display is easy to read.
- Users can see remaining AI and storage capacity.
- No frontend-only logic determines whether usage is allowed.
- The UI can be used on both web and mobile without changing the rule set.
