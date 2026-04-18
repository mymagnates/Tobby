# Backend API (Contract v0.1)

## Run

```bash
npm run api:dev
```

Server default: `http://localhost:8787`

## Owner Invite Email

`POST /owner-invites/email` creates or refreshes an owner invite and attempts delivery through Resend.

Config:

- `RESEND_API_KEY`
- `INVITE_EMAIL_FROM` (optional, defaults to `onboarding@resend.dev`)
- `APP_BASE_URL` (recommended, example: `https://app.example.com`)

## Auth Context (Mock)

- `X-User-Id: u-tt-1 | u-pm-1 | u-sp-1 | u-admin-1`
- If omitted, defaults to `u-tt-1`.

## Notes

- Implements endpoints defined in `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md`.
- All responses include `request_id`.
- All errors include `error_code`, `message`, `retryable`.
- Gated report denials include `gate_status`, `plan_required`, `upgrade_hint`.
- Writes accept optional `Idempotency-Key`.

## Ad Slot (V0.1)

- `POST /sp/posts/ingest` (SP/Admin): ingest or upsert SP post for ad slot delivery.
- `GET /ad-slots/:slot_id/feed` (PM/PO): fetch fixed-size ad card payload with service type label and tracking URLs.
- `POST /ad-events/impression`: idempotent impression counter by `impression_token`.
- `GET /ad-events/click/:impression_token`: idempotent click counter + `302` redirect to SP handout URL.
- `POST /internal/promo-campaigns` (Admin): reserved sponsored campaign API (feature-flagged by `ADS_SPONSORED_ENABLED=true`).

### Feed Cost Control (Simple Mode)

- Feed response cache is enabled by default.
- Repeated requests from the same user+slot+region reuse cached feed payload for a short period.
- High-frequency bursts return cached payload first; if no cache exists, API responds `429 FEED_RATE_LIMITED`.
- ETag is returned for feed responses. Clients can send `If-None-Match` to receive `304` when unchanged.

Env knobs:

- `FEED_CACHE_TTL_SECONDS` (default `60`)
- `FEED_REQUEST_WINDOW_SECONDS` (default `30`)
- `FEED_MAX_REQUESTS_PER_WINDOW` (default `20`)
