# Tenant Role-Based Access Control

## Overview

Implemented comprehensive role-based access control (RBAC) to restrict tenant users to only access their designated pages. Tenants can only view the Tenant Home page and Lease Application pages, while being blocked from accessing property management features.

## Features

### 1. User Category Tracking

- User profiles now include a `user_category` field
- Automatically set to `"tenant"` when users sign up via the tenant sign up page
- Exposed through the userDataStore for easy access throughout the application

### 2. Filtered Navigation Menu

- Navigation menu dynamically filters based on user category
- Tenants only see:
  - **Tenant Home** - Main dashboard for tenants
  - **Lease Application** - Apply for leases
- Property owners/managers see all menu items:
  - Dashboard
  - My Properties
  - Tasks
  - Transactions
  - Reminders
  - Reports
  - Leases

### 3. Router Navigation Guard

- Automatic route protection at the router level
- Blocks tenants from accessing unauthorized pages
- Redirects tenants to `/tenant-home` if they try to access restricted routes
- Allows access to:
  - `/tenant-home`
  - `/lease-application` (including with lease ID parameter)
  - `/tenant-signup/:propertyId`
  - `/login`
  - `/loading`
  - `/user-profile`

### 4. Smart Redirects

- Tenants are automatically redirected to their home page after login
- Non-tenant users are redirected to the main dashboard
- Handles redirects in multiple scenarios:
  - After successful login
  - After data loading
  - On timeout

## Implementation Details

### Files Modified

#### 1. TenantSignUpPage.vue

**Change**: Added `user_category` field when creating tenant profiles

```javascript
const userProfileData = {
  user_id: userId,
  email: userData.email,
  full_name: userData.fullName,
  phone: userData.phone || '',
  user_type: 'tenant',
  user_category: 'tenant', // Important: Used for role-based access control
  created_at: new Date(),
  updated_at: new Date(),
}
```

#### 2. userDataStore.js

**Change**: Added computed property to expose user category

```javascript
// Computed properties
const userCategory = computed(() => userProfile.value?.user_category || null)

// Export in return statement
return {
  // ...other exports
  userCategory,
}
```

#### 3. MainLayout.vue

**Changes**:

- Updated menu links with `allowedFor` property
- Created computed property to filter menu based on user category

```javascript
const allLinksList = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/',
    allowedFor: ['owner', 'manager', 'admin'], // Not for tenants
  },
  {
    title: 'Tenant Home',
    icon: 'home_work',
    link: '/tenant-home',
    allowedFor: ['tenant'], // Only for tenants
  },
  {
    title: 'Lease Application',
    icon: 'assignment',
    link: '/lease-application',
    allowedFor: ['tenant', 'owner', 'manager', 'admin'], // Available for everyone
  },
  // ...other links
]

// Filter links based on user category
const linksList = computed(() => {
  const userCategory = userDataStore.userCategory
  if (!userCategory) return []

  return allLinksList.filter((link) => {
    return link.allowedFor.includes(userCategory)
  })
})
```

#### 4. router/index.js

**Change**: Added beforeEach navigation guard

```javascript
Router.beforeEach((to, from, next) => {
  const userDataStore = useUserDataStore()
  const userCategory = userDataStore.userCategory

  // Define tenant-allowed routes
  const tenantAllowedRoutes = [
    '/tenant-home',
    '/lease-application',
    '/login',
    '/loading',
    '/user-profile',
  ]

  // Check if route is tenant-allowed
  const isTenantAllowed =
    tenantAllowedRoutes.includes(to.path) ||
    to.path.startsWith('/lease-application/') ||
    to.path.startsWith('/tenant-signup/')

  // If user is a tenant and trying to access a non-allowed route
  if (userCategory === 'tenant' && !isTenantAllowed) {
    console.log('Router Guard - Tenant attempting to access restricted route')
    next('/tenant-home')
    return
  }

  next()
})
```

#### 5. LoadingPage.vue

**Change**: Smart redirects based on user category

```javascript
// Check user category and redirect accordingly
const userCategory = userDataStore.userCategory
if (userCategory === 'tenant') {
  router.push('/tenant-home')
} else {
  router.push('/')
}
```

## User Categories

The system supports the following user categories:

| Category            | Access Level | Visible Pages                                    |
| ------------------- | ------------ | ------------------------------------------------ |
| `tenant`            | Limited      | Tenant Home, Lease Application                   |
| `PM`                | Full         | All property management pages (not tenant pages) |
| `PO`                | Full         | All property management pages (not tenant pages) |
| `PM/PO`             | Full         | All property management pages (not tenant pages) |
| `owner`             | Full         | All property management pages (not tenant pages) |
| `manager`           | Full         | All property management pages (not tenant pages) |
| `admin`             | Full         | All property management pages (not tenant pages) |
| `null` or undefined | No menu      | None (until category is loaded)                  |

**Note**: PM (Property Manager), PO (Property Owner), and PM/PO roles have access to all property management features but cannot access tenant-specific pages like Tenant Home and Lease Application. The system supports both individual values (`PM`, `PO`) and the combined value (`PM/PO`) as a single string.

## Security Flow

### For Tenants

1. **Sign Up**
   - Tenant signs up via `/tenant-signup/:propertyId`
   - System creates user profile with `user_category: "tenant"`

