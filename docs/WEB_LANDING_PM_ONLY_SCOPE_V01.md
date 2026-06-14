# Web Landing PM-Only Scope v1

## Goal

Hide SP-facing promotion from the public landing experience while the mobile launch is PM-only.

## Scope

- Update the public landing/register experience so it does not surface SP onboarding.
- Keep PM/PO entry visible.
- Do not remove the SP product area globally from the web app unless it is specifically part of this task.

## Required Changes

1. Public register landing
   - Remove or hide the `Provide Services` card from `/public/register`.
   - Keep the PM/PO entry path visible and primary.

2. Landing messaging
   - Remove any SP-oriented copy from the landing/register flow.
   - Keep the copy focused on PM/PO launch positioning.

3. Routing safety
   - Do not expose SP signup as a primary public CTA from the landing entry.
   - Preserve direct routing compatibility only if needed for legacy links.

4. Review scope
   - Landing should present the PM/PO launch path only.
   - SP onboarding remains deferred to a later phase.

## Acceptance

- Public landing/register page no longer promotes SP onboarding.
- PM/PO entry is still clearly available.
- Existing SP routes are not promoted from landing.

## Notes

- This task only covers the public landing/register surface.
- It does not change the rest of the SP web workspace yet.
