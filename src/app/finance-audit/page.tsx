// Public Finance Audit Dashboard — surfaces national + county-level finance
// and audit data sourced from OAG, CoB, CoG, and KNBS.
//
// Path: /finance-audit
//
// Sections:
//   1. National overview (national budget, expenditure, audit opinion, debt)
//   2. County aggregate stats (totals across 20 tracked counties)
//   3. Audit opinion distribution chart
//   4. Top/bottom performers (by CoG compliance score)
//   5. County-level sortable table (budget, absorption, audit, pending bills)

import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  NATIONAL_FINANCE,
  COUNTY_FINANCE,
  getAggregateStats,
  getAuditOpinionColor,
  getAuditOpinionTextColor,
  formatKshs,
  getAvailableFiscalYears,
  type AuditOpinionType,
} from '@/lib/finance-audit-data';
import { FinanceCharts } from '@/components/kenya/FinanceCharts';
import { FinanceAlertForm } from '@/components/kenya/FinanceAlertForm';
import { ChevronLeft, Landmark, TrendingUp, AlertTriangle, CheckCircle2, Award, Database, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Finance & Audit Dashboard — Kenya GovDash',
  description: 'National and county-level finance, budget, audit opinion, and pending bills data sourced from OAG, CoB, CoG, and KNBS.',
};

export const dynamic = 'force-dynamic';

const AUDIT_OPINION_ORDER: AuditOpinionType[] = ['Unmodified', 'Qualified', 'Adverse', 'Disclaimer'];

