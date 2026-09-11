import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { buildAllCountyData } from '@/lib/kenya-data';
import {
  parseOr400,
  searchParamsToObject,
  cecmQuerySchema,
  cecmVerifySchema,
  cecmDeleteSchema,
} from '@/lib/validators';

// GET /api/admin/cecm-verify — list all CECMs with verification status
// Public: returns verification stats only
// Auth: returns full list with verifications
export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  const parsed = parseOr400(cecmQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { countyName } = parsed.data;

  // Get all CECMs from data layer
  const counties = buildAllCountyData();
  const allCecms: Array<{ cecmId: string; countyName: string; portfolio: string; currentName: string }> = [];
  for (const c of counties) {
    if (countyName && c.name !== countyName) continue;
    if (!c.cecms) continue;
    for (const cecm of c.cecms) {
      allCecms.push({
        cecmId: cecm.id,
        countyName: c.name,
        portfolio: cecm.officialTitle.replace(/^CECM — /, '').replace(/, .* County$/, ''),
        currentName: cecm.fullName,
      });
    }
  }

  // Get all verifications from DB
  let verifications: any[] = [];
  try {
    verifications = await db.cecmVerification.findMany();
  } catch {
    // DB may not be initialized
  }

  const verifiedMap = new Map<string, any>();
  for (const v of verifications) {
    verifiedMap.set(v.cecmId, v);
  }

  // Merge
  const merged = allCecms.map(c => {
    const v = verifiedMap.get(c.cecmId);
    return {
      ...c,
      verified: !!v,
      verifiedName: v?.verifiedName || null,
      verifiedBy: v?.verifiedBy || null,
      verifiedAt: v?.verifiedAt || null,
      source: v?.source || null,
    };
  });

  // Stats
  const total = merged.length;
  const verifiedCount = merged.filter(c => c.verified).length;
  const verificationPct = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;
  const byCounty: Record<string, { total: number; verified: number }> = {};
  for (const c of merged) {
    if (!byCounty[c.countyName]) byCounty[c.countyName] = { total: 0, verified: 0 };
    byCounty[c.countyName].total++;
    if (c.verified) byCounty[c.countyName].verified++;
  }

  // For public requests, return only stats
  if (!authed) {
    return NextResponse.json({
      stats: { total, verified: verifiedCount, unverified: total - verifiedCount, verificationPct },
      byCounty: Object.entries(byCounty).map(([name, s]) => ({ countyName: name, ...s, pct: s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0 })).sort((a, b) => a.countyName.localeCompare(b.countyName)),
    });
  }

  // For authed requests, return full list
  return NextResponse.json({
    stats: { total, verified: verifiedCount, unverified: total - verifiedCount, verificationPct },
    byCounty: Object.entries(byCounty).map(([name, s]) => ({ countyName: name, ...s, pct: s.total > 0 ? Math.round((s.verified / s.total) * 100) : 0 })).sort((a, b) => a.countyName.localeCompare(b.countyName)),
    cecms: countyName ? merged : merged.slice(0, 200), // cap to 200 unless filtered
  });
}

// POST — verify a single CECM
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(cecmVerifySchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { cecmId, countyName, portfolio, verifiedName, source, notes } = parsed.data;

    const verification = await db.cecmVerification.upsert({
      where: { cecmId },
      update: {
        verifiedName,
        countyName: countyName || undefined,
        portfolio: portfolio || undefined,
        source: source || null,
        notes: notes || null,
        verifiedAt: new Date(),
      },
      create: {
        cecmId,
        countyName: countyName || '',
        portfolio: portfolio || '',
        verifiedName,
        source: source || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ verification, message: 'CECM verified' }, { status: 201 });
  } catch (error) {
    console.error('CECM verify error:', error);
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
  }
}

// DELETE — remove verification
export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = parseOr400(cecmDeleteSchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await db.cecmVerification.delete({ where: { cecmId: parsed.data.cecmId } });
    return NextResponse.json({ message: 'Verification removed' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
