import { NextResponse } from 'next/server';
import { getServerKey } from '@/lib/whistleblower-server';

export const dynamic = 'force-dynamic';

// GET /api/whistleblower/pubkey — admin RSA public key for envelope encryption.
// Clients verify the fingerprint out-of-band when it matters.
export async function GET() {
  const key = getServerKey();
  if (!key) {
    return NextResponse.json(
      { error: 'Whistleblower encryption is not configured on this server' },
      { status: 501 },
    );
  }
  return NextResponse.json(
    {
      version: 1,
      algorithm: 'RSA-OAEP-SHA256 + AES-256-GCM (hybrid envelope v1)',
      keyId: key.keyId,
      fingerprintSha256: key.fingerprint,
      publicKeySpkiBase64: key.spkiB64,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
