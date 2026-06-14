# Native iOS App — Execution Plan

## Overview

Build a native iOS app (iPhone & iPad) that mirrors core features of the Handout property management web app. The app will share the same Firebase backend (`tobbythebutler`) for authentication, Firestore data, and Storage.

**Target:** iOS 16+ (iPhone & iPad)  
**Framework:** SwiftUI  
**Backend:** Firebase (Auth, Firestore, Storage) — same project as web app

---

## Phase 1: Project Setup & Environment

### 1.1 Prerequisites
- [ ] macOS with Xcode 15+ installed
- [ ] Apple Developer account (for device testing; Simulator works without)
- [ ] Firebase project `tobbythebutler` (already exists)
- [ ] CocoaPods or Swift Package Manager (SPM) for dependencies

### 1.2 Create New Xcode Project
1. Open Xcode → Create New Project
2. Choose **App** template
3. Product Name: `Handout` (or `ProjectTobby`)
4. Team: Your Apple Developer team
5. Organization Identifier: e.g. `com.magnates.handout`
6. Interface: **SwiftUI**
7. Language: **Swift**
8. Storage: **None** (Firebase handles persistence)
9. Include Tests: Optional

### 1.3 Add Firebase to iOS Project
1. In Firebase Console: Project Settings → Add app → iOS
2. Register app with Bundle ID (e.g. `com.magnates.handout`)
3. Download `GoogleService-Info.plist` → add to Xcode project
4. Add Firebase SDK via SPM:
   - File → Add Package Dependencies
   - URL: `https://github.com/firebase/firebase-ios-sdk`
   - Select: FirebaseAuth, FirebaseFirestore, FirebaseStorage
5. Initialize Firebase in `@main` App struct:
   ```swift
   FirebaseApp.configure()
   ```

### 1.4 Project Structure (Suggested)
```
Handout/
├── App/
│   └── HandoutApp.swift
├── Core/
│   ├── Firebase/
│   │   ├── FirebaseManager.swift
│   │   ├── AuthService.swift
│   │   └── FirestorePaths.swift
│   ├── Models/
│   │   ├── Property.swift
│   │   ├── Transaction.swift
│   │   ├── Lease.swift
│   │   ├── MxRecord.swift
│   │   └── Document.swift
│   └── SessionManager.swift
├── Features/
│   ├── Auth/
│   │   └── LoginView.swift
│   ├── DataEntry/
│   │   ├── DataEntryHubView.swift      # Flat entry hub
│   │   ├── CreatePropertyView.swift
│   │   ├── CreateTransactionView.swift
│   │   ├── CreateLeaseView.swift
│   │   ├── CreateTaskView.swift
│   │   └── PhotoAttachmentView.swift
│   ├── History/
│   │   └── HistoryView.swift
│   └── Reports/
│       └── QuickReportView.swift
├── Shared/
│   ├── Components/
│   │   ├── PropertyPicker.swift
│   │   └── PhotoPicker.swift
│   └── Extensions/
└── Resources/
    └── GoogleService-Info.plist
```

---

## Phase 2: Authentication & Core Services

### 2.1 Auth Service
- [ ] Implement `AuthService` with:
  - `signIn(email:password:)`
  - `signOut()`
  - `currentUser` publisher
- [ ] Reuse web app’s Firebase Auth (same users)
- [ ] Optional: Add 24h session timeout (mirror `sessionManager` from web)

### 2.2 Firestore Paths (Match Web App)
Document the exact paths used in the web app:

| Data Type    | Collection Path                                      |
|-------------|-------------------------------------------------------|
| User Profile| `users/{userId}`                                      |
| User Roles  | `users/{userId}/roles`                                |
| Properties  | `properties/{propertyId}`                             |
| Transactions| `properties/{propertyId}/transactions`                |
| Tasks (MX)  | `properties/{propertyId}/mxrecords`                   |
| Leases      | `leases` (top-level)                                  |
| Documents   | Varies (property, lease, transaction attachments)     |

### 2.3 Data Models (Swift)
Create Swift structs that mirror Firestore documents. Example for `Transaction`:

```swift
struct Transaction: Identifiable, Codable {
    var id: String?
    var property_id: String
    var transac_type: String
    var transac_from: String
    var transac_to: String
    var amount: Double
    var created_datetime: Date
    var notes: String?
    // ... match web app fields
}
```

**Action:** Extract field names and types from:
- `CreateTransaction.vue`
- `CreateLease.vue`
- `CreateProperty.vue`
- `CreateMxRecord.vue`

---

## Phase 3: Data Entry Hub (Flat UI)

### 3.1 Design: Single-Level Entry Hub
All data entry types accessible from one screen (no nested navigation for entry).

**Layout options:**
- **Option A:** Grid of large tappable cards (Property, Transaction, Lease, Task)
- **Option B:** List with section headers
- **Option C:** Bottom tab bar with “+” floating action → sheet with entry type picker

**Recommended:** Option A — 2×2 or 2×3 grid of cards, each opens a full-screen or sheet form.

