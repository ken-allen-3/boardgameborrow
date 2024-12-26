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
    'repos production'
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
    'carcassonne'
  ]);

  private readonly COMMON_WORDS = new Set([
    'the', 'game', 'edition', 'expansion', 'board', 'card',
    'deluxe', 'version', 'classic', 'new', 'games'
  ]);

  private readonly GAME_PATTERNS = [
    /^(.*?)\s*(?:card game|board game|game|tm)$/i,
    /^(.*?)\s*(?:ages?\s*\d+[\+]?)$/i,
    /^(.*?)\s*(?:\d+-\d+\s*players?)$/i
  ];

  private readonly METADATA_PATTERNS: Record<string, RegExp> = {
    players: /(\d+[-–]?\d*\+?)\s*players?/i,
    ages: /ages?\s*(\d+\+?)/i,
    gameType: /(card game|board game|party game)/i
  };

  async processAnnotations(annotations: IEntityAnnotation[] | null | undefined): Promise<DetectedGame[]> {
    if (!annotations?.length) return [];

    const textBlocks = this.convertAnnotationsToBlocks(annotations);
    const groups = this.groupTextBlocks(textBlocks);
    const detectedGames = this.identifyGamesFromGroups(groups);

    return detectedGames.sort((a, b) => b.confidence - a.confidence);
  }

  private convertAnnotationsToBlocks(annotations: IEntityAnnotation[]): TextBlock[] {
    return annotations
      .slice(1) // Skip first annotation (contains all text)
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Check for known game names
      if (this.KNOWN_GAMES.has(lowerLine)) {
        title = line; // Use original case
        continue;
      }

      // Check for game name patterns
      for (const pattern of this.GAME_PATTERNS) {
        const match = lowerLine.match(pattern);
        if (match && match[1]?.length > 2) {
          title = match[1];
          break;
        }
      }

      // Extract metadata
      Object.entries(this.METADATA_PATTERNS).forEach(([key, pattern]) => {
        const match = lowerLine.match(pattern);
        if (match && match[1]) {
          metadata[key] = match[1];
        }
      });

      // Special case for "GO!" style titles
      if (i < lines.length - 1 && lowerLine.endsWith('go') && lines[i + 1].startsWith('!')) {
        title = `${lines[i]}!`;
      }
    }

    // Handle special cases
    if (title?.toLowerCase().includes('sushi') && title?.toLowerCase().includes('go')) {
      title = 'Sushi Go!';
    }

    return { title, metadata };
  }

  private calculateConfidence(params: ConfidenceParams): number {
    let confidence = 0.5;

    if (params.block.area > 5000) confidence += 0.2;
    else if (params.block.area > 2000) confidence += 0.1;
    if (params.hasPublisher) confidence += 0.2;
    if (params.hasMetadata) confidence += 0.1;
    if (params.isKnownGame) confidence += 0.3;

    const hasCompleteMetadata = params.group.some(block => {
      const text = block.text.toLowerCase();
      return this.METADATA_PATTERNS.players.test(text) &&
             this.METADATA_PATTERNS.ages.test(text);
    });

    if (hasCompleteMetadata) confidence += 0.2;

    return Math.min(confidence, 1.0);
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
