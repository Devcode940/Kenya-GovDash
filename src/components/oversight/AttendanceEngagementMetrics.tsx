"use client";

import { Users, MapPin, Clock, BarChart3, Building2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type AttendanceMetrics, getAttendanceForRep, ministryAverageAttendance, getScoreColorHex } from "@/lib/data";

function CircularProgressSmall({ value, size = 60, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getScoreColorHex(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

export function AttendanceEngagementMetrics({ rep }: { rep: Representative }) {
  const attendance = getAttendanceForRep(rep.id);

  if (!attendance) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center">
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No attendance data available for this representative</p>
      </div>
    );
  }

  const trendDiff = attendance.sessionAttendanceRate - ministryAverageAttendance;
  const trendDirection = trendDiff >= 0 ? "above" : "below";

  return (
    <div className="space-y-4">
      {/* Attendance Rate */}
      <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
        <CircularProgressSmall value={attendance.sessionAttendanceRate} size={80} strokeWidth={10} />
        <div className="flex-1">
          <div className="text-sm font-semibold">Session Attendance Rate</div>
          <div className="text-xs text-muted-foreground mt-1">
            vs Ministry Average ({ministryAverageAttendance}%):
            <span className={trendDirection === "above" ? "text-green-500" : "text-red-500"}>
              {trendDiff > 0 ? "+" : ""}{trendDiff}% {trendDirection === "above" ? "above" : "below"}
            </span>
          </div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Engagement Breakdown</h4>
        <div className="space-y-3">
          {[
            { label: "Town Halls", value: attendance.townHallsAttended, icon: <Users className="h-3.5 w-3.5" />, max: 20 },
            { label: "Site Visits", value: attendance.siteVisits, icon: <MapPin className="h-3.5 w-3.5" />, max: 30 },
            { label: "Stakeholder Meetings", value: attendance.stakeholderMeetings, icon: <Building2 className="h-3.5 w-3.5" />, max: 30 },
            { label: "Public Hearings", value: attendance.publicHearingParticipation, icon: <BarChart3 className="h-3.5 w-3.5" />, max: 15 },
            { label: "Community Hours", value: attendance.communityEngagementHours, icon: <Clock className="h-3.5 w-3.5" />, max: 60 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="text-muted-foreground">{item.icon}</div>
              <span className="text-xs w-24 shrink-0">{item.label}</span>
              <div className="flex-1 relative h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full bg-primary/60" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }} />
              </div>
              <span className="text-xs font-bold shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quarterly Trend */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Quarterly Attendance Trend</h4>
        <div className="flex items-end gap-2 h-20">
          {attendance.quarterlyTrend.map((qt) => {
            const heightPercent = qt.attendance;
            return (
              <div key={qt.quarter} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: getScoreColorHex(heightPercent) }}>{qt.attendance}%</span>
                <div className="w-full rounded-t-md" style={{ height: `${heightPercent}%`, backgroundColor: getScoreColorHex(heightPercent), minHeight: "8px" }} />
                <span className="text-[9px] text-muted-foreground truncate max-w-[40px]">{qt.quarter.replace(" 2025", "").replace(" 2026", "")}</span>
              </div>
            );
          })}
        </div>
        {/* Ministry average line */}
        <div className="relative mt-2">
          <div className="absolute w-full border-t-2 border-dashed border-muted-foreground/40" style={{ bottom: "0" }} />
          <span className="text-[10px] text-muted-foreground">Ministry avg: {ministryAverageAttendance}%</span>
        </div>
      </div>
    </div>
  );
}
