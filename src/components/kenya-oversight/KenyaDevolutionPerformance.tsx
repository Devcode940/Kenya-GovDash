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
  BarChart3, TrendingUp, TrendingDown, Minus, ExternalLink,
  Info, FileText, ArrowUp, ArrowDown, ShieldCheck, Activity,
  Eye, Landmark, XCircle
} from 'lucide-react';
import { getDpiForCounty, type DPIEntry, dpiData } from '@/lib/kenya-oversight-data';

interface KenyaDevolutionPerformanceProps {
  countyCode: number;
}

function TrendArrow({ trend }: { trend: DPIEntry['trendVsPreviousYear'] }) {
  if (!trend) {
    return (
      <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs px-2 py-0.5">
        <XCircle className="h-3 w-3 mr-1" />
        Trend N/A
      </Badge>
    );
  }
  const trendConfig = {
    'up': { icon: TrendingUp, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Improving' },
    'down': { icon: TrendingDown, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Declining' },
    'stable': { icon: Minus, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Stable' },
  };
  const config = trendConfig[trend];
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} text-xs px-2 py-0.5 font-semibold`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function DimensionScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const colorClass = score >= 70
    ? 'text-green-600'
    : score >= 50
      ? 'text-yellow-600'
      : 'text-red-600';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-xs font-semibold ${colorClass}`}>{score}/100</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px]">
              <p className="text-xs">{label}: {score} out of 100. Weighted in composite DPI calculation.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

function DpiOverallBadge({ score }: { score: number }) {
  const colorClass = score >= 70
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : score >= 50
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return (
    <Badge className={`${colorClass} text-sm px-3 py-1 font-bold`}>
      <BarChart3 className="h-4 w-4 mr-1" />
      DPI: {score}
    </Badge>
  );
}

function LeaderboardItem({ entry, type }: { entry: DPIEntry; type: 'top' | 'bottom' }) {
  const colorClass = type === 'top'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return (
    <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground w-5">#{entry.rank}</span>
        <span className="text-xs font-medium">{entry.countyName}</span>
      </div>
      <Badge className={`${colorClass} text-[10px] px-1.5 py-0.5 font-semibold`}>
        {entry.overallDPI}
      </Badge>
    </div>
  );
}

export function KenyaDevolutionPerformance({ countyCode }: KenyaDevolutionPerformanceProps) {
  const data: DPIEntry | undefined = getDpiForCounty(countyCode);

  // Compute top 5 and bottom 5 from dpiData
  const sortedDpi = [...dpiData].sort((a, b) => a.rank - b.rank);
  const top5 = sortedDpi.slice(0, 5);
  const bottom5 = sortedDpi.slice(-5);

  if (!data) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            Devolution Performance Index (DPI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground italic">
              No DPI data available for this county. Data aggregated from OAG, CoB, TI-Kenya, and KNBS.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-orange-600" />
          Devolution Performance Index (DPI)
          <Badge variant="outline" className="text-xs px-2 py-0.5">{data.countyName}</Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">FY {data.fy}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall DPI Score & Rank */}
        <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DpiOverallBadge score={data.overallDPI} />
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              Rank #{data.rank} of 47
            </Badge>
          </div>
          <TrendArrow trend={data.trendVsPreviousYear} />
        </div>

        <Separator />

        {/* 4-Dimension Score Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dimension Score Breakdown
          </h4>

          <DimensionScoreBar
            label="Financial Management"
            score={data.financialManagement}
            icon={<Landmark className="h-3 w-3 text-orange-500" />}
          />
          <DimensionScoreBar
            label="Service Delivery"
            score={data.serviceDelivery}
            icon={<Activity className="h-3 w-3 text-blue-500" />}
          />
          <DimensionScoreBar
            label="Transparency"
            score={data.transparency}
            icon={<Eye className="h-3 w-3 text-green-500" />}
          />
          <DimensionScoreBar
            label="Governance"
            score={data.governance}
            icon={<ShieldCheck className="h-3 w-3 text-purple-500" />}
          />
        </div>

        <Separator />

        {/* Leaderboard: Top 5 & Bottom 5 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            DPI Rankings — All 47 Counties
          </h4>

          {/* Top 5 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Top 5 Counties</span>
            </div>
            {top5.map(entry => (
              <LeaderboardItem key={entry.countyCode} entry={entry} type="top" />
            ))}
          </div>

          {/* Bottom 5 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDown className="h-3 w-3 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">Bottom 5 Counties</span>
            </div>
            {bottom5.map(entry => (
              <LeaderboardItem key={entry.countyCode} entry={entry} type="bottom" />
            ))}
          </div>
        </div>

        <Separator />

        {/* Methodology Note */}
        <div className="p-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30">
          <h5 className="text-xs font-semibold flex items-center gap-1 mb-1">
            <Info className="h-3 w-3 text-muted-foreground" />
            Methodology Note
          </h5>
          <p className="text-xs text-muted-foreground">
            The DPI is a weighted composite index derived from four dimensions:
            Financial Management (25% — absorption rates, audit opinions),
            Service Delivery (30% — health, education, infrastructure outcomes),
            Transparency (20% — CBTS scores, reporting timeliness, public participation),
            Governance (25% — ethics compliance, leadership stability, procurement integrity).
            Sources: OAG audit opinions, CoB budget implementation reports, TI-Kenya County Transparency Index, KNBS statistical abstracts.
          </p>
        </div>

        <Separator />

        {/* Source Citation */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Source</span>
          </div>
          <p className="text-xs text-muted-foreground">{data.source}</p>
          <a
            href={data.sourceUrl}
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
