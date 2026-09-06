import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

const ALLOWED_MIME_TYPES = [
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'application/rtf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/mp4', 'audio/ogg',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

// Magic bytes for content validation (prevents MIME type spoofing)
const MAGIC_BYTES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],           // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF],                       // JPEG
  'image/png': [0x89, 0x50, 0x4E, 0x47],                 // PNG
  'image/gif': [0x47, 0x49, 0x46, 0x38],                 // GIF8
  'video/mp4': [0x66, 0x74, 0x79, 0x70],                // ftyp (at offset 4)
};

function detectKindFromMime(mime: string): 'document' | 'video' | 'link' {
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'video';
  return 'document';
}

function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Validate file content using magic bytes (prevents MIME type spoofing)
function validateMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  const expected = MAGIC_BYTES[declaredMime];
  if (!expected) return true; // No magic bytes check for this type — allow
  // For MP4, magic bytes "ftyp" are at offset 4
  const offset = declaredMime === 'video/mp4' ? 4 : 0;
  for (let i = 0; i < expected.length; i++) {
    if (buffer[offset + i] !== expected[i]) return false;
  }
  return true;
}

// AUTH REQUIRED — all admin upload operations require authentication
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const source = (formData.get('source') as string || '').trim();
    const title = (formData.get('title') as string || '').trim();

    if (!source) return NextResponse.json({ error: 'Source is required' }, { status: 400 });
    const validSources = ['OAG', 'CoB', 'EACC', 'TI-Kenya', 'Other'];
    if (!validSources.includes(source)) return NextResponse.json({ error: `Invalid source` }, { status: 400 });

    // Collect files (single or bulk)
    const allFiles: File[] = [];
    for (const f of formData.getAll('files')) { if (f instanceof File && f.size > 0) allFiles.push(f); }
    for (const f of formData.getAll('file')) { if (f instanceof File && f.size > 0) allFiles.push(f); }
    const seen = new Set<string>();
    const uniqueFiles = allFiles.filter(f => {
      const key = `${f.name}-${f.size}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueFiles.length === 0) return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    if (uniqueFiles.length === 1 && !title) return NextResponse.json({ error: 'Title is required for single uploads' }, { status: 400 });

    const subdir = source.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const results: Array<{ success: boolean; fileName: string; resource?: unknown; error?: string; message?: string }> = [];

    for (const file of uniqueFiles) {
      try {
        if (file.size > MAX_FILE_SIZE) { results.push({ success: false, fileName: file.name, error: `File too large` }); continue; }

        const mimeType = file.type || 'application/octet-stream';
        const isAllowed = ALLOWED_MIME_TYPES.includes(mimeType) ||
          mimeType.startsWith('image/') || mimeType.startsWith('video/') ||
          mimeType.startsWith('audio/') || mimeType.startsWith('application/');
        if (!isAllowed) { results.push({ success: false, fileName: file.name, error: `Unsupported type: ${mimeType}` }); continue; }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Magic bytes validation — prevents spoofed MIME types
        if (!validateMagicBytes(fileBuffer, mimeType)) {
          results.push({ success: false, fileName: file.name, error: 'File content does not match declared type' });
          continue;
        }

        const safeName = sanitizeFileName(file.name);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, fileBuffer);

        const publicUrl = `/uploads/${subdir}/${uniqueName}`;
        const kind = detectKindFromMime(mimeType);
        const fileTitle = title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const resource = await db.resource.create({
          data: { source, kind, title: fileTitle, description: (formData.get('description') as string || '').trim() || null, url: publicUrl, fileName: file.name, fileSize: file.size, mimeType, fiscalYear: (formData.get('fiscalYear') as string || '').trim() || null, countyName: (formData.get('countyName') as string || '').trim() || null, reportType: (formData.get('reportType') as string || '').trim() || null, published: true },
        });

        results.push({ success: true, fileName: file.name, resource, message: `Uploaded ${file.name} as ${kind}` });
      } catch (fileErr) {
        results.push({ success: false, fileName: file.name, error: fileErr instanceof Error ? fileErr.message : 'Unknown error' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    if (successCount === 0) return NextResponse.json({ error: 'All uploads failed', results }, { status: 500 });

    return NextResponse.json({ success: true, message: `Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}`, results, totalUploaded: successCount, totalFailed: failCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}
