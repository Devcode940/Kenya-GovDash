import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setSessionCookie, isAuthenticated, checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIP } from '@/lib/auth';
import { parseOr400, loginSchema } from '@/lib/validators';

// POST /api/admin/login — verify password, create JWT session cookie
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`, retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(loginSchema, rawBody);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    if (!await verifyPassword(parsed.data.password)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    // Success — clear rate limit + create session
    clearRateLimit(ip);
    const token = createSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ success: true, message: 'Authentication successful' });
  } catch {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}

// GET — check if already authenticated
export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
