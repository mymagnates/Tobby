# Mobile Home and Record Interaction Review

Status: approved and implemented locally; Capacitor UI rebuilt, synced and installed on the connected iPhone on 2026-09-11. Backend deployment and real-device visual/functional acceptance remain pending.

## 2026-09-11 Property Refresh Repair

- Mobile workspace refresh now awaits user memberships before fetching properties. Previously it fetched properties using only the in-memory role list, so properties created on Web could remain missing even after navigating between mobile tabs.
- Visibility, window focus and online events schedule a coalesced refresh; events during a running load queue one follow-up. Listeners/timers are removed when leaving the workspace page. Existing property selection is preserved.
- Web CreateProperty also refreshes the shared store in dependency order before completing either dialog or route creation. MainLayout no longer races membership/property reads in parallel. Persisted creation and failed list refresh have distinct messaging.
- 29 store/mobile integration tests, mocked browser regression, targeted ESLint and Capacitor build/sync pass. The iPhone was unavailable during this update, so this change is not yet verified installed or validated against the user's newly created property. Existing property permission errors are not resolved by changing refresh order.

## 2026-09-11 Privacy Link Focus Fix

- Scoped native Account support/privacy links to static styling: no pointer-focus outline, shadow, motion or active background. Keyboard `focus-visible` is preserved; policy URLs and external-link behavior are unchanged.
- Mocked touch regression and screenshot inspection confirm Privacy Policy has no extra frame after tapping; keyboard navigation still shows a focus indicator. Targeted ESLint, diff checks and Capacitor build/sync pass. This is not an authenticated on-device visual check.
- Signed iOS build succeeded. Installation of this privacy-link update failed because CoreDevice could not locate the paired iPhone (error 1011); reconnect it and run the Desktop Xcode project. This later fix is not yet verified installed.

## 2026-09-11 New Record Button Focus Fix

- Global `*:focus` styles were adding an outline to Quasar's internal focus helper after pointer/touch interaction. Scoped the New record button in Home/Manage to remove that internal outline, ripple, translation and shadow. Kept one simple brand-colored border, a pressed background, and an explicit keyboard-only focus ring.
- Creation menu and navigation are unchanged. Seven Home integration tests, targeted ESLint, and mocked browser checks pass, including mouse press, touch tap, menu dismissal, no ripple/helper outline, keyboard focus and Enter activation, 320px layout and dark mode.
- Capacitor sync and signed iOS build passed. The package containing this fix and the previous Home entry changes was successfully installed on the connected iPhone without uninstalling. Browser screenshots were inspected; on-device visual confirmation is still pending.

## 2026-09-11 Home Creation Entry and Queue Clarification

- Per the latest user request, Home now exposes a single `New record` header action, reusing Manage's creation sheet. The selected property and Home return location are preserved. This supersedes the earlier proposal to keep all creation entry points exclusively in Manage; no shortcut grid was restored.
- The existing mobile filter remains unchanged: accessible/selected property, non-terminal tasks/reminders, and urgent task priority (`urgent`, `emergency`, `critical`) or a due date before/on today. It shows five rows; View all opens the same complete filtered queue. Ordinary/high-priority tasks with no due date or future due dates are not included unless they also meet the urgent criteria. Recurring reminders use their next occurrence.
- Web Priority queue has a different scope: task feed items linked to open tasks plus bid feed items, limited to five. It does not apply the mobile urgent/today cutoff. Matching property selection and successful data loading are required before comparing the two displays.
- The mobile empty state now explains the cutoff and offers `View all tasks`, which opens Manage without the attention filter. It no longer states that all work is caught up. Previously observed property permission errors remain a separate unresolved data-access issue.
- 31 targeted tests pass. Browser fixture regression passes for Home creation, shared return context, ordinary tasks excluded from attention but visible in all tasks, 320px/375px widths, dark mode and landscape Manage. These are mocked-data checks, not proof of authenticated property access on the phone. Targeted ESLint passes; Capacitor UI build/sync succeeded.
- Signed device build also succeeded at `/private/tmp/handout-ios-device-build/Build/Products/Debug-iphoneos/App.app`. Installation of this Home update did not complete: CoreDevice reported connection reset by peer (error 4000). Reconnect/unlock the iPhone before installing or running from the Desktop Xcode project. The earlier installed startup fix is not evidence that this later Home update is installed.

## 2026-09-11 Native White Screen Repair

