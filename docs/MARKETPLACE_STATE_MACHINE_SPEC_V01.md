# Marketplace State Machine Spec v0.1

## Platform Scope
- This state machine specification is shared by Web and iOS.
- State transitions and permission gates must be identical across platforms.

## 1) Goal
- Define lifecycle and state transitions for:
  - Opportunity
  - Proposal (Quote/Contact)
  - Assignment
  - Task collaboration handoff

## 2) Core Entities
- `task_opportunities`
- `sp_proposals`
- `task_assignments`
- `tasks` (existing core domain, referenced only)

## 3) Opportunity State Machine

### States
- `open`
- `paused`
- `assigned`
- `closed`
- `cancelled`

### Transitions
1. `open -> paused` (PM/PO)
2. `paused -> open` (PM/PO)
3. `open -> assigned` (PM/PO selects SP)
4. `assigned -> closed` (task closed/fulfilled)
5. `open|paused -> cancelled` (PM/PO cancels)

### Rules
- Only opportunities in `open` accept new proposals.
- `assigned` opportunity is locked for new proposal submission.

## 4) Proposal State Machine

### Types
- `quote`
- `contact`

### States
- `submitted`
- `withdrawn`
- `shortlisted`
- `selected`
- `rejected`
- `expired`

### Transitions
1. `submitted -> withdrawn` (SP)
2. `submitted -> shortlisted` (PM/PO)
3. `submitted|shortlisted -> selected` (PM/PO)
4. `submitted|shortlisted -> rejected` (PM/PO)
5. `submitted|shortlisted -> expired` (system by TTL)

### Rules
- Only `approved` SP can submit proposals.
- A `selected` proposal must create an assignment.
- By default, one active selected proposal per opportunity.

## 5) Assignment State Machine

### States
- `pending_acceptance`
- `active`
- `declined`
- `revoked`
- `completed`

### Transitions
1. `pending_acceptance -> active` (SP accepts)
2. `pending_acceptance -> declined` (SP declines)
3. `active -> revoked` (PM/PO revokes)
4. `active -> completed` (task completion confirmed)

### Rules
- Only `active` assignment grants SP task permissions:
  - comment on task
  - upload evidence
  - progress status updates (within allowed flow)

## 6) Task Collaboration Guardrails
- Task remains in core domain (`tasks`).
- Marketplace writes by reference (`mx_id` canonical; `task_doc_id` redundant), no deep nesting in task payload.
- Allowed SP task state progression (if assigned active):
  - `assigned -> in_progress -> resolved`
- Final `closed` by PM/PO or TT confirmation rules.

ID field contract for implementation details:
- `docs/MARKETPLACE_ID_CONTRACT_V01.md`

## 7) Event Contract (MVP)
- `opportunity.created`
- `opportunity.updated`
- `proposal.submitted`
- `proposal.selected`
- `assignment.created`
- `assignment.activated`
- `assignment.revoked`
- `task.completed`
- `task.closed`

## 8) Idempotency & Consistency
- All handlers dedupe by `event_id`.
- Assignment creation must be idempotent on `(task_id, sp_id, proposal_id)`.
- On `task.closed`, system force-closes opportunity and expires pending proposals.

## 9) SLA/Timeout Suggestions
- Proposal TTL default: 7 days.
- Assignment acceptance timeout: 24 hours.
- Auto-reminder before expiry for both PM/PO and SP.

## 10) Matching Strategy (Low-Cost AI + Rules)

### Objective
- Avoid rigid fixed category catalog.
- Keep compute cost low while improving semantic matching quality.

### Approach
1. SP onboarding/profile update:
   - Accept free-text service description.
   - Run one-time AI extraction to normalize into `semantic_tags[]`, `service_area`, `budget_band`, `urgency_capability`.
2. Task create/update:
   - Run one-time AI extraction from task text into the same semantic tag schema.
3. Online matching:
   - Use rules/score on structured outputs (no full LLM call per query).
4. Optional re-rank:
   - Only re-rank Top-K candidates (e.g., 20 -> 10) with small model when needed.

### Why this is preferred
- Much cheaper than real-time all-candidate LLM matching.
- Better explainability than pure black-box ranking.
- Keeps marketplace open while preserving recommendation quality.

### Guardrails
- Cache extraction by content hash.
- Recompute only if source text changed.
- Idempotent extraction jobs and retries.
