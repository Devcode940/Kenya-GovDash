'use client';

// Admin triage for end-to-end encrypted whistleblower submissions.
//
// What the admin sees here: ticket ID, category, status, timestamps —
// report contents stay encrypted. Decryption happens EXCLUSIVELY offline:
// export the encrypted bundle below, then run
//   node scripts/whistleblower_decrypt.mjs --input export.json --key <private.pem>
// on an air-gapped machine holding the private key.

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldAlert, Download, RefreshCw, Lock, KeyRound, AlertTriangle,
  FileLock2, CheckCircle2,
} from 'lucide-react';

type WbStatus = 'submitted' | 'under_review' | 'investigating' | 'verified' | 'dismissed';

interface Submission {
  id: string;
  ticketId: string;
  category: string;
  status: WbStatus;
  hasEvidence: boolean;
  encryptedKey: string;
  iv: string;
  ciphertext: string;
  evidence: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  embezzlement: 'Embezzlement',
  bribery: 'Bribery',
  nepotism: 'Nepotism',
  procurement_fraud: 'Procurement Fraud',
  ghost_workers: 'Ghost Workers',
  pending_bills: 'Pending Bills',
  project_abandonment: 'Project Abandonment',
  revenue_leakage: 'Revenue Leakage',
  asset_grabbing: 'Asset Grabbing',
  other: 'Other',
};

const STATUS_LABELS: Record<WbStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  investigating: 'Investigating',
  verified: 'Verified',
  dismissed: 'Dismissed',
};

const STATUS_COLORS: Record<WbStatus, string> = {
  submitted: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  investigating: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  dismissed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function WhistleblowerPanel() {
  const { toast } = useToast();
  const [keyInfo, setKeyInfo] = useState<{ keyId: string; fingerprint: string } | null>(null);
  const [keyChecked, setKeyChecked] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchKey = useCallback(async () => {
    try {
      const res = await fetch('/api/whistleblower/pubkey');
      if (res.ok) {
        const data = await res.json();
        setKeyInfo({ keyId: data.keyId, fingerprint: data.fingerprintSha256 });
      } else {
        setKeyInfo(null);
      }
    } catch {
      setKeyInfo(null);
    } finally {
      setKeyChecked(true);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/whistleblower/submissions?${params}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      } else {
        setSubmissions([]);
        toast({ title: 'Failed to load', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch {
      setSubmissions([]);
      toast({ title: 'Network error', description: 'Could not reach the submissions endpoint.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { fetchKey(); }, [fetchKey]);
  useEffect(() => {
    Promise.resolve().then(() => fetchSubmissions()).catch(() => undefined);
  }, [fetchSubmissions]);

  const updateStatus = async (ticketId: string, status: WbStatus) => {
    setUpdating(ticketId);
    try {
      const res = await fetch('/api/whistleblower/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.ticketId === ticketId ? { ...s, status, updatedAt: data.ticket.updatedAt } : s));
        toast({ title: 'Status updated', description: `${ticketId} → ${STATUS_LABELS[status]}` });
      } else {
        toast({ title: 'Update failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Could not update status.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const downloadBundle = (items: Submission[], filename: string) => {
    const bundle = {
      format: 'kenya-govdash-whistleblower-export-v1',
      exportedAt: new Date().toISOString(),
      count: items.length,
      submissions: items.map(s => ({
        ticketId: s.ticketId,
        category: s.category,
        status: s.status,
        hasEvidence: s.hasEvidence,
        encryptedKey: s.encryptedKey,
        iv: s.iv,
        ciphertext: s.ciphertext,
        evidence: s.evidence ? JSON.parse(s.evidence) : [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    };
    const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    if (submissions.length === 0) {
      toast({ title: 'Nothing to export', description: 'No submissions match the current filter.' });
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBundle(submissions, `whistleblower-export-${stamp}.json`);
    toast({ title: 'Bundle exported', description: `${submissions.length} encrypted submission(s). Decrypt offline only.` });
  };

  return (
    <div className="space-y-4">
      {/* Key status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-600" /> Encryption Key Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!keyChecked ? (
            <p className="text-xs text-muted-foreground">Checking…</p>
          ) : keyInfo ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </Badge>
              <code className="text-[11px] text-muted-foreground" title={keyInfo.fingerprint}>
                key {keyInfo.keyId} · fingerprint {keyInfo.fingerprint.slice(0, 24)}…
              </code>
            </div>
          ) : (
            <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Not configured — secure submission is disabled
              </p>
              <p className="text-muted-foreground">On an offline machine, run:</p>
              <code className="block rounded bg-muted px-2 py-1 font-mono text-[11px]">
                node scripts/whistleblower_gen_keys.mjs --out ./wb-keys
              </code>
              <p className="text-muted-foreground">
                Then set <code className="font-mono">WHISTLEBLOWER_PUBLIC_KEY</code> on the server to the
                printed SPKI value. Keep the private key offline — it must never touch the server.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triage list */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileLock2 className="h-4 w-4 text-red-600" /> Submissions (ciphertext — contents unreadable here)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={fetchSubmissions} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={exportAll} disabled={loading || submissions.length === 0}>
                <Download className="h-3.5 w-3.5" /> Export bundle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No submissions{submissions.length === 0 && statusFilter !== 'all' ? ' with this status' : ' yet'}.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map(s => (
                <div key={s.ticketId} className="rounded-lg border p-3 flex flex-wrap items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <code className="font-mono text-xs font-bold">{s.ticketId}</code>
                  <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[s.category] || s.category}</Badge>
                  <Badge className={`text-[10px] ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</Badge>
                  {s.hasEvidence && <Badge variant="outline" className="text-[10px]">Evidence</Badge>}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString('en-KE')}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Select
                      value={s.status}
                      onValueChange={(v) => updateStatus(s.ticketId, v as WbStatus)}
                      disabled={updating === s.ticketId}
                    >
                      <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, label]) => (
                          <SelectItem key={v} value={v}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost" size="sm" className="text-xs gap-1"
                      onClick={() => downloadBundle([s], `whistleblower-${s.ticketId}.json`)}
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">
            Decrypt exports only on an air-gapped machine:
            <code className="font-mono"> node scripts/whistleblower_decrypt.mjs --input export.json --key private.pem --out ./decrypted</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
