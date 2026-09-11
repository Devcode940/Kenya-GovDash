import { NextRequest, NextResponse } from 'next/server';
import { buildAllCountyData } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE, NATIONAL_FINANCE } from '@/lib/finance-audit-data';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/search?q=...
// Searches across: counties, representatives, finance data, feedback, ingested reports
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const results = {
    counties: [] as any[],
    representatives: [] as any[],
    finance: [] as any[],
    feedback: [] as any[],
    reports: [] as any[],
    national: [] as any[],
  };

  // 1. Search counties
  const counties = buildAllCountyData();
  for (const c of counties) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.governor?.fullName.toLowerCase().includes(q) ||
      c.senator?.fullName.toLowerCase().includes(q)
    ) {
      results.counties.push({
        type: 'county',
        title: `${c.name} County`,
        subtitle: `Region: ${c.region} · Governor: ${c.governor?.fullName || 'N/A'}`,
        url: `/county/${encodeURIComponent(c.name)}`,
        score: c.name.toLowerCase() === q ? 100 : c.name.toLowerCase().includes(q) ? 80 : 50,
      });
    }
  }

  // 2. Search representatives
  for (const c of counties) {
    const checkRep = (r: any, repType: string) => {
      if (!r) return;
      if (
        r.fullName?.toLowerCase().includes(q) ||
        r.party?.toLowerCase().includes(q) ||
        r.officialTitle?.toLowerCase().includes(q)
      ) {
        results.representatives.push({
          type: 'representative',
          title: r.fullName,
          subtitle: `${repType} · ${c.name} County · ${r.party || 'N/A'}`,
          url: `/representative/${encodeURIComponent(r.id)}`,
          countyName: c.name,
          repType,
          score: r.fullName?.toLowerCase() === q ? 100 : r.fullName?.toLowerCase().includes(q) ? 80 : 50,
        });
      }
    };
    checkRep(c.governor, 'Governor');
    checkRep(c.deputyGovernor, 'Deputy Governor');
    checkRep(c.senator, 'Senator');
    checkRep(c.womanRep, 'Woman Rep');
    checkRep(c.assemblySpeaker, 'Speaker');
    checkRep(c.countySecretary, 'County Secretary');
    if (c.constituencyMPs) c.constituencyMPs.forEach(mp => checkRep(mp, 'MP'));
    if (c.cecms) c.cecms.forEach(cecm => checkRep(cecm, 'CECM'));
  }

  // 3. Search finance data
  for (const r of ALL_COUNTY_FINANCE) {
    if (r.countyName.toLowerCase().includes(q)) {
      results.finance.push({
        type: 'finance',
        title: `${r.countyName} County — FY ${r.fiscalYear}`,
        subtitle: `Budget: Kshs ${r.approvedBudget}M · Absorption: ${r.overallAbsorption}% · Audit: ${r.auditOpinion}`,
        url: `/finance-audit/county/${encodeURIComponent(r.countyName)}`,
        score: 70,
      });
    }
  }

  // 4. Search national finance
  for (const n of NATIONAL_FINANCE) {
    if (q.includes('national') || q.includes('kenya') || q.includes(n.fiscalYear)) {
      results.national.push({
        type: 'national',
        title: `National Government — FY ${n.fiscalYear}`,
        subtitle: `Budget: Kshs ${(n.approvedBudget! / 1_000_000).toFixed(2)}T · Audit: ${n.auditOpinion}`,
        url: '/finance-audit',
        score: 60,
      });
    }
  }

  // 5. Search feedback (DB)
  try {
    const feedback = await db.feedback.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { countyName: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, status: true, countyName: true, createdAt: true },
    });
    for (const f of feedback) {
      results.feedback.push({
        type: 'feedback',
        title: f.title,
        subtitle: `${f.category} · ${f.status}${f.countyName ? ' · ' + f.countyName : ''}`,
        url: `/feedback/${f.id}`,
        score: 60,
      });
    }
  } catch {
    // DB may not be available
  }

  // 6. Search ingested reports (DB) — only if model exists
  try {
    const reports = await (db as any).ingestedReport.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { countyName: { contains: q } },
          { source: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, source: true, fiscalYear: true, countyName: true },
    });
    for (const r of reports) {
      results.reports.push({
        type: 'report',
        title: r.title,
        subtitle: `${r.source}${r.fiscalYear ? ' · FY ' + r.fiscalYear : ''}${r.countyName ? ' · ' + r.countyName : ''}`,
        url: `/finance-audit`,
        score: 50,
      });
    }
  } catch {
    // Model may not exist in base schema
  }

  // Sort each category by score
  for (const key of Object.keys(results) as Array<keyof typeof results>) {
    (results[key] as any[]).sort((a, b) => b.score - a.score);
    (results[key] as any[]) = (results[key] as any[]).slice(0, limit);
  }

  const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return NextResponse.json({
    query: q,
    totalResults: totalCount,
    results,
  });
}
