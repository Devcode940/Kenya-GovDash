import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';

// GET /api/finance-alerts/unsubscribe?token=... — signed, expiring, single-purpose link.
// Safe as GET: the token is unguessable, email-scoped, and expiring.
// The legacy unauthenticated ?email= flow was removed (CSRF-able, enumerable).
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const verified = verifyUnsubscribeToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 });

    if (verified.subscriptionId) {
      const sub = await db.financeAlertSubscription.findUnique({ where: { id: verified.subscriptionId } });
      if (!sub || sub.email !== verified.email) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }
      await db.financeAlertSubscription.update({
        where: { id: sub.id },
        data: { active: false },
      });
    } else {
      // Deactivate all subscriptions for this email
      await db.financeAlertSubscription.updateMany({
        where: { email: verified.email },
        data: { active: false },
      });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
