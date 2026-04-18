# Agent Conversation Flow v0.1

Date: 2026-03-10

## 1) Objective
Define the end-to-end conversational flow for a task-oriented maintenance agent.

## 2) State Machine

States:
- `NEW_INPUT`
- `CLASSIFY_CAPABILITY`
- `UNDERSTAND_ISSUE`
- `DRAFT_TASK`
- `COLLECT_MISSING_FIELDS`
- `RECOMMEND_NEXT_STEP`
- `AWAIT_CONFIRMATION`
- `EXECUTE_ACTION`
- `RETURN_RESULT`
- `OUT_OF_SCOPE`

Transitions:
1. `NEW_INPUT` -> `CLASSIFY_CAPABILITY`
2. If capability = `understand_issue` -> `UNDERSTAND_ISSUE` -> `RECOMMEND_NEXT_STEP`
3. If capability = `create_task_draft` -> `DRAFT_TASK` -> `COLLECT_MISSING_FIELDS` (if needed)
4. If capability = `submit_task` -> `AWAIT_CONFIRMATION` -> `EXECUTE_ACTION`
5. If capability = `find_service_provider` -> `AWAIT_CONFIRMATION` -> `EXECUTE_ACTION`
6. If capability = `update_task` or `check_task_status` -> `EXECUTE_ACTION`
7. If no capability match -> `OUT_OF_SCOPE`

## 3) Minimal Data Contract

### 3.1 Input (from client)
```json
{
  "user_id": "u_123",
  "session_id": "sess_456",
  "raw_text": "My bathroom sink is dripping under the cabinet.",
  "language": "en-US",
  "source": "voice",
  "context": {
    "property_id": "prop_001",
    "task_id": null
  }
}
```

### 3.2 Router Output
```json
{
  "capability": "understand_issue",
  "confidence": 0.92,
  "should_invoke_main_agent": true
}
```

### 3.3 Draft Task Output
```json
{
  "capability": "create_task_draft",
  "draft": {
    "title": "Bathroom sink leak under cabinet",
    "description": "User reports dripping under the bathroom sink cabinet",
    "category": "plumbing",
    "urgency": "medium",
    "location": "bathroom",
    "property_id": "prop_001"
  },
  "missing_fields": ["access_window"]
}
```

### 3.4 Recommendation Output
```json
{
  "capability": "recommend_next_step",
  "recommended_action": "create_task",
  "reason": "Ongoing leakage can cause water damage",
  "available_actions": ["create_task", "add_more_details", "find_sp"]
}
```

### 3.5 Submit Task Output
```json
{
  "capability": "submit_task",
  "task_id": "task-123",
  "status": "open",
  "created_at": "2026-03-10T16:02:00Z"
}
```

## 4) Out-of-Scope Handling
If the request does not map to any capability:
- Return a short fixed response.
- Do not call the main agent or backend APIs.

Suggested response:
"I can help with maintenance issue understanding, task creation, and finding service providers."

## 5) Confirmation Rules
The agent must ask for confirmation before any write:
- `submit_task`
- `update_task` (status change)
- `find_service_provider` (if it triggers external outreach)

## 6) Token-Saving Rules
- Only send the latest user message to the router.
- The router returns a short JSON with no explanations.
- If `should_invoke_main_agent = false`, return a fixed response without LLM.

## 7) Integration Notes
- All write actions use backend APIs defined in `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md`.
- MCP gateway (if used) should forward to core API only; no business logic duplication.

## 8) Examples

### Example A: Issue Understanding
User: "The AC isn't cooling well."
Flow:
- `CLASSIFY_CAPABILITY` -> `UNDERSTAND_ISSUE` -> `RECOMMEND_NEXT_STEP`

### Example B: Task Submission
User: "Please create a task for the broken heater."
Flow:
- `CLASSIFY_CAPABILITY` -> `DRAFT_TASK` -> `COLLECT_MISSING_FIELDS` -> `AWAIT_CONFIRMATION` -> `EXECUTE_ACTION`
