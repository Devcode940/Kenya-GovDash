import { NextRequest, NextResponse } from 'next/server';
import { parseOr400, searchParamsToObject, parliamentQuerySchema } from '@/lib/validators';
import { PARLIAMENT_MPS_TOTAL, getParliamentMPsForCounty } from '@/lib/kenya-parliament-mps';
import { PARLIAMENT_SENATORS_TOTAL, getParliamentSenatorForCounty, getNominatedSenators } from '@/lib/kenya-parliament-senators';
import { PARLIAMENT_WOMEN_REPS_TOTAL, getParliamentWomanRepForCounty } from '@/lib/kenya-parliament-women-reps';

export const dynamic = 'force-dynamic';

const COUNTY_NAMES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi',
  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
  'Nairobi City',
];

// GET /api/parliament — public parliament data (MPs, Senators, Women Reps)
export async function GET(request: NextRequest) {
  const parsed = parseOr400(parliamentQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { type, county } = parsed.data;

  const result: any = {
    source: 'Parliament of Kenya (parliament.go.ke)',
    generatedAt: new Date().toISOString(),
  };

  if (type === 'all' || type === 'mps') {
    const allMps: any[] = [];
    for (const c of COUNTY_NAMES) {
      if (county && c !== county) continue;
      const mps = getParliamentMPsForCounty(c);
      if (mps) allMps.push(...mps);
    }
    result.mps = {
      total: allMps.length,
      parliamentTotal: PARLIAMENT_MPS_TOTAL,
      items: allMps,
    };
  }

  if (type === 'all' || type === 'senators') {
    const senators: any[] = [];
    for (const c of COUNTY_NAMES) {
      if (county && c !== county) continue;
      const s = getParliamentSenatorForCounty(c);
      if (s) senators.push(s);
    }
    // Add nominated senators if no county filter
    if (!county) {
      senators.push(...getNominatedSenators());
    }
    result.senators = {
      total: senators.length,
      parliamentTotal: PARLIAMENT_SENATORS_TOTAL,
      items: senators,
    };
  }

  if (type === 'all' || type === 'womenReps') {
    const womenReps: any[] = [];
    for (const c of COUNTY_NAMES) {
      if (county && c !== county) continue;
      const wr = getParliamentWomanRepForCounty(c);
      if (wr) womenReps.push(wr);
    }
    result.womenReps = {
      total: womenReps.length,
      parliamentTotal: PARLIAMENT_WOMEN_REPS_TOTAL,
      items: womenReps,
    };
  }

  return NextResponse.json(result);
}
