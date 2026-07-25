"use client";

import { Gavel, AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type DisciplinaryAction, type ActionSeverity, type ActionStatus, disciplinaryActions, getDisciplinaryForRep } from "@/lib/data";

function severityColor(severity: ActionSeverity): string {
  if (severity === "Criminal Referral") return "#dc2626";
  if (severity === "Impeachment") return "#7f1d1d";
  if (severity === "Suspension") return "#ef4444";
  if (severity === "Formal Reprimand") return "#f97316";
  return "#eab308";
}

function severityBg(severity: ActionSeverity): string {
  if (severity === "Criminal Referral") return "bg-red-600/15 text-red-600 dark:text-red-400";
  if (severity === "Impeachment") return "bg-red-800/15 text-red-800 dark:text-red-300";
  if (severity === "Suspension") return "bg-red-500/15 text-red-500 dark:text-red-400";
  if (severity === "Formal Reprimand") return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
}

function statusColor(status: ActionStatus): string {
  if (status === "Active" || status === "Proposed") return "#ef4444";
  if (status === "Appealed") return "#3b82f6";
  if (status === "Completed") return "#22c55e";
  return "#94a3b8";
}

function severityIcon(severity: ActionSeverity) {
  if (severity === "Criminal Referral" || severity === "Impeachment") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (severity === "Suspension" || severity === "Formal Reprimand") return <Gavel className="h-3.5 w-3.5" />;
  return <Shield className="h-3.5 w-3.5" />;
}

export function SanctionsRegistry({ rep }: { rep: Representative }) {
  const repActions = getDisciplinaryForRep(rep.id);
  const allActions = disciplinaryActions;

  // Summary stats
  const totalActions = allActions.length;
  const severityBreakdown: Record<ActionSeverity, number> = { "Minor Warning": 0, "Formal Reprimand": 0, "Suspension": 0, "Impeachment": 0, "Criminal Referral": 0 };
  allActions.forEach((a) => { severityBreakdown[a.severity]++; });
  const activeCount = allActions.filter((a) => a.status === "Active" || a.status === "Proposed").length;
  const resolvedCount = allActions.filter((a) => a.status === "Completed" || a.status === "Overturned").length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Total Actions</div>
            <div className="text-lg font-bold">{totalActions}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Active/Proposed</div>
            <div className="text-lg font-bold text-red-500">{activeCount}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Resolved</div>
            <div className="text-lg font-bold text-green-500">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Severity Breakdown</h4>
        <div className="flex gap-2">
          {(["Minor Warning", "Formal Reprimand", "Suspension", "Impeachment", "Criminal Referral"] as ActionSeverity[]).map((sev) => (
            <div key={sev} className="flex-1 rounded-md p-2 text-center" style={{ backgroundColor: severityColor(sev) + "15%" }}>
              {severityIcon(sev)}
              <div className="text-sm font-bold mt-1" style={{ color: severityColor(sev) }}>{severityBreakdown[sev]}</div>
              <div className="text-[9px] text-muted-foreground leading-tight">{sev}</div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rep-specific Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">Actions for {rep.name}</h4>
        {repActions.length > 0 ? (
          repActions.map((action) => (
            <div key={action.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: severityColor(action.severity) + "20%" }}>
                  {severityIcon(action.severity)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{action.type}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${severityBg(action.severity)}`}>
                      {action.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: statusColor(action.status), color: statusColor(action.status) }}>
                      {action.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Issued: {action.dateIssued}</span>
                    {action.resolvedDate && <><span>•</span><span>Resolved: {action.resolvedDate}</span></>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    <Gavel className="h-3 w-3 inline mr-1" />
                    {action.issuingBody}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No disciplinary actions recorded for this representative</p>
          </div>
        )}
      </div>
    </div>
  );
}
