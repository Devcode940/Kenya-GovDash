'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users, AlertTriangle, Link2, Building2, MapPin,
  Info, Search, Filter, UserX, UserCheck,
} from 'lucide-react';

interface GhostWorkerRecord {
  id: string;
  countyName: string;
  department: string;
  employeeName: string;
  payrollRef: string;
  monthlySalary: number;
  issue: 'no_biometric' | 'duplicate_name' | 'no_national_id' | 'not_at_workstation' | 'dead_person';
  status: 'flagged' | 'removed' | 'under_review';
  estimatedLoss: number; // annual Kshs
}

interface AssetRecord {
  id: string;
  countyName: string;
  assetType: 'vehicle' | 'building' | 'equipment' | 'land';
  assetDescription: string;
  registrationNumber: string;
  status: 'missing' | 'disposed_below_market' | 'no_fuel_log' | 'not_in_registry' | 'disposed_without_approval';
  estimatedValue: number;
  flagReason: string;
}

const GHOST_WORKERS: GhostWorkerRecord[] = [
  { id: 'gw1', countyName: 'Nairobi City', department: 'Health', employeeName: 'J. Kamau ( unverifiable )', payrollRef: 'PAY/2024/4451', monthlySalary: 85000, issue: 'no_biometric', status: 'flagged', estimatedLoss: 1020000 },
  { id: 'gw2', countyName: 'Nairobi City', department: 'Education', employeeName: 'M. Otieno ( unverifiable )', payrollRef: 'PAY/2024/7823', monthlySalary: 72000, issue: 'no_national_id', status: 'flagged', estimatedLoss: 864000 },
  { id: 'gw3', countyName: 'Mombasa', department: 'Water', employeeName: 'A. Hassan ( unverifiable )', payrollRef: 'PAY/2024/1192', monthlySalary: 68000, issue: 'not_at_workstation', status: 'under_review', estimatedLoss: 816000 },
  { id: 'gw4', countyName: 'Kisumu', department: 'Roads', employeeName: 'P. Wafula ( unverifiable )', payrollRef: 'PAY/2024/3345', monthlySalary: 92000, issue: 'duplicate_name', status: 'flagged', estimatedLoss: 1104000 },
  { id: 'gw5', countyName: 'Nakuru', department: 'Administration', employeeName: 'S. Chebet ( unverifiable )', payrollRef: 'PAY/2024/5678', monthlySalary: 78000, issue: 'no_biometric', status: 'flagged', estimatedLoss: 936000 },
  { id: 'gw6', countyName: 'Kiambu', department: 'Health', employeeName: 'D. Mwangi ( unverifiable )', payrollRef: 'PAY/2024/9012', monthlySalary: 88000, issue: 'no_national_id', status: 'removed', estimatedLoss: 1056000 },
  { id: 'gw7', countyName: 'Kakamega', department: 'Agriculture', employeeName: 'F. Wanjala ( unverifiable )', payrollRef: 'PAY/2024/2345', monthlySalary: 65000, issue: 'dead_person', status: 'flagged', estimatedLoss: 780000 },
  { id: 'gw8', countyName: 'Machakos', department: 'Education', employeeName: 'G. Mutua ( unverifiable )', payrollRef: 'PAY/2024/6789', monthlySalary: 75000, issue: 'duplicate_name', status: 'under_review', estimatedLoss: 900000 },
];

const ASSETS: AssetRecord[] = [
  { id: 'as1', countyName: 'Nairobi City', assetType: 'vehicle', assetDescription: 'Toyota Land Cruiser V8', registrationNumber: 'GKN 47A', status: 'missing', estimatedValue: 12000000, flagReason: 'Vehicle not located at any county facility for 6+ months' },
  { id: 'as2', countyName: 'Mombasa', assetType: 'vehicle', assetDescription: 'Mitsubishi Canter Truck', registrationNumber: 'KCD 01B', status: 'no_fuel_log', estimatedValue: 4500000, flagReason: 'No fuel logs for 8 months — possible personal use' },
  { id: 'as3', countyName: 'Kisumu', assetType: 'building', assetDescription: 'County housing unit, Tom Mboya Estate', registrationNumber: 'LAND/KSM/234', status: 'disposed_below_market', estimatedValue: 8500000, flagReason: 'Disposed at Kshs 2M (24% of market value) to unnamed buyer' },
  { id: 'as4', countyName: 'Nakuru', assetType: 'land', assetDescription: 'Plot LR 12345, Naivasha', registrationNumber: 'LAND/NKU/678', status: 'disposed_without_approval', estimatedValue: 15000000, flagReason: 'Land allocated without county assembly approval or public auction' },
  { id: 'as5', countyName: 'Kiambu', assetType: 'equipment', assetDescription: 'Excavator CAT 320', registrationNumber: 'EQUIP/KBU/001', status: 'not_in_registry', estimatedValue: 28000000, flagReason: 'Asset in use but not listed in county asset register — off-book' },
  { id: 'as6', countyName: 'Kakamega', assetType: 'vehicle', assetDescription: 'Nissan Patrol GRX', registrationNumber: 'GKA 37C', status: 'missing', estimatedValue: 9500000, flagReason: 'GPS tracker disabled 4 months ago, vehicle not traceable' },
  { id: 'as7', countyName: 'Bungoma', assetType: 'building', assetDescription: 'County office block, Webuye', registrationNumber: 'BLDG/BGM/045', status: 'disposed_below_market', estimatedValue: 22000000, flagReason: 'Leased to private entity at 40% below market rate for 10 years' },
];

