import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// POST /api/finance-alerts/subscribe — create new alert subscription
// Body: { email, countyName, metric, threshold?, direction? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const countyName = (body.countyName || '').trim();
    const metric = body.metric;
    const threshold = body.threshold != null ? Number(body.threshold) : null;
    const direction = body.direction || 'below';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (!countyName) {
      return NextResponse.json({ error: 'countyName required' }, { status: 400 });
    }
    const validMetrics = ['overallAbsorption', 'developmentAbsorption', 'auditOpinion', 'pendingBills'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    // Dedupe — if subscription exists (same email + county + metric + threshold), reactivate
    const existing = await db.financeAlertSubscription.findFirst({
      where: { email, countyName, metric, threshold },
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
        threshold,
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
