/**
 * Shared multi-FY county finance block (pesa za ugatuzi + maendeleo).
 * Used on /county/[name] and home dashboard when a county is selected.
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink } from 'lucide-react';
import {
  getCountyTimeSeries,
  type CountyFinanceRecord,
} from '@/lib/finance-audit-data';
import {
  getEquitableShareSeries,
  getAggregateCountyBudgetTrends,
  cumulativeEquitableShare,
  type EquitableShareYear,
} from '@/lib/devolution-finance';
import { formatKesMillions } from '@/lib/kenya-data';

function fmtPct(v?: number | null) {
  return v != null ? `${v}%` : '—';
}

function auditClass(opinion?: string) {
  if (opinion === 'Unmodified') return 'border-emerald-500 text-emerald-700';
  if (opinion === 'Qualified') return 'border-amber-500 text-amber-700';
  if (opinion === 'Adverse' || opinion === 'Disclaimer') return 'border-rose-500 text-rose-700';
  return '';
}

type Props = {
  countyName: string;
  variant?: 'full' | 'compact';
  showNationalSeries?: boolean;
  showDrilldownLink?: boolean;
};

export function CountyFinanceHistoryBlock({
  countyName,
  variant = 'full',
  showNationalSeries = true,
  showDrilldownLink = true,
}: Props) {
  const history = getCountyTimeSeries(countyName).slice().reverse();
  const latest = history[0];
  const series = getEquitableShareSeries();
  const aggregate = getAggregateCountyBudgetTrends() as Array<{
    fiscalYear: string;
    approvedBudgetBillion?: number;
    actualRevenueBillion?: number;
    budgetPerformancePct?: number;
    source?: string;
  }>;
  const cumulative = cumulativeEquitableShare();

  return (
    <Card id="pesa">
      <CardHeader className={variant === 'compact' ? 'pb-2' : undefined}>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <CardTitle className={variant === 'compact' ? 'text-sm font-semibold' : 'text-base'}>
            Pesa za ugatuzi — Finance & audit
          </CardTitle>
        </div>
        <CardDescription>
          Multi-year county snapshots (CoB / OAG)
          {latest ? ` · latest FY ${latest.fiscalYear}` : ' · no county row curated yet'}
          {history.length > 1 ? ` · ${history.length} fiscal years` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MiniStat label="Approved budget" value={formatKesMillions(latest.approvedBudget)} />
            <MiniStat label="Equitable share" value={formatKesMillions(latest.equitableShare)} />
            <MiniStat label="OSR collected" value={formatKesMillions(latest.ownSourceRevenue ?? null)} />
            <MiniStat label="Overall absorption" value={fmtPct(latest.overallAbsorption)} />
            <MiniStat label="Development (maendeleo)" value={fmtPct(latest.developmentAbsorption)} />
            <MiniStat label="Pending bills" value={formatKesMillions(latest.pendingBills ?? null)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No curated county finance rows for {countyName} yet. National devolution series below
            still applies to all 47 counties.
          </p>
        )}

        {latest?.auditOpinion && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Audit opinion:</span>
            <Badge variant="outline" className={auditClass(latest.auditOpinion)}>
              {latest.auditOpinion}
            </Badge>
            {latest.source && (
              <span className="text-muted-foreground">Source: {latest.source}</span>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="p-2 text-left">FY</th>
                  <th className="p-2 text-right">Approved</th>
                  <th className="p-2 text-right">Equitable</th>
                  <th className="p-2 text-right">Absorb %</th>
                  <th className="p-2 text-right">Dev %</th>
                  <th className="p-2 text-right">Pending</th>
                  <th className="p-2 text-center">Audit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r: CountyFinanceRecord) => (
                  <tr key={r.fiscalYear} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 font-medium">{r.fiscalYear}</td>
                    <td className="p-2 text-right tabular-nums">{formatKesMillions(r.approvedBudget)}</td>
                    <td className="p-2 text-right tabular-nums">{formatKesMillions(r.equitableShare)}</td>
                    <td className="p-2 text-right tabular-nums">{fmtPct(r.overallAbsorption)}</td>
                    <td className="p-2 text-right tabular-nums text-amber-700 dark:text-amber-400">
                      {fmtPct(r.developmentAbsorption)}
                    </td>
                    <td className="p-2 text-right tabular-nums">{formatKesMillions(r.pendingBills ?? null)}</td>
                    <td className="p-2 text-center">
                      {r.auditOpinion ? (
                        <Badge variant="outline" className={`text-[10px] ${auditClass(r.auditOpinion)}`}>
                          {r.auditOpinion}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showNationalSeries && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              National county equitable share (all 47) — CRA/CARA
              {series.length ? ` · cumulative ~Kshs ${cumulative.toFixed(0)}B since 2013/14` : ''}
            </div>
            {variant === 'full' ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[10px] uppercase text-muted-foreground">
                      <th className="p-2 text-left">FY</th>
                      <th className="p-2 text-right">Equitable share (Kshs B)</th>
                      <th className="p-2 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...series].reverse().map((r: EquitableShareYear) => (
                      <tr key={r.fiscalYear} className="border-b last:border-0">
                        <td className="p-2 font-medium">{r.fiscalYear}</td>
                        <td className="p-2 text-right tabular-nums">{r.equitableShareBillion}</td>
                        <td className="p-2 text-muted-foreground">{r.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {[...series].slice(-6).map((r) => (
                  <Badge key={r.fiscalYear} variant="secondary" className="tabular-nums text-[10px]">
                    {r.fiscalYear}: {r.equitableShareBillion}B
                  </Badge>
                ))}
              </div>
            )}

            {variant === 'full' && aggregate?.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <div className="border-b bg-muted/40 px-2 py-1.5 text-[10px] uppercase text-muted-foreground">
                  Aggregate county budgets (all counties) — OAG summaries
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-[10px] uppercase text-muted-foreground">
                      <th className="p-2 text-left">FY</th>
                      <th className="p-2 text-right">Approved (Kshs B)</th>
                      <th className="p-2 text-right">Actual revenue (B)</th>
                      <th className="p-2 text-right">Performance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...aggregate].reverse().map((r) => (
                      <tr key={r.fiscalYear} className="border-b last:border-0">
                        <td className="p-2 font-medium">{r.fiscalYear}</td>
                        <td className="p-2 text-right tabular-nums">{r.approvedBudgetBillion ?? '—'}</td>
                        <td className="p-2 text-right tabular-nums">{r.actualRevenueBillion ?? '—'}</td>
                        <td className="p-2 text-right tabular-nums">
                          {r.budgetPerformancePct != null ? `${r.budgetPerformancePct}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showDrilldownLink && (
          <Link
            href={`/finance-audit/county/${encodeURIComponent(countyName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            Open finance drill-down & charts <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
