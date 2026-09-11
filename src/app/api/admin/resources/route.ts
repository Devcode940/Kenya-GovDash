import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';
import {
  parseOr400,
  searchParamsToObject,
  resourceQuerySchema,
  resourceCreateSchema,
  resourceUpdateSchema,
  idParamSchema,
} from '@/lib/validators';

// GET — list resources (auth required for unpublished=true filter)
export async function GET(request: NextRequest) {
  try {
    const parsed = parseOr400(resourceQuerySchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { source, kind, published } = parsed.data;
    const publishedOnly = published !== 'false';

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
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = parseOr400(resourceCreateSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const body = parsed.data;
    const { source, title, url } = body;

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
      data: {
        source,
        kind,
        title,
        description: body.description || null,
        url: finalUrl,
        thumbnailUrl,
        durationLabel: body.durationLabel || null,
        fiscalYear: body.fiscalYear || null,
        countyName: body.countyName || null,
        reportType: body.reportType || null,
        published: body.published,
        sortOrder: body.sortOrder,
      },
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
    const parsed = parseOr400(idParamSchema, searchParamsToObject(request.nextUrl.searchParams));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { id } = parsed.data;

    const resource = await db.resource.findUnique({ where: { id } });
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    if (resource.url.startsWith('/uploads/')) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const resolved = path.resolve(path.join(process.cwd(), 'public', resource.url));
      // Containment: refuse deletions escaping the uploads directory.
      if (resolved.startsWith(uploadsDir + path.sep)) {
        try { await unlink(resolved); } catch { /* file may already be gone */ }
      }
    }

    await db.resource.delete({ where: { id } });
    return NextResponse.json({ message: `Deleted: ${resource.title}`, deletedId: id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

// PATCH — toggle published / sort order (AUTH REQUIRED)
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
    const parsed = parseOr400(resourceUpdateSchema, rawBody);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { id, published, sortOrder } = parsed.data;

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
