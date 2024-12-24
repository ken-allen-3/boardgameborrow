import * as functions from "firebase-functions/v1";
import cors = require("cors");
import axios from "axios";
import { Request, Response } from "express";

const corsHandler = cors({ origin: true });
const BGG_BASE_URL = "https://boardgamegeek.com/xmlapi2";
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
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

export const searchGames = functions.region("us-central1").https.onRequest((request: Request, response: Response) => {
  return corsHandler(request, response, async () => {
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
      const bggResponse = await axios.get(`${BGG_BASE_URL}/search`, {
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
    } catch (error: any) {
      console.error("BGG API Error:", error);
      response.status(500).json({
        error: "Failed to fetch data from BoardGameGeek",
        details: error.message
      });
    }
  });
});

export const getGameDetails = functions.region("us-central1").https.onRequest((request: Request, response: Response) => {
  return corsHandler(request, response, async () => {
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
      const bggResponse = await axios.get(`${BGG_BASE_URL}/thing`, {
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
    } catch (error: any) {
      console.error("BGG API Error:", error);
      response.status(500).json({
        error: "Failed to fetch game details from BoardGameGeek",
        details: error.message
      });
    }
  });
});
