"use client";

import { Trophy, TrendingDown, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type BenchmarkData, benchmarkData, getBenchmarkForDepartment, getScoreColorHex } from "@/lib/data";

function rankColor(rank: number): string {
  if (rank === 1) return "#22c55e";
  if (rank === 2) return "#3b82f6";
  if (rank === 3) return "#eab308";
  if (rank >= 5) return "#ef4444";
  return "#94a3b8";
}

function scoreBar(label: string, value: number) {
  const color = getScoreColorHex(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-24 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex-1 relative h-2 rounded-full bg-muted/40 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color }}>{value}</span>
    </div>
  );
}

export function InterAgencyBenchmarking({ rep }: { rep: Representative }) {
  const repBenchmark = getBenchmarkForDepartment(rep.department);
  const sortedBenchmarks = [...benchmarkData].sort((a, b) => a.overallRank - b.overallRank);
  const topPerformer = sortedBenchmarks[0];
  const bottomPerformer = sortedBenchmarks[sortedBenchmarks.length - 1];

  return (
    <div className="space-y-4">
      {/* Top/Bottom Performer Callouts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-500" />
            <span className="text-xs font-semibold text-green-500">Top Performer</span>
          </div>
          <div className="text-sm font-bold">{topPerformer.department}</div>
          <div className="text-xs text-muted-foreground">Rank #{topPerformer.overallRank}</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs font-semibold text-red-500">Lowest Rank</span>
          </div>
          <div className="text-sm font-bold">{bottomPerformer.department}</div>
          <div className="text-xs text-muted-foreground">Rank #{bottomPerformer.overallRank}</div>
        </div>
      </div>

      <Separator />

      {/* Leaderboard */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Ministry Leaderboard</h4>
        <div className="space-y-2">
          {sortedBenchmarks.map((b) => {
            const isRepDept = repBenchmark && b.department === repBenchmark.department;
            return (
              <div key={b.department} className={`flex items-center gap-2 p-2 rounded-md ${isRepDept ? "bg-primary/10 border border-primary/30" : ""}`}>
                <div className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: rankColor(b.overallRank) + "20%", color: rankColor(b.overallRank) }}>
                  {b.overallRank}
                </div>
                <span className={`text-xs flex-1 ${isRepDept ? "font-semibold" : "font-medium"}`}>{b.department}</span>
                {isRepDept && <Badge variant="outline" className="text-[10px] px-1 py-0 h-3 border-primary text-primary">Your Dept</Badge>}
                <div className="text-xs font-bold shrink-0" style={{ color: rankColor(b.overallRank) }}>
                  Avg: {Math.round((b.budgetExecutionRate + b.projectCompletionRate + b.publicSatisfactionScore + b.transparencyScore) / 4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* You vs Peers */}
      {repBenchmark && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">Your Department vs. Peers</h4>
          <div className="space-y-2">
            {scoreBar("Budget Execution", repBenchmark.budgetExecutionRate)}
            {scoreBar("Project Completion", repBenchmark.projectCompletionRate)}
            {scoreBar("Public Satisfaction", repBenchmark.publicSatisfactionScore)}
            {scoreBar("Transparency", repBenchmark.transparencyScore)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            <span>Overall Rank: #{repBenchmark.overallRank} of {benchmarkData.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
