'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plane, AlertTriangle, DollarSign, MapPin, Clock,
  Filter, Info, TrendingDown, Repeat, Calendar,
  Building2, User,
} from 'lucide-react';

interface TravelRecord {
  id: string;
  countyName: string;
  officialName: string;
  officialTitle: string;
  destination: string;
  purpose: string;
  durationDays: number;
  cost: number; // Kshs
  budgetAllocated: number;
  anomalyType: string;
  severity: 'high' | 'medium' | 'low';
  flagReason: string;
  travelDate: string;
  perDiem: number;
  duplicateCheck?: boolean;
}

const TRAVEL_RECORDS: TravelRecord[] = [
  { id: 'tr1', countyName: 'Nairobi City', officialName: 'Hon. Johnson Sakaja', officialTitle: 'Governor', destination: 'Dubai, UAE', purpose: 'Investment conference', durationDays: 5, cost: 1850000, budgetAllocated: 800000, anomalyType: 'Over Budget', severity: 'high', flagReason: 'Travel cost Kshs 1.85M exceeds budget by 131% — no supplementary approval', travelDate: '2024-11-15', perDiem: 45000 },
  { id: 'tr2', countyName: 'Mombasa', officialName: 'Hon. Abdulswamad Nassir', officialTitle: 'Governor', destination: 'Geneva, Switzerland', purpose: 'WHO health forum', durationDays: 7, cost: 2200000, budgetAllocated: 2500000, anomalyType: 'Extended Duration', severity: 'medium', flagReason: '7-day trip for 2-day conference — 5 extra days unexplained', travelDate: '2024-09-20', perDiem: 50000 },
  { id: 'tr3', countyName: 'Nakuru', officialName: 'Hon. Susan Kihika', officialTitle: 'Governor', destination: 'London, UK', purpose: 'County partnerships meeting', durationDays: 4, cost: 1650000, budgetAllocated: 1700000, anomalyType: 'During Recess', severity: 'medium', flagReason: 'International travel during Senate recess — no oversight of county during absence', travelDate: '2024-12-10', perDiem: 55000 },
  { id: 'tr4', countyName: 'Kisumu', officialName: "Hon. Anyang' Nyong'o", officialTitle: 'Governor', destination: 'Addis Ababa, Ethiopia', purpose: 'AU health ministers summit', durationDays: 3, cost: 480000, budgetAllocated: 500000, anomalyType: 'None', severity: 'low', flagReason: 'Within budget and appropriate duration', travelDate: '2024-10-05', perDiem: 28000 },
  { id: 'tr5', countyName: 'Nairobi City', officialName: 'Hon. Polycarp Igathe', officialTitle: 'Deputy Governor', destination: 'Cape Town, South Africa', purpose: 'Tourism conference', durationDays: 6, cost: 1200000, budgetAllocated: 900000, anomalyType: 'Over Budget + Extended', severity: 'high', flagReason: 'Cost 133% of budget, 6 days for 2-day conference — combined anomaly', travelDate: '2024-08-22', perDiem: 40000 },
  { id: 'tr6', countyName: 'Machakos', officialName: 'Hon. Wavinya Ndeti', officialTitle: 'Governor', destination: 'Nairobi → Mombasa', purpose: 'County coordination meeting', durationDays: 1, cost: 85000, budgetAllocated: 80000, anomalyType: 'Duplicate Claim', severity: 'medium', flagReason: 'Same trip claimed by Governor and 3 MCAs — duplicate per-diem payments', travelDate: '2024-10-18', perDiem: 15000, duplicateCheck: true },
  { id: 'tr7', countyName: 'Kiambu', officialName: 'Hon. Rosemary Kiragu', officialTitle: 'Deputy Governor', destination: 'Kigali, Rwanda', purpose: 'Devolution learning exchange', durationDays: 4, cost: 920000, budgetAllocated: 1000000, anomalyType: 'None', severity: 'low', flagReason: 'Within budget, appropriate purpose', travelDate: '2024-11-30', perDiem: 35000 },
  { id: 'tr8', countyName: 'Kakamega', officialName: 'Hon. Fernandes Barasa', officialTitle: 'Governor', destination: 'New York, USA', purpose: 'UN sustainable development forum', durationDays: 10, cost: 3100000, budgetAllocated: 1500000, anomalyType: 'Over Budget + Extended', severity: 'high', flagReason: 'Cost 207% of budget, 10-day trip for 3-day forum — Kshs 1.6M unaccounted', travelDate: '2024-09-15', perDiem: 60000 },
  { id: 'tr9', countyName: 'Nairobi City', officialName: 'CECM — Finance', officialTitle: 'County Executive Member', destination: 'Mombasa', purpose: 'Budget review workshop', durationDays: 3, cost: 180000, budgetAllocated: 150000, anomalyType: 'Per Diem Inflation', severity: 'medium', flagReason: 'Per-diem claimed at Kshs 18,000/day vs approved rate of Kshs 10,000/day', travelDate: '2024-07-12', perDiem: 18000 },
  { id: 'tr10', countyName: 'Bungoma', officialName: 'Hon. Ken Lusaka', officialTitle: 'Governor', destination: 'Kampala, Uganda', purpose: 'Border trade agreement', durationDays: 2, cost: 320000, budgetAllocated: 350000, anomalyType: 'None', severity: 'low', flagReason: 'Within budget, appropriate purpose', travelDate: '2024-11-10', perDiem: 25000 },
];