### 3.2 Data Entry Hub View
- [ ] `DataEntryHubView.swift`: Main hub with 4–6 entry cards
- [ ] Each card: icon, label, tap → present form
- [ ] Use `NavigationStack` + `sheet` or `fullScreenCover` for forms

### 3.3 Entry Forms (Per Data Type)
- [ ] **CreatePropertyView** — nickname, address, etc. (from `CreateProperty.vue`)
- [ ] **CreateTransactionView** — property, type, from/to, amount, date, notes
- [ ] **CreateLeaseView** — property, tenant, rate, dates, status
- [ ] **CreateTaskView** — property, title, description, due date (from `CreateMxRecord.vue`)

**Code to port:** Form fields and validation logic from Vue components. Manually translate to SwiftUI `Form` + `TextField` / `Picker` / `DatePicker`.

---

## Phase 4: Photo & Document Attachment

### 4.1 Photo Picker Component
- [ ] Use `PhotosUI` (PHPickerViewController) for photo library
- [ ] Use `UIImagePickerController` for camera (wrap in `UIViewControllerRepresentable`)
- [ ] Support: Take Photo, Choose from Library, Choose Document (UIDocumentPickerViewController)

### 4.2 Upload to Firebase Storage
- [ ] Match web app storage paths: `images/{propertyId}/{type}/{filename}`
- [ ] Types: `property`, `transaction`, `lease`, `task`, `document`
- [ ] Compress images before upload (e.g. JPEG 0.8 quality)
- [ ] Store download URL in Firestore document (e.g. `attachments` array)

### 4.3 Attach to Data Entry
- [ ] Add “Attach Photo/Document” button to each entry form
- [ ] Allow multiple attachments per entry
- [ ] Upload on form submit, or queue and upload with record

---

## Phase 5: Quick History (Search, Filter, Group)

### 5.1 History View
- [ ] Combined list of: Transactions, Leases, Tasks (MX records)
- [ ] Each item shows: type icon, title/summary, date, property name

### 5.2 Search
- [ ] Search bar at top
- [ ] Filter by: text (notes, amount, title), date range

### 5.3 Filter & Group by Data Source
- [ ] Filter chips or segmented control: All | Transactions | Leases | Tasks
- [ ] Group by data source type (sections: Transactions, Leases, Tasks)
- [ ] Optional: group by property

### 5.4 Data Loading
- [ ] Fetch from Firestore using same paths as web
- [ ] Use `userAccessibleProperties` logic (filter by user roles)
- [ ] Consider `addSnapshotListener` for real-time updates

---

## Phase 6: Quick Report

### 6.1 Quick Report View
- [ ] Summary cards: Monthly Income, Monthly Expense, Open Tasks (match `IndexPage.vue` stats)
- [ ] Optional: simple chart (e.g. income vs expense bar chart)
- [ ] Date range filter: This Month, Last Month, Custom

### 6.2 Data for Report
- [ ] Aggregate from `transactions` (income/expense by type)
- [ ] Count from `mxrecords` (open tasks)
- [ ] Reuse logic from `ReportsPage.vue` and `IndexPage.vue`

### 6.3 Export (Optional)
- [ ] Share as PDF or CSV (use `UIActivityViewController`)

---

## Phase 7: Navigation & App Structure

### 7.1 Tab Bar (Recommended)
- **Tab 1:** Data Entry Hub (primary)
- **Tab 2:** Quick Report
- **Tab 3:** History
- **Tab 4:** Profile / Settings (logout, user info)

### 7.2 Styling: Modern & Minimal
- System font (SF Pro) or similar
- Light/dark mode support
- Subtle borders, ample padding
- Primary accent color (match web app if desired)
- Use `List`, `Form`, `Card`-style containers

---

## Phase 8: Manual Code Migration Checklist

### From Web App → iOS (Manual Port)

| Web File                    | iOS Target                    | What to Port                          |
|----------------------------|-------------------------------|---------------------------------------|
| `userDataStore.js`         | `FirebaseManager` + ViewModels| Firestore paths, queries, listeners   |
| `useFirebase.js`           | `AuthService` + Storage       | Auth, `createDocument`, `uploadFile`  |
| `CreateTransaction.vue`   | `CreateTransactionView`       | Form fields, validation, submit       |
| `CreateLease.vue`          | `CreateLeaseView`             | Form fields, validation               |
| `CreateProperty.vue`       | `CreatePropertyView`          | Form fields                           |
| `CreateMxRecord.vue`       | `CreateTaskView`              | Form fields                           |
| `propertyIdUtils.js`       | Swift helpers                 | `normalizePropertyId`, `comparePropertyIds` |
| `IndexPage.vue` (stats)    | `QuickReportView`             | Monthly income/expense, open tasks    |
| `ReportsPage.vue`          | `QuickReportView`             | Filters, export logic                 |
| `DocumentsPage.vue`        | History + attachments         | Source filter, document structure     |

### Firebase Config
- Copy `apiKey`, `authDomain`, `projectId`, `storageBucket`, etc. from web `.env` or `firebase.js`
- Use `GoogleService-Info.plist` for iOS (auto-configured when you add iOS app in Firebase Console)

---

## Phase 9: Testing & Deployment

