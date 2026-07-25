import { NextResponse } from 'next/server';
import { getTiKenyaFeed, getTiKenyaStaticFeed } from '@/lib/live-feeds/ti-kenya-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';
  const mode = searchParams.get('mode') || 'live';

  try {
    if (mode === 'static') {
      return NextResponse.json(getTiKenyaStaticFeed());
    }

    const data = await getTiKenyaFeed(forceRefresh);
    return NextResponse.json(data, {
      headers: {
        'X-Feed-Status': data.freshness.status,
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch {
    return NextResponse.json(getTiKenyaStaticFeed());
  }
}
