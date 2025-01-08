import { protos } from '@google-cloud/vision';

type IEntityAnnotation = protos.google.cloud.vision.v1.IEntityAnnotation;
type IBoundingPoly = protos.google.cloud.vision.v1.IBoundingPoly;
type IVertex = protos.google.cloud.vision.v1.IVertex;

interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    players?: string;
    ages?: string;
    gameType?: string;
    publisher?: string;
  };
}

interface TextBlock {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  area: number;
  confidence: number;
}

interface ProcessedText {
  title: string | null;
  metadata: Record<string, string>;
}

interface ConfidenceParams {
  block: TextBlock;
  hasPublisher: boolean;
  hasMetadata: boolean;
  group: TextBlock[];
  isKnownGame?: boolean;
}

export class GameDetectionService {
  private readonly KNOWN_PUBLISHERS = new Set([
    'hasbro',
    'asmodee',
    'fantasy flight',
    'z-man',
    'days of wonder',
    'rio grande',
    'gamewright',
    'matagot',
    'cmon',
    'stonemaier',
    'cryptozoic',
    'wizards of the coast',
    'portal games',
    'iello',
    'repos production',
    'czech games',
    'plan b games',
    'renegade',
    'pegasus spiele',
    'ravensburger',
    'kosmos',
    'lookout games',
    'greater than games',
    'plaid hat',
    'queen games',
    'blue orange',
    'capstone games',
    'pandasaurus',
    'red raven',
    'thunderworks'
  ]);

  private readonly KNOWN_GAMES = new Set([
    'sushi go',
    'sushi go party',
    'love letter',
    'splendor',
    'catan',
    'ticket to ride',
    'pandemic',
    'codenames',
    'azul',
    'carcassonne',
    'gloomhaven',
    'wingspan',
    'terraforming mars',
    'spirit island',
    'ark nova',
    'brass birmingham',
    'viticulture',
    'root',
    '7 wonders',
    'dominion',
    'everdell',
    'scythe',
    'king of tokyo',
    'patchwork',
    'cascadia',
    'dune imperium',
    'lost ruins of arnak',
    'marvel champions',
    'quacks of quedlinburg',
    'betrayal at house on the hill'
  ]);

  private readonly COMMON_WORDS = new Set([
    'the', 'game', 'edition', 'expansion', 'board', 'card',
    'deluxe', 'version', 'classic', 'new', 'games'
  ]);

