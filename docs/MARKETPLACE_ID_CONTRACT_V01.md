# Marketplace ID Contract v0.1

Date: 2026-02-26

## Goal
- Prevent lead/bid read-write mismatches across Web, iOS, and backend.
- Define one canonical task linkage key for marketplace.

## Canonical Rule
- `mx_id` is the canonical marketplace task linkage key.
- `task_doc_id` is required as redundant system reference.
- `lead_doc_id` is the only valid Firestore path key when writing/reading bid subcollections.

## Lead Fields (Required)
- `id`: Firestore document id of `marketplace_leads/{id}`.
- `lead_id`: business/public id (can equal `id`, but must not be used as path key).
- `mx_id`: canonical task linkage key.
- `task_id`: compatibility field; must mirror `mx_id`.
- `task_doc_id`: source task Firestore doc id (redundant reference).

## Bid Fields (Required)
- `id`: bid document id in `marketplace_leads/{lead_doc_id}/bids/{id}`.
- `lead_doc_id`: parent lead Firestore document id.
- `lead_id`: business/public lead id copy.
- `mx_id`: task linkage key copied from lead.
- `task_id`: compatibility field (normally same as `mx_id`).
- `task_doc_id`: source task Firestore doc id copy.

## Read/Write Rules
1. Lead lookup by task reference must check in this order:
   - `mx_id`
   - `task_id`
   - `task_doc_id`
2. Bid write path must use `lead_doc_id`/lead `id`.
3. UI list keys must use lead `id` (doc id), not `lead_id`.
4. Sidebars/detail pages should match by `mx_id` first, then compatibility fields.

## API Payload Requirements
- Publish lead from task:
  - Required: `mx_id`
  - Optional but recommended: `task_doc_id`
- Sync lead task status:
  - Required: `mx_id`, `task_status`
  - Optional but recommended: `task_doc_id`

## Backward Compatibility
- Old records missing `mx_id` must still be readable via fallback:
  - `task_id` then `task_doc_id`.
- New writes must always include `mx_id`.

## Non-Negotiable Constraint
- Never build Firestore bid path from `lead_id` unless it is explicitly equal to lead doc `id`.
- Default behavior: always use `lead_doc_id` or lead `id`.
