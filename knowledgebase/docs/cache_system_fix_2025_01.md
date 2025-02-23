# Cache System Fix - January 2025

## Issue
The admin dashboard was showing 0 cached games, indicating either:
1. The cache system wasn't working correctly, or
2. The cache stats section wasn't correctly pulling the data

## Investigation
1. Initial inspection revealed missing Firestore collections:
   - `game-details`
   - `game-rankings`

2. Found multiple architectural issues:
   - Firebase Functions version conflicts
   - Incorrect permissions in Firestore rules
   - Direct client-side Firestore access for cache operations
   - Missing CORS headers causing cross-origin request failures
   - Inconsistent cache cleanup strategy
   - Node.js-specific code in browser environment
   - Incorrect database rules deployment structure
   - Mismatched user identification in database rules

3. Attempted Solutions:
   - Removed process.env usage in browser code
   - Fixed database rules deployment structure
   - Updated Firebase Functions initialization
   However, these changes didn't fully resolve the issues due to a deeper architectural problem:
   - Database rules were using auth.uid for admin checks
   - But user data was being stored with email-based keys
   - This mismatch caused all admin operations to fail
   - Failed admin auth caused Firebase SDK to fall back to direct HTTP requests
   - Leading to CORS errors as a secondary symptom

## Solution Implemented

### 1. Cloud Functions Architecture
Moved cache operations to Cloud Functions to ensure proper security and consistency:
- `initializeCache`: Populates cache with game data from BGG API
- `getCacheMetrics`: Retrieves cache statistics
- `cleanupExpiredCache`: Scheduled cleanup preserving high-usage games
All functions include:
- Proper CORS handling with preflight support
- Admin authentication requirements
- Error logging and monitoring

