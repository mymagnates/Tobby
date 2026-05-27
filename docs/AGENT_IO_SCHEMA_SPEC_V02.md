# Agent IO Schema Spec v0.2

Date: 2026-04-21

## 1) Objective
Define the canonical input and output contracts for Gemini-assisted intake and task analysis, aligned to current web forms and existing backend behavior.

## 2) Agent Request Envelope
All agent requests should use this base request shape.

```json
{
  "raw_text": "Tenant paid April rent for Oak House",
  "context": {
    "user_id": "uid_123",
    "role": "pm",
    "property_id": null,
    "property_list": [],
    "transaction_type_hint": null,
    "transaction_type_options": [],
    "transaction_role_options": [],
    "asset_type_hint": null,
    "asset_type_options": [],
    "asset_location_hint": null,
    "reminder_category_hint": null,
    "reminder_category_options": [],
    "reminder_repeat_hint": null,
    "service_type_hint": null,
    "service_type_options": [],
    "task_id": null
  }
}
```

## 3) Shared Agent Response Envelope
For all draft creation capabilities:

```json
{
  "entity_type": "task|transaction|asset|reminder|service|out_of_scope",
  "draft": {},
  "missing_fields": [],
  "confidence": 0.0,
  "notes": []
}
```

For task insight:

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

## 4) Canonical Entity Schemas

### 4.1 Task Draft
Aligned to current task create flow in [CreateMxRecord.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateMxRecord.vue).

```json
{
  "property_id": "",
  "description": "",
  "report_date": "",
  "status": "open"
}
```

Required for final submit:
- `property_id`
- `description`

Agent notes:
- `report_date` may default to current date if omitted by user.
- `status` should default to `open`.

### 4.2 Transaction Draft
Aligned to current transaction create flow in [CreateTransaction.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateTransaction.vue).

```json
{
  "property_id": "",
  "transac_type": "",
  "transac_from": "",
  "transac_to": "",
  "amount": null,
  "transac_date": "",
  "note": ""
}
```

Supported `transac_type` values:
- `Rent`
- `Deposit`
- `Tax`
- `Insurance`
- `Utility`
- `Maintenance`
- `Labor`
- `HOA`
- `Fee`
- `Refund`
- `Other`

Supported role values for `transac_from` and `transac_to`:
- `Property Owner`
- `Property Manager`
- `Tenant`
- `Service Provider`
- `Government`
- `HOA`

### 4.3 Asset Draft
Aligned to current asset create flow in [CreateAsset.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateAsset.vue).

```json
{
  "property_id": "",
  "nickname": "",
  "type": "",
  "location": "",
  "location_other": "",
  "brand": "",
  "model": "",
  "serial": "",
  "mfg_date": "",
  "acquired_date": "",
  "notes": ""
}
```

Supported `type` values:
- `Appliance`
- `HVAC`
- `Pool/Spa`
- `Electrical`
- `Plumbing`
- `Safety`
- `Exterior`
- `Furniture`
- `Other`

### 4.4 Reminder Draft
Aligned to current reminder create flow in [CreateReminder.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateReminder.vue).

```json
{
  "property_id": "",
  "category": "",
  "start_date": "",
  "due_date": "",
  "repeat_by": "one-time",
  "amount": null,
  "note": "",
  "status": true
}
```

Supported `category` values:
- `fee`
- `hoa`
- `rent`
- `maintenance`
- `labor`
- `tax`
- `other`

Supported `repeat_by` values:
- `daily`
- `weekly`
- `monthly`
- `yearly`
- `one-time`

### 4.5 Service Draft
Aligned to current service create flow in [CreateService.vue](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateService.vue).

```json
{
  "propertyId": "",
  "selectedServicePropertyIds": [],
  "service_type": "",
  "company_name": "",
  "company_website": "",
  "agent_company": "",
  "agent_name": "",
  "agent_phone": "",
  "agent_email": "",
  "service_start_date": "",
  "term": "",
  "recurring": false
}
```

Supported `service_type` values:
- `loan`
- `insurance`
- `pest_control`
- `lawn`
- `pool`
- `cleaning`
- `hvac`
- `plumbing`
- `electrical`
- `security`
- `trash`
- `snow_removal`

Permission rule:
- only users with `pm` or `admin` account type may create or edit service records through the current form flow

## 5) Task Insight Schema
Aligned to the planned task detail right-side analysis panel in [MxRecordsPage.vue](/Users/MacAirEZ/Desktop/projectTobby/src/pages/MxRecordsPage.vue).

Input:

```json
{
  "task": {
    "id": "task_123",
    "property_id": "prop_1",
    "description": "Kitchen sink leaking under cabinet",
    "status": "open",
    "report_date": "2026-04-21",
    "photos": []
  }
}
```

Output:

```json
{
  "capability": "task_insight",
  "issue_summary": "Likely plumbing leak under the kitchen sink cabinet.",
  "likely_causes": [
    "Drain fitting leak",
    "Supply line leak"
  ],
  "urgency": "medium",
  "safety_flags": [],
  "recommended_next_step": "Review the leak details and consider contacting a plumber if the leak is active.",
  "suggest_sp": true,
  "suggested_service_type": "plumbing",
  "confidence": 0.86
}
```

## 6) Validation Rules

### All draft entities
- `property_id` and `propertyId` must come from current accessible properties if provided.
- Unknown enum values must be rejected or normalized before opening the form.
- Agent output must never contain fields not accepted by the target form.

### Task insight
- Do not output DIY steps.
- Keep `recommended_next_step` to system-oriented advice only.
- If dangerous keywords are present, include them in `safety_flags`.

## 7) Current Gaps To Close In Runtime
- `/agent/intake` currently supports `task`, `transaction`, `asset`, and `reminder`; `service` still needs to be added to runtime handling in [apiServer.js](/Users/MacAirEZ/Desktop/projectTobby/backend/apiServer.js).
- `task_insight` is specified here but not yet implemented as a dedicated endpoint or page panel.
