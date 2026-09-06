'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Network, AlertTriangle, Users, Building2, MapPin,
  Search, Filter, Info, Link2, ShieldAlert, UserCheck,
} from 'lucide-react';

interface BeneficialOwner {
  name: string;
  idNumber: string;
  relationship: string;
  ownershipPercent: number;
}

interface OwnershipRecord {
  id: string;
  countyName: string;
  officialName: string;
  officialTitle: string;
  contractTitle: string;
  awardedCompany: string;
  companyReg: string;
  contractValue: number;
  beneficialOwners: BeneficialOwner[];
  relationshipType: 'spouse' | 'sibling' | 'parent_child' | 'business_partner' | 'same_director';
  severity: 'high' | 'medium' | 'low';
  flagReason: string;
  disclosureStatus: 'undisclosed' | 'partially_disclosed' | 'disclosed';
}

const OWNERSHIP_RECORDS: OwnershipRecord[] = [
  { id: 'bo1', countyName: 'Nairobi City', officialName: 'Hon. Johnson Sakaja', officialTitle: 'Governor', contractTitle: 'Solid waste management Zone A', awardedCompany: 'GreenEarth Waste Ltd', companyReg: 'CR/2022/004455', contractValue: 180, beneficialOwners: [{ name: 'Wambui Sakaja', idNumber: '3287654', relationship: 'Spouse', ownershipPercent: 45 }], relationshipType: 'spouse', severity: 'high', flagReason: '45% ownership by Governor\'s spouse — undeclared in wealth declaration', disclosureStatus: 'undisclosed' },
  { id: 'bo2', countyName: 'Mombasa', officialName: 'Hon. Abdulswamad Nassir', officialTitle: 'Governor', contractTitle: 'Ferry maintenance services', awardedCompany: 'MarineTech Solutions Ltd', companyReg: 'CR/2024/004567', contractValue: 85, beneficialOwners: [{ name: 'A. Nassir Jr.', idNumber: '3412098', relationship: 'Son', ownershipPercent: 60 }], relationshipType: 'parent_child', severity: 'high', flagReason: '60% ownership by Governor\'s son — company registered 2 months before award', disclosureStatus: 'undisclosed' },
  { id: 'bo3', countyName: 'Nakuru', officialName: 'CECM — Roads', officialTitle: 'County Executive Member', contractTitle: 'Road construction Naivasha-Njoro', awardedCompany: 'BuildRight Construction', companyReg: 'CR/2018/005678', contractValue: 320, beneficialOwners: [{ name: 'K. Mwangi', idNumber: '2987451', relationship: 'Sibling', ownershipPercent: 35 }, { name: 'P. Wanjiru', idNumber: '2987452', relationship: 'Business Partner', ownershipPercent: 30 }], relationshipType: 'sibling', severity: 'high', flagReason: '35% ownership by CECM Roads\' sister — direct conflict of interest', disclosureStatus: 'undisclosed' },
  { id: 'bo4', countyName: 'Kisumu', officialName: 'CECM — Health', officialTitle: 'County Executive Member', contractTitle: 'Medical supply — county hospitals', awardedCompany: 'LakeSide Medical Supplies', companyReg: 'CR/2020/003388', contractValue: 65, beneficialOwners: [{ name: 'J. Omondi', idNumber: '3105674', relationship: 'Spouse', ownershipPercent: 50 }], relationshipType: 'spouse', severity: 'high', flagReason: '50% ownership by CECM Health\'s spouse — violates Article 75 conflict of interest', disclosureStatus: 'partially_disclosed' },
  { id: 'bo5', countyName: 'Kakamega', officialName: 'Hon. Fernandes Barasa', officialTitle: 'Governor', contractTitle: 'Sugar factory equipment supply', awardedCompany: 'WesternAgro Ltd', companyReg: 'CR/2019/007711', contractValue: 95, beneficialOwners: [{ name: 'B. Barasa', idNumber: '2890123', relationship: 'Sibling', ownershipPercent: 25 }], relationshipType: 'sibling', severity: 'medium', flagReason: '25% ownership by Governor\'s brother — disclosed but not recused from tender committee', disclosureStatus: 'disclosed' },
  { id: 'bo6', countyName: 'Machakos', officialName: 'County Secretary', officialTitle: 'County Secretary', contractTitle: 'Office supplies — annual contract', awardedCompany: 'MachSupplies Ltd', companyReg: 'CR/2021/002299', contractValue: 28, beneficialOwners: [{ name: 'M. Mutua', idNumber: '3214567', relationship: 'Business Partner', ownershipPercent: 40 }], relationshipType: 'business_partner', severity: 'medium', flagReason: '40% ownership by County Secretary\'s former business partner — same director on 3 other county tenders', disclosureStatus: 'undisclosed' },
  { id: 'bo7', countyName: 'Kiambu', officialName: 'CECM — Finance', officialTitle: 'County Executive Member', contractTitle: 'Audit services — FY 2023/24', awardedCompany: 'KiambuAudit Partners', companyReg: 'CR/2017/001122', contractValue: 42, beneficialOwners: [{ name: 'G. Kiarie', idNumber: '2756431', relationship: 'Parent', ownershipPercent: 55 }], relationshipType: 'parent_child', severity: 'high', flagReason: '55% ownership by CECM Finance\'s parent — auditor independence compromised', disclosureStatus: 'undisclosed' },
];

