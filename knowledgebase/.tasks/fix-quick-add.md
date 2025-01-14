# 🚀 Cline Task Prompt: Fix Quick Add Game Display Issues

## **Objective:**
Resolve the issues on the **Quick Add** step where:
1. **Game images and metadata (player count, playtime)** are not displaying correctly.
2. The layout is not using the requested **off-canvas horizontal scrolling** approach.

---

## 📦 **Phase 1: Fix Missing Game Data Issue**

### **Task 1: Ensure Proper Data Binding**
- Investigate why game images, player count, and playtime are showing as `N/A`.
- Confirm that the cached data includes these fields and is properly linked to the game cards.
- Ensure the component correctly pulls the cached data from the CSV and external API calls.

**Acceptance Criteria:**
- [ ] All game cards display images, player count, and playtime.
- [ ] Missing fields display fallback data appropriately.

---

## 📦 **Phase 2: Correct Layout for Off-Canvas Horizontal Scroll**

### **Task 2: Implement Horizontal Scrolling**
- Adjust the **Quick Add** layout to display horizontally scrollable rows for each category, as previously requested.
- Ensure the design matches the wireframe with **separate horizontal sections** for each game type (e.g., Family, Party).

**Key Adjustments:**
- Use **CSS flexbox** with `flex-nowrap` and `overflow-x: auto`.
- Apply **scroll snap behavior** for better user experience.

**Acceptance Criteria:**
- [ ] Each game type section scrolls horizontally.
- [ ] Cards remain vertically listed within their scroll rows.
- [ ] Consistent styling across mobile and desktop views.

---

## 📦 **Phase 3: Testing and QA**

### **Task 3: Verify Functionality and Consistency**
- Test the **Quick Add** screen for:
   - Data loading accuracy.
   - Smooth horizontal scrolling.
   - Consistent data visibility across all categories.
- Confirm no regressions in previous onboarding steps.

**Acceptance Criteria:**
- [ ] No empty fields displayed.
- [ ] Smooth scrolling on mobile and desktop.

---

## ✅ **General Acceptance Criteria:**
- [ ] Quick Add displays game data properly.
- [ ] Horizontal scrolling is correctly implemented.
- [ ] No visible layout issues remain.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Fixed Quick Add display issues: corrected data binding and implemented horizontal scrolling."
- **Knowledgebase Update:** Document the fixed data-fetching approach and layout adjustment.

---

## 📊 **Technical Notes:**
- **Components to Review:**
   - `/components/onboarding/StepQuickAddGames.tsx`
   - `/services/gameDataService.ts`
- **Data Source:** BoardGameGeek API (cached data)
- **Ensure:**
   - Consistent styling with the rest of the onboarding flow.

---

**Assignee:** @Cline  
**Priority:** Critical

_This task ensures the Quick Add step displays game data properly and meets the intended UX design._

