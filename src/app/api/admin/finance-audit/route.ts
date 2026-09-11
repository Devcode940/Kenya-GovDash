import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// GET /api/admin/finance-audit — list all snapshots (auth required for unpublished)
export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  const searchParams = request.nextUrl.searchParams;
  const level = searchParams.get('level');
  const countyName = searchParams.get('countyName');
  const fiscalYear = searchParams.get('fiscalYear');
  const source = searchParams.get('source');
  const publishedOnly = !authed && searchParams.get('published') !== 'false';

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
    const body = await request.json();
    const { fiscalYear, level, countyName, source } = body;
    if (!fiscalYear || !level || !source) {
      return NextResponse.json({ error: 'fiscalYear, level, and source are required' }, { status: 400 });
    }
    const validSources = ['OAG', 'CoB', 'CoG', 'KNBS', 'Other'];
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }
    if (level === 'county' && !countyName) {
      return NextResponse.json({ error: 'countyName required for county-level snapshots' }, { status: 400 });
    }

    const snapshot = await db.financeAuditSnapshot.create({
      data: {
        fiscalYear,
        level,
        countyName: level === 'national' ? null : (countyName || null),
        source,
        approvedBudget: body.approvedBudget || null,
        supplementaryBudget: body.supplementaryBudget || null,
        actualExpenditure: body.actualExpenditure || null,
        recurrentExpenditure: body.recurrentExpenditure || null,
        developmentExpenditure: body.developmentExpenditure || null,
        equitableShare: body.equitableShare || null,
        ownSourceRevenue: body.ownSourceRevenue || null,
        osrTarget: body.osrTarget || null,
        conditionalGrants: body.conditionalGrants || null,
        overallAbsorption: body.overallAbsorption || null,
        recurrentAbsorption: body.recurrentAbsorption || null,
        developmentAbsorption: body.developmentAbsorption || null,
        auditOpinion: body.auditOpinion || null,
        auditSource: body.auditSource || null,
        auditUrl: body.auditUrl || null,
        pendingBills: body.pendingBills || null,
        pendingBillsStart: body.pendingBillsStart || null,
        totalDebt: body.totalDebt || null,
        domesticDebt: body.domesticDebt || null,
        foreignDebt: body.foreignDebt || null,
        complianceScore: body.complianceScore || null,
        notes: body.notes || null,
        sourceUrl: body.sourceUrl || null,
        published: body.published ?? true,
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
    const body = await request.json();
    const { id, published, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const update: Record<string, unknown> = {};
    for (const key of [
      'approvedBudget', 'supplementaryBudget', 'actualExpenditure', 'recurrentExpenditure', 'developmentExpenditure',
      'equitableShare', 'ownSourceRevenue', 'osrTarget', 'conditionalGrants',
      'overallAbsorption', 'recurrentAbsorption', 'developmentAbsorption',
      'auditOpinion', 'auditSource', 'auditUrl',
      'pendingBills', 'pendingBillsStart',
      'totalDebt', 'domesticDebt', 'foreignDebt',
      'complianceScore', 'notes', 'sourceUrl',
    ]) {
      if (fields[key] !== undefined) update[key] = fields[key] === '' ? null : fields[key];
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
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await db.financeAuditSnapshot.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
