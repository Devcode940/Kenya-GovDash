import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, wbEnvelopeSchema, WB_MAX_ENVELOPE_BYTES } from '@/lib/validators';
import { getServerKey, generateTicketId } from '@/lib/whistleblower-server';

export const maxDuration = 60;

// POST /api/whistleblower — store an end-to-end encrypted report envelope.
// The server persists CIPHERTEXT ONLY and cannot read report contents.
export async function POST(request: NextRequest) {
  try {
    const serverKey = getServerKey();
    if (!serverKey) {
      return NextResponse.json({ error: 'Secure submission is not configured on this server' }, { status: 501 });
    }

    const ip = getClientIP(request);
    const rate = await checkRateLimit(ip, 'whistleblower');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'whistleblower');
    await recordAttempt(ip, 'whistleblower');

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > WB_MAX_ENVELOPE_BYTES) {
      return NextResponse.json({ error: 'Envelope too large' }, { status: 413 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(wbEnvelopeSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const env = parsed.data;

    // Backstop total size (chunked uploads bypass Content-Length).
    let totalBytes = env.ciphertext.length + env.encryptedKey.length + env.iv.length + env.keyId.length;
    for (const f of env.files) totalBytes += f.ciphertext.length + f.iv.length + f.name.length + f.type.length;
    if (totalBytes > WB_MAX_ENVELOPE_BYTES) {
      return NextResponse.json({ error: 'Envelope too large' }, { status: 413 });
    }

    // Envelope must target the current server key (guards rotation races).
    if (env.keyId !== serverKey.keyId) {
      return NextResponse.json({ error: 'Server key changed — refetch the public key and resubmit' }, { status: 400 });
    }

    // Persist ciphertext only, with unique-ticket collision retry.
    let ticketId: string | null = null;
    let createdAt: Date | null = null;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3 && !ticketId; attempt++) {
      try {
        const created = await db.whistleblowerSubmission.create({
          data: {
            ticketId: generateTicketId(),
            category: env.category,
            hasEvidence: env.files.length > 0,
            encryptedKey: env.encryptedKey,
            iv: env.iv,
            ciphertext: env.ciphertext,
            evidence: env.files.length > 0 ? JSON.stringify(env.files) : null,
            status: 'submitted',
          },
        });
        ticketId = created.ticketId as string;
        createdAt = created.createdAt as Date;
      } catch (err) {
        lastError = err;
      }
    }
    if (!ticketId) {
      console.error('Whistleblower persist failed:', lastError);
      return NextResponse.json({ error: 'Failed to store submission' }, { status: 500 });
    }

    return NextResponse.json(
      {
        ticketId,
        createdAt,
        message: 'Report received. Save your ticket ID — it is the only way to track this report.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Whistleblower submit error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
