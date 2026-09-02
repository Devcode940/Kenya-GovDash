'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, Video, Upload, ThumbsUp, MapPin, AlertCircle, CheckCircle2, Clock, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CitizenComment {
  id: string; countyName: string; wardName: string; authorName: string;
  rating: number; comment: string; videoUrl?: string; createdAt: string; upvotes: number;
}

export function KenyaConstituencyDevelopment() {
  const { toast } = useToast();
  const [comments, setComments] = useState<CitizenComment[]>([]);
  const [countyName, setCountyName] = useState('');
  const [wardName, setWardName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!countyName || !comment || rating === 0) {
      toast({ title: 'Missing fields', description: 'Please fill in county, rating, and comment.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const newComment: CitizenComment = {
      id: `comment-${Date.now()}`, countyName, wardName: wardName || 'Unspecified',
      authorName: authorName || 'Anonymous Citizen', rating, comment,
      videoUrl: videoUrl || undefined, createdAt: new Date().toISOString(), upvotes: 0,
    };
    setComments([newComment, ...comments]);
    toast({ title: 'Comment submitted', description: 'Your constituency development feedback has been recorded.' });
    setCountyName(''); setWardName(''); setRating(0); setComment(''); setVideoUrl('');
    setIsSubmitting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(`Local file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      toast({ title: 'Video attached', description: `${file.name} ready to submit.` });
    }
  };

  const handleUpvote = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Constituency Development — Citizen Feedback
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Rate your constituency&apos;s development progress. Comment on projects, upload videos as proof, and help hold your representatives accountable.
          </p>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] w-fit">Article 196: Public Participation</Badge>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Submit Your Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium mb-1 block">County</label>
              <Input placeholder="e.g., Nairobi City" value={countyName} onChange={(e) => setCountyName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Ward / Constituency</label>
              <Input placeholder="e.g., Dagoretti North" value={wardName} onChange={(e) => setWardName(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Your Name (optional)</label>
            <Input placeholder="e.g., John Citizen" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="h-9 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Rate Development Progress (1-5 stars)</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1 hover:scale-110 transition-transform" aria-label={`${star} stars`}>
                  <Star className={`h-6 w-6 transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">{rating > 0 ? `${rating}/5` : 'Click to rate'}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Your Comment</label>
            <Textarea placeholder="Describe the development project, its status, any issues..." value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} className="min-h-[100px] text-xs" />
            <p className="text-[10px] text-muted-foreground mt-0.5">{comment.length}/2000 characters</p>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Upload Video Proof (optional)</label>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Video className="h-3.5 w-3.5" /> Choose Video
              </Button>
              {videoUrl && <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><Camera className="h-2.5 w-2.5 mr-0.5" />{videoUrl.slice(0, 30)}...</Badge>}
            </div>
          </div>
          <Separator />
          <Button onClick={handleSubmit} disabled={isSubmitting || !countyName || !comment || rating === 0} className="w-full gap-2">
            {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Citizen Feedback ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No citizen feedback submitted yet.</p>
              <p className="text-xs mt-1">Be the first to rate your constituency&apos;s development.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-md border bg-card">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{c.authorName}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2 w-2 mr-0.5" />{c.countyName} · {c.wardName}</Badge>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= c.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`} />)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.comment}</p>
                  {c.videoUrl && <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary"><Video className="h-3 w-3" />{c.videoUrl}</div>}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>{new Date(c.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => handleUpvote(c.id)} className="flex items-center gap-0.5 hover:text-primary transition-colors"><ThumbsUp className="h-3 w-3" />{c.upvotes}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              Under Article 196 of the Constitution of Kenya 2010, every county government shall facilitate public participation in planning and policy-making. This platform enables citizens to report on constituency development, rate performance, and provide video evidence.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
