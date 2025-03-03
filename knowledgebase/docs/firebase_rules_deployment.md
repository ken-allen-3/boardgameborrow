# Firebase Rules Deployment Guide

This document provides instructions for deploying updated Firebase database rules to fix permission errors in the Board Game Borrow application.

## Updated Database Rules

The following database rules have been updated to fix permission errors:

```json
{
  "rules": {
    ".read": "auth != null && root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true",
    "notifications": {
      "$userEmail": {
        ".read": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)",
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)",
        ".indexOn": ["read", "createdAt"]
      }
    },
    "users": {
      "$userEmail": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    },
    "games": {
      "$userEmail": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    },
    "borrows": {
      ".read": "auth != null && root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true",
      "$userEmail": {
        ".read": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)",
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    },
    "gameNights": {
      ".read": "auth != null && root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true",
      "$userEmail": {
        ".read": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)",
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    },
    "borrowRequests": {
      ".read": "auth != null",
      "$requestId": {
        ".write": "auth != null && (newData.child('borrowerId').val() === auth.token.email || newData.child('ownerId').val() === auth.token.email || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    },
    "ratings": {
      ".read": "auth != null",
      "$userEmail": {
        ".write": "auth != null && auth.token.email.replace('.', ',') === $userEmail"
      }
    },
    "friendships": {
      ".read": "auth != null",
      "$userEmail": {
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    }
  }
}
```

## Deployment Options

### Option 1: Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Realtime Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the updated rules above
6. Click "Publish" to deploy the rules

### Option 2: Firebase CLI

If you have access to the Firebase CLI and proper authentication:

1. Ensure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Navigate to the project directory:
   ```bash
   cd path/to/project
   ```

4. Deploy the database rules:
   ```bash
   firebase deploy --only database
   ```

## Verification

After deploying the rules, verify that the permission errors are resolved:

1. Open the application in a browser
2. Open the browser's developer console (F12 or Ctrl+Shift+I)
3. Check that there are no "Permission denied" errors in the console
4. Verify that the Borrow Games page loads correctly without error messages

## Troubleshooting

If you still see permission errors after deploying the rules:

1. **Check Rule Syntax**: Ensure there are no syntax errors in the rules
2. **Clear Browser Cache**: Clear your browser cache and reload the page
3. **Check Authentication**: Ensure users are properly authenticated
4. **Review Console Errors**: Look for specific paths that are still causing permission errors
5. **Test with Admin Account**: Test with an admin account to see if the issue persists

## Additional Notes

- The updated rules allow any authenticated user to read from the `borrowRequests`, `ratings`, and `friendships` paths
- The application filters the data client-side to show only what's relevant to each user
- Write permissions are still restricted to the appropriate users
- These changes maintain security while preventing permission errors
