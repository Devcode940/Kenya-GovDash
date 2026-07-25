'use client';

import { useMemo } from 'react';
import {
  getConflictsForCounty,
  type BorderConflictEntry,
  type ConflictSeverity,
  type ConflictStatus,
} from '@/lib/kenya-oversight-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  ExternalLink,
  AlertOctagon,
  AlertTriangle,
  Shield,
  Flame,
  CheckCircle2,
  RotateCcw,
  Users,
  Landmark,
  ArrowLeftRight,
  Handshake,
  TrendingUp,
  Banknote,
} from 'lucide-react';

interface KenyaBorderConflictsProps {
  countyCode: number;
}

const SEVERITY_COLORS: Record<ConflictSeverity, string> = {
  Critical: 'bg-red-900 text-white',
  High: 'bg-red-600 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-green-600 text-white',
};

const SEVERITY_ICONS: Record<ConflictSeverity, React.ReactNode> = {
  Critical: <AlertOctagon className="h-3 w-3" />,
  High: <AlertTriangle className="h-3 w-3" />,
  Medium: <Flame className="h-3 w-3" />,
  Low: <CheckCircle2 className="h-3 w-3" />,
};

const STATUS_COLORS: Record<ConflictStatus, string> = {
  Active: 'bg-red-600 text-white',
  Mediation: 'bg-purple-600 text-white',
  Resolved: 'bg-green-600 text-white',
  Recurring: 'bg-orange-500 text-white',
};

const STATUS_ICONS: Record<ConflictStatus, React.ReactNode> = {
  Active: <Flame className="h-3 w-3" />,
  Mediation: <Handshake className="h-3 w-3" />,
  Resolved: <CheckCircle2 className="h-3 w-3" />,
  Recurring: <RotateCcw className="h-3 w-3" />,
};

export function KenyaBorderConflicts({ countyCode }: KenyaBorderConflictsProps) {
  const conflicts = useMemo(() => getConflictsForCounty(countyCode), [countyCode]);

  if (conflicts.length === 0) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Inter-County Border Conflict Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No border conflict data recorded for this county. Refer to NCIC conflict assessment reports and Senate Committee on Boundary disputes.
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Inter-County Border Conflict Monitor
          </CardTitle>
          <CardDescription className="text-xs">
            Boundary disputes, pastoralist conflicts, and NCIC mediation tracking
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Map-style Visual: County Pair Conflicts */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
              County Pair Conflict Map
            </div>
            <div className="space-y-1">
              {conflicts.map((conflict: BorderConflictEntry) => (
                <div
                  key={conflict.id}
                  className="flex items-center justify-center gap-3 rounded-md border bg-muted/50 p-2"
                >
                  <span className="text-xs font-medium text-right flex-1">
                    {conflict.countiesInvolved[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-0.5 bg-red-500" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${SEVERITY_COLORS[conflict.severity]} text-xs px-1.5 py-0 cursor-help`}>
                          {SEVERITY_ICONS[conflict.severity]}
                          <span className="ml-0.5">{conflict.severity}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Severity: {conflict.severity} — {conflict.disputeType}
                      </TooltipContent>
                    </Tooltip>
                    <div className="w-6 h-0.5 bg-red-500" />
                  </div>
                  <span className="text-xs font-medium flex-1">
                    {conflict.countiesInvolved[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Conflict Cards */}
          <ScrollArea className="max-h-[240px]">
            <div className="space-y-2 pr-2">
              {conflicts.map((conflict: BorderConflictEntry) => (
                <div
                  key={conflict.id}
                  className="rounded-md border p-2.5 space-y-1.5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-xs font-medium leading-tight flex-1">
                      {conflict.countiesInvolved[0]} – {conflict.countiesInvolved[1]}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge className={`${SEVERITY_COLORS[conflict.severity]} text-xs px-1.5 py-0`}>
                        {SEVERITY_ICONS[conflict.severity]}
                        <span className="ml-0.5">{conflict.severity}</span>
                      </Badge>
                      <Badge className={`${STATUS_COLORS[conflict.status]} text-xs px-1.5 py-0`}>
                        {STATUS_ICONS[conflict.status]}
                        <span className="ml-0.5">{conflict.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Dispute Type */}
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>{conflict.disputeType}</span>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {conflict.description}
                  </div>

                  <Separator />

                  {/* Mediation Body */}
                  <div className="text-xs flex items-center gap-1.5">
                    <Landmark className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Mediation:</span>
                    <span className="font-medium">
                      {conflict.mediationBody ?? 'No mediation body recorded'}
                    </span>
                  </div>

                  {/* Resolution Progress */}
                  {conflict.resolutionProgress && (
                    <div className="text-xs flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">{conflict.resolutionProgress}</span>
                    </div>
                  )}

                  {/* Last Incident */}
                  {conflict.lastIncidentDate && (
                    <div className="text-xs text-muted-foreground">
                      Last incident: {conflict.lastIncidentDate}
                    </div>
                  )}

                  {/* Casualties */}
                  {conflict.casualtiesReported && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {conflict.casualtiesReported}
                    </div>
                  )}

                  {/* Economic Impact */}
                  {conflict.economicImpact && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      {conflict.economicImpact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* NCIC Reference */}
          <div className="rounded-md border bg-muted/50 p-2.5 space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
              National Cohesion and Integration Commission (NCIC)
            </div>
            <div className="text-xs text-muted-foreground">
              The NCIC is mandated under the National Cohesion and Integration Act (No. 12 of 2008) to investigate, mediate, and resolve inter-ethnic and inter-county conflicts. All active border disputes should be reported to NCIC for formal mediation.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              asChild
            >
              <a href="https://ncic.go.ke/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                NCIC Official Website
              </a>
            </Button>
          </div>

          <Separator />

          {/* Source Citations */}
          <div className="space-y-1">
            {conflicts.map((c: BorderConflictEntry) => (
              <div key={c.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{c.source}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  asChild
                >
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
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
