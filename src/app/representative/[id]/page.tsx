// Individual Representative Detail Page — shows full profile for a single
// elected official (Governor, Senator, Woman Rep, MP, CECM, etc.)

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildAllCountyData, getCoalitionColor, getScoreColor, type Representative } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE } from '@/lib/finance-audit-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, MapPin, Mail, Phone, Globe, Twitter, FileText, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

// Find a representative by ID across all counties + rep types
function findRepresentative(id: string): { rep: Representative; countyName: string; repType: string } | null {
  const counties = buildAllCountyData();
  for (const c of counties) {
    const checkRep = (r: Representative | undefined, type: string) => {
      if (r && r.id === id) return { rep: r, countyName: c.name, repType: type };
      return null;
    };

    let found = checkRep(c.governor, 'Governor');
    if (found) return found;
    found = checkRep(c.deputyGovernor, 'Deputy Governor');
    if (found) return found;
    found = checkRep(c.senator, 'Senator');
    if (found) return found;
    found = checkRep(c.womanRep, 'Woman Representative');
    if (found) return found;
    found = checkRep(c.assemblySpeaker, 'Assembly Speaker');
    if (found) return found;
    found = checkRep(c.deputySpeaker, 'Deputy Speaker');
    if (found) return found;
    found = checkRep(c.countySecretary, 'County Secretary');
    if (found) return found;
    found = checkRep(c.countyAttorney, 'County Attorney');
    if (found) return found;

    if (c.constituencyMPs) {
      for (const mp of c.constituencyMPs) {
        if (mp.id === id) return { rep: mp, countyName: c.name, repType: 'Member of Parliament' };
      }
    }
    if (c.electedMCAs) {
      for (const mca of c.electedMCAs) {
        if (mca.id === id) return { rep: mca, countyName: c.name, repType: 'MCA' };
      }
    }
    if (c.cecms) {
      for (const cecm of c.cecms) {
        if (cecm.id === id) return { rep: cecm, countyName: c.name, repType: 'CECM' };
      }
    }
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = findRepresentative(id);
  if (!result) return { title: 'Representative not found — Kenya GovDash' };
  return {
    title: `${result.rep.fullName} — Kenya GovDash`,
    description: `${result.repType} for ${result.countyName} County. ${result.rep.party} (${result.rep.coalition}). ${result.rep.officialTitle}.`,
  };
}

const REP_TYPE_BADGES: Record<string, { color: string; icon: string }> = {
  'Governor': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200', icon: '👑' },
  'Deputy Governor': { color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', icon: '👥' },
  'Senator': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200', icon: '🏛️' },
  'Woman Representative': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200', icon: '♀️' },
  'Member of Parliament': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200', icon: '🎤' },
  'MCA': { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200', icon: '📋' },
  'CECM': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200', icon: '🛡️' },
  'Assembly Speaker': { color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200', icon: '⚖️' },
  'Deputy Speaker': { color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', icon: '⚖️' },
  'County Secretary': { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200', icon: '📋' },
  'County Attorney': { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200', icon: '⚖️' },
};

export default async function RepresentativeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = findRepresentative(id);
  if (!result) notFound();

  const { rep, countyName, repType } = result;
  const badge = REP_TYPE_BADGES[repType] || REP_TYPE_BADGES['County Secretary'];

  // Get finance data for the county (if available)
  const financeData = ALL_COUNTY_FINANCE.find(r => r.countyName === countyName && r.fiscalYear === '2023/24');

  const contacts = rep.contacts;
  const scorecard = rep.scorecard;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/representatives" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Directory
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-2xl">{badge.icon}</span>
            <h1 className="text-base font-semibold truncate">{rep.fullName}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6 pb-20 md:pb-6">
        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <Badge variant="outline" className={badge.color}>
                {badge.icon} {repType}
              </Badge>
              {rep.party && <Badge variant="secondary">{rep.party}</Badge>}
              {rep.coalition && rep.coalition !== 'Other' && (
                <Badge variant="outline" className={getCoalitionColor(rep.coalition)}>{rep.coalition}</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold">{rep.fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{rep.officialTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <a href={`/county/${encodeURIComponent(countyName)}`} className="hover:underline">
                  {countyName} County
                </a>
              </span>
              {rep.termStart && (
                <span>Term: {rep.termStart} → {rep.termEnd}</span>
              )}
              {rep.level && <Badge variant="outline">{rep.level} level</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Biography */}
        {rep.biography && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Biography</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{rep.biography}</p>
              {rep.biographySource && (
                <p className="mt-3 text-xs text-muted-foreground italic">
                  Source: {rep.biographySource}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contacts */}
        {contacts && (contacts.email || contacts.phone || contacts.twitter || contacts.website) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {contacts.email && (
                  <a href={`mailto:${contacts.email}`} className="flex items-center gap-2 text-sm hover:underline">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {contacts.email}
                  </a>
                )}
                {contacts.phone && (
                  <a href={`tel:${contacts.phone}`} className="flex items-center gap-2 text-sm hover:underline">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {contacts.phone}
                  </a>
                )}
                {contacts.twitter && (
                  <a href={`https://twitter.com/${contacts.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    @{contacts.twitter.replace('@', '')}
                  </a>
                )}
                {contacts.website && (
                  <a href={contacts.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {contacts.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scorecard (for governors/senators with scorecard data) */}
        {scorecard && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Accountability Scorecard</CardTitle>
              </div>
              <CardDescription>Composite scoring across 7 metrics (where data is available)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Overall Accountability', key: 'overallAccountability' },
                  { label: 'Transparency', key: 'transparencyBudget' },
                  { label: 'Project Delivery', key: 'projectDeliveryAbsorption' },
                  { label: 'Manifesto', key: 'manifestoFulfillment' },
                  { label: 'Legislative Oversight', key: 'legislativeOversight' },
                  { label: 'Ethics & Integrity', key: 'ethicsIntegrity' },
                  { label: 'Public Sentiment', key: 'publicSentiment' },
                ].map(({ label, key }) => {
                  const metric = (scorecard as any)[key];
                  const score = metric?.score;
                  const isAvailable = metric?.dataAvailable !== false && score != null;
                  return (
                    <div key={key} className="rounded-lg border p-3 text-center">
                      <div className="text-xs uppercase text-muted-foreground">{label}</div>
                      <div className={`mt-1 text-xl font-bold ${isAvailable ? getScoreColor(score) : 'text-muted-foreground'}`}>
                        {isAvailable ? `${score}/100` : 'N/A'}
                      </div>
                      {!isAvailable && metric?.note && (
                        <div className="text-[10px] text-muted-foreground mt-1">{metric.note}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Opinion (for governors) */}
        {rep.auditOpinion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Opinion History</CardTitle>
              <CardDescription>Source: Office of the Auditor General (OAG)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs uppercase text-muted-foreground">FY 2023/24</div>
                  <div className={`mt-1 text-lg font-bold ${
                    rep.auditOpinion.fy2023_24.type === 'Unmodified' ? 'text-emerald-600'
                    : rep.auditOpinion.fy2023_24.type === 'Qualified' ? 'text-amber-600'
                    : 'text-rose-600'
                  }`}>
                    {rep.auditOpinion.fy2023_24.type}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs uppercase text-muted-foreground">FY 2024/25</div>
                  {rep.auditOpinion.fy2024_25.dataAvailable !== false && rep.auditOpinion.fy2024_25.type ? (
                    <div className={`mt-1 text-lg font-bold ${
                      rep.auditOpinion.fy2024_25.type === 'Unmodified' ? 'text-emerald-600'
                      : rep.auditOpinion.fy2024_25.type === 'Qualified' ? 'text-amber-600'
                      : 'text-rose-600'
                    }`}>
                      {rep.auditOpinion.fy2024_25.type}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-muted-foreground">Not yet published</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Performance (for governors) */}
        {rep.budgetPerformance && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Performance</CardTitle>
              <CardDescription>Source: {rep.budgetPerformance.overallAbsorption.source}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground">Overall</div>
                  <div className="text-xl font-bold text-emerald-600">{rep.budgetPerformance.overallAbsorption.rate ?? '—'}%</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground">Recurrent</div>
                  <div className="text-xl font-bold">{rep.budgetPerformance.recurrentAbsorption.rate ?? '—'}%</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground">Development</div>
                  <div className="text-xl font-bold text-amber-600">{rep.budgetPerformance.developmentAbsorption.rate ?? '—'}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* County Finance Summary (link to finance drill-down) */}
        {financeData && (
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">County Finance Dashboard</h3>
                  <p className="text-xs text-muted-foreground">
                    {countyName} County · FY 2023/24 · Absorption: {financeData.overallAbsorption}% · Audit: {financeData.auditOpinion}
                  </p>
                </div>
                <a href={`/finance-audit/county/${encodeURIComponent(countyName)}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">
                  View →
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer links */}
        <div className="flex flex-wrap gap-2 text-sm">
          <a href={`/county/${encodeURIComponent(countyName)}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <MapPin className="h-3 w-3" />{countyName} County dashboard
          </a>
          <a href="/representatives" className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            ← Back to directory
          </a>
        </div>
      </main>
    </div>
  );
}
