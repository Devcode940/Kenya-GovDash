import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { processAlerts, checkAlerts } from '@/lib/finance-alerts';

// POST /api/finance-alerts/check — process all pending alerts
// Auth: admin OR external cron with x-cron-secret header
export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET;

  let authorized = false;
  if (expectedSecret && cronSecret === expectedSecret) {
    authorized = true;
  } else {
    authorized = await isAuthenticated();
  }
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await processAlerts();
    return NextResponse.json({
      message: `Processed alerts: ${result.triggered} triggered, ${result.failed} failed`,
      ...result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process alerts' },
      { status: 500 }
    );
  }
}

// GET — preview which alerts would fire (no side effects)
export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const triggers = await checkAlerts();
    return NextResponse.json({
      pendingAlerts: triggers.length,
      triggers,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 });
  }
}
