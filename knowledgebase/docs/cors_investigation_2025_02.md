# Firebase Functions CORS Investigation (February 2025)

## Issue Description
Firebase callable functions are failing with CORS errors when accessed from the production environment (boardgameborrow.com). The functions are properly configured as callable functions but are being accessed as direct HTTP endpoints, resulting in CORS preflight failures.

## System Configuration
- Frontend: Vite + React, hosted on Netlify
- Backend: Firebase Functions (Node.js)
- Authentication: Firebase Auth
- Environment: Production (boardgameborrow.com)
- Firebase Project: boardgameshare-001

## Current Implementation

### Client-Side Configuration (src/config/firebase.ts)
```typescript
const functions = getFunctions(app, 'us-central1');
```

### Function Implementation (src/services/cacheMetricsService.ts)
```typescript
const getMetrics = httpsCallable<object, CacheMetrics>(functions, 'getCacheMetrics');
```

### Server-Side Configuration (server/functions/index.ts)
```typescript
export const getCacheMetrics = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onCall(async (data, context) => {
    // Function implementation
  });
```

## Investigation Steps Taken

### 1. Initial Error Analysis
- Network requests show OPTIONS preflight requests failing
- Request URL: `https://us-central1-boardgameshare-001.cloudfunctions.net/getCacheMetrics`
- Error: 403 Forbidden (CORS policy)
- Origin: https://boardgameborrow.com
- Request Method: OPTIONS

### 2. Code Review Findings
- Client correctly uses `httpsCallable` from Firebase Functions SDK
- Server functions are properly configured as callable functions
- Firebase initialization includes proper region configuration
- Authentication is properly configured and waiting for auth state

### 3. Attempted Solutions

#### 3.1. Custom Origin Configuration
```typescript
const origin = environment === 'production' ? 'https://boardgameborrow.com' : 'http://localhost:5174';
```
Result: Did not resolve the issue. The Firebase SDK should handle origins automatically for callable functions.

#### 3.2. Removed Custom Origin
Modified firebase.ts to remove custom origin configuration and rely on Firebase SDK defaults.
Result: Issue persists, suggesting the problem lies elsewhere.

#### 3.3. Deployment Verification
- Functions are being deployed with correct configuration
- Labels show proper callable function setup:
```json
"labels": {
  "deployment-callable": "true",
  "firebase-functions-hash": "e0627aec1b962a765ccaf4c14e84b387e8434080",
  "deployment-tool": "cli-firebase"
}
```

## Current State
- CORS errors persist despite attempted fixes
- Functions are properly configured but requests are not being handled as callable functions
- The Firebase SDK appears to be converting callable function calls to direct HTTP requests

## Next Investigation Steps

### 1. Authentication Flow
- Verify the authentication state when functions are called
- Check if auth tokens are being properly included in requests
- Investigate if there's a race condition in auth initialization

### 2. Firebase SDK Version Compatibility
- Verify all Firebase SDK packages are on compatible versions
- Check for known issues with the current SDK version
- Consider testing with different SDK versions

### 3. Request Transformation
- Investigate why httpsCallable requests are being converted to direct HTTP
- Add detailed logging to track the exact request format at various stages
- Consider implementing request debugging middleware

### 4. Alternative Approaches to Consider
1. Implement custom CORS handling as a temporary workaround
2. Test with Firebase Hosting instead of Netlify
3. Consider using Firebase Admin SDK with custom endpoints
4. Investigate using Firebase REST API as a fallback

## Relevant Logs and Error Messages
```
Access to fetch at 'https://us-central1-boardgameshare-001.cloudfunctions.net/getCacheMetrics' from origin 'https://boardgameborrow.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Related Documentation
- [Cache Monitoring Setup](./cache_monitoring_setup.md)
- [Cache System Fix - January 2025](./cache_system_fix_2025_01.md)
- [API Integrations](./api_integrations.md)

## Environment Variables (Netlify)
- VITE_FIREBASE_AUTH_DOMAIN: boardgameshare-001.firebaseapp.com
- VITE_FIREBASE_PROJECT_ID: boardgameshare-001

## Contact Points
- Firebase Support Case: Not yet created
- Related GitHub Issues: None created yet

## Resolution (February 23, 2025)

After extensive investigation and multiple attempted fixes, we ultimately resolved the CORS issues by taking a different architectural approach:

### Final Solution: CSV-Based Initialization
Instead of fighting with CORS and Firebase Functions, we implemented a simpler solution using local CSV data:

1. Removed problematic endpoints:
   - Eliminated initializeCache cloud function
   - Removed getCacheMetrics endpoint
   - Simplified authentication flow

2. Implemented local caching:
   - Uses boardgameranks6.csv as data source
   - Implements in-memory Map for caching
   - Zero network requests during initialization
   - No CORS issues by design

3. Maintained hybrid approach:
   - CSV for initial game data
   - Firebase still used for additional details
   - BGG API calls only when necessary

### Key Learnings

1. CORS Issues Root Cause:
   - Firebase SDK converting callable functions to HTTP
   - Authentication failures causing SDK fallback
   - Inconsistent CORS handling between environments
   - Complex interaction between auth and CORS

2. Why Previous Solutions Failed:
   - Custom CORS headers: Didn't handle all preflight cases
   - Firebase callable: SDK issues with conversion
   - Manual auth: Added complexity without fixing root cause
   - Proxy attempts: Added unnecessary network overhead

3. Benefits of New Approach:
   - Eliminated CORS entirely
   - Simplified architecture
   - Improved performance
   - Better developer experience

### Recommendations

1. When to Use Firebase Functions:
   - Non-critical operations
   - Background processing
   - Admin operations
   - Data aggregation

2. When to Use Local Data:
   - Initial app state
   - Frequently accessed data
   - Performance-critical features
   - User onboarding

3. Future Considerations:
   - Document CSV update process
   - Implement CSV validation
   - Add version tracking
   - Consider PWA features

## Next Steps
1. Document CSV update procedures
2. Implement CSV validation checks
3. Add CSV version tracking
4. Consider implementing PWA features for offline support
