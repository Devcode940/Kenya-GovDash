"use client";

import { Clock, CheckCircle2, AlertTriangle, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type PromiseTimelineEntry, promiseTimelineEntries, type PromiseStatus, getScoreColorHex, getStatusColor } from "@/lib/data";

function promiseStatusIcon(status: PromiseStatus) {
  if (status === "Fulfilled") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "In Progress") return <Clock className="h-4 w-4 text-yellow-500" />;
  if (status === "Not Started") return <Minus className="h-4 w-4 text-gray-400" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Calculate months between two dates
function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

// Calculate months from start to now
function monthsFromStart(start: string): number {
  const s = new Date(start);
  const now = new Date("2026-03-01"); // Using a fixed "current" date for consistency
  return (now.getFullYear() - s.getFullYear()) * 12 + (now.getMonth() - s.getMonth());
}

export function PolicyPromiseTimeline({ rep }: { rep: Representative }) {
  // Get timeline entries related to this rep's promises
  const repPromiseIds = rep.accountability.promises.map((p) => p.id);
  const relevantEntries = promiseTimelineEntries.filter((e) => repPromiseIds.includes(e.promiseId));

  // Also include all entries for broader view if rep has few
  const allEntries = promiseTimelineEntries;

  // Flag promises nearing deadline with <50% completion
  const flaggedPromises = allEntries.filter((e) => {
    const remainingMonths = monthsBetween("2026-03-01", e.targetDate);
    return remainingMonths < 12 && e.completionPercent < 50 && e.status !== "Fulfilled";
  });

  return (
    <div className="space-y-4">
      {/* Flagged Alert */}
      {flaggedPromises.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-500/10 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-semibold text-red-500">At-Risk Promises ({flaggedPromises.length})</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Promises nearing deadline with less than 50% completion</p>
        </div>
      )}

      {/* Gantt-style timeline */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Policy Promise Timeline</h4>
        <div className="space-y-3">
          {allEntries.map((entry) => {
            const totalMonths = monthsBetween(entry.startDate, entry.targetDate);
            const elapsedMonths = monthsFromStart(entry.startDate);
            const progressWidth = Math.min(entry.completionPercent, 100);
            const elapsedWidth = Math.min((elapsedMonths / totalMonths) * 100, 100);
            const isFlagged = flaggedPromises.includes(entry);
            const isRelevant = relevantEntries.some((r) => r.promiseId === entry.promiseId);

            return (
              <div key={entry.promiseId} className={`p-2 rounded-md ${isFlagged ? "border border-red-200 bg-red-500/5" : isRelevant ? "bg-primary/5" : ""}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {promiseStatusIcon(entry.status)}
                  <span className="text-xs font-medium flex-1 truncate">{entry.description}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: getStatusColor(entry.status), color: getStatusColor(entry.status) }}>
                    {entry.status}
                  </Badge>
                  <span className="text-xs font-bold shrink-0" style={{ color: getScoreColorHex(entry.completionPercent) }}>{entry.completionPercent}%</span>
                </div>
                {/* Gantt bar */}
                <div className="relative h-6 w-full rounded-md bg-muted/30 overflow-hidden">
                  {/* Timeline background - elapsed time */}
                  <div className="absolute h-full rounded-md bg-muted/50" style={{ width: `${elapsedWidth}%` }} />
                  {/* Progress fill */}
                  <div className="absolute h-full rounded-md transition-all" style={{ width: `${progressWidth}%`, backgroundColor: getScoreColorHex(entry.completionPercent) + "80%" }} />
                  {/* Milestone markers */}
                  {entry.milestoneDates.map((ms) => {
                    const msMonths = monthsBetween(entry.startDate, ms.date);
                    const msPosition = Math.min((msMonths / totalMonths) * 100, 100);
                    return (
                      <div key={ms.date} className="absolute top-0 h-full w-0.5" style={{ left: `${msPosition}%`, backgroundColor: ms.achieved ? "#22c55e" : "#94a3b8" }}>
                        <div className="absolute -top-1 w-2 h-2 rounded-full" style={{ left: "-3px", backgroundColor: ms.achieved ? "#22c55e" : "#94a3b8" }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{formatDate(entry.startDate)}</span>
                  <span>{formatDate(entry.targetDate)}</span>
                </div>
                {/* Milestone labels */}
                <div className="flex gap-1 mt-1 flex-wrap">
                  {entry.milestoneDates.map((ms) => (
                    <span key={ms.date} className={`text-[9px] ${ms.achieved ? "text-green-500" : "text-muted-foreground"}`}>
                      {ms.achieved ? "✓" : "○"} {ms.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
