/**
 * whistleblower-server.ts — server-only helpers for the E2E-encrypted
 * whistleblower pipeline. The server holds the admin RSA *public* key only
 * (WHISTLEBLOWER_PUBLIC_KEY, SPKI DER base64) and can never decrypt reports.
 */
import { createHash, randomBytes } from 'crypto';

export interface ServerKey {
  spkiB64: string;
  fingerprint: string;
  keyId: string;
}

/** Load + validate the configured public key. Null when unconfigured/invalid. */
export function getServerKey(): ServerKey | null {
  const raw = (process.env.WHISTLEBLOWER_PUBLIC_KEY || '').trim().replace(/\s+/g, '');
  if (!raw) return null;
  let der: Buffer;
  try {
    der = Buffer.from(raw, 'base64');
  } catch {
    return null;
  }
  // RSA-2048 SPKI ≈ 294B DER; RSA-3072 ≈ 422B; RSA-4096 ≈ 550B.
  if (der.length < 256 || raw.length < 300) return null;
  const fingerprint = createHash('sha256').update(der).digest('hex');
  return { spkiB64: raw, fingerprint, keyId: fingerprint.slice(0, 16) };
}

/** Unguessable public ticket, e.g. WB-3F9A1C7E42B8. */
export function generateTicketId(): string {
  return `WB-${randomBytes(6).toString('hex').toUpperCase()}`;
}
