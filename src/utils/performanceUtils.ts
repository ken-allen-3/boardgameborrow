interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface CacheMetric {
  name: string;
  operation: 'hit' | 'miss' | 'set' | 'evict';
  timestamp: number;
  context?: Record<string, any>;
}

// Chrome Performance Memory API types
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

interface MemoryMetric {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

const metrics: PerformanceMetric[] = [];
const cacheMetrics: CacheMetric[] = [];
const memoryMetrics: MemoryMetric[] = [];

// Sample memory usage every minute (Chrome only)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const memory = (performance as any).memory;
    if (memory) {
      memoryMetrics.push({
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });

      // Keep last hour of memory metrics
      const hourAgo = Date.now() - 60 * 60 * 1000;
      while (memoryMetrics.length && memoryMetrics[0].timestamp < hourAgo) {
        memoryMetrics.shift();
      }
    }
  }, 60 * 1000);
}

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const start = performance.now();
  
  return fn().finally(() => {
    const duration = performance.now() - start;
    metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      context
    });
    
    // Log if duration exceeds threshold
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation detected: ${name} took ${duration}ms`);
    }
  });
}

export function trackCacheOperation(
  name: string,
  operation: 'hit' | 'miss' | 'set' | 'evict',
  context?: Record<string, any>
): void {
  cacheMetrics.push({
    name,
    operation,
    timestamp: Date.now(),
    context
  });
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics];
}

export function getCacheMetrics(): CacheMetric[] {
  return [...cacheMetrics];
}

export function getMemoryMetrics(): MemoryMetric[] {
  return [...memoryMetrics];
}

export function getCacheStats(): Record<string, { hits: number; misses: number; sets: number; evictions: number }> {
  const stats: Record<string, { hits: number; misses: number; sets: number; evictions: number }> = {};
  
  cacheMetrics.forEach(metric => {
    if (!stats[metric.name]) {
      stats[metric.name] = { hits: 0, misses: 0, sets: 0, evictions: 0 };
    }
    
    switch (metric.operation) {
      case 'hit':
        stats[metric.name].hits++;
        break;
      case 'miss':
        stats[metric.name].misses++;
        break;
      case 'set':
        stats[metric.name].sets++;
        break;
      case 'evict':
        stats[metric.name].evictions++;
        break;
    }
  });
  
  return stats;
}

export function getAverageResponseTime(operationName: string): number {
  const relevantMetrics = metrics.filter(m => m.name === operationName);
  if (!relevantMetrics.length) return 0;
  
  const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
  return total / relevantMetrics.length;
}

export function clearMetrics(): void {
  metrics.length = 0;
  cacheMetrics.length = 0;
  memoryMetrics.length = 0;
}
