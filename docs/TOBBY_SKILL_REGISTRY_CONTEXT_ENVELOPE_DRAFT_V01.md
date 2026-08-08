# Tobby Skill Registry and Context Envelope Draft v0.1

Date: 2026-07-20
Status: design-only draft; no runtime integration in this task

## 1. Scope

This document defines a compatible contract for a future Tobby skill registry,
the `tobby_entry_gate`, and a shared context envelope. It is based on:

- `docs/AGENT_SKILL_ARCHITECTURE_SPEC_V01.md`
- `docs/AGENT_CAPABILITY_SPEC_V02.md`
- `docs/AGENT_IO_SCHEMA_SPEC_V02.md`
- `backend/agent/`
- `backend/apiServer.js`

This draft deliberately does not modify backend runtime code, Firestore data,
or frontend code. It is intended to be consumed by the main agent before
runtime integration.

## 2. Architecture Decision

Use one Tobby runtime with a registry and skill modules. Do not introduce
independent sub-agents yet.

```text
HTTP route/auth/rate limit/origin checks
  -> tobby_entry_gate
  -> registered skill
  -> existing API or read service
  -> canonical skill result
  -> UI action or persisted insight
```

The registry is metadata and routing policy. It is not a database schema and
must not cause automatic Firestore migrations.

The canonical envelope is an internal protocol. Each skill adapter maps the
protocol to the current application fields at the boundary.

## 3. Compatibility Rules

### 3.1 Existing fields remain authoritative

The following fields must remain unchanged until a separately approved data
migration is completed:

| Domain | Current fields | Compatibility rule |
| --- | --- | --- |
| Task | `title`, `description`, `task_category`, `task_priority`, `status`, `property_id`, `lease_id`, `unit_id`, `photos`, `videos`, `attachments` | Keep the current task draft shape. Do not replace it with a new `summary` field. |
| Transaction | `property_id`, `transac_type`, `transac_from`, `transac_to`, `amount`, `transac_date`, `note` | Canonical `from`, `to`, and `type` are aliases only; the form/API adapter writes `transac_from`, `transac_to`, and `transac_type`. |
| Asset | `property_id`, `nickname`, `type`, `location`, `location_other`, `brand`, `model`, `serial`, `mfg_date`, `acquired_date`, `notes` | Preserve current form fields and enum values. |
| Reminder | `property_id`, `category`, `start_date`, `due_date`, `repeat_by`, `amount`, `note`, `status` | `repeat_by` remains the current recurrence field. Do not introduce a new recurrence model in this draft. |
| Service | `propertyId`, `selectedServicePropertyIds`, `service_type`, `company_name`, `company_website`, `agent_company`, `agent_name`, `agent_phone`, `agent_email`, `service_start_date`, `term` | Preserve the current camelCase property selection fields at the form boundary. `recurring` is not required by this draft. |
| Task insight | `likely_causes`, `knowledge_points`, `possible_scope_of_work`, `safety_flags`, `regional_price_range`, `recommended_next_step`, `suggest_sp`, `suggested_service_type`, `confidence` | The current runtime schema is authoritative. Older fields such as `issue_summary` and `urgency` must not be reintroduced implicitly. |

### 3.2 Normalization is boundary-only

The registry may use stable canonical names for routing, but adapters must
translate them before calling an existing form or API:

```text
canonical property_id       -> task/transaction/asset/reminder.property_id
canonical property_id       -> service.propertyId
canonical property_ids[]    -> service.selectedServicePropertyIds
canonical transaction.type  -> transac_type
canonical transaction.from  -> transac_from
canonical transaction.to    -> transac_to
canonical reminder.repeat   -> repeat_by
```

No skill may write a canonical alias directly to Firestore unless that alias is
already part of the owning collection's contract.

### 3.3 Property identity

Property matching remains a local rule. The input context may contain a list
of accessible properties. Matching is case-insensitive and may use only:

