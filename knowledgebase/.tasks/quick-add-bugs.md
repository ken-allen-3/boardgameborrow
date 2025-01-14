# 🚀 Cline Task Prompt: Fix Quick Add Onboarding Screen Bugs

## **Objective:**
Fix several issues with the **Quick Add** onboarding screen, including game list population, selection errors, and performance improvements.

---

## 📦 **Phase 1: Fix Game List Display Issue**
### **Task 1: Ensure Correct Number of Games Displayed Per Category**
- Verify that each game type section displays **20 games per category**.
- Fix the issue where the **second row of game types** fails to populate.

**Acceptance Criteria:**
- [ ] Each category correctly displays **20 games**.
- [ ] Second game type section displays data properly.

---

## 📦 **Phase 2: Fix Selection Bug**
### **Task 2: Resolve Game Selection Issue**
- Ensure that when **multiple games** are selected, **all selected games** are added to the collection, not just the last one clicked.

**Acceptance Criteria:**
- [ ] Users can select multiple games and all selections are added to the collection.

---

## 📦 **Phase 3: Performance Optimization**
### **Task 3: Pre-Fetch and Cache Game Data**
- Implement a **manual pre-fetch** of the top games from each category from the BoardGameGeek API.
- Cache this data **once**, to reduce loading times during user onboarding.

**Acceptance Criteria:**
- [ ] Game data is pre-fetched once and cached for faster loading.
- [ ] Cached data remains consistent across multiple sessions.

---

## 📦 **Phase 4: Microcopy Enhancement**
### **Task 4: Add Example Games in Category Selection**
- Update the **game type selection screen** to include microcopy with **example top games** for each category (e.g., *“Top Strategy Games: Catan, Risk, Scythe”*).

**Acceptance Criteria:**
- [ ] Microcopy added to the category selection screen.
- [ ] Examples dynamically match the top games in each category.

---

## ✅ **General Acceptance Criteria:**
- [ ] All bugs resolved without regressions.
- [ ] Code is optimized and well-documented.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Fixed Quick Add bugs: corrected game list population, selection issue, and added caching."
- **Knowledgebase Update:** Document the caching strategy and microcopy adjustments.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/components/onboarding/StepQuickAddGames.tsx`
   - `/services/gameDataService.ts`
- **Data Source:** BoardGameGeek API


_This task resolves key bugs and enhances the onboarding experience._

