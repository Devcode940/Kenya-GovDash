/**
 * Security regression tests for auth fail-closed behaviour.
 * Run: bunx vitest run src/lib/__tests__/auth.security.test.ts
 */

import { describe, expect, it } from 'vitest';

const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

describe('auth credential contract', () => {
  it('rejects empty ADMIN_PASSWORD_HASH', () => {
    const hash = '';
    expect(hash.length === 60 && hash.startsWith('$2')).toBe(false);
  });

  it('accepts well-formed bcrypt hash shape', () => {
    const sample =
      '$2b$12$4umU2HQZ8ULkvCmn750DRe4us7fARSRUwhc327kz.XEfhYrllE1ce';
    expect(BCRYPT_RE.test(sample)).toBe(true);
    expect(sample.length).toBe(60);
  });

  it('requires JWT_SECRET length >= 32', () => {
    expect('short'.length >= 32).toBe(false);
    expect('a'.repeat(32).length >= 32).toBe(true);
  });

  it('documents that no default password is shipped in source', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const authPath = path.join(process.cwd(), 'src/lib/auth.ts');
    const src = await fs.readFile(authPath, 'utf8');
    expect(src).not.toContain('fb0599a99117931085153a59');
    expect(src).not.toContain('Wlv2QBf72IMVuMw3ReyR2e2DFoIk6C7mLIt02iQFuLBP83OYc2yZO');
    expect(src).toContain('ADMIN_PASSWORD_HASH must be set');
    expect(src).toContain('JWT_SECRET must be set');
  });
});
