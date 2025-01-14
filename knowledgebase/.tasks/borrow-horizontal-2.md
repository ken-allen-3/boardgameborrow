# 🚀 Cline Task Prompt: Update Borrow Games Page with Horizontal Scroll

## **Objective:**
Update the **Borrow Games** page to display game cards in horizontally scrollable rows within their respective sections (e.g., "Friends' Games", "All Games (Popular)"). The layout should match the horizontal scroll style recently implemented in the **Quick Add** onboarding step.

---

## 📦 **Phase 1: Implement Horizontal Scrolling Layout**

### **Task 1: Adjust Section Layout for Horizontal Scrolling**
- Ensure each section (e.g., **Friends' Games**, **Near You**, **All Games (Popular)**) displays as a **single horizontally scrollable row**.
- Apply CSS adjustments for horizontal scrolling:
   - Use `display: flex; flex-wrap: nowrap; overflow-x: auto`.
   - Enable **scroll snap behavior** for a smoother experience.

**Acceptance Criteria:**
- [ ] Games are contained in a single scrollable row per section.
- [ ] Horizontal scrolling behavior matches the Quick Add onboarding style.
- [ ] Horizontal scrolling works across all sections.
- [ ] No data loading issues or regressions.

---

## ✅ **General Acceptance Criteria:**
- [ ] The Borrow Games page now displays horizontally scrollable rows.
- [ ] Card scrolling behavior is consistent with Quick Add onboarding.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Updated Borrow Games page with horizontal scrolling layout."
- **Knowledgebase Update:** Document the CSS changes made for horizontal scrolling and how they match the Quick Add step.

---

## 📊 **Technical Notes:**
- **Components to Review:**
   - `/components/BorrowGamesPage.tsx`
   - `/components/GameCard.tsx`
- **CSS Adjustments:** Apply flexbox and overflow styling for horizontal scroll.

---

**Assignee:** @Cline  
**Priority:** High

_This task ensures a visually appealing and consistent experience across the Borrow Games page._

