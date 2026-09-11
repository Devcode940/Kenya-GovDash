/**
 * rate-limit.ts — per-IP rate limiting with pluggable storage.
 *
 * Backend selection (automatic):
 *   - RATE_LIMIT_KV_URL + RATE_LIMIT_KV_TOKEN set → Upstash-compatible Redis
 *     over HTTPS (shared across serverless instances).
 *   - Otherwise → in-memory store (correct on single-instance deployments).
 *
 * Semantics: sliding-window counters. Every recorded hit refreshes the
 * window TTL, so sustained abuse never earns a fresh window.
 *
 * Failure semantics: if the Redis backend errors or times out, checks
 * fail OPEN (request allowed) with a loud error log. Rationale: the limiter
 * is defense-in-depth; a cache outage must not take down the site. Alert on
 * `[rate-limit] backend error` in production monitoring.
 */
export type RateScope = 'login' | 'ai' | 'feedback' | 'feeds' | 'whistleblower';

const SCOPE_LIMITS: Record<RateScope, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  ai: { max: 30, windowMs: 60 * 60 * 1000 },
  feedback: { max: 10, windowMs: 60 * 60 * 1000 },
  feeds: { max: 60, windowMs: 60 * 60 * 1000 },
  whistleblower: { max: 20, windowMs: 60 * 60 * 1000 },
};

export interface RateLimitVerdict {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface RateLimitStore {
  /** Current count for key; 0 when absent or expired. */
  getCount(key: string): Promise<number>;
  /** Atomically increment and refresh the window TTL. Returns new count. */
  incr(key: string, windowMs: number): Promise<number>;
  /** Remove the key (e.g. clear login attempts after success). */
  delete(key: string): Promise<void>;
}

function storageKey(ip: string, scope: RateScope): string {
  const safeIp = ip.replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 128) || 'unknown';
  return `rl:${scope}:${safeIp}`;
}

// ---------------------------------------------------------------------------
// In-memory store (single-instance deployments)
// ---------------------------------------------------------------------------

const MAX_TRACKED_KEYS = 10_000;
const PURGE_INTERVAL_MS = 60_000;

class MemoryStore implements RateLimitStore {
  private counts = new Map<string, { count: number; resetAt: number }>();
  private lastPurge = 0;

  private purgeExpired(now: number): void {
    if (now - this.lastPurge < PURGE_INTERVAL_MS) return;
    this.lastPurge = now;
    for (const [key, entry] of this.counts) {
      if (entry.resetAt <= now) this.counts.delete(key);
    }
    while (this.counts.size > MAX_TRACKED_KEYS) {
      const oldest = this.counts.keys().next();
      if (oldest.done) break;
      this.counts.delete(oldest.value);
    }
  }

  async getCount(key: string): Promise<number> {
    const now = Date.now();
    this.purgeExpired(now);
    const entry = this.counts.get(key);
    if (!entry || entry.resetAt <= now) {
      if (entry) this.counts.delete(key);
      return 0;
    }
    return entry.count;
  }

  async incr(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    this.purgeExpired(now);
    const entry = this.counts.get(key);
    if (!entry || entry.resetAt <= now) {
      this.counts.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }
    entry.count += 1;
    entry.resetAt = now + windowMs; // sliding window
    this.counts.set(key, entry);
    return entry.count;
  }

  async delete(key: string): Promise<void> {
    this.counts.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Upstash-compatible Redis store (serverless deployments)
// ---------------------------------------------------------------------------

const KV_TIMEOUT_MS = 2000;

async function kvFetch(url: string, token: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), KV_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`KV HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

class UpstashStore implements RateLimitStore {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  async getCount(key: string): Promise<number> {
    const data = (await kvFetch(
      `${this.baseUrl}/get/${encodeURIComponent(key)}`,
      this.token,
    )) as { result?: string | null };
    if (data.result == null) return 0;
    const n = parseInt(data.result, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  async incr(key: string, windowMs: number): Promise<number> {
    // INCR + PEXPIRE in one round trip. INCR is atomic; PEXPIRE refresh slides the window.
    const data = (await kvFetch(`${this.baseUrl}/pipeline`, this.token, {
      method: 'POST',
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, windowMs],
      ]),
    })) as Array<{ result?: unknown }>;
    const count = Number(data?.[0]?.result);
    if (!Number.isFinite(count)) throw new Error('KV pipeline returned non-numeric count');
    return count;
  }

  async delete(key: string): Promise<void> {
    await kvFetch(`${this.baseUrl}/del/${encodeURIComponent(key)}`, this.token);
  }
}

// ---------------------------------------------------------------------------
// Backend selection (lazy singleton)
// ---------------------------------------------------------------------------

let store: RateLimitStore | null = null;
let backendLogged = false;

function getStore(): RateLimitStore {
  if (store) return store;
  const url = process.env.RATE_LIMIT_KV_URL;
  const token = process.env.RATE_LIMIT_KV_TOKEN;
  if (url && token) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error(`unsupported protocol ${parsed.protocol}`);
      }
      store = new UpstashStore(url, token);
    } catch (err) {
      console.error(
        '[rate-limit] Invalid RATE_LIMIT_KV_URL — falling back to memory store:',
        err instanceof Error ? err.message : err,
      );
      store = new MemoryStore();
    }
  } else {
    store = new MemoryStore();
  }
  if (!backendLogged) {
    backendLogged = true;
    console.log(`[rate-limit] backend: ${store instanceof UpstashStore ? 'upstash-redis' : 'memory'}`);
  }
  return store;
}

/** Test hook: reset the singleton so env changes take effect. */
export function __resetRateLimitStoreForTests(): void {
  store = null;
  backendLogged = false;
}

// ---------------------------------------------------------------------------
// Public API (async — works identically on both backends)
// ---------------------------------------------------------------------------

export async function checkRateLimit(ip: string, scope: RateScope = 'login'): Promise<RateLimitVerdict> {
  const { max, windowMs } = SCOPE_LIMITS[scope];
  const now = Date.now();
  try {
    const count = await getStore().getCount(storageKey(ip, scope));
    return {
      allowed: count < max,
      remaining: Math.max(0, max - count),
      resetAt: now + windowMs,
    };
  } catch (err) {
    console.error('[rate-limit] backend error on check — failing open:', err instanceof Error ? err.message : err);
    return { allowed: true, remaining: max, resetAt: now + windowMs };
  }
}

/** Failed-auth accounting: increment + extend the block window. */
export async function recordFailedAttempt(ip: string, scope: RateScope = 'login'): Promise<void> {
  try {
    await getStore().incr(storageKey(ip, scope), SCOPE_LIMITS[scope].windowMs);
  } catch (err) {
    console.error('[rate-limit] backend error on record — sample dropped:', err instanceof Error ? err.message : err);
  }
}

/** Quota accounting for non-auth scopes (ai, feedback, feeds, whistleblower). */
export async function recordAttempt(ip: string, scope: RateScope): Promise<void> {
  try {
    await getStore().incr(storageKey(ip, scope), SCOPE_LIMITS[scope].windowMs);
  } catch (err) {
    console.error('[rate-limit] backend error on record — sample dropped:', err instanceof Error ? err.message : err);
  }
}

export async function clearRateLimit(ip: string, scope: RateScope = 'login'): Promise<void> {
  try {
    await getStore().delete(storageKey(ip, scope));
  } catch (err) {
    console.error('[rate-limit] backend error on clear:', err instanceof Error ? err.message : err);
  }
}
