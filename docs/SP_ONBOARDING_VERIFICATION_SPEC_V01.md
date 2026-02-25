# SP Onboarding & Verification Spec v0.1

## Platform Scope
- This onboarding and verification logic is shared by Web and iOS clients.
- Client UI may differ, but submission fields, validation, and verification states must remain consistent.

## 1) Goal
- Enable Service Providers (SP) to register, get verified, and become eligible for marketplace opportunities.
- Keep onboarding decoupled from core property/lease/task domains.

## 2) Scope (MVP)
- SP account registration
- SP profile completion
- Document submission for verification
- Admin review workflow
- Activation/deactivation controls

## 3) Actors
- `SP User`: submits profile and verification docs
- `Admin/PMO`: reviews and approves/rejects
- `System`: enforces status-based permissions

## 4) Data Model (New Domain)

### 4.1 `sp_profiles`
- `sp_id` (PK)
- `user_id` (FK to auth user)
- `display_name`
- `provider_type` (individual/company)
- `service_categories[]`
- `service_areas[]`
- `phone`
- `email`
- `avg_response_time_minutes` (derived)
- `rating_avg` (derived)
- `jobs_completed` (derived)
- `availability_status` (online/offline/busy)
- `verification_status` (draft/pending/approved/rejected/suspended)
- `created_at`, `updated_at`

### 4.2 `sp_verification_documents`
- `doc_id` (PK)
- `sp_id` (FK)
- `doc_type` (license/insurance/certificate/id)
- `file_url`
- `file_hash`
- `submitted_at`
- `review_status` (pending/approved/rejected)
- `review_note`
- `reviewed_by`
- `reviewed_at`

### 4.3 `sp_verification_reviews`
- `review_id` (PK)
- `sp_id` (FK)
- `decision` (approved/rejected/suspended)
- `reason_code`
- `review_note`
- `reviewed_by`
- `created_at`

## 5) Onboarding Flow
1. SP signs up (`sp_user` role).
2. System creates `sp_profiles` record with `verification_status=draft`.
3. SP completes mandatory profile fields.
4. SP uploads required verification docs.
5. SP submits for review -> status `pending`.
6. Admin reviews:
   - approve -> `approved`
   - reject -> `rejected` with notes
   - suspend (post-approval) -> `suspended`
7. Only `approved` SP can submit proposals in marketplace.

## 6) Permission Gates
- `draft`: cannot see opportunities.
- `pending`: read-only own profile, cannot propose.
- `approved`: full SP marketplace participation.
- `rejected`: cannot propose; can re-submit docs.
- `suspended`: blocked from new proposals and task actions.

## 7) Validation Rules
- Required profile fields before submit: `display_name`, `provider_type`, `service_categories`, `service_areas`, `phone`, `email`.
- Required documents (MVP baseline): at least one identity/license document.
- File constraints: max size and allowed mime types enforced server-side.

## 8) Events
- `sp.registered`
- `sp.profile_completed`
- `sp.verification_submitted`
- `sp.verification_approved`
- `sp.verification_rejected`
- `sp.suspended`

## 9) Non-Functional
- Full audit log for review decisions.
- Idempotent status updates by `event_id`.
- Secure file access for verification docs.
