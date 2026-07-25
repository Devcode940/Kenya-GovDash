import { NextResponse } from 'next/server';
import { getEaccFeed, getEaccStaticFeed } from '@/lib/live-feeds/eacc-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('force') === 'true';
  const mode = searchParams.get('mode') || 'live';
  const repId = searchParams.get('repId') || '';

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
