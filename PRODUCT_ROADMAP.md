# Handout — Product Roadmap & Feature Specification

## User Types (Personas)

| Code | Role                | Description                    |
|------|---------------------|--------------------------------|
| **PM** | Property Manager    | Manages properties on behalf of owners |
| **PO** | Property Owner      | Owns properties, may self-manage or use PM |
| **TT** | Tenant              | Rents property, pays rent, submits requests |
| **SP** | Service Provider    | Vendors (maintenance, repairs, cleaning, etc.) — marketplace side |

---

## Core Modules (1–9)

### 1. Property
- **CRUD** — Create, read, update, delete properties
- **Media** — Photo, video, and document attachment
- **AI** — Voice input, suggestions (e.g. maintenance, financial)

### 2. Task (Maintenance / MX)
- **CRUD** — Full task lifecycle
- **2.1 Comment to Task** — Comments/threads per task
- **Media** — Photo, video, document
- **AI** — Voice input, MX/financial suggestions, **AI matching (PM ↔ SP)** for assigning/service dispatch

### 3. Transaction
- **CRUD** — Income/expense, rent, fees, etc.
- **Media** — Receipts, documents
- **AI** — Voice input, financial suggestions

### 4. Lease
- **CRUD** — Lease creation, terms, renewals
- **Media** — Lease documents, photos
- **AI** — Voice input, suggestions

### 5. Lease Application
- **CRUD** — Applications, status workflow (e.g. pending → approved/denied)
- **Media** — Application documents, ID, proof of income
- **AI** — Suggestions, optional screening assistance

### 6. Tenant
- **CRUD** — Tenant profiles, contact, lease linkage
- **Media** — Profile photo, documents
- **AI** — Voice input, suggestions

### 7. Inventory List
- **CRUD** — Per-property or per-unit inventory (appliances, keys, condition)
- **Media** — Photo/video/document for items
- **AI** — Voice input, suggestions

### 8. Reminders — Repeating & Action Tracking
- **CRUD** — One-off and **repeating** reminders
- **Action tracking** — Mark done, defer, renew, history
- **AI** — Smart reminders, recurrence suggestions, knowledge/education links

### 9. Document Management
- **CRUD** — Central doc repository (leases, invoices, permits, etc.)
- **Media** — Upload, organize, version (where applicable)
- **AI** — Tagging, search, optional summarization

---

## Cross-Cutting Capabilities (Apply Across Modules)

| # | Capability           | Description |
|---|----------------------|-------------|
| 1 | **CRUD**             | Full create/read/update/delete for each entity |
| 2 | **Photo / Video / Document** | Attach and manage media per entity |
| 3 | **AI voice input**   | Voice-to-text for notes, descriptions, logs |
| 4 | **AI suggestion**    | MX (maintenance) and financial suggestions in context |
| 5 | **AI matching**     | Match PM/PO tasks to SPs (service provider leads) |

---

## Marketplace — Service Provider (SP) Leads Generation

| # | Channel                    | Description |
|---|----------------------------|-------------|
| 1 | **Passive advertisement**  | SP profile/listings visible to PM/PO (browse, filters) |
| 2 | **User active search / AI suggestion** | PM/PO search for SPs; AI suggests relevant SPs by task type, location, ratings |
| 3 | **Knowledge assistance / education**   | Articles, tips, how-tos for PM/PO/TT — can be sponsored or linked to SP expertise |

---

## UI / Portal by User Type

- **PM** — Full property management: properties, tasks, transactions, leases, applications, tenants, inventory, reminders, documents, marketplace (search + AI matching).
- **PO** — Same as PM if self-managing; or limited view (own properties only) + same feature set.
- **TT** — Tenant portal: my lease, my payments, my requests/tasks, documents, reminders (e.g. lease renewal), limited marketplace (e.g. “request service” that creates lead for SP).
- **SP** — Service provider portal: profile, passive ads, incoming leads (AI matching), campaigns (e.g. group discount), performance/analytics.

---

## Revenue Model

### 1. Revenue from PO/PM (Property Owners & Property Managers)

| Item | Description |
|------|-------------|
| **a. Storage limit**        | Free tier with storage cap; paid tiers for more storage (docs, photos, video). |
| **b. Image compression unlock** | Free: compressed/optimized images; paid: full-resolution or less compression. |
| **c. AI agent features**    | Monetize: knowledge base, smart reminders, AI suggestions (MX + financial), and AI matching. |

### 2. Revenue from SP (Service Providers)

| Item | Description |
|------|-------------|
| **a. Passive advertisement**   | SP pays for listing visibility (featured, category, region). |
| **b. AI matching lead**         | SP pays per lead or subscription for leads matched via AI (PM/PO task → SP). |
| **c. Group discount / campaign** | SP runs campaigns (e.g. bulk discount for multiple properties); platform fee or premium placement. |

---

## Summary Matrix

| Module / Area        | CRUD | Media | AI Voice | AI Suggestion | AI Matching | Repeating / Tracking |
|----------------------|------|-------|----------|---------------|-------------|----------------------|
| 1. Property           | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| 2. Task               | ✓    | ✓     | ✓        | ✓ (MX/fin)    | ✓ (PM↔SP)   | —                    |
| 2.1 Comment to Task   | ✓    | ✓     | ✓        | —             | —           | —                    |
| 3. Transaction        | ✓    | ✓     | ✓        | ✓ (fin)       | —           | —                    |
| 4. Lease              | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| 5. Lease Application | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| 6. Tenant             | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| 7. Inventory List     | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| 8. Reminders          | ✓    | —     | ✓        | ✓             | —           | ✓ Repeating + action  |
| 9. Document Mgmt      | ✓    | ✓     | ✓        | ✓             | —           | —                    |
| Marketplace (SP)      | —    | —     | —        | ✓ Search/AI   | ✓ Leads     | Campaigns            |

---

## Suggested Implementation Phases

**Phase 1 — Core & existing**  
Property, Task (+ comments), Transaction, Lease, Lease Application, Tenant, Reminders (repeating + action tracking), Document mgmt, Inventory List. Add media (photo/video/doc) and basic CRUD where missing.

**Phase 2 — AI**  
AI voice input, AI suggestions (MX + financial), then AI matching (PM ↔ SP).

**Phase 3 — Marketplace**  
SP onboarding, passive ads, search + AI suggestion, knowledge/education, then SP revenue (leads, campaigns).

**Phase 4 — Monetization**  
Storage limits, image compression tiers, AI feature gates (PO/PM); SP ads, lead fees, group campaigns.

---

*Document version: 1.0 — Product roadmap and feature specification.*
