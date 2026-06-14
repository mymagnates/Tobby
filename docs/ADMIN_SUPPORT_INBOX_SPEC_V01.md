# Admin Support Inbox Spec V01

## Goal

Provide a minimal support workflow for the Handout platform where end users submit issues from the app or web surface, and admin operators handle them inside the existing `admin-console` site.

The support system should be:

- simple
- auditable
- clearly separated from billing logic
- clearly separated from lead/task handling

## Product Boundary

### User-facing support

Users can:

- open a support request
- choose a category
- describe the issue
- attach screenshots or files
- view ticket status
- add follow-up comments if requested

### Admin-facing support

Admins can:

- view and filter tickets
- triage the request
- assign it to an operator
- reply to the user
- request more information
- resolve and close the ticket
- link the ticket to a task, lead, payment, or credit event

Support handling belongs in the admin console, not in the user-facing app.

## Non-goals

Do not build:

- live chat
- AI agent support responses
- a knowledge base
- automatic refund logic
- billing rule editing inside support

Support should remain a lightweight case management surface.

## Ticket Lifecycle

Use a small state machine:

- `open`
  - created by the user
  - waiting for triage
- `triaged`
  - reviewed and categorized
  - ready for assignment or direct work
- `in_progress`
  - being handled
- `waiting_on_user`
  - needs more details from the user
- `resolved`
  - solution identified and communicated
- `closed`
  - fully finished and archived

Optional operational flags:

- `priority`
- `needs_billing_review`
- `needs_backend_fix`
- `needs_frontend_fix`
- `needs_ios_fix`

## Ticket Categories

Start with four categories:

- `account`
- `task_lead`
- `payment_credit`
- `bug`

These categories are enough for launch and map cleanly to the current product areas.

## Data Model

Create a `support_tickets` collection or equivalent admin-visible data source with:

- `id`
- `user_id`
- `user_role`
- `category`
- `subject`
- `description`
- `attachments`
- `status`
- `priority`
- `assigned_to`
- `created_at`
- `updated_at`
- `resolved_at`
- `closed_at`
- `last_response_at`
- `related_entity_type`
- `related_entity_id`
- `admin_notes`

Optional comment log:

- `support_ticket_comments`
  - `ticket_id`
  - `author_type`
  - `author_id`
  - `body`
  - `attachments`
  - `created_at`

## Admin Console Pages

Add a dedicated support surface inside the existing `admin-console` app:

- `/support`
  - inbox list
  - filters
  - status counters
- `/support/:ticketId`
  - ticket detail
  - conversation thread
  - assignment panel
  - resolution actions

Optional sub-panels:

- `Assigned to me`
- `Unassigned`
- `Waiting on user`
- `Needs billing review`

## Admin Console Actions

Minimum actions:

- open ticket detail
- change status
- assign/unassign operator
- add internal note
- send user reply
- request more information
- link to source entity
- close ticket

Recommended quick actions:

- mark as duplicate
- mark as spam
- escalate to backend
- escalate to frontend
- escalate to iOS

## Routing and Navigation

Add a sidebar entry in the admin shell:

- `Support Inbox`

Keep the page style consistent with existing admin pages:

- table-driven list view
- left-side filters
- detail panel or split view
- explicit action buttons

## Permission Model

Only admin-authenticated users may access support inbox pages.

Suggested visibility rules:

- super admin: full access
- operator: read/write assigned and unassigned tickets
- read-only support auditor: read-only access

Do not expose internal notes to end users.

## User Submission Flow

The user-facing app should only provide a submission form and a status page.

Submission fields:

- category
- subject
- description
- optional attachment upload
- optional related entity reference

After submission:

- create ticket
- show confirmation
- route user to ticket status view or support history

## Handling Rules

- support does not change billing state directly
- support may request backend review of billing or credit issues
- support may request frontend or iOS investigation
- support may reference the related task, lead, payment, or credit record
- all actions should be logged

## Acceptance Criteria

- admin console has a support inbox route
- support tickets can be listed and filtered
- support tickets can be assigned and updated
- support replies and internal notes are logged
- support remains separate from billing rule implementation
- user-facing support submission remains simple

## Implementation Notes for the Admin Developer Agent

- Use the existing `admin-console` app as the implementation target. Do not create a separate admin site.
- Keep the first version simple and table-driven.
- Reuse the current admin auth/session guard.
- Reuse existing admin page patterns for filtering and detail layout.
- Do not expand support into billing logic.

## Implementation Result - 2026-06-07

Implemented the first admin support inbox version in the existing `admin-console` app.

Backend additions:

- `POST /support/tickets`
- `GET /support/tickets/:id`
- `GET /admin/support/tickets`
- `GET /admin/support/tickets/:id`
- `POST /admin/support/tickets/:id/update`
- `POST /admin/support/tickets/:id/comment`

Admin console additions:

- `/support`
- `/support/:ticketId`
- Sidebar entry: `Support Inbox`

Implemented admin actions:

- list and filter tickets by status, category, priority, assigned operator, and search text
- open ticket detail
- change status
- assign or unassign an operator
- update priority/category/related entity links
- set operational flags for billing, backend, frontend, and iOS review
- send a user-facing reply
- request more information, which moves the ticket to `waiting_on_user`
- add internal notes that stay admin-only
- resolve or close the ticket

Data sources:

- `support_tickets`
- `support_ticket_comments`

Verification:

- `npx eslint backend/apiServer.js admin-console/src/services/adminApi.js admin-console/src/router/index.js admin-console/src/layouts/AdminShell.vue admin-console/src/pages/SupportInboxPage.vue admin-console/src/styles.css` passed with only the existing CSS config warning.
- `npm run build` passed in `admin-console` under Node 22.

Remaining scope:

- User-facing support UI is not yet implemented; the server submission and status endpoints are in place for a simple form/status page.
- Attachment upload UI is not yet implemented; APIs accept attachment metadata once upload URLs exist.
