# Admin Console PRD v0.1 (Independent App)

## 1) Product Position
- This is a **separate application** from the current user-facing app.
- Purpose: centralized operational oversight for usage, data growth, cost, and marketplace health.
- Access: admin-only, read-mostly in MVP.

## Platform Scope
- User-facing requirements tracked by this console must cover both Web and iOS products.
- Admin Console itself remains an independent app and is not required to have an iOS client in MVP.

## 2) Independence Requirement
- Separate frontend app and route domain (example: `admin.yourdomain.com`).
- Separate auth gate and role check (`admin` only).
- Separate navigation and UI from TT/SP/PM/PO app.
- Shared backend data sources are allowed, but no dependency on main app UI modules.

## 3) MVP Information Architecture

1. `Overview`
- Daily active users by role (TT/SP/PM/PO)
- Core business events (task/proposal/assignment/invoice)
- Quick health status (normal/warning/critical)

2. `Usage`
- DAU/WAU/MAU trends
- Per-role activity
- Feature adoption: task create, proposal submit, assignment accept, invoice submit

3. `Data`
- Firestore document count trend
- Storage usage trend (images/docs)
- Upload/download volume
- Error and retry rates

4. `Cost`
- Firebase cost breakdown:
  - Firestore
  - Storage
  - Auth
  - Functions/other
- AI cost breakdown:
  - extraction
  - rerank
- Budget vs actual (daily/monthly)

5. `Marketplace Ops`
- Funnel: opportunity -> proposal -> assignment -> completion -> invoice -> paid
- SP responsiveness and acceptance rate
- Average time-to-assignment and time-to-completion

6. `Alerts`
- Budget threshold alerts
- Sudden data traffic spikes
- Event processing failures / dead-letter queue backlog

## 4) Core Metrics Dictionary (MVP)

### User Activity
- `dau_total`
- `dau_tt`, `dau_sp`, `dau_pm_po`
- `mau_total`

### Product Actions
- `tasks_created`
- `proposals_submitted`
- `assignments_activated`
- `invoices_submitted`
- `invoices_approved`
- `invoices_paid`

### Data/Infra
- `firestore_reads_daily`
- `firestore_writes_daily`
- `storage_egress_gb_daily`
- `storage_used_gb_total`
- `event_failures_daily`

### Cost
- `firebase_cost_daily`
- `firebase_cost_month_to_date`
- `ai_cost_daily`
- `ai_cost_month_to_date`
- `total_cost_month_to_date`

## 5) Alert Rules (Initial)
- Cost alert:
  - warning: 70% monthly budget reached
  - critical: 90% monthly budget reached
- Traffic anomaly:
  - daily storage egress > 2x 7-day average
- Pipeline reliability:
  - event handler failure rate > 2%
  - dead-letter backlog > configured threshold

## 6) Permissions and Security
- Admin app access requires:
  - authenticated user
  - `admin=true` claim/role
- RBAC:
  - `admin_view_metrics`
  - `admin_view_costs`
  - `admin_view_audit`
- Audit logs required for:
  - login attempts
  - dashboard access
  - data export actions

## 7) Technical Notes
- Data ingestion approach:
  - event-driven counters + daily aggregates
  - avoid heavy live scans for every dashboard load
- Suggested stores:
  - `metrics_daily`
  - `cost_daily`
  - `alerts`
  - `admin_audit_logs`
- Refresh model:
  - overview cards every 5-15 min
  - deeper reports hourly/daily rollup

## 8) Out of Scope (MVP)
- Full finance reconciliation
- Direct billing automation actions
- Complex forecasting models
- Multi-tenant admin delegation

## 9) Delivery Phases
1. Phase 1:
- Overview, Usage, Data, Cost basic charts
- Alerting with email/slack webhook
2. Phase 2:
- Marketplace Ops funnel
- AI cost deep breakdown
3. Phase 3:
- Forecast and budget planning assistant
