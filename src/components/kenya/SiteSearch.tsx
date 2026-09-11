'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, MapPin, Users, TrendingUp, MessageSquare, FileText, Landmark } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  url: string;
  score: number;
}

interface SearchResponse {
  query: string;
  totalResults: number;
  results: {
    counties: SearchResult[];
    representatives: SearchResult[];
    finance: SearchResult[];
    feedback: SearchResult[];
    reports: SearchResult[];
    national: SearchResult[];
  };
}

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  county: { icon: MapPin, color: 'text-emerald-600', label: 'County' },
  representative: { icon: Users, color: 'text-blue-600', label: 'Representative' },
  finance: { icon: TrendingUp, color: 'text-amber-600', label: 'Finance' },
  national: { icon: Landmark, color: 'text-purple-600', label: 'National' },
  feedback: { icon: MessageSquare, color: 'text-rose-600', label: 'Feedback' },
  report: { icon: FileText, color: 'text-indigo-600', label: 'Report' },
};

export function SiteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const allResults = results ? [
    ...results.results.counties,
    ...results.results.representatives,
    ...results.results.finance,
    ...results.results.national,
    ...results.results.feedback,
    ...results.results.reports,
  ].sort((a, b) => b.score - a.score) : [];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search counties, representatives, finance, feedback..."
            className="pl-9 h-11"
            autoFocus
          />
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {searched && !loading && results && (
        <>
          <div className="text-sm text-muted-foreground">
            {results.totalResults} result{results.totalResults === 1 ? '' : 's'} for &quot;{results.query}&quot;
          </div>

          {allResults.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No results found. Try a different query.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {allResults.map((r, i) => {
                const meta = TYPE_META[r.type] || TYPE_META.county;
                const Icon = meta.icon;
                return (
                  <Link
                    key={i}
                    href={r.url}
                    className="block rounded-lg border p-3 transition hover:border-emerald-400 hover:bg-muted/40"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${meta.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                        </div>
                        <div className="font-medium text-sm truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {!searched && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Search across counties, representatives, finance data, feedback, and reports.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Nairobi', 'governor', 'audit', 'Kisumu', 'pending bills', 'OAG'].map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); runSearch(q); }}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
