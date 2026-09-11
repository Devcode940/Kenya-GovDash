import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';

// GET — list resources (auth required for unpublished=true filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    const kind = searchParams.get('kind');
    const publishedOnly = searchParams.get('published') !== 'false';

    const where: Record<string, unknown> = {};
    if (source) where.source = source;
    if (kind) where.kind = kind;
    if (publishedOnly) where.published = true;

    const resources = await db.resource.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ resources, total: resources.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// POST — create a link or video resource (AUTH REQUIRED)
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const source = (body.source || '').trim();
    const title = (body.title || '').trim();
    const url = (body.url || '').trim();

    if (!source || !title || !url) return NextResponse.json({ error: 'Source, title, and URL are required' }, { status: 400 });
    const validSources = ['OAG', 'CoB', 'CoG', 'EACC', 'TI-Kenya', 'Other'];
    if (!validSources.includes(source)) return NextResponse.json({ error: `Invalid source` }, { status: 400 });
    try { new URL(url); } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }); }

    let kind: 'document' | 'video' | 'link' = body.kind || 'link';
    if (!body.kind) {
      if (url.includes('youtube.com') || url.includes('vimeo.com') || url.match(/\.(mp4|webm|ogg|mov)$/i)) kind = 'video';
      else if (url.match(/\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf)$/i)) kind = 'document';
      else kind = 'link';
    }

    let finalUrl = url;
    let thumbnailUrl = body.thumbnailUrl || null;
    const ytId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/)?.[1];
    const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
    if (kind === 'video') {
      if (ytId) { finalUrl = `https://www.youtube.com/embed/${ytId}`; if (!thumbnailUrl) thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }
      else if (vimeoId) { finalUrl = `https://player.vimeo.com/video/${vimeoId}`; }
    }

    const resource = await db.resource.create({
      data: { source, kind, title, description: body.description?.trim() || null, url: finalUrl, thumbnailUrl, durationLabel: body.durationLabel || null, fiscalYear: body.fiscalYear?.trim() || null, countyName: body.countyName?.trim() || null, reportType: body.reportType?.trim() || null, published: body.published ?? true, sortOrder: body.sortOrder || 0 },
    });

    return NextResponse.json({ resource, message: `Added ${kind}: ${title}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

// DELETE (AUTH REQUIRED)
export async function DELETE(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Resource id is required' }, { status: 400 });

    const resource = await db.resource.findUnique({ where: { id } });
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    if (resource.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', resource.url);
      try { await unlink(filePath); } catch { /* file may already be gone */ }
    }

    await db.resource.delete({ where: { id } });
    return NextResponse.json({ message: `Deleted: ${resource.title}`, deletedId: id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

// PATCH — toggle published (AUTH REQUIRED)
export async function PATCH(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, published, sortOrder } = body;
    if (!id) return NextResponse.json({ error: 'Resource id is required' }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (typeof published === 'boolean') update.published = published;
    if (typeof sortOrder === 'number') update.sortOrder = sortOrder;
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

    const resource = await db.resource.update({ where: { id }, data: update });
    return NextResponse.json({ resource, message: 'Updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
