Task: Update the Borrow Page UX to a Guided Discovery Hybrid Approach
Objective:
Modify the Borrow Page so that when a new user joins and has no friends, they see a mix of nearby/featured games while being encouraged to add friends for a better borrowing experience.

Changes & Enhancements:
1. Update the Empty State (for users with no friends yet)
Add a new info box at the top with the following copy:
"📣 Your friends’ games will appear here! Add friends to see what you can borrow."

Include a CTA Button: "Find Friends & Invite" (links to a friend search page).
Style: Same as the Personalized Recommendations card but with a blue accent.
2. Introduce Nearby & Featured Games (for engagement before adding friends)
Below the empty state message, display a "Suggested Games" section with two subsections:
“Nearby Games” (Games from local users, even if they aren’t friends yet)
“Featured Games” (Hand-picked or randomly selected games to make the page feel populated)
If possible, add a toggle allowing users to switch between “Friends’ Games” and “Public Games” (which defaults to public until they add friends).
3. Modify Borrow Card UI (to encourage adding friends before borrowing)
If the game owner is not a friend, overlay a small banner with:
"👥 Add [Owner’s Name] to borrow this game!"

Clicking the game should show the game details but with an “Add Friend” button instead of a "Request to Borrow" button.
4. Update Filters Section for Clarity
Modify the category filter UI to clarify that the user is viewing “Public Games” if they don’t have friends yet.
Add a subtle toggle or label:
“Showing: 🔄 Nearby & Featured Games” (Switches when they add friends)

5. Post-Friendship Dynamic Update
Once the user adds a friend, automatically prioritize displaying that friend’s games on top.
Show a small success message:
"🎉 You’ve added a friend! Their games will now appear here."

Technical & Design Considerations
Ensure a smooth transition when users switch between "Nearby Games" and "Friends’ Games."
Consider a load animation or skeleton state while fetching games.
Maintain visual consistency with the existing UI, but use distinct colors/icons to differentiate between game categories.
Deliverables:
Updated Borrow Page UI reflecting the changes above
Friend suggestion logic implemented for borrowing access
Game visibility rules adjusted based on friendship status
Functional CTA buttons & improved UX flow