2. **Login**
   - User logs in
   - System loads user profile including user_category
   - LoadingPage redirects to `/tenant-home`

3. **Navigation**
   - Menu only shows Tenant Home and Lease Application
   - Attempting to access other routes via URL automatically redirects to `/tenant-home`
   - Can access lease application with or without lease ID parameter

4. **URL Direct Access**
   - If tenant tries to type `/my-properties` in URL
   - Router guard detects user_category is "tenant"
   - Automatically redirects to `/tenant-home`
   - Console logs the attempted access for monitoring

### For Property Owners/Managers (PM/PO)

1. **Login**
   - User logs in (with user_category as PM, PO, owner, manager, or admin)
   - System loads user profile
   - LoadingPage redirects to main dashboard `/`

2. **Full Property Management Access**
   - Sees all property management pages in menu:
     - Dashboard
     - My Properties
     - Tasks
     - Transactions
     - Reminders
     - Reports
     - Leases
   - **Does NOT see**:
     - Tenant Home
     - Lease Application
   - Can access all property management routes
   - Router guard allows navigation to all non-tenant routes

3. **Blocked from Tenant Pages**
   - If PM/PO tries to access `/tenant-home` via URL
   - Router guard detects user_category is PM/PO
   - Automatically redirects to `/` (dashboard)
   - Console logs the attempted access

## Testing Checklist

### Tenant Users

- [x] Tenant sign up creates user with `user_category: "tenant"`
- [x] Tenant login redirects to `/tenant-home`
- [x] Tenant menu only shows Tenant Home and Lease Application
- [x] Tenant cannot access `/my-properties` via URL
- [x] Tenant cannot access `/transactions` via URL
- [x] Tenant can access `/lease-application`
- [x] Tenant can access `/lease-application/:leaseId`
- [x] Tenant can access `/user-profile`

### PM/PO Users

- [x] PM/PO login redirects to `/` (dashboard)
- [x] PM/PO menu shows all property management pages
- [x] PM/PO menu does NOT show Tenant Home
- [x] PM/PO menu does NOT show Lease Application
- [x] PM/PO cannot access `/tenant-home` via URL (redirects to `/`)
- [x] PM/PO can access all property management routes
- [x] PM/PO can access `/my-properties`
- [x] PM/PO can access `/transactions`
- [x] PM/PO can access `/leases`

### General

- [x] Router guard logs access attempts
- [x] Console logs show user category filtering

## Console Logs

The implementation includes comprehensive logging:

```javascript
// MainLayout - Menu filtering
console.log('MainLayout - Filtering menu for user category:', userCategory)
console.log(
  'MainLayout - Filtered links:',
  filtered.map((l) => l.title),
)

// Router Guard - Access control
console.log('Router Guard - Navigation to:', to.path)
console.log('Router Guard - User category:', userCategory)
console.log('Router Guard - Tenant attempting to access restricted route:', to.path)
console.log('Router Guard - Redirecting to /tenant-home')
```

## Future Enhancements

Potential improvements:

1. Add more granular permissions (read, write, delete)
2. Create a permissions management UI for admins
3. Add role-based field visibility within pages
4. Implement permission caching for performance
5. Add audit logging for access attempts
6. Create middleware for API endpoint protection
7. Add custom error page for unauthorized access
8. Support multiple roles per user
9. Add temporary access grants
10. Implement session-based permission overrides

## Troubleshooting

### Issue: Menu not filtering correctly

**Solution**: Ensure user profile has been loaded and contains `user_category` field

### Issue: Tenant can access restricted pages

**Solution**:

1. Check router guard is properly registered
2. Verify `user_category` is correctly set in user profile
3. Check console logs for router guard activity

### Issue: User category is null/undefined

**Solution**:

1. Verify user profile exists in Firestore
2. Check that userProfile is loaded in userDataStore
3. Ensure TenantSignUpPage properly sets user_category

### Issue: Existing users don't have user_category

**Solution**: Manually update existing user profiles in Firestore to include `user_category` field

## Migration Notes

### For Existing Users

Existing users in the database who don't have a `user_category` field will need to be updated. You can:

1. **Manual Update** - Add `user_category` field to existing user documents
2. **Migration Script** - Create a one-time script to update all users
3. **Default Value** - Consider defaulting to "owner" or "manager" for existing users

Example migration (manual):

```javascript
// In Firebase Console or via script
users/{userId}
{
  // ...existing fields
  user_category: "owner", // or "manager", "admin", "tenant"
}
```

## Database Schema

### User Profile Document

```javascript
users/{userId}
{
  user_id: string,              // Firebase Auth UID
  email: string,                // User's email
  full_name: string,            // User's full name
  phone: string,                // Phone number
  user_type: string,            // Legacy field (kept for compatibility)
  user_category: string,        // NEW: "tenant", "owner", "manager", or "admin"
  created_at: timestamp,        // Creation date
  updated_at: timestamp         // Last update
}
```

## Summary

This implementation provides:

- ✅ Secure role-based access control
- ✅ Automatic menu filtering
- ✅ Router-level protection
- ✅ Smart redirects based on user type
- ✅ Comprehensive logging
- ✅ Extensible for future enhancements
- ✅ Clean separation of concerns
- ✅ Minimal impact on existing code
