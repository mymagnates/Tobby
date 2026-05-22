# Tobby Mobile App Design Spec v0.1

Date: 2026-05-21

## 1. Implementation Direction

- Mobile app uses the existing Quasar project with Capacitor, not React Native.
- Mobile is a focused extension of the web app, not a full copy of web.
- Mobile should be simpler, faster, and role-specific.
- Shared business data structures must follow the web app and backend contracts.
- Preview routes can use local fallback data, but production mobile routes must use real Firestore/API data.

## 2. Shared Mobile Shell

- Use a shared mobile shell with bottom tabs.
- Each role has common navigation plus role-specific tabs.
- Role routing sends each account type to its own mobile home.
- Page headers include:
  - title
  - back action when inside a detail or action page
  - current property/context when a record depends on property or lease scope
- Primary action placement:
  - creation and submit pages use a fixed bottom primary action
  - list/detail pages use page-local actions when the action is secondary
- Upload interaction:
  - file/photo upload appears inside the relevant form section
  - upload payloads must use the same storage and Firestore fields as web
  - preview mode may skip real upload when no authenticated user exists

## 3. Role Scope

### PM

Tabs:
- Home
- Manage
- Property
- Tobby AI
- Account

Home:
- Shows feed, not leads.
- Shows reminder information.

Manage:
- Unified entry hub.
- Each data type opens its own dedicated input page.
- Supported entry types:
  - transaction
  - task
  - reminder
  - inventory form
  - document
  - service
  - asset
- Bid feedback/review is handled from PM bid review surfaces, not as a generic form.

Property:
- Shows each property as a button/card.
- Property cards expose property history and records:
  - property documents
  - lease
  - transactions
  - tasks
  - inventory form
- Inventory list is lease-bound.
- Inventory access should appear from the property card when the active lease context is known.

Tobby AI:
- PM only in the current mobile scope.
- AI behavior and boundaries must match the web Tobby AI capability rules.

### Owner

Tabs follow the same general pattern as PM but with owner-specific scope.

Owner does not get AI in the current mobile scope.
Owner can:
- view property data and higher quality charts
- record transaction information
- record task information
- upload/manage documents from Manage

Owner should not show approval actions unless a real owner approval workflow exists.

### SP

Tabs:
- Home
- Bids
- Projects
- Handout
- Account

Home:
- Shows leads.
- Bid creation starts only from a lead.

Bids:
- Shows already submitted bids.
- Revision starts by opening an already submitted bid.
- No standalone "submitted bid work" entry is needed.

Projects:
- Shows assigned/accepted projects.
- Project management and invoice are together.
- Invoice creation must select or inherit a project.

Handout:
- Manages posts and the SP handout page.
- Handout uses profile/services/coverage data from existing SP data sources.
- Posts are handout material, not a separate feed concept.

SP does not get AI in the current mobile scope.

### Tenant

Tenant does not get AI in the current mobile scope.
Tenant does not need a Property tab.

Tenant scope:
- home
- requests/tasks
- lease/inventory where assigned
- documents
- account

Tenant inventory:
- inventory list is created by PM/Owner and bound to lease
- tenant can update assigned draft inventory
- tenant cannot edit submitted inventory

## 4. Messaging

- Message entry is reserved.
- All roles may eventually communicate with different permissions.
- Message functionality is not implemented in the current mobile scope.

## 5. Visual Direction

- Do not copy web page layouts directly.
- Use simpler mobile-first structure.
- Keep information density lower than web.
- Use web-compatible colors/tokens, but mobile can simplify layout.
- Colors can be refined later, but must remain aligned with the web design system.

## 6. Data and Contract Rules

- PM feed must be named Feed, not Leads.
- SP uses Leads.
- Bid IDs and lead document IDs must follow the marketplace ID contract.
- PM/Owner transaction/task/document/service/asset records must use existing web field names and Firestore paths.
- SP project, bid, invoice, and handout data must follow existing web data structures.
- Preview fallback data must not redefine production data contracts.

