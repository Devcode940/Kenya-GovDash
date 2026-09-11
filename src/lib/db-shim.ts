/**
 * db-shim.ts — zero-dependency SQLite fallback for PrismaClient.
 *
 * Used automatically by `src/lib/db.ts` when the real Prisma client can't
 * initialize (e.g. Prisma's engine binaries can't be downloaded in an
 * offline/sandboxed environment). It speaks the same call surface the app
 * uses (`findMany`, `findUnique`, `findFirst`, `create`, `update`,
 * `updateMany`, `upsert`, `delete`, `count`, `groupBy`) on top of Node's
 * built-in `node:sqlite` driver — no native downloads required.
 *
 * It reads the same `DATABASE_URL` (`file:...`) and auto-creates tables
 * matching `prisma/schema.prisma`, so the app behaves the same and any data
 * written here remains usable once the real Prisma client is available.
 *
 * NOTE: this is a compatibility shim for development/preview, not a full
 * Prisma replacement. Complex filters/relations beyond what the app uses
 * are not implemented.
 */

import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Schema (mirrors prisma/schema.prisma)
// ---------------------------------------------------------------------------

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT PRIMARY KEY,
    "representativeId" TEXT,
    "countyName" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "submitterCounty" TEXT,
    "isAnonymous" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "sourceUrl" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT PRIMARY KEY,
    "source" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "thumbnailUrl" TEXT,
    "durationLabel" TEXT,
    "fiscalYear" TEXT,
    "countyName" TEXT,
    "reportType" TEXT,
    "published" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "FinanceAuditSnapshot" (
    "id" TEXT PRIMARY KEY,
    "fiscalYear" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "countyName" TEXT,
    "source" TEXT NOT NULL,
    "approvedBudget" REAL,
    "supplementaryBudget" REAL,
    "actualExpenditure" REAL,
    "recurrentExpenditure" REAL,
    "developmentExpenditure" REAL,
    "equitableShare" REAL,
    "ownSourceRevenue" REAL,
    "osrTarget" REAL,
    "conditionalGrants" REAL,
    "overallAbsorption" REAL,
    "recurrentAbsorption" REAL,
    "developmentAbsorption" REAL,
    "auditOpinion" TEXT,
    "auditSource" TEXT,
    "auditUrl" TEXT,
    "pendingBills" REAL,
    "pendingBillsStart" REAL,
    "totalDebt" REAL,
    "domesticDebt" REAL,
    "foreignDebt" REAL,
    "complianceScore" REAL,
    "notes" TEXT,
    "sourceUrl" TEXT,
    "published" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    UNIQUE("fiscalYear", "level", "countyName", "source")
  )`,
  `CREATE TABLE IF NOT EXISTS "CecmVerification" (
    "id" TEXT PRIMARY KEY,
    "cecmId" TEXT NOT NULL UNIQUE,
    "countyName" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "verifiedName" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TEXT NOT NULL,
    "source" TEXT,
    "notes" TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS "FinanceAlertSubscription" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "countyName" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "threshold" REAL,
    "direction" TEXT NOT NULL DEFAULT 'below',
    "active" INTEGER NOT NULL DEFAULT 1,
    "lastTriggeredAt" TEXT,
    "lastTriggeredValue" REAL,
    "confirmToken" TEXT,
    "confirmedAt" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "FinanceAlertLog" (
    "id" TEXT PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "countyName" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "triggerValue" REAL NOT NULL,
    "threshold" REAL,
    "message" TEXT NOT NULL,
    "sentAt" TEXT NOT NULL
  )`,
  // Indexes (mirror @@index blocks)
  `CREATE INDEX IF NOT EXISTS "Feedback_category_idx" ON "Feedback"("category")`,
  `CREATE INDEX IF NOT EXISTS "Feedback_status_idx" ON "Feedback"("status")`,
  `CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Feedback_countyName_idx" ON "Feedback"("countyName")`,
  `CREATE INDEX IF NOT EXISTS "Resource_source_kind_idx" ON "Resource"("source", "kind")`,
  `CREATE INDEX IF NOT EXISTS "Resource_published_idx" ON "Resource"("published")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAuditSnapshot_fiscalYear_idx" ON "FinanceAuditSnapshot"("fiscalYear")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAuditSnapshot_countyName_idx" ON "FinanceAuditSnapshot"("countyName")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAuditSnapshot_level_idx" ON "FinanceAuditSnapshot"("level")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAuditSnapshot_source_idx" ON "FinanceAuditSnapshot"("source")`,
  `CREATE INDEX IF NOT EXISTS "CecmVerification_countyName_idx" ON "CecmVerification"("countyName")`,
  `CREATE INDEX IF NOT EXISTS "CecmVerification_cecmId_idx" ON "CecmVerification"("cecmId")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAlertSubscription_email_idx" ON "FinanceAlertSubscription"("email")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAlertSubscription_countyName_idx" ON "FinanceAlertSubscription"("countyName")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAlertSubscription_active_idx" ON "FinanceAlertSubscription"("active")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAlertLog_subscriptionId_idx" ON "FinanceAlertLog"("subscriptionId")`,
  `CREATE INDEX IF NOT EXISTS "FinanceAlertLog_sentAt_idx" ON "FinanceAlertLog"("sentAt")`,
  `CREATE TABLE IF NOT EXISTS "WhistleblowerSubmission" (
    "id" TEXT PRIMARY KEY,
    "ticketId" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "hasEvidence" INTEGER NOT NULL DEFAULT 0,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "WhistleblowerSubmission_status_idx" ON "WhistleblowerSubmission"("status")`,
  `CREATE INDEX IF NOT EXISTS "WhistleblowerSubmission_createdAt_idx" ON "WhistleblowerSubmission"("createdAt")`,
];

