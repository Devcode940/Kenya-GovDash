'use client';

import { useMemo } from 'react';
import {
  getCidpForCounty,
  type CIDPProject,
  type CIDPSector,
  type CIDPStatus,
} from '@/lib/kenya-oversight-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Ban,
  CircleSlash,
  ExternalLink,
  BarChart3,
  Milestone,
  AlertCircle,
} from 'lucide-react';

interface KenyaCidpDashboardProps {
  countyCode: number;
}

const STATUS_COLORS: Record<CIDPStatus, string> = {
  'Completed': 'bg-green-600 text-white',
  'On Track': 'bg-blue-600 text-white',
  'Delayed': 'bg-yellow-500 text-black',
  'At Risk': 'bg-red-600 text-white',
  'Not Started': 'bg-gray-400 text-white',
  'Abandoned': 'bg-red-900 text-white',
};

const STATUS_ICONS: Record<CIDPStatus, React.ReactNode> = {
  'Completed': <CheckCircle2 className="h-3 w-3" />,
  'On Track': <TrendingUp className="h-3 w-3" />,
  'Delayed': <AlertTriangle className="h-3 w-3" />,
  'At Risk': <XCircle className="h-3 w-3" />,
  'Not Started': <Ban className="h-3 w-3" />,
  'Abandoned': <CircleSlash className="h-3 w-3" />,
};

const SECTOR_COLORS: Record<CIDPSector, string> = {
  Health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Education: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Infrastructure: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Agriculture: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Water & Sanitation': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Trade & Industry': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Governance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Environment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const PROGRESS_BAR_COLORS: Record<CIDPStatus, string> = {
  'Completed': 'bg-green-500',
  'On Track': 'bg-blue-500',
  'Delayed': 'bg-yellow-500',
  'At Risk': 'bg-red-500',
  'Not Started': 'bg-gray-400',
  'Abandoned': 'bg-red-900',
};

export function KenyaCidpDashboard({ countyCode }: KenyaCidpDashboardProps) {
  const projects = useMemo(() => getCidpForCounty(countyCode), [countyCode]);

  const overallCompletion = useMemo(() => {
    const withData = projects.filter((p) => p.completionPercent !== null);
    if (withData.length === 0) return null;
    return Math.round(withData.reduce((sum, p) => sum + (p.completionPercent ?? 0), 0) / withData.length);
  }, [projects]);

  const sectorProgress = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    projects.forEach((p) => {
      if (!map[p.sector]) map[p.sector] = { total: 0, completed: 0 };
      map[p.sector].total += 1;
      if (p.status === 'Completed') map[p.sector].completed += 1;
    });
    return Object.entries(map);
  }, [projects]);

  const hasNullData = projects.some(
    (p) => p.completionPercent === null || p.budgetSpent === null || p.milestonesAchieved === null
  );

  if (projects.length === 0) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            CIDP Implementation Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No CIDP III project data available for this county. Refer to the County Integrated Development Plan document and CoB Annual Reports.
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            CIDP Implementation Dashboard
          </CardTitle>
          <CardDescription className="text-xs">
            County Integrated Development Plan (CIDP III 2023–2027) project delivery tracking
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Overall Completion */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs font-medium mb-1">
                Overall CIDP Completion
              </div>
              {overallCompletion !== null ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${overallCompletion}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{overallCompletion}%</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Completion data not available for all projects
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Sector Progress Summary */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              Sector Progress Summary
            </div>
            {sectorProgress.map(([sector, { total, completed }]) => (
              <div key={sector} className="flex items-center gap-2">
                <Badge variant="outline" className={`${SECTOR_COLORS[sector as CIDPSector]} text-xs px-1.5 py-0 shrink-0`}>
                  {sector}
                </Badge>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(completed / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {completed}/{total} done
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Data Gap Notice */}
          {hasNullData && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-2 text-xs text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Some projects have incomplete budget, milestone, or completion data. Figures marked as "N/A" indicate data gaps in public CoB/OAG reports.
              </span>
            </div>
          )}

          {/* Projects List */}
          <ScrollArea className="max-h-[240px]">
            <div className="space-y-2 pr-2">
              {projects.map((project: CIDPProject) => (
                <div
                  key={project.id}
                  className="rounded-md border p-2.5 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-xs font-medium leading-tight flex-1">
                      {project.projectName}
                    </div>
                    <Badge className={`${STATUS_COLORS[project.status]} text-xs px-1.5 py-0 shrink-0`}>
                      {STATUS_ICONS[project.status]}
                      <span className="ml-0.5">{project.status}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`${SECTOR_COLORS[project.sector]} text-xs px-1.5 py-0`}>
                      {project.sector}
                    </Badge>
                    <span className="text-muted-foreground">{project.cidpPhase}</span>
                    <span className="text-muted-foreground">Target: {project.targetDate}</span>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">Budget:</span>
                    <span>{project.budgetAllocated}</span>
                    <span className="text-muted-foreground">
                      / Spent: {project.budgetSpent ?? 'N/A'}
                    </span>
                  </div>

                  {/* Completion Progress */}
                  {project.completionPercent !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${PROGRESS_BAR_COLORS[project.status]}`}
                          style={{ width: `${project.completionPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {project.completionPercent}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      Completion percentage: Data gap — not reported
                    </div>
                  )}

                  {/* Milestones */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Milestone className="h-3 w-3" />
                    {project.milestonesAchieved !== null && project.milestonesTotal !== null
                      ? `Milestones: ${project.milestonesAchieved}/${project.milestonesTotal} achieved`
                      : 'Milestone data: N/A'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Source Citations */}
          <div className="space-y-1">
            {projects.map((p: CIDPProject) => (
              <div key={p.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{p.source}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  asChild
                >
                  <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
