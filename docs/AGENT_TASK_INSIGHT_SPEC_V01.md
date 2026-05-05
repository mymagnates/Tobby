# Agent Task Insight Spec v0.1

Date: 2026-04-21

## 1) Objective
Add a right-side AI analysis panel to task detail that helps users understand what the current maintenance issue likely means, without giving repair instructions.

## 2) Mount Point
Primary mount point:
- [MxRecordsPage.vue](/Users/MacAirEZ/Desktop/projectTobby/src/pages/MxRecordsPage.vue)

Relevant current layout block:
- `selectedMxRecord` detail dialog
- `.mxrecord-details-layout`
- right-side region should be added beside the existing full details area

## 3) Capability Name
- `task_insight`

## 4) Input Contract
The feature should read from the currently selected task and submit a condensed payload:

```json
{
  "task_id": "task_123",
  "property_id": "prop_1",
  "description": "There is a leak under the bathroom sink.",
  "status": "open",
  "report_date": "2026-04-21",
  "photos": [],
  "comments": []
}
```

## 5) Output Contract
The backend must return JSON only:

```json
{
  "capability": "task_insight",
  "issue_summary": "",
  "likely_causes": [],
  "urgency": "low|medium|high",
  "safety_flags": [],
  "recommended_next_step": "",
  "suggest_sp": false,
  "suggested_service_type": "",
  "confidence": 0.0
}
```

## 6) UX Structure
The panel should not look like a chat transcript. It should be a structured card with:
- `Issue Summary`
- `Likely Meaning`
- `Urgency`
- `Safety Flags`
- `Next Step`

Optional action buttons:
- `Find Service Provider`
- `Create Reminder`

## 7) Safety Policy
Allowed:
- brief issue interpretation
- likely causes in plain language
- urgency rating
- warning flags
- recommendation to use the system's next actions

Disallowed:
- DIY instructions
- repair steps
- tool lists
- hazardous troubleshooting instructions

## 8) Suggested Heuristics Before Model Call
Run these local checks first:
- if no task description, do not call model
- if description contains unrelated content, return fixed out-of-scope panel
- if description contains danger indicators, pre-tag `safety_flags`

Danger indicators include:
- `gas`
- `smoke`
- `burning smell`
- `sparking`
- `shock`
- `flood`
- `burst pipe`

## 9) Recommended Backend API
- `POST /agent/task-insight`

Request:

```json
{
  "task": {
    "id": "task_123",
    "property_id": "prop_1",
    "description": "Kitchen sink leak under cabinet",
    "status": "open",
    "report_date": "2026-04-21",
    "photos": [],
    "comments": []
  }
}
```

Response:

```json
{
  "capability": "task_insight",
  "issue_summary": "Likely active plumbing leak below the sink.",
  "likely_causes": ["Drain seal issue", "Supply line connection issue"],
  "urgency": "medium",
  "safety_flags": [],
  "recommended_next_step": "Review whether the leak is active and consider contacting a plumbing service provider.",
  "suggest_sp": true,
  "suggested_service_type": "plumbing",
  "confidence": 0.84
}
```

## 10) Implementation Notes
- Reuse the existing Gemini gateway pattern in [apiServer.js](/Users/MacAirEZ/Desktop/projectTobby/backend/apiServer.js).
- Log requests into `agent_events`.
- Rate limit the endpoint consistently with `/agent/intake`.
- Keep the model response schema narrow and reject non-JSON output.

## 11) Next Implementation Steps
1. Add `task_insight` endpoint in backend.
2. Add `TaskInsightPanel.vue` component.
3. Mount the panel in task detail layout.
4. Wire `Find Service Provider` to existing recommended SP flow.
5. Wire `Create Reminder` to existing reminder create flow with task context.
