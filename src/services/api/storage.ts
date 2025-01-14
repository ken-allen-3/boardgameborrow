interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class StorageCache {
  private prefix: string;
  private ttl: number;

  constructor(prefix: string, ttlHours = 24) {
    this.prefix = prefix;
    this.ttl = ttlHours * 60 * 60 * 1000;
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      if (Date.now() - entry.timestamp > this.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      this.remove(key);
      return null;
    }
  }

  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded or other storage errors
      this.clearExpired();
      try {
        localStorage.setItem(this.getKey(key), JSON.stringify({ data, timestamp: Date.now() }));
      } catch {
        // If still fails after clearing, ignore
      }
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private clearExpired(): void {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry: CacheEntry<any> = JSON.parse(item);
            if (now - entry.timestamp > this.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }
}