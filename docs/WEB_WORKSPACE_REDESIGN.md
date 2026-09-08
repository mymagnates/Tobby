# Handout Web Workspace Redesign

Status: deployed to Firebase Web Hosting on 2026-09-07. Authorized on 2026-09-07.

## Scope

Replace the authenticated Web workspace shell and shared presentation, not its business model.
Preserve role gates, property memberships, ownership, API calls, authentication, quotas,
record forms, and existing routes. Public/marketing pages, Admin Console, and native iOS
are outside this change. Existing native/legacy layout remains isolated from Web styling.

## Approved Direction

- One navigation column. No permanent property column in the workspace.
- A compact, searchable property switcher in the header, with a permanently visible chevron.
- Warm off-white canvas, white surfaces, charcoal text, restrained mint selection states.
- Retain the existing font assets. No new remote font dependency or UI framework.
- Remove the Web right-hand statistics rail. Reports remain available; Tobby opens on demand.
- Use a single content gutter. Do not compensate for drawer widths using page-specific offsets.
- Navigation has readable labels on wide screens, an optional compact mode, and an overlay
  drawer below 1024px. The drawer and content use Quasar's own layout measurements.

## Layout

```text
Handout     Dashboard   [All properties                 v]       [+] [Account]
-----------------------------------------------------------------------------
Overview    Your properties, in focus.
Dashboard   Open work             Needs review             Due this week
Reports     ----------------------------------------------------------------
            Priority queue                        Latest activity
Portfolio
Properties
Assets
Documents

Operations
Tasks
Transactions
Reminders
Leases
Tenants
```

Desktop: 224px navigation (72px collapsed), 72px header, 28px content gutter.
Tablet: overlay navigation, full-width content. Phone: compact toolbar plus property
switcher row; tapping the switcher opens a bottom sheet. Minimum target size is 44px.

## Property Switcher Contract

1. Entire trigger is clickable, including the name and arrow. The arrow is never hidden
   by a long name; text truncates first. Arrow points up while open.
2. Show the active property name, with the address in the panel. All-properties views
   show `All properties`. A missing/inaccessible ID is not silently described as all.
3. Panel contains search, All properties when supported, up to three recently selected
   accessible properties, the full list, and a management link. Eligible managers also
   see Add property. Empty and no-search-result states are distinct.
4. Selected row displays a check. Selection closes the panel and updates URL scope.
   Escape/outside-click closes without changing scope and returns focus to the trigger.
   Keyboard Tab and arrow keys reach the search and property actions.
5. Only `userAccessibleProperties` supplies options. Recent IDs are session-only and
   namespaced by user; revoked properties never appear as recent options.
6. Dashboard, tasks, transactions, assets, documents, leases, tenants, reminders and
   reports support All properties. Property details and services require a single
   property and canonicalize their first-property fallback into the URL.
7. Preserve property scope across workspace navigation. Clear only that filter when
   selecting All properties, preserving unrelated query parameters. Parameterized
   `/assets/:propertyId` routes must also update/clear their path parameter.
8. Account/profile is account-wide and has no property filter. Deep links and browser
   refresh retain URL scope. No permission is granted by changing the selector.
9. Creation keeps existing form validation and permissions. Never infer ownership or
   silently submit records merely because a property was selected.

## Page Rules

- Dashboard: short heading and context, three compact metrics, queue and activity.
- Records: preserve existing search/filter/table/card/form behavior; flatten nested
  decorative surfaces and normalize workspace spacing.
- Property detail: selected property remains the main entity; no duplicate permanent list.
- Profile: account-wide content aligns with the same main-content gutter.
- Tobby: on-demand dialog; only messages scroll and composer remains reachable.
- Maintain semantic status colors and dark-mode contrast. Respect reduced-motion settings.

## Execution Steps

1. [x] Record design, scope, interaction states and acceptance criteria.
2. [x] Implement reusable selector and URL-scope helpers; cover them with unit tests.
3. [x] Integrate header/navigation and remove Web rail reservations.
4. [x] Apply shared Web tokens and dashboard presentation; preserve native layouts.
5. [x] Test selector, URL scope, no-property state, keyboard access, long labels,
       responsive layout, profile alignment, and existing targeted regression tests.
6. [x] Build production SPA; record actual results and any verification gaps below.

Deployment is a separate release step: do not imply local replacement is already live.
Figma synchronization is not a prerequisite; no callable Figma tool is available in this run.

## Verification Results

- Selector/helper unit tests: 11 passed; session persistence tests: 12 passed.
- Existing release safety API tests: 16 passed (local in-memory adapters, not live production).
- ESLint passed for the modified application files. Production SPA build passed.
- Browser review: desktop dashboard, property selector, account page; 390px dashboard
  and bottom sheet. Isolated visual fixture has 23 synthetic properties, including a
  long-name selection that updates the URL and closes the panel.
- Real property reads in the current browser session report Firestore insufficient
  permissions. The layout's empty state is verified, but live multi-property data and
  production workflows are NOT verified. Do not loosen rules for visual testing.
- The sample fixture is under tests/visual and is not included in the production build.
- Existing build warnings: Firebase static/dynamic import overlap and old Browserslist data.

## Landing Follow-up (Authorized 2026-09-07)

The user subsequently included Landing in the redesign scope. Public landing.html now
uses a dedicated landing-workspace.css, avoiding changes to About, Privacy, Terms and
Support styles. PM/Owner signup, sign-in redirect propagation and legal links are retained.
SP, bids and vendor promotion are removed in line with WEB_LANDING_PM_ONLY_SCOPE_V01.md.

Three original SVG illustrations match the new workspace: desktop dashboard, mobile
dashboard and property record. They are explicitly labeled as sample data, contain no
customer records, and total under 19KB. They are illustrations, not real-account screenshots.
The hero uses responsive picture sources; the secondary image is lazy-loaded. No external
font, icon library, photo request, framework or paid integration is required by Landing.

Landing browser review confirmed desktop and 390px layouts, loaded images, and no
horizontal overflow at 390px or 320px. All four Landing tests passed, covering asset
links, mobile sources, valid SVGs, PM-only promotional scope and login redirect preservation.
Final production SPA build passed; the three SVG files and dedicated Landing CSS are
present in dist/spa. Implementation was initially verified locally; see the release record below.

## Web Release (2026-09-07)

- Rebuilt with `npm run build`; modified application files passed ESLint and diff checks.
- 43 targeted tests passed: Landing 4, property selector 6, scope helpers 5,
  session persistence 12, and backend release-safety contracts 16.
- Published `hosting:main` to `tobbythebutler` using Firebase CLI.
- Live site: https://tobbythebutler.web.app/landing
- Live Landing HTML, dedicated CSS, all three SVG previews and SPA index returned HTTP 200
  and matched local build SHA-256 hashes. Public legal/support routes and registration
  entry were also checked for HTTP availability; this is not an authenticated workflow test.
- Backend Functions, Firestore/Storage rules and independent Admin Hosting were not deployed.
- Local editor settings and Firebase cache files are excluded from the source release.
- The earlier authenticated property-read permissions issue remains outside this UI release;
  successful hosting verification does not resolve or validate that data-access workflow.
