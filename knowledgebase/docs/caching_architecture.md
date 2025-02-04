# Game Data Caching Architecture

## Overview
This document details the caching architecture implemented for board game data, designed to optimize performance and reduce API calls while ensuring data freshness.

## Architecture Components

### 1. Cloud Functions Endpoints

#### Cache Management Functions
- `initializeCache`: Populates cache with initial game data
  - Requires authentication
  - Handles CORS automatically via httpsCallable
  - Returns success/failure status with detailed messages

- `getCacheMetrics`: Retrieves cache performance statistics
  - Requires authentication
  - Returns detailed metrics about cache usage
  - Includes hit rates, memory usage, and refresh dates

- `cleanupExpiredCache`: Scheduled cleanup of stale cache entries
  - Runs every 24 hours
  - Preserves frequently accessed games (10+ uses)
  - Logs cleanup statistics

All endpoints implement:
- Authentication checks
- Error handling with detailed logging
- Performance monitoring
- Event tracking

### 2. Firebase Cache Collections

#### Game Rankings Cache
```
/game-rankings/{category}/{month}
├── games: GameData[]
├── lastUpdated: timestamp
├── source: 'bgg-api' | 'csv'
└── metadata
    ├── totalGames: number
    ├── preservedGames: number
    └── refreshDate: string
```

#### Game Details Cache
```
/game-details/{gameId}
├── gameData: GameData
└── metadata
    ├── lastUpdated: timestamp
    ├── lastAccessed: timestamp
    ├── usageCount: number
    ├── source: 'bgg-api' | 'csv' | 'ai-vision'
    └── detectionConfidence?: number
```

#### Cache Events Collection
```
/cache-events/{eventId}
├── type: 'hit' | 'miss' | 'error' | 'refresh'
├── timestamp: number
├── data: {
│   ├── operation: string
│   ├── duration: number
│   ├── memoryUsage: number
│   └── error?: string
│ }
└── metadata?: any
```

### 3. Client-Side Implementation

#### Cache Service
- Uses Firebase Functions SDK for all operations
- Implements proper error handling
- Provides detailed logging for debugging
- Handles authentication automatically

#### Admin Dashboard
- Displays real-time cache metrics
- Provides cache initialization controls
- Shows detailed error messages
- Includes loading states for operations

## Cache Operations

### Initialization Process
1. Client calls `initializeCache` Cloud Function
2. Function verifies authentication
3. Checks if cache already exists
4. For each game category:
   - Fetches data from BGG API
   - Stores in appropriate collections
   - Updates metadata
5. Logs operation results

### Metrics Collection
1. Client requests metrics via `getCacheMetrics`
2. Function aggregates data from:
   - Game details collection
   - Game rankings collection
   - Cache events collection
3. Calculates:
   - Total cached games
   - Cache hit rate
   - Memory usage
   - Last refresh date

### Cache Cleanup
1. Scheduled function runs daily
2. Identifies:
   - Stale game details (not accessed in 24 hours)
   - Infrequently used games (<10 accesses)
   - Old rankings data
3. Preserves:
   - Frequently accessed games (10+ uses)
   - Recently accessed games
4. Logs cleanup statistics

## Error Handling

### Client-Side
- Detailed error logging
- User-friendly error messages
- Automatic retry for transient errors
- Loading state management

### Server-Side
- Authentication verification
- Operation logging
- Error event tracking
- Performance monitoring

## Monitoring and Optimization

### Performance Metrics
- Cache hit/miss ratios
- Operation durations
- Memory usage
- API rate limits

### Optimization Strategies
- Preserve frequently used data
- Clean up stale entries
- Track usage patterns
- Monitor memory usage

## Related Documentation
- [Cache Monitoring Setup](./cache_monitoring_setup.md)
- [Cache System Fix - January 2025](./cache_system_fix_2025_01.md)
- [CORS Investigation - February 2025](./cors_investigation_2025_02.md)
- [API Integrations](./api_integrations.md)
