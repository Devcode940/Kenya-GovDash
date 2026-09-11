'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, MapPin, Users, X, ChevronRight,
} from 'lucide-react';
import { getCoalitionColor, type Representative } from '@/lib/kenya-data';

interface RepEntry extends Representative {
  countyName: string;
  repType: string;
}

interface Props {
  reps: RepEntry[];
}

const REP_TYPE_ICONS: Record<string, string> = {
  'Governor': '👑',
  'Deputy Governor': '👥',
  'Senator': '🏛️',
  'Woman Rep': '♀️',
  'MP': '🎤',
  'CECM': '🛡️',
  'Speaker': '⚖️',
  'County Secretary': '📋',
};

const REP_TYPE_COLORS: Record<string, string> = {
  'Governor': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Deputy Governor': 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  'Senator': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'Woman Rep': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'MP': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'CECM': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'Speaker': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'County Secretary': 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const PAGE_SIZE = 50;

export function RepresentativesBrowser({ reps }: Props) {
  const [search, setSearch] = useState('');
  const [repType, setRepType] = useState<string>('all');
  const [county, setCounty] = useState<string>('all');
  const [coalition, setCoalition] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Build filter options
  const repTypes = useMemo(() => {
    return Array.from(new Set(reps.map(r => r.repType))).sort();
  }, [reps]);

  const counties = useMemo(() => {
    return Array.from(new Set(reps.map(r => r.countyName))).sort();
  }, [reps]);

  const coalitions = useMemo(() => {
    return Array.from(new Set(reps.map(r => r.coalition).filter(Boolean))).sort();
  }, [reps]);

  // Filter
  const filtered = useMemo(() => {
    let result = reps;
    if (repType !== 'all') result = result.filter(r => r.repType === repType);
    if (county !== 'all') result = result.filter(r => r.countyName === county);
    if (coalition !== 'all') result = result.filter(r => r.coalition === coalition);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.fullName?.toLowerCase().includes(q) ||
        r.party?.toLowerCase().includes(q) ||
        r.countyName?.toLowerCase().includes(q) ||
        r.officialTitle?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reps, repType, county, coalition, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [repType, county, coalition, search]);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, county, party, or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={repType} onValueChange={setRepType}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {repTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="County" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={coalition} onValueChange={setCoalition}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Coalition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All coalitions</SelectItem>
              {coalitions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length} representative{filtered.length === 1 ? '' : 's'}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
          </span>
          {(search || repType !== 'all' || county !== 'all' || coalition !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSearch(''); setRepType('all'); setCounty('all'); setCoalition('all');
            }}>
              <X className="mr-1 h-3 w-3" />Clear filters
            </Button>
          )}
        </div>

        {/* List */}
        {paged.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No representatives match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((r, i) => (
              <a
                key={`${r.id}-${i}`}
                href={`/representative/${encodeURIComponent(r.id)}`}
                className="block rounded-lg border p-3 transition hover:border-emerald-400 hover:bg-muted/40"
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl shrink-0">{REP_TYPE_ICONS[r.repType] || '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <Badge variant="outline" className={REP_TYPE_COLORS[r.repType] || REP_TYPE_COLORS['County Secretary']}>
                        {r.repType}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm truncate" title={r.fullName}>
                      {r.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      <MapPin className="inline h-3 w-3 mr-0.5" />
                      {r.countyName}
                    </div>
                    {r.party && (
                      <div className="text-xs text-muted-foreground truncate">
                        {r.party}
                        {r.coalition && r.coalition !== 'Other' && (
                          <span className={`ml-1 rounded px-1 ${getCoalitionColor(r.coalition)}`}>{r.coalition}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline" size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</Button>
            <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
            <Button
              variant="outline" size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >Next</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
