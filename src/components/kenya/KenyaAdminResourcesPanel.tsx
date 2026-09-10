'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Video,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Play,
  Library,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ==================== TYPES ====================

interface Resource {
  id: string;
  source: string;
  kind: 'document' | 'video' | 'link';
  title: string;
  description: string | null;
  url: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
  durationLabel: string | null;
  fiscalYear: string | null;
  countyName: string | null;
  reportType: string | null;
  createdAt: string;
}

interface KenyaAdminResourcesPanelProps {
  source: 'OAG' | 'CoB' | 'EACC' | 'TI-Kenya' | 'Other';
  limit?: number;
}

// ==================== HELPERS ====================

/** Returns the embed-friendly URL for a video resource. */
function getVideoEmbedUrl(resource: Resource): string | null {
  const url = resource.url;
  // Already an embed URL (YouTube) — the API normalizes YouTube links to /embed/ on save
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('player.vimeo.com/video/')) return url;
  // YouTube watch / youtu.be / shorts — extract id and build embed URL
  const ytId = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  )?.[1];
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  // Vimeo watch URL
  const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  // Locally uploaded video files — served via HTML5 <video> tag, not an iframe
  if (url.startsWith('/uploads/') || /\.(mp4|webm|ogg|mov)$/i.test(url)) return null;
  // Unknown — fall back to the raw URL (will be loaded in an iframe as a last resort)
  return url;
}

function isLocalUploadVideo(resource: Resource): boolean {
  return resource.url.startsWith('/uploads/') || /\.(mp4|webm|ogg|mov)$/i.test(resource.url);
}

