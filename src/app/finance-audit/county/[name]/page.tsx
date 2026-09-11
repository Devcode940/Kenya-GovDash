// Per-county finance drill-down page — detailed view of one county's
// finance + audit data across all fiscal years, with forecast.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ALL_COUNTY_FINANCE,
  getCountyTimeSeries,
  getCountiesWithFinanceData,
  getAuditOpinionColor,
  getAuditOpinionTextColor,
  formatKshs,
  type CountyFinanceRecord,
} from '@/lib/finance-audit-data';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CountyFinanceDetail } from '@/components/kenya/CountyFinanceDetail';
import { ChevronLeft, MapPin, TrendingUp, AlertTriangle, Award, FileText, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ name: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return getCountiesWithFinanceData().map(name => ({ name: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  return {
    title: `${decodedName} County Finance — Kenya GovDash`,
    description: `Detailed finance, budget, audit, and pending bills data for ${decodedName} County across multiple fiscal years.`,
  };
}

async function getCounty(name: string) {
  return getCountiesWithFinanceData().find(c => c.toLowerCase() === name.toLowerCase()) || null;
}

export default async function CountyFinancePage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const countyName = await getCounty(decodedName);
  if (!countyName) notFound();

  // Get static time-series data
  const timeSeries = getCountyTimeSeries(countyName);
  if (timeSeries.length === 0) notFound();

  // Fetch DB snapshots for this county (published)
  let dbSnapshots: any[] = [];
  try {
    dbSnapshots = await db.financeAuditSnapshot.findMany({
      where: { published: true, level: 'county', countyName },
      orderBy: { fiscalYear: 'asc' },
    });
  } catch {
    // DB may not be initialized
  }

  // Merge DB snapshots with static (DB overrides on same FY+source)
  const mergedMap = new Map<string, CountyFinanceRecord>();
  for (const r of timeSeries) {
    mergedMap.set(`${r.fiscalYear}|${r.source}`, { ...r });
  }
  for (const s of dbSnapshots) {
    const key = `${s.fiscalYear}|${s.source}`;
    const existing = mergedMap.get(key);
    if (existing) {
      mergedMap.set(key, {
        ...existing,
        approvedBudget: s.approvedBudget ?? existing.approvedBudget,
        actualExpenditure: s.actualExpenditure ?? existing.actualExpenditure,
        recurrentExpenditure: s.recurrentExpenditure ?? existing.recurrentExpenditure,
        developmentExpenditure: s.developmentExpenditure ?? existing.developmentExpenditure,
        equitableShare: s.equitableShare ?? existing.equitableShare,
        ownSourceRevenue: s.ownSourceRevenue ?? existing.ownSourceRevenue,
        osrTarget: s.osrTarget ?? existing.osrTarget,
        overallAbsorption: s.overallAbsorption ?? existing.overallAbsorption,
        recurrentAbsorption: s.recurrentAbsorption ?? existing.recurrentAbsorption,
        developmentAbsorption: s.developmentAbsorption ?? existing.developmentAbsorption,
        auditOpinion: (s.auditOpinion as any) ?? existing.auditOpinion,
        pendingBills: s.pendingBills ?? existing.pendingBills,
        complianceScore: s.complianceScore ?? existing.complianceScore,
        notes: s.notes ?? existing.notes,
      });
    } else {
      // DB-only snapshot
      mergedMap.set(key, {
        countyName,
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
        auditOpinion: (s.auditOpinion as any) ?? 'Not Audited',
        pendingBills: s.pendingBills ?? undefined,
        complianceScore: s.complianceScore ?? undefined,
        notes: s.notes ?? undefined,
        source: s.source,
      });
    }
  }
  const mergedSeries = Array.from(mergedMap.values()).sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));

  // Latest year record
  const latest = mergedSeries[mergedSeries.length - 1];
  const previous = mergedSeries[mergedSeries.length - 2];

  // Calculate YoY changes
  const yoyChanges: Record<string, { value: number; pct: number } | null> = {};
  if (previous) {
    for (const key of ['approvedBudget', 'actualExpenditure', 'overallAbsorption', 'developmentAbsorption', 'pendingBills', 'complianceScore'] as const) {
      const curr = latest[key as keyof CountyFinanceRecord] as number | undefined;
      const prev = previous[key as keyof CountyFinanceRecord] as number | undefined;
      if (curr != null && prev != null && prev !== 0) {
        const diff = (curr as number) - (prev as number);
        yoyChanges[key] = { value: diff, pct: (diff / (prev as number)) * 100 };
      } else {
        yoyChanges[key] = null;
      }
    }
  }

  // Audit opinion history
  const auditHistory = mergedSeries
    .filter(r => r.auditOpinion)
    .map(r => ({ fy: r.fiscalYear, opinion: r.auditOpinion!, source: r.source }));

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/finance-audit" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Finance Dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">{countyName} County</h1>
            <Badge variant="outline">Finance & Audit</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Latest year summary */}
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Latest Year Summary</h2>
            <Badge variant="secondary">FY {latest.fiscalYear}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">Source: {latest.source}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Approved Budget</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(latest.approvedBudget)}</div>
              {yoyChanges.approvedBudget && (
                <div className={`text-xs ${yoyChanges.approvedBudget.value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {yoyChanges.approvedBudget.value > 0 ? '↑' : '↓'} {Math.abs(yoyChanges.approvedBudget.pct).toFixed(1)}% YoY
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Overall Absorption</div>
              <div className="mt-1 text-xl font-bold text-emerald-600">{latest.overallAbsorption?.toFixed(1) ?? '—'}%</div>
              {yoyChanges.overallAbsorption && (
                <div className={`text-xs ${yoyChanges.overallAbsorption.value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {yoyChanges.overallAbsorption.value > 0 ? '↑' : '↓'} {Math.abs(yoyChanges.overallAbsorption.pct).toFixed(1)}% YoY
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Dev Absorption</div>
              <div className="mt-1 text-xl font-bold text-amber-600">{latest.developmentAbsorption ?? '—'}%</div>
              {yoyChanges.developmentAbsorption && (
                <div className={`text-xs ${yoyChanges.developmentAbsorption.value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {yoyChanges.developmentAbsorption.value > 0 ? '↑' : '↓'} {Math.abs(yoyChanges.developmentAbsorption.pct).toFixed(1)}% YoY
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Audit Opinion</div>
              <div className={`mt-1 text-xl font-bold ${getAuditOpinionTextColor(latest.auditOpinion)}`}>
                {latest.auditOpinion}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Pending Bills</div>
              <div className="mt-1 text-xl font-bold text-rose-600">{latest.pendingBills ? formatKshs(latest.pendingBills) : '—'}</div>
              {yoyChanges.pendingBills && (
                <div className={`text-xs ${yoyChanges.pendingBills.value < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {yoyChanges.pendingBills.value < 0 ? '↓' : '↑'} {formatKshs(Math.abs(yoyChanges.pendingBills.value))} YoY
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">CoG Compliance</div>
              <div className="mt-1 text-xl font-bold">{latest.complianceScore ?? '—'}/100</div>
              {yoyChanges.complianceScore && (
                <div className={`text-xs ${yoyChanges.complianceScore.value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {yoyChanges.complianceScore.value > 0 ? '↑' : '↓'} {Math.abs(yoyChanges.complianceScore.value)} pts YoY
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">OSR Collected</div>
              <div className="mt-1 text-xl font-bold">{latest.ownSourceRevenue ? formatKshs(latest.ownSourceRevenue) : '—'}</div>
              {latest.osrTarget && latest.ownSourceRevenue && (
                <div className="text-[10px] text-muted-foreground">
                  of {formatKshs(latest.osrTarget)} target ({((latest.ownSourceRevenue / latest.osrTarget) * 100).toFixed(0)}%)
                </div>
              )}
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Equitable Share</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(latest.equitableShare)}</div>
            </CardContent></Card>
          </div>
          {latest.notes && (
            <p className="mt-2 text-xs text-muted-foreground italic">{latest.notes}</p>
          )}
        </section>

        {/* Detailed client-side chart + forecast */}
        <CountyFinanceDetail countyName={countyName} timeSeries={mergedSeries} />

        {/* Audit opinion history */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Audit Opinion History</CardTitle>
            </div>
            <CardDescription>Source: OAG County Audit Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {auditHistory.map((h, i) => (
                <div key={i} className="rounded-lg border p-3 text-center min-w-[140px]">
                  <div className="text-xs text-muted-foreground">FY {h.fy}</div>
                  <div className={`mt-1 text-sm font-bold ${getAuditOpinionTextColor(h.opinion as any)}`}>
                    {h.opinion}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block h-2 w-full rounded-full ${getAuditOpinionColor(h.opinion as any)}`} />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{h.source}</div>
                </div>
              ))}
            </div>
            {auditHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">No audit history available.</p>
            )}
          </CardContent>
        </Card>

        {/* Full data table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Fiscal Years — Full Data</CardTitle>
            <CardDescription>{mergedSeries.length} year(s) of finance data for {countyName} County</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                    <th className="p-2 text-left">FY</th>
                    <th className="p-2 text-right">Approved Budget</th>
                    <th className="p-2 text-right">Expenditure</th>
                    <th className="p-2 text-right">Absorption %</th>
                    <th className="p-2 text-right">Dev Absorp %</th>
                    <th className="p-2 text-center">Audit</th>
                    <th className="p-2 text-right">Pending Bills</th>
                    <th className="p-2 text-right">CoG Score</th>
                    <th className="p-2 text-left">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedSeries.map(r => (
                    <tr key={`${r.fiscalYear}-${r.source}`} className="border-b hover:bg-muted/40">
                      <td className="p-2 font-medium">{r.fiscalYear}</td>
                      <td className="p-2 text-right tabular-nums">{formatKshs(r.approvedBudget)}</td>
                      <td className="p-2 text-right tabular-nums">{r.actualExpenditure ? formatKshs(r.actualExpenditure) : '—'}</td>
                      <td className="p-2 text-right tabular-nums">{r.overallAbsorption?.toFixed(1) ?? '—'}%</td>
                      <td className="p-2 text-right tabular-nums">{r.developmentAbsorption ?? '—'}%</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${getAuditOpinionColor(r.auditOpinion)}`}>
                          {r.auditOpinion}
                        </span>
                      </td>
                      <td className="p-2 text-right tabular-nums">{r.pendingBills ? formatKshs(r.pendingBills) : '—'}</td>
                      <td className="p-2 text-right tabular-nums">{r.complianceScore ?? '—'}</td>
                      <td className="p-2 text-xs text-muted-foreground">{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-2 text-sm">
          <a href={`/county/${encodeURIComponent(countyName)}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <MapPin className="h-3 w-3" />View {countyName} County dashboard
          </a>
          <a href="/finance-audit" className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <TrendingUp className="h-3 w-3" />Back to Finance Dashboard
          </a>
          <a href={`/api/finance-audit?level=county&county=${encodeURIComponent(countyName)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <ExternalLink className="h-3 w-3" />JSON API
          </a>
        </div>
      </main>
    </div>
  );
}
