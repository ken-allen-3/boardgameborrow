import { db } from './index';
import {
  generateCacheKey,
  isCacheValid,
  getCacheEntry,
  setCacheEntry,
  handleCachedApiRequest,
} from './cacheService';

// Mock Firebase admin
jest.mock('./index', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('Cache Service', () => {
  // Mock console.log to capture metric logs
  const originalConsoleLog = console.log;
  let loggedMetrics: any[] = [];

  beforeEach(() => {
    loggedMetrics = [];
    console.log = jest.fn((data) => {
      try {
        const parsed = JSON.parse(data);
        loggedMetrics.push(parsed);
      } catch (e) {
        // Not JSON, ignore
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log = originalConsoleLog;
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const endpoint = '/games/search';
      const params = { query: 'Catan', limit: 10 };
      const key = generateCacheKey(endpoint, params);
      expect(key).toBe('/games/search:{"query":"Catan","limit":10}');
    });
  });

  describe('isCacheValid', () => {
    it('should return true for fresh cache entries', () => {
      const entry = {
        data: 'test data',
        timestamp: Date.now() - 1000, // 1 second ago
        endpoint: '/test',
        params: {},
      };
      expect(isCacheValid(entry)).toBe(true);
    });

    it('should return false for expired cache entries', () => {
      const entry = {
        data: 'test data',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        endpoint: '/test',
        params: {},
      };
      expect(isCacheValid(entry)).toBe(false);
    });
  });

  describe('getCacheEntry', () => {
    it('should return cached data when available', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          data: 'cached response',
          timestamp: Date.now(),
          endpoint: '/test',
          params: {},
        }),
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const result = await getCacheEntry('test-key');
      expect(result).toBeTruthy();
      expect(result?.data).toBe('cached response');
      
      // Verify logging
      expect(loggedMetrics.some(log => 
        log.type === 'cache_performance' && 
        log.operation === 'getCacheEntry' && 
        log.success === true
      )).toBe(true);
    });

    it('should return null when cache entry does not exist', async () => {
      const mockDoc = {
        exists: false,
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const result = await getCacheEntry('test-key');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Firestore error'));
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const result = await getCacheEntry('test-key');
      expect(result).toBeNull();
      
      // Verify error logging
      expect(loggedMetrics.some(log => 
        log.type === 'cache_error' && 
        log.operation === 'get'
      )).toBe(true);
    });
  });

  describe('handleCachedApiRequest', () => {
    it('should serve from cache on cache hit', async () => {
      // Mock cache hit
      const mockDoc = {
        exists: true,
        data: () => ({
          data: 'cached data',
          timestamp: Date.now(),
          endpoint: '/test',
          params: {},
        }),
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const mockApiFn = jest.fn();
      const result = await handleCachedApiRequest('/test', {}, mockApiFn);

      expect(result).toBe('cached data');
      expect(mockApiFn).not.toHaveBeenCalled();
      
      // Verify cache hit logging
      expect(loggedMetrics.some(log => log.type === 'cache_hit')).toBe(true);
    });

    it('should call API and update cache on cache miss', async () => {
      // Mock cache miss
      const mockDoc = {
        exists: false,
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ 
          get: mockGet,
          set: mockSet,
        }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const mockApiFn = jest.fn().mockResolvedValue('fresh data');
      const result = await handleCachedApiRequest('/test', {}, mockApiFn);

      expect(result).toBe('fresh data');
      expect(mockApiFn).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      
      // Verify cache miss logging
      expect(loggedMetrics.some(log => log.type === 'cache_miss')).toBe(true);
    });

    it('should retry on API failure', async () => {
      // Mock cache miss
      const mockDoc = {
        exists: false,
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ 
          get: mockGet,
          set: mockSet,
        }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const mockApiFn = jest.fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce('success after retry');

      const result = await handleCachedApiRequest('/test', {}, mockApiFn);

      expect(result).toBe('success after retry');
      expect(mockApiFn).toHaveBeenCalledTimes(2);
      
      // Verify retry logging
      expect(loggedMetrics.some(log => log.type === 'api_retry')).toBe(true);
    });

    it('should handle rate limit errors', async () => {
      // Mock cache miss
      const mockDoc = {
        exists: false,
      };

      const mockGet = jest.fn().mockResolvedValue(mockDoc);
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const rateLimitError = new Error('429: Rate limit exceeded');
      (rateLimitError as any).response = { status: 429 };

      const mockApiFn = jest.fn().mockRejectedValue(rateLimitError);

      await expect(handleCachedApiRequest('/test', {}, mockApiFn))
        .rejects.toThrow();
      
      // Verify rate limit error logging
      expect(loggedMetrics.some(log => 
        log.type === 'api_error' && 
        log.error === '429: Rate limit exceeded'
      )).toBe(true);
    });
  });
});
