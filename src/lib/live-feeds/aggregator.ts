// Live Feeds — Aggregator
// Coordinates fetching from all four sources and provides a unified interface

import {
  type LiveFeedAggregation,
  type FeedRefreshResult,
  type FeedSource,
  type FeedStatus,
} from './types';
import { getOagFeed, getOagStaticFeed } from './oag-service';
import { getCobFeed, getCobStaticFeed } from './cob-service';
import { getTiKenyaFeed, getTiKenyaStaticFeed } from './ti-kenya-service';
import { getEaccFeed, getEaccStaticFeed } from './eacc-service';

// ==================== PUBLIC API ====================

export async function getAllFeeds(forceRefresh = false): Promise<LiveFeedAggregation> {
  // Fetch all sources in parallel
  const [oag, cob, tiKenya, eacc] = await Promise.all([
    getOagFeed(forceRefresh),
    getCobFeed(forceRefresh),
    getTiKenyaFeed(forceRefresh),
    getEaccFeed(forceRefresh),
  ]);

  // Determine overall status
  const statuses = [oag.freshness.status, cob.freshness.status, tiKenya.freshness.status, eacc.freshness.status];
  let overallStatus: FeedStatus = 'live';
  if (statuses.every(s => s === 'static' || s === 'unavailable')) overallStatus = 'static';
  else if (statuses.every(s => s === 'cached')) overallStatus = 'cached';
  else if (statuses.some(s => s === 'error')) overallStatus = 'error';
  else if (statuses.some(s => s === 'cached') && statuses.some(s => s === 'static')) overallStatus = 'cached';

  return {
    oag,
    cob,
    tiKenya,
    eacc,
    lastRefreshedAt: new Date().toISOString(),
    overallStatus,
  };
}

export function getAllStaticFeeds(): LiveFeedAggregation {
  return {
    oag: getOagStaticFeed(),
    cob: getCobStaticFeed(),
    tiKenya: getTiKenyaStaticFeed(),
    eacc: getEaccStaticFeed(),
    lastRefreshedAt: new Date().toISOString(),
    overallStatus: 'static',
  };
}

export async function refreshFeed(source: FeedSource, force = true): Promise<FeedRefreshResult> {
  const timestamp = new Date().toISOString();
  let result: FeedRefreshResult;

  try {
    switch (source) {
      case 'oag':
        const oag = await getOagFeed(force);
        result = {
          source,
          status: oag.freshness.status,
          dataFetched: true,
          itemsCount: oag.nationalSummaries.length + oag.countyAudits.length,
          timestamp,
        };
        break;

      case 'cob':
        const cob = await getCobFeed(force);
        result = {
          source,
          status: cob.freshness.status,
          dataFetched: true,
          itemsCount: cob.nationalBudgets.length + cob.countyBudgets.length,
          timestamp,
        };
        break;

      case 'ti-kenya':
        const ti = await getTiKenyaFeed(force);
        result = {
          source,
          status: ti.freshness.status,
          dataFetched: true,
          itemsCount: ti.cpi.length + ti.cbts.length + ti.countyScores.length,
          timestamp,
        };
        break;

      case 'eacc':
        const eacc = await getEaccFeed(force);
        result = {
          source,
          status: eacc.freshness.status,
          dataFetched: true,
          itemsCount: eacc.complianceSummary.length + eacc.assetDeclarations.length + eacc.investigations.length,
          timestamp,
        };
        break;

      default:
        result = {
          source,
          status: 'error',
          dataFetched: false,
          itemsCount: 0,
          timestamp,
          errorMessage: `Unknown source: ${source}`,
        };
    }
  } catch (err) {
    result = {
      source,
      status: 'error',
      dataFetched: false,
      itemsCount: 0,
      timestamp,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  return result;
}

export async function refreshAllFeeds(): Promise<FeedRefreshResult[]> {
  const sources: FeedSource[] = ['oag', 'cob', 'ti-kenya', 'eacc'];
  return Promise.all(sources.map(s => refreshFeed(s, true)));
}
