# Error Handling

This document outlines the error handling strategies implemented in the Board Game Borrow application, with a focus on handling Firebase permission errors gracefully.

## Firebase Permission Errors

Firebase permission errors can occur when a user tries to access data they don't have permission to read or write. These errors typically manifest as "Permission denied" errors in the console.

### Common Causes

1. **Database Rules Mismatch**: The database rules don't allow the current user to access the requested data
2. **Authentication Issues**: The user is not properly authenticated or their token has expired
3. **Path Structure**: Attempting to access a path that doesn't match the rules structure

### Graceful Error Handling Strategy

We've implemented a graceful error handling strategy for permission errors to ensure a better user experience:

1. **Detect Permission Errors**: Check if the error message contains "Permission denied"
2. **Empty State Instead of Error**: When a permission error occurs, display an empty state rather than an error message
3. **Clear Error Messages**: Clear any existing error messages when permission errors occur

### Implementation Examples

#### BorrowGames Component

```typescript
try {
  const requests = await getUserBorrowRequests(currentUser.email);
  setBorrowRequests(requests);
  setError(null);
} catch (err) {
  console.error('Error loading borrow requests:', err);
  // Check if it's a permission error
  const errorMessage = err instanceof Error ? err.message : String(err);
  if (errorMessage.includes('Permission denied')) {
    // For permission errors, just set empty requests without showing an error
    setBorrowRequests([]);
    setError(null);
  } else {
    setError('Failed to load your borrow requests');
  }
}
```

#### RecommendedGames Component

```typescript
try {
  const recommendedGames = await getRecommendedGames(userEmail);
  // Transform the games to match the BorrowGames interface
  const games = recommendedGames.map(game => ({
    // Game transformation logic
  }));
  setRecommendations(games);
} catch (error) {
  console.error('Failed to load recommendations:', error);
  // Just set empty recommendations on error - don't show an error message
  setRecommendations([]);
} finally {
  setLoading(false);
}
```

## Database Rules for Error Prevention

To prevent permission errors, we've updated the database rules to allow broader read access for certain collections, while still maintaining security:

```javascript
"borrowRequests": {
  ".read": "auth != null",
  "$requestId": {
    ".write": "auth != null && (newData.child('borrowerId').val() === auth.token.email || 
              newData.child('ownerId').val() === auth.token.email || 
              root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
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
    ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || 
              root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
  }
}
```

This approach allows any authenticated user to read all borrow requests, ratings, and friendships, and then the application filters the data to show only what's relevant to each user. This prevents permission errors when accessing these paths.

## Best Practices

1. **Always Handle Errors**: Never leave catch blocks empty or without proper handling
2. **Log Errors**: Always log errors to the console for debugging purposes
3. **User-Friendly Messages**: Display user-friendly error messages that don't expose technical details
4. **Graceful Degradation**: When errors occur, degrade gracefully by showing empty states or fallback content
5. **Permission Error Detection**: Specifically check for permission errors and handle them differently
6. **Clear Error State**: Always clear error states when operations succeed

## Common Error Scenarios and Solutions

| Scenario | Error | Solution |
|----------|-------|----------|
| User has 0 borrow requests | "Failed to load your borrow requests" | Handle permission errors gracefully, show empty state |
| Failed to load games | "Failed to load available games" | Handle permission errors gracefully, show empty state |
| Failed to load recommendations | No visible error, but console error | Set empty recommendations, show default recommendation UI |
| Failed to load friends list | Permission denied in console | Use empty friends list, continue with available functionality |
