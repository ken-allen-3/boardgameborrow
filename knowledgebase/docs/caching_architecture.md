# Game Data Caching Architecture

## Overview
This document details the caching architecture implemented for board game data, designed to optimize performance while maintaining simplicity and reliability. The system uses a hybrid approach, combining local CSV data for fast initialization with optional Firebase caching for extended functionality.

## Architecture Components

### 1. Local Cache System

#### CSV-Based Initialization
- Primary data source: `boardgameranks6.csv`
- Contains pre-populated game rankings by category
- No authentication required
- Zero network latency
- Instant availability during onboarding

#### Memory Cache
- `localGameCache`: Map<string, GameData[]>
- Stores parsed CSV data by category
- Provides immediate access to game data
- Cleared on page refresh
- No persistence requirements

### 2. Firebase Integration (Optional)

#### Game Details Collection
```
/game-details/{gameId}
├── gameData: GameData
└── metadata
    ├── lastUpdated: timestamp
    ├── lastAccessed: timestamp
    ├── usageCount: number
    └── source: 'bgg-api'
```

- Used for additional game details not in CSV
- Accessed only when needed
- Write operations through Cloud Functions only
- Read operations require authentication

### 3. Client-Side Implementation

#### Game Data Service
- Manages CSV data parsing and caching
- Implements category-based filtering
- Provides game ranking functionality
- Handles fallback to Firebase when needed

#### Performance Features
- Efficient CSV parsing
- In-memory caching for fast access
- Minimal network requests
- No authentication delays

## Cache Operations

### Initialization Process
1. Clear local cache
2. For each game category:
   - Load category data from CSV
   - Parse and filter games
   - Store in localGameCache
3. Return success status

### Data Access Flow
1. Check localGameCache first
2. If not found, try Firebase cache
3. If still not found, fetch from CSV
4. Update localGameCache with results

### Game Details Retrieval
1. Check Firebase game-details collection
2. If not found, fetch from BGG API
3. Store results in Firebase
4. Return game details to client

## Error Handling

### CSV Operations
- Validate CSV format
- Handle missing data gracefully
- Provide fallback values
- Log parsing errors

### Firebase Operations
- Handle authentication errors
- Manage network failures
- Implement retry logic
- Track error patterns

## Performance Considerations

### CSV Optimization
- Efficient parsing algorithms
- Minimal memory footprint
- Quick category filtering
- Fast sorting operations

### Memory Management
- Clear cache when appropriate
- Limit cached data size
- Remove unused categories
- Optimize data structures

## Related Documentation
- [Cache Monitoring Setup](./cache_monitoring_setup.md)
- [Cache System Fix - January 2025](./cache_system_fix_2025_01.md)
- [CORS Investigation - February 2025](./cors_investigation_2025_02.md)
- [API Integrations](./api_integrations.md)
