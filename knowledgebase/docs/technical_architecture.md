# Technical Architecture

## System Overview

Board Game Borrow is a full-stack application built with:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Firebase
- Storage: Firebase Storage
- Authentication: Firebase Auth
- Database: Firebase Realtime Database

## Core Components

### Frontend Architecture

1. **Components**
   - User Interface (/src/components)
   - Authentication flows
   - Game management
   - Friend system
   - Game night organization
   - Group management

2. **Services**
   - Board game service
   - User service
   - Friend service
   - Game night service
   - Storage service
   - Vision service (for game detection)

3. **State Management**
   - Context API for auth state
   - Local state management with hooks

### Backend Architecture

1. **Firebase Functions**
   - Game detection API
   - Board game data processing
   - Email notifications
   - User management

2. **API Integration**
   - Board Game Geek API integration
   - Vision API for game detection
   - Email service integration

### Data Flow

1. **User Authentication**
   - Firebase Authentication
   - User profile management
   - Session handling

2. **Game Management**
   - Game addition workflow
   - Borrowing system
   - Game night organization
   - Rating system

3. **Social Features**
   - Friend connections
   - Group management
   - Game night invitations
   - Borrowing requests

## Security

1. **Authentication**
   - Firebase Auth rules
   - Protected routes
   - Session management

2. **Data Access**
   - Firebase Database rules
   - Role-based access control
   - Data validation

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Local memory caching for game data
   - Session-based cache management

2. **Backend**
   - Two-tier caching architecture:
     * Firebase collections for server-side caching
     * Local memory cache for fast access
   - Monthly cache refresh via Cloud Functions
   - Dynamic cache updates based on usage patterns
   - Intelligent preservation of frequently accessed data
   - API rate limiting with automatic retries
   - Background processing for cache updates

3. **Caching Strategy**
   - Game rankings cached by category and month
   - Individual game details cached with usage metrics
   - Fallback to CSV data when API unavailable
   - Cache monitoring and analytics
   - See [Caching Architecture](./caching_architecture.md) for details

## Data Collections

### Firebase Collections

1. **Core Data**
   - /users: User profiles and preferences
   - /games: User-owned games
   - /groups: Gaming groups
   - /game-nights: Scheduled events

2. **Cache Collections**
   - /game-rankings/{category}/{month}: Popular games by category
   - /game-details/{gameId}: Cached game details with usage metrics
   - See [Cache Monitoring Setup](./cache_monitoring_setup.md) for monitoring

3. **Analytics**
   - /analytics/cache: Cache performance metrics
   - /analytics/api: API usage and errors
   - /analytics/user-patterns: User behavior analytics

## Development Workflow

1. **Local Development**
   - Environment setup
   - Development server
   - Testing environment

2. **Deployment**
   - Build process
   - Continuous integration
   - Production deployment
