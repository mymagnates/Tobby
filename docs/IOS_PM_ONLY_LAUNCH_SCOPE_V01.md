# iOS PM-Only Launch Scope v1

## Goal

Prepare the iOS/Capacitor app for first App Store submission as a PM-only companion app.

## Launch Scope

- Keep only PM-facing screens and flows in the mobile app.
- Remove or hard-gate owner, tenant, and SP paths from the iOS launch surface.
- Keep iOS free of all credit purchase, bid purchase, and publish-to-SP entry points.

## Required Mobile Changes

1. Route scope
   - Ensure the native/mobile entry only exposes PM routes.
   - Redirect or block owner, tenant, and SP routes from mobile launch paths.

2. Navigation scope
   - Remove owner, tenant, and SP items from the mobile navigation model.
   - Do not rely on hidden buttons only; the route/menu model must also exclude them.

3. Publish-to-SP suppression
   - Hide every `publish to SP` action in the mobile UI.
   - Do not show SP publish buttons, publish modals, or publish shortcuts on iOS.

4. Startup scope
   - Avoid importing SP/owner/tenant-only modules during mobile startup.
   - Keep launch payload limited to PM-first functionality.

5. Review scope
   - iOS TestFlight/App Store review should use PM demo access only.
   - No SP monetization or SP onboarding should be visible in the mobile build.

## Acceptance

- iOS app opens directly into PM-only experience.
- No owner/tenant/SP navigation or pages are reachable from the mobile build.
- No `publish to SP` UI is visible anywhere in the mobile build.
- iOS build remains stable and ready for TestFlight review.

## Notes

- This task is mobile-only.
- Web publishing controls are handled in a separate frontend task.
