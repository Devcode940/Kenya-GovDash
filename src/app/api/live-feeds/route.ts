import { NextRequest, NextResponse } from 'next/server';
import { getAllFeeds, getAllStaticFeeds } from '@/lib/live-feeds/aggregator';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, searchParamsToObject, liveFeedsQuerySchema, liveFeedsRefreshSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = parseOr400(liveFeedsQuerySchema, searchParamsToObject(searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const forceRefresh = searchParams.get('force') === 'true';
  const { mode } = parsed.data;

  if (forceRefresh) {
    const ip = getClientIP(request);
    const rate = checkRateLimit(ip, 'feeds');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'live-feeds refresh');
    recordAttempt(ip, 'feeds');
  }

  try {
    if (mode === 'static') {
      const data = getAllStaticFeeds();
      return NextResponse.json(data, {
        headers: {
          'X-Feed-Status': 'static',
          'X-Data-Source': 'verified-static-fallback',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const data = await getAllFeeds(forceRefresh);
    return NextResponse.json(data, {
      headers: {
        'X-Feed-Status': data.overallStatus,
        'X-Last-Refreshed': data.lastRefreshedAt,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    console.error('[API /live-feeds] Error:', err);
    // Fall back to static data on error
    const fallback = getAllStaticFeeds();
    return NextResponse.json(fallback, {
      status: 200, // Return 200 with static data rather than failing
      headers: {
        'X-Feed-Status': 'static-fallback',
        'X-Error': err instanceof Error ? err.message : 'Unknown',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rate = checkRateLimit(ip, 'feeds');
  if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'live-feeds refresh');
  recordAttempt(ip, 'feeds');

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(liveFeedsRefreshSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { source, force } = parsed.data;

    if (!source) {
      // Refresh all sources
      const { refreshAllFeeds } = await import('@/lib/live-feeds/aggregator');
      const results = await refreshAllFeeds();
      return NextResponse.json({ results });
    }

    const { refreshFeed } = await import('@/lib/live-feeds/aggregator');
    const result = await refreshFeed(source, force);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
