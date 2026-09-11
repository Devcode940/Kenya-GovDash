import { NextRequest, NextResponse } from 'next/server';
import { getEaccFeed, getEaccStaticFeed } from '@/lib/live-feeds/eacc-service';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, searchParamsToObject, eaccFeedQuerySchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = parseOr400(eaccFeedQuerySchema, searchParamsToObject(searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const forceRefresh = searchParams.get('force') === 'true';
  const { mode, repId } = parsed.data;

  if (forceRefresh) {
    const ip = getClientIP(request);
    const rate = checkRateLimit(ip, 'feeds');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'live-feeds refresh');
    recordAttempt(ip, 'feeds');
  }

  try {
    if (mode === 'static') {
      const data = getEaccStaticFeed();
      if (repId) {
        const filtered = {
          ...data,
          assetDeclarations: data.assetDeclarations.filter(d => d.representativeId === repId),
          investigations: data.investigations.filter(i =>
            i.representativeName.toLowerCase().includes(repId.split('-').pop() || '')
          ),
        };
        return NextResponse.json(filtered);
      }
      return NextResponse.json(data);
    }

    const data = await getEaccFeed(forceRefresh);
    if (repId) {
      const filtered = {
        ...data,
        assetDeclarations: data.assetDeclarations.filter(d => d.representativeId === repId),
        investigations: data.investigations.filter(i =>
          i.representativeName.toLowerCase().includes(repId.split('-').pop() || '')
        ),
      };
      return NextResponse.json(filtered);
    }
    return NextResponse.json(data, {
      headers: {
        'X-Feed-Status': data.freshness.status,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch {
    return NextResponse.json(getEaccStaticFeed());
  }
}
