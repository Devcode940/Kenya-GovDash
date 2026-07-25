"use client";

import { TrendingUp, AlertTriangle, DollarSign, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type AssetDeclaration, assetDeclarations, getAssetDeclarationsForRep, citizenIncomeGrowthRate } from "@/lib/data";

function assetChangeColor(percent: number, flagged: boolean): string {
  if (flagged) return "#ef4444";
  if (percent > 50) return "#f97316";
  if (percent > 20) return "#eab308";
  return "#22c55e";
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Real Estate": "#3b82f6",
    "Investments": "#22c55e",
    "Cash & Savings": "#eab308",
    "Other": "#94a3b8",
  };
  return colors[category] || "#94a3b8";
}

export function AssetGrowthMonitor({ rep }: { rep: Representative }) {
  const repAssets = getAssetDeclarationsForRep(rep.id);
  const hasFlagged = repAssets.some((a) => a.flagged);
  const maxAsset = Math.max(...repAssets.map((a) => a.declaredAssets), 1);

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {hasFlagged && (
        <div className="rounded-lg border border-red-200 bg-red-500/10 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-semibold text-red-500">Suspicious Asset Growth Detected</span>
          </div>
          {repAssets.filter((a) => a.flagged).map((a) => (
            <p key={a.year} className="text-[11px] text-muted-foreground mt-1">
              {a.year}: {a.flagReason}
            </p>
          ))}
        </div>
      )}

      {/* Year-over-Year Asset Growth Bar Chart */}
      {repAssets.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Year-over-Year Asset Growth</h4>
          <div className="flex items-end gap-4 h-28">
            {repAssets.sort((a, b) => parseInt(a.year) - parseInt(b.year)).map((asset) => {
              const barHeight = (asset.declaredAssets / maxAsset) * 100;
              const color = assetChangeColor(asset.assetChangePercent, asset.flagged);
              return (
                <div key={asset.year} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold" style={{ color }}>{asset.assetChangePercent}%</span>
                  <div className="w-full rounded-t-md relative" style={{ height: `${Math.max(barHeight, 10)}%`, backgroundColor: asset.flagged ? "#ef444480" : "#22c55e60" }}>
                    {asset.flagged && <AlertTriangle className="h-3 w-3 text-red-500 absolute -top-2 left-1/2 -translate-x-1/2" />}
                  </div>
                  <div className="text-xs font-bold">${asset.declaredAssets.toLocaleString()}K</div>
                  <span className="text-[10px] text-muted-foreground">{asset.year}</span>
                </div>
              );
            })}
          </div>
          {/* Citizen comparison */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Average citizen income growth: {citizenIncomeGrowthRate}%/year</span>
            {repAssets.length > 0 && (
              <span className="ml-2">
                vs Official avg: <span className="font-bold" style={{ color: assetChangeColor(
                  repAssets.reduce((s, a) => s + a.assetChangePercent, 0) / repAssets.length,
                  hasFlagged
                ) }}>
                  {(repAssets.reduce((s, a) => s + a.assetChangePercent, 0) / repAssets.length).toFixed(1)}%/year
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Breakdown (latest year) */}
      {repAssets.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Asset Category Breakdown ({repAssets[repAssets.length - 1].year})</h4>
          <div className="space-y-2">
            {repAssets[repAssets.length - 1].categoryBreakdown.map((cat) => {
              const total = repAssets[repAssets.length - 1].declaredAssets;
              const percent = (cat.amount / total) * 100;
              return (
                <div key={cat.category} className="flex items-center gap-2">
                  <PieChart className="h-3.5 w-3.5 shrink-0" style={{ color: categoryColor(cat.category) }} />
                  <span className="text-xs w-24 shrink-0">{cat.category}</span>
                  <div className="flex-1 relative h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: categoryColor(cat.category) }} />
                  </div>
                  <span className="text-xs font-bold shrink-0">${cat.amount.toLocaleString()}K</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Detailed yearly data */}
      {repAssets.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Asset Declarations for {rep.name}</h4>
          {repAssets.sort((a, b) => parseInt(b.year) - parseInt(a.year)).map((asset) => (
            <div key={asset.year} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{asset.year}</span>
                  {asset.flagged && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-red-500 text-red-500">
                      ⚠ Flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Assets: <span className="font-bold">${asset.declaredAssets.toLocaleString()}K</span></span>
                  <span className="text-muted-foreground">Income: <span className="font-bold">${asset.declaredIncome.toLocaleString()}K</span></span>
                  <span className="font-bold" style={{ color: assetChangeColor(asset.assetChangePercent, asset.flagged) }}>
                    {asset.assetChangePercent > 0 ? "+" : ""}{asset.assetChangePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-center">
          <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No asset declaration data for this representative</p>
        </div>
      )}
    </div>
  );
}
