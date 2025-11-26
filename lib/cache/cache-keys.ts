/**
 * Centralized cache key definitions
 * Version-prefixed to allow cache busting on major changes
 */

export const CACHE_VERSION = 'v1';

export const CACHE_KEYS = {
  // Auth & Profile
  AUTH: {
    SESSION: (userId: string) => `${CACHE_VERSION}:auth:session:${userId}`,
    PROFILE: (userId: string) => `${CACHE_VERSION}:auth:profile:${userId}`,
  },

  // Journal
  JOURNAL: {
    LIST: (userId: string) => `${CACHE_VERSION}:journal:list:${userId}`,
    DETAIL: (journalId: string) => `${CACHE_VERSION}:journal:detail:${journalId}`,
    DRAFT: (id?: string) => `${CACHE_VERSION}:journal:draft${id ? `:${id}` : ''}`,
    FEEDBACK: (id: string) => `${CACHE_VERSION}:journal:feedback:${id}`,
  },

  // Vocabulary
  VOCAB: {
    SETS: (userId: string) => `${CACHE_VERSION}:vocab:sets:${userId}`,
    SET_DETAIL: (setId: string) => `${CACHE_VERSION}:vocab:set:${setId}`,
    STARRED: (userId: string) => `${CACHE_VERSION}:vocab:starred:${userId}`,
    REVIEW: (setId: string) => `${CACHE_VERSION}:vocab:review:${setId}`,
  },

  // Roleplay
  ROLEPLAY: {
    TOPICS: `${CACHE_VERSION}:roleplay:topics`,
    SCENARIOS: (topic?: string) => `${CACHE_VERSION}:roleplay:scenarios${topic ? `:${topic}` : ':all'}`,
    SESSION: (sessionId: string) => `${CACHE_VERSION}:roleplay:session:${sessionId}`,
    SUMMARY: (sessionId: string) => `${CACHE_VERSION}:roleplay:summary:${sessionId}`,
  },

  // Templates
  TEMPLATE: {
    LIST: `${CACHE_VERSION}:template:list`,
    DETAIL: (templateId: string) => `${CACHE_VERSION}:template:detail:${templateId}`,
  },

  // Progress
  PROGRESS: {
    STATS: (userId: string) => `${CACHE_VERSION}:progress:stats:${userId}`,
    STREAKS: (userId: string) => `${CACHE_VERSION}:progress:streaks:${userId}`,
  },
} as const;

export const CACHE_TTL = {
  SHORT: 60000,       // 1 minute - frequently changing data
  MEDIUM: 300000,     // 5 minutes - standard caching
  LONG: 3600000,      // 1 hour - rarely changing data
  SESSION: 86400000,  // 24 hours - session data
} as const;