export default function FinanceAuditPage() {
  const national = NATIONAL_FINANCE[0]; // most recent FY
  const stats = getAggregateStats('2023/24');

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back to dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Landmark className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">Finance & Audit Dashboard</h1>
            <Badge variant="outline">FY {national.fiscalYear}</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Sources banner */}
        <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/10">
          <CardContent className="py-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-emerald-800 dark:text-emerald-200">Data sources:</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">OAG — Office of the Auditor General</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200">CoB — Controller of Budget</Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">CoG — Council of Governors</Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">KNBS — Kenya National Bureau of Statistics</Badge>
            </div>
          </CardContent>
        </Card>

        {/* === NATIONAL OVERVIEW === */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">National Government</h2>
            <Badge variant="secondary">FY {national.fiscalYear}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">Source: {national.auditSource}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Approved Budget</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(national.approvedBudget)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Actual Expenditure</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(national.actualExpenditure)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Overall Absorption</div>
              <div className="mt-1 text-xl font-bold text-emerald-600">{national.overallAbsorption}%</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Audit Opinion</div>
              <div className={`mt-1 text-xl font-bold ${getAuditOpinionTextColor(national.auditOpinion as AuditOpinionType)}`}>
                {national.auditOpinion}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Pending Bills</div>
              <div className="mt-1 text-xl font-bold text-rose-600">{formatKshs(national.pendingBills)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Public Debt</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(national.totalDebt)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Recurrent Absorption</div>
              <div className="mt-1 text-xl font-bold">{national.recurrentAbsorption}%</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Development Absorption</div>
              <div className="mt-1 text-xl font-bold text-amber-600">{national.developmentAbsorption}%</div>
            </CardContent></Card>
          </div>
          {national.notes && (
            <p className="mt-2 text-xs text-muted-foreground italic">{national.notes}</p>
          )}
        </section>

        {/* === COUNTY AGGREGATES === */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">County Aggregate (20 tracked counties)</h2>
            <Badge variant="secondary">FY 2023/24</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Total Approved Budget</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(stats.totalApprovedBudget)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Equitable Share</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(stats.totalEquitableShare)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">OSR Collected</div>
              <div className="mt-1 text-xl font-bold">{formatKshs(stats.totalOsrCollected)}</div>
              <div className="text-[10px] text-muted-foreground">
                Target: {formatKshs(stats.totalOsrTarget)} · {((stats.totalOsrCollected / stats.totalOsrTarget) * 100).toFixed(0)}%
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Pending Bills</div>
              <div className="mt-1 text-xl font-bold text-rose-600">{formatKshs(stats.totalPendingBills)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Avg Overall Absorption</div>
              <div className="mt-1 text-xl font-bold">{stats.avgOverallAbsorption.toFixed(1)}%</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Avg Development Absorption</div>
              <div className="mt-1 text-xl font-bold text-amber-600">{stats.avgDevelopmentAbsorption.toFixed(1)}%</div>
            </CardContent></Card>
          </div>
        </section>

        {/* === AUDIT OPINION DISTRIBUTION === */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Opinion Distribution — County Governments FY 2023/24</CardTitle>
              <CardDescription>Source: OAG County Audit Reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AUDIT_OPINION_ORDER.map(op => {
                  const count = stats.auditOpinionCounts[op as AuditOpinionType] || 0;
                  const pct = (count / COUNTY_FINANCE.length) * 100;
                  return (
                    <div key={op} className="flex items-center gap-3">
                      <div className="w-32 text-sm font-medium">{op}</div>
                      <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden relative">
                        <div
                          className={`h-full ${getAuditOpinionColor(op as AuditOpinionType)} flex items-center justify-end pr-2`}
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        >
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      </div>
                      <div className="w-12 text-right text-xs text-muted-foreground">{pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {stats.auditOpinionCounts['Adverse'] || 0} counties received Adverse opinions — these
                indicate severe financial management issues and warrant immediate investigation.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* === TOP / BOTTOM PERFORMERS === */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Top 5 Counties — CoG Compliance Score</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {stats.topPerformers.map((c, i) => (
                  <li key={c.countyName} className="flex items-center gap-3">
                    <span className="text-xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                    <div className="flex-1">
                      <div className="font-medium">{c.countyName}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.auditOpinion} · {c.overallAbsorption}% absorption
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {c.complianceScore}/100
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-rose-200 dark:border-rose-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-base">Bottom 5 Counties — Needs Intervention</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {stats.bottomPerformers.map((c, i) => (
                  <li key={c.countyName} className="flex items-center gap-3">
                    <span className="text-xl">{['1', '2', '3', '4', '5'][i]}</span>
                    <div className="flex-1">
                      <div className="font-medium">{c.countyName}</div>
                      <div className={`text-xs ${getAuditOpinionTextColor(c.auditOpinion)}`}>
                        {c.auditOpinion} · {c.overallAbsorption}% absorption
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {c.complianceScore}/100
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* === COUNTY TABLE === */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">County-Level Finance Detail — FY 2023/24</CardTitle>
              <CardDescription>
                Sortable view of 20 tracked counties. Click any county name for its dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                      <th className="p-2 text-left">County</th>
                      <th className="p-2 text-right">Approved Budget</th>
                      <th className="p-2 text-right">Equitable Share</th>
                      <th className="p-2 text-right">OSR (Actual)</th>
                      <th className="p-2 text-right">Absorption %</th>
                      <th className="p-2 text-center">Audit Opinion</th>
                      <th className="p-2 text-right">Pending Bills</th>
                      <th className="p-2 text-right">CoG Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COUNTY_FINANCE.map(c => (
                      <tr key={c.countyName} className="border-b hover:bg-muted/40">
                        <td className="p-2 font-medium">
                          <a href={`/county/${encodeURIComponent(c.countyName)}`} className="hover:underline">
                            {c.countyName}
                          </a>
                        </td>
                        <td className="p-2 text-right tabular-nums">{formatKshs(c.approvedBudget)}</td>
                        <td className="p-2 text-right tabular-nums">{formatKshs(c.equitableShare)}</td>
                        <td className="p-2 text-right tabular-nums">
                          {c.ownSourceRevenue ? formatKshs(c.ownSourceRevenue) : '—'}
                          {c.osrTarget && c.ownSourceRevenue && (
                            <div className="text-[10px] text-muted-foreground">
                              of {formatKshs(c.osrTarget)} ({((c.ownSourceRevenue / c.osrTarget) * 100).toFixed(0)}%)
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          <span className={c.overallAbsorption && c.overallAbsorption < 70 ? 'text-rose-600 font-medium' : ''}>
                            {c.overallAbsorption?.toFixed(1) || '—'}%
                          </span>
                          {c.developmentAbsorption !== undefined && (
                            <div className="text-[10px] text-muted-foreground">
                              Dev: {c.developmentAbsorption}%
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${getAuditOpinionColor(c.auditOpinion)}`}>
                            {c.auditOpinion}
                          </span>
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {c.pendingBills ? formatKshs(c.pendingBills) : '—'}
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {c.complianceScore !== undefined && (
                            <span className={`font-medium ${c.complianceScore < 60 ? 'text-rose-600' : c.complianceScore < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {c.complianceScore}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* === TIME-SERIES + RADAR CHARTS === */}
        <section>
          <FinanceCharts />
        </section>

        {/* === HISTORICAL NATIONAL TRENDS === */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">National Budget Trends — 3-Year Comparison</CardTitle>
              <CardDescription>Source: OAG Audit Reports + National Treasury</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                      <th className="p-2 text-left">Fiscal Year</th>
                      <th className="p-2 text-right">Approved Budget</th>
                      <th className="p-2 text-right">Actual Expenditure</th>
                      <th className="p-2 text-right">Absorption %</th>
                      <th className="p-2 text-right">Pending Bills</th>
                      <th className="p-2 text-right">Public Debt</th>
                      <th className="p-2 text-center">Audit Opinion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NATIONAL_FINANCE.map(n => (
                      <tr key={n.fiscalYear} className="border-b hover:bg-muted/40">
                        <td className="p-2 font-medium">{n.fiscalYear}</td>
                        <td className="p-2 text-right tabular-nums">{formatKshs(n.approvedBudget)}</td>
                        <td className="p-2 text-right tabular-nums">{formatKshs(n.actualExpenditure)}</td>
                        <td className="p-2 text-right tabular-nums">{n.overallAbsorption}%</td>
                        <td className="p-2 text-right tabular-nums text-rose-600">{formatKshs(n.pendingBills)}</td>
                        <td className="p-2 text-right tabular-nums">{formatKshs(n.totalDebt)}</td>
                        <td className="p-2 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${getAuditOpinionColor(n.auditOpinion as AuditOpinionType)}`}>
                            {n.auditOpinion}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* === FINANCE ALERTS === */}
        <section>
          <FinanceAlertForm />
        </section>

        {/* === OPEN DATA === */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Data Sources & Methodology</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong className="text-emerald-700 dark:text-emerald-300">OAG — Office of the Auditor General:</strong>{' '}
              Audit opinions + pending bills data from annual county + national audit reports.
              <a href="https://oagkenya.go.ke/" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400">
                oagkenya.go.ke <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p>
              <strong className="text-amber-700 dark:text-amber-300">CoB — Controller of Budget:</strong>{' '}
              Budget execution + absorption rates from County Budget Implementation Review Reports (CG-BIRRs).
              <a href="https://cob.go.ke/" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400">
                cob.go.ke <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p>
              <strong className="text-indigo-700 dark:text-indigo-300">CoG — Council of Governors:</strong>{' '}
              Compliance scores from CoG Annual Performance Index + County Governments Status Reports.
              <a href="https://cog.go.ke/" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400">
                cog.go.ke <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p>
              <strong className="text-slate-700 dark:text-slate-300">KNBS — Kenya National Bureau of Statistics:</strong>{' '}
              Demographic + economic indicators used to contextualize finance data.
              <a href="https://www.knbs.or.ke/" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400">
                knbs.or.ke <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p className="mt-3 text-xs text-muted-foreground italic">
              All amounts in Kshs millions unless otherwise stated. Audit opinions reflect the most recent
              published OAG report for the fiscal year. Where data is not publicly available, the field is
              marked as "—" rather than estimated.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
