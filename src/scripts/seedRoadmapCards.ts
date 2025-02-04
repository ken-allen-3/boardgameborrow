import { roadmapService, RoadmapCard } from '../services/roadmapService';

const seedCards: Omit<RoadmapCard, 'id'>[] = [
  // High-Priority Features (In Progress)
  {
    title: "Player Count Validation for Game Nights",
    description: "Implement validation system to check player counts against suggested games for game nights. This will ensure game suggestions are appropriate for the number of attendees.",
    status: "in-progress",
    tags: ["feature", "game-nights", "validation"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 100,
    votes: { up: 5, down: 0, userVotes: {} }
  },
  {
    title: "Cache System Performance Improvements",
    description: "Enhance cache system with hit/miss ratio tracking, staleness indicators, and performance metrics dashboard. Implement manual cache controls and category-specific clearing.",
    status: "in-progress",
    tags: ["enhancement", "infrastructure", "performance"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 95,
    votes: { up: 4, down: 0, userVotes: {} }
  },
  {
    title: "Friend System Performance Optimization",
    description: "Implement batch fetching of user profiles, add client-side caching using React Query, and add pagination for large friends lists. Includes loading states for individual friend card actions.",
    status: "in-progress",
    tags: ["enhancement", "friends", "performance"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 90,
    votes: { up: 3, down: 0, userVotes: {} }
  },

  // Planned Core Features
  {
    title: "Recurring Game Night Support",
    description: "Add support for creating recurring game nights with customizable frequency (weekly, bi-weekly, monthly). Include series management and individual event customization.",
    status: "planned",
    tags: ["feature", "game-nights"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 85,
    votes: { up: 8, down: 1, userVotes: {} }
  },
  {
    title: "Enhanced Friend Discovery",
    description: "Implement friend suggestions based on mutual friends, game preferences, and location. Add advanced search with filters and 'People you may know' section.",
    status: "planned",
    tags: ["feature", "friends", "social"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 80,
    votes: { up: 6, down: 1, userVotes: {} }
  },
  {
    title: "Game Night Waitlist System",
    description: "Implement waitlist functionality for game nights that exceed max player count. Include automatic notifications when spots open up.",
    status: "planned",
    tags: ["feature", "game-nights"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 75,
    votes: { up: 4, down: 0, userVotes: {} }
  },

  // User Experience Improvements
  {
    title: "Calendar Integration",
    description: "Add Google/Apple calendar integration for game nights. Include conflict detection and automatic scheduling suggestions based on participant availability.",
    status: "planned",
    tags: ["feature", "game-nights", "integration"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 70,
    votes: { up: 7, down: 2, userVotes: {} }
  },
  {
    title: "Enhanced Friend Cards",
    description: "Update friend cards to show games in common, recent activity, mutual friends count, and last active status. Add drag-and-drop organization for friend groups.",
    status: "planned",
    tags: ["enhancement", "friends", "ui"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 65,
    votes: { up: 3, down: 0, userVotes: {} }
  },

  // Infrastructure Improvements
  {
    title: "Cache Analytics Dashboard",
    description: "Create comprehensive dashboard for cache performance monitoring. Include hit/miss ratios, response times, and optimization suggestions.",
    status: "planned",
    tags: ["feature", "infrastructure", "monitoring"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 60,
    votes: { up: 2, down: 0, userVotes: {} }
  },

  // Completed Features
  {
    title: "Multiple Game Selection Support",
    description: "Added support for selecting multiple games during vision detection and Quick Add flow. Includes confidence threshold filtering and manual search fallback.",
    status: "completed",
    tags: ["feature", "vision", "ui"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 0,
    votes: { up: 5, down: 0, userVotes: {} }
  },
  {
    title: "Horizontal Scrolling Implementation",
    description: "Implemented horizontal scrolling with snap points in Quick Add games section. Enhanced UI with consistent card sizing and improved visual feedback.",
    status: "completed",
    tags: ["enhancement", "ui"],
    createdAt: new Date(),
    createdBy: "system",
    priority: 0,
    votes: { up: 4, down: 0, userVotes: {} }
  }
];

async function seedRoadmap() {
  try {
    for (const card of seedCards) {
      await roadmapService.createCard(card);
      console.log(`Created card: ${card.title}`);
    }
    console.log('Successfully seeded roadmap cards');
  } catch (error) {
    console.error('Error seeding roadmap cards:', error);
  }
}

seedRoadmap();
