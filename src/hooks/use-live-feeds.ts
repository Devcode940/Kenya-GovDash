// React Hooks for consuming live feed data
// Provides hooks for auto-refreshing, status tracking, and per-source access

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type LiveFeedAggregation,
  type FeedSource,
  type FeedStatus,
  type FeedRefreshResult,
  type OagFeedPayload,
  type CobFeedPayload,
  type TiKenyaFeedPayload,
  type EaccFeedPayload,
} from '@/lib/live-feeds/types';

// ==================== MAIN AGGREGATION HOOK ====================

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes auto-refresh

export function useLiveFeeds(autoRefresh = true) {
  const [data, setData] = useState<LiveFeedAggregation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFeeds = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/live-feeds?force=${force}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch live feeds: ${response.status}`);
      }

      const feedData: LiveFeedAggregation = await response.json();
      setData(feedData);
      setLastRefreshed(feedData.lastRefreshedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feeds');
      // Try static fallback
      try {
        const response = await fetch('/api/live-feeds?mode=static');
        if (response.ok) {
          const staticData: LiveFeedAggregation = await response.json();
          setData(staticData);
          setLastRefreshed(staticData.lastRefreshedAt);
        }
      } catch {
        // Complete failure — no data available
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFeeds(false);
  }, [fetchFeeds]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchFeeds(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchFeeds]);

  const refresh = useCallback(async (source?: FeedSource) => {
    if (source) {
      try {
        const response = await fetch('/api/live-feeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, force: true }),
        });

        if (response.ok) {
          const result: FeedRefreshResult = await response.json();
          // Re-fetch all feeds to update state
          await fetchFeeds(true);
          return result;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Refresh failed');
      }
      return null;
    }

    return fetchFeeds(true);
  }, [fetchFeeds]);

  return {
    data,
    loading,
    error,
    lastRefreshed,
    refresh,
    overallStatus: data?.overallStatus || 'unavailable' as FeedStatus,
  };
}

// ==================== PER-SOURCE HOOKS ====================

export function useOagFeed() {
  const [data, setData] = useState<OagFeedPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOag() {
      try {
        const response = await fetch('/api/live-feeds/oag');
        if (response.ok) {
          setData(await response.json());
        }
      } catch {
        // Use static fallback
        try {
          const response = await fetch('/api/live-feeds/oag?mode=static');
          if (response.ok) setData(await response.json());
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    }
    fetchOag();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/live-feeds/oag?force=true');
      if (response.ok) setData(await response.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  return { data, loading, refresh };
}

export function useCobFeed() {
  const [data, setData] = useState<CobFeedPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCob() {
      try {
        const response = await fetch('/api/live-feeds/cob');
        if (response.ok) {
          setData(await response.json());
        }
      } catch {
        try {
          const response = await fetch('/api/live-feeds/cob?mode=static');
          if (response.ok) setData(await response.json());
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    }
    fetchCob();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/live-feeds/cob?force=true');
      if (response.ok) setData(await response.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  return { data, loading, refresh };
}

export function useTiKenyaFeed() {
  const [data, setData] = useState<TiKenyaFeedPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTi() {
      try {
        const response = await fetch('/api/live-feeds/ti-kenya');
        if (response.ok) {
          setData(await response.json());
        }
      } catch {
        try {
          const response = await fetch('/api/live-feeds/ti-kenya?mode=static');
          if (response.ok) setData(await response.json());
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    }
    fetchTi();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/live-feeds/ti-kenya?force=true');
      if (response.ok) setData(await response.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  return { data, loading, refresh };
}

export function useEaccFeed(repId?: string) {
  const [data, setData] = useState<EaccFeedPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEacc() {
      const url = repId
        ? `/api/live-feeds/eacc?repId=${repId}`
        : '/api/live-feeds/eacc';
      try {
        const response = await fetch(url);
        if (response.ok) {
          setData(await response.json());
        }
      } catch {
        try {
          const staticUrl = repId
            ? `/api/live-feeds/eacc?mode=static&repId=${repId}`
            : '/api/live-feeds/eacc?mode=static';
          const response = await fetch(staticUrl);
          if (response.ok) setData(await response.json());
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    }
    fetchEacc();
  }, [repId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const url = repId
      ? `/api/live-feeds/eacc?force=true&repId=${repId}`
      : '/api/live-feeds/eacc?force=true';
    try {
      const response = await fetch(url);
      if (response.ok) setData(await response.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [repId]);

  return { data, loading, refresh };
}

// ==================== FEED STATUS HELPERS ====================

export function getFeedStatusIcon(status: FeedStatus): string {
  switch (status) {
    case 'live': return '🟢';
    case 'cached': return '🟡';
    case 'static': return '🔵';
    case 'unavailable': return '⚪';
    case 'error': return '🔴';
    default: return '⚪';
  }
}

export function getFeedStatusLabel(status: FeedStatus): string {
  switch (status) {
    case 'live': return 'Live Data';
    case 'cached': return 'Cached (recently fetched)';
    case 'static': return 'Static (verified fallback)';
    case 'unavailable': return 'Unavailable';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
}

export function getFeedStatusColor(status: FeedStatus): string {
  switch (status) {
    case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cached': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'static': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'unavailable': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
    case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-500';
  }
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never';
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
