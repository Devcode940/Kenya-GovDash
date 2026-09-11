'use client';

// Secure whistleblower portal — END-TO-END ENCRYPTED.
//
// Cryptography (hybrid envelope v1, all client-side via WebCrypto):
//   1. Fetch the admin RSA-OAEP-256 public key from /api/whistleblower/pubkey.
//   2. Generate a random AES-256-GCM data key per report.
//   3. Encrypt the report JSON + each evidence file with AES-GCM (fresh IV each).
//   4. Wrap the data key with the admin RSA public key.
//   5. POST the envelope; the server stores CIPHERTEXT ONLY.
//
// Plaintext visible to the server (disclosed in the UI): report category
// (triage routing), ticket ID, status, timestamps. Everything else — title,
// description, county, department, amounts, identity, evidence — is encrypted
// and can only be read offline with the admin private key.

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ShieldAlert, Eye, FileText, DollarSign, Users, Building2,
  AlertTriangle, CheckCircle2, Clock, Upload, Lock, Scale,
  MapPin, Shield, Copy, Ticket, KeyRound, X, Loader2,
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

interface EncryptedFile {
  name: string;
  type: string;
  size: number;
  iv: string;
  ciphertext: string;
}

interface SubmitSuccess {
  ticketId: string;
  createdAt: string;
}

interface TrackedTicket {
  ticketId: string;
  category: string;
  status: ReportStatus;
  hasEvidence: boolean;
  createdAt: string;
  updatedAt: string;
}

type KeyState =
  | { status: 'loading' }
  | { status: 'ready'; keyId: string; fingerprint: string; key: CryptoKey }
  | { status: 'unavailable'; reason: string };

// ==================== CONSTANTS ====================

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
  investigating: { label: 'Investigating', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <ShieldAlert className="h-3 w-3" /> },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  dismissed: { label: 'Dismissed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
};

const MAX_FILES = 5;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = Math.floor(3.5 * 1024 * 1024);
const TICKET_RE = /^WB-[0-9A-F]{12}$/;

// ==================== CRYPTO HELPERS ====================

function bytesToB64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function b64ToBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