interface ModelMeta {
  table: string;
  columns: Set<string>;
  bools: Set<string>;
  dates: Set<string>;
  defaults: Record<string, () => unknown>;
}

function meta(
  table: string,
  columns: string[],
  opts: { bools?: string[]; dates?: string[]; defaults?: Record<string, () => unknown> } = {},
): ModelMeta {
  return {
    table,
    columns: new Set(columns),
    bools: new Set(opts.bools || []),
    dates: new Set(opts.dates || []),
    defaults: opts.defaults || {},
  };
}

const nowIso = () => new Date().toISOString();

const METAS: Record<string, ModelMeta> = {
  user: meta('User', ['id', 'email', 'name', 'createdAt', 'updatedAt'], {
    dates: ['createdAt', 'updatedAt'],
  }),
  post: meta('Post', ['id', 'title', 'content', 'published', 'authorId', 'createdAt', 'updatedAt'], {
    bools: ['published'],
    dates: ['createdAt', 'updatedAt'],
    defaults: { published: () => true },
  }),
  feedback: meta(
    'Feedback',
    ['id', 'representativeId', 'countyName', 'category', 'title', 'description', 'submitterName',
      'submitterEmail', 'submitterCounty', 'isAnonymous', 'status', 'priority', 'sourceUrl',
      'createdAt', 'updatedAt'],
    {
      bools: ['isAnonymous'],
      dates: ['createdAt', 'updatedAt'],
      defaults: { isAnonymous: () => true, status: () => 'Submitted', priority: () => 'Normal' },
    },
  ),
  resource: meta(
    'Resource',
    ['id', 'source', 'kind', 'title', 'description', 'url', 'fileName', 'fileSize', 'mimeType',
      'thumbnailUrl', 'durationLabel', 'fiscalYear', 'countyName', 'reportType', 'published',
      'sortOrder', 'createdAt', 'updatedAt'],
    {
      bools: ['published'],
      dates: ['createdAt', 'updatedAt'],
      defaults: { published: () => true, sortOrder: () => 0 },
    },
  ),
  financeAuditSnapshot: meta(
    'FinanceAuditSnapshot',
    ['id', 'fiscalYear', 'level', 'countyName', 'source', 'approvedBudget', 'supplementaryBudget',
      'actualExpenditure', 'recurrentExpenditure', 'developmentExpenditure', 'equitableShare',
      'ownSourceRevenue', 'osrTarget', 'conditionalGrants', 'overallAbsorption',
      'recurrentAbsorption', 'developmentAbsorption', 'auditOpinion', 'auditSource', 'auditUrl',
      'pendingBills', 'pendingBillsStart', 'totalDebt', 'domesticDebt', 'foreignDebt',
      'complianceScore', 'notes', 'sourceUrl', 'published', 'createdAt', 'updatedAt'],
    {
      bools: ['published'],
      dates: ['createdAt', 'updatedAt'],
      defaults: { published: () => true },
    },
  ),
  cecmVerification: meta(
    'CecmVerification',
    ['id', 'cecmId', 'countyName', 'portfolio', 'verifiedName', 'verifiedBy', 'verifiedAt',
      'source', 'notes'],
    {
      dates: ['verifiedAt'],
      defaults: { verifiedAt: nowIso },
    },
  ),
  financeAlertSubscription: meta(
    'FinanceAlertSubscription',
    ['id', 'email', 'countyName', 'metric', 'threshold', 'direction', 'active',
      'lastTriggeredAt', 'lastTriggeredValue', 'confirmToken', 'confirmedAt',
      'createdAt', 'updatedAt'],
    {
      bools: ['active'],
      dates: ['lastTriggeredAt', 'confirmedAt', 'createdAt', 'updatedAt'],
      defaults: { direction: () => 'below', active: () => true },
    },
  ),
  financeAlertLog: meta(
    'FinanceAlertLog',
    ['id', 'subscriptionId', 'email', 'countyName', 'metric', 'triggerValue', 'threshold',
      'message', 'sentAt'],
    {
      dates: ['sentAt'],
      defaults: { sentAt: nowIso },
    },
  ),
  whistleblowerSubmission: meta(
    'WhistleblowerSubmission',
    ['id', 'ticketId', 'category', 'hasEvidence', 'encryptedKey', 'iv', 'ciphertext',
      'evidence', 'status', 'createdAt', 'updatedAt'],
    {
      bools: ['hasEvidence'],
      dates: ['createdAt', 'updatedAt'],
      defaults: { hasEvidence: () => false, status: () => 'submitted' },
    },
  ),
};

