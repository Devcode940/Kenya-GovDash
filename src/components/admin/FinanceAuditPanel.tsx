'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Loader2, RefreshCw, Plus, Trash2, Edit2, Landmark,
  CheckCircle2, Database, Download, Sparkles, Search,
} from 'lucide-react';

interface Snapshot {
  id: string;
  fiscalYear: string;
  level: 'national' | 'county';
  countyName: string | null;
  source: string;
  approvedBudget: number | null;
  actualExpenditure: number | null;
  overallAbsorption: number | null;
  developmentAbsorption: number | null;
  auditOpinion: string | null;
  pendingBills: number | null;
  totalDebt: number | null;
  complianceScore: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const SOURCE_COLORS: Record<string, string> = {
  'OAG': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'CoB': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'CoG': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'KNBS': 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  'Other': 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const FY_OPTIONS = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25', '2025/26'];
const SOURCE_OPTIONS = ['OAG', 'CoB', 'CoG', 'KNBS', 'Other'];
const LEVEL_OPTIONS = ['national', 'county'];
const AUDIT_OPTIONS = ['Unmodified', 'Qualified', 'Adverse', 'Disclaimer'];

export function FinanceAuditPanel() {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Snapshot | null>(null);

  // Form state
  const [fiscalYear, setFiscalYear] = useState('2023/24');
  const [level, setLevel] = useState<'national' | 'county'>('county');
  const [countyName, setCountyName] = useState('');
  const [source, setSource] = useState('CoB');
  const [approvedBudget, setApprovedBudget] = useState('');
  const [actualExpenditure, setActualExpenditure] = useState('');
  const [overallAbsorption, setOverallAbsorption] = useState('');
  const [developmentAbsorption, setDevelopmentAbsorption] = useState('');
  const [auditOpinion, setAuditOpinion] = useState('');
  const [pendingBills, setPendingBills] = useState('');
  const [totalDebt, setTotalDebt] = useState('');
  const [complianceScore, setComplianceScore] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractResults, setExtractResults] = useState<any[] | null>(null);
  const [extractOpen, setExtractOpen] = useState(false);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ published: 'false' });
      if (filterLevel !== 'all') params.set('level', filterLevel);
      if (filterSource !== 'all') params.set('source', filterSource);
      const res = await fetch(`/api/admin/finance-audit?${params}`);
      const data = await res.json();
      setSnapshots(data.snapshots || []);
    } catch {
      toast({ title: 'Failed to load snapshots', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterSource, toast]);

  useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

  const resetForm = () => {
    setFiscalYear('2023/24');
    setLevel('county');
    setCountyName('');
    setSource('CoB');
    setApprovedBudget('');
    setActualExpenditure('');
    setOverallAbsorption('');
    setDevelopmentAbsorption('');
    setAuditOpinion('');
    setPendingBills('');
    setTotalDebt('');
    setComplianceScore('');
    setNotes('');
    setSourceUrl('');
  };

  const handleCreate = async () => {
    if (level === 'county' && !countyName.trim()) {
      toast({ title: 'County name required for county-level', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/finance-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYear, level, countyName: countyName || null, source,
          approvedBudget: approvedBudget ? Number(approvedBudget) : null,
          actualExpenditure: actualExpenditure ? Number(actualExpenditure) : null,
          overallAbsorption: overallAbsorption ? Number(overallAbsorption) : null,
          developmentAbsorption: developmentAbsorption ? Number(developmentAbsorption) : null,
          auditOpinion: auditOpinion || null,
          pendingBills: pendingBills ? Number(pendingBills) : null,
          totalDebt: totalDebt ? Number(totalDebt) : null,
          complianceScore: complianceScore ? Number(complianceScore) : null,
          notes: notes || null,
          sourceUrl: sourceUrl || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Snapshot created', description: `${level === 'national' ? 'National' : countyName} · FY ${fiscalYear}` });
        setCreateOpen(false);
        resetForm();
        fetchSnapshots();
      } else {
        toast({ title: 'Create failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Snapshot) => {
    if (!confirm(`Delete ${s.level === 'national' ? 'national' : s.countyName} FY ${s.fiscalYear} (${s.source})?`)) return;
    try {
      const res = await fetch(`/api/admin/finance-audit?id=${s.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted' });
        setSnapshots(prev => prev.filter(x => x.id !== s.id));
      }
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (s: Snapshot) => {
    try {
      const res = await fetch('/api/admin/finance-audit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, published: !s.published }),
      });
      if (res.ok) {
        toast({ title: s.published ? 'Unpublished' : 'Published' });
        setSnapshots(prev => prev.map(x => x.id === s.id ? { ...x, published: !s.published } : x));
      }
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const handleExtract = async (saveToDb: boolean) => {
    setExtracting(true);
    setExtractResults(null);
    try {
      const res = await fetch('/api/admin/extract-finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saveToDb }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: saveToDb ? 'Extraction complete + saved to DB' : 'Extraction complete',
          description: data.message,
        });
        setExtractResults(data.results || []);
        if (saveToDb) fetchSnapshots();
      } else {
        toast({ title: 'Extraction failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const fmtKshs = (v: number | null | undefined) => {
    if (v == null) return '—';
    if (v >= 1_000_000) return `Kshs ${(v / 1_000_000).toFixed(2)}T`;
    if (v >= 1_000) return `Kshs ${(v / 1_000).toFixed(2)}B`;
    return `Kshs ${Math.round(v)}M`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Finance & Audit Snapshots</CardTitle>
            <Badge variant="outline" className="ml-2">{snapshots.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchSnapshots} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExtractOpen(true)} disabled={extracting}>
              {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Extract from PDFs
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add snapshot
            </Button>
          </div>
        </div>
        <CardDescription>
          Manage structured finance + audit data (budget, absorption, audit opinions, pending bills).
          Curated data from <a href="/finance-audit" className="text-emerald-700 hover:underline dark:text-emerald-300">the static dashboard</a> is hardcoded; snapshots here override + extend it.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {LEVEL_OPTIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <a href="/api/finance-audit?format=csv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </a>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No snapshots yet. Click <strong>Add snapshot</strong> to create the first one.
            <p className="mt-2 text-xs">
              The public dashboard at <a href="/finance-audit" className="text-emerald-700 hover:underline dark:text-emerald-300">/finance-audit</a> already
              shows curated data even without snapshots.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] rounded-lg border">
            <div className="divide-y">
              {snapshots.map(s => (
                <div key={s.id} className="flex flex-col gap-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={SOURCE_COLORS[s.source] || SOURCE_COLORS.Other}>{s.source}</Badge>
                    <Badge variant="secondary">{s.fiscalYear}</Badge>
                    <Badge variant="outline" className={s.level === 'national' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}>
                      {s.level === 'national' ? '🏛 National' : `📍 ${s.countyName}`}
                    </Badge>
                    {s.auditOpinion && <Badge variant="outline">{s.auditOpinion}</Badge>}
                    {s.complianceScore != null && <Badge variant="outline">CoG: {s.complianceScore}/100</Badge>}
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTogglePublish(s)} title={s.published ? 'Unpublish' : 'Publish'}>
                        {s.published ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Database className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600" onClick={() => handleDelete(s)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                    <div><span className="text-muted-foreground">Approved:</span> {fmtKshs(s.approvedBudget)}</div>
                    <div><span className="text-muted-foreground">Expenditure:</span> {fmtKshs(s.actualExpenditure)}</div>
                    <div><span className="text-muted-foreground">Absorption:</span> {s.overallAbsorption ?? '—'}%</div>
                    <div><span className="text-muted-foreground">Dev absorp:</span> {s.developmentAbsorption ?? '—'}%</div>
                    <div><span className="text-muted-foreground">Pending bills:</span> {fmtKshs(s.pendingBills)}</div>
                    <div><span className="text-muted-foreground">Debt:</span> {fmtKshs(s.totalDebt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add finance + audit snapshot</DialogTitle>
            <DialogDescription>
              All monetary values in Kshs millions. Absorption rates as percentages (0-100).
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fiscal year</Label>
              <Select value={fiscalYear} onValueChange={setFiscalYear}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as 'national' | 'county')}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {level === 'county' && (
              <div className="col-span-2">
                <Label className="text-xs">County name</Label>
                <Input value={countyName} onChange={e => setCountyName(e.target.value)} placeholder="e.g. Nairobi City" className="mt-1" />
              </div>
            )}
            <div>
              <Label className="text-xs">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Audit opinion (county only)</Label>
              <Select value={auditOpinion} onValueChange={setAuditOpinion}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {AUDIT_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Approved budget (Kshs M)</Label>
              <Input type="number" value={approvedBudget} onChange={e => setApprovedBudget(e.target.value)} placeholder="e.g. 41200" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Actual expenditure (Kshs M)</Label>
              <Input type="number" value={actualExpenditure} onChange={e => setActualExpenditure(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Overall absorption (%)</Label>
              <Input type="number" step="0.1" value={overallAbsorption} onChange={e => setOverallAbsorption(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Development absorption (%)</Label>
              <Input type="number" step="0.1" value={developmentAbsorption} onChange={e => setDevelopmentAbsorption(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Pending bills (Kshs M)</Label>
              <Input type="number" value={pendingBills} onChange={e => setPendingBills(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Total debt (Kshs M)</Label>
              <Input type="number" value={totalDebt} onChange={e => setTotalDebt(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">CoG compliance score (0-100)</Label>
              <Input type="number" value={complianceScore} onChange={e => setComplianceScore(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Source URL (optional)</Label>
              <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Context, anomalies, methodology notes" className="mt-1 min-h-[60px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extract dialog */}
      <Dialog open={extractOpen} onOpenChange={setExtractOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Auto-extract finance data from PDFs
            </DialogTitle>
            <DialogDescription>
              Scans all PDFs in /upload directory, parses tables for budget/absorption/audit/pending bills data,
              and optionally saves to the DB (unpublished by default — review before publishing).
              Uses heuristic regex patterns — confidence ratings help filter low-quality extractions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleExtract(false)} disabled={extracting} variant="outline">
                {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Extract only (preview)
              </Button>
              <Button onClick={() => handleExtract(true)} disabled={extracting}>
                {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Extract + save to DB
              </Button>
            </div>

            {extractResults && (
              <div className="space-y-3">
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <strong>Extraction results:</strong> {extractResults.length} PDF(s) processed
                </div>
                <ScrollArea className="max-h-[400px] rounded-lg border">
                  <div className="divide-y">
                    {extractResults.map((r, i) => (
                      <div key={i} className="p-3">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">{r.fileName}</Badge>
                          {r.detectedFiscalYear && <Badge variant="outline">FY {r.detectedFiscalYear}</Badge>}
                          {r.detectedSource && <Badge variant="outline">{r.detectedSource}</Badge>}
                          <Badge variant="outline" className={r.recordCount > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}>
                            {r.recordCount} records
                          </Badge>
                        </div>
                        {r.records && r.records.length > 0 ? (
                          <ul className="space-y-1 text-xs">
                            {r.records.slice(0, 5).map((rec: any, j: number) => (
                              <li key={j} className="flex items-center gap-2">
                                <Badge variant="outline" className={
                                  rec.confidence === 'high' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : rec.confidence === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                }>{rec.confidence}</Badge>
                                <span className="font-medium">{rec.countyName || 'National'}</span>
                                {rec.approvedBudget != null && <span className="text-muted-foreground">Budget: {fmtKshs(rec.approvedBudget)}</span>}
                                {rec.overallAbsorption != null && <span className="text-muted-foreground">Absorp: {rec.overallAbsorption}%</span>}
                                {rec.auditOpinion && <span className="text-muted-foreground">Audit: {rec.auditOpinion}</span>}
                                {rec.pendingBills != null && <span className="text-muted-foreground">Pending: {fmtKshs(rec.pendingBills)}</span>}
                              </li>
                            ))}
                            {r.records.length > 5 && <li className="text-xs text-muted-foreground">…and {r.records.length - 5} more</li>}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No finance records extracted.</p>
                        )}
                        {r.errors && r.errors.length > 0 && (
                          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{r.errors.join('; ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
