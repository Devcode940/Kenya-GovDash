#!/usr/bin/env node
/**
 * whistleblower_decrypt.mjs — OFFLINE decryption for whistleblower exports.
 *
 * RUN ON AN AIR-GAPPED MACHINE holding the admin private key. Never run this
 * on the application server.
 *
 * Usage:
 *   node scripts/whistleblower_decrypt.mjs --input export.json --key private.pkcs8.pem --out ./decrypted [--ticket WB-XXXXXXXXXXXX]
 *
 * Reads an export bundle (format kenya-govdash-whistleblower-export-v1, as
 * downloaded from Admin → Whistleblower → Export bundle), decrypts each
 * envelope, prints report summaries, and writes evidence files to
 * <out>/<ticket>/ preserving original filenames (sanitized).
 */
import { privateDecrypt, createDecipheriv, constants, createPrivateKey } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = { input: null, key: null, out: null, ticket: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--input' || a === '--key' || a === '--out' || a === '--ticket') && argv[i + 1]) {
      out[a.slice(2)] = argv[++i];
    } else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/whistleblower_decrypt.mjs --input export.json --key private.pkcs8.pem --out ./decrypted [--ticket WB-XXXXXXXXXXXX]');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }
  for (const k of ['input', 'key', 'out']) {
    if (!out[k]) {
      console.error(`Missing required --${k}`);
      process.exit(2);
    }
  }
  return out;
}

function b64(s, label) {
  if (typeof s !== 'string' || s.length === 0) throw new Error(`invalid base64 field: ${label}`);
  return Buffer.from(s, 'base64');
}

function aesGcmDecrypt(key, iv, ctWithTag) {
  if (ctWithTag.length < 17) throw new Error('ciphertext too short');
  const tag = ctWithTag.subarray(ctWithTag.length - 16);
  const ct = ctWithTag.subarray(0, ctWithTag.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

function sanitizeFileName(name) {
  const base = path.basename(String(name || 'evidence.bin')).slice(0, 200);
  const clean = base.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return clean.length > 0 && clean !== '.' && clean !== '..' ? clean : 'evidence.bin';
}

const args = parseArgs(process.argv.slice(2));

let bundle;
try {
  bundle = JSON.parse(readFileSync(args.input, 'utf8'));
} catch (err) {
  console.error(`Cannot read/parse input: ${err.message}`);
  process.exit(1);
}
if (bundle.format !== 'kenya-govdash-whistleblower-export-v1' || !Array.isArray(bundle.submissions)) {
  console.error('Not a whistleblower export bundle (bad format marker).');
  process.exit(1);
}

let privateKey;
try {
  privateKey = createPrivateKey(readFileSync(args.key, 'utf8'));
} catch (err) {
  console.error(`Cannot load private key: ${err.message}`);
  process.exit(1);
}

const outDir = path.resolve(args.out);
mkdirSync(outDir, { recursive: true });

let ok = 0;
let failed = 0;
for (const sub of bundle.submissions) {
  if (args.ticket && sub.ticketId !== args.ticket) continue;
  try {
    if (!sub.ticketId || !sub.encryptedKey || !sub.iv || !sub.ciphertext) {
      throw new Error('envelope missing required fields');
    }
    // 1. Unwrap the AES data key
    const aesKey = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      b64(sub.encryptedKey, 'encryptedKey'),
    );
    if (aesKey.length !== 32) throw new Error('unwrapped key is not 256-bit');

    // 2. Decrypt the report payload
    const payloadBytes = aesGcmDecrypt(aesKey, b64(sub.iv, 'iv'), b64(sub.ciphertext, 'ciphertext'));
    const report = JSON.parse(payloadBytes.toString('utf8'));

    // 3. Decrypt evidence files
    const evidence = Array.isArray(sub.evidence) ? sub.evidence : [];
    const ticketDir = path.join(outDir, sub.ticketId);
    if (evidence.length > 0) mkdirSync(ticketDir, { recursive: true });
    const savedFiles = [];
    for (const f of evidence) {
      const fileBytes = aesGcmDecrypt(aesKey, b64(f.iv, 'file iv'), b64(f.ciphertext, 'file ciphertext'));
      const safeName = sanitizeFileName(f.name);
      const dest = path.join(ticketDir, safeName);
      const resolved = path.resolve(dest);
      if (!resolved.startsWith(ticketDir + path.sep)) throw new Error('path escape in evidence name');
      writeFileSync(dest, fileBytes);
      savedFiles.push(`${safeName} (${fileBytes.length} bytes)`);
    }

    console.log(`\n===== ${sub.ticketId} [${sub.status}] =====`);
    console.log(`category:     ${sub.category}`);
    console.log(`submitted:    ${sub.createdAt}`);
    console.log(`title:        ${report.title}`);
    console.log(`description:  ${report.description}`);
    console.log(`county:       ${report.countyName ?? '—'}`);
    console.log(`department:   ${report.department ?? '—'}`);
    console.log(`amount:       ${report.estimatedAmount ?? '—'}`);
    console.log(`anonymous:    ${report.isAnonymous !== false}`);
    if (report.isAnonymous === false) {
      console.log(`reporter:     ${report.reporterName ?? '—'} <${report.reporterEmail ?? '—'}>`);
    }
    console.log(`evidence:     ${savedFiles.length > 0 ? '' : 'none'}`);
    for (const s of savedFiles) console.log(`  - ${s}`);
    ok++;
  } catch (err) {
    console.error(`\n!!!!! ${sub.ticketId || '(unknown)'}: DECRYPT FAILED — ${err.message}`);
    failed++;
  }
}

console.log(`\nDecrypted ${ok} report(s), ${failed} failed. Output dir: ${outDir}`);
process.exit(failed > 0 ? 1 : 0);