// ---------------------------------------------------------------------------
// Value conversion (JS <-> SQLite)
// ---------------------------------------------------------------------------

function toDb(m: ModelMeta, col: string, value: any): SQLInputValue {
  if (value === undefined || value === null) return null;
  if (m.bools.has(col)) return value ? 1 : 0;
  if (m.dates.has(col)) return value instanceof Date ? value.toISOString() : String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') return value;
  return String(value);
}

function fromDb(m: ModelMeta, col: string, value: any): any {
  if (value === null || value === undefined) return value ?? null;
  if (m.bools.has(col)) return value === 1 || value === true;
  if (m.dates.has(col)) return new Date(String(value));
  return value;
}

function mapRow(m: ModelMeta, row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = m.columns.has(k) ? fromDb(m, k, v) : v;
  }
  return out;
}

function applySelect(row: Record<string, any>, select?: Record<string, boolean>): Record<string, any> {
  if (!select) return row;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = row[k];
  }
  return out;
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

function escapeLike(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

// ---------------------------------------------------------------------------
// WHERE clause builder (supports the operators the app uses)
// ---------------------------------------------------------------------------

function buildCondition(m: ModelMeta, col: string, value: any, params: SQLInputValue[]): string {
  const c = `"${col}"`;
  // Scalar (incl. null) — `IS` handles NULL correctly, unlike `=`
  if (!isPlainObject(value)) {
    params.push(toDb(m, col, value));
    return `${c} IS ?`;
  }
  const parts: string[] = [];
  for (const [op, v] of Object.entries(value)) {
    if (op === 'mode') continue; // LIKE is already case-insensitive for ASCII
    switch (op) {
      case 'equals':
        params.push(toDb(m, col, v));
        parts.push(`${c} IS ?`);
        break;
      case 'not':
        if (v === null) parts.push(`${c} IS NOT NULL`);
        else {
          params.push(toDb(m, col, v));
          parts.push(`${c} IS NOT ?`);
        }
        break;
      case 'contains':
        params.push(`%${escapeLike(String(v))}%`);
        parts.push(`${c} LIKE ? ESCAPE '\\'`);
        break;
      case 'startsWith':
        params.push(`${escapeLike(String(v))}%`);
        parts.push(`${c} LIKE ? ESCAPE '\\'`);
        break;
      case 'endsWith':
        params.push(`%${escapeLike(String(v))}`);
        parts.push(`${c} LIKE ? ESCAPE '\\'`);
        break;
      case 'gt':
        params.push(toDb(m, col, v));
        parts.push(`${c} > ?`);
        break;
      case 'gte':
        params.push(toDb(m, col, v));
        parts.push(`${c} >= ?`);
        break;
      case 'lt':
        params.push(toDb(m, col, v));
        parts.push(`${c} < ?`);
        break;
      case 'lte':
        params.push(toDb(m, col, v));
        parts.push(`${c} <= ?`);
        break;
      case 'in': {
        const list = (Array.isArray(v) ? v : [v]).map(x => toDb(m, col, x));
        if (list.length === 0) parts.push('1 = 0');
        else {
          params.push(...list);
          parts.push(`${c} IN (${list.map(() => '?').join(', ')})`);
        }
        break;
      }
      case 'notIn': {
        const list = (Array.isArray(v) ? v : [v]).map(x => toDb(m, col, x));
        if (list.length === 0) parts.push('1 = 1');
        else {
          params.push(...list);
          parts.push(`${c} NOT IN (${list.map(() => '?').join(', ')})`);
        }
        break;
      }
      default:
        // Unknown operator — ignore (defensive; fail open like an empty filter)
        break;
    }
  }
  return parts.length > 0 ? parts.join(' AND ') : '1 = 1';
}

function buildWhere(m: ModelMeta, where: Record<string, any> | undefined, params: SQLInputValue[]): string {
  if (!where || Object.keys(where).length === 0) return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if ((key === 'OR' || key === 'AND') && Array.isArray(value)) {
      const joiner = key === 'OR' ? ' OR ' : ' AND ';
      const group = value
        .map(v => buildWhere(m, v, params))
        .filter(Boolean)
        .map(s => `(${s})`);
      if (group.length > 0) parts.push(`(${group.join(joiner)})`);
      continue;
    }
    if (key === 'NOT') {
      const list = Array.isArray(value) ? value : [value];
      for (const v of list) {
        const s = buildWhere(m, v, params);
        parts.push(`NOT (${s || '1 = 1'})`);
      }
      continue;
    }
    // Composite-unique flattening: { fiscalYear_level_countyName_source: {...} }
    if (!m.columns.has(key) && isPlainObject(value)) {
      const nested = buildWhere(m, value, params);
      if (nested) parts.push(`(${nested})`);
      continue;
    }
    if (!m.columns.has(key)) continue; // unknown column — ignore defensively
    parts.push(buildCondition(m, key, value, params));
  }
  return parts.join(' AND ');
}

