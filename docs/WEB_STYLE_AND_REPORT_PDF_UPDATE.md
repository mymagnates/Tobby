# Web Style and Report PDF Update

Date: 2026-09-10
Status: implemented and verified locally; not deployed or committed.
Delivery checkout: `/Users/MacAirEZ/Desktop/projectTobby`.

## Completed Scope

- Shared Web action buttons use the existing sage-green design, centered labels, content-based widths and a 44px minimum height. Long labels wrap on narrow screens. Dark mode, icon contrast, keyboard focus, loading, disabled and destructive states are covered. Navigation, icon-only buttons, toggles and native-only screens are excluded from generic action sizing.
- Seven active SP pages (dashboard, leads, bids, invoices, services, credits and profile) and the Owner dashboard/history views use shared Web typography, surfaces, fields, tables and responsive dialogs. No role permissions, marketplace launch gates, pricing or native layouts were changed for this restyling.
- Reports offer Export PDF alongside CSV. The export dialog accepts a company name and previews `Company | Property`. For multiple properties, the title identifies the portfolio and the document lists its property scope. An empty company is allowed; no personal name is substituted.
- PDF content uses the complete currently loaded report result, not only the visible table page. It includes report type, dates, currency, totals, rows, data caveats and page numbers. P&L portfolio breakdowns remain specific to P&L. PM money flows are explicitly not described as company profit.
- Company input affects the export only, not the saved user profile. The optional reporting account field `company_name` supports prefill from profile company/business fields. An older API still permits manual entry, but cannot provide this new prefill field.
- PDF dependencies are dynamically loaded on export. Shared Vite/CommonJS helpers stay in the common vendor chunk so they cannot pull the PDF bundle into startup. A build-graph regression check guards this boundary.

## Files

- Buttons: `src/css/web-workspace.scss`, `src/css/workspace-forms.scss`, scoped legacy overrides in `src/css/app.scss`.
- Role styles: `src/css/role-workspace.scss`, active `Sp*Page.vue` pages, `PoDashboardPage.vue`, and three `Owner*History/ListView.vue` components.
- PDF: `src/pages/ReportsPage.vue`, `src/css/reports-workspace.scss`, `src/utils/reportDocument.js`, `src/services/reportPdf.js`, `backend/reportingAccess.js`, `quasar.config.js`.
- Shared form stylesheet imports in MainLayout and invitation pages were moved to script imports to avoid the Vite/Vue external-style build failure.

## Verification

- 357 targeted tests passed across 11 files: button styling, PDF generation/UI, reporting domain/access/HTTP/client, transaction reporting, deposit domain/client and form theme scope.
- Targeted ESLint and `git diff --check` passed.
- `npm run build` passed. `node tests/report-pdf-bundle.mjs` verified five startup chunks: no PDF static import or startup preload.
- `tests/workspace-buttons-visual.mjs`: six desktop/narrow-screen light/dark scenarios plus native-scope checks passed. Covers icon/label contrast, keyboard focus, disabled/loading behavior and no horizontal overflow.
- `tests/role-workspace-visual.mjs`: 24 mocked scenarios passed for the real SP leads page and three Owner history views at 1280/390/320px in light/dark modes. Owner close controls and overflow are checked. Other SP pages received source review, lint and build verification, not authenticated workflow testing.
- `tests/reporting-visual.mjs`: mocked report/CSV/PDF flow passed, including company prefill/override, a real PDF download, narrow layouts, stale-response protection, access-denied clearing and transaction refresh.
- Downloaded PDF was rendered with Poppler and visually inspected. It shows the company/property title, readable tables and report caveats without the incorrect PM property-income breakdown.
- Browser checks use synthetic data and isolated fixtures, not live financial writes or authenticated production accounts.

## Remaining Release Notes

- Non-Latin text such as Chinese uses an explicit browser Print / Save PDF path, preserving browser font rendering. One-click direct PDF for these scripts needs an embedded Unicode font; it is not implemented. Standard supported text downloads directly.
- Web Hosting and API deployment remain pending. Company prefill requires the optional backend account-field update; user-entered export names work without it.
- The shared checkout contains separate deposit, inventory, mobile and other changes. Review the complete release diff before deploying the shared API or committing; do not publish unrelated work implicitly.
- Existing build warnings remain for Browserslist age, Firebase mixed static/dynamic imports and large chunks. The PDF startup boundary is verified, not a claim of complete startup optimization.
- Dependency installation reported audit findings; a subsequent registry audit could not complete because of DNS access. No broad dependency auto-fix or security-clearance claim was made.

## Recheck Commands

```sh
npm run build
node tests/report-pdf-bundle.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/workspace-buttons-visual.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/role-workspace-visual.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/reporting-visual.mjs
```

Browser commands require the local Playwright browser installation and permission to start isolated local test servers.
