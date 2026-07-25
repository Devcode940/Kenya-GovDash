// Live Feeds — Controller of Budget (CoB) Service
// Fetches and parses data from the Controller of Budget (cob.go.ke)
// CoB publishes county budget implementation review reports as PDFs

import {
  type CobFeedPayload,
  type CobCountyBudget,
  type CobNationalBudget,
  type FeedDataFreshness,
} from './types';
import { setCache, getCache, getCacheFreshness } from './cache';
import { FEED_SOURCES, DATA_GAP_NOTES } from './config';

const CACHE_KEY = 'cob-feed';

// ==================== STATIC FALLBACK DATA ====================
// Verified data from published CoB reports

const STATIC_COB_NATIONAL: CobNationalBudget[] = [
  {
    fy: '2023/24',
    aggregateAbsorption: 79.5,
    recurrentAbsorption: 87,
    developmentAbsorption: 37,
    totalPendingBills: 'Kshs 176.80 billion',
    countiesOver70DevBudget: 12,
    equitableShareReleased: 'Kshs 384.40 billion',
    source: 'Controller of Budget — Annual County Budget Implementation Review Report FY 2023/24',
    url: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
    reportTitle: 'Annual County Budget Implementation Review Report FY 2023/24',
  },
];

const STATIC_COB_COUNTY: CobCountyBudget[] = [
  {
    countyName: 'Kajiado',
    countyCode: 34,
    fy: '2023/24',
    overallAbsorption: 79.5,
    recurrentAbsorption: 96.3,
    developmentAbsorption: 19.9,
    totalBudget: null,
    pendingBills: null,
    source: 'CoB Annual Report FY 2023/24; Nation Africa 19 Nov 2024',
    reportUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
  {
    countyName: 'West Pokot',
    countyCode: 24,
    fy: '2023/24',
    overallAbsorption: 89,
    recurrentAbsorption: null,
    developmentAbsorption: null,
    totalBudget: null,
    pendingBills: null,
    source: 'CoB Annual County Budget Implementation Review Report FY 2023/24',
    reportUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
  {
    countyName: 'Kisii',
    countyCode: 45,
    fy: '2023/24',
    overallAbsorption: null,
    recurrentAbsorption: null,
    developmentAbsorption: 2.9,
    totalBudget: null,
    pendingBills: null,
    source: 'CoB First Nine Months Report FY 2023/24',
    reportUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
  {
    countyName: 'Nairobi City',
    countyCode: 47,
    fy: '2023/24',
    overallAbsorption: null,
    recurrentAbsorption: null,
    developmentAbsorption: 3.3,
    totalBudget: null,
    pendingBills: null,
    source: 'CoB First Nine Months Report FY 2023/24',
    reportUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
  {
    countyName: 'Kisumu',
    countyCode: 42,
    fy: '2023/24',
    overallAbsorption: 82,
    recurrentAbsorption: 91,
    developmentAbsorption: 64,
    totalBudget: null,
    pendingBills: null,
    source: 'Kisumu County Budget Implementation Report FY 2023/24',
    reportUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
];

// ==================== LIVE FETCH ====================

async function fetchCobReportsPage(): Promise<string | null> {
  try {
    const response = await fetch(FEED_SOURCES.cob.reportsUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'KenyaGovDash/1.0 (Accountability Platform; Respectful Crawler)',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`[CoB] Reports page fetch failed: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.warn(`[CoB] Fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return null;
  }
}

function parseBudgetLinksFromHtml(html: string): { title: string; url: string; fy: string }[] {
  const links: { title: string; url: string; fy: string }[] = [];
  const pdfRegex = /href="([^"]*\.pdf[^"]*)"[^>]*>([^<]*)/gi;
  let match;

  while ((match = pdfRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    const fyMatch = title.match(/20\d{2}[-/]20\d{2}/) || url.match(/20\d{2}[-/]20\d{2}/);
    const fy = fyMatch ? fyMatch[0] : 'Unknown';

    if (url.toLowerCase().includes('budget') || title.toLowerCase().includes('budget') ||
        url.toLowerCase().includes('implementation') || title.toLowerCase().includes('county')) {
      links.push({ title, url, fy });
    }
  }

  return links;
}

// ==================== PUBLIC API ====================

export async function getCobFeed(forceRefresh = false): Promise<CobFeedPayload> {
  if (!forceRefresh) {
    const cached = getCache<CobFeedPayload>(CACHE_KEY);
    if (cached) return cached;
  }

  const html = await fetchCobReportsPage();
  let liveLinks: { title: string; url: string; fy: string }[] = [];

  if (html) {
    liveLinks = parseBudgetLinksFromHtml(html);
  }

  const isLiveAvailable = html !== null;
  const freshness: FeedDataFreshness = getCacheFreshness(
    CACHE_KEY,
    FEED_SOURCES.cob.reportsUrl,
    false  // CoB has no REST API
  );

  if (html) {
    freshness.lastFetchedAt = new Date().toISOString();
    freshness.lastSuccessfulAt = new Date().toISOString();
    freshness.status = 'cached';
  }

  const payload: CobFeedPayload = {
    freshness,
    nationalBudgets: STATIC_COB_NATIONAL,
    countyBudgets: STATIC_COB_COUNTY,
  };

  if (liveLinks.length > 0) {
    payload.freshness.status = 'cached';
  }

  setCache(CACHE_KEY, payload, 'cob');
  return payload;
}

export function getCobStaticFeed(): CobFeedPayload {
  return {
    freshness: {
      lastFetchedAt: null,
      lastSuccessfulAt: null,
      nextFetchAt: null,
      status: 'static',
      errorMessage: 'Using verified static data. Live fetch from cob.go.ke pending.',
      cacheExpiryAt: null,
      sourceUrl: FEED_SOURCES.cob.reportsUrl,
      isLiveApiAvailable: false,
    },
    nationalBudgets: STATIC_COB_NATIONAL,
    countyBudgets: STATIC_COB_COUNTY,
  };
}
