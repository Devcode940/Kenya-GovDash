'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DollarSign, TrendingDown, AlertTriangle, MapPin,
  Filter, Info, Banknote, Receipt, Building2,
} from 'lucide-react';

interface RevenueRecord {
  id: string;
  countyName: string;
  countyCode: number;
  ownSourceTarget: number; // Kshs millions
  ownSourceActual: number;
  shortfall: number;
  shortfallPct: number;
  unbankedCash: number; // estimated cash not banked
  parkingRevenue: number;
  marketFees: number;
  liquorLicence: number;
  landRates: number;
  status: 'critical' | 'concerning' | 'moderate' | 'good';
  flagReason: string;
}

const REVENUE_DATA: RevenueRecord[] = [
  { id: 'r1', countyName: 'Nairobi City', countyCode: 47, ownSourceTarget: 18500, ownSourceActual: 12200, shortfall: 6300, shortfallPct: 34.1, unbankedCash: 850, parkingRevenue: 4200, marketFees: 1800, liquorLicence: 320, landRates: 5680, status: 'concerning', flagReason: 'Kshs 850M unbanked cash — parking collections not fully remitted' },
  { id: 'r2', countyName: 'Mombasa', countyCode: 1, ownSourceTarget: 4200, ownSourceActual: 2150, shortfall: 2050, shortfallPct: 48.8, unbankedCash: 320, parkingRevenue: 680, marketFees: 520, liquorLicence: 180, landRates: 770, status: 'critical', flagReason: '49% revenue shortfall — Kshs 320M unbanked, ferry tolls not fully banked' },
  { id: 'r3', countyName: 'Kisumu', countyCode: 42, ownSourceTarget: 2100, ownSourceActual: 1250, shortfall: 850, shortfallPct: 40.5, unbankedCash: 145, parkingRevenue: 280, marketFees: 340, liquorLicence: 95, landRates: 535, status: 'critical', flagReason: '41% shortfall, Kshs 145M unbanked — market fees collected but not banked' },
  { id: 'r4', countyName: 'Nakuru', countyCode: 32, ownSourceTarget: 3800, ownSourceActual: 2850, shortfall: 950, shortfallPct: 25.0, unbankedCash: 95, parkingRevenue: 520, marketFees: 680, liquorLicence: 210, landRates: 1440, status: 'moderate', flagReason: '25% shortfall — moderate concern, some sub-counties not remitting' },
  { id: 'r5', countyName: 'Kiambu', countyCode: 22, ownSourceTarget: 5200, ownSourceActual: 4100, shortfall: 1100, shortfallPct: 21.2, unbankedCash: 180, parkingRevenue: 850, marketFees: 720, liquorLicence: 240, landRates: 2290, status: 'moderate', flagReason: '21% shortfall — land rates collection lagging behind target' },
  { id: 'r6', countyName: 'Kakamega', countyCode: 37, ownSourceTarget: 1800, ownSourceActual: 980, shortfall: 820, shortfallPct: 45.6, unbankedCash: 210, parkingRevenue: 120, marketFees: 280, liquorLicence: 65, landRates: 515, status: 'critical', flagReason: '46% shortfall — Kshs 210M unbanked cash from sugar cess collection' },
  { id: 'r7', countyName: 'Machakos', countyCode: 16, ownSourceTarget: 2400, ownSourceActual: 1680, shortfall: 720, shortfallPct: 30.0, unbankedCash: 110, parkingRevenue: 220, marketFees: 480, liquorLicence: 130, landRates: 850, status: 'concerning', flagReason: '30% shortfall — quarry cess not fully remitted to county revenue account' },
  { id: 'r8', countyName: 'Kajiado', countyCode: 34, ownSourceTarget: 1600, ownSourceActual: 1380, shortfall: 220, shortfallPct: 13.8, unbankedCash: 25, parkingRevenue: 85, marketFees: 190, liquorLicence: 55, landRates: 1050, status: 'good', flagReason: 'Good performance — 86% of target, minimal unbanked cash' },
  { id: 'r9', countyName: 'Meru', countyCode: 12, ownSourceTarget: 1900, ownSourceActual: 1450, shortfall: 450, shortfallPct: 23.7, unbankedCash: 65, parkingRevenue: 180, marketFees: 320, liquorLicence: 120, landRates: 830, status: 'moderate', flagReason: '24% shortfall — miraa cess revenue below expectations' },
  { id: 'r10', countyName: 'Bungoma', countyCode: 39, ownSourceTarget: 1500, ownSourceActual: 720, shortfall: 780, shortfallPct: 52.0, unbankedCash: 165, parkingRevenue: 95, marketFees: 220, liquorLicence: 80, landRates: 325, status: 'critical', flagReason: '52% shortfall — worst performer, Kshs 165M unbanked maize cess' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; barColor: string }> = {
  critical: { label: 'Critical (>40%)', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', barColor: 'bg-red-500' },
  concerning: { label: 'Concerning (25-40%)', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', barColor: 'bg-orange-500' },
  moderate: { label: 'Moderate (15-25%)', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', barColor: 'bg-yellow-500' },
  good: { label: 'Good (<15%)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', barColor: 'bg-emerald-500' },
};

export function KenyaRevenueLeakage() {
  const [filter, setFilter] = useState('all');

  const filtered = REVENUE_DATA.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    totalShortfall: REVENUE_DATA.reduce((s, r) => s + r.shortfall, 0),
    totalUnbanked: REVENUE_DATA.reduce((s, r) => s + r.unbankedCash, 0),
    critical: REVENUE_DATA.filter(r => r.status === 'critical').length,
    avgShortfall: Math.round(REVENUE_DATA.reduce((s, r) => s + r.shortfallPct, 0) / REVENUE_DATA.length),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-teal-300 dark:border-teal-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-teal-600" />
            Revenue Leakage Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track own-source revenue collection gaps and unbanked cash — a key indicator of
            revenue leakage where collected funds are diverted before reaching the county revenue account.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><TrendingDown className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">Kshs {stats.totalShortfall}M</p><p className="text-[10px] text-muted-foreground">Total Revenue Shortfall</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><Banknote className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {stats.totalUnbanked}M</p><p className="text-[10px] text-muted-foreground">Unbanked Cash</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-500 mb-1" /><p className="text-lg font-bold text-red-500">{stats.critical}</p><p className="text-[10px] text-muted-foreground">Critical Counties</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-600">{stats.avgShortfall}%</p><p className="text-[10px] text-muted-foreground">Avg Shortfall</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'critical', 'concerning', 'moderate', 'good'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>

      {/* Records */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(record => {
            const status = STATUS_CONFIG[record.status];
            const achievementPct = ((record.ownSourceActual / record.ownSourceTarget) * 100).toFixed(1);
            return (
              <Card key={record.id} className={`border-l-4 ${record.status === 'critical' ? 'border-l-red-500' : record.status === 'concerning' ? 'border-l-orange-500' : record.status === 'moderate' ? 'border-l-yellow-500' : 'border-l-emerald-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{record.countyCode}</Badge>
                        {record.countyName}
                      </h4>
                      <Badge className={`text-[9px] px-1.5 py-0 mt-1 ${status.color}`}>{status.label}</Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-600">-{record.shortfallPct.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">vs target</p>
                    </div>
                  </div>

                  {/* Target vs Actual */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-muted-foreground">Target: Kshs {record.ownSourceTarget}M</span>
                      <span className="text-emerald-600 font-medium">Actual: Kshs {record.ownSourceActual}M ({achievementPct}%)</span>
                    </div>
                    <Progress value={Number(achievementPct)} className="h-2" />
                  </div>

                  {/* Revenue breakdown */}
                  <div className="grid grid-cols-4 gap-1 mt-2 text-[10px]">
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <Receipt className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                      <p className="font-medium">{record.parkingRevenue}M</p>
                      <p className="text-muted-foreground">Parking</p>
                    </div>
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <Building2 className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                      <p className="font-medium">{record.marketFees}M</p>
                      <p className="text-muted-foreground">Markets</p>
                    </div>
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <DollarSign className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                      <p className="font-medium">{record.liquorLicence}M</p>
                      <p className="text-muted-foreground">Liquor</p>
                    </div>
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <MapPin className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                      <p className="font-medium">{record.landRates}M</p>
                      <p className="text-muted-foreground">Land Rates</p>
                    </div>
                  </div>

                  {/* Unbanked cash */}
                  {record.unbankedCash > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <Banknote className="h-3 w-3 text-red-600 shrink-0" />
                      <p className="text-[10px] text-red-700 dark:text-red-300"><strong>Kshs {record.unbankedCash}M unbanked cash</strong> — collected but not remitted to county revenue account</p>
                    </div>
                  )}

                  {/* Flag reason */}
                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-3 w-3 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-orange-700 dark:text-orange-300">{record.flagReason}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Analysis */}
      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <strong>What is revenue leakage?</strong> When counties collect revenue (parking fees,
                market fees, liquor licenses, land rates) but the cash doesn't reach the county
                revenue account — it's diverted by collectors or not banked. The CoB tracks this
                in every budget implementation review report.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Red flag:</strong> Unbanked cash above Kshs 50M per county is a serious
                indicator of revenue leakage. The Public Finance Management Act requires all
                county revenue to be banked within 24 hours of collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
