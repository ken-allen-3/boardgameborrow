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
exports.getGameDetails = exports.searchGames = void 0;
const functions = __importStar(require("firebase-functions"));
const cors = require("cors");
const axios_1 = __importDefault(require("axios"));
const cacheService_1 = require("./cacheService");
const corsHandler = cors({ origin: true });
const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';
// Add timeout to BGG API requests
const BGG_REQUEST_TIMEOUT = 10000; // 10 seconds
exports.searchGames = functions.https.onRequest((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    return corsHandler(request, response, () => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            if (request.method !== 'GET') {
                (0, cacheService_1.logApiEvent)('api_error', {
                    error: 'Method not allowed',
                    method: request.method
                });
                return response.status(405).json({ error: 'Method not allowed' });
            }
            const query = request.query.query;
            const type = request.query.type || 'boardgame';
            const exact = request.query.exact;
            if (!query) {
                (0, cacheService_1.logApiEvent)('api_error', {
                    error: 'Missing query parameter'
                });
                return response.status(400).json({ error: 'Query parameter is required' });
            }
            const xmlData = yield (0, cacheService_1.handleCachedApiRequest)('search', { query, type, exact }, () => __awaiter(void 0, void 0, void 0, function* () {
                const bggResponse = yield axios_1.default.get(`${BGG_BASE_URL}/search`, {
                    params: { query, type, exact },
                    timeout: BGG_REQUEST_TIMEOUT
                });
                return bggResponse.data;
            }));
            response.set('Content-Type', 'application/xml');
            const duration = Date.now() - startTime;
            (0, cacheService_1.logApiEvent)('api_success', {
                operation: 'searchGames',
                duration,
                query
            });
            response.send(xmlData);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const failedQuery = request.query.query;
            (0, cacheService_1.logApiEvent)('api_error', {
                operation: 'searchGames',
                duration,
                error: error.message,
                query: failedQuery
            });
            console.error('BGG API Error:', error);
            response.status(500).json({
                error: 'Failed to fetch data from BoardGameGeek',
                details: error.message
            });
        }
    }));
}));
exports.getGameDetails = functions.https.onRequest((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    return corsHandler(request, response, () => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            if (request.method !== 'GET') {
                (0, cacheService_1.logApiEvent)('api_error', {
                    error: 'Method not allowed',
                    method: request.method
                });
                return response.status(405).json({ error: 'Method not allowed' });
            }
            const id = request.query.id;
            if (!id) {
                (0, cacheService_1.logApiEvent)('api_error', {
                    error: 'Missing game ID'
                });
                return response.status(400).json({ error: 'Game ID is required' });
            }
            const xmlData = yield (0, cacheService_1.handleCachedApiRequest)('game-details', { id, stats: 1, versions: 0 }, () => __awaiter(void 0, void 0, void 0, function* () {
                const bggResponse = yield axios_1.default.get(`${BGG_BASE_URL}/thing`, {
                    params: { id, stats: 1, versions: 0 },
                    timeout: BGG_REQUEST_TIMEOUT
                });
                return bggResponse.data;
            }));
            response.set('Content-Type', 'application/xml');
            const duration = Date.now() - startTime;
            (0, cacheService_1.logApiEvent)('api_success', {
                operation: 'getGameDetails',
                duration,
                gameId: id
            });
            response.send(xmlData);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const failedId = request.query.id;
            (0, cacheService_1.logApiEvent)('api_error', {
                operation: 'getGameDetails',
                duration,
                error: error.message,
                gameId: failedId
            });
            console.error('BGG API Error:', error);
            response.status(500).json({
                error: 'Failed to fetch game details from BoardGameGeek',
                details: error.message
            });
        }
    }));
}));
//# sourceMappingURL=boardgameApi.js.map