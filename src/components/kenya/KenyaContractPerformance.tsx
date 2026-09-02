'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileCheck, AlertTriangle, TrendingDown, MapPin,
  Filter, Info, DollarSign, Clock, CheckCircle2,
  Building2, ChevronRight,
} from 'lucide-react';

interface ContractRecord {
  id: string;
  countyName: string;
  contractTitle: string;
  contractor: string;
  contractValue: number; // Kshs millions
  paidToDate: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  milestonesPaid: number;
  deliveryPct: number;
  paymentPct: number;
  variance: number; // payment - delivery
  status: 'red_flag' | 'warning' | 'on_track' | 'completed';
  flagReason: string;
  signedDate: string;
  deadline: string;
  daysRemaining: number;
}

const CONTRACTS: ContractRecord[] = [
  { id: 'ct1', countyName: 'Nairobi City', contractTitle: 'Dandora waste-to-energy plant', contractor: 'GreenEnergy Ltd', contractValue: 850, paidToDate: 520, milestonesTotal: 8, milestonesCompleted: 1, milestonesPaid: 6, deliveryPct: 12, paymentPct: 61, variance: 49, status: 'red_flag', flagReason: 'Paid for 6/8 milestones but only completed 1 — Kshs 520M paid for 12% delivery', signedDate: '2023-06-15', deadline: '2025-06-15', daysRemaining: -45 },
  { id: 'ct2', countyName: 'Mombasa', contractTitle: 'Makupa causeway expansion', contractor: 'CoastBuild Ltd', contractValue: 1200, paidToDate: 780, milestonesTotal: 10, milestonesCompleted: 2, milestonesPaid: 7, deliveryPct: 20, paymentPct: 65, variance: 45, status: 'red_flag', flagReason: '65% paid, only 20% delivered — deadline passed 45 days ago', signedDate: '2023-03-01', deadline: '2024-12-01', daysRemaining: -45 },
  { id: 'ct3', countyName: 'Kisumu', contractTitle: 'Kisumu stadium phase 2', contractor: 'Lakeside Construction', contractValue: 450, paidToDate: 310, milestonesTotal: 6, milestonesCompleted: 2, milestonesPaid: 4, deliveryPct: 33, paymentPct: 69, variance: 36, status: 'red_flag', flagReason: 'Paid for 4 milestones, completed 2 — contractor abandoned site', signedDate: '2023-08-20', deadline: '2025-02-20', daysRemaining: 30 },
  { id: 'ct4', countyName: 'Nakuru', contractTitle: 'Njoro water supply', contractor: 'RiftValley Water', contractValue: 520, paidToDate: 280, milestonesTotal: 5, milestonesCompleted: 3, milestonesPaid: 3, deliveryPct: 60, paymentPct: 54, variance: -6, status: 'on_track', flagReason: 'Delivery ahead of payment — good practice', signedDate: '2024-01-15', deadline: '2025-06-15', daysRemaining: 120 },
  { id: 'ct5', countyName: 'Kiambu', contractTitle: 'Thika storm drains', contractor: 'Central Infrastructure', contractValue: 340, paidToDate: 195, milestonesTotal: 4, milestonesCompleted: 2, milestonesPaid: 3, deliveryPct: 50, paymentPct: 57, variance: 7, status: 'warning', flagReason: 'Slight payment ahead of delivery — monitor closely', signedDate: '2024-03-01', deadline: '2025-03-01', daysRemaining: 60 },
  { id: 'ct6', countyName: 'Kakamega', contractTitle: 'Kakamega hospital wing B', contractor: 'Western HealthBuild', contractValue: 680, paidToDate: 450, milestonesTotal: 7, milestonesCompleted: 1, milestonesPaid: 5, deliveryPct: 14, paymentPct: 66, variance: 52, status: 'red_flag', flagReason: '66% paid, 14% delivered — no construction activity for 6 months', signedDate: '2023-05-10', deadline: '2025-05-10', daysRemaining: 90 },
  { id: 'ct7', countyName: 'Machakos', contractTitle: 'Machakos hospital expansion', contractor: 'Eastern Construction', contractValue: 750, paidToDate: 410, milestonesTotal: 6, milestonesCompleted: 4, milestonesPaid: 4, deliveryPct: 67, paymentPct: 55, variance: -12, status: 'on_track', flagReason: 'Delivery ahead of payment — contractor performing well', signedDate: '2024-02-01', deadline: '2025-08-01', daysRemaining: 180 },
  { id: 'ct8', countyName: 'Nairobi City', contractTitle: 'County street lighting Phase 3', contractor: 'BrightCity Ltd', contractValue: 220, paidToDate: 220, milestonesTotal: 5, milestonesCompleted: 5, milestonesPaid: 5, deliveryPct: 100, paymentPct: 100, variance: 0, status: 'completed', flagReason: 'All milestones delivered and paid — completed on time', signedDate: '2024-01-01', deadline: '2024-12-01', daysRemaining: 0 },
  { id: 'ct9', countyName: 'Bungoma', contractTitle: 'Bungoma market construction', contractor: 'Western Markets Ltd', contractValue: 280, paidToDate: 160, milestonesTotal: 5, milestonesCompleted: 2, milestonesPaid: 3, deliveryPct: 40, paymentPct: 57, variance: 17, status: 'warning', flagReason: 'Community dispute over land — payment slightly ahead of delivery', signedDate: '2024-04-01', deadline: '2025-04-01', daysRemaining: 90 },
  { id: 'ct10', countyName: 'Meru', contractTitle: 'Meru referral hospital', contractor: 'Meru Health Partners', contractValue: 680, paidToDate: 420, milestonesTotal: 6, milestonesCompleted: 4, milestonesPaid: 4, deliveryPct: 67, paymentPct: 62, variance: -5, status: 'on_track', flagReason: 'Good progress — delivery ahead of payment', signedDate: '2024-02-15', deadline: '2025-08-15', daysRemaining: 150 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  red_flag: { label: 'Red Flag', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
  warning: { label: 'Warning', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <Clock className="h-3 w-3" /> },
  on_track: { label: 'On Track', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function KenyaContractPerformance() {
  const [filter, setFilter] = useState('all');

  const filtered = CONTRACTS.filter(c => filter === 'all' || c.status === filter);

  const stats = {
    total: CONTRACTS.length,
    redFlags: CONTRACTS.filter(c => c.status === 'red_flag').length,
    totalValue: CONTRACTS.reduce((s, c) => s + c.contractValue, 0),
    totalPaid: CONTRACTS.reduce((s, c) => s + c.paidToDate, 0),
    overdue: CONTRACTS.filter(c => c.daysRemaining < 0).length,
    avgVariance: Math.round(CONTRACTS.reduce((s, c) => s + c.variance, 0) / CONTRACTS.length),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-indigo-300 dark:border-indigo-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-600" />
            Contract Performance Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track contract milestone delivery vs payment. When payment significantly exceeds
            delivery, funds may have been diverted. Red flag: payment % minus delivery % &gt; 30%.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.redFlags}</p><p className="text-[10px] text-muted-foreground">Red Flag Contracts</p></CardContent></Card>
        <Card className="border-l-4 border-l-indigo-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-indigo-600 mb-1" /><p className="text-lg font-bold text-indigo-600">Kshs {stats.totalPaid}M</p><p className="text-[10px] text-muted-foreground">Paid to Date</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><Clock className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">{stats.overdue}</p><p className="text-[10px] text-muted-foreground">Overdue Deadlines</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-3 pb-3"><TrendingDown className="h-3.5 w-3.5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-600">+{stats.avgVariance}%</p><p className="text-[10px] text-muted-foreground">Avg Payment-Delivery Gap</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'red_flag', 'warning', 'on_track', 'completed'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s.replace('_', ' ')}</Button>)}
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(c => {
            const status = STATUS_CONFIG[c.status];
            return (
              <Card key={c.id} className={`border-l-4 ${c.status === 'red_flag' ? 'border-l-red-500' : c.status === 'warning' ? 'border-l-orange-500' : c.status === 'completed' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{c.contractTitle}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{c.countyName}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><Building2 className="h-2.5 w-2.5 mr-0.5" />{c.contractor}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.icon}<span className="ml-0.5">{status.label}</span></Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">Kshs {c.contractValue}M</p>
                      <p className="text-[10px] text-muted-foreground">Paid: Kshs {c.paidToDate}M</p>
                    </div>
                  </div>

                  {/* Milestone progress */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium">{c.deliveryPct}%</span>
                      </div>
                      <Progress value={c.deliveryPct} className="h-2 [&>div]:bg-blue-500" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.milestonesCompleted}/{c.milestonesTotal} milestones completed</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium">{c.paymentPct}%</span>
                      </div>
                      <Progress value={c.paymentPct} className={`h-2 ${c.variance > 30 ? '[&>div]:bg-red-500' : c.variance > 10 ? '[&>div]:bg-orange-500' : '[&>div]:bg-emerald-500'}`} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.milestonesPaid}/{c.milestonesTotal} milestones paid</p>
                    </div>
                  </div>

                  {/* Variance indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">Payment-Delivery Gap:</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${c.variance > 30 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : c.variance > 10 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'}`}>
                      {c.variance > 0 ? '+' : ''}{c.variance}%
                    </Badge>
                    {c.daysRemaining < 0 && <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">OVERDUE {Math.abs(c.daysRemaining)}d</Badge>}
                    {c.daysRemaining > 0 && c.daysRemaining <= 30 && <Badge className="text-[9px] px-1.5 py-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{c.daysRemaining}d left</Badge>}
                  </div>

                  {/* Flag reason */}
                  {c.status !== 'completed' && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-700 dark:text-red-300">{c.flagReason}</p>
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
              <p className="text-xs text-muted-foreground"><strong>Red flag formula:</strong> Payment % minus Delivery % &gt; 30% = suspicious fund diversion. The county paid for work that hasn't been done.</p>
              <p className="text-xs text-muted-foreground"><strong>Best practice:</strong> Payment should follow delivery (negative variance). When delivery exceeds payment, the contractor is financing the project — a sign of healthy procurement.</p>
              <p className="text-[10px] text-muted-foreground italic">Data sourced from county contract management systems (e-ProMIS) and CoB budget implementation reports.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
