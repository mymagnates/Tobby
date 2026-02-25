# MVP Scope Freeze v0.1

Date: 2026-02-15

## Purpose
- Freeze MVP scope to avoid requirement drift during implementation.
- Any change below requires a new scoped decision record.

## Platform Scope (Global)
- All MVP requirements in this project apply to both:
  - Web
  - Mobile iOS
- UI presentation may differ by platform, but business rules, permissions, field definitions, and state machines must remain consistent.
- Any platform-specific exception must be explicitly labeled as:
  - `Web-only`, or
  - `iOS-only`

## In-Scope (Current MVP)
1. Core role experiences for TT and PM/PO.
2. SP onboarding and marketplace visibility baseline.
3. Marketplace can run in lightweight "opportunity/ad distribution" mode.
4. Task and invoice management under current role rules.
5. Admin Console as independent app for usage/data/cost tracking.

## Reserved (Post-MVP Placeholder)
- Mobile Voice Agent for form filling (iOS):
  - speech-to-text -> semantic parsing -> auto-fill form -> user confirmation.
  - Reserved in product/technical design now, implementation deferred.

## Explicit Decisions (Locked)
1. **Payment flow**
   - Not included in MVP system flow.
   - Future feature only.

2. **Disputes / offline incident handling**
   - Out of scope.
   - Can be handled offline.
   - Marketplace may operate as pure opportunity distribution first.

3. **State ownership**
   - Task status is managed only by task creator.
   - Invoice is managed by SP.
   - Invoice uses structured data fields (not image-first invoice payload) to reduce storage usage.

4. **Notifications**
   - No dedicated notification system in MVP.
   - No push/email notification requirement in MVP.

5. **Data retention**
   - Data is retained permanently by default.
   - Account deletion does not automatically delete files.
   - User can submit manual deletion request.

6. **Risk/audit controls**
   - Advanced risk controls are out of scope for MVP.

7. **Support channel**
   - Support via dedicated email request and/or in-app communication channel page.

8. **Go-live strategy**
   - Out of scope for now.

9. **Testing plan**
   - To be discussed separately in a dedicated phase.

## Change Control
- Any addition beyond this list must be documented as:
  - `MVP Scope Change Note`
  - impact on timeline
  - impact on cost
  - impacted modules
