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

      // Allow access to user's roles subcollection
      match /roles/{roleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Allow authenticated users to read properties they have access to
    match /properties/{propertyId} {
      allow read: if request.auth != null;

      // Allow write access only if user has a role for this property
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)/roles/$(propertyId));

      // Allow access to all subcollections for users with property access
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
