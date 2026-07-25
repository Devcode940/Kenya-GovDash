'use client';

import { useMemo } from 'react';
import {
  getPetitionsForCounty,
  type PetitionEntry,
  type PetitionStatus,
  type PetitionCategory,
} from '@/lib/kenya-oversight-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Hourglass,
  ExternalLink,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface KenyaPetitionTrackerProps {
  countyCode: number;
}

const STATUS_COLORS: Record<PetitionStatus, string> = {
  Adopted: 'bg-green-600 text-white',
  Rejected: 'bg-red-600 text-white',
  'Under Review': 'bg-yellow-500 text-black',
  Withdrawn: 'bg-gray-400 text-white',
  Lapsed: 'bg-gray-500 text-white',
};

const STATUS_ICONS: Record<PetitionStatus, React.ReactNode> = {
  Adopted: <CheckCircle2 className="h-3 w-3" />,
  Rejected: <XCircle className="h-3 w-3" />,
  'Under Review': <Clock className="h-3 w-3" />,
  Withdrawn: <Ban className="h-3 w-3" />,
  Lapsed: <Hourglass className="h-3 w-3" />,
};

const CATEGORY_COLORS: Record<PetitionCategory, string> = {
  'Service Delivery': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Land & Boundary': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Infrastructure: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Education: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Governance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Budget & Finance': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  Environment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function KenyaPetitionTracker({ countyCode }: KenyaPetitionTrackerProps) {
  const petitions = useMemo(() => getPetitionsForCounty(countyCode), [countyCode]);

  const stats = useMemo(() => {
    const total = petitions.length;
    const adopted = petitions.filter((p) => p.status === 'Adopted').length;
    const rejected = petitions.filter((p) => p.status === 'Rejected').length;
    const underReview = petitions.filter((p) => p.status === 'Under Review').length;
    return { total, adopted, rejected, underReview };
  }, [petitions]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    petitions.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [petitions]);

  if (petitions.length === 0) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Public Petition & Resolution Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No petition data available for this county. Check County Assembly Hansard records or Senate petitions portal.
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Public Petition & Resolution Tracker
          </CardTitle>
          <CardDescription className="text-xs">
            County Assembly & Senate petitions — adoption, rejection, and resolution tracking
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-md border bg-muted/50 p-2 text-center">
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Total petitions recorded</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-md border bg-green-50 dark:bg-green-950 p-2 text-center">
                  <div className="text-lg font-bold text-green-600">{stats.adopted}</div>
                  <div className="text-xs text-muted-foreground">Adopted</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Petitions adopted by the assembly</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-md border bg-red-50 dark:bg-red-950 p-2 text-center">
                  <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Petitions rejected by the assembly</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-md border bg-yellow-50 dark:bg-yellow-950 p-2 text-center">
                  <div className="text-lg font-bold text-yellow-600">{stats.underReview}</div>
                  <div className="text-xs text-muted-foreground">Under Review</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Petitions currently under review</TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          {/* Petitions List */}
          <ScrollArea className="max-h-[220px]">
            <div className="space-y-2 pr-2">
              {petitions.map((petition: PetitionEntry) => (
                <div
                  key={petition.id}
                  className="rounded-md border p-2.5 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-xs font-medium leading-tight flex-1">
                      {petition.title}
                    </div>
                    <Badge className={`${STATUS_COLORS[petition.status]} text-xs px-1.5 py-0 shrink-0`}>
                      {STATUS_ICONS[petition.status]}
                      <span className="ml-0.5">{petition.status}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Petitioner: {petition.petitioner}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`${CATEGORY_COLORS[petition.category]} text-xs px-1.5 py-0`}>
                      {petition.category}
                    </Badge>
                    <span className="text-muted-foreground">
                      {petition.assemblyLevel}
                    </span>
                    <span className="text-muted-foreground">
                      {petition.dateSubmitted}
                    </span>
                  </div>

                  {(petition.votesFor !== null || petition.votesAgainst !== null) && (
                    <div className="flex items-center gap-2 text-xs">
                      {petition.votesFor !== null && (
                        <span className="flex items-center gap-0.5 text-green-600">
                          <ThumbsUp className="h-3 w-3" /> {petition.votesFor}
                        </span>
                      )}
                      {petition.votesAgainst !== null && (
                        <span className="flex items-center gap-0.5 text-red-600">
                          <ThumbsDown className="h-3 w-3" /> {petition.votesAgainst}
                        </span>
                      )}
                      {petition.mcasSupporting !== null && (
                        <span className="text-muted-foreground">
                          ({petition.mcasSupporting} MCAs supporting)
                        </span>
                      )}
                    </div>
                  )}

                  {petition.outcome && (
                    <div className="text-xs text-muted-foreground italic">
                      Outcome: {petition.outcome}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Category Distribution */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              Category Distribution
            </div>
            {categoryDistribution.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-xs w-28 truncate">{cat}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(count / petitions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Source Citations */}
          <div className="space-y-1">
            {petitions.map((p: PetitionEntry) => (
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
