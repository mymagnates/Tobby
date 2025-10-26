# Tenant Sign Up Feature

## Overview
The Tenant Sign Up feature allows property owners to easily onboard new tenants by sharing a unique registration link. When tenants sign up through this link, they are automatically associated with the property as a tenant.

## How It Works

### For Property Owners

1. **Generate Sign Up Link**
   - For any property, the sign up link format is:
   ```
   https://your-domain.com/tenant-signup/{propertyId}
   ```
   
   Example:
   ```
   https://your-domain.com/tenant-signup/prop_12345
   ```

2. **Share the Link**
   - Send this link to prospective tenants via email, text, or any other method
   - Tenants can use this link to create their account

### For Tenants

1. **Access the Sign Up Page**
   - Click on the provided link from the property owner
   - The page will display the property information

2. **Create Account**
   - Choose between "Sign Up" or "Login" tabs
   - For new tenants, fill in the sign up form:
     - Email (required)
     - Password (required, minimum 6 characters)
     - Confirm Password (required)
     - Full Name (required)
     - Phone Number (optional)
   - Click "Create Tenant Account"

3. **Automatic Profile Creation**
   - Upon successful sign up, the system automatically:
     - Creates a user account in Firebase Authentication
     - Creates a user profile in the database
     - Assigns a "tenant" role for the specified property
     - Redirects to the Tenant Home page

4. **Existing Users**
   - If you already have an account, use the "Login" tab
   - After logging in, you'll be redirected to the loading page and then to your appropriate dashboard

## Technical Details

### Page Route
- **URL Pattern**: `/tenant-signup/:propertyId`
- **Component**: `src/pages/TenantSignUpPage.vue`
- **Access**: Public (no authentication required)

### What Gets Created

When a tenant signs up:

1. **Firebase Authentication Account**
   - Email/password authentication
   - Display name set to the provided full name

2. **User Profile Document**
   - Collection: `users/{userId}`
   - Fields:
     - `user_id`: Firebase Auth UID
     - `email`: User's email
     - `full_name`: User's full name
     - `phone`: User's phone number (if provided)
     - `user_type`: "tenant"
     - `created_at`: Timestamp
     - `updated_at`: Timestamp

3. **Tenant Role Document**
   - Collection: `users/{userId}/roles`
   - Fields:
     - `property_id`: The property ID from the sign up link
     - `role`: "tenant"
     - `role_date`: Timestamp
     - `status`: "active"
     - `created_at`: Timestamp

### Security Notes

- The property ID must be valid and exist in the database
- If the property doesn't exist, an error message is displayed
- Passwords must be at least 6 characters long
- Email validation is enforced
- Users who are already logged in are automatically redirected

## Usage Example

### For Property Owners

#### Using the TenantSignUpLink Component

The application includes a ready-to-use component for generating and sharing tenant sign up links:

```vue
<template>
  <div>
    <!-- Include the component in your property view/edit page -->
    <TenantSignUpLink 
      :property-id="property.id" 
      :property-name="property.nickname || property.address"
    />
  </div>
</template>

<script setup>
import TenantSignUpLink from '../components/TenantSignUpLink.vue'

const property = ref({
  id: 'prop_12345',
  nickname: 'Sunset Apartments',
})
</script>
```

#### Component Features

The `TenantSignUpLink` component provides:
- **Automatic Link Generation**: Creates the proper URL based on property ID
- **Copy to Clipboard**: One-click copy functionality
- **Email Integration**: Opens default email client with pre-filled message
- **QR Code Display**: Shows QR code option (requires qrcode library for full functionality)

#### Manual Link Generation

Alternatively, you can manually create sign up links:

```javascript
const propertyId = 'prop_12345'
const signupLink = `${window.location.origin}/tenant-signup/${propertyId}`

// Copy to clipboard or send via email
navigator.clipboard.writeText(signupLink)
```

### Future Enhancements

Potential improvements:
- Email invitation system with automatic link generation
- QR code generation for easy mobile sign up
- Custom welcome message per property
- Lease agreement upload during sign up
- Security deposit information collection
- Move-in date selection
- Additional tenant information fields (emergency contact, references, etc.)

## Troubleshooting

### Common Issues

1. **"Property not found" error**
   - Verify the property ID in the URL is correct
   - Ensure the property exists in the database

2. **"Email already in use" error**
   - The email is already registered
   - User should use the "Login" tab instead

3. **Password validation errors**
   - Ensure password is at least 6 characters
   - Ensure confirmation password matches

4. **Not redirected after sign up**
   - Check browser console for errors
   - Ensure Firebase configuration is correct
   - Verify internet connection

