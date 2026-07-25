'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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

// ==================== HOOK ====================

export function usePersonalization() {
  // Load from localStorage on mount using useSyncExternalStore pattern
  // to avoid the "set-state-in-effect" lint rule
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardPreferences;
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          pinnedRepresentatives: parsed.pinnedRepresentatives || [],
          preferredCounties: parsed.preferredCounties || [],
          hiddenMetrics: parsed.hiddenMetrics || [],
          lastVisitedReps: parsed.lastVisitedReps || [],
        };
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    return DEFAULT_PREFERENCES;
  });
  const [isLoaded, setIsLoaded] = useState(true); // Using useState initializer, so loaded immediately

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        // localStorage full or unavailable — silent fail
      }
    }
  }, [preferences, isLoaded]);

  // Pin / unpin a representative
  const pinRepresentative = useCallback((repId: string) => {
    setPreferences(prev => {
      if (prev.pinnedRepresentatives.includes(repId)) return prev;
      return {
        ...prev,
        pinnedRepresentatives: [...prev.pinnedRepresentatives, repId],
      };
    });
  }, []);

  const unpinRepresentative = useCallback((repId: string) => {
    setPreferences(prev => ({
      ...prev,
      pinnedRepresentatives: prev.pinnedRepresentatives.filter(id => id !== repId),
    }));
  }, []);

  const isPinned = useCallback((repId: string): boolean => {
    return preferences.pinnedRepresentatives.includes(repId);
  }, [preferences.pinnedRepresentatives]);

  // Preferred counties
  const addPreferredCounty = useCallback((countyName: string) => {
    setPreferences(prev => {
      if (prev.preferredCounties.includes(countyName)) return prev;
      return {
        ...prev,
        preferredCounties: [...prev.preferredCounties, countyName],
      };
    });
  }, []);

  const removePreferredCounty = useCallback((countyName: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCounties: prev.preferredCounties.filter(c => c !== countyName),
    }));
  }, []);

  // Hidden metrics
  const toggleMetricVisibility = useCallback((metricKey: string) => {
    setPreferences(prev => {
      if (prev.hiddenMetrics.includes(metricKey)) {
        return { ...prev, hiddenMetrics: prev.hiddenMetrics.filter(m => m !== metricKey) };
      }
      return { ...prev, hiddenMetrics: [...prev.hiddenMetrics, metricKey] };
    });
  }, []);

  // Track recently visited representatives
  const trackVisit = useCallback((repId: string) => {
    setPreferences(prev => {
      const updated = [repId, ...prev.lastVisitedReps.filter(id => id !== repId)].slice(0, 10);
      return { ...prev, lastVisitedReps: updated };
    });
  }, []);

  // Update general preferences
  const updatePreference = useCallback(<K extends keyof DashboardPreferences>(key: K, value: DashboardPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset all preferences
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
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
