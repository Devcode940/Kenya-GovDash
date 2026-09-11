// Representatives Directory — searchable directory of all Kenya elected officials:
// Governors, Senators, Women Reps, MPs, and CECMs across all 47 counties.
//
// Filtering + pagination run server-side (URL-driven) so only one page of
// results is serialized to the client instead of the full ~700-record set.

import Link from 'next/link';
import type { Metadata } from 'next';
import { buildAllCountyData, getCoalitionColor, type Representative } from '@/lib/kenya-data';
import { RepresentativesBrowser } from '@/components/kenya/RepresentativesBrowser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Users, Landmark, User, Crown, Shield } from 'lucide-react';
import { representativesQuerySchema, pageParamSchema } from '@/lib/validators';

export const metadata: Metadata = {
  title: 'Representatives Directory — Kenya GovDash',
  description: 'Searchable directory of all Kenya elected officials: Governors, Senators, Women Representatives, MPs, and County Executive Members (CECMs) across 47 counties.',
};

export const dynamic = 'force-dynamic';

export const PAGE_SIZE = 50;

type RepEntry = Representative & { countyName: string; repType: string };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RepresentativesPage({ searchParams }: PageProps) {
  const counties = buildAllCountyData();

  // Aggregate all representatives
  const allReps: RepEntry[] = [];

  for (const c of counties) {
    if (c.governor) allReps.push({ ...c.governor, countyName: c.name, repType: 'Governor' });
    if (c.deputyGovernor) allReps.push({ ...c.deputyGovernor, countyName: c.name, repType: 'Deputy Governor' });
    if (c.senator) allReps.push({ ...c.senator, countyName: c.name, repType: 'Senator' });
    if (c.womanRep) allReps.push({ ...c.womanRep, countyName: c.name, repType: 'Woman Rep' });
    if (c.constituencyMPs) {
      for (const mp of c.constituencyMPs) {
        allReps.push({ ...mp, countyName: c.name, repType: 'MP' });
      }
    }
    if (c.cecms) {
      for (const cecm of c.cecms) {
        allReps.push({ ...cecm, countyName: c.name, repType: 'CECM' });
      }
    }
    if (c.assemblySpeaker) allReps.push({ ...c.assemblySpeaker, countyName: c.name, repType: 'Speaker' });
    if (c.countySecretary) allReps.push({ ...c.countySecretary, countyName: c.name, repType: 'County Secretary' });
  }

  // Stats
  const repTypeCounts = allReps.reduce((acc, r) => {
    acc[r.repType] = (acc[r.repType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const coalitionCounts = allReps.reduce((acc, r) => {
    acc[r.coalition] = (acc[r.coalition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter options
  const repTypes = Array.from(new Set(allReps.map(r => r.repType))).sort();
  const countyNames = Array.from(new Set(allReps.map(r => r.countyName))).sort();
  const coalitionNames = Array.from(new Set(allReps.map(r => r.coalition).filter(Boolean))).sort() as string[];

  // Parse + validate URL params (lenient: unknown values fall back to 'all')
  const raw = await searchParams;
  const filterParsed = representativesQuerySchema.safeParse({
    q: firstParam(raw.q),
    type: firstParam(raw.type),
    county: firstParam(raw.county),
    coalition: firstParam(raw.coalition),
  });
  const filters = filterParsed.success ? filterParsed.data : {};
  const pageParsed = pageParamSchema.safeParse(firstParam(raw.page));
  const requestedPage = pageParsed.success ? pageParsed.data : 1;

  const fType = filters.type && repTypes.includes(filters.type) ? filters.type : 'all';
  const fCounty = filters.county && countyNames.includes(filters.county) ? filters.county : 'all';
  const fCoalition = filters.coalition && coalitionNames.includes(filters.coalition) ? filters.coalition : 'all';
  const fQuery = (filters.q || '').trim();

  // Filter server-side
  let filtered = allReps;
  if (fType !== 'all') filtered = filtered.filter(r => r.repType === fType);
  if (fCounty !== 'all') filtered = filtered.filter(r => r.countyName === fCounty);
  if (fCoalition !== 'all') filtered = filtered.filter(r => r.coalition === fCoalition);
  if (fQuery) {
    const q = fQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.fullName?.toLowerCase().includes(q) ||
      r.party?.toLowerCase().includes(q) ||
      r.countyName?.toLowerCase().includes(q) ||
      r.officialTitle?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back to dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">Representatives Directory</h1>
            <Badge variant="outline">{allReps.length}</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6 pb-20 md:pb-6">
        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Governors</div>
                <div className="text-xl font-bold">{repTypeCounts['Governor'] || 0}</div>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Senators</div>
                <div className="text-xl font-bold">{repTypeCounts['Senator'] || 0}</div>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Women Reps</div>
                <div className="text-xl font-bold">{repTypeCounts['Woman Rep'] || 0}</div>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">MPs</div>
                <div className="text-xl font-bold">{repTypeCounts['MP'] || 0}</div>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">CECMs</div>
                <div className="text-xl font-bold">{repTypeCounts['CECM'] || 0}</div>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-600" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Others</div>
                <div className="text-xl font-bold">
                  {(repTypeCounts['Deputy Governor'] || 0) + (repTypeCounts['Speaker'] || 0) + (repTypeCounts['County Secretary'] || 0)}
                </div>
              </div>
            </div>
          </CardContent></Card>
        </div>

        {/* Coalition distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Coalition Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(coalitionCounts).map(([coalition, count]) => (
                <Badge key={coalition} variant="outline" className={getCoalitionColor(coalition as any)}>
                  {coalition}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser / search UI (server-paginated via URL params) */}
        <RepresentativesBrowser
          reps={paged}
          total={total}
          page={page}
          totalPages={totalPages}
          q={fQuery}
          repType={fType}
          county={fCounty}
          coalition={fCoalition}
          repTypes={repTypes}
          counties={countyNames}
          coalitions={coalitionNames}
        />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Data sourced from IEBC 2022 gazette notices, Parliament of Kenya records, and County Assembly publications.
          CECM portfolios verified from county government organograms; individual office-holder names marked
          &quot;verification pending&quot; where unconfirmed.
        </p>
      </main>
    </div>
  );
}
