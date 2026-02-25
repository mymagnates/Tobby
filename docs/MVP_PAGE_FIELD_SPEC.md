# projectTobby Mobile MVP Page Field Spec

## Platform Scope
- This field spec applies to both Web and iOS.
- Field names, validation rules, permission checks, and state-driven behavior must be consistent across platforms.

## Identity and Role Model (Web + iOS)
- Use two-layer role model:
  1. account-level type
  2. property-level role assignments
- Suggested auth payload fields:
  - `account_type` (enum: `MANAGER_OWNER` | `SP` | `TT_INVITED`)
  - `roles[]` (global roles set)
  - `primary_role` (default UI role)
  - `property_roles[]`:
    - `property_id`
    - `role` (`PO` | `PM`)
    - `status`
  - `active_property_id` (client-selected current property context)

## 1) TT Page Field Spec

### 1.1 Dashboard
- `rent_due_date` (date)
- `rent_due_in_days` (number)
- `lease_start_date` (date)
- `lease_end_date` (date)
- `my_tasks_open_count` (number)
- `my_tasks_in_progress_count` (number)
- `my_tasks_resolved_count` (number)
- `latest_payment_amount` (currency)
- `latest_payment_date` (date)
- `latest_receipt_amount` (currency, optional)
- `latest_receipt_date` (date, optional)

### 1.2 Create (Task)
- `task_title` (string, required)
- `task_description` (string, required)
- `task_category` (enum, optional)
- `task_priority` (enum: low/medium/high)
- `property_id` (string, tenant-scope)
- `unit_id` (string, optional)
- `photos[]` (file list, optional)
- `videos[]` (file list, optional)
- `attachments[]` (file list, optional)
- `draft_id` (string, optional)
- Actions:
  - `save_draft`
  - `submit_task`

### 1.3 Inbox
- `message_id` (string)
- `message_type` (enum: task_update/reminder/comment/system)
- `message_title` (string)
- `message_body` (string)
- `linked_task_id` (string, optional)
- `created_at` (datetime)
- `is_read` (boolean)
- Actions:
  - `mark_as_read`
  - `open_detail`

### 1.4 Records

#### My Tasks List
- `task_id`
- `title`
- `status`
- `priority`
- `created_at`
- `updated_at`

#### Task Detail + Comment
- `task_id`
- `task_status`
- `task_timeline[]` (event, actor, timestamp)
- `comments[]` (comment_id, author, content, created_at)
- `new_comment_content` (string)
- Action: `add_comment`

#### Payments/Receipts
- `transaction_id`
- `transaction_type` (payment/receipt)
- `amount`
- `transaction_date`
- `method`
- `status`
- `notes`

#### Lease Info
- `lease_id`
- `start_date`
- `end_date`
- `rent_amount`
- `due_date`

#### Inventory
- `inventory_list_id`
- `lease_id` (required, list is lease-bound)
- `inventory_status` (draft/submitted)
- `created_by_role` (PM/PO expected)
- `updated_at`
- `items_count`
- Action rules:
  - draft: `edit_allowed = true` (for assigned TT only)
  - submitted: `edit_allowed = false`

### 1.5 Profile
- `user_id`
- `name`
- `email`
- `phone`
- `account_type`
- `roles[]`
- `primary_role`
- `property_roles[]`
- `active_property_id`
- `language`
- `notification_settings`
- `plan_code` (if applicable)
- `subscription_status` (if applicable)
- `next_renewal_date` (if applicable)
- `credit_balance` (if applicable)
- `usage_snapshot` (if applicable: voice/properties/storage)
- Action: `sign_out`

## 2) PM/PO Page Field Spec

### 2.1 Dashboard
- `open_tasks_count`
- `overdue_tasks_count`
- `today_reminders_count`
- `expiring_leases_count`
- `overdue_rent_count`
- `monthly_income`
- `monthly_expense`
- `occupancy_rate`
- Quick actions:
  - `create_task`
  - `add_transaction`
  - `create_move_out_inventory`

### 2.2 Create (Unified Entry)

#### Entity Type Selector
- `entity_type` (property/task/asset/reminder/lease/document/transaction/inventory)

#### Common Fields
- `property_id` (when applicable)
- `title` (when applicable)
- `description` (optional)
- `attachments[]` (optional)

#### Task
- `task_id`
- `priority`
- `status`
- `assigned_sp_id` (optional)
- `due_date`

#### Property
- `property_id`
- `name`
- `address`
- `type`
- `status`

#### Asset
- `asset_id`
- `asset_name`
- `category`
- `location`
- `condition`

#### Reminder
- `reminder_id`
- `reminder_title`
- `reminder_date`
- `repeat_rule` (optional)

#### Lease
- `lease_id`
- `tenant_id`
- `start_date`
- `end_date`
- `rent_amount`
- `due_date`

#### Document
- `document_id`
- `document_type`
- `file_url`
- `related_entity_type`
- `related_entity_id`

#### Transaction
- `transaction_id`
- `transaction_type` (income/expense/payment/receipt)
- `amount`
- `date`
- `method`
- `notes`

#### Inventory (Move-out support)
- `inventory_list_id`
- `inventory_type` (move_in/move_out)
- `status` (draft/submitted)
- `items[]`

