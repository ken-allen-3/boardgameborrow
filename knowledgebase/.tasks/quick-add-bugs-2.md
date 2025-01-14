# 🚀 Cline Task Prompt: Fix Quick Add Onboarding Screen Bugs (Follow-Up)

## **Objective:**
Address the remaining issues with the **Quick Add** onboarding screen where several game types still display incomplete game lists and some categories (e.g., Party) fail to show any games.

---

## 📦 **Phase 1: Fix Incomplete Game List Display**
### **Task 1: Ensure Full Game List Population**
- Investigate why some game types still display fewer than **20 games per category**.
- Ensure data consistency for all categories, especially **Party Games**.

**Acceptance Criteria:**
- [ ] Each category displays a full set of **20 games**.
- [ ] The **Party Games** category correctly shows available options.

---

## 📦 **Phase 2: Data Fetch Consistency Fix**
### **Task 2: Ensure Reliable Data Fetching and Caching**
- Verify that data fetching pulls a complete set of results from the BGG API.
- Implement additional data integrity checks to ensure complete lists are cached and retrieved.

**Acceptance Criteria:**
- [ ] All game categories consistently fetch and display full datasets.
- [ ] Caching ensures no empty or partial results.

---

## 📦 **Phase 3: Final Testing and QA**
### **Task 3: Verify Across All Categories**
- Conduct a complete test across all game types to verify data consistency.

**Acceptance Criteria:**
- [ ] All game categories populate correctly with at least **20 games**.
- [ ] No categories remain empty.

---

## ✅ **General Acceptance Criteria:**
- [ ] All bugs resolved without regressions.
- [ ] Code is optimized and well-documented.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Fixed remaining issues with Quick Add game list population. Ensured full data consistency."
- **Knowledgebase Update:** Document the adjusted data fetching and validation strategies.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/components/onboarding/StepQuickAddGames.tsx`
   - `/services/gameDataService.ts`
- **Data Source:** BoardGameGeek API

---

**Assignee:** @Cline  
**Priority:** Critical

_This follow-up task resolves remaining data issues for a complete onboarding experience._