  private readonly GAME_PATTERNS = [
    /^(.*?)\s*(?:card game|board game|game|tm)$/i,
    /^(.*?)\s*(?:ages?\s*\d+[\+]?)$/i,
    /^(.*?)\s*(?:\d+-\d+\s*players?)$/i,
    /^(.*?)\s*(?:expansion|base set|collector's edition)$/i,
    /^(.*?)\s*(?:2nd|3rd|[0-9]+th)\s*edition$/i,
    /^(.*?)\s*(?:the\s+board\s+game)$/i,
    /^(.*?)\s*(?:dice game|card drafting|deck building)$/i
  ];

  private readonly METADATA_PATTERNS: Record<string, RegExp> = {
    players: /(\d+[-–]?\d*\+?)\s*players?/i,
    ages: /ages?\s*(\d+\+?)/i,
    gameType: /(card game|board game|party game|dice game|deck builder|strategy game)/i,
    playTime: /(\d+[-–]?\d*)\s*(?:min|minutes)/i,
    complexity: /(easy|medium|hard|complex|family|strategy|expert)/i
  };

  private readonly TITLE_INDICATORS = new Set([
    'presents',
    'edition',
    'expansion',
    'series',
    'collection',
    'volume',
    'vol',
    'set'
  ]);

  async processAnnotations(annotations: IEntityAnnotation[] | null | undefined): Promise<DetectedGame[]> {
    if (!annotations?.length) return [];

    // Get the full text from the first annotation
    const fullText = annotations[0].description || '';
    
    // Try AI-based detection first
    const aiGames = await this.detectGamesWithAI(fullText);
    
    // Also try rule-based detection
    const textBlocks = this.convertAnnotationsToBlocks(annotations);
    const groups = this.groupTextBlocks(textBlocks);
    const ruleBasedGames = this.identifyGamesFromGroups(groups);

    // Combine and deduplicate results
    const allGames = [...aiGames];
    for (const game of ruleBasedGames) {
      if (!allGames.some(g => this.fuzzyMatch(g.title, game.title) > 0.8)) {
        allGames.push(game);
      }
    }

    return allGames.sort((a, b) => b.confidence - a.confidence);
  }

  private async detectGamesWithAI(text: string, retries = 3): Promise<DetectedGame[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, skipping AI detection');
      return [];
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const prompt = `
        You are a board game expert. Analyze this text from a board game image and identify any board games mentioned.
        Focus on identifying actual board game titles, not generic terms.

        Consider these patterns:
        1. Titles are often the largest text on the box
        2. Look for known publisher names nearby (e.g., Fantasy Flight, Asmodee, Z-Man Games)
        3. Look for patterns like "X-Y players", "Ages Z+", "Playing Time: W min"
        4. Ignore generic descriptors like "board game", "card game", "family game"
        5. Pay attention to special editions, expansions, or series names

        Format your response as a JSON array of objects. Example:
        [
          {
            "title": "Pandemic",
            "confidence": 0.95,
            "metadata": {
              "players": "2-4",
              "ages": "10+",
              "gameType": "cooperative board game",
              "publisher": "Z-Man Games"
            }
          }
        ]

        Use high confidence (0.8-1.0) when:
        - The title is clearly visible and matches a known board game
        - There's supporting metadata (player count, age range, etc.)
        - A known publisher is mentioned

        Use medium confidence (0.6-0.8) when:
        - The title is visible but without much supporting information
        - The text might be part of a game title but needs context
        - The format matches board game patterns but the title is unfamiliar

        Use low confidence (<0.6) or omit when:
        - The text is likely not a game title
        - There's too much ambiguity
        - The text is generic or descriptive

        Text to analyze:
        ${text}
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (attempt ${attempt}/${retries}):`, errorText);
        
        // Check if we should retry
        if (response.status === 429 || response.status >= 500) {
          if (attempt < retries) {
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        return [];
      }

      const data = await response.json();
      let games: DetectedGame[] = [];

      try {
        games = JSON.parse(data.choices[0].message.content);
        
        // Validate the response format
        if (!Array.isArray(games)) {
          console.error('Invalid AI response format - expected array:', data.choices[0].message.content);
          return [];
        }

        // Validate and clean each game object
        games = games.filter(game => {
          if (!game.title || typeof game.title !== 'string') return false;
          if (!game.confidence || typeof game.confidence !== 'number') return false;
          return true;
        });

      } catch (parseError) {
        console.error('Error parsing AI response:', parseError, 'Raw content:', data.choices[0].message.content);
        return [];
      }

      // Add bounding boxes if we can find matching text blocks
      return games.map((game: DetectedGame) => ({
        ...game,
        confidence: Math.min(game.confidence + 0.2, 1.0) // Boost AI confidence slightly
      }));

    } catch (error) {
      console.error(`OpenAI API error (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return [];
    }
  }

  return []; // All retries failed
  }

  private convertAnnotationsToBlocks(annotations: IEntityAnnotation[]): TextBlock[] {
    return annotations
      .slice(1)
      .map(annotation => {
        const box = annotation.boundingPoly ? this.extractBoundingBox(annotation.boundingPoly) : undefined;
        if (!box || !annotation.description) return null;

        const area = box.width * box.height;
        return {
          text: annotation.description.trim(),
          boundingBox: box,
          area,
          confidence: annotation.confidence || 0.5
        };
      })
      .filter((block): block is TextBlock => block !== null);
  }

  private groupTextBlocks(blocks: TextBlock[]): TextBlock[][] {
    const groups: TextBlock[][] = [];
    const used = new Set<TextBlock>();

    const sortedBlocks = [...blocks].sort((a, b) => {
      const yDiff = Math.abs(a.boundingBox.y - b.boundingBox.y);
      if (yDiff < 20) {
        return b.area - a.area;
      }
      return a.boundingBox.y - b.boundingBox.y;
    });

    for (const block of sortedBlocks) {
      if (used.has(block)) continue;

      const group = [block];
      used.add(block);

      for (const other of sortedBlocks) {
        if (used.has(other)) continue;
        if (this.areBlocksNear(block, other)) {
          group.push(other);
          used.add(other);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private areBlocksNear(a: TextBlock, b: TextBlock): boolean {
    const maxDistance = Math.max(a.boundingBox.height, b.boundingBox.height) * 1.5;
    const verticalDistance = Math.abs(
      (a.boundingBox.y + a.boundingBox.height / 2) -
      (b.boundingBox.y + b.boundingBox.height / 2)
    );
    const horizontalDistance = Math.abs(
      (a.boundingBox.x + a.boundingBox.width / 2) -
      (b.boundingBox.x + b.boundingBox.width / 2)
    );

    return verticalDistance < maxDistance && horizontalDistance < maxDistance * 2;
  }

  private processTextBlock(text: string): ProcessedText {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let title: string | null = null;
    const metadata: Record<string, string> = {};
    let bestTitleScore = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Skip lines that are clearly metadata
      if (Object.values(this.METADATA_PATTERNS).some(pattern => pattern.test(lowerLine))) {
        Object.entries(this.METADATA_PATTERNS).forEach(([key, pattern]) => {
          const match = lowerLine.match(pattern);
          if (match && match[1]) {
            metadata[key] = match[1];
          }
        });
        continue;
      }

      // Check for known game names with fuzzy matching
      for (const knownGame of this.KNOWN_GAMES) {
        const matchScore = this.fuzzyMatch(lowerLine, knownGame);
        if (matchScore > 0.8 && matchScore > bestTitleScore) {
          title = knownGame; // Use known game name to ensure correct casing
          bestTitleScore = matchScore;
          break;
        }
      }

      // If no known game match, check for game name patterns
      if (!title || bestTitleScore < 0.9) {
        for (const pattern of this.GAME_PATTERNS) {
          const match = lowerLine.match(pattern);
          if (match && match[1]?.length > 2) {
            const candidateTitle = match[1];
            // Score the candidate title
            let score = 0.7; // Base score for matching pattern
            
            // Bonus for capitalization
            if (/^[A-Z][a-z]/.test(line)) score += 0.1;
            
            // Bonus for optimal length (2-4 words)
            const wordCount = candidateTitle.split(/\s+/).length;
            if (wordCount >= 2 && wordCount <= 4) score += 0.1;
            
            // Penalty for common words
            const hasCommonWord = candidateTitle.split(/\s+/)
              .some(word => this.COMMON_WORDS.has(word.toLowerCase()));
            if (hasCommonWord) score -= 0.1;

            if (score > bestTitleScore) {
              title = this.capitalizeTitle(match[1]);
              bestTitleScore = score;
            }
          }
        }
      }

      // Handle special cases
      if (i < lines.length - 1) {
        // "GO!" style titles
        if (lowerLine.endsWith('go') && lines[i + 1].startsWith('!')) {
          const goTitle = `${line}!`;
          if (this.fuzzyMatch(goTitle, 'Sushi Go!') > 0.8) {
            title = 'Sushi Go!';
            bestTitleScore = 1;
          } else {
            title = goTitle;
            bestTitleScore = 0.9;
          }
        }
        // Multi-line titles with ":" or "-"
        else if (lines[i + 1].startsWith(':') || lines[i + 1].startsWith('-')) {
          const combinedTitle = `${line}${lines[i + 1]}`;
          const score = 0.8;
          if (score > bestTitleScore) {
            title = this.capitalizeTitle(combinedTitle);
            bestTitleScore = score;
          }
        }
      }
    }

    // Post-process title
    if (title) {
      // Remove common prefixes/suffixes
      title = title.replace(/^(?:the\s+|a\s+|an\s+)/i, '')
                  .replace(/\s*(?:board\s*game|card\s*game|game)\s*$/i, '');
      
      // Ensure proper capitalization
      title = this.capitalizeTitle(title);
    }

    return { title, metadata };
  }

  private capitalizeTitle(text: string): string {
    const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'of', 'in']);
    
    return text.split(/\s+/)
      .map((word, index) => {
        const lower = word.toLowerCase();
        // Always capitalize first and last word, and major words
        if (index === 0 || !minorWords.has(lower)) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return lower;
      })
      .join(' ');
  }

  private calculateConfidence(params: ConfidenceParams): number {
    let confidence = 0.5;

    // Size-based confidence
    if (params.block.area > 5000) confidence += 0.2;
    else if (params.block.area > 2000) confidence += 0.1;

    // Publisher and metadata confidence
    if (params.hasPublisher) confidence += 0.2;
    if (params.hasMetadata) confidence += 0.1;

    // Known game confidence
    if (params.isKnownGame) {
      confidence += 0.3;
    } else {
      // Check for fuzzy matches with known games
      const title = params.block.text.toLowerCase();
      for (const knownGame of this.KNOWN_GAMES) {
        const matchScore = this.fuzzyMatch(title, knownGame);
        if (matchScore > 0.8) {
          confidence += 0.2;
          break;
        } else if (matchScore > 0.6) {
          confidence += 0.1;
          break;
        }
      }
    }

    // Text characteristics
    const text = params.block.text.toLowerCase();
    const words = text.split(/\s+/);
    
    // Title indicators
    for (const indicator of this.TITLE_INDICATORS) {
      if (text.includes(indicator)) {
        confidence += 0.1;
        break;
      }
    }

    // Word count (most game titles are 1-4 words)
    if (words.length >= 1 && words.length <= 4) confidence += 0.1;

    // Capitalization
    if (/^[A-Z][a-z]/.test(params.block.text)) confidence += 0.1;

    // Complete metadata
    const hasCompleteMetadata = params.group.some(block => {
      const blockText = block.text.toLowerCase();
      return this.METADATA_PATTERNS.players.test(blockText) &&
             this.METADATA_PATTERNS.ages.test(blockText);
    });
    if (hasCompleteMetadata) confidence += 0.2;

    // Additional metadata
    const metadataCount = Object.values(this.METADATA_PATTERNS).reduce(
      (count, pattern) => count + (pattern.test(text) ? 1 : 0),
      0
    );
    confidence += Math.min(metadataCount * 0.05, 0.2);

    return Math.min(confidence, 1.0);
  }

  private fuzzyMatch(text: string, target: string): number {
    text = text.toLowerCase();
    target = target.toLowerCase();
    
    if (text === target) return 1;
    if (text.includes(target) || target.includes(text)) return 0.9;
    
    const words1 = text.split(/\s+/);
    const words2 = target.split(/\s+/);
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2) matches++;
        else if (word1.length > 3 && word2.length > 3) {
          if (word1.includes(word2) || word2.includes(word1)) matches += 0.8;
          else if (this.levenshteinDistance(word1, word2) <= 2) matches += 0.6;
        }
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }

    return dp[m][n];
  }

  private findPublisher(blocks: TextBlock[]): string | undefined {
    for (const block of blocks) {
      const text = block.text.toLowerCase();
      for (const publisher of this.KNOWN_PUBLISHERS) {
        if (text.includes(publisher)) {
          return publisher;
        }
      }
    }
    return undefined;
  }

  private identifyGamesFromGroups(groups: TextBlock[][]): DetectedGame[] {
    const games: DetectedGame[] = [];

    for (const group of groups) {
      const combinedText = group
        .map(block => block.text)
        .join('\n');

      const { title, metadata } = this.processTextBlock(combinedText);

      if (!title) continue;

      const titleBlock = group.find(block => 
        block.text.toLowerCase().includes(title.toLowerCase())
      );

      if (!titleBlock) continue;

      const publisher = this.findPublisher(group);
      const isKnownGame = this.KNOWN_GAMES.has(title.toLowerCase());

      const confidence = this.calculateConfidence({
        block: titleBlock,
        hasPublisher: !!publisher,
        hasMetadata: Object.keys(metadata).length > 0,
        group,
        isKnownGame
      });

      if (confidence >= 0.6) {
        games.push({
          title,
          confidence,
          boundingBox: titleBlock.boundingBox,
          metadata: {
            ...metadata,
            publisher: publisher || undefined
          }
        });
      }
    }

    return games;
  }

  private extractBoundingBox(boundingPoly?: IBoundingPoly): DetectedGame['boundingBox'] | undefined {
    if (!boundingPoly?.vertices || boundingPoly.vertices.length !== 4) {
      return undefined;
    }

    const vertices = boundingPoly.vertices as IVertex[];
    const xs = vertices.map(v => v.x || 0);
    const ys = vertices.map(v => v.y || 0);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }
}
