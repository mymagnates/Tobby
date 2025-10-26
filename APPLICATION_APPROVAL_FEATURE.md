# Application Approval/Rejection Feature

## Overview
Property managers and landlords can now approve or reject lease applications directly from the ApplicationDetailPage. When approved, the application data is automatically copied to the lease's tenants subcollection.

## Implementation

### File Modified
- **src/pages/ApplicationDetailPage.vue** - Added approve/reject functionality

## Features

### 1. Action Buttons
Located in the Application Status section:
- **Approve Application** (Green button with check icon)
- **Reject Application** (Red button with cancel icon)

#### Visibility Rules
Buttons only show when application status is:
- `pending` 
- `under review`

Once approved or rejected, buttons disappear.

### 2. Approve Application Flow

#### Process
1. User clicks "Approve Application"
2. System validates lease ID exists
3. Creates tenant document in lease subcollection
4. Updates application status to 'approved'
5. Shows success notification

#### Data Copied to Lease
Location: `leases/{leaseId}/tenants/{applicationId}`

Data structure:
```javascript
{
  // Reference
  application_id: "applicationId",
  
  // Applicant information
  applicant: { /* full applicant data */ },
  co_applicants: [ /* array */ ],
  vehicles: [ /* array */ ],
  pets: [ /* array */ ],
  
  // Lease details
  number_of_occupants: 2,
  desired_move_in_date: "2024-01-01",
  lease_term_months: 12,
  additional_notes: "...",
  
  // Status
  tenant_status: "active",
  move_in_date: "2024-01-01",
  
  // Timestamps
  approved_at: "2024-01-01T12:00:00Z",
  created_at: "2024-01-01T12:00:00Z"
}
```

#### Application Status Update
Fields updated in `lease_applications` collection:
- `status`: Changed to 'approved'
- `approved_at`: Timestamp of approval
- `updated_at`: Current timestamp

### 3. Reject Application Flow

#### Process
1. User clicks "Reject Application"
2. Confirmation dialog appears
3. User confirms rejection
4. Application status updated to 'rejected'
5. Shows success notification

#### Confirmation Dialog
- Warning message asking for confirmation
- Two options:
  - **Cancel**: Closes dialog, no changes
  - **Reject**: Proceeds with rejection

#### Application Status Update
Fields updated in `lease_applications` collection:
- `status`: Changed to 'rejected'
- `rejected_at`: Timestamp of rejection
- `updated_at`: Current timestamp

## User Interface

### Button Styling
- **Approve Button**:
  - Green color (positive)
  - Check circle icon
  - Min width: 180px (140px on mobile)
  - Hover effect: Lifts and shows shadow

- **Reject Button**:
  - Red color (negative)
  - Cancel icon
  - Min width: 180px (140px on mobile)
  - Hover effect: Lifts and shows shadow

### Loading States
- Buttons show loading spinner during processing
- Prevents duplicate submissions
- User cannot dismiss until complete

### Success Notifications
- **Approval**: "Application approved successfully! Tenant data has been added to the lease."
- **Rejection**: "Application has been rejected"

### Error Notifications
- Missing lease ID
- Approval failure
- Rejection failure

## Data Flow

### Approve Flow
```
Click Approve → Validate lease_id → Create tenant in subcollection
                                    → Update application status
                                    → Update UI
                                    → Show notification
```

### Reject Flow
```
Click Reject → Show confirmation → User confirms → Update status
                                                  → Update UI
                                                  → Show notification
```

## Firestore Structure

### Before Approval
```
lease_applications/
  {applicationId}/
    - applicant: {...}
    - co_applicants: [...]
    - vehicles: [...]
    - pets: [...]
    - status: "pending"
    - lease_id: "leaseId123"
```

### After Approval
```
lease_applications/
  {applicationId}/
    - status: "approved"
    - approved_at: "timestamp"
    - updated_at: "timestamp"
    
leases/
  {leaseId}/
    tenants/
      {applicationId}/
        - application_id: "applicationId"
        - applicant: {...}
        - co_applicants: [...]
        - vehicles: [...]
        - pets: [...]
        - tenant_status: "active"
        - approved_at: "timestamp"
```

## Security Considerations

### Access Control
- Only property managers/owners should have access
- Should implement role-based access control
- Firebase security rules should restrict writes

### Data Validation
- Validates lease ID exists before approval
- Checks application exists before operations
- All operations wrapped in try-catch

## Error Handling

### Validation Errors
- Missing lease ID: Shows notification
- Missing application data: Returns early

### Operation Errors
- All async operations have try-catch
- User-friendly error messages
- Console logging for debugging

### Network Errors
- Graceful handling of timeouts
- Retry suggestions in error messages

## Benefits

### For Property Managers
1. **Streamlined Process** - Approve/reject in one click
2. **Automatic Data Transfer** - No manual data entry
3. **Audit Trail** - Timestamps for approvals/rejections
4. **Status Tracking** - Clear visual status indicators

### For System
1. **Data Consistency** - Single source of truth
2. **Subcollection Organization** - Tenants grouped by lease
3. **Relationship Tracking** - Links applications to tenants
4. **Historical Records** - Maintains application history

## Use Cases

### Approval Scenarios
- Applicant meets all requirements
- Background check passed
- Income verified
- References checked
- Ready to move in

### Rejection Scenarios
- Failed background check
- Insufficient income
- Poor references
- Property no longer available
- Applicant withdrew

## Future Enhancements (Potential)

### Approval Features
- Conditional approval with notes
- Approval workflow (multiple approvers)
- Email notification to applicant
- Generate lease agreement
- Set move-in date
- Send welcome packet

### Rejection Features
- Rejection reasons (dropdown)
- Rejection notes
- Email notification with reason
- Keep application for future consideration
- Block/flag applicant

### General
- Role-based access control
- Approval history log
- Bulk approve/reject
- Application comparison
- Scoring system
- Automated approvals based on criteria

## Testing Recommendations

1. Test approval with valid lease ID
2. Test approval without lease ID
3. Test rejection with confirmation
4. Test rejection cancellation
5. Test button visibility based on status
6. Test loading states
7. Test error handling
8. Test data integrity in subcollection
9. Test status updates
10. Test notifications

## Integration Points

### Existing Features
- Links to lease data
- Updates application status
- Uses notification system
- Integrates with Firebase

### Data Dependencies
- Requires `lease_id` in application
- Uses application data structure
- Maintains referential integrity
