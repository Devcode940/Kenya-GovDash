import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getIngestStatusSummary, listIngestSources, runOversightIngest } from '@/lib/auto-ingest';

/**
 * GET  /api/admin/ingest-oversight — public status of oversight ingest pipeline
 * POST /api/admin/ingest-oversight — auth-required refresh of live feeds (EACC, TI, CoB, OAG)
 */

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/ingest-oversight',
    methods: {
      GET: 'Pipeline status + curated snapshot counts (no auth)',
      POST: 'Refresh live feeds for EACC, TI-Kenya, CoB, OAG (requires admin auth)',
    },
    status: getIngestStatusSummary(),
    sources: listIngestSources(),
  });
}

export async function POST(_request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runOversightIngest();
    return NextResponse.json({
      success: true,
      message: 'Oversight live feeds refreshed',
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ranAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
