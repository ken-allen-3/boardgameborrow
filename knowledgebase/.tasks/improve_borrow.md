# 🚀 Cline Task Prompt: Improve Borrow Games Page UX/UI

## **Objective:**
Enhance the **Borrow Games** page for improved usability, clarity, and user engagement by restructuring the layout, introducing filtering, and improving the game card design. This task is broken into **smaller, modular tasks** to ensure clarity and smooth implementation.

---

## 📦 **Phase 1: Section Division and Game Categorization**
### **Task 1: Divide Game Listings into Sections**
- Split the **Available Games** section into the following categories:
   - **Friends' Games** (Games owned by friends)
   - **Games Near You** (Prioritize distance-based sorting)
   - **All Games (Popular)** (Sorted by a mix of popularity and distance)
- Add **section headers** with bold typography for clarity.

**Acceptance Criteria:**
- [ ] Games are visually grouped by category.
- [ ] Section headers clearly identify each game grouping.

---

## 📦 **Phase 2: Search and Filtering Enhancements**
### **Task 2: Add Search and Filter Functionality**
- Update the search bar to filter games across all sections.
- Add **filters** for:
   - Player Count
   - Playtime Duration
   - Game Category
   - Availability (Available/Unavailable)
- Add a **sorting option dropdown**:
   - Friends First (default)
   - Distance
   - Popularity

**Acceptance Criteria:**
- [ ] Users can filter by multiple criteria.
- [ ] Search bar filters results across all sections.

---

## 📦 **Phase 3: Game Card UI Enhancements**
### **Task 3: Improve Game Card Design**
- Update the card design to:
   - Display the **game category**.
   - Show a **friend icon** for games owned by friends.
   - Include **color-coded availability labels**:
      - 🟢 Available
      - 🟡 Pending Request
      - 🔴 Unavailable

**Acceptance Criteria:**
- [ ] Game cards display category, owner info, and availability.
- [ ] The UI reflects availability using colors and icons.

### **Task 4: Add Owner Information to Game Cards**
- Display:
   - Owner’s profile picture.
   - **Message Owner** button for direct communication.

**Acceptance Criteria:**
- [ ] Game cards include owner profile details and a message option.

---

## 📦 **Phase 4: Interaction and Feedback Improvements**
### **Task 5: Add Borrow Request Feedback**
- Update the **Request to Borrow** button to:
   - Show a **loading spinner** after being clicked.
   - Replace with a **confirmation message** once the request is sent.

**Acceptance Criteria:**
- [ ] Users receive visual feedback when submitting a borrow request.

---

## ✅ **General Acceptance Criteria:**
- [ ] Each section of the page is clearly defined and functional.
- [ ] No regression in performance or existing features.
- [ ] Design remains responsive across all devices.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/components/borrowPage/BorrowPage.tsx`
   - `/components/gameCard/GameCard.tsx`
- **Data Source:** Ensure Firebase reflects updated game availability and relationships.

---

## 🔗 **Resources:**
- 📂 `knowledgebase/developer_instructions.md`

**Assignee:** @Cline  
**Priority:** High

_This task ensures a more visually appealing, user-friendly, and feature-rich Borrow Games page._
