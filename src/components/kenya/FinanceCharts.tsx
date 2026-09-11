'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, GitCompare, Trophy, Download } from 'lucide-react';
import {
  ALL_COUNTY_FINANCE,
  getCountyTimeSeries,
  getCountiesWithFinanceData,
  getAvailableFiscalYears,
  formatKshs,
  getAuditOpinionColor,
  type CountyFinanceRecord,
} from '@/lib/finance-audit-data';

const COUNTY_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed'];

type MetricKey = 'overallAbsorption' | 'developmentAbsorption' | 'recurrentAbsorption' | 'complianceScore' | 'pendingBills' | 'approvedBudget';

const METRICS: { key: MetricKey; label: string; unit: string; format: (v: number) => string }[] = [
  { key: 'overallAbsorption', label: 'Overall Absorption', unit: '%', format: v => `${v.toFixed(1)}%` },
  { key: 'developmentAbsorption', label: 'Development Absorption', unit: '%', format: v => `${v.toFixed(1)}%` },
  { key: 'recurrentAbsorption', label: 'Recurrent Absorption', unit: '%', format: v => `${v.toFixed(1)}%` },
  { key: 'complianceScore', label: 'CoG Compliance Score', unit: '/100', format: v => `${v}/100` },
  { key: 'pendingBills', label: 'Pending Bills', unit: 'Kshs M', format: v => formatKshs(v) },
  { key: 'approvedBudget', label: 'Approved Budget', unit: 'Kshs M', format: v => formatKshs(v) },
];

const RADAR_METRICS: { key: MetricKey; label: string; invert?: boolean }[] = [
  { key: 'overallAbsorption', label: 'Absorption' },
  { key: 'developmentAbsorption', label: 'Dev Absorp' },
  { key: 'recurrentAbsorption', label: 'Rec Absorp' },
  { key: 'complianceScore', label: 'Compliance' },
];

