'use client';

import React, { useState, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { X, Download, Trophy } from 'lucide-react';
import {
  buildAllCountyData,
  getCountyDemographics,
} from '@/lib/kenya-data';
import {
  ALL_COUNTY_FINANCE,
  formatKshs,
  getAuditOpinionColor,
} from '@/lib/finance-audit-data';

const COUNTY_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed'];

interface CountyComparisonRow {
  metric: string;
  values: (number | string | null)[];
  highlight?: number; // index of best value
}

export function CountyComparison() {
  const allCounties = useMemo(() => buildAllCountyData(), []);
  const [selected, setSelected] = useState<string[]>(['Nairobi City', 'Kisumu', 'Nyeri']);

  const addCounty = (name: string) => {
    if (selected.length < 5 && !selected.includes(name)) {
      setSelected([...selected, name]);
    }
  };

  const removeCounty = (name: string) => {
    setSelected(selected.filter(c => c !== name));
  };

  // Build comparison data
  const comparisonData = useMemo<CountyComparisonRow[]>(() => {
    if (selected.length === 0) return [];

    const rows: CountyComparisonRow[] = [];

    // Get county data
    const countyData = selected.map(name => {
      const c = allCounties.find(c => c.name === name);
      const demos = getCountyDemographics(name);
      const fin = ALL_COUNTY_FINANCE.find(r => r.countyName === name && r.fiscalYear === '2023/24');
      return { county: c, demos, fin };
    });

    // Helper to find best (highest numeric) value
    const findBestIdx = (values: (number | string | null)[]): number => {
      const nums = values.map((v, i) => ({ v: typeof v === 'number' ? v : null, i })).filter(x => x.v != null) as { v: number; i: number }[];
      if (nums.length === 0) return -1;
      return nums.reduce((best, x) => x.v > best.v ? x : best, nums[0]).i;
    };

    // Demographics
    rows.push({
      metric: 'Population',
      values: countyData.map(d => d.demos?.population ?? null),
      highlight: findBestIdx(countyData.map(d => d.demos?.population ?? null)),
    });
    rows.push({
      metric: 'Land Area (km²)',
      values: countyData.map(d => d.demos?.landAreaSqKm ?? null),
    });
    rows.push({
      metric: 'Density (/km²)',
      values: countyData.map(d => d.demos?.densityPerSqKm ?? null),
    });

    // Finance
    rows.push({
      metric: 'Approved Budget (Kshs M)',
      values: countyData.map(d => d.fin?.approvedBudget ?? null),
      highlight: findBestIdx(countyData.map(d => d.fin?.approvedBudget ?? null)),
    });
    rows.push({
      metric: 'Equitable Share (Kshs M)',
      values: countyData.map(d => d.fin?.equitableShare ?? null),
    });
    rows.push({
      metric: 'OSR Collected (Kshs M)',
      values: countyData.map(d => d.fin?.ownSourceRevenue ?? null),
      highlight: findBestIdx(countyData.map(d => d.fin?.ownSourceRevenue ?? null)),
    });
    rows.push({
      metric: 'OSR Target (Kshs M)',
      values: countyData.map(d => d.fin?.osrTarget ?? null),
    });
    rows.push({
      metric: 'Overall Absorption (%)',
      values: countyData.map(d => d.fin?.overallAbsorption ?? null),
      highlight: findBestIdx(countyData.map(d => d.fin?.overallAbsorption ?? null)),
    });
    rows.push({
      metric: 'Development Absorption (%)',
      values: countyData.map(d => d.fin?.developmentAbsorption ?? null),
      highlight: findBestIdx(countyData.map(d => d.fin?.developmentAbsorption ?? null)),
    });
    rows.push({
      metric: 'Pending Bills (Kshs M)',
      values: countyData.map(d => d.fin?.pendingBills ?? null),
      // For pending bills, lower is better — invert highlight
      highlight: (() => {
        const nums = countyData.map(d => d.fin?.pendingBills ?? null);
        const valid = nums.map((v, i) => ({ v, i })).filter(x => x.v != null) as { v: number; i: number }[];
        if (valid.length === 0) return -1;
        return valid.reduce((best, x) => x.v < best.v ? x : best, valid[0]).i;
      })(),
    });
    rows.push({
      metric: 'CoG Compliance Score',
      values: countyData.map(d => d.fin?.complianceScore ?? null),
      highlight: findBestIdx(countyData.map(d => d.fin?.complianceScore ?? null)),
    });
    rows.push({
      metric: 'Audit Opinion',
      values: countyData.map(d => d.fin?.auditOpinion ?? null),
    });

    // CECMs count
    rows.push({
      metric: 'CECM Count',
      values: countyData.map(d => d.county?.cecms?.length ?? null),
    });

    // MPs count
    rows.push({
      metric: 'Constituency MPs',
      values: countyData.map(d => d.county?.constituencyMPs?.length ?? null),
    });

    return rows;
  }, [selected, allCounties]);

  // Radar chart data (normalized 0-100)
  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    const metrics = ['Overall Absorption', 'Dev Absorption', 'CoG Compliance'];
    return metrics.map(metricLabel => {
      const row = comparisonData.find(r => r.metric.includes(metricLabel) || r.metric.includes(metricLabel.split(' ')[0]));
      const obj: Record<string, any> = { metric: metricLabel };
      selected.forEach((c, i) => {
        const v = row?.values[i];
        obj[c] = typeof v === 'number' ? v : 0;
      });
      return obj;
    });
  }, [comparisonData, selected]);

  // CSV export
  const exportCSV = () => {
    const headers = ['Metric', ...selected];
    const escape = (v: any) => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = comparisonData.map(r => [r.metric, ...r.values].map(escape).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `county-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Leaderboard (avg of normalized metrics)
  const leaderboard = useMemo(() => {
    if (selected.length === 0) return [];
    return selected.map((c, i) => {
      const fin = ALL_COUNTY_FINANCE.find(r => r.countyName === c && r.fiscalYear === '2023/24');
      const scores = [
        fin?.overallAbsorption,
        fin?.developmentAbsorption,
        fin?.complianceScore,
      ].filter((s): s is number => s != null);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      return { name: c, avg, auditOpinion: fin?.auditOpinion };
    }).sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  }, [selected]);

  const fmtValue = (v: number | string | null, metric: string): string => {
    if (v == null) return '—';
    if (typeof v === 'string') return v;
    if (metric.includes('Kshs')) return formatKshs(v);
    if (metric.includes('%')) return `${v}%`;
    if (metric.includes('Score')) return `${v}/100`;
    return v.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* County selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Select Counties (2-5)</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={selected.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {selected.map((c, i) => (
              <Badge
                key={c}
                variant="secondary"
                className="cursor-pointer py-1 pl-2 pr-1"
                style={{ borderLeft: `4px solid ${COUNTY_COLORS[i]}` }}
              >
                {c}
                <button onClick={() => removeCounty(c)} className="ml-1 rounded-full p-0.5 hover:bg-background">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selected.length < 5 && (
              <Select onValueChange={addCounty}>
                <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="+ Add county" /></SelectTrigger>
                <SelectContent>
                  {allCounties.map(c => c.name).filter(n => !selected.includes(n)).sort().map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selected.length >= 2 && (
        <>
          {/* Radar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Radar Comparison</CardTitle>
              <CardDescription>Normalized 0-100 scale across 3 key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    {selected.map((c, i) => (
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
            </CardContent>
          </Card>

          {/* Leaderboard */}
          {leaderboard.length > 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-base">Performance Ranking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {leaderboard.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="text-xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        {c.avg != null && <Badge variant="outline">{c.avg}/100 avg</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed Comparison</CardTitle>
              <CardDescription>Best value highlighted in green per row</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-2 text-left">Metric</th>
                      {selected.map((c, i) => (
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
                    {comparisonData.map(row => (
                      <tr key={row.metric} className="border-b hover:bg-muted/40">
                        <td className="p-2 font-medium">{row.metric}</td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={`p-2 text-center tabular-nums ${
                              row.highlight === i ? 'bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : ''
                            }`}
                          >
                            {fmtValue(v, row.metric)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