- Reproduced via connected-device console: WebView and Firebase services loaded, but the LOCAL persistence completion message never appeared during observation, preventing the awaited auth boot from finishing.
- Native startup now uses `initializeAuth` with `browserLocalPersistence` and no browser popup/redirect resolver. Web keeps `getAuth`. The installed Firebase SDK's browser defaults proactively initialize a redirect iframe on iOS before completing auth initialization; this dependency is not needed for the native email/password login.
- Added three regression tests for native configuration, awaiting a restored user, and unchanged browser initialization. All 36 targeted auth/session/composable tests and targeted ESLint pass; `git diff --check` passes.
- Rebuilt/synced Capacitor assets and signed device app, then successfully installed and launched on the connected iPhone. Source and device-package index SHA-256 match: `0bb7d11217694f09cbb95ffb879c07a470f8d69340e73c6ce5e1fa34c93a429d`.
- Post-install device logs now confirm LOCAL persistence completed and authenticated property loading began. Some property reads return `permission-denied`; no security rules were relaxed. Visual confirmation from the user remains pending; logs alone do not prove the rendered screen.
- Reference: https://firebase.google.com/docs/auth/web/custom-dependencies

## 2026-09-11 Old Design Installation Fix

- Xcode's existing DerivedData `App-acflwezoiupymocehrfuevzrvhmz/info.plist` points to `/Users/MacAirEZ/.codex/worktrees/93aa/projectTobby/src-capacitor/ios/App/App.xcodeproj`, not the delivery checkout. Its device build contains a different, older page bundle.
- Built the signed Debug device app from `/Users/MacAirEZ/Desktop/projectTobby/src-capacitor/ios/App/App.xcodeproj` into `/private/tmp/handout-ios-device-build`. Build succeeded; bundled `public/index.html` matches the synced index SHA-256 recorded below.
- `devicectl device install app` successfully updated `com.magnates.handout` on the connected iPhone without uninstalling it. `devicectl device process launch` then succeeded. This verifies installation and launch, not the visible Home screen or camera/comment behavior; screen access was unavailable.
- Use the Desktop project above for subsequent Xcode runs. Running the old worktree project can replace the device app with old assets again. No Firebase deployment or App Store upload occurred.

## 2026-09-11 Old Worktree Cleanup

- Removed the old `93aa/projectTobby` worktree and local `codex/app_UI` branch at the user's request. The Desktop checkout on `main` remains the delivery location; its current uncommitted implementation was preserved.
- Before removal, archived the complete old worktree (including uncommitted/untracked files) and Git history in `/Users/MacAirEZ/Desktop/projectTobby-backups/ios-old-design-20260911/`. The gzip archive and Git bundle passed integrity checks. The two branch-only commits were preserved in the bundle, not merged over the newer UI.
- Close any Xcode window for the removed worktree and open `/Users/MacAirEZ/Desktop/projectTobby/src-capacitor/ios/App/App.xcodeproj` instead.
- Unrelated development branches/worktrees and the GitHub remote branch were not changed.

## 2026-09-11 Local Update

- Integrated the interrupted subagent work in the active Capacitor routes: shared Web/mobile palette, Home attention queue, Manage creation, transaction photo capture/preview/retry/receipt, and dedicated task comments UI.
- Added canonical property-scoped task comment API/Web submission integration, transaction submission idempotency, and replayable upload commit. These backend changes are local, not deployed; do not interpret a successful UI build as live API availability.
- Fixed the three new component test harnesses to isolate Quasar plugins and avoid real Firebase initialization. 221 targeted tests across 13 files pass. Targeted application/source ESLint and `git diff --check` pass. The separate pre-existing API server lint issues were not part of this repair.
- Home/Manage mocked browser regression passed, including light/dark colors, five-row preview/full queue, long text, landscape and task-route navigation. The light Home screenshot was visually inspected. These checks do not prove native camera, real keyboard or authenticated production behavior.
- `npx quasar build -m capacitor -T ios --skip-pkg` succeeded and synced assets to `src-capacitor/ios/App/App/public`. Camera 7.0.5 is registered in the generated Swift Package dependencies. Source/synced index SHA-256: `9b48cd8a66d8c8eeb1ac0e1117ff956ddab34bbea227b500c5ddc43a6a6e51e1`.
- No Web/Firebase deployment, App Store upload, Git commit or push was performed. This initial build did not install on a device; the subsequent device installation is recorded above.
- Xcode Debug simulator build also passed with `CODE_SIGNING_ALLOWED=NO`; output is `/private/tmp/handout-ios-ux-build/Build/Products/Debug-iphonesimulator/App.app`. This is simulator compilation, not a signed device archive or an on-device test.

The remaining sections preserve the reviewed proposal and its acceptance criteria, rather than claiming every device-level criterion is complete.
Reviewed: 2026-09-10, main checkout. No application code changed.
Method: current route/component/data-path review, UI UX Pro Max interaction references and targeted local searches. This is not an inspection of the app currently installed on a physical iPhone.

