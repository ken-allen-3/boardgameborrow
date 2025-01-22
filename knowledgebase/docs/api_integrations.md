# API Integrations

## Architecture Overview

The application uses a hybrid architecture combining Firebase Cloud Functions with client-side API integration:

1. Cloud Functions Layer
   - Handles BGG API communication
   - Provides game detection capabilities
   - Implements rate limiting and CORS
   - Manages API response caching

2. Client Layer
   - Implements sophisticated caching
   - Handles request queuing
   - Provides batch processing
   - Manages error handling and retries

```mermaid
graph TD
    A[Client Application] --> B[Cloud Functions Layer]
    B --> C[BoardGameGeek API]
    B --> D[OpenAI API]
    A --> E[Firebase Services]
    
    subgraph "Cloud Functions"
    B --> F[Rate Limiting]
    B --> G[CORS Handling]
    B --> H[Game Detection]
    end
    
    subgraph "Client Features"
    A --> I[Request Queue]
    A --> J[Cache System]
    A --> K[Batch Processing]
    end
```

## Firebase Cloud Functions

### Endpoints

1. Game Search Function
```typescript
export const bggSearch = functions.https.onRequest((request, response) => {
  // Handles BGG API /search endpoint
  // Implements caching and rate limiting
  // Returns XML response
});
```

2. Game Details Function
```typescript
export const bggGameDetails = functions.https.onRequest((request, response) => {
  // Handles BGG API /thing endpoint
  // Implements caching and rate limiting
  // Returns XML response
});
```

3. Image Analysis Function
```typescript
export const analyzeImage = functions.https.onRequest(async (req, res) => {
  // Handles image analysis using Vision API
  // Processes annotations using GameDetectionService
  // Returns detected games with confidence scores
});
```

### Rate Limiting Implementation

The system implements a Firestore-based rate limiting middleware:

```typescript
export const rateLimiter = functions.https.onRequest(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const key = `ratelimit_${ip}`;
  
  // Window: 1 minute
  // Max Requests: 30 per minute
  const windowSize = 60 * 1000;
  const maxRequests = 30;
  
  // Track requests in Firestore
  const requests = doc.exists ? 
    doc.data()!.requests.filter((time: number) => time > now - windowSize) : 
    [];
});
```

## Game Detection System

### Overview

The game detection system uses a hybrid approach combining AI-based detection with rule-based processing:

1. AI-Based Detection
```typescript
async function detectGamesWithAI(text: string): Promise<DetectedGame[]> {
  // Uses OpenAI GPT-4 for intelligent game detection
  // Processes text with context-aware prompting
  // Returns structured game data with confidence scores
}
```

2. Rule-Based Detection
```typescript
class GameDetectionService {
  // Known publishers database
  private readonly KNOWN_PUBLISHERS = new Set([
    'hasbro', 'asmodee', 'fantasy flight', // etc.
  ]);

  // Known games database
  private readonly KNOWN_GAMES = new Set([
    'sushi go', 'love letter', 'splendor', // etc.
  ]);

  // Pattern matching for game titles
  private readonly GAME_PATTERNS = [
    /^(.*?)\s*(?:card game|board game|game|tm)$/i,
    /^(.*?)\s*(?:ages?\s*\d+[\+]?)$/i,
    // etc.
  ];
}
```

### Confidence Scoring System

The system uses multiple factors to calculate confidence scores:

```typescript
interface ConfidenceParams {
  block: TextBlock;
  hasPublisher: boolean;
  hasMetadata: boolean;
  group: TextBlock[];
  isKnownGame?: boolean;
}

private calculateConfidence(params: ConfidenceParams): number {
  let confidence = 0.5;
  
  // Size-based confidence
  if (params.block.area > 5000) confidence += 0.2;
  
  // Publisher and metadata confidence
  if (params.hasPublisher) confidence += 0.2;
  if (params.hasMetadata) confidence += 0.1;
  
  // Known game confidence
  if (params.isKnownGame) confidence += 0.3;
  
  // Additional factors...
  return Math.min(confidence, 1.0);
}
```

## Frontend Integration

### Caching System

The frontend implements a sophisticated caching system with:
- TTL-based expiration
- Size limits
- Version control
- Performance tracking

```typescript
class PersistentCache<T> {
  private readonly key: string;
  private cache: Map<string, CacheEntry<T>>;
  
  // Cache configuration
  private readonly CACHE_VERSION = '1.0';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100;
}
```

### Request Queuing

Implements request queuing to handle concurrent API calls:

```typescript
const requestQueue = new Map<string, Promise<any>>();

// Queue management in makeApiRequest
if (requestQueue.has(cacheKey)) {
  return requestQueue.get(cacheKey);
}

const request = axios.get(/*...*/)
  .finally(() => {
    requestQueue.delete(cacheKey);
  });

requestQueue.set(cacheKey, request);
```

### Batch Processing

Implements efficient batch processing for multiple game requests:

```typescript
async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  batchSize = BATCH_SIZE,
  delay = BATCH_DELAY
): Promise<any[]> {
  // Process items in smaller batches
  // Implements delays between batches
  // Handles errors per batch
}
```

## Error Handling & Recovery

### Error Types

```typescript
interface AppError extends Error {
  code: string;
  context?: Record<string, any>;
}

const ErrorCodes = {
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  API_ERROR: 'API_ERROR',
  XML_PARSE_ERROR: 'XML_PARSE_ERROR',
  GAME_FETCH_ERROR: 'GAME_FETCH_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR'
};
```

### Error Recovery

The system implements sophisticated error recovery:

1. Rate Limit Handling
```typescript
if (error.response?.status === 429) {
  const operation = endpoint.includes('search') ? 'game search' : 
                   endpoint.includes('thing') ? 'game details' : 
                   'BoardGameGeek API';
  throw createAppError(
    `The BoardGameGeek API is currently rate limited. Please wait a few minutes before trying another ${operation}.`,
    'RATE_LIMIT_ERROR',
    { operation, endpoint }
  );
}
```

2. Cache Management
```typescript
// Cache invalidation on error
if (error.code === 'NOT_FOUND_ERROR') {
  notFoundCache.set(id, true, 'game-details');
}

// Cache bypass on error
if (error.status >= 500) {
  cache.delete(cacheKey);
}
```

## Performance Monitoring

The system includes comprehensive performance monitoring:

```typescript
// Performance measurement
export async function searchGames(query: string): Promise<SearchResults> {
  return measurePerformance('search-games', async () => {
    // Search implementation
  });
}

// Cache operation tracking
trackCacheOperation(cacheName, 'hit', { key });
trackCacheOperation(cacheName, 'miss', { key });
trackCacheOperation(cacheName, 'evict', { reason: 'expired' });
```

## Testing

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should handle rate limiting', async () => {
    const results = await Promise.allSettled(
      Array(5).fill(null).map(() => searchGames('Catan'))
    );
    expect(results.some(r => r.status === 'fulfilled')).toBe(true);
  });
  
  it('should use cache for repeated requests', async () => {
    const first = await getGameById('123');
    const second = await getGameById('123');
    expect(second).toEqual(first);
  });
});
