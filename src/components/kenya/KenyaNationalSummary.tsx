'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, FileText, DollarSign, TrendingDown, AlertTriangle,
  CheckCircle2, XCircle, HelpCircle, ExternalLink, ChevronDown, ChevronUp, Landmark
} from 'lucide-react';
import { NATIONAL_SUMMARY, getAuditColor, type AuditOpinionType } from '@/lib/kenya-data';

function AuditBadge({ type, count }: { type: AuditOpinionType; count: number }) {
  return (
    <Badge className={`${getAuditColor(type)} text-xs font-semibold`}>
      {type}: {count}
    </Badge>
  );
}

export function KenyaNationalSummary() {
  const [expanded, setExpanded] = useState(true);
  const summary = NATIONAL_SUMMARY;

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            National Summary — Verified Statistics
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {/* OAG Audit Opinions FY 2023/24 */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1 mb-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  OAG Audit Opinions — FY 2023/24
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">County Executives (47)</p>
                    <div className="flex flex-wrap gap-1">
                      <AuditBadge type="Unmodified" count={0} />
                      <AuditBadge type="Qualified" count={47} />
                      <AuditBadge type="Adverse" count={0} />
                      <AuditBadge type="Disclaimer" count={0} />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">County Assemblies (47)</p>
                    <div className="flex flex-wrap gap-1">
                      <AuditBadge type="Unmodified" count={3} />
                      <AuditBadge type="Qualified" count={37} />
                      <AuditBadge type="Adverse" count={7} />
                      <AuditBadge type="Disclaimer" count={0} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Source: {summary.oagSummaryFY2023_24.countyExecutives.source}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p className="text-xs">{summary.oagSummaryFY2023_24.countyExecutives.url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator />

              {/* OAG Audit Opinions FY 2024/25 */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1 mb-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  OAG Audit Opinions — FY 2024/25
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">County Executives (47)</p>
                    <div className="flex flex-wrap gap-1">
                      <AuditBadge type="Unmodified" count={1} />
                      <AuditBadge type="Qualified" count={44} />
                      <AuditBadge type="Adverse" count={2} />
                      <AuditBadge type="Disclaimer" count={0} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {summary.oagSummaryFY2024_25.countyExecutives.note}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">County Assemblies (47)</p>
                    <div className="flex flex-wrap gap-1">
                      <AuditBadge type="Unmodified" count={8} />
                      <AuditBadge type="Qualified" count={37} />
                      <AuditBadge type="Adverse" count={2} />
                      <AuditBadge type="Disclaimer" count={0} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {summary.oagSummaryFY2024_25.countyAssemblies.note}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Source: {summary.oagSummaryFY2024_25.countyExecutives.source}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p className="text-xs">{summary.oagSummaryFY2024_25.countyExecutives.url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator />

              {/* CoB Budget Absorption */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  CoB Budget Absorption — FY 2023/24
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Aggregate</p>
                    <p className="text-lg font-bold text-green-700">{summary.cobBudgetFY2023_24.aggregateAbsorption}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Recurrent</p>
                    <p className="text-lg font-bold text-green-700">{summary.cobBudgetFY2023_24.recurrentAbsorption}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Development</p>
                    <p className="text-lg font-bold text-red-700">{summary.cobBudgetFY2023_24.developmentAbsorption}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Pending Bills</p>
                    <p className="text-sm font-bold text-red-700">{summary.cobBudgetFY2023_24.pendingBills}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Only {summary.cobBudgetFY2023_24.countiesOver70DevBudget}/47 counties spent over 70% of development budgets
                </p>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Source: {summary.cobBudgetFY2023_24.source}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p className="text-xs">{summary.cobBudgetFY2023_24.url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator />

              {/* TI-Kenya Data */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Transparency International — Kenya
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">CPI 2025</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-semibold">
                        Score: {summary.tiKenyaData.cpi2025.score}/100
                      </Badge>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-semibold">
                        Rank: #{summary.tiKenyaData.cpi2025.rank}/182
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {summary.tiKenyaData.cpi2025.source}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium mb-1">CBTS 2025</p>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold">
                      National Average: {summary.tiKenyaData.cbts2025.nationalAverage}/100
                    </Badge>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {summary.tiKenyaData.cbts2025.source}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
