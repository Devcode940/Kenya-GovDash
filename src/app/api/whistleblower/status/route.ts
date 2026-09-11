import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, searchParamsToObject, wbStatusQuerySchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

// GET /api/whistleblower/status?ticket=WB-XXXXXXXXXXXX — public report tracking.
// Ticket IDs are unguessable (48-bit random); 404 reveals nothing enumerable.
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rate = await checkRateLimit(ip, 'whistleblower');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'whistleblower');
    await recordAttempt(ip, 'whistleblower');

    const parsed = parseOr400(wbStatusQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const sub = await db.whistleblowerSubmission.findUnique({
      where: { ticketId: parsed.data.ticket },
      select: { ticketId: true, category: true, status: true, hasEvidence: true, createdAt: true, updatedAt: true },
    });
    if (!sub) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    return NextResponse.json({ ticket: sub });
  } catch {
    return NextResponse.json({ error: 'Failed to look up ticket' }, { status: 500 });
  }
}
