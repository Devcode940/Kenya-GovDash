import { NextRequest, NextResponse } from 'next/server';
import { getCobFeed, getCobStaticFeed } from '@/lib/live-feeds/cob-service';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, searchParamsToObject, liveFeedsQuerySchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = parseOr400(liveFeedsQuerySchema, searchParamsToObject(searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const forceRefresh = searchParams.get('force') === 'true';
  const { mode } = parsed.data;

  if (forceRefresh) {
    const ip = getClientIP(request);
    const rate = await checkRateLimit(ip, 'feeds');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'live-feeds refresh');
    await recordAttempt(ip, 'feeds');
  }

  try {
    if (mode === 'static') {
      return NextResponse.json(getCobStaticFeed());
    }

    const data = await getCobFeed(forceRefresh);
    return NextResponse.json(data, {
      headers: {
        'X-Feed-Status': data.freshness.status,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch {
    return NextResponse.json(getCobStaticFeed());
  }
}
