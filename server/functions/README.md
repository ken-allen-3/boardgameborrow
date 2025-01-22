# Cache System Testing Guide

## Running Tests

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Tests**
   - Run tests once:
     ```bash
     npm test
     ```
   - Run tests in watch mode (useful during development):
     ```bash
     npm run test:watch
     ```

## Test Coverage

The test suite covers:

1. **Cache Operations**
   - Cache key generation
   - Cache validity checks
   - Cache hits/misses
   - Cache expiration

2. **Error Handling**
   - Firestore errors
   - API failures
   - Rate limit scenarios

3. **Performance Monitoring**
   - Cache hit/miss ratios
   - API response times
   - Function execution times

## Interpreting Performance Metrics

The caching system logs several types of metrics that can be monitored in Firebase:

### 1. Metrics Summary (Every 100 requests)
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
- **hitRatio**: Target > 70% for optimal performance
- **rateLimitErrors**: Should be < 1% of total requests
- **totalRequests**: Monitor for traffic patterns

### 2. Cache Performance Logs
```json
{
  "type": "cache_performance",
  "timestamp": "2025-01-22T18:36:41.000Z",
  "operation": "getCacheEntry",
  "duration": 123,
  "success": true
}
```
- **duration**: Should be < 200ms for cache operations
- **success**: Monitor failure rates

### 3. API Error Logs
```json
{
  "type": "api_error",
  "timestamp": "2025-01-22T18:36:41.000Z",
  "operation": "searchGames",
  "error": "Rate limit exceeded",
  "status": 429
}
```
- Monitor for patterns in API errors
- Track rate limit occurrences

## Performance Baselines

Expected performance metrics:

1. **Cache Hit Ratio**
   - Good: > 70%
   - Warning: 50-70%
   - Alert: < 50%

2. **Response Times**
   - Cache Hit: < 200ms
   - Cache Miss (with API call): < 2000ms
   - Cache Operations: < 200ms

3. **Error Rates**
   - API Rate Limits: < 1% of requests
   - Cache Errors: < 0.1% of operations
   - Failed Retries: < 0.5% of API calls

## Monitoring Dashboard

Access the monitoring dashboard in Firebase Console:
1. Navigate to: Functions > Monitoring
2. View the "Cache Performance" dashboard
3. Key metrics are displayed in real-time

### Alert Thresholds

1. **Cache Hit/Miss Ratio Alert**
   - Condition: hitRatio < 50% over 1-hour window
   - Priority: High

2. **API Rate Limit Alert**
   - Condition: > 5 rate limit errors per minute
   - Priority: High

3. **Function Execution Time Alert**
   - Condition: > 2000ms execution time
   - Priority: Medium

4. **Cache Error Alert**
   - Condition: > 10 cache errors per hour
   - Priority: Medium

## Troubleshooting

1. **Low Cache Hit Ratio**
   - Check cache TTL settings
   - Analyze request patterns
   - Verify cache invalidation logic

2. **High Rate Limit Errors**
   - Review API usage patterns
   - Consider implementing request queuing
   - Adjust retry strategy

3. **Slow Response Times**
   - Check Firestore performance
   - Monitor API response times
   - Verify network connectivity

4. **High Error Rates**
   - Review error logs for patterns
   - Check Firestore connectivity
   - Verify API endpoint status
