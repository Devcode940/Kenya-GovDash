import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { isAuthenticated } from '@/lib/auth';
import { processAlerts, checkAlerts } from '@/lib/finance-alerts';

function secretsEqual(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

// Auth (any one of):
//   1. Vercel Cron (automatically sends Authorization: Bearer <CRON_SECRET>)
//   2. External cron with x-cron-secret header matching CRON_SECRET
//   3. Admin session cookie (isAuthenticated)
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    // Method 1: Vercel Cron — Authorization: Bearer <secret>
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ') && secretsEqual(authHeader.slice(7), expectedSecret)) {
      return true;
    }
    // Method 2: External cron — x-cron-secret header
    if (secretsEqual(request.headers.get('x-cron-secret'), expectedSecret)) {
      return true;
    }
  }
  // Method 3: Admin session
  return isAuthenticated();
}

// POST /api/finance-alerts/check — process all pending alerts
export async function POST(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await processAlerts();
    return NextResponse.json({
      message: `Processed alerts: ${result.triggered} triggered, ${result.failed} failed`,
      ...result,
    });
  } catch (err) {
    console.error('Alert processing error:', err);
    return NextResponse.json({ error: 'Failed to process alerts' }, { status: 500 });
  }
}

// GET — preview which alerts would fire (no side effects)
export async function GET(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
