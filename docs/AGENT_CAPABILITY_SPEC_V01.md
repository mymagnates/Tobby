# Agent Capability Spec v0.1

Date: 2026-03-10

## 1) Objective
- Define a task-oriented agent that only supports explicit product capabilities.
- Keep all writes behind backend APIs; agent never writes to Firestore directly.
- Provide issue understanding without DIY repair instructions.

## 2) Scope
The agent supports property maintenance intake and task workflows:
- Understand user-reported issues.
- Draft task payloads.
- Collect missing task fields.
- Recommend next business actions.
- Submit tasks and follow-ups via API.
- Find service providers (SPs) after user confirmation.

## 3) Non-Goals
- No DIY or step-by-step repair guidance.
- No general chat, translation, creative writing, or unrelated questions.
- No legal/medical/financial advice.

## 4) Capability List (Whitelisted)

1) `understand_issue`
- Purpose: Classify the issue and explain what it likely is.
- Output: category, subtype, summary, impact summary, urgency.
- API: none.

2) `create_task_draft`
- Purpose: Convert natural language to a structured task draft.
- Output: title, description, category, urgency, location, missing_fields.
- API: none.

3) `collect_missing_task_fields`
- Purpose: Ask the minimum questions to complete a task draft.
- Output: missing_fields, next_question (single question).
- API: none.

4) `recommend_next_step`
- Purpose: Provide business next-step options.
- Output: recommended_action, reason, available_actions.
- API: none.

5) `find_service_provider`
- Purpose: Query recommended SPs after user confirmation.
- Output: recommended_sps, match_reason.
- API: yes (recommended SP endpoint).

6) `submit_task`
- Purpose: Create a task after user confirmation.
- Output: task_id, status, created_at.
- API: yes (`POST /tasks`).

7) `update_task`
- Purpose: Update status or add comments.
- Output: updated task summary.
- API: yes (`PATCH /tasks/:id/status`, `POST /tasks/:id/comments`).

8) `check_task_status`
- Purpose: Retrieve task status.
- Output: status, latest_update, assigned_sp.
- API: yes (`GET /tasks/:id`).

9) `out_of_scope`
- Purpose: Reject requests outside allowed capabilities.
- Output: short fixed response.
- API: no.

## 5) Capability Routing

Order of checks:
1. Hard rules (empty input, greetings, explicit unrelated topics).
2. Capability classifier (small model or deterministic rules).
3. If no capability match, return `out_of_scope` without invoking the main agent.

## 6) Content Safety and Boundaries
The agent must not provide DIY repair steps. Allowed content:
- Problem interpretation.
- Impact summary.
- Urgency assessment.
- Business next-step choices.

Disallowed content:
- Tool usage instructions.
- Disassembly guidance.
- Electrical/plumbing repair steps.

## 7) API Mapping
Map capabilities to existing API contract:
- `submit_task` -> `POST /tasks`
- `update_task` -> `PATCH /tasks/:id/status` or `POST /tasks/:id/comments`
- `check_task_status` -> `GET /tasks/:id`
- `find_service_provider` -> `GET /tasks/:id/recommended-sps`

See `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md` for canonical route definitions.

## 8) Audit and Idempotency
- All write calls include `Idempotency-Key`.
- Log `request_id`, `user_id`, `capability`, `task_id` (if any), and latency.

## 9) Example Output (Issue Understanding)
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

## 10) Ownership
- Product owner: PM/PO team.
- Implementation owner: Backend/API track.
- AI prompt/policy owner: AI agent track.
