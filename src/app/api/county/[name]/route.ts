import { NextRequest, NextResponse } from 'next/server';
import { buildCountyProfile } from '@/lib/county-profile';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  const profile = buildCountyProfile(name);
  if (!profile) {
    return NextResponse.json({ error: 'County not found' }, { status: 404 });
  }
  return NextResponse.json({
    name: profile.county.name,
    code: profile.county.code,
    region: profile.county.region,
    demographics: profile.demographics,
    leaders: profile.leaders.map((l) => ({
      role: l.role,
      id: l.rep.id,
      fullName: l.rep.fullName,
      party: l.rep.party,
      coalition: l.rep.coalition,
      url: `/representative/${encodeURIComponent(l.rep.id)}`,
    })),
    finance: profile.finance.latest,
    financeHistory: profile.finance.history,
    oversight: {
      eacc: profile.oversight.eacc,
      budgetTransparency: profile.oversight.budgetTransparency,
    },
    sources: profile.oversight.sources.map((s) => ({
      id: s.id,
      name: s.name,
      hubUrl: s.hubUrl,
      tracks: s.tracks,
    })),
    links: profile.links,
  });
}
