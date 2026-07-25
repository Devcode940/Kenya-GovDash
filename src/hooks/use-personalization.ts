'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

// ==================== TYPES ====================

export interface DashboardPreferences {
  pinnedRepresentatives: string[]; // rep IDs
  preferredCounties: string[]; // county names
  hiddenMetrics: string[]; // metric keys to hide in scorecard
  defaultMobileTab: string;
  compactTree: boolean; // show compact tree view
  showDataGapWarnings: boolean;
  lastVisitedReps: string[]; // recently viewed (max 10)
  themePreference: 'light' | 'dark' | 'system';
}

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  pinnedRepresentatives: [],
  preferredCounties: [],
  hiddenMetrics: [],
  defaultMobileTab: 'summary',
  compactTree: false,
  showDataGapWarnings: true,
  lastVisitedReps: [],
  themePreference: 'system',
};

const STORAGE_KEY = 'kenya-govdash-preferences';

// ==================== LOCAL STORAGE EXTERNAL STORE ====================
// Use useSyncExternalStore to safely read localStorage (SSR-safe with server snapshot)
// and subscribe to storage events for cross-tab sync + manual change notification

let listeners: (() => void)[] = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  // Also listen for cross-tab storage changes
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners = listeners.filter(l => l !== callback);
    window.removeEventListener('storage', onStorage);
  };
}

// Cache the last snapshot to satisfy useSyncExternalStore's requirement
// that getSnapshot returns the same reference when data hasn't changed.
let cachedSnapshot: DashboardPreferences | null = null;
let cachedRaw: string | null = null;

function getSnapshot(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return cached snapshot if the raw string hasn't changed
    if (stored === cachedRaw && cachedSnapshot !== null) {
      return cachedSnapshot;
    }
    cachedRaw = stored;
    if (stored) {
      const parsed = JSON.parse(stored) as DashboardPreferences;
      cachedSnapshot = {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        pinnedRepresentatives: parsed.pinnedRepresentatives || [],
        preferredCounties: parsed.preferredCounties || [],
        hiddenMetrics: parsed.hiddenMetrics || [],
        lastVisitedReps: parsed.lastVisitedReps || [],
      };
      return cachedSnapshot;
    }
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    cachedRaw = null;
  }
  cachedSnapshot = DEFAULT_PREFERENCES;
  return DEFAULT_PREFERENCES;
}

function getServerSnapshot(): DashboardPreferences {
  return DEFAULT_PREFERENCES;
}

// Notify all subscribers that preferences changed (triggers re-render)
function emitChange() {
  for (const listener of listeners) listener();
}

// ==================== HOOK ====================

export function usePersonalization() {
  // useSyncExternalStore: SSR-safe localStorage reading
  // - getSnapshot runs only on client (has localStorage)
  // - getServerSnapshot returns defaults on server (no localStorage)
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Since useSyncExternalStore is read-only, we write directly to localStorage
  // and then call emitChange() to trigger a re-render that picks up new data

  const writePreferences = useCallback((updater: (prev: DashboardPreferences) => DashboardPreferences) => {
    const current = getSnapshot();
    const updated = updater(current);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* localStorage full — silent fail */ }
    emitChange();
  }, []);

  const pinRepresentative = useCallback((repId: string) => {
    writePreferences(prev => {
      if (prev.pinnedRepresentatives.includes(repId)) return prev;
      return { ...prev, pinnedRepresentatives: [...prev.pinnedRepresentatives, repId] };
    });
  }, [writePreferences]);

  const unpinRepresentative = useCallback((repId: string) => {
    writePreferences(prev => ({
      ...prev,
      pinnedRepresentatives: prev.pinnedRepresentatives.filter(id => id !== repId),
    }));
  }, [writePreferences]);

  const isPinned = useCallback((repId: string): boolean => {
    return preferences.pinnedRepresentatives.includes(repId);
  }, [preferences.pinnedRepresentatives]);

  // Preferred counties
  const addPreferredCounty = useCallback((countyName: string) => {
    writePreferences(prev => {
      if (prev.preferredCounties.includes(countyName)) return prev;
      return { ...prev, preferredCounties: [...prev.preferredCounties, countyName] };
    });
  }, [writePreferences]);

  const removePreferredCounty = useCallback((countyName: string) => {
    writePreferences(prev => ({
      ...prev,
      preferredCounties: prev.preferredCounties.filter(c => c !== countyName),
    }));
  }, [writePreferences]);

  // Hidden metrics
  const toggleMetricVisibility = useCallback((metricKey: string) => {
    writePreferences(prev => {
      if (prev.hiddenMetrics.includes(metricKey)) {
        return { ...prev, hiddenMetrics: prev.hiddenMetrics.filter(m => m !== metricKey) };
      }
      return { ...prev, hiddenMetrics: [...prev.hiddenMetrics, metricKey] };
    });
  }, [writePreferences]);

  // Track recently visited representatives
  const trackVisit = useCallback((repId: string) => {
    writePreferences(prev => {
      const updated = [repId, ...prev.lastVisitedReps.filter(id => id !== repId)].slice(0, 10);
      return { ...prev, lastVisitedReps: updated };
    });
  }, [writePreferences]);

  // Update general preferences
  const updatePreference = useCallback(<K extends keyof DashboardPreferences>(key: K, value: DashboardPreferences[K]) => {
    writePreferences(prev => ({ ...prev, [key]: value }));
  }, [writePreferences]);

  // Reset all preferences
  const resetPreferences = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    emitChange();
  }, []);

  // Compute visible metrics (not hidden)
  const visibleMetrics = useMemo(() => {
    const ALL_METRICS = [
      'overallAccountability',
      'transparencyBudget',
      'projectDeliveryAbsorption',
      'manifestoFulfillment',
      'legislativeOversight',
      'ethicsIntegrity',
      'publicSentiment',
    ];
    return ALL_METRICS.filter(m => !preferences.hiddenMetrics.includes(m));
  }, [preferences.hiddenMetrics]);

  // isLoaded is always true with useSyncExternalStore — it reads synchronously
  const isLoaded = true;

  return {
    preferences,
    isLoaded,
    pinRepresentative,
    unpinRepresentative,
    isPinned,
    addPreferredCounty,
    removePreferredCounty,
    toggleMetricVisibility,
    trackVisit,
    updatePreference,
    resetPreferences,
    visibleMetrics,
  };
}
