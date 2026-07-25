"use client";

import { useState } from "react";
import {
  Shield,
  DollarSign,
  Megaphone,
  Users,
  FileText,
  BarChart3,
  Clock,
  Newspaper,
  TrendingUp,
  Gavel,
  Eye,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Representative } from "@/lib/data";
import { ConflictOfInterestTracker } from "./ConflictOfInterestTracker";
import { BudgetDisbursementAudit } from "./BudgetDisbursementAudit";
import { WhistleblowerComplaintPortal } from "./WhistleblowerComplaintPortal";
import { AttendanceEngagementMetrics } from "./AttendanceEngagementMetrics";
import { ProcurementTransparency } from "./ProcurementTransparency";
import { InterAgencyBenchmarking } from "./InterAgencyBenchmarking";
import { PolicyPromiseTimeline } from "./PolicyPromiseTimeline";
import { MediaSentimentFeed } from "./MediaSentimentFeed";
import { AssetGrowthMonitor } from "./AssetGrowthMonitor";
import { SanctionsRegistry } from "./SanctionsRegistry";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  component: React.FC<{ rep: Representative }>;
}

const features: FeatureCard[] = [
  {
    id: "conflicts",
    title: "Conflict of Interest Tracker",
    description: "Track business ties, family connections, stock holdings, and board memberships that may compromise official duties",
    icon: <Shield className="h-5 w-5" />,
    color: "#ef4444",
    component: ConflictOfInterestTracker,
  },
  {
    id: "budget",
    title: "Budget Disbursement Audit",
    description: "Monitor allocated vs disbursed funds with variance tracking and critical overspend alerts",
    icon: <DollarSign className="h-5 w-5" />,
    color: "#f97316",
    component: BudgetDisbursementAudit,
  },
  {
    id: "complaints",
    title: "Whistleblower & Complaints Portal",
    description: "View public complaints by category, status, region, and average resolution time",
    icon: <Megaphone className="h-5 w-5" />,
    color: "#dc2626",
    component: WhistleblowerComplaintPortal,
  },
  {
    id: "attendance",
    title: "Attendance & Engagement Metrics",
    description: "Track session attendance, town halls, site visits, and community engagement hours",
    icon: <Users className="h-5 w-5" />,
    color: "#3b82f6",
    component: AttendanceEngagementMetrics,
  },
  {
    id: "procurement",
    title: "Procurement Transparency",
    description: "Review government contracts, flagged overpricing, and single-source award warnings",
    icon: <FileText className="h-5 w-5" />,
    color: "#eab308",
    component: ProcurementTransparency,
  },
  {
    id: "benchmark",
    title: "Inter-Agency Benchmarking",
    description: "Compare ministry performance across budget execution, project delivery, and transparency scores",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#22c55e",
    component: InterAgencyBenchmarking,
  },
  {
    id: "timeline",
    title: "Policy Promise Timeline",
    description: "Gantt-style visualization of policy promises with milestones and at-risk deadline alerts",
    icon: <Clock className="h-5 w-5" />,
    color: "#0d7377",
    component: PolicyPromiseTimeline,
  },
  {
    id: "sentiment",
    title: "Media & Public Sentiment",
    description: "Track media coverage, sentiment scores, and source breakdown for each representative",
    icon: <Newspaper className="h-5 w-5" />,
    color: "#a855f7",
    component: MediaSentimentFeed,
  },
  {
    id: "assets",
    title: "Asset Growth Monitor",
    description: "Monitor year-over-year asset declarations with suspicious growth flagging and category breakdown",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "#dc2626",
    component: AssetGrowthMonitor,
  },
  {
    id: "sanctions",
    title: "Sanctions & Disciplinary Registry",
    description: "View formal reprimands, suspensions, criminal referrals, and active disciplinary proceedings",
    icon: <Gavel className="h-5 w-5" />,
    color: "#7f1d1d",
    component: SanctionsRegistry,
  },
];

export function OversightHub({ rep }: { rep: Representative }) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const activeFeature = features.find((f) => f.id === selectedFeature);

  return (
    <div className="space-y-3">
      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {features.map((feature) => (
          <button
            key={feature.id}
            className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors text-left cursor-pointer group"
            onClick={() => setSelectedFeature(feature.id)}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0" style={{ backgroundColor: feature.color + "15%" }}>
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <span className="text-xs font-semibold leading-tight group-hover:text-primary">{feature.title}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{feature.description}</p>
          </button>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={selectedFeature !== null} onOpenChange={(open) => { if (!open) setSelectedFeature(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              {activeFeature && (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: activeFeature.color + "15%" }}>
                    <div style={{ color: activeFeature.color }}>{activeFeature.icon}</div>
                  </div>
                  {activeFeature.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
            {activeFeature && <activeFeature.component rep={rep} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
