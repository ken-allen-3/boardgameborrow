import React, { useState, useEffect } from 'react';
import { getPerformanceMetrics, getCacheStats, getMemoryMetrics } from '../utils/performanceUtils';
import { searchGames, getPopularGames } from '../services/boardGameService';

function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<any>({
    performance: [],
    cache: {},
    memory: []
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        performance: getPerformanceMetrics(),
        cache: getCacheStats(),
        memory: getMemoryMetrics()
      });
    };

    // Update metrics every 5 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const runTestOperations = async () => {
    try {
      // Test popular games (cached vs uncached)
      await getPopularGames();
      await getPopularGames(); // Should hit cache

      // Test search operations
      await searchGames('Catan', 1);
      await searchGames('Catan', 1); // Should hit cache
      await searchGames('Pandemic', 1);
    } catch (error) {
      console.error('Test operations failed:', error);
    }
    setRefreshKey(prev => prev + 1);
  };

  const formatDuration = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Performance Monitor</h1>
        <button
          onClick={runTestOperations}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Run Test Operations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operation Performance */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Operation Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Operation</th>
                  <th className="text-left">Duration</th>
                  <th className="text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {metrics.performance.map((metric: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="py-2">{metric.name}</td>
                    <td className="py-2">{formatDuration(metric.duration)}</td>
                    <td className="py-2">{formatTimestamp(metric.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Cache Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Cache</th>
                  <th className="text-left">Hits</th>
                  <th className="text-left">Misses</th>
                  <th className="text-left">Sets</th>
                  <th className="text-left">Evictions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.cache).map(([cache, stats]: [string, any]) => (
                  <tr key={cache} className="border-t">
                    <td className="py-2">{cache}</td>
                    <td className="py-2">{stats.hits}</td>
                    <td className="py-2">{stats.misses}</td>
                    <td className="py-2">{stats.sets}</td>
                    <td className="py-2">{stats.evictions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Memory Usage</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Time</th>
                  <th className="text-left">Used</th>
                  <th className="text-left">Total</th>
                  <th className="text-left">Limit</th>
                </tr>
              </thead>
              <tbody>
                {metrics.memory.map((metric: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="py-2">{formatTimestamp(metric.timestamp)}</td>
                    <td className="py-2">{formatBytes(metric.usedJSHeapSize)}</td>
                    <td className="py-2">{formatBytes(metric.totalJSHeapSize)}</td>
                    <td className="py-2">{formatBytes(metric.jsHeapSizeLimit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Average Response Times */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Average Response Times</h2>
          <div className="space-y-2">
            {['search-games', 'get-game-details', 'get-popular-games'].map(operation => {
              const relevantMetrics = metrics.performance.filter((m: any) => m.name === operation);
              const average = relevantMetrics.length
                ? relevantMetrics.reduce((sum: number, m: any) => sum + m.duration, 0) / relevantMetrics.length
                : 0;

              return (
                <div key={operation} className="flex justify-between items-center border-t py-2">
                  <span className="font-medium">{operation}:</span>
                  <span>{formatDuration(average)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMonitor;
