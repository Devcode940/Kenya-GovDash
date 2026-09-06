'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  MapPin, Users, Landmark, TrendingUp, FileText, Building2,
  ChevronRight, ExternalLink, AlertCircle, Sparkles, Shield,
  BookOpen, BadgeCheck,
} from 'lucide-react';
import {
  type CountyData,
  type Representative,
  type AuditOpinionType,
  getCoalitionColor,
  getAuditColor,
  getScoreBadgeClass,
  getCountyDemographics,
  getDataQualityScore,
  formatKesMillions,
  formatPopulation,
} from '@/lib/kenya-data';
import {
  getParliamentMPsForCounty,
  PARLIAMENT_MPS_TOTAL,
  type ParliamentMP,
} from '@/lib/kenya-parliament-mps';
import { useLanguage } from '@/lib/i18n';

// ==================== TYPES ====================

interface KenyaCountyInfoPanelProps {
  county: CountyData;
  onSelectRepresentative: (rep: Representative) => void;
  onRequestExpansion?: (countyName: string, sectionLabel: string) => void;
  onBrowseCounties?: () => void;
}

// ==================== SUB-COMPONENT: ParliamentMPsSummary ====================

function ParliamentMPsSummary({ county }: { county: CountyData }) {
  const mps = getParliamentMPsForCounty(county.name);
  const visibleMps = mps.slice(0, 6);

  // Coalition breakdown
  const coalitionCounts = mps.reduce<Record<string, number>>((acc, mp) => {
    acc[mp.coalition] = (acc[mp.coalition] ?? 0) + 1;
    return acc;
  }, {});
  const coalitionEntries = Object.entries(coalitionCounts).sort((a, b) => b[1] - a[1]);

  if (mps.length === 0) {
    return (
      <Card className="border border-dashed border-muted-foreground/40 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Parliament-Verified MPs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/30">
            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                No verified MP data for {county.name} County
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Parliament of Kenya records for {county.name} County constituencies are not yet
                indexed in this dashboard. Visit parliament.go.ke directly for the full list.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-green-600" />
            Parliament-Verified MPs
          </CardTitle>
          <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 px-2 py-0.5">
            {mps.length} of {PARLIAMENT_MPS_TOTAL}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Verified directly from the Parliament of Kenya (parliament.go.ke) — National Assembly
          constituency MPs representing {county.name} County.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Coalition split badges */}
        {coalitionEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coalitionEntries.map(([coalition, count]) => (
              <Badge
                key={coalition}
                className={`${getCoalitionColor(coalition as Parameters<typeof getCoalitionColor>[0])} text-[10px] px-2 py-0.5 border`}
              >
                {coalition}: {count}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* First 6 MPs as tappable cards */}
        <div className="space-y-1.5">
          {visibleMps.map((mp) => (
            <ParliamentMPCard key={mp.id} mp={mp} />
          ))}
        </div>

        {/* Footer source attribution */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-dashed border-muted-foreground/20 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="sr-only">External link to Parliament of Kenya</span>
          <span>
            Source: Parliament of Kenya (parliament.go.ke) · {mps.length} MPs listed of
            {' '}{PARLIAMENT_MPS_TOTAL} total National Assembly seats
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ParliamentMPCard({ mp }: { mp: ParliamentMP }) {
  return (
    <a
      href={mp.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/80 hover:border-primary/40 transition-colors cursor-pointer group"
      aria-label={`Open ${mp.fullName} profile on parliament.go.ke`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
        <Landmark className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{mp.fullName}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{mp.officialTitle}</span>
          <Badge
            className={`${getCoalitionColor(mp.coalition)} text-[10px] px-1.5 py-0 border shrink-0`}
          >
            {mp.party}
          </Badge>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
    </a>
  );
}

// ==================== SUB-COMPONENT: DataQualityCard ====================

function DataQualityCard({ county }: { county: CountyData }) {
  const { t } = useLanguage();
  const score = getDataQualityScore(county);

  const qualityColorClass =
    score.quality === 'Complete'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-300'
      : score.quality === 'Partial'
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';

  const qualityLabel =
    score.quality === 'Complete'
      ? t('rightSidebar.dataQuality.complete')
      : score.quality === 'Partial'
        ? t('rightSidebar.dataQuality.partial')
        : t('rightSidebar.dataQuality.minimal');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            {t('rightSidebar.dataQuality')}
          </CardTitle>
          <Badge className={`${qualityColorClass} text-[10px] px-2 py-0.5 border font-semibold`}>
            {qualityLabel} · {score.coveragePercent}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Coverage of {score.availableItems} of {score.totalItems} core county datasets —
          &quot;Complete&quot; ≥ 80%, &quot;Partial&quot; 40–79%, &quot;Minimal&quot; &lt; 40%.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 10-item checklist grid (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {score.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
              title={item.available ? 'Data available' : 'Data not publicly available'}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  item.available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-xs truncate ${
                  item.available ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Score footer */}
        <Separator />
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">{t('rightSidebar.dataQuality.score')}:</span>
          <span className="font-semibold">
            {score.availableItems}/{score.totalItems} ({score.coveragePercent}% coverage)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN COMPONENT ====================

export function KenyaCountyInfoPanel({
  county,
  onSelectRepresentative,
  onRequestExpansion,
  onBrowseCounties,
}: KenyaCountyInfoPanelProps) {
  const { countyName: tc } = useLanguage();
  const countyNameTranslated = tc(county.name);

  const gov = county.governor;
  const govScore = gov.scorecard.overallAccountability.score;
  const demographics = getCountyDemographics(county.name);
  const budget = county.budgetAllocation ?? null;
  const auditOpinion = gov.auditOpinion;

  return (
    <div className="space-y-4">
      {/* 1. County Header Card */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{countyNameTranslated} County</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                County Code {county.code} · {county.region} Region · Constitution of Kenya 2010,
                Chapter 11
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              {govScore !== null && (
                <Badge
                  className={`${getScoreBadgeClass(govScore)} px-3 py-1 text-sm font-bold border-2`}
                >
                  Gov Score: {govScore}
                </Badge>
              )}
              {auditOpinion?.fy2023_24?.type && (
                <Badge
                  className={`${getAuditColor(
                    auditOpinion.fy2023_24.type as AuditOpinionType
                  )} text-[10px] px-2 py-0.5 border`}
                >
                  OAG FY 2023/24: {auditOpinion.fy2023_24.type}
                </Badge>
              )}
              <Badge
                className={`${getCoalitionColor(gov.coalition)} text-xs px-2 py-1 border`}
              >
                {gov.coalition}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {govScore !== null && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 mb-2">
              <Progress value={govScore} className="h-3 flex-1" />
              <span className="text-sm font-semibold">{govScore}/100</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Governor accountability score from OAG, CoB and TI-Kenya oversight reports.
            </p>
          </CardContent>
        )}
      </Card>

      {/* 2. Demographics & Population */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Demographics & Population
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demographics ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Population
                </div>
                <div className="text-lg font-bold mt-0.5">
                  {formatPopulation(demographics.population)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {demographics.population.toLocaleString()} people
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Land Area
                </div>
                <div className="text-lg font-bold mt-0.5">
                  {demographics.landAreaSqKm.toLocaleString()} km²
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {demographics.populationCensus}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Density
                </div>
                <div className="text-lg font-bold mt-0.5">
                  {demographics.densityPerSqKm.toLocaleString()}/km²
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  people per km²
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/30">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Demographic data for {countyNameTranslated} County is not yet loaded. KNBS 2019
                Census data covers all 47 counties.
              </p>
            </div>
          )}
          {demographics && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Source: {demographics.source}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3. Budget Allocation FY 2024/25 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Budget Allocation FY 2024/25
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budget && budget.dataAvailable ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Equitable Share
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    {formatKesMillions(budget.equitableShare)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    National transfer
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total Budget
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    {formatKesMillions(budget.totalBudget)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Approved FY 2024/25
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    OSR Target
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    {formatKesMillions(budget.osrTarget)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Own Source Revenue
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Source: {budget.source}
              </p>
            </>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/30">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  FY 2024/25 budget allocation not yet published
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Equitable share, total approved budget, and OSR target for
                  {' '}{countyNameTranslated} County are not yet publicly available in latest CoB
                  and CRA reports.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Development Performance FY 2023/24 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Development Performance FY 2023/24
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gov.budgetPerformance ? (
            <div className="space-y-2.5">
              <BudgetAbsorptionRow
                label="Overall Absorption"
                rate={gov.budgetPerformance.overallAbsorption.rate}
                source={gov.budgetPerformance.overallAbsorption.source}
                fy={gov.budgetPerformance.overallAbsorption.fy}
              />
              <BudgetAbsorptionRow
                label="Recurrent Absorption"
                rate={gov.budgetPerformance.recurrentAbsorption.rate}
                source={gov.budgetPerformance.recurrentAbsorption.source}
                fy={gov.budgetPerformance.recurrentAbsorption.fy}
              />
              <BudgetAbsorptionRow
                label="Development Absorption"
                rate={gov.budgetPerformance.developmentAbsorption.rate}
                source={gov.budgetPerformance.developmentAbsorption.source}
                fy={gov.budgetPerformance.developmentAbsorption.fy}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Budget performance data not publicly available in latest CoB reports.
            </p>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Project Delivery Score
              </div>
              <div className="text-base font-bold mt-0.5 flex items-center gap-1.5">
                {gov.scorecard.projectDeliveryAbsorption.score !== null ? (
                  <>
                    <Badge
                      className={`${getScoreBadgeClass(
                        gov.scorecard.projectDeliveryAbsorption.score
                      )} text-[10px] px-1.5 py-0 border`}
                    >
                      {gov.scorecard.projectDeliveryAbsorption.score}
                    </Badge>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Transparency Score
              </div>
              <div className="text-base font-bold mt-0.5 flex items-center gap-1.5">
                {gov.scorecard.transparencyBudget.score !== null ? (
                  <>
                    <Badge
                      className={`${getScoreBadgeClass(
                        gov.scorecard.transparencyBudget.score
                      )} text-[10px] px-1.5 py-0 border`}
                    >
                      {gov.scorecard.transparencyBudget.score}
                    </Badge>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Source: Controller of Budget (CoB) Annual County Budget Implementation Review Report
            FY 2023/24; Bajeti Hub County Budget Transparency Survey 2024.
          </p>
        </CardContent>
      </Card>

      {/* 5. Reports & Audit Opinions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Reports & Audit Opinions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* FY 2023/24 Audit Opinion */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              FY 2023/24 Audit Opinion
            </div>
            {auditOpinion?.fy2023_24?.type ? (
              <Badge
                className={`${getAuditColor(
                  auditOpinion.fy2023_24.type as AuditOpinionType
                )} text-xs px-2 py-1 border`}
              >
                {auditOpinion.fy2023_24.type}
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground border text-xs px-2 py-1">
                N/A
              </Badge>
            )}
          </div>

          {/* FY 2024/25 Audit Opinion */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              FY 2024/25 Audit Opinion
            </div>
            {auditOpinion?.fy2024_25?.type ? (
              <Badge
                className={`${getAuditColor(
                  auditOpinion.fy2024_25.type as AuditOpinionType
                )} text-xs px-2 py-1 border`}
              >
                {auditOpinion.fy2024_25.type}
              </Badge>
            ) : (
              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  OAG FY 2024/25 summary report published — county-specific opinion pending full
                  PDF consultation.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* External report links */}
          <div className="space-y-1.5">
            {auditOpinion?.fy2023_24?.url && (
              <ExternalReportLink
                label="OAG Summary Report (FY 2023/24)"
                url={auditOpinion.fy2023_24.url}
              />
            )}
            {auditOpinion?.fy2024_25?.url && (
              <ExternalReportLink
                label="OAG Summary Report (FY 2024/25)"
                url={auditOpinion.fy2024_25.url}
              />
            )}
            <ExternalReportLink
              label="Controller of Budget (CoB) — County Reports"
              url="https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports"
            />
            <ExternalReportLink
              label="TI-Kenya — County Governance Reports"
              url="https://transparency.org/en/countries/kenya"
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. County Leadership — tappable governor card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            County Leadership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/80 hover:border-primary/40 transition-colors cursor-pointer"
            onClick={() => onSelectRepresentative(gov)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectRepresentative(gov);
              }
            }}
            aria-label={`View profile for ${gov.fullName}, Governor of ${countyNameTranslated} County`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-base truncate">{gov.fullName}</span>
                {govScore !== null && (
                  <Badge
                    className={`${getScoreBadgeClass(govScore)} text-[10px] px-1.5 py-0 border shrink-0`}
                  >
                    {govScore}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  Governor, {countyNameTranslated} County
                </span>
                {gov.party && (
                  <Badge
                    className={`${getCoalitionColor(gov.coalition)} text-[10px] px-1.5 py-0 border shrink-0`}
                  >
                    {gov.party}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          {/* Other key officials quick-tap row */}
          {(county.deputyGovernor || county.senator || county.womanRep) && (
            <div className="mt-2 space-y-1.5">
              {county.deputyGovernor && (
                <QuickOfficialRow
                  rep={county.deputyGovernor}
                  roleLabel={`Deputy Governor, ${countyNameTranslated} County`}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  onSelect={onSelectRepresentative}
                />
              )}
              {county.senator && (
                <QuickOfficialRow
                  rep={county.senator}
                  roleLabel={`Senator, ${countyNameTranslated} County`}
                  icon={<Landmark className="h-4 w-4 text-blue-600" />}
                  onSelect={onSelectRepresentative}
                />
              )}
              {county.womanRep && (
                <QuickOfficialRow
                  rep={county.womanRep}
                  roleLabel={`Woman Rep, ${countyNameTranslated} County`}
                  icon={<Users className="h-4 w-4 text-pink-600" />}
                  onSelect={onSelectRepresentative}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Parliament-Verified MPs */}
      <ParliamentMPsSummary county={county} />

      {/* 8. Data Quality Card */}
      <DataQualityCard county={county} />

      {/* 9. Browse all counties button */}
      {onBrowseCounties && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onBrowseCounties}
        >
          <MapPin className="h-4 w-4" />
          Browse all 47 counties
        </Button>
      )}

      {/* 10. Data Expansion CTA */}
      {onRequestExpansion && (
        <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 space-y-3">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium">
                Want more detailed data for {countyNameTranslated} County?
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Request expansion of CECMs, MCAs, project-level budgets, and historical
                audit trends — sourced from OAG, CoB and IEBC publications.
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() =>
              onRequestExpansion(county.name, 'Comprehensive county data expansion')
            }
          >
            <Sparkles className="h-3.5 w-3.5" />
            Request Data Expansion
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER SUB-COMPONENTS ====================

function BudgetAbsorptionRow({
  label,
  rate,
  source,
  fy,
}: {
  label: string;
  rate: number | null;
  source: string;
  fy: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs font-semibold">
          {rate !== null ? `${rate}%` : 'N/A'}
        </span>
      </div>
      <Progress value={rate ?? 0} className="h-2" />
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[10px] text-muted-foreground">{source}</span>
        <span className="text-[10px] text-muted-foreground">{fy}</span>
      </div>
    </div>
  );
}

function ExternalReportLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/80 hover:border-primary/40 transition-colors text-xs group"
    >
      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
    </a>
  );
}

function QuickOfficialRow({
  rep,
  roleLabel,
  icon,
  onSelect,
}: {
  rep: Representative;
  roleLabel: string;
  icon: React.ReactNode;
  onSelect: (rep: Representative) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/80 hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => onSelect(rep)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(rep);
        }
      }}
      aria-label={`View profile for ${rep.fullName}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{rep.fullName}</span>
        <span className="text-xs text-muted-foreground truncate block">{roleLabel}</span>
      </div>
      {rep.party && (
        <Badge
          className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1.5 py-0 border shrink-0`}
        >
          {rep.party}
        </Badge>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}
