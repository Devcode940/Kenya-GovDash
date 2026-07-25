'use client';

import { useMemo } from 'react';
import {
  getRevenueForCounty,
  type CountyRevenueEntry,
  revenueAutonomyData,
} from '@/lib/kenya-oversight-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  BarChart3,
  Info,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface KenyaRevenueAutonomyProps {
  countyCode: number;
}

function osrColor(osr: number | null): string {
  if (osr === null) return 'bg-gray-400 text-white';
  if (osr > 30) return 'bg-green-600 text-white';
  if (osr > 15) return 'bg-yellow-500 text-black';
  if (osr > 5) return 'bg-orange-500 text-white';
  return 'bg-red-600 text-white';
}

function efficiencyColor(eff: number | null): string {
  if (eff === null) return 'bg-gray-400';
  if (eff >= 70) return 'bg-green-500';
  if (eff >= 50) return 'bg-yellow-500';
  if (eff >= 35) return 'bg-orange-500';
  return 'bg-red-500';
}

export function KenyaRevenueAutonomy({ countyCode }: KenyaRevenueAutonomyProps) {
  const countyData = useMemo(() => getRevenueForCounty(countyCode), [countyCode]);

  const comparisonData = useMemo(() => {
    const sorted = [...revenueAutonomyData].sort(
      (a, b) => (b.osrPercentage ?? 0) - (a.osrPercentage ?? 0)
    );
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    return { top3, bottom3 };
  }, []);

  if (!countyData) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            County Revenue Autonomy Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No revenue autonomy data available for this county. Refer to CoB Annual County Budget Implementation Review Reports.
        </CardContent>
      </Card>
    );
  }

  const hasNullData = countyData.osrPercentage === null || countyData.collectionEfficiency === null;

  return (
    <TooltipProvider>
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            County Revenue Autonomy Score
          </CardTitle>
          <CardDescription className="text-xs">
            Own-source revenue vs equitable share dependency — FY {countyData.fy}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Revenue Split Visual */}
          <div className="space-y-2">
            <div className="text-xs font-medium">Revenue Breakdown</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex h-8 rounded-md overflow-hidden border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="bg-emerald-500 flex items-center justify-center text-xs font-medium text-white px-2"
                        style={{ width: `${countyData.osrPercentage ?? 5}%` }}
                      >
                        OSR {countyData.osrPercentage ?? 'N/A'}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      Own-Source Revenue: {countyData.ownSourceRevenue ?? 'N/A'}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white px-2"
                        style={{ width: `${100 - (countyData.osrPercentage ?? 5)}%` }}
                      >
                        Equitable Share {countyData.osrPercentage !== null ? (100 - countyData.osrPercentage).toFixed(1) : 'N/A'}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      Equitable Share: {countyData.equitableShare ?? 'N/A'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border p-2">
                <div className="text-muted-foreground">Own-Source Revenue</div>
                <div className="font-medium">{countyData.ownSourceRevenue ?? 'N/A'}</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-muted-foreground">Equitable Share</div>
                <div className="font-medium">{countyData.equitableShare ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              Revenue Autonomy Metrics
            </div>

            {/* OSR Percentage */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">OSR Percentage</span>
              <Badge className={`${osrColor(countyData.osrPercentage)} text-xs px-2 py-0.5`}>
                {countyData.osrPercentage !== null ? `${countyData.osrPercentage}%` : 'N/A'}
              </Badge>
            </div>

            {/* Collection Efficiency */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Collection Efficiency</span>
                <span className="text-xs font-medium">
                  {countyData.collectionEfficiency !== null ? `${countyData.collectionEfficiency}%` : 'N/A'}
                </span>
              </div>
              {countyData.collectionEfficiency !== null ? (
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${efficiencyColor(countyData.collectionEfficiency)}`}
                    style={{ width: `${countyData.collectionEfficiency}%` }}
                  />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Collection efficiency data gap
                </div>
              )}
            </div>

            {/* Diversification Index */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Revenue Diversification Index</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">
                  {countyData.revenueDiversificationIndex !== null
                    ? `${countyData.revenueDiversificationIndex}/10`
                    : 'N/A'}
                </span>
                {countyData.revenueDiversificationIndex !== null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      0–10 scale: measures variety of revenue streams (property rates, single business permits, fees, rents, etc.)
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Total Revenue */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Revenue</span>
              <span className="text-xs font-medium">{countyData.totalRevenue ?? 'N/A'}</span>
            </div>
          </div>

          <Separator />

          {/* Key Insight */}
          <div className="rounded-md border bg-muted/50 p-2.5 space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <Info className="h-3 w-3 text-muted-foreground" />
              Key Insight
            </div>
            <div className="text-xs text-muted-foreground">
              Counties with OSR &gt; 30% (e.g., Nairobi at 51.5%) demonstrate greater fiscal autonomy and resilience during equitable share delays. Counties with OSR &lt; 5% (e.g., Turkana at 2.8%) are heavily dependent on national transfers, making them vulnerable to cash flow crises when CRA disbursements are delayed — as seen during the 2024 revenue sharing standoff.
            </div>
          </div>

          {/* Data Gap Notice */}
          {hasNullData && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-2 text-xs text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Some revenue metrics have data gaps. Where figures are N/A, the CoB Annual Report does not provide disaggregated data for this county.
              </span>
            </div>
          )}

          <Separator />

          {/* Comparison Table */}
          <div className="space-y-2">
            <div className="text-xs font-medium">National Comparison (Top & Bottom 3)</div>

            {/* Top 3 */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Highest OSR Autonomy
              </div>
              {comparisonData.top3.map((entry: CountyRevenueEntry) => (
                <div key={entry.countyCode} className="flex items-center justify-between text-xs border rounded-md px-2 py-1">
                  <span className="font-medium">{entry.countyName}</span>
                  <Badge className={`${osrColor(entry.osrPercentage)} text-xs px-1.5 py-0`}>
                    {entry.osrPercentage !== null ? `${entry.osrPercentage}%` : 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Bottom 3 */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-red-600 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> Lowest OSR Autonomy
              </div>
              {comparisonData.bottom3.map((entry: CountyRevenueEntry) => (
                <div key={entry.countyCode} className="flex items-center justify-between text-xs border rounded-md px-2 py-1">
                  <span className="font-medium">{entry.countyName}</span>
                  <Badge className={`${osrColor(entry.osrPercentage)} text-xs px-1.5 py-0`}>
                    {entry.osrPercentage !== null ? `${entry.osrPercentage}%` : 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Source Citations */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{countyData.source}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              asChild
            >
              <a href={countyData.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
