import { describe, it, expect } from 'vitest';
import {
  NATIONAL_FINANCE,
  COUNTY_FINANCE,
  ALL_COUNTY_FINANCE,
  formatKshs,
  getAuditOpinionColor,
  getAuditOpinionTextColor,
  getNationalFinance,
  getCountyFinance,
  getAllCountyFinance,
  getAvailableFiscalYears,
  getAvailableCountyNames,
} from '@/lib/finance-audit-data';

describe('finance-audit-data library', () => {
  describe('data shape', () => {
    it('exposes three fiscal years of national finance data', () => {
      expect(NATIONAL_FINANCE.length).toBeGreaterThanOrEqual(3);
      for (const row of NATIONAL_FINANCE) {
        expect(row.level).toBe('national');
        expect(row.countyName).toBeUndefined();
        expect(row.fiscalYear).toMatch(/^\d{4}\/\d{2}$/);
      }
    });

    it('exposes 20 counties of FY 2023/24 finance data', () => {
      expect(COUNTY_FINANCE.length).toBe(20);
      for (const row of COUNTY_FINANCE) {
        expect(row.countyName).toBeTypeOf('string');
        expect(row.countyName.length).toBeGreaterThan(0);
        expect(row.auditOpinion).toBeTruthy();
      }
    });

    it('historical + curated combined data has no duplicate (county, fiscalYear) pairs', () => {
      const seen = new Set<string>();
      for (const row of ALL_COUNTY_FINANCE) {
        const key = `${row.countyName}::${row.fiscalYear}`;
        expect(seen.has(key), `duplicate key ${key}`).toBe(false);
        seen.add(key);
      }
    });

    it('all absorption values are within 0..100 when present', () => {
      for (const row of ALL_COUNTY_FINANCE) {
        for (const k of ['overallAbsorption', 'recurrentAbsorption', 'developmentAbsorption'] as const) {
          const v = row[k];
          if (v == null) continue;
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('formatKshs', () => {
    it('formats a millions value with the Kshs prefix and rounding', () => {
      expect(formatKshs(1234.5)).toBe('Kshs 1B');
    });

    it('upgrades to billions when value >= 1_000 (M unit)', () => {
      expect(formatKshs(2500)).toBe('Kshs 2.50B');
    });

    it('upgrades to trillions when value >= 1_000_000 (M unit)', () => {
      expect(formatKshs(3_959_464)).toBe('Kshs 3.96T');
    });

    it('returns N/A for nullish input', () => {
      expect(formatKshs(null)).toBe('N/A');
      expect(formatKshs(undefined)).toBe('N/A');
    });
  });

  describe('getAuditOpinionColor / TextColor', () => {
    it('returns Tailwind color tokens for each opinion type', () => {
      expect(getAuditOpinionColor('Unmodified')).toContain('emerald');
      expect(getAuditOpinionColor('Qualified')).toContain('amber');
      expect(getAuditOpinionColor('Adverse')).toContain('rose');
      expect(getAuditOpinionColor('Disclaimer')).toContain('purple');
      expect(getAuditOpinionColor('Not Audited')).toContain('slate');
    });

    it('text color tokens include light/dark variants', () => {
      expect(getAuditOpinionTextColor('Unmodified')).toContain('dark:');
      expect(getAuditOpinionTextColor('Adverse')).toContain('dark:');
    });
  });

  describe('getNationalFinance / getCountyFinance', () => {
    it('returns a single national row for a known fiscal year', () => {
      const row = getNationalFinance('2023/24');
      expect(row?.level).toBe('national');
      expect(row?.fiscalYear).toBe('2023/24');
    });

    it('returns the most recent row when no fiscal year is provided', () => {
      const row = getNationalFinance();
      expect(row?.fiscalYear).toBe('2023/24');
    });

    it('returns null for an unknown fiscal year', () => {
      expect(getNationalFinance('1999/00')).toBeNull();
    });

    it('returns the matching county record (case-insensitive)', () => {
      const row = getCountyFinance('NAIROBI CITY', '2023/24');
      expect(row?.countyName).toBe('Nairobi City');
    });

    it('returns null for an unknown county', () => {
      expect(getCountyFinance('Atlantis', '2023/24')).toBeNull();
    });
  });

  describe('list helpers', () => {
    it('getAllCountyFinance() returns the curated FY 2023/24 list by default', () => {
      const rows = getAllCountyFinance();
      expect(rows.length).toBe(20);
      expect(rows.every((r) => r.fiscalYear === '2023/24')).toBe(true);
    });

    it('getAvailableFiscalYears() returns sorted, deduped years', () => {
      const years = getAvailableFiscalYears();
      expect(years.length).toBeGreaterThan(0);
      const sorted = [...years].sort();
      expect(years).toEqual(sorted);
    });

    it('getAvailableCountyNames() returns sorted, deduped names', () => {
      const names = getAvailableCountyNames();
      expect(names.length).toBeGreaterThan(0);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });
});