## 1. Version Boundary

- The active `/mobile` route uses `MobileWorkspaceLayout.vue`, `WorkspacePage.vue`, and `WorkspaceCreatePage.vue`.
- Active bottom navigation is Home / Property / Account. `/mobile/pm/manage` redirects to Records.
- `PmMobileHomePage.vue` still contains the seven-action Create Record grid, but is not used by the current mobile router. Do not fix only this unused component.
- If the installed app shows that grid and a separate Manage tab, first compare its build number and bundled assets to this checkout. Do not delete legacy files or assume a device update has occurred.

## 2. Findings

| Priority | Finding | Evidence / impact |
| --- | --- | --- |
| High | Task details cannot show or submit comments | `WorkspacePage.vue` opens a generic field-only sheet. Web `MxRecordsPage.vue` reads/writes maintenance-record logs; mobile has no equivalent interaction. |
| High | Transaction attachment is not visible after save | Shared `CreateTransaction.vue` writes `picture_url`, but mobile detail only opens `file_url` or `url`; the saved receipt also omits the image. |
| High | Failed photo upload becomes a successful image-less transaction | `CreateTransaction.vue` catches upload failure and continues saving. Retry/recovery can confuse users or produce duplicate financial records. |
| Medium | Needs attention is not an urgency queue | `WorkspacePage.vue` concatenates all unfinished reminders before tasks and takes the first 12. No due-date/urgency ranking: future reminders can displace urgent work. |
| Medium | Mobile colors differ from the Web brand | Mobile uses blue-gray background `#eef3f5`, text `#243b53`, teal `#24786c`; Web uses warm white and forest green. |
| Medium | Creation/navigation responsibilities are unclear across versions | Old Home repeats Manage actions. Current Home owns New while Manage is only a redirect. Simply removing New now would remove the active creation entry point. |
| Medium | Back behavior loses context | Creation returns to Home; Records back goes to Property regardless of entry origin. Preserve property/filter/source page and scroll position. |

## 3. Proposed Navigation and Home

Use four persistent destinations: **Home / Property / Manage / Account**.

- Home: only what needs action now. No Create Record grid, financial dashboard, property count card, duplicated shortcuts or speculative activity feed.
- Property: property context, maintenance records, leases and inventory.
- Manage: existing Records screen evolved into the central browse/create destination, not a second task database. One `New record` button opens record-type selection. Preserve incoming property/type filters.
- Account: profile, usage, support and settings.

Home structure:

```text
Home
All properties [v]

Needs attention                    View all
2 overdue / 1 due today

Repair leaking faucet             Urgent >
Pinewood / Task

Arrange annual inspection         Today  >
Garden House / Reminder

Home       Property       Manage       Account
```

The counts and names above are illustrative, not actual account data.

Home behavior:

- Property selector uses a visible chevron; default All properties. Preserve the user's selection. Inaccessible properties never appear.
- Eligible items: unresolved urgent tasks and overdue/today tasks or reminders. Future undated routine work stays in Manage, not Needs attention.
- Ranking: urgent first, then overdue (oldest due first), then due today; stable record ID tie-breaker. Use the same application date/time-zone semantics as the source record; never invent a due date.
- Preview at most five rows; View all opens Manage with the exact attention filter, not an unrelated full list. Define status aliases centrally so cancelled/done variants are excluded consistently.
- Show due labels and property names; do not rely on red/green alone. Allow titles to wrap.
- No eligible work: a short All caught up message, not extra filler cards. No properties: one contextual property-setup action instead of a fake all-clear result.
- Loading, failure and empty are different states. Refresh retains visible content where safe; permission loss clears inaccessible records. Do not show zero counts as if loading had completed.
- Do not remove the active Home New entry until Manage creation is reachable in the same change.

## 4. Shared Color System

Extract shared semantic brand tokens; map Web and mobile tokens to them rather than importing desktop layout styles into mobile.

| Role | Light value from current Web |
| --- | --- |
| Primary action | `#254b39` |
| Primary text | `#243830` |
| Secondary text | `#65756c` |
| Canvas | `#f7f8f4` |
| Surface | `#ffffff` |
| Divider | `#e0e6df` |
| Soft selected surface | `#eef3eb` |

Mirror the existing Web dark tokens too: canvas `#19251e`, surface `#202d26`, text `#e4efe7`, muted `#aec0b3`, border `#3a4c40`, brand `#b8dec5`. Preserve red/warning semantics. Keep the mobile system font for native text behavior; matching brand colors does not require copying desktop typography or layout.

## 5. Transaction Photo Flow

