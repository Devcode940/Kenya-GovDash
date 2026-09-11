'use client';

// URL-driven browser for the representatives directory. Filtering and
// pagination execute server-side; this component navigates (shallow replace)
// on filter/pager changes. Search input is debounced to avoid a navigation
// per keystroke.

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
  total: number;
  page: number;
  totalPages: number;
  q: string;
  repType: string;
  county: string;
  coalition: string;
  repTypes: string[];
  counties: string[];
  coalitions: string[];
}

interface FilterState {
  q: string;
  repType: string;
  county: string;
  coalition: string;
  page: number;
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

const SEARCH_DEBOUNCE_MS = 350;

export function RepresentativesBrowser(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState(props.q);

  const navigate = (patch: Partial<FilterState>) => {
    const next: FilterState = {
      q: props.q,
      repType: props.repType,
      county: props.county,
      coalition: props.coalition,
      page: props.page,
      ...patch,
    };
    const sp = new URLSearchParams();
    if (next.q) sp.set('q', next.q);
    if (next.repType !== 'all') sp.set('type', next.repType);
    if (next.county !== 'all') sp.set('county', next.county);
    if (next.coalition !== 'all') sp.set('coalition', next.coalition);
    if (next.page > 1) sp.set('page', String(next.page));
    const qs = sp.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  // Debounced search — navigate only after the user pauses typing.
  useEffect(() => {
    if (input === props.q) return;
    const timer = setTimeout(() => navigate({ q: input.trim(), page: 1 }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Sync the input when the URL changes externally (clear, back/forward).
  useEffect(() => {
    setInput(props.q);
  }, [props.q]);

  const hasActiveFilters =
    props.q !== '' || props.repType !== 'all' || props.county !== 'all' || props.coalition !== 'all';

  return (
    <Card>
      <CardContent className={`pt-6 space-y-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, county, party, or title..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={props.repType} onValueChange={v => navigate({ repType: v, page: 1 })}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {props.repTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={props.county} onValueChange={v => navigate({ county: v, page: 1 })}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="County" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {props.counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={props.coalition} onValueChange={v => navigate({ coalition: v, page: 1 })}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Coalition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All coalitions</SelectItem>
              {props.coalitions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {props.total} representative{props.total === 1 ? '' : 's'}
            {props.totalPages > 1 && ` · page ${props.page} of ${props.totalPages}`}
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => navigate({ q: '', repType: 'all', county: 'all', coalition: 'all', page: 1 })}>
              <X className="mr-1 h-3 w-3" />Clear filters
            </Button>
          )}
        </div>

        {/* List */}
        {props.reps.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No representatives match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {props.reps.map((r, i) => (
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
        {props.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline" size="sm"
              disabled={props.page === 1 || isPending}
              onClick={() => navigate({ page: props.page - 1 })}
            >Previous</Button>
            <span className="text-xs text-muted-foreground">{props.page} / {props.totalPages}</span>
            <Button
              variant="outline" size="sm"
              disabled={props.page === props.totalPages || isPending}
              onClick={() => navigate({ page: props.page + 1 })}
            >Next</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
