# Web Workspace Forms

Updated: 2026-09-09

## Design

- Warm white canvas, white surfaces, deep green primary actions, muted green-gray labels and thin borders match the workspace and landing page.
- Save/submit remains the primary action; Cancel is neutral and outlined. Destructive actions retain their warning colors.
- Consistent section headings, 8px field corners, 16px input text, at least 44px primary action targets, and readable validation states.
- Desktop forms have a bounded width. Mobile forms stack their existing columns and allow vertical scrolling without horizontal overflow.
- No field, validation, account-role, quota, permission or persistence changes are intended.

## Integration

- `src/css/workspace-forms.scss` contains the shared presentation.
- `useWebFormTheme` activates `body.workspace-forms-theme` for Web workspaces, including teleported Quasar dialogs and menus, and removes the marker when the final active scope unmounts.
- Native layouts do not activate the marker. Login and registration keep their separate public-auth design system.
- `workspace-form` marks a form/card; `workspace-form-cancel`, `workspace-form-heading`, `workspace-form-actions`, and `workspace-form-inline-actions` identify semantic elements.
- Shared styles override legacy global dark dialog headers and blue-gray component styles only within opted-in Web forms.
- The global creation dialog no longer nests an additional Quasar layout inside the main layout; its content uses the dialog's scrolling surface.

## Coverage

- Property creation and property editing.
- Task, transaction, lease, asset, document, reminder and service creation.
- Tenant creation.
- Contact editing, property access invitations, owner/access invitation acceptance and report-content forms.
- Destructive confirmation modals, image viewers, the independent Admin website, native mobile forms and the static public support page are not redesigned.

## Verification

Reproducible fixture tests use real Vue/Quasar form components with intercepted data modules. External network requests and real writes are blocked. They do not establish production authorization or backend correctness.

```bash
node_modules/.bin/vitest run tests/unit/components/CreateProperty.test.js tests/unit/components/PublicAuthForms.test.js tests/unit/components/PropertyContextSwitcher.test.js tests/unit/composables/useWebFormTheme.test.js
# Quasar development server required; browser runtime may need installation.
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/handout-auth-browsers node tests/workspace-forms-visual.mjs
npm run build
```

No deployment or Git push is part of this UI change. Browser evidence and remaining gaps are reported with the implementation results.
