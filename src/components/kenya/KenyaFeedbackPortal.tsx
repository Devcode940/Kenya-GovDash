'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  MessageSquare, Send, AlertCircle, CheckCircle2, Clock, Eye, ThumbsUp,
  Lightbulb, HelpCircle, FileText, User, RefreshCw, X, Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Representative } from '@/lib/kenya-data';

// ==================== TYPES ====================

interface FeedbackEntry {
  id: string;
  representativeId: string | null;
  countyName: string | null;
  category: string;
  title: string;
  description: string;
  submitterName: string | null;
  isAnonymous: boolean;
  status: string;
  priority: string;
  createdAt: string;
}

interface FeedbackStats {
  total: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

// ==================== CATEGORY CONFIG ====================

const CATEGORY_CONFIG = [
  { value: 'Complaint', label: 'Complaint', icon: AlertCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'Suggestion', label: 'Suggestion', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'Observation', label: 'Observation', icon: Eye, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'Question', label: 'Question', icon: HelpCircle, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'Appreciation', label: 'Appreciation', icon: ThumbsUp, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
];

const STATUS_COLORS: Record<string, string> = {
  'Submitted': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Acknowledged': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Resolved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'Submitted': <Clock className="h-3 w-3" />,
  'Under Review': <Eye className="h-3 w-3" />,
  'Acknowledged': <CheckCircle2 className="h-3 w-3" />,
  'Resolved': <CheckCircle2 className="h-3 w-3" />,
};

// ==================== MAIN COMPONENT ====================

interface KenyaFeedbackPortalProps {
  representative?: Representative | null;
}

export function KenyaFeedbackPortal({ representative }: KenyaFeedbackPortalProps) {
  // Fetch feedback data — triggered by user action or on mount via callback ref
  // Avoids the "set-state-in-effect" lint rule by using a data fetching approach
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (representative?.id) params.set('representativeId', representative.id);
      if (representative?.jurisdiction) params.set('countyName', representative.jurisdiction);
      params.set('limit', '20');

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        setStats(data.stats || null);
      }
    } catch {
      // Silently fail — feedback is supplementary
    }
    setIsLoading(false);
    setHasFetched(true);
  }, [representative]);

  // Initial data loading is deferred until user switches to "view" tab
  // or until feedback is successfully submitted — no effect setState needed

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          Citizen Feedback Portal
          {stats && (
            <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              {stats.total} submissions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab switcher */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'submit' ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1"
            onClick={() => setActiveTab('submit')}
          >
            <Send className="h-3 w-3" />
            Submit Feedback
          </Button>
          <Button
            variant={activeTab === 'view' ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1"
            onClick={() => { setActiveTab('view'); fetchFeedback(); }}
          >
            <FileText className="h-3 w-3" />
            View Feedback
          </Button>
        </div>

        {activeTab === 'submit' ? (
          <FeedbackForm
            representative={representative}
            onSuccess={() => {
              toast({ title: 'Feedback submitted', description: 'Your feedback has been recorded. Thank you for contributing to accountability.' });
              fetchFeedback();
              setActiveTab('view');
            }}
          />
        ) : (
          <FeedbackList
            feedbacks={feedbacks}
            stats={stats}
            isLoading={isLoading}
            onRefresh={fetchFeedback}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ==================== FEEDBACK FORM ====================

function FeedbackForm({
  representative,
  onSuccess,
}: {
  representative?: Representative | null;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterCounty, setSubmitterCounty] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!category) { setError('Please select a category'); return; }
    if (!title.trim()) { setError('Please enter a title'); return; }
    if (!description.trim()) { setError('Please enter a description'); return; }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          representativeId: representative?.id || null,
          countyName: representative?.jurisdiction || null,
          category,
          title: title.trim(),
          description: description.trim(),
          isAnonymous,
          submitterName: isAnonymous ? null : submitterName.trim(),
          submitterEmail: isAnonymous ? null : submitterEmail.trim(),
          submitterCounty: submitterCounty.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          priority: 'Normal',
        }),
      });

      if (res.ok) {
        onSuccess();
        // Reset form
        setCategory('');
        setTitle('');
        setDescription('');
        setSourceUrl('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Linked representative info */}
      {representative && (
        <div className="p-2 rounded-md bg-muted/50 flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Feedback regarding:</span>
          <span className="text-xs font-medium">{representative.fullName}</span>
          <span className="text-xs text-muted-foreground">({representative.officialTitle})</span>
        </div>
      )}

      {/* Category selection */}
      <div>
        <label className="text-xs font-medium mb-1 block">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select feedback category..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_CONFIG.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  {React.createElement(cat.icon, { className: 'h-3 w-3' })}
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium mb-1 block">Title</label>
        <Input
          placeholder="Brief title for your feedback..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground mt-0.5">{title.length}/200 characters</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium mb-1 block">Description</label>
        <Textarea
          placeholder="Describe your feedback in detail. Include specific facts, dates, or evidence where possible..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          className="min-h-[120px] text-xs"
        />
        <p className="text-[10px] text-muted-foreground mt-0.5">{description.length}/5000 characters</p>
      </div>

      {/* Source URL */}
      <div>
        <label className="text-xs font-medium mb-1 block">Source/Evidence URL (optional)</label>
        <Input
          placeholder="https://... — link to official document, news article, or evidence"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      <Separator />

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
        <div>
          <span className="text-sm font-medium">Submit Anonymously</span>
          <p className="text-[11px] text-muted-foreground">
            Your name and email will not be displayed publicly
          </p>
        </div>
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          aria-label="Toggle anonymous submission"
        />
      </div>

      {/* Personal info (if not anonymous) */}
      {!isAnonymous && (
        <div className="space-y-2 p-3 rounded-md border">
          <div>
            <label className="text-xs font-medium mb-1 block">Your Name</label>
            <Input
              placeholder="Full name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email (for follow-up)</label>
            <Input
              placeholder="email@example.com"
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* Your county */}
      <div>
        <label className="text-xs font-medium mb-1 block">Your County of Residence (optional)</label>
        <Input
          placeholder="e.g., Kajiado, Nairobi, Kisumu..."
          value={submitterCounty}
          onChange={(e) => setSubmitterCounty(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !category || !title.trim() || !description.trim()}
        className="w-full gap-2"
      >
        {isSubmitting ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>

      {/* Disclaimer */}
      <div className="p-2 rounded-md border border-dashed border-muted-foreground/30">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            This feedback portal supports constitutional accountability under Article 196 (public participation).
            All submissions are stored for transparency. Factual, evidence-based feedback is encouraged.
            This platform is non-partisan and does not endorse any political position.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== FEEDBACK LIST ====================

function FeedbackList({
  feedbacks,
  stats,
  isLoading,
  onRefresh,
}: {
  feedbacks: FeedbackEntry[];
  stats: FeedbackStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading feedback...</span>
      </div>
    );
  }

  if (feedbacks.length === 0 && !stats) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No feedback submitted yet</p>
        <p className="text-xs mt-1">Be the first to contribute to accountability</p>
      </div>
    );
  }

  // Stats bar
  const statsBar = stats && stats.byCategory.length > 0 ? (
    <div className="flex flex-wrap gap-2 mb-3">
      {CATEGORY_CONFIG.map(cat => {
        const count = stats.byCategory.find(c => c.category === cat.value)?.count || 0;
        if (count === 0) return null;
        return (
          <Badge key={cat.value} className={`${cat.color} text-[10px] px-2 py-1 border`}>
            {React.createElement(cat.icon, { className: 'h-2.5 w-2.5 mr-1 inline' })}
            {cat.label}: {count}
          </Badge>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="space-y-3">
      {/* Stats */}
      {statsBar}

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{feedbacks.length} recent submissions</span>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={onRefresh}>
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Feedback items */}
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-2">
          {feedbacks.map(fb => {
            const catConfig = CATEGORY_CONFIG.find(c => c.value === fb.category);
            const CatIcon = catConfig?.icon || FileText;
            const catColor = catConfig?.color || 'bg-gray-100 text-gray-500';

            return (
              <div key={fb.id} className="p-3 rounded-md border bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${catColor} text-[10px] px-1.5 py-0.5 border`}>
                    {React.createElement(CatIcon, { className: 'h-2.5 w-2.5 mr-0.5 inline' })}
                    {fb.category}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[fb.status] || 'bg-gray-100 text-gray-500'} text-[10px] px-1.5 py-0.5`}>
                    {STATUS_ICONS[fb.status]}
                    <span className="ml-0.5">{fb.status}</span>
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(fb.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm font-medium">{fb.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{fb.description}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  {fb.isAnonymous ? (
                    <span>Submitted anonymously</span>
                  ) : (
                    <span>By {fb.submitterName || 'Unknown'}</span>
                  )}
                  {fb.countyName && <span> · County: {fb.countyName}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
