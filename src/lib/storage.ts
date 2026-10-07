/**
 * Upload storage abstraction.
 * Local: upload/ and public/uploads/
 * Vercel: ephemeral disk — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for durable PDFs.
 */

export const LOCAL_UPLOAD_DIR = 'upload';
export const LOCAL_PUBLIC_UPLOADS = 'public/uploads';
export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'govdash-uploads';

export function isRemoteStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function storageMode(): 'local' | 'supabase' {
  return isRemoteStorageConfigured() ? 'supabase' : 'local';
}

export function remotePublicUrl(objectPath: string): string | null {
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  const clean = objectPath.replace(/^\//, '');
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${SUPABASE_BUCKET}/${clean}`;
}

export function storageStatus() {
  return {
    mode: storageMode(),
    localUploadDir: LOCAL_UPLOAD_DIR,
    localPublicUploads: LOCAL_PUBLIC_UPLOADS,
    supabaseBucket: isRemoteStorageConfigured() ? SUPABASE_BUCKET : null,
    note:
      storageMode() === 'local'
        ? 'On Vercel, local disk does not persist across deploys. Configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for durable PDFs.'
        : 'Remote Supabase Storage configured.',
  };
}
