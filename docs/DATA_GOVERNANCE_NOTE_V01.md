# Data Governance Note v0.1

Date: 2026-02-15

## 1) Retention Policy (MVP)
- Default policy: permanent retention.
- Applies to:
  - Task records
  - Lease/transaction/property related records
  - Marketplace records (opportunity/proposal/assignment)
  - Invoice records
  - Uploaded media/documents

## 2) Account Deletion Behavior
- Account deactivation/deletion does **not** automatically remove associated files or records.
- Reason: operational and historical continuity during MVP stage.

## 3) User-Initiated Deletion Request
- Deletion requires explicit user request.
- Request channels:
  - support email
  - in-app communication/support page

## 4) Manual Deletion Workflow (MVP)
1. User submits deletion request with account identity proof.
2. Admin verifies account ownership.
3. Admin reviews affected data scope.
4. Admin executes manual deletion/anonymization action.
5. Admin sends confirmation back to user.

## 5) Logging Requirements
- Minimum logs for manual deletion:
  - request timestamp
  - requester identity
  - approver/admin identity
  - affected data categories
  - completion timestamp

## 6) Constraints
- No automated retention expiry job in MVP.
- No automated right-to-erasure pipeline in MVP.

## 7) Future Enhancements (Post-MVP)
- Configurable retention windows by data type.
- Automated delete/anonymize pipelines.
- Self-service data export/deletion center.
- Legal/compliance workflow integration.

