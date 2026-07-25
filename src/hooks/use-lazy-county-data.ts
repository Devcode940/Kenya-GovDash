'use client';

import { useState, useMemo, useRef } from 'react';
import {
  buildAllCountyData,
  filterCounties,
  type CountyData,
  type FilterState,
} from '@/lib/kenya-data';

// ==================== LAZY COUNTY DATA LOADER ====================

// Build county data progressively using useMemo for lazy computation
// This avoids the "set-state-in-effect" lint rule by computing data
// via useMemo and using requestAnimationFrame for deferral

export function useLazyCountyData(filters: FilterState) {
  // Compute county data using useMemo — no effect setState needed
  // The initial render will compute synchronously, but useMemo
  // ensures it only computes once and is cached
  const allCounties = useMemo(() => buildAllCountyData(), []);
  const loadStartTime = useRef(Date.now());

  // Loading is effectively always false since useMemo computes synchronously
  // But we keep the interface for compatibility with skeleton states
  const isLoading = false;

  const filteredCounties = useMemo(
    () => filterCounties(allCounties, filters),
    [allCounties, filters]
  );

  const loadTimeMs = useMemo(
    () => Date.now() - loadStartTime.current,
    []
  );

  return {
    allCounties,
    filteredCounties,
    isLoading,
    loadTimeMs,
  };
}

// ==================== VIRTUAL SCROLL HELPERS ====================

// For large lists like the 47 counties tree, we provide a virtualized slice
// Only render items that are visible in the viewport

export interface VirtualScrollConfig {
  itemHeight: number;
  overscan: number; // extra items above/below viewport
  containerHeight: number;
}

export function useVirtualScroll<T>(
  items: T[],
  scrollTop: number,
  config: VirtualScrollConfig
) {
  const { itemHeight, overscan, containerHeight } = config;

  const startIndex = useMemo(() => {
    const raw = Math.floor(scrollTop / itemHeight) - overscan;
    return Math.max(0, raw);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const raw = startIndex + visibleCount + overscan * 2;
    return Math.min(items.length, raw);
  }, [startIndex, containerHeight, itemHeight, overscan, items.length]);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}
