#### **Task Title:**
Set Up Firebase Monitoring Alerts and Metrics for the Caching System

---

### **Objective:**
Implement Firebase Monitoring to track and alert on key performance metrics for the caching system and API usage. This will ensure real-time visibility into system behavior and enable early detection of issues.

---

### **Task Details:**

1. **Set Up Firebase Monitoring Alerts:**
   - Configure **Cloud Monitoring Alerts** in the Firebase Console to track the following metrics:
     - **Cache Hit/Miss Ratios:**
       - Log hits and misses for the `api-cache` collection in Firestore.
       - Example metric: Percentage of cache hits vs. total requests.
     - **API Rate Limit Errors:**
       - Track occurrences of 429 (rate-limited) responses from the BGG API.
       - Set up an alert to notify if the error count exceeds a threshold (e.g., 5 errors in 1 minute).
     - **Function Execution Times:**
       - Monitor average and maximum execution times for `bggSearch` and `bggGameDetails` functions.
       - Alert if execution time exceeds a defined threshold (e.g., 2 seconds).

2. **Add Custom Metrics Logging:**
   - Enhance the Cloud Functions to log key events using Firebase’s `console.log` or a dedicated monitoring library.
   - Example events to log:
     - **Cache Hits:** When data is served from Firestore.
     - **Cache Misses:** When an API call is triggered due to a cache miss.
     - **Expired Entries:** When stale data in the cache triggers a new API call.
     - **Rate-Limited Requests:** When a 429 response is received.

   **Implementation Example:**
   ```typescript
   const logCacheEvent = (event: 'hit' | 'miss' | 'expired', key: string) => {
     console.log(`Cache ${event}: ${key}`);
   };

   if (cacheHit) {
     logCacheEvent('hit', cacheKey);
   } else if (isExpired) {
     logCacheEvent('expired', cacheKey);
   } else {
     logCacheEvent('miss', cacheKey);
   }
   ```

3. **Visualize Metrics in Firebase Performance Monitoring:**
   - Add custom trace metrics to measure:
     - **Request Latency:** Time taken to serve data from the cache vs. the API.
     - **Firestore Query Times:** Time spent retrieving or storing cached data.
     - **Cache Size:** Track the number of entries in the `api-cache` collection over time.
   - Use `firebase-functions` performance monitoring hooks to measure execution durations:
     ```typescript
     const trace = perf.trace("cacheCheck");
     trace.start();
     // Firestore or API logic
     trace.stop();
     ```

4. **Test Monitoring Alerts:**
   - Simulate scenarios to test alerts:
     - Trigger a cache miss and ensure it logs correctly.
     - Simulate rate-limiting by throttling API calls.
     - Validate that function execution time metrics are recorded accurately.

---

### **Acceptance Criteria:**
1. Firebase Monitoring tracks and logs:
   - Cache hit/miss ratios.
   - API rate-limit errors (429 responses).
   - Function execution times.
2. Alerts are configured for:
   - High API rate-limit errors.
   - Slow function execution times.
   - Excessive cache misses.
3. Test scenarios confirm the monitoring and alerting system works as intended.

---

### **Resources:**
1. [Firebase Monitoring Overview](https://firebase.google.com/docs/monitoring).
2. [Logging Custom Metrics in Firebase Functions](https://firebase.google.com/docs/functions/performance-monitoring).
3. [Firestore Query Optimization](https://firebase.google.com/docs/firestore/query-data/indexing).