### 9.1 Testing
- [ ] Test on iPhone Simulator (multiple sizes)
- [ ] Test on iPad Simulator (layout adaptation)
- [ ] Test Firebase Auth with existing web users
- [ ] Test Firestore read/write (ensure security rules allow iOS)
- [ ] Test Storage upload from iOS

### 9.2 Firebase Security Rules
- [ ] Ensure Firestore rules allow access from iOS (same rules as web if using `request.auth != null`)
- [ ] Storage rules: allow authenticated uploads to `images/{userId}/...` or `images/{propertyId}/...`

### 9.3 App Store (Optional, Later)
- [ ] App icons (all sizes)
- [ ] Launch screen
- [ ] Privacy policy URL
- [ ] App Store Connect setup

---

## Execution Order Summary

1. **Week 1:** Phase 1 (Setup) + Phase 2 (Auth, Firestore paths, models)
2. **Week 2:** Phase 3 (Data Entry Hub + at least 2 forms: Transaction, Task)
3. **Week 3:** Phase 4 (Photo/document) + Phase 5 (History)
4. **Week 4:** Phase 6 (Quick Report) + Phase 7 (Navigation, polish)
5. **Week 5:** Phase 8 (Port remaining forms) + Phase 9 (Testing)

---

## Files to Create First (Minimal MVP)

1. `HandoutApp.swift` — App entry, Firebase init
2. `AuthService.swift` — Login/logout
3. `LoginView.swift` — Email/password form
4. `DataEntryHubView.swift` — Grid of entry cards
5. `CreateTransactionView.swift` — First full form
6. `FirebaseManager.swift` — Firestore read/write helpers
7. `Property.swift`, `Transaction.swift` — Models

---

---

## Appendix A: Firestore Data Models Reference

### Transaction
**Path:** `properties/{propertyId}/transactions`

| Field           | Type   | Required | Notes                                      |
|-----------------|--------|----------|--------------------------------------------|
| property_id     | String | Yes      | Same as parent property                    |
| transac_type    | String | Yes      | e.g. Rent, Maintenance                     |
| transac_from    | String | Yes      | Role: Property Owner, Tenant, etc.         |
| transac_to      | String | Yes      | Role (cannot equal transac_from)          |
| amount          | Double | Yes      | > 0                                        |
| transac_date    | Date   | Yes      | ISO date string                            |
| note            | String | No       |                                            |
| picture_url     | String | No       | Firebase Storage URL                       |
| role            | String | No       | User's role for this property              |
| created_datetime| Date   | Yes      | Timestamp                                  |

**Role options:** Property Owner, Property Manager, Tenant, Service Provider, Government, HOA

### Task (MX Record)
**Path:** `properties/{propertyId}/mxrecords`

| Field           | Type   | Required | Notes                                      |
|-----------------|--------|----------|--------------------------------------------|
| property_id     | String | Yes      | Same as parent property                    |
| description     | String | Yes      | Task description                           |
| report_date     | Date   | Yes      | ISO date string                            |
| status          | String | Yes      | Open, In Progress, Completed, etc.         |
| createAt        | Date   | Yes      | Timestamp                                  |
| updatedAt       | Date   | Yes      | Timestamp                                  |
| attachments     | Array  | No       | [{url, fileName, storagePath}]             |

### Lease
**Path:** `leases` (top-level) — `property_id` or `property` reference

| Field                    | Type   | Required | Notes                                      |
|--------------------------|--------|----------|--------------------------------------------|
| property_id / property   | Ref    | Yes      | Reference to property                      |
| status                   | String | Yes      | Active, Draft, etc.                        |
| lease_term               | Int    | Yes      | Months                                    |
| lease_create_date        | Date   | Yes      | ISO date string                            |
| rate_type                | String | Yes      | Monthly, Weekly, etc.                      |
| rate_amount              | Double | Yes      |                                            |
| deposit                  | Double | No       |                                            |
| pet_fee                  | Double | No       |                                            |
| application_fee_per_person| Double| No       |                                            |
| utilities_included       | Array  | No       |                                            |
| created_datetime         | Date   | Yes      | Timestamp                                  |

### Property
**Path:** `properties/{propertyId}`

| Field           | Type   | Required | Notes                                      |
|-----------------|--------|----------|--------------------------------------------|
| address         | String | Yes      |                                            |
| nickname        | String | Yes      |                                            |
| type            | String | Yes      | Apartment, House, etc.                     |
| status          | String | Yes      | Active, Vacant, etc.                       |
| spec            | Object | No       | {type, story, bedrooms, bathrooms, size, garage} |

### Storage Path Convention
```
images/{context}/{propertyId}/{sanitizedPropertyName}_{timestamp}_{random}_{index}.{ext}
```
- **context:** `transaction`, `mxrecord`, `property`, `lease`, `document`

---

## Notes

- **Shared backend:** Web and iOS use the same Firebase project. No backend code to move.
- **Offline:** Firestore has built-in offline persistence; enable it for better mobile UX.
- **Code sharing:** No direct code sharing between Vue and Swift. Logic and structure are ported manually.
- **iPad:** Use `NavigationSplitView` or adaptive layouts for larger screens.
