"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCachedApiRequest = exports.setCacheEntry = exports.getCacheEntry = exports.logApiEvent = exports.isCacheValid = exports.generateCacheKey = void 0;
const firestore_1 = require("firebase-admin/firestore");
let db = null;
const getDb = () => {
    if (!db) {
        db = (0, firestore_1.getFirestore)();
    }
    return db;
};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_COLLECTION = 'api-cache';
const generateCacheKey = (endpoint, params) => `${endpoint}:${JSON.stringify(params)}`;
exports.generateCacheKey = generateCacheKey;
const isCacheValid = (entry) => Date.now() - entry.timestamp < CACHE_TTL;
exports.isCacheValid = isCacheValid;
// Metric counters
let cacheHits = 0;
let cacheMisses = 0;
let rateLimitErrors = 0;
let totalRequests = 0;
const logApiEvent = (type, data) => {
    var _a;
    const timestamp = new Date().toISOString();
    // Update metrics
    totalRequests++;
    switch (type) {
        case 'cache_hit':
            cacheHits++;
            break;
        case 'cache_miss':
            cacheMisses++;
            break;
        case 'api_error':
            if ((_a = data.error) === null || _a === void 0 ? void 0 : _a.includes('429')) {
                rateLimitErrors++;
            }
            break;
    }
    // Log metrics every 100 requests
    if (totalRequests % 100 === 0) {
        const hitRatio = (cacheHits / totalRequests) * 100;
        console.log(JSON.stringify({
            type: 'metrics_summary',
            timestamp,
            cacheHits,
            cacheMisses,
            rateLimitErrors,
            hitRatio: `${hitRatio.toFixed(2)}%`,
            totalRequests
        }));
    }
    // Log the original event
    console.log(JSON.stringify(Object.assign({ type,
        timestamp }, data)));
};
exports.logApiEvent = logApiEvent;
function getCacheEntry(cacheKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            const doc = yield getDb()
                .collection(CACHE_COLLECTION)
                .doc(cacheKey)
                .get();
            if (!doc.exists) {
                return null;
            }
            const result = doc.data();
            const duration = Date.now() - startTime;
            (0, exports.logApiEvent)('cache_performance', {
                operation: 'getCacheEntry',
                duration,
                success: true
            });
            return result;
        }
        catch (error) {
            (0, exports.logApiEvent)('cache_error', { error, operation: 'get', cacheKey });
            const duration = Date.now() - startTime;
            (0, exports.logApiEvent)('cache_performance', {
                operation: 'getCacheEntry',
                duration,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return null;
        }
    });
}
exports.getCacheEntry = getCacheEntry;
function setCacheEntry(cacheKey, entry) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        let error = null;
        try {
            yield getDb()
                .collection(CACHE_COLLECTION)
                .doc(cacheKey)
                .set(entry);
            (0, exports.logApiEvent)('cache_set', {
                cacheKey,
                endpoint: entry.endpoint,
                timestamp: entry.timestamp
            });
        }
        catch (err) {
            error = err;
            (0, exports.logApiEvent)('cache_error', { error, operation: 'set', cacheKey });
        }
        finally {
            const duration = Date.now() - startTime;
            (0, exports.logApiEvent)('cache_performance', {
                operation: 'setCacheEntry',
                duration,
                success: !error,
                error: error === null || error === void 0 ? void 0 : error.message
            });
        }
    });
}
exports.setCacheEntry = setCacheEntry;
function handleCachedApiRequest(endpoint, params, apiFn) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const cacheKey = (0, exports.generateCacheKey)(endpoint, params);
        const startTime = Date.now();
        // Try cache first
        try {
            const cachedEntry = yield getCacheEntry(cacheKey);
            if (cachedEntry && (0, exports.isCacheValid)(cachedEntry)) {
                (0, exports.logApiEvent)('cache_hit', { endpoint, params });
                return cachedEntry.data;
            }
        }
        catch (error) {
            (0, exports.logApiEvent)('cache_error', { error, endpoint, params });
            // Continue to API call on cache error
        }
        // Cache miss or invalid - call API
        (0, exports.logApiEvent)('cache_miss', { endpoint, params });
        const MAX_RETRIES = 2; // Reduced from 3 to 2
        const RETRY_DELAY = 500; // Reduced from 1000 to 500ms
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = yield Promise.race([
                    apiFn(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('BGG API timeout')), 10000))
                ]);
                // Store in cache
                yield setCacheEntry(cacheKey, {
                    data: response,
                    timestamp: Date.now(),
                    endpoint,
                    params
                });
                const duration = Date.now() - startTime;
                (0, exports.logApiEvent)('cache_performance', {
                    operation: 'handleCachedApiRequest',
                    duration,
                    success: true
                });
                return response;
            }
            catch (error) {
                (0, exports.logApiEvent)('api_error', {
                    attempt,
                    error: error.message,
                    endpoint,
                    params
                });
                if (attempt < MAX_RETRIES && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) !== 429) {
                    (0, exports.logApiEvent)('api_retry', { attempt, endpoint });
                    yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                }
                else {
                    throw error; // Rethrow after max retries or rate limit
                }
            }
        }
        const duration = Date.now() - startTime;
        (0, exports.logApiEvent)('cache_performance', {
            operation: 'handleCachedApiRequest',
            duration,
            success: false,
            error: 'Max retries exceeded'
        });
        throw new Error('Max retries exceeded');
    });
}
exports.handleCachedApiRequest = handleCachedApiRequest;
//# sourceMappingURL=cacheService.js.map