function formatFileSize(bytes: number | null): string | null {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

const SOURCE_LABELS: Record<KenyaAdminResourcesPanelProps['source'], string> = {
  OAG: 'Office of the Auditor-General',
  CoB: 'Controller of Budget',
  EACC: 'Ethics and Anti-Corruption Commission',
  'TI-Kenya': 'Transparency International Kenya',
  Other: 'Other Sources',
};

// ==================== VIDEO PLAYER DIALOG ====================

function VideoPlayerDialog({
  resource,
  open,
  onOpenChange,
}: {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!resource) return null;

  const embedUrl = getVideoEmbedUrl(resource);
  const isLocalVideo = isLocalUploadVideo(resource);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <Video className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{resource.title}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Video player for {resource.title}. Press Escape to close.
          </DialogDescription>
        </DialogHeader>

        <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
          {isLocalVideo ? (
            <video
              src={resource.url}
              controls
              autoPlay
              className="h-full w-full"
              poster={resource.thumbnailUrl || undefined}
            >
              <track kind="captions" />
            </video>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={resource.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <AlertCircle className="h-5 w-4 mr-2" />
              <span className="text-sm">Unable to embed this video.</span>
            </div>
          )}
        </div>

        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{resource.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {resource.fiscalYear && <Badge variant="secondary">FY {resource.fiscalYear}</Badge>}
          {resource.countyName && <Badge variant="outline">{resource.countyName}</Badge>}
          {resource.durationLabel && <span>{resource.durationLabel}</span>}
          <span>Added {formatDate(resource.createdAt)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== VIDEO GRID ====================

function VideoGrid({
  videos,
  onPlay,
}: {
  videos: Resource[];
  onPlay: (resource: Resource) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {videos.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onPlay(v)}
          className="group relative overflow-hidden rounded-md border bg-muted/40 text-left transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`Play video: ${v.title}`}
        >
          <div className="relative aspect-video w-full overflow-hidden bg-black/5">
            {v.thumbnailUrl ? (
              <img
                src={v.thumbnailUrl}
                alt={v.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition group-hover:scale-110">
                <Play className="h-4 w-4 translate-x-0.5 fill-current" />
              </span>
            </div>
            {v.durationLabel && (
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {v.durationLabel}
              </span>
            )}
          </div>
          <div className="p-2">
            <p className="line-clamp-2 text-xs font-medium leading-snug">{v.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
              {v.fiscalYear && <span>FY {v.fiscalYear}</span>}
              {v.countyName && (
                <>
                  <span aria-hidden>·</span>
                  <span>{v.countyName}</span>
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ==================== DOCUMENT LIST ====================

function DocumentList({ documents }: { documents: Resource[] }) {
  return (
    <ul className="space-y-2">
      {documents.map((d) => {
        const isUpload = d.url.startsWith('/uploads/');
        const sizeLabel = formatFileSize(d.fileSize);
        return (
          <li key={d.id}>
            <a
              href={d.url}
              target={isUpload ? '_blank' : '_blank'}
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-md border bg-muted/20 p-2.5 transition hover:border-primary/50 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-medium leading-snug">{d.title}</p>
                {d.description && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {d.description}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  {d.reportType && <Badge variant="secondary">{d.reportType}</Badge>}
                  {d.fiscalYear && <span>FY {d.fiscalYear}</span>}
                  {d.countyName && <span>· {d.countyName}</span>}
                  {sizeLabel && <span>· {sizeLabel}</span>}
                  {d.fileName && !sizeLabel && (
                    <span className="truncate">· {d.fileName}</span>
                  )}
                </div>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// ==================== LINK LIST ====================

function LinkList({ links }: { links: Resource[] }) {
  return (
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.id}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 rounded-md border bg-muted/20 p-2.5 transition hover:border-primary/50 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-medium leading-snug">{l.title}</p>
              {l.description && (
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {l.description}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                {l.reportType && <Badge variant="secondary">{l.reportType}</Badge>}
                {l.fiscalYear && <span>FY {l.fiscalYear}</span>}
                {l.countyName && <span>· {l.countyName}</span>}
                <span className="truncate">· {l.url}</span>
              </div>
            </div>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ==================== MAIN COMPONENT ====================

export function KenyaAdminResourcesPanel({ source, limit }: KenyaAdminResourcesPanelProps) {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  // Fetch on mount using AbortController + Promise.resolve() defer
  // to comply with the setState-in-effect lint rule.
  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    // Defer state updates out of the synchronous effect body
    Promise.resolve()
      .then(async () => {
        try {
          const params = new URLSearchParams({
            source,
            published: 'true',
          });
          if (limit) params.set('limit', String(limit));

          const res = await fetch(`/api/admin/resources?${params.toString()}`, {
            signal: controller.signal,
          });
          if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
          }
          const data = (await res.json()) as { resources?: Resource[] };
          const list = Array.isArray(data.resources) ? data.resources : [];
          if (cancelled) return;
          setResources(list);
          setError(null);
        } catch (err) {
          if (cancelled || controller.signal.aborted) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setError('Failed to load resources');
          setResources([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load resources');
          setResources([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [source, limit]);

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Library className="h-4 w-4 text-primary" />
            {SOURCE_LABELS[source]} Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Loading resources…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state — still render the card with an inline notice so users know
  // why the section is missing context, but only if there is no cached data.
  if (error && (!resources || resources.length === 0)) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Library className="h-4 w-4 text-primary" />
            {SOURCE_LABELS[source]} Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 p-3 text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Auto-hide when no resources exist for the source
  if (!resources || resources.length === 0) {
    return null;
  }

  const videos = resources.filter((r) => r.kind === 'video');
  const documents = resources.filter((r) => r.kind === 'document');
  const links = resources.filter((r) => r.kind === 'link');

  const openVideo = (resource: Resource) => {
    setActiveVideo(resource);
    setVideoOpen(true);
  };

  const total = resources.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Library className="h-4 w-4 text-primary" />
            {SOURCE_LABELS[source]} Resources
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {total} item{total === 1 ? '' : 's'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* VIDEOS */}
        {videos.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
              <Video className="h-3.5 w-3.5 text-primary" />
              <span>Videos</span>
              <Badge variant="outline" className="text-[10px]">
                {videos.length}
              </Badge>
            </div>
            <VideoGrid videos={videos} onPlay={openVideo} />
          </section>
        )}

        {/* DOCUMENTS */}
        {documents.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Documents</span>
              <Badge variant="outline" className="text-[10px]">
                {documents.length}
              </Badge>
            </div>
            <DocumentList documents={documents} />
          </section>
        )}

        {/* LINKS */}
        {links.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
              <LinkIcon className="h-3.5 w-3.5 text-primary" />
              <span>Links</span>
              <Badge variant="outline" className="text-[10px]">
                {links.length}
              </Badge>
            </div>
            <LinkList links={links} />
          </section>
        )}

        {/* Footnote */}
        <p className="pt-1 text-[10px] italic text-muted-foreground">
          Curated by the platform administrators from official {SOURCE_LABELS[source]} publications.
        </p>
      </CardContent>

      <VideoPlayerDialog
        resource={activeVideo}
        open={videoOpen}
        onOpenChange={setVideoOpen}
      />
    </Card>
  );
}

export default KenyaAdminResourcesPanel;