- nickname
- street number
- street name

The selected property ID is an opaque identifier. Display labels must be
resolved from the supplied property list or by the UI; the model must not be
trusted to invent a property name.

## 4. Canonical Context Envelope

The envelope is the common input to the gate and skills. Fields are grouped by
purpose so future skills can extend the context without changing the base
request shape.

```json
{
  "protocol": "tobby.agent.v1",
  "request_id": "req_123",
  "entry_point": "sidebar",
  "raw_text": "Tenant paid April rent for Oak House",
  "actor": {
    "user_id": "uid_123",
    "role": "pm",
    "account_type": "pm"
  },
  "page": {
    "current_page": "transactions",
    "current_route": "/transactions",
    "visible_entity_type": "transaction",
    "visible_filters": { "date_range": "last_30_days" }
  },
  "selection": {
    "property_id": null,
    "record": { "entity_type": null, "id": null }
  },
  "accessible_properties": [],
  "hints": {
    "transaction_type_options": [],
    "transaction_role_options": [],
    "asset_type_options": [],
    "asset_location_options": [],
    "reminder_category_options": [],
    "reminder_repeat_options": [],
    "service_type_options": []
  },
  "page_data_summary": {},
  "allowed_actions": [],
  "request_options": {
    "refresh": false,
    "dry_run": true
  }
}
```

### 4.1 Envelope rules

- `actor` is authenticated server context, not a client authorization claim.
- `page` and `allowed_actions` are UI hints. Backend authorization remains
  authoritative.
- `accessible_properties` must be limited to properties already authorized for
  the actor. A skill must not use an arbitrary client-supplied property list as
  an access-control source.
- `page_data_summary` contains bounded summaries, not unbounded Firestore
  records. Query and analytics skills should request data through approved
  read tools.
- `request_options.dry_run` means draft/read-only behavior. It must not be
  interpreted as permission to persist data.
- `request_id` is used for logs, idempotency, and model-call tracing.

### 4.2 Current route adapters

The current HTTP routes do not yet accept this full envelope. The first adapter
can map the existing request body as follows:

```text
body.raw_text or body.text -> raw_text
body.context              -> selection, accessible_properties, hints
authenticated actor       -> actor
route caller              -> entry_point
```

This keeps the current `/agent/intake` and `/agent/task-insight` request
formats valid while giving the future runtime one internal shape.

## 5. `tobby_entry_gate`

`tobby_entry_gate` is a low-cost policy and routing skill. It must run before a
model-heavy skill, but after HTTP authentication, origin validation, and rate
limiting.

### 5.1 Responsibilities

1. Validate the envelope shape and input length.
2. Apply deterministic hard rejects for empty, unrelated, or prohibited
   requests.
3. Resolve the candidate capability from the registered skill set.
4. Check entry point, role, required context, and write policy.
5. Decide whether a model call is needed.
6. Return one selected skill or a short rejection/clarification result.

It must not read or write Firestore directly. It must not perform final
property authorization; it can verify that required context exists, while the
selected skill and API enforce access.

### 5.2 Gate input

```json
{
  "envelope": { "protocol": "tobby.agent.v1" },
  "registry_version": "2026-07-20",
  "available_skill_ids": ["create_task_draft", "task_insight"],
  "budget": {
    "max_model_calls": 1,
    "allow_expensive_analysis": false
  }
}
```

### 5.3 Gate output

```json
{
  "gate": "tobby_entry_gate",
  "decision": "route",
  "intent": "create_transaction_draft",
  "skill_id": "create_transaction_draft",
  "confidence": 0.94,
  "needs_clarification": [],
  "reason_code": "transaction_language_detected",
  "model_policy": {
    "call_model": true,
    "model_tier": "standard",
    "max_calls": 1
  },
  "safe_response": null
}
```

Valid decisions:

- `route`: one registered skill may run.
- `clarify`: request a missing product-critical field without calling a large
  model where possible.