const ANOMALY_COLORS: Record<string, string> = {
  'Over Budget': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Extended Duration': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'During Recess': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Over Budget + Extended': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Duplicate Claim': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Per Diem Inflation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'None': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

export function KenyaTravelAudit() {
  const [filter, setFilter] = useState('all');

  const filtered = TRAVEL_RECORDS.filter(t => filter === 'all' || t.severity === filter);

  const stats = {
    total: TRAVEL_RECORDS.length,
    totalCost: TRAVEL_RECORDS.reduce((s, t) => s + t.cost, 0),
    totalBudget: TRAVEL_RECORDS.reduce((s, t) => s + t.budgetAllocated, 0),
    overBudget: TRAVEL_RECORDS.filter(t => t.cost > t.budgetAllocated).length,
    high: TRAVEL_RECORDS.filter(t => t.severity === 'high').length,
    duplicate: TRAVEL_RECORDS.filter(t => t.anomalyType === 'Duplicate Claim').length,
  };

  const overspend = stats.totalCost - stats.totalBudget;
  const overspendPct = ((overspend / stats.totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-cyan-300 dark:border-cyan-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-cyan-600" />
            Travel & Per-Diem Audit
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track county officials' travel expenditure — flag international trips exceeding budget,
            extended durations beyond event scope, duplicate per-diem claims, and travel during
            parliamentary recess when county oversight is weakened.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.high}</p><p className="text-[10px] text-muted-foreground">High Severity</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><TrendingDown className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {(overspend / 1000000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Overspend ({overspendPct}%)</p></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="pt-3 pb-3"><Repeat className="h-3.5 w-3.5 text-purple-600 mb-1" /><p className="text-lg font-bold text-purple-600">{stats.duplicate}</p><p className="text-[10px] text-muted-foreground">Duplicate Claims</p></CardContent></Card>
        <Card className="border-l-4 border-l-cyan-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-cyan-600 mb-1" /><p className="text-lg font-bold text-cyan-600">Kshs {(stats.totalCost / 1000000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Total Travel Cost</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'high', 'medium', 'low'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>

      {/* Travel records */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(record => (
            <Card key={record.id} className={`border-l-4 ${record.severity === 'high' ? 'border-l-red-500' : record.severity === 'medium' ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-sm font-medium">{record.officialName}</h4>
                      <span className="text-[10px] text-muted-foreground">· {record.officialTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{record.countyName}</Badge>
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><Calendar className="h-2.5 w-2.5 mr-0.5" />{new Date(record.travelDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</Badge>
                      <span className="text-[10px] text-muted-foreground">→ {record.destination}</span>
                      <Badge className={`text-[9px] px-1.5 py-0 ${ANOMALY_COLORS[record.anomalyType] || 'bg-muted'}`}>{record.anomalyType}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">Kshs {(record.cost / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-muted-foreground">{record.durationDays}d · Kshs {record.perDiem.toLocaleString()}/day</p>
                  </div>
                </div>

                {/* Budget vs Actual */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground">Budget: Kshs {(record.budgetAllocated / 1000).toFixed(0)}K</span>
                    <span className={`font-medium ${record.cost > record.budgetAllocated ? 'text-red-600' : 'text-emerald-600'}`}>
                      {record.cost > record.budgetAllocated ? '+' : ''}{(((record.cost - record.budgetAllocated) / record.budgetAllocated) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min((record.cost / record.budgetAllocated) * 100, 100)}
                    className={`h-1.5 ${record.cost > record.budgetAllocated ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>

                {/* Purpose */}
                <p className="text-[11px] text-muted-foreground mt-1.5"><strong>Purpose:</strong> {record.purpose}</p>

                {/* Flag reason */}
                {record.severity !== 'low' && (
                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-700 dark:text-red-300">{record.flagReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Analysis */}
      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Travel anomaly patterns:</strong></p>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-4">
                <li>• Cost exceeding budget allocation without supplementary approval</li>
                <li>• Trip duration significantly exceeding event duration (e.g., 10 days for 3-day forum)</li>
                <li>• Per-diem rates above the Salaries and Remuneration Commission (SRC) approved rates</li>
                <li>• Same trip claimed by multiple officials (duplicate per-diem payments)</li>
                <li>• International travel during parliamentary recess (no Senate oversight)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Current findings:</strong> {stats.high} high-severity anomalies, Kshs {(overspend / 1000000).toFixed(1)}M total overspend ({overspendPct}%), {stats.duplicate} duplicate claim pattern(s).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
