# Web PM/PO Role Restructure Execution Spec V01

## Purpose

This document defines the executable implementation plan for restructuring PM and PO logic on the web app.

The target model is:

- `Property Manager (PM)` remains the default account-level operations user.
- `Property Owner (PO)` is no longer a public registration account type.
- `PO` becomes a property-level relationship and owner-facing workspace.
- A PM can create a property as self-owned, or create a property managed for another owner.
- If managed for another owner, the PM can send an owner invite link.
- The invited owner gets access only to owner-facing pages and only for the invited property scope.

This spec is for web only. Ignore iOS.

## Product Decision

### Final rules

- Public registration keeps only two top-level account types:
  - `Property Manager`
  - `Service Provider`
- Remove `Property Owner` as a public registration choice.
- A newly registered operations user is always stored as account type `pm`.
- Ownership is represented at the property relationship layer, not as the primary account type.
- `po-dashboard` stays in the product, but it becomes an owner workspace, not evidence of a separate public account type.

### Conceptual model

- `account_type` answers: what broad product family does this user belong to.
- `property membership` answers: what relationship does this user have to this property.
- `active workspace` answers: which experience should the user see right now.

For this phase:

- `account_type` allowed values for public signup:
  - `pm`
  - `sp`
  - `tt` via tenant invite flow only
- Property membership allowed values:
  - `pm`
  - `po`
  - `tt`

## Current Problems To Fix

### Problem 1

[`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue) currently asks the user to choose PM vs PO and writes either `account_type: 'pm'` or `account_type: 'po'`.

This must change. Public signup should no longer create `po` account types.

### Problem 2

[`/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue) currently asks for `Your Role in This Property` with options `pm` and `po`.

This must change. The creator is always the manager/operator for the property. The form should capture ownership context instead of asking the creator to choose between PM and PO.

### Problem 3

[`/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js`](/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js) currently treats `po` as an account-level role and redirects PO users to [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PoDashboardPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PoDashboardPage.vue).

This must change. Access to owner pages must be based on owner membership or owner workspace state, not only `account_type === 'po'`.

## Scope

### In scope

- Registration page updates
- PM signup behavior updates
- Create property flow updates
- Owner invite data model
- Owner invite signup/login flow
- Owner workspace routing rules
- User and property relationship data structure changes
- Backward-compatible migration rules for existing `po` account records

### Out of scope

- iOS
- Tenant flow redesign
- SP redesign
- Full billing redesign
- Deep reporting redesign beyond access gating

## Target UX

### Public registration

[`/Users/MacAirEZ/Desktop/projectTobby/src/pages/RegisterLandingPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/RegisterLandingPage.vue)

Keep two public entry cards:

- `Property Manager`
- `Service Provider`

Change the label and description for the operations-side card to remove `Owner` from the headline.

Recommended copy:

- Title: `Property Manager`
- Description: `Create and manage properties, tenants, leases, maintenance, and owner relationships.`

### PM signup

[`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue)

Rename this page internally and visually to PM signup, even if the file name is kept temporarily.

Required UX changes:

- Remove the PM vs PO toggle.
- Keep business/profile questions that are still useful.
- Optional wording update:
  - Replace `About Your Properties` with `About Your Portfolio`
  - Replace `Are you managing properties for others?` with `Which properties will you manage?`

Recommended field:

- `manage_scope` multi-select or dual choice:
  - `My own properties`
  - `Properties for others`

But regardless of the answer, the created account must be:

- `account_type: 'pm'`
- `user_category: 'pm'`
- `account_type_locked: true`

Do not create `account_type: 'po'` from public signup anymore.

### Create property

