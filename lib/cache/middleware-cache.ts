/**
 * Middleware caching utilities
 * 
 * For production with high traffic, consider using Vercel KV:
 * 
 * 1. Install: npm install @vercel/kv
 * 2. Add to Vercel project settings
 * 3. Replace in-memory cache with KV calls
 * 
 * Example:
 * import { kv } from '@vercel/kv';
 * 
 * export async function getCachedProfile(userId: string) {
 *   const cached = await kv.get(`profile:${userId}`);
 *   if (cached) return cached;
 *   // ... fetch from DB
 *   await kv.setex(`profile:${userId}`, 60, profile);
 *   return profile;
 * }
 */

// In-memory cache for development/low traffic
const SESSION_CACHE_TIME = 60; // seconds
const sessionCache = new Map<string, {session: any, timestamp: number}>();
const profileCache = new Map<string, {profile: any, timestamp: number}>();

// Cleanup old entries to prevent memory leaks
const MAX_CACHE_SIZE = 200;

export function getCachedSession(cacheKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const cached = sessionCache.get(cacheKey);
  
  if (cached && now - cached.timestamp < SESSION_CACHE_TIME) {
    return cached.session;
  }
  return null;
}

export function setCachedSession(cacheKey: string, session: any) {
  const now = Math.floor(Date.now() / 1000);
  sessionCache.set(cacheKey, { session, timestamp: now });
  
  // Cleanup if cache is too large
  if (sessionCache.size > MAX_CACHE_SIZE) {
    const oldestKey = Array.from(sessionCache.keys())[0];
    sessionCache.delete(oldestKey);
  }
}

export function getCachedProfile(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const cached = profileCache.get(userId);
  
  if (cached && now - cached.timestamp < SESSION_CACHE_TIME) {
    return cached.profile;
  }
  return null;
}

export function setCachedProfile(userId: string, profile: any) {
  const now = Math.floor(Date.now() / 1000);
  profileCache.set(userId, { profile, timestamp: now });
  
  // Cleanup if cache is too large
  if (profileCache.size > MAX_CACHE_SIZE) {
    const oldestKey = Array.from(profileCache.keys())[0];
    profileCache.delete(oldestKey);
  }
}

export function clearCache() {
  sessionCache.clear();
  profileCache.clear();
}
