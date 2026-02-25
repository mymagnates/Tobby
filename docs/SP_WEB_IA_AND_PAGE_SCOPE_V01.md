# SP Web IA & Page Scope v0.1

Date: 2026-02-17

## Goal
Define dedicated Web pages for SP (Service Provider) users so SP login has a clear, stable workspace.

## SP Navigation (Web)
1. `Dashboard` (SP dedicated)
2. `Leads`
3. `Bids`
4. `Documents`
5. `Messages` (reserved in MVP)
6. `Projects` (accepted jobs)
7. `Invoices`
8. `Profile`

### Dashboard (SP Dedicated)
- Fast glance for:
  - new leads count
  - bid count
  - total project count
  - bid success rate
- Includes simple historical chart:
  - monthly bids vs accepted projects trend (latest 6 months)
- Includes quick lists:
  - latest leads
  - recent bids

## Mandatory SP Functional Scope

### 1) Leads
- SP can view open leads/opportunities available to current SP account.
- Lead list minimum fields:
  - `lead_id`
  - `task_id`
  - `title`
  - `location`
  - `budget_range`
  - `due_date`
  - `status`
- Primary action:
  - `submit_bid`

### 2) Bids
- SP can view all bids submitted by self.
- Bid list minimum fields:
  - `bid_id`
  - `lead_id`
  - `task_id`
  - `amount`
  - `status` (`submitted`/`selected`/`rejected`/`withdrawn`)
  - `created_at`

### 3) Messages (Reserved)
- Keep menu and route in MVP to stabilize IA.
- Actual messaging thread/send features are phase 2.
- MVP behavior:
  - show placeholder state only
  - no state transitions

### 3.1 Documents
- SP can create and view own documents.
- Minimum fields:
  - `document_id`
  - `name`
  - `category`
  - `project_id` (optional)
  - `document_url` (optional)
  - `note` (optional)
  - `created_at`

### 4) Projects (Accepted)
- SP can view projects/jobs already accepted/assigned.
- Minimum fields:
  - `project_id`
  - `task_id`
  - `title`
  - `location`
  - `status`
  - `accepted_at`

### 5) Invoices
- SP can create invoice draft for own active/accepted project.
- SP can submit invoice.
- Minimum fields:
  - `invoice_id`
  - `project_id` or `task_id`
  - `amount`
  - `status` (`draft`/`submitted`/`changes_requested`/`approved`/`rejected`/`paid`)
  - `updated_at`

## Permission Rules
- SP account should not access PM/PO entity pages by default (`Properties`, `Assets`, `Leases`, etc.).
- SP can access only SP workspace pages plus `Dashboard` and `Profile`.
- Server-side permissions remain source of truth.

## API Mapping (Current Contract)
- Bids and marketplace transitions align with:
  - `docs/MARKETPLACE_STATE_MACHINE_SPEC_V01.md`
- Invoice transitions align with:
  - `docs/INVOICE_APPROVAL_PAYMENT_SPEC_V01.md`
- Endpoints reference:
  - `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md`

## Notes
- This file defines Web IA/page responsibilities only.
- iOS can keep different navigation style but must preserve same scope and state rules.
