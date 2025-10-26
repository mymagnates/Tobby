# Firebase Storage Folder Structure

This document outlines the folder structure used for storing files in Firebase Storage.

## Folder Structure

```
storage/
├── lease_applications/
│   └── {applicationId}/
│       └── documents/
│           ├── {filename1}.pdf
│           ├── {filename2}.jpg
│           └── {filename3}.docx
│
├── leases/
│   └── {leaseId}/
│       └── documents/
│           ├── {filename1}.pdf
│           └── {filename2}.jpg
│
└── properties/
    └── {propertyId}/
        ├── images/
        │   ├── {image1}.jpg
        │   └── {image2}.png
        └── documents/
            └── {filename}.pdf
```

## Detailed Structure

### 1. Lease Applications

**Path:** `lease_applications/{applicationId}/documents/`

**Purpose:** Stores all documents uploaded by applicants or property managers related to a lease application.

**Document Types:**

- ID verification (driver's license, passport)
- Income verification (pay stubs, bank statements)
- Employment verification
- Credit reports
- Background checks
- Any other supporting documents

**Upload Location:** ApplicationDetailPage.vue

**Workflow:**

1. Applicant submits application
2. Applicant/Manager uploads documents to application
3. Documents stored at: `lease_applications/{applicationId}/documents/`
4. When application approved → Documents copied to lease (metadata preserved)

**Example:**

```
lease_applications/
  app123/
    documents/
      drivers_license_front.jpg
      drivers_license_back.jpg
      pay_stub_jan.pdf
      pay_stub_feb.pdf
      bank_statement.pdf
```

---

### 2. Leases

**Path:** `leases/{leaseId}/documents/`

**Purpose:** Stores all documents related to a lease, including:

- Documents copied from approved applications
- Lease agreements
- Addendums
- Inspection reports
- Any lease-related documents

**Document Sources:**

- **From Applications:** Documents with `source: 'application'` and `application_id` metadata
- **Direct Uploads:** Documents uploaded directly to the lease

**Upload Location:** LeaseDocuments.vue component

**Workflow:**

1. Application approved → Application documents copied here with metadata
2. Property manager uploads lease documents directly
3. All documents accessible in lease detail page

**Metadata for Application Documents:**

```javascript
{
  name: "Driver's License",
  description: "ID verification",
  file_url: "...",
  file_type: "image/jpeg",
  upload_date: "2025-01-10T...",
  // Metadata added when copied from application:
  source: "application",
  application_id: "app123",
  copied_at: "2025-01-10T12:00:00Z",
  category: "Application Documents"
}
```

**Example:**

```
leases/
  lease456/
    documents/
      lease_agreement_signed.pdf
      move_in_checklist.pdf
      drivers_license_front.jpg (copied from application)
      pay_stub_jan.pdf (copied from application)
```

---

### 3. Properties

**Path:** `properties/{propertyId}/images/` and `properties/{propertyId}/documents/`

**Purpose:** Stores property-related media and documents.

**Images Subfolder:**

- Property photos
- Unit photos
- Amenity photos
- Before/after renovation photos

**Documents Subfolder:**

- Property deed
- Insurance documents
- HOA documents
- Permits and licenses
- Maintenance records

**Example:**

```
properties/
  prop789/
    images/
      exterior_front.jpg
      living_room.jpg
      kitchen.jpg
      bathroom.jpg
    documents/
      property_deed.pdf
      insurance_policy.pdf
      hoa_rules.pdf
```

---

## File Naming Conventions

### Automatic Naming

Files are automatically named by Firebase Storage with timestamps to prevent conflicts:

- Original: `document.pdf`
- Stored as: `document_1704902400000.pdf`

### Document Metadata

Each document stored in Firestore includes:

```javascript
{
  name: "User-friendly display name",
  description: "Optional description",
  file_url: "Full Firebase Storage URL",
  file_type: "MIME type (e.g., application/pdf, image/jpeg)",
  upload_date: "ISO timestamp",
  file_size: "Size in bytes (optional)",

  // For application documents copied to leases:
  source: "application",
  application_id: "Original application ID",
  copied_at: "When copied to lease",
  category: "Document category"
}
```

---

## Access Patterns

### 1. Application Documents

- **Upload:** Applicants/managers upload to application after submission
- **View:** Application detail page shows all application documents
- **Download:** Direct download from application detail page
- **Copy:** Automatically copied to lease when application approved

### 2. Lease Documents

- **View All:** Lease detail page → Documents button
- **View Tenant Docs:** Lease detail page → Tenant section → Documents
- **Download:** Click download button on any document
- **Filter:** Tenant documents filtered by `application_id` and `source`

### 3. Property Files

- **Upload:** Property creation/edit pages
- **View:** Property detail pages
- **Display:** Property images shown in listings

---

## Security Considerations

### Storage Rules

Firebase Storage rules should enforce:

1. Authenticated users only
2. Users can only access their own applications/leases
3. Property managers can access applications for their properties
4. File size limits (e.g., 10MB)
5. Allowed file types only

### Example Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Lease Applications
    match /lease_applications/{applicationId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024;
    }

    // Leases
    match /leases/{leaseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Properties
    match /properties/{propertyId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Backup and Maintenance

### Recommendations

1. **Regular Backups:** Export storage files periodically
2. **Cleanup:** Remove documents from deleted applications/leases
3. **Archival:** Move old documents to archive folder after lease ends
4. **Storage Monitoring:** Track storage usage and costs

### Cleanup Workflow

When deleting applications or leases:

1. Archive documents to backup storage
2. Delete from active storage after grace period (e.g., 90 days)
3. Maintain audit log of deletions

---

## Document Flow Diagram

```
Application Submission
        ↓
Upload Documents → lease_applications/{appId}/documents/
        ↓
View in Application Detail Page
        ↓
[Application Approved]
        ↓
Documents Copied → leases/{leaseId}/documents/
    (with metadata: source, application_id, copied_at)
        ↓
View in Lease Detail Page
    - All Lease Documents (via Documents button)
    - Tenant Documents (in Tenant section)
        ↓
    Download Available
```

---

## Implementation Files

- **Upload Logic:** `src/composables/useFirebase.js` → `uploadImagesWithDetails()`
- **Application Uploads:** `src/pages/ApplicationDetailPage.vue`
- **Lease Uploads:** `src/components/LeaseDocuments.vue`
- **Document Copy:** `src/pages/ApplicationDetailPage.vue` → `approveApplication()`
- **Tenant Docs Display:** `src/pages/LeasesPage.vue` → Tenant section

---

## Future Enhancements

1. **Versioning:** Track document versions (v1, v2, etc.)
2. **Categories:** Better categorization of documents
3. **OCR:** Extract text from uploaded documents
4. **Thumbnails:** Generate thumbnails for images/PDFs
5. **Compression:** Auto-compress large files
6. **Expiration:** Mark documents with expiration dates
7. **Sharing:** Generate secure sharing links for specific documents
8. **E-signatures:** Integrate document signing capability
