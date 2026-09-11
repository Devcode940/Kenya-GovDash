import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { processAlerts, checkAlerts } from '@/lib/finance-alerts';

// POST /api/finance-alerts/check — process all pending alerts
// Auth (any one of):
//   1. Vercel Cron (automatically sends Authorization: Bearer <CRON_SECRET>)
//   2. External cron with x-cron-secret header matching CRON_SECRET
//   3. Admin session cookie (isAuthenticated)
export async function POST(request: NextRequest) {
  // Check Vercel Cron auth: Vercel sends "Authorization: Bearer <CRON_SECRET>"
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  const cronSecretHeader = request.headers.get('x-cron-secret');

  let authorized = false;

  // Method 1: Vercel Cron — Authorization: Bearer <secret>
  if (expectedSecret && authHeader === `Bearer ${expectedSecret}`) {
    authorized = true;
  }
  // Method 2: External cron — x-cron-secret header
  else if (expectedSecret && cronSecretHeader === expectedSecret) {
    authorized = true;
  }
  // Method 3: Admin session
  else {
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
  // Same auth as POST — allows Vercel Cron GET or admin
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  const cronSecretHeader = request.headers.get('x-cron-secret');

  let authorized = false;
  if (expectedSecret && authHeader === `Bearer ${expectedSecret}`) authorized = true;
  else if (expectedSecret && cronSecretHeader === expectedSecret) authorized = true;
  else authorized = await isAuthenticated();

  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
