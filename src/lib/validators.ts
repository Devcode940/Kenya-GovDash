/**
 * validators.ts — strict input validation at all API boundaries.
 *
 * Every route parses untrusted input (JSON bodies, query params) through
 * these zod schemas and rejects invalid payloads with 400 before any
 * business logic runs. Schemas use zod's default strip mode (unknown keys
 * are dropped, not rejected) so additive client fields never break the API;
 * known fields are fully type/range-checked.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Pagination limit shared by all list endpoints. */
export const limitSchema = z.coerce.number().int().min(1).max(200).default(50);

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

/** Optional text field that treats '' as null (matches form submissions). */
const optionalText = (max: number) =>
  z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(max).nullish());

const optionalUrl = (max: number) =>
  z.preprocess((v) => (v === '' ? null : v), z.string().trim().url().max(max).nullish());

const optionalEmail = () =>
  z.preprocess((v) => (v === '' ? null : v), z.string().trim().email().max(254).nullish());

/** Kshs-millions money field. Non-negative, finite, null when unknown. */
const moneyField = z.preprocess(
  (v) => (v === '' ? null : v),
  z.number().finite().min(0).max(1e12).nullish(),
);

/** Percentage field. Upper bound 1000 allows over-absorption (>100%). */
const pctField = z.preprocess(
  (v) => (v === '' ? null : v),
  z.number().finite().min(0).max(1000).nullish(),
);

const fiscalYearField = z.string().trim().regex(/^\d{4}\/\d{2}$/, 'Expected FY format YYYY/YY');

export const FEEDBACK_CATEGORIES = ['Complaint', 'Suggestion', 'Observation', 'Question', 'Appreciation'] as const;
export const FEEDBACK_STATUSES = ['Submitted', 'Under Review', 'Acknowledged', 'Resolved'] as const;
export const RESOURCE_SOURCES = ['OAG', 'CoB', 'CoG', 'EACC', 'TI-Kenya', 'Other'] as const;
export const SNAPSHOT_SOURCES = ['OAG', 'CoB', 'CoG', 'KNBS', 'Other'] as const;
export const AUDIT_OPINIONS = ['Unmodified', 'Qualified', 'Adverse', 'Disclaimer'] as const;
export const ALERT_METRICS = ['overallAbsorption', 'developmentAbsorption', 'auditOpinion', 'pendingBills'] as const;
export const FEED_SOURCES = ['oag', 'cob', 'ti-kenya', 'eacc'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseOr400<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const details = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
  return { ok: false, error: `Invalid input — ${details}` };
}

/** Convert URLSearchParams to a plain object for schema parsing. */
export function searchParamsToObject(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

export const feedbackQuerySchema = z.object({
  representativeId: z.string().trim().max(64).optional(),
  countyName: z.string().trim().max(64).optional(),
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  limit: limitSchema,
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
  limit: limitSchema,
});

export const financeAuditQuerySchema = z.object({
  level: z.enum(['all', 'national', 'county']).default('all'),
  county: z.string().trim().max(64).optional(),
  fy: z.string().trim().regex(/^\d{4}\/\d{2}$/, 'Expected FY format YYYY/YY').default('2023/24'),
  format: z.enum(['json', 'csv']).default('json'),
});

export const parliamentQuerySchema = z.object({
  type: z.enum(['all', 'mps', 'senators', 'womenReps']).default('all'),
  county: z.string().trim().max(64).optional(),
});

export const liveFeedsQuerySchema = z.object({
  mode: z.enum(['live', 'static']).default('live'),
});

export const representativesQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: z.string().trim().max(64).optional(),
  county: z.string().trim().max(64).optional(),
  coalition: z.string().trim().max(64).optional(),
});

export const pageParamSchema = z.coerce.number().int().min(1).max(10000).default(1);

export const eaccFeedQuerySchema = liveFeedsQuerySchema.extend({
  repId: z.string().trim().max(128).optional(),
});

// ---------------------------------------------------------------------------
// Public mutations
// ---------------------------------------------------------------------------

export const feedbackCreateSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  title: nonEmpty(200),
  description: nonEmpty(5000),
  representativeId: z.string().trim().max(64).nullish(),
  countyName: z.string().trim().max(64).nullish(),
  isAnonymous: z.boolean().default(true),
  submitterName: z.string().trim().max(120).nullish(),
  submitterEmail: optionalEmail(),
  submitterCounty: z.string().trim().max(64).nullish(),
  priority: z.enum(['Normal', 'High', 'Urgent']).default('Normal'),
  sourceUrl: optionalUrl(2048),
});

export const alertSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  countyName: nonEmpty(64),
  metric: z.enum(ALERT_METRICS),
  threshold: z.number().finite().nullish(),
  direction: z.enum(['below', 'above']).default('below'),
});

export const questionSchema = z.object({
  question: nonEmpty(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(10)
    .default([]),
});

export const liveFeedsRefreshSchema = z.object({
  source: z.enum(FEED_SOURCES).optional(),
  force: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  password: z.string().min(1).max(128),
});

// ---------------------------------------------------------------------------
// Admin: resources
// ---------------------------------------------------------------------------

export const resourceQuerySchema = z.object({
  source: z.enum(RESOURCE_SOURCES).optional(),
  kind: z.enum(['document', 'video', 'link']).optional(),
  published: z.enum(['true', 'false']).optional(),
});

export const resourceCreateSchema = z.object({
  source: z.enum(RESOURCE_SOURCES),
  kind: z.enum(['document', 'video', 'link']).optional(),
  title: nonEmpty(300),
  description: optionalText(2000),
  url: z.string().trim().url().max(2048),
  thumbnailUrl: optionalUrl(2048),
  durationLabel: z.string().trim().max(32).nullish(),
  fiscalYear: z.string().trim().max(16).nullish(),
  countyName: z.string().trim().max(64).nullish(),
  reportType: z.string().trim().max(64).nullish(),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000000).default(0),
});