function buildOrderBy(m: ModelMeta, orderBy: any): string {
  if (!orderBy) return '';
  const list = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts: string[] = [];
  for (const entry of list) {
    if (!isPlainObject(entry)) continue;
    for (const [col, dir] of Object.entries(entry)) {
      if (!m.columns.has(col)) continue;
      const d = String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      parts.push(`"${col}" ${d}`);
    }
  }
  return parts.join(', ');
}

function notFoundError(table: string): Error {
  return Object.assign(new Error(`No ${table} found`), { code: 'P2025' });
}

// Prisma requires unique `where` for update()/delete(). Enforce single-row match.
function assertUniqueMatch(sqlite: DatabaseSync, m: ModelMeta, where: Record<string, any> | undefined): void {
  const params: SQLInputValue[] = [];
  const w = buildWhere(m, where, params);
  const row = sqlite.prepare(
    `SELECT COUNT(*) AS n FROM "${m.table}"${w ? ` WHERE ${w}` : ''}`,
  ).get(...params) as { n: number };
  if (Number(row.n) > 1) {
    throw Object.assign(
      new Error(`Multiple ${m.table} records match; where must be unique`),
      { code: 'P2025' },
    );
  }
}

// LIMIT/OFFSET with Prisma-compatible negative-take semantics
// (negative take reverses ordering and takes abs()).
function buildPaging(orderSql: string, args: Record<string, any>): { orderSql: string; limitOffset: string } {
  const takeNum = args.take == null ? null : Math.trunc(Number(args.take));
  const skipNum = args.skip == null ? null : Math.max(0, Math.trunc(Number(args.skip)));
  if (takeNum != null && Number.isNaN(takeNum)) throw new Error('[db-shim] take must be a number');
  if (skipNum != null && Number.isNaN(skipNum)) throw new Error('[db-shim] skip must be a number');
  let order = orderSql;
  let limit = takeNum;
  if (takeNum != null && takeNum < 0) {
    limit = Math.abs(takeNum);
    order = order
      .split(',')
      .map(p => (p.trim().endsWith('DESC') ? p.replace(/DESC\s*$/, 'ASC') : p.replace(/ASC\s*$/, 'DESC')))
      .join(',');
  }
  let limitOffset = '';
  if (limit != null) limitOffset += ` LIMIT ${limit}`;
  else if (skipNum != null) limitOffset += ` LIMIT -1`;
  if (skipNum != null) limitOffset += ` OFFSET ${skipNum}`;
  return { orderSql: order, limitOffset };
}

