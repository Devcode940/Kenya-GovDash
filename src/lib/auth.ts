// ==================== AUTH LIBRARY ====================
// bcrypt password hashing + JWT session cookies. Fail-closed always.
// ADMIN_PASSWORD_HASH and JWT_SECRET must be set in every environment.
// Never commit real credentials. Generate hashes with:
//   node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
//   openssl rand -hex 32

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'kenya-admin-session';
const SESSION_DURATION_SEC = 60 * 60 * 8; // 8 hours
const JWT_ALGORITHM = 'HS256' as const;
const IS_PROD = process.env.NODE_ENV === 'production';
// Set TRUST_PROXY=1 only when a reverse proxy overwrites X-Forwarded-For (Vercel, Caddyfile in this repo).
const TRUST_PROXY = process.env.TRUST_PROXY === '1';

function getPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash && hash.length === 60 && hash.startsWith('$2')) return hash;
  throw new Error(
    '[auth] FATAL: ADMIN_PASSWORD_HASH must be set (bcrypt $2… hash, 60 chars). ' +
      'Generate: node -e "console.log(require(\'bcryptjs\').hashSync(\'your-password\', 12))"',
  );
}

export async function verifyPassword(plainPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, getPasswordHash());
  } catch {
    return false;
  }
}

export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, 12);
}

// ==================== JWT SESSION ====================

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  throw new Error(
    '[auth] FATAL: JWT_SECRET must be set (>=32 chars). Generate: openssl rand -hex 32',
  );
}

interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { role: 'admin', iat: now, exp: now + SESSION_DURATION_SEC };
  return jwt.sign(payload, getJwtSecret(), { algorithm: JWT_ALGORITHM });
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] }) as SessionPayload;
    return decoded.role === 'admin'; // exp enforced by jwt.verify
  } catch {
    return false;
  }
}

// ==================== COOKIE HELPERS ====================

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SEC,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

// ==================== RATE LIMITING ====================
// Implemented in ./rate-limit.ts (memory or shared Redis store).
// Re-exported here so existing imports keep working.
export {
  checkRateLimit,
  recordFailedAttempt,
  recordAttempt,
  clearRateLimit,
} from './rate-limit';
export type { RateScope } from './rate-limit';

export function getClientIP(request: NextRequest | Request): string {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;
  }
  return 'unknown';
}

export function rateLimitResponse(resetAt: number, scope: string): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return Response.json(
    { error: `Rate limit exceeded for ${scope}. Try again in ${Math.ceil(retryAfter / 60)} minute(s).` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}
