import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setSessionCookie, isAuthenticated, checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIP } from '@/lib/auth';

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

    const body = await request.json();
    const password = body.password as string;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    if (!await verifyPassword(password)) {
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