async function importRsaPublicKey(spkiB64: string): Promise<CryptoKey> {
  const der = b64ToBytes(spkiB64);
  return crypto.subtle.importKey(
    'spki',
    toArrayBuffer(der),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
}

// ==================== MAIN COMPONENT ====================

export function KenyaWhistleblower() {
  const { toast } = useToast();
  const [keyState, setKeyState] = useState<KeyState>({ status: 'loading' });
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

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
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit state machine
  const [phase, setPhase] = useState<'idle' | 'encrypting' | 'sending'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmitSuccess | null>(null);

  // Track state
  const [trackTicket, setTrackTicket] = useState('');
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState<TrackedTicket | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Fetch + import the server public key on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/whistleblower/pubkey');
        if (!res.ok) {
          if (!cancelled) {
            setKeyState({
              status: 'unavailable',
              reason: res.status === 501
                ? 'Secure submission is not configured on this server yet.'
                : 'Could not load the encryption key.',
            });
          }
          return;
        }
        const data = await res.json();
        const key = await importRsaPublicKey(data.publicKeySpkiBase64);
        if (!cancelled) {
          setKeyState({ status: 'ready', keyId: data.keyId, fingerprint: data.fingerprintSha256, key });
        }
      } catch {
        if (!cancelled) {
          setKeyState({ status: 'unavailable', reason: 'Could not load the encryption key. Check your connection.' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalFileBytes = evidenceFiles.reduce((sum, f) => sum + f.size, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;
    const combined = [...evidenceFiles, ...picked];
    if (combined.length > MAX_FILES) {
      toast({ title: 'Too many files', description: `Maximum ${MAX_FILES} evidence files per report.`, variant: 'destructive' });
      return;
    }
    for (const f of picked) {
      if (f.size > MAX_FILE_BYTES) {
        toast({ title: 'File too large', description: `"${f.name}" exceeds the 2 MB per-file limit.`, variant: 'destructive' });
        return;
      }
    }
    const total = combined.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_TOTAL_BYTES) {
      toast({ title: 'Total too large', description: 'Evidence files exceed the 3.5 MB total limit.', variant: 'destructive' });
      return;
    }
    setEvidenceFiles(combined);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (keyState.status !== 'ready') return;
    if (!category || !title.trim() || !description.trim()) {
      toast({ title: 'Missing fields', description: 'Please select a category and fill in title and description.', variant: 'destructive' });
      return;
    }
    setSubmitError(null);
    setPhase('encrypting');

    try {
      const te = new TextEncoder();
      // 1. Fresh AES-256-GCM data key for this report
      const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
      const rawAes = new Uint8Array(await crypto.subtle.exportKey('raw', aesKey));

      // 2. Wrap the data key with the admin RSA public key
      const wrapped = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        keyState.key,
        toArrayBuffer(rawAes),
      ));

      // 3. Encrypt the report payload
      const payload = JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        countyName: countyName.trim() || null,
        department: department.trim() || null,
        estimatedAmount: estimatedAmount.trim() || null,
        isAnonymous,
        reporterName: isAnonymous ? null : reporterName.trim() || null,
        reporterEmail: isAnonymous ? null : reporterEmail.trim() || null,
      });
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: toArrayBuffer(iv) },
        aesKey,
        toArrayBuffer(te.encode(payload)),
      ));

      // 4. Encrypt each evidence file with the same data key (fresh IV each)
      const files: EncryptedFile[] = [];
      for (const f of evidenceFiles) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const fiv = crypto.getRandomValues(new Uint8Array(12));
        const fct = new Uint8Array(await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: toArrayBuffer(fiv) },
          aesKey,
          toArrayBuffer(bytes),
        ));
        files.push({
          name: f.name.slice(0, 255),
          type: (f.type || 'application/octet-stream').slice(0, 128),
          size: f.size,
          iv: bytesToB64(fiv),
          ciphertext: bytesToB64(fct),
        });
      }

      // 5. Transmit the envelope (ciphertext only)
      setPhase('sending');
      const res = await fetch('/api/whistleblower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 1,
          keyId: keyState.keyId,
          category,
          encryptedKey: bytesToB64(wrapped),
          iv: bytesToB64(iv),
          ciphertext: bytesToB64(ciphertext),
          files,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess({ ticketId: data.ticketId, createdAt: data.createdAt });
      // Reset form (plaintext leaves memory with the state)
      setCategory(''); setTitle(''); setDescription(''); setCountyName('');
      setDepartment(''); setEstimatedAmount(''); setEvidenceFiles([]);
      setReporterName(''); setReporterEmail('');
      toast({ title: 'Report submitted securely', description: `Ticket: ${data.ticketId}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setSubmitError(message);
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally {
      setPhase('idle');
    }
  };

  const copyTicket = async (ticketId: string) => {
    try {
      await navigator.clipboard.writeText(ticketId);
      toast({ title: 'Copied', description: 'Ticket ID copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', description: `Write down your ticket: ${ticketId}`, variant: 'destructive' });
    }
  };

  const handleTrack = async () => {
    const ticket = trackTicket.trim().toUpperCase();
    if (!TICKET_RE.test(ticket)) {
      setTrackError('Invalid ticket format. Expected WB- followed by 12 hex characters.');
      setTracked(null);
      return;
    }
    setTracking(true);
    setTrackError(null);
    setTracked(null);
    try {
      const res = await fetch(`/api/whistleblower/status?ticket=${encodeURIComponent(ticket)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Ticket not found. Check the ID and try again.' : (data.error || 'Lookup failed'));
      }
      setTracked(data.ticket);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setTracking(false);
    }
  };

  const categoryLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label || id;
  const busy = phase !== 'idle';

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
            Report dishonesty with public funds. Reports are encrypted in your browser
            before transmission — the server stores ciphertext only and cannot read contents.
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[10px] gap-1">
              <Lock className="h-2.5 w-2.5" /> End-to-end encrypted
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] gap-1">
              <Shield className="h-2.5 w-2.5" /> Anonymous Option
            </Badge>
            {keyState.status === 'ready' && (
              <Badge variant="outline" className="text-[10px] gap-1" title={`Full key fingerprint (SHA-256): ${keyState.fingerprint}`}>
                <KeyRound className="h-2.5 w-2.5" /> Server key {keyState.fingerprint.slice(0, 16)}…
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Visible to the server: report category (for triage), ticket ID, status, timestamps.
            Encrypted: everything else, including title, details, county, identity, and evidence.
          </p>
        </CardHeader>
      </Card>

      {/* Key unavailable notice */}
      {keyState.status === 'unavailable' && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardContent className="py-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Secure submission unavailable</p>
              <p className="text-xs text-muted-foreground">{keyState.reason} Tracking an existing ticket still works below.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'submit' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('submit')}>
          <ShieldAlert className="h-3.5 w-3.5" /> Submit Report
        </Button>
        <Button variant={activeTab === 'track' ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setActiveTab('track')}>
          <Ticket className="h-3.5 w-3.5" /> Track Ticket
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
            {success ? (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600" />
                <p className="text-sm font-semibold">Report received and stored encrypted</p>
                <p className="text-xs text-muted-foreground">Save this ticket ID — it is the only way to track your report. It cannot be recovered if lost.</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="rounded bg-muted px-3 py-1.5 font-mono text-base font-bold tracking-wider">{success.ticketId}</code>
                  <Button variant="outline" size="sm" onClick={() => copyTicket(success.ticketId)}>
                    <Copy className="h-3.5 w-3.5 mr-1" />Copy
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSuccess(null)}>
                  Submit another report
                </Button>
              </div>
            ) : (
              <>
                {/* Category selection */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Category of Misconduct *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
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
                    <Input placeholder="e.g., Nairobi City" value={countyName} onChange={(e) => setCountyName(e.target.value)} maxLength={64} className="h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Department / Ministry</label>
                    <Input placeholder="e.g., Health, Roads" value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={128} className="h-9 text-xs" />
                  </div>
                </div>

                {/* Estimated amount */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Estimated Amount Involved (Kshs)</label>
                  <Input placeholder="e.g., 5,000,000" value={estimatedAmount} onChange={(e) => setEstimatedAmount(e.target.value)} maxLength={32} className="h-9 text-xs" />
                </div>

                {/* Evidence upload */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Evidence (encrypted before upload — max {MAX_FILES} files, 2 MB each, 3.5 MB total)</label>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Choose Files
                  </Button>
                  {evidenceFiles.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {evidenceFiles.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="flex items-center gap-2 text-[11px] rounded border px-2 py-1">
                          <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span className="flex-1 truncate">{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${f.name}`}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted-foreground">Total: {(totalFileBytes / 1024 / 1024).toFixed(2)} MB</p>
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
                    <p className="text-[11px] text-muted-foreground">No identity details are included in the encrypted report</p>
                  </div>
                  <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} aria-label="Toggle anonymous" />
                </div>

                {/* Personal info (if not anonymous) */}
                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-md border">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Your Name</label>
                      <Input placeholder="Full name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} maxLength={120} className="h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Email (for follow-up)</label>
                      <Input placeholder="email@example.com" type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} maxLength={254} className="h-9 text-xs" />
                    </div>
                  </div>
                )}

                {/* Legal notice */}
                <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                      False reports are punishable under the Penal Code. Reports are triaged by category
                      before review. This portal supports constitutional accountability
                      under Articles 10 and 232 of the Constitution of Kenya 2010.
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={busy || keyState.status !== 'ready' || !category || !title.trim() || !description.trim()}
                  className="w-full gap-2"
                >
                  {phase === 'encrypting' ? <><Loader2 className="h-4 w-4 animate-spin" /> Encrypting in your browser…</> :
                    phase === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" /> Transmitting ciphertext…</> :
                      <><Lock className="h-4 w-4" /> Encrypt & Submit Report</>}
                </Button>
                {keyState.status === 'loading' && (
                  <p className="text-[11px] text-center text-muted-foreground">Loading encryption key…</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Track ticket */}
      {activeTab === 'track' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Ticket className="h-4 w-4 text-red-600" /> Track Your Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="WB-XXXXXXXXXXXX"
                value={trackTicket}
                onChange={(e) => setTrackTicket(e.target.value.toUpperCase())}
                maxLength={15}
                className="h-9 text-xs font-mono"
              />
              <Button size="sm" className="text-xs shrink-0" onClick={handleTrack} disabled={tracking}>
                {tracking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Look up'}
              </Button>
            </div>
            {trackError && (
              <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300">{trackError}</p>
              </div>
            )}
            {tracked && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-sm font-bold">{tracked.ticketId}</code>
                  {(() => {
                    const s = STATUS_CONFIG[tracked.status];
                    return <Badge className={`text-[10px] ${s.color}`}>{s.icon}<span className="ml-1">{s.label}</span></Badge>;
                  })()}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{categoryLabel(tracked.category)}</Badge>
                  {tracked.hasEvidence && <Badge variant="outline" className="text-[10px]">Evidence attached</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Submitted {new Date(tracked.createdAt).toLocaleString('en-KE')} · Updated {new Date(tracked.updatedAt).toLocaleString('en-KE')}
                </p>
              </div>
            )}
            {!tracked && !trackError && (
              <p className="text-xs text-muted-foreground">
                Enter the ticket ID shown after submission to check triage status. Ticket IDs cannot be recovered if lost.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