### 2. Firebase Configuration
Updated Firestore rules to enforce proper access control:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /game-details/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;  // Only allow writes through Cloud Functions
    }
    
    match /game-rankings/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;  // Only allow writes through Cloud Functions
    }
  }
}
```

### 3. Dependency Resolution
Fixed version conflicts between Firebase packages:
- Downgraded firebase-admin to v11.11.1
- Set firebase-functions to v3.24.1
- Updated firebase-functions-test to v2.4.0
- Used --legacy-peer-deps to resolve dependency conflicts

### 4. Cache Implementation
The cache system now operates in three tiers:
1. Game Details Cache (`game-details` collection):
   - Stores individual game information
   - Tracks usage metrics per game
   - Includes metadata like last access and update times
   - Preserves frequently accessed games (10+ uses)

2. Rankings Cache (`game-rankings` collection):
   - Organized by category and month
   - Stores top games for each category
   - Includes refresh metadata
   - 24-hour TTL for infrequently accessed data

3. Cache Events Collection (`cache-events` collection):
   - Tracks all cache operations
   - Monitors performance metrics
   - Logs errors and CORS issues
   - Helps optimize cache strategy

## Usage
1. Access the admin dashboard
2. Click "Initialize Cache" to populate game data
3. Cache metrics will display:
   - Total cached games
   - Cache hit rate
   - Memory usage
   - Last refresh date

## Troubleshooting Guide

### Common Issues

1. **Cache Shows 0 Games**
   - Verify Firestore collections exist
   - Check admin permissions
   - Review Cloud Function logs for initialization errors
   - Verify CORS configuration
   - Ensure proper Firebase initialization before making calls
   - Check region configuration matches between client and server

2. **CORS Errors**
   - Often a symptom of authentication failures
   - When admin access fails, Firebase SDK falls back to HTTP requests
   - This fallback triggers CORS preflight requests
   - Which fail because the function expects a Firebase callable
   - Fix the underlying auth/permission issue first

3. **Authentication Issues**
   - Verify database rules match storage pattern
   - Check if using uid vs email for user identification
   - Ensure admin checks use correct path to user data
   - Test admin privileges in Firebase Console
   - Monitor auth state changes in browser console

4. **Database Rules**
   - Rules must match how data is actually stored
   - Use auth.token.email for email-based paths
   - Add top-level admin access for collections
   - Test rules in Firebase Console
   - Deploy rules from correct directory

3. **Cache Performance Issues**
   - Monitor cache hit/miss ratios
   - Review memory usage metrics
   - Check preservation rules for high-usage games
   - Verify cleanup job execution

2. **Permission Errors**
   - Confirm Firestore rules are deployed
   - Verify user has admin privileges
   - Check authentication state

3. **Deployment Failures**
   - Check package.json for dependency conflicts
   - Verify Firebase Functions version compatibility
   - Use --legacy-peer-deps if needed

### Debugging Steps

1. Check Cloud Functions logs for errors:
```bash
firebase functions:log
```

2. Verify Firestore collections:
```javascript
// In Firebase Console
db.collection('game-details').get()
db.collection('game-rankings').get()
```

3. Test admin access:
```javascript
const userRef = db.collection('users').doc(userId);
const userData = await userRef.get();
console.log('Is Admin:', userData.data()?.isAdmin);
```

## Update Log

### February 7, 2025 - CORS Fix Attempt #2
After observing that the previous fix didn't resolve all issues, a new approach was implemented based on analyzing the working endpoints (searchGames and getGameDetails).

#### Changes Made
1. Cloud Functions Architecture:
   - Converted getCacheMetrics and initializeCache from onCall to onRequest functions
   - Added explicit CORS headers handling using setCorsHeaders helper
   - Implemented token-based authentication with Bearer scheme
   - Updated error handling to use v2 HttpsError

2. Client-Side Implementation:
   - Switched from Firebase callable functions to direct axios HTTP requests
   - Added auth token in Authorization header
   - Improved error handling with specific HTTP status codes
   - Maintained existing retry logic for reliability

3. Authentication Flow:
   - Simplified auth context to only pass required uid
   - Removed dependency on Firebase callable context
   - Added proper token verification on server side

4. Code Organization:
   - Updated all Firebase Functions imports to use v2
   - Removed legacy v1 functions references
   - Aligned error handling patterns across all endpoints

#### Technical Details
```typescript
// Server-side CORS headers
const setCorsHeaders = (res: any) => {
  res.set('Access-Control-Allow-Origin', ['http://localhost:5174', 'https://boardgameborrow.com']);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.set('Access-Control-Max-Age', '3600');
};

// Client-side request
const getCacheMetrics = async (): Promise<CacheMetrics> => {
  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.get(
    `${FUNCTIONS_BASE_URL}/getCacheMetrics`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    }
  );
  return response.data;
};
```

#### Rationale
- Previous approach using onCall functions was causing SDK to fall back to HTTP
- Working endpoints were already using onRequest with explicit CORS
- Direct HTTP requests provide better control over headers and error handling
- Token-based auth maintains security while being more explicit

#### Testing Steps
1. Log in as admin user
2. Visit admin dashboard
3. Verify cache metrics load without CORS errors
4. Test cache initialization
5. Monitor network tab for proper headers

#### Known Limitations
- Requires valid auth token for all requests
- No WebSocket support (unlike Firebase callable)
- Manual CORS handling required
- Must maintain consistent auth header format

## Future Improvements
1. Implement cache warming for popular categories
2. Add cache invalidation strategies
3. Implement retry mechanisms for failed BGG API requests
4. Add monitoring for cache performance metrics
5. Implement regional caching for global scale
6. Add predictive caching based on usage patterns
7. Enhance CORS configuration for multiple environments
8. Implement cache compression for large datasets
9. Implement proper development/production environment detection
10. Add comprehensive error logging and monitoring
11. Implement automated database rules deployment
12. Add validation for Firebase initialization states

## Related Documentation
- [Cache Monitoring Setup](./cache_monitoring_setup.md)
- [Caching Architecture](./caching_architecture.md)
- [API Integrations](./api_integrations.md)
