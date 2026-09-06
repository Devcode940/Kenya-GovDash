'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart, TrendingUp, TrendingDown, AlertTriangle, MapPin,
  Filter, Info, DollarSign, Building2, ArrowUpDown,
} from 'lucide-react';

interface VarianceRecord {
  id: string;
  countyName: string;
  department: string;
  budgetApproved: number; // Kshs millions
  actualSpent: number;
  variance: number;
  variancePct: number;
  status: 'overspent' | 'underspent' | 'on_budget';
  flagReason?: string;
  fiscalYear: string;
}

const VARIANCE_DATA: VarianceRecord[] = [
  { id: 'v1', countyName: 'Nairobi City', department: 'Health', budgetApproved: 8500, actualSpent: 11200, variance: 2700, variancePct: 31.8, status: 'overspent', flagReason: '31.8% overspend — no supplementary budget approved', fiscalYear: 'FY 2023/24' },
  { id: 'v2', countyName: 'Nairobi City', department: 'Roads', budgetApproved: 5200, actualSpent: 3100, variance: -2100, variancePct: -40.4, status: 'underspent', flagReason: '40% underspend — budgeted road projects not executed', fiscalYear: 'FY 2023/24' },
  { id: 'v3', countyName: 'Mombasa', department: 'Education', budgetApproved: 1800, actualSpent: 2200, variance: 400, variancePct: 22.2, status: 'overspent', flagReason: 'Overspend on bursary disbursements above approved budget', fiscalYear: 'FY 2023/24' },
  { id: 'v4', countyName: 'Mombasa', department: 'Water', budgetApproved: 1500, actualSpent: 680, variance: -820, variancePct: -54.7, status: 'underspent', flagReason: '55% underspend — water project not implemented', fiscalYear: 'FY 2023/24' },
  { id: 'v5', countyName: 'Kisumu', department: 'Health', budgetApproved: 3200, actualSpent: 3850, variance: 650, variancePct: 20.3, status: 'overspent', flagReason: 'Emergency medical procurement above budget', fiscalYear: 'FY 2023/24' },
  { id: 'v6', countyName: 'Kisumu', department: 'Agriculture', budgetApproved: 850, actualSpent: 320, variance: -530, variancePct: -62.4, status: 'underspent', flagReason: '62% underspend — agricultural inputs not procured', fiscalYear: 'FY 2023/24' },
  { id: 'v7', countyName: 'Nakuru', department: 'Administration', budgetApproved: 2800, actualSpent: 2950, variance: 150, variancePct: 5.4, status: 'on_budget', fiscalYear: 'FY 2023/24' },
  { id: 'v8', countyName: 'Nakuru', department: 'Infrastructure', budgetApproved: 4500, actualSpent: 2100, variance: -2400, variancePct: -53.3, status: 'underspent', flagReason: '53% underspend — capital projects stalled', fiscalYear: 'FY 2023/24' },
  { id: 'v9', countyName: 'Kiambu', department: 'Health', budgetApproved: 3800, actualSpent: 4200, variance: 400, variancePct: 10.5, status: 'on_budget', fiscalYear: 'FY 2023/24' },
  { id: 'v10', countyName: 'Kiambu', department: 'Trade', budgetApproved: 1200, actualSpent: 480, variance: -720, variancePct: -60.0, status: 'underspent', flagReason: '60% underspend — market construction not started', fiscalYear: 'FY 2023/24' },
  { id: 'v11', countyName: 'Kakamega', department: 'Education', budgetApproved: 2200, actualSpent: 2680, variance: 480, variancePct: 21.8, status: 'overspent', flagReason: 'Bursary overspend without supplementary approval', fiscalYear: 'FY 2023/24' },
  { id: 'v12', countyName: 'Machakos', department: 'Health', budgetApproved: 3100, actualSpent: 3200, variance: 100, variancePct: 3.2, status: 'on_budget', fiscalYear: 'FY 2023/24' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; barClass: string }> = {
  overspent: { label: 'Overspent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', barClass: '[&>div]:bg-red-500' },
  underspent: { label: 'Underspent', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', barClass: '[&>div]:bg-orange-500' },
  on_budget: { label: 'On Budget', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', barClass: '[&>div]:bg-emerald-500' },
};

export function KenyaBudgetVariance() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'variance' | 'county'>('variance');

  const filtered = [...VARIANCE_DATA]
    .filter(v => filter === 'all' || v.status === filter)
    .sort((a, b) => sortBy === 'county' ? a.countyName.localeCompare(b.countyName) : Math.abs(b.variancePct) - Math.abs(a.variancePct));

  const stats = {
    total: VARIANCE_DATA.length,
    overspent: VARIANCE_DATA.filter(v => v.status === 'overspent').length,
    underspent: VARIANCE_DATA.filter(v => v.status === 'underspent').length,
    totalOverspent: VARIANCE_DATA.filter(v => v.variance > 0).reduce((s, v) => s + v.variance, 0),
    totalUnderspent: VARIANCE_DATA.filter(v => v.variance < 0).reduce((s, v) => s + Math.abs(v.variance), 0),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-amber-300 dark:border-amber-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-amber-600" />
            Budget vs Actual Variance Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Flag departments where actual spending deviates significantly from approved budget.
            Overspending without supplementary budget is a constitutional violation (Article 201).
            Chronic underspending of development budgets indicates project non-implementation.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><TrendingUp className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.overspent}</p><p className="text-[10px] text-muted-foreground">Overspent Depts</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><TrendingDown className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">{stats.underspent}</p><p className="text-[10px] text-muted-foreground">Underspent Depts</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-red-500 mb-1" /><p className="text-lg font-bold text-red-500">+{stats.totalOverspent}M</p><p className="text-[10px] text-muted-foreground">Total Overspend</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-400"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-orange-500 mb-1" /><p className="text-lg font-bold text-orange-500">-{stats.totalUnderspent}M</p><p className="text-[10px] text-muted-foreground">Total Underspend</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'overspent', 'underspent', 'on_budget'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s.replace('_', ' ')}</Button>)}
        <span className="text-xs text-muted-foreground ml-2">Sort:</span>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setSortBy(sortBy === 'variance' ? 'county' : 'variance')}><ArrowUpDown className="h-3 w-3" />{sortBy === 'variance' ? 'By Variance' : 'By County'}</Button>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(v => {
            const status = STATUS_CONFIG[v.status];
            return (
              <Card key={v.id} className={`border-l-4 ${v.status === 'overspent' ? 'border-l-red-500' : v.status === 'underspent' ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{v.department}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{v.countyName}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.label}</Badge>
                        <span className="text-[10px] text-muted-foreground">{v.fiscalYear}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${v.variance > 0 ? 'text-red-600' : v.variance < 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {v.variance > 0 ? '+' : ''}{v.variancePct.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{v.variance > 0 ? '+' : ''}{v.variance}M</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-muted-foreground">Budget: Kshs {v.budgetApproved}M</span>
                      <span className="font-medium">Actual: Kshs {v.actualSpent}M</span>
                    </div>
                    <Progress value={Math.min((v.actualSpent / v.budgetApproved) * 100, 150)} className={`h-2 ${status.barClass}`} />
                  </div>

                  {v.flagReason && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-700 dark:text-red-300">{v.flagReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Why variance matters:</strong> Overspending without supplementary appropriation violates Article 201 (principles of public finance). Underspending of development budgets by &gt;50% means projects were budgeted but not implemented — either the budget was inflated or the capacity to deliver is lacking.</p>
              <p className="text-xs text-muted-foreground"><strong>Pattern of concern:</strong> When a county overspends on recurrent (salaries, travel) but underspends on development (projects, equipment), public funds are being consumed by administration rather than service delivery.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
