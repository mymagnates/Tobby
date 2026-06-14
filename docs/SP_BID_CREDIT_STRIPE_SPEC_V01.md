# SP Bid Credit & Stripe Pricing Spec V01

Date: 2026-06-07

## 1) Purpose

Define a simple, low-friction monetization system for SPs during launch:

- sell bid access at a low entry price
- let SPs buy credits in small packs
- keep the base package permanently available
- avoid future "price hike" sentiment by expanding via new SKUs, not by changing the base entry SKU
- prepare Stripe integration for later implementation

This spec is intentionally narrow:

- PM features stay free in phase 1
- SP monetization stays on the bid side only
- credits are used only for explicitly billed SP actions

## 2) Product Principle

SPs are not buying "ads".
SPs are buying:

- access to a qualified opportunity
- contact / bid eligibility
- lower acquisition cost
- faster path to a possible job

The platform should therefore price around:

- entry cost
- starter pack convenience
- future value tiers

not around broad "visibility" or generic impression pricing.

## 3) Phase 1 Pricing Model

### 3.1 Base SKU

- SKU code: `sp_bid_single`
- Product: 1 bid credit
- Price: `$4.99`
- Availability: always on
- Purpose: low-friction entry point

### 3.2 Starter Pack

- SKU code: `sp_bid_starter_10`
- Product: 10 bid credits
- Price: `$29.99`
- Availability: always on
- Purpose: new-user pack and primary onboarding offer

### 3.3 Expansion Rule

Future monetization must follow this rule:

- do not reprice or remove the base SKU
- do not reprice or remove the starter pack
- add new higher-value SKUs instead
- new SKUs must represent added value, not a hidden price increase

Examples of future higher-value SKUs:

- more credits
- higher quality lead access
- faster access
- exclusive access
- richer filters / queue priority

## 4) Credit Meaning

In phase 1, `credit` means `bid credit`.

Rules:

- 1 bid submission consumes 1 credit
- credits are fungible within the bid system
- credits are not a general-purpose currency in phase 1
- do not silently use credits for unrelated actions

If a future feature needs a different consumption unit, create a new credit type or SKU instead of overloading the bid credit.

## 5) What the SP Is Paying For

The SP purchase is the right to:

- submit a bid on a lead
- enter the competition for a job
- reduce acquisition friction

The SP is not paying for:

- generic page views
- raw exposure
- a promise of outcome

The product should keep that distinction explicit.

## 6) Purchase Flow

### 6.1 User Flow

1. SP opens the credits page.
2. SP sees the available SKUs.
3. SP selects `single bid` or `starter pack`.
4. SP pays through Stripe Checkout.
5. Backend receives the Stripe confirmation.
6. Backend credits the SP account.
7. UI refreshes balance and history.

### 6.2 UI Surfaces

SP-facing:

- `sp-credits` page
- current balance
- purchase cards
- purchase history
- FAQ / help text

Admin-facing:

- existing `admin-console` billing page
- account list
- order list
- ledger list
- manual adjustment tool

## 7) Consumption Flow

### 7.1 When a Credit Is Consumed

Consume 1 credit when a bid is successfully created and accepted by the backend.

Important:

- do not consume on page view
- do not consume on lead preview
- do not consume before duplicate / eligibility checks pass

### 7.2 Required Server Checks Before Consumption

The backend must check all of the following before deducting a credit:

- SP is eligible to bid on the lead
- lead is open for bidding
- SP has no duplicate active bid on that lead
- account has at least 1 available credit

If any check fails:

- no credit is deducted
- bid creation is rejected with a clear error code

### 7.3 Recommended Consumption Semantics

Use atomic deduction:

- verify eligibility first
- create bid record
- deduct credit in the same logical transaction
- write ledger entry with the bid reference

If the bid cannot be committed, the credit deduction must not survive on its own.

## 8) Credit Ledger Rules

Every balance change must create a ledger entry.

### 8.1 Ledger Entry Types

Use these entry types initially:

- `purchase`
- `consume`
- `refund`
- `adjustment`
- `void`

### 8.2 Ledger Fields

Recommended fields:

- `id`
- `sp_id`
- `entry_type`
- `delta`
- `balance_after`
- `source_type`
- `source_id`
- `provider`
- `provider_ref`
- `created_at`
- `created_by`
- `note`

### 8.3 Balance Source of Truth

Use the ledger as the audit source of truth.
Use the account table as the current balance snapshot.

Rules:

