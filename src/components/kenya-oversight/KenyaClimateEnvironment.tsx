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
  TreePine, Droplets, AlertTriangle, ShieldCheck, CloudRain,
  ExternalLink, Info, FileText, LeafyGreen, Flame, XCircle
} from 'lucide-react';
import { getClimateForCounty, type ClimateEnvironmentEntry } from '@/lib/kenya-oversight-data';

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest NEMA/CoB/KNBS reports';

interface KenyaClimateEnvironmentProps {
  countyCode: number;
}

function NemaStatusBadge({ status }: { status: ClimateEnvironmentEntry['nemaComplianceStatus'] }) {
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
    'Compliant': ShieldCheck,
    'Partial': AlertTriangle,
    'Non-Compliant': XCircle,
  };
  const Icon = iconMap[status];
  return (
    <Badge className={`${colorMap[status]} text-xs px-2 py-0.5 font-semibold`}>
      <Icon className="h-3 w-3 mr-1" />
      NEMA: {status}
    </Badge>
  );
}

function DataGapNotice({ field }: { field: string }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <Info className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground italic">{field}: {DATA_NOT_AVAILABLE}</span>
    </div>
  );
}

export function KenyaClimateEnvironment({ countyCode }: KenyaClimateEnvironmentProps) {
  const data: ClimateEnvironmentEntry | undefined = getClimateForCounty(countyCode);

  if (!data) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TreePine className="h-4 w-4 text-green-600" />
            Climate & Environmental Accountability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground italic">
              No climate & environment data available for this county. {DATA_NOT_AVAILABLE}
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
          <TreePine className="h-4 w-4 text-green-600" />
          Climate & Environmental Accountability
          <Badge variant="outline" className="text-xs px-2 py-0.5">{data.countyName}</Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">FY {data.fy}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* NEMA Compliance */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">NEMA Compliance Status</span>
          <NemaStatusBadge status={data.nemaComplianceStatus} />
        </div>

        {/* Environmental Projects Count */}
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <span className="text-xs font-medium flex items-center gap-1">
            <LeafyGreen className="h-3 w-3 text-green-600" />
            Environmental Projects
          </span>
          {data.environmentalProjectsCount !== null ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5 font-semibold">
              {data.environmentalProjectsCount} active
            </Badge>
          ) : (
            <DataGapNotice field="Environmental project count" />
          )}
        </div>

        <Separator />

        {/* Climate Budget Absorption */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Climate Budget Absorption</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  <p className="text-xs">
                    {data.climateBudgetAllocated ?? 'Allocated: Data gap'} · {data.climateBudgetSpent ?? 'Spent: Data gap'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {data.climateBudgetAbsorption !== null ? (
            <div className="space-y-1">
              <Progress value={data.climateBudgetAbsorption} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Allocated: {data.climateBudgetAllocated ?? DATA_NOT_AVAILABLE}
                </span>
                <span className="text-xs font-semibold">
                  {data.climateBudgetAbsorption}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Spent: {data.climateBudgetSpent ?? DATA_NOT_AVAILABLE}
              </span>
            </div>
          ) : (
            <DataGapNotice field="Climate budget absorption" />
          )}
        </div>

        <Separator />

        {/* Deforestation Rate */}
        <div className="p-2 rounded-md bg-muted/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-medium">Deforestation Rate</span>
          </div>
          {data.deforestationRate !== null ? (
            <p className="text-xs text-muted-foreground">{data.deforestationRate}</p>
          ) : (
            <DataGapNotice field="Deforestation rate" />
          )}
        </div>

        {/* Water Resource Status */}
        <div className="p-2 rounded-md bg-muted/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium">Water Resource Status</span>
          </div>
          {data.waterResourceStatus !== null ? (
            <p className="text-xs text-muted-foreground">{data.waterResourceStatus}</p>
          ) : (
            <DataGapNotice field="Water resource status" />
          )}
        </div>

        <Separator />

        {/* Disaster Events */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <CloudRain className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-medium">Disaster Events (Last 5 Years)</span>
          </div>
          {data.disasterEventsLast5Yrs !== null ? (
            <ScrollArea className="max-h-24">
              <div className="p-2 rounded-md bg-red-50/30 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs text-muted-foreground">{data.disasterEventsLast5Yrs}</p>
              </div>
            </ScrollArea>
          ) : (
            <DataGapNotice field="Disaster events" />
          )}
          {data.disasterResponseBudget !== null && (
            <div className="text-xs text-muted-foreground mt-1">
              Disaster Response Budget: {data.disasterResponseBudget}
            </div>
          )}
        </div>

        {/* NEMA Approvals Pending */}
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <span className="text-xs font-medium flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-primary" />
            NEMA Approvals Pending
          </span>
          {data.nemaApprovalsPending !== null ? (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs px-2 py-0.5 font-semibold">
              {data.nemaApprovalsPending} pending
            </Badge>
          ) : (
            <DataGapNotice field="NEMA approvals pending" />
          )}
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