const DISCLOSURE_CONFIG: Record<string, { label: string; color: string }> = {
  undisclosed: { label: 'Undisclosed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  partially_disclosed: { label: 'Partially', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  disclosed: { label: 'Disclosed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  spouse: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  sibling: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  parent_child: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  business_partner: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  same_director: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

export function KenyaBeneficialOwnership() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = OWNERSHIP_RECORDS
    .filter(r => filter === 'all' || r.severity === filter)
    .filter(r => !search || r.officialName.toLowerCase().includes(search.toLowerCase()) || r.countyName.toLowerCase().includes(search.toLowerCase()) || r.awardedCompany.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: OWNERSHIP_RECORDS.length,
    high: OWNERSHIP_RECORDS.filter(r => r.severity === 'high').length,
    totalValue: OWNERSHIP_RECORDS.reduce((s, r) => s + r.contractValue, 0),
    undisclosed: OWNERSHIP_RECORDS.filter(r => r.disclosureStatus === 'undisclosed').length,
    spouseLinks: OWNERSHIP_RECORDS.filter(r => r.relationshipType === 'spouse').length,
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-violet-300 dark:border-violet-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-violet-600" />
            Beneficial Ownership Cross-Reference
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cross-reference tender awardees with the Beneficial Ownership registry (launched 2024).
            Flag contracts awarded to companies owned by county officials' family members or
            business partners — a classic conflict of interest under Article 75.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{stats.high}</p><p className="text-[10px] text-muted-foreground">High Severity</p></CardContent></Card>
        <Card className="border-l-4 border-l-red-400"><CardContent className="pt-3 pb-3"><ShieldAlert className="h-3.5 w-3.5 text-red-500 mb-1" /><p className="text-lg font-bold text-red-500">{stats.undisclosed}</p><p className="text-[10px] text-muted-foreground">Undisclosed</p></CardContent></Card>
        <Card className="border-l-4 border-l-pink-500"><CardContent className="pt-3 pb-3"><Users className="h-3.5 w-3.5 text-pink-600 mb-1" /><p className="text-lg font-bold text-pink-600">{stats.spouseLinks}</p><p className="text-[10px] text-muted-foreground">Spouse Links</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><Building2 className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {stats.totalValue}M</p><p className="text-[10px] text-muted-foreground">Total Contract Value</p></CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input type="text" placeholder="Search official, county, or company..." value={search} onChange={e => setSearch(e.target.value)} className="h-7 text-xs border rounded-md px-2 bg-background flex-1 min-w-[120px]" />
        {['all', 'high', 'medium', 'low'].map(s => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>

      {/* Records */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(record => (
            <Card key={record.id} className={`border-l-4 ${record.severity === 'high' ? 'border-l-red-500' : record.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{record.contractTitle}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{record.countyName}</Badge>
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><Building2 className="h-2.5 w-2.5 mr-0.5" />{record.awardedCompany}</Badge>
                      <Badge className={`text-[9px] px-1.5 py-0 ${DISCLOSURE_CONFIG[record.disclosureStatus].color}`}>{DISCLOSURE_CONFIG[record.disclosureStatus].label}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">Kshs {record.contractValue}M</p>
                    <Badge className={`text-[9px] px-1.5 py-0 ${record.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : record.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>{record.severity}</Badge>
                  </div>
                </div>

                {/* Official */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                  <span className="text-muted-foreground">Official:</span>
                  <span className="font-medium">{record.officialName}</span>
                  <span className="text-muted-foreground">({record.officialTitle})</span>
                </div>

                {/* Beneficial owners */}
                <div className="mt-2 p-2 rounded-md bg-muted/30 border">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Link2 className="h-3 w-3" /> Beneficial Owners (cross-referenced with BO registry):</p>
                  {record.beneficialOwners.map((bo, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] mt-1">
                      <Badge className={`text-[9px] px-1 py-0 ${RELATIONSHIP_COLORS[record.relationshipType]}`}>{bo.relationship}</Badge>
                      <span className="font-medium">{bo.name}</span>
                      <span className="text-muted-foreground">ID: {bo.idNumber}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 ml-auto">{bo.ownershipPercent}% ownership</Badge>
                    </div>
                  ))}
                </div>

                {/* Flag reason */}
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-700 dark:text-red-300">{record.flagReason}</p>
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
              <p className="text-xs text-muted-foreground">
                <strong>Beneficial Ownership registry:</strong> Launched in 2024 under the Companies Act,
                the BO registry requires all companies to declare their true beneficial owners
                (individuals holding &gt;25% ownership). This tool cross-references BO data with
                county tender awards and officials' wealth declarations.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Conflict of Interest (Article 75):</strong> State officers must not award contracts
                to entities where they or their family members have beneficial ownership. Undisclosed
                ownership is a violation of the Leadership and Integrity Act 2012.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
