# Add Document After Submission Feature

## Overview
Users can now add additional documents to their lease application after it has been submitted. This allows applicants to provide additional supporting documentation as needed.

## Implementation

### File Modified
- **src/pages/ApplicationDetailPage.vue** - Added document upload functionality

## Features

### 1. Add Document Button
- Located in the "Supporting Documents" section header
- Visible to all users viewing the application
- Opens upload dialog when clicked

### 2. Documents Section Updates
- Shows document count in header
- Displays empty state when no documents exist
- Lists all documents with metadata:
  - Document name
  - Description (if provided)
  - File name
  - Upload date
  - Download button

### 3. Upload Dialog
Features:
- **Document Name Field** (Required)
  - Text input for document name
  - Examples: "Pay Stub", "ID", "Bank Statement"
  
- **Description Field** (Optional)
  - Textarea for additional notes
  
- **File Upload** (Required)
  - Accepts: PDF, JPG, JPEG, PNG, DOC, DOCX
  - Max file size: 10MB
  - File size validation
  - Type validation

- **Action Buttons**:
  - Cancel: Closes dialog without saving
  - Upload: Uploads file and saves to application

### 4. Upload Process
1. User fills in document details
2. Selects file to upload
3. Clicks "Upload" button
4. File uploads to Firebase Storage
5. Document metadata saved to Firestore
6. Application updated with new document
7. Success notification shown
8. Dialog closes and list updates

## User Flow

```
View Application → Click "Add Document" → Fill Form → Upload
    ↓                                                    ↓
Display              ← Success Notification ← Update Firestore
Updated List                                 & Storage
```

## Technical Details

### Firebase Storage
- Files stored at: `images/lease_applications/{applicationId}/`
- Unique file names generated automatically
- Download URLs stored in Firestore

### Firestore Update
- Updates `documents` array in application document
- Adds `updated_at` timestamp
- Preserves existing documents

### Document Data Structure
```javascript
{
  name: "Document Name",
  description: "Optional description",
  url: "https://storage.googleapis.com/...",
  storage_path: "images/lease_applications/...",
  file_name: "unique-filename.pdf",
  uploaded_at: "2024-01-01T12:00:00.000Z"
}
```

### State Management
- `showAddDocumentDialog`: Controls dialog visibility
- `uploadingDocument`: Loading state during upload
- `newDocument`: Form data for new document

### Functions Added

#### 1. `uploadDocument()`
- Validates form data
- Uploads file to Firebase Storage
- Updates Firestore document
- Updates local application state
- Shows success/error notifications

#### 2. `onFileRejected()`
- Handles file validation failures
- Shows error notification

#### 3. `closeAddDocumentDialog()`
- Closes dialog
- Resets form data

## Security & Validation

### Client-Side Validation
- Document name required
- File required
- File type restriction (PDF, images, docs)
- File size limit (10MB)

### Firebase Rules
- Uses existing Firestore security rules
- Uses existing Storage security rules
- Files stored with application-specific paths

## User Experience

### Loading States
- Upload button shows spinner during upload
- Dialog remains open until upload completes
- User cannot dismiss during upload (persistent dialog)

### Error Handling
- File rejection notification (size/type errors)
- Upload failure notification
- Network error handling
- Graceful fallbacks

### Success Feedback
- Success notification with message
- Dialog auto-closes
- Document list updates immediately
- Scroll to see new document

## Empty State
When no documents exist:
- Shows large document icon
- "No documents uploaded yet" message
- Helpful text guiding user to add documents

## Responsive Design
- Mobile-friendly dialog
- Responsive form layout
- Touch-friendly buttons
- Proper spacing on all devices

## Benefits

1. **Flexibility**: Add documents anytime after submission
2. **Completeness**: Provide additional proof when requested
3. **Convenience**: No need to resubmit entire application
4. **Transparency**: All documents visible with upload dates
5. **Professional**: Clean, organized document management

## Use Cases

- Landlord requests additional proof of income
- Updated bank statements
- Additional identification
- Co-signer documents
- Pet vaccination records
- Reference letters
- Credit reports
- Employment verification

## Future Enhancements (Potential)
- Document deletion
- Document replacement
- Multiple file upload at once
- Drag-and-drop upload
- Document preview
- Document categorization
- Required documents checklist
- Email notification on upload
- Admin document requests
- Document approval status
