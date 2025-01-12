# 🚀 Cline Task Prompt: Update Borrow Page to Horizontal Scrolling on Mobile

## **Objective:**
Adjust the **Borrow Games** page layout so that game cards display in a **horizontal scrolling (off-canvas)** format on mobile devices, rather than the current vertical list.

---

## **Steps to Implement:**

### **Step 1: Modify Game Card Layout for Mobile**
- Adjust the CSS in the `BorrowPage.tsx` to:
   - Use a **horizontal scroll container** (`flex-nowrap` with overflow-x scroll).
   - Ensure cards are scrollable off-canvas.

### **Step 2: Maintain Section Grouping**
- Ensure that each section (`Friends' Games`, `Near You`, `Popular`) maintains separate horizontal scroll containers.

### **Step 3: Optimize Touch Experience**
- Enable **smooth scrolling** for better UX.
- Ensure swipe gestures work seamlessly.

### **Step 4: Test on Mobile Devices**
- Confirm horizontal scrolling works properly on both iOS and Android.
- Ensure cards still display vertically on desktop screens.

---

## ✅ **Acceptance Criteria:**
- [ ] Mobile devices display game cards in horizontal scroll containers.
- [ ] Sections remain clearly defined.
- [ ] No regressions on desktop view.

---

## 📖 **Documentation and Commit Message:**
- Update the **knowledgebase** with any adjustments to the CSS or layout logic.
- Suggest a **commit message** summarizing the layout change.

---

**Assignee:** @Cline  
**Priority:** Medium

_This task ensures a more user-friendly browsing experience on mobile._

