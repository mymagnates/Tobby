# Agent Capability Spec v0.2

Date: 2026-04-21

## 1) Objective
- Define a constrained Gemini-based agent for structured in-product actions.
- Support natural-language draft creation for existing web entities.
- Keep all persistence behind existing forms and backend APIs.
- Add task-level issue understanding without providing DIY repair instructions.

## 2) Supported Entity Intakes
The agent can convert natural language into draft records for:
- `task`
- `transaction`
- `asset`
- `reminder`
- `service`

The agent can also provide a read-only task analysis capability:
- `task_insight`

## 3) Operating Principle
The agent is not a free-form assistant. It is a constrained router with four stages:

1. `intent_detect`
- Identify which whitelisted entity or capability the user is asking for.

2. `local_rules`
- Resolve property from current user property list.
- Match enums and fixed business rules locally.
- Apply permission checks.

3. `gemini_extraction`
- Extract only fields that local rules cannot determine reliably.

4. `ui_action`
- Open an existing form with draft values.
- Or render a read-only analysis panel for `task_insight`.

## 4) Capability List

### 4.1 `create_task_draft`
- Purpose: Draft a maintenance task from natural language.
- Output: draft task payload plus missing fields.
- UI action: open task form.

### 4.2 `create_transaction_draft`
- Purpose: Draft a transaction from natural language.
- Output: draft transaction payload plus missing fields.
- UI action: open transaction form.

### 4.3 `create_asset_draft`
- Purpose: Draft an asset record from natural language.
- Output: draft asset payload plus missing fields.
- UI action: open asset form.

### 4.4 `create_reminder_draft`
- Purpose: Draft a reminder from natural language.
- Output: draft reminder payload plus missing fields.
- UI action: open reminder form.

### 4.5 `create_service_draft`
- Purpose: Draft a property service/vendor record from natural language.
- Output: draft service payload plus missing fields.
- UI action: open service form.
- Permission rule: only available to `pm` and `admin` based on current web form behavior.

### 4.6 `task_insight`
- Purpose: Help the user understand the current maintenance issue and decide whether to contact a service provider.
- Output: structured issue summary, likely meaning, urgency, safety flags, SP suggestion.
- UI action: render in task detail side panel.

### 4.7 `out_of_scope`
- Purpose: Reject unsupported requests early to save tokens.
- Output: short fixed response.

## 5) Local Rules That Must Not Depend On AI

### 5.1 Property Resolution
- Read the current user's accessible property list at runtime.
- Match user input against:
  - `nickname`
  - street number
  - street name
- Matching is case-insensitive.
- If no property matches, leave property blank and let the user choose in the form.

### 5.2 Transaction Rules
- Match `transac_type` locally against known options.
- Fixed rule:
  - `rent` -> `from: Tenant`, `to: Property Owner`
  - `deposit` -> `from: Tenant`, `to: Property Owner`
- General default:
  - non-rent and non-deposit transactions default to `from: Property Owner` unless content strongly indicates another role.
- `from` and `to` must normalize to:
  - `Property Owner`
  - `Property Manager`
  - `Tenant`
  - `Service Provider`
  - `Government`
  - `HOA`

### 5.3 Reminder Rules
- Match `category` locally when possible.
- Match `repeat_by` locally when possible.

### 5.4 Asset Rules
- Match asset `type` locally when possible.
- Match asset `location` locally when possible.

### 5.5 Service Rules
- Match `service_type` locally against known service options.
- Reject service draft capability for users outside `pm` and `admin`.

## 6) Task Insight Boundary
`task_insight` is intentionally narrower than intake.

Allowed:
- Explain what the reported issue likely means.
- Explain likely impact in plain language.
- Indicate urgency.
- Flag obvious safety concerns.
- Suggest whether contacting an SP is appropriate.

Not allowed:
- DIY instructions.
- Tool lists.
- Step-by-step repair guidance.
- Advice unrelated to the current task.

## 7) Capability Routing
Order:

1. Hard reject rules
- greetings only
- unrelated requests
- unsupported entity types

2. Local capability detection
- task
- transaction
- asset
- reminder
- service
- task_insight

3. If matched
- run local rules first
- only then call Gemini if needed

4. If not matched
- return `out_of_scope`

## 8) Site Coverage Map

### Existing create flows already compatible with this design
- [CreateMxRecord.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateMxRecord.vue)
- [CreateTransaction.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateTransaction.vue)
- [CreateAsset.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateAsset.vue)
- [CreateReminder.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateReminder.vue)
- [CreateService.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateService.vue)

### Existing assistant shell
- [MainLayout.vue](/Users/MacAirEZ/Desktop/projectTobby/src/layouts/MainLayout.vue)

### Existing task detail page for task insight insertion
- [MxRecordsPage.vue](/Users/MacAirEZ/Desktop/projectTobby/src/pages/MxRecordsPage.vue)

## 9) Implementation Priority
1. Finalize schema contract for all 5 intake entities.
2. Extend `/agent/intake` to support `service`.
3. Add `task_insight` endpoint and right-side panel in task detail.
4. Add confidence and missing-fields handling across all entity drafts.

