'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Shield, Landmark, DollarSign, AlertTriangle, ExternalLink,
  RefreshCw, Clock, FileText, Info, Wifi, WifiOff, Database,
  ChevronDown, ChevronUp, Activity
} from 'lucide-react';
import { useLiveFeeds, getFeedStatusLabel, getFeedStatusColor, formatTimestamp } from '@/hooks/use-live-feeds';
import { FEED_SOURCES } from '@/lib/live-feeds/config';
import { KenyaEaccAssetFeed } from './KenyaEaccAssetFeed';

// ==================== DATA FRESHNESS BADGE ====================

function FreshnessBadge({ status, lastFetched }: { status: string; lastFetched: string | null }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getFeedStatusColor(status as any)} text-xs px-2 py-1 cursor-help`}>
            {status === 'live' && <Wifi className="h-3 w-3 mr-1" />}
            {status === 'cached' && <Database className="h-3 w-3 mr-1" />}
            {status === 'static' && <WifiOff className="h-3 w-3 mr-1" />}
            {status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {getFeedStatusLabel(status as any)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <p className="text-xs">Last fetched: {formatTimestamp(lastFetched)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==================== SOURCE CARD ====================

function SourceCard({
  sourceId,
  freshness,
  itemCount,
  summaryText,
  reportUrl,
}: {
  sourceId: string;
  freshness: { status: string; lastFetchedAt: string | null; sourceUrl: string; isLiveApiAvailable: boolean; errorMessage?: string };
  itemCount: number;
  summaryText: string;
  reportUrl: string;
}) {
  const config = FEED_SOURCES[sourceId];

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-muted">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: config.color + '20', color: config.color }}>
            {config.iconEmoji}
          </div>
          <span className="text-sm font-semibold">{config.name.split('(')[0].trim()}</span>
        </div>
        <FreshnessBadge status={freshness.status} lastFetched={freshness.lastFetchedAt} />
      </div>

      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {summaryText}
      </p>

      {freshness.errorMessage && (
        <p className="text-[11px] text-yellow-600 dark:text-yellow-400 italic mb-2 line-clamp-2">
          {freshness.errorMessage}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] bg-muted text-muted-foreground border">
            {itemCount} data items
          </Badge>
          {!freshness.isLiveApiAvailable && (
            <Badge className="text-[10px] bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300">
              No REST API
            </Badge>
          )}
        </div>
        <a href={reportUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Source
        </a>
      </div>
    </div>
  );
}

// ==================== MAIN PANEL ====================

export function KenyaLiveFeedsPanel() {
  const { data, loading, error, lastRefreshed, refresh, overallStatus } = useLiveFeeds(true);
  const [expanded, setExpanded] = React.useState(true);
  const [showEacc, setShowEacc] = React.useState(false);

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Fetching live feeds from OAG, CoB, TI-Kenya, EACC...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-500">Failed to load feeds: {error}</span>
            <Button variant="outline" size="sm" onClick={() => refresh()} className="ml-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Count items per source
  const oagItems = data.oag.nationalSummaries.length + data.oag.countyAudits.length;
  const cobItems = data.cob.nationalBudgets.length + data.cob.countyBudgets.length;
  const tiItems = data.tiKenya.cpi.length + data.tiKenya.cbts.length + data.tiKenya.countyScores.length;
  const eaccItems = data.eacc.complianceSummary.length + data.eacc.assetDeclarations.length + data.eacc.investigations.length;

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live Data Feeds
          </CardTitle>
          <div className="flex items-center gap-2">
            <FreshnessBadge status={overallStatus} lastFetched={lastRefreshed} />
            <Button variant="ghost" size="sm" onClick={() => refresh()} className="h-7 w-7 p-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Architecture explanation */}
        <div className="mt-2 p-2 rounded border border-dashed border-muted-foreground/30">
          <p className="text-xs text-muted-foreground">
            <strong>Architecture:</strong> These feeds connect to oagkenya.go.ke, cob.go.ke, tikenya.org, and eacc.go.ke.
            Since these sources publish data as PDF reports (not REST APIs), the platform fetches report pages,
            extracts available links, and uses verified static data as fallback. <em>No numbers are invented</em> —
            data gaps are explicitly marked.
          </p>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {/* OAG */}
              <SourceCard
                sourceId="oag"
                freshness={data.oag.freshness}
                itemCount={oagItems}
                summaryText={`FY 2023/24: All 47 county executives received Qualified opinions. FY 2024/25: 1 Unmodified, 44 Qualified, 2 Adverse. County assemblies: 8 Unmodified, 37 Qualified, 2 Adverse.`}
                reportUrl="https://oagkenya.go.ke/category/reports/"
              />

              {/* CoB */}
              <SourceCard
                sourceId="cob"
                freshness={data.cob.freshness}
                itemCount={cobItems}
                summaryText={`FY 2023/24: Aggregate absorption 79.5%, Recurrent 87%, Development only 37%. Pending bills Kshs 176.80B. Only 12/47 counties spent over 70% of development budgets.`}
                reportUrl="https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports"
              />

              {/* TI-Kenya */}
              <SourceCard
                sourceId="ti-kenya"
                freshness={data.tiKenya.freshness}
                itemCount={tiItems}
                summaryText={`CPI 2025: Score 30/100, Rank #130/182. CBTS 2025: National budget transparency average 65/100 (15 counties surveyed). Kajiado CBTS 2024: 74/100.`}
                reportUrl="https://tikenya.org/publications/"
              />

              <Separator />

              {/* EACC — Full Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      style={{ backgroundColor: '#7c3aed20', color: '#7c3aed' }}>
                      ⚖️
                    </div>
                    <span className="text-sm font-semibold">EACC — Asset Declarations & Ethics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FreshnessBadge status={data.eacc.freshness.status} lastFetched={data.eacc.freshness.lastFetchedAt} />
                    <Button variant="outline" size="sm" onClick={() => setShowEacc(!showEacc)} className="text-xs h-7">
                      {showEacc ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                </div>

                {/* Compliance overview */}
                {data.eacc.complianceSummary.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-purple-200 dark:border-purple-800 mb-2">
                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-purple-600" />
                      Chapter 6 Compliance — FY {data.eacc.complianceSummary[0].fy}
                    </h5>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Compliance Rate</p>
                        <p className="text-sm font-bold text-yellow-700">{data.eacc.complianceSummary[0].complianceRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Submitted On Time</p>
                        <p className="text-sm font-bold">{data.eacc.complianceSummary[0].submittedOnTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Overdue</p>
                        <p className="text-sm font-bold text-red-700">{data.eacc.complianceSummary[0].overdue}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Under Investigation</p>
                        <p className="text-sm font-bold text-purple-700">{data.eacc.complianceSummary[0].underInvestigation}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      Source: {data.eacc.complianceSummary[0].source}
                    </p>
                  </div>
                )}

                {/* Data gap notice */}
                <div className="p-2 rounded border border-dashed border-yellow-400/50 bg-yellow-50/30 dark:bg-yellow-900/10 mb-2">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-yellow-600" />
                    <p className="text-[11px] text-yellow-700 dark:text-yellow-300 font-medium">
                      Data Gap: Individual asset declaration amounts are NOT publicly published by EACC
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Chapter 6 (Article 79) requires all State Officers to declare assets, but EACC treats
                    individual declarations as confidential under the Leadership and Integrity Act.
                    Only aggregate compliance rates are available. Investigation notices are from EACC press releases.
                  </p>
                </div>

                {/* Expanded EACC details */}
                {showEacc && (
                  <KenyaEaccAssetFeed feed={data.eacc} />
                )}
              </div>

              {/* Last refreshed */}
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last refreshed: {formatTimestamp(lastRefreshed)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => refresh()} className="text-xs h-7 gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Refresh All
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
