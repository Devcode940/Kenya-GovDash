// Live Feeds — In-Memory Cache with TTL
// Provides caching for fetched feed data with configurable TTL per source

import { type FeedSource, type FeedDataFreshness, type FeedStatus } from './types';
import { FEED_SOURCES } from './config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;      // ms epoch
  expiresAt: number;       // ms epoch
  source: FeedSource;
}

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, data: T, source: FeedSource): void {
  const config = FEED_SOURCES[source];
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + config.cacheTtlMs,
    source,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function getCacheFreshness(key: string, sourceUrl: string, isLiveApiAvailable: boolean): FeedDataFreshness {
  const entry = cache.get(key);
  const config = FEED_SOURCES[entry?.source || 'oag'];
  const now = new Date();

  if (!entry) {
    return {
      lastFetchedAt: null,
      lastSuccessfulAt: null,
      nextFetchAt: null,
      status: 'unavailable' as FeedStatus,
      errorMessage: 'No cached data available. Live fetch pending.',
      cacheExpiryAt: null,
      sourceUrl,
      isLiveApiAvailable,
    };
  }

  const isExpired = Date.now() > entry.expiresAt;
  const status: FeedStatus = isExpired ? 'static' : 'cached';

  const nextFetchAt = new Date(
    Math.min(entry.expiresAt, entry.timestamp + config.refreshIntervalMs)
  );

  return {
    lastFetchedAt: new Date(entry.timestamp).toISOString(),
    lastSuccessfulAt: new Date(entry.timestamp).toISOString(),
    nextFetchAt: nextFetchAt.toISOString(),
    status,
    errorMessage: isExpired ? 'Cache expired — data may be stale' : undefined,
    cacheExpiryAt: new Date(entry.expiresAt).toISOString(),
    sourceUrl,
    isLiveApiAvailable,
  };
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

export function getCacheStats(): { totalEntries: number; keys: string[]; oldestEntry: number } {
  const entries = Array.from(cache.entries());
  return {
    totalEntries: entries.length,
    keys: entries.map(([k]) => k),
    oldestEntry: entries.length > 0 ? Math.min(...entries.map(([, v]) => v.timestamp)) : 0,
  };
}

// Auto-cleanup: remove expired entries every 5 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCacheCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt + 60 * 60 * 1000) { // Remove 1 hour after expiry
        cache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
