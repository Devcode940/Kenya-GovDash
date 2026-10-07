/**
 * Devolution finance accessors — national equitable share series + CoB/OAG report catalog.
 * Data lives in data/devolution-finance/*.json (versioned, source-cited).
 *
 * Scope note: County governments started FY 2013/14. Requests for "2010–present"
 * include pre-devolution context rows marked dataAvailable=false where applicable.
 */

import nationalSeries from '../../data/devolution-finance/national-series.json';
import reportCatalog from '../../data/devolution-finance/report-catalog.json';

export interface EquitableShareYear {
  fiscalYear: string;
  equitableShareBillion: number;
  source: string;
  sourceUrl?: string;
  notes?: string;
  confidence?: string;
}

export interface PreDevolutionRow {
  fiscalYear: string;
  level: string;
  equitableShareBillion?: number;
  note: string;
  source?: string;
  dataAvailable: boolean;
}

export interface DevolutionReport {
  fiscalYear: string;
  period: string;
  title: string;
  publisher: string;
  hub?: string;
  url?: string;
  status: string;
  notes?: string;
}

export const DEVOLUTION_META = nationalSeries.meta;
export const REPORT_CATALOG_META = reportCatalog.meta;

export function getEquitableShareSeries(): EquitableShareYear[] {
  return nationalSeries.countyEquitableShareSeries as EquitableShareYear[];
}

export function getEquitableShareForYear(fy: string): EquitableShareYear | undefined {
  return getEquitableShareSeries().find((r) => r.fiscalYear === fy);
}

export function getPreDevolutionContext(): PreDevolutionRow[] {
  return nationalSeries.preDevolutionContext as PreDevolutionRow[];
}

/** Full timeline: pre-devolution context + equitable share series (2010/11 → latest). */
export function getFullDevolutionTimeline(): Array<
  | (PreDevolutionRow & { kind: 'context' })
  | (EquitableShareYear & { kind: 'equitable-share'; dataAvailable: true })
> {
  const context = getPreDevolutionContext().map((r) => ({ ...r, kind: 'context' as const }));
  const series = getEquitableShareSeries().map((r) => ({
    ...r,
    kind: 'equitable-share' as const,
    dataAvailable: true as const,
  }));
  return [...context, ...series];
}

export function getAggregateCountyBudgetTrends() {
  return nationalSeries.aggregateCountyBudgetTrends;
}

export function getReportCatalog(): DevolutionReport[] {
  return reportCatalog.reports as DevolutionReport[];
}

export function getReportsForYear(fy: string): DevolutionReport[] {
  return getReportCatalog().filter((r) => r.fiscalYear === fy);
}

export function getAnnualReports(): DevolutionReport[] {
  return getReportCatalog().filter(
    (r) => r.period === 'annual' || r.period === 'annual-audit-summary',
  );
}

/** Cumulative equitable share (Kshs billions) from first full devolution year through `throughFy` inclusive. */
export function cumulativeEquitableShare(throughFy?: string): number {
  const series = getEquitableShareSeries();
  const slice = throughFy
    ? series.filter((r) => r.fiscalYear <= throughFy)
    : series;
  return slice.reduce((sum, r) => sum + r.equitableShareBillion, 0);
}

export function latestEquitableShareYear(): EquitableShareYear | undefined {
  const series = getEquitableShareSeries();
  return series[series.length - 1];
}

export const COB_COUNTY_BIRR_HUB =
  'https://cob.go.ke/publications/consolidated-county-budget-implementation-review-reports/';
export const COB_NATIONAL_BIRR_HUB =
  'https://cob.go.ke/publications/national-government-budget-implementation-review-reports/';
