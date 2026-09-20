import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stub Prisma so finance-alerts can be imported without a DB connection.
vi.mock('@/lib/db', () => ({
  db: {
    financeAlertSubscription: {
      findMany: async () => [],
      update: async () => ({}),
    },
    financeAlertLog: {
      create: async () => ({}),
    },
  },
}));

import { checkAlerts } from '@/lib/finance-alerts';
import { ALL_COUNTY_FINANCE } from '@/lib/finance-audit-data';

describe('finance alert helpers (pure)', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = '';
    process.env.JWT_SECRET = '';
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = '';
    process.env.JWT_SECRET = '';
  });

  it('every county row has a numeric overallAbsorption between 0 and 100', async () => {
    for (const row of ALL_COUNTY_FINANCE) {
      if (row.overallAbsorption == null) continue;
      expect(row.overallAbsorption).toBeGreaterThanOrEqual(0);
      expect(row.overallAbsorption).toBeLessThanOrEqual(100);
    }
  });

  it('every county row has a valid audit opinion when present', () => {
    const valid = new Set(['Unmodified', 'Qualified', 'Adverse', 'Disclaimer', 'Not Audited']);
    for (const row of ALL_COUNTY_FINANCE) {
      if (row.auditOpinion == null) continue;
      expect(valid.has(row.auditOpinion)).toBe(true);
    }
  });

  it('pendingBills values are non-negative when present', () => {
    for (const row of ALL_COUNTY_FINANCE) {
      if (row.pendingBills == null) continue;
      expect(row.pendingBills).toBeGreaterThanOrEqual(0);
    }
  });

  it('checkAlerts() returns no triggers when there are no active subscriptions', async () => {
    const triggers = await checkAlerts();
    expect(triggers).toEqual([]);
  });
});