- `reject`: return a fixed out-of-scope or policy response.
- `no_op`: greeting or UI event that requires no model call.

### 5.4 Gate precedence

```text
HTTP auth/origin/rate limit
  -> hard reject and prohibited-content checks
  -> deterministic intent matcher
  -> registry eligibility checks
  -> optional small-model disambiguation
  -> selected skill
```

The deterministic matcher must not become a full maintenance classifier. It
only identifies product capabilities and obvious exclusions. The selected
skill remains responsible for domain extraction.

## 6. Skill Registry Contract

Each registry entry describes policy, not implementation details.

```json
{
  "skill_id": "create_transaction_draft",
  "version": "1.0",
  "family": "input",
  "purpose": "Create an editable transaction draft from natural language.",
  "entry_points": ["sidebar", "page_assistant", "fullscreen"],
  "roles": ["pm", "pm_po", "po", "admin", "tt"],
  "required_context": [],
  "optional_context": ["selection.property_id", "hints.transaction_type_options"],
  "allowed_tools": ["property_context_read"],
  "writes_data": false,
  "requires_confirmation": true,
  "output_schema": "DraftResponseV1",
  "cost_tier": "standard",
  "cache_policy": "none",
  "fallback_policy": "deterministic_draft",
  "status": "active"
}
```

### 6.1 Initial registry entries

| Skill ID | Family | Current status | Persistence | Main extension point |
| --- | --- | --- | --- | --- |
| `create_task_draft` | input | active through `form_intake` | no direct write | task form adapter |
| `create_transaction_draft` | input | active through `form_intake` | no direct write | transaction enum/role adapter |
| `create_asset_draft` | input | active through `form_intake` | no direct write | asset type/location adapter |
| `create_reminder_draft` | input | active through `form_intake` | no direct write | reminder category/repeat adapter |
| `create_service_draft` | input | active through `form_intake` | no direct write | service property/role adapter |
| `task_insight` | analysis | active through `task_insight` | existing task insight cache path | task context and price source |
| `find_property` | query | planned | read only | authorized property read service |
| `find_task` | query | planned | read only | bounded task search API |
| `find_transaction` | query | planned | read only | transaction filters and pagination |
| `find_asset` | query | planned | read only | asset filters |
| `find_reminder` | query | planned | read only | due-date filters |
| `find_service` | query | planned | read only | service/property filters |
| `quick_analytics` | analysis | planned | read only | precomputed analytics snapshots |
| `bid_evaluation` | analysis | planned | read only | task insight plus bid read model |
| `navigate_to_page` | navigation | planned | no write | deterministic route/action map |
| `explain_current_page` | navigation | planned | no write | page metadata catalog |

### 6.2 Common output envelope

All skills should return this outer shape internally:

```json
{
  "protocol": "tobby.agent.v1",
  "request_id": "req_123",
  "skill_id": "create_transaction_draft",
  "skill_version": "1.0",
  "status": "ok",
  "data": {},
  "missing_fields": [],
  "warnings": [],
  "confidence": 0.0,
  "provenance": {
    "source": "deterministic|model|hybrid|cache",
    "model_provider": null,
    "model_name": null,
    "generated_at": null
  },
  "ui_action": null
}
```

The existing route response can continue returning its current payload. A
route adapter may unwrap `data` during the migration period.

## 7. Existing Skill Integration

### 7.1 `form_intake`

Current implementation: `backend/agent/skills/formIntake.js`.

Integration contract:

```text
entry gate intent
  -> create_*_draft registry entry
  -> form_intake adapter
  -> local property/enum/business rules
  -> Vertex/Gemini extraction only when needed
  -> current draft payload
  -> existing frontend form
```

Important current behavior to preserve:

- local fallback detects task, transaction, asset, reminder, and service;
- transaction type and service/asset/reminder hints are passed through context;
- service currently uses `propertyId` and `selectedServicePropertyIds`;
- the current implementation may include `recurring` in service output, but the
  new registry does not require it;
