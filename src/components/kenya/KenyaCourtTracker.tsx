'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Gavel, AlertTriangle, Clock, CheckCircle2, MapPin,
  Filter, Info, Scale, Building2, User,
} from 'lucide-react';

interface CourtCase {
  id: string;
  caseNumber: string;
  countyName: string;
  defendantName: string;
  defendantTitle: string;
  charge: string;
  amountInvolved: number; // Kshs millions
  court: string;
  status: 'ongoing' | 'convicted' | 'acquitted' | 'appeal' | 'withdrawn';
  filedDate: string;
  prosecutingBody: string;
  severity: 'high' | 'medium' | 'low';
}

const COURT_CASES: CourtCase[] = [
  { id: 'c1', caseNumber: 'EACC/CORR/2024/001', countyName: 'Machakos', defendantName: 'Hon. Wavinya Ndeti', defendantTitle: 'Governor', charge: 'Misappropriation of Kshs 180M county funds', amountInvolved: 180, court: 'Anti-Corruption Court, Machakos', status: 'ongoing', filedDate: '2024-04-15', prosecutingBody: 'EACC', severity: 'high' },
  { id: 'c2', caseNumber: 'EACC/CORR/2024/007', countyName: 'Meru', defendantName: 'Hon. Kawira Mwangaza', defendantTitle: 'Governor', charge: 'Abuse of office — irregular appointments and dismissals', amountInvolved: 45, court: 'Employment Court, Nyeri', status: 'ongoing', filedDate: '2024-03-20', prosecutingBody: 'EACC', severity: 'high' },
  { id: 'c3', caseNumber: 'DPP/CR/2023/892', countyName: 'Nairobi City', defendantName: 'CECM — Finance', defendantTitle: 'County Executive Member', charge: 'Fraudulent procurement — Kshs 320M inflated invoices', amountInvolved: 320, court: 'Milimani Anti-Corruption Court', status: 'ongoing', filedDate: '2023-11-08', prosecutingBody: 'DPP', severity: 'high' },
  { id: 'c4', caseNumber: 'EACC/CORR/2022/234', countyName: 'Kwale', defendantName: 'County Treasurer', defendantTitle: 'County Treasurer', charge: 'Embezzlement of mining royalties — Kshs 78M', amountInvolved: 78, court: 'Anti-Corruption Court, Mombasa', status: 'convicted', filedDate: '2022-06-15', prosecutingBody: 'EACC', severity: 'high' },
  { id: 'c5', caseNumber: 'DPP/CR/2023/445', countyName: 'Kisumu', defendantName: 'Director — Procurement', defendantTitle: 'Director', charge: 'Tender fraud — split tenders to avoid threshold', amountInvolved: 55, court: 'Anti-Corruption Court, Kisumu', status: 'ongoing', filedDate: '2023-09-22', prosecutingBody: 'DPP', severity: 'medium' },
  { id: 'c6', caseNumber: 'EACC/CORR/2023/678', countyName: 'Nakuru', defendantName: 'MCA — Bahati Ward', defendantTitle: 'MCA', charge: 'Bribery — soliciting Kshs 2M from contractor', amountInvolved: 2, court: 'Anti-Corruption Court, Nakuru', status: 'convicted', filedDate: '2023-07-18', prosecutingBody: 'EACC', severity: 'medium' },
  { id: 'c7', caseNumber: 'DPP/CR/2024/123', countyName: 'Bungoma', defendantName: 'CECM — Health', defendantTitle: 'County Executive Member', charge: 'Fraudulent medical supplies — ghost invoices', amountInvolved: 95, court: 'Anti-Corruption Court, Bungoma', status: 'appeal', filedDate: '2024-01-30', prosecutingBody: 'DPP', severity: 'high' },
  { id: 'c8', caseNumber: 'EACC/CORR/2023/891', countyName: 'Mombasa', defendantName: 'Chief Officer — Lands', defendantTitle: 'Chief Officer', charge: 'Land fraud — illegal allocation of public land', amountInvolved: 150, court: 'Anti-Corruption Court, Mombasa', status: 'ongoing', filedDate: '2023-10-05', prosecutingBody: 'EACC', severity: 'high' },
  { id: 'c9', caseNumber: 'DPP/CR/2022/567', countyName: 'Kakamega', defendantName: 'Revenue Officer', defendantTitle: 'Revenue Officer', charge: 'Unbanked revenue — Kshs 12M diverted', amountInvolved: 12, court: 'Anti-Corruption Court, Kakamega', status: 'convicted', filedDate: '2022-08-12', prosecutingBody: 'DPP', severity: 'medium' },
  { id: 'c10', caseNumber: 'EACC/CORR/2024/345', countyName: 'Kiambu', defendantName: 'Supply Chain Officer', defendantTitle: 'Supply Chain Officer', charge: 'Procurement fraud — awarded tenders to own company', amountInvolved: 65, court: 'Anti-Corruption Court, Kiambu', status: 'ongoing', filedDate: '2024-05-20', prosecutingBody: 'EACC', severity: 'high' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ongoing: { label: 'Ongoing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <Clock className="h-3 w-3" /> },
  convicted: { label: 'Convicted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
  acquitted: { label: 'Acquitted', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  appeal: { label: 'On Appeal', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <Gavel className="h-3 w-3" /> },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground', icon: <Scale className="h-3 w-3" /> },
};

export function KenyaCourtTracker() {
  const [filter, setFilter] = useState('all');

  const filtered = COURT_CASES.filter(c => filter === 'all' || c.status === filter);

  const stats = {
    total: COURT_CASES.length,
    ongoing: COURT_CASES.filter(c => c.status === 'ongoing').length,
    convicted: COURT_CASES.filter(c => c.status === 'convicted').length,
    totalAmount: COURT_CASES.reduce((s, c) => s + c.amountInvolved, 0),
    eaccCases: COURT_CASES.filter(c => c.prosecutingBody === 'EACC').length,
    counties: new Set(COURT_CASES.map(c => c.countyName)).size,
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-slate-400 dark:border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gavel className="h-5 w-5 text-slate-600" />
            Litigation & Court Cases Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track corruption cases in court per county — filed by EACC and DPP against county
            officials for embezzlement, procurement fraud, bribery, land fraud, and abuse of office.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-3 pb-3"><Clock className="h-3.5 w-3.5 text-yellow-600 mb-1" /><p className="text-lg font-bold text-yellow-600">{stats.ongoing}</p><p className="text-[10px] text-muted-foreground">Ongoing Cases</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.convicted}</p><p className="text-[10px] text-muted-foreground">Convicted</p></CardContent></Card>
        <Card className="border-l-4 border-l-slate-500"><CardContent className="pt-3 pb-3"><Scale className="h-3.5 w-3.5 text-slate-600 mb-1" /><p className="text-lg font-bold text-slate-600">Kshs {stats.totalAmount}M</p><p className="text-[10px] text-muted-foreground">Total Amount at Stake</p></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="pt-3 pb-3"><Gavel className="h-3.5 w-3.5 text-purple-600 mb-1" /><p className="text-lg font-bold text-purple-600">{stats.eaccCases}</p><p className="text-[10px] text-muted-foreground">EACC Cases</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {['all', 'ongoing', 'convicted', 'appeal', 'acquitted'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>

      {/* Cases */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(c => {
            const status = STATUS_CONFIG[c.status];
            return (
              <Card key={c.id} className={`border-l-4 ${c.status === 'convicted' ? 'border-l-red-500' : c.status === 'ongoing' ? 'border-l-yellow-500' : c.status === 'appeal' ? 'border-l-orange-500' : 'border-l-slate-400'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">{c.caseNumber}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.icon}<span className="ml-0.5">{status.label}</span></Badge>
                      </div>
                      <h4 className="text-sm font-medium mt-1">{c.defendantName}</h4>
                      <p className="text-xs text-muted-foreground">{c.defendantTitle} · {c.countyName} County</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-600">Kshs {c.amountInvolved}M</p>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5">{c.prosecutingBody}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Charge:</strong> {c.charge}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{c.court}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />Filed: {new Date(c.filedDate).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
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
                <strong>Prosecuting bodies:</strong> The Ethics and Anti-Corruption Commission (EACC)
                investigates and recommends prosecution. The Director of Public Prosecutions (DPP)
                files cases in the Anti-Corruption Courts established under the Anti-Corruption and
                Economic Crimes Act 2003.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Current scope:</strong> {stats.total} cases across {stats.counties} counties,
                Kshs {stats.totalAmount}M total amount at stake. {stats.ongoing} ongoing, {stats.convicted} convicted.
                Average case duration in Kenya: 3-5 years from filing to verdict.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
