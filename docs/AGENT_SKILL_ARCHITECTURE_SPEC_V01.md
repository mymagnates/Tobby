# Tobby Agent Skill Architecture Spec v0.1

Date: 2026-05-18

## 1) Objective

Define the next-stage architecture for Tobby Agent as a constrained, skill-based assistant inside the existing property management web app.

The agent should help users:

- convert natural language into existing app forms
- understand maintenance tasks
- navigate app functions
- analyze existing property data quickly
- evaluate service provider bids

The agent must stay inside product-defined capabilities and must not become an unrestricted general chat assistant.

## 2) Architecture Decision

Use one agent runtime with multiple skill modules and a lightweight router.

Do not start with multiple independent sub-agents.

Recommended model:

```text
Agent Route / Orchestrator
  -> Guard Scope Skill
  -> Router
  -> Skill Module
  -> Existing API / Firestore-safe service / UI action
```

Rationale:

- Current product capabilities are clearly bounded.
- Skill modules are easier to test, version, and debug than independent sub-agents.
- A small router plus deterministic tools is cheaper and more predictable than multi-agent orchestration.
- Skills can later be promoted to sub-agents only if they need separate memory, tools, or long-running workflows.

## 3) Deployment Boundary

The agent logic should be code-independent from the main backend logic, but it does not need a separate Firebase Function yet.

Current stage:

```text
Single deployed function:
  mkpl

Internal structure:
  backend/apiServer.js
    route only

  backend/agent/
    router.js
    skills/
    llm/
    context/
    schemas/
```

Do not continue adding prompts, schemas, and model-routing logic directly into `apiServer.js`.

Recommended target structure:

```text
backend/
  apiServer.js
  agent/
    index.js
    router.js
    registry.js
    context/
      buildAgentContext.js
      pageContext.js
      propertyContext.js
      taskContext.js
    llm/
      vertexClient.js
      geminiClient.js
      modelRouter.js
      prompts.js
      responseSchemas.js
    skills/
      guardScope.js
      formIntake.js
      taskInsight.js
      navigation.js
      quickAnalytics.js
      bidEvaluation.js
    analytics/
      snapshotReader.js
      chartRegistry.js
```

Future split, only if needed:

```text
apiFunction
agentFunction
analyticsFunction
```

## 4) Agent Entry Points

### 4.1 Sidebar Conversation

Purpose:

- global lightweight assistant
- natural language intake
- navigation help
- quick questions about current page context

Behavior:

- always available
- should receive current route, selected property, selected record, and visible filters
- should not pull large datasets by default
- should open existing forms with drafts rather than writing directly

### 4.2 Task Detail

Purpose:

- task-specific Tobby Insight
- publish-to-SP guidance
- bid evaluation once bids exist

Behavior:

- uses selected task as primary context
- includes task comments
- includes property city/state/ZIP
- saves successful insight on the task record
- refresh button forces regeneration

### 4.3 Page-Level Assistant

Purpose:

- answer questions grounded in the page the user is viewing
- provide page-specific navigation and actions

Examples:

- Transactions page: "How much did I spend this month?"
- Assets page: "Which assets need attention?"
- Reminders page: "What is due soon?"
- SP bids page: "Compare these bids."

Behavior:

- page provides `agent_context`
- router limits skills to page-supported actions
- AI should not infer page state from URL alone when explicit context is available

### 4.4 Full-Screen Assistant

Purpose:

- complex multi-step workflows
- larger analysis output
- review of multiple records
- guided creation of multiple records

Triggers:

- user expands sidebar conversation
- analysis needs charts/tables
- router detects complex multi-step request
- page-level assistant cannot fit the UI

## 5) Agent Context Contract

Every agent request should include page and user context when available.

Canonical shape:

