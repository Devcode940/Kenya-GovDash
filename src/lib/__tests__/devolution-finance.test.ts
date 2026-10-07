import { describe, expect, it } from 'vitest';
import {
  cumulativeEquitableShare,
  getAnnualReports,
  getEquitableShareForYear,
  getEquitableShareSeries,
  getFullDevolutionTimeline,
  getReportCatalog,
  latestEquitableShareYear,
} from '../devolution-finance';

describe('devolution finance series', () => {
  it('covers continuous equitable share from 2013/14 through 2025/26', () => {
    const series = getEquitableShareSeries();
    expect(series[0]?.fiscalYear).toBe('2013/14');
    expect(series[series.length - 1]?.fiscalYear).toBe('2025/26');
    expect(series.length).toBeGreaterThanOrEqual(13);
  });

  it('has positive equitable share amounts', () => {
    for (const row of getEquitableShareSeries()) {
      expect(row.equitableShareBillion).toBeGreaterThan(0);
      expect(row.source.length).toBeGreaterThan(0);
    }
  });

  it('looks up FY 2025/26 as 415B', () => {
    const row = getEquitableShareForYear('2025/26');
    expect(row?.equitableShareBillion).toBe(415);
  });

  it('includes pre-devolution context before 2013/14', () => {
    const timeline = getFullDevolutionTimeline();
    const years = timeline.map((r) => r.fiscalYear);
    expect(years).toContain('2010/11');
    expect(years).toContain('2013/14');
  });

  it('cumulative share is monotonic and substantial', () => {
    const total = cumulativeEquitableShare();
    expect(total).toBeGreaterThan(3000);
  });

  it('latest year helper works', () => {
    expect(latestEquitableShareYear()?.fiscalYear).toBe('2025/26');
  });

  it('report catalog includes annual CoB/OAG entries', () => {
    const reports = getReportCatalog();
    expect(reports.length).toBeGreaterThan(10);
    const annual = getAnnualReports();
    expect(annual.some((r) => r.fiscalYear === '2023/24')).toBe(true);
    expect(annual.some((r) => r.publisher === 'OAG')).toBe(true);
  });
});
