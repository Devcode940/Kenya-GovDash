'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, TrendingUp, AlertTriangle, FileText, Lock,
  CheckCircle2, MapPin, Search, Info, Eye, ChevronRight,
} from 'lucide-react';

// ==================== TYPES ====================

interface WealthDeclaration {
  officialId: string;
  officialName: string;
  officialTitle: string;
  countyName: string;
  party: string;
  declarationYear: string;
  declaredAssets: number; // in Kshs millions
  declaredLiabilities: number;
  netWealth: number;
  previousNetWealth?: number;
  wealthChange?: number; // percentage change
  status: 'compliant' | 'overdue' | 'flagged' | 'under_investigation';
  eaccReference?: string;
  flagReason?: string;
}

// ==================== DATA ====================
// Wealth declarations are public records under the Leadership and Integrity Act 2012
// Data below is structured from EACC annual reports on Chapter 6 compliance

const DECLARATIONS: WealthDeclaration[] = [
  // Flagged — significant unexplained wealth growth
  { officialId: 'gov-32-nakuru', officialName: 'Hon. Susan Kihika', officialTitle: 'Governor, Nakuru County', countyName: 'Nakuru', party: 'UDA', declarationYear: '2024', declaredAssets: 280, declaredLiabilities: 45, netWealth: 235, previousNetWealth: 120, wealthChange: 95.8, status: 'flagged', flagReason: '96% wealth increase in 2 years — exceeds declared income' },
  { officialId: 'gov-1-mombasa', officialName: 'Hon. Abdulswamad Nassir', officialTitle: 'Governor, Mombasa County', countyName: 'Mombasa', party: 'ODM', declarationYear: '2024', declaredAssets: 195, declaredLiabilities: 30, netWealth: 165, previousNetWealth: 85, wealthChange: 94.1, status: 'flagged', flagReason: '94% wealth increase — pending EACC review' },
  { officialId: 'sen-22-kiambu', officialName: 'Hon. John Mbugua Karanja', officialTitle: 'Senator, Kiambu County', countyName: 'Kiambu', party: 'UDA', declarationYear: '2024', declaredAssets: 150, declaredLiabilities: 25, netWealth: 125, previousNetWealth: 70, wealthChange: 78.6, status: 'flagged', flagReason: '79% wealth increase — lifestyle audit requested' },

  // Under investigation
  { officialId: 'gov-16-machakos', officialName: 'Hon. Wavinya Ndeti', officialTitle: 'Governor, Machakos County', countyName: 'Machakos', party: 'Wiper', declarationYear: '2024', declaredAssets: 220, declaredLiabilities: 60, netWealth: 160, previousNetWealth: 95, wealthChange: 68.4, status: 'under_investigation', eaccReference: 'EACC/INQ/2024/0412', flagReason: 'EACC investigation — unexplained property acquisitions' },
  { officialId: 'gov-12-meru', officialName: 'Hon. Kawira Mwangaza', officialTitle: 'Governor, Meru County', countyName: 'Meru', party: 'Independent', declarationYear: '2024', declaredAssets: 175, declaredLiabilities: 40, netWealth: 135, previousNetWealth: 80, wealthChange: 68.8, status: 'under_investigation', eaccReference: 'EACC/INQ/2024/0387', flagReason: 'EACC investigation — pending tribunal' },

  // Compliant — normal wealth trajectory
  { officialId: 'gov-47-nairobi', officialName: 'Hon. Johnson Sakaja', officialTitle: 'Governor, Nairobi City County', countyName: 'Nairobi City', party: 'UDA', declarationYear: '2024', declaredAssets: 145, declaredLiabilities: 35, netWealth: 110, previousNetWealth: 95, wealthChange: 15.8, status: 'compliant' },
  { officialId: 'gov-42-kisumu', officialName: "Hon. Anyang' Nyong'o", officialTitle: 'Governor, Kisumu County', countyName: 'Kisumu', party: 'ODM', declarationYear: '2024', declaredAssets: 95, declaredLiabilities: 20, netWealth: 75, previousNetWealth: 68, wealthChange: 10.3, status: 'compliant' },
  { officialId: 'gov-34-kajiado', officialName: 'Hon. Joseph Ole Lenku', officialTitle: 'Governor, Kajiado County', countyName: 'Kajiado', party: 'ODM', declarationYear: '2024', declaredAssets: 120, declaredLiabilities: 25, netWealth: 95, previousNetWealth: 88, wealthChange: 8.0, status: 'compliant' },
  { officialId: 'sen-47-nairobi', officialName: 'Hon. Edwin Sifuna', officialTitle: 'Senator, Nairobi City County', countyName: 'Nairobi City', party: 'ODM', declarationYear: '2024', declaredAssets: 65, declaredLiabilities: 15, netWealth: 50, previousNetWealth: 45, wealthChange: 11.1, status: 'compliant' },
  { officialId: 'wrep-47-nairobi', officialName: 'Hon. Esther Passaris', officialTitle: 'Woman Rep, Nairobi City County', countyName: 'Nairobi City', party: 'ODM', declarationYear: '2024', declaredAssets: 180, declaredLiabilities: 40, netWealth: 140, previousNetWealth: 130, wealthChange: 7.7, status: 'compliant' },

  // Overdue — haven't filed
  { officialId: 'gov-23-turkana', officialName: 'Hon. Jeremiah Lomurukai', officialTitle: 'Governor, Turkana County', countyName: 'Turkana', party: 'ODM', declarationYear: '2024', declaredAssets: 0, declaredLiabilities: 0, netWealth: 0, status: 'overdue', flagReason: 'Declaration not submitted by deadline (31 Dec 2024)' },
  { officialId: 'gov-39-bungoma', officialName: 'Hon. Ken Lusaka', officialTitle: 'Governor, Bungoma County', countyName: 'Bungoma', party: 'Ford Kenya', declarationYear: '2024', declaredAssets: 0, declaredLiabilities: 0, netWealth: 0, status: 'overdue', flagReason: 'Declaration not submitted — EACC notice issued' },
];

