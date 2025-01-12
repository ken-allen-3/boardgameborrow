# 🚀 Cline Task Prompt: Complete the Friends Feature

## **Objective:**
Finish implementing the **Friends Feature** in the BoardGameBorrow app by ensuring users can send, receive, view, and accept friend requests. This task involves reviewing the current state of the feature, verifying database functionality, and completing any missing parts of the workflow.

---

## 📦 **Task Title:**
`Complete the Friends Feature with Full Request Management`

---

## **Task Description:**
**Context:**
Currently, the **Friends Feature** is incomplete. Users may be able to send friend requests, but there is **no visible way to view, manage, or accept incoming friend requests**. It is also unclear whether friend requests are being stored correctly in the database.

**Goal:**
- Confirm whether friend requests are being sent and stored correctly in the database.
- Implement a **Friends Dashboard** where users can:
   - View pending incoming friend requests.
   - Accept or decline requests.
   - View a list of confirmed friends.
- Ensure the feature works consistently across the app.

---

## **Steps to Implement:**

### **Step 1: Audit Current Friends Feature**
- Review the following components and services:
   - `/components/friends..`
   - `/services/friendsService.ts`
   - Firebase database structure for friend requests and connections.
- Identify existing functionality and missing elements.

### **Step 2: Verify Database Integration**
- Confirm if friend requests are:
   - Being correctly stored in the Firebase database.
   - Properly linked to both the sender and recipient user IDs.

### **Step 3: Implement Friend Request Management**
- Add a **Friends Dashboard** with the following features:
   - **Pending Requests Section:** Display pending incoming friend requests.
   - **Accept/Decline Options:** Provide buttons for users to accept or decline friend requests.
   - **Confirmed Friends Section:** Show a list of confirmed friends.

### **Step 4: Ensure Bidirectional Data Consistency**
- When a friend request is accepted:
   - Add both users to each other's friends list.
   - Remove the pending request entry from the database.

### **Step 5: Test the Feature**
- Create test users and ensure:
   - Friend requests are sent and stored correctly.
   - Users can view and manage requests.
   - The friends list updates correctly upon acceptance.

### **Step 6: Commit Changes**
- Commit the updated feature with the message:  
   `Completed Friends Feature: Added request management and database verification.`

---

## ✅ **Acceptance Criteria:**
- [ ] Users can view pending friend requests.  
- [ ] Users can accept or decline friend requests.  
- [ ] Friend data syncs correctly with the Firebase database.  
- [ ] Confirmed friends list displays correctly.  
- [ ] No regressions in existing functionality.

---

## 📊 **Technical Notes:**
- **Components to Update:**
   - `/components/friends/FriendsPage.tsx`
   - `/services/friendsService.ts`
- **Database:** Ensure Firebase handles both friend requests and confirmed friendships as separate data entries.

---

## 🔗 **Resources:**

- 📂 `knowledgebase/developer_instructions.md`

**Assignee:** @Cline  
**Priority:** High

_This task ensures a fully functional and user-friendly friends feature._