// ---------------------------------------------------------------------------
// Model delegate
// ---------------------------------------------------------------------------

function makeDelegate(sqlite: DatabaseSync, m: ModelMeta) {
  const t = `"${m.table}"`;

  async function findMany(args: Record<string, any> = {}): Promise<Record<string, any>[]> {
    const params: SQLInputValue[] = [];
    let sql = `SELECT * FROM ${t}`;
    const w = buildWhere(m, args.where, params);
    if (w) sql += ` WHERE ${w}`;
    const paging = buildPaging(buildOrderBy(m, args.orderBy), args);
    if (paging.orderSql) sql += ` ORDER BY ${paging.orderSql}`;
    sql += paging.limitOffset;
    const rows = sqlite.prepare(sql).all(...params) as Record<string, any>[];
    return rows.map(r => applySelect(mapRow(m, r), args.select));
  }

  async function findFirst(args: Record<string, any> = {}): Promise<Record<string, any> | null> {
    const rows = await findMany({ ...args, take: 1 });
    return rows.length > 0 ? rows[0] : null;
  }

  async function findUnique(args: Record<string, any> = {}): Promise<Record<string, any> | null> {
    // Unique-where (incl. flattened composite keys) still resolves to one row.
    const rows = await findMany({ where: args.where, select: args.select, take: 1 });
    return rows.length > 0 ? rows[0] : null;
  }

  async function create(args: Record<string, any>): Promise<Record<string, any>> {
    const data = stripUndefined({ ...(args.data || {}) });
    if (data.id === undefined && m.columns.has('id')) data.id = randomUUID();
    for (const col of ['createdAt', 'updatedAt', 'verifiedAt', 'sentAt']) {
      if (m.columns.has(col) && data[col] === undefined) data[col] = nowIso();
    }
    for (const [col, getDefault] of Object.entries(m.defaults)) {
      if (data[col] === undefined) data[col] = getDefault();
    }
    const cols = Object.keys(data).filter(c => m.columns.has(c));
    const sql = `INSERT INTO ${t} (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
    sqlite.prepare(sql).run(...cols.map(c => toDb(m, c, data[c])));
    const row = sqlite.prepare(`SELECT * FROM ${t} WHERE "id" IS ?`).get(data.id) as Record<string, any>;
    return mapRow(m, row);
  }

  async function update(args: Record<string, any>): Promise<Record<string, any>> {
    const existing = await findFirst({ where: args.where });
    if (!existing) throw notFoundError(m.table);
    assertUniqueMatch(sqlite, m, args.where);
    const data = stripUndefined({ ...(args.data || {}) });
    const sets: string[] = [];
    const params: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (!m.columns.has(k) || k === 'id') continue;
      sets.push(`"${k}" = ?`);
      params.push(toDb(m, k, v));
    }
    if (m.columns.has('updatedAt')) {
      sets.push(`"updatedAt" = ?`);
      params.push(nowIso());
    }
    if (sets.length > 0) {
      const wParams: SQLInputValue[] = [];
      const w = buildWhere(m, args.where, wParams);
      sqlite.prepare(`UPDATE ${t} SET ${sets.join(', ')} WHERE ${w || '1 = 1'}`).run(...params, ...wParams);
    }
    const row = sqlite.prepare(`SELECT * FROM ${t} WHERE "id" IS ?`).get(existing.id) as Record<string, any>;
    return mapRow(m, row);
  }

  async function updateMany(args: Record<string, any>): Promise<{ count: number }> {
    const data = stripUndefined({ ...(args.data || {}) });
    const sets: string[] = [];
    const params: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (!m.columns.has(k) || k === 'id') continue;
      sets.push(`"${k}" = ?`);
      params.push(toDb(m, k, v));
    }
    if (m.columns.has('updatedAt')) {
      sets.push(`"updatedAt" = ?`);
      params.push(nowIso());
    }
    if (sets.length === 0) return { count: 0 };
    const wParams: SQLInputValue[] = [];
    const w = buildWhere(m, args.where, wParams);
    const info = sqlite.prepare(`UPDATE ${t} SET ${sets.join(', ')}${w ? ` WHERE ${w}` : ''}`).run(...params, ...wParams);
    return { count: Number(info.changes) };
  }

  async function upsert(args: Record<string, any>): Promise<Record<string, any>> {
    // Atomic find-then-act: IMMEDIATE lock serializes concurrent upserts.
    sqlite.exec('BEGIN IMMEDIATE');
    try {
      const existing = await findFirst({ where: args.where });
      const result = existing
        ? await update({ where: { id: existing.id }, data: args.update || {} })
        : await create({ data: args.create || {} });
      sqlite.exec('COMMIT');
      return result;
    } catch (err) {
      try { sqlite.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw err;
    }
  }

  async function remove(args: Record<string, any>): Promise<Record<string, any>> {
    const existing = await findFirst({ where: args.where });
    if (!existing) throw notFoundError(m.table);
    assertUniqueMatch(sqlite, m, args.where);
    const wParams: SQLInputValue[] = [];
    const w = buildWhere(m, args.where, wParams);
    sqlite.prepare(`DELETE FROM ${t} WHERE ${w || '1 = 1'}`).run(...wParams);
    return existing;
  }

  async function count(args: Record<string, any> = {}): Promise<number> {
    const params: SQLInputValue[] = [];
    let sql = `SELECT COUNT(*) AS n FROM ${t}`;
    const w = buildWhere(m, args.where, params);
    if (w) sql += ` WHERE ${w}`;
    const row = sqlite.prepare(sql).get(...params) as { n: number };
    return Number(row.n);
  }

  async function groupBy(args: Record<string, any>): Promise<Record<string, any>[]> {
    const by: string[] = (Array.isArray(args.by) ? args.by : [args.by]).filter((b: string) => m.columns.has(b));
    if (by.length === 0) throw new Error('[db-shim] groupBy requires at least one valid `by` field');
    const params: SQLInputValue[] = [];
    let sql = `SELECT ${by.map(b => `"${b}"`).join(', ')}, COUNT(*) AS __count FROM ${t}`;
    const w = buildWhere(m, args.where, params);
    if (w) sql += ` WHERE ${w}`;
    sql += ` GROUP BY ${by.map(b => `"${b}"`).join(', ')}`;
    const paging = buildPaging(buildOrderBy(m, args.orderBy), args);
    if (paging.orderSql) sql += ` ORDER BY ${paging.orderSql}`;
    sql += paging.limitOffset;
    const rows = sqlite.prepare(sql).all(...params) as Record<string, any>[];
    return rows.map(r => {
      const out: Record<string, any> = {};
      for (const b of by) out[b] = fromDb(m, b, r[b]);
      if (args._count) {
        if (args._count === true) out._count = Number(r.__count);
        else {
          out._count = {};
          for (const [k, v] of Object.entries(args._count)) {
            if (v) out._count[k] = Number(r.__count);
          }
        }
      }
      return out;
    });
  }

  return {
    findMany,
    findFirst,
    findUnique,
    create,
    update,
    updateMany,
    upsert,
    delete: remove,
    count,
    groupBy,
  };
}

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  const match = url.match(/^file:(.+)$/);
  if (!match) {
    throw new Error(`[db-shim] Only file: SQLite URLs are supported, got: ${url}`);
  }
  const p = match[1];
  if (path.isAbsolute(p)) return p;
  // Match Prisma semantics: relative SQLite paths resolve from the schema dir.
  return path.join(process.cwd(), 'prisma', p);
}

export function createShimDb() {
  const file = resolveDbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new DatabaseSync(file);
  try {
    for (const stmt of DDL) sqlite.exec(stmt);
  } finally {
    // keep connection open for the process lifetime (DatabaseSync is cheap)
  }
  const delegates: Record<string, unknown> = {};
  for (const [name, m] of Object.entries(METAS)) {
    delegates[name] = makeDelegate(sqlite, m);
  }
  return new Proxy(delegates, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'then') return undefined; // keep `await db` from throwing
      if (prop in target) return (target as Record<string, unknown>)[prop];
      throw new Error(`[db-shim] Unknown model "${prop}" (not in Prisma schema)`);
    },
  });
}
