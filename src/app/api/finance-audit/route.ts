import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  NATIONAL_FINANCE,
  COUNTY_FINANCE,
  getAggregateStats,
  type CountyFinanceRecord,
  type AuditOpinionType,
} from '@/lib/finance-audit-data';

export const dynamic = 'force-dynamic';

// Merge static curated data with DB-published snapshots.
// DB snapshots override static data on the same [fiscalYear + countyName + source] key.
function mergeWithDbSnapshots(
  staticNational: typeof NATIONAL_FINANCE,
  staticCounties: CountyFinanceRecord[],
  dbSnapshots: any[],
) {
  // Index DB snapshots by composite key for O(1) lookup
  const dbMap = new Map<string, any>();
  for (const s of dbSnapshots) {
    const key = `${s.fiscalYear}|${s.level}|${s.countyName || ''}|${s.source}`;
    dbMap.set(key, s);
  }

  // Merge national
  const national = staticNational.map(n => {
    const key = `${n.fiscalYear}|national||${n.source}`;
    const dbRec = dbMap.get(key);
    if (!dbRec) return n;
    dbMap.delete(key); // mark as consumed
    return {
      ...n,
      ...overrideFromDb(dbRec, n),
    };
  });
  // Add DB-only national snapshots
  for (const s of dbMap.values()) {
    if (s.level === 'national') {
      national.push(dbToFinanceData(s));
    }
  }

  // Merge counties
  const counties = staticCounties.map(c => {
    const key = `${c.fiscalYear}|county|${c.countyName}|${c.source}`;
    const dbRec = dbMap.get(key);
    if (!dbRec) return c;
    dbMap.delete(key);
    return {
      ...c,
      ...overrideCountyFromDb(dbRec, c),
    };
  });
  // Add DB-only county snapshots
  for (const s of dbMap.values()) {
    if (s.level === 'county' && s.countyName) {
      counties.push(dbToCountyRecord(s));
    }
  }

  return { national, counties };
}

function overrideFromDb(dbRec: any, staticRec: any) {
  return {
    approvedBudget: dbRec.approvedBudget ?? staticRec.approvedBudget,
    supplementaryBudget: dbRec.supplementaryBudget ?? staticRec.supplementaryBudget,
    actualExpenditure: dbRec.actualExpenditure ?? staticRec.actualExpenditure,
    recurrentExpenditure: dbRec.recurrentExpenditure ?? staticRec.recurrentExpenditure,
    developmentExpenditure: dbRec.developmentExpenditure ?? staticRec.developmentExpenditure,
    equitableShare: dbRec.equitableShare ?? staticRec.equitableShare,
    ownSourceRevenue: dbRec.ownSourceRevenue ?? staticRec.ownSourceRevenue,
    osrTarget: dbRec.osrTarget ?? staticRec.osrTarget,
    overallAbsorption: dbRec.overallAbsorption ?? staticRec.overallAbsorption,
    recurrentAbsorption: dbRec.recurrentAbsorption ?? staticRec.recurrentAbsorption,
    developmentAbsorption: dbRec.developmentAbsorption ?? staticRec.developmentAbsorption,
    auditOpinion: dbRec.auditOpinion ?? staticRec.auditOpinion,
    pendingBills: dbRec.pendingBills ?? staticRec.pendingBills,
    totalDebt: dbRec.totalDebt ?? staticRec.totalDebt,
    complianceScore: dbRec.complianceScore ?? staticRec.complianceScore,
    notes: dbRec.notes ?? staticRec.notes,
  };
}

function overrideCountyFromDb(dbRec: any, staticRec: CountyFinanceRecord): Partial<CountyFinanceRecord> {
  return {
    approvedBudget: dbRec.approvedBudget ?? staticRec.approvedBudget,
    actualExpenditure: dbRec.actualExpenditure ?? staticRec.actualExpenditure,
    recurrentExpenditure: dbRec.recurrentExpenditure ?? staticRec.recurrentExpenditure,
    developmentExpenditure: dbRec.developmentExpenditure ?? staticRec.developmentExpenditure,
    equitableShare: dbRec.equitableShare ?? staticRec.equitableShare,
    ownSourceRevenue: dbRec.ownSourceRevenue ?? staticRec.ownSourceRevenue,
    osrTarget: dbRec.osrTarget ?? staticRec.osrTarget,
    overallAbsorption: dbRec.overallAbsorption ?? staticRec.overallAbsorption,
    recurrentAbsorption: dbRec.recurrentAbsorption ?? staticRec.recurrentAbsorption,
    developmentAbsorption: dbRec.developmentAbsorption ?? staticRec.developmentAbsorption,
    auditOpinion: (dbRec.auditOpinion as AuditOpinionType) ?? staticRec.auditOpinion,
    pendingBills: dbRec.pendingBills ?? staticRec.pendingBills,
    complianceScore: dbRec.complianceScore ?? staticRec.complianceScore,
    notes: dbRec.notes ?? staticRec.notes,
  };
}

