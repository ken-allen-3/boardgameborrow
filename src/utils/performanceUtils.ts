interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
}

const metrics: PerformanceMetric[] = [];

export function measurePerformance<T>(
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

export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics];
}

export function clearPerformanceMetrics(): void {
  metrics.length = 0;
}