# Developer Instructions

## Project Setup
...

## Vision Service & Game Selection

### Overview
The vision service and game selection components have been enhanced to support multiple game selection, confidence filtering, and improved error handling.

### Key Components

#### Vision Service
The vision service (`visionService.ts`) provides game detection capabilities:

```typescript
// Example: Using the vision service
import { analyzeShelfImage, findMatchingGames } from '../services/visionService';

const handlePhotoCapture = async (photoData: string) => {
  try {
    const detected = await analyzeShelfImage(photoData);
    const processedGames = await findMatchingGames(detected);
    // Handle detected games...
  } catch (error) {
    if (error instanceof VisionServiceError) {
      switch (error.code) {
        case 'NO_GAMES_DETECTED':
        case 'LOW_CONFIDENCE':
          // Show manual search...
          break;
      }
    }
  }
};
```

#### Multiple Game Selection
Game selection is managed using a Map to ensure uniqueness and efficient lookups:

```typescript
const [selectedGames, setSelectedGames] = useState<Map<string, BoardGame>>(new Map());

// Add or remove a game from selection
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

// Submit selected games
const handleSubmit = (games: BoardGame[]) => {
  // Process games in sequence to maintain order
  for (const game of games) {
    await addGame(currentUser.email, game);
  }
};
```

### Implementation Guidelines

1. **Vision Service Usage**
   - Always handle VisionServiceError with appropriate error messages
   - Use confidence threshold (60%) for automatic inclusion
   - Provide manual search fallback for failed detections
   - Track game status (pending/confirmed/rejected)

2. **Multiple Game Selection**
   - Use Map for selected games state
   - Provide clear visual feedback for selected state
   - Allow easy deselection
   - Show selection count
   - Add Done button for batch submission

3. **Error Handling**
   - Handle specific error types appropriately
   - Show debug information when needed
   - Provide clear user feedback
   - Offer recovery options

4. **UI Components**
   - Use consistent selection UI across components
   - Show confidence scores where applicable
   - Provide manual search option
   - Display game previews with details

### Example: Adding Multiple Game Selection

```typescript
// Component with multiple game selection
function GameSelectionComponent() {
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

  const handleDone = () => {
    if (selectedGames.size > 0) {
      onGameSelect(Array.from(selectedGames.values()));
      onClose();
    }
  };

  return (
    <div>
      {/* Selection UI */}
      <div className="space-y-4">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game)}
            className={`flex items-center gap-4 p-4 border rounded-lg ${
              selectedGames.has(game.id) ? 'bg-indigo-100 border-indigo-500' : ''
            }`}
          >
            <img src={game.thumb_url} alt={game.name} className="w-16 h-16" />
            <div className="flex-1">
              <h3>{game.name}</h3>
              <p>{game.year_published}</p>
            </div>
            {selectedGames.has(game.id) ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>

      {/* Done button */}
      <button
        onClick={handleDone}
        disabled={selectedGames.size === 0}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >
        Done ({selectedGames.size})
      </button>
    </div>
  );
}
```

### Testing Multiple Game Selection

1. **Vision Detection**
   - Test with various image qualities
   - Verify confidence threshold filtering
   - Check error handling for failed detections
   - Verify manual search fallback

2. **Game Selection**
   - Test adding/removing games
   - Verify selection state persistence
   - Check batch submission
   - Test error handling during submission

3. **UI/UX**
   - Verify selection feedback
   - Test modal behavior
   - Check error message clarity
   - Verify accessibility

## Additional Resources
...
