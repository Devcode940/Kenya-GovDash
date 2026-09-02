'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, AlertTriangle, TrendingUp, DollarSign, Clock,
  MapPin, Filter, Info, RefreshCw, CheckCircle2, X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  countyName: string;
  department: string;
  alertType: string;
  threshold: string;
  actualValue: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

const INITIAL_ALERTS: Alert[] = [
  { id: 'a1', countyName: 'Nairobi City', department: 'Health', alertType: 'Overspend Alert', threshold: 'Budget: Kshs 8,500M', actualValue: 'Spent: Kshs 11,200M (131.8%)', severity: 'critical', message: 'Health department has exceeded approved budget by 31.8% — no supplementary appropriation', triggeredAt: '2024-12-01T08:00:00Z', acknowledged: false },
  { id: 'a2', countyName: 'Mombasa', department: 'Water', alertType: 'Underspend Alert', threshold: 'Budget: Kshs 1,500M', actualValue: 'Spent: Kshs 680M (45.3%)', severity: 'warning', message: 'Water department at 45% of budget at Q3 — projects not implemented', triggeredAt: '2024-11-28T10:30:00Z', acknowledged: false },
  { id: 'a3', countyName: 'Bungoma', department: 'Revenue', alertType: 'Revenue Shortfall', threshold: 'Target: Kshs 1,500M', actualValue: 'Collected: Kshs 720M (48%)', severity: 'critical', message: 'Revenue collection at 48% — Kshs 165M unbanked cash detected', triggeredAt: '2024-12-05T14:00:00Z', acknowledged: false },
  { id: 'a4', countyName: 'Nairobi City', department: 'Pending Bills', alertType: 'Pending Bill Threshold', threshold: 'Limit: 10% of budget', actualValue: 'Pending: 11.2% (Kshs 4.31B)', severity: 'critical', message: 'Pending bills exceeded 10% threshold — suppliers unpaid for 90+ days', triggeredAt: '2024-11-30T09:00:00Z', acknowledged: true },
  { id: 'a5', countyName: 'Kiambu', department: 'Debt Service', alertType: 'Debt Limit Breach', threshold: 'PFM Act: 20% of revenue', actualValue: 'Debt service: 26%', severity: 'critical', message: 'Debt service ratio at 26% exceeds PFM Act 20% limit', triggeredAt: '2024-12-02T16:00:00Z', acknowledged: false },
  { id: 'a6', countyName: 'Machakos', department: 'Travel', alertType: 'Travel Overspend', threshold: 'Budget: Kshs 800K', actualValue: 'Cost: Kshs 850K (106%)', severity: 'warning', message: 'Travel cost exceeded budget by 6% — no supplementary approval', triggeredAt: '2024-12-03T11:00:00Z', acknowledged: false },
  { id: 'a7', countyName: 'Kisumu', department: 'Projects', alertType: 'Stalled Project', threshold: 'Completion: >50%', actualValue: 'Completion: 12%, Paid: 69%', severity: 'critical', message: 'Stadium Phase 2: paid 69% but only 12% complete — contractor abandoned site', triggeredAt: '2024-11-25T13:00:00Z', acknowledged: false },
  { id: 'a8', countyName: 'Mombasa', department: 'Procurement', alertType: 'Single-Source Anomaly', threshold: 'Limit: Kshs 5M', actualValue: 'Value: Kshs 85M single-source', severity: 'warning', message: 'Single-source tender above Kshs 5M threshold awarded to company registered 2 months ago', triggeredAt: '2024-11-03T10:00:00Z', acknowledged: true },
  { id: 'a9', countyName: 'Nakuru', department: 'Revenue', alertType: 'Unbanked Cash', threshold: 'PFM Act: 24hr banking', actualValue: 'Unbanked: Kshs 95M (30 days)', severity: 'warning', message: 'Kshs 95M revenue not banked for 30 days — PFM Act requires 24hr banking', triggeredAt: '2024-12-06T08:00:00Z', acknowledged: false },
  { id: 'a10', countyName: 'Kakamega', department: 'Health', alertType: 'Ghost Worker Detected', threshold: 'Biometric: Required', actualValue: 'Status: No biometric match', severity: 'critical', message: 'Payroll entry has no biometric match — Kshs 65K/month being paid to unverifiable employee', triggeredAt: '2024-12-04T15:00:00Z', acknowledged: false },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  warning: { label: 'Warning', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <Clock className="h-3.5 w-3.5" /> },
  info: { label: 'Info', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <Info className="h-3.5 w-3.5" /> },
};

export function KenyaExpenditureAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filtered = alerts
    .filter(a => filter === 'all' || a.severity === filter)
    .filter(a => showAcknowledged || !a.acknowledged);

  const acknowledge = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast({ title: 'Alert acknowledged', description: 'Alert marked as reviewed.' });
  };

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    counties: new Set(alerts.map(a => a.countyName)).size,
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-red-300 dark:border-red-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            Real-Time Expenditure Alert System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated threshold-based alerts when county spending exceeds limits, revenue
            shortfalls are detected, pending bills breach thresholds, or projects stall.
            All alerts are constitutional compliance notifications under Articles 201 and 228.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.critical}</p><p className="text-[10px] text-muted-foreground">Critical (Unacknowledged)</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><Clock className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">{stats.warning}</p><p className="text-[10px] text-muted-foreground">Warnings (Unacknowledged)</p></CardContent></Card>
        <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-3 pb-3"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mb-1" /><p className="text-lg font-bold text-emerald-600">{stats.acknowledged}</p><p className="text-[10px] text-muted-foreground">Acknowledged</p></CardContent></Card>
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-3 pb-3"><MapPin className="h-3.5 w-3.5 text-blue-600 mb-1" /><p className="text-lg font-bold text-blue-600">{stats.counties}</p><p className="text-[10px] text-muted-foreground">Counties with Alerts</p></CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'critical', 'warning', 'info'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
        <Button variant={showAcknowledged ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setShowAcknowledged(!showAcknowledged)}>
          {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
        </Button>
      </div>

      {/* Alerts */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm">No active alerts. All thresholds are within limits.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(alert => {
              const sev = SEVERITY_CONFIG[alert.severity];
              return (
                <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`text-[9px] px-1.5 py-0 ${sev.color}`}>{sev.icon}<span className="ml-0.5">{sev.label}</span></Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{alert.alertType}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{alert.countyName}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{alert.department}</Badge>
                      </div>
                      {alert.acknowledged ? (
                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shrink-0"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Reviewed</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => acknowledge(alert.id)} aria-label="Acknowledge alert"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      )}
                    </div>

                    <p className="text-xs mt-1">{alert.message}</p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>Threshold: {alert.threshold}</span>
                      <span>·</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{alert.actualValue}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(alert.triggeredAt).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Alert types legend */}
      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Alert types monitored:</strong></p>
              <div className="flex flex-wrap gap-1">
                {['Overspend Alert', 'Underspend Alert', 'Revenue Shortfall', 'Pending Bill Threshold', 'Debt Limit Breach', 'Travel Overspend', 'Stalled Project', 'Single-Source Anomaly', 'Unbanked Cash', 'Ghost Worker Detected'].map(t => (
                  <Badge key={t} variant="outline" className="text-[9px] px-1 py-0">{t}</Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic mt-1">Alerts are triggered automatically when financial data from CoB, OAG, and county systems crosses predefined thresholds. Each alert references the specific constitutional or statutory provision being violated.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
