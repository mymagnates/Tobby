# iOS PM-Only Release QA Checklist v1

## Scope

This checklist covers the Capacitor iOS launch candidate for the PM-only mobile app.

## Automated / Local Verification

- PM-only native routing is enforced at runtime.
  - Native `/mobile`, `/mobile/pm`, and `/mobile/pm/*` paths are allowed.
  - Native `/mobile/owner/*`, `/mobile/sp/*`, `/mobile/tenant/*`, and `/mobile-preview/*` paths redirect to `/mobile/pm/home`.
  - Native login ignores non-PM mobile redirect targets and opens PM Home.
- PM mobile bottom navigation resolves to the PM tab model on native runtime.
- PM mobile Manage no longer shows a Bids tile.
- PM mobile Home no longer loads bid data, no longer shows `Bids waiting`, and no longer links feed rows to bid review.
- PM mobile Account shows:
  - Usage & Credits
  - Privacy Policy
  - Request Account Deletion
  - Contact Support
  - Report Abuse
- iOS permission descriptions exist in `src-capacitor/ios/App/App/Info.plist` for camera, photos, photo saves, and microphone.

## Commands Passed

- `npm run test:run -- tests/unit/utils/mobileRuntime.test.js tests/unit/boot/sessionManager.test.js tests/unit/composables/useFirebase.test.js`
- `npm run build`
- `npx quasar build -m capacitor -T ios --skip-pkg`

## Browser Smoke Passed

- `/mobile-preview/pm/home` renders PM Home with `Need attention`, `Due today`, and `Records` stats.
- `/mobile-preview/pm/manage` renders PM record views without a Bids entry.
- `/mobile-preview/pm/account` renders Profile, Usage & Credits, Notifications, Privacy, and Session cards.

## Remaining Manual Step 4

- Open `src-capacitor/ios/App/App.xcodeproj` in Xcode.
- Confirm signing team, bundle id, version, and build number.
- Install on a physical iPhone.
- Run one PM demo account smoke pass:
  - Login opens PM Home.
  - Deep link or manual URL attempts to owner/SP/tenant mobile routes return to PM Home.
  - Create transaction, task, reminder, document, service, and asset records.
  - Save flows land on view-only detail/list surfaces.
  - Property list and lease-bound inventory open.
  - Account privacy, deletion request, support, report abuse, and quota visibility are present.
  - Photo/file permission prompts show the configured usage descriptions.
- Archive and upload to TestFlight after the physical-device smoke pass.

## Known Non-Blocking Warnings

- Browserslist/caniuse-lite data is stale.
- Firebase boot module is both dynamically and statically imported, so Vite reports the existing chunking warning.
- Vendor chunks for Firebase and Quasar remain larger than 500 KB after minification.