const ISSUE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  no_biometric: { label: 'No Biometric', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <UserX className="h-3 w-3" /> },
  duplicate_name: { label: 'Duplicate Name', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: <Users className="h-3 w-3" /> },
  no_national_id: { label: 'No National ID', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <UserX className="h-3 w-3" /> },
  not_at_workstation: { label: 'Not at Workstation', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <AlertTriangle className="h-3 w-3" /> },
  dead_person: { label: 'Deceased — Still on Payroll', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
};

const ASSET_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  missing: { label: 'Missing', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  disposed_below_market: { label: 'Disposed Below Market', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  no_fuel_log: { label: 'No Fuel Log', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  not_in_registry: { label: 'Not in Registry', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  disposed_without_approval: { label: 'Disposed Without Approval', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export function KenyaPayrollAssetTracker() {
  const [activeTab, setActiveTab] = useState<'ghost' | 'assets'>('ghost');

  const ghostStats = {
    total: GHOST_WORKERS.length,
    flagged: GHOST_WORKERS.filter(g => g.status === 'flagged').length,
    removed: GHOST_WORKERS.filter(g => g.status === 'removed').length,
    annualLoss: GHOST_WORKERS.reduce((s, g) => s + g.estimatedLoss, 0),
  };

  const assetStats = {
    total: ASSETS.length,
    missing: ASSETS.filter(a => a.status === 'missing').length,
    totalValue: ASSETS.reduce((s, a) => s + a.estimatedValue, 0),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-teal-300 dark:border-teal-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Payroll Ghost Detection & Asset Registry
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cross-reference county payrolls with biometric data and national ID registries to detect
            ghost workers. Track county assets for missing vehicles, below-market disposals, and off-book equipment.
          </p>
        </CardHeader>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'ghost' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('ghost')}>
          <UserX className="h-3.5 w-3.5" /> Ghost Workers ({GHOST_WORKERS.length})
        </Button>
        <Button variant={activeTab === 'assets' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('assets')}>
          <Building2 className="h-3.5 w-3.5" /> Asset Registry ({ASSETS.length})
        </Button>
      </div>

      {/* Ghost Workers */}
      {activeTab === 'ghost' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><UserX className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{ghostStats.flagged}</p><p className="text-[10px] text-muted-foreground">Flagged</p></CardContent></Card>
            <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-3 pb-3"><UserCheck className="h-3.5 w-3.5 text-emerald-600 mb-1" /><p className="text-lg font-bold text-emerald-600">{ghostStats.removed}</p><p className="text-[10px] text-muted-foreground">Removed from Payroll</p></CardContent></Card>
            <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">Kshs {(ghostStats.annualLoss / 1000000).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Annual Loss</p></CardContent></Card>
          </div>

          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2">
              {GHOST_WORKERS.map(gw => {
                const issue = ISSUE_CONFIG[gw.issue];
                return (
                  <Card key={gw.id} className="border-l-4 border-l-red-400">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{gw.employeeName}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{gw.countyName}</Badge>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">{gw.department}</Badge>
                            <Badge className={`text-[9px] px-1.5 py-0 ${issue.color}`}>{issue.icon}<span className="ml-0.5">{issue.label}</span></Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                            <span>Payroll: {gw.payrollRef}</span>
                            <span>·</span>
                            <span>Salary: Kshs {gw.monthlySalary.toLocaleString()}/mo</span>
                            <span>·</span>
                            <span className="text-red-600 font-medium">Loss: Kshs {gw.estimatedLoss.toLocaleString()}/yr</span>
                          </div>
                        </div>
                        <Badge className={`text-[9px] px-1.5 py-0 shrink-0 ${gw.status === 'flagged' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : gw.status === 'removed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {gw.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Asset Registry */}
      {activeTab === 'assets' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-red-500"><CardContent className="pt-3 pb-3"><Building2 className="h-3.5 w-3.5 text-red-600 mb-1" /><p className="text-lg font-bold text-red-600">{assetStats.missing}</p><p className="text-[10px] text-muted-foreground">Missing Assets</p></CardContent></Card>
            <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-orange-600 mb-1" /><p className="text-lg font-bold text-orange-600">{assetStats.total}</p><p className="text-[10px] text-muted-foreground">Flagged Assets</p></CardContent></Card>
            <Card className="border-l-4 border-l-red-400"><CardContent className="pt-3 pb-3"><AlertTriangle className="h-3.5 w-3.5 text-red-500 mb-1" /><p className="text-lg font-bold text-red-500">Kshs {(assetStats.totalValue / 1000000).toFixed(0)}M</p><p className="text-[10px] text-muted-foreground">Total Asset Value at Risk</p></CardContent></Card>
          </div>

          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2">
              {ASSETS.map(asset => {
                const status = ASSET_STATUS_CONFIG[asset.status];
                return (
                  <Card key={asset.id} className="border-l-4 border-l-orange-400">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{asset.assetDescription}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{asset.countyName}</Badge>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">{asset.assetType}</Badge>
                            <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.label}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                            <span>Reg: {asset.registrationNumber}</span>
                            <span>·</span>
                            <span className="font-medium">Value: Kshs {(asset.estimatedValue / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-red-700 dark:text-red-300">{asset.flagReason}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Ghost worker detection methods:</strong></p>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-4">
                <li>• Biometric headcount vs payroll register comparison</li>
                <li>• Cross-reference with NHIF/NSSF and IPRS national ID database</li>
                <li>• Duplicate name detection across departments/counties</li>
                <li>• Physical verification at duty stations</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2"><strong>Asset tracking:</strong></p>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-4">
                <li>• GPS tracking on all county vehicles</li>
                <li>• Fuel log verification</li>
                <li>• Disposal approval audit (county assembly + valuation)</li>
                <li>• Annual physical asset count</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
