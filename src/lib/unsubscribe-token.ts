/**
 * unsubscribe-token.ts — signed, expiring, single-purpose unsubscribe links.
 *
 * Replaces the unauthenticated `?email=` unsubscribe flow (CSRF-able,
 * enumerable). Tokens are HMAC-SHA256 signed with JWT_SECRET, email-scoped,
 * and expire after 30 days. Verified with a constant-time comparison.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getKey(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('[unsubscribe] JWT_SECRET (>=32 chars) required for signed links.');
  }
  return secret;
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64url');
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

export interface UnsubscribeClaims {
  email: string;
  subscriptionId: string | null;
}

/** Mint a signed unsubscribe token. `subscriptionId` null = all subscriptions for the email. */
export function createUnsubscribeToken(email: string, subscriptionId: string | null): string {
  const payload = JSON.stringify({
    e: email.toLowerCase(),
    id: subscriptionId,
    exp: Date.now() + TOKEN_TTL_MS,
  });
  const body = b64urlEncode(Buffer.from(payload, 'utf8'));
  const sig = b64urlEncode(createHmac('sha256', getKey()).update(body).digest());
  return `${body}.${sig}`;
}

/** Verify a token. Returns claims on success, null on any failure. */
export function verifyUnsubscribeToken(token: string): UnsubscribeClaims | null {
  try {
    const dot = token.indexOf('.');
    if (dot <= 0 || dot === token.length - 1) return null;
    const body = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac('sha256', getKey()).update(body).digest();
    const actual = b64urlDecode(sig);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as {
      e: unknown;
      id: unknown;
      exp: unknown;
    };
    if (typeof payload.e !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.id !== null && typeof payload.id !== 'string') return null;
    if (payload.exp < Date.now()) return null;
    return { email: payload.e, subscriptionId: payload.id };
  } catch {
    return null;
  }
}

/** Build the full unsubscribe URL for inclusion in alert emails. */
export function buildUnsubscribeUrl(email: string, subscriptionId: string | null): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const token = createUnsubscribeToken(email, subscriptionId);
  return `${base}/api/finance-alerts/unsubscribe?token=${encodeURIComponent(token)}`;
}
