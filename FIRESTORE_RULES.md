# Firestore Security Rules for Reminders

## Current Issue

The "asset not accessible" error when creating reminders is likely due to Firestore security rules blocking access to the `properties/{propertyId}/reminders` subcollections.

## Recommended Firestore Rules

Update your Firestore security rules in the Firebase Console (Firestore Database > Rules) with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /roles/{roleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Allow authenticated users to read properties they have access to
    match /properties/{propertyId} {
      allow read: if request.auth != null;

      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)/roles/$(propertyId));

      match /{subcollection=**} {
        allow read, write: if request.auth != null &&
          exists(/databases/$(database)/documents/users/$(request.auth.uid)/roles/$(propertyId));
      }
    }

    // Allow authenticated users to read/write leases
    match /leases/{leaseId} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to read/write test collection
    match /test/{testId} {
      allow read, write: if request.auth != null;
    }

    // ---------------------------------------------------------------
    // Marketplace: Leads, Bids, Conversations, Assignments, SP Profiles
    // ---------------------------------------------------------------

    // Leads: any authenticated user can read open leads.
    // Writes go through backend API only (server-side validation).
    match /leads/{leadId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Bids: only the bid owner (SP) or the lead creator (PM/PO) can read.
    // This ensures SPs cannot see each other's bids.
    match /bids/{bidId} {
      allow read: if request.auth != null && (
        resource.data.sp_id == request.auth.uid ||
        get(/databases/$(database)/documents/leads/$(resource.data.lead_id)).data.creator_id == request.auth.uid
      );
      allow write: if false;
    }

    // Conversations: only participants can read the conversation doc.
    match /conversations/{convId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow write: if false;

      // Messages: participants can read, but quote messages (visibility=="pm_only")
      // are restricted to the PM/PO who owns the conversation.
      match /messages/{msgId} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participants &&
          (resource.data.visibility == "all" ||
           (resource.data.visibility == "pm_only" &&
            get(/databases/$(database)/documents/conversations/$(convId)).data.pm_id == request.auth.uid));
        allow write: if false;
      }
    }

    // Assignments: only the assigned SP or the PM/PO who created the lead can read.
    match /assignments/{assignmentId} {
      allow read: if request.auth != null && (
        resource.data.sp_id == request.auth.uid ||
        resource.data.pm_id == request.auth.uid
      );
      allow write: if false;
    }

    // SP Profiles: owner can read/write, anyone authenticated can read.
    match /sp_profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Alternative Simpler Rules (for testing only)

If you want to test quickly, you can temporarily use these more permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "tobbythebutler" project
3. Click on "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with one of the rule sets above
6. Click "Publish"

## Testing the Rules

After updating the rules:

1. Try creating a reminder again
2. Check the browser console for any error messages
3. If it still fails, check the Firebase Console > Firestore Database > Rules for any rule violations

## Common Issues

- **"asset not accessible"**: Usually means the user doesn't have permission to access the document/collection
- **"permission-denied"**: The security rules are blocking the operation
- **"unauthenticated"**: The user is not properly signed in

## Debugging Steps

1. Check if the user is authenticated: `userDataStore.isAuthenticated`
2. Check if the user has a role for the property: Look in `users/{userId}/roles` collection
3. Check if the property document exists: Look in `properties/{propertyId}`
4. Check the Firestore rules for any syntax errors

The rules above should allow authenticated users to create reminders in properties they have access to.
