// ==================== AUTH LIBRARY ====================
// Secure authentication using bcrypt password hashing + JWT session cookies.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'kenya-admin-session';
const SESSION_DURATION_SEC = 60 * 60 * 24; // 24 hours

// ==================== PASSWORD HASHING ====================

// Default hash of "kenya-oversight-2026" — used when env var is not set.
// The $ characters in bcrypt hashes conflict with Next.js env var expansion.
// To set a custom password, hardcode the hash here or use a base64-encoded env var.
const DEFAULT_PASSWORD_HASH = '$2b$10$zwCrCu9DgB4BvAaJUcPbPOkNnxa0HvNMBZfXH6XVqSYOl43PYkK2C';

function getPasswordHash(): string {
  // Try env var first (may fail due to $ expansion in Next.js dotenv)
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash && hash.length === 60 && hash.startsWith('$2')) {
    return hash;
  }
  // Fall back to default hash
  return DEFAULT_PASSWORD_HASH;
}

export async function verifyPassword(plainPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, getPasswordHash());
  } catch {
    return false;
  }
}

export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, 10);
}

// ==================== JWT SESSION ====================

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[auth] JWT_SECRET not set — using fallback. Set JWT_SECRET env var for production.');
    return 'kenya-govdash-fallback-secret-change-me';
  }
  return secret;
}

interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_DURATION_SEC,
  };
  return jwt.sign(payload, getJwtSecret());
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    if (decoded.role !== 'admin') return false;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

// ==================== COOKIE HELPERS ====================

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
// Simple in-memory rate limiter for the login endpoint.
// Blocks after 5 failed attempts per IP for 15 minutes.

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    return {
      allowed: entry.count < MAX_ATTEMPTS,
      remaining: Math.max(0, MAX_ATTEMPTS - entry.count),
      resetAt: entry.resetAt,
    };
  }

  // Reset or create new entry
  loginAttempts.set(ip, { count: 0, resetAt: now + BLOCK_DURATION_MS });
  return { allowed: true, remaining: MAX_ATTEMPTS, resetAt: now + BLOCK_DURATION_MS };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip) ?? { count: 0, resetAt: now + BLOCK_DURATION_MS };
  entry.count++;
  entry.resetAt = now + BLOCK_DURATION_MS;
  loginAttempts.set(ip, entry);
}

export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

// Get client IP from request (handles proxies)
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}
