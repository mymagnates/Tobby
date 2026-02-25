# API Interface Boundary Contract v0.1

Date: 2026-02-16

## Goal
- Define clear server API boundaries for Web and iOS parallel implementation.
- Minimize merge conflicts and behavior drift across 3 developer agents.

## Contract Owner
- Backend Services/API Track owns this contract.
- Web and Mobile tracks are consumers.

## Core API Domains
1. Auth/RBAC
2. Task + Comment
3. Lease-bound Inventory
4. Marketplace + SP Cards
5. Invoice
6. Billing/Credits
7. Reports

## Required APIs (Minimum)

### Auth/RBAC
- `GET /auth/me`
- `GET /auth/permissions`

`GET /auth/me` must include:
- `account_type` (`MANAGER_OWNER` | `SP` | `TT_INVITED`)
- `roles[]`
- `primary_role`
- `property_roles[]` (`property_id`, `role`, `status`)
- `active_property_id`

### Task
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id/status`
- `POST /tasks/:id/comments`

### Lease-bound Inventory
- `POST /leases/:lease_id/inventories` (PM/PO create)
- `GET /inventories/:id`
- `PATCH /inventories/:id/draft` (assigned TT only)
- `POST /inventories/:id/submit`

### Marketplace + SP Cards
- `GET /tasks/:id/recommended-sps`
- `POST /tasks/:id/sp-actions/contact`
- `POST /tasks/:id/sp-actions/quote`
- `POST /tasks/:id/assign-sp`
- `POST /sp-cards`
- `PATCH /sp-cards/:id/note`
- `GET /sp-cards`

### Invoice
- `POST /invoices`
- `POST /invoices/:id/submit`
- `POST /invoices/:id/review`
- `GET /tasks/:id/invoices`

### Billing/Credits
- `GET /billing/profile-summary`
- `GET /billing/usage`
- `GET /billing/credits`
- `POST /billing/upgrade`
- `POST /billing/addon/purchase`
- `GET /billing/history`

### Reports
- `GET /reports/task-status`
- `GET /reports/occupancy-lease`
- `GET /reports/income-expense`
- `GET /reports/annual-tax-finance` (Web required)

## Standard Response Requirements
1. Include `request_id` in all responses.
2. Include structured error:
   - `error_code`
   - `message`
   - `retryable`
3. For gated actions, include:
   - `gate_status`
   - `plan_required` (if blocked)
   - `upgrade_hint` (if blocked)

## Trigger Conditions (Server)
- HTTP: all user actions.
- Event: async post-processing (recommendation refresh, metrics).
- Cron: quota reset and cost aggregation.

## Change Management
1. Any breaking response change requires version bump or compatibility layer.
2. Backend must announce schema changes before Web/Mobile implementation updates.
3. Web and iOS should consume the same field names from `MVP_PAGE_FIELD_SPEC`.