```json
{
  "entry_point": "sidebar|task_detail|page_assistant|fullscreen",
  "current_page": "transactions",
  "current_route": "/transactions",
  "user": {
    "id": "uid_123",
    "role": "pm"
  },
  "selected_property_id": "prop_123",
  "selected_record": {
    "entity_type": "task",
    "id": "task_123"
  },
  "visible_entity_type": "transaction",
  "visible_filters": {
    "date_range": "last_30_days",
    "status": "all"
  },
  "allowed_actions": [
    "navigate",
    "draft_form",
    "task_insight",
    "quick_analysis"
  ],
  "property_list": [],
  "page_data_summary": {}
}
```

Rules:

- Page context is advisory, not an authorization source.
- Backend must still enforce auth and role checks.
- Property resolution should use accessible property list.
- If context is missing, the agent should ask for clarification or open a form without preselecting the missing field.

## 6) Skill Registry

Each skill must be defined in a registry.

Registry fields:

```json
{
  "skill_id": "task_insight",
  "purpose": "Explain a maintenance task and recommend next product action.",
  "entry_points": ["task_detail", "sidebar", "page_assistant"],
  "required_context": ["task.description"],
  "allowed_tools": ["vertex_generate_content", "task_read", "property_read"],
  "writes_data": false,
  "requires_confirmation": false,
  "output_schema": "TaskInsightOutput",
  "cost_tier": "medium"
}
```

## 7) Skills

### 7.1 Guard Scope Skill

Purpose:

- reject unsupported requests early
- reduce token usage
- enforce product boundary

Inputs:

- raw user text
- entry point
- current page
- allowed actions

Outputs:

```json
{
  "in_scope": true,
  "reason": "",
  "suggested_intent": "form_intake|task_insight|navigation|quick_analytics|bid_evaluation|out_of_scope",
  "confidence": 0.91
}
```

Rules:

- Use deterministic checks first.
- Do not call large model for obvious out-of-scope questions.
- Reject DIY repair instructions.
- Reject unrelated general questions.

### 7.2 Form Intake Skill

Purpose:

- convert natural language into drafts for existing forms

Supported entities:

- `task`
- `transaction`
- `asset`
- `reminder`
- `service`

Behavior:

- never write directly to database
- open existing forms with draft values
- allow user to edit all fields
- require user confirmation through the existing form submit button

Output:

```json
{
  "skill_id": "form_intake",
  "entity_type": "task|transaction|asset|reminder|service",
  "draft": {},
  "missing_fields": [],
  "confidence": 0.0,
  "ui_action": {
    "type": "open_form",
    "form": "task"
  }
}
```

Local rules:

- property matching is local and case-insensitive
- match property by nickname, street number, or street name
- transaction type and role defaults should run before model extraction
- enum matching should not rely only on AI

### 7.3 Task Insight Skill

Purpose:

- help user understand a maintenance task
- estimate likely work scope
- suggest service provider type
- provide local price range

Current behavior:

- uses Vertex AI
- includes comments
- includes city/state/ZIP when available
- can use Google Search grounding for local pricing
- caches successful AI response on the task record

Output:

```json
{
  "skill_id": "task_insight",
  "capability": "task_insight",
  "likely_causes": [],
  "knowledge_points": [],
  "possible_scope_of_work": [],
  "safety_flags": [],
  "regional_price_range": "",
  "recommended_next_step": "",
  "suggest_sp": true,
  "suggested_service_type": "",
  "confidence": 0.0,
  "generated_by_model": true,
  "model_provider": "vertex",
  "model_status": 200
}
```

Rules:

- no DIY instructions
- no step-by-step repair guide
- no tool list
- recommend product action, such as publishing to SP
- price range should use ZIP first, then city/state
- if model fails, return fallback but do not cache fallback as final insight

### 7.4 Navigation Skill

Purpose:

- map user intent to an in-product route or UI action

Examples:

- "add a tenant" -> open tenant create page/form
- "show transactions for this property" -> navigate to transactions with property filter
- "find service providers for this task" -> open publish-to-SP flow

Output:

```json
{
  "skill_id": "navigation",
  "action": {
    "type": "navigate|open_dialog|highlight_action",
    "route": "/transactions",
    "params": {},
    "query": {}
  },
  "message": "Open Transactions for this property.",
  "confidence": 0.0
}
```

