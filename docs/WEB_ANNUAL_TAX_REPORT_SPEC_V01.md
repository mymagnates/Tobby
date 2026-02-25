# Web Annual Tax Finance Report Spec v0.1

Date: 2026-02-16

## 1) Objective
- Add a Web-only annual financial report to support tax preparation.
- Reuse existing transaction data and role-based `from/to` perspective mapping.

## 2) Scope
- Platform: Web (required in current phase).
- Audience: PM and PO.
- Data source: existing transactions, lease/property references.

## 3) Report Name
- `Annual Tax Finance Report`

## 4) Filters
- `tax_year` (required)
- `role_view` (PM or PO)
- `property` (optional, one or many)
- `transaction_category` (optional)

## 5) Calculation Rules
- Same transaction source, role-view mapping:
  - if viewer role is in `to` => income
  - if viewer role is in `from` => expense
- Include only transactions in selected tax year.
- Aggregate by:
  - total annual income
  - total annual expense
  - net annual amount
  - category breakdown
  - property breakdown

## 6) Output Sections
1. Summary
   - tax year
   - role view
   - income total
   - expense total
   - net total
2. Category Breakdown
3. Property Breakdown
4. Transaction Detail List (for audit trail)

## 7) Export
- Required export formats:
  - CSV
  - PDF
- Export filename suggestion:
  - `annual-tax-report-{role}-{year}.csv|pdf`

## 8) Permissions
- PM: report scope limited to managed properties.
- PO: report scope limited to owned properties.

## 9) Non-Goals
- No automatic tax filing submission.
- No jurisdiction-specific tax advice logic in MVP.

