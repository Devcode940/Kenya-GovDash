'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Shield, DollarSign, FileText, CheckCircle2, AlertCircle,
  ExternalLink, BookOpen, Scale, Link2, Info, RefreshCw
} from 'lucide-react';
import { getAuditColor, type Representative, type AuditOpinion, type BudgetPerformance } from '@/lib/kenya-data';
import { useEaccFeed } from '@/hooks/use-live-feeds';
import { FeedStatusIndicator, SourceCitationBadge } from '@/components/kenya/KenyaFeedStatus';
import { getDeclarationStatusColor } from '@/lib/live-feeds/eacc-service';
import { DATA_GAP_NOTES } from '@/lib/live-feeds/config';

interface KenyaAccountabilityPanelProps {
  representative: Representative | null;
}

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest OAG/CoB/TI-Kenya reports';

export function KenyaAccountabilityPanel({ representative }: KenyaAccountabilityPanelProps) {
  if (!representative) return null;

  const rep = representative;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Accountability Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="audit" className="text-xs py-1">
              <Shield className="h-3 w-3 mr-1" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs py-1">
              <DollarSign className="h-3 w-3 mr-1" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="promises" className="text-xs py-1">
              <BookOpen className="h-3 w-3 mr-1" />
              Promises
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs py-1">
              <Scale className="h-3 w-3 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-xs py-1">
              <Link2 className="h-3 w-3 mr-1" />
              Sources
            </TabsTrigger>
          </TabsList>

          {/* Audit Opinions Tab */}
          <TabsContent value="audit" className="mt-3">
            <AuditOpinionsTab auditOpinion={rep.auditOpinion} />
          </TabsContent>

          {/* Budget Performance Tab */}
          <TabsContent value="budget" className="mt-3">
            <BudgetPerformanceTab budgetPerformance={rep.budgetPerformance} />
          </TabsContent>

          {/* Promises vs Delivery Tab */}
          <TabsContent value="promises" className="mt-3">
            <PromisesTab />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-3">
            <ComplianceTab rep={rep} />
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="mt-3">
            <SourcesTab rep={rep} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AuditOpinionsTab({ auditOpinion }: { auditOpinion: AuditOpinion | null }) {
  if (!auditOpinion) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground italic">
          Audit opinions available for county-level executives and assemblies only.
          {DATA_NOT_AVAILABLE}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* FY 2023/24 */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <Shield className="h-4 w-4 text-yellow-600" />
          OAG Audit Opinion — FY 2023/24
        </h4>
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`${getAuditColor(auditOpinion.fy2023_24.type)} text-sm px-3 py-1 font-semibold`}>
              {auditOpinion.fy2023_24.type}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Source: {auditOpinion.fy2023_24.source}
          </div>
          <a href={auditOpinion.fy2023_24.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            View Source Document
          </a>
        </div>
      </div>

      {/* FY 2024/25 */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <Shield className="h-4 w-4 text-yellow-600" />
          OAG Audit Opinion — FY 2024/25
        </h4>
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          {auditOpinion.fy2024_25.dataAvailable ? (
            <Badge className={`${getAuditColor(auditOpinion.fy2024_25.type as any)} text-sm px-3 py-1 font-semibold`}>
              {auditOpinion.fy2024_25.type}
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground italic">
                {DATA_NOT_AVAILABLE} (specific county-level opinions require full PDF consultation)
              </p>
            </div>
          )}
          {auditOpinion.fy2024_25.source && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Source: {auditOpinion.fy2024_25.source}
            </div>
          )}
          {auditOpinion.fy2024_25.url && (
            <a href={auditOpinion.fy2024_25.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View Source Document
            </a>
          )}
        </div>
      </div>

      {/* Opinion Types Explanation */}
      <div className="p-2 rounded border border-dashed border-muted-foreground/30">
        <p className="text-xs text-muted-foreground">
          <strong>Audit Opinion Types:</strong> Unmodified = financial statements present fairly; Qualified = except for specified matters, statements present fairly; Adverse = statements do not present fairly; Disclaimer = auditor unable to form an opinion.
        </p>
      </div>
    </div>
  );
}

function AbsorptionRow({ label, rate, source }: { label: string; rate: number | null; source: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {rate !== null ? (
          <Badge className={`${rate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : rate >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} text-sm px-2 py-1 font-semibold`}>
            {rate}%
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-sm px-2 py-1">
            N/A
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <Info className="h-3 w-3 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">Source: {source}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function BudgetPerformanceTab({ budgetPerformance }: { budgetPerformance: BudgetPerformance | null }) {
  if (!budgetPerformance) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground italic">
          Budget performance data available for county-level governors only.
          {DATA_NOT_AVAILABLE}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-green-600" />
        Budget Absorption Rates — FY 2023/24
      </h4>

      <div className="space-y-2">
        <AbsorptionRow
          label="Overall Absorption"
          rate={budgetPerformance.overallAbsorption.rate}
          source={budgetPerformance.overallAbsorption.source}
        />
        <AbsorptionRow
          label="Recurrent Absorption"
          rate={budgetPerformance.recurrentAbsorption.rate}
          source={budgetPerformance.recurrentAbsorption.source}
        />
        <AbsorptionRow
          label="Development Absorption"
          rate={budgetPerformance.developmentAbsorption.rate}
          source={budgetPerformance.developmentAbsorption.source}
        />
      </div>

      {/* Source links */}
      <div className="text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Source: Controller of Budget — Consolidated County Budget Implementation Review Report FY 2023/24
        </p>
        <a href="https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
          <ExternalLink className="h-3 w-3" />
          cob.go.ke/reports
        </a>
      </div>
    </div>
  );
}

function PromisesTab() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-1">
        <BookOpen className="h-4 w-4 text-purple-600" />
        Manifesto Promises vs Delivery
      </h4>
      <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground italic">
          Manifesto fulfillment tracking data is not systematically available from official sources.
          Individual county manifestos exist but no centralized, verified tracking mechanism is publicly accessible.
        </p>
      </div>
      <p className="text-xs text-muted-foreground italic">
        Data not publicly available — No verified, systematic manifesto tracking data from OAG, CoB, or TI-Kenya reports
      </p>
    </div>
  );
}

function ComplianceTab({ rep }: { rep: Representative }) {
  const hasData = rep.scorecard.ethicsIntegrity.dataAvailable;
  const { data: eaccData, loading: eaccLoading, refresh: eaccRefresh } = useEaccFeed(rep.id);

  // Find EACC data for this specific representative
  const eaccDeclaration = eaccData?.assetDeclarations.find(d => d.representativeId === rep.id);
  const eaccInvestigations = eaccData?.investigations.filter(i =>
    i.representativeName.toLowerCase().includes(rep.fullName.toLowerCase().split(' ')[0])
  );
  const hasEaccData = !!eaccDeclaration || eaccInvestigations?.length > 0;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-1">
        <Scale className="h-4 w-4 text-red-600" />
        Ethics & Compliance
      </h4>

      {/* Ethics Score */}
      {hasData ? (
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Ethics & Integrity Score</span>
            <div className="flex items-center gap-1">
              <Badge className={`${rep.scorecard.ethicsIntegrity.score !== null ? getAuditColor('Qualified') : 'bg-gray-100 text-gray-500'} text-sm px-2 py-1`}>
                {rep.scorecard.ethicsIntegrity.score ?? 'N/A'}
              </Badge>
              <SourceCitationBadge
                source={rep.scorecard.ethicsIntegrity.source}
                fy={rep.scorecard.ethicsIntegrity.fy}
                url={rep.scorecard.ethicsIntegrity.url}
                dataAvailable={rep.scorecard.ethicsIntegrity.dataAvailable}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{rep.scorecard.ethicsIntegrity.source}</p>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground italic">{DATA_NOT_AVAILABLE}</p>
        </div>
      )}

      {/* EACC Live Feed Integration */}
      <div className="p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/10">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-semibold flex items-center gap-1">
            <Scale className="h-3.5 w-3.5 text-purple-600" />
            EACC Records — Live Feed
          </h5>
          <div className="flex items-center gap-1">
            <FeedStatusIndicator status={eaccData?.freshness.status || 'unavailable'} label="EACC" />
            <Button variant="ghost" size="sm" onClick={() => eaccRefresh()} className="h-5 w-5 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {eaccLoading ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Loading EACC feed...
          </div>
        ) : hasEaccData ? (
          <div className="space-y-2">
            {/* Declaration status */}
            {eaccDeclaration && (
              <div className="p-2 rounded border border-purple-300/50 dark:border-purple-700/50 bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Asset Declaration Status</span>
                  <Badge className={`${getDeclarationStatusColor(eaccDeclaration.status)} text-[10px] px-2 py-0.5`}>
                    {eaccDeclaration.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  {DATA_GAP_NOTES.eaccAssetDeclarations}
                </p>
                <div className="text-[10px] text-muted-foreground mt-1">
                  <span>FY: {eaccDeclaration.fy} · Year: {eaccDeclaration.declarationYear}</span>
                </div>
                {eaccDeclaration.flagReason && (
                  <div className="mt-1 p-1.5 rounded border border-purple-200 bg-purple-50/30 dark:bg-purple-900/10">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-purple-600" />
                      <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300">Flagged</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{eaccDeclaration.flagReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Investigations */}
            {eaccInvestigations && eaccInvestigations.length > 0 && (
              <div className="space-y-1">
                {eaccInvestigations.map(inv => (
                  <div key={inv.caseNumber} className="p-2 rounded border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{inv.caseNumber}</span>
                      <Badge className={`${
                        inv.status === 'Under Investigation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : inv.status === 'Prosecuted' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-500'
                      } text-[10px]`}>
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Allegation: {inv.allegationType}
                      {inv.initiatedDate && ` · Initiated: ${inv.initiatedDate}`}
                    </p>
                    <a href={inv.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink className="h-2.5 w-2.5" />
                      EACC source
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Individual amounts note */}
            <div className="p-2 rounded border border-dashed border-yellow-400/50 bg-yellow-50/30 dark:bg-yellow-900/10">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-yellow-600" />
                <span className="text-[11px] font-medium text-yellow-700 dark:text-yellow-300">Data Gap</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Individual asset/income/liability amounts are NOT published by EACC — confidential per LIA Section 26
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground italic mb-1">
              No EACC records found for this representative.
            </p>
            <p className="text-[11px] text-muted-foreground italic">
              {DATA_NOT_AVAILABLE} — Chapter 6 requires asset declaration but individual data is not publicly published
            </p>
            <a href="https://eacc.go.ke/press-releases/" target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-1">
              <ExternalLink className="h-2.5 w-2.5" />
              Check EACC press releases
            </a>
          </div>
        )}
      </div>

      {/* Court Cases */}
      <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30">
        <h5 className="text-xs font-medium mb-1">Court Records</h5>
        <p className="text-xs text-muted-foreground italic">{DATA_NOT_AVAILABLE} — Court records can be accessed via eklrc.go.ke but are not aggregated by representative</p>
      </div>
    </div>
  );
}

function SourcesTab({ rep }: { rep: Representative }) {
  const sources: { title: string; url: string; fy?: string; page?: string }[] = [];

  // Collect all sources from scorecard
  const scorecardKeys = ['overallAccountability', 'transparencyBudget', 'projectDeliveryAbsorption', 'manifestoFulfillment', 'legislativeOversight', 'ethicsIntegrity', 'publicSentiment'] as const;
  for (const key of scorecardKeys) {
    const metric = rep.scorecard[key];
    if (metric.dataAvailable && metric.source) {
      sources.push({
        title: metric.source,
        url: metric.url || '',
        fy: metric.fy,
        page: metric.page,
      });
    }
  }

  // Audit opinion sources
  if (rep.auditOpinion) {
    sources.push({
      title: rep.auditOpinion.fy2023_24.source,
      url: rep.auditOpinion.fy2023_24.url,
      fy: '2023/24',
    });
    if (rep.auditOpinion.fy2024_25.source) {
      sources.push({
        title: rep.auditOpinion.fy2024_25.source,
        url: rep.auditOpinion.fy2024_25.url || '',
        fy: '2024/25',
      });
    }
  }

  // Budget performance sources
  if (rep.budgetPerformance) {
    const bp = rep.budgetPerformance;
    if (bp.overallAbsorption.rate !== null) sources.push({ title: bp.overallAbsorption.source, url: '', fy: bp.overallAbsorption.fy });
    if (bp.recurrentAbsorption.rate !== null) sources.push({ title: bp.recurrentAbsorption.source, url: '', fy: bp.recurrentAbsorption.fy });
    if (bp.developmentAbsorption.rate !== null) sources.push({ title: bp.developmentAbsorption.source, url: '', fy: bp.developmentAbsorption.fy });
  }

  // Biography source
  if (rep.biographySource) {
    sources.push({ title: rep.biographySource, url: '' });
  }

  // Deduplicate
  const uniqueSources = sources.filter((s, i) => sources.findIndex(x => x.title === x.title) === i);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-1">
        <Link2 className="h-4 w-4 text-primary" />
        Full Source Citations
      </h4>

      {uniqueSources.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {uniqueSources.map((source, idx) => (
            <div key={idx} className="p-2 rounded-md bg-muted/50 text-xs space-y-1">
              <p className="font-medium">{source.title}</p>
              {source.fy && <p className="text-muted-foreground">FY: {source.fy}</p>}
              {source.page && <p className="text-muted-foreground">Page: {source.page}</p>}
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-2.5 w-2.5" />
                  {source.url.length > 60 ? source.url.substring(0, 60) + '...' : source.url}
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground italic">
            No specific source citations available for this representative.
            {DATA_NOT_AVAILABLE}
          </p>
        </div>
      )}
    </div>
  );
}
