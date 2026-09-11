// ==================== AUTH LIBRARY ====================
// bcrypt password hashing + JWT session cookies. Fail-closed in production.

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

// Dev-only fallback hash. Production refuses to start without ADMIN_PASSWORD_HASH.
// Rotate immediately if ever exposed: hashPassword() a new secret and set ADMIN_PASSWORD_HASH.
const DEV_PASSWORD_HASH = '$2b$12$Wlv2QBf72IMVuMw3ReyR2e2DFoIk6C7mLIt02iQFuLBP83OYc2yZO';

function getPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash && hash.length === 60 && hash.startsWith('$2')) return hash;
  if (IS_PROD) {
    throw new Error('[auth] FATAL: ADMIN_PASSWORD_HASH unset. Refusing default credentials in production.');
  }
  console.warn('[auth] ADMIN_PASSWORD_HASH unset — dev-only default credential active.');
  return DEV_PASSWORD_HASH;
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
  if (IS_PROD) {
    throw new Error('[auth] FATAL: JWT_SECRET must be set (>=32 chars) in production.');
  }
  console.warn('[auth] JWT_SECRET unset — dev-only fallback secret active.');
  return 'dev-only-insecure-fallback-secret-do-not-deploy';
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
// In-memory, per-instance. Correct on single-instance Docker/Caddy; on
// serverless use a shared store (Upstash/Vercel KV). Buckets are namespaced
// per scope; entries are evicted (expiry + hard cap) to bound memory.

type RateScope = 'login' | 'ai' | 'feedback' | 'feeds';
const SCOPE_LIMITS: Record<RateScope, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  ai: { max: 30, windowMs: 60 * 60 * 1000 },
  feedback: { max: 10, windowMs: 60 * 60 * 1000 },
  feeds: { max: 60, windowMs: 60 * 60 * 1000 },
};
const MAX_TRACKED_KEYS = 10_000;
const PURGE_INTERVAL_MS = 60_000;

const attempts = new Map<string, { count: number; resetAt: number }>();
let lastPurge = 0;

function purgeExpired(now: number): void {
  if (now - lastPurge < PURGE_INTERVAL_MS) return;
  lastPurge = now;
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
  while (attempts.size > MAX_TRACKED_KEYS) {
    const oldest = attempts.keys().next();
    if (oldest.done) break;
    attempts.delete(oldest.value);
  }
}

function rateLimitExceeded(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return { retryAfter };
}

export function checkRateLimit(
  ip: string,
  scope: RateScope = 'login',
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  purgeExpired(now);
  const { max, windowMs } = SCOPE_LIMITS[scope];
  const key = `${scope}:${ip}`;
  const entry = attempts.get(key);
  if (entry && now < entry.resetAt) {
    return { allowed: entry.count < max, remaining: Math.max(0, max - entry.count), resetAt: entry.resetAt };
  }
  const resetAt = now + windowMs;
  attempts.set(key, { count: 0, resetAt });
  return { allowed: true, remaining: max, resetAt };
}

export function recordFailedAttempt(ip: string, scope: RateScope = 'login'): void {
  const now = Date.now();
  purgeExpired(now);
  const key = `${scope}:${ip}`;
  const entry = attempts.get(key) ?? { count: 0, resetAt: 0 };
  entry.count += 1;
  entry.resetAt = now + SCOPE_LIMITS[scope].windowMs;
  attempts.set(key, entry);
}

/** Record a consumed attempt for quota scopes (ai, feedback). Sliding window. */
export function recordAttempt(ip: string, scope: RateScope): void {
  const now = Date.now();
  purgeExpired(now);
  const key = `${scope}:${ip}`;
  const entry = attempts.get(key);
  if (entry && now < entry.resetAt) {
    entry.count += 1;
    attempts.set(key, entry);
  } else {
    attempts.set(key, { count: 1, resetAt: now + SCOPE_LIMITS[scope].windowMs });
  }
}

export function clearRateLimit(ip: string, scope: RateScope = 'login'): void {
  attempts.delete(`${scope}:${ip}`);
}

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
  const { retryAfter } = rateLimitExceeded(resetAt);
  return Response.json(
    { error: `Rate limit exceeded for ${scope}. Try again in ${Math.ceil(retryAfter / 60)} minute(s).` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}
