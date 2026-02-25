# Feed Contract V01

## Purpose
Define a single, reusable event contract for Web + iOS Feed so all feed cards are:
- time-ordered summaries
- directly deep-linkable to a concrete detail object
- decoupled from core domain tables

## Scope
Applies to PM/PO feed in MVP.
Entities covered now:
- task
- transaction
- lease
- reminder

## Non-goals
- feed-specific business workflow state
- mutation of core domain object schema
- payment processing logic

## Feed Event Model
Each feed card must map to one `FeedEvent`:

```ts
interface FeedEvent {
  event_id: string
  event_type: string
  entity_type: 'task' | 'transaction' | 'lease' | 'reminder' | 'sp' | 'document' | 'asset'
  entity_id: string
  property_id?: string

  title: string
  summary: string
  actor_label?: string
  occurred_at: string // ISO timestamp

  // client rendering hints
  icon?: string
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'

  // deep link contract
  detail_path: string
  detail_query: {
    openType: string
    openId: string
    propertyId?: string
  }
}
```

## Required Rules
1. `entity_type + entity_id` are mandatory.
2. `detail_query.openType` must match target page resolver.
3. `detail_query.openId` must be concrete object ID (not synthetic label).
4. Feed page only renders items that pass deep-link validation.
5. Feed ordering is `occurred_at DESC`.

## Deep Link Mapping (Current)
- task -> `/mx-records?openType=task&openId={id}`
- transaction -> `/transactions?openType=transaction&openId={id}`
- lease -> `/leases?openType=lease&openId={id}`
- reminder -> `/reminders?openType=reminder&openId={id}`

## Data Source Strategy (MVP)
Current implementation is client-side aggregation from existing stores/collections:
- tasks: `userAccessibleMxRecords`
- transactions: `userAccessibleTransactions`
- leases: `userAccessibleLeases`
- reminders: `properties/{propertyId}/reminders` aggregated across accessible properties

Future target:
- server-side materialized feed collection for lower query cost and consistent pagination.

## UI/UX Behavior
- Feed page shows all events (no property filter on page-level in current mode).
- Feed card contains short summary only.
- `Open Detail` must always open object detail directly.
- If invalid deep link payload is detected, card should not render.

## Error Handling
- If target object is missing/inaccessible on destination page:
  - keep user on destination list
  - show non-blocking warning toast: "Record not found or no access."

## Versioning
- Version: V01
- Backward compatibility: additive fields only.
- Breaking changes require V02 contract doc.
