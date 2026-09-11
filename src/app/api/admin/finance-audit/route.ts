import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import {
  parseOr400,
  searchParamsToObject,
  snapshotQuerySchema,
  snapshotCreateSchema,
  snapshotUpdateSchema,
  idParamSchema,
} from '@/lib/validators';

// GET /api/admin/finance-audit — list all snapshots (auth required for unpublished)
export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  const parsed = parseOr400(snapshotQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { level, countyName, fiscalYear, source, published } = parsed.data;
  const publishedOnly = !authed && published !== 'false';

  const where: Record<string, unknown> = {};
  if (level) where.level = level;
  if (countyName) where.countyName = countyName;
  if (fiscalYear) where.fiscalYear = fiscalYear;
  if (source) where.source = source;
  if (publishedOnly) where.published = true;

  const snapshots = await db.financeAuditSnapshot.findMany({
    where,
    orderBy: [{ fiscalYear: 'desc' }, { level: 'asc' }, { countyName: 'asc' }],
    take: 200,
  });

  return NextResponse.json({ snapshots, total: snapshots.length });
}

// POST — create new snapshot (auth required)
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(snapshotCreateSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const body = parsed.data;

    const snapshot = await db.financeAuditSnapshot.create({
      data: {
        fiscalYear: body.fiscalYear,
        level: body.level,
        countyName: body.level === 'national' ? null : (body.countyName ?? null),
        source: body.source,
        approvedBudget: body.approvedBudget ?? null,
        supplementaryBudget: body.supplementaryBudget ?? null,
        actualExpenditure: body.actualExpenditure ?? null,
        recurrentExpenditure: body.recurrentExpenditure ?? null,
        developmentExpenditure: body.developmentExpenditure ?? null,
        equitableShare: body.equitableShare ?? null,
        ownSourceRevenue: body.ownSourceRevenue ?? null,
        osrTarget: body.osrTarget ?? null,
        conditionalGrants: body.conditionalGrants ?? null,
        overallAbsorption: body.overallAbsorption ?? null,
        recurrentAbsorption: body.recurrentAbsorption ?? null,
        developmentAbsorption: body.developmentAbsorption ?? null,
        auditOpinion: body.auditOpinion ?? null,
        auditSource: body.auditSource ?? null,
        auditUrl: body.auditUrl ?? null,
        pendingBills: body.pendingBills ?? null,
        pendingBillsStart: body.pendingBillsStart ?? null,
        totalDebt: body.totalDebt ?? null,
        domesticDebt: body.domesticDebt ?? null,
        foreignDebt: body.foreignDebt ?? null,
        complianceScore: body.complianceScore ?? null,
        notes: body.notes ?? null,
        sourceUrl: body.sourceUrl ?? null,
        published: body.published,
      },
    });

    return NextResponse.json({ snapshot, message: 'Snapshot created' }, { status: 201 });
  } catch (error) {
    console.error('Finance audit create error:', error);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}

// PATCH — update existing
export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(snapshotUpdateSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { id, published, ...fields } = parsed.data;

    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) update[key] = value;
    }
    if (typeof published === 'boolean') update.published = published;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const snapshot = await db.financeAuditSnapshot.update({
      where: { id },
      data: update,
    });

    return NextResponse.json({ snapshot, message: 'Updated' });
  } catch (error) {
    console.error('Finance audit update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = parseOr400(idParamSchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await db.financeAuditSnapshot.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
