'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileSearch, AlertTriangle, TrendingUp, Users, Building2,
  MapPin, Filter, Info, ChevronRight, Clock, DollarSign,
  Repeat, UserPlus, ShieldAlert,
} from 'lucide-react';

interface TenderRecord {
  id: string;
  countyName: string;
  tenderTitle: string;
  awardedCompany: string;
  companyRegistration: string;
  companyAgeMonths: number;
  tenderValue: number; // Kshs millions
  procurementMethod: 'single_source' | 'restricted' | 'open';
  anomalyType: string;
  severity: 'high' | 'medium' | 'low';
  flagReason: string;
  awardedDate: string;
}

const TENDERS: TenderRecord[] = [
  { id: 't1', countyName: 'Nairobi City', tenderTitle: 'Supply of medical equipment to county hospitals', awardedCompany: 'MediSupply Kenya Ltd', companyRegistration: 'CR/2024/001234', companyAgeMonths: 3, tenderValue: 45, procurementMethod: 'single_source', anomalyType: 'New Company Award', severity: 'high', flagReason: 'Company registered only 3 months before award — possible shell company', awardedDate: '2024-09-15' },
  { id: 't2', countyName: 'Nairobi City', tenderTitle: 'Road maintenance — Dandora phase 2', awardedCompany: 'BuildRight Construction', companyRegistration: 'CR/2018/005678', companyAgeMonths: 72, tenderValue: 120, procurementMethod: 'single_source', anomalyType: 'Single-Source Above Threshold', severity: 'high', flagReason: 'Single-source procurement of Kshs 120M exceeds Kshs 5M threshold without competition', awardedDate: '2024-08-22' },
  { id: 't3', countyName: 'Mombasa', tenderTitle: 'Supply of office furniture', awardedCompany: 'Coastal Furnishings Ltd', companyRegistration: 'CR/2019/008912', companyAgeMonths: 60, tenderValue: 18, procurementMethod: 'restricted', anomalyType: 'Repeat Award', severity: 'medium', flagReason: 'Same company awarded 4 tenders in 12 months totaling Kshs 72M', awardedDate: '2024-10-01' },
  { id: 't4', countyName: 'Kisumu', tenderTitle: 'Lake Victoria ferry repair contract', awardedCompany: 'MarineTech Services', companyRegistration: 'CR/2024/004567', companyAgeMonths: 2, tenderValue: 85, procurementMethod: 'single_source', anomalyType: 'New Company + Single Source', severity: 'high', flagReason: 'Company registered 2 months ago, awarded Kshs 85M single-source — major red flag', awardedDate: '2024-11-03' },
  { id: 't5', countyName: 'Nakuru', tenderTitle: 'Water tanker hire services', awardedCompany: 'AquaFlow Logistics', companyRegistration: 'CR/2020/002345', companyAgeMonths: 48, tenderValue: 8, procurementMethod: 'restricted', anomalyType: 'Price Inflation', severity: 'medium', flagReason: 'Unit price 340% above market rate — Kshs 45,000/trip vs market Kshs 12,000', awardedDate: '2024-07-18' },
  { id: 't6', countyName: 'Kiambu', tenderTitle: 'Construction of county HQ parking lot', awardedCompany: 'PrimeBuild Ltd', companyRegistration: 'CR/2023/007890', companyAgeMonths: 8, tenderValue: 65, procurementMethod: 'single_source', anomalyType: 'New Company Award', severity: 'medium', flagReason: 'Company registered 8 months ago, awarded Kshs 65M construction tender', awardedDate: '2024-09-30' },
  { id: 't7', countyName: 'Kakamega', tenderTitle: 'Supply of fertilizers to farmers', awardedCompany: 'AgroPlus Distributors', companyRegistration: 'CR/2017/001122', companyAgeMonths: 84, tenderValue: 32, procurementMethod: 'restricted', anomalyType: 'Repeat Award', severity: 'low', flagReason: 'Company awarded 3 tenders in 12 months — verify competition compliance', awardedDate: '2024-10-15' },
  { id: 't8', countyName: 'Machakos', tenderTitle: 'ICT equipment supply for county offices', awardedCompany: 'TechConnect Solutions', companyRegistration: 'CR/2024/009988', companyAgeMonths: 1, tenderValue: 28, procurementMethod: 'single_source', anomalyType: 'New Company + Single Source', severity: 'high', flagReason: 'Company registered 1 month ago — shell company suspicion, Kshs 28M single-source', awardedDate: '2024-11-20' },
  { id: 't9', countyName: 'Bungoma', tenderTitle: 'Construction of health center', awardedCompany: 'Western Builders Ltd', companyRegistration: 'CR/2015/004455', companyAgeMonths: 108, tenderValue: 95, procurementMethod: 'open', anomalyType: 'Price Inflation', severity: 'medium', flagReason: 'Tender value 220% above engineer\'s estimate of Kshs 43M', awardedDate: '2024-08-10' },
  { id: 't10', countyName: 'Nairobi City', tenderTitle: 'Garbage collection — Zone A', awardedCompany: 'CleanCity Services', companyRegistration: 'CR/2021/006677', companyAgeMonths: 36, tenderValue: 55, procurementMethod: 'restricted', anomalyType: 'Repeat Award + Price', severity: 'high', flagReason: '6th consecutive award, unit price 180% above market — monopoly pattern', awardedDate: '2024-10-05' },
];