Place an optional Receipt / Photo row in the main form, not behind Advanced options. Tapping it offers **Take photo / Choose photo / Choose image file**. Start with one image, consistent with the existing `picture_url` contract; multiple receipts are a separate schema expansion.

1. Select property and enter transaction fields. Adding a photo is optional and does not run OCR or change accounting fields.
2. Show a thumbnail with View / Replace / Remove. Cancelling the picker retains all inputs.
3. Save with a photo: show upload progress, then record save. Upload failure preserves the draft and offers Retry or explicit Save without photo; never silently omit the selected attachment.
4. Record-save failure reuses the completed upload when valid and retries with an idempotency key. Retrying must not create a second transaction or double-charge storage.
5. Confirmation and Transaction detail show the saved image; Web sees the same attachment. Read existing `picture_url` and approved legacy attachment fields safely.

Use a Capacitor 7-compatible camera adapter for native camera/gallery and a file input for browser/file selection. `src-capacitor/package.json` currently has no Camera plugin. Check iOS permission descriptions; request access on user action, handle denied/limited access, and preserve the form when returning from camera. The actual device camera is a release test, not something browser mocks can prove.

Preserve backend upload reservation/commit and quota checks. No direct-client-write workaround. Link the committed attachment to the authorized property/transaction; document orphan cleanup for abandoned/failed saves. Changing property after selecting a photo must not associate an old property's upload with a different record.

## 6. Task Comment Flow

Replace the generic task sheet with a dedicated detail screen:

- Compact task header: title, property, status, priority.
- Description and existing attachments.
- Shared comment/history timeline with author, time, action label and optional photos.
- Bottom composer: Add an update, attachment action, Send. Content scrolls; composer stays above keyboard/home indicator. Hide redundant navigation chrome while editing if needed.

Default comment type to existing `update`; users should not have to choose an action for an ordinary comment. Preserve the other existing Web action types under an optional selector. Existing `resolution` semantics close the task: expose that as an explicit Resolve action with confirmation, not an accidental side effect of Send.

Send is disabled for blank/submitting content. Show pending/sent/failed states; failed sends retain text and photos, offer retry, and do not duplicate comments. Return preserves the original list/filter/scroll position; warn before discarding a nonempty draft. Read-only users see the timeline and a clear permission explanation instead of an active composer. Authorization must be enforced by the backend, not the global PM label.

Data integration gate:

- Web currently writes `logs` on `properties/{propertyId}/mxrecords/{recordId}`. The separate `/tasks/:id/comments` endpoint writes `task.comments`; these are not proven to be the same canonical history. Do not connect mobile to that endpoint blindly.
- Define a property-authorized append endpoint/shared service, server-derived author/time, stable comment ID and idempotent/atomic writes. Migrate Web submission to the same path so concurrent comments cannot overwrite a whole log array.
- Preserve existing logs and action semantics; do not fabricate historical IDs/authors or silently duplicate entries across `logs` and `comments`.
- Commenting must not publish an internal task/history to SP. Keep explicit PM publish gates and existing moderation/access boundaries.

## 7. Implementation Order and Acceptance

All steps below are proposals, not dispatched tasks.

1. Confirm active app build and route. Capture current iPhone screenshots; avoid delivering fixes to unused legacy screens.
2. Share color tokens, add the Manage destination, and simplify Home in one coherent navigation change.
3. Complete transaction attachment capture/upload/recovery/detail flow.
4. Implement canonical task comment service and timeline/composer; wire both Web and mobile to it.
5. Run unit/API, mocked browser and real-device tests before any deployment.

Required tests: Home sorting/date boundaries/status aliases/property scope; matching list counts; back navigation and draft retention; camera cancel/denial/limited access; upload timeout/quota failure/save retry; image visible after reload; concurrent/idempotent comments; read-only and cross-property rejection; Web/mobile history consistency; no implicit SP publishing.

Visual/device checks: small and large iPhones, portrait/landscape, large text/VoiceOver, light/dark, safe areas, keyboard open, long titles/comments, offline recovery. Verify the final row and Send/Save remain reachable. No native-camera, authenticated production or device-layout verification was performed during this review.

## References and Skill Scope

- UI UX Pro Max: local `references/pro-rules.md`, touch targets, semantic colors, safe areas, fixed controls and draft/error feedback.
- Local `form submission error recovery` search matched submission feedback and recovery guidance. Information-hierarchy searches did not produce a relevant verified match; the Home arrangement above is a product-specific recommendation, not a claimed skill-generated template. Vue search suggestions do not justify replacing existing Quasar validation libraries.
- [Capacitor 7 Camera API](https://capacitorjs.com/docs/v7/apis/camera): native photo/gallery integration, compatible plugin version and iOS permission setup.
