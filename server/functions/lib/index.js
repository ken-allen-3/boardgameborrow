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
const functions = __importStar(require("firebase-functions/v1"));
const cors = require("cors");
const axios_1 = __importDefault(require("axios"));
const corsHandler = cors({ origin: true });
const BGG_BASE_URL = "https://boardgamegeek.com/xmlapi2";
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds
// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const requestCounts = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const requestData = requestCounts.get(ip);
    if (!requestData || now > requestData.resetTime) {
        // Reset or initialize rate limit data
        requestCounts.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return true;
    }
    if (requestData.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    requestData.count++;
    return true;
}
exports.searchGames = functions.region("us-central1").https.onRequest((request, response) => {
    return corsHandler(request, response, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (request.method !== "GET") {
                response.status(405).json({ error: "Method not allowed" });
                return;
            }
            const forwardedFor = request.headers["x-forwarded-for"];
            const ip = request.ip ||
                (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
                "unknown";
            if (!checkRateLimit(ip)) {
                response.status(429).json({ error: "Too many requests. Please try again later." });
                return;
            }
            const { query, type = "boardgame", exact } = request.query;
            if (!query) {
                response.status(400).json({ error: "Query parameter is required" });
                return;
            }
            // Make request to BGG API
            const bggResponse = yield axios_1.default.get(`${BGG_BASE_URL}/search`, {
                params: {
                    query,
                    type,
                    exact
                }
            });
            // Set cache headers
            response.set("Cache-Control", `public, max-age=${CACHE_DURATION}`);
            // Return the XML response
            response.set("Content-Type", "application/xml");
            response.send(bggResponse.data);
        }
        catch (error) {
            console.error("BGG API Error:", error);
            response.status(500).json({
                error: "Failed to fetch data from BoardGameGeek",
                details: error.message
            });
        }
    }));
});
exports.getGameDetails = functions.region("us-central1").https.onRequest((request, response) => {
    return corsHandler(request, response, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (request.method !== "GET") {
                response.status(405).json({ error: "Method not allowed" });
                return;
            }
            const forwardedFor = request.headers["x-forwarded-for"];
            const ip = request.ip ||
                (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
                "unknown";
            if (!checkRateLimit(ip)) {
                response.status(429).json({ error: "Too many requests. Please try again later." });
                return;
            }
            const { id } = request.query;
            if (!id) {
                response.status(400).json({ error: "Game ID is required" });
                return;
            }
            // Make request to BGG API
            const bggResponse = yield axios_1.default.get(`${BGG_BASE_URL}/thing`, {
                params: {
                    id,
                    stats: 1,
                    versions: 0
                }
            });
            // Set cache headers
            response.set("Cache-Control", `public, max-age=${CACHE_DURATION}`);
            // Return the XML response
            response.set("Content-Type", "application/xml");
            response.send(bggResponse.data);
        }
        catch (error) {
            console.error("BGG API Error:", error);
            response.status(500).json({
                error: "Failed to fetch game details from BoardGameGeek",
                details: error.message
            });
        }
    }));
});
//# sourceMappingURL=index.js.map