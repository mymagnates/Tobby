# TT Developer Handoff (Tenant)

## Platform Scope
- TT requirements apply to both Web and iOS.
- UI may differ by platform, but fields, permissions, and business rules must remain consistent.

## Role Definition
- `TT = Tenant`
- account type: `TT_INVITED` (invite-only)

## TT MVP Scope (Locked)
1. TT can submit requests/tasks.
2. TT can fill inventory list during move-in (list is created by PO/PM and bound to lease).
3. TT can take/upload photos.
4. TT can view own payment records and own directly related financial records.

## Navigation (TT)
1. `Dashboard`
2. `Create`
3. `Inbox`
4. `Records`
5. `Profile`

## Functional Requirements

### 1) Submit Request (Task)
- TT can create task/request with:
  - title (required)
  - description (required)
  - priority
  - related property/unit (tenant scope)
  - photo attachments
- TT can save draft and submit.
- Task status ownership rule:
  - creator-managed flow (per current scope decision).
- iOS UI reservation:
  - keep a placeholder entry for future `Voice Fill Agent` in Create form (no active logic in MVP).

### 2) Move-in Inventory List
- Inventory list is created by PO/PM and linked to a lease.
- TT can open assigned move-in inventory list and fill/update it.
- Inventory supports draft workflow:
  - `draft`: editable
  - `submitted`: read-only (unless future reopen flow added)
- Inventory item fields:
  - item_name
  - category
  - room/location
  - quantity
  - condition
  - photos[]
  - notes

### 3) Photo Capture / Upload
- TT can capture/upload images for task and inventory.
- MVP media policy:
  - video upload disabled
  - image only
  - max 1 MB per image (after compression)
  - max 6 images per task

### 4) Finance Visibility (Self Scope Only)
- TT can view:
  - own payment records
  - own receipt/financial records directly related to TT account/lease
- TT cannot view other users' financial data.

## Permission Summary (TT)
- `task.create = true`
- `task.read.self = true`
- `task.comment.create.self = true`
- `inventory.draft.create = false` (created by PO/PM)
- `inventory.draft.update.self = true`
- `inventory.submit = true`
- `inventory.submitted.update.self = false`
- `transaction.read.self = true`
- `lease.read.self = true`

## Data Scope Rule
- TT data access is strictly `self-related only`.

## Source Specs
- `docs/MVP_SCOPE_FREEZE_V01.md`
- `docs/MVP_IA_ROLE_SCOPE.md`
- `docs/MVP_PAGE_FIELD_SPEC.md`
