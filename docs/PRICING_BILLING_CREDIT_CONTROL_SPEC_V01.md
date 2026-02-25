# Pricing, Billing, and Credit Control Spec v0.1

Date: 2026-02-16

## 1) Objective
- Add paid feature gating for PM/PO and SP monetization.
- Show subscription and credit status in user profile.
- Enforce server-side feature control logic.

## 2) Plan Matrix (Initial)

### PM/PO Plans
- `Free`: up to 3 properties, voice fill 10/month, basic storage.
- `Pro`: up to 20 properties, voice fill 100/month, advanced reports, video enabled.
- `Growth`: up to 100 properties, voice fill 300/month, larger storage.
- `Enterprise`: custom.

### SP Monetization (Phase 2)
- Featured placement package.
- Lead/contact pack.
- (Optional later) success-fee model.

## 3) Billing Data Model

### 3.1 `subscriptions`
- `subscription_id`
- `account_id`
- `role_type` (pm_po/sp)
- `plan_code` (free/pro/growth/enterprise/etc.)
- `status` (trialing/active/past_due/canceled)
- `start_at`
- `renew_at`
- `cancel_at` (optional)

### 3.2 `usage_counters_monthly`
- `account_id`
- `billing_month` (YYYY-MM)
- `voice_fill_used`
- `properties_used`
- `storage_used_mb`
- `video_upload_used` (count/mb)
- `updated_at`

### 3.3 `credit_wallets`
- `wallet_id`
- `account_id`
- `credit_balance`
- `currency` (or `credit_unit`)
- `updated_at`

### 3.4 `credit_ledger`
- `ledger_id`
- `account_id`
- `change_type` (grant/purchase/consume/refund/expire)
- `amount`
- `source` (voice_fill/addon/adjustment)
- `reference_id`
- `created_at`

## 4) Profile Page Requirements

### 4.1 PM/PO Profile Billing Section
- `current_plan`
- `subscription_status`
- `next_renewal_date`
- `credit_balance`
- usage bars:
  - `properties_used / properties_limit`
  - `voice_fill_used / voice_fill_limit`
  - `storage_used / storage_limit`
- actions:
  - `upgrade_plan`
  - `buy_addon`
  - `view_billing_history`

### 4.2 SP Profile Billing Section
- `featured_package_status`
- `lead_pack_balance` (if applicable)
- `credit_balance`
- actions:
  - `buy_featured`
  - `buy_lead_pack`
  - `view_billing_history`

## 5) Feature Control Logic (Server-Side)

### Principle
- All paywall checks must be enforced in backend service.
- Frontend display is advisory only.

### 5.1 Check Flow
1. Determine account plan + status.
2. Read monthly usage counters.
3. Evaluate entitlement rule.
4. If quota exceeded:
   - deny action with `LIMIT_EXCEEDED`
   - return upgrade/add-on suggestions.

### 5.2 Control Rules
- `property.create`: blocked if property count reaches plan limit.
- `voice_fill.parse`: blocked when monthly voice quota exhausted unless credits available.
- `video.upload`: allowed only when plan has video entitlement.
- `advanced_reports.view`: allowed only in eligible plans.

### 5.3 Credit Fallback
- If quota exhausted and feature supports credit consumption:
  - consume credits atomically
  - allow action
- If insufficient credits:
  - deny and prompt purchase.

## 6) Trigger Conditions

### Real-time (HTTP)
- On each gated action:
  - create property
  - voice parse call
  - video upload
  - advanced report request

### Event-driven
- `subscription.changed`
- `credit.purchased`
- `credit.consumed`
- `usage.counter.incremented`

### Scheduled (Cron)
- monthly reset/rollover of quotas
- credit expiration job (if enabled)
- billing summary aggregation

## 7) API Surface (Suggested)
- `GET /billing/profile-summary`
- `GET /billing/usage`
- `GET /billing/credits`
- `POST /billing/upgrade`
- `POST /billing/addon/purchase`
- `POST /billing/credits/purchase`
- `GET /billing/history`

## 8) Error Codes
- `PLAN_NOT_ELIGIBLE`
- `LIMIT_EXCEEDED`
- `INSUFFICIENT_CREDITS`
- `SUBSCRIPTION_INACTIVE`

## 9) Audit
- Log every billing-gated denial and approval.
- Log every credit mutation with actor and reference id.

