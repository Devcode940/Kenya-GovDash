"use client";

import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type BudgetDisbursement, getDisbursementsForRep } from "@/lib/data";

function varianceColor(status: string): string {
  if (status === "Within Limits") return "#22c55e";
  if (status === "Minor Variance") return "#eab308";
  if (status === "Significant Variance") return "#f97316";
  return "#ef4444";
}

function varianceBarWidth(variance: number): number {
  const absVal = Math.abs(variance);
  return Math.min(absVal * 2, 100);
}

export function BudgetDisbursementAudit({ rep }: { rep: Representative }) {
  const disbursements = getDisbursementsForRep(rep.id);
  const totalAllocated = disbursements.reduce((sum, d) => sum + d.allocatedAmount, 0);
  const totalDisbursed = disbursements.reduce((sum, d) => sum + d.disbursedAmount, 0);
  const overallVariance = totalAllocated > 0 ? ((totalDisbursed - totalAllocated) / totalAllocated * 100) : 0;
  const criticalCount = disbursements.filter((d) => d.status === "Critical Overspend").length;
  const significantCount = disbursements.filter((d) => d.status === "Significant Variance").length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Total Allocated</div>
            <div className="text-lg font-bold">${totalAllocated.toLocaleString()}M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Disbursed</div>
            <div className="text-lg font-bold">${totalDisbursed.toLocaleString()}M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Overall Variance</div>
            <div className="text-lg font-bold" style={{ color: overallVariance > 10 ? "#ef4444" : overallVariance > 5 ? "#eab308" : "#22c55e" }}>
              {overallVariance > 0 ? "+" : ""}{overallVariance.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-3 text-[11px] text-muted-foreground justify-center">
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" />Critical: {criticalCount}</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-orange-500" />Significant: {significantCount}</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />Within: {disbursements.filter((d) => d.status === "Within Limits").length}</span>
        </div>
      </div>

      <Separator />

      {/* Disbursement Items */}
      {disbursements.length > 0 ? (
        <div className="space-y-3">
          {disbursements.map((d) => (
            <div key={d.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{d.category}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: varianceColor(d.status), color: varianceColor(d.status) }}>
                      {d.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{d.quarter}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Allocated: ${d.allocatedAmount}M</span>
                    <span className="text-muted-foreground">Disbursed: ${d.disbursedAmount}M</span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/40">
                    <div className="h-full rounded-full bg-green-500/60" style={{ width: `${Math.min(d.allocatedAmount / Math.max(d.allocatedAmount, d.disbursedAmount) * 100, 100)}%` }} />
                    <div className="h-full rounded-full transition-all absolute top-0 left-0" style={{ width: `${Math.min(d.disbursedAmount / Math.max(d.allocatedAmount, d.disbursedAmount) * 100, 100)}%`, backgroundColor: varianceColor(d.status) }} />
                  </div>
                </div>
                <div className="text-sm font-bold shrink-0" style={{ color: varianceColor(d.status) }}>
                  {d.variance > 0 ? "+" : ""}{d.variance.toFixed(1)}%
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{d.notes}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-center">
          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No budget disbursement data for this representative</p>
        </div>
      )}
    </div>
  );
}
