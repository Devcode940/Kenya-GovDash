/**
 * Builds a full county profile package for the /county/[name] hub:
 * leaders, pesa za ugatuzi (finance), maendeleo/oversight (EACC, TI, CBTS), demographics.
 */

import { buildAllCountyData, getCountyDemographics, type CountyData, type Representative } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE, type CountyFinanceRecord } from '@/lib/finance-audit-data';
import { getEquitableShareSeries } from '@/lib/devolution-finance';
import sourceRegistry from '../../data/oversight/source-registry.json';
import eaccNecs from '../../data/oversight/eacc-necs-2024.json';
import cbts2025 from '../../data/oversight/cbts-2025.json';

export type CountyLeaderSlot = {
  role: string;
  rep: Representative;
};

export type CountyOversightSnapshot = {
  eacc?: {
    avgBribeKes?: number;
    avgBribeRank?: number;
    prevalencePct?: number;
    incidenceIndex?: number;
    notes: string[];
  };
  budgetTransparency?: {
    score?: number;
    tier?: 'top' | 'low' | 'unknown';
    source: string;
  };
  sources: typeof sourceRegistry.sources;
};

export type CountyProfile = {
  county: CountyData;
  demographics: ReturnType<typeof getCountyDemographics>;
  leaders: CountyLeaderSlot[];
  finance: {
    latest?: CountyFinanceRecord;
    history: CountyFinanceRecord[];
    nationalEquitableShareLatest?: { fiscalYear: string; equitableShareBillion: number };
  };
  oversight: CountyOversightSnapshot;
  links: {
    financeDrilldown: string;
    representatives: string;
    compare: string;
    cobHub: string;
    oagHub: string;
    eaccHub: string;
    tiHub: string;
  };
};

function collectLeaders(c: CountyData): CountyLeaderSlot[] {
  const out: CountyLeaderSlot[] = [];
  const push = (role: string, r?: Representative) => {
    if (r) out.push({ role, rep: r });
  };
  push('Governor', c.governor);
  push('Deputy Governor', c.deputyGovernor);
  push('Senator', c.senator);
  push('Woman Representative', c.womanRep);
  push('Assembly Speaker', c.assemblySpeaker);
  push('Deputy Speaker', c.deputySpeaker);
  push('County Secretary', c.countySecretary);
  push('County Attorney', c.countyAttorney);
  for (const mp of c.constituencyMPs || []) push('Member of Parliament', mp);
  for (const mca of c.electedMCAs || []) push('MCA', mca);
  for (const cecm of c.cecms || []) push('CECM', cecm);
  return out;
}

function buildOversight(countyName: string): CountyOversightSnapshot {
  const eacc: CountyOversightSnapshot['eacc'] = { notes: [] };

  const bribe = eaccNecs.highestAverageBribeCounties.find((c) => c.countyName === countyName);
  if (bribe) {
    eacc.avgBribeKes = bribe.avgBribeKes;
    eacc.avgBribeRank = bribe.rank;
    eacc.notes.push(`EACC NECS 2024: average reported bribe Kshs ${bribe.avgBribeKes.toLocaleString()} (rank #${bribe.rank} among published high-average list).`);
  }
  const prev = eaccNecs.highestBriberyPrevalence.find(
    (c) => c.countyName === countyName || c.countyName.replace('-', ' ') === countyName,
  );
  if (prev) {
    eacc.prevalencePct = prev.prevalencePct;
    eacc.notes.push(`EACC NECS 2024: high bribery prevalence (${prev.prevalencePct}% of those who encountered bribery reported paying).`);
  }
  const low = eaccNecs.lowestBriberyIncidenceIndex.find((c) => c.countyName === countyName);
  if (low) {
    eacc.incidenceIndex = low.incidenceIndex;
    eacc.notes.push(`EACC NECS 2024: relatively low bribery incidence index (${low.incidenceIndex}).${low.note ? ' ' + low.note : ''}`);
  }
  const high = eaccNecs.highIncidenceExamples.find((c) => c.countyName === countyName);
  if (high) {
    eacc.incidenceIndex = high.incidenceIndex;
    eacc.notes.push(`EACC NECS 2024: elevated bribery incidence index (${high.incidenceIndex}).`);
  }

  let budgetTransparency: CountyOversightSnapshot['budgetTransparency'] = {
    source: cbts2025.meta.source,
    tier: 'unknown',
  };
  const top = cbts2025.topCounties.find((c) => c.countyName === countyName);
  const lowT = cbts2025.lowestPublished.find((c) => c.countyName === countyName);
  if (top) {
    budgetTransparency = { score: top.score, tier: 'top', source: cbts2025.meta.source };
  } else if (lowT) {
    budgetTransparency = { score: lowT.score, tier: 'low', source: cbts2025.meta.source };
  }

  return {
    eacc: eacc.notes.length ? eacc : undefined,
    budgetTransparency,
    sources: sourceRegistry.sources,
  };
}

export function findCountyByName(name: string): CountyData | null {
  const decoded = decodeURIComponent(name).replace(/\+/g, ' ').trim();
  const counties = buildAllCountyData();
  const lower = decoded.toLowerCase();
  return (
    counties.find((c) => c.name.toLowerCase() === lower) ||
    counties.find((c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())) ||
    null
  );
}

export function buildCountyProfile(name: string): CountyProfile | null {
  const county = findCountyByName(name);
  if (!county) return null;

  const history = ALL_COUNTY_FINANCE.filter((r) => r.countyName === county.name);

  const latest =
    history.find((r) => r.fiscalYear === '2023/24') ||
    history[0] ||
    ALL_COUNTY_FINANCE.find((r) => r.countyName === county.name);

  const series = getEquitableShareSeries();
  const nationalEquitableShareLatest = series[series.length - 1];

  return {
    county,
    demographics: getCountyDemographics(county.name),
    leaders: collectLeaders(county),
    finance: {
      latest,
      history,
      nationalEquitableShareLatest,
    },
    oversight: buildOversight(county.name),
    links: {
      financeDrilldown: `/finance-audit/county/${encodeURIComponent(county.name)}`,
      representatives: `/representatives?county=${encodeURIComponent(county.name)}`,
      compare: `/compare?counties=${encodeURIComponent(county.name)}`,
      cobHub: 'https://cob.go.ke/publications/consolidated-county-budget-implementation-review-reports/',
      oagHub: 'https://www.oagkenya.go.ke/',
      eaccHub: 'https://eacc.go.ke/',
      tiHub: 'https://tikenya.org/',
    },
  };
}

export function listAllCountyNames(): string[] {
  return buildAllCountyData().map((c) => c.name);
}

export { sourceRegistry, eaccNecs, cbts2025 };
