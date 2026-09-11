import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { parseOr400, alertSubscribeSchema } from '@/lib/validators';

// POST /api/finance-alerts/subscribe — create new alert subscription
// Body: { email, countyName, metric, threshold?, direction? }
export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(alertSubscribeSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { email, countyName, metric, threshold, direction } = parsed.data;

    // Dedupe — if subscription exists (same email + county + metric + threshold), reactivate
    const existing = await db.financeAlertSubscription.findFirst({
      where: { email, countyName, metric, threshold: threshold ?? null },
    });

    const confirmToken = randomBytes(24).toString('hex');

    if (existing) {
      const updated = await db.financeAlertSubscription.update({
        where: { id: existing.id },
        data: {
          active: true,
          direction,
          confirmToken,
          // Reset trigger state so the alert fires again on next check
          lastTriggeredAt: null,
          lastTriggeredValue: null,
        },
      });
      return NextResponse.json({ subscription: updated, message: 'Subscription reactivated' });
    }

    const subscription = await db.financeAlertSubscription.create({
      data: {
        email,
        countyName,
        metric,
        threshold: threshold ?? null,
        direction,
        active: true,
        confirmToken,
        // Auto-confirm in dev (no email provider configured)
        // In production, this would be set after the user clicks a confirmation link
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json(
      { subscription, message: 'Alert subscription created — you will receive alerts when thresholds are breached' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Finance alert subscribe error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// GET — list all active subscriptions (admin only via auth)
export async function GET(request: NextRequest) {
  const { isAuthenticated } = await import('@/lib/auth');
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subs = await db.financeAlertSubscription.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ subscriptions: subs, total: subs.length });
}
