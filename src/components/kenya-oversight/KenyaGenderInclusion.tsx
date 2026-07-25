'use client';

import { useMemo } from 'react';
import {
  getGenderInclusionForCounty,
  type GenderInclusionEntry,
} from '@/lib/kenya-oversight-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Scale,
  Users,
  ExternalLink,
  AlertCircle,
  Info,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Accessibility,
} from 'lucide-react';

interface KenyaGenderInclusionProps {
  countyCode: number;
}

const COMPLIANCE_COLORS: Record<string, string> = {
  Compliant: 'bg-green-600 text-white',
  Partial: 'bg-yellow-500 text-black',
  'Non-Compliant': 'bg-red-600 text-white',
};

// Article 27 & 81(b) constitutional target: at least 33% women representation
const CONSTITUTIONAL_TARGET = 33;

export function KenyaGenderInclusion({ countyCode }: KenyaGenderInclusionProps) {
  const data = useMemo(() => getGenderInclusionForCounty(countyCode), [countyCode]);

  if (!data) {
    return (
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Gender & Inclusion Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No gender & inclusion data available for this county. Refer to County Assembly records and Constitution Article 27 & 81(b).
        </CardContent>
      </Card>
    );
  }

  const hasNullData = data.womenMcasCount === null || data.womenMcasPercentage === null ||
    data.femaleCecmPercentage === null || data.genderBudgetCompliance === null ||
    data.genderBudgetAllocated === null;

  return (
    <TooltipProvider>
      <Card className="max-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Gender & Inclusion Compliance
          </CardTitle>
          <CardDescription className="text-xs">
            Article 27 & 81(b) constitutional compliance — {data.countyName} County, FY {data.fy}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Constitutional Requirement Notice */}
          <div className="rounded-md border bg-muted/50 p-2.5 space-y-1">
            <div className="text-xs font-medium flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Constitutional Requirement
            </div>
            <div className="text-xs text-muted-foreground">
              Article 27 of the Constitution guarantees equality and freedom from discrimination. Article 81(b) requires that not more than two-thirds of elective public bodies shall be of the same gender. The constitutional target is at least <span className="font-medium">{CONSTITUTIONAL_TARGET}%</span> women representation.
            </div>
          </div>

          <Separator />

          {/* Women MCA Representation */}
          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              Women MCA Representation
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Women MCAs</span>
              <span className="font-medium">
                {data.womenMcasCount !== null ? data.womenMcasCount : 'N/A'}
              </span>
            </div>

            {/* Representation Bar: Actual vs Constitutional Target */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">Actual</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  {data.womenMcasPercentage !== null ? (
                    <div
                      className={`h-full rounded-full ${
                        data.womenMcasPercentage >= CONSTITUTIONAL_TARGET
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(data.womenMcasPercentage, 100)}%` }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                      Data Gap
                    </div>
                  )}
                </div>
                <span className="w-10 text-right font-medium">
                  {data.womenMcasPercentage !== null ? `${data.womenMcasPercentage}%` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">Target</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white z-10"
                    style={{ left: `${CONSTITUTIONAL_TARGET}%` }}
                  />
                </div>
                <span className="w-10 text-right font-medium">{CONSTITUTIONAL_TARGET}%</span>
              </div>

              {data.womenMcasPercentage !== null && (
                <div className="text-xs text-muted-foreground">
                  {data.womenMcasPercentage >= CONSTITUTIONAL_TARGET
                    ? '✓ Meets Article 81(b) constitutional threshold'
                    : `⚠ ${CONSTITUTIONAL_TARGET - data.womenMcasPercentage}% below constitutional threshold — Article 81(b) non-compliance risk`}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Youth & PWD Representation */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-muted-foreground" />
              Youth & PWD Representation
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Youth Representatives</span>
              <span className="font-medium">
                {data.youthRepresentationCount !== null ? data.youthRepresentationCount : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Accessibility className="h-3 w-3" /> PWD Representatives
              </span>
              <span className="font-medium">
                {data.pwdRepresentationCount !== null ? data.pwdRepresentationCount : 'N/A'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Female CECM */}
          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-muted-foreground" />
              Female CECM Representation
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Female CECMs</span>
              <span className="font-medium">
                {data.femaleCecmCount !== null ? data.femaleCecmCount : 'N/A'}
              </span>
            </div>

            {/* CECM Bar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="w-16 text-muted-foreground">Percentage</span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                {data.femaleCecmPercentage !== null ? (
                  <div
                    className={`h-full rounded-full ${
                      data.femaleCecmPercentage >= CONSTITUTIONAL_TARGET
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(data.femaleCecmPercentage, 100)}%` }}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                    Data Gap
                  </div>
                )}
              </div>
              <span className="w-10 text-right font-medium">
                {data.femaleCecmPercentage !== null ? `${data.femaleCecmPercentage}%` : 'N/A'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Gender Budget Compliance */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <Info className="h-3 w-3 text-muted-foreground" />
              Gender Budget Compliance
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Compliance Status</span>
              {data.genderBudgetCompliance !== null ? (
                <Badge className={`${COMPLIANCE_COLORS[data.genderBudgetCompliance]} text-xs px-2 py-0.5`}>
                  {data.genderBudgetCompliance}
                </Badge>
              ) : (
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5">Data Gap</Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Budget Allocated</span>
              <span className="font-medium">{data.genderBudgetAllocated ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Budget Spent</span>
              <span className="font-medium">{data.genderBudgetSpent ?? 'N/A'}</span>
            </div>
          </div>

          <Separator />

          {/* KEWOPA */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">KEWOPA Members</span>
            <span className="font-medium">
              {data.kewopaMemberCount !== null ? data.kewopaMemberCount : 'N/A'}
            </span>
          </div>

          {/* Data Gap Notice */}
          {hasNullData && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-2 text-xs text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Some gender & inclusion fields have data gaps (N/A). Where data is unavailable, the County Assembly or OAG reports do not provide disaggregated figures. Gender budget compliance data is particularly sparse across most counties.
              </span>
            </div>
          )}

          <Separator />

          {/* Source Citations */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{data.source}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              asChild
            >
              <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
