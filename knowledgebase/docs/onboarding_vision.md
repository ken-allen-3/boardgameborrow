# Vision Service Documentation

## Overview
The vision service provides game detection capabilities using image analysis. It supports multiple game detection, confidence filtering, and manual search fallback.

## Components

### visionService.ts
The core service that handles image analysis and game detection.

#### Key Features
- Multiple game detection with confidence scoring
- Confidence threshold filtering (60% minimum)
- Game status tracking (pending/confirmed/rejected)
- Manual search fallback
- Enhanced error handling with specific error types

#### Interfaces

```typescript
interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  status?: 'pending' | 'confirmed' | 'rejected';
  matches?: BoardGame[];
}

class VisionServiceError extends Error {
  code: 'VISION_API_ERROR' | 'NETWORK_ERROR' | 'NO_GAMES_DETECTED' | 'LOW_CONFIDENCE' | 'VALIDATION_ERROR';
  details?: any;
}
```

#### Key Functions

```typescript
// Analyze image and detect games
async function analyzeShelfImage(base64Image: string): Promise<DetectedGame[]>

// Find matching games in database
async function findMatchingGames(detectedGames: DetectedGame[]): Promise<DetectedGame[]>

// Manual search fallback
async function manualGameSearch(query: string): Promise<BoardGame[]>
```

### GameDetectionResults.tsx
Component that displays detected games and handles user selection.

#### Features
- Multiple game selection with checkboxes
- Confidence score display
- Bounding box visualization
- Manual search integration
- Error handling with debug info

### GameSearchModal.tsx
Modal component for manual game search.

#### Features
- Multiple game selection
- Selection count display
- Done button for batch submission
- Popular games display
- Infinite scroll pagination

## Implementation Details

### Game Detection Flow
1. User captures image
2. Image is analyzed by vision API
3. Games are detected with confidence scores
4. Games above confidence threshold (60%) are marked as pending
5. Matching games are found in database
6. User can select multiple games to add
7. Manual search available as fallback

### Error Handling
The service includes comprehensive error handling:

```typescript
try {
  const detected = await analyzeShelfImage(photoData);
  const processedGames = await findMatchingGames(detected);
} catch (error) {
  if (error instanceof VisionServiceError) {
    switch (error.code) {
      case 'NO_GAMES_DETECTED':
      case 'LOW_CONFIDENCE':
        // Show manual search
        break;
      default:
        // Show error message
    }
  }
}
```

### Multiple Game Selection
Games can be selected in multiple ways:
1. From vision detection results
2. Through manual search
3. Via popular games list

Selection is managed using a Map to ensure uniqueness:
```typescript
const [selectedGames, setSelectedGames] = useState<Map<string, BoardGame>>(new Map());

const handleGameSelect = (game: BoardGame) => {
  setSelectedGames(prev => {
    const next = new Map(prev);
    if (next.has(game.id)) {
      next.delete(game.id);
    } else {
      next.set(game.id, game);
    }
    return next;
  });
};
```

## Best Practices

1. Always handle low confidence matches gracefully
2. Provide clear feedback about detection status
3. Offer manual search as fallback
4. Show confidence scores to users
5. Allow easy deselection of games
6. Batch process selected games
7. Preserve selection state across modal reopens

## Future Improvements

1. Improve confidence scoring algorithm
2. Add batch processing optimizations
3. Enhance bounding box accuracy
4. Add game cover image matching
5. Implement offline detection capabilities
