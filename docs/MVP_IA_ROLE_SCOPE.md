# projectTobby Mobile MVP IA + Role Scope

## Platform Scope
- This IA applies to both Web and iOS.
- Navigation layout can differ by platform, but role scope and functional boundaries must stay aligned.

## Account/Role Resolution
- Use account-level UI entry and property-level permission resolution:
  - account-level: `MANAGER_OWNER`, `SP`, `TT_INVITED`
  - property-level: `PO` or `PM` per `property_id`
- For manager/owner users with multiple properties, UI actions must be evaluated by current `active_property_id`.

## 1) Navigation IA

### TT Tabs
1. `Dashboard`
2. `Create`
3. `Inbox`
4. `Records`
5. `Profile`

### PM/PO Tabs
1. `Dashboard`
2. `Create`
3. `Inbox`
4. `Records`
5. `Reports`
6. `Profile`

### SP Tabs
1. `Dashboard`
2. `Leads`
3. `Bids`
4. `Messages` (reserved)
5. `Projects`
6. `Invoices`
7. `Profile`

## 2) Role Scope by Tab

### TT
- `Dashboard`: rent due date, lease start/end, my tasks summary, my payments/receipts snapshot.
- `Create`: create task (text/photo/video), save draft, submit.
- `Inbox`: task updates, reminders, comments (self-related only).
- `Records`: my tasks history, task comments, my payments/receipts, lease info, assigned move-in inventory history.
- `Profile`: account, notifications, sign out.

### PM/PO
- `Dashboard`: portfolio overview, task/reminder alerts, lease/rent alerts, transaction highlights.
- `Create`: unified create entry for property/task/asset/reminder/lease/document/transaction/inventory.
- `Inbox`: assignment updates, task status changes, reminders, team notifications.
- `Records`: independent page for global search and historical data across all entities, editable detail pages.
- `Task Detail`: includes right-side `Recommended SP` panel for contact/quote/assign actions.
- `SP Cards`: independent page for saved SP cards and note management.
- `Reports`: 4 simple reports (see section 5).
- `Profile`: account/org context, settings, billing plan status, usage quota, credit balance, sign out.

### SP
- `Dashboard`: personal workload snapshot.
- `Leads`: browse available leads and submit bids.
- `Bids`: track submitted bids and statuses.
- `Messages`: reserved entry in MVP, no active chat flow yet.
- `Projects`: view accepted/assigned projects.
- `Invoices`: create draft and submit invoice for assigned work.
- `Profile`: account settings and sign out.

## 3) Core Capability Scope

### TT (MVP)
- Can create task.
- Can comment on own-scope tasks.
- Can view own lease dates and rent due date.
- Can view own payment/receipt records.
- Can fill/update `unsubmitted` move-in inventory list draft assigned from PO/PM.
- Cannot edit submitted inventory list.
- Cannot perform PM/PO-level entity CRUD.

### PM/PO (MVP)
- Full CRUD for:
  - `Property`
  - `Task`
  - `Asset`
  - `Reminders`
  - `Lease`
  - `Document`
  - `Transaction`
  - `Inventory List`
- Move-out process support via inventory create/update and revision handling.
- Full historical search across entities.

## 4) Records + Search SP

- `Search SP` is placed inside `Records` (not a standalone tab).
- Entry: top action in `Records` search area.
- Initial filter set:
  - service type
  - location
  - rating
  - response time
  - price range
- Expected action from result:
  - `View Profile`
  - `Assign to Task` (next phase)

## 5) Reports (PM/PO) - MVP 4

1. `Rent Collection Summary`
   - due vs paid vs overdue
2. `Task Status Summary`
   - open / in progress / resolved / overdue
3. `Occupancy & Lease Summary`
   - occupied / vacant / expiring soon
4. `Income vs Expense Summary`
   - monthly inflow vs outflow

## 5.1 Web Additional Report
- Add one Web report for tax preparation:
  - `Annual Tax Finance Report`

## 6) Current Decisions Locked

- PM/PO keeps independent `Inbox` tab.
- `Search SP` is under `Records`.
- TT includes task creation and assigned inventory draft update capability.
- Sign out is integrated in `Profile`.
- Paid features and quota gating are enforced server-side; profile displays plan and credit status.
