'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Loader2, Shield, ExternalLink, Database } from 'lucide-react';

type SourceStatus = {
  id: string;
  name: string;
  priority: number;
  tracks: string[];
  hubUrl: string;
  ingestMode: string;
  curatedSnapshots: string[];
  liveFeed?: string;
};

type IngestStatusResponse = {
  status?: {
    registryUpdated?: string;
    sourceCount?: number;
    priority1?: string[];
    liveFeedIds?: string[];
    curated?: { eaccNecsCounties?: number; cbtsCounties?: number };
  };
  sources?: SourceStatus[];
  financeCoverage?: { countiesWithData?: number; targetCounties?: number };
  storage?: { mode?: string; note?: string };
};

type RefreshResult = {
  success?: boolean;
  message?: string;
  ranAt?: string;
  feedResults?: Array<{
    source: string;
    status: string;
    dataFetched?: boolean;
    itemsCount?: number;
    errorMessage?: string;
  }>;
  error?: string;
};

export function OversightIngestPanel() {
  const { toast } = useToast();
  const [status, setStatus] = useState<IngestStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<RefreshResult | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ingest-oversight');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus(await res.json());
    } catch (e) {
      toast({
        title: 'Failed to load ingest status',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/ingest-oversight', { method: 'POST' });
      const data = (await res.json()) as RefreshResult;
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setLastRefresh(data);
      toast({ title: 'Oversight feeds refreshed', description: data.message || 'Live feeds updated' });
      await loadStatus();
    } catch (e) {
      toast({
        title: 'Refresh failed',
        description: e instanceof Error ? e.message : 'Unauthorized or network error',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const s = status?.status;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-emerald-600" />
                Oversight auto-ingest
              </CardTitle>
              <CardDescription>
                EACC, TI-Kenya, CoB, OAG live feeds + curated NECS/CBTS snapshots
                {s?.registryUpdated ? ` · registry ${s.registryUpdated}` : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadStatus} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                <span className="ml-1.5">Status</span>
              </Button>
              <Button size="sm" onClick={runRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1.5">Refresh live feeds</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {s && (
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">{s.sourceCount ?? 0} sources</Badge>
              <Badge variant="outline">Priority-1: {(s.priority1 || []).join(', ') || '—'}</Badge>
              <Badge variant="outline">NECS counties: {s.curated?.eaccNecsCounties ?? 0}</Badge>
              <Badge variant="outline">CBTS counties: {s.curated?.cbtsCounties ?? 0}</Badge>
              <Badge variant="outline">
                Finance rows: {status?.financeCoverage?.countiesWithData ?? 0}/
                {status?.financeCoverage?.targetCounties ?? 47} counties
              </Badge>
              {status?.storage?.mode && (
                <Badge variant="secondary">Storage: {status.storage.mode}</Badge>
              )}
            </div>
          )}
          {status?.storage?.note && (
            <p className="text-[11px] text-muted-foreground">{status.storage.note}</p>
          )}

          {lastRefresh?.feedResults && (
            <div className="rounded-md border p-3 text-xs">
              <div className="mb-1 font-medium">Last refresh · {lastRefresh.ranAt}</div>
              <ul className="space-y-1 text-muted-foreground">
                {lastRefresh.feedResults.map((r) => (
                  <li key={r.source}>
                    <span className="font-medium text-foreground">{r.source}</span>: {r.status}
                    {r.itemsCount != null ? ` · ${r.itemsCount} items` : ''}
                    {r.errorMessage ? ` · ${r.errorMessage}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] uppercase text-muted-foreground">
                  <th className="p-2 text-left">Source</th>
                  <th className="p-2 text-left">Tracks</th>
                  <th className="p-2 text-left">Ingest</th>
                  <th className="p-2 text-center">Priority</th>
                  <th className="p-2 text-right">Hub</th>
                </tr>
              </thead>
              <tbody>
                {(status?.sources || []).map((src) => (
                  <tr key={src.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">
                      {src.name}
                      {src.liveFeed && (
                        <Badge variant="secondary" className="ml-1 text-[9px]">live</Badge>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">{(src.tracks || []).slice(0, 3).join(' · ')}</td>
                    <td className="p-2 text-muted-foreground">{src.ingestMode}</td>
                    <td className="p-2 text-center">{src.priority}</td>
                    <td className="p-2 text-right">
                      <a
                        href={src.hubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-emerald-700 hover:underline dark:text-emerald-300"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground">
            PDF CoB/OAG extract uses the Finance & Audit panel and files in{' '}
            <code className="text-[10px]">/upload</code>. Live refresh only re-fetches public feed endpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