- ledger is append-only
- account balance is the current computed snapshot
- admin adjustments must also write ledger entries

## 9) Credit Account Rules

Each SP has one credit account.

Recommended fields:

- `sp_id`
- `balance`
- `lifetime_purchased`
- `lifetime_used`
- `lifetime_refunded`
- `updated_at`

Rules:

- balance cannot go negative
- first launch does not need expiration
- do not auto-decrement on inactivity
- do not mix PM and SP balances

## 10) Order Model

Each Stripe purchase should create an order record.

Recommended fields:

- `id`
- `sp_id`
- `sku_code`
- `sku_name`
- `credits`
- `amount_cents`
- `currency`
- `status`
- `provider`
- `provider_checkout_session_id`
- `provider_payment_intent_id`
- `provider_customer_id`
- `created_at`
- `paid_at`
- `failed_at`
- `refunded_at`
- `fulfilled_at`

### 10.1 Order Statuses

- `created`
- `checkout_created`
- `paid`
- `credited`
- `failed`
- `canceled`
- `refunded`

Rules:

- do not mark an order as credited until payment is confirmed
- payment and crediting are separate events
- idempotency is required on webhook handling

## 11) Refund and Adjustment Rules

### 11.1 Refund

Refunds should:

- create a refund order state transition
- write a ledger `refund` entry
- reverse the credited amount only once

### 11.2 Manual Adjustment

Admin may adjust credits, but every adjustment must:

- include a reason
- include an admin actor
- write a ledger entry
- be visible in admin history

Do not expose manual adjustment as a user action.

## 12) Stripe Integration

Stripe is the provider for phase 1, but keys will be added later.

### 12.1 Required Stripe Objects

- one product for `single bid`
- one product for `starter pack`
- one price object for each SKU

### 12.2 Backend Responsibilities

When Stripe keys are provided, backend must:

- create checkout sessions
- accept webhook confirmations
- validate payment status server-side
- prevent double-crediting
- write provider references into orders and ledger entries

### 12.3 Webhook Events to Handle

Minimum events:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

Recommended behavior:

- `checkout.session.completed` confirms the purchase flow
- `payment_intent.succeeded` confirms the actual charge
- `charge.refunded` triggers the credit reversal path

### 12.4 Environment Variables

Use environment variables for Stripe secrets and price ids.

Suggested variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SP_BID_SINGLE_PRICE_ID`
- `STRIPE_SP_BID_STARTER_10_PRICE_ID`

Do not hardcode secrets in the client.

## 13) API Surface

Suggested SP-facing endpoints:

- `GET /sp/credits/summary`
- `GET /sp/credits/history?limit=`
- `POST /sp/credits/orders`
- `POST /sp/credits/orders/:orderId/checkout-session`
- `POST /sp/bids`

Suggested billing endpoints:

- `GET /billing/catalog`
- `GET /billing/credits`
- `GET /billing/history`

Suggested Stripe endpoints:

- `POST /billing/stripe/checkout-session`
- `POST /billing/stripe/webhook`

## 14) Admin Console Requirements

Use the existing `admin-console` app.
Do not create a separate admin site.

Admin must be able to:

- inspect balances
- inspect orders
- inspect ledger entries
- filter by SP
- filter by date range
- run manual adjustments
- review failed or refunded orders

## 15) Frontend Requirements

SP-facing UI should show:

- current credit balance
- current available bid count
- purchase cards for the two launch SKUs
- history of purchases and consumption
- no aggressive upsell language

Do not show:

- PM billing entry points
- hidden future pricing hints
- "price will increase later" messaging

## 16) Acceptance Criteria

- SP can buy 1 bid or the 10-bid starter pack
- bought credits appear in the account balance
- a successful bid consumes 1 credit
- duplicate or invalid bids do not consume credits
- admin can inspect orders, balances, and ledger entries
- refunds and manual adjustments remain auditable
- base SKU and starter pack stay stable over time

## 17) Implementation Notes for the Next Agent

- Keep the first implementation minimal and deterministic.
- Use the current admin-console billing page as the operations surface.
- Prefer server-authoritative balances and ledger writes.
- Do not introduce PM收费 in this phase.
- Do not create a separate billing site.
- Stripe is integration-ready but credentials are not yet available.

## 18) Desktop Implementation Result - 2026-06-07

Completed MVP implementation against this spec:

- Added fixed launch SKU catalog in backend:
  - `sp_bid_single`: 1 bid credit, `$4.99`
  - `sp_bid_starter_10`: 10 bid credits, `$29.99`
- Added SP-facing catalog endpoint:
  - `GET /sp/credits/skus`
- Updated SP credit summary/history responses to include stable SKU metadata and `lifetime_refunded`.
- Updated order creation to be SKU-authoritative:
  - `POST /sp/credits/orders`
  - status starts as `created`
  - order records include `sku_code`, `sku_name`, `amount_cents`, Stripe provider reference fields, and fulfillment timestamps.
- Added checkout-session endpoints:
  - `POST /sp/credits/orders/:orderId/checkout-session`
  - `POST /billing/stripe/checkout-session`
- Added Stripe webhook entrypoint:
  - `POST /billing/stripe/webhook`
  - refuses fulfillment until `STRIPE_WEBHOOK_SECRET` is configured.
- Added Firebase Function config pass-through:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Updated payment callback fulfillment:
  - paid orders become `credited`
  - successful payment writes one `purchase` ledger entry
  - refunds write `refund` ledger entries
  - refund math clamps balance at zero to prevent negative balances.
- Updated bid submission credit consumption:
  - accepted backend bid consumes exactly 1 credit
  - ledger entry type is now `consume`
  - duplicate/invalid/insufficient/eligibility failures still return before deduction.
- Updated manual admin credit adjustment:
  - ledger entry type is now `adjustment`
  - `reason` and `CONFIRM` remain required
  - adjustment cannot make balance negative.
- Updated SP Credits page:
  - displays the two fixed launch purchase cards
  - checkout button calls the new checkout-session flow
  - if Stripe is not configured, the UI creates the order and shows a safe warning instead of pretending payment succeeded.
- Verified:
  - `node --input-type=module -e "import('./backend/apiServer.js')..."`
  - in-memory smoke test for SKU catalog, checkout session creation, paid callback fulfillment, and resulting balance.
  - `npm run build`
  - deployed `hosting:main` to `tobbythebutler`
  - deployed `functions` to `tobbythebutler`
  - production `GET https://tobbythebutler.web.app/api/sp/credits/skus` returned both fixed launch SKUs.