Rules:

- prefer deterministic route map
- do not use model if route intent is exact
- do not execute destructive or financial actions

### 7.5 Quick Analytics Skill

Purpose:

- answer lightweight data questions from existing analytics snapshots or safe read APIs

Examples:

- "How much did this property spend this month?"
- "Which tasks are still open?"
- "What reminders are due in the next 30 days?"
- "Which category costs the most?"

Architecture:

- backend prepares reusable analytics snapshots
- frontend renders fixed chart components
- AI explains the snapshot and chooses relevant chart
- AI does not regenerate charts from raw data every time

Output:

```json
{
  "skill_id": "quick_analytics",
  "summary": "",
  "insights": [],
  "chart_refs": [
    {
      "chart_id": "maintenance_cost_by_month",
      "title": "Maintenance Cost By Month",
      "data_ref": "analytics_snapshots/..."
    }
  ],
  "follow_up_questions": []
}
```

Recommended snapshots:

- `dashboard_summary`
- `property_monthly_expense`
- `maintenance_cost_by_category`
- `open_tasks_by_status`
- `transactions_by_type`
- `asset_maintenance_status`
- `reminders_due_next_30_days`
- `sp_publish_and_bid_summary`

Recommended API:

```text
GET /analytics/dashboard-summary
GET /analytics/property/:propertyId/summary
GET /analytics/property/:propertyId/charts
```

Rules:

- AI should not scan all Firestore collections directly.
- Backend should enforce role and property access.
- Snapshot freshness should be explicit.
- If snapshot is stale, response should say so.

### 7.6 Bid Evaluation Skill

Purpose:

- help user evaluate SP bids for a task
- compare price, scope clarity, risk, and missing questions

Inputs:

```json
{
  "task": {
    "id": "task_123",
    "description": "",
    "property_zip": "75201",
    "suggested_service_type": "flooring"
  },
  "task_insight": {
    "regional_price_range": "",
    "possible_scope_of_work": []
  },
  "bids": [
    {
      "bid_id": "bid_123",
      "sp_id": "sp_123",
      "sp_name": "ABC Flooring",
      "amount": 8500,
      "currency": "USD",
      "note": "",
      "estimated_days": 3,
      "included_scope": "",
      "excluded_scope": "",
      "warranty": ""
    }
  ]
}
```

Output:

```json
{
  "skill_id": "bid_evaluation",
  "summary": "",
  "bid_reviews": [
    {
      "bid_id": "bid_123",
      "price_position": "below_range|within_range|above_range|unknown",
      "strengths": [],
      "risks": [],
      "questions_to_ask": [],
      "recommended_next_step": ""
    }
  ],
  "comparison": {
    "best_value_bid_id": null,
    "reason": ""
  },
  "requires_user_decision": true
}
```

Rules:

- do not automatically select a winning SP
- do not evaluate SP by protected or sensitive attributes
- focus on price, scope, timeline, warranty, exclusions, clarity, and missing details
- if task insight has local price range, use it as a reference
- if no local range is available, request or generate task insight first

## 8) Router Design

Router input:

```json
{
  "raw_text": "",
  "agent_context": {},
  "conversation_state": {}
}
```

Router output:

```json
{
  "intent": "form_intake|task_insight|navigation|quick_analytics|bid_evaluation|out_of_scope",
  "skill_id": "",
  "confidence": 0.0,
  "requires_confirmation": false,
  "reason": ""
}
```

Routing order:

1. Guard hard reject
2. Deterministic route/action detection
3. Current page context match
4. Entity intake detection
5. Skill-specific model classification only if needed
6. Out of scope

Small model usage:

- allowed for ambiguous routing
- not required for exact route/action matches
- should output JSON only

## 9) Data Access Rules

Agent skills must use existing backend APIs or safe service functions.

Rules:

- no direct client-side privileged database access for agent decisions
- all writes require existing UI confirmation unless explicitly designed otherwise
- all analytics must respect user role and property access
- page context cannot grant additional permission
- every skill call should log `skill_id`, user id, request id, model provider, and fallback reason

