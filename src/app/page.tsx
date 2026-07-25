"use client";

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Phone,
  Calendar,
  Users,
  Building2,
  Shield,
  Target,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Scale,
  LayoutDashboard,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  governmentData,
  findRepById,
  getPathToNode,
  flattenTree,
  getScoreColor,
  getScoreColorHex,
  getStatusColor,
  type Representative,
  type PromiseStatus,
  type ProjectStatus,
  type ComplianceStatus,
} from "@/lib/data";
import { OversightHub } from "@/components/oversight/OversightHub";

// ==================== CIRCULAR PROGRESS ====================
function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getScoreColorHex(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        {label && (
          <span className="text-[10px] text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}

// ==================== SCORE BAR ====================
function ScoreBar({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const color = getScoreColorHex(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-semibold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ==================== TREND INDICATOR ====================
function TrendIndicator({
  trend,
  current,
  previous,
}: {
  trend: "up" | "down" | "neutral";
  current: number;
  previous: number;
}) {
  const diff = current - previous;
  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const color =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className={`flex items-center gap-1 text-sm ${color}`}>
      <Icon className="h-4 w-4" />
      <span>
        {diff > 0 ? "+" : ""}
        {diff} pts
      </span>
    </div>
  );
}

// ==================== PERFORMANCE BADGE ====================
function PerformanceBadge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const bgColor = {
    green: "bg-green-500/15 text-green-700 dark:text-green-400",
    yellow: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    orange: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    red: "bg-red-500/15 text-red-700 dark:text-red-400",
  }[color];

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${bgColor}`}
    >
      {score}
    </span>
  );
}

// ==================== TREE NODE ====================
function TreeNode({
  node,
  selectedId,
  onSelect,
  expandedIds,
  toggleExpand,
  searchQuery,
  depth = 0,
}: {
  node: Representative;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  searchQuery: string;
  depth?: number;
}) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isMatch =
    searchQuery === "" ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.department.toLowerCase().includes(searchQuery.toLowerCase());

  const hasMatchingDescendant = useMemo(() => {
    if (searchQuery === "") return false;
    const check = (n: Representative): boolean =>
      n.children.some(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          check(c),
      );
    return check(node);
  }, [node, searchQuery]);

  if (searchQuery && !isMatch && !hasMatchingDescendant) return null;

  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-300/60 dark:bg-yellow-500/40 rounded px-0.5">
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-all duration-150 hover:bg-accent/60 ${
          isSelected
            ? "bg-primary/10 border-l-2 border-primary font-medium"
            : "border-l-2 border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) toggleExpand(node.id);
        }}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(node.id);
            if (hasChildren) toggleExpand(node.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: node.avatarColor }}
        >
          {node.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm leading-tight">
            {highlightMatch(node.name)}
          </div>
          <div className="truncate text-[11px] leading-tight text-muted-foreground">
            {highlightMatch(node.title)}
          </div>
        </div>

        <PerformanceBadge score={node.performance.overall} />
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              searchQuery={searchQuery}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== DETAILS PANEL ====================
function DetailsPanel({ rep }: { rep: Representative }) {
  const directReports = rep.children.length;
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-md"
            style={{ backgroundColor: rep.avatarColor }}
          >
            {rep.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight">{rep.name}</h2>
            <p className="text-sm text-muted-foreground">{rep.title}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{rep.department}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[11px] text-muted-foreground">Term</div>
              <div className="text-xs font-medium">
                {rep.termStart} → {rep.termEnd}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[11px] text-muted-foreground">Direct Reports</div>
              <div className="text-xs font-medium">{directReports}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground">Email</div>
              <div className="truncate text-xs font-medium">{rep.contactEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[11px] text-muted-foreground">Phone</div>
              <div className="text-xs font-medium">{rep.contactPhone}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Biography
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {rep.biography}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-muted-foreground" />
          Key Responsibilities
        </h3>
        <ul className="space-y-2">
          {rep.responsibilities.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {directReports > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-muted-foreground" />
            Direct Reports ({directReports})
          </h3>
          <div className="space-y-2">
            {rep.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: child.avatarColor }}
                >
                  {child.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{child.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {child.title}
                  </div>
                </div>
                <PerformanceBadge score={child.performance.overall} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SCORE CARD ====================
function ScoreCard({ rep }: { rep: Representative }) {
  const { performance } = rep;
  const { categories, overall, previousOverall, trend } = performance;

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        Performance Score Card
      </h3>

      <div className="mb-5 flex items-center justify-center gap-4">
        <CircularProgress value={overall} size={130} strokeWidth={12} label="Overall" />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">vs Last Period</span>
          <TrendIndicator trend={trend} current={overall} previous={previousOverall} />
          <span className="text-xs text-muted-foreground">Previous: {previousOverall}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3.5">
        <ScoreBar label="Budget Management" value={categories.budgetManagement} icon={<BarChart3 className="h-3.5 w-3.5" />} />
        <ScoreBar label="Project Delivery" value={categories.projectDelivery} icon={<Target className="h-3.5 w-3.5" />} />
        <ScoreBar label="Public Satisfaction" value={categories.publicSatisfaction} icon={<MessageSquare className="h-3.5 w-3.5" />} />
        <ScoreBar label="Transparency" value={categories.transparencyAccountability} icon={<Eye className="h-3.5 w-3.5" />} />
        <ScoreBar label="Policy Implementation" value={categories.policyImplementation} icon={<Shield className="h-3.5 w-3.5" />} />
        <ScoreBar label="Stakeholder Engagement" value={categories.stakeholderEngagement} icon={<Users className="h-3.5 w-3.5" />} />
      </div>

      <Separator className="my-4" />
      <div className="flex flex-wrap gap-3 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-muted-foreground">80-100</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">60-79</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">40-59</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-muted-foreground">0-39</span>
        </div>
      </div>
    </div>
  );
}

// ==================== STATUS ICONS ====================
function PromiseStatusIcon({ status }: { status: PromiseStatus }) {
  switch (status) {
    case "Fulfilled": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "In Progress": return <Clock className="h-4 w-4 text-yellow-500" />;
    case "Not Started": return <Minus className="h-4 w-4 text-gray-400" />;
    case "Broken": return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function ProjectStatusIcon({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "Completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "On Track": return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "Delayed": return <Clock className="h-4 w-4 text-yellow-500" />;
    case "At Risk": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "Not Started": return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

function ComplianceStatusIcon({ status }: { status: ComplianceStatus }) {
  switch (status) {
    case "Compliant": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "Minor Issues": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "Non-Compliant": return <XCircle className="h-4 w-4 text-red-500" />;
    case "Under Review": return <Clock className="h-4 w-4 text-blue-400" />;
  }
}

// ==================== ACCOUNTABILITY VIEW ====================
function AccountabilityView({ rep }: { rep: Representative }) {
  const { accountability } = rep;

  return (
    <Tabs defaultValue="promises" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-9">
        <TabsTrigger value="promises" className="text-xs px-1">
          <Scale className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
          Promises
        </TabsTrigger>
        <TabsTrigger value="projects" className="text-xs px-1">
          <Target className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="compliance" className="text-xs px-1">
          <Shield className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
          Compliance
        </TabsTrigger>
        <TabsTrigger value="feedback" className="text-xs px-1">
          <MessageSquare className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
          Feedback
        </TabsTrigger>
        <TabsTrigger value="oversight" className="text-xs px-1">
          <Eye className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
          Oversight
        </TabsTrigger>
      </TabsList>

      <TabsContent value="promises" className="mt-3">
        <div className="space-y-3">
          {accountability.promises.map((p) => (
            <div key={p.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <PromiseStatusIcon status={p.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{p.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: getStatusColor(p.status), color: getStatusColor(p.status) }}>
                      {p.status}
                    </Badge>
                    <span>Target: {p.targetDate}</span>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: getScoreColorHex(p.completionPercent) }}>
                  {p.completionPercent}%
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.completionPercent}%`, backgroundColor: getScoreColorHex(p.completionPercent) }} />
              </div>
            </div>
          ))}
          {accountability.promises.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No promises tracked</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="projects" className="mt-3">
        <div className="space-y-3">
          {accountability.projectMilestones.map((m) => (
            <div key={m.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <ProjectStatusIcon status={m.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{m.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: getStatusColor(m.status), color: getStatusColor(m.status) }}>
                      {m.status}
                    </Badge>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.timeline}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{m.budget}</span>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: getScoreColorHex(m.completionPercent) }}>
                  {m.completionPercent}%
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.completionPercent}%`, backgroundColor: getScoreColorHex(m.completionPercent) }} />
              </div>
            </div>
          ))}
          {accountability.projectMilestones.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No projects tracked</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="compliance" className="mt-3">
        <div className="space-y-3">
          {accountability.complianceRecords.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <ComplianceStatusIcon status={c.result} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.type}</p>
                  <p className="text-xs text-muted-foreground">{c.details}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: getStatusColor(c.result), color: getStatusColor(c.result) }}>
                    {c.result}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{c.date}</span>
                </div>
              </div>
            </div>
          ))}
          {accountability.complianceRecords.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No compliance records</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="feedback" className="mt-3">
        <div className="space-y-3">
          {accountability.publicFeedback.map((f) => (
            <div key={f.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircularProgress value={f.satisfactionRating} size={40} strokeWidth={4} />
                  <div>
                    <div className="text-sm font-medium">Satisfaction: {f.satisfactionRating}%</div>
                    <div className="text-[11px] text-muted-foreground">{f.respondentCount.toLocaleString()} respondents</div>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{f.date}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.summary}</p>
            </div>
          ))}
          {accountability.publicFeedback.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No public feedback available</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="oversight" className="mt-3">
        <OversightHub rep={rep} />
      </TabsContent>
    </Tabs>
  );
}

// ==================== HEADER ====================
function Header({
  searchQuery,
  onSearchChange,
  breadcrumb,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  breadcrumb: Representative[];
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <h1 className="hidden sm:block text-sm font-bold tracking-tight">
            Government Accountability Dashboard
          </h1>
          <h1 className="sm:hidden text-sm font-bold tracking-tight">GovDash</h1>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search representatives..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <nav className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground overflow-hidden">
          {breadcrumb.map((node, i) => (
            <span key={node.id} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground truncate" : "truncate"}>
                {node.name}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex-1" />
        <ThemeToggle />
      </div>
    </header>
  );
}

// ==================== THEME TOGGLE ====================
function ThemeToggle() {
  // Use useSyncExternalStore to detect dark mode without setState in effect
  const subscribe = useCallback((callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const getSnapshot = useCallback(() => document.documentElement.classList.contains("dark"), []);
  const getServerSnapshot = useCallback(() => false, []);

  const isDarkMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Track client-side mount
  const isMounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    useCallback(() => true, []),
    useCallback(() => false, []),
  );

  const toggleTheme = () => {
    const cls = document.documentElement.classList;
    if (cls.contains("dark")) {
      cls.remove("dark");
    } else {
      cls.add("dark");
    }
  };

  if (!isMounted) return <div className="h-9 w-9" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==================== MOBILE TABS ====================
type MobileTab = "tree" | "details" | "score" | "accountability";

function MobileTabNav({ activeTab, onTabChange }: { activeTab: MobileTab; onTabChange: (tab: MobileTab) => void }) {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: "tree", label: "Tree", icon: <UserCheck className="h-4 w-4" /> },
    { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
    { id: "score", label: "Score", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "accountability", label: "Audit", icon: <Scale className="h-4 w-4" /> },
  ];

  return (
    <div className="flex border-b bg-background lg:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
            activeTab === tab.id ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
function Dashboard() {
  const [selectedId, setSelectedId] = useState(governmentData.id);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([governmentData.id]));
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("tree");

  const selectedRep = useMemo(() => findRepById(governmentData, selectedId) ?? governmentData, [selectedId]);
  const breadcrumb = useMemo(() => getPathToNode(governmentData, selectedId), [selectedId]);

  // Expand path to a node and update expandedIds
  const expandPathToNode = useCallback((id: string) => {
    const path = getPathToNode(governmentData, id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      path.forEach((n) => next.add(n.id));
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileTab("details");
    // Auto-expand path to selected node
    expandPathToNode(id);
  }, [expandPathToNode]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Handle search change with auto-expand
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      const allReps = flattenTree(governmentData);
      const matchingIds = allReps
        .filter(
          (r) =>
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.department.toLowerCase().includes(query.toLowerCase()),
        )
        .map((r) => r.id);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        matchingIds.forEach((id) => {
          const path = getPathToNode(governmentData, id);
          path.forEach((n) => next.add(n.id));
        });
        return next;
      });
    }
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} breadcrumb={breadcrumb} />
      <MobileTabNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT: Tree Panel */}
        <div
          className={`h-full w-full lg:w-[280px] lg:shrink-0 border-r bg-card/50 lg:block ${
            mobileTab === "tree" ? "block" : "hidden"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Government Hierarchy
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-1" role="tree">
                <TreeNode
                  node={governmentData}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  searchQuery={searchQuery}
                  depth={0}
                />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* CENTER: Details + Score */}
        <div
          className={`flex-1 overflow-y-auto lg:block ${
            mobileTab === "details" || mobileTab === "score" ? "block" : "hidden"
          }`}
        >
          <div className="mx-auto max-w-2xl p-4 lg:p-6 space-y-5">
            <div className={mobileTab === "score" ? "hidden lg:block" : "block"}>
              <DetailsPanel rep={selectedRep} />
            </div>
            <div className={mobileTab === "details" ? "hidden lg:block" : "block"}>
              <ScoreCard rep={selectedRep} />
            </div>
          </div>
        </div>

        {/* RIGHT: Accountability Panel */}
        <div
          className={`h-full w-full lg:w-[350px] lg:shrink-0 border-l bg-card/50 lg:block ${
            mobileTab === "accountability" ? "block" : "hidden"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Accountability
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <AccountabilityView rep={selectedRep} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ENTRY POINT ====================
export default function Home() {
  return <Dashboard />;
}
