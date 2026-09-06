'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Landmark, AlertTriangle, TrendingUp, MapPin,
  Filter, Info, DollarSign, Scale, Building2,
} from 'lucide-react';

interface DebtRecord {
  id: string;
  countyName: string;
  equitableShare: number; // Kshs millions FY
  ownRevenue: number;
  totalRevenue: number;
  commercialLoans: number;
  pendingBills: number;
  debtServiceRatio: number; // debt service / total revenue %
  borrowingLimit: number; // per PFM Act (20% of revenue)
  status: 'breached' | 'warning' | 'safe';
  flagReason: string;
  fiscalYear: string;
}

const DEBT_DATA: DebtRecord[] = [
  { id: 'd1', countyName: 'Nairobi City', equitableShare: 17500, ownRevenue: 12200, totalRevenue: 29700, commercialLoans: 8500, pendingBills: 4310, debtServiceRatio: 28.6, borrowingLimit: 5940, status: 'breached', flagReason: 'Debt service at 28.6% exceeds PFM Act limit of 20% — borrowing unsustainable', fiscalYear: 'FY 2023/24' },
  { id: 'd2', countyName: 'Mombasa', equitableShare: 8200, ownRevenue: 2150, totalRevenue: 10350, commercialLoans: 3200, pendingBills: 1870, debtServiceRatio: 30.9, borrowingLimit: 2070, status: 'breached', flagReason: 'Debt service at 30.9% — exceeded borrowing limit by Kshs 1.13B', fiscalYear: 'FY 2023/24' },
  { id: 'd3', countyName: 'Kisumu', equitableShare: 7800, ownRevenue: 1250, totalRevenue: 9050, commercialLoans: 1850, pendingBills: 1150, debtServiceRatio: 20.4, borrowingLimit: 1810, status: 'warning', flagReason: 'Debt service at 20.4% — just above the 20% PFM Act limit', fiscalYear: 'FY 2023/24' },
  { id: 'd4', countyName: 'Nakuru', equitableShare: 12500, ownRevenue: 2850, totalRevenue: 15350, commercialLoans: 2100, pendingBills: 1650, debtServiceRatio: 13.7, borrowingLimit: 3070, status: 'safe', flagReason: 'Within borrowing limit — debt service at 13.7%', fiscalYear: 'FY 2023/24' },
  { id: 'd5', countyName: 'Kiambu', equitableShare: 10500, ownRevenue: 4100, totalRevenue: 14600, commercialLoans: 3800, pendingBills: 1420, debtServiceRatio: 26.0, borrowingLimit: 2920, status: 'breached', flagReason: 'Debt service at 26% — exceeded borrowing limit by Kshs 880M', fiscalYear: 'FY 2023/24' },
  { id: 'd6', countyName: 'Kakamega', equitableShare: 9500, ownRevenue: 980, totalRevenue: 10480, commercialLoans: 1200, pendingBills: 1280, debtServiceRatio: 11.5, borrowingLimit: 2096, status: 'safe', flagReason: 'Within limit — low commercial borrowing', fiscalYear: 'FY 2023/24' },
  { id: 'd7', countyName: 'Machakos', equitableShare: 8200, ownRevenue: 1680, totalRevenue: 9880, commercialLoans: 2400, pendingBills: 680, debtServiceRatio: 24.3, borrowingLimit: 1976, status: 'breached', flagReason: 'Debt service at 24.3% — exceeded limit by Kshs 424M', fiscalYear: 'FY 2023/24' },
  { id: 'd8', countyName: 'Kajiado', equitableShare: 6800, ownRevenue: 1380, totalRevenue: 8180, commercialLoans: 450, pendingBills: 180, debtServiceRatio: 5.5, borrowingLimit: 1636, status: 'safe', flagReason: 'Very low debt — good fiscal discipline', fiscalYear: 'FY 2023/24' },
  { id: 'd9', countyName: 'Meru', equitableShare: 7500, ownRevenue: 1450, totalRevenue: 8950, commercialLoans: 900, pendingBills: 610, debtServiceRatio: 10.1, borrowingLimit: 1790, status: 'safe', flagReason: 'Within limit — moderate borrowing', fiscalYear: 'FY 2023/24' },
  { id: 'd10', countyName: 'Bungoma', equitableShare: 7800, ownRevenue: 720, totalRevenue: 8520, commercialLoans: 1600, pendingBills: 980, debtServiceRatio: 18.8, borrowingLimit: 1704, status: 'warning', flagReason: 'Debt service at 18.8% — approaching the 20% limit', fiscalYear: 'FY 2023/24' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  breached: { label: 'Limit Breached', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  warning: { label: 'Near Limit', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  safe: { label: 'Within Limit', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
};

export function KenyaDebtMonitor() {
  const [filter, setFilter] = useState('all');

  const filtered = DEBT_DATA.filter(d => filter === 'all' || d.status === filter);

  const stats = {
    totalDebt: DEBT_DATA.reduce((s, d) => s + d.commercialLoans, 0),
    totalPending: DEBT_DATA.reduce((s, d) => s + d.pendingBills, 0),
    breached: DEBT_DATA.filter(d => d.status === 'breached').length,
    avgRatio: (DEBT_DATA.reduce((s, d) => s + d.debtServiceRatio, 0) / DEBT_DATA.length).toFixed(1),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-rose-300 dark:border-rose-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-rose-600" />
            County Debt & Borrowing Monitor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track county commercial loans, pending bills (which are a form of debt), and debt service ratios.
            The Public Finance Management Act limits county borrowing to 20% of total revenue.
          </p>
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-[10px] w-fit gap-1">
            <Scale className="h-2.5 w-2.5" /> PFM Act: 20% Debt Service Limit
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.breached}</p><p className="text-[10px] text-muted-foreground">Counties Breaching Limit</p></CardContent></Card>
        <Card className="border-l-4 border-l-rose-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-rose-600 mb-1" /><p className="text-lg font-bold text-rose-600">Kshs {stats.totalDebt}M</p><p className="text-[10px] text-muted-foreground">Total Commercial Debt</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {stats.totalPending}M</p><p className="text-[10px] text-muted-foreground">Total Pending Bills</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-3 pb-3"><TrendingUp className="h-3.5 w-3.5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-600">{stats.avgRatio}%</p><p className="text-[10px] text-muted-foreground">Avg Debt Service Ratio</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'breached', 'warning', 'safe'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s.replace('_', ' ')}</Button>)}
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(d => {
            const status = STATUS_CONFIG[d.status];
            return (
              <Card key={d.id} className={`border-l-4 ${d.status === 'breached' ? 'border-l-red-500' : d.status === 'warning' ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />{d.countyName}
                      </h4>
                      <Badge className={`text-[9px] px-1.5 py-0 mt-1 ${status.color}`}>{status.label}</Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${d.debtServiceRatio > 20 ? 'text-red-600' : d.debtServiceRatio > 18 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {d.debtServiceRatio}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">debt service</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                    <div className="p-1.5 rounded bg-muted/30 text-center"><DollarSign className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" /><p className="font-medium">{d.totalRevenue}M</p><p className="text-muted-foreground">Total Revenue</p></div>
                    <div className="p-1.5 rounded bg-muted/30 text-center"><Building2 className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" /><p className="font-medium">{d.commercialLoans}M</p><p className="text-muted-foreground">Commercial Loans</p></div>
                    <div className="p-1.5 rounded bg-muted/30 text-center"><DollarSign className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" /><p className="font-medium">{d.pendingBills}M</p><p className="text-muted-foreground">Pending Bills</p></div>
                  </div>

                  {/* Limit indicator */}
                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <span className="text-muted-foreground">PFM Act limit:</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{d.borrowingLimit}M</Badge>
                    <span className="text-muted-foreground">·</span>
                    {d.commercialLoans > d.borrowingLimit ? (
                      <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Exceeded by {d.commercialLoans - d.borrowingLimit}M</Badge>
                    ) : (
                      <Badge className="text-[9px] px-1 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">{d.borrowingLimit - d.commercialLoans}M headroom</Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-700 dark:text-red-300">{d.flagReason}</p>
                  </div>
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
              <p className="text-xs text-muted-foreground"><strong>PFM Act 2015:</strong> County governments may borrow only with guarantee from the National Treasury. Debt service must not exceed 20% of total revenue. Pending bills count as de facto debt — they are obligations the county has failed to pay.</p>
              <p className="text-xs text-muted-foreground"><strong>Why this matters:</strong> Counties breaching the limit are spending more on loan repayments than on service delivery. High debt + high pending bills = fiscal distress — the county cannot meet its obligations to both lenders and suppliers.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
