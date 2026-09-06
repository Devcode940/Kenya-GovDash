'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  TrendingUp, AlertTriangle, ExternalLink, Info, FileText,
  DollarSign, Clock, ArrowRight, ShieldAlert, XCircle
} from 'lucide-react';
import {
  getBudgetQuarterlyForCounty,
  type BudgetQuarterlyEntry,
  type BudgetQuarter
} from '@/lib/kenya-oversight-data';

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest CoB/County Treasury reports';

interface KenyaBudgetTrackerProps {
  countyCode: number;
}

const QUARTER_ORDER: BudgetQuarter[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Full Year'];

function QuarterBadge({ quarter }: { quarter: BudgetQuarter }) {
  const isFullYear = quarter === 'Full Year';
  return (
    <Badge
      className={`${isFullYear ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} text-xs px-2 py-0.5 font-semibold`}
    >
      {quarter}
    </Badge>
  );
}

function AbsorptionBar({ rate }: { rate: number | null }) {
  if (rate === null) {
    return (
      <div className="flex items-center gap-1">
        <XCircle className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground italic">N/A</span>
      </div>
    );
  }
  const colorClass = rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Progress value={rate} className="h-2" />
        <span className={`text-xs font-semibold ml-2 ${colorClass}`}>{rate}%</span>
      </div>
    </div>
  );
}

function DataGapNotice({ field }: { field: string }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <Info className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground italic">{field}: {DATA_NOT_AVAILABLE}</span>
    </div>
  );
}

function VirementAlertBadge({ count }: { count: number | null }) {
  if (count === null) {
    return <DataGapNotice field="Virement alerts" />;
  }
  if (count === 0) return null;
  const severityClass = count >= 4
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    : count >= 2
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  return (
    <Badge className={`${severityClass} text-xs px-2 py-0.5 font-semibold`}>
      <ShieldAlert className="h-3 w-3 mr-1" />
      {count} virement alert(s)
    </Badge>
  );
}

function SupplementaryBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-0.5 font-semibold">
      {count} supplementary budget(s)
    </Badge>
  );
}

export function KenyaBudgetTracker({ countyCode }: KenyaBudgetTrackerProps) {
  const quarters: BudgetQuarterlyEntry[] = getBudgetQuarterlyForCounty(countyCode);

  if (quarters.length === 0) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            Real-Time Budget Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground italic">
              No quarterly budget data available for this county. {DATA_NOT_AVAILABLE}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort quarters in order
  const sortedQuarters = [...quarters].sort(
    (a, b) => QUARTER_ORDER.indexOf(a.quarter) - QUARTER_ORDER.indexOf(b.quarter)
  );

  // Get latest quarter for summary info
  const latestQuarter = sortedQuarters[sortedQuarters.length - 1];
  const fy = latestQuarter.fy;
  const countyName = latestQuarter.countyName;

  // Sum totals for virement and supplementary
  const totalVirementAlerts = sortedQuarters.reduce((sum, q) => sum + (q.virementAlerts ?? 0), 0);
  const maxSupplementary = Math.max(...sortedQuarters.map(q => q.supplementaryBudgets));

  return (
    <Card className="max-w-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          Real-Time Budget Tracker
          <Badge variant="outline" className="text-xs px-2 py-0.5">{countyName}</Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">FY {fy}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Budget Execution Timeline */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            Budget Execution Timeline — Quarterly Progression
          </h4>

          {/* Visual timeline progression */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {sortedQuarters.map((q, idx) => (
              <div key={q.quarter} className="flex items-center gap-1 min-w-0">
                <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
                  <QuarterBadge quarter={q.quarter} />
                  <AbsorptionBar rate={q.absorptionRate} />
                </div>
                {idx < sortedQuarters.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Detailed Quarterly Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quarterly Breakdown Details
          </h4>
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {sortedQuarters.map(q => (
                <div key={q.quarter} className="p-2 rounded-md bg-muted/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <QuarterBadge quarter={q.quarter} />
                    {q.absorptionRate !== null ? (
                      <Badge className={`${
                        q.absorptionRate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : q.absorptionRate >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      } text-xs px-2 py-0.5 font-semibold`}>
                        Absorption: {q.absorptionRate}%
                      </Badge>
                    ) : (
                      <DataGapNotice field="Absorption rate" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>Equitable Share: {q.equitableShareReleased ?? DATA_NOT_AVAILABLE}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>Disbursed: {q.totalDisbursed ?? DATA_NOT_AVAILABLE}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Recurrent: {q.recurrentSpent ?? DATA_NOT_AVAILABLE}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      <span>Development: {q.developmentSpent ?? DATA_NOT_AVAILABLE}</span>
                    </div>
                  </div>
                  {q.pendingBills !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span className="text-red-700 dark:text-red-300 font-medium">Pending Bills: {q.pendingBills}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Pending Bills Aging Analysis */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-600" />
            Pending Bills Aging Analysis
          </h4>
          <div className="p-2 rounded-md bg-red-50/30 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50">
            {sortedQuarters.filter(q => q.pendingBills !== null).length > 0 ? (
              <div className="space-y-1">
                {sortedQuarters.filter(q => q.pendingBills !== null).map(q => (
                  <div key={q.quarter} className="flex items-center justify-between">
                    <span className="text-xs font-medium">{q.quarter}</span>
                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">{q.pendingBills}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground italic mt-1">
                  Pending bills represent unpaid obligations carried forward — a key accountability risk per CoB reports.
                </p>
              </div>
            ) : (
              <DataGapNotice field="Pending bills aging" />
            )}
          </div>
        </div>

        <Separator />

        {/* Supplementary Budgets & Virement Alerts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <span className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-purple-600" />
              Supplementary Budgets
            </span>
            <SupplementaryBadge count={maxSupplementary} />
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-orange-600" />
                Virement Alerts (Cumulative)
              </span>
              <VirementAlertBadge count={totalVirementAlerts} />
            </div>
            {totalVirementAlerts > 0 && (
              <div className="mt-1.5 p-1.5 rounded border border-dashed border-orange-400/50 bg-orange-50/30 dark:bg-orange-900/10">
                <p className="text-xs text-muted-foreground">
                  <strong>Virement</strong> = unauthorized budget reallocation between programs.
                  Each alert represents a CoB-flagged instance where funds were moved without assembly approval.
                  High virement counts indicate weak budget discipline and legislative oversight gaps.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Equitable Share Release Tracking */}
        {latestQuarter.equitableShareReleased !== null && (
          <div className="p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">Equitable Share Release Tracking</span>
            </div>
            <div className="space-y-0.5">
              {sortedQuarters.filter(q => q.equitableShareReleased !== null).map(q => (
                <div key={q.quarter} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{q.quarter}</span>
                  <span className="font-medium">{q.equitableShareReleased}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic mt-1">
              Equitable share is the national revenue allocation to counties per Article 203 of the Constitution.
            </p>
          </div>
        )}

        <Separator />

        {/* Source Citation */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Source</span>
          </div>
          <p className="text-xs text-muted-foreground">{latestQuarter.source}</p>
          <a
            href={latestQuarter.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View source document
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
