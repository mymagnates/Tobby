# AI Credit and Storage Control Spec v0.1

Date: 2026-06-14

## 1) Goal

Provide a simple, server-authoritative quota system that:

- limits AI usage with a credit budget,
- limits file/image storage with a monthly storage budget,
- keeps accounting clear and auditable,
- uses user usage and cost estimates to set safe upper bounds.

This spec is for backend enforcement and billing data design.

## 2) Design Principles

- Keep the model simple enough to explain to users.
- Use one source of truth on the server.
- Treat frontend quota display as advisory only.
- Prefer monthly caps over complex daily or burst throttles for launch.
- Every allowance, denial, and consumption event must be traceable.

## 3) Control Model

### 3.1 AI Usage

- AI usage is controlled by `ai_credit_limit`.
- Each AI request estimates cost before execution.
- If estimated cost fits within remaining budget, the request may proceed.
- After execution, the actual usage is recorded and converted into credits.
- If remaining budget is insufficient, the backend returns a hard denial.

### 3.2 Storage Usage

- Storage is controlled by `storage_limit_mb`.
- Each upload checks the projected increase before accepting the file.
- If the projected total exceeds the limit, the upload is rejected before storage commit.
- If the upload succeeds, the stored bytes are counted against the monthly usage ledger.

## 4) Credit Sizing Method

For each plan or account class:

1. Collect 30-day usage data.
2. Compute median and P75 usage.
3. Estimate unit cost per AI request or per MB stored.
4. Set the cap using:

```text
monthly_cap = max(p50_usage * safety_factor, minimum_floor)
```

- Recommended safety factor: `1.2` to `1.4`
- Minimum floor prevents the cap from being too small for new accounts.
- If cost data is available, keep the cap below the target monthly cost ceiling.

## 5) Suggested Ledger Fields

### 5.1 AI Usage Ledger

- `entry_id`
- `account_id`
- `type` = `ai_consume` | `ai_adjustment` | `ai_refund`
- `estimated_cost`
- `actual_cost`
- `credits_delta`
- `request_id`
- `feature_key`
- `created_at`

### 5.2 Storage Ledger

- `entry_id`
- `account_id`
- `type` = `storage_consume` | `storage_adjustment` | `storage_refund`
- `bytes_delta`
- `mb_delta`
- `request_id`
- `file_path`
- `created_at`

## 6) Server Rules

### 6.1 AI Gate

- Read current monthly AI usage.
- Estimate request cost before model execution.
- Reject when `remaining_credits <= estimated_cost`.
- Return a stable error code such as `LIMIT_EXCEEDED` or `AI_CREDIT_EXHAUSTED`.

### 6.2 Storage Gate

- Read current monthly storage usage.
- Estimate final file size after compression if compression exists.
- Reject before upload if the upload would exceed the limit.
- Return a stable error code such as `LIMIT_EXCEEDED` or `STORAGE_LIMIT_EXCEEDED`.

### 6.3 Rollback Rules

- If an AI request fails before model execution, do not consume credits.
- If a storage upload fails before commit, do not count the file.
- If an upload partially succeeds and is then rolled back, write a refund ledger entry.

## 7) Account States

- `active`: normal usage allowed.
- `warning`: usage above the alert threshold, but still allowed.
- `blocked`: hard limit reached, no further usage allowed until reset or upgrade.

Recommended thresholds:

- `80%` -> warning
- `100%` -> blocked

## 8) API Surface

Suggested backend APIs:

- `GET /billing/profile-summary`
- `GET /billing/usage`
- `GET /billing/credits`
- `POST /billing/upgrade`
- `POST /billing/addon/purchase`
- `POST /billing/credits/purchase`

Suggested runtime gates:

- AI request path
- image/file upload path
- any other paid feature path that consumes credits

## 9) Implementation Notes

- Keep `ai_tokens_limit` and `storage_limit_mb` in the backend billing object.
- Frontend must not decide whether a request is allowed.
- The backend should return both current usage and remaining budget.
- Use explicit, stable error codes and human-readable messages.

## 10) Acceptance

- AI requests stop cleanly when budget is exhausted.
- Storage uploads stop cleanly when quota is exhausted.
- Usage is visible in profile and billing screens.
- The system can explain every rejection with a single backend rule.
