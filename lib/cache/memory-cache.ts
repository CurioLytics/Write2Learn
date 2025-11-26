/**
 * In-memory LRU cache with automatic expiration cleanup
 * Used primarily for middleware and server-side caching
 */

interface MemoryCacheEntry<T> {
  data: T;
  expiry: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, MemoryCacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttl: number; // in seconds

  constructor(maxSize: number = 1000, ttl: number = 60) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttlToUse = customTtl ?? this.ttl;
    
    // Cleanup expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanupExpired();
      
      // If still full after cleanup, remove oldest (first) entry
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlToUse * 1000
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Periodic cleanup method (can be called externally)
  cleanup(): void {
    this.cleanupExpired();
  }
}
