import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all feedback (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const representativeId = searchParams.get('representativeId');
    const countyName = searchParams.get('countyName');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, string | undefined> = {};
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

// POST: Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Category, title, and description are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Complaint', 'Suggestion', 'Observation', 'Question', 'Appreciation'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate title length
    if (body.title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be under 200 characters' },
        { status: 400 }
      );
    }

    // Validate description length
    if (body.description.length > 5000) {
      return NextResponse.json(
        { error: 'Description must be under 5000 characters' },
        { status: 400 }
      );
    }

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
        isAnonymous: body.isAnonymous ?? true,
        status: 'Submitted',
        priority: body.priority || 'Normal',
        sourceUrl: body.sourceUrl || null,
      },
    });

    return NextResponse.json({ feedback, message: 'Feedback submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
