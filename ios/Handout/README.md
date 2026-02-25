# Handout iOS (TT MVP Skeleton)

This folder contains a native SwiftUI skeleton focused on TT MVP scope:

- Tabs: Dashboard, Create, Inbox, Records, Profile
- Create Task form with required validation
- Draft and submit actions
- Image-only placeholder attachment flow (no video entry in MVP)

## Open in Xcode

- Open `/Users/MacAirEZ/Desktop/projectTobby/ios/Handout/Handout.xcodeproj`.
- App target: `Handout`
- Deployment target: iOS 16+

## Firebase setup

1. Add iOS app in Firebase Console (bundle id default: `com.magnates.handout`).
2. Place `GoogleService-Info.plist` into:
   - `/Users/MacAirEZ/Desktop/projectTobby/ios/Handout/Sources/App/GoogleService-Info.plist`
3. In Xcode, add package:
   - URL: `https://github.com/firebase/firebase-ios-sdk`
   - Products: `FirebaseAuth`, `FirebaseFirestore`, `FirebaseStorage`, `FirebaseCore`
4. Build and run.

`FirebaseManager` and `AuthService` already use conditional imports (`canImport`) so project can open before SDK is added.

## Firestore collections used by current TT screens

- Dashboard:
  - `collectionGroup("mxrecords")` filtered by `created_by == {userId}`
  - `leases` filtered by `tenant_id == {userId}`
  - `collectionGroup("transactions")` filtered by `tenant_id == {userId}`
- Inbox:
  - `users/{userId}/inbox`
- Records:
  - `collectionGroup("mxrecords")`, `collectionGroup("transactions")`, `leases`, `inventory_lists`
- Create Task upload:
  - images compressed to <= 1 MB each
  - upload path: `images/{propertyId}/task/{filename}.jpg`
  - Firestore task doc stores `photos` (URL array) and `photo_count`
  - upload shows progress in UI and uses retry (3 attempts) for Storage + Firestore write

## Query compatibility

- TT queries include field-alias fallback for user scope (for example: `tenant_id`, `user_id`, `created_by`) to reduce client breakage during backend field migration.
- Canonical schema constants are centralized in:
  - `/Users/MacAirEZ/Desktop/projectTobby/ios/Handout/Sources/Core/Firebase/FirestoreSchema.swift`

## Notes

- A runnable `.xcodeproj` is now included in this folder.
- Keep backend-enforced permissions and status transitions as source of truth.

## Stable Build Path

- Use the build script to force project-local DerivedData every time:
  - `/Users/MacAirEZ/Desktop/projectTobby/ios/Handout/scripts/build_ios.sh`
- This avoids accidentally running stale artifacts from global Xcode DerivedData.
