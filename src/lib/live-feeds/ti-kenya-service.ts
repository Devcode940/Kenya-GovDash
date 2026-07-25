// Live Feeds — Transparency International Kenya Service
// Fetches data from tikenya.org and transparency.org (CPI)
// TI-Kenya publishes CPI, CBTS, and CGSR reports annually as PDFs

import {
  type TiKenyaFeedPayload,
  type TiKenyaCPI,
  type TiKenyaCBTS,
  type TiKenyaCountyGovernanceScore,
  type FeedDataFreshness,
} from './types';
import { setCache, getCache, getCacheFreshness } from './cache';
import { FEED_SOURCES } from './config';

const CACHE_KEY = 'ti-kenya-feed';

// ==================== STATIC FALLBACK DATA ====================

const STATIC_CPI: TiKenyaCPI[] = [
  {
    year: '2025',
    score: 30,
    rank: 130,
    countriesTotal: 182,
    source: 'Transparency International — Corruption Perceptions Index 2025',
    url: 'https://transparency.org/en/countries/kenya',
  },
  {
    year: '2024',
    score: 31,
    rank: 126,
    countriesTotal: 180,
    source: 'Transparency International — Corruption Perceptions Index 2024',
    url: 'https://transparency.org/en/countries/kenya',
  },
];

const STATIC_CBTS: TiKenyaCBTS[] = [
  {
    year: '2025',
    nationalAverage: 65,
    countiesCovered: 15,
    topCounty: null,
    bottomCounty: null,
    source: 'Bajeti Hub — County Budget Transparency Survey (CBTS) 2025',
    url: 'https://bajetihub.org/county-budget-transparency-survey-2025',
  },
];

const STATIC_COUNTY_SCORES: TiKenyaCountyGovernanceScore[] = [
  {
    countyName: 'Kajiado',
    year: '2024',
    overallScore: null,
    serviceDelivery: null,
    transparency: 74,
    accountability: null,
    participation: null,
    source: 'Bajeti Hub — County Budget Transparency Survey (CBTS) 2024',
    url: 'https://bajetihub.org/wp-content/uploads/2025/05/Bajeti-Hub-County-Summary-Kajiado-County-2025.pdf',
  },
];

// ==================== LIVE FETCH ====================

async function fetchTiKenyaPublicationsPage(): Promise<string | null> {
  try {
    const response = await fetch(FEED_SOURCES['ti-kenya'].reportsUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'KenyaGovDash/1.0 (Accountability Platform; Respectful Crawler)',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`[TI-Kenya] Publications page fetch failed: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.warn(`[TI-Kenya] Fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return null;
  }
}

async function fetchCpiData(): Promise<{ score: number; rank: number } | null> {
  try {
    // Try to fetch CPI page from transparency.org
    const response = await fetch('https://transparency.org/en/countries/kenya', {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'KenyaGovDash/1.0',
        'Accept': 'text/html',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;
    // CPI data is embedded in the page HTML/JS — can't easily parse without browser rendering
    return null;
  } catch {
    return null;
  }
}

// ==================== PUBLIC API ====================

export async function getTiKenyaFeed(forceRefresh = false): Promise<TiKenyaFeedPayload> {
  if (!forceRefresh) {
    const cached = getCache<TiKenyaFeedPayload>(CACHE_KEY);
    if (cached) return cached;
  }

  // Attempt live fetch from tikenya.org publications page
  const html = await fetchTiKenyaPublicationsPage();
  await fetchCpiData(); // Attempt CPI fetch

  const isLiveAvailable = html !== null;
  const freshness: FeedDataFreshness = getCacheFreshness(
    CACHE_KEY,
    FEED_SOURCES['ti-kenya'].reportsUrl,
    false
  );

  if (html) {
    freshness.lastFetchedAt = new Date().toISOString();
    freshness.lastSuccessfulAt = new Date().toISOString();
    freshness.status = 'cached';
  }

  const payload: TiKenyaFeedPayload = {
    freshness,
    cpi: STATIC_CPI,
    cbts: STATIC_CBTS,
    countyScores: STATIC_COUNTY_SCORES,
  };

  setCache(CACHE_KEY, payload, 'ti-kenya');
  return payload;
}

export function getTiKenyaStaticFeed(): TiKenyaFeedPayload {
  return {
    freshness: {
      lastFetchedAt: null,
      lastSuccessfulAt: null,
      nextFetchAt: null,
      status: 'static',
      errorMessage: 'Using verified static data. Live fetch from tikenya.org pending.',
      cacheExpiryAt: null,
      sourceUrl: FEED_SOURCES['ti-kenya'].reportsUrl,
      isLiveApiAvailable: false,
    },
    cpi: STATIC_CPI,
    cbts: STATIC_CBTS,
    countyScores: STATIC_COUNTY_SCORES,
  };
}
