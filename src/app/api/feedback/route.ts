import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIP, rateLimitResponse, recordAttempt } from '@/lib/auth';
import { parseOr400, searchParamsToObject, feedbackQuerySchema, feedbackCreateSchema } from '@/lib/validators';

// GET: List all feedback (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const parsed = parseOr400(feedbackQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { representativeId, countyName, category, status, limit } = parsed.data;

    const where: Record<string, string> = {};
    if (representativeId) where.representativeId = representativeId;
    if (countyName) where.countyName = countyName;
    if (category) where.category = category;
    if (status) where.status = status;

    const feedbacks = await db.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Count by category
    const categoryCounts = await db.feedback.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    // Count by status
    const statusCounts = await db.feedback.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json({
      feedbacks,
      stats: {
        total: await db.feedback.count(),
        byCategory: categoryCounts.map(c => ({ category: c.category, count: c._count.category })),
        byStatus: statusCounts.map(s => ({ status: s.status, count: s._count.status })),
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// POST: Submit new feedback (rate-limited per IP)
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rate = checkRateLimit(ip, 'feedback');
    if (!rate.allowed) return rateLimitResponse(rate.resetAt, 'feedback');
    recordAttempt(ip, 'feedback');

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(feedbackCreateSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const body = parsed.data;

    const feedback = await db.feedback.create({
      data: {
        representativeId: body.representativeId || null,
        countyName: body.countyName || null,
        category: body.category,
        title: body.title,
        description: body.description,
        submitterName: body.isAnonymous ? null : (body.submitterName || null),
        submitterEmail: body.isAnonymous ? null : (body.submitterEmail || null),
        submitterCounty: body.submitterCounty || null,
        isAnonymous: body.isAnonymous,
        status: 'Submitted',
        priority: body.priority,
        sourceUrl: body.sourceUrl || null,
      },
    });

    return NextResponse.json({ feedback, message: 'Feedback submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
