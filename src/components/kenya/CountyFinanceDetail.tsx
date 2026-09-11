'use client';

import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import { formatKshs, type CountyFinanceRecord } from '@/lib/finance-audit-data';

interface Props {
  countyName: string;
  timeSeries: CountyFinanceRecord[];
}

// Simple linear regression for forecasting
function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function CountyFinanceDetail({ countyName, timeSeries }: Props) {
  // Build chart data
  const chartData = useMemo(() => {
    return timeSeries.map(r => ({
      fy: r.fiscalYear,
      approvedBudget: r.approvedBudget,
      actualExpenditure: r.actualExpenditure ?? null,
      overallAbsorption: r.overallAbsorption ?? null,
      developmentAbsorption: r.developmentAbsorption ?? null,
      recurrentAbsorption: r.recurrentAbsorption ?? null,
      pendingBills: r.pendingBills ?? null,
      complianceScore: r.complianceScore ?? null,
    }));
  }, [timeSeries]);

  // Forecast next FY absorption using linear regression
  const forecast = useMemo(() => {
    const absPoints = timeSeries
      .filter(r => r.overallAbsorption != null)
      .map((r, i) => ({ x: i, y: r.overallAbsorption! }));
    if (absPoints.length < 2) return null;

    const reg = linearRegression(absPoints);
    if (!reg) return null;

    const nextX = absPoints.length;
    const forecastValue = reg.slope * nextX + reg.intercept;
    const lastValue = absPoints[absPoints.length - 1].y;
    const lastFy = timeSeries[timeSeries.length - 1].fiscalYear;
    // Next FY: increment the year
    const nextFy = (() => {
      const m = lastFy.match(/^(\d{4})\/(\d{2})$/);
      if (!m) return 'Next FY';
      const start = parseInt(m[1]) + 1;
      const end = String(parseInt(m[2]) + 1).padStart(2, '0');
      return `${start}/${end}`;
    })();

    return {
      fy: nextFy,
      value: Math.max(0, Math.min(100, forecastValue)),
      trend: reg.slope > 0 ? 'up' : 'down',
      slope: reg.slope,
      confidence: absPoints.length >= 3 ? 'medium' : 'low',
      lastValue,
    };
  }, [timeSeries]);

  // Add forecast to chart data
  const chartDataWithForecast = useMemo(() => {
    if (!forecast) return chartData;
    return [
      ...chartData,
      {
        fy: `${forecast.fy} (forecast)`,
        overallAbsorption: forecast.value,
        approvedBudget: null,
        actualExpenditure: null,
        developmentAbsorption: null,
        recurrentAbsorption: null,
        pendingBills: null,
        complianceScore: null,
      },
    ];
  }, [chartData, forecast]);

  return (
    <>
      {/* Forecast banner */}
      {forecast && (
        <Card className={`border-2 ${forecast.trend === 'up' ? 'border-emerald-300 dark:border-emerald-800' : 'border-rose-300 dark:border-rose-800'}`}>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Sparkles className={`h-6 w-6 ${forecast.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`} />
              <div className="flex-1">
                <h3 className="text-base font-semibold">
                  FY {forecast.fy} Forecast: {forecast.value.toFixed(1)}% absorption
                </h3>
                <p className="text-xs text-muted-foreground">
                  Based on {timeSeries.length}-year linear regression · trend:{' '}
                  <span className={forecast.trend === 'up' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                    {forecast.trend === 'up' ? '↑ improving' : '↓ declining'} ({forecast.slope.toFixed(1)} pts/year)
                  </span>
                  {' · confidence: '}<span className="font-medium">{forecast.confidence}</span>
                </p>
              </div>
              <Badge variant="outline" className={
                forecast.value < 50 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : forecast.value < 70 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }>
                {forecast.value < 50 ? 'Critical' : forecast.value < 70 ? 'Caution' : 'Healthy'}
              </Badge>
            </div>
            <p className="mt-2 text-xs italic text-muted-foreground">
              ⚠ Forecast is a simple linear projection based on historical data. Actual results depend on
              budget execution, economic conditions, and policy decisions. Treat as indicative only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Absorption trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Absorption Trend Over Time</CardTitle>
          <CardDescription>
            Overall, recurrent, and development absorption rates across fiscal years. Forecast shown as dashed line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataWithForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => v === null ? 'No data' : `${Number(v).toFixed(1)}%`} />
                <Legend />
                <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '50% threshold', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                <Line type="monotone" dataKey="overallAbsorption" name="Overall %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="recurrentAbsorption" name="Recurrent %" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="developmentAbsorption" name="Development %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Expenditure chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget vs Actual Expenditure</CardTitle>
          <CardDescription>Approved budget against actual expenditure (Kshs millions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatKshs(v)} width={90} />
                <Tooltip formatter={(v: any) => v === null ? 'No data' : formatKshs(Number(v))} />
                <Legend />
                <Bar dataKey="approvedBudget" name="Approved Budget" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualExpenditure" name="Actual Expenditure" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pending bills trend */}
      {chartData.some(d => d.pendingBills != null) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Bills Trend</CardTitle>
            <CardDescription>Kshs millions — lower is better</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatKshs(v)} width={90} />
                  <Tooltip formatter={(v: any) => v === null ? 'No data' : formatKshs(Number(v))} />
                  <Bar dataKey="pendingBills" name="Pending Bills" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