export function FinanceCharts() {
  const counties = useMemo(() => getCountiesWithFinanceData(), []);
  const fiscalYears = useMemo(() => getAvailableFiscalYears(), []);

  // Time-series state — allow up to 5 counties selected
  const [tsCounties, setTsCounties] = useState<string[]>(['Nairobi City', 'Kisumu', 'Nyeri']);
  const [tsMetric, setTsMetric] = useState<MetricKey>('overallAbsorption');

  // Radar state — exactly 3 counties
  const [radarCounties, setRadarCounties] = useState<string[]>(['Nairobi City', 'Kisumu', 'Nyeri']);

  // Build time-series data: one row per fiscal year, one column per selected county
  const tsData = useMemo(() => {
    return fiscalYears.map(fy => {
      const row: Record<string, any> = { fy };
      for (const c of tsCounties) {
        const rec = ALL_COUNTY_FINANCE.find(r => r.countyName === c && r.fiscalYear === fy);
        if (rec) {
          row[c] = rec[tsMetric] ?? null;
        } else {
          row[c] = null;
        }
      }
      return row;
    });
  }, [fiscalYears, tsCounties, tsMetric]);

  // Build radar data: one row per metric, one column per selected county
  // Use the most recent FY each county has data for
  const radarData = useMemo(() => {
    return RADAR_METRICS.map(m => {
      const row: Record<string, any> = { metric: m.label };
      for (const c of radarCounties) {
        const series = getCountyTimeSeries(c);
        // Use most recent record
        const rec = series[series.length - 1];
        if (rec && rec[m.key] != null) {
          // For pending bills, lower is better → invert (100 - normalized)
          // For other metrics, higher is better
          row[c] = rec[m.key];
        } else {
          row[c] = 0;
        }
      }
      return row;
    });
  }, [radarCounties]);

  // Leaderboard for the selected metric
  const leaderboard = useMemo(() => {
    // Use most recent FY for each county
    const recentFy = fiscalYears[fiscalYears.length - 1];
    return ALL_COUNTY_FINANCE
      .filter(r => r.fiscalYear === recentFy && r[tsMetric] != null)
      .sort((a, b) => {
        const av = (a[tsMetric] as number) ?? 0;
        const bv = (b[tsMetric] as number) ?? 0;
        // For pendingBills + approvedBudget, lower could be "better" contextually — but we'll just sort desc for now
        return bv - av;
      })
      .slice(0, 10);
  }, [fiscalYears, tsMetric]);

  const addTsCounty = (c: string) => {
    if (tsCounties.length < 5 && !tsCounties.includes(c)) {
      setTsCounties([...tsCounties, c]);
    }
  };
  const removeTsCounty = (c: string) => setTsCounties(tsCounties.filter(x => x !== c));

  const setRadarCounty = (index: number, c: string) => {
    const next = [...radarCounties];
    next[index] = c;
    setRadarCounties(next);
  };

  const currentMetric = METRICS.find(m => m.key === tsMetric)!;

  return (
    <div className="space-y-6">
      {/* ============ TIME-SERIES CHART ============ */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Finance Trends Over Time</CardTitle>
            </div>
            <Select value={tsMetric} onValueChange={(v) => setTsMetric(v as MetricKey)}>
              <SelectTrigger className="h-8 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METRICS.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Compare {currentMetric.label.toLowerCase()} across fiscal years for up to 5 counties.
            Data source: CoB Annual CG-BIRRs (FY 2021/22 → 2023/24).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selected counties */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Label className="text-xs">Counties:</Label>
            {tsCounties.map((c, i) => (
              <Badge
                key={c}
                variant="secondary"
                className="cursor-pointer gap-1"
                style={{ borderLeft: `4px solid ${COUNTY_COLORS[i % 5]}` }}
                onClick={() => removeTsCounty(c)}
              >
                {c} ✕
              </Badge>
            ))}
            {tsCounties.length < 5 && (
              <Select onValueChange={addTsCounty}>
                <SelectTrigger className="h-7 w-[160px]"><SelectValue placeholder="+ Add county" /></SelectTrigger>
                <SelectContent>
                  {counties.filter(c => !tsCounties.includes(c)).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Line chart */}
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fy" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => tsMetric === 'pendingBills' || tsMetric === 'approvedBudget' ? formatKshs(v) : `${v}${currentMetric.unit === '%' ? '%' : ''}`}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any) => value === null ? 'No data' : currentMetric.format(Number(value))}
                />
                <Legend />
                {tsCounties.map((c, i) => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stroke={COUNTY_COLORS[i % 5]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leaderboard for selected metric */}
          <div className="mt-6">
            <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
              <Trophy className="h-3 w-3" />Top 10 by {currentMetric.label} (FY {fiscalYears[fiscalYears.length - 1]})
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {leaderboard.map((r, i) => (
                <div key={r.countyName} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-base">{['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'][i]}</span>
                    <span className="font-medium truncate">{r.countyName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{currentMetric.format((r[tsMetric] as number) ?? 0)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============ RADAR COMPARISON ============ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">3-County Finance Radar Comparison</CardTitle>
          </div>
          <CardDescription>
            Compare 3 counties across 4 normalized finance metrics. Higher = better (pending bills inverted).
            Uses most recent fiscal year data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* County selectors */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {radarCounties.map((c, i) => (
              <div key={i}>
                <Label className="text-xs" style={{ color: COUNTY_COLORS[i] }}>
                  County {i + 1}
                </Label>
                <Select value={c} onValueChange={(v) => setRadarCounty(i, v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {counties.map(cn => <SelectItem key={cn} value={cn}>{cn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                {radarCounties.map((c, i) => (
                  <Radar
                    key={c}
                    name={c}
                    dataKey={c}
                    stroke={COUNTY_COLORS[i]}
                    fill={COUNTY_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Side-by-side metric table */}
          <div className="mt-6 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Metric</th>
                  {radarCounties.map((c, i) => (
                    <th key={c} className="p-2 text-center">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: COUNTY_COLORS[i] }} />
                        {c}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RADAR_METRICS.map(m => {
                  const metric = METRICS.find(x => x.key === m.key)!;
                  return (
                    <tr key={m.key} className="border-t">
                      <td className="p-2 font-medium">{metric.label}</td>
                      {radarCounties.map(c => {
                        const series = getCountyTimeSeries(c);
                        const rec = series[series.length - 1];
                        const val = rec?.[m.key];
                        return (
                          <td key={c} className="p-2 text-center tabular-nums">
                            {val != null ? metric.format(val as number) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Audit opinion row */}
                <tr className="border-t bg-muted/30">
                  <td className="p-2 font-medium">Audit Opinion (latest)</td>
                  {radarCounties.map(c => {
                    const series = getCountyTimeSeries(c);
                    const rec = series[series.length - 1];
                    return (
                      <td key={c} className="p-2 text-center">
                        {rec?.auditOpinion && (
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${getAuditOpinionColor(rec.auditOpinion)}`}
                          >
                            {rec.auditOpinion}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
