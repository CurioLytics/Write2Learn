/**
 * Centralized cache manager for Write2Learn
 * Handles localStorage, sessionStorage, and in-memory caching with TTL and invalidation
 */

import type { CacheNamespace, CacheStore, CacheEntry, CacheMetrics } from './cache-types';
import { CACHE_VERSION } from './cache-keys';

class CacheManager {
  private readonly keyPrefix = 'w2l_cache';
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    size: 0
  };

  /**
   * Generate a namespaced cache key
   */
  private makeKey(namespace: CacheNamespace, key: string): string {
    return `${this.keyPrefix}:${namespace}:${key}`;
  }

  /**
   * Get data from cache
   */
  get<T>(namespace: CacheNamespace, key: string, store: CacheStore = 'local'): T | null {
    if (typeof window === 'undefined') return null;

    const fullKey = this.makeKey(namespace, key);
    const storage = store === 'local' ? localStorage : sessionStorage;

    try {
      const item = storage.getItem(fullKey);
      if (!item) {
        this.metrics.misses++;
        return null;
      }

      const entry = JSON.parse(item) as CacheEntry<T>;
      const now = Date.now();

      // Check if expired
      if (now > entry.expiry) {
        storage.removeItem(fullKey);
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return entry.data;
    } catch (error) {
      console.warn(`Cache get error for ${fullKey}:`, error);
      storage.removeItem(fullKey);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(
    namespace: CacheNamespace, 
    key: string, 
    data: T, 
    ttl: number = 300000, // 5 minutes default
    store: CacheStore = 'local'
  ): void {
    if (typeof window === 'undefined') return;

    const fullKey = this.makeKey(namespace, key);
    const storage = store === 'local' ? localStorage : sessionStorage;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      namespace
    };

    try {
      storage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded
      console.warn(`Cache set error for ${fullKey}:`, error);
      // Try to clear some space
      this.cleanup(store);
      // Try one more time
      try {
        storage.setItem(fullKey, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Cache storage quota exceeded even after cleanup');
      }
    }
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(namespace: CacheNamespace, key: string, store: CacheStore = 'local'): void {
    if (typeof window === 'undefined') return;

    const fullKey = this.makeKey(namespace, key);
    const storage = store === 'local' ? localStorage : sessionStorage;
    
    storage.removeItem(fullKey);
    this.metrics.invalidations++;
  }

  /**
   * Invalidate all keys in a namespace
   */
  invalidateNamespace(namespace: CacheNamespace, store: CacheStore = 'local'): void {
    if (typeof window === 'undefined') return;

    const storage = store === 'local' ? localStorage : sessionStorage;
    const prefix = `${this.keyPrefix}:${namespace}:`;
    const keysToRemove: string[] = [];

    // Find all keys in this namespace
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach(key => {
      storage.removeItem(key);
      this.metrics.invalidations++;
    });
  }

  /**
   * Invalidate keys matching a pattern
   */
  invalidatePattern(pattern: RegExp, store: CacheStore = 'local'): void {
    if (typeof window === 'undefined') return;

    const storage = store === 'local' ? localStorage : sessionStorage;
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix) && pattern.test(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      storage.removeItem(key);
      this.metrics.invalidations++;
    });
  }

  /**
   * Clear all caches
   */
  clearAll(store?: CacheStore): void {
    if (typeof window === 'undefined') return;

    if (!store || store === 'local') {
      this.clearStorage(localStorage);
    }
    if (!store || store === 'session') {
      this.clearStorage(sessionStorage);
    }
  }

  private clearStorage(storage: Storage): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Remove expired entries from storage
   */
  cleanup(store: CacheStore = 'local'): void {
    if (typeof window === 'undefined') return;

    const storage = store === 'local' ? localStorage : sessionStorage;
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key || !key.startsWith(this.keyPrefix)) continue;

      try {
        const item = storage.getItem(key);
        if (!item) continue;

        const entry = JSON.parse(item) as CacheEntry;
        if (now > entry.expiry) {
          keysToRemove.push(key);
        }
      } catch (error) {
        // Remove corrupted entries
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Check and migrate from old cache version
   */
  checkVersion(): void {
    if (typeof window === 'undefined') return;

    const storedVersion = localStorage.getItem('w2l_cache_version');
    
    if (storedVersion !== CACHE_VERSION) {
      console.log(`Cache version changed from ${storedVersion} to ${CACHE_VERSION}, clearing old caches`);
      this.clearAll('local');
      this.clearAll('session');
      localStorage.setItem('w2l_cache_version', CACHE_VERSION);
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      size: 0
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Initialize on client
if (typeof window !== 'undefined') {
  // Check cache version and migrate if needed
  cacheManager.checkVersion();

  // Initial cleanup
  cacheManager.cleanup('local');
  cacheManager.cleanup('session');

  // Set up periodic cleanup every 5 minutes
  setInterval(() => {
    cacheManager.cleanup('local');
    cacheManager.cleanup('session');
  }, 5 * 60 * 1000);
}