## 10) Caching and Cost Control

### 10.1 Task Insight Cache

Cache location:

```text
properties/{propertyId}/mxrecords/{taskId}.tobby_insight
```

Rules:

- read cache when opening task detail
- refresh button forces model call
- do not cache fallback where `generated_by_model = false`
- store `tobby_insight_updated_at`

### 10.2 Analytics Cache

Use precomputed snapshots instead of asking AI to regenerate charts.

Recommended:

```text
analytics_snapshots/{userId}/dashboard_summary
analytics_snapshots/{userId}/properties/{propertyId}/monthly_summary
analytics_snapshots/{userId}/properties/{propertyId}/charts/{chartId}
```

Snapshot fields:

```json
{
  "snapshot_id": "",
  "scope": "dashboard|property",
  "property_id": "",
  "date_range": "",
  "generated_at": "",
  "fresh_until": "",
  "metrics": {},
  "charts": []
}
```

### 10.3 Router Cost

Rules:

- local reject before model
- deterministic navigation before model
- cache task insight
- use analytics snapshots
- avoid sending full raw datasets to model

## 11) API Surface

Existing:

```text
POST /agent/intake
POST /agent/task-insight
```

Recommended additions:

```text
POST /agent/route
POST /agent/navigation
POST /agent/quick-analytics
POST /agent/bid-evaluation
GET  /analytics/dashboard-summary
GET  /analytics/property/:propertyId/summary
GET  /analytics/property/:propertyId/charts
```

Implementation note:

- API names can be consolidated later under `POST /agent/run`.
- During build-out, separate endpoints are easier to test.

## 12) UI Behavior

### Sidebar Chat

- primary entry for natural language
- supports form draft, navigation, and simple analytics
- can offer "Open full screen" for long workflows

### Task Detail Panel

- shows cached Tobby Insight
- refresh regenerates
- "Publish to SP" is direct product action
- bid evaluation should appear when bids exist

### Page Assistant

- receives page context
- can answer page-specific questions
- can open page-native dialogs

### Full-Screen Assistant

- should support larger result cards
- can show charts, tables, and multi-step workflows
- should still use the same skill router

## 13) Implementation Phases

### Phase 1: Refactor Without Behavior Change

- create `backend/agent/`
- move Vertex/Gemini clients out of `apiServer.js`
- move prompts and response schemas out of `apiServer.js`
- move task insight into `skills/taskInsight.js`
- keep current endpoints unchanged

### Phase 2: Skill Registry and Router

- add `registry.js`
- add `router.js`
- add `/agent/route`
- connect sidebar chat to router output

### Phase 3: Navigation Skill

- define route/action map
- add page-level allowed actions
- add UI action handling

### Phase 4: Bid Evaluation Skill

- add `/agent/bid-evaluation`
- mount in task detail bid area
- use task insight price range as reference

### Phase 5: Quick Analytics

- define analytics snapshots
- add read-only analytics APIs
- add chart registry
- connect full-screen assistant and page assistant

### Phase 6: Full-Screen Assistant

- build full-screen workspace UI
- support large cards, charts, tables, and multi-step drafts

## 14) Open Decisions

- Whether Search grounding should always be enabled for task insight or controlled by env flag.
- Whether analytics snapshots should be generated on schedule, on write events, or lazy on first request.
- Whether bid evaluation should store its output on the task or remain on-demand.
- Whether full-screen assistant should be a route or modal shell.

## 15) Current Known Implementation State

Already implemented or partially implemented:

- natural language intake endpoint
- task insight endpoint
- Vertex model path
- task insight cache on mxrecord
- task detail insight panel
- ZIP-aware task insight request
- local property matching concept
- modular `backend/agent/` extraction for existing LLM client, prompts, schemas, and current skills
- `form_intake` and `task_insight` skill modules wired to existing agent endpoints

Not yet fully implemented:

- explicit skill registry
- router endpoint
- navigation skill
- quick analytics snapshots
- bid evaluation skill
- full-screen assistant UI
- standalone agent Firebase Function
