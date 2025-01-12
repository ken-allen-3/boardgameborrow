# Changelog

## [Unreleased]

### Added
- Multiple game selection support in vision service and UI
- Confidence threshold filtering for detected games
- Manual search fallback for failed scans
- Enhanced error handling in vision service
- Game status tracking (pending/confirmed/rejected)
- Multiple game preview in onboarding flow
- Done button with selection count in game selection modals

### Changed
- Updated visionService.ts to support multiple game detection
- Enhanced GameDetectionResults.tsx with multiple selection support
- Updated GameSearchModal.tsx to handle multiple game selection
- Improved Step3AddGame.tsx with better game selection UI
- Enhanced error messages with specific error types

### Fixed
- Issue where only one game could be added at a time
- Improved error handling for low confidence matches
- Better feedback for rejected game matches

## [Previous Versions]
...
