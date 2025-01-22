# Cache Monitoring Setup Guide

## Overview
This document outlines the monitoring and alerting configuration for the BGG API caching system. The monitoring system tracks cache performance, API rate limits, and function execution times.

## Implemented Metrics
The following metrics are automatically logged by the system:

1. **Cache Performance**
   - Cache hit/miss ratios (logged every 100 requests)
   - Cache operation durations
   - Cache errors

2. **API Performance**
   - Rate limit errors (429 responses)
   - Function execution times
   - API errors and retries

3. **Request Metrics**
   - Total requests
   - Success/failure rates
   - Response times

## Firebase Monitoring Alert Setup

### 1. Cache Hit/Miss Ratio Alert
Configure in Firebase Console:
- Navigate to: Functions > Monitoring > Create Alert
- Metric: Custom Log Entry containing "metrics_summary"
- Condition: When hitRatio < 50% over 1-hour window
- Notification: Set up email/Slack notification

### 2. API Rate Limit Alert
Configure in Firebase Console:
- Navigate to: Functions > Monitoring > Create Alert
- Metric: Custom Log Entry containing "api_error" AND "429"
- Condition: Count > 5 per minute
- Notification: High priority alert

### 3. Function Execution Time Alert
Configure in Firebase Console:
- Navigate to: Functions > Monitoring > Create Alert
- Functions to monitor:
  - searchGames
  - getGameDetails
- Condition: Execution time > 2000ms (2 seconds)
- Window: 5-minute periods
- Notification: Medium priority alert

### 4. Cache Error Alert
Configure in Firebase Console:
- Navigate to: Functions > Monitoring > Create Alert
- Metric: Custom Log Entry containing "cache_error"
- Condition: Count > 10 per hour
- Notification: Medium priority alert

## Monitoring Dashboard Setup

1. Create a new monitoring dashboard in Firebase Console:
   - Navigate to: Functions > Monitoring > Create Dashboard

2. Add the following widgets:
   ```
   Widget 1: Cache Performance
   - Title: "Cache Hit/Miss Ratio"
   - Type: Line Chart
   - Metric: Custom Log Entry (metrics_summary)
   - Value: hitRatio
   - Time Range: Last 24 hours

   Widget 2: API Rate Limits
   - Title: "Rate Limit Errors"
   - Type: Counter
   - Metric: Custom Log Entry (api_error with 429)
   - Time Range: Last hour

   Widget 3: Function Performance
   - Title: "Function Execution Times"
   - Type: Line Chart
   - Metric: Function execution time
   - Functions: searchGames, getGameDetails
   - Time Range: Last 24 hours
   ```

## Log Format Reference

### Cache Hit/Miss Summary
```json
{
  "type": "metrics_summary",
  "timestamp": "2025-01-22T18:36:41.000Z",
  "cacheHits": 150,
  "cacheMisses": 50,
  "rateLimitErrors": 2,
  "hitRatio": "75.00%",
  "totalRequests": 200
}
```

### Performance Logs
```json
{
  "type": "cache_performance",
  "timestamp": "2025-01-22T18:36:41.000Z",
  "operation": "getCacheEntry",
  "duration": 123,
  "success": true
}
```

### Error Logs
```json
{
  "type": "api_error",
  "timestamp": "2025-01-22T18:36:41.000Z",
  "operation": "searchGames",
  "error": "Rate limit exceeded",
  "status": 429
}
```

## Maintenance

1. **Regular Review**
   - Review alert thresholds monthly
   - Adjust based on usage patterns
   - Update notification settings as team changes

2. **Troubleshooting**
   - Use logging timestamps to correlate events
   - Check cache performance during high-traffic periods
   - Monitor rate limit errors for API quota adjustments

3. **Performance Optimization**
   - Use monitoring data to identify bottlenecks
   - Adjust cache TTL based on hit/miss ratios
   - Scale function resources based on execution times
