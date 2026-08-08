# Web PM Release CI Orchestration v1

## Purpose

`.github/workflows/web-release-gate.yml` provides the PM-only web release test
orchestrator. It does not deploy, write to production Firebase, or receive
production Firebase, Stripe, AI, or email secrets.

## Current Gate State

`unit-and-api` is required immediately. Firebase rules and browser E2E are
deliberately configured as staged gates in `release-test-gates.json` because
the repository still needs committed Emulator fixtures and a non-production
browser test environment. This avoids treating missing infrastructure as a
permanent product regression.

When `firebase_rules_required` or `browser_e2e_required` is enabled, the
corresponding job must run and pass; a skipped or failed enabled job fails the
final `Release gate`.

Enable the gates only after all of the following pass from a clean checkout:

- Rules: `firestore.rules`, Storage rules, `tests/rules/`, Java/Emulator setup,
  and `npm run test:rules`.
- Browser: a seeded non-production PM account/property, an app/emulator service
  startup path, Playwright browsers, and `npm run test:e2e`.

## Commands

| Command | Scope | Safety boundary |
| --- | --- | --- |
| `npm run test:unit` | Vue/unit tests | No cloud credentials |
| `npm run test:api` | API contract tests | In-memory adapter only |
| `npm run test:rules` | Firestore/Storage rules | `handout-ci` Emulator project |
| `npm run test:e2e` | Chromium PM workflow | Localhost or isolated staging fixture |
| `npm run test:e2e:webkit` | WebKit PM workflow | Localhost or isolated staging fixture |
| `npm run test:smoke:staging` | Static staging routes | Requires explicit staging confirmation |
| `npm run test:release` | Lighthouse release budget | Requires explicit staging confirmation |

Remote browser and Lighthouse commands require both `E2E_ENV=staging` and
`E2E_STAGING_CONFIRMATION=isolated`. Full PM E2E additionally requires
`E2E_PM_EMAIL`, `E2E_PM_PASSWORD`, and `E2E_PROPERTY_ID`; the command fails
instead of silently skipping authenticated coverage.

## Manual Release Run

Use `workflow_dispatch` with a sanitized staging URL. Do not provide a
production URL. Selecting `run_release_checks` runs WebKit and Lighthouse; it
also requires the staging smoke job to pass. Store test-only PM credentials in
the GitHub `staging` environment, never in repository variables or PR jobs.

## Failure Triage

| Signal | Classification | First action |
| --- | --- | --- |
| Dependency install, Emulator boot, DNS, or staging availability | Environment failure | Re-run once; inspect artifacts before changing product code. |
| Stable test assertion fails | Test failure | Check fixture and intended contract. |
| Authorization, API, or E2E behavior changes | Product regression | Block release and inspect trace/API evidence. |

## Repository Configuration

1. Make `Release gate` required for `main` after both staged gates are enabled.
2. Protect the `staging` environment and store only dedicated test credentials there.
3. Keep deployment workflows dependent on `Release gate`.
4. Retain normal artifacts for 14 days and release evidence for 30 days.
