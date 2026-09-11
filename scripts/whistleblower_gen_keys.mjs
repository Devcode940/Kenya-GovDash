#!/usr/bin/env node
/**
 * whistleblower_gen_keys.mjs — generate the admin RSA keypair for the
 * end-to-end encrypted whistleblower pipeline.
 *
 * RUN ON AN OFFLINE (air-gapped) MACHINE. The private key must never touch
 * the application server. Only the public SPKI value goes into the server
 * env var WHISTLEBLOWER_PUBLIC_KEY.
 *
 * Usage:
 *   node scripts/whistleblower_gen_keys.mjs --out ./wb-keys
 *
 * Output:
 *   ./wb-keys/public.spki.b64   — single-line base64, paste into server env
 *   ./wb-keys/private.pkcs8.pem  — KEEP OFFLINE, chmod 600
 *   stdout: keyId + SHA-256 fingerprint (verify clients see the same value)
 */
import { generateKeyPairSync, createHash, createPrivateKey, publicEncrypt, privateDecrypt, constants } from 'node:crypto';
import { mkdirSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = { out: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) {
      out.out = argv[++i];
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/whistleblower_gen_keys.mjs --out <dir>');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  if (!out.out) {
    console.error('Missing required --out <dir>');
    process.exit(2);
  }
  return out;
}

const { out } = parseArgs(process.argv.slice(2));
const outDir = path.resolve(out);
mkdirSync(outDir, { recursive: true });

const pubPath = path.join(outDir, 'public.spki.b64');
const privPath = path.join(outDir, 'private.pkcs8.pem');
if (existsSync(pubPath) || existsSync(privPath)) {
  console.error(`Refusing to overwrite existing key material in ${outDir}`);
  process.exit(1);
}

console.error('Generating RSA-4096 keypair (this takes a few seconds)…');
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicExponent: 0x10001,
});

const spkiDer = publicKey.export({ type: 'spki', format: 'der' });
const spkiB64 = spkiDer.toString('base64');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });

// Self-test: wrap/unwrap round-trip before writing anything.
const probe = Buffer.from('whistleblower-keygen-selftest');
const wrapped = publicEncrypt(
  { key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
  probe,
);
const unwrapped = privateDecrypt(
  { key: createPrivateKey(privatePem), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
  wrapped,
);
if (!unwrapped.equals(probe)) {
  console.error('FATAL: keypair self-test failed');
  process.exit(1);
}

writeFileSync(pubPath, spkiB64 + '\n', { mode: 0o644 });
writeFileSync(privPath, privatePem, { mode: 0o600 });
try { chmodSync(privPath, 0o600); } catch { /* non-POSIX fs */ }

const fingerprint = createHash('sha256').update(spkiDer).digest('hex');
console.log(`keyId: ${fingerprint.slice(0, 16)}`);
console.log(`fingerprint_sha256: ${fingerprint}`);
console.log(`public_spki_path: ${pubPath}`);
console.log(`private_key_path: ${privPath} (KEEP OFFLINE, chmod 600)`);
console.log('');
console.log('Next step: set on the SERVER:');
console.log(`  WHISTLEBLOWER_PUBLIC_KEY="${spkiB64.slice(0, 32)}…<full value in ${pubPath}>"`);
