# MCP API Readiness Spec v0.1

Date: 2026-02-16

## 1) Objective
- Build a separate server-side MCP layer to enable AI agent integration.
- Keep core business logic in existing backend services.
- Expose controlled MCP tools/resources with strict security and auditability.

## 2) Deployment Strategy (Independent Service)

### Services
1. `core-api` (existing business backend)
2. `mcp-gateway` (new, MCP protocol adapter)

### Principle
- Separate development and deployment for `mcp-gateway`.
- No duplicate business logic in `mcp-gateway`; call `core-api` only.

## 3) System Architecture

1. Agent Client -> `mcp-gateway` (MCP protocol)
2. `mcp-gateway` -> AuthN/AuthZ guard
3. `mcp-gateway` -> `core-api` endpoints
4. `mcp-gateway` -> audit log + metrics

## 4) Scope
- Platform scope: shared backend for Web and iOS data.
- MCP layer is backend-only and independent from app UIs.

## 5) MCP Surface

### 5.1 Tools (MVP)

#### Read tools
1. `get_task_detail`
2. `search_records`
3. `get_recommended_sps`
4. `get_sp_card_detail`
5. `get_invoice_detail`
6. `get_lease_inventory_detail`

#### Write tools
1. `create_task`
2. `update_task_status`
3. `add_task_comment`
4. `create_lease_inventory` (PM/PO only)
5. `update_inventory_draft`
6. `submit_inventory`
7. `save_sp_card`
8. `update_sp_card_note`
9. `assign_sp_to_task`
10. `create_invoice`
11. `submit_invoice`
12. `review_invoice`

### 5.2 Resources (MVP)
1. `role_context`
2. `task_context`
3. `lease_inventory_context`
4. `sp_card_context`
5. `invoice_context`

## 6) Permission Matrix (Server-Enforced)

### TT
- allowed:
  - `create_task`
  - `add_task_comment` (self scope)
  - `update_inventory_draft` (assigned draft only)
  - `submit_inventory`
  - read own records only
- blocked:
  - `assign_sp_to_task`
  - `create_lease_inventory`
  - invoice review actions

### PM/PO
- allowed:
  - task management actions
  - `create_lease_inventory`
  - `assign_sp_to_task`
  - `save_sp_card` / `update_sp_card_note`
  - invoice review actions
  - global records search in scope

### SP
- allowed:
  - task comments/status updates only when assignment active
  - `create_invoice` / `submit_invoice` on assigned task
  - read own relevant records

### Admin
- read analytics/admin-related resources only (as configured).

## 7) Tool Contract Rules

### 7.1 Idempotency
- All write tools must accept `idempotency_key`.
- Duplicate key returns previously committed result.

### 7.2 Validation
- `mcp-gateway` performs input schema validation.
- `core-api` remains source of truth for domain validation.

### 7.3 Error Shape
- standardized response:
  - `error_code`
  - `message`
  - `retryable` (boolean)
  - `request_id`

## 8) Security Requirements

1. AuthN
- service token or delegated user token required for every call.

2. AuthZ
- role and data-scope checks per tool call.

3. Data minimization
- only return required fields for tool outcome.

4. Rate limiting
- per caller and per tool limits.

5. Secret management
- all keys in secret manager; no hardcoded credentials.

## 9) Audit and Observability

### 9.1 Audit Log Fields
- `timestamp`
- `caller_id`
- `user_id` (if delegated)
- `tool_name`
- `input_hash`
- `result_status`
- `request_id`
- `latency_ms`

### 9.2 Metrics
- tool call volume
- success/error rate
- p95 latency
- permission denied rate
- idempotency replay count

## 10) Trigger Conditions (Server-Side)

1. `HTTP/MCP request`
- direct tool calls by agent

2. `Event-driven follow-up` (optional)
- for async post-processing tasks

3. `Cron jobs`
- periodic health checks and usage aggregation

## 11) Delivery Plan

### Phase 1 (Read-first)
- implement read tools only:
  - `get_task_detail`
  - `search_records`
  - `get_recommended_sps`

### Phase 2 (Low-risk writes)
- add:
  - `add_task_comment`
  - `save_sp_card`
  - `update_sp_card_note`

### Phase 3 (Critical writes)
- add:
  - `assign_sp_to_task`
  - `update_task_status`
  - `submit_inventory`
  - invoice tools

## 12) Non-Goals (Current)
- No direct payment execution.
- No dispute workflow automation.
- No bypass of existing `core-api` permissions.

## 13) Acceptance Criteria
- All tools pass schema and permission tests.
- All writes are idempotent.
- Full audit trail is queryable.
- `mcp-gateway` can be deployed/rolled back independently of `core-api`.

