"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheMetrics = exports.initializeCache = exports.getGameDetails = exports.searchGames = void 0;
const app_1 = require("firebase-admin/app");
const boardgameApi_1 = require("./boardgameApi");
Object.defineProperty(exports, "searchGames", { enumerable: true, get: function () { return boardgameApi_1.searchGames; } });
Object.defineProperty(exports, "getGameDetails", { enumerable: true, get: function () { return boardgameApi_1.getGameDetails; } });
const cacheOperations_1 = require("./cacheOperations");
Object.defineProperty(exports, "initializeCache", { enumerable: true, get: function () { return cacheOperations_1.initializeCache; } });
Object.defineProperty(exports, "getCacheMetrics", { enumerable: true, get: function () { return cacheOperations_1.getCacheMetrics; } });
// Initialize Firebase Admin
(0, app_1.initializeApp)();
//# sourceMappingURL=index.js.map