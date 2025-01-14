# API Integrations

## Board Game Geek API

### Overview
Integration with BoardGameGeek's XML API2 for game data retrieval.

### Endpoints
```typescript
const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

// Search games
GET /search?query={searchTerm}&type=boardgame

// Get game details
GET /thing?id={gameId}&stats=1
```

### Implementation
```typescript
// Game search service
async function searchGames(query: string): Promise<GameSearchResult[]> {
  const response = await axios.get(`${BGG_BASE_URL}/search`, {
    params: {
      query,
      type: 'boardgame'
    }
  });
  return parseXMLResponse(response.data);
}

// Game details service
async function getGameDetails(gameId: string): Promise<GameDetails> {
  const response = await axios.get(`${BGG_BASE_URL}/thing`, {
    params: {
      id: gameId,
      stats: 1
    }
  });
  return parseXMLResponse(response.data);
}
```

## Google Cloud Vision API

### Overview
Used for board game image recognition and text extraction.

### Configuration
```typescript
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
```

### Features Used
- Text Detection (OCR)
- Image Labeling
- Web Detection
- Object Detection (Beta)

### Implementation
```typescript
async function detectGameFromImage(imageBuffer: Buffer) {
  const [result] = await vision.textDetection(imageBuffer);
  const [labelResult] = await vision.labelDetection(imageBuffer);
  const [objectResult] = await vision.objectLocalization(imageBuffer);
  return processVisionResults(result, labelResult, objectResult);
}
```

## Email Service Integration

### SendGrid Implementation
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to: string, template: string, data: any) {
  const msg = {
    to,
    from: 'noreply@boardgameborrow.com',
    templateId: getTemplateId(template),
    dynamicTemplateData: data
  };
  return sgMail.send(msg);
}
```

### Email Templates
1. Welcome Email
2. Borrow Request
3. Game Return Reminder
4. Game Night Invitation
5. Friend Request
6. Game Night Update
7. Game Suggestion Notification

## Firebase Services

### Authentication
```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
```

### Cloud Storage
```typescript
import { getStorage } from 'firebase/storage';

const storage = getStorage();
```

### Cloud Functions
```typescript
export const processGameImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    // Image processing logic
  });
```

## Geocoding API

### Google Maps Integration
```typescript
const geocoder = new google.maps.Geocoder();

async function geocodeAddress(address: string) {
  const result = await geocoder.geocode({ address });
  return {
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng()
  };
}
```

## Rate Limiting

### Implementation
```typescript
const rateLimit = {
  bgg: {
    windowMs: 1000,
    maxRequests: 2,
    retryAfter: 2000,
    maxRetries: 3
  },
  vision: {
    windowMs: 60000,
    maxRequests: 100,
    retryAfter: 60000,
    maxRetries: 2
  },
  geocoding: {
    windowMs: 1000,
    maxRequests: 50,
    retryAfter: 1000,
    maxRetries: 3
  }
};

// Rate limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(api: keyof typeof rateLimit): boolean {
    const now = Date.now();
    const config = rateLimit[api];
    const requests = this.requests.get(api) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < config.windowMs);
    
    if (validRequests.length < config.maxRequests) {
      this.requests.set(api, [...validRequests, now]);
      return true;
    }
    
    return false;
  }
}
```

## Error Handling

### API Error Types
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number;
}

const ErrorCodes = {
  BGG_TIMEOUT: 'BGG_TIMEOUT',
  BGG_RATE_LIMIT: 'BGG_RATE_LIMIT',
  VISION_QUOTA_EXCEEDED: 'VISION_QUOTA_EXCEEDED',
  VISION_INVALID_IMAGE: 'VISION_INVALID_IMAGE',
  INVALID_GAME_DATA: 'INVALID_GAME_DATA',
  GEOCODING_ERROR: 'GEOCODING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR'
};

const RetryableErrors = new Set([
  ErrorCodes.BGG_TIMEOUT,
  ErrorCodes.BGG_RATE_LIMIT,
  ErrorCodes.NETWORK_ERROR
]);
```

### Error Handling Implementation
```typescript
async function handleApiError(error: any, api: string): Promise<ApiError> {
  const errorResponse: ApiError = {
    code: 'UNKNOWN_ERROR',
    message: error.message,
    retryable: false
  };

  if (error.response) {
    const status = error.response.status;
    errorResponse.code = getErrorCode(status);
    errorResponse.message = error.response.data.message || 'API Error';
    errorResponse.details = error.response.data;
    
    // Handle rate limiting
    if (status === 429) {
      errorResponse.code = `${api.toUpperCase()}_RATE_LIMIT`;
      errorResponse.retryable = true;
      errorResponse.retryAfter = parseInt(error.response.headers['retry-after']) * 1000;
    }
    
    // Handle specific API errors
    if (api === 'bgg' && status === 202) {
      errorResponse.code = ErrorCodes.BGG_TIMEOUT;
      errorResponse.retryable = true;
      errorResponse.retryAfter = 5000;
    }
  }

  errorResponse.retryable = RetryableErrors.has(errorResponse.code);
  return errorResponse;
}

// Retry mechanism
async function withRetry<T>(
  operation: () => Promise<T>,
  api: keyof typeof rateLimit,
  maxRetries = rateLimit[api].maxRetries
): Promise<T> {
  let lastError: ApiError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = await handleApiError(error, api);
      
      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = lastError.retryAfter || rateLimit[api].retryAfter;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

## Testing

### API Mocks
```typescript
const mockBggResponse = {
  items: {
    item: [
      {
        id: '123',
        name: { value: 'Test Game' }
      }
    ]
  }
};
```

### Integration Tests
```typescript
describe('BGG API Integration', () => {
  it('should fetch game details', async () => {
    const details = await getGameDetails('123');
    expect(details).toHaveProperty('name');
  });
  
  it('should handle rate limiting', async () => {
    const rateLimiter = new RateLimiter();
    const promises = Array(5).fill(null).map(() => 
      withRetry(() => getGameDetails('123'), 'bgg')
    );
    const results = await Promise.allSettled(promises);
    expect(results.some(r => r.status === 'fulfilled')).toBe(true);
  });
});