### 2.3 Inbox
- `message_id`
- `message_type` (assignment/update/reminder/comment/system)
- `title`
- `body`
- `linked_entity_type`
- `linked_entity_id`
- `created_at`
- `is_read`
- Actions:
  - `mark_as_read`
  - `open_related_detail`

### 2.4 Records (Global History)

#### Global Search
- `keyword`
- `entity_type_filter`
- `property_filter`
- `date_range`
- `status_filter`
- `actor_filter` (optional)

#### Search Result Item
- `entity_type`
- `entity_id`
- `title`
- `status`
- `updated_at`
- `property_id`

#### Record Detail
- Full entity fields by type
- `activity_log[]` (action, actor, timestamp)
- CRUD actions by role permission

#### Search SP (inside Records)
- filters:
  - `service_type`
  - `location`
  - `rating_min`
  - `response_time_max`
  - `price_range`
- result fields:
  - `sp_id`
  - `sp_name`
  - `service_types[]`
  - `service_area`
  - `rating`
  - `avg_response_time`
  - `price_band`
- actions:
  - `view_sp_profile`
  - `assign_to_task` (phase 2)

#### Task Detail: Recommended SP Side Panel (Web)
- panel placement: right-side area in task detail view
- fields per recommendation:
  - `task_id`
  - `sp_id`
  - `rank`
  - `match_score`
  - `match_reasons[]`
  - `sp_name`
  - `service_types[]`
  - `service_area`
  - `rating`
  - `avg_response_time`
  - `price_band`
- actions:
  - `contact_sp`
  - `request_quote`
  - `assign_sp`
  - `save_sp_card`
- assignment rule:
  - after successful assignment, other candidate actions are disabled/closed for this task.

#### SP Cards (Independent Page)
- purpose: owner-specific saved SP card management
- fields:
  - `owner_id` (PM/PO user id)
  - `sp_id`
  - `card_snapshot`:
    - `sp_name`
    - `service_types[]`
    - `service_area`
    - `rating`
    - `avg_response_time`
    - `price_band`
  - `owner_note` (private note by PM/PO)
  - `tags[]` (optional)
  - `saved_at`
  - `updated_at`
- actions:
  - `edit_owner_note`
  - `edit_tags`
  - `remove_card`
  - `open_sp_profile`
  - `assign_to_task`
- data rule:
  - saving card creates an owner-scoped card record (snapshot copy), decoupled from live SP profile data.

### 2.5 Reports (4 only)

#### Rent Collection Summary
- `period`
- `rent_due_total`
- `rent_paid_total`
- `rent_overdue_total`

#### Task Status Summary
- `open_count`
- `in_progress_count`
- `resolved_count`
- `overdue_count`

#### Occupancy & Lease Summary
- `occupied_units`
- `vacant_units`
- `expiring_soon_count`

#### Income vs Expense Summary
- `income_total`
- `expense_total`
- `net_total`

### 2.6 Profile
- `user_id`
- `name`
- `email`
- `organization`
- `account_type`
- `roles[]`
- `primary_role`
- `property_roles[]`
- `active_property_id`
- `notification_settings`
- `permission_summary`
- `plan_code`
- `subscription_status`
- `next_renewal_date`
- `credit_balance`
- `usage_snapshot`:
  - `properties_used`
  - `properties_limit`
  - `voice_fill_used`
  - `voice_fill_limit`
  - `storage_used`
  - `storage_limit`
- Action: `sign_out`

## 3) Permission Rules (MVP)

### TT
- `task.create = true`
- `task.comment.create.self = true`
- `task.status.update = false`
- `inventory.draft.create = false` (PO/PM creates lease-bound list)
- `inventory.draft.update.self = true` (assigned list only)
- `inventory.submitted.update.self = false`
- `lease.read.self = true`
- `transaction.read.self = true`

### PM/PO
- CRUD allowed for property/task/asset/reminder/lease/document/transaction/inventory.
- Global history search allowed.
- Reports access allowed.
- Search SP allowed in `Records`.

## 4) Media Policy (MVP Baseline)

- Video upload: `disabled`.
- Task media: images only.
- Image size limit: `<= 1 MB` per image after compression.
- Image count limit: `<= 6` images per task.
- Allowed invoice attachment types: `PDF`, `JPG`, `PNG`.
- Invoice attachment size limit: `<= 5 MB` per file.
- Keep video feature flag in schema/UI for future release, but off in MVP.

## 5) Reserved Interface (Post-MVP)
- Mobile Voice Fill Agent (iOS) reserved.
- Suggested future endpoint:
  - `POST /voice/parse-task`
- Suggested output schema (for form autofill):
  - `title`
  - `description`
  - `priority`
  - `property_id`
  - `unit_id`
  - `due_date`
  - `confidence`

## 6) Paid Feature Control (Server-Enforced)
- Gated actions:
  - `property.create`
  - `voice.parse_task`
  - `video.upload`
  - `reports.advanced.view`
- Gate evaluation requires:
  - active subscription status
  - monthly usage counter check
  - optional credit balance fallback

## 7) Registration Constraints
- Public signup options:
  - `MANAGER_OWNER` (PM/PO UI family)
  - `SP`
- `TT_INVITED` is invite-only and cannot use open registration.
- For manager/owner accounts, role is resolved per property from `property_roles[]`, not a single global PM/PO flag.