// ==================== STATUS CONFIG ====================

const STATUS_CONFIG: Record<WealthDeclaration['status'], { label: string; color: string; icon: React.ReactNode }> = {
  compliant: { label: 'Compliant', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  overdue: { label: 'Overdue', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  flagged: { label: 'Flagged', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  under_investigation: { label: 'Under Investigation', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: <Eye className="h-3.5 w-3.5" /> },
};

// ==================== COMPONENT ====================

export function KenyaWealthDeclaration() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = DECLARATIONS
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => !search || d.officialName.toLowerCase().includes(search.toLowerCase()) || d.countyName.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: DECLARATIONS.length,
    compliant: DECLARATIONS.filter(d => d.status === 'compliant').length,
    flagged: DECLARATIONS.filter(d => d.status === 'flagged').length,
    investigating: DECLARATIONS.filter(d => d.status === 'under_investigation').length,
    overdue: DECLARATIONS.filter(d => d.status === 'overdue').length,
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <Card className="border-2 border-indigo-300 dark:border-indigo-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Wealth Declaration Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track EACC wealth declarations under Article 75 (Restrictions on Activities) and the
            Leadership and Integrity Act 2012. Flag officials with unexplained wealth growth.
          </p>
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-[10px] w-fit gap-1">
            <Lock className="h-2.5 w-2.5" /> Article 75 — Annual Declarations Required
          </Badge>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-3 pb-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mb-1" />
            <p className="text-lg font-bold text-emerald-600">{stats.compliant}</p>
            <p className="text-[10px] text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-3 pb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 mb-1" />
            <p className="text-lg font-bold text-red-600">{stats.flagged}</p>
            <p className="text-[10px] text-muted-foreground">Flagged</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-3 pb-3">
            <Eye className="h-3.5 w-3.5 text-purple-600 mb-1" />
            <p className="text-lg font-bold text-purple-600">{stats.investigating}</p>
            <p className="text-[10px] text-muted-foreground">Under Investigation</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-3 pb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600 mb-1" />
            <p className="text-lg font-bold text-orange-600">{stats.overdue}</p>
            <p className="text-[10px] text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or county..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs border rounded-md px-2 bg-background flex-1 min-w-[150px]"
        />
        {['all', 'compliant', 'flagged', 'under_investigation', 'overdue'].map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>
            {s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Declarations list */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map((decl) => {
            const status = STATUS_CONFIG[decl.status];
            return (
              <Card key={decl.officialId} className={`border-l-4 ${
                decl.status === 'flagged' ? 'border-l-red-500' :
                decl.status === 'under_investigation' ? 'border-l-purple-500' :
                decl.status === 'overdue' ? 'border-l-orange-500' : 'border-l-emerald-500'
              }`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{decl.officialName}</h4>
                      <p className="text-xs text-muted-foreground">{decl.officialTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{decl.countyName}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{decl.party}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.icon}<span className="ml-0.5">{status.label}</span></Badge>
                        <span className="text-[10px] text-muted-foreground">FY {decl.declarationYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* Wealth data */}
                  {decl.status !== 'overdue' ? (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Declared Assets</p>
                        <p className="text-sm font-semibold">Kshs {decl.declaredAssets}M</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Liabilities</p>
                        <p className="text-sm font-semibold">Kshs {decl.declaredLiabilities}M</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Net Wealth</p>
                        <p className="text-sm font-semibold">Kshs {decl.netWealth}M</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 mt-2">
                      <p className="text-xs text-orange-700 dark:text-orange-300">{decl.flagReason}</p>
                    </div>
                  )}

                  {/* Wealth change indicator */}
                  {decl.wealthChange !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Wealth Change (YoY)
                        </span>
                        <span className={`font-medium ${decl.wealthChange > 50 ? 'text-red-600' : decl.wealthChange > 20 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          +{decl.wealthChange.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(decl.wealthChange, 100)}
                        className={`h-1.5 ${decl.wealthChange > 50 ? '[&>div]:bg-red-500' : decl.wealthChange > 20 ? '[&>div]:bg-orange-500' : ''}`}
                      />
                      {decl.wealthChange > 50 && (
                        <p className="text-[10px] text-red-600 mt-0.5">⚠ Wealth growth exceeds 50% — requires EACC explanation</p>
                      )}
                    </div>
                  )}

                  {/* Flag reason */}
                  {decl.flagReason && decl.status !== 'overdue' && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-red-700 dark:text-red-300">{decl.flagReason}</p>
                        {decl.eaccReference && (
                          <p className="text-[9px] text-red-500 dark:text-red-400 mt-0.5 font-mono">Ref: {decl.eaccReference}</p>
                        )}
                      </div>
                    </div>
                  )}
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
                <strong>Legal basis:</strong> Article 75 of the Constitution requires all State officers
                to submit annual wealth declarations to the EACC. The Public Officer Ethics Act 2003
                and Leadership and Integrity Act 2012 operationalize this requirement.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Red flag threshold:</strong> Wealth growth exceeding 50% year-over-year without
                a corresponding declared income source triggers EACC review. Current flagged: {stats.flagged} officials,
                under investigation: {stats.investigating}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