export const resourceUpdateSchema = z.object({
  id: nonEmpty(64),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000000).optional(),
});

export const idParamSchema = z.object({ id: nonEmpty(64) });

// ---------------------------------------------------------------------------
// Admin: finance snapshots
// ---------------------------------------------------------------------------

const snapshotFields = {
  approvedBudget: moneyField,
  supplementaryBudget: moneyField,
  actualExpenditure: moneyField,
  recurrentExpenditure: moneyField,
  developmentExpenditure: moneyField,
  equitableShare: moneyField,
  ownSourceRevenue: moneyField,
  osrTarget: moneyField,
  conditionalGrants: moneyField,
  overallAbsorption: pctField,
  recurrentAbsorption: pctField,
  developmentAbsorption: pctField,
  auditOpinion: z.preprocess(
    (v) => (v === '' ? null : v),
    z.enum(AUDIT_OPINIONS).nullish(),
  ),
  auditSource: optionalText(256),
  auditUrl: optionalUrl(2048),
  pendingBills: moneyField,
  pendingBillsStart: moneyField,
  totalDebt: moneyField,
  domesticDebt: moneyField,
  foreignDebt: moneyField,
  complianceScore: z.preprocess(
    (v) => (v === '' ? null : v),
    z.number().finite().min(0).max(100).nullish(),
  ),
  notes: optionalText(5000),
  sourceUrl: optionalUrl(2048),
};

export const snapshotCreateSchema = z
  .object({
    fiscalYear: fiscalYearField,
    level: z.enum(['national', 'county']),
    countyName: z.string().trim().max(64).nullish(),
    source: z.enum(SNAPSHOT_SOURCES),
    published: z.boolean().default(true),
    ...snapshotFields,
  })
  .refine((d) => d.level !== 'county' || (d.countyName != null && d.countyName.length > 0), {
    message: 'countyName required for county-level snapshots',
    path: ['countyName'],
  });

export const snapshotUpdateSchema = z.object({
  id: nonEmpty(64),
  published: z.boolean().optional(),
  ...snapshotFields,
});

export const snapshotQuerySchema = z.object({
  level: z.enum(['national', 'county']).optional(),
  countyName: z.string().trim().max(64).optional(),
  fiscalYear: z.string().trim().regex(/^\d{4}\/\d{2}$/, 'Expected FY format YYYY/YY').optional(),
  source: z.enum(SNAPSHOT_SOURCES).optional(),
  published: z.enum(['true', 'false']).optional(),
});

// ---------------------------------------------------------------------------
// Admin: CECM verification
// ---------------------------------------------------------------------------

export const cecmVerifySchema = z.object({
  cecmId: nonEmpty(128),
  countyName: z.string().trim().max(64).optional(),
  portfolio: z.string().trim().max(128).optional(),
  verifiedName: nonEmpty(200),
  source: optionalText(512),
  notes: optionalText(2000),
});

export const cecmQuerySchema = z.object({
  countyName: z.string().trim().max(64).optional(),
});

export const cecmDeleteSchema = z.object({ cecmId: nonEmpty(128) });

// ---------------------------------------------------------------------------
// Admin: PDF extraction
// ---------------------------------------------------------------------------

export const extractFinanceSchema = z.object({
  fileName: z.string().trim().min(1).max(255).optional(),
  saveToDb: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Whistleblower (end-to-end encrypted envelope v1)
// ---------------------------------------------------------------------------

export const WB_CATEGORIES = [
  'embezzlement', 'bribery', 'nepotism', 'procurement_fraud', 'ghost_workers',
  'pending_bills', 'project_abandonment', 'revenue_leakage', 'asset_grabbing', 'other',
] as const;

export const WB_STATUSES = ['submitted', 'under_review', 'investigating', 'verified', 'dismissed'] as const;

export const WB_TICKET_RE = /^WB-[0-9A-F]{12}$/;

/** Hard cap on submitted envelope bodies (also enforced via Content-Length). */
export const WB_MAX_ENVELOPE_BYTES = Math.floor(4.5 * 1024 * 1024);

const b64 = (max: number) => z.string().min(1).max(max);

export const wbFileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().max(128),
  size: z.number().int().min(1).max(2 * 1024 * 1024),
  iv: b64(32),
  ciphertext: b64( Math.ceil((2 * 1024 * 1024 + 16) * 4 / 3) + 16 ),
});

export const wbEnvelopeSchema = z.object({
  version: z.literal(1),
  keyId: z.string().trim().min(1).max(64),
  category: z.enum(WB_CATEGORIES),
  encryptedKey: b64(2048),
  iv: b64(32),
  ciphertext: b64(400 * 1024),
  files: z.array(wbFileSchema).max(5).default([]),
});

export const wbStatusQuerySchema = z.object({
  ticket: z.string().trim().regex(WB_TICKET_RE, 'Invalid ticket format (expected WB-XXXXXXXXXXXX)'),
});

export const wbAdminListSchema = z.object({
  status: z.enum(WB_STATUSES).optional(),
  limit: limitSchema,
});

export const wbStatusPatchSchema = z.object({
  ticketId: z.string().trim().regex(WB_TICKET_RE, 'Invalid ticket format'),
  status: z.enum(WB_STATUSES),
});
