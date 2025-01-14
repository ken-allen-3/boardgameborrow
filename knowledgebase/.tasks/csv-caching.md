# 🚀 Cline Task Prompt: Implement CSV Caching for Faster Game Recommendations

## **Objective:**
Optimize the onboarding experience by using the provided CSV file to pre-cache top-ranked games for faster game recommendations. Since the CSV primarily provides game titles and ranks, Cline will need to pull additional data (e.g., images, player count, playtime) from the BGG API and cache it for efficiency.

---

## 📦 **Phase 1: CSV Integration and Pre-Caching Setup**

### **Task 1: Import and Parse the CSV File**
- Import the provided CSV file containing ("..boardgameborrow/boardgameranks6.csv") `id`, `name`, `rank`, and other ranking categories.
- Validate data parsing and ensure all fields are correctly imported.

### **Task 2: Fetch and Cache Missing Game Data**
- For each game in the CSV:
   - Use the `id` to query the BoardGameGeek API.
   - Retrieve the following fields:
     - **Game Image**
     - **Player Count**
     - **Play Time**
     - **Game Description**
   - Cache the data locally in JSON format for faster access.

**Acceptance Criteria:**
- [ ] CSV data imported and parsed correctly.
- [ ] Missing data fetched from BGG and cached locally.

---

## 📦 **Phase 2: Onboarding Quick Add Optimization**

### **Task 3: Integrate Cached Data into Quick Add Onboarding**
- Update the **Quick Add Games** onboarding step to:
   - Pull from the **cached game data** instead of making live API calls.
   - Ensure all top 20 games for each category are displayed.
- Adjust the UI to display game details from the cache:
   - Game title, image, player count, and playtime.

**Acceptance Criteria:**
- [ ] Onboarding uses cached data for faster loading.
- [ ] Cached data displays complete game details.

---

## 📦 **Phase 3: Ongoing Caching Maintenance**

### **Task 4: Periodic Cache Refresh (Future-Proofing)**
- Implement a basic mechanism for **manual cache refresh** (to be automated later).
- Ensure cached data remains up-to-date with minimal API usage.

**Acceptance Criteria:**
- [ ] Cache can be manually refreshed.
- [ ] Cache refresh mechanism is documented.

---

## 📦 **Phase 4: Microcopy Enhancements**

### **Task 5: Improve Category Selection Screen Copy**
- Add microcopy to the **game type selection** screen showing an example of the **top 3 games** from the CSV for each category.

**Acceptance Criteria:**
- [ ] Example games displayed in each category during onboarding.
- [ ] Microcopy clearly explains how selections will affect recommendations.

---

## ✅ **General Acceptance Criteria:**
- [ ] No regressions in the existing onboarding flow.
- [ ] Game recommendations load significantly faster with caching.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Implemented CSV caching for faster game recommendations and optimized quick add onboarding."
- **Knowledgebase Update:** Document the caching strategy, CSV usage, and cache refresh process.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/services/gameDataService.ts`
   - `/components/onboarding/StepQuickAddGames.tsx`
   - `/components/onboarding/StepGameTypes.tsx`
- **Data Source:** BoardGameGeek API
- **Caching Strategy:** Store pre-fetched data in JSON format within the app's local storage or a Firebase collection.

---

**Assignee:** @Cline  
**Priority:** High

_This task ensures faster and more reliable game recommendations for new users._

