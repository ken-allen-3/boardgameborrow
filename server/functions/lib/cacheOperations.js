"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheMetrics = exports.initializeCache = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
const CATEGORIES = [
    'abstracts',
    'cgs',
    'childrens',
    'family',
    'party',
    'strategy',
    'thematic',
    'wargames'
];
exports.initializeCache = functions.https.onCall((data, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    // Check if user is authenticated and admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to initialize cache');
    }
    const db = (0, firestore_1.getFirestore)();
    const userRef = db.collection('users').doc(context.auth.uid);
    const userDoc = yield userRef.get();
    const userData = userDoc.data();
    if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin)) {
        throw new functions.https.HttpsError('permission-denied', 'Must be an admin to initialize cache');
    }
    try {
        // Process each category
        for (const category of CATEGORIES) {
            console.log(`Processing category: ${category}`);
            // Get top games for category from BGG API
            const response = yield axios_1.default.get(`https://boardgamegeek.com/xmlapi2/search?query=${category}&type=boardgame&exact=0`);
            const dom = new jsdom_1.JSDOM(response.data, { contentType: 'text/xml' });
            const xmlDoc = dom.window.document;
            const items = Array.from(xmlDoc.querySelectorAll('item'));
            const games = [];
            // Get details for each game
            for (const item of items.slice(0, 50)) {
                const id = item.getAttribute('id');
                if (!id)
                    continue;
                try {
                    const gameResponse = yield axios_1.default.get(`https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`);
                    const gameDoc = new jsdom_1.JSDOM(gameResponse.data, { contentType: 'text/xml' }).window.document;
                    const gameItem = gameDoc.querySelector('item');
                    if (!gameItem)
                        continue;
                    const game = {
                        id,
                        name: ((_a = gameItem.querySelector('name[type="primary"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('value')) || '',
                        rank: {
                            abstracts: parseRanking(gameDoc, 'abstracts'),
                            cgs: parseRanking(gameDoc, 'cgs'),
                            childrens: parseRanking(gameDoc, 'childrens'),
                            family: parseRanking(gameDoc, 'family'),
                            party: parseRanking(gameDoc, 'party'),
                            strategy: parseRanking(gameDoc, 'strategy'),
                            thematic: parseRanking(gameDoc, 'thematic'),
                            wargames: parseRanking(gameDoc, 'wargames')
                        },
                        image: ((_b = gameItem.querySelector('image')) === null || _b === void 0 ? void 0 : _b.textContent) || undefined,
                        playerCount: {
                            min: parseInt(((_c = gameItem.querySelector('minplayers')) === null || _c === void 0 ? void 0 : _c.getAttribute('value')) || '0'),
                            max: parseInt(((_d = gameItem.querySelector('maxplayers')) === null || _d === void 0 ? void 0 : _d.getAttribute('value')) || '0')
                        },
                        playTime: {
                            min: parseInt(((_e = gameItem.querySelector('minplaytime')) === null || _e === void 0 ? void 0 : _e.getAttribute('value')) || '0'),
                            max: parseInt(((_f = gameItem.querySelector('maxplaytime')) === null || _f === void 0 ? void 0 : _f.getAttribute('value')) || '0')
                        },
                        description: ((_g = gameItem.querySelector('description')) === null || _g === void 0 ? void 0 : _g.textContent) || undefined
                    };
                    games.push(game);
                    // Store individual game details
                    yield db.collection('game-details').doc(id).set({
                        gameData: game,
                        metadata: {
                            lastUpdated: Date.now(),
                            lastAccessed: Date.now(),
                            usageCount: 0,
                            source: 'bgg-api'
                        }
                    });
                }
                catch (error) {
                    console.error(`Failed to fetch game ${id}:`, error);
                    // Continue with other games
                }
                // Add delay to respect rate limits
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            // Store rankings
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            yield db.collection('game-rankings')
                .doc(category)
                .collection('monthly')
                .doc(currentMonth)
                .set({
                games,
                lastUpdated: Date.now(),
                source: 'bgg-api',
                metadata: {
                    totalGames: games.length,
                    preservedGames: 0,
                    refreshDate: new Date().toISOString()
                }
            });
        }
        return { success: true, message: 'Cache initialized successfully' };
    }
    catch (error) {
        console.error('Failed to initialize cache:', error);
        throw new functions.https.HttpsError('internal', 'Failed to initialize cache');
    }
}));
exports.getCacheMetrics = functions.https.onCall((data, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to get cache metrics');
    }
    try {
        const db = (0, firestore_1.getFirestore)();
        // Get game details cache collection
        const gameDetailsRef = db.collection('game-details');
        const gameDetailsSnap = yield gameDetailsRef.get();
        // Get game rankings cache collection for last refresh date
        const rankingsRef = db.collection('game-rankings');
        const rankingsSnap = yield rankingsRef
            .orderBy('lastUpdated', 'desc')
            .limit(1)
            .get();
        // Calculate metrics
        let totalHits = 0;
        let totalAccesses = 0;
        let totalSize = 0;
        gameDetailsSnap.forEach(doc => {
            const data = doc.data();
            if (data.metadata) {
                totalHits += data.metadata.usageCount || 0;
                totalAccesses += 1;
                totalSize += JSON.stringify(data).length;
            }
        });
        const lastRefreshDate = rankingsSnap.empty
            ? 'Never'
            : new Date(rankingsSnap.docs[0].data().lastUpdated).toLocaleDateString();
        return {
            totalCachedGames: gameDetailsSnap.size,
            cacheHitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
            memoryUsage: Math.round(totalSize / 1024),
            lastRefreshDate
        };
    }
    catch (error) {
        console.error('Error fetching cache metrics:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch cache metrics');
    }
}));
function parseRanking(xmlDoc, category) {
    const rankElement = xmlDoc.querySelector(`rank[friendlyname="${category}"]`);
    const value = rankElement === null || rankElement === void 0 ? void 0 : rankElement.getAttribute('value');
    return value && value !== 'Not Ranked' ? parseInt(value) : null;
}
//# sourceMappingURL=cacheOperations.js.map