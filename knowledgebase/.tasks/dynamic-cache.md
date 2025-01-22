Implement Dynamic Cache Updates and Optimized Cache Refresh

#### **Task Title:**  
Enhance the Caching System to Dynamically Update with User Interactions and Optimize Cache Refresh Logic

---

### **Objective:**  
Enable the caching system to incrementally grow with game details fetched during user interactions, while refining the monthly cache refresh logic to avoid redundant updates.

---

### **Task Details:**

1. **Dynamic Cache Updates During User Interactions:**  
   - Extend the `bggApiService` to update Firebase with game details fetched during search/add and AI/photo-vision interactions.
   - Add a new Firebase collection `/game-details/{gameId}` to store individual game data.  
   - Implementation Steps:  
     - Check `/game-details/{gameId}` before making a BGG API call.  
     - If the game is not cached, fetch it from the API, store it in Firebase, and return the data.  
     - Example:
       ```typescript
       async function fetchAndCacheGameDetails(gameId: string): Promise<GameData> {
         const cacheKey = `/game-details/${gameId}`;
         const cachedEntry = await firestore.doc(cacheKey).get();

         if (cachedEntry.exists) {
           return cachedEntry.data() as GameData;
         }

         // Fetch from BGG API
         const apiResponse = await fetchGameDetailsFromBGG(gameId);
         await firestore.doc(cacheKey).set({
           ...apiResponse,
           lastUpdated: Date.now(),
         });
         return apiResponse;
       }
       ```

2. **Integrate AI/Photo-Vision Data:**  
   - Use game IDs or metadata detected by the AI/photo-vision feature to populate `/game-details/{gameId}` dynamically.  
   - Fetch the most confident match first, followed by asynchronous pre-fetching of alternative matches.  

3. **Optimize Cache Refresh Logic:**  
   - Modify the monthly cache refresh Cloud Function to:
     - Focus on categories not updated during real-time interactions.
     - Skip games already added to `/game-details` through search/add or AI features.
   - Example:
     ```typescript
     const refreshPopularGames = async (category: string) => {
       const categoryRef = `/game-rankings/${category}/${getCurrentMonth()}`;
       const categoryData = await firestore.doc(categoryRef).get();

       if (!categoryData.exists) {
         const rankings = await fetchCategoryRankings(category);
         await firestore.doc(categoryRef).set({
           games: rankings,
           metadata: { lastUpdated: Date.now(), source: 'bgg-api' },
         });
       }
     };
     ```

4. **Track Cache Usage:**  
   - Add a `usageCount` field in `/game-details/{gameId}` to track frequently accessed games.
   - Use this data to prioritize games during cache refresh or pre-fetching tasks.

---

### **Acceptance Criteria:**
1. User-driven interactions (search/add and AI/photo-vision) update `/game-details/{gameId}` in Firebase.  
2. The cache refresh logic skips already cached or recently updated games, focusing on missing or stale categories.  
3. Cache updates are reflected in real time and accessible across all users.  
4. Usage metrics (e.g., `usageCount`) provide insights into frequently accessed games.

-

### **Resources:**  
1. [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore).  
2. [BGG API Documentation](https://boardgamegeek.com/wiki/page/BGG_XML_API2).  
3. Existing codebase for `bggApiService` and Cloud Functions.
