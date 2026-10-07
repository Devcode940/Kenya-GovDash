/**
 * Full County Hub — everything about one county in a dedicated page
 * (opens in its own tab from search / directory / home "Open full page").
 *
 * Tracks:
 * - Leaders (governors → CECMs)
 * - Pesa za ugatuzi (finance, absorption, audit, pending bills)
 * - Maendeleo / integrity (EACC NECS, CBTS transparency, source links)
 * - Demographics
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildCountyProfile, listAllCountyNames } from '@/lib/county-profile';
import { getCoalitionColor, formatKesMillions, formatPopulation } from '@/lib/kenya-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  MapPin,
  Users,
  Landmark,
  Wallet,
  ShieldAlert,
  ExternalLink,
  FileText,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ name: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return listAllCountyNames().map((name) => ({ name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const profile = buildCountyProfile(name);
  if (!profile) return { title: 'County not found — Kenya GovDash' };
  const { county } = profile;
  return {
    title: `${county.name} County — Kenya GovDash`,
    description: `Full profile for ${county.name} County: leaders, pesa za ugatuzi (budget & audit), integrity indicators, and official sources (CoB, OAG, EACC, TI-Kenya).`,
  };
}

const ROLE_EMOJI: Record<string, string> = {
  Governor: '👑',
  'Deputy Governor': '👥',
  Senator: '🏛️',
  'Woman Representative': '♀️',
  'Member of Parliament': '🎤',
  MCA: '📋',
  CECM: '🛡️',
  'Assembly Speaker': '⚖️',
  'Deputy Speaker': '⚖️',
  'County Secretary': '📎',
  'County Attorney': '⚖️',
};

export default async function CountyHubPage({ params }: PageProps) {
  const { name } = await params;
  const profile = buildCountyProfile(name);
  if (!profile) notFound();

  const { county, demographics, leaders, finance, oversight, links } = profile;
  const gov = county.governor;
  const latest = finance.latest;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Home
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
            <h1 className="truncate text-base font-semibold">{county.name} County</h1>
            <Badge variant="outline" className="shrink-0">
              #{county.code}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-24 md:pb-8">
        {/* Hero */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start gap-2">
              <Badge variant="secondary">{county.region}</Badge>
              {gov?.party && <Badge variant="outline">{gov.party}</Badge>}
              {gov?.coalition && gov.coalition !== 'Other' && (
                <Badge variant="outline" className={getCoalitionColor(gov.coalition)}>
                  {gov.coalition}
                </Badge>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{county.name} County</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete civic profile — leaders, pesa za ugatuzi, audit & integrity, demographics, and
              official sources.
            </p>
            {gov && (
              <p className="mt-3 text-sm">
                Governor:{' '}
                <Link
                  href={`/representative/${encodeURIComponent(gov.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  {gov.fullName} ↗
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="#leaders" className="rounded-md border px-3 py-1.5 hover:bg-muted">
            Leaders
          </a>
          <a href="#pesa" className="rounded-md border px-3 py-1.5 hover:bg-muted">
            Pesa za ugatuzi
          </a>
          <a href="#integrity" className="rounded-md border px-3 py-1.5 hover:bg-muted">
            Integrity / EACC
          </a>
          <a href="#sources" className="rounded-md border px-3 py-1.5 hover:bg-muted">
            Sources
          </a>
          <Link
            href={links.financeDrilldown}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-3 py-1.5 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200"
          >
            Finance charts ↗
          </Link>
        </div>

        {/* Demographics */}
        {demographics && (
          <Card id="demo">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Demographics</CardTitle>
              </div>
              <CardDescription>{demographics.source}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Population" value={formatPopulation(demographics.population)} />
                <Stat label="Area" value={`${demographics.landAreaSqKm.toLocaleString()} km²`} />
                <Stat label="Density" value={`${demographics.densityPerSqKm}/km²`} />
                <Stat label="Census" value={demographics.populationCensus} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pesa za ugatuzi */}
        <Card id="pesa">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Pesa za ugatuzi — Finance & audit</CardTitle>
            </div>
            <CardDescription>
              County budget execution from CoB / OAG curated snapshots
              {latest ? ` · FY ${latest.fiscalYear}` : ' · data gap for this county'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latest ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Approved budget" value={formatKesMillions(latest.approvedBudget)} />
                  <Stat label="Equitable share" value={formatKesMillions(latest.equitableShare)} />
                  <Stat
                    label="OSR collected"
                    value={formatKesMillions(latest.ownSourceRevenue ?? null)}
                  />
                  <Stat
                    label="Overall absorption"
                    value={
                      latest.overallAbsorption != null ? `${latest.overallAbsorption}%` : 'N/A'
                    }
                  />
                  <Stat
                    label="Development absorption"
                    value={
                      latest.developmentAbsorption != null
                        ? `${latest.developmentAbsorption}%`
                        : 'N/A'
                    }
                  />
                  <Stat
                    label="Pending bills"
                    value={formatKesMillions(latest.pendingBills ?? null)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Audit opinion:</span>
                  <Badge
                    variant="outline"
                    className={
                      latest.auditOpinion === 'Unmodified'
                        ? 'border-emerald-500 text-emerald-700'
                        : latest.auditOpinion === 'Qualified'
                          ? 'border-amber-500 text-amber-700'
                          : 'border-rose-500 text-rose-700'
                    }
                  >
                    {latest.auditOpinion}
                  </Badge>
                  {latest.complianceScore != null && (
                    <Badge variant="secondary">CoG compliance ~{latest.complianceScore}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">Source: {latest.source}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No curated county finance snapshot yet. National equitable share series and CoB
                reports are still available below.
              </p>
            )}
            {finance.nationalEquitableShareLatest && (
              <p className="text-xs text-muted-foreground">
                National county equitable share (all 47): Kshs{' '}
                {finance.nationalEquitableShareLatest.equitableShareBillion}B in FY{' '}
                {finance.nationalEquitableShareLatest.fiscalYear} (CRA/CARA).
              </p>
            )}
            <Link
              href={links.financeDrilldown}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Open finance drill-down & charts <ExternalLink className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Leaders */}
        <Card id="leaders">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Leaders & representatives</CardTitle>
            </div>
            <CardDescription>
              {leaders.length} profiles on record — click any name for full member page (new tab)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-lg border">
              {leaders.map(({ role, rep }) => (
                <li key={rep.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm">
                  <span className="w-6 text-center">{ROLE_EMOJI[role] || '•'}</span>
                  <span className="w-36 shrink-0 text-xs text-muted-foreground sm:w-44">{role}</span>
                  <Link
                    href={`/representative/${encodeURIComponent(rep.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 font-medium hover:underline"
                  >
                    {rep.fullName}
                  </Link>
                  {rep.party && (
                    <Badge variant="outline" className="text-[10px]">
                      {rep.party}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Integrity / maendeleo oversight */}
        <Card id="integrity">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">Integrity & transparency</CardTitle>
            </div>
            <CardDescription>
              Public survey indicators (EACC NECS 2024, Bajeti Hub CBTS 2025) — partial where county
              appears in published lists
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {oversight.eacc ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <div className="font-medium">EACC NECS 2024</div>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {oversight.eacc.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No county-specific NECS highlight curated yet. See national EACC findings and full
                survey PDF via sources.
              </p>
            )}
            {oversight.budgetTransparency?.score != null ? (
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium">Budget transparency (CBTS 2025)</div>
                <p className="mt-1 text-muted-foreground">
                  Score: <strong>{oversight.budgetTransparency.score}/100</strong> (
                  {oversight.budgetTransparency.tier} tier) — {oversight.budgetTransparency.source}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                CBTS 2025 national average is ~65/100. Full county scores: Bajeti Hub report.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sources — auto-ingest targets */}
        <Card id="sources">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Official sources (auto-ingest targets)</CardTitle>
            </div>
            <CardDescription>
              Registry of agencies that feed county + representative profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {oversight.sources.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(s.tracks as string[]).slice(0, 4).join(' · ')}
                    </div>
                  </div>
                  <a
                    href={s.hubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Live refresh: <code className="text-[10px]">/api/live-feeds/eacc</code>,{' '}
              <code className="text-[10px]">/api/live-feeds/ti-kenya</code>,{' '}
              <code className="text-[10px]">/api/live-feeds/cob</code>,{' '}
              <code className="text-[10px]">/api/live-feeds/oag</code>. Admin:{' '}
              <code className="text-[10px]">POST /api/admin/ingest-oversight</code>.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/" className="rounded-md border px-3 py-1.5 hover:bg-muted">
            ← Dashboard
          </Link>
          <Link
            href="/representatives"
            target="_blank"
            className="rounded-md border px-3 py-1.5 hover:bg-muted"
          >
            All representatives ↗
          </Link>
          <Link
            href="/finance-audit"
            target="_blank"
            className="rounded-md border px-3 py-1.5 hover:bg-muted"
          >
            National finance ↗
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
