# PM Storage Quota Deployment

## What This Enables

Property, property-document, and lease inventory uploads now require a verified PM to:

1. reserve storage through `POST /api/storage/upload-reservations`;
2. upload to the returned ten-minute signed URL;
3. commit through `POST /api/storage/upload-reservations/:id/commit`.

The commit endpoint reads the actual object size and adds it to the PM billing usage. Direct Firebase SDK writes to the protected paths are denied by `storage.rules`.

## One-Time Google Cloud IAM Setup

Run these commands from an authenticated Google Cloud CLI session. They discover the Firebase Functions v2 `mkpl` runtime service account rather than assuming a default account.

```bash
export PROJECT_ID=tobbythebutler
export REGION=us-central1
export SERVICE_NAME=mkpl

export RUNTIME_SA="$(gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format='value(spec.template.spec.serviceAccountName)')"

echo "$RUNTIME_SA"
```

Grant object access to that runtime identity. The backend must write temporary upload objects, read their final metadata, and support later deletion/reconciliation.

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/storage.objectAdmin"
```

Grant the runtime identity permission to create V4 signed URLs through IAM Credentials.

```bash
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project="$PROJECT_ID"
```

Do not put a service-account JSON key, Storage key, or signing key in frontend environment files.

## Deploy

Run the checks before deployment:

```bash
export PATH=/Users/MacAirEZ/.nvm/versions/node/v22.17.0/bin:$PATH
npm run test:unit
npm run test:rules
npm run build
```

Deploy the function first, then the Storage rule change, then Hosting:

```bash
firebase deploy --only functions:mkpl --project tobbythebutler
firebase deploy --only storage --project tobbythebutler
firebase deploy --only hosting:main --project tobbythebutler
```

## Production Verification

1. Sign in as a PM with an active `users/{uid}/roles` entry for a property.
2. Upload a small image from an MX record, Asset, Transaction, Tenant, Property, or inventory page.
3. Confirm the UI completes and `GET /api/billing/usage` increases by the actual object size.
4. Fill the same PM's storage usage to its limit and confirm the next reservation returns `402 STORAGE_CREDIT_EXHAUSTED` before a file is uploaded.
5. Attempt a Firebase SDK upload to `images/mxrecord/{propertyId}/manual-test.jpg`; it must receive `storage/unauthorized`.

## Operational Follow-Up

Reservations expire after ten minutes. Add a scheduled reconciliation job before broad rollout to mark expired reservations and remove orphaned objects. Deletion paths should also decrement the billing storage ledger; this is not part of the initial upload cutover.
