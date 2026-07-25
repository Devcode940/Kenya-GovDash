import { NextResponse } from 'next/server';
import { getAllFeeds, getAllStaticFeeds } from '@/lib/live-feeds/aggregator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';
  const mode = searchParams.get('mode') || 'live';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source = body.source as string | undefined;
    const force = body.force !== false;

    if (!source) {
      // Refresh all sources
      const { refreshAllFeeds } = await import('@/lib/live-feeds/aggregator');
      const results = await refreshAllFeeds();
      return NextResponse.json({ results });
    }

    const { refreshFeed } = await import('@/lib/live-feeds/aggregator');
    const result = await refreshFeed(source as any, force);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