Known remaining Stripe follow-up:

- Add the Stripe SDK or REST client once live/test price IDs and keys are available.
- Move Stripe keys to Firebase Secret Manager when real credentials are provided.
- Replace checkout-session placeholder with a real Stripe Checkout Session URL.
- Add signature verification for webhook payloads before enabling production credit fulfillment.

## 19) Previous Implementation Log

### 2026-06-07 - Backend/Web Agent

Implemented in `/Users/MacAirEZ/.codex/worktrees/e4cc/projectTobby`.

What changed:

- Added server-owned launch SKU catalog for `sp_bid_single` and `sp_bid_starter_10`.
- Added `GET /billing/catalog`.
- Updated `POST /sp/credits/orders` so SPs can only create orders from supported `sku_code` values; credits and price are no longer client-controlled.
- Added `POST /sp/credits/orders/:orderId/checkout-session`.
- Added `POST /billing/stripe/checkout-session` as an SP-facing checkout shortcut.
- Added `POST /billing/stripe/webhook` for Stripe event intake.
- Updated order lifecycle to use `created`, `checkout_created`, `credited`, `failed`, `canceled`, and `refunded`.
- Updated bid credit consumption ledger type to `consume`.
- Updated free-credit and admin/manual ledger changes to use `adjustment`.
- Added idempotent purchase crediting and refund reversal behavior.
- Added SP credits page purchase cards for the two launch SKUs.
- Updated local web fallback behavior to follow the same SKU and ledger semantics.

Files changed:

- `backend/apiServer.js`
- `src/services/webApiClient.js`
- `src/pages/SpCreditsPage.vue`
- `tests/unit/backend/spCreditDataFlow.test.js`

Verification:

- `npm run test:run -- tests/unit/backend/marketplace.test.js tests/unit/backend/spCreditDataFlow.test.js tests/unit/backend/apiContract.test.js tests/unit/domain/mvpRules.test.js tests/unit/backend/adSlot.test.js` passed 83 tests.
- `npm run build` passed.

Remaining integration items:

- Real Stripe Checkout requires `STRIPE_SECRET_KEY`, `STRIPE_SP_BID_SINGLE_PRICE_ID`, and `STRIPE_SP_BID_STARTER_10_PRICE_ID`.
- Real webhook signature verification requires `STRIPE_WEBHOOK_SECRET` plus raw request body handling in the deployed function/runtime.
