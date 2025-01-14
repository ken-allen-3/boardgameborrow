🚀 Cline Task Prompt: Correct Borrow Page Layout to Horizontal Scroll Rows on Mobile
Objective:
Update the Borrow Games page layout so that game cards are displayed in horizontally scrollable rows, grouped by categories, while keeping cards vertically listed within each row.

Steps to Implement:
1. Adjust Section Layout for Mobile (CSS Flexbox Update)
Each section (Friends' Games, Near You, Global) should have its own horizontal scrolling row.
Apply flexbox with flex-nowrap and overflow-x: auto styling to the container.
Ensure individual cards remain vertically arranged within each row.
2. Grouping Consistency:
Maintain distinct groups with section headers for:
Friends' Games
Games Near You
All Games (Popular)
3. Mobile Optimization:
Cards should scroll horizontally off-canvas within their sections.
Ensure smooth scrolling with scroll-snap-type: x mandatory for a better touch experience.
4. Desktop View:
Retain the current vertical layout for larger screens.
Use CSS media queries to apply the horizontal scroll only for mobile viewports (max-width: 768px).
✅ Acceptance Criteria:
 Game cards are presented in horizontally scrollable rows on mobile.
 Cards maintain a vertical layout on desktop.
 No regressions in game filtering, search, or friend grouping logic.
📖 Documentation and Commit Message:
Commit Message: "Corrected Borrow Games page to horizontal scroll rows on mobile."
Knowledgebase Update: Ensure the layout logic is documented for future reference.
