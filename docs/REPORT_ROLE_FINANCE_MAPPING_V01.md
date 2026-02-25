# Report Role Finance Mapping v0.1

Date: 2026-02-16

## 1) Objective
- Define shared and role-specific reporting logic for PO and PM.
- Use existing transaction fields `from` and `to` as the core accounting perspective switch.

## 2) Principle: Single Transaction, Role-Based View
- One transaction record is the source of truth.
- Financial classification is determined by the current viewer role:
  - if current role is in `to` side => income
  - if current role is in `from` side => expense

## 3) Role View Rules

### PM View
- `to == PM` => revenue/income
- `from == PM` => cost/expense

### PO View
- `to == PO` => revenue/income
- `from == PO` => cost/expense

## 4) Example
- Transaction: management fee
  - `from = PO`
  - `to = PM`
  - `amount = 300`

Interpretation:
- PM finance report: +300 income
- PO finance report: +300 expense

## 5) Shared vs Exclusive Reports

### Shared (PO + PM)
1. Task Status Summary
2. Occupancy & Lease Summary
3. Core operational trend reports

### Financial (Role-Specific View)
- PO-focused: owner investment/profitability perspective.
- PM-focused: management revenue/operating performance perspective.
- Both are computed from the same transaction facts using `from/to` role mapping.

## 6) Required Data Integrity Rules
1. Every transaction must include valid `from` and `to`.
2. Role identity for report viewer must be explicit.
3. Report aggregation must classify each transaction once per viewer role (no double counting).

## 7) Implementation Notes
- Keep transaction schema unchanged if `from` and `to` already exist and are reliable.
- Implement role-view classifier in backend reporting layer (not frontend).

