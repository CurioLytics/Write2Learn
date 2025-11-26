/**
 * Cache type definitions for Write2Learn
 */

export type CacheNamespace = 
  | 'auth' 
  | 'journal' 
  | 'vocab' 
  | 'roleplay' 
  | 'profile' 
  | 'template'
  | 'general';

export type CacheStore = 'local' | 'session' | 'memory';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  namespace: CacheNamespace;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  invalidations: number;
  size: number;
}

export interface CacheEvent {
  type: 'set' | 'invalidate' | 'clear';
  namespace: CacheNamespace;
  key: string;
}
