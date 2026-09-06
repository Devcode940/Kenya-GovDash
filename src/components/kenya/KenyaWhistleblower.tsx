'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldAlert, Eye, FileText, DollarSign, Users, Building2,
  AlertTriangle, CheckCircle2, Clock, Upload, Lock, Scale,
  MapPin, ThumbsUp, MessageSquare, RefreshCw, Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ==================== TYPES ====================

type ReportCategory =
  | 'embezzlement'
  | 'bribery'
  | 'nepotism'
  | 'procurement_fraud'
  | 'ghost_workers'
  | 'pending_bills'
  | 'project_abandonment'
  | 'revenue_leakage'
  | 'asset_grabbing'
  | 'other';

type ReportStatus = 'submitted' | 'under_review' | 'investigating' | 'verified' | 'dismissed';

interface WhistleblowerReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  countyName: string;
  department: string;
  estimatedAmount?: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterEmail?: string;
  evidenceUrls: string[];
  status: ReportStatus;
  createdAt: string;
  upvotes: number;
}

// ==================== CATEGORY CONFIG ====================

const CATEGORIES: { id: ReportCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'embezzlement', label: 'Embezzlement / Misappropriation', icon: <DollarSign className="h-4 w-4" />, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { id: 'bribery', label: 'Bribery / Extortion', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { id: 'nepotism', label: 'Nepotism / Cronyism', icon: <Users className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { id: 'procurement_fraud', label: 'Procurement Fraud / Tender Irregularity', icon: <FileText className="h-4 w-4" />, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  { id: 'ghost_workers', label: 'Ghost Workers / Payroll Fraud', icon: <Users className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { id: 'pending_bills', label: 'Pending Bills / Unpaid Invoices', icon: <DollarSign className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { id: 'project_abandonment', label: 'Project Abandonment / Stalled Projects', icon: <Building2 className="h-4 w-4" />, color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' },
  { id: 'revenue_leakage', label: 'Revenue Leakage / Unbanked Cash', icon: <DollarSign className="h-4 w-4" />, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  { id: 'asset_grabbing', label: 'Asset Grabbing / Land Fraud', icon: <MapPin className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { id: 'other', label: 'Other Misconduct', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
];

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: <Clock className="h-3 w-3" /> },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <Eye className="h-3 w-3" /> },
  investigating: { label: 'Investigating', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <RefreshCw className="h-3 w-3" /> },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  dismissed: { label: 'Dismissed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
};

// ==================== MAIN COMPONENT ====================

export function KenyaWhistleblower() {
  const { toast } = useToast();
  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [countyName, setCountyName] = useState('');
  const [department, setDepartment] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileNames = files.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`);
    setEvidenceFiles([...evidenceFiles, ...fileNames]);
  };

  const handleSubmit = () => {
    if (!category || !title.trim() || !description.trim()) {
      toast({ title: 'Missing fields', description: 'Please select a category and fill in title and description.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const newReport: WhistleblowerReport = {
      id: `wb-${Date.now()}`,
      category: category as ReportCategory,
      title: title.trim(),
      description: description.trim(),
      countyName: countyName.trim() || 'Unspecified',
      department: department.trim() || 'Unspecified',
      estimatedAmount: estimatedAmount.trim() || undefined,
      isAnonymous,
      reporterName: isAnonymous ? undefined : reporterName.trim(),
      reporterEmail: isAnonymous ? undefined : reporterEmail.trim(),
      evidenceUrls: evidenceFiles,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    // In production, this would POST to /api/whistleblower
    setReports([newReport, ...reports]);

    toast({
      title: 'Report submitted',
      description: 'Your whistleblower report has been recorded securely. Reference ID: ' + newReport.id,
    });

    // Reset form
    setCategory(''); setTitle(''); setDescription(''); setCountyName('');
    setDepartment(''); setEstimatedAmount(''); setEvidenceFiles([]);
    setIsSubmitting(false);
    setActiveTab('view');
  };

  const handleUpvote = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  const stats = {
    total: reports.length,
    byCategory: CATEGORIES.map(c => ({ ...c, count: reports.filter(r => r.category === c.id).length })).filter(c => c.count > 0),
    verified: reports.filter(r => r.status === 'verified').length,
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <Card className="border-2 border-red-300 dark:border-red-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Whistleblower Portal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Report dishonesty with public funds — embezzlement, bribery, procurement fraud,
            ghost workers, pending bills, project abandonment, revenue leakage, and asset grabbing.
            Anonymous reporting protected under the Whistleblower Protection Act.
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[10px] gap-1">
              <Lock className="h-2.5 w-2.5" /> Encrypted
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] gap-1">
              <Shield className="h-2.5 w-2.5" /> Anonymous Option
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px]">
              <Scale className="h-2.5 w-2.5" /> Article 10 & 232
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'submit' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('submit')}>
          <ShieldAlert className="h-3.5 w-3.5" /> Submit Report
        </Button>
        <Button variant={activeTab === 'view' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('view')}>
          <Eye className="h-3.5 w-3.5" /> View Reports ({reports.length})
        </Button>
      </div>

      {/* Submit form */}
      {activeTab === 'submit' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" /> Report Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Category selection */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Category of Misconduct *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-all ${
                      category === cat.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded ${cat.color}`}>{cat.icon}</div>
                    <span className="flex-1">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium mb-1 block">Report Title *</label>
              <Input placeholder="Brief title, e.g., 'Kshs 5M diverted from health project'" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className="h-9 text-xs" />
              <p className="text-[10px] text-muted-foreground mt-0.5">{title.length}/200</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium mb-1 block">Detailed Description *</label>
              <Textarea placeholder="Describe what happened, who was involved, dates, amounts, and any other relevant details..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} className="min-h-[120px] text-xs" />
              <p className="text-[10px] text-muted-foreground mt-0.5">{description.length}/5000</p>
            </div>

            {/* County + Department */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">County</label>
                <Input placeholder="e.g., Nairobi City" value={countyName} onChange={(e) => setCountyName(e.target.value)} className="h-9 text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Department / Ministry</label>
                <Input placeholder="e.g., Health, Roads" value={department} onChange={(e) => setDepartment(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>

            {/* Estimated amount */}
            <div>
              <label className="text-xs font-medium mb-1 block">Estimated Amount Involved (Kshs)</label>
              <Input placeholder="e.g., 5,000,000" value={estimatedAmount} onChange={(e) => setEstimatedAmount(e.target.value)} className="h-9 text-xs" />
            </div>

            {/* Evidence upload */}
            <div>
              <label className="text-xs font-medium mb-1 block">Upload Evidence (documents, photos, videos)</label>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Choose Files
              </Button>
              {evidenceFiles.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {evidenceFiles.map((f, i) => (
                    <Badge key={i} className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-1">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />{f.slice(0, 40)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <div>
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Submit Anonymously
                </span>
                <p className="text-[11px] text-muted-foreground">Your identity will not be recorded or shared</p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} aria-label="Toggle anonymous" />
            </div>

            {/* Personal info (if not anonymous) */}
            {!isAnonymous && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-md border">
                <div>
                  <label className="text-xs font-medium mb-1 block">Your Name</label>
                  <Input placeholder="Full name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Email (for follow-up)</label>
                  <Input placeholder="email@example.com" type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>
            )}

            {/* Legal notice */}
            <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-1.5">
                <Scale className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                  False reports are punishable under the Penal Code. All reports are reviewed
                  before being made public. This portal supports constitutional accountability
                  under Articles 10 and 232 of the Constitution of Kenya 2010, and the
                  Whistleblower Protection Act.
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={isSubmitting || !category || !title.trim() || !description.trim()} className="w-full gap-2">
              {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Submit Whistleblower Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View reports */}
      {activeTab === 'view' && (
        <div className="space-y-3">
          {/* Stats */}
          {stats.total > 0 && (
            <Card>
              <CardContent className="pt-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{stats.total} reports</span>
                  </div>
                  {stats.verified > 0 && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {stats.verified} verified
                    </div>
                  )}
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {stats.byCategory.map(c => (
                      <Badge key={c.id} className={`text-[9px] px-1.5 py-0 ${c.color}`}>
                        {c.label.split(' / ')[0]}: {c.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {reports.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No whistleblower reports submitted yet.</p>
                <p className="text-xs mt-1">Be the first to report dishonesty with public funds.</p>
                <Button variant="outline" size="sm" className="mt-3 text-xs gap-1" onClick={() => setActiveTab('submit')}>
                  <ShieldAlert className="h-3.5 w-3.5" /> Submit a Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => {
                const cat = CATEGORIES.find(c => c.id === r.category);
                const status = STATUS_CONFIG[r.status];
                return (
                  <Card key={r.id} className="border-l-4 border-l-red-400">
                    <CardContent className="pt-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cat && <Badge className={`text-[9px] px-1.5 py-0 ${cat.color}`}>{cat.label.split(' / ')[0]}</Badge>}
                          <Badge className={`text-[9px] px-1.5 py-0 ${status.color}`}>{status.icon}<span className="ml-0.5">{status.label}</span></Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(r.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium">{r.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{r.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" />{r.countyName}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          <Building2 className="h-2.5 w-2.5 mr-0.5" />{r.department}
                        </Badge>
                        {r.estimatedAmount && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            <DollarSign className="h-2.5 w-2.5 mr-0.5" />Kshs {r.estimatedAmount}
                          </Badge>
                        )}
                        {r.evidenceUrls.length > 0 && (
                          <Badge className="text-[9px] px-1 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <Upload className="h-2.5 w-2.5 mr-0.5" />{r.evidenceUrls.length} evidence
                          </Badge>
                        )}
                        {r.isAnonymous ? (
                          <Badge className="text-[9px] px-1 py-0 bg-muted text-muted-foreground">
                            <Lock className="h-2.5 w-2.5 mr-0.5" />Anonymous
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {r.reporterName || 'Named'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleUpvote(r.id)} className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="h-3 w-3" />{r.upvotes} corroborate
                        </button>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Ref: {r.id}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