function dbToFinanceData(s: any) {
  return {
    fiscalYear: s.fiscalYear,
    level: 'national' as const,
    source: s.source,
    approvedBudget: s.approvedBudget ?? undefined,
    supplementaryBudget: s.supplementaryBudget ?? undefined,
    actualExpenditure: s.actualExpenditure ?? undefined,
    recurrentExpenditure: s.recurrentExpenditure ?? undefined,
    developmentExpenditure: s.developmentExpenditure ?? undefined,
    equitableShare: s.equitableShare ?? undefined,
    ownSourceRevenue: s.ownSourceRevenue ?? undefined,
    osrTarget: s.osrTarget ?? undefined,
    overallAbsorption: s.overallAbsorption ?? undefined,
    recurrentAbsorption: s.recurrentAbsorption ?? undefined,
    developmentAbsorption: s.developmentAbsorption ?? undefined,
    auditOpinion: s.auditOpinion ?? undefined,
    auditSource: s.auditSource ?? undefined,
    auditUrl: s.auditUrl ?? undefined,
    pendingBills: s.pendingBills ?? undefined,
    totalDebt: s.totalDebt ?? undefined,
    complianceScore: s.complianceScore ?? undefined,
    notes: s.notes ?? undefined,
    sourceUrl: s.sourceUrl ?? undefined,
  };
}

function dbToCountyRecord(s: any): CountyFinanceRecord {
  return {
    countyName: s.countyName,
    fiscalYear: s.fiscalYear,
    approvedBudget: s.approvedBudget ?? 0,
    equitableShare: s.equitableShare ?? 0,
    osrTarget: s.osrTarget ?? 0,
    ownSourceRevenue: s.ownSourceRevenue ?? undefined,
    actualExpenditure: s.actualExpenditure ?? undefined,
    recurrentExpenditure: s.recurrentExpenditure ?? undefined,
    developmentExpenditure: s.developmentExpenditure ?? undefined,
    overallAbsorption: s.overallAbsorption ?? undefined,
    recurrentAbsorption: s.recurrentAbsorption ?? undefined,
    developmentAbsorption: s.developmentAbsorption ?? undefined,
    auditOpinion: (s.auditOpinion as AuditOpinionType) ?? 'Not Audited',
    pendingBills: s.pendingBills ?? undefined,
    complianceScore: s.complianceScore ?? undefined,
    notes: s.notes ?? undefined,
    source: s.source,
  };
}

// GET /api/finance-audit — public finance + audit data
// Merges curated static data with published DB snapshots (DB overrides static).
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const level = searchParams.get('level') || 'all';
  const county = searchParams.get('county');
  const fy = searchParams.get('fy') || '2023/24';
  const format = searchParams.get('format') || 'json';

  // Fetch published DB snapshots
  let dbSnapshots: any[] = [];
  try {
    dbSnapshots = await db.financeAuditSnapshot.findMany({
      where: { published: true },
    });
  } catch {
    // DB may not be initialized — fall back to static only
  }

  // Filter static data
  const staticNational = NATIONAL_FINANCE.filter(n => !fy || n.fiscalYear === fy);
  const staticCounties = COUNTY_FINANCE.filter(c => {
    if (fy && c.fiscalYear !== fy) return false;
    if (county && c.countyName.toLowerCase() !== county.toLowerCase()) return false;
    return true;
  });

  // Merge with DB
  const { national: mergedNational, counties: mergedCounties } = mergeWithDbSnapshots(
    staticNational,
    staticCounties,
    dbSnapshots,
  );

  // Apply level + county filters to merged results
  const national = level === 'all' || level === 'national' ? mergedNational : [];
  const counties = (level === 'all' || level === 'county')
    ? mergedCounties.filter(c => !county || c.countyName.toLowerCase() === county.toLowerCase())
    : [];
  const aggregate = getAggregateStats(fy);

  if (format === 'csv') {
    const headers = [
      'fiscal_year', 'level', 'county', 'source',
      'approved_budget_m', 'actual_expenditure_m', 'recurrent_expenditure_m', 'development_expenditure_m',
      'equitable_share_m', 'own_source_revenue_m', 'osr_target_m',
      'overall_absorption_pct', 'recurrent_absorption_pct', 'development_absorption_pct',
      'audit_opinion', 'pending_bills_m', 'total_debt_m', 'compliance_score',
    ];
    const rows: string[] = [];

    for (const n of national) {
      rows.push([
        n.fiscalYear, 'national', '', n.source,
        n.approvedBudget ?? '', n.actualExpenditure ?? '', n.recurrentExpenditure ?? '', n.developmentExpenditure ?? '',
        n.equitableShare ?? '', n.ownSourceRevenue ?? '', n.osrTarget ?? '',
        n.overallAbsorption ?? '', n.recurrentAbsorption ?? '', n.developmentAbsorption ?? '',
        n.auditOpinion ?? '', n.pendingBills ?? '', n.totalDebt ?? '', n.complianceScore ?? '',
      ].join(','));
    }
    for (const c of counties) {
      rows.push([
        c.fiscalYear, 'county', `"${c.countyName}"`, `"${c.source}"`,
        c.approvedBudget, c.actualExpenditure ?? '', c.recurrentExpenditure ?? '', c.developmentExpenditure ?? '',
        c.equitableShare, c.ownSourceRevenue ?? '', c.osrTarget,
        c.overallAbsorption ?? '', c.recurrentAbsorption ?? '', c.developmentAbsorption ?? '',
        c.auditOpinion, c.pendingBills ?? '', '', c.complianceScore ?? '',
      ].join(','));
    }
    return new Response([headers.join(','), ...rows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kenya-finance-audit-${fy}.csv"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return NextResponse.json({
    schema: 'kenya-finance-audit-v1',
    fiscalYear: fy,
    generatedAt: new Date().toISOString(),
    sources: ['OAG', 'CoB', 'CoG', 'KNBS'],
    license: 'CC-BY-4.0',
    dataSource: dbSnapshots.length > 0 ? 'merged (static + DB)' : 'static-curated',
    dbSnapshotCount: dbSnapshots.length,
    national,
    counties,
    aggregate: level === 'all' ? aggregate : undefined,
  }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
