# Game Data Caching Architecture

## Overview
This document details the caching architecture implemented for board game data, designed to optimize performance and reduce API calls while ensuring data freshness.

## Architecture Components

### 1. Cloud Functions Endpoints

#### Cache Management Functions
- `initializeCache`: Populates cache with initial game data
- `getCacheMetrics`: Retrieves cache performance statistics
- `cleanupExpiredCache`: Scheduled cleanup of stale cache entries

#### API Functions with Cache Layer
- `searchGames`: Game search with caching
- `getGameDetails`: Game details with caching

All endpoints implement CORS handling with:
- Origin validation
- Preflight request handling
- Proper headers for cross-origin requests

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

### 2. Local Memory Cache
- Implemented as a Map for fast in-memory access
- Cleared on session initialization
- Caches frequently accessed game rankings by category

## Cache Update Mechanisms

### 1. Monthly Refresh (Scheduled)
- Runs via Cloud Function at midnight on the 1st of each month
- Updates game rankings while preserving high-usage games
- Process:
  1. Identifies high-usage games (10+ accesses)
  2. Fetches fresh rankings from BGG API
  3. Merges preserved games with new rankings
  4. Updates Firebase cache

### 2. Dynamic Updates
- Triggered by user interactions:
  - Game searches
  - AI/photo-vision detections
  - Game detail views
- Updates both Firebase and local cache
- Increments usage counters for analytics

## Data Flow

### Reading Game Rankings
1. Check local memory cache
2. If miss, check Firebase cache for current month
3. If miss or expired, fetch from BGG API
4. Update both caches with new data

### Reading Game Details
1. Check Firebase game-details cache
2. If miss, fetch from BGG API
3. Store in Firebase with usage metadata
4. Update local cache if needed

## Fallback Mechanisms

### CSV Fallback
- Used when BGG API is unavailable
- Process:
  1. Parse local CSV file
  2. Filter and sort by category
  3. Cache results with 'csv' source flag

### Error Handling
- Retry logic for API failures
- Rate limit handling
- Graceful degradation to CSV data
- Error logging and monitoring

## Cache Invalidation

### Automatic Invalidation
- Monthly rankings refresh
- 24-hour TTL for infrequently accessed games
- Preservation of high-usage games (10+ accesses)
- Session-based local cache clear

### Cache Events Collection
```
/cache-events/{eventId}
├── type: 'cache_hit' | 'cache_miss' | 'cache_refresh' | 'cache_error'
├── timestamp: number
├── data: {
│   ├── gameId?: string
│   ├── query?: string
│   ├── status?: string
│   ├── error?: string
│   └── duration?: number
│ }
└── metadata?: {
    ├── source: string
    └── details: any
}
```

### Manual Invalidation
- Available through admin functions
- Useful for:
  - Data corrections
  - Force refresh specific games
  - Clear problematic cache entries

## Performance Considerations

### Memory Usage
- Local cache size limits
- Selective caching based on usage patterns
- Preservation of frequently accessed games (10+ uses)
- Automatic cleanup of stale entries (24-hour TTL)
- Memory usage tracking and monitoring

### Network Optimization
- Batch updates where possible
- Compression for large responses
- Prioritized loading for visible content
- CORS optimization for cross-origin requests
- Rate limiting protection

## Implementation Details

### Security Considerations
- All write operations restricted to Cloud Functions
- Read operations require authentication
- CORS headers for secure cross-origin access
- Rate limiting on API endpoints
- Error logging and monitoring

### Key Classes and Services

#### BggApiService
```typescript
class BggApiService {
  async fetchGameDetails(gameId: string): Promise<GameData>
  async fetchCategoryRankings(category: string): Promise<GameData[]>
  private checkAndUpdateCache(gameId: string): Promise<GameData>
  private incrementUsageCount(gameId: string): Promise<void>
}
```

#### GameDataService
```typescript
class GameDataService {
  async getTopGamesForCategory(category: string, limit: number): Promise<GameData[]>
  async getGameById(id: string): Promise<GameData>
  private async fetchFromFirebase(category: string): Promise<GameData[]>
  private async fetchFromCSV(category: string): Promise<GameData[]>
}
```

### Cache Refresh Function
```typescript
export const refreshPopularGamesCache = onSchedule('0 0 1 * *', async (event) => {
  // 1. Get high usage games
  // 2. Fetch new rankings
  // 3. Merge and preserve
  // 4. Update cache
});
```

## Migration and Updates

### From localStorage to Firebase
- Gradual migration process
- Maintains backward compatibility
- Data validation during transfer

### Future Improvements
1. Implement predictive caching
2. Add cache warming for popular categories
3. Enhance analytics for cache optimization
4. Implement regional caching for global scale

## Related Documentation
- [Cache Monitoring Setup](./cache_monitoring_setup.md)
- [BGG API Integration](./api_integrations.md)
- [Game Type Selection Implementation](./game_type_selection_implementation.md)
