# Changelog

## [Unreleased]

### Added
- Comprehensive error logging in game type selection
- New documentation for game type selection implementation
- Cache safety checks for game data service
- Detailed console logging for debugging
- Multiple game selection support in vision service and UI
- Confidence threshold filtering for detected games
- Manual search fallback for failed scans
- Enhanced error handling in vision service
- Game status tracking (pending/confirmed/rejected)
- Multiple game preview in onboarding flow
- Done button with selection count in game selection modals
- Horizontal scrolling with snap points in Quick Add games
- Pre-fetching of game details for smoother Quick Add experience

### Changed
- Fixed game type selection in onboarding flow
- Improved visual feedback for category selection
- Enhanced state management with proper type handling
- Updated UI components to use explicit color definitions
- Optimized cache initialization process
- Updated visionService.ts to support multiple game detection
- Enhanced GameDetectionResults.tsx with multiple selection support
- Updated GameSearchModal.tsx to handle multiple game selection
- Improved Step3AddGame.tsx with better game selection UI
- Enhanced error messages with specific error types
- Updated Quick Add button styling to use brand colors consistently
- Improved game selection UI with clear visual feedback
- Updated Borrow Games page with horizontal scrolling layout and improved card design
- Temporarily simplified Borrow Games UI by hiding filter/sort options
- Updated MyGames page with consistent horizontal scrolling layout and card sizing
- Updated Quick Add step game cards to match MyGames and Borrow page design

### Fixed
- Game type selection UI not updating properly
- Cache initialization race conditions
- Issue where only one game could be added at a time
- Improved error handling for low confidence matches
- Better feedback for rejected game matches
- Quick Add button styling and state management
- Game selection visual feedback in Quick Add flow
- Error message incorrectly displaying "failed to load your borrow requests" when a user has 0 active borrow requests
- Firebase permission errors for ratings and friendships paths by updating database rules

## [Previous Versions]
...
