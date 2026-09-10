import { NextResponse } from 'next/server';
import { clearSessionCookie, isAuthenticated } from '@/lib/auth';

// POST /api/admin/logout — clears session cookie (auth required)
export async function POST() {
  try {
    // Optional: verify auth before clearing (prevents CSRF logout)
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: true, message: 'Already logged out' });
    }
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out' });
  } catch {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
