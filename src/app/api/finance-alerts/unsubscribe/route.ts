import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/finance-alerts/unsubscribe?email=...&id=...
// Marks the subscription as inactive
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    if (id) {
      const sub = await db.financeAlertSubscription.findUnique({ where: { id } });
      if (!sub || sub.email !== email.toLowerCase()) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }
      await db.financeAlertSubscription.update({
        where: { id },
        data: { active: false },
      });
    } else {
      // Deactivate all subscriptions for this email
      await db.financeAlertSubscription.updateMany({
        where: { email: email.toLowerCase() },
        data: { active: false },
      });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
