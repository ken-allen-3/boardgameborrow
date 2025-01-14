# Onboarding System Implementation

## Overview

The app implements a comprehensive onboarding and tutorial system with two main components:

### 1. Initial Onboarding Flow (Modal-based)
- Starts with WelcomeModal.tsx showing app features overview
- Proceeds to AddressOnboardingModal.tsx for location setup
- Ends with FriendsOnboardingModal.tsx for social connections
- Progress tracked via updateOnboardingProgress() in userService
- State managed through AuthContext (isNewUser, showWelcome flags)

### 2. Interactive Tutorial System (Overlay-based)
- Implemented via TutorialProvider.tsx and TutorialStep.tsx
- Manages a sequence of 3 guided steps:
  1. Add Games (My Games page)
  2. Borrow Games (Borrow page)
  3. Join Groups (Groups page)
- Features:
  - Automatic navigation between tutorial steps
  - Semi-transparent overlay with highlighted elements
  - Progress tracking (localStorage)
  - Pause/Resume functionality
  - Skip option

## Technical Implementation Details

### Architecture
- Uses React Context (TutorialContext) for global state management
- Implements responsive positioning system for tooltips
- Handles route changes during tutorial progression
- Uses data-tutorial attributes for element targeting
- Includes error handling and loading states
- Integrates with Firebase Auth for user state
- Supports social integration (Google/Facebook contacts)

### Flow Pattern
The system follows a progressive disclosure pattern:
1. Welcome → Location → Friends (Initial setup)
2. Guided tutorial for core features
3. Tutorial state persisted to prevent reshowing

### Key Files
```
src/components/
├── onboarding/
│   ├── WelcomeModal.tsx         # Initial welcome screen
│   ├── AddressOnboardingModal.tsx   # Location setup
│   ├── FriendsOnboardingModal.tsx   # Social connections
│   └── OnboardingBox.tsx        # Shared UI component
└── tutorial/
    ├── TutorialProvider.tsx     # Tutorial state/logic
    └── TutorialStep.tsx         # Tutorial UI component
```

## Component Details

### WelcomeModal
- Displays app features overview
- Triggers tutorial system on completion
- Managed through AuthContext

### AddressOnboardingModal
- Handles location setup
- Integrates with geocoding service
- Updates user profile with location data

### FriendsOnboardingModal
- Manages social connections
- Supports multiple connection methods:
  - Social import (Google/Facebook)
  - User search
  - Email invites
- Handles friend requests and invitations

### TutorialProvider
- Manages tutorial state
- Handles navigation between steps
- Controls overlay visibility
- Tracks completion status

### TutorialStep
- Renders tutorial UI elements
- Manages tooltip positioning
- Handles user interactions
- Provides navigation controls
