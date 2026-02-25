# Invoice Approval + Payment Spec v0.1

## Platform Scope
- Invoice lifecycle and validation rules are shared by Web and iOS.
- Any platform-specific UI behavior must not change invoice state rules.

## 1) Goal
- Allow SP to create invoice inside platform for assigned tasks.
- Auto-attach invoice to task by `task_id`.
- Enable PM/PO approval workflow and payment tracking.

## 2) Scope (MVP)
- Invoice create/edit/submit by SP
- Review actions by PM/PO: approve/reject/request_changes
- Payment status tracking (manual mark paid for MVP)
- Audit logging

## 3) Data Model (New Domain)

### 3.1 `invoices`
- `invoice_id` (PK)
- `task_id` (FK to core `tasks`)
- `opportunity_id` (optional FK)
- `assignment_id` (FK)
- `sp_id` (FK)
- `owner_id` (PM/PO user id)
- `currency`
- `subtotal`
- `tax`
- `discount` (optional)
- `total`
- `status` (draft/submitted/changes_requested/approved/rejected/paid)
- `due_date` (optional)
- `notes`
- `submitted_at`, `approved_at`, `paid_at`
- `created_at`, `updated_at`

### 3.2 `invoice_line_items`
- `line_item_id` (PK)
- `invoice_id` (FK)
- `description`
- `quantity`
- `unit_price`
- `amount`
- `category` (labor/material/other)

### 3.3 `invoice_attachments`
- `attachment_id` (PK)
- `invoice_id` (FK)
- `file_url`
- `file_type`
- `uploaded_by`
- `created_at`

### 3.4 `invoice_reviews`
- `review_id` (PK)
- `invoice_id` (FK)
- `action` (approve/reject/request_changes)
- `comment`
- `acted_by`
- `created_at`

## 4) Invoice State Machine

### States
- `draft`
- `submitted`
- `changes_requested`
- `approved`
- `rejected`
- `paid`

### Transitions
1. `draft -> submitted` (SP)
2. `submitted -> changes_requested` (PM/PO)
3. `changes_requested -> submitted` (SP resubmit)
4. `submitted -> approved` (PM/PO)
5. `submitted|changes_requested -> rejected` (PM/PO)
6. `approved -> paid` (PM/PO finance action)

### Rules
- Only active assignee SP can submit invoice.
- Invoice must reference valid `task_id`.
- Rejected invoice becomes read-only (MVP).

## 5) Auto-Attach to Task
- On invoice creation, write relation record to task document relation index:
  - `task_invoice_links(task_id, invoice_id, linked_at)`
- Task detail UI reads by `task_id` and shows invoices tab.
- No deep invoice payload nesting inside task object.

## 6) Validation Rules
- `line_items` required for submission.
- `total = subtotal + tax - discount` server-validated.
- Currency immutable after submission.
- Cannot submit invoice for closed/cancelled assignment.
- Attachment types limited to: `PDF`, `JPG`, `PNG`.
- Attachment size limit: `<= 5 MB` per file.

## 7) Permissions

### SP
- create/edit own `draft`
- submit invoice for own active assignment
- view own invoices

### PM/PO
- view all invoices in scope
- approve/reject/request changes
- mark `paid`

## 8) Events
- `invoice.created`
- `invoice.submitted`
- `invoice.changes_requested`
- `invoice.approved`
- `invoice.rejected`
- `invoice.paid`
- `task.invoice_linked`

## 9) Notifications
- SP notified on: changes requested, approved, rejected, paid.
- PM/PO notified on: invoice submitted, resubmitted.

## 10) Audit & Idempotency
- Every state transition logs actor + timestamp.
- Handlers dedupe by `event_id`.
- Linking handler idempotent on `(task_id, invoice_id)`.
