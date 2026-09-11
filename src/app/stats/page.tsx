// Public Stats + Trends page — platform transparency dashboard

import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { buildAllCountyData, ALL_GOVERNORS } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE, NATIONAL_FINANCE, getAggregateStats } from '@/lib/finance-audit-data';
import { ChevronLeft, BarChart3, Users, TrendingUp, MapPin, FileText, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Stats & Trends — Kenya GovDash',
  description: 'Transparency dashboard showing platform usage, data coverage, and civic engagement metrics.',
};

export const dynamic = 'force-dynamic';

async function getStats() {
  const counties = buildAllCountyData();
  const stats = getAggregateStats('2023/24');

  // Count reps
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

  // DB counts
  let feedbackCount = 0;
  let resourceCount = 0;
  let ingestedReportCount = 0;
  let alertSubscriptionCount = 0;
  let whistleblowerCount = 0;
  let cecmVerifiedCount = 0;

  try { feedbackCount = await db.feedback.count(); } catch {}
  try { resourceCount = await db.resource.count({ where: { published: true } }); } catch {}
  try { ingestedReportCount = await (db as any).ingestedReport.count({ where: { published: true } }); } catch {}
  try { alertSubscriptionCount = await (db as any).financeAlertSubscription.count({ where: { active: true } }); } catch {}
  try { whistleblowerCount = await (db as any).whistleblowerSubmission.count(); } catch {}
  try { cecmVerifiedCount = await db.cecmVerification.count(); } catch {}

  return {
    counties: {
      total: counties.length,
      withCecms: counties.filter(c => c.cecms && c.cecms.length > 0).length,
      withMPs: counties.filter(c => c.constituencyMPs && c.constituencyMPs.length > 0).length,
    },
    representatives: {
      total: totalReps,
      governors: ALL_GOVERNORS.length,
      senators: counties.filter(c => c.senator).length,
      womenReps: counties.filter(c => c.womanRep).length,
      mps: totalMps,
      cecms: totalCecms,
      cecmsVerified: cecmVerifiedCount,
      cecmsVerificationPct: totalCecms > 0 ? Math.round((cecmVerifiedCount / totalCecms) * 100) : 0,
    },
    finance: {
      countyRecords: ALL_COUNTY_FINANCE.filter(r => r.fiscalYear === '2023/24').length,
      nationalRecords: NATIONAL_FINANCE.length,
      totalApprovedBudget: stats.totalApprovedBudget,
      totalPendingBills: stats.totalPendingBills,
      avgAbsorption: stats.avgOverallAbsorption,
      auditOpinions: stats.auditOpinionCounts,
    },
    platform: {
      feedback: feedbackCount,
      resources: resourceCount,
      ingestedReports: ingestedReportCount,
      alertSubscriptions: alertSubscriptionCount,
      whistleblowerReports: whistleblowerCount,
    },
  };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back to dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">Platform Stats</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6 pb-20 md:pb-6">
        {/* Counties */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Counties</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Total Counties</div>
              <div className="text-2xl font-bold">{stats.counties.total}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">With CECM Data</div>
              <div className="text-2xl font-bold">{stats.counties.withCecms}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">With MP Lists</div>
              <div className="text-2xl font-bold">{stats.counties.withMPs}</div>
            </CardContent></Card>
          </div>
        </section>

        {/* Representatives */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Representatives</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Total Reps</div>
              <div className="text-2xl font-bold">{stats.representatives.total.toLocaleString()}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Governors</div>
              <div className="text-2xl font-bold">{stats.representatives.governors}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Senators</div>
              <div className="text-2xl font-bold">{stats.representatives.senators}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Women Reps</div>
              <div className="text-2xl font-bold">{stats.representatives.womenReps}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">MPs</div>
              <div className="text-2xl font-bold">{stats.representatives.mps}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">CECMs</div>
              <div className="text-2xl font-bold">{stats.representatives.cecms}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">CECMs Verified</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.representatives.cecmsVerified}</div>
              <div className="text-xs text-muted-foreground">{stats.representatives.cecmsVerificationPct}% verified</div>
            </CardContent></Card>
          </div>
        </section>

        {/* Finance data coverage */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Finance Data Coverage</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">County Records</div>
              <div className="text-2xl font-bold">{stats.finance.countyRecords}</div>
              <div className="text-xs text-muted-foreground">FY 2023/24</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">National Records</div>
              <div className="text-2xl font-bold">{stats.finance.nationalRecords}</div>
              <div className="text-xs text-muted-foreground">3 years</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Total Budget Tracked</div>
              <div className="text-xl font-bold">Kshs {(stats.finance.totalApprovedBudget / 1000).toFixed(1)}B</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Total Pending Bills</div>
              <div className="text-xl font-bold text-rose-600">Kshs {(stats.finance.totalPendingBills / 1000).toFixed(1)}B</div>
            </CardContent></Card>
          </div>

          {/* Audit opinion distribution */}
          <Card className="mt-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Audit Opinion Distribution (FY 2023/24)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.finance.auditOpinions).map(([opinion, count]) => {
                  const pct = stats.finance.countyRecords > 0 ? ((count as number) / stats.finance.countyRecords) * 100 : 0;
                  const color = opinion === 'Unmodified' ? 'bg-emerald-500'
                    : opinion === 'Qualified' ? 'bg-amber-500'
                    : opinion === 'Adverse' ? 'bg-rose-500'
                    : 'bg-purple-500';
                  return (
                    <div key={opinion} className="flex items-center gap-3">
                      <div className="w-28 text-sm">{opinion}</div>
                      <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${color} flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 5)}%` }}>
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      </div>
                      <div className="w-12 text-right text-xs text-muted-foreground">{pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Platform engagement */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Platform Engagement</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Card><CardContent className="p-4">
              <FileText className="h-5 w-5 text-blue-600 mb-1" />
              <div className="text-2xl font-bold">{stats.platform.feedback}</div>
              <div className="text-xs uppercase text-muted-foreground">Feedback</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <FileText className="h-5 w-5 text-emerald-600 mb-1" />
              <div className="text-2xl font-bold">{stats.platform.resources}</div>
              <div className="text-xs uppercase text-muted-foreground">Resources</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <FileText className="h-5 w-5 text-amber-600 mb-1" />
              <div className="text-2xl font-bold">{stats.platform.ingestedReports}</div>
              <div className="text-xs uppercase text-muted-foreground">PDF Reports</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <Bell className="h-5 w-5 text-rose-600 mb-1" />
              <div className="text-2xl font-bold">{stats.platform.alertSubscriptions}</div>
              <div className="text-xs uppercase text-muted-foreground">Alert Subs</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <ShieldAlert className="h-5 w-5 text-purple-600 mb-1" />
              <div className="text-2xl font-bold">{stats.platform.whistleblowerReports}</div>
              <div className="text-xs uppercase text-muted-foreground">Whistleblower</div>
            </CardContent></Card>
          </div>
        </section>

        {/* API access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Programmatic Access</CardTitle>
            <CardDescription>Access all platform data via public APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div><code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/stats</code> — this page&apos;s data as JSON</div>
              <div><code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/finance-audit</code> — finance + audit data (JSON/CSV)</div>
              <div><code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/search?q=...</code> — site-wide search</div>
              <div><code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/admin/cecm-verify</code> — CECM verification stats</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