[`/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue)

Replace `Your Role in This Property` with `Ownership Setup`.

Required options:

- `This is my property`
- `I manage this for another owner`

Behavior:

- If `This is my property`:
  - create property
  - create PM membership for creator
  - create PO membership for creator
  - mark property as self-owned
- If `I manage this for another owner`:
  - create property
  - create PM membership for creator
  - do not create PO membership for creator
  - mark property as managed-for-owner
  - expose owner invite action after create

### Owner invite

New product behavior:

- On property detail page or property list item, PM can trigger `Invite Owner`.
- System generates an owner-scoped invite link.
- Owner can use that link to:
  - sign up if new
  - log in if existing
- After completion, owner receives PO membership for that property only.
- Owner lands on `po-dashboard`.

Owner should not be able to create new properties from owner-only flow.

## Target Data Model

### User document

Collection:

- `users/{userId}`

Required account-level fields after this project:

```json
{
  "user_id": "uid",
  "email": "user@example.com",
  "full_name": "Example User",
  "account_type": "pm",
  "user_category": "pm",
  "account_type_locked": true,
  "manage_scope": ["Own", "Others"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Rules:

- `account_type = 'po'` must not be written for new public signup flows.
- Existing `po` users may remain temporarily during migration, but new code must not depend on account-level `po` as the source of truth.

### Membership document

Existing location:

- `users/{userId}/roles/{roleDocId}`

Target normalized shape for each membership:

```json
{
  "property_id": "property123",
  "user_id": "user123",
  "role": "pm",
  "status": "active",
  "relationship_type": "manager",
  "invite_id": null,
  "granted_by": "user123",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
Or for owner membership:
```json
{
  "property_id": "property123",
  "user_id": "owner456",
  "role": "po",
  "status": "active",
  "relationship_type": "owner",
  "invite_id": "invite789",
  "granted_by": "pm123",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Rules:

- `role = 'pm'` means operational access to property.
- `role = 'po'` means owner-facing access to property.
- The same user may hold both `pm` and `po` memberships on the same property.

### Property document

Collection:

- `properties/{propertyId}`

Add these fields:

```json
{
  "ownership_mode": "self_owned",
  "owner_user_ids": ["user123"],
  "manager_user_ids": ["user123"],
  "primary_owner_user_id": "user123",
  "created_by_user_id": "user123",
  "updated_by_user_id": "user123"
}
```

Allowed `ownership_mode` values:

- `self_owned`
- `managed_for_owner`

Rules:

- `self_owned`: creator gets both PM and PO membership.
- `managed_for_owner`: creator gets PM only until an owner accepts an invite.

### Owner invite document

Add a new collection:

- `owner_invites/{inviteId}`

Required shape:

```json
{
  "invite_id": "invite789",
  "property_id": "property123",
  "pm_user_id": "pm123",
  "invited_by_user_id": "pm123",
  "owner_email": "owner@example.com",
  "owner_name": "Example Owner",
  "status": "pending",
  "token": "secure-random-token",
  "expires_at": "timestamp",
  "accepted_at": null,
  "accepted_by_user_id": null,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Allowed `status` values:

- `pending`
- `accepted`
- `expired`
- `revoked`

Rules:

- `owner_invites` is bridge data only.
- `owner_invites` must not be treated as final access control truth.
- Final owner access is created only when invite acceptance writes a `po` membership under the accepting user.
- The same email may receive invites for multiple different properties.
- The same email may receive invites from multiple different PM users.
- A user account must never be duplicated just because a new owner invite is accepted.

Recommended extra fields:

```json
{
  "granted_role": "po",
  "relationship_type": "owner",
  "message": "Optional invite message",
  "last_sent_at": "timestamp",
  "revoked_at": null,
  "revoked_by_user_id": null
}
```

### Owner identity and multi-property rule

Final rule:

- An owner registers once.
- The same owner account can hold owner access to multiple properties.
- Those properties may be managed by the same PM or by different PM users.

This means:

- owner identity is account-level
- owner access is property-level
- invite acceptance adds a new property membership, not a new owner account

Do not implement:

- one owner account per property
- one owner account per PM
- forced re-registration when an existing owner receives a new invite

## Source Of Truth Rules

### Account-level truth

Use `users.account_type` only for broad application family:

- `pm`
- `sp`
- `tt`
- `admin`

Do not use account-level `po` for new logic.

### Property access truth

Property permissions must be resolved from property membership records in `users/{uid}/roles`.

### Workspace truth

Owner workspace access is granted if the signed-in user has at least one active `po` membership.

## Required Frontend Changes

### 1. Register landing

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/RegisterLandingPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/RegisterLandingPage.vue)

Tasks:

- Change PM/PO card label to `Property Manager`.
- Update description copy.
- Keep route target to the existing PM signup page for now, unless the page is renamed in the same PR.

### 2. PM signup page

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PmPoSignUpPage.vue)

Tasks:

- Remove PM/PO toggle that currently maps to `PM` or `PO`.
- Always write:
  - `account_type: 'pm'`
  - `user_category: 'pm'`
- Preserve `manage_scope` if captured.
- Remove any code path that writes `account_type: 'po'`.
- Update success copy if needed to `Manager account created successfully`.

### 3. Account type setup page

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/AccountTypeSetupPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/AccountTypeSetupPage.vue)

Tasks:

- Remove any path that lets a user choose owner as a primary account type.
- Keep options:
  - `Manager`
  - `Service Provider`
- If operations-side option is selected, write `account_type: 'pm'`.
- Preserve `manage_scope` support.

### 4. Create property page/component

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/components/CreateProperty.vue)

Tasks:

- Remove the `userRole` select.
- Replace it with `ownershipMode` field.
- Add values:
  - `self_owned`
  - `managed_for_owner`
- On submit:
  - always create PM membership for creator
  - create PO membership for creator only when `ownershipMode === 'self_owned'`
  - write ownership fields onto property doc
- Do not force the creator to declare themselves PO instead of PM.

### 5. Property page owner invite entry point

Files likely affected:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PropertyView.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PropertyView.vue)
- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/MyPropertiesPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/MyPropertiesPage.vue)

Tasks:

- Add `Invite Owner` action when:
  - signed-in user has PM membership on that property
  - property is `managed_for_owner`
- Hide or disable invite when:
  - property already has an accepted primary owner
  - current user is owner-only

### 6. New owner invite acceptance page

Add a new public route and page.

Suggested route:

- `/public/owner-invite/:token`

Suggested file:

- `src/pages/OwnerInvitePage.vue`

Required behavior:

- Load invite by token
- Show property summary
- Support:
  - sign up
  - login
- On completion:
  - create or update user profile if needed
  - create PO membership for property if it does not already exist
  - update invite to `accepted`
  - update property owner fields
  - redirect to `/po-dashboard`

Required branching behavior:

- If the invitee does not have an account:
  - complete account creation
  - then write PO membership for the invited property
- If the invitee already has an account:
  - allow login
  - skip registration entirely
  - then write PO membership for the invited property

Required validation behavior:

- Invite acceptance must validate:
  - token is valid
  - invite status is `pending`
  - invite is not expired
  - logged-in or registering email matches `owner_email`
- If the accepting user already has a `po` membership for that property:
  - do not create a duplicate membership
  - still mark the invite as `accepted` if it is the matching pending invite

Required product language:

- Do not label this flow as public owner signup.
- Use wording such as:
  - `Accept owner invitation`
  - `Create your owner access`
  - `Sign in to accept access`

### 7. Owner dashboard and owner-only navigation

Files likely affected:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/pages/PoDashboardPage.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/pages/PoDashboardPage.vue)
- [`/Users/MacAirEZ/Desktop/projectTobby/src/layouts/MainLayout.vue`](/Users/MacAirEZ/Desktop/projectTobby/src/layouts/MainLayout.vue)
- [`/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js`](/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js)

Tasks:

- Keep `po-dashboard`.
- Reinterpret it as an owner workspace.
- Add a computed flag such as `hasPoMembership`.
- Route to owner pages based on membership, not only account type.
- Remove assumptions that a PO user cannot also be a PM account.

## Required Backend And Data Changes

### 1. Stop creating `po` as account type in web flows

Any backend or helper code that normalizes owner to `account_type = 'po'` must be changed.

Known file to review:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/services/webApiClient.js`](/Users/MacAirEZ/Desktop/projectTobby/src/services/webApiClient.js)

Tasks:

- Keep role label normalization for membership use if needed.
- Do not use `po` as the primary account classification for new signup or routing logic.

### 2. Create owner invite persistence

Required API capability:

- create owner invite
- validate invite by token
- accept invite
- revoke invite

Implementation may be:

- Firestore direct from client if existing security model supports it
- backend endpoint if token issuance should stay server-controlled

Preferred rule:

- token generation and invite acceptance validation should be server-side if practical
- if implemented client-side temporarily, secure token entropy and Firestore rules are mandatory

Required persistence rule:

- `owner_invites` stores pending bridge state only.
- `users/{uid}/roles` stores final granted property access.
- `properties.owner_user_ids` and `properties.primary_owner_user_id` are denormalized convenience fields, not the only source of truth.

Invite dedupe rule:

- Only one active pending invite should exist for the same `property_id + owner_email`.
- Re-sending should update or replace the existing pending invite instead of creating unlimited duplicates.

### 3. Property membership write rules

When creating or accepting relationships:

- PM property creation must write PM membership
- self-owned property creation must also write PO membership
- owner invite acceptance must write PO membership only for invited property
- owner invite acceptance must write membership under the accepting existing user if that user already has an account
- owner invite acceptance must not create a second user record for an email that already belongs to an existing account

### 4. Security rules review

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/storage.rules`](/Users/MacAirEZ/Desktop/projectTobby/storage.rules)

Also review any Firestore rules source not currently checked in under the repo root.

Tasks:

- Ensure owner users can only access properties where they hold active PO membership.
- Ensure PM users can manage owner invites only for properties where they hold PM membership.
- Ensure owner invite acceptance cannot grant access to the wrong property.
- Ensure owner invite acceptance cannot attach an invite to a different email identity than the invited email.

## Migration Plan

### Migration goal

Preserve existing users while moving source of truth from account-level `po` to property-level owner membership.

### Existing records to migrate

Look for:

- users with `account_type = 'po'`
- users with `user_category = 'po'`
- properties where owner relationships are implied but not explicitly stored
- user role documents missing normalized timestamps/status fields

### Migration rules

For each existing user with `account_type = 'po'`:

1. keep the user record readable
2. infer related properties from `users/{uid}/roles` with `role = 'po'`
3. if the user also performs operations, migrate account-level type to `pm`
4. if the user is truly owner-only, either:
   - keep `account_type = 'pm'` with owner-only workspace access
   - or allow a temporary legacy account type but do not let new code depend on it

Recommended migration target:

- convert all legacy `po` account types to `pm`
- preserve owner access exclusively through PO memberships

### Backward compatibility during rollout

For one rollout window, routing may support this temporary fallback:

- if user has `account_type = 'po'` and no computed PO membership loaded yet, allow owner workspace

This fallback must be clearly marked as temporary and removed after migration.

## Router And Access Rules

### Replace account-level PO checks

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js`](/Users/MacAirEZ/Desktop/projectTobby/src/router/index.js)

Current state:

- `po` users are redirected from `/` to `/po-dashboard`

Target state:

- if account type is `sp`, keep SP routing
- if account type is `tt`, keep tenant routing
- if user has active PO membership and no PM workspace selected, allow owner workspace
- if user has PM account and PM memberships, default to manager workspace
- owner-only users should default to `/po-dashboard`

Implementation recommendation:

- add computed store helpers:
  - `hasPoMembership`
  - `hasPmMembership`
  - `isOwnerOnlyUser`
  - `isManagerCapableUser`

Do not derive these only from `account_type`.

## Store Changes

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/stores/userDataStore.js`](/Users/MacAirEZ/Desktop/projectTobby/src/stores/userDataStore.js)

Required additions:

- normalized membership parsing
- computed `pmMemberships`
- computed `poMemberships`
- computed `hasPoMembership`
- computed `hasPmMembership`
- computed `isActiveRolePo` only if explicit workspace switching exists

Required behavior:

- property access must merge all active memberships
- owner workspace should filter properties to those with `po` membership
- manager workspace should filter properties to those with `pm` membership

## Role Utility Changes

File:

- [`/Users/MacAirEZ/Desktop/projectTobby/src/utils/roleUtils.js`](/Users/MacAirEZ/Desktop/projectTobby/src/utils/roleUtils.js)

Tasks:

- keep `po` normalization for membership parsing
- stop equating `normalizeAccountType('po')` with a valid new public account type
- separate:
  - `normalizeAccountType`
  - `normalizeMembershipRole`

This split is recommended to avoid reintroducing the same modeling bug.

## Suggested Implementation Order

### Phase 1

- update registration copy
- change PM signup to always create `pm`
- change account-type setup to remove owner as primary account type

### Phase 2

- change create property ownership flow
- write new property ownership fields
- write PM and PO memberships correctly

### Phase 3

- implement owner invite storage and page
- implement owner acceptance flow

### Phase 4

- update router and store logic to use membership-based owner access
- preserve temporary backward compatibility for legacy PO account types

### Phase 5

- run migration for legacy PO account-level records
- remove temporary fallbacks

## Acceptance Criteria

### Registration

- A public operations user can no longer sign up as `po`.
- Public operations signup always creates `account_type = 'pm'`.
- Service provider signup remains unchanged.

### Property creation

- Property creator is never forced to choose between being PM or PO.
- Creator can choose self-owned vs managed-for-owner.
- Self-owned property gives creator both PM and PO memberships.
- Managed-for-owner property gives creator PM membership only.

### Owner invite

- PM can generate an owner invite for a managed property.
- Invited owner can sign up or log in from the invite page.
- Invite acceptance grants PO membership for only the invited property.
- Existing users can accept the invite without creating a second account.
- One owner account can accumulate PO access to multiple properties.
- Accepted owner lands on `po-dashboard`.

### Routing

- Owner workspace access works even when user account type is `pm`.
- Legacy `po` account type records still work during migration.
- New code no longer requires `account_type = 'po'` to reach owner pages.

### Permissions

- Owner-only users cannot create properties.
- Owner users cannot access unrelated PM pages unless they also hold PM capability.
- PM users can manage owner invites only on their properties.

## Manual Test Checklist

### Scenario 1

- Register a new PM user
- Verify user doc writes `account_type = 'pm'`
- Verify no `po` account type is created

### Scenario 2

- Create property as `self_owned`
- Verify property gets `ownership_mode = 'self_owned'`
- Verify creator gets both PM and PO memberships
- Verify owner workspace is accessible

### Scenario 3

- Create property as `managed_for_owner`
- Verify creator gets PM membership only
- Verify property can show `Invite Owner`

### Scenario 4

- Send owner invite
- Accept invite as new user
- Verify invited user gets PO membership only for that property
- Verify redirect to `po-dashboard`

### Scenario 5

- Sign in as owner-only user
- Verify `Create Property` is hidden or blocked
- Verify owner sees only owner-allowed navigation

### Scenario 6

- Sign in as legacy PO user migrated from old data
- Verify owner workspace still loads during compatibility window

### Scenario 7

- Invite an email that already belongs to an existing account
- Accept invite by logging in
- Verify no second user is created
- Verify a new `po` membership is added for the invited property
- Verify owner can switch to the new property in `Owner's View`

### Scenario 8

- Invite the same owner email to properties managed by two different PM users
- Accept both invites with the same account
- Verify one account holds multiple `po` memberships across PMs
- Verify property selector in `Owner's View` shows both properties

## Non-Negotiable Implementation Rules

- Do not introduce new public signup flow that writes `account_type = 'po'`.
- Do not use account-level `po` as the long-term permissions source of truth.
- Do not keep the old `CreateProperty` PM/PO selector after this change.
- Do not couple owner dashboard eligibility solely to `user_category === 'po'`.
- Do not create a second owner account when an invited email already belongs to an existing user.
- Do not treat `owner_invites` as final permissions truth.

## Developer Notes

If implementation needs a short-term bridge for rollout, it is acceptable to support both:

- legacy account-level `po`
- new membership-level `po`

But all new writes must follow the new model.

If the team wants a lower-risk first PR, split work into:

1. signup and create-property data model correction
2. owner invite flow
3. router and migration cleanup
