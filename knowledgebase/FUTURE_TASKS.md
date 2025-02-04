# Future Tasks and Considerations

## Feature Improvements

### Feature Roadmap
- Core Functionality
  - [ ] Basic board layout with status columns
  - [ ] Feature/bug card creation and management
  - [ ] User voting system (up/down votes)
  - [ ] Feature request submission form
  - [ ] Admin management interface

- VSCode/Cline Integration
  - [ ] Command palette actions for card management
  - [ ] Quick card creation from current file
  - [ ] Status updates via VSCode/Cline
  - [ ] Direct Firebase document manipulation

- Enhanced Features
  - [ ] Card filtering and sorting
  - [ ] Tag-based organization
  - [ ] Analytics dashboard
  - [ ] Email notifications
  - [ ] GitHub issues integration

### Game Nights Feature

#### Beta Launch Requirements

- Core Event Management
  - [x] Basic game night creation with title, date, location
  - [x] Cover image selection
  - [x] Attendee management (going/maybe/declined)
  - [x] Edit/update existing game nights
  - [ ] Recurring game night support

- Game Integration
  - [x] Game suggestions system
  - [ ] Player count validation against suggested games
  - [ ] Game availability confirmation
  - [ ] Game setup instructions/rules access

- Attendee Management
  - [x] Basic invite system
  - [x] Attendance tracking
  - [ ] Waitlist system for events exceeding max players
  - [ ] Automated reminders for pending responses

- Location Management
  - [x] Basic location input
  - [ ] Location validation
  - [ ] Distance calculation for attendees
  - [ ] Directions/map integration

#### Post-Beta Improvements

- Enhanced Social Features
  - [ ] Discussion board for each game night
  - [ ] Photo sharing from past events
  - [ ] Rating system for hosted events
  - [ ] Group preferences tracking

- Advanced Game Management
  - [ ] Game night theme suggestions
  - [ ] Automatic game rotation suggestions
  - [ ] Player skill level matching
  - [ ] Game teaching volunteer system

- Scheduling Improvements
  - [ ] Polls for best date/time
  - [ ] Calendar integration (Google/Apple)
  - [ ] Conflict detection with other game nights
  - [ ] Automatic scheduling suggestions

- Analytics & Insights
  - [ ] Popular games tracking
  - [ ] Attendance patterns
  - [ ] Player group compatibility metrics
  - [ ] Host performance metrics

- Communication Enhancements
  - [ ] In-app messaging
  - [ ] Dietary/accessibility preferences
  - [ ] Carpool coordination
  - [ ] Automated weather alerts

- Host Tools
  - [ ] Event templates
  - [ ] Co-host capabilities
  - [ ] House rules documentation
  - [ ] Expense splitting

### Friends Feature
- Performance Optimizations
  - [ ] Implement batch fetching of user profiles in friendService.ts
  - [ ] Add client-side caching of friend profiles using React Query
  - [ ] Implement pagination for large friends lists
  - [ ] Add loading states for individual friend card actions

- Enhanced Friend Discovery
  - [ ] Add friend suggestions based on mutual friends
  - [ ] Implement friend search with filters (name, email, location)
  - [ ] Show mutual friends count and list
  - [ ] Add "People you may know" section based on game preferences

- Improved Friend Interactions
  - [ ] Add ability to see friend's game collection
  - [ ] Show friend's borrowing history
  - [ ] Add direct messaging between friends
  - [ ] Display friend's online/offline status
  - [ ] Add friend categories/groups for organization

- UX Improvements
  - [ ] Enhance friend cards to show:
    - Games in common
    - Recent activity
    - Mutual friends count
    - Last active status
  - [ ] Add confirmation dialogs for friend removal with undo option
  - [ ] Implement toast notifications for friend actions
  - [ ] Add drag-and-drop organization for friend groups

- Error Handling & Reliability
  - [ ] Implement automatic retry for failed network requests
  - [ ] Add more specific error messages for different failure scenarios
  - [ ] Add validation for edge cases (max friends limit, blocked users)
  - [ ] Implement optimistic updates for friend actions

- Data Structure Improvements
  - [ ] Extend FriendProfile type to include:
    - lastActive timestamp
    - gamesOwned count
    - mutualFriends count
    - location data
    - preferred game types

### Cache Management Improvements
- Enhanced Cache Analytics
  - [ ] Cache hit/miss ratio visualization
  - [ ] Cache performance metrics dashboard
  - [ ] Response time comparisons
  
- Cache Control Features  
  - [ ] Manual cache refresh controls
  - [ ] Category-specific cache clearing
  - [ ] Game-specific cache refresh
  - [ ] CSV fallback mode toggle

- Cache Health Monitoring
  - [ ] Staleness indicators
  - [ ] API failure tracking
  - [ ] Usage analytics
  - [ ] Source distribution metrics

- Cache Analytics Dashboard
  - [ ] Detailed cache entry table
  - [ ] Performance trending
  - [ ] Resource usage monitoring
  - [ ] Cache optimization suggestions

## Infrastructure Improvements

### Backend Infrastructure
- **Consider migrating to Firebase Functions**: If Heroku hosting becomes cost-ineffective, migrate the vision/game detection Express server to Firebase Functions
  - Pros of Firebase Functions:
    - Pay-per-use pricing
    - Tighter integration with existing Firebase services
    - Automatic scaling
  - Current setup uses Express server on Heroku for:
    - Vision API integration
    - Game detection service
    - Credential management

### Implementation Considerations
- Consider using React Query for data management and caching
- Batch database operations where possible to improve performance
- Implement proper error boundaries and fallback UI components
- Add comprehensive logging for debugging and monitoring
- Consider implementing WebSocket for real-time friend status updates

## Current Infrastructure
- Frontend: Netlify
- Backend API: Heroku (Express server)
- Database: Firebase
- Image Processing: Google Cloud Vision API
