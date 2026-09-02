'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone, MessageSquare, Mail, Smartphone, AlertTriangle,
  MapPin, Filter, Info, TrendingUp, ShieldAlert,
} from 'lucide-react';

interface HotlineReport {
  id: string;
  channel: 'SMS' | 'WhatsApp' | 'Toll-Free Call' | 'Web Form' | 'Email' | 'Mobile App';
  countyName: string;
  category: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'escalated';
  date: string;
  reporterAnonymous: boolean;
}

const CHANNEL_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  'SMS': { icon: <Smartphone className="h-3.5 w-3.5" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'WhatsApp': { icon: <MessageSquare className="h-3.5 w-3.5" />, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'Toll-Free Call': { icon: <Phone className="h-3.5 w-3.5" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'Web Form': { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  'Email': { icon: <Mail className="h-3.5 w-3.5" />, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  'Mobile App': { icon: <Smartphone className="h-3.5 w-3.5" />, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  investigating: { label: 'Investigating', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const HOTLINE_REPORTS: HotlineReport[] = [
  { id: 'h1', channel: 'Toll-Free Call', countyName: 'Nairobi City', category: 'Bribery', description: 'Traffic officers at Westlands demanding Kshs 500 to waive violations', status: 'escalated', date: '2024-12-01', reporterAnonymous: true },
  { id: 'h2', channel: 'WhatsApp', countyName: 'Mombasa', category: 'Procurement Fraud', description: 'Tender for market renovation awarded to MCAs brother without competition', status: 'investigating', date: '2024-11-28', reporterAnonymous: false },
  { id: 'h3', channel: 'SMS', countyName: 'Kisumu', category: 'Revenue Leakage', description: 'Market fees collected but not banked — county revenue officer pocketing cash', status: 'investigating', date: '2024-11-25', reporterAnonymous: true },
  { id: 'h4', channel: 'Web Form', countyName: 'Nakuru', category: 'Project Abandonment', description: 'Road project in Bahati stalled for 8 months but contractor paid 70%', status: 'new', date: '2024-12-03', reporterAnonymous: true },
  { id: 'h5', channel: 'Mobile App', countyName: 'Kiambu', category: 'Embezzlement', description: 'CECM Health diverted medical supplies to private clinic in Thika', status: 'escalated', date: '2024-11-30', reporterAnonymous: true },
  { id: 'h6', channel: 'Email', countyName: 'Kakamega', category: 'Ghost Workers', description: 'Payroll has 15 names that dont match any biometric data — ghost workers', status: 'resolved', date: '2024-11-20', reporterAnonymous: false },
  { id: 'h7', channel: 'Toll-Free Call', countyName: 'Machakos', category: 'Bribery', description: 'Lands office demanding Kshs 50,000 for title deed processing', status: 'investigating', date: '2024-12-02', reporterAnonymous: true },
  { id: 'h8', channel: 'WhatsApp', countyName: 'Bungoma', category: 'Pending Bills', description: 'Contractor not paid for 14 months despite work completion — Kshs 8M owed', status: 'new', date: '2024-12-05', reporterAnonymous: true },
  { id: 'h9', channel: 'SMS', countyName: 'Nairobi City', category: 'Asset Grabbing', description: 'County land in Embakasi allocated to private developer without approval', status: 'escalated', date: '2024-11-29', reporterAnonymous: true },
  { id: 'h10', channel: 'Web Form', countyName: 'Kisumu', category: 'Procurement Fraud', description: 'Single-source tender for Kshs 45M awarded to company registered 1 month ago', status: 'investigating', date: '2024-12-04', reporterAnonymous: false },
  { id: 'h11', channel: 'Mobile App', countyName: 'Nakuru', category: 'Embezzlement', description: 'Bursary funds diverted — 30 students denied bursary despite budget allocated', status: 'new', date: '2024-12-06', reporterAnonymous: true },
  { id: 'h12', channel: 'Toll-Free Call', countyName: 'Kwale', category: 'Revenue Leakage', description: 'Mining royalties not remitted — Kshs 12M unbanked for 3 months', status: 'resolved', date: '2024-11-18', reporterAnonymous: false },
];

export function KenyaHotlineAggregator() {
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = HOTLINE_REPORTS
    .filter(r => filterChannel === 'all' || r.channel === filterChannel)
    .filter(r => filterStatus === 'all' || r.status === filterStatus);

  const stats = {
    total: HOTLINE_REPORTS.length,
    new: HOTLINE_REPORTS.filter(r => r.status === 'new').length,
    escalated: HOTLINE_REPORTS.filter(r => r.status === 'escalated').length,
    resolved: HOTLINE_REPORTS.filter(r => r.status === 'resolved').length,
    byChannel: Object.keys(CHANNEL_CONFIG).map(ch => ({ channel: ch, count: HOTLINE_REPORTS.filter(r => r.channel === ch).length })).filter(c => c.count > 0),
    counties: new Set(HOTLINE_REPORTS.map(r => r.countyName)).size,
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-pink-300 dark:border-pink-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5 text-pink-600" />
            Hotline & SMS Report Aggregator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aggregate citizen corruption reports from all channels — toll-free calls (0800 720 141),
            WhatsApp, SMS, web forms, email, and mobile app. Track resolution rates and escalate
            high-priority cases to EACC.
          </p>
          <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-[10px] w-fit gap-1">
            <ShieldAlert className="h-2.5 w-2.5" /> Multi-Channel Aggregation
          </Badge>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-blue-600 mb-1" /><p className="text-lg font-bold text-blue-600">{stats.new}</p><p className="text-[10px] text-muted-foreground">New Reports</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><ShieldAlert className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.escalated}</p><p className="text-[10px] text-muted-foreground">Escalated to EACC</p></CardContent></Card>
        <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-3 pb-3"><TrendingUp className="h-3.5 w-3.5 text-emerald-600 mb-1" /><p className="text-lg font-bold text-emerald-600">{stats.resolved}</p><p className="text-[10px] text-muted-foreground">Resolved</p></CardContent></Card>
        <Card className="border-l-4 border-l-pink-500"><CardContent className="pt-3 pb-3"><Phone className="h-3.5 w-3.5 text-pink-600 mb-1" /><p className="text-lg font-bold text-pink-600">{stats.total}</p><p className="text-[10px] text-muted-foreground">Total Reports ({stats.counties} counties)</p></CardContent></Card>
      </div>

      {/* Channel breakdown */}
      <div className="flex items-center gap-2 flex-wrap">
        {stats.byChannel.map(c => {
          const cfg = CHANNEL_CONFIG[c.channel];
          return (
            <Badge key={c.channel} className={`text-[10px] px-2 py-1 ${cfg.color}`}>
              {cfg.icon}<span className="ml-0.5">{c.channel}: {c.count}</span>
            </Badge>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Channel:</span>
        <Button variant={filterChannel === 'all' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilterChannel('all')}>All</Button>
        {Object.keys(CHANNEL_CONFIG).map(ch => <Button key={ch} variant={filterChannel === ch ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilterChannel(ch)}>{ch}</Button>)}
        <span className="text-xs text-muted-foreground ml-2">Status:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-7 text-xs border rounded-md px-2 bg-background">
          <option value="all">All</option><option value="new">New</option><option value="investigating">Investigating</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Reports */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(r => {
            const channel = CHANNEL_CONFIG[r.channel];
            const status = STATUS_CONFIG[r.status];
            return (
              <Card key={r.id} className={`border-l-4 ${r.status === 'escalated' ? 'border-l-red-500' : r.status === 'new' ? 'border-l-blue-500' : r.status === 'resolved' ? 'border-l-emerald-500' : 'border-l-yellow-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Badge className={`text-[9px] px-1.5 py-0 ${channel.color}`}>{channel.icon}<span className="ml-0.5">{r.channel}</span></Badge>
                      <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.label}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p className="text-xs mt-1">{r.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{r.countyName}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{r.category}</Badge>
                    {r.reporterAnonymous && <span className="text-muted-foreground">· Anonymous</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Hotline info */}
      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <strong>EACC Hotline:</strong> Toll-free 0800 720 141 · WhatsApp +254 703 099 900 ·
                Email: corruption-reporting@eacc.go.ke · SMS: SMS code 70707
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>How it works:</strong> Citizens report corruption through any channel. Reports are
                aggregated here, categorized, and routed to the appropriate county monitoring team.
                High-severity cases are escalated to EACC for formal investigation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
