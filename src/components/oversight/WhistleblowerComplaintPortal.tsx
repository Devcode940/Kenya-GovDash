"use client";

import { Megaphone, MapPin, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type Complaint, complaints, getComplaintsForRep } from "@/lib/data";

function statusColor(status: string): string {
  if (status === "Escalated") return "#ef4444";
  if (status === "Under Investigation") return "#3b82f6";
  if (status === "Resolved") return "#22c55e";
  if (status === "Submitted") return "#eab308";
  return "#94a3b8";
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Corruption": "#ef4444",
    "Mismanagement": "#f97316",
    "Service Failure": "#eab308",
    "Procurement Fraud": "#dc2626",
    "Harassment": "#a855f7",
    "Environmental Violation": "#22c55e",
    "Other": "#94a3b8",
  };
  return colors[category] || "#94a3b8";
}

export function WhistleblowerComplaintPortal({ rep }: { rep: Representative }) {
  const repComplaints = getComplaintsForRep(rep.id);
  // Also show all complaints for overview
  const allComplaints = complaints;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  allComplaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Status distribution
  const statusCounts: Record<string, number> = {};
  allComplaints.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  // Region distribution
  const regionCounts: Record<string, number> = {};
  allComplaints.forEach((c) => {
    regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
  });

  // Average resolution time
  const resolvedComplaints = allComplaints.filter((c) => c.daysToResolve !== null);
  const avgResolutionTime = resolvedComplaints.length > 0
    ? Math.round(resolvedComplaints.reduce((sum, c) => sum + (c.daysToResolve || 0), 0) / resolvedComplaints.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Total Complaints</div>
            <div className="text-lg font-bold">{allComplaints.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Resolution</div>
            <div className="text-lg font-bold">{avgResolutionTime} days</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">This Rep</div>
            <div className="text-lg font-bold">{repComplaints.length}</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Category Breakdown */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Category Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs font-medium w-28 truncate">{cat}</span>
              <div className="flex-1 relative h-4 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(count / allComplaints.length) * 100}%`, backgroundColor: categoryColor(cat) }} />
              </div>
              <span className="text-xs font-bold shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Status Distribution</h4>
        <div className="flex gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex-1 rounded-md p-2 text-center" style={{ backgroundColor: statusColor(status) + "15%" }}>
              <div className="text-sm font-bold" style={{ color: statusColor(status) }}>{count}</div>
              <div className="text-[10px] text-muted-foreground">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Region Heatmap */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Region Complaint Density</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).map(([region, count]) => {
            const intensity = Math.min((count / allComplaints.length) * 300, 100);
            return (
              <div key={region} className="rounded-md p-2 text-center" style={{ backgroundColor: `rgba(239, 68, 68, ${intensity / 100})` }}>
                <MapPin className="h-3 w-3 mx-auto mb-1" style={{ color: intensity > 30 ? "white" : "#ef4444" }} />
                <div className="text-xs font-bold" style={{ color: intensity > 30 ? "white" : "currentColor" }}>{count}</div>
                <div className="text-[10px]" style={{ color: intensity > 30 ? "rgba(255,255,255,0.8)" : "text-muted-foreground" }}>{region}</div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Recent Complaints for this rep */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">Complaints for {rep.name}</h4>
        {repComplaints.length > 0 ? (
          repComplaints.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-start gap-2">
                <Megaphone className="h-4 w-4 shrink-0" style={{ color: categoryColor(c.category) }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: categoryColor(c.category), color: categoryColor(c.category) }}>
                      {c.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: statusColor(c.status), color: statusColor(c.status) }}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />{c.region}
                    <span>•</span>
                    <Clock className="h-3 w-3" />{c.dateSubmitted}
                    {c.daysToResolve && <><span>•</span><span>Resolved in {c.daysToResolve} days</span></>}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No complaints filed against this representative</p>
          </div>
        )}
      </div>
    </div>
  );
}
