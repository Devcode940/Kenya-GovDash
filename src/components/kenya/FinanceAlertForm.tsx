'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCountiesWithFinanceData } from '@/lib/finance-audit-data';

const METRICS = [
  { value: 'overallAbsorption', label: 'Overall Absorption', defaultThreshold: 50, unit: '%' },
  { value: 'developmentAbsorption', label: 'Development Absorption', defaultThreshold: 30, unit: '%' },
  { value: 'pendingBills', label: 'Pending Bills', defaultThreshold: 5000, unit: 'Kshs M' },
  { value: 'auditOpinion', label: 'Audit Opinion Change', defaultThreshold: null, unit: '' },
];

export function FinanceAlertForm() {
  const { toast } = useToast();
  const counties = getCountiesWithFinanceData();
  const [email, setEmail] = useState('');
  const [countyName, setCountyName] = useState('Nairobi City');
  const [metric, setMetric] = useState('overallAbsorption');
  const [threshold, setThreshold] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  const handleMetricChange = (m: string) => {
    setMetric(m);
    const meta = METRICS.find(x => x.value === m)!;
    setThreshold(meta.defaultThreshold?.toString() || '');
  };

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Enter a valid email', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/finance-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          countyName,
          metric,
          threshold: threshold ? Number(threshold) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Alert subscription created', description: data.message });
        setEmail('');
      } else {
        toast({ title: 'Failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const meta = METRICS.find(m => m.value === metric)!;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base">Subscribe to Finance Alerts</CardTitle>
        </div>
        <CardDescription>
          Get notified when a county&apos;s finance metrics breach your threshold.
          Alerts are checked when new FinanceAuditSnapshots are published.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Email address</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">County</Label>
            <Select value={countyName} onValueChange={setCountyName}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Metric</Label>
            <Select value={metric} onValueChange={handleMetricChange}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METRICS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {meta.defaultThreshold != null && (
          <div>
            <Label className="text-xs">
              Threshold ({meta.unit}) — {metric === 'pendingBills' ? 'alert when above' : 'alert when below'}
            </Label>
            <Input
              type="number"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        {metric === 'auditOpinion' && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
            <AlertCircle className="inline h-3 w-3 mr-1" />
            You will be alerted whenever this county&apos;s audit opinion worsens (e.g., Unmodified → Qualified).
          </div>
        )}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
          Create alert subscription
        </Button>
        <p className="text-xs text-muted-foreground">
          <CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-600" />
          Subscriptions are auto-confirmed in dev. In production, you&apos;ll receive a confirmation email.
          Unsubscribe anytime via the link in alert emails.
        </p>
      </CardContent>
    </Card>
  );
}
