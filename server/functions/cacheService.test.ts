import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getFirestore } from 'firebase-admin/firestore';
import { refreshPopularGamesCache, refreshCacheManually } from './refreshPopularGamesCache';
import { bggApiService } from '../../src/services/bggApiService';

// Mock Firebase Admin
// Mock Firebase Admin
interface MockDocumentData {
  games: any[];
  lastUpdated: number;
  source?: string;
  metadata?: {
    totalGames: number;
    preservedGames: number;
    refreshDate: string;
  };
}

interface MockDocumentSnapshot {
  exists: () => boolean;
  data: () => MockDocumentData;
}

interface MockQuerySnapshot {
  forEach: (callback: (doc: { id: string }) => void) => void;
}

type MockFirestore = {
  collection: jest.Mock;
  doc: jest.Mock;
  get: jest.Mock;
  set: jest.Mock;
  where: jest.Mock;
};

const mockFirestore: MockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn().mockImplementation(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      games: [],
      lastUpdated: Date.now()
    } as MockDocumentData)
  } as MockDocumentSnapshot)),
  set: jest.fn().mockImplementation(() => Promise.resolve()),
  where: jest.fn().mockReturnThis()
};

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore)
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFirestore.get.mockImplementation(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      games: mockGames,
      lastUpdated: Date.now()
    } as MockDocumentData)
  } as MockDocumentSnapshot));
  (bggApiService.fetchCategoryRankings as jest.Mock).mockImplementation(() => Promise.resolve(mockGames));
});

// Mock BGG API Service
jest.mock('../../src/services/bggApiService', () => ({
  bggApiService: {
    fetchCategoryRankings: jest.fn()
  }
}));

const mockGames = [
  {
    id: '1',
    name: 'Test Game 1',
    rank: {
      abstracts: 1,
      cgs: null,
      childrens: null,
      family: 2,
      party: null,
      strategy: 3,
      thematic: null,
      wargames: null
    }
  },
  {
    id: '2',
    name: 'Test Game 2',
    rank: {
      abstracts: 2,
      cgs: 1,
      childrens: null,
      family: 1,
      party: null,
      strategy: 2,
      thematic: null,
      wargames: null
    }
  }
];

describe('Cache Service', () => {
  describe('refreshCacheManually', () => {
    it('should refresh cache for all categories', async () => {
      await refreshCacheManually();

      // Verify BGG API was called for each category
      expect(bggApiService.fetchCategoryRankings).toHaveBeenCalledTimes(8); // One for each category

      // Verify Firestore was updated
      const db = getFirestore();
      expect(db.collection).toHaveBeenCalledWith('game-rankings');
    });

    it('should handle API errors gracefully', async () => {
      // Simulate API error for one category
      (bggApiService.fetchCategoryRankings as jest.Mock)
        .mockImplementationOnce(() => Promise.reject(new Error('API Error')))
        .mockImplementation(() => Promise.resolve(mockGames));

      await refreshCacheManually();

      // Should continue processing other categories
      expect(bggApiService.fetchCategoryRankings).toHaveBeenCalledTimes(8);
    });

    it('should preserve high usage games', async () => {
      // Mock high usage games
      const db = getFirestore();
      mockFirestore.get.mockImplementationOnce(() => Promise.resolve({
        forEach: (callback: (doc: { id: string }) => void) => {
          callback({ id: '1' }); // Game 1 is high usage
        }
      } as MockQuerySnapshot));

      await refreshCacheManually();

      // Verify the high usage game was preserved
      expect(mockFirestore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          games: expect.arrayContaining([
            expect.objectContaining({ id: '1' })
          ])
        })
      );
    });
  });

  describe('Cache Validation', () => {
    it('should validate cache data structure', async () => {
      await refreshCacheManually();

      const db = getFirestore();
      expect(mockFirestore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          games: expect.any(Array),
          lastUpdated: expect.any(Number),
          source: 'bgg-api',
          metadata: expect.objectContaining({
            totalGames: expect.any(Number),
            preservedGames: expect.any(Number),
            refreshDate: expect.any(String)
          })
        })
      );
    });
  });
});
