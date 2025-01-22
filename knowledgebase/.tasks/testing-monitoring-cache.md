#### **Task Title:**
Develop and Execute Basic Tests for the Caching System and Establish Performance Baselines

---

### **Objective:**
Ensure the caching system behaves as expected under typical use cases and collect baseline performance metrics to guide future optimization and monitoring efforts.

---

### **Task Details:**

1. **Develop a Basic Test Suite:**
   - Write unit tests to validate key caching behaviors:
     - **Cache Hits:** Confirm data is served from Firestore when a valid cache entry exists.
     - **Cache Misses:** Verify the system makes an API call and stores the result in Firestore when no valid cache entry is found.
     - **Cache Expiration:** Ensure expired cache entries trigger new API calls and updates to the cache.
     - **Error Handling:** Test how the system behaves when Firestore or the API is unavailable.

   **Example Test Cases:**
   - **Test 1:**
     - Scenario: Cache contains valid data.
     - Expected Outcome: System serves data from the cache without making an API call.
   - **Test 2:**
     - Scenario: Cache entry is expired.
     - Expected Outcome: System fetches fresh data from the API, updates the cache, and serves the new data.
   - **Test 3:**
     - Scenario: Firestore query fails.
     - Expected Outcome: System logs an error and attempts to serve data directly from the API.
   
   **Tools/Frameworks:**
   - Use **Jest** or another testing framework compatible with Firebase Functions.
   - Mock Firestore and API responses for controlled testing.

2. **Simulate Edge Cases:**
   - Simulate rate-limiting scenarios (e.g., return 429 errors from the API) and confirm retry logic works as intended.
   - Introduce intentional cache misses and verify API calls are correctly triggered.

3. **Collect Baseline Performance Metrics:**
   - Use Firebase Performance Monitoring to log key metrics:
     - **Cache Hit/Miss Ratios:** Percentage of requests served from the cache vs. those requiring API calls.
     - **API Response Times:** Average time to retrieve data from the BGG API.
     - **Cache Query Times:** Time spent retrieving and writing to Firestore.
     - **Function Execution Times:** Time taken by `bggSearch` and `bggGameDetails` Cloud Functions.
   - Export metrics to establish a performance baseline for:
     - Average request latency.
     - System behavior under varying load conditions.

4. **Document Findings:**
   - Summarize test results and identified issues in a brief report.
   - Include baseline metrics as a reference for future monitoring and optimization efforts.

---

### **Acceptance Criteria:**
1. **Testing:**
   - All key caching behaviors are covered by unit tests with clear pass/fail outcomes.
   - Edge cases, including API rate-limiting and Firestore errors, are simulated and handled gracefully.

2. **Baseline Metrics:**
   - Cache hit/miss ratios, API response times, and Cloud Function execution times are logged and documented.
   - A performance baseline report is created and shared for future reference.

3. **Documentation:**
   - Include a README or equivalent documentation for running tests and interpreting performance metrics.


### **Resources:**
1. [Firebase Performance Monitoring](https://firebase.google.com/docs/performance).
2. [Jest Framework](https://jestjs.io/).
3. [Firestore Testing Utilities](https://firebase.google.com/docs/rules/emulator-setup).

