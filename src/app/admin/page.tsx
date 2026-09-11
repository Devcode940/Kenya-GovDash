'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Shield,
  Upload,
  Link as LinkIcon,
  Video,
  FileText,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Library,
  FileVideo,
  Search,
  RefreshCw,
  ArrowUpDown,
  Lock,
  X,
  MoreHorizontal,
  Landmark,
  TrendingUp,
} from 'lucide-react';
import { FinanceAuditPanel } from '@/components/admin/FinanceAuditPanel';
import { CecmVerificationPanel } from '@/components/admin/CecmVerificationPanel';

type AdminSection = 'resources' | 'finance_audit' | 'cecm_verify';

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
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type SourceType = 'OAG' | 'CoB' | 'CoG' | 'EACC' | 'TI-Kenya' | 'Other';

interface RefreshStatus {
  state: 'idle' | 'running' | 'success' | 'error';
  message: string;
  summary: string[];
  ranAt: string | null;
}

// ==================== CONSTANTS ====================

const SOURCES: SourceType[] = ['OAG', 'CoB', 'CoG', 'EACC', 'TI-Kenya', 'Other'];

const SOURCE_META: Record<
  SourceType,
  {
    label: string;
    description: string;
    badgeClass: string;
    buttonClass: string;
    icon: React.ReactNode;
  }
> = {
  OAG: {
    label: 'OAG',
    description: 'Office of the Auditor-General',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
    buttonClass: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900',
    icon: <Shield className="h-4 w-4" />,
  },
  CoB: {
    label: 'CoB',
    description: 'Controller of Budget',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    buttonClass: 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900',
    icon: <FileText className="h-4 w-4" />,
  },
  CoG: {
    label: 'CoG',
    description: 'Council of Governors',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800',
    buttonClass: 'border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900',
    icon: <Landmark className="h-4 w-4" />,
  },
  EACC: {
    label: 'EACC',
    description: 'Ethics and Anti-Corruption Commission',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
    buttonClass: 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  'TI-Kenya': {
    label: 'TI-Kenya',
    description: 'Transparency International Kenya',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800',
    buttonClass: 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200 dark:hover:bg-teal-900',
    icon: <Search className="h-4 w-4" />,
  },
  Other: {
    label: 'Other',
    description: 'Other Sources & Civil Society',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    buttonClass: 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    icon: <MoreHorizontal className="h-4 w-4" />,
  },
};

const FISCAL_YEARS = [
  '2022/2023',
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
];

const REPORT_TYPES = [
  'Audit Report',
  'Budget Review',
  'Special Report',
  'Annual Report',
  'Investigation Report',
  'Press Statement',
  'Briefing Paper',
  'Other',
];

const COUNTIES = [
  'National',
  'Nairobi City',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Kiambu',
  'Kakamega',
  'Meru',
  'Machakos',
  'Turkana',
  'Other',
];

// ==================== HELPERS ====================

function getVideoEmbedUrl(resource: Resource): string | null {
  const url = resource.url;
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('player.vimeo.com/video/')) return url;
  const ytId = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  )?.[1];
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  if (url.startsWith('/uploads/') || /\.(mp4|webm|ogg|mov)$/i.test(url)) return null;
  return url;
}

function isLocalUploadVideo(resource: Resource): boolean {
  return resource.url.startsWith('/uploads/') || /\.(mp4|webm|ogg|mov)$/i.test(resource.url);
}

function isImageResource(resource: Resource): boolean {
  return (
    (!!resource.mimeType && resource.mimeType.startsWith('image/')) ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(resource.url)
  );
}

function isPdfResource(resource: Resource): boolean {
  return (
    resource.mimeType === 'application/pdf' || /\.pdf$/i.test(resource.url)
  );
}

function detectLinkKind(url: string): 'video' | 'document' | 'link' {
  const u = url.toLowerCase();
  if (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    u.includes('vimeo.com') ||
    /\.(mp4|webm|ogg|mov)$/i.test(u)
  ) {
    return 'video';
  }
  if (/\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf)$/i.test(u)) {
    return 'document';
  }
  return 'link';
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

