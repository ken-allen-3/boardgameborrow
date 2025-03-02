# CSV Migration Notes

## Overview
This document outlines the migration from API-based game data to CSV-based data, including implementation details, affected components, and best practices.

## Background
- Previously, game data was fetched directly from the BGG API
- This approach had limitations:
  - API rate limits
  - Network latency
  - CORS issues
  - Reliability concerns
- The CSV-based solution addresses these issues by:
  - Providing data locally
  - Eliminating network requests
  - Improving performance
  - Enhancing reliability

## Implementation Details

### Data Structure
The CSV data structure includes:
- Game ID
- Game name
- Rank information for different categories
- No detailed information like images, player counts, etc.

The GameData interface was updated to include:
```typescript
export interface GameData {
  id: string;
  name: string;
  rank: {
    abstracts: number | null;
    cgs: number | null;
    childrens: number | null;
    family: number | null;
    party: number | null;
    strategy: number | null;
    thematic: number | null;
    wargames: number | null;
  };
  image?: string;
  playerCount?: {
    min: number;
    max: number;
  };
  playTime?: {
    min: number;
    max: number;
  };
  age?: {
    min: number;
  };
  description?: string;
  type?: string;
}
```

### Affected Components

1. **gameDataService.ts**
   - Implements CSV parsing and data retrieval
   - Maintains local cache for performance
   - Provides category-based filtering

2. **StepQuickAddGames.tsx**
   - Updated handleComplete function to match GameData interface
   - Added rank field to game data before saving

3. **addGame function**
   - Now expects GameData interface with rank field
   - Validates data structure before saving

## Best Practices

### Working with CSV Data
- Always include the rank field when creating GameData objects
- Provide fallbacks for optional fields
- Use proper typing to catch interface mismatches

### UI Components
- Continue using onboardingGames.json for UI display where appropriate
- Transform data to match GameData interface before saving
- Validate data structure to prevent runtime errors

### Future Considerations
- Regular updates to CSV data
- Potential hybrid approach for detailed game information
- Monitoring for data freshness and accuracy

## CSV Data Format

The CSV file (boardgameranks6.csv) follows this format:
```
id,name,abstracts,cgs,childrens,family,party,strategy,thematic,wargames
224517,Brass: Birmingham,null,null,null,null,null,1,null,null
161936,Pandemic Legacy: Season 1,null,null,null,null,null,3,1,null
342942,Ark Nova,null,null,null,null,null,2,null,null
...
```

Where:
- id: The BoardGameGeek ID
- name: The game name
- abstracts, cgs, childrens, family, party, strategy, thematic, wargames: Rank in each category (null if not ranked)

## CSV Data Loading Process

The gameDataService loads CSV data using this process:

1. **Initialization**:
   ```typescript
   async initializeCache() {
     localGameCache.clear();
     const categories = ['strategy', 'family', 'party', 'thematic', 'abstracts', 'wargames'];
     for (const category of categories) {
       const games = await this.fetchFromCSV(category);
       localGameCache.set(category, games);
     }
     return { success: true };
   }
   ```

2. **CSV Fetching**:
   ```typescript
   async fetchFromCSV(category: string): Promise<GameData[]> {
     const response = await fetch('/boardgameranks6.csv');
     const csvText = await response.text();
     const games = this.parseCSV(csvText);
     return Object.values(games)
       .filter(game => game.rank[category as keyof GameData['rank']] !== null)
       .sort((a, b) => {
         const rankA = a.rank[category as keyof GameData['rank']];
         const rankB = b.rank[category as keyof GameData['rank']];
         if (rankA === null && rankB === null) return 0;
         if (rankA === null) return 1;
         if (rankB === null) return -1;
         return rankA - rankB;
       });
   }
   ```

3. **CSV Parsing**:
   ```typescript
   parseCSV(csvText: string): { [key: string]: GameData } {
     const lines = csvText.split('\n');
     const headers = lines[0].split(',');
     const games: { [key: string]: GameData } = {};

     for (let i = 1; i < lines.length; i++) {
       const values = lines[i].split(',');
       if (values.length < headers.length) continue;

       const game: GameData = {
         id: values[0],
         name: values[1],
         rank: {
           abstracts: values[2] ? parseInt(values[2]) : null,
           cgs: values[3] ? parseInt(values[3]) : null,
           childrens: values[4] ? parseInt(values[4]) : null,
           family: values[5] ? parseInt(values[5]) : null,
           party: values[6] ? parseInt(values[6]) : null,
           strategy: values[7] ? parseInt(values[7]) : null,
           thematic: values[8] ? parseInt(values[8]) : null,
           wargames: values[9] ? parseInt(values[9]) : null
         }
       };

       games[game.id] = game;
     }

     return games;
   }
   ```

## Integration with Existing Components

### StepQuickAddGames Component

The StepQuickAddGames component was updated to work with the new CSV-based data structure:

1. **Data Transformation with Sequential Processing**:
   ```typescript
   // Process games sequentially to avoid race conditions
   for (const game of selectedGameData) {
     await addGame(currentUser.email!, {
       id: game.id,
       name: game.name,
       image: game.image || '',
       playerCount: {
         min: game.playerCount?.min || 1,
         max: game.playerCount?.max || 1
       },
       playTime: {
         min: game.playTime?.min || 0,
         max: game.playTime?.max || 0
       },
       rank: {
         abstracts: null,
         cgs: null,
         childrens: null,
         family: null,
         party: null,
         strategy: null,
         thematic: null,
         wargames: null
       },
       type: 'boardgame'
     });
   }
   ```

## Troubleshooting

### Common Issues

1. **Missing Rank Field**
   - **Symptom**: Type errors or runtime errors when adding games
   - **Solution**: Ensure all GameData objects include the rank field, even if all values are null

2. **Data Structure Mismatch**
   - **Symptom**: addGame function fails with validation errors
   - **Solution**: Verify the data structure matches the GameData interface, especially nested objects

3. **CSV Parsing Errors**
   - **Symptom**: Empty game lists or missing data
   - **Solution**: Check CSV format, ensure proper line endings, validate CSV data

4. **Only One Game Added When Multiple Selected**
   - **Symptom**: When selecting multiple games in StepQuickAddGames, only one appears in collection
   - **Cause**: Race condition with concurrent Firebase writes using Promise.all()
   - **Solution**: Process games sequentially using a for...of loop instead of Promise.all()
   ```typescript
   // Instead of Promise.all
   for (const game of selectedGameData) {
     await addGame(currentUser.email!, {
       // game data...
     });
   }
   ```

### Debugging Tips

1. Check browser console for errors related to CSV parsing
2. Verify CSV file is accessible and properly formatted
3. Use browser network tab to confirm CSV file is loading
4. Add console.log statements to track data transformation

## Related Documentation
- [Cache System Fix - January 2025](./cache_system_fix_2025_01.md)
- [Quick Add Implementation](./quick_add_implementation.md)
- [Caching Architecture](./caching_architecture.md)
