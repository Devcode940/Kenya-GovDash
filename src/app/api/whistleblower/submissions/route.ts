import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import {
  parseOr400,
  searchParamsToObject,
  wbAdminListSchema,
  wbStatusPatchSchema,
} from '@/lib/validators';

export const dynamic = 'force-dynamic';

// GET /api/whistleblower/submissions (AUTH REQUIRED) — list envelopes for triage
// and offline decryption. Contents are ciphertext; only ticket/category/status
// metadata is readable here by design.
export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = parseOr400(wbAdminListSchema, searchParamsToObject(request.nextUrl.searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { status, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const submissions = await db.whistleblowerSubmission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ submissions, total: submissions.length });
}

// PATCH /api/whistleblower/submissions (AUTH REQUIRED) — update triage status only.
export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(wbStatusPatchSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const existing = await db.whistleblowerSubmission.findUnique({
      where: { ticketId: parsed.data.ticketId },
    });
    if (!existing) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const updated = await db.whistleblowerSubmission.update({
      where: { ticketId: parsed.data.ticketId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      ticket: { ticketId: updated.ticketId, status: updated.status, updatedAt: updated.updatedAt },
      message: 'Status updated',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
