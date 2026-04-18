# Agent IO Schema Spec v0.1

Date: 2026-03-10

## 1) Objective
Define the agent input/output schemas aligned to current backend data structures to avoid
field mismatch across Web, iOS, and backend APIs.

## 2) Canonical Data Sources
The schema is aligned to:
- `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md` (core API routes)
- `docs/MVP_PAGE_FIELD_SPEC.md` (mobile/web field naming)
- `ios/Handout/Sources/Core/Firebase/FirestoreSchema.swift` (field aliases)
- `backend/apiServer.js` (current task payload fields)

## 3) Canonical Task Fields (Supported Now)
These fields are currently persisted by `POST /tasks` in `backend/apiServer.js`.

- `title` (string, required)
- `description` (string, required)
- `task_title` (string, derived alias)
- `task_description` (string, derived alias)
- `task_category` (string, optional)
- `task_priority` (string, optional)
- `status` (string, default: `open`)
- `property_id` (string, optional)
- `lease_id` (string, optional)
- `unit_id` (string, optional)
- `photos[]` (array, optional)
- `photo_count` (number, derived)
- `videos[]` (array, optional)
- `attachments[]` (array, optional)
- `creator_user_id` (string, server set)
- `assigned_sp_id` (string, optional)
- `lead_id` (string, optional)
- `comments[]` (array, server managed)
- `created_at` (datetime, server set)
- `updated_at` (datetime, server set)

## 4) Field Name Mapping (Web/iOS -> API)
The agent must normalize input to the canonical API fields.

- `task_title` -> `title`
- `task_description` -> `description`
- `task_category` -> `task_category`
- `task_priority` -> `task_priority`
- `property_id` -> `property_id`
- `unit_id` -> `unit_id`
- `photos[]` -> `photos[]`
- `videos[]` -> `videos[]`
- `attachments[]` -> `attachments[]`

Note: The backend now persists these fields; keep them optional unless explicitly provided.

## 5) Top-Level Agent Request Schema
All agent calls use this base envelope.

```json
{
  "user_id": "u_123",
  "session_id": "sess_456",
  "raw_text": "My sink is leaking under the cabinet.",
  "language": "en-US",
  "source": "voice",
  "timestamp": "2026-03-10T16:00:00Z",
  "context": {
    "property_id": "prop_001",
    "task_id": null,
    "lease_id": null,
    "role": "tt"
  }
}
```

Required: `user_id`, `session_id`, `raw_text`.  
Optional: `context.property_id`, `context.task_id`, `context.lease_id`, `context.role`.

## 6) Capability Output Schemas

### 6.1 `understand_issue`
```json
{
  "capability": "understand_issue",
  "category": "plumbing",
  "subtype": "sink_drain_leak",
  "summary": "Likely drain or connector leak under the sink",
  "impact_summary": "May cause cabinet moisture damage and odor issues",
  "urgency_level": "medium",
  "should_create_task": true
}
```

### 6.2 `create_task_draft`
```json
{
  "capability": "create_task_draft",
  "draft": {
    "title": "Bathroom sink leak under cabinet",
    "description": "User reports continuous dripping under the bathroom sink cabinet",
    "task_category": "plumbing",
    "task_priority": "medium",
    "status": "open",
    "property_id": "prop_001",
    "lease_id": null,
    "unit_id": "unit-12A",
    "photos": [],
    "videos": [],
    "attachments": []
  },
  "missing_fields": []
}
```

### 6.3 `collect_missing_task_fields`
```json
{
  "capability": "collect_missing_task_fields",
  "missing_fields": ["property_id"],
  "next_question": "Which property or unit is affected?"
}
```

### 6.4 `recommend_next_step`
```json
{
  "capability": "recommend_next_step",
  "recommended_action": "create_task",
  "reason": "Ongoing leakage can cause water damage",
  "available_actions": ["create_task", "add_more_details", "find_sp"]
}
```

### 6.5 `submit_task` (API payload)
```json
{
  "capability": "submit_task",
  "payload": {
    "title": "Bathroom sink leak under cabinet",
    "description": "User reports continuous dripping under the bathroom sink cabinet",
    "task_category": "plumbing",
    "task_priority": "medium",
    "status": "open",
    "property_id": "prop_001",
    "lease_id": null,
    "unit_id": "unit-12A",
    "photos": [],
    "videos": [],
    "attachments": []
  }
}
```

### 6.6 `submit_task` (API response)
```json
{
  "capability": "submit_task",
  "task_id": "task-123",
  "status": "open",
  "created_at": "2026-03-10T16:02:00Z"
}
```

### 6.7 `update_task`
```json
{
  "capability": "update_task",
  "task_id": "task-123",
  "patch": {
    "status": "in_progress"
  }
}
```

### 6.8 `check_task_status`
```json
{
  "capability": "check_task_status",
  "task_id": "task-123"
}
```

### 6.9 `out_of_scope`
```json
{
  "capability": "out_of_scope",
  "message": "I can help with maintenance issue understanding, task creation, and finding service providers."
}
```

## 7) Validation Rules
- `title`: 3-120 chars
- `description`: 3-2000 chars
- `status`: enum: `open`, `in_progress`, `completed`, `closed`, `cancelled`
- `task_category`: string if present
- `task_priority`: enum: `low`, `medium`, `high`
- `property_id`: string if present
- `lease_id`: string if present
- `unit_id`: string if present
- `photos[]`: array of URL strings if present
- `videos[]`: array of URL strings if present
- `attachments[]`: array of URL strings if present

## 8) Notes for Future Extensions
If backend storage is extended further, update this spec and the task persistence
handler in `backend/store.js`.
