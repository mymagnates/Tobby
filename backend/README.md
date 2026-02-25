# Backend API (Contract v0.1)

## Run

```bash
npm run api:dev
```

Server default: `http://localhost:8787`

## Auth Context (Mock)

- `X-User-Id: u-tt-1 | u-pm-1 | u-sp-1 | u-admin-1`
- If omitted, defaults to `u-tt-1`.

## Notes

- Implements endpoints defined in `docs/API_INTERFACE_BOUNDARY_CONTRACT_V01.md`.
- All responses include `request_id`.
- All errors include `error_code`, `message`, `retryable`.
- Gated report denials include `gate_status`, `plan_required`, `upgrade_hint`.
- Writes accept optional `Idempotency-Key`.