- form intake does not directly persist records and should continue opening an
  editable form.

The adapter should eventually normalize model output before returning it. It
must validate property IDs against accessible properties and enum values before
any UI action.

### 7.2 `task_insight`

Current implementation: `backend/agent/skills/taskInsight.js`.

Integration contract:

```text
entry gate intent
  -> task_insight registry entry
  -> task context adapter
  -> cached insight check or explicit refresh
  -> Vertex model call with structured schema
  -> normalizeTaskInsightOutput
  -> existing insight output/cache/UI path
```

Important current behavior to preserve:

- input includes task description, status, report date, property location, and
  the latest bounded comments;
- the prompt explicitly asks about high-level project scope and who can do the
  work, without DIY instructions;
- output currently uses `likely_causes`, `knowledge_points`,
  `possible_scope_of_work`, `safety_flags`, `regional_price_range`,
  `recommended_next_step`, `suggest_sp`, `suggested_service_type`, and
  `confidence`;
- fallback output is marked through `fallback_reason` and must not be treated
  as a successful model insight for caching purposes;
- refresh must bypass the normal cached result and generate again.

The registry should treat task insight as read/analysis behavior even though
the existing application may persist a generated insight cache as part of the
task workflow. The cache write remains a controlled application operation, not
an arbitrary skill write.

## 8. Query, Analysis, and Navigation Extension Points

### Query skills

Query skills should return bounded records or summaries, never raw collection
scans. They require:

- an authorized read tool;
- explicit property/user scope;
- pagination or a hard result limit;
- a stable `data_as_of` timestamp;
- a no-result response that does not call a model again automatically.

### Analysis skills

Analysis skills should consume query results or precomputed snapshots. They
should not independently rediscover Firestore schemas. `quick_analytics` should
prefer fixed chart references and cached aggregates. `bid_evaluation` should
consume a normalized bid read model plus the task's insight data.

### Navigation skills

Navigation must use a deterministic page/action catalog. The model may select
among approved actions, but it must not emit arbitrary URLs, destructive
actions, or write operations. The returned action should be validated against
the registry and current role before the frontend executes it.

## 9. Risks and Open Decisions

1. The current `/agent/intake` route performs coarse maintenance filtering
   before `form_intake`; the entry gate should eventually centralize this policy
   without changing the route's public behavior during migration.
2. Current intake model output is returned directly when parsing succeeds, so a
   shared output envelope is not yet enforced. The first runtime change should
   be an adapter/validator, not a Firestore migration.
3. Service uses a different property field naming convention from the other
   forms. This is a known adapter requirement, not a reason to rename existing
   data now.
4. Role names and service permissions are currently coupled to existing form
   behavior. The registry must be verified against backend authorization before
   adding new roles.
5. `task_insight` currently has a model fallback path. Monitoring must expose
   provider, status, fallback reason, and cache source so generic fallback text
   is not mistaken for model quality.
6. Query and analytics skills need explicit API/read-service contracts before
   they are activated. Registry entries may remain `planned` without exposing
   them to the gate.

## 10. Recommended Integration Order

1. Add a pure-data registry module and validator; keep it out of Firestore.
2. Add a context-envelope adapter around the existing intake and task insight
   route inputs.
3. Add deterministic `tobby_entry_gate` tests for route, clarify, reject, and
   no-op outcomes.
4. Wrap `form_intake` and `task_insight` with registry metadata and the common
   output envelope, preserving their current public route responses.
5. Add query/navigation/analytics skills only after their authorized read APIs
   and action catalogs exist.

## 11. Review Conclusion

This draft is compatible with the current data structures and current agent
modules. It does not require a Firestore migration, frontend changes, or a
separate Firebase Function. The main agent can implement the registry, context
adapter, and entry gate incrementally, then integrate existing skills behind
the new protocol.
