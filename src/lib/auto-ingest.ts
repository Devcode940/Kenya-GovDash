/**
 * Auto-ingest orchestration for oversight sources (EACC, TI-Kenya, CoB, OAG, …).
 * Driven by data/oversight/source-registry.json.
 *
 * Live feeds: /api/live-feeds/{eacc,ti-kenya,cob,oag}
 * Admin refresh: POST /api/admin/ingest-oversight (auth)
 */

import sourceRegistry from '../../data/oversight/source-registry.json';
import eaccNecs from '../../data/oversight/eacc-necs-2024.json';
import cbts2025 from '../../data/oversight/cbts-2025.json';
import { refreshAllFeeds } from '@/lib/live-feeds/aggregator';
import type { FeedRefreshResult } from '@/lib/live-feeds/types';

export type IngestSourceStatus = {
  id: string;
  name: string;
  priority: number;
  tracks: string[];
  hubUrl: string;
  ingestMode: string;
  curatedSnapshots: string[];
  liveFeed?: 'eacc' | 'ti-kenya' | 'cob' | 'oag';
};

const LIVE_FEED_MAP: Record<string, 'eacc' | 'ti-kenya' | 'cob' | 'oag'> = {
  eacc: 'eacc',
  'ti-kenya': 'ti-kenya',
  cob: 'cob',
  oag: 'oag',
};

export function listIngestSources(): IngestSourceStatus[] {
  return sourceRegistry.sources.map((s) => {
    const curated: string[] = [];
    if (s.id === 'eacc') curated.push(`NECS 2024 highlights (${eaccNecs.highestAverageBribeCounties?.length ?? 0} high-avg bribe counties)`);
    if (s.id === 'ti-kenya') curated.push(`CBTS 2025 top/low (${(cbts2025.topCounties?.length ?? 0) + (cbts2025.lowestPublished?.length ?? 0)} counties)`);
    return {
      id: s.id,
      name: s.name,
      priority: s.priority,
      tracks: s.tracks as string[],
      hubUrl: s.hubUrl,
      ingestMode: s.ingest,
      curatedSnapshots: curated,
      liveFeed: LIVE_FEED_MAP[s.id],
    };
  });
}

export async function runOversightIngest(): Promise<{
  ranAt: string;
  sources: IngestSourceStatus[];
  feedResults: FeedRefreshResult[];
}> {
  const sources = listIngestSources();
  const feedResults = await refreshAllFeeds();
  return {
    ranAt: new Date().toISOString(),
    sources,
    feedResults,
  };
}

export function getIngestStatusSummary() {
  const sources = listIngestSources();
  return {
    registryUpdated: sourceRegistry.meta.lastUpdated,
    sourceCount: sources.length,
    priority1: sources.filter((s) => s.priority === 1).map((s) => s.id),
    liveFeedIds: sources.filter((s) => s.liveFeed).map((s) => s.liveFeed),
    curated: {
      eaccNecsCounties:
        (eaccNecs.highestAverageBribeCounties?.length ?? 0) +
        (eaccNecs.highestBriberyPrevalence?.length ?? 0) +
        (eaccNecs.lowestBriberyIncidenceIndex?.length ?? 0) +
        (eaccNecs.highIncidenceExamples?.length ?? 0),
      cbtsCounties: (cbts2025.topCounties?.length ?? 0) + (cbts2025.lowestPublished?.length ?? 0),
    },
  };
}
