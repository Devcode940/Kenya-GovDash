"use client";

import { AlertTriangle, Link2, Building2, Users, TrendingUp, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type ConflictOfInterest, getConflictsForRep } from "@/lib/data";

function severityColor(severity: string): string {
  if (severity === "High") return "#ef4444";
  if (severity === "Medium") return "#eab308";
  return "#22c55e";
}

function statusColor(status: string): string {
  if (status === "Active") return "#ef4444";
  if (status === "Under Investigation") return "#3b82f6";
  if (status === "Resolved") return "#22c55e";
  return "#94a3b8";
}

export function ConflictOfInterestTracker({ rep }: { rep: Representative }) {
  const conflicts = getConflictsForRep(rep.id);
  const totalConflicts = conflicts.length;
  const highSeverity = conflicts.filter((c) => c.severity === "High").length;
  const underInvestigation = conflicts.filter((c) => c.status === "Under Investigation").length;
  const active = conflicts.filter((c) => c.status === "Active").length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Conflicts</div>
            <div className="text-lg font-bold">{totalConflicts}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
            <Shield className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">High Severity</div>
            <div className="text-lg font-bold text-red-500">{highSeverity}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
            <Link2 className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Under Investigation</div>
            <div className="text-lg font-bold text-blue-500">{underInvestigation}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
            <Users className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-lg font-bold text-red-500">{active}</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Conflict List */}
      {conflicts.length > 0 ? (
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: severityColor(conflict.severity) + "20%" }}>
                  <AlertTriangle className="h-3.5 w-3.5" style={{ color: severityColor(conflict.severity) }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{conflict.entity}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: severityColor(conflict.severity), color: severityColor(conflict.severity) }}>
                      {conflict.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: statusColor(conflict.status), color: statusColor(conflict.status) }}>
                      {conflict.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{conflict.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>Type: {conflict.type}</span>
                    <span>•</span>
                    <span>Flagged: {conflict.dateFlagged}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-center">
          <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No conflict of interest records for this representative</p>
        </div>
      )}
    </div>
  );
}
