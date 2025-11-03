# Test Credentials for Pay Equity Reporting System

## Overview
This document contains the test credentials for accessing the Pay Equity Reporting System. The system now has jurisdiction-based authentication where users must select their jurisdiction at login.

## Admin Account
**Email:** admin@admin.com
**Password:** Admin123456
**Jurisdiction:** Any (can select any jurisdiction at login)
**Access Level:** Full system access
- Can view and manage all jurisdictions
- Can access Admin menu features:
  - Send Email
  - Jurisdiction Lookup
  - User Account Management
- Can create, edit, and delete user accounts

## Test User Account
**Email:** test@minneapolis.gov
**Password:** Test123456
**Jurisdiction:** Minneapolis (jurisdiction_id: 12345)
**Access Level:** Limited to Minneapolis jurisdiction only
- Can only view data for Minneapolis
- Cannot access Admin menu
- Can manage reports, jobs, and contacts for Minneapolis only

## Creating the Test User
To create the test user account:

1. Log in as admin@admin.com
2. Navigate to Admin → User Account Management
3. Click "Add User"
4. Fill in:
   - Email: test@minneapolis.gov
   - Password: Test123456
   - Jurisdiction: Minneapolis (12345)
   - Administrator: unchecked
5. Click "Create User"

Alternatively, use the registration form on the login page:
1. Click "Register" on the login page
2. Search for and select "Minneapolis" in the jurisdiction dropdown
3. Enter email: test@minneapolis.gov
4. Enter password: Test123456
5. Click "Create Account"

## How Login Works

1. **Jurisdiction Selection**: All users must search for and select their jurisdiction at login
2. **Admin Users**: Can select any jurisdiction and switch between them
3. **Regular Users**: Can only select their assigned jurisdiction; attempting to select a different jurisdiction will result in an error
4. **Data Filtering**: All data throughout the application is automatically filtered by the selected jurisdiction

## Security Features

- Row Level Security (RLS) policies enforce jurisdiction-based access at the database level
- Users cannot access data outside their assigned jurisdiction
- Admin users have full access to all jurisdictions
- All database queries are filtered based on user permissions
- The Admin menu is only visible to users with the is_admin flag set to true

## Testing the System

### Test Scenario 1: Admin Access
1. Log in as admin@admin.com with password Admin123456
2. Select any jurisdiction (e.g., Minneapolis)
3. Verify you can see the Admin menu in the navigation
4. Navigate to different jurisdictions using the jurisdiction selector
5. Access User Account Management from the Admin menu

### Test Scenario 2: Regular User Access
1. Create the test user account (see instructions above)
2. Log out and log in as test@minneapolis.gov with password Test123456
3. Select Minneapolis from the jurisdiction dropdown
4. Verify you can only see Minneapolis data
5. Verify the Admin menu is not visible
6. Attempt to manually navigate or access admin features (should be blocked)

### Test Scenario 3: Jurisdiction Restriction
1. Log in as test@minneapolis.gov
2. Try to select a different jurisdiction (e.g., Saint Paul)
3. Verify you receive an error message
4. Confirm that only the correct jurisdiction selection allows login

## Notes

- Email verification is currently disabled for easier testing
- User profiles are automatically created when users sign up
- The trigger function automatically sets is_admin to true for admin@admin.com
- All other users default to is_admin = false
