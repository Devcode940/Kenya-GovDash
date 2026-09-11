'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Loader2, RefreshCw, CheckCircle2, AlertCircle, Search, Upload,
} from 'lucide-react';

interface Cecm {
  cecmId: string;
  countyName: string;
  portfolio: string;
  currentName: string;
  verified: boolean;
  verifiedName: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  source: string | null;
}

interface Stats {
  total: number;
  verified: number;
  unverified: number;
  verificationPct: number;
}

export function CecmVerificationPanel() {
  const { toast } = useToast();
  const [cecms, setCecms] = useState<Cecm[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCounty, setFilterCounty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Cecm | null>(null);
  const [editName, setEditName] = useState('');
  const [editSource, setEditSource] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCounty !== 'all') params.set('countyName', filterCounty);
      const res = await fetch(`/api/admin/cecm-verify?${params}`);
      const data = await res.json();
      setStats(data.stats);
      setCecms(data.cecms || []);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filterCounty, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerify = async () => {
    if (!editTarget || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cecm-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cecmId: editTarget.cecmId,
          countyName: editTarget.countyName,
          portfolio: editTarget.portfolio,
          verifiedName: editName.trim(),
          source: editSource.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'CECM verified', description: editName });
        setCecms(prev => prev.map(c => c.cecmId === editTarget.cecmId ? {
          ...c,
          verified: true,
          verifiedName: editName,
          source: editSource || null,
          verifiedAt: new Date().toISOString(),
        } : c));
        setEditTarget(null);
        setEditName('');
        setEditSource('');
        // Refresh stats
        fetchData();
      } else {
        toast({ title: 'Failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnverify = async (c: Cecm) => {
    try {
      const res = await fetch(`/api/admin/cecm-verify?cecmId=${encodeURIComponent(c.cecmId)}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Verification removed' });
        setCecms(prev => prev.map(x => x.cecmId === c.cecmId ? { ...x, verified: false, verifiedName: null, source: null } : x));
        fetchData();
      }
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const openEdit = (c: Cecm) => {
    setEditTarget(c);
    setEditName(c.verifiedName || '');
    setEditSource(c.source || '');
  };

  const filtered = cecms.filter(c => {
    if (filterStatus === 'verified' && !c.verified) return false;
    if (filterStatus === 'unverified' && c.verified) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.countyName.toLowerCase().includes(q) ||
             c.portfolio.toLowerCase().includes(q) ||
             c.currentName.toLowerCase().includes(q) ||
             (c.verifiedName || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counties = Array.from(new Set(cecms.map(c => c.countyName))).sort();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">CECM Name Verification</CardTitle>
            {stats && (
              <Badge variant="outline" className="ml-2">
                {stats.verified}/{stats.total} ({stats.verificationPct}%)
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>
          All 440 CECM positions across 47 counties start as &quot;verification pending.&quot;
          Use this panel to verify individual office-holder names with sourced citations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress bar */}
        {stats && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Verification progress</span>
              <span className="font-medium">{stats.verificationPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.verificationPct}%` }} />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search county, portfolio, name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCounty} onValueChange={setFilterCounty}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="County" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[500px] rounded-lg border">
            <div className="divide-y">
              {filtered.map(c => (
                <div key={c.cecmId} className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{c.countyName}</Badge>
                        <span className="text-sm font-medium">{c.portfolio}</span>
                        {c.verified ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" />Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="mr-1 h-3 w-3" />Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        {c.verified ? (
                          <>
                            <strong>{c.verifiedName}</strong>
                            <span className="text-muted-foreground"> (verified)</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">{c.currentName}</span>
                        )}
                      </div>
                      {c.source && (
                        <div className="text-xs text-muted-foreground mt-0.5">Source: {c.source}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                        {c.verified ? 'Edit' : 'Verify'}
                      </Button>
                      {c.verified && (
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleUnverify(c)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify CECM Name</DialogTitle>
            <DialogDescription>
              {editTarget?.countyName} County — {editTarget?.portfolio}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Current (unverified)</Label>
              <p className="text-sm text-muted-foreground italic">{editTarget?.currentName}</p>
            </div>
            <div>
              <Label className="text-xs">Verified name</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Hon. Jane Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Source (e.g. County Gazette Notice, County Assembly approval)</Label>
              <Input
                value={editSource}
                onChange={e => setEditSource(e.target.value)}
                placeholder="Source citation"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={saving || !editName.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
