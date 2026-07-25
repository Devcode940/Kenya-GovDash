import { NextResponse } from 'next/server';
import { getCobFeed, getCobStaticFeed } from '@/lib/live-feeds/cob-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';
  const mode = searchParams.get('mode') || 'live';

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
