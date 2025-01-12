# 🚀 Cline Task Prompt: Implement Game Type Selection & Quick Add in Onboarding

## **Objective:**
Enhance the onboarding flow by introducing a **game type selection** step, where users can choose the types of games they enjoy (based on BoardGameGeek categories). After selecting, users will be shown a set of top games from those categories and can batch-add them to their collection before proceeding.

---

## 📦 **Phase 1: Game Type Selection Screen**

### **Task 1: Display Game Types for Selection**
- Fetch a list of **game categories** from the BoardGameGeek (BGG) API.
- Present these categories visually with **icons** and a label for each.
- Allow users to select **multiple categories** by tapping on them.

**Acceptance Criteria:**
- [ ] Game types fetched from BGG API.
- [ ] Users can select multiple categories before proceeding.

---

## 📦 **Phase 2: Game Recommendation Screen**

### **Task 2: Display Recommended Games Based on Selection**
- Once categories are selected, show a list of the **top 10-20 games per category**.
- Data should be fetched once from the BGG API and cached for performance.
- Organize results into **horizontally scrollable sections** grouped by category.

### **Task 3: Batch Add Interaction**
- Allow users to **tap to select** games they want to add to their collection.
- Provide a **batch add** button at the bottom.
- When the button is clicked:
   - Add selected games to the user's collection.
   - Move the user to the next onboarding step.

**Acceptance Criteria:**
- [ ] Top games are grouped by the selected categories.
- [ ] Users can select games for batch adding.
- [ ] Batch add button functions correctly.
- [ ] Games are added to the collection in the background.

---

## 📦 **Phase 3: Design & Interaction Enhancements**

### **Task 4: UX Improvements**
- Add a **progress indicator** showing which step of onboarding the user is on.
- Include **microcopy** explaining the process:
   - *“Select the types of games you love! Next, we’ll help you build your game collection.”*
- Use consistent **rounded checkboxes** for selection clarity.

**Acceptance Criteria:**
- [ ] Progress indicator is visible and functional.
- [ ] Microcopy added for clarity.
- [ ] Consistent UI elements for selection.

---

## ✅ **General Acceptance Criteria:**
- [ ] Horizontal scrolling for mobile maintained.
- [ ] Desktop and mobile versions visually optimized.
- [ ] No regression in existing onboarding steps.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Added game type selection and quick-add feature to onboarding."
- **Knowledgebase Update:** Document the data-fetching strategy and how categories are cached for efficiency.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/components/onboarding/StepGameTypes.tsx`
   - `/components/onboarding/StepQuickAddGames.tsx`
- **Data Source:** BoardGameGeek API
- **Caching:** Cache game lists for efficiency and plan for a future update mechanism.



_This task ensures a smoother onboarding experience while helping users build an engaging collection from the start._

