import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildAllCountyData, ALL_GOVERNORS } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE, NATIONAL_FINANCE } from '@/lib/finance-audit-data';

export const dynamic = 'force-dynamic';

// GET /api/stats — public platform stats for transparency
export async function GET() {
  const counties = buildAllCountyData();

  // Count representatives by type
  let totalReps = 0;
  let totalCecms = 0;
  let totalMps = 0;
  for (const c of counties) {
    if (c.governor) totalReps++;
    if (c.deputyGovernor) totalReps++;
    if (c.senator) totalReps++;
    if (c.womanRep) totalReps++;
    if (c.constituencyMPs) { totalReps += c.constituencyMPs.length; totalMps += c.constituencyMPs.length; }
    if (c.cecms) { totalReps += c.cecms.length; totalCecms += c.cecms.length; }
    if (c.assemblySpeaker) totalReps++;
    if (c.countySecretary) totalReps++;
  }

  // DB stats (try/catch in case DB not initialized)
  let feedbackCount = 0;
  let resourceCount = 0;
  let ingestedReportCount = 0;
  let alertSubscriptionCount = 0;
  let whistleblowerCount = 0;
  let cecmVerifiedCount = 0;
  let cecmTotalCount = totalCecms;

  try {
    feedbackCount = await db.feedback.count();
  } catch {}
  try {
    resourceCount = await db.resource.count({ where: { published: true } });
  } catch {}
  try {
    ingestedReportCount = await (db as any).ingestedReport.count({ where: { published: true } });
  } catch {}
  try {
    alertSubscriptionCount = await (db as any).financeAlertSubscription.count({ where: { active: true } });
  } catch {}
  try {
    whistleblowerCount = await (db as any).whistleblowerSubmission.count();
  } catch {}
  try {
    cecmVerifiedCount = await db.cecmVerification.count();
  } catch {}

  // Finance stats
  const countyFinanceCount = ALL_COUNTY_FINANCE.filter(r => r.fiscalYear === '2023/24').length;
  const nationalFinanceCount = NATIONAL_FINANCE.length;

  // Audit opinion distribution
  const auditOpinions = ALL_COUNTY_FINANCE
    .filter(r => r.fiscalYear === '2023/24')
    .reduce((acc, r) => {
      acc[r.auditOpinion] = (acc[r.auditOpinion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    data: {
      counties: {
        total: counties.length,
        withCecms: counties.filter(c => c.cecms && c.cecms.length > 0).length,
        withConstituencyMPs: counties.filter(c => c.constituencyMPs && c.constituencyMPs.length > 0).length,
      },
      representatives: {
        total: totalReps,
        governors: ALL_GOVERNORS.length,
        senators: counties.filter(c => c.senator).length,
        womenReps: counties.filter(c => c.womanRep).length,
        mps: totalMps,
        cecms: totalCecms,
        cecmsVerified: cecmVerifiedCount,
        cecmsVerificationPct: cecmTotalCount > 0 ? Math.round((cecmVerifiedCount / cecmTotalCount) * 100) : 0,
      },
      finance: {
        countyRecords: countyFinanceCount,
        nationalRecords: nationalFinanceCount,
        auditOpinionDistribution: auditOpinions,
      },
      platform: {
        feedback: feedbackCount,
        resources: resourceCount,
        ingestedReports: ingestedReportCount,
        alertSubscriptions: alertSubscriptionCount,
        whistleblowerReports: whistleblowerCount,
      },
    },
  });
}
