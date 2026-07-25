'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Users, MessageSquare, MonitorSmartphone, BookOpen, ExternalLink,
  Info, FileText, Scale, CheckCircle2, XCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { getCivicParticipationForCounty, type CivicParticipationEntry } from '@/lib/kenya-oversight-data';

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest County Assembly/Bajeti Hub reports';

interface KenyaCivicParticipationProps {
  countyCode: number;
}

function ComplianceBadge({ status }: { status: CivicParticipationEntry['participationCompliance'] }) {
  if (!status) {
    return (
      <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs px-2 py-0.5">
        <XCircle className="h-3 w-3 mr-1" />
        Data Gap
      </Badge>
    );
  }
  const colorMap = {
    'Compliant': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Non-Compliant': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  const iconMap = {
    'Compliant': CheckCircle2,
    'Partial': AlertTriangle,
    'Non-Compliant': XCircle,
  };
  const Icon = iconMap[status];
  return (
    <Badge className={`${colorMap[status]} text-xs px-2 py-0.5 font-semibold`}>
      <Icon className="h-3 w-3 mr-1" />
      Art. 196: {status}
    </Badge>
  );
}

function DataGapNotice({ field }: { field: string }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <Info className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground italic">{field}: {DATA_NOT_AVAILABLE}</span>
    </div>
  );
}

function FeedbackBar({ rate }: { rate: number | null }) {
  if (rate === null) {
    return <DataGapNotice field="Feedback incorporation rate" />;
  }
  const colorClass = rate >= 60
    ? 'text-green-600'
    : rate >= 30
      ? 'text-yellow-600'
      : 'text-red-600';
  const barIndicatorClass = rate >= 60
    ? '[&>div]:bg-green-500'
    : rate >= 30
      ? '[&>div]:bg-yellow-500'
      : '[&>div]:bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Progress value={rate} className={`h-2 ${barIndicatorClass}`} />
        <span className={`text-xs font-semibold ml-2 ${colorClass}`}>{rate}%</span>
      </div>
    </div>
  );
}

export function KenyaCivicParticipation({ countyCode }: KenyaCivicParticipationProps) {
  const data: CivicParticipationEntry | undefined = getCivicParticipationForCounty(countyCode);

  if (!data) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            Civic Education & Participation Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground italic">
              No civic participation data available for this county. {DATA_NOT_AVAILABLE}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          Civic Education & Participation Hub
          <Badge variant="outline" className="text-xs px-2 py-0.5">{data.countyName}</Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">FY {data.fy}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Article 196 Compliance */}
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <span className="text-xs font-medium flex items-center gap-1">
            <Scale className="h-3 w-3 text-primary" />
            Article 196 Compliance
          </span>
          <ComplianceBadge status={data.participationCompliance} />
        </div>

        {/* Constitutional Reference */}
        <div className="p-2 rounded-md border border-dashed border-purple-300/50 dark:border-purple-800/50 bg-purple-50/30 dark:bg-purple-900/10">
          <div className="flex items-center gap-1 mb-1">
            <BookOpen className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Constitutional Reference
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Article 196(1)</strong> of the Constitution of Kenya requires that a county assembly
            &quot;conduct its business in an open manner, and hold its sittings and those of its committees,
            in public&quot;. Article 196(1)(b) further mandates that assemblies &quot;facilitate public participation
            and involvement in the legislative and other business of the assembly and its committees&quot;.
          </p>
        </div>

        <Separator />

        {/* Public Hearing Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-1 mb-0.5">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Public Hearings Held</span>
            </div>
            {data.publicHearingsHeld !== null ? (
              <span className="text-sm font-semibold">{data.publicHearingsHeld}</span>
            ) : (
              <DataGapNotice field="Public hearings" />
            )}
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-1 mb-0.5">
              <MessageSquare className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Avg. Attendance</span>
            </div>
            {data.averageAttendancePerHearing !== null ? (
              <span className="text-sm font-semibold">{data.averageAttendancePerHearing}</span>
            ) : (
              <DataGapNotice field="Average attendance" />
            )}
          </div>
        </div>

        <Separator />

        {/* Feedback Incorporation Rate */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-purple-600" />
              Feedback Incorporation Rate
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  <p className="text-xs">
                    Percentage of public feedback that was incorporated into county assembly decisions and budget processes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FeedbackBar rate={data.feedbackIncorporationRate} />
        </div>

        <Separator />

        {/* Civic Education Budget */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Civic Education Budget
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-md bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">Allocated</span>
              <p className="text-sm font-semibold">
                {data.civicEducationBudgetAllocated ?? DATA_NOT_AVAILABLE}
              </p>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">Spent</span>
              <p className="text-sm font-semibold">
                {data.civicEducationBudgetSpent ?? DATA_NOT_AVAILABLE}
              </p>
            </div>
          </div>

          {/* Absorption Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Absorption Rate</span>
              {data.civicEducationAbsorption !== null ? (
                <span className={`text-xs font-semibold ${
                  data.civicEducationAbsorption >= 70 ? 'text-green-600'
                  : data.civicEducationAbsorption >= 40 ? 'text-yellow-600'
                  : 'text-red-600'
                }`}>
                  {data.civicEducationAbsorption}%
                </span>
              ) : (
                <DataGapNotice field="Civic education absorption" />
              )}
            </div>
            {data.civicEducationAbsorption !== null && (
              <Progress value={data.civicEducationAbsorption} className="h-1.5" />
            )}
          </div>
        </div>

        <Separator />

        {/* Digital Participation Platforms */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <MonitorSmartphone className="h-3 w-3" />
            Digital Participation Platforms
          </h4>
          {data.digitalParticipationPlatforms !== null && data.digitalParticipationPlatforms.length > 0 ? (
            <div className="space-y-1">
              {data.digitalParticipationPlatforms.map((platform, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/50">
                  <MonitorSmartphone className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-medium">{platform}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded-md bg-muted/50">
              {data.digitalParticipationPlatforms === null ? (
                <DataGapNotice field="Digital platforms" />
              ) : (
                <p className="text-xs text-muted-foreground italic">No digital participation platforms listed for this county.</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Article 196 Compliance Detail Note */}
        <div className="p-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30">
          <div className="flex items-center gap-1 mb-1">
            <Scale className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold">Article 196 Compliance Assessment</span>
          </div>
          <p className="text-xs text-muted-foreground">{data.article196ComplianceNote}</p>
        </div>

        <Separator />

        {/* Source Citation */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Source</span>
          </div>
          <p className="text-xs text-muted-foreground">{data.source}</p>
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View source document
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