const ANOMALY_ICONS: Record<string, React.ReactNode> = {
  'New Company Award': <UserPlus className="h-3.5 w-3.5" />,
  'Single-Source Above Threshold': <ShieldAlert className="h-3.5 w-3.5" />,
  'Repeat Award': <Repeat className="h-3.5 w-3.5" />,
  'New Company + Single Source': <AlertTriangle className="h-3.5 w-3.5" />,
  'Price Inflation': <TrendingUp className="h-3.5 w-3.5" />,
  'Repeat Award + Price': <AlertTriangle className="h-3.5 w-3.5" />,
};

export function KenyaTenderAnomaly() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const anomalyTypes = ['all', ...Array.from(new Set(TENDERS.map(t => t.anomalyType)))];
  const filtered = TENDERS
    .filter(t => filterSeverity === 'all' || t.severity === filterSeverity)
    .filter(t => filterType === 'all' || t.anomalyType === filterType);

  const stats = {
    total: TENDERS.length,
    high: TENDERS.filter(t => t.severity === 'high').length,
    totalValue: TENDERS.reduce((s, t) => s + t.tenderValue, 0),
    newCompanies: TENDERS.filter(t => t.companyAgeMonths < 6).length,
    singleSource: TENDERS.filter(t => t.procurementMethod === 'single_source').length,
    repeatAwards: TENDERS.filter(t => t.anomalyType.includes('Repeat')).length,
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-red-300 dark:border-red-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-red-600" />
            Tender Anomaly Detector
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detect procurement fraud patterns: single-source tenders above threshold, awards to
            newly-registered companies, repeat awards to same supplier, and price inflation vs market rates.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.high}</p><p className="text-[10px] text-muted-foreground">High Severity</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><DollarSign className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {stats.totalValue}M</p><p className="text-[10px] text-muted-foreground">Total Tender Value</p></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="pt-3 pb-3"><UserPlus className="h-3.5 w-3.5 text-purple-600 mb-1" /><p className="text-lg font-bold text-purple-600">{stats.newCompanies}</p><p className="text-[10px] text-muted-foreground">New Company Awards</p></CardContent></Card>
        <Card className="border-l-4 border-l-amber-500"><CardContent className="pt-3 pb-3"><Repeat className="h-3.5 w-3.5 text-amber-600 mb-1" /><p className="text-lg font-bold text-amber-600">{stats.repeatAwards}</p><p className="text-[10px] text-muted-foreground">Repeat Award Patterns</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Severity:</span>
        {['all', 'high', 'medium', 'low'].map(s => <Button key={s} variant={filterSeverity === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilterSeverity(s)}>{s}</Button>)}
        <span className="text-xs text-muted-foreground ml-2">Type:</span>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-7 text-xs border rounded-md px-2 bg-background">
          {anomalyTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
        </select>
      </div>

      {/* Tender cards */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(tender => (
            <Card key={tender.id} className={`border-l-4 ${tender.severity === 'high' ? 'border-l-red-500' : tender.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{tender.tenderTitle}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{tender.countyName}</Badge>
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><Building2 className="h-2.5 w-2.5 mr-0.5" />{tender.awardedCompany}</Badge>
                      <Badge className={`text-[9px] px-1.5 py-0 ${tender.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : tender.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {ANOMALY_ICONS[tender.anomalyType]}<span className="ml-0.5">{tender.anomalyType}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">Kshs {tender.tenderValue}M</p>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5">{tender.procurementMethod.replace('_', ' ')}</Badge>
                  </div>
                </div>

                {/* Company info */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>Reg: {tender.companyRegistration}</span>
                  <span>·</span>
                  <span className={tender.companyAgeMonths < 6 ? 'text-red-600 font-medium' : ''}>
                    {tender.companyAgeMonths} months old
                    {tender.companyAgeMonths < 6 && ' ⚠'}
                  </span>
                  <span>·</span>
                  <span>Awarded: {new Date(tender.awardedDate).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
                </div>

                {/* Flag reason */}
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-700 dark:text-red-300">{tender.flagReason}</p>
                </div>
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
              <p className="text-xs text-muted-foreground"><strong>Detection patterns:</strong></p>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-4">
                <li>• Single-source above Kshs 5M without competition (PPADA 2015 violation)</li>
                <li>• Company registered &lt; 6 months before award (shell company suspicion)</li>
                <li>• Same company awarded &gt; 3 tenders in 12 months (monopoly pattern)</li>
                <li>• Unit price &gt; 200% above engineer's estimate (price inflation)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
