# 🚀 Cline Task Prompt: Seed Content Setup for Early User Engagement

## **Objective:**
Implement **seeded content** in the app to ensure early users experience an engaging and dynamic environment even with a limited initial user base.

---

## 📦 **Phase 1: Create Seeded Content Data**

### **Task 1: Prepare Demo Content Dataset**
- Create a **JSON file** with the following seeded data:
  - **Groups:** At least 3 sample groups (e.g., "Family Game Night Club", "Strategy Enthusiasts").
  - **Game Collections:** At least 20 popular games across various categories (e.g., Family, Party, Strategy). These games will:
    - Appear in the **Borrow Games** section under a labeled "Popular Games" section.
    - Serve as a visual demo but will **not** be borrowable, as they are not owned by real users.
  - **Game Nights:** 2-3 pre-scheduled game nights with different themes.
  - **Demo Friends:** 3-5 demo users with profile pictures and collections.
- Determine and ensure all **necessary fields** are included for each content type, referencing how data is structured in the live database (e.g., games, groups, and events).

**Acceptance Criteria:**
- [ ] JSON dataset is created with complete data fields based on the current database structure.
- [ ] Fields reflect all required data for groups, games, game nights, and demo users.

---

## 📦 **Phase 2: Integrate Seeded Content into the App**

### **Task 2: Display Seed Content in Key Areas**
- Ensure **seeded groups**, **game nights**, and **games** appear in:
  - The **Groups** page.
  - The **Borrow Games** section under a special "Popular Games" row.
  - The **Quick Add Onboarding** step for easier initial collection building.

### **Task 3: Visual Tagging for Seeded Content**
- Clearly mark all demo content with a **visually distinct label**:
  - **Tag Design:** Small, pill-shaped badge in a subtle color (e.g., light gray or yellow).
  - **Label Text:** `"Sample Content"` in **uppercase**, small font size.
  - **Position:** Top-right corner of each game card.
  - **Optional Icon:** Add an ℹ️ info icon next to the tag for hover-based clarification.

**Acceptance Criteria:**
- [ ] Seeded content is visible in all specified sections.
- [ ] Demo content is clearly labeled as **Sample Content** with a consistent design.

---

## 📦 **Phase 3: Prevent Seed Data Duplication & Management**

### **Task 4: Prevent Seed Content Persistence in User Data**
- Ensure demo content:
  - Cannot be permanently added to a user's collection.
  - Does not affect database metrics for active users.

### **Task 5: Manage Seed Content Visibility**
- Implement a toggle in the admin dashboard to easily **disable demo content** once real users and data are established.

**Acceptance Criteria:**
- [ ] Demo content does not persist in user collections.
- [ ] A toggle exists in the admin dashboard to control demo content visibility.

---

## ✅ **General Acceptance Criteria:**
- [ ] Seed content is fully implemented and functional across all relevant sections.
- [ ] No regressions in the user collection features or borrowing process.
- [ ] Performance remains stable with demo content loaded.

---

## 📖 **Documentation and Commit Message:**
- **Commit Message:** "Implemented seed content setup for early user engagement. Added sample groups, games, and game nights."
- **Knowledgebase Update:** Document the seeded content approach, JSON structure, and how to toggle it on/off.

---

## 📊 **Technical Notes:**
- **Components to Review:**
  - `/services/seedDataService.ts`
  - `/components/BorrowGamesPage.tsx`
  - `/components/GameNightsPage.tsx`
- **Ensure:**
  - Proper JSON parsing and display.
  - Consistent labeling of demo content with proper UX styling.

---

**Assignee:** @Cline
**Priority:** High

*This task ensures the app feels dynamic and engaging during early launch stages.*

