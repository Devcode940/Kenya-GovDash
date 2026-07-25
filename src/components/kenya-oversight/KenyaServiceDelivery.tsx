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
  Heart, GraduationCap, TrendingUp, TrendingDown, ExternalLink,
  Info, FileText, Activity, Users, BookOpen, XCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  getServiceDeliveryForCounty,
  type ServiceDeliveryEntry,
  serviceDeliveryData
} from '@/lib/kenya-oversight-data';

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest KNBS/TSC/County reports';

interface KenyaServiceDeliveryProps {
  countyCode: number;
}

function SdiBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs px-2 py-0.5">
        <XCircle className="h-3 w-3 mr-1" />
        N/A
      </Badge>
    );
  }
  const colorClass = score >= 80
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : score >= 50
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return (
    <Badge className={`${colorClass} text-xs px-2 py-0.5 font-semibold`}>
      <Activity className="h-3 w-3 mr-1" />
      SDI: {score}
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

function RateBar({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  if (value === null) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <DataGapNotice field={label} />
      </div>
    );
  }
  const barColor = value >= 80 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className={`text-xs font-semibold ${barColor}`}>{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

function CountyRankItem({ entry, type }: { entry: ServiceDeliveryEntry; type: 'top' | 'bottom' }) {
  const score = entry.serviceDeliveryIndex ?? 0;
  const colorClass = type === 'top'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return (
    <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
      <span className="text-xs font-medium">{entry.countyName}</span>
      <Badge className={`${colorClass} text-[10px] px-1.5 py-0.5 font-semibold`}>
        {score}
      </Badge>
    </div>
  );
}

export function KenyaServiceDelivery({ countyCode }: KenyaServiceDeliveryProps) {
  const data: ServiceDeliveryEntry | undefined = getServiceDeliveryForCounty(countyCode);

  // Compute top 3 and bottom 3 from serviceDeliveryData
  const sortedData = [...serviceDeliveryData]
    .filter(d => d.serviceDeliveryIndex !== null)
    .sort((a, b) => (b.serviceDeliveryIndex ?? 0) - (a.serviceDeliveryIndex ?? 0));
  const top3 = sortedData.slice(0, 3);
  const bottom3 = sortedData.slice(-3).reverse();

  if (!data) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Health & Education Service Delivery Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground italic">
              No service delivery data available for this county. {DATA_NOT_AVAILABLE}
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
          <Activity className="h-4 w-4 text-blue-600" />
          Health & Education Service Delivery Index
          <Badge variant="outline" className="text-xs px-2 py-0.5">{data.countyName}</Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">FY {data.fy}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Composite SDI Score */}
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <span className="text-sm font-semibold">Service Delivery Index (Composite)</span>
          <SdiBadge score={data.serviceDeliveryIndex} />
        </div>

        <Separator />

        {/* HEALTH SECTION */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-red-600" />
            Health Service Delivery
          </h4>

          {/* Facilities per 10k */}
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              Facilities per 10,000 pop.
            </span>
            {data.healthFacilitiesPer10k !== null ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5">{data.healthFacilitiesPer10k}</Badge>
            ) : (
              <DataGapNotice field="Health facilities per 10k" />
            )}
          </div>

          {/* Doctor-Patient Ratio */}
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium">Doctor-Patient Ratio</span>
            {data.doctorPatientRatio !== null ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5">{data.doctorPatientRatio}</Badge>
            ) : (
              <DataGapNotice field="Doctor ratio" />
            )}
          </div>

          {/* Immunization Rate */}
          <RateBar
            label="Immunization Rate"
            value={data.immunizationRate}
            icon={<Heart className="h-3 w-3 text-red-500" />}
          />

          {/* Maternal Mortality */}
          <div className="p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium">Maternal Mortality Rate</span>
            {data.maternalMortalityRate !== null ? (
              <p className="text-xs text-muted-foreground mt-0.5">{data.maternalMortalityRate}</p>
            ) : (
              <DataGapNotice field="Maternal mortality" />
            )}
          </div>

          {/* Health Budget per Capita */}
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium">Health Budget per Capita</span>
            {data.healthBudgetPerCapita !== null ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5">{data.healthBudgetPerCapita}</Badge>
            ) : (
              <DataGapNotice field="Health budget per capita" />
            )}
          </div>
        </div>

        <Separator />

        {/* EDUCATION SECTION */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
            Education Service Delivery
          </h4>

          {/* Primary Enrollment */}
          <RateBar
            label="Primary Enrollment Rate"
            value={data.primaryEnrollmentRate}
            icon={<BookOpen className="h-3 w-3 text-indigo-500" />}
          />

          {/* Secondary Enrollment */}
          <RateBar
            label="Secondary Enrollment Rate"
            value={data.secondaryEnrollmentRate}
            icon={<GraduationCap className="h-3 w-3 text-indigo-500" />}
          />

          {/* Completion Rate */}
          <RateBar
            label="Primary Completion Rate"
            value={data.completionRatePrimary}
            icon={<TrendingUp className="h-3 w-3 text-green-500" />}
          />

          {/* Teacher Deployment */}
          <div className="p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium">Teacher Deployment vs Vacancy</span>
            {data.teacherDeploymentVsVacancy !== null ? (
              <p className="text-xs text-muted-foreground mt-0.5">{data.teacherDeploymentVsVacancy}</p>
            ) : (
              <DataGapNotice field="Teacher deployment" />
            )}
          </div>

          {/* Education Budget per Capita */}
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
            <span className="text-xs font-medium">Education Budget per Capita</span>
            {data.educationBudgetPerCapita !== null ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5">{data.educationBudgetPerCapita}</Badge>
            ) : (
              <DataGapNotice field="Education budget per capita" />
            )}
          </div>
        </div>

        <Separator />

        {/* County Comparison */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
            County Comparison
          </h4>

          {/* Top 3 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Top 3 Counties</span>
            </div>
            {top3.map(entry => (
              <CountyRankItem key={entry.countyCode} entry={entry} type="top" />
            ))}
          </div>

          {/* Bottom 3 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDown className="h-3 w-3 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">Bottom 3 Counties</span>
            </div>
            {bottom3.map(entry => (
              <CountyRankItem key={entry.countyCode} entry={entry} type="bottom" />
            ))}
          </div>
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
