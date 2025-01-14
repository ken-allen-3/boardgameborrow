# 🚀 Cline Task Prompt: Fix Quick Add Games Not Saving to Collection

## **Objective:**
Ensure that games selected during the **Quick Add** step of onboarding are properly added to the user's collection. Currently, after the onboarding modal closes, the user's collection appears empty despite selections being made.

---

## 📦 **Phase 1: Debugging the Issue**

### **Task 1: Identify the Root Cause**
- Investigate the game selection flow to determine where data is being lost:
   - Confirm if selected games are properly stored in the temporary state.
   - Verify the API call that saves the collection data.
   - Check if the user's collection is properly updated in the database.

**Acceptance Criteria:**
- [ ] Root cause identified and documented.

---

## 📦 **Phase 2: Implement Fix**

### **Task 2: Ensure Data Persists in the Collection**
- Fix any identified bugs in the **state management** and ensure game selections persist after the modal closes.
- Ensure proper API calls to save the collection in the backend.

**Acceptance Criteria:**
- [ ] Selected games appear in the user’s collection after onboarding completes.
- [ ] No data loss occurs when closing the modal.

---

## 📦 **Phase 3: Testing and QA**

### **Task 3: Verify End-to-End Flow**
- Test the **Quick Add** selection process:
   - Select multiple games and complete onboarding.
   - Confirm the collection is accurately displayed in the user's dashboard.

**Acceptance Criteria:**
- [ ] All selected games consistently appear in the user’s collection.
- [ ] No regressions in other parts of the onboarding flow.

---

## ✅ **General Acceptance Criteria:**
- [ ] Users can successfully add games to their collection through Quick Add.
- [ ] No regressions or new bugs introduced.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Fixed issue with Quick Add games not saving to user collection."
- **Knowledgebase Update:** Document the fixed data persistence flow.

---

## 📊 **Technical Notes:**
- **Components to Review:**
   - `/components/onboarding/StepQuickAddGames.tsx`
   - `/services/userCollectionService.ts`
- **Ensure:**
   - State persists correctly.
   - Database updates are triggered reliably.

---

**Assignee:** @Cline  
**Priority:** Critical

_This task ensures users can successfully build their game collection during onboarding._