function getFileTypeBadge(mime: string | null, fileName: string | null): {
  label: string;
  className: string;
} {
  if (!mime) {
    if (fileName && /\.(pdf)$/i.test(fileName)) {
      return { label: 'PDF', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
    }
    return { label: 'FILE', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
  if (mime === 'application/pdf') {
    return { label: 'PDF', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
  }
  if (mime.startsWith('image/')) {
    return { label: 'IMAGE', className: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300' };
  }
  if (mime.startsWith('video/')) {
    return { label: 'VIDEO', className: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' };
  }
  if (mime.startsWith('audio/')) {
    return { label: 'AUDIO', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
  }
  if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return { label: 'XLSX', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
  }
  if (mime.includes('word') || mime.includes('document')) {
    return { label: 'DOCX', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' };
  }
  if (mime.includes('presentation') || mime.includes('powerpoint')) {
    return { label: 'PPTX', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' };
  }
  return { label: 'FILE', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
}

const KIND_BADGE: Record<Resource['kind'], { label: string; className: string; icon: React.ReactNode }> = {
  video: {
    label: 'Video',
    className: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800',
    icon: <Video className="h-3 w-3" />,
  },
  document: {
    label: 'Document',
    className: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    icon: <FileText className="h-3 w-3" />,
  },
  link: {
    label: 'Link',
    className: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-800',
    icon: <LinkIcon className="h-3 w-3" />,
  },
};

// ==================== AUTH GATE ====================

function AuthGate({
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password) {
        setError('Password is required');
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast({
            title: 'Access granted',
            description: 'Welcome to the Oversight Resources Admin.',
          });
          onAuthenticated();
        } else {
          const msg = data.error || 'Authentication failed';
          setError(msg);
          toast({
            title: 'Access denied',
            description: msg,
            variant: 'destructive',
          });
        }
      } catch {
        setError('Network error. Please try again.');
        toast({
          title: 'Network error',
          description: 'Unable to reach authentication server.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [password, onAuthenticated, toast],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-rose-50 p-4 dark:from-emerald-950/40 dark:via-background dark:to-rose-950/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-xl">Oversight Admin Access</CardTitle>
            <CardDescription className="mt-1">
              Enter the admin password to manage oversight resources for the
              Kenya Government Accountability Dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Admin password
              </Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={submitting}
                autoFocus
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !password}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Unlock
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Sessions are rate-limited. Repeated failed attempts will be locked
              out temporarily.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== PREVIEW DIALOG ====================

function PreviewDialog({
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
  const isImage = isImageResource(resource);
  const isPdf = isPdfResource(resource);

  const previewBody = () => {
    if (resource.kind === 'video' || isLocalVideo) {
      return (
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
              <AlertCircle className="mr-2 h-4 w-4" />
              <span className="text-sm">Unable to embed this video.</span>
            </div>
          )}
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex max-h-[60vh] items-center justify-center overflow-hidden rounded-md bg-muted/40">
          <img
            src={resource.url}
            alt={resource.title}
            className="max-h-[60vh] max-w-full object-contain"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="h-[60vh] w-full overflow-hidden rounded-md border">
          <iframe
            src={resource.url}
            title={resource.title}
            className="h-full w-full"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/30 p-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Preview is not available for this file type. Open it in a new tab to
          view.
        </p>
        <Button asChild size="sm">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {resource.kind === 'video' ? (
              <Video className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
            <span className="line-clamp-1">{resource.title}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview for {resource.title}. Press Escape to close.
          </DialogDescription>
        </DialogHeader>

        {previewBody()}

        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {resource.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {resource.fiscalYear && (
            <Badge variant="secondary">FY {resource.fiscalYear}</Badge>
          )}
          {resource.countyName && (
            <Badge variant="outline">{resource.countyName}</Badge>
          )}
          {resource.reportType && (
            <Badge variant="outline">{resource.reportType}</Badge>
          )}
          {resource.durationLabel && <span>{resource.durationLabel}</span>}
          <span>Added {formatDate(resource.createdAt)}</span>
        </div>

        <DialogFooter>
          <Button asChild variant="outline" size="sm">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open original
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== RESOURCE CARD ====================

function ResourceCard({
  resource,
  onTogglePublish,
  onDelete,
  onPreview,
}: {
  resource: Resource;
  onTogglePublish: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onPreview: (resource: Resource) => void;
}) {
  const sourceMeta = SOURCE_META[resource.source as SourceType] || SOURCE_META.Other;
  const kindBadge = KIND_BADGE[resource.kind];
  const fileBadge = getFileTypeBadge(resource.mimeType, resource.fileName);
  const sizeLabel = formatFileSize(resource.fileSize);
  const isExternal = !resource.url.startsWith('/uploads/');

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md">
      {/* Top row: badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={`border ${sourceMeta.badgeClass}`}
          title={sourceMeta.description}
        >
          {sourceMeta.label}
        </Badge>
        <Badge variant="outline" className={`border ${kindBadge.className}`}>
          {kindBadge.icon}
          <span className="ml-1">{kindBadge.label}</span>
        </Badge>
        {resource.kind === 'document' && (
          <Badge variant="secondary" className={fileBadge.className}>
            {fileBadge.label}
          </Badge>
        )}
        {resource.published ? (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Published
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <EyeOff className="mr-1 h-3 w-3" />
            Unpublished
          </Badge>
        )}
      </div>

      {/* Title + description */}
      <h3 className="mt-3 line-clamp-2 font-semibold leading-snug">
        {resource.title}
      </h3>
      {resource.description && (
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
          {resource.description}
        </p>
      )}

      {/* Metadata badges: FY / county / report-type */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {resource.fiscalYear && (
          <Badge variant="outline" className="font-normal">
            FY {resource.fiscalYear}
          </Badge>
        )}
        {resource.countyName && (
          <Badge variant="outline" className="font-normal">
            {resource.countyName}
          </Badge>
        )}
        {resource.reportType && (
          <Badge variant="outline" className="font-normal">
            {resource.reportType}
          </Badge>
        )}
        {resource.durationLabel && (
          <span className="text-xs text-muted-foreground">
            {resource.durationLabel}
          </span>
        )}
      </div>

      {/* URL link + file size */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="max-w-[260px] truncate">
            {isExternal ? resource.url : resource.fileName || resource.url}
          </span>
        </a>
        {sizeLabel && (
          <>
            <span aria-hidden>·</span>
            <span>{sizeLabel}</span>
          </>
        )}
        {resource.fileName && !isExternal && (
          <>
            <span aria-hidden>·</span>
            <span className="max-w-[200px] truncate" title={resource.fileName}>
              {resource.fileName}
            </span>
          </>
        )}
        <span aria-hidden>·</span>
        <span>Added {formatDate(resource.createdAt)}</span>
      </div>

      <Separator className="my-3" />

      {/* Action row: preview, publish toggle, delete */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onPreview(resource)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>

          <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5">
            <Label
              htmlFor={`pub-${resource.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {resource.published ? 'Published' : 'Unpublished'}
            </Label>
            <Switch
              id={`pub-${resource.id}`}
              checked={resource.published}
              onCheckedChange={() => onTogglePublish(resource)}
              aria-label={
                resource.published
                  ? `Unpublish ${resource.title}`
                  : `Publish ${resource.title}`
              }
            />
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently delete{' '}
                <span className="font-medium text-foreground">
                  &ldquo;{resource.title}&rdquo;
                </span>
                .{resource.url.startsWith('/uploads/') && (
                  <>
                    {' '}
                    The uploaded file will also be removed from disk.
                  </>
                )}{' '}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(resource)}
                className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ==================== LIBRARY PANEL ====================

function LibraryPanel({
  resources,
  loading,
  onTogglePublish,
  onDelete,
  onPreview,
}: {
  resources: Resource[];
  loading: boolean;
  onTogglePublish: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onPreview: (resource: Resource) => void;
}) {
  const videos = resources.filter((r) => r.kind === 'video');
  const documents = resources.filter((r) => r.kind === 'document');
  const links = resources.filter((r) => r.kind === 'link');

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/20 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading resources…</span>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/10 py-16 text-center">
        <Library className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No resources yet for this source</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Use the Upload tab to add files or the Link tab to add external links.
          New resources appear here once they are saved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Videos section */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <FileVideo className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-semibold">Videos</h3>
          <Badge variant="secondary" className="text-xs">
            {videos.length}
          </Badge>
        </div>
        {videos.length === 0 ? (
          <p className="text-xs text-muted-foreground">No videos uploaded.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {videos.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onTogglePublish={onTogglePublish}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </section>

      {/* Documents section */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-semibold">Documents</h3>
          <Badge variant="secondary" className="text-xs">
            {documents.length}
          </Badge>
        </div>
        {documents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No documents uploaded.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onTogglePublish={onTogglePublish}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </section>

      {/* Links section */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-semibold">Links</h3>
          <Badge variant="secondary" className="text-xs">
            {links.length}
          </Badge>
        </div>
        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground">No links added.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onTogglePublish={onTogglePublish}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ==================== UPLOAD PANEL ====================

interface UploadResult {
  success: boolean;
  fileName: string;
  error?: string;
}

function UploadPanel({
  source,
  onUploaded,
}: {
  source: SourceType;
  onUploaded: () => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [countyName, setCountyName] = useState('');
  const [reportType, setReportType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const resetForm = useCallback(() => {
    setFiles([]);
    setDescription('');
    setFiscalYear('');
    setCountyName('');
    setReportType('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = incoming.filter((f) => !seen.has(`${f.name}-${f.size}`));
      return [...prev, ...fresh];
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (files.length === 0) {
        toast({
          title: 'No files selected',
          description: 'Choose at least one file to upload.',
          variant: 'destructive',
        });
        return;
      }
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('source', source);
        // title is intentionally omitted for bulk uploads — server derives from file name
        if (description) formData.append('description', description);
        if (fiscalYear) formData.append('fiscalYear', fiscalYear);
        if (countyName) formData.append('countyName', countyName);
        if (reportType) formData.append('reportType', reportType);
        for (const f of files) formData.append('files', f);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast({
            title: 'Upload complete',
            description: data.message || `Uploaded ${data.totalUploaded} file(s).`,
          });
          if (data.totalFailed > 0) {
            const failed = (data.results as UploadResult[] | undefined)?.filter(
              (r) => !r.success,
            );
            toast({
              title: `${data.totalFailed} file(s) failed`,
              description: failed
                ?.map((r) => `${r.fileName}: ${r.error || 'unknown error'}`)
                .join('; '),
              variant: 'destructive',
            });
          }
          resetForm();
          onUploaded();
        } else {
          const msg = data.error || 'Upload failed';
          toast({
            title: 'Upload failed',
            description: msg,
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Network error',
          description: 'Unable to reach the upload endpoint.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [files, source, description, fiscalYear, countyName, reportType, toast, resetForm, onUploaded],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="upload-source">Source</Label>
        <Input id="upload-source" value={SOURCE_META[source].label} disabled />
        <p className="text-xs text-muted-foreground">
          {SOURCE_META[source].description}. Use the source selector above to
          change the active source.
        </p>
      </div>

      {/* Drag-and-drop zone */}
      <div className="space-y-2">
        <Label>Files</Label>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition focus:outline-none focus:ring-2 focus:ring-ring ${
            dragging
              ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
              : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
          }`}
          aria-label="Drag and drop files or click to browse"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PDFs, images, videos, Office docs up to 100 MB each
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.webm,.ogg,.mov,.mp3"
          />
        </div>
      </div>

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>
            Selected files ({files.length})
          </Label>
          <ScrollArea className="max-h-48 rounded-md border p-2">
            <ul className="space-y-1.5">
              {files.map((f, i) => {
                const badge = getFileTypeBadge(f.type || null, f.name);
                return (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-sm"
                  >
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                    <span className="flex-1 truncate" title={f.name}>
                      {f.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(f.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="rounded-sm p-1 text-muted-foreground transition hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="upload-description">
          Description{' '}
          <span className="text-xs font-normal text-muted-foreground">
            (optional — applied to all files in this batch)
          </span>
        </Label>
        <Textarea
          id="upload-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Auditor-General report for FY 2023/2024, Nakuru County"
          rows={3}
          disabled={submitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="upload-fy">Fiscal Year</Label>
          <Input
            id="upload-fy"
            list="fy-options"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            placeholder="e.g. 2023/2024"
            disabled={submitting}
          />
          <datalist id="fy-options">
            {FISCAL_YEARS.map((y) => (
              <option key={y} value={y} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="upload-county">County</Label>
          <Input
            id="upload-county"
            list="county-options"
            value={countyName}
            onChange={(e) => setCountyName(e.target.value)}
            placeholder="e.g. Nairobi City"
            disabled={submitting}
          />
          <datalist id="county-options">
            {COUNTIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="upload-type">Report Type</Label>
          <Input
            id="upload-type"
            list="report-type-options"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            placeholder="e.g. Audit Report"
            disabled={submitting}
          />
          <datalist id="report-type-options">
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {files.length > 0
            ? `Ready to upload ${files.length} file${files.length !== 1 ? 's' : ''}.`
            : 'Select files to enable upload.'}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={submitting || files.length === 0}
          >
            Reset
          </Button>
          <Button type="submit" disabled={submitting || files.length === 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ==================== LINK PANEL ====================

function LinkPanel({
  source,
  onAdded,
}: {
  source: SourceType;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [countyName, setCountyName] = useState('');
  const [reportType, setReportType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const detectedKind = url ? detectLinkKind(url) : null;

  const resetForm = useCallback(() => {
    setUrl('');
    setTitle('');
    setDescription('');
    setFiscalYear('');
    setCountyName('');
    setReportType('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url || !title) {
        toast({
          title: 'URL and title are required',
          description: 'Provide both a valid URL and a title for the resource.',
          variant: 'destructive',
        });
        return;
      }
      try {
        // Validate URL client-side for better feedback
        void new URL(url);
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a complete, well-formed URL.',
          variant: 'destructive',
        });
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source,
            title,
            description: description || undefined,
            url,
            fiscalYear: fiscalYear || undefined,
            countyName: countyName || undefined,
            reportType: reportType || undefined,
            published: true,
          }),
        });
        const data = await res.json();
        if (res.ok && data.resource) {
          toast({
            title: 'Link added',
            description: data.message || `Saved: ${data.resource.title}`,
          });
          resetForm();
          onAdded();
        } else {
          const msg = data.error || 'Failed to add link';
          toast({
            title: 'Failed to add link',
            description: msg,
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Network error',
          description: 'Unable to reach the resources endpoint.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [url, title, description, fiscalYear, countyName, reportType, source, toast, resetForm, onAdded],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="link-source">Source</Label>
        <Input id="link-source" value={SOURCE_META[source].label} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-url">
          URL <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="link-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/report.pdf or YouTube/Vimeo URL"
          disabled={submitting}
          autoComplete="off"
        />
        {detectedKind && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Detected type:</span>
            <Badge variant="outline" className={KIND_BADGE[detectedKind].className}>
              {KIND_BADGE[detectedKind].icon}
              <span className="ml-1">{KIND_BADGE[detectedKind].label}</span>
            </Badge>
            {detectedKind === 'video' && (
              <span>
                (YouTube/Vimeo links are auto-converted to embed players)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-title">
          Title <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="link-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. OAG Audit Report — Nairobi City County FY 2023/24"
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-description">Description</Label>
        <Textarea
          id="link-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional summary of the linked resource"
          rows={3}
          disabled={submitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="link-fy">Fiscal Year</Label>
          <Input
            id="link-fy"
            list="fy-options-link"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            placeholder="e.g. 2023/2024"
            disabled={submitting}
          />
          <datalist id="fy-options-link">
            {FISCAL_YEARS.map((y) => (
              <option key={y} value={y} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-county">County</Label>
          <Input
            id="link-county"
            list="county-options-link"
            value={countyName}
            onChange={(e) => setCountyName(e.target.value)}
            placeholder="e.g. Mombasa"
            disabled={submitting}
          />
          <datalist id="county-options-link">
            {COUNTIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-type">Report Type</Label>
          <Input
            id="link-type"
            list="report-type-options-link"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            placeholder="e.g. Press Statement"
            disabled={submitting}
          />
          <datalist id="report-type-options-link">
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          The system auto-detects YouTube/Vimeo videos and converts them to
          embeddable players.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={submitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={submitting || !url || !title}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Add link
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ==================== REFRESH PARLIAMENT CARD ====================

function RefreshParliamentCard({
  status,
}: {
  status: RefreshStatus;
}) {
  if (status.state === 'idle') return null;

  return (
    <Card
      className={
        status.state === 'error'
          ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40'
          : status.state === 'success'
            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
            : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {status.state === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          )}
          {status.state === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          {status.state === 'error' && (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          Parliament Data Refresh —{' '}
          {status.state === 'running'
            ? 'In Progress'
            : status.state === 'success'
              ? 'Completed'
              : 'Failed'}
        </CardTitle>
        <CardDescription className="text-xs">{status.message}</CardDescription>
      </CardHeader>
      {status.summary.length > 0 && (
        <CardContent className="pt-2">
          <ScrollArea className="max-h-44 rounded-md border bg-background/60 p-2">
            <ul className="space-y-1 font-mono text-xs">
              {status.summary.map((line, i) => (
                <li
                  key={i}
                  className={
                    line.includes('✗')
                      ? 'text-rose-700 dark:text-rose-300'
                      : line.includes('✓')
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-muted-foreground'
                  }
                >
                  {line}
                </li>
              ))}
            </ul>
          </ScrollArea>
          {status.ranAt && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Run at: {new Date(status.ranAt).toLocaleString('en-KE')}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ==================== MAIN ADMIN PAGE ====================

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({
    state: 'idle',
    message: '',
    summary: [],
    ranAt: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  const [selectedSource, setSelectedSource] = useState<SourceType>('OAG');
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'link'>(
    'library',
  );
  const [adminSection, setAdminSection] = useState<AdminSection>('resources');

  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { toast } = useToast();

  // ---- Auth check on mount (Promise.resolve().then() to satisfy setState-in-effect lint rule) ----
  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        try {
          const res = await fetch('/api/admin/login');
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              setAuthenticated(true);
            }
          }
        } catch {
          // ignore — defaults to not authenticated
        }
        setCheckingAuth(false);
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, []);

  // ---- Fetch resources whenever source changes (and on auth) ----
  const fetchResources = useCallback(async (source: SourceType) => {
    setLoadingResources(true);
    try {
      const res = await fetch(
        `/api/admin/resources?source=${encodeURIComponent(source)}&published=false`,
      );
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
      } else {
        setResources([]);
      }
    } catch {
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    // Defer setState-in-effect using microtask to comply with lint rule
    Promise.resolve()
      .then(() => fetchResources(selectedSource))
      .catch(() => undefined);
  }, [authenticated, selectedSource, fetchResources]);

  // ---- Handlers ----

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setResources([]);
    setRefreshStatus({ state: 'idle', message: '', summary: [], ranAt: null });
    toast({
      title: 'Signed out',
      description: 'You have been signed out of the admin console.',
    });
  }, [toast]);

  const handleRefreshParliament = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshStatus({
      state: 'running',
      message: 'Triggering full re-scrape of parliament.go.ke…',
      summary: [],
      ranAt: null,
    });
    try {
      const res = await fetch('/api/admin/refresh-parliament', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRefreshStatus({
          state: 'success',
          message: data.message || 'Parliament data refreshed successfully.',
          summary: Array.isArray(data.summary) ? data.summary : [],
          ranAt: data.ranAt || new Date().toISOString(),
        });
        toast({
          title: 'Refresh complete',
          description: data.message || 'Parliament data has been refreshed.',
        });
      } else {
        setRefreshStatus({
          state: 'error',
          message: data.error || 'Refresh failed.',
          summary: [],
          ranAt: data.ranAt || new Date().toISOString(),
        });
        toast({
          title: 'Refresh failed',
          description: data.error || 'Unknown error.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setRefreshStatus({
        state: 'error',
        message: 'Network error while contacting the refresh endpoint.',
        summary: [],
        ranAt: new Date().toISOString(),
      });
      toast({
        title: 'Network error',
        description: err instanceof Error ? err.message : 'Unknown error.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, toast]);

  const handleTogglePublish = useCallback(
    async (resource: Resource) => {
      const next = !resource.published;
      try {
        const res = await fetch('/api/admin/resources', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: resource.id, published: next }),
        });
        const data = await res.json();
        if (res.ok && data.resource) {
          setResources((prev) =>
            prev.map((r) =>
              r.id === resource.id ? { ...r, published: next } : r,
            ),
          );
          toast({
            title: next ? 'Resource published' : 'Resource unpublished',
            description: resource.title,
          });
        } else {
          toast({
            title: 'Update failed',
            description: data.error || 'Unknown error.',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Network error',
          description: 'Unable to update the resource.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleDelete = useCallback(
    async (resource: Resource) => {
      try {
        const res = await fetch(
          `/api/admin/resources?id=${encodeURIComponent(resource.id)}`,
          { method: 'DELETE' },
        );
        const data = await res.json();
        if (res.ok) {
          setResources((prev) => prev.filter((r) => r.id !== resource.id));
          toast({
            title: 'Resource deleted',
            description: data.message || resource.title,
          });
        } else {
          toast({
            title: 'Delete failed',
            description: data.error || 'Unknown error.',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Network error',
          description: 'Unable to delete the resource.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handlePreview = useCallback((resource: Resource) => {
    setPreviewResource(resource);
    setPreviewOpen(true);
  }, []);

  const handleRefetch = useCallback(() => {
    Promise.resolve()
      .then(() => fetchResources(selectedSource))
      .catch(() => undefined);
  }, [fetchResources, selectedSource]);

  // ---- Render ----

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Verifying admin session…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <AuthGate onAuthenticated={() => setAuthenticated(true)} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight sm:text-lg">
                Oversight Resources Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                Kenya Government Accountability Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handleRefreshParliament}
              disabled={refreshing}
              variant="default"
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Parliament
                </>
              )}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/" aria-label="Back to dashboard">
                <ArrowUpDown className="mr-2 h-4 w-4 rotate-90" />
                Back to dashboard
              </a>
            </Button>
            <Button
              type="button"
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              <Shield className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Refresh status card */}
        <RefreshParliamentCard status={refreshStatus} />

        {/* Section nav */}
        <section aria-label="Admin section" className="mt-6">
          <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
            {([
              { id: 'resources', label: 'Oversight Resources', icon: Library },
              { id: 'finance_audit', label: 'Finance & Audit', icon: TrendingUp },
              { id: 'cecm_verify', label: 'CECM Verification', icon: Shield },
            ] as { id: AdminSection; label: string; icon: React.ElementType }[]).map(s => {
              const active = adminSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAdminSection(s.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-ring ${
                    active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>

        {adminSection === 'finance_audit' && (
          <section className="mt-6"><FinanceAuditPanel /></section>
        )}
        {adminSection === 'cecm_verify' && (
          <section className="mt-6"><CecmVerificationPanel /></section>
        )}

        {adminSection === 'resources' && (
          <>
        {/* Source selector */}
        <section aria-label="Source selector" className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Select a source to manage
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SOURCES.map((s) => {
              const meta = SOURCE_META[s];
              const active = s === selectedSource;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSource(s)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ring ${
                    active
                      ? meta.buttonClass + ' ring-2 ring-offset-1'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {meta.icon}
                    <span className="font-semibold">{meta.label}</span>
                  </div>
                  <span className="text-[11px] leading-tight text-muted-foreground line-clamp-1">
                    {meta.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Per-source panel */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={SOURCE_META[selectedSource].badgeClass}
                >
                  {SOURCE_META[selectedSource].label}
                </Badge>
                <CardTitle className="text-base">
                  {SOURCE_META[selectedSource].description}
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefetch}
                disabled={loadingResources}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loadingResources ? 'animate-spin' : ''}`}
                />
                Refresh list
              </Button>
            </div>
            <CardDescription>
              Manage uploaded files, documents, and external links for this
              oversight source.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as 'library' | 'upload' | 'link')
              }
            >
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="library">
                  <Library className="mr-1.5 h-4 w-4" />
                  Library
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="link">
                  <LinkIcon className="mr-1.5 h-4 w-4" />
                  Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="mt-4">
                <LibraryPanel
                  resources={resources}
                  loading={loadingResources}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <UploadPanel
                  source={selectedSource}
                  onUploaded={() => {
                    setActiveTab('library');
                    handleRefetch();
                  }}
                />
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <LinkPanel
                  source={selectedSource}
                  onAdded={() => {
                    setActiveTab('library');
                    handleRefetch();
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            Oversight Resources Admin · Kenya Government Accountability Dashboard
            · All actions are logged.
          </p>
        </footer>
      </main>

      {/* Preview dialog (controlled) */}
      <PreviewDialog
        resource={previewResource}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <Toaster />
    </div>
  );